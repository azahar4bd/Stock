'use strict';

/**
 * Browser copy of the BIMS rules for GitHub Pages.
 * Data stays in this browser (localStorage). It is not the shared server.
 */
(function (root) {
  const KEY = 'bims_pages_db_v1';
  const SUPER = 'azahar4bd@gmail.com';
  const DEFAULT_PASSWORD = 'bkf2026';

  const DEFAULT_BRANCHES = [
    ['B014', 'Gobra', 'Active']
  ];

  const DEFAULT_USERS = [
    ['azahar4bd@gmail.com', 'B014', 'Gobra', 'Admin', 'Active', 'আজহার'],
    ['bkfgobra014@gmail.com', 'B014', 'Gobra', 'User', 'Active', 'গোবরা']
  ];

  const DEFAULT_ITEMS = [
    'passbook', 'ঋণ চুক্তিপত্র', 'সঞ্চয় ফেরত', 'সদস্য ভর্তি ফরম',
    'ক্যাশ ফিগার', 'সদস্য হাজিরা খাতা', 'কেন্দ্র পাস বই', 'ব্যাগ'
  ];

  function fail(code) {
    const err = new Error(code);
    err.code = code;
    throw err;
  }

  function todayISO(date) {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Dhaka',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(date || new Date());
  }

  function clip(value, max) {
    return String(value == null ? '' : value).trim().slice(0, max || 180);
  }

  function qty(value) {
    if (value === '' || value == null) return 0;
    const n = Number(value);
    if (!Number.isFinite(n)) fail('BAD_QTY');
    if (n < 0) fail('NEGATIVE');
    if (n > 1000000) fail('BAD_QTY');
    return Math.round(n * 1000) / 1000;
  }

  function publicUser(user) {
    return {
      email: user.email,
      name: user.name || '',
      userId: user.userId || '',
      branchId: user.branchId,
      branchName: user.branchName,
      role: user.role,
      status: user.status
    };
  }

  function signupEmail(userId, branchId) {
    const raw = String(userId || '').trim().toLowerCase();
    if (/^\S+@\S+\.\S+$/.test(raw)) return raw;
    const slug = raw.replace(/[^a-z0-9]/g, '');
    const digits = String(branchId || '').replace(/\D/g, '');
    if (!slug) fail('NEED_USER');
    return 'bkf' + slug + digits + '@gmail.com';
  }

  function ensureSuperAdmin(db) {
    let found = db.users.find(function (u) { return u.email === SUPER; });
    if (!found) {
      found = {
        email: SUPER,
        branchId: 'B014',
        branchName: 'Gobra',
        role: 'Admin',
        status: 'Active',
        password: DEFAULT_PASSWORD
      };
      db.users.unshift(found);
    }
    found.role = 'Admin';
    found.status = 'Active';
    if (!found.branchId) {
      found.branchId = 'B014';
      found.branchName = 'Gobra';
    }
    if (!found.password) found.password = DEFAULT_PASSWORD;
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
      ['B014', 'bkfgobra014@gmail.com', today, 'ক্যাশ ফিগার', 'G-22', 'হেড অফিস', 30, 'কেন্দ্র-১', 6, '7']
    ];
    db.records = rows.map(function (r, i) {
      return {
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
      };
    });
  }

  function createFreshDb() {
    const db = {
      branches: DEFAULT_BRANCHES.map(function (r, i) {
        return { id: r[0], name: r[1], status: r[2], createdAt: '2026-01-0' + (i + 1) };
      }),
      users: DEFAULT_USERS.map(function (r) {
        return {
          email: r[0],
          branchId: r[1],
          branchName: r[2],
          role: r[3],
          status: r[4],
          name: r[5] || '',
          password: DEFAULT_PASSWORD
        };
      }),
      items: DEFAULT_ITEMS.slice(),
      records: [],
      sessions: {},
      prunedToGobra: true
    };
    seedSamples(db);
    ensureSuperAdmin(db);
    return db;
  }

  function pruneToGobra(db) {
    if (!db || db.prunedToGobra) return false;
    if (!db.branches.some(function (b) { return b.id === 'B014'; })) {
      db.branches.unshift({ id: 'B014', name: 'Gobra', status: 'Active', createdAt: '2026-01-01' });
    }
    db.branches = db.branches.filter(function (b) { return b.id === 'B014'; });
    db.users = (db.users || []).filter(function (u) { return u.email === SUPER || u.branchId === 'B014'; });
    db.records = (db.records || []).filter(function (r) { return r.branchId === 'B014'; });
    db.prunedToGobra = true;
    ensureSuperAdmin(db);
    return true;
  }

  function signup(db, body) {
    body = body || {};
    const branchName = clip(body.branchName, 80);
    const branchId = clip(body.branchCode || body.branchId, 40).toUpperCase();
    const userName = clip(body.userName, 80);
    const userId = clip(body.userId, 60);
    const password = String(body.password || '');
    const confirm = String(body.confirmPassword || body.confirm || '');
    if (!branchName || !branchId) fail('NEED_BRANCH');
    if (!/^[A-Z0-9_-]+$/.test(branchId)) fail('BAD_BRANCH_ID');
    if (db.branches.some(function (b) { return b.id === branchId; })) fail('BRANCH_EXISTS');
    if (!userName) fail('NEED_NAME');
    if (!userId) fail('NEED_USER');
    const email = signupEmail(userId, branchId);
    if (!/^\S+@\S+\.\S+$/.test(email)) fail('BAD_EMAIL');
    if (db.users.some(function (u) { return u.email === email; })) fail('USER_EXISTS');
    if (password.length < 4) fail('PASSWORD_SHORT');
    if (password !== confirm) fail('PASSWORD_MISMATCH');
    db.branches.push({ id: branchId, name: branchName, status: 'Active', createdAt: todayISO() });
    db.users.push({
      email: email,
      name: userName,
      userId: userId,
      branchId: branchId,
      branchName: branchName,
      role: 'User',
      status: 'Active',
      password: password
    });
    db.prunedToGobra = true;
    return { message: 'SIGNED_UP', email: email, branchId: branchId, branchName: branchName, userName: userName };
  }

  function load() {
    try {
      const raw = root.localStorage.getItem(KEY);
      if (raw) {
        const db = JSON.parse(raw);
        db.branches = db.branches || [];
        db.users = db.users || [];
        db.items = db.items || [];
        db.records = db.records || [];
        db.sessions = db.sessions || {};
        ensureSuperAdmin(db);
        if (pruneToGobra(db)) save(db);
        return db;
      }
    } catch (e) { /* fresh seed */ }
    return createFreshDb();
  }

  function save(db) {
    root.localStorage.setItem(KEY, JSON.stringify(db));
  }

  function resolveUser(db, email) {
    const normalized = String(email || '').trim().toLowerCase();
    if (!normalized) fail('UNAUTHENTICATED');
    const found = db.users.find(function (u) { return u.email === normalized; }) || null;
    if (normalized === SUPER) {
      return {
        email: normalized,
        branchId: found ? found.branchId : 'B014',
        branchName: found ? found.branchName : 'Gobra',
        role: 'Admin',
        status: 'Active'
      };
    }
    if (!found) fail('NOT_ALLOWED');
    if (String(found.status || '').toLowerCase() !== 'active') fail('INACTIVE');
    if (!found.branchId) fail('NO_BRANCH');
    if (found.role !== 'User' && found.role !== 'Admin') fail('BAD_ROLE');
    return publicUser(found);
  }

  function activeBranch(db, branchId) {
    return db.branches.find(function (b) {
      return b.id === branchId && String(b.status).toLowerCase() === 'active';
    });
  }

  function requireAdmin(user) {
    if (!user || user.role !== 'Admin') fail('ADMIN_ONLY');
  }

  function userFromToken(db, token) {
    if (!token) fail('UNAUTHENTICATED');
    const session = db.sessions[token];
    if (!session || session.exp < Date.now()) {
      if (session) delete db.sessions[token];
      fail('UNAUTHENTICATED');
    }
    return resolveUser(db, session.email);
  }

  function createSession(db, email) {
    const token = 'loc_' + Date.now().toString(36) + '_' + Math.floor(Math.random() * 1e9).toString(36);
    db.sessions[token] = { email: email, exp: Date.now() + 7 * 24 * 3600 * 1000 };
    return token;
  }

  function saveRecord(db, user, data) {
    data = data || {};
    const requestedBranch = clip(data.branchId, 40).toUpperCase();
    const branchId = user.role === 'Admin' ? requestedBranch : user.branchId;
    if (!branchId) fail('BRANCH_REQUIRED');
    if (user.role !== 'Admin' && requestedBranch && requestedBranch !== user.branchId) fail('OTHER_BRANCH');
    if (!activeBranch(db, branchId)) fail('BRANCH_INACTIVE');

    const id = clip(data.id, 80);
    let existing = null;
    if (id) {
      existing = db.records.find(function (r) { return r.id === id; });
      if (!existing) fail('NOT_FOUND');
      if (user.role !== 'Admin' && existing.branchId !== user.branchId) fail('NOT_YOUR_BRANCH');
      if (user.role !== 'Admin' && branchId !== existing.branchId) fail('CANNOT_CHANGE_BRANCH');
    }

    const fromAmt = qty(data.fromAmt);
    const saleAmt = qty(data.saleAmt);
    if (fromAmt === 0 && saleAmt === 0) fail('NEED_QTY');

    const itemName = clip(data.itemName, 80);
    if (!itemName) fail('NEED_ITEM');
    if (db.items.indexOf(itemName) < 0) {
      if (user.role !== 'Admin') fail('UNKNOWN_ITEM');
      db.items.push(itemName);
    }

    let date = clip(data.date, 10);
    if (!date) date = todayISO();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) fail('BAD_DATE');

    const now = new Date().toISOString();
    const record = {
      id: id || ('REC_' + Date.now() + '_' + Math.floor(Math.random() * 1000)),
      branchId: branchId,
      srNo: clip(data.srNo, 40) || '1',
      date: date,
      itemName: itemName,
      chalanNo: clip(data.chalanNo, 80),
      fromVal: clip(data.fromVal, 120),
      fromAmt: fromAmt,
      saleVal: clip(data.saleVal, 120),
      saleAmt: saleAmt,
      createdBy: existing ? existing.createdBy : user.email,
      createdAt: existing ? existing.createdAt : now,
      updatedBy: existing ? user.email : '',
      updatedAt: existing ? now : '',
      sample: false
    };
    if (existing) {
      const index = db.records.findIndex(function (r) { return r.id === id; });
      db.records[index] = record;
    } else {
      db.records.push(record);
    }
    return { created: !existing, id: record.id, message: existing ? 'UPDATED' : 'SAVED' };
  }

  function deleteRecord(db, user, recordId) {
    const id = String(recordId || '').trim();
    if (!id) fail('NOT_FOUND');
    const index = db.records.findIndex(function (r) { return r.id === id; });
    if (index < 0) fail('NOT_FOUND');
    if (user.role !== 'Admin' && db.records[index].branchId !== user.branchId) fail('NOT_YOUR_BRANCH');
    db.records.splice(index, 1);
    return { message: 'DELETED' };
  }

  function addBranch(db, user, branchId, branchName) {
    requireAdmin(user);
    const id = clip(branchId, 40).toUpperCase();
    const name = clip(branchName, 80);
    if (!id || !name) fail('NEED_BRANCH');
    if (!/^[A-Z0-9_-]+$/.test(id)) fail('BAD_BRANCH_ID');
    if (db.branches.some(function (b) { return b.id === id; })) fail('BRANCH_EXISTS');
    db.branches.push({ id: id, name: name, status: 'Active', createdAt: todayISO() });
    return { message: 'BRANCH_ADDED' };
  }

  function setBranchStatus(db, user, branchId, status) {
    requireAdmin(user);
    const id = clip(branchId, 40).toUpperCase();
    const branch = db.branches.find(function (b) { return b.id === id; });
    if (!branch) fail('NOT_FOUND');
    branch.status = String(status || '').toLowerCase() === 'active' ? 'Active' : 'Inactive';
    return { message: 'STATUS_UPDATED', status: branch.status };
  }

  function addUser(db, user, email, branchId, role) {
    requireAdmin(user);
    const e = clip(email, 120).toLowerCase();
    const bId = clip(branchId, 40).toUpperCase();
    const r = role === 'Admin' ? 'Admin' : 'User';
    if (!/^\S+@\S+\.\S+$/.test(e)) fail('BAD_EMAIL');
    const branch = activeBranch(db, bId);
    if (!branch) fail('BRANCH_INACTIVE');
    if (db.users.some(function (u) { return u.email === e; })) fail('USER_EXISTS');
    db.users.push({
      email: e,
      branchId: bId,
      branchName: branch.name,
      role: r,
      status: 'Active',
      password: DEFAULT_PASSWORD
    });
    return { message: 'USER_ADDED', temporaryPassword: DEFAULT_PASSWORD };
  }

  function updateUserEmail(db, user, oldEmail, newEmail) {
    requireAdmin(user);
    const oldE = clip(oldEmail, 120).toLowerCase();
    const newE = clip(newEmail, 120).toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(newE)) fail('BAD_EMAIL');
    if (oldE === SUPER || newE === SUPER) fail('CANNOT_EDIT_SUPER');
    if (db.users.some(function (u) { return u.email === newE; })) fail('EMAIL_IN_USE');
    const row = db.users.find(function (u) { return u.email === oldE; });
    if (!row) fail('NOT_FOUND');
    row.email = newE;
    db.records.forEach(function (r) {
      if (r.createdBy === oldE) r.createdBy = newE;
      if (r.updatedBy === oldE) r.updatedBy = newE;
    });
    Object.keys(db.sessions).forEach(function (token) {
      if (db.sessions[token].email === oldE) db.sessions[token].email = newE;
    });
    return { message: 'EMAIL_UPDATED' };
  }

  function setUserStatus(db, user, email, status) {
    requireAdmin(user);
    const e = clip(email, 120).toLowerCase();
    if (e === SUPER) fail('CANNOT_EDIT_SUPER');
    if (e === user.email && String(status).toLowerCase() !== 'active') fail('SELF_STATUS');
    const row = db.users.find(function (u) { return u.email === e; });
    if (!row) fail('NOT_FOUND');
    row.status = String(status || '').toLowerCase() === 'active' ? 'Active' : 'Inactive';
    return { message: 'STATUS_UPDATED', status: row.status };
  }

  function resetPassword(db, user, email) {
    requireAdmin(user);
    const e = clip(email, 120).toLowerCase();
    const row = db.users.find(function (u) { return u.email === e; });
    if (!row) fail('NOT_FOUND');
    row.password = DEFAULT_PASSWORD;
    return { message: 'PASSWORD_RESET', temporaryPassword: DEFAULT_PASSWORD };
  }

  function changePassword(db, user, current, next) {
    const row = db.users.find(function (u) { return u.email === user.email; });
    if (!row) fail('NOT_FOUND');
    if (String(current || '') !== String(row.password || '')) fail('BAD_PASSWORD');
    if (String(next || '').length < 4) fail('PASSWORD_SHORT');
    row.password = String(next);
    return { message: 'PASSWORD_CHANGED' };
  }

  function addItem(db, user, name) {
    requireAdmin(user);
    const n = clip(name, 80);
    if (!n) fail('NEED_ITEM');
    if (db.items.indexOf(n) >= 0) fail('ITEM_EXISTS');
    db.items.push(n);
    return { message: 'ITEM_ADDED' };
  }

  function removeItem(db, user, name) {
    requireAdmin(user);
    const n = String(name || '');
    db.items = db.items.filter(function (x) { return x !== n; });
    return { message: 'ITEM_REMOVED' };
  }

  function clearSamples(db, user) {
    requireAdmin(user);
    const before = db.records.length;
    db.records = db.records.filter(function (r) { return !r.sample; });
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
      id: id,
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
    if (!payload || !Array.isArray(payload.branches) || !Array.isArray(payload.records)) fail('BAD_BACKUP');
    const next = { branches: [], users: [], items: [], records: [], sessions: {} };
    const seenB = new Set();
    payload.branches.forEach(function (raw) {
      const id = clip(raw && raw.id, 40).toUpperCase();
      const name = clip(raw && raw.name, 80);
      if (!id || !name || seenB.has(id) || !/^[A-Z0-9_-]+$/.test(id)) return;
      seenB.add(id);
      next.branches.push({
        id: id,
        name: name,
        status: String(raw.status || 'Active').toLowerCase() === 'active' ? 'Active' : 'Inactive',
        createdAt: clip(raw.createdAt, 20) || todayISO()
      });
    });
    if (!next.branches.length) fail('BAD_BACKUP');
    const oldPass = {};
    db.users.forEach(function (u) { oldPass[u.email] = u.password; });
    const seenU = new Set();
    (payload.users || []).forEach(function (raw) {
      const email = clip(raw && raw.email, 120).toLowerCase();
      if (!email || seenU.has(email) || !/^\S+@\S+\.\S+$/.test(email)) return;
      seenU.add(email);
      const branchId = clip(raw.branchId, 40).toUpperCase();
      const branch = next.branches.find(function (b) { return b.id === branchId; });
      next.users.push({
        email: email,
        branchId: branchId,
        branchName: branch ? branch.name : clip(raw.branchName, 80),
        role: raw.role === 'Admin' ? 'Admin' : 'User',
        status: String(raw.status || 'Active').toLowerCase() === 'active' ? 'Active' : 'Inactive',
        password: oldPass[email] || DEFAULT_PASSWORD
      });
    });
    const seenI = new Set();
    (payload.items || []).forEach(function (item) {
      const n = clip(item, 80);
      if (n && !seenI.has(n)) {
        seenI.add(n);
        next.items.push(n);
      }
    });
    const used = new Set();
    next.records = payload.records.map(function (r) { return normalizeRecord(r, used); }).filter(Boolean);
    ensureSuperAdmin(next);
    const actor = next.users.find(function (u) { return u.email === user.email; });
    if (!actor || actor.role !== 'Admin' || actor.status !== 'Active') fail('RESTORE_LOCKOUT');
    db.branches = next.branches;
    db.users = next.users;
    db.items = next.items;
    db.records = next.records;
    db.sessions = { };
    return { message: 'RESTORED', records: db.records.length };
  }

  function appData(db, user) {
    const branches = user.role === 'Admin'
      ? db.branches
      : db.branches.filter(function (b) { return b.id === user.branchId; });
    const records = user.role === 'Admin'
      ? db.records
      : db.records.filter(function (r) { return r.branchId === user.branchId; });
    return {
      ok: true,
      success: true,
      userEmail: user.email,
      userRole: user.role,
      userBranchId: user.branchId,
      userBranchName: user.branchName,
      branches: branches,
      users: user.role === 'Admin' ? db.users.map(publicUser) : [],
      items: db.items.slice(),
      records: records
    };
  }

  function handle(path, options, token) {
    const method = String((options && options.method) || 'GET').toUpperCase();
    const body = (options && options.body) || {};
    const clean = String(path || '').split('?')[0];
    const db = load();

    if (method === 'GET' && clean === '/api/health') return { ok: true, app: 'BIMS', mode: 'browser' };

    if (method === 'POST' && clean === '/api/signup') {
      const result = signup(db, body);
      save(db);
      return result;
    }

    if (method === 'POST' && clean === '/api/login') {
      const email = clip(body.email, 120).toLowerCase();
      const row = db.users.find(function (u) { return u.email === email; });
      if (!row) fail('NOT_ALLOWED');
      if (String(body.password || '') !== String(row.password || '')) fail('BAD_PASSWORD');
      const user = resolveUser(db, email);
      const nextToken = createSession(db, user.email);
      save(db);
      return { ok: true, token: nextToken, user: user };
    }

    const user = userFromToken(db, token);

    if (method === 'POST' && clean === '/api/logout') {
      if (token) delete db.sessions[token];
      save(db);
      return { ok: true };
    }

    if (method === 'GET' && clean === '/api/app') return appData(db, user);

    let result;
    let dirty = false;
    if (method === 'POST' && clean === '/api/account/password') {
      result = changePassword(db, user, body.current, body.next);
      dirty = true;
    } else if (method === 'POST' && clean === '/api/records') {
      result = saveRecord(db, user, body);
      dirty = true;
    } else if (method === 'DELETE' && clean.indexOf('/api/records/') === 0) {
      result = deleteRecord(db, user, decodeURIComponent(clean.slice('/api/records/'.length)));
      dirty = true;
    } else if (method === 'POST' && clean === '/api/admin/branches') {
      result = addBranch(db, user, body.branchId, body.branchName);
      dirty = true;
    } else if (method === 'POST' && clean === '/api/admin/branches/status') {
      result = setBranchStatus(db, user, body.branchId, body.status);
      dirty = true;
    } else if (method === 'POST' && clean === '/api/admin/users') {
      result = addUser(db, user, body.email, body.branchId, body.role);
      dirty = true;
    } else if (method === 'POST' && clean === '/api/admin/users/email') {
      result = updateUserEmail(db, user, body.oldEmail, body.newEmail);
      dirty = true;
    } else if (method === 'POST' && clean === '/api/admin/users/status') {
      result = setUserStatus(db, user, body.email, body.status);
      dirty = true;
    } else if (method === 'POST' && clean === '/api/admin/users/password') {
      result = resetPassword(db, user, body.email);
      dirty = true;
    } else if (method === 'POST' && clean === '/api/admin/items') {
      result = addItem(db, user, body.name);
      dirty = true;
    } else if (method === 'DELETE' && clean === '/api/admin/items') {
      result = removeItem(db, user, body.name);
      dirty = true;
    } else if (method === 'GET' && clean === '/api/admin/backup') {
      result = backupData(db, user);
    } else if (method === 'POST' && clean === '/api/admin/restore') {
      result = restoreData(db, user, body);
      dirty = true;
    } else if (method === 'DELETE' && clean === '/api/admin/samples') {
      result = clearSamples(db, user);
      dirty = true;
    } else {
      fail('NOT_FOUND');
    }
    if (dirty) save(db);
    return Object.assign({ ok: true, success: true }, result);
  }

  root.bimsLocal = function (path, options, token) {
    return Promise.resolve().then(function () {
      return handle(path, options, token);
    });
  };
})(typeof globalThis !== 'undefined' ? globalThis : this);
