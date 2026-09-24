'use strict';

const assert = require('assert');

const mem = new Map();
global.localStorage = {
  getItem(key) { return mem.has(key) ? mem.get(key) : null; },
  setItem(key, value) { mem.set(key, String(value)); },
  removeItem(key) { mem.delete(key); }
};

require('../public/local.js');

async function main() {
  const api = global.bimsLocal;
  const admin = await api('/api/login', { method: 'POST', body: { email: 'azahar4bd@gmail.com', password: 'bkf2026' } });
  assert.strictEqual(admin.ok, true);
  const data = await api('/api/app', {}, admin.token);
  assert.strictEqual(data.userRole, 'Admin');
  assert.strictEqual(data.records.length, 7);
  assert.ok(data.branches.every(b => b.id === 'B014'));
  assert.ok(!data.users.some(u => u.password));

  const gobra = await api('/api/login', { method: 'POST', body: { email: 'bkfgobra014@gmail.com', password: 'bkf2026' } });
  const gobraData = await api('/api/app', {}, gobra.token);
  assert.ok(gobraData.records.every(r => r.branchId === 'B014'));
  await assert.rejects(
    () => api('/api/records', { method: 'POST', body: { branchId: 'B027', itemName: 'ব্যাগ', fromAmt: 1, saleAmt: 0 } }, gobra.token),
    err => err.message === 'OTHER_BRANCH'
  );
  await assert.rejects(
    () => api('/api/records', { method: 'POST', body: { branchId: 'B014', itemName: 'ব্যাগ', fromAmt: 0, saleAmt: 0 } }, gobra.token),
    err => err.message === 'NEED_QTY'
  );
  const saved = await api('/api/records', {
    method: 'POST',
    body: { branchId: 'B014', itemName: 'ব্যাগ', fromAmt: 2, saleAmt: 0, chalanNo: 'LOCAL-1' }
  }, gobra.token);
  assert.strictEqual(saved.message, 'SAVED');
  const after = await api('/api/app', {}, gobra.token);
  assert.ok(after.records.some(r => r.id === saved.id && r.sample === false));

  await assert.rejects(
    () => api('/api/login', { method: 'POST', body: { email: 'nope@bkf.test', password: 'bkf2026' } }),
    err => err.message === 'NOT_ALLOWED'
  );
  const signed = await api('/api/signup', {
    method: 'POST',
    body: {
      branchName: 'নতুন শাখা',
      branchCode: 'B021',
      userName: 'রহিম',
      userId: 'rahim',
      password: 'pass1234',
      confirmPassword: 'pass1234'
    }
  });
  assert.strictEqual(signed.email, 'bkfrahim021@gmail.com');
  const newbie = await api('/api/login', { method: 'POST', body: { email: signed.email, password: 'pass1234' } });
  const newbieData = await api('/api/app', {}, newbie.token);
  assert.strictEqual(newbieData.userBranchId, 'B021');
  assert.strictEqual(newbieData.records.length, 0);

  console.log('local ok');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
