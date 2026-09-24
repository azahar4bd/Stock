'use strict';

const DEMO_PASSWORD = 'bkf2026';

let useLocalStore = null;

function staticHost() {
  const host = location.hostname;
  return /(^|\.)github\.io$/.test(host)
    || host.endsWith('jsdelivr.net')
    || host.endsWith('statically.io')
    || host.endsWith('githack.com');
}

function isBrowserBook() {
  return staticHost() || useLocalStore === true;
}

async function shouldUseLocal() {
  if (useLocalStore != null) return useLocalStore;
  if (!globalThis.bimsLocal) {
    useLocalStore = false;
    return false;
  }
  if (staticHost()) {
    useLocalStore = true;
    return true;
  }
  try {
    const res = await fetch('api/health', { cache: 'no-store' });
    const data = await res.json().catch(() => null);
    useLocalStore = !(res.ok && data && data.app === 'BIMS');
  } catch (e) {
    useLocalStore = true;
  }
  return useLocalStore;
}

function appUrl(search) {
  const url = new URL(location.href);
  url.hash = '';
  if (url.pathname.endsWith('/index.html')) url.pathname = url.pathname.slice(0, -'index.html'.length);
  url.search = search || '';
  return url.toString();
}
const MONTHS_BN = ['জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'];
const MONTHS_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const BRANCH_STATIC = {
  B014: { en: 'Gobra', bn: 'গোবরা' },
  B027: { en: 'Narail', bn: 'নড়াইল' },
  B020: { en: 'Noldi', bn: 'নলদী' },
  B013: { en: 'Lohagora', bn: 'লোহাগড়া' },
  B019: { en: 'Mahajon', bn: 'মহাজন' }
};

const ITEM_EN = {
  passbook: 'Passbook',
  'ঋণ চুক্তিপত্র': 'Loan agreement',
  'সঞ্চয় ফেরত': 'Savings return',
  'সদস্য ভর্তি ফরম': 'Member admission form',
  'ক্যাশ ফিগার': 'Cash figure',
  'সদস্য হাজিরা খাতা': 'Attendance register',
  'কেন্দ্র পাস বই': 'Center passbook',
  'ব্যাগ': 'Bag'
};

const ITEM_BN = { passbook: 'পাসবুক' };

const QUICK = [
  ['azahar4bd@gmail.com', 'adminQuick'],
  ['bkfgobra014@gmail.com', 'B014'],
  ['bkfnorailsador027@gmail.com', 'B027'],
  ['bkfnoldi020@gmail.com', 'B020'],
  ['bkflohagora013@gmail.com', 'B013'],
  ['bkfmahajon019@gmail.com', 'B019']
];

const I18N = {
  bn: {
    appName: 'স্টক খাতা',
    org: 'বন্ধু কল্যাণ ফাউন্ডেশন',
    email: 'ইমেইল',
    password: 'পাসওয়ার্ড',
    show: 'দেখাও',
    hide: 'লুকাও',
    passwordHint: 'এটা Gmail পাসওয়ার্ড নয়। শুরুর পাসওয়ার্ড',
    signIn: 'লগইন',
    signingIn: 'ঢুকছি…',
    signUp: 'সাইন আপ',
    signUpTitle: 'নতুন ব্রাঞ্চ খুলুন',
    signingUp: 'খুলছি…',
    branchCode: 'ব্রাঞ্চ কোড',
    userName: 'ইউজারের নাম',
    userId: 'ইউজার আইডি',
    emailAuto: 'লগইন ইমেইল',
    emailAutoHint: 'ইউজার আইডি থেকে ইমেইল নিজেই তৈরি হবে। এই ইমেইলই লগইন আইডি।',
    confirmPassword: 'কনফার্ম পাসওয়ার্ড',
    signupHelp: 'সাইন আপ করলেই নতুন ব্রাঞ্চ ও ইউজার তৈরি হবে।',
    signedUp: 'নতুন ব্রাঞ্চ খুলেছে। লগইন ইমেইল: {email}',
    needAccount: 'নতুন ব্রাঞ্চ খুলবেন?',
    haveAccount: 'আগে থেকে অ্যাকাউন্ট আছে?',
    quick: 'দ্রুত প্রবেশ',
    adminQuick: 'অ্যাডমিন',
    logout: 'বের হন',
    lang: 'EN',
    passwordBtn: 'পাসওয়ার্ড',
    navStock: 'স্টক',
    navEntry: 'এন্ট্রি',
    navBook: 'খাতা',
    navReport: 'রিপোর্ট',
    navAdmin: 'অ্যাডমিন',
    morning: 'শুভ সকাল',
    noon: 'শুভ দুপুর',
    evening: 'শুভ সন্ধ্যা',
    night: 'শুভ রাত্রি',
    allBranches: 'সব ব্রাঞ্চ',
    todayEntries: 'আজকের এন্ট্রি',
    lowStock: 'কম স্টক',
    shortStock: 'ঘাটতি',
    itemCount: 'আইটেম',
    searchItems: 'আইটেম খুঁজুন',
    stockTitle: 'স্টক রিপোর্ট',
    stockHelp: 'সারি চাপলে সেই আইটেমের খাতা খুলবে।',
    status: 'অবস্থা',
    total: 'মোট',
    serial: 'ক্রম',
    inQty: 'গ্রহণ',
    outQty: 'বিতরণ',
    balance: 'স্থিতি',
    pcs: 'পিস',
    inHand: 'আছে',
    low: 'কম',
    empty: 'শূন্য',
    short: 'ঘাটতি',
    sampleNote: 'কিছু এন্ট্রি নমুনা। মুছতে অ্যাডমিন → ব্যাকআপ।',
    dismiss: 'বুঝেছি',
    entryTitle: 'নতুন এন্ট্রি',
    editTitle: 'এন্ট্রি সংশোধন',
    entryHelp: 'প্রারম্ভিক স্থিতি লিখতে গ্রহণে “প্রারম্ভিক স্থিতি” দিন। গ্রহণ বা বিতরণ — অন্তত একটি পরিমাণ লাগবে।',
    date: 'তারিখ',
    srNo: 'এসআর নং',
    branch: 'ব্রাঞ্চ',
    item: 'আইটেম',
    pickItem: 'আইটেম বেছে নিন',
    chalan: 'চালান নং',
    fromWho: 'কোথা থেকে',
    fromQty: 'গ্রহণ পরিমাণ',
    toWhom: 'কাকে',
    toQty: 'বিতরণ পরিমাণ',
    receive: 'গ্রহণ',
    issue: 'বিতরণ',
    currentBal: 'বর্তমান স্থিতি',
    save: 'সংরক্ষণ',
    saving: 'সংরক্ষণ হচ্ছে…',
    update: 'আপডেট',
    reset: 'মুছুন',
    cancelEdit: 'বাতিল',
    bookTitle: 'এন্ট্রি খাতা',
    searchRecords: 'চালান, আইটেম, নাম খুঁজুন',
    allItems: 'সব আইটেম',
    fromDate: 'শুরু',
    toDate: 'শেষ',
    noRecords: 'এই ফিল্টারে কোনো এন্ট্রি নেই।',
    edit: 'সংশোধন',
    delete: 'মুছুন',
    confirmDelete: 'এই এন্ট্রি মুছে ফেলবেন?',
    yesDelete: 'হ্যাঁ, মুছুন',
    cancel: 'বাতিল',
    reportTitle: 'স্টক রিপোর্ট',
    reportHelp: 'প্রারম্ভিক = শুরুর আগের স্থিতি। স্থিতি = প্রারম্ভিক + গ্রহণ − বিতরণ।',
    opening: 'প্রারম্ভিক',
    received: 'গ্রহণ',
    issued: 'বিতরণ',
    closing: 'স্থিতি',
    print: 'প্রিন্ট',
    export: 'এক্সেল',
    noReport: 'এই সময়ে কোনো মুভমেন্ট নেই।',
    prepared: 'প্রস্তুতকারী',
    checked: 'যাচাইকারী',
    manager: 'ব্রাঞ্চ ম্যানেজার',
    printedBy: 'প্রিন্ট',
    adminTitle: 'অ্যাডমিন',
    tabBranches: 'ব্রাঞ্চ',
    tabUsers: 'ইউজার',
    tabItems: 'আইটেম',
    tabBackup: 'ব্যাকআপ',
    branchId: 'ব্রাঞ্চ আইডি',
    branchName: 'ব্রাঞ্চের নাম',
    addBranch: 'ব্রাঞ্চ যোগ',
    addUser: 'ইউজার যোগ',
    role: 'রোল',
    userRole: 'ইউজার',
    adminRole: 'অ্যাডমিন',
    active: 'সক্রিয়',
    inactive: 'নিষ্ক্রিয়',
    makeInactive: 'নিষ্ক্রিয় করুন',
    makeActive: 'সক্রিয় করুন',
    changeEmail: 'ইমেইল বদল',
    newEmail: 'নতুন ইমেইল',
    resetPassword: 'পাসওয়ার্ড রিসেট',
    addItem: 'আইটেম যোগ',
    itemName: 'আইটেমের নাম',
    remove: 'সরান',
    backupHelp: 'ব্যাকআপে পাসওয়ার্ড থাকে না। রিস্টোর করলে পুরনো পাসওয়ার্ড থাকবে, নতুন ইউজারের পাসওয়ার্ড শুরুরটা হবে।',
    download: 'ব্যাকআপ নামান',
    restore: 'ব্যাকআপ ফেরান',
    confirmRestore: 'বর্তমান খাতা এই ব্যাকআপ দিয়ে বদলে যাবে। চালিয়ে যাবেন?',
    yesRestore: 'হ্যাঁ, ফেরান',
    clearSamples: 'নমুনা এন্ট্রি মুছুন',
    confirmSamples: 'সব নমুনা এন্ট্রি মুছে ফেলবেন? আপনার নিজের এন্ট্রি থাকবে।',
    copy: 'কপি',
    copied: 'লিংক কপি হয়েছে',
    shareHelp: 'লিংক খুললে লগইনের পর সেই ব্রাঞ্চ বেছে থাকবে। অন্য ব্রাঞ্চের ইউজার নিজের খাতাই দেখবেন।',
    links: 'ব্রাঞ্চ লিংক',
    currentPassword: 'বর্তমান পাসওয়ার্ড',
    newPassword: 'নতুন পাসওয়ার্ড',
    savePassword: 'পাসওয়ার্ড রাখুন',
    welcome: 'খাতা খোলা হয়েছে',
    saved: 'রেকর্ড সংরক্ষণ হয়েছে',
    updated: 'রেকর্ড আপডেট হয়েছে',
    deleted: 'রেকর্ড মুছে ফেলা হয়েছে',
    dupChalan: 'এই চালান নম্বর এই ব্রাঞ্চে আগে আছে। তারপরও রাখবেন?',
    yesSave: 'হ্যাঁ, রাখুন',
    linkMismatch: 'এই লিংক {branch} ব্রাঞ্চের। আপনি {yours} ব্রাঞ্চে আছেন।',
    sample: 'নমুনা',
    edited: 'সংশোধিত',
    by: 'লিখেছেন',
    close: 'বন্ধ',
    footer: 'ডেটা এই সার্ভারে সংরক্ষিত',
    previewNote: 'GitHub প্রিভিউ: খাতা এই ব্রাউজারেই থাকে, সবার এক ডেটা নয়।',
    matrixHint: 'ঘরের সংখ্যা স্থিতি (পিস)। লাল মানে ঘাটতি, সোনালি মানে কম। চাপ দিলে সেই ব্রাঞ্চ খুলবে।',
    tempPassword: 'শুরুর পাসওয়ার্ড: {password}',
    removedSamples: '{n}টি নমুনা মুছেছে',
    network: 'সার্ভারে পৌঁছানো যায়নি',
    booting: 'খাতা খোলা হচ্ছে…'
  },
  en: {
    appName: 'Stock Register',
    org: 'Bandhu Kallyan Foundation',
    email: 'Email',
    password: 'Password',
    show: 'Show',
    hide: 'Hide',
    passwordHint: 'Not your Gmail password. Starting password',
    signIn: 'Log in',
    signingIn: 'Logging in…',
    signUp: 'Sign up',
    signUpTitle: 'Open a new branch',
    signingUp: 'Opening…',
    branchCode: 'Branch code',
    userName: 'User name',
    userId: 'User ID',
    emailAuto: 'Login email',
    emailAutoHint: 'The email is created from the user ID. That email is the login ID.',
    confirmPassword: 'Confirm password',
    signupHelp: 'Sign up to open a new branch and its user.',
    signedUp: 'New branch is open. Login email: {email}',
    needAccount: 'Opening a new branch?',
    haveAccount: 'Already have an account?',
    quick: 'Quick enter',
    adminQuick: 'Admin',
    logout: 'Sign out',
    lang: 'বাং',
    passwordBtn: 'Password',
    navStock: 'Stock',
    navEntry: 'Entry',
    navBook: 'Register',
    navReport: 'Report',
    navAdmin: 'Admin',
    morning: 'Good morning',
    noon: 'Good afternoon',
    evening: 'Good evening',
    night: 'Good night',
    allBranches: 'All branches',
    todayEntries: "Today's entries",
    lowStock: 'Low stock',
    shortStock: 'Short',
    itemCount: 'Items',
    searchItems: 'Search items',
    stockTitle: 'Stock report',
    stockHelp: 'Tap a row to open that item in the register.',
    status: 'Status',
    total: 'Total',
    serial: 'No.',
    inQty: 'In',
    outQty: 'Out',
    balance: 'On hand',
    pcs: 'pcs',
    inHand: 'In stock',
    low: 'Low',
    empty: 'Empty',
    short: 'Short',
    sampleNote: 'Some rows are samples. Admin → Backup can clear them.',
    dismiss: 'Got it',
    entryTitle: 'New entry',
    editTitle: 'Edit entry',
    entryHelp: 'For opening stock, put “Opening” in Received from. At least one quantity is required.',
    date: 'Date',
    srNo: 'SR No',
    branch: 'Branch',
    item: 'Item',
    pickItem: 'Choose an item',
    chalan: 'Chalan no.',
    fromWho: 'Received from',
    fromQty: 'Qty in',
    toWhom: 'Issued to',
    toQty: 'Qty out',
    receive: 'Received',
    issue: 'Issued',
    currentBal: 'Current balance',
    save: 'Save',
    saving: 'Saving…',
    update: 'Update',
    reset: 'Clear',
    cancelEdit: 'Cancel',
    bookTitle: 'Entry register',
    searchRecords: 'Search chalan, item, name',
    allItems: 'All items',
    fromDate: 'From',
    toDate: 'To',
    noRecords: 'No entries for this filter.',
    edit: 'Edit',
    delete: 'Delete',
    confirmDelete: 'Delete this entry?',
    yesDelete: 'Yes, delete',
    cancel: 'Cancel',
    reportTitle: 'Stock report',
    reportHelp: 'Opening is the balance before the start date. Closing = opening + in − out.',
    opening: 'Opening',
    received: 'In',
    issued: 'Out',
    closing: 'Closing',
    print: 'Print',
    export: 'Excel',
    noReport: 'No movement in this period.',
    prepared: 'Prepared by',
    checked: 'Checked by',
    manager: 'Branch manager',
    printedBy: 'Printed',
    adminTitle: 'Admin',
    tabBranches: 'Branches',
    tabUsers: 'Users',
    tabItems: 'Items',
    tabBackup: 'Backup',
    branchId: 'Branch ID',
    branchName: 'Branch name',
    addBranch: 'Add branch',
    addUser: 'Add user',
    role: 'Role',
    userRole: 'User',
    adminRole: 'Admin',
    active: 'Active',
    inactive: 'Inactive',
    makeInactive: 'Deactivate',
    makeActive: 'Activate',
    changeEmail: 'Change email',
    newEmail: 'New email',
    resetPassword: 'Reset password',
    addItem: 'Add item',
    itemName: 'Item name',
    remove: 'Remove',
    backupHelp: 'Backups do not include passwords. Restore keeps old passwords; new users get the starting password.',
    download: 'Download backup',
    restore: 'Restore backup',
    confirmRestore: 'This will replace the current register. Continue?',
    yesRestore: 'Yes, restore',
    clearSamples: 'Clear sample entries',
    confirmSamples: 'Delete all sample entries? Your own entries stay.',
    copy: 'Copy',
    copied: 'Link copied',
    shareHelp: 'Opening a link selects that branch after login. A user from another branch still sees only their own book.',
    links: 'Branch links',
    currentPassword: 'Current password',
    newPassword: 'New password',
    savePassword: 'Save password',
    welcome: 'Register opened',
    saved: 'Entry saved',
    updated: 'Entry updated',
    deleted: 'Entry deleted',
    dupChalan: 'This chalan number already exists in this branch. Save anyway?',
    yesSave: 'Yes, save',
    linkMismatch: 'This link is for {branch}. You are in {yours}.',
    sample: 'Sample',
    edited: 'Edited',
    by: 'By',
    close: 'Close',
    footer: 'Data is stored on this server',
    previewNote: 'GitHub preview: this book stays in this browser, not on a shared server.',
    matrixHint: 'Each number is stock on hand. Red is short, gold is low. Tap a cell to open that branch.',
    tempPassword: 'Starting password: {password}',
    removedSamples: 'Removed {n} samples',
    network: 'Could not reach the server',
    booting: 'Opening the register…'
  }
};

const ERR = {
  bn: {
    UNAUTHENTICATED: 'আবার প্রবেশ করুন।',
    NOT_ALLOWED: 'এই ইমেইল অনুমোদিত নয়। অ্যাডমিনকে বলুন।',
    BAD_PASSWORD: 'পাসওয়ার্ড মিলছে না।',
    INACTIVE: 'এই অ্যাকাউন্ট নিষ্ক্রিয়।',
    NO_BRANCH: 'আপনার ব্রাঞ্চ নির্ধারিত নেই।',
    BAD_ROLE: 'ইউজার রোল সঠিক নয়।',
    BRANCH_REQUIRED: 'ব্রাঞ্চ বেছে নিন।',
    OTHER_BRANCH: 'অন্য ব্রাঞ্চে এন্ট্রি করা যাবে না।',
    BRANCH_INACTIVE: 'ব্রাঞ্চ পাওয়া যায়নি বা সক্রিয় নয়।',
    NOT_FOUND: 'রেকর্ড পাওয়া যায়নি।',
    NOT_YOUR_BRANCH: 'এই রেকর্ড আপনার ব্রাঞ্চের নয়।',
    CANNOT_CHANGE_BRANCH: 'ব্রাঞ্চ বদলানো যাবে না।',
    NEED_QTY: 'গ্রহণ অথবা বিতরণ — অন্তত একটি পরিমাণ দিন।',
    NEED_ITEM: 'আইটেম বেছে নিন।',
    UNKNOWN_ITEM: 'এই আইটেম তালিকায় নেই। অ্যাডমিন যোগ করবেন।',
    BAD_DATE: 'তারিখ সঠিক নয়।',
    BAD_QTY: 'পরিমাণ সঠিক নয়।',
    NEGATIVE: 'পরিমাণ ঋণাত্মক হতে পারবে না।',
    BAD_BRANCH_ID: 'ব্রাঞ্চ আইডিতে শুধু A-Z, 0-9, _ বা - চলবে।',
    NEED_BRANCH: 'ব্রাঞ্চ আইডি ও নাম দিন।',
    BRANCH_EXISTS: 'এই ব্রাঞ্চ আইডি আগে থেকেই আছে।',
    BAD_EMAIL: 'সঠিক ইমেইল দিন।',
    USER_EXISTS: 'এই ইমেইল আগে থেকেই আছে।',
    CANNOT_EDIT_SUPER: 'সুপার অ্যাডমিন বদলানো যাবে না।',
    EMAIL_IN_USE: 'নতুন ইমেইল আগে থেকেই ব্যবহৃত।',
    ADMIN_ONLY: 'শুধু অ্যাডমিন এই কাজ করতে পারবেন।',
    SELF_STATUS: 'নিজেকে নিষ্ক্রিয় করা যাবে না।',
    ITEM_EXISTS: 'এই আইটেম আগে থেকেই আছে।',
    BAD_BACKUP: 'ব্যাকআপ ফাইল সঠিক নয়।',
    RESTORE_LOCKOUT: 'এই ব্যাকআপে আপনি অ্যাডমিন থাকবেন না, তাই ফেরানো হয়নি।',
    PASSWORD_SHORT: 'পাসওয়ার্ড অন্তত ৪ অক্ষরের হতে হবে।',
    PASSWORD_MISMATCH: 'পাসওয়ার্ড ও কনফার্ম পাসওয়ার্ড মিলছে না।',
    NEED_NAME: 'ইউজারের নাম দিন।',
    NEED_USER: 'ইউজার আইডি দিন। ইংরেজি অক্ষর বা সংখ্যা ব্যবহার করুন।',
    BAD_JSON: 'ডেটা পড়া যায়নি।',
    TOO_LARGE: 'ফাইল অনেক বড়।',
    SERVER: 'সার্ভারে সমস্যা হয়েছে।',
    NETWORK: 'সার্ভারে পৌঁছানো যায়নি।'
  },
  en: {
    UNAUTHENTICATED: 'Please sign in again.',
    NOT_ALLOWED: 'This email is not approved. Ask an admin.',
    BAD_PASSWORD: 'Password does not match.',
    INACTIVE: 'This account is inactive.',
    NO_BRANCH: 'No branch is assigned to you.',
    BAD_ROLE: 'User role is not valid.',
    BRANCH_REQUIRED: 'Choose a branch.',
    OTHER_BRANCH: 'You cannot post to another branch.',
    BRANCH_INACTIVE: 'Branch was not found or is inactive.',
    NOT_FOUND: 'Record was not found.',
    NOT_YOUR_BRANCH: 'This record is not from your branch.',
    CANNOT_CHANGE_BRANCH: 'Branch cannot be changed.',
    NEED_QTY: 'Enter a received or issued quantity.',
    NEED_ITEM: 'Choose an item.',
    UNKNOWN_ITEM: 'This item is not on the list. An admin must add it.',
    BAD_DATE: 'Date is not valid.',
    BAD_QTY: 'Quantity is not valid.',
    NEGATIVE: 'Quantity cannot be negative.',
    BAD_BRANCH_ID: 'Branch ID may use only A-Z, 0-9, _ or -.',
    NEED_BRANCH: 'Enter a branch ID and name.',
    BRANCH_EXISTS: 'This branch ID already exists.',
    BAD_EMAIL: 'Enter a valid email.',
    USER_EXISTS: 'This email is already on the list.',
    CANNOT_EDIT_SUPER: 'The super admin cannot be changed.',
    EMAIL_IN_USE: 'That new email is already used.',
    ADMIN_ONLY: 'Only an admin can do this.',
    SELF_STATUS: 'You cannot deactivate yourself.',
    ITEM_EXISTS: 'This item already exists.',
    BAD_BACKUP: 'Backup file is not valid.',
    RESTORE_LOCKOUT: 'Restore stopped so you would not lock yourself out.',
    PASSWORD_SHORT: 'Password must be at least 4 characters.',
    PASSWORD_MISMATCH: 'Password and confirm password do not match.',
    NEED_NAME: 'Enter the user name.',
    NEED_USER: 'Enter a user ID using English letters or numbers.',
    BAD_JSON: 'Could not read the data.',
    TOO_LARGE: 'File is too large.',
    SERVER: 'Something went wrong on the server.',
    NETWORK: 'Could not reach the server.'
  }
};

const params = new URLSearchParams(location.search);
const state = {
  lang: localStorage.getItem('bims_lang') || 'bn',
  token: sessionStorage.getItem('bims_token') || '',
  authScreen: location.hash === '#signup' ? 'signup' : 'login',
  user: null,
  branches: [],
  users: [],
  items: [],
  records: [],
  view: 'stock',
  adminTab: 'branches',
  branchFilter: '',
  linkBranch: (params.get('branch') || '').trim().toUpperCase(),
  linkApplied: false,
  pendingNote: '',
  hideSampleNote: sessionStorage.getItem('bims_hide_sample') === '1',
  stockQ: '',
  stockItem: '',
  regQ: '',
  regItem: '',
  regFrom: '',
  regTo: '',
  repFrom: '',
  repTo: '',
  draft: null,
  modal: null
};

function t(key) {
  return (I18N[state.lang] && I18N[state.lang][key]) || I18N.bn[key] || key;
}
function tFill(key, vars) {
  return t(key).replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? '');
}
function tErr(code) {
  const bag = ERR[state.lang] || ERR.bn;
  return bag[code] || ERR.bn[code] || code;
}
function esc(value) {
  return String(value ?? '').replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}
function todayISO() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Dhaka', year: 'numeric', month: '2-digit', day: '2-digit'
  }).format(new Date());
}
function dhakaHour() {
  return Number(new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Dhaka', hour: '2-digit', hourCycle: 'h23'
  }).format(new Date()));
}
function greeting() {
  const h = dhakaHour();
  if (h < 12) return t('morning');
  if (h < 17) return t('noon');
  if (h < 20) return t('evening');
  return t('night');
}
function formatDate(iso) {
  const s = String(iso || '').slice(0, 10);
  const parts = s.split('-');
  if (parts.length !== 3) return s;
  const month = state.lang === 'bn' ? MONTHS_BN[+parts[1] - 1] : MONTHS_EN[+parts[1] - 1];
  return (+parts[2]) + ' ' + (month || parts[1]) + ' ' + parts[0];
}
function num(n) {
  const v = Number(n) || 0;
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 3 }).format(v);
}
function branchLabel(id) {
  const live = state.branches.find(b => b.id === id);
  const known = BRANCH_STATIC[id];
  if (state.lang === 'bn') return (known && known.bn) || (live && live.name) || id;
  return (live && live.name) || (known && known.en) || id;
}
function itemLabel(name) {
  if (state.lang === 'bn') return ITEM_BN[name] || name;
  return ITEM_EN[name] || name;
}
function itemSub(name) {
  if (state.lang === 'bn') return ITEM_EN[name] && ITEM_EN[name] !== itemLabel(name) ? ITEM_EN[name] : '';
  const bn = ITEM_BN[name] || (ITEM_EN[name] ? name : '');
  return bn && bn !== itemLabel(name) ? bn : '';
}
function isAdmin() {
  return state.user && state.user.role === 'Admin';
}
function effectiveBranch() {
  if (!state.user) return '';
  if (!isAdmin()) return state.user.branchId;
  return state.branchFilter || '';
}
function orderedItems() {
  const extras = [];
  const seen = new Set(state.items);
  state.records.forEach(r => {
    if (r.itemName && !seen.has(r.itemName)) {
      seen.add(r.itemName);
      extras.push(r.itemName);
    }
  });
  return state.items.concat(extras);
}
function nextSr(branchId) {
  const nums = state.records
    .filter(r => r.branchId === branchId)
    .map(r => parseInt(r.srNo, 10))
    .filter(n => !Number.isNaN(n));
  return String((nums.length ? Math.max.apply(null, nums) : 0) + 1);
}
function blankDraft() {
  const branch = isAdmin()
    ? (state.branchFilter || state.linkBranch || (state.user && state.user.branchId) || '')
    : (state.user ? state.user.branchId : '');
  return {
    id: '',
    branchId: branch,
    srNo: nextSr(branch),
    date: todayISO(),
    itemName: '',
    chalanNo: '',
    fromVal: '',
    fromAmt: '',
    saleVal: '',
    saleAmt: ''
  };
}
function captureDraft() {
  const form = document.getElementById('entry-form');
  if (!form) return;
  state.draft = Object.fromEntries(new FormData(form).entries());
}
function stockMap(branchId) {
  const map = {};
  orderedItems().forEach(item => {
    map[item] = { item, inn: 0, out: 0, bal: 0 };
  });
  state.records.forEach(r => {
    if (branchId && r.branchId !== branchId) return;
    if (!map[r.itemName]) map[r.itemName] = { item: r.itemName, inn: 0, out: 0, bal: 0 };
    map[r.itemName].inn += Number(r.fromAmt) || 0;
    map[r.itemName].out += Number(r.saleAmt) || 0;
  });
  Object.keys(map).forEach(k => {
    map[k].bal = map[k].inn - map[k].out;
  });
  return map;
}
function balanceOf(branchId, item) {
  let bal = 0;
  state.records.forEach(r => {
    if (r.branchId === branchId && r.itemName === item) {
      bal += (Number(r.fromAmt) || 0) - (Number(r.saleAmt) || 0);
    }
  });
  return bal;
}
function pressureCounts(branchId) {
  const branches = branchId
    ? state.branches.filter(b => b.id === branchId)
    : state.branches.filter(b => String(b.status).toLowerCase() === 'active');
  let low = 0;
  let short = 0;
  branches.forEach(b => {
    const map = stockMap(b.id);
    Object.keys(map).forEach(item => {
      const bal = map[item].bal;
      if (bal < 0) short += 1;
      else if (bal > 0 && bal <= 5) low += 1;
    });
  });
  return { low, short };
}
function tone(bal) {
  if (bal < 0) return 'short';
  if (bal === 0) return 'empty';
  if (bal <= 5) return 'low';
  return 'ok';
}

function icon(name) {
  const paths = {
    stock: '<path d="M3 7.5 12 3l9 4.5-9 4.5L3 7.5Z"/><path d="M3 12l9 4.5 9-4.5"/><path d="M3 16.5 12 21l9-4.5"/>',
    entry: '<path d="M12 5v14M5 12h14"/>',
    book: '<path d="M5 4.5h11a3 3 0 0 1 3 3V20H8a3 3 0 0 0-3 3V4.5Z"/><path d="M5 4.5A3 3 0 0 1 8 7.5h11"/>',
    report: '<path d="M4 19V5M4 19h16"/><path d="M8 15v-4M12 15V8M16 15v-6"/>',
    admin: '<path d="M12 3 5 6v6c0 4.2 2.8 7.2 7 8.5 4.2-1.3 7-4.3 7-8.5V6l-7-3Z"/>'
  };
  return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (paths[name] || '') + '</svg>';
}

async function api(path, options) {
  if (await shouldUseLocal()) {
    try {
      return await globalThis.bimsLocal(path, options || {}, state.token);
    } catch (err) {
      if (err && err.message === 'UNAUTHENTICATED') {
        state.token = '';
        sessionStorage.removeItem('bims_token');
        showLogin();
      }
      throw err;
    }
  }
  const opts = options || {};
  let res;
  try {
    res = await fetch(path, {
      method: opts.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(state.token ? { Authorization: 'Bearer ' + state.token } : {})
      },
      body: opts.body ? JSON.stringify(opts.body) : undefined
    });
  } catch {
    throw new Error('NETWORK');
  }
  const data = await res.json().catch(() => ({ ok: false, error: 'BAD_JSON' }));
  if (res.status === 401) {
    state.token = '';
    sessionStorage.removeItem('bims_token');
    showLogin();
    throw new Error(data.error || 'UNAUTHENTICATED');
  }
  if (!res.ok || data.ok === false) throw new Error(data.error || 'SERVER');
  return data;
}

async function refresh() {
  const data = await api('/api/app');
  state.user = {
    email: data.userEmail,
    role: data.userRole,
    branchId: data.userBranchId,
    branchName: data.userBranchName
  };
  state.branches = data.branches || [];
  state.users = data.users || [];
  state.items = data.items || [];
  state.records = data.records || [];
  if (!isAdmin()) state.branchFilter = state.user.branchId;
  if (!state.repFrom) {
    state.repFrom = todayISO().slice(0, 8) + '01';
    state.repTo = todayISO();
  }
  applyLinkBranch();
}

function applyLinkBranch() {
  if (!state.linkBranch || state.linkApplied) return;
  state.linkApplied = true;
  if (isAdmin()) {
    if (state.branches.some(b => b.id === state.linkBranch)) state.branchFilter = state.linkBranch;
  } else if (state.linkBranch !== state.user.branchId) {
    state.pendingNote = tFill('linkMismatch', {
      branch: branchLabel(state.linkBranch),
      yours: branchLabel(state.user.branchId)
    });
  }
}

function toast(text, kind) {
  const el = document.createElement('div');
  el.className = 'toast' + (kind === 'err' ? ' err' : '');
  el.textContent = text;
  document.getElementById('toasts').appendChild(el);
  setTimeout(() => el.remove(), 3400);
}

function openModal(opts) {
  state.modal = opts;
  renderModal();
  const input = document.querySelector('#modal-root input, #modal-root button');
  if (input) input.focus();
}
function closeModal() {
  state.modal = null;
  renderModal();
}
function renderModal() {
  const root = document.getElementById('modal-root');
  if (!state.modal) {
    root.innerHTML = '';
    return;
  }
  const m = state.modal;
  root.innerHTML =
    '<div class="modal-back">' +
      '<div class="modal" role="dialog" aria-modal="true">' +
        '<h3>' + esc(m.title) + '</h3>' +
        (m.text ? '<p>' + esc(m.text) + '</p>' : '') +
        (m.html || '') +
        '<div class="actions">' +
          '<button type="button" class="btn ghost" data-action="close-modal">' + esc(t('cancel')) + '</button>' +
          '<button type="button" class="btn ' + (m.danger ? 'danger' : '') + '" data-action="confirm-modal">' + esc(m.confirmText || t('save')) + '</button>' +
        '</div>' +
      '</div>' +
    '</div>';
}

function previewSignupEmail(userId, branchCode) {
  const raw = String(userId || '').trim().toLowerCase();
  if (/^\S+@\S+\.\S+$/.test(raw)) return raw;
  const slug = raw.replace(/[^a-z0-9]/g, '');
  const digits = String(branchCode || '').replace(/\D/g, '');
  if (!slug) return '';
  return 'bkf' + slug + digits + '@gmail.com';
}

function bindSignupPreview() {
  const form = document.getElementById('signup-form');
  if (!form) return;
  const paint = () => {
    const el = document.getElementById('signup-email');
    if (!el) return;
    el.textContent = previewSignupEmail(form.userId.value, form.branchCode.value) || '—';
  };
  form.userId.addEventListener('input', paint);
  form.branchCode.addEventListener('input', paint);
  paint();
}

function showLogin() {
  document.getElementById('app').classList.add('hidden');
  const root = document.getElementById('login');
  root.classList.remove('hidden');
  const remembered = localStorage.getItem('bims_email') || '';
  const brand =
    '<section class="brand-panel">' +
      '<div>' +
        '<div class="brand-mark">' +
          '<img src="logo.jpg" alt="' + esc(t('org')) + '">' +
          '<div><p class="eyebrow">BIMS · Bandhu Kallyan Foundation</p><strong>' + esc(t('org')) + '</strong></div>' +
        '</div>' +
        '<h1>' + esc(t('appName')) + '</h1>' +
        '<ul class="stamps"><li><b>B014</b>' + esc(branchLabel('B014')) + '</li></ul>' +
      '</div>' +
      '<p class="brand-foot">Branch Item Management · ' + esc(t('footer')) + '</p>' +
    '</section>';
  const langBtn = '<div class="actions"><button type="button" class="btn ghost small" data-action="lang">' + esc(t('lang')) + '</button></div>';
  const card = state.authScreen === 'signup'
    ? '<form class="login-card signup-card" id="signup-form" autocomplete="off">' +
        '<p class="eyebrow">BIMS</p>' +
        '<h1>' + esc(t('signUpTitle')) + '</h1>' +
        '<p class="hint">' + esc(t('signupHelp')) + '</p>' +
        '<label for="branchName">' + esc(t('branchName')) + '</label>' +
        '<input id="branchName" name="branchName" required maxlength="80">' +
        '<label for="branchCode">' + esc(t('branchCode')) + '</label>' +
        '<input id="branchCode" name="branchCode" required maxlength="40" autocapitalize="characters" placeholder="B021">' +
        '<label for="userName">' + esc(t('userName')) + '</label>' +
        '<input id="userName" name="userName" required maxlength="80">' +
        '<label for="userId">' + esc(t('userId')) + '</label>' +
        '<input id="userId" name="userId" required maxlength="60" autocapitalize="none" placeholder="narail">' +
        '<p class="hint">' + esc(t('emailAuto')) + ': <code id="signup-email">—</code></p>' +
        '<p class="hint">' + esc(t('emailAutoHint')) + '</p>' +
        '<label for="signup-password">' + esc(t('password')) + '</label>' +
        '<input id="signup-password" name="password" type="password" autocomplete="new-password" required minlength="4">' +
        '<label for="confirmPassword">' + esc(t('confirmPassword')) + '</label>' +
        '<input id="confirmPassword" name="confirmPassword" type="password" autocomplete="new-password" required minlength="4">' +
        '<p class="form-error" id="signup-error"></p>' +
        '<button class="btn block" type="submit">' + esc(t('signUp')) + '</button>' +
        '<p class="auth-switch">' + esc(t('haveAccount')) + '</p>' +
        '<button class="btn block ghost" type="button" data-action="goto-login">' + esc(t('signIn')) + '</button>' +
        langBtn +
      '</form>'
    : '<form class="login-card" id="login-form" autocomplete="on">' +
        '<p class="eyebrow">BIMS</p>' +
        '<h1>' + esc(t('appName')) + '</h1>' +
        '<p class="org">' + esc(t('org')) + '</p>' +
        '<label for="email">' + esc(t('email')) + '</label>' +
        '<input id="email" name="email" type="email" autocomplete="username" required value="' + esc(remembered) + '">' +
        '<label for="password">' + esc(t('password')) + '</label>' +
        '<div class="pass-row">' +
          '<input id="password" name="password" type="password" autocomplete="current-password" required value="">' +
          '<button type="button" class="pass-toggle" data-action="toggle-pass">' + esc(t('show')) + '</button>' +
        '</div>' +
        '<p class="form-error" id="login-error"></p>' +
        '<button class="btn block" type="submit">' + esc(t('signIn')) + '</button>' +
        '<p class="auth-switch">' + esc(t('needAccount')) + '</p>' +
        '<button class="btn block ghost" type="button" data-action="goto-signup">' + esc(t('signUp')) + '</button>' +
        langBtn +
      '</form>';
  root.innerHTML =
    '<div class="login-wrap">' + brand +
      '<section class="login-side"><div class="login-stack">' + card + '</div></section>' +
    '</div>';
  if (state.authScreen === 'signup') bindSignupPreview();
  document.documentElement.lang = state.lang === 'bn' ? 'bn' : 'en';
  document.title = (state.authScreen === 'signup' ? t('signUp') : t('appName')) + ' · BIMS';
}

function showApp() {
  document.getElementById('login').classList.add('hidden');
  document.getElementById('app').classList.remove('hidden');
  renderShell();
  renderView();
}

function navButtons(extraClass) {
  const items = [
    ['stock', 'stock', 'navStock'],
    ['entry', 'entry', 'navEntry'],
    ['book', 'book', 'navBook'],
    ['report', 'report', 'navReport']
  ];
  if (isAdmin()) items.push(['admin', 'admin', 'navAdmin']);
  return items.map(item =>
    '<button type="button" class="' + extraClass + (state.view === item[0] ? ' active' : '') + '" data-action="nav" data-view="' + item[0] + '" aria-current="' + (state.view === item[0] ? 'page' : 'false') + '">' +
      icon(item[1]) + '<span>' + esc(t(item[2])) + '</span></button>'
  ).join('');
}

function renderShell() {
  const titles = { stock: 'navStock', entry: 'navEntry', book: 'navBook', report: 'navReport', admin: 'navAdmin' };
  const branchSelect = isAdmin()
    ? '<select id="branch-switch" aria-label="' + esc(t('branch')) + '">' +
        '<option value="">' + esc(t('allBranches')) + '</option>' +
        state.branches.map(b => '<option value="' + esc(b.id) + '"' + (state.branchFilter === b.id ? ' selected' : '') + '>' + esc(branchLabel(b.id)) + ' · ' + esc(b.id) + '</option>').join('') +
      '</select>'
    : '<span class="badge">' + esc(branchLabel(state.user.branchId)) + ' · ' + esc(state.user.branchId) + '</span>';
  document.getElementById('app').innerHTML =
    '<div class="app-shell">' +
      '<aside class="side">' +
        '<div class="side-brand"><img src="logo.jpg" alt=""><div><p class="eyebrow">BIMS</p><strong>' + esc(t('appName')) + '</strong><span>' + esc(t('org')) + '</span></div></div>' +
        '<nav>' + navButtons('nav-btn') + '</nav>' +
        '<div class="side-user"><b>' + esc(branchLabel(state.user.branchId)) + '</b><span>' + esc(state.user.email) + '</span><div class="actions"><button type="button" class="btn ghost small" data-action="logout">' + esc(t('logout')) + '</button></div></div>' +
      '</aside>' +
      '<div class="main">' +
        '<header class="topbar">' +
          '<div><h2>' + esc(t(titles[state.view] || 'navStock')) + '</h2>' +
            (isBrowserBook() ? '<p class="preview-note">' + esc(t('previewNote')) + '</p>' : '') +
          '</div>' +
          '<div class="top-actions">' +
            branchSelect +
            '<button type="button" class="btn ghost small" data-action="lang">' + esc(t('lang')) + '</button>' +
            '<button type="button" class="btn ghost small" data-action="password">' + esc(t('passwordBtn')) + '</button>' +
            '<button type="button" class="btn ghost small" data-action="logout">' + esc(t('logout')) + '</button>' +
          '</div>' +
        '</header>' +
        '<div id="view"></div>' +
      '</div>' +
      '<nav class="bottom-nav">' + navButtons('') + '</nav>' +
    '</div>';
  document.documentElement.lang = state.lang === 'bn' ? 'bn' : 'en';
  document.title = t('appName') + ' · BIMS';
}

function renderView() {
  const active = document.activeElement;
  const focus = active && active.id ? { id: active.id, start: active.selectionStart, end: active.selectionEnd } : null;
  const root = document.getElementById('view');
  if (!root) return;
  const views = { stock: viewStock, entry: viewEntry, book: viewBook, report: viewReport, admin: viewAdmin };
  root.innerHTML = (views[state.view] || viewStock)();
  if (state.view === 'entry') updateLiveBalance();
  if (focus) {
    const el = document.getElementById(focus.id);
    if (el) {
      el.focus();
      if (focus.start != null && el.setSelectionRange) {
        try { el.setSelectionRange(focus.start, focus.end); } catch (e) { /* date inputs */ }
      }
    }
  }
}

function stockReportRows() {
  const branch = effectiveBranch();
  const branches = branch
    ? state.branches.filter(b => b.id === branch)
    : state.branches.filter(b => String(b.status).toLowerCase() === 'active');
  const q = state.stockQ.trim().toLowerCase();
  const rows = [];
  branches.forEach(b => {
    const map = stockMap(b.id);
    orderedItems().forEach(item => {
      const x = map[item];
      if (!x) return;
      if (state.stockItem && item !== state.stockItem) return;
      const blob = (item + ' ' + itemLabel(item) + ' ' + itemSub(item) + ' ' + branchLabel(b.id) + ' ' + b.id).toLowerCase();
      if (q && !blob.includes(q)) return;
      rows.push({ branchId: b.id, item, inn: x.inn, out: x.out, bal: x.bal });
    });
  });
  return rows;
}

function viewStock() {
  const branch = effectiveBranch();
  const today = todayISO();
  const scoped = state.records.filter(r => !branch || r.branchId === branch);
  const todayCount = scoped.filter(r => r.date === today).length;
  const pressure = pressureCounts(branch);
  const rows = stockReportRows();
  const showBranch = !branch;
  const branchName = branch ? branchLabel(branch) : t('allBranches');
  const itemOptions = '<option value="">' + esc(t('allItems')) + '</option>' + orderedItems().map(item =>
    '<option value="' + esc(item) + '"' + (state.stockItem === item ? ' selected' : '') + '>' + esc(itemLabel(item)) + '</option>'
  ).join('');
  let inn = 0;
  let out = 0;
  let bal = 0;
  const body = rows.map((r, i) => {
    inn += r.inn;
    out += r.out;
    bal += r.bal;
    const kind = tone(r.bal);
    const tagKey = kind === 'ok' ? 'inHand' : kind;
    return '<tr class="is-' + kind + '">' +
      '<td class="num">' + (i + 1) + '</td>' +
      (showBranch ? '<td class="left">' + esc(branchLabel(r.branchId)) + '<div class="who num">' + esc(r.branchId) + '</div></td>' : '') +
      '<td class="left"><button type="button" class="linkish" data-action="open-item" data-item="' + esc(r.item) + '"><b>' + esc(itemLabel(r.item)) + '</b></button>' +
        (itemSub(r.item) ? '<div class="who">' + esc(itemSub(r.item)) + '</div>' : '') + '</td>' +
      '<td class="num">' + num(r.inn) + '</td>' +
      '<td class="num">' + num(r.out) + '</td>' +
      '<td class="num ' + (r.bal < 0 ? 'neg' : (r.bal > 0 && r.bal <= 5 ? 'low' : '')) + '">' + num(r.bal) + '</td>' +
      '<td class="status-cell"><span class="tag ' + kind + '">' + esc(t(tagKey)) + '</span></td>' +
    '</tr>';
  }).join('');
  const totalRow = rows.length
    ? '<tr class="total-row"><td></td>' +
        (showBranch ? '<td></td>' : '') +
        '<td class="left"><b>' + esc(t('total')) + '</b></td>' +
        '<td class="num">' + num(inn) + '</td>' +
        '<td class="num">' + num(out) + '</td>' +
        '<td class="num ' + (bal < 0 ? 'neg' : '') + '">' + num(bal) + '</td>' +
        '<td></td></tr>'
    : '';
  const note = !state.hideSampleNote && scoped.some(r => r.sample)
    ? '<div class="banner no-print"><span>' + esc(t('sampleNote')) + '</span><button type="button" class="btn tiny ghost" data-action="dismiss-sample">' + esc(t('dismiss')) + '</button></div>'
    : '';
  const mismatch = state.pendingNote
    ? '<div class="banner no-print"><span>' + esc(state.pendingNote) + '</span><button type="button" class="btn tiny ghost" data-action="dismiss-note">' + esc(t('dismiss')) + '</button></div>'
    : '';
  const summary = t('todayEntries') + ' ' + num(todayCount) + ' · ' + t('lowStock') + ' ' + num(pressure.low) + ' · ' + t('shortStock') + ' ' + num(pressure.short) + ' · ' + t('itemCount') + ' ' + num(rows.length);
  return mismatch + note +
    '<section class="panel" id="print-area">' +
      '<div class="print-head">' +
        '<p class="eyebrow">BIMS</p><h1>' + esc(t('org')) + '</h1>' +
        '<p>' + esc(t('stockTitle')) + ' · ' + esc(branchName) + '</p>' +
        '<p>' + esc(formatDate(today)) + '</p>' +
        '<p>' + esc(t('printedBy')) + ': ' + esc(state.user.email) + '</p>' +
      '</div>' +
      '<div class="view-head no-print"><div><h2 class="sheet-title">' + esc(t('stockTitle')) + '</h2>' +
        '<p class="muted">' + esc(greeting()) + ', ' + esc(whoName()) + ' · ' + esc(branchName) + '</p>' +
        '<p class="muted">' + esc(summary) + '</p></div>' +
        '<div class="actions"><button type="button" class="btn ghost small" data-action="print">' + esc(t('print')) + '</button>' +
        '<button type="button" class="btn ghost small" data-action="export-stock">' + esc(t('export')) + '</button></div></div>' +
      '<div class="filters stock-filters no-print">' +
        '<select id="stock-item" aria-label="' + esc(t('item')) + '">' + itemOptions + '</select>' +
        '<input id="stock-q" placeholder="' + esc(t('searchItems')) + '" value="' + esc(state.stockQ) + '">' +
      '</div>' +
      (rows.length
        ? '<div class="table-wrap"><table class="stock-table"><thead><tr>' +
            '<th>' + esc(t('serial')) + '</th>' +
            (showBranch ? '<th class="left">' + esc(t('branch')) + '</th>' : '') +
            '<th class="left">' + esc(t('item')) + '</th>' +
            '<th>' + esc(t('inQty')) + '</th><th>' + esc(t('outQty')) + '</th><th>' + esc(t('balance')) + '</th><th>' + esc(t('status')) + '</th>' +
          '</tr></thead><tbody>' + body + totalRow + '</tbody></table></div>'
        : '<p class="empty">' + esc(t('noRecords')) + '</p>') +
      '<p class="hint no-print">' + esc(t('stockHelp')) + '</p>' +
    '</section>';
}

function whoName() {
  const email = state.user.email || '';
  return email.split('@')[0];
}
function stat(label, value, cls) {
  return '<article class="stat ' + cls + '"><span>' + esc(label) + '</span><strong class="num">' + num(value) + '</strong></article>';
}
function cardHtml(x) {
  const kind = tone(x.bal);
  const tagKey = kind === 'ok' ? 'inHand' : kind;
  return '<button type="button" class="item-card is-' + kind + '" data-action="open-item" data-item="' + esc(x.item) + '">' +
    '<div class="item-kicker"><span>' + esc(t('balance')) + '</span><span class="tag ' + kind + '">' + esc(t(tagKey)) + '</span></div>' +
    '<h3>' + esc(itemLabel(x.item)) + '</h3>' +
    '<div class="sub">' + esc(itemSub(x.item)) + '</div>' +
    '<div class="bal-row"><strong>' + num(x.bal) + '</strong><span class="muted">' + esc(t('pcs')) + '</span></div>' +
    '<div class="split"><span>' + esc(t('inQty')) + ' <b class="num">' + num(x.inn) + '</b></span><span>' + esc(t('outQty')) + ' <b class="num">' + num(x.out) + '</b></span></div>' +
  '</button>';
}
function matrixHtml() {
  const items = orderedItems();
  const branches = state.branches.filter(b => String(b.status).toLowerCase() === 'active');
  const head = branches.map(b => '<th>' + esc(branchLabel(b.id)) + '<br><span class="num">' + esc(b.id) + '</span></th>').join('');
  const rows = items.map(item => {
    const cells = branches.map(b => {
      const bal = balanceOf(b.id, item);
      const kind = bal < 0 ? 'neg' : (bal > 0 && bal <= 5 ? 'low' : '');
      return '<td class="' + kind + '"><button type="button" class="linkish" data-action="pick-branch" data-branch="' + esc(b.id) + '">' + num(bal) + '</button></td>';
    }).join('');
    return '<tr><td class="left"><b>' + esc(itemLabel(item)) + '</b><div class="who">' + esc(itemSub(item)) + '</div></td>' + cells + '</tr>';
  }).join('');
  return '<div class="table-wrap"><table class="matrix"><thead><tr><th class="left">' + esc(t('item')) + '</th>' + head + '</tr></thead><tbody>' + rows + '</tbody></table></div>';
}

function viewEntry() {
  if (!state.draft) state.draft = blankDraft();
  const d = state.draft;
  const editing = !!d.id;
  const itemOptions = ['<option value="">' + esc(t('pickItem')) + '</option>'].concat(orderedItems().map(item =>
    '<option value="' + esc(item) + '"' + (d.itemName === item ? ' selected' : '') + '>' + esc(itemLabel(item)) + '</option>'
  )).join('');
  const lists = datalists();
  return '<section class="panel">' +
    '<div class="view-head"><div><h2 class="sheet-title">' + esc(editing ? t('editTitle') : t('entryTitle')) + '</h2></div></div>' +
    (editing ? '<div class="edit-flag">' + esc(t('editTitle')) + ' · <span class="num">' + esc(d.id) + '</span></div>' : '') +
    '<form id="entry-form" autocomplete="off">' +
      '<input type="hidden" name="id" value="' + esc(d.id || '') + '">' +
      '<input type="hidden" name="branchId" value="' + esc(d.branchId || '') + '">' +
      '<input type="hidden" name="srNo" value="' + esc(d.srNo || '') + '">' +
      '<div class="entry-pairs">' +
        field(t('item'), '<select name="itemName" id="item-select" required>' + itemOptions + '</select>') +
        field(t('date'), '<input type="date" name="date" required value="' + esc(d.date || '') + '">') +
        field(t('chalan'), '<input name="chalanNo" value="' + esc(d.chalanNo || '') + '" placeholder="HO-0912">') +
        '<label>' + esc(t('currentBal')) + '<div class="live-bal" id="live-balance"><strong>—</strong></div></label>' +
        field(t('fromWho'), '<input name="fromVal" list="from-list" value="' + esc(d.fromVal || '') + '" placeholder="' + esc(state.lang === 'bn' ? 'হেড অফিস / প্রারম্ভিক স্থিতি' : 'Head office / Opening') + '">') +
        field(t('fromQty'), '<input name="fromAmt" type="number" min="0" step="any" inputmode="decimal" value="' + esc(d.fromAmt || '') + '">') +
        field(t('toWhom'), '<input name="saleVal" list="sale-list" value="' + esc(d.saleVal || '') + '" placeholder="' + esc(state.lang === 'bn' ? 'কেন্দ্র / ফিল্ড অফিসার' : 'Center / Field officer') + '">') +
        field(t('toQty'), '<input name="saleAmt" type="number" min="0" step="any" inputmode="decimal" value="' + esc(d.saleAmt || '') + '">') +
      '</div>' +
      lists +
      '<p class="form-error" id="form-error"></p>' +
      '<div class="actions">' +
        '<button class="btn" type="submit">' + esc(editing ? t('update') : t('save')) + '</button>' +
        '<button class="btn ghost" type="button" data-action="reset-entry">' + esc(editing ? t('cancelEdit') : t('reset')) + '</button>' +
      '</div>' +
    '</form></section>' + entryTable();
}

function entryTable() {
  const rows = filteredRecords();
  const showBranch = !effectiveBranch();
  const itemOptions = '<option value="">' + esc(t('allItems')) + '</option>' + orderedItems().map(item =>
    '<option value="' + esc(item) + '"' + (state.regItem === item ? ' selected' : '') + '>' + esc(itemLabel(item)) + '</option>'
  ).join('');
  const body = rows.map(r =>
    '<tr>' +
      '<td class="left">' + esc(formatDate(r.date)) + '</td>' +
      (showBranch ? '<td class="left">' + esc(branchLabel(r.branchId)) + '</td>' : '') +
      '<td class="left">' + esc(itemLabel(r.itemName)) + '</td>' +
      '<td class="num">' + esc(r.chalanNo || '—') + '</td>' +
      '<td class="left">' + esc(r.fromVal || '—') + '</td>' +
      '<td class="num qty-in">' + (r.fromAmt ? num(r.fromAmt) : '—') + '</td>' +
      '<td class="left">' + esc(r.saleVal || '—') + '</td>' +
      '<td class="num qty-out">' + (r.saleAmt ? num(r.saleAmt) : '—') + '</td>' +
      '<td class="row-actions">' +
        '<button type="button" class="btn tiny ghost" data-action="edit" data-id="' + esc(r.id) + '">' + esc(t('edit')) + '</button>' +
        '<button type="button" class="btn tiny danger" data-action="delete" data-id="' + esc(r.id) + '">' + esc(t('delete')) + '</button>' +
      '</td>' +
    '</tr>'
  ).join('');
  return '<section class="panel">' +
    '<div class="entry-filters">' +
      '<label>' + esc(t('fromDate')) + '<input id="reg-from" type="date" value="' + esc(state.regFrom) + '"></label>' +
      '<label>' + esc(t('toDate')) + '<input id="reg-to" type="date" value="' + esc(state.regTo) + '"></label>' +
      '<label>' + esc(t('item')) + '<select id="reg-item">' + itemOptions + '</select></label>' +
    '</div>' +
    (rows.length
      ? '<div class="table-wrap"><table class="entry-table"><thead><tr>' +
          '<th class="left">' + esc(t('date')) + '</th>' +
          (showBranch ? '<th class="left">' + esc(t('branch')) + '</th>' : '') +
          '<th class="left">' + esc(t('item')) + '</th>' +
          '<th>' + esc(t('chalan')) + '</th>' +
          '<th class="left">' + esc(t('fromWho')) + '</th>' +
          '<th>' + esc(t('fromQty')) + '</th>' +
          '<th class="left">' + esc(t('toWhom')) + '</th>' +
          '<th>' + esc(t('toQty')) + '</th>' +
          '<th></th>' +
        '</tr></thead><tbody>' + body + '</tbody></table></div>'
      : '<p class="empty">' + esc(t('noRecords')) + '</p>') +
  '</section>';
}

function field(label, control) {
  return '<label>' + esc(label) + control + '</label>';
}
function datalists() {
  const from = uniqueValues('fromVal');
  const sale = uniqueValues('saleVal');
  ['হেড অফিস', 'প্রারম্ভিক স্থিতি', 'Head office', 'Opening'].forEach(v => { if (!from.includes(v)) from.push(v); });
  ['কেন্দ্র', 'ফিল্ড অফিসার', 'স্টাফ', 'Center', 'Field officer'].forEach(v => { if (!sale.includes(v)) sale.push(v); });
  return '<datalist id="from-list">' + from.map(v => '<option value="' + esc(v) + '">').join('') + '</datalist>' +
    '<datalist id="sale-list">' + sale.map(v => '<option value="' + esc(v) + '">').join('') + '</datalist>';
}
function uniqueValues(key) {
  const branch = (state.draft && state.draft.branchId) || effectiveBranch();
  const set = [];
  state.records.forEach(r => {
    if (branch && r.branchId !== branch) return;
    const v = r[key];
    if (v && !set.includes(v)) set.push(v);
  });
  return set.slice(0, 20);
}
function updateLiveBalance() {
  const el = document.getElementById('live-balance');
  if (!el) return;
  const item = (document.querySelector('[name=itemName]') || {}).value || '';
  const branch = (document.querySelector('[name=branchId]') || {}).value || '';
  const strong = el.querySelector('strong');
  if (!item || !branch) {
    strong.textContent = '—';
    return;
  }
  const bal = balanceOf(branch, item);
  strong.textContent = num(bal) + ' ' + t('pcs');
  strong.className = 'num ' + (bal < 0 ? 'neg' : bal <= 5 ? 'low' : '');
}

function filteredRecords() {
  const branch = effectiveBranch();
  const q = state.regQ.trim().toLowerCase();
  return state.records.filter(r => {
    if (branch && r.branchId !== branch) return false;
    if (state.regItem && r.itemName !== state.regItem) return false;
    if (state.regFrom && r.date < state.regFrom) return false;
    if (state.regTo && r.date > state.regTo) return false;
    if (!q) return true;
    const blob = [r.itemName, itemLabel(r.itemName), r.chalanNo, r.fromVal, r.saleVal, r.createdBy, r.srNo, r.branchId].join(' ').toLowerCase();
    return blob.includes(q);
  }).sort((a, b) => (b.date || '').localeCompare(a.date || '') || (b.createdAt || '').localeCompare(a.createdAt || ''));
}

function viewBook() {
  const rows = filteredRecords();
  const itemOptions = '<option value="">' + esc(t('allItems')) + '</option>' + orderedItems().map(item =>
    '<option value="' + esc(item) + '"' + (state.regItem === item ? ' selected' : '') + '>' + esc(itemLabel(item)) + '</option>'
  ).join('');
  const head = [t('date'), t('branch'), t('item'), t('chalan'), t('receive'), t('issue'), ''].map(h => '<span>' + esc(h) + '</span>').join('');
  const body = rows.length
    ? rows.map(recordRow).join('')
    : '<p class="empty">' + esc(t('noRecords')) + '</p>';
  return '<section class="panel">' +
    '<div class="view-head"><div><h2 class="sheet-title">' + esc(t('bookTitle')) + '</h2><p class="muted">' + rows.length + '</p></div>' +
      '<button type="button" class="btn ghost small no-print" data-action="export-book">' + esc(t('export')) + '</button></div>' +
    '<div class="filters no-print">' +
      '<input id="reg-q" placeholder="' + esc(t('searchRecords')) + '" value="' + esc(state.regQ) + '">' +
      '<select id="reg-item">' + itemOptions + '</select>' +
      '<input id="reg-from" type="date" value="' + esc(state.regFrom) + '" aria-label="' + esc(t('fromDate')) + '">' +
      '<input id="reg-to" type="date" value="' + esc(state.regTo) + '" aria-label="' + esc(t('toDate')) + '">' +
    '</div>' +
    '<div class="ledger"><div class="ledger-head">' + head + '</div>' + body + '</div>' +
  '</section>';
}
function recordRow(r) {
  const flags = (r.sample ? '<span class="tag empty">' + esc(t('sample')) + '</span> ' : '') +
    (r.updatedBy ? '<span class="tag">' + esc(t('edited')) + '</span>' : '');
  return '<article class="ledger-row">' +
    '<span class="cell" data-label="' + esc(t('date')) + '">' + esc(formatDate(r.date)) + '<span class="who num">SR ' + esc(r.srNo || '') + '</span></span>' +
    '<span class="cell" data-label="' + esc(t('branch')) + '">' + esc(branchLabel(r.branchId)) + '<span class="who num">' + esc(r.branchId) + '</span></span>' +
    '<span class="cell full" data-label="' + esc(t('item')) + '"><b>' + esc(itemLabel(r.itemName)) + '</b> ' + flags + '</span>' +
    '<span class="cell num" data-label="' + esc(t('chalan')) + '">' + esc(r.chalanNo || '—') + '</span>' +
    '<span class="cell" data-label="' + esc(t('receive')) + '"><span class="qty-in num">' + (r.fromAmt ? '+' + num(r.fromAmt) : '—') + '</span><span class="who">' + esc(r.fromVal || '') + '</span></span>' +
    '<span class="cell" data-label="' + esc(t('issue')) + '"><span class="qty-out num">' + (r.saleAmt ? '−' + num(r.saleAmt) : '—') + '</span><span class="who">' + esc(r.saleVal || '') + '</span></span>' +
    '<span class="cell row-actions" data-label="">' +
      '<button type="button" class="btn tiny ghost" data-action="edit" data-id="' + esc(r.id) + '">' + esc(t('edit')) + '</button>' +
      '<button type="button" class="btn tiny danger" data-action="delete" data-id="' + esc(r.id) + '">' + esc(t('delete')) + '</button>' +
    '</span>' +
  '</article>';
}

function reportRows() {
  const from = state.repFrom || '0000-01-01';
  const to = state.repTo || '9999-12-31';
  const branch = effectiveBranch();
  const branches = branch ? state.branches.filter(b => b.id === branch) : state.branches;
  const rows = [];
  branches.forEach(b => {
    orderedItems().forEach(item => {
      let opening = 0, inn = 0, out = 0;
      state.records.forEach(r => {
        if (r.branchId !== b.id || r.itemName !== item) return;
        const d = r.date || '';
        if (d < from) opening += (Number(r.fromAmt) || 0) - (Number(r.saleAmt) || 0);
        else if (d <= to) {
          inn += Number(r.fromAmt) || 0;
          out += Number(r.saleAmt) || 0;
        }
      });
      if (opening === 0 && inn === 0 && out === 0) return;
      rows.push({ branchId: b.id, item, opening, inn, out, closing: opening + inn - out });
    });
  });
  return rows;
}
function viewReport() {
  const rows = reportRows();
  const showBranch = !effectiveBranch();
  const body = rows.map(r =>
    '<tr>' +
      (showBranch ? '<td class="left">' + esc(branchLabel(r.branchId)) + '</td>' : '') +
      '<td class="left">' + esc(itemLabel(r.item)) + '</td>' +
      '<td class="num">' + num(r.opening) + '</td>' +
      '<td class="num">' + num(r.inn) + '</td>' +
      '<td class="num">' + num(r.out) + '</td>' +
      '<td class="num ' + (r.closing < 0 ? 'neg' : '') + '">' + num(r.closing) + '</td>' +
    '</tr>'
  ).join('');
  const branchName = effectiveBranch() ? branchLabel(effectiveBranch()) : t('allBranches');
  return '<section class="panel" id="print-area">' +
    '<div class="print-head">' +
      '<p class="eyebrow">BIMS</p><h1>' + esc(t('org')) + '</h1>' +
      '<p>' + esc(t('reportTitle')) + ' · ' + esc(branchName) + '</p>' +
      '<p>' + esc(formatDate(state.repFrom)) + ' — ' + esc(formatDate(state.repTo)) + '</p>' +
      '<p>' + esc(t('printedBy')) + ': ' + esc(state.user.email) + '</p>' +
    '</div>' +
    '<div class="view-head no-print"><div><h2 class="sheet-title">' + esc(t('reportTitle')) + '</h2><p class="muted">' + esc(t('reportHelp')) + '</p></div>' +
      '<div class="actions"><button type="button" class="btn ghost small" data-action="print">' + esc(t('print')) + '</button>' +
      '<button type="button" class="btn ghost small" data-action="export-report">' + esc(t('export')) + '</button></div></div>' +
    '<div class="row-2 no-print" style="margin-bottom:12px">' +
      '<label>' + esc(t('fromDate')) + '<input id="rep-from" type="date" value="' + esc(state.repFrom) + '"></label>' +
      '<label>' + esc(t('toDate')) + '<input id="rep-to" type="date" value="' + esc(state.repTo) + '"></label>' +
    '</div>' +
    (rows.length ? '<div class="table-wrap"><table><thead><tr>' +
      (showBranch ? '<th class="left">' + esc(t('branch')) + '</th>' : '') +
      '<th class="left">' + esc(t('item')) + '</th><th>' + esc(t('opening')) + '</th><th>' + esc(t('received')) + '</th><th>' + esc(t('issued')) + '</th><th>' + esc(t('closing')) + '</th>' +
      '</tr></thead><tbody>' + body + '</tbody></table></div>' : '<p class="empty">' + esc(t('noReport')) + '</p>') +
    '<div class="signs print-only"><div>' + esc(t('prepared')) + '</div><div>' + esc(t('checked')) + '</div><div>' + esc(t('manager')) + '</div></div>' +
  '</section>';
}

function viewAdmin() {
  if (!isAdmin()) return '<p class="empty">' + esc(t('adminOnly')) + '</p>';
  const tabs = ['branches', 'users', 'items', 'backup'].map(id => {
    const key = 'tab' + id.charAt(0).toUpperCase() + id.slice(1);
    return '<button type="button" class="chip" aria-selected="' + (state.adminTab === id) + '" data-action="admin-tab" data-tab="' + id + '">' + esc(t(key)) + '</button>';
  }).join('');
  const panels = { branches: adminBranches, users: adminUsers, items: adminItems, backup: adminBackup };
  return '<section class="panel"><div class="view-head"><div><h2 class="sheet-title">' + esc(t('adminTitle')) + '</h2></div></div>' +
    '<div class="tabs">' + tabs + '</div>' + (panels[state.adminTab] || adminBranches)() + '</section>';
}
function adminBranches() {
  const rows = state.branches.map(b =>
    '<div class="branch-row"><div class="meta"><b>' + esc(branchLabel(b.id)) + ' <span class="num">' + esc(b.id) + '</span></b>' +
      '<span class="badge ' + (String(b.status).toLowerCase() === 'active' ? '' : 'off') + '">' + esc(String(b.status).toLowerCase() === 'active' ? t('active') : t('inactive')) + '</span></div>' +
      '<div class="ops"><button type="button" class="btn tiny ghost" data-action="branch-status" data-id="' + esc(b.id) + '" data-status="' + (String(b.status).toLowerCase() === 'active' ? 'Inactive' : 'Active') + '">' +
        esc(String(b.status).toLowerCase() === 'active' ? t('makeInactive') : t('makeActive')) + '</button></div></div>'
  ).join('');
  const links = state.branches.map(b => {
    const url = appUrl('?branch=' + encodeURIComponent(b.id));
    return '<div class="branch-row"><div class="meta"><b>' + esc(branchLabel(b.id)) + '</b><span class="num">' + esc(url) + '</span></div>' +
      '<button type="button" class="btn tiny ghost" data-action="copy" data-url="' + esc(url) + '">' + esc(t('copy')) + '</button></div>';
  }).join('');
  return '<form id="branch-form" class="row-2">' +
      '<label>' + esc(t('branchId')) + '<input name="branchId" required placeholder="B021" maxlength="20"></label>' +
      '<label>' + esc(t('branchName')) + '<input name="branchName" required maxlength="80"></label>' +
      '<div><button class="btn" type="submit">' + esc(t('addBranch')) + '</button></div>' +
    '</form><div style="margin-top:8px">' + rows + '</div>' +
    '<h3 style="margin:18px 0 4px">' + esc(t('links')) + '</h3><p class="hint">' + esc(t('shareHelp')) + '</p>' + links;
}
function adminUsers() {
  const branchOptions = state.branches.filter(b => String(b.status).toLowerCase() === 'active').map(b =>
    '<option value="' + esc(b.id) + '">' + esc(branchLabel(b.id)) + ' · ' + esc(b.id) + '</option>'
  ).join('');
  const rows = state.users.map(u =>
    '<div class="person"><div class="meta"><b>' + esc(u.name ? u.name + ' · ' + u.email : u.email) + '</b><span>' + esc(branchLabel(u.branchId)) + ' · ' + esc(u.branchId) + '</span> ' +
      '<span class="badge ' + (u.role === 'Admin' ? 'admin' : '') + '">' + esc(u.role) + '</span> ' +
      '<span class="badge ' + (String(u.status).toLowerCase() === 'active' ? '' : 'off') + '">' + esc(String(u.status).toLowerCase() === 'active' ? t('active') : t('inactive')) + '</span></div>' +
      '<div class="ops">' +
        '<button type="button" class="btn tiny ghost" data-action="user-email" data-email="' + esc(u.email) + '">' + esc(t('changeEmail')) + '</button>' +
        '<button type="button" class="btn tiny ghost" data-action="user-reset" data-email="' + esc(u.email) + '">' + esc(t('resetPassword')) + '</button>' +
        '<button type="button" class="btn tiny ghost" data-action="user-status" data-email="' + esc(u.email) + '" data-status="' + (String(u.status).toLowerCase() === 'active' ? 'Inactive' : 'Active') + '">' +
          esc(String(u.status).toLowerCase() === 'active' ? t('makeInactive') : t('makeActive')) + '</button>' +
      '</div></div>'
  ).join('');
  return '<form id="user-form" class="row-3">' +
      '<label>' + esc(t('email')) + '<input name="email" type="email" required></label>' +
      '<label>' + esc(t('branch')) + '<select name="branchId">' + branchOptions + '</select></label>' +
      '<label>' + esc(t('role')) + '<select name="role"><option value="User">' + esc(t('userRole')) + '</option><option value="Admin">' + esc(t('adminRole')) + '</option></select></label>' +
      '<div><button class="btn" type="submit">' + esc(t('addUser')) + '</button></div>' +
    '</form><div style="margin-top:8px">' + rows + '</div>';
}
function adminItems() {
  const rows = state.items.map(item =>
    '<div class="item-row"><div><b>' + esc(itemLabel(item)) + '</b><div class="who">' + esc(item !== itemLabel(item) ? item : itemSub(item)) + '</div></div>' +
      '<button type="button" class="btn tiny ghost" data-action="remove-item" data-name="' + esc(item) + '">' + esc(t('remove')) + '</button></div>'
  ).join('');
  return '<form id="item-form" class="row-2">' +
      '<label>' + esc(t('itemName')) + '<input name="name" required maxlength="80"></label>' +
      '<div style="align-self:end"><button class="btn" type="submit">' + esc(t('addItem')) + '</button></div>' +
    '</form><div style="margin-top:8px">' + rows + '</div>';
}
function adminBackup() {
  return '<p class="muted">' + esc(t('backupHelp')) + '</p>' +
    '<div class="actions">' +
      '<button type="button" class="btn" data-action="backup">' + esc(t('download')) + '</button>' +
      '<button type="button" class="btn ghost" data-action="pick-restore">' + esc(t('restore')) + '</button>' +
      '<button type="button" class="btn danger" data-action="clear-samples">' + esc(t('clearSamples')) + '</button>' +
    '</div>' +
    '<input id="restore-file" type="file" accept="application/json,.json" class="hidden">';
}

function csvEscape(value) {
  const s = String(value ?? '');
  if (/[",\n]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
  return s;
}
function download(filename, text, type) {
  const blob = new Blob([text], { type: (type || 'text/csv') + ';charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}
function recordsToCsv(rows) {
  const header = ['Record ID', 'Branch ID', 'Branch', 'SR No', 'Date', 'Item', 'Chalan', 'From', 'From Qty', 'Sale', 'Sale Qty', 'Created By', 'Created At'];
  const lines = [header.join(',')];
  rows.forEach(r => {
    const branch = state.branches.find(b => b.id === r.branchId);
    lines.push([
      r.id, r.branchId, branch ? branch.name : '', r.srNo, r.date, r.itemName, r.chalanNo,
      r.fromVal, r.fromAmt, r.saleVal, r.saleAmt, r.createdBy, r.createdAt
    ].map(csvEscape).join(','));
  });
  return '\uFEFF' + lines.join('\n');
}

async function doSignup(form) {
  const btn = form.querySelector('button[type=submit]');
  const err = document.getElementById('signup-error');
  if (err) err.textContent = '';
  if (form.password.value !== form.confirmPassword.value) {
    if (err) err.textContent = tErr('PASSWORD_MISMATCH');
    return;
  }
  btn.disabled = true;
  const old = btn.textContent;
  btn.textContent = t('signingUp');
  try {
    const body = {
      branchName: form.branchName.value.trim(),
      branchCode: form.branchCode.value.trim(),
      userName: form.userName.value.trim(),
      userId: form.userId.value.trim(),
      password: form.password.value,
      confirmPassword: form.confirmPassword.value
    };
    const signed = await api('/api/signup', { method: 'POST', body });
    const data = await api('/api/login', { method: 'POST', body: { email: signed.email, password: body.password } });
    state.token = data.token;
    sessionStorage.setItem('bims_token', data.token);
    localStorage.setItem('bims_email', signed.email);
    state.linkApplied = false;
    await refresh();
    state.draft = null;
    state.view = 'stock';
    showApp();
    toast(t('signedUp').replace('{email}', signed.email));
  } catch (e) {
    if (err) err.textContent = tErr(e.message);
    btn.disabled = false;
    btn.textContent = old;
  }
}

async function doLogin(form) {
  const btn = form.querySelector('button[type=submit]');
  const err = document.getElementById('login-error');
  btn.disabled = true;
  btn.textContent = t('signingIn');
  try {
    const email = form.email.value.trim();
    const data = await api('/api/login', { method: 'POST', body: { email, password: form.password.value } });
    state.token = data.token;
    sessionStorage.setItem('bims_token', data.token);
    localStorage.setItem('bims_email', email);
    state.linkApplied = false;
    await refresh();
    state.draft = null;
    state.view = 'stock';
    showApp();
    toast(t('welcome'));
  } catch (e) {
    if (err) err.textContent = tErr(e.message);
    btn.disabled = false;
    btn.textContent = t('signIn');
  }
}

async function doSave(form, force) {
  captureDraft();
  const data = Object.assign({}, state.draft);
  const err = document.getElementById('form-error');
  if (!data.itemName) {
    if (err) err.textContent = tErr('NEED_ITEM');
    return;
  }
  if (!(Number(data.fromAmt) > 0) && !(Number(data.saleAmt) > 0)) {
    if (err) err.textContent = tErr('NEED_QTY');
    return;
  }
  if (!force && data.chalanNo) {
    const dup = state.records.some(r => r.id !== data.id && r.branchId === data.branchId && r.chalanNo === data.chalanNo && r.itemName === data.itemName);
    if (dup) {
      openModal({
        title: t('chalan'),
        text: t('dupChalan'),
        confirmText: t('yesSave'),
        onConfirm: () => doSave(form, true)
      });
      return;
    }
  }
  const btn = form.querySelector('button[type=submit]');
  if (btn) btn.disabled = true;
  try {
    const result = await api('/api/records', { method: 'POST', body: data });
    await refresh();
    const wasEdit = !!data.id;
    state.draft = blankDraft();
    toast(wasEdit ? t('updated') : t('saved'));
    renderShell();
    renderView();
    if (result && result.id && !wasEdit) {
      const live = document.getElementById('form-error');
      if (live) live.textContent = '';
    }
  } catch (e) {
    if (err) err.textContent = tErr(e.message);
    if (btn) btn.disabled = false;
  }
}

function bind() {
  window.addEventListener('hashchange', () => {
    if (state.user) return;
    state.authScreen = location.hash === '#signup' ? 'signup' : 'login';
    showLogin();
  });
  document.addEventListener('click', async e => {
    if (e.target.closest('.modal') && e.target.classList.contains('modal-back') === false && e.target.dataset.action === 'close-modal') {
      /* inner close buttons still handled below */
    }
    const el = e.target.closest('[data-action]');
    if (!el) {
      if (e.target.classList && e.target.classList.contains('modal-back')) closeModal();
      return;
    }
    const action = el.dataset.action;
    if (action === 'close-modal') { closeModal(); return; }
    if (action === 'confirm-modal') {
      const fn = state.modal && state.modal.onConfirm;
      if (!fn) return;
      try {
        await fn();
        closeModal();
      } catch (err) {
        toast(tErr(err.message), 'err');
      }
      return;
    }
    if (action === 'goto-signup') {
      state.authScreen = 'signup';
      if (location.hash !== '#signup') location.hash = 'signup';
      else showLogin();
      return;
    }
    if (action === 'goto-login') {
      state.authScreen = 'login';
      if (location.hash === '#signup') location.hash = '';
      else showLogin();
      return;
    }
    if (action === 'lang') {
      captureDraft();
      state.lang = state.lang === 'bn' ? 'en' : 'bn';
      localStorage.setItem('bims_lang', state.lang);
      if (state.user) { renderShell(); renderView(); } else showLogin();
      return;
    }
    if (action === 'toggle-pass') {
      const input = document.getElementById('password');
      if (!input) return;
      input.type = input.type === 'password' ? 'text' : 'password';
      el.textContent = input.type === 'password' ? t('show') : t('hide');
      return;
    }
    if (action === 'quick') {
      const form = document.getElementById('login-form');
      if (!form) return;
      form.email.value = el.dataset.email;
      if (allowAutoEnter()) {
        form.password.value = DEMO_PASSWORD;
        form.requestSubmit ? form.requestSubmit() : form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
      } else {
        const password = form.querySelector('[name=password]');
        if (password) password.focus();
      }
      return;
    }
    if (action === 'nav') {
      captureDraft();
      state.view = el.dataset.view;
      if (state.view === 'entry' && !state.draft) state.draft = blankDraft();
      renderShell();
      renderView();
      window.scrollTo(0, 0);
      return;
    }
    if (action === 'logout') {
      api('/api/logout', { method: 'POST' }).catch(() => {});
      state.token = '';
      state.user = null;
      sessionStorage.removeItem('bims_token');
      state.authScreen = 'login';
      if (location.hash === '#signup') history.replaceState(null, '', location.pathname + location.search);
      showLogin();
      return;
    }
    if (action === 'password') {
      openModal({
        title: t('passwordBtn'),
        html: '<label>' + esc(t('currentPassword')) + '<input id="modal-current" type="password"></label>' +
          '<label>' + esc(t('newPassword')) + '<input id="modal-next" type="password" minlength="4"></label>',
        confirmText: t('savePassword'),
        onConfirm: async () => {
          await api('/api/account/password', {
            method: 'POST',
            body: {
              current: document.getElementById('modal-current').value,
              next: document.getElementById('modal-next').value
            }
          });
          toast(t('savePassword'));
        }
      });
      return;
    }
    if (action === 'dismiss-sample') {
      state.hideSampleNote = true;
      sessionStorage.setItem('bims_hide_sample', '1');
      renderView();
      return;
    }
    if (action === 'dismiss-note') {
      state.pendingNote = '';
      renderView();
      return;
    }
    if (action === 'pick-branch') {
      state.branchFilter = el.dataset.branch;
      renderShell();
      renderView();
      return;
    }
    if (action === 'open-item') {
      state.regItem = el.dataset.item;
      state.view = 'book';
      renderShell();
      renderView();
      return;
    }
    if (action === 'reset-entry') {
      state.draft = blankDraft();
      renderView();
      return;
    }
    if (action === 'edit') {
      const rec = state.records.find(r => r.id === el.dataset.id);
      if (!rec) return;
      state.draft = {
        id: rec.id,
        branchId: rec.branchId,
        srNo: rec.srNo,
        date: rec.date,
        itemName: rec.itemName,
        chalanNo: rec.chalanNo,
        fromVal: rec.fromVal,
        fromAmt: rec.fromAmt || '',
        saleVal: rec.saleVal,
        saleAmt: rec.saleAmt || ''
      };
      state.view = 'entry';
      renderShell();
      renderView();
      window.scrollTo(0, 0);
      return;
    }
    if (action === 'delete') {
      const id = el.dataset.id;
      openModal({
        title: t('delete'),
        text: t('confirmDelete'),
        confirmText: t('yesDelete'),
        danger: true,
        onConfirm: async () => {
          await api('/api/records/' + encodeURIComponent(id), { method: 'DELETE' });
          await refresh();
          toast(t('deleted'));
          renderView();
        }
      });
      return;
    }
    if (action === 'export-stock') {
      const rows = stockReportRows();
      const header = ['Branch', 'Item', 'In', 'Out', 'Balance', 'Status'];
      const lines = ['\uFEFF' + header.join(',')];
      rows.forEach(r => {
        const kind = tone(r.bal);
        lines.push([branchLabel(r.branchId), itemLabel(r.item), r.inn, r.out, r.bal, t(kind === 'ok' ? 'inHand' : kind)].map(csvEscape).join(','));
      });
      download('bims-stock.csv', lines.join('\n'));
      return;
    }
    if (action === 'export-book') {
      download('bims-register.csv', recordsToCsv(filteredRecords()));
      return;
    }
    if (action === 'export-report') {
      const rows = reportRows();
      const header = ['Branch', 'Item', 'Opening', 'In', 'Out', 'Closing'];
      const lines = ['\uFEFF' + header.join(',')];
      rows.forEach(r => lines.push([branchLabel(r.branchId), r.item, r.opening, r.inn, r.out, r.closing].map(csvEscape).join(',')));
      download('bims-report.csv', lines.join('\n'));
      return;
    }
    if (action === 'print') { window.print(); return; }
    if (action === 'open-book') {
      enterAs('azahar4bd@gmail.com').catch(err => {
        const box = document.getElementById('login-error');
        if (box) box.textContent = tErr(err.message);
      });
      return;
    }
    if (action === 'admin-tab') {
      state.adminTab = el.dataset.tab;
      renderView();
      return;
    }
    if (action === 'branch-status') {
      try {
        await api('/api/admin/branches/status', { method: 'POST', body: { branchId: el.dataset.id, status: el.dataset.status } });
        await refresh();
        toast(t('active'));
        renderView();
      } catch (err) { toast(tErr(err.message), 'err'); }
      return;
    }
    if (action === 'user-status') {
      try {
        await api('/api/admin/users/status', { method: 'POST', body: { email: el.dataset.email, status: el.dataset.status } });
        await refresh();
        renderView();
      } catch (err) { toast(tErr(err.message), 'err'); }
      return;
    }
    if (action === 'user-reset') {
      const email = el.dataset.email;
      try {
        const result = await api('/api/admin/users/password', { method: 'POST', body: { email } });
        toast(tFill('tempPassword', { password: result.temporaryPassword || DEMO_PASSWORD }));
      } catch (err) { toast(tErr(err.message), 'err'); }
      return;
    }
    if (action === 'user-email') {
      const oldEmail = el.dataset.email;
      openModal({
        title: t('changeEmail'),
        html: '<label>' + esc(t('newEmail')) + '<input id="modal-email" type="email" value="' + esc(oldEmail) + '"></label>',
        confirmText: t('save'),
        onConfirm: async () => {
          await api('/api/admin/users/email', {
            method: 'POST',
            body: { oldEmail, newEmail: document.getElementById('modal-email').value }
          });
          await refresh();
          toast(t('changeEmail'));
          renderView();
        }
      });
      return;
    }
    if (action === 'remove-item') {
      const name = el.dataset.name;
      try {
        await api('/api/admin/items', { method: 'DELETE', body: { name } });
        await refresh();
        renderView();
      } catch (err) { toast(tErr(err.message), 'err'); }
      return;
    }
    if (action === 'copy') {
      const url = el.dataset.url;
      try {
        await navigator.clipboard.writeText(url);
        toast(t('copied'));
      } catch {
        prompt(t('copy'), url);
      }
      return;
    }
    if (action === 'backup') {
      try {
        const data = await api('/api/admin/backup');
        download('bims-backup.json', JSON.stringify(data, null, 2), 'application/json');
      } catch (err) { toast(tErr(err.message), 'err'); }
      return;
    }
    if (action === 'pick-restore') {
      const input = document.getElementById('restore-file');
      if (input) input.click();
      return;
    }
    if (action === 'clear-samples') {
      openModal({
        title: t('clearSamples'),
        text: t('confirmSamples'),
        confirmText: t('yesDelete'),
        danger: true,
        onConfirm: async () => {
          const result = await api('/api/admin/samples', { method: 'DELETE' });
          await refresh();
          toast(tFill('removedSamples', { n: result.removed }));
          renderView();
        }
      });
    }
  });

  document.addEventListener('submit', async e => {
    const form = e.target;
    if (!(form instanceof HTMLFormElement)) return;
    if (form.id === 'login-form') { e.preventDefault(); await doLogin(form); return; }
    if (form.id === 'signup-form') { e.preventDefault(); await doSignup(form); return; }
    if (form.id === 'entry-form') { e.preventDefault(); await doSave(form, false); return; }
    if (form.id === 'branch-form') {
      e.preventDefault();
      const fd = new FormData(form);
      try {
        await api('/api/admin/branches', { method: 'POST', body: { branchId: fd.get('branchId'), branchName: fd.get('branchName') } });
        await refresh();
        form.reset();
        toast(t('addBranch'));
        renderView();
      } catch (err) { toast(tErr(err.message), 'err'); }
      return;
    }
    if (form.id === 'user-form') {
      e.preventDefault();
      const fd = new FormData(form);
      try {
        const result = await api('/api/admin/users', {
          method: 'POST',
          body: { email: fd.get('email'), branchId: fd.get('branchId'), role: fd.get('role') }
        });
        await refresh();
        form.reset();
        toast(tFill('tempPassword', { password: result.temporaryPassword || DEMO_PASSWORD }));
        renderView();
      } catch (err) { toast(tErr(err.message), 'err'); }
      return;
    }
    if (form.id === 'item-form') {
      e.preventDefault();
      const fd = new FormData(form);
      try {
        await api('/api/admin/items', { method: 'POST', body: { name: fd.get('name') } });
        await refresh();
        form.reset();
        toast(t('addItem'));
        renderView();
      } catch (err) { toast(tErr(err.message), 'err'); }
    }
  });

  document.addEventListener('change', e => {
    const id = e.target.id;
    if (id === 'branch-switch') {
      captureDraft();
      state.branchFilter = e.target.value;
      if (state.draft && !state.draft.id && isAdmin()) {
        state.draft.branchId = state.branchFilter || state.user.branchId;
        state.draft.srNo = nextSr(state.draft.branchId);
      }
      renderView();
      return;
    }
    if (id === 'stock-item') { state.stockItem = e.target.value; renderView(); return; }
    if (id === 'stock-q') { state.stockQ = e.target.value; return; }
    if (id === 'reg-item') { state.regItem = e.target.value; renderView(); return; }
    if (id === 'reg-from') { state.regFrom = e.target.value; renderView(); return; }
    if (id === 'reg-to') { state.regTo = e.target.value; renderView(); return; }
    if (id === 'rep-from') { state.repFrom = e.target.value; renderView(); return; }
    if (id === 'rep-to') { state.repTo = e.target.value; renderView(); return; }
    if (id === 'restore-file' && e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      e.target.value = '';
      const reader = new FileReader();
      reader.onload = () => {
        let payload;
        try { payload = JSON.parse(String(reader.result || '')); }
        catch { toast(tErr('BAD_BACKUP'), 'err'); return; }
        openModal({
          title: t('restore'),
          text: t('confirmRestore'),
          confirmText: t('yesRestore'),
          danger: true,
          onConfirm: async () => {
            await api('/api/admin/restore', { method: 'POST', body: payload });
            await refresh();
            toast(t('restore'));
            renderShell();
            renderView();
          }
        });
      };
      reader.readAsText(file);
      return;
    }
    if (e.target.name === 'itemName' || e.target.name === 'branchId') {
      captureDraft();
      if (e.target.name === 'branchId' && state.draft && !state.draft.id) {
        state.draft.srNo = nextSr(state.draft.branchId);
        const sr = document.querySelector('[name=srNo]');
        if (sr) sr.value = state.draft.srNo;
      }
      updateLiveBalance();
    }
  });

  document.addEventListener('input', e => {
    if (e.target.id === 'stock-q') {
      state.stockQ = e.target.value;
      renderView();
    } else if (e.target.id === 'reg-q') {
      state.regQ = e.target.value;
      renderView();
    }
  });
}

async function enterAs(email) {
  const data = await api('/api/login', { method: 'POST', body: { email: email, password: DEMO_PASSWORD } });
  state.token = data.token;
  sessionStorage.setItem('bims_token', data.token);
  localStorage.setItem('bims_email', email);
  state.linkApplied = false;
  await refresh();
  state.draft = null;
  state.view = 'stock';
  showApp();
}

function allowAutoEnter() {
  const host = location.hostname;
  return host === 'localhost' || host === '127.0.0.1' || host.endsWith('.e2b.app') || host.endsWith('.e2b.dev');
}

async function boot() {
  bind();
  const login = document.getElementById('login');
  login.classList.remove('hidden');
  login.innerHTML = '<div class="booting">' + esc(t('booting')) + '</div>';
  if (state.token) {
    try {
      await refresh();
      showApp();
      return;
    } catch (e) {
      state.token = '';
      sessionStorage.removeItem('bims_token');
    }
  }
  if (!allowAutoEnter()) {
    showLogin();
    return;
  }
  try {
    await enterAs('azahar4bd@gmail.com');
  } catch (e) {
    showLogin();
  }
}

boot();
