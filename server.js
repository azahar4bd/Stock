#!/usr/bin/env node
'use strict';

/**
 * Branch Item Management System — standalone server.
 * Rules mirror apps-script/Code.gs: branch isolation, admin-only
 * user management, super-admin lock, receive-or-issue required.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PORT = Number(process.env.PORT) || 8080;
const HOST = '0.0.0.0';
const DB_PATH = process.env.BIMS_DB || path.join(__dirname, 'data', 'db.json');
const PUBLIC_DIR = path.join(__dirname, 'public');
const SUPER_ADMIN_EMAIL = 'azahar4bd@gmail.com';
const DEFAULT_PASSWORD = process.env.BIMS_PASSWORD || 'bkf2026';

const DEFAULT_BRANCHES = [
  ['B014', 'Gobra', 'Active'],
  ['B027', 'Narail', 'Active'],
  ['B020', 'Noldi', 'Active'],
  ['B013', 'Lohagora', 'Active'],
  ['B019', 'Mahajon', 'Active']
];

const DEFAULT_USERS = [
  ['azahar4bd@gmail.com', 'B014', 'Gobra', 'Admin', 'Active'],
  ['bkfgobra014@gmail.com', 'B014', 'Gobra', 'User', 'Active'],
  ['bkfnorailsador027@gmail.com', 'B027', 'Narail', 'User', 'Active'],
  ['bkfnoldi020@gmail.com', 'B020', 'Noldi', 'User', 'Active'],
  ['bkflohagora013@gmail.com', 'B013', 'Lohagora', 'User', 'Active'],
  ['bkfmahajon019@gmail.com', 'B019', 'Mahajon', 'User', 'Active']
];

const DEFAULT_ITEMS = [
  'passbook', 'ঋণ চুক্তিপত্র', 'সঞ্চয় ফেরত', 'সদস্য ভর্তি ফরম',
  'ক্যাশ ফিগার', 'সদস্য হাজিরা খাতা', 'কেন্দ্র পাস বই', 'ব্যাগ'
];

class HttpError extends Error {
  constructor(code, status = 400) {
    super(code);
    this.code = code;
    this.status = status;
  }
}

function todayISO(date = new Date()) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Dhaka',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(date);
}

function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const hash = crypto.scryptSync(String(password), salt, 32).toString('hex');
  return salt + ':' + hash;
}

function verifyPassword(password, stored) {
  if (!stored || !String(stored).includes(':')) return false;
  const [salt, hash] = String(stored).split(':');
  let verify;
  try {
    verify = crypto.scryptSync(String(password), salt, 32).toString('hex');
  } catch {
    return false;
  }
  const a = Buffer.from(hash, 'hex');
  const b = Buffer.from(verify, 'hex');
  if (a.length !== b.length || a.length === 0) return false;
  return crypto.timingSafeEqual(a, b);
}

function clip(value, max = 180) {
  return String(value ?? '').trim().slice(0, max);
}

function qty(value) {
  if (value === '' || value == null) return 0;
  const n = Number(value);
  if (!Number.isFinite(n)) throw new HttpError('BAD_QTY');
  if (n < 0) throw new HttpError('NEGATIVE');
  if (n > 1000000) throw new HttpError('BAD_QTY');
  return Math.round(n * 1000) / 1000;
}

function requireAdmin(user) {
  if (!user || user.role !== 'Admin') throw new HttpError('ADMIN_ONLY', 403);
}

function publicUser(user) {
  return {
    email: user.email,
    branchId: user.branchId,
    branchName: user.branchName,
    role: user.role,
    status: user.status
  };
}

function ensureSuperAdmin(db) {
  let found = db.users.find(u => u.email === SUPER_ADMIN_EMAIL);
  if (!found) {
    found = {
      email: SUPER_ADMIN_EMAIL,
      branchId: 'B014',
      branchName: 'Gobra',
      role: 'Admin',
      status: 'Active',
      passwordHash: hashPassword(DEFAULT_PASSWORD)
    };
    db.users.unshift(found);
  }
  found.role = 'Admin';
  found.status = 'Active';
  if (!found.branchId) {
    found.branchId = 'B014';
    found.branchName = 'Gobra';
  }
  if (!found.passwordHash) found.passwordHash = hashPassword(DEFAULT_PASSWORD);
}

function createFreshDb() {
  const db = {
    branches: DEFAULT_BRANCHES.map((r, i) => ({
      id: r[0],
      name: r[1],
      status: r[2],
      createdAt: '2026-01-0' + (i + 1)
    })),
    users: DEFAULT_USERS.map(r => ({
      email: r[0],
      branchId: r[1],
      branchName: r[2],
      role: r[3],
      status: r[4],
      passwordHash: hashPassword(DEFAULT_PASSWORD)
    })),
    items: DEFAULT_ITEMS.slice(),
    records: []
  };
  seedSamples(db);
  ensureSuperAdmin(db);
  return db;
}

function seedSamples(db) {
  const today = todayISO();
  const rows = [
    ['B014', 'bkfgobra014@gmail.com', '2026-09-02', 'passbook', 'HO-0912', 'হেড অফিস', 100, '', 0, '1'],
    ['B014', 'bkfgobra014@gmail.com', '2026-09-08', 'passbook', 'G-11', '', 0, 'কেন্দ্র-১', 20, '2'],
    ['B014', 'bkfgobra014@gmail.com', '2026-09-05', 'সদস্য ভর্তি ফরম', 'HO-0918', 'হেড অফিস', 200, '', 0, '3'],
    ['B014', 'bkfgobra014@gmail.com', '2026-09-15', 'সদস্য ভর্তি ফরম', 'G-18', '', 0, 'ফিল্ড অফিসার', 60, '4'],
    ['B014', 'bkfgobra014@gmail.com', '2026-09-10', 'ব্যাগ', 'HO-0922', 'হেড অফিস', 15, '', 0, '5'],
    ['B014', 'bkfgobra014@gmail.com', '2026-09-18', 'ব্যাগ', 'G-21', '', 0, 'কেন্দ্র-২', 4, '6'],
    ['B014', 'bkfgobra014@gmail.com', today, 'ক্যাশ ফিগার', 'G-22', 'হেড অফিস', 30, 'কেন্দ্র-১', 6, '7'],
    ['B027', 'bkfnorailsador027@gmail.com', '2026-09-03', 'ঋণ চুক্তিপত্র', 'HO-0930', 'হেড অফিস', 80, '', 0, '1'],
    ['B027', 'bkfnorailsador027@gmail.com', '2026-09-12', 'ঋণ চুক্তিপত্র', 'N-12', '', 0, 'কেন্দ্র-৪', 25, '2'],
    ['B027', 'bkfnorailsador027@gmail.com', '2026-09-06', 'ক্যাশ ফিগার', 'HO-0933', 'হেড অফিস', 40, '', 0, '3'],
    ['B027', 'bkfnorailsador027@gmail.com', '2026-09-19', 'ক্যাশ ফিগার', 'N-19', '', 0, 'ফিল্ড অফিসার', 36, '4'],
    ['B020', 'bkfnoldi020@gmail.com', '2026-09-04', 'কেন্দ্র পাস বই', 'HO-0940', 'হেড অফিস', 30, 'কেন্দ্র-১', 10, '1'],
    ['B020', 'bkfnoldi020@gmail.com', '2026-09-09', 'সদস্য হাজিরা খাতা', 'HO-0944', 'হেড অফিস', 25, '', 0, '2'],
    ['B013', 'bkflohagora013@gmail.com', '2026-09-07', 'সঞ্চয় ফেরত', 'HO-0951', 'হেড অফিস', 60, 'স্টাফ', 15, '1'],
    ['B013', 'bkflohagora013@gmail.com', '2026-09-16', 'ব্যাগ', 'L-16', 'হেড অফিস', 2, 'কেন্দ্র-৩', 5, '2'],
    ['B019', 'bkfmahajon019@gmail.com', '2026-09-11', 'passbook', 'HO-0960', 'হেড অফিস', 40, 'কেন্দ্র-১', 5, '1'],
    ['B019', 'bkfmahajon019@gmail.com', '2026-09-20', 'ব্যাগ', 'M-20', 'হেড অফিস', 8, '', 0, '2']
  ];
  db.records = rows.map((r, i) => ({
    id: 'REC_SAMPLE_' + String(i + 1).padStart(3, '0'),
    branchId: r[0],
    createdBy: r[1],
    date: r[2],
    itemName: r[3],
    chalanNo: r[4],
    fromVal: r[5],
    fromAmt: r[6],
    saleVal: r[7],
    saleAmt: r[8],
    srNo: r[9],
    createdAt: r[2] + 'T04:00:00.000Z',
    sample: true
  }));
}

function resolveUser(db, email) {
  const normalized = String(email || '').trim().toLowerCase();
  if (!normalized) throw new HttpError('UNAUTHENTICATED', 401);
  const found = db.users.find(u => u.email === normalized) || null;
  if (normalized === SUPER_ADMIN_EMAIL) {
    return {
      email: normalized,
      branchId: found ? found.branchId : 'B014',
      branchName: found ? found.branchName : 'Gobra',
      role: 'Admin',
      status: 'Active'
    };
  }
  if (!found) throw new HttpError('NOT_ALLOWED', 403);
  if (String(found.status || '').toLowerCase() !== 'active') throw new HttpError('INACTIVE', 403);
  if (!found.branchId) throw new HttpError('NO_BRANCH', 403);
  if (!['User', 'Admin'].includes(found.role)) throw new HttpError('BAD_ROLE', 403);
  return publicUser(found);
}

function activeBranch(db, branchId) {
  return db.branches.find(b => b.id === branchId && String(b.status).toLowerCase() === 'active');
}

function saveRecord(db, user, data) {
  data = data || {};
  const requestedBranch = clip(data.branchId, 40).toUpperCase();
  const branchId = user.role === 'Admin' ? requestedBranch : user.branchId;
  if (!branchId) throw new HttpError('BRANCH_REQUIRED');
  if (user.role !== 'Admin' && requestedBranch && requestedBranch !== user.branchId) {
    throw new HttpError('OTHER_BRANCH', 403);
  }
  if (!activeBranch(db, branchId)) throw new HttpError('BRANCH_INACTIVE');

  const id = clip(data.id, 80);
  let existing = null;
  if (id) {
    existing = db.records.find(r => r.id === id);
    if (!existing) throw new HttpError('NOT_FOUND', 404);
    if (user.role !== 'Admin' && existing.branchId !== user.branchId) {
      throw new HttpError('NOT_YOUR_BRANCH', 403);
    }
    if (user.role !== 'Admin' && branchId !== existing.branchId) {
      throw new HttpError('CANNOT_CHANGE_BRANCH', 403);
    }
  }

  const fromAmt = qty(data.fromAmt);
  const saleAmt = qty(data.saleAmt);
  if (fromAmt === 0 && saleAmt === 0) throw new HttpError('NEED_QTY');

  const itemName = clip(data.itemName, 80);
  if (!itemName) throw new HttpError('NEED_ITEM');
  if (!db.items.includes(itemName)) {
    if (user.role !== 'Admin') throw new HttpError('UNKNOWN_ITEM');
    db.items.push(itemName);
  }

  let date = clip(data.date, 10);
  if (!date) date = todayISO();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new HttpError('BAD_DATE');

  const now = new Date().toISOString();
  const record = {
    id: id || ('REC_' + Date.now() + '_' + Math.floor(Math.random() * 1000)),
    branchId,
    srNo: clip(data.srNo, 40) || '1',
    date,
    itemName,
    chalanNo: clip(data.chalanNo, 80),
    fromVal: clip(data.fromVal, 120),
    fromAmt,
    saleVal: clip(data.saleVal, 120),
    saleAmt,
    createdBy: existing ? existing.createdBy : user.email,
    createdAt: existing ? existing.createdAt : now,
    updatedBy: existing ? user.email : '',
    updatedAt: existing ? now : '',
    sample: existing ? false : false
  };

  if (existing) {
    const index = db.records.findIndex(r => r.id === id);
    db.records[index] = record;
  } else {
    db.records.push(record);
  }
  return {
    created: !existing,
    id: record.id,
    message: existing ? 'UPDATED' : 'SAVED'
  };
}

function deleteRecord(db, user, recordId) {
  const id = String(recordId || '').trim();
  if (!id) throw new HttpError('NOT_FOUND', 404);
  const index = db.records.findIndex(r => r.id === id);
  if (index < 0) throw new HttpError('NOT_FOUND', 404);
  if (user.role !== 'Admin' && db.records[index].branchId !== user.branchId) {
    throw new HttpError('NOT_YOUR_BRANCH', 403);
  }
  db.records.splice(index, 1);
  return { message: 'DELETED' };
}

function addBranch(db, user, branchId, branchName) {
  requireAdmin(user);
  const id = clip(branchId, 40).toUpperCase();
  const name = clip(branchName, 80);
  if (!id || !name) throw new HttpError('NEED_BRANCH');
  if (!/^[A-Z0-9_-]+$/.test(id)) throw new HttpError('BAD_BRANCH_ID');
  if (db.branches.some(b => b.id === id)) throw new HttpError('BRANCH_EXISTS');
  db.branches.push({ id, name, status: 'Active', createdAt: todayISO() });
  return { message: 'BRANCH_ADDED' };
}

function setBranchStatus(db, user, branchId, status) {
  requireAdmin(user);
  const id = clip(branchId, 40).toUpperCase();
  const branch = db.branches.find(b => b.id === id);
  if (!branch) throw new HttpError('NOT_FOUND', 404);
  branch.status = String(status || '').toLowerCase() === 'active' ? 'Active' : 'Inactive';
  return { message: 'STATUS_UPDATED', status: branch.status };
}

function addUser(db, user, email, branchId, role) {
  requireAdmin(user);
  const e = clip(email, 120).toLowerCase();
  const bId = clip(branchId, 40).toUpperCase();
  const r = role === 'Admin' ? 'Admin' : 'User';
  if (!/^\S+@\S+\.\S+$/.test(e)) throw new HttpError('BAD_EMAIL');
  const branch = activeBranch(db, bId);
  if (!branch) throw new HttpError('BRANCH_INACTIVE');
  if (db.users.some(u => u.email === e)) throw new HttpError('USER_EXISTS');
  db.users.push({
    email: e,
    branchId: bId,
    branchName: branch.name,
    role: r,
    status: 'Active',
    passwordHash: hashPassword(DEFAULT_PASSWORD)
  });
  return { message: 'USER_ADDED', temporaryPassword: DEFAULT_PASSWORD };
}

function updateUserEmail(db, user, oldEmail, newEmail) {
  requireAdmin(user);
  const oldE = clip(oldEmail, 120).toLowerCase();
  const newE = clip(newEmail, 120).toLowerCase();
  if (!/^\S+@\S+\.\S+$/.test(newE)) throw new HttpError('BAD_EMAIL');
  if (oldE === SUPER_ADMIN_EMAIL || newE === SUPER_ADMIN_EMAIL) {
    throw new HttpError('CANNOT_EDIT_SUPER', 403);
  }
  if (db.users.some(u => u.email === newE)) throw new HttpError('EMAIL_IN_USE');
  const row = db.users.find(u => u.email === oldE);
  if (!row) throw new HttpError('NOT_FOUND', 404);
  row.email = newE;
  db.records.forEach(r => {
    if (r.createdBy === oldE) r.createdBy = newE;
    if (r.updatedBy === oldE) r.updatedBy = newE;
  });
  return { message: 'EMAIL_UPDATED' };
}

function setUserStatus(db, user, email, status) {
  requireAdmin(user);
  const e = clip(email, 120).toLowerCase();
  if (e === SUPER_ADMIN_EMAIL) throw new HttpError('CANNOT_EDIT_SUPER', 403);
  if (e === user.email && String(status).toLowerCase() !== 'active') {
    throw new HttpError('SELF_STATUS', 403);
  }
  const row = db.users.find(u => u.email === e);
  if (!row) throw new HttpError('NOT_FOUND', 404);
  row.status = String(status || '').toLowerCase() === 'active' ? 'Active' : 'Inactive';
  return { message: 'STATUS_UPDATED', status: row.status };
}

function resetPassword(db, user, email) {
  requireAdmin(user);
  const e = clip(email, 120).toLowerCase();
  const row = db.users.find(u => u.email === e);
  if (!row) throw new HttpError('NOT_FOUND', 404);
  row.passwordHash = hashPassword(DEFAULT_PASSWORD);
  return { message: 'PASSWORD_RESET', temporaryPassword: DEFAULT_PASSWORD };
}

function changePassword(db, user, current, next) {
  const row = db.users.find(u => u.email === user.email);
  if (!row) throw new HttpError('NOT_FOUND', 404);
  if (!verifyPassword(current, row.passwordHash)) throw new HttpError('BAD_PASSWORD');
  if (String(next || '').length < 4) throw new HttpError('PASSWORD_SHORT');
  row.passwordHash = hashPassword(next);
  return { message: 'PASSWORD_CHANGED' };
}

function addItem(db, user, name) {
  requireAdmin(user);
  const n = clip(name, 80);
  if (!n) throw new HttpError('NEED_ITEM');
  if (db.items.includes(n)) throw new HttpError('ITEM_EXISTS');
  db.items.push(n);
  return { message: 'ITEM_ADDED' };
}

function removeItem(db, user, name) {
  requireAdmin(user);
  const n = String(name || '');
  db.items = db.items.filter(x => x !== n);
  return { message: 'ITEM_REMOVED' };
}

function clearSamples(db, user) {
  requireAdmin(user);
  const before = db.records.length;
  db.records = db.records.filter(r => !r.sample);
  return { removed: before - db.records.length };
}

function backupData(db, user) {
  requireAdmin(user);
  return {
    generatedAt: new Date().toISOString(),
    app: 'BIMS',
    branches: db.branches,
    users: db.users.map(publicUser),
    items: db.items,
    records: db.records
  };
}

function normalizeRecord(r, used) {
  if (!r || typeof r !== 'object') return null;
  let id = clip(r.id, 80) || ('REC_' + Date.now() + '_' + Math.floor(Math.random() * 1000));
  if (used.has(id)) id = id + '_' + Math.floor(Math.random() * 1000);
  used.add(id);
  return {
    id,
    branchId: clip(r.branchId, 40).toUpperCase(),
    srNo: clip(r.srNo, 40) || '1',
    date: clip(r.date, 10),
    itemName: clip(r.itemName, 80),
    chalanNo: clip(r.chalanNo, 80),
    fromVal: clip(r.fromVal, 120),
    fromAmt: Number(r.fromAmt) || 0,
    saleVal: clip(r.saleVal, 120),
    saleAmt: Number(r.saleAmt) || 0,
    createdBy: clip(r.createdBy, 120),
    createdAt: clip(r.createdAt, 40),
    updatedBy: clip(r.updatedBy, 120),
    updatedAt: clip(r.updatedAt, 40),
    sample: !!r.sample
  };
}

function restoreData(db, user, payload) {
  requireAdmin(user);
  if (!payload || !Array.isArray(payload.branches) || !Array.isArray(payload.records)) {
    throw new HttpError('BAD_BACKUP');
  }
  const next = {
    branches: [],
    users: [],
    items: [],
    records: []
  };
  const seenB = new Set();
  for (const raw of payload.branches) {
    const id = clip(raw && raw.id, 40).toUpperCase();
    const name = clip(raw && raw.name, 80);
    if (!id || !name || seenB.has(id) || !/^[A-Z0-9_-]+$/.test(id)) continue;
    seenB.add(id);
    next.branches.push({
      id,
      name,
      status: String(raw.status || 'Active').toLowerCase() === 'active' ? 'Active' : 'Inactive',
      createdAt: clip(raw.createdAt, 20) || todayISO()
    });
  }
  if (!next.branches.length) throw new HttpError('BAD_BACKUP');

  const oldPass = Object.fromEntries(db.users.map(u => [u.email, u.passwordHash]));
  const seenU = new Set();
  for (const raw of payload.users || []) {
    const email = clip(raw && raw.email, 120).toLowerCase();
    if (!email || seenU.has(email) || !/^\S+@\S+\.\S+$/.test(email)) continue;
    seenU.add(email);
    const branchId = clip(raw.branchId, 40).toUpperCase();
    const branch = next.branches.find(b => b.id === branchId);
    next.users.push({
      email,
      branchId,
      branchName: branch ? branch.name : clip(raw.branchName, 80),
      role: raw.role === 'Admin' ? 'Admin' : 'User',
      status: String(raw.status || 'Active').toLowerCase() === 'active' ? 'Active' : 'Inactive',
      passwordHash: oldPass[email] || hashPassword(DEFAULT_PASSWORD)
    });
  }
  const seenI = new Set();
  for (const item of payload.items || []) {
    const n = clip(item, 80);
    if (n && !seenI.has(n)) {
      seenI.add(n);
      next.items.push(n);
    }
  }
  const used = new Set();
  next.records = payload.records.map(r => normalizeRecord(r, used)).filter(Boolean);
  ensureSuperAdmin(next);
  const actor = next.users.find(u => u.email === user.email);
  if (!actor || actor.role !== 'Admin' || actor.status !== 'Active') {
    throw new HttpError('RESTORE_LOCKOUT', 403);
  }
  db.branches = next.branches;
  db.users = next.users;
  db.items = next.items;
  db.records = next.records;
  return { message: 'RESTORED', records: db.records.length };
}

function appData(db, user) {
  const branches = user.role === 'Admin'
    ? db.branches
    : db.branches.filter(b => b.id === user.branchId);
  const records = user.role === 'Admin'
    ? db.records
    : db.records.filter(r => r.branchId === user.branchId);
  return {
    ok: true,
    success: true,
    userEmail: user.email,
    userRole: user.role,
    userBranchId: user.branchId,
    userBranchName: user.branchName,
    branches,
    users: user.role === 'Admin' ? db.users.map(publicUser) : [],
    items: db.items.slice(),
    records
  };
}

let db = null;

function loadOrSeed() {
  if (fs.existsSync(DB_PATH)) {
    db = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
    ensureSuperAdmin(db);
    return;
  }
  db = createFreshDb();
  persistSync();
}

function persistSync() {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  const tmp = DB_PATH + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(db, null, 2));
  fs.renameSync(tmp, DB_PATH);
}

function sessionSecret() {
  return process.env.BIMS_SESSION_SECRET || process.env.DATABASE_URL || 'bims-local-dev-session';
}

function createSession(user) {
  const payload = Buffer.from(JSON.stringify({
    email: user.email,
    exp: Date.now() + 7 * 24 * 3600 * 1000
  })).toString('base64url');
  const sig = crypto.createHmac('sha256', sessionSecret()).update(payload).digest('base64url');
  return payload + '.' + sig;
}

function readSession(token) {
  if (!token || !String(token).includes('.')) return null;
  const parts = String(token).split('.');
  if (parts.length !== 2) return null;
  const [payload, sig] = parts;
  const expect = crypto.createHmac('sha256', sessionSecret()).update(payload).digest('base64url');
  const a = Buffer.from(sig);
  const b = Buffer.from(expect);
  if (a.length !== b.length || a.length === 0 || !crypto.timingSafeEqual(a, b)) return null;
  let data;
  try {
    data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
  } catch {
    return null;
  }
  if (!data || !data.email || Number(data.exp) < Date.now()) return null;
  return data;
}

function userFromAuth(database, authorization, cookie) {
  const header = authorization || '';
  let token = '';
  if (header.startsWith('Bearer ')) token = header.slice(7).trim();
  if (!token && cookie) {
    const match = String(cookie).match(/(?:^|;\s*)bims=([^;]+)/);
    if (match) token = decodeURIComponent(match[1]);
  }
  if (!token) throw new HttpError('UNAUTHENTICATED', 401);
  const session = readSession(token);
  if (!session) throw new HttpError('UNAUTHENTICATED', 401);
  return resolveUser(database, session.email);
}

function getNeon() {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL missing');
  const { neon } = require('@neondatabase/serverless');
  const sql = neon(process.env.DATABASE_URL);
  return (text, params) => sql.query(text, params || []);
}

async function initRemoteStore() {
  const sql = getNeon();
  await sql(`CREATE TABLE IF NOT EXISTS bims_state (
    id text PRIMARY KEY,
    data jsonb NOT NULL,
    version integer NOT NULL DEFAULT 1
  )`);
  const rows = await sql('SELECT version FROM bims_state WHERE id = $1', ['main']);
  if (!rows.length) {
    const fresh = createFreshDb();
    await sql(
      'INSERT INTO bims_state (id, data, version) VALUES ($1, $2::jsonb, 1)',
      ['main', JSON.stringify(fresh)]
    );
  }
  return { ok: true };
}

async function loadState() {
  if (!process.env.DATABASE_URL) {
    if (!db) loadOrSeed();
    return { db, version: null, remote: false };
  }
  const sql = getNeon();
  await sql(`CREATE TABLE IF NOT EXISTS bims_state (
    id text PRIMARY KEY,
    data jsonb NOT NULL,
    version integer NOT NULL DEFAULT 1
  )`);
  const rows = await sql('SELECT data, version FROM bims_state WHERE id = $1', ['main']);
  if (!rows.length) {
    const fresh = createFreshDb();
    await sql(
      'INSERT INTO bims_state (id, data, version) VALUES ($1, $2::jsonb, 1)',
      ['main', JSON.stringify(fresh)]
    );
    return { db: fresh, version: 1, remote: true };
  }
  const raw = rows[0].data;
  const loaded = typeof raw === 'string' ? JSON.parse(raw) : raw;
  ensureSuperAdmin(loaded);
  return { db: loaded, version: Number(rows[0].version), remote: true };
}

async function saveState(state) {
  if (!state.remote) {
    db = state.db;
    persistSync();
    return;
  }
  const sql = getNeon();
  const rows = await sql(
    'UPDATE bims_state SET data = $1::jsonb, version = version + 1 WHERE id = $2 AND version = $3 RETURNING version',
    [JSON.stringify(state.db), 'main', state.version]
  );
  if (!rows.length) {
    const err = new Error('CONFLICT');
    err.code = 'CONFLICT';
    throw err;
  }
  state.version = Number(rows[0].version);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on('data', chunk => {
      size += chunk.length;
      if (size > 1_500_000) {
        reject(new HttpError('TOO_LARGE', 413));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => {
      if (!chunks.length) return resolve({});
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString('utf8')));
      } catch {
        reject(new HttpError('BAD_JSON'));
      }
    });
    req.on('error', reject);
  });
}

function send(res, status, payload, extraHeaders) {
  const body = JSON.stringify(payload);
  const headers = Object.assign({
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff'
  }, extraHeaders || {});
  res.writeHead(status, headers);
  res.end(body);
}

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

function serveStatic(req, res, urlPath) {
  const clean = decodeURIComponent(urlPath.split('?')[0]);
  const rel = clean === '/' ? '/index.html' : clean;
  if (rel.includes('\0') || rel.split('/').includes('..')) {
    res.writeHead(400);
    res.end('Bad path');
    return;
  }
  const filePath = path.join(PUBLIC_DIR, rel);
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }
  fs.readFile(filePath, (err, buf) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Not found');
      return;
    }
    const type = MIME[path.extname(filePath).toLowerCase()] || 'application/octet-stream';
    res.writeHead(200, {
      'Content-Type': type,
      'Cache-Control': 'no-cache',
      'X-Content-Type-Options': 'nosniff'
    });
    res.end(buf);
  });
}

function cookieHeader(token) {
  if (!token) return { 'Set-Cookie': 'bims=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0' };
  return {
    'Set-Cookie': 'bims=' + encodeURIComponent(token) + '; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800'
  };
}

async function perform(state, ctx) {
  const method = ctx.method;
  const urlPath = ctx.urlPath;
  const body = ctx.body || {};
  const database = state.db;

  if (method === 'POST' && urlPath === '/api/login') {
    const email = clip(body.email, 120).toLowerCase();
    const password = String(body.password || '');
    const row = database.users.find(u => u.email === email);
    if (!row) throw new HttpError('NOT_ALLOWED', 403);
    if (!verifyPassword(password, row.passwordHash)) throw new HttpError('BAD_PASSWORD');
    const user = resolveUser(database, email);
    const token = createSession(user);
    return {
      dirty: false,
      status: 200,
      payload: { ok: true, token, user },
      headers: cookieHeader(token)
    };
  }

  const user = userFromAuth(database, ctx.authorization, ctx.cookie);

  if (method === 'POST' && urlPath === '/api/logout') {
    return { dirty: false, status: 200, payload: { ok: true }, headers: cookieHeader('') };
  }
  if (method === 'GET' && urlPath === '/api/app') {
    return { dirty: false, status: 200, payload: appData(database, user) };
  }

  let result;
  let dirty = true;
  if (method === 'POST' && urlPath === '/api/account/password') {
    result = changePassword(database, user, body.current, body.next);
  } else if (method === 'POST' && urlPath === '/api/records') {
    result = Object.assign({ success: true }, saveRecord(database, user, body));
  } else if (method === 'DELETE' && urlPath.startsWith('/api/records/')) {
    const id = decodeURIComponent(urlPath.slice('/api/records/'.length));
    result = Object.assign({ success: true }, deleteRecord(database, user, id));
  } else if (method === 'POST' && urlPath === '/api/admin/branches') {
    result = addBranch(database, user, body.branchId, body.branchName);
  } else if (method === 'POST' && urlPath === '/api/admin/branches/status') {
    result = setBranchStatus(database, user, body.branchId, body.status);
  } else if (method === 'POST' && urlPath === '/api/admin/users') {
    result = addUser(database, user, body.email, body.branchId, body.role);
  } else if (method === 'POST' && urlPath === '/api/admin/users/email') {
    result = updateUserEmail(database, user, body.oldEmail, body.newEmail);
  } else if (method === 'POST' && urlPath === '/api/admin/users/status') {
    result = setUserStatus(database, user, body.email, body.status);
  } else if (method === 'POST' && urlPath === '/api/admin/users/password') {
    result = resetPassword(database, user, body.email);
  } else if (method === 'POST' && urlPath === '/api/admin/items') {
    result = addItem(database, user, body.name);
  } else if (method === 'DELETE' && urlPath === '/api/admin/items') {
    result = removeItem(database, user, body.name);
  } else if (method === 'GET' && urlPath === '/api/admin/backup') {
    dirty = false;
    result = backupData(database, user);
  } else if (method === 'POST' && urlPath === '/api/admin/restore') {
    result = restoreData(database, user, body);
  } else if (method === 'DELETE' && urlPath === '/api/admin/samples') {
    result = clearSamples(database, user);
  } else {
    throw new HttpError('NOT_FOUND', 404);
  }
  return { dirty, status: 200, payload: Object.assign({ ok: true }, result) };
}

async function dispatch(ctx) {
  const method = ctx.method;
  const urlPath = String(ctx.urlPath || '').split('?')[0];
  if (method === 'GET' && urlPath === '/api/health') {
    return {
      status: 200,
      payload: { ok: true, app: 'BIMS', store: process.env.DATABASE_URL ? 'neon' : 'file' }
    };
  }
  const next = Object.assign({}, ctx, { urlPath });
  for (let attempt = 0; attempt < 4; attempt++) {
    const state = await loadState();
    try {
      const result = await perform(state, next);
      if (result.dirty) await saveState(state);
      return result;
    } catch (err) {
      if (err && err.code === 'CONFLICT' && attempt < 3) continue;
      throw err;
    }
  }
  throw new HttpError('SERVER', 500);
}

async function handleApi(req, res, urlPath) {
  let body = {};
  if (req.method !== 'GET' && req.method !== 'HEAD') body = await readBody(req);
  const result = await dispatch({
    method: req.method,
    urlPath,
    body,
    authorization: req.headers.authorization || '',
    cookie: req.headers.cookie || ''
  });
  send(res, result.status, result.payload, result.headers);
}

async function handler(req, res) {
  const urlPath = (req.url || '/').split('?')[0];
  try {
    if (urlPath.startsWith('/api/')) {
      await handleApi(req, res, urlPath);
      return;
    }
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      res.writeHead(405);
      res.end('Method not allowed');
      return;
    }
    serveStatic(req, res, urlPath);
  } catch (err) {
    if (err instanceof HttpError) {
      send(res, err.status, { ok: false, error: err.code });
      return;
    }
    console.error(err);
    if (!res.headersSent) send(res, 500, { ok: false, error: 'SERVER' });
  }
}

function main() {
  loadOrSeed();
  const server = http.createServer(handler);
  server.listen(PORT, HOST, () => {
    console.log('BIMS listening on http://' + HOST + ':' + PORT);
  });
}

if (require.main === module) main();

module.exports = {
  HttpError,
  createFreshDb,
  resolveUser,
  saveRecord,
  deleteRecord,
  addBranch,
  addUser,
  updateUserEmail,
  setUserStatus,
  resetPassword,
  changePassword,
  appData,
  verifyPassword,
  hashPassword,
  restoreData,
  clearSamples,
  DEFAULT_PASSWORD,
  SUPER_ADMIN_EMAIL,
  todayISO,
  dispatch,
  initRemoteStore
};
