'use strict';

const assert = require('assert');
const s = require('../server');

function codeOf(fn) {
  try {
    fn();
  } catch (err) {
    return err.code || err.message;
  }
  return '';
}

const db = s.createFreshDb();
const gobra = s.resolveUser(db, 'bkfgobra014@gmail.com');
const narail = s.resolveUser(db, 'bkfnorailsador027@gmail.com');
const admin = s.resolveUser(db, 'azahar4bd@gmail.com');

assert.strictEqual(admin.role, 'Admin');
assert.strictEqual(gobra.branchId, 'B014');
assert.strictEqual(gobra.role, 'User');

const gobraHash = db.users.find(u => u.email === gobra.email).passwordHash;
assert.strictEqual(s.verifyPassword(s.DEFAULT_PASSWORD, gobraHash), true);
assert.strictEqual(s.verifyPassword('wrong-pass', gobraHash), false);

db.users.find(u => u.email === s.SUPER_ADMIN_EMAIL).role = 'User';
db.users.find(u => u.email === s.SUPER_ADMIN_EMAIL).status = 'Inactive';
assert.strictEqual(s.resolveUser(db, s.SUPER_ADMIN_EMAIL).role, 'Admin');
assert.strictEqual(s.resolveUser(db, s.SUPER_ADMIN_EMAIL).status, 'Active');

assert.strictEqual(codeOf(() => s.saveRecord(db, gobra, {
  branchId: 'B027', itemName: 'passbook', fromAmt: 2, date: '2026-09-22'
})), 'OTHER_BRANCH');

assert.strictEqual(codeOf(() => s.saveRecord(db, gobra, {
  branchId: 'B014', itemName: 'passbook', fromAmt: 0, saleAmt: 0, date: '2026-09-22'
})), 'NEED_QTY');

assert.strictEqual(codeOf(() => s.saveRecord(db, gobra, {
  branchId: 'B014', itemName: '', fromAmt: 1, date: '2026-09-22'
})), 'NEED_ITEM');

assert.strictEqual(codeOf(() => s.saveRecord(db, gobra, {
  branchId: 'B014', itemName: 'passbook', fromAmt: -3, date: '2026-09-22'
})), 'NEGATIVE');

assert.strictEqual(codeOf(() => s.saveRecord(db, gobra, {
  branchId: 'B014', itemName: 'নতুন ফরম', fromAmt: 1, date: '2026-09-22'
})), 'UNKNOWN_ITEM');

const saved = s.saveRecord(db, gobra, {
  branchId: 'B014',
  itemName: 'passbook',
  fromAmt: 4,
  fromVal: 'হেড অফিস',
  date: '2026-09-22',
  chalanNo: 'TEST-1'
});
assert.strictEqual(saved.created, true);
const own = db.records.find(r => r.id === saved.id);
assert.strictEqual(own.branchId, 'B014');
assert.strictEqual(own.createdBy, gobra.email);

const adminSaved = s.saveRecord(db, admin, {
  branchId: 'B027',
  itemName: 'ব্যাগ',
  saleAmt: 1,
  saleVal: 'কেন্দ্র',
  date: '2026-09-22'
});
assert.strictEqual(db.records.find(r => r.id === adminSaved.id).branchId, 'B027');

assert.strictEqual(codeOf(() => s.deleteRecord(db, gobra, adminSaved.id)), 'NOT_YOUR_BRANCH');
assert.strictEqual(codeOf(() => s.deleteRecord(db, narail, own.id)), 'NOT_YOUR_BRANCH');
s.deleteRecord(db, admin, adminSaved.id);
assert.strictEqual(db.records.some(r => r.id === adminSaved.id), false);

const gobraData = s.appData(db, gobra);
assert.strictEqual(gobraData.users.length, 0);
assert.ok(gobraData.records.every(r => r.branchId === 'B014'));
assert.ok(!gobraData.records.some(r => r.branchId === 'B027'));
assert.ok(gobraData.records.some(r => r.id === saved.id));

const adminData = s.appData(db, admin);
assert.ok(adminData.users.length >= 6);
assert.ok(adminData.records.some(r => r.branchId === 'B027'));
assert.ok(!adminData.users.some(u => u.passwordHash));

assert.strictEqual(codeOf(() => s.addBranch(db, gobra, 'B099', 'Test')), 'ADMIN_ONLY');
assert.strictEqual(codeOf(() => s.addBranch(db, admin, 'গোবরা', 'Test')), 'BAD_BRANCH_ID');
assert.strictEqual(codeOf(() => s.addBranch(db, admin, 'B014', 'Again')), 'BRANCH_EXISTS');
s.addBranch(db, admin, 'B099', 'Test Branch');
assert.ok(db.branches.some(b => b.id === 'B099'));

assert.strictEqual(codeOf(() => s.addUser(db, admin, 'not-an-email', 'B014', 'User')), 'BAD_EMAIL');
assert.strictEqual(codeOf(() => s.addUser(db, admin, gobra.email, 'B014', 'User')), 'USER_EXISTS');
assert.strictEqual(codeOf(() => s.updateUserEmail(db, admin, s.SUPER_ADMIN_EMAIL, 'other@gmail.com')), 'CANNOT_EDIT_SUPER');
assert.strictEqual(codeOf(() => s.setUserStatus(db, admin, s.SUPER_ADMIN_EMAIL, 'Inactive')), 'CANNOT_EDIT_SUPER');
assert.strictEqual(codeOf(() => s.setUserStatus(db, admin, admin.email, 'Inactive')), 'CANNOT_EDIT_SUPER');
s.addUser(db, admin, 'second.admin@bkf.test', 'B014', 'Admin');
const second = s.resolveUser(db, 'second.admin@bkf.test');
assert.strictEqual(codeOf(() => s.setUserStatus(db, second, second.email, 'Inactive')), 'SELF_STATUS');

db.branches.find(b => b.id === 'B020').status = 'Inactive';
assert.strictEqual(codeOf(() => s.saveRecord(db, admin, {
  branchId: 'B020', itemName: 'passbook', fromAmt: 1, date: '2026-09-22'
})), 'BRANCH_INACTIVE');

const edited = s.saveRecord(db, gobra, {
  id: saved.id,
  branchId: 'B014',
  itemName: 'passbook',
  fromAmt: 9,
  date: '2026-09-21',
  srNo: '44'
});
assert.strictEqual(edited.created, false);
const updated = db.records.find(r => r.id === saved.id);
assert.strictEqual(updated.fromAmt, 9);
assert.strictEqual(updated.createdBy, gobra.email);
assert.strictEqual(updated.updatedBy, gobra.email);
assert.strictEqual(codeOf(() => s.saveRecord(db, gobra, {
  id: saved.id, branchId: 'B027', itemName: 'passbook', fromAmt: 1, date: '2026-09-22'
})), 'OTHER_BRANCH');
const foreign = s.saveRecord(db, admin, {
  branchId: 'B027', itemName: 'ব্যাগ', fromAmt: 1, date: '2026-09-22'
});
assert.strictEqual(codeOf(() => s.saveRecord(db, gobra, {
  id: foreign.id, itemName: 'ব্যাগ', fromAmt: 2, date: '2026-09-22'
})), 'NOT_YOUR_BRANCH');

console.log('rules ok');
