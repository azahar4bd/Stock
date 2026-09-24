'use strict';

const { spawnSync } = require('child_process');
const crypto = require('crypto');

function redact(value) {
  return String(value || '')
    .replace(/napi_[A-Za-z0-9]+/g, 'napi_***')
    .replace(/nfp_[A-Za-z0-9]+/g, 'nfp_***')
    .replace(/postgresql:\/\/[^@\s]+@/gi, 'postgresql://***@')
    .replace(/Bearer\s+[A-Za-z0-9._\-]+/g, 'Bearer ***');
}

function fail(message) {
  const error = new Error(redact(message));
  error.publicMessage = redact(message);
  throw error;
}

async function requestJson(url, options) {
  const res = await fetch(url, {
    method: options.method || 'GET',
    headers: options.headers,
    body: options.body
  });
  const text = await res.text();
  let data = null;
  if (text) {
    try { data = JSON.parse(text); }
    catch { data = { raw: text.slice(0, 400) }; }
  }
  if (!res.ok) {
    fail((options.label || url) + ' ' + res.status + ' ' + JSON.stringify(data).slice(0, 700));
  }
  return data;
}

async function neonApi(path, options) {
  return requestJson('https://console.neon.tech/api/v2' + path, {
    method: options && options.method || 'GET',
    headers: {
      Authorization: 'Bearer ' + process.env.NEON_API_KEY,
      Accept: 'application/json',
      'Content-Type': 'application/json'
    },
    body: options && options.body ? JSON.stringify(options.body) : undefined,
    label: 'neon ' + (options && options.method || 'GET') + ' ' + path
  });
}

async function netlifyApi(path, options) {
  return requestJson('https://api.netlify.com/api/v1' + path, {
    method: options && options.method || 'GET',
    headers: {
      Authorization: 'Bearer ' + process.env.NETLIFY_AUTH_TOKEN,
      'Content-Type': 'application/json'
    },
    body: options && options.body ? JSON.stringify(options.body) : undefined,
    label: 'netlify ' + (options && options.method || 'GET') + ' ' + path
  });
}

function uriFrom(data) {
  if (!data) return '';
  return data.uri || data.connection_uri || data.connection_string || '';
}

async function ensureNeon() {
  const listed = await neonApi('/projects');
  const projects = listed.projects || [];
  let project = projects.find(item => item.name === 'bkf-bims-stock');
  if (!project) {
    const regions = ['aws-ap-southeast-1', 'aws-ap-southeast-2', 'aws-us-east-1'];
    let created = null;
    let last = '';
    for (const region of regions) {
      try {
        created = await neonApi('/projects', {
          method: 'POST',
          body: { project: { name: 'bkf-bims-stock', region_id: region, pg_version: 16 } }
        });
        break;
      } catch (err) {
        last = err.message;
      }
    }
    if (!created) fail('could not create Neon project: ' + last);
    project = created.project || created;
  }
  const projectId = project.id;
  let uri = uriFrom(project);
  if (!uri && project.connection_uris && project.connection_uris[0]) {
    uri = uriFrom(project.connection_uris[0]);
  }
  if (!uri) {
    const details = await neonApi('/projects/' + projectId);
    const role = ((details.roles || [])[0] || {}).name || 'neondb_owner';
    const database = ((details.databases || [])[0] || {}).name || 'neondb';
    const conn = await neonApi(
      '/projects/' + projectId + '/connection_uri?database_name=' + encodeURIComponent(database) +
      '&role_name=' + encodeURIComponent(role) + '&pooled=true'
    );
    uri = uriFrom(conn);
  }
  if (!uri) fail('Neon connection string missing');
  process.env.DATABASE_URL = uri;
  const { initRemoteStore } = require('../server');
  let ready = false;
  let last = '';
  for (let i = 0; i < 20; i++) {
    try {
      await initRemoteStore();
      ready = true;
      break;
    } catch (err) {
      last = err.message;
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }
  if (!ready) fail('Neon was not ready: ' + last);
  return { projectId, uri };
}

async function ensureSite() {
  const wanted = 'bkf-bims-stock';
  let site = null;
  try {
    site = await netlifyApi('/sites', { method: 'POST', body: { name: wanted } });
  } catch (err) {
    const sites = await netlifyApi('/sites?filter=all&per_page=100');
    const list = Array.isArray(sites) ? sites : [];
    site = list.find(item => item.name === wanted) || null;
    if (!site) {
      try {
        site = await netlifyApi('/sites', { method: 'POST', body: {} });
      } catch (createErr) {
        fail(err.message + ' | ' + createErr.message);
      }
    }
  }
  if (!site || !site.id) fail('Netlify site missing');
  return site;
}

async function setEnv(site, key, value) {
  const account = site.account_id || site.account_slug;
  const payload = {
    key,
    scopes: ['functions', 'runtime'],
    values: [{ context: 'all', value }]
  };
  const query = '?site_id=' + encodeURIComponent(site.id);
  try {
    await netlifyApi('/accounts/' + account + '/env' + query, {
      method: 'POST',
      body: [payload]
    });
  } catch (err) {
    try {
      await netlifyApi('/accounts/' + account + '/env/' + encodeURIComponent(key) + query, {
        method: 'PUT',
        body: payload
      });
    } catch (updateErr) {
      fail(err.message + ' | ' + updateErr.message);
    }
  }
}

function deploySite(siteId) {
  const result = spawnSync('npx', [
    '--yes',
    'netlify-cli',
    'deploy',
    '--prod',
    '--dir', 'public',
    '--functions', 'netlify/functions',
    '--site', siteId,
    '--message', 'BIMS stock register'
  ], {
    env: Object.assign({}, process.env, { CI: '1' }),
    encoding: 'utf8'
  });
  const output = redact((result.stdout || '') + '\n' + (result.stderr || ''));
  if (result.status !== 0) fail('netlify deploy failed\n' + output.slice(-2000));
  const match = output.match(/https:\/\/[a-z0-9.-]+\.netlify\.app/i);
  return { output: output.slice(-1500), url: match ? match[0] : '' };
}

async function publish(summary, ok) {
  const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
  const repo = process.env.GITHUB_REPOSITORY;
  const sha = process.env.GITHUB_SHA;
  if (!token || !repo || !sha) {
    console.log(redact(summary));
    return;
  }
  const res = await fetch('https://api.github.com/repos/' + repo + '/check-runs', {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + token,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: 'bims-deploy-result',
      head_sha: sha,
      status: 'completed',
      conclusion: ok ? 'success' : 'failure',
      output: { title: 'BIMS deploy', summary: redact(summary).slice(0, 60000) }
    })
  });
  if (!res.ok) console.log('could not publish result', res.status);
}

async function main() {
  if (!process.env.NEON_API_KEY || !process.env.NETLIFY_AUTH_TOKEN) fail('deploy credentials missing');
  const neon = await ensureNeon();
  const site = await ensureSite();
  const sessionSecret = crypto.randomBytes(32).toString('hex');
  await setEnv(site, 'DATABASE_URL', neon.uri);
  await setEnv(site, 'BIMS_SESSION_SECRET', sessionSecret);
  const deployed = deploySite(site.id);
  const url = site.ssl_url || site.url || deployed.url;
  const summary = [
    'SITE_URL=' + url,
    'SITE_ID=' + site.id,
    'SITE_NAME=' + (site.name || ''),
    'NEON_PROJECT=' + neon.projectId
  ].join('\n');
  await publish(summary, true);
  console.log(summary);
}

main().catch(async err => {
  const message = 'ERROR ' + redact(err && err.message);
  try { await publish(message, false); } catch { /* ignore */ }
  console.error(message);
  process.exit(1);
});
