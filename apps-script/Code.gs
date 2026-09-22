/**
 * Branch Item Management System (BIMS) - Secure Multi-Branch
 * Google Apps Script Backend
 *
 * IMPORTANT:
 * Deploy Web App as: Execute the app as "User accessing the web app"
 * Access: only the Google accounts you want to allow (or your Workspace domain).
 */

const SHEET_ENTRIES = 'Entries';
const SHEET_BRANCHES = 'Branches';
const SHEET_USERS = 'Users';
const SHEET_ITEMS = 'Items';
const SUPER_ADMIN_EMAIL = 'azahar4bd@gmail.com';

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

function doGet(e) {
  ensureAllSheetsExist();
  const template = HtmlService.createTemplateFromFile('Index');
  template.initialTargetBranch = e && e.parameter && e.parameter.branch
    ? String(e.parameter.branch).trim().toUpperCase() : '';
  return template.evaluate()
    .setTitle('Branch Item Management')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

/** Run once manually from the Apps Script editor. */
function setupApp() {
  ensureAllSheetsExist();
  return 'BIMS setup complete.';
}

function ensureAllSheetsExist() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  let sh = ss.getSheetByName(SHEET_ENTRIES);
  if (!sh) {
    sh = ss.insertSheet(SHEET_ENTRIES);
    sh.appendRow(['Record ID','Branch ID','SR No','Date','Item Name','Chalan No','From','From Amt','Sale','Sale Amt','Created By','Created At']);
    sh.getRange(1,1,1,12).setFontWeight('bold').setBackground('#E2E8F0');
  }

  sh = ss.getSheetByName(SHEET_BRANCHES);
  if (!sh) {
    sh = ss.insertSheet(SHEET_BRANCHES);
    sh.appendRow(['Branch ID','Branch Name','Status','Created At']);
    sh.getRange(1,1,1,4).setFontWeight('bold').setBackground('#E2E8F0');
    DEFAULT_BRANCHES.forEach((r, i) => sh.appendRow(r.concat([new Date(2026,0,i+1)])));
  }

  sh = ss.getSheetByName(SHEET_USERS);
  if (!sh) {
    sh = ss.insertSheet(SHEET_USERS);
    sh.appendRow(['Email','Branch ID','Branch Name','Role','Status']);
    sh.getRange(1,1,1,5).setFontWeight('bold').setBackground('#E2E8F0');
    DEFAULT_USERS.forEach(r => sh.appendRow(r));
  }

  sh = ss.getSheetByName(SHEET_ITEMS);
  if (!sh) {
    sh = ss.insertSheet(SHEET_ITEMS);
    sh.appendRow(['Item Name']);
    sh.getRange(1,1,1,1).setFontWeight('bold').setBackground('#E2E8F0');
    DEFAULT_ITEMS.forEach(x => sh.appendRow([x]));
  }
}

function getCurrentUser_() {
  const email = String(Session.getActiveUser().getEmail() || '').trim().toLowerCase();
  if (!email) {
    throw new Error('Google account শনাক্ত করা যায়নি। Web App-টি অবশ্যই Google account দিয়ে ব্যবহার করুন এবং deployment-এ Execute as: User accessing the web app নির্বাচন করুন।');
  }

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName(SHEET_USERS);
  const rows = sh.getDataRange().getValues();
  let found = null;

  for (let i = 1; i < rows.length; i++) {
    const rowEmail = String(rows[i][0] || '').trim().toLowerCase();
    if (rowEmail === email) {
      found = {
        email: email,
        branchId: String(rows[i][1] || '').trim().toUpperCase(),
        branchName: String(rows[i][2] || ''),
        role: String(rows[i][3] || 'User').trim(),
        status: String(rows[i][4] || 'Active').trim()
      };
      break;
    }
  }

  // Super admin is always Admin, but still requires a signed-in Google account.
  if (email === SUPER_ADMIN_EMAIL.toLowerCase()) {
    return { email, branchId: found ? found.branchId : 'B014', branchName: found ? found.branchName : 'Gobra', role: 'Admin', status: 'Active' };
  }

  if (!found) throw new Error('এই Gmail অনুমোদিত নয়। Admin-এর কাছে আপনার Gmail অনুমোদন করতে বলুন।');
  if (found.status.toLowerCase() !== 'active') throw new Error('আপনার User account বর্তমানে নিষ্ক্রিয়।');
  if (!found.branchId) throw new Error('আপনার জন্য কোনো Branch নির্ধারণ করা হয়নি।');
  if (!['User','Admin'].includes(found.role)) throw new Error('আপনার User Role সঠিক নয়।');
  return found;
}

function getAppData() {
  ensureAllSheetsExist();
  const user = getCurrentUser_();
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  const branches = readBranches_();
  const items = readItems_();
  const allUsers = user.role === 'Admin' ? readUsers_() : [];
  const allRecords = readEntries_();

  // SECURITY: regular users receive only their own branch records.
  const records = user.role === 'Admin'
    ? allRecords
    : allRecords.filter(r => r.branchId === user.branchId);

  const visibleBranches = user.role === 'Admin'
    ? branches
    : branches.filter(b => b.id === user.branchId);

  return {
    success: true,
    userEmail: user.email,
    userRole: user.role,
    userBranchId: user.branchId,
    userBranchName: user.branchName,
    branches: visibleBranches,
    users: allUsers,
    items: items,
    records: records
  };
}

function readBranches_() {
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_BRANCHES);
  const rows = sh.getDataRange().getValues();
  const out = [], seen = {};
  for (let i = 1; i < rows.length; i++) {
    const id = String(rows[i][0] || '').trim().toUpperCase();
    if (!id || seen[id]) continue;
    seen[id] = true;
    out.push({ id, name: String(rows[i][1] || id), status: String(rows[i][2] || 'Active'), createdAt: formatDate_(rows[i][3]) });
  }
  return out;
}

function readUsers_() {
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_USERS);
  const rows = sh.getDataRange().getValues();
  const out = [], seen = {};
  for (let i = 1; i < rows.length; i++) {
    const email = String(rows[i][0] || '').trim().toLowerCase();
    if (!email || seen[email]) continue;
    seen[email] = true;
    out.push({ email, branchId: String(rows[i][1] || '').trim().toUpperCase(), branchName: String(rows[i][2] || ''), role: String(rows[i][3] || 'User'), status: String(rows[i][4] || 'Active') });
  }
  return out;
}

function readItems_() {
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_ITEMS);
  const rows = sh.getDataRange().getValues();
  const out = [], seen = {};
  for (let i = 1; i < rows.length; i++) {
    const item = String(rows[i][0] || '').trim();
    if (item && !seen[item]) { seen[item] = true; out.push(item); }
  }
  return out;
}

function readEntries_() {
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_ENTRIES);
  const rows = sh.getDataRange().getValues();
  const out = [];
  for (let i = 1; i < rows.length; i++) {
    if (!rows[i][0]) continue;
    out.push({
      id: String(rows[i][0]),
      branchId: String(rows[i][1] || '').trim().toUpperCase(),
      srNo: String(rows[i][2] || ''),
      date: formatDate_(rows[i][3]),
      itemName: String(rows[i][4] || ''),
      chalanNo: String(rows[i][5] || ''),
      fromVal: String(rows[i][6] || ''),
      fromAmt: Number(rows[i][7]) || 0,
      saleVal: String(rows[i][8] || ''),
      saleAmt: Number(rows[i][9]) || 0,
      createdBy: String(rows[i][10] || ''),
      createdAt: String(rows[i][11] || '')
    });
  }
  return out;
}

function formatDate_(value) {
  if (value instanceof Date) return Utilities.formatDate(value, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  return String(value || '');
}

function saveRecordToSheet(data) {
  ensureAllSheetsExist();
  const user = getCurrentUser_();
  data = data || {};

  const requestedBranch = String(data.branchId || '').trim().toUpperCase();
  const branchId = user.role === 'Admin' ? requestedBranch : user.branchId;
  if (!branchId) throw new Error('Branch নির্ধারণ করা যায়নি।');
  if (user.role !== 'Admin' && requestedBranch && requestedBranch !== user.branchId) {
    throw new Error('নিরাপত্তার কারণে অন্য Branch-এ Entry করা যাবে না।');
  }
  if (!readBranches_().some(b => b.id === branchId && b.status.toLowerCase() === 'active')) {
    throw new Error('Branch পাওয়া যায়নি বা Active নয়।');
  }

  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_ENTRIES);
  const rows = sheet.getDataRange().getValues();
  const id = String(data.id || '').trim();
  let rowIndex = -1;
  let oldBranch = '';

  if (id) {
    for (let i = 1; i < rows.length; i++) {
      if (String(rows[i][0]) === id) {
        rowIndex = i + 1;
        oldBranch = String(rows[i][1] || '').trim().toUpperCase();
        break;
      }
    }
    if (rowIndex < 0) throw new Error('যে রেকর্ডটি Update করতে চেয়েছেন সেটি পাওয়া যায়নি।');
    if (user.role !== 'Admin' && oldBranch !== user.branchId) throw new Error('এই রেকর্ড আপনার Branch-এর নয়।');
    if (user.role !== 'Admin' && branchId !== oldBranch) throw new Error('Branch পরিবর্তন করা যাবে না।');
  }

  const fromAmt = Number(data.fromAmt) || 0;
  const saleAmt = Number(data.saleAmt) || 0;
  if (fromAmt === 0 && saleAmt === 0) throw new Error('গ্রহণ অথবা বিতরণ—অন্তত একটি পরিমাণ দিতে হবে।');

  const recordId = id || ('REC_' + new Date().getTime() + '_' + Math.floor(Math.random() * 1000));
  const row = [
    recordId, branchId, String(data.srNo || '1'), String(data.date || formatDate_(new Date())),
    String(data.itemName || ''), String(data.chalanNo || ''), String(data.fromVal || ''), fromAmt,
    String(data.saleVal || ''), saleAmt, user.email, new Date()
  ];

  if (rowIndex > 0) sheet.getRange(rowIndex, 1, 1, 12).setValues([row]);
  else sheet.appendRow(row);
  return { success: true, message: rowIndex > 0 ? 'রেকর্ড সফলভাবে আপডেট হয়েছে!' : 'রেকর্ড সফলভাবে সংরক্ষণ হয়েছে!', id: recordId };
}

function deleteRecordFromSheet(recordId) {
  ensureAllSheetsExist();
  const user = getCurrentUser_();
  if (!recordId) throw new Error('Record ID পাওয়া যায়নি।');
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_ENTRIES);
  const rows = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][0]) === String(recordId)) {
      const branchId = String(rows[i][1] || '').trim().toUpperCase();
      if (user.role !== 'Admin' && branchId !== user.branchId) throw new Error('এই রেকর্ড আপনার Branch-এর নয়।');
      sheet.deleteRow(i + 1);
      return { success: true, message: 'রেকর্ড ডিলিট সম্পন্ন হয়েছে।' };
    }
  }
  throw new Error('রেকর্ড পাওয়া যায়নি।');
}

function adminAddBranch(branchId, branchName) {
  const user = getCurrentUser_();
  requireAdmin_(user);
  ensureAllSheetsExist();
  const id = String(branchId || '').trim().toUpperCase();
  const name = String(branchName || '').trim();
  if (!id || !name) throw new Error('Branch ID ও Branch Name দিন।');
  if (!/^[A-Z0-9_-]+$/.test(id)) throw new Error('Branch ID শুধু A-Z, 0-9, _ অথবা - ব্যবহার করুন।');
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_BRANCHES);
  const rows = sh.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) if (String(rows[i][0]).trim().toUpperCase() === id) throw new Error('এই Branch ID আগে থেকেই আছে।');
  sh.appendRow([id, name, 'Active', new Date()]);
  return { success: true, message: 'নতুন Branch যোগ হয়েছে।' };
}

function adminAddUser(email, branchId, role) {
  const user = getCurrentUser_();
  requireAdmin_(user);
  ensureAllSheetsExist();
  const e = String(email || '').trim().toLowerCase();
  const bId = String(branchId || '').trim().toUpperCase();
  const r = role === 'Admin' ? 'Admin' : 'User';
  if (!/^\S+@\S+\.\S+$/.test(e)) throw new Error('সঠিক Email দিন।');
  const branch = readBranches_().find(b => b.id === bId && b.status.toLowerCase() === 'active');
  if (!branch) throw new Error('Active Branch নির্বাচন করুন।');
  const users = readUsers_();
  if (users.some(u => u.email === e)) throw new Error('এই Email আগে থেকেই Users তালিকায় আছে।');
  SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_USERS).appendRow([e, bId, branch.name, r, 'Active']);
  return { success: true, message: 'User অনুমোদন করা হয়েছে।' };
}

function adminUpdateUserEmail(oldEmail, newEmail) {
  const user = getCurrentUser_();
  requireAdmin_(user);
  const oldE = String(oldEmail || '').trim().toLowerCase();
  const newE = String(newEmail || '').trim().toLowerCase();
  if (!/^\S+@\S+\.\S+$/.test(newE)) throw new Error('সঠিক নতুন Email দিন।');
  if (oldE === SUPER_ADMIN_EMAIL.toLowerCase()) throw new Error('Super Admin Email পরিবর্তন করা যাবে না।');
  if (newE === SUPER_ADMIN_EMAIL.toLowerCase()) throw new Error('Super Admin Email হিসেবে অন্য User-কে সেট করা যাবে না।');
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_USERS);
  const rows = sh.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    const e = String(rows[i][0] || '').trim().toLowerCase();
    if (e === newE) throw new Error('নতুন Email আগে থেকেই ব্যবহৃত হচ্ছে।');
  }
  for (let i = 1; i < rows.length; i++) {
    const e = String(rows[i][0] || '').trim().toLowerCase();
    if (e === oldE) {
      sh.getRange(i + 1, 1).setValue(newE);
      return { success: true, message: 'User Email সফলভাবে পরিবর্তন হয়েছে।' };
    }
  }
  throw new Error('পুরনো Email পাওয়া যায়নি।');
}

function adminSetUserStatus(email, status) {
  const user = getCurrentUser_();
  requireAdmin_(user);
  const e = String(email || '').trim().toLowerCase();
  if (e === SUPER_ADMIN_EMAIL.toLowerCase()) throw new Error('Super Admin নিষ্ক্রিয় করা যাবে না।');
  const value = String(status || '').toLowerCase() === 'active' ? 'Active' : 'Inactive';
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_USERS);
  const rows = sh.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][0] || '').trim().toLowerCase() === e) {
      sh.getRange(i + 1, 5).setValue(value);
      return { success: true, message: 'User status আপডেট হয়েছে।' };
    }
  }
  throw new Error('User পাওয়া যায়নি।');
}

function requireAdmin_(user) {
  if (!user || user.role !== 'Admin') throw new Error('শুধুমাত্র Admin এই কাজটি করতে পারবেন।');
}

function getShareLinks() {
  const user = getCurrentUser_();
  requireAdmin_(user);
  const base = ScriptApp.getService().getUrl();
  return readBranches_().map(b => ({ id: b.id, name: b.name, status: b.status, url: base + '?branch=' + encodeURIComponent(b.id) }));
}

function getBackupData() {
  const user = getCurrentUser_();
  requireAdmin_(user);
  return { generatedAt: new Date().toISOString(), branches: readBranches_(), users: readUsers_(), items: readItems_(), records: readEntries_() };
}
