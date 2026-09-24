'use strict';

const { HttpError, dispatch } = require('../../server');

function apiPath(event) {
  const query = event.queryStringParameters || {};
  if (query.path) {
    const extra = String(query.path).replace(/^\/+/, '');
    return '/api/' + extra;
  }
  const raw = String(event.path || '');
  const marker = '/.netlify/functions/api';
  if (raw.includes(marker)) {
    const rest = raw.slice(raw.indexOf(marker) + marker.length).replace(/^\/+/, '');
    return '/api' + (rest ? '/' + rest : '');
  }
  if (raw.startsWith('/api/')) return raw.split('?')[0];
  return raw.split('?')[0];
}

function header(event, name) {
  const headers = event.headers || {};
  const wanted = name.toLowerCase();
  for (const key of Object.keys(headers)) {
    if (key.toLowerCase() === wanted) return headers[key];
  }
  return '';
}

exports.handler = async function (event) {
  try {
    let body = {};
    if (event.body) {
      const text = event.isBase64Encoded
        ? Buffer.from(event.body, 'base64').toString('utf8')
        : event.body;
      if (text) body = JSON.parse(text);
    }
    const result = await dispatch({
      method: event.httpMethod || 'GET',
      urlPath: apiPath(event),
      body,
      authorization: header(event, 'authorization'),
      cookie: header(event, 'cookie')
    });
    return {
      statusCode: result.status,
      headers: Object.assign({
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-store'
      }, result.headers || {}),
      body: JSON.stringify(result.payload)
    };
  } catch (err) {
    if (err instanceof SyntaxError) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify({ ok: false, error: 'BAD_JSON' })
      };
    }
    const status = err instanceof HttpError ? err.status : (err.status || 500);
    const code = err instanceof HttpError ? err.code : (err.code || 'SERVER');
    if (!(err instanceof HttpError)) console.error(err);
    return {
      statusCode: status,
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({ ok: false, error: code })
    };
  }
};
