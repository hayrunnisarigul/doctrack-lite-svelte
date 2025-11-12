import { writable, derived } from 'svelte/store';

// ----- USERS (localStorage) -----
function loadUsers() {
  try {
    const u = JSON.parse(localStorage.getItem('dt_users') || 'null');
    if (u && typeof u === 'object') return u;
  } catch {}
  const seed = { admin: { password: 'admin123', role: 'admin', email: 'admin@example.com' } };
  localStorage.setItem('dt_users', JSON.stringify(seed));
  return seed;
}
function saveUsers(obj) { localStorage.setItem('dt_users', JSON.stringify(obj)); }

let USERS = loadUsers();

// ----- SESSION -----
const stored = (() => {
  try { return JSON.parse(localStorage.getItem('dt_user') || 'null'); }
  catch { return null; }
})();
export const user = writable(stored || { username: '', role: '', email: '' });
user.subscribe(v => localStorage.setItem('dt_user', JSON.stringify(v)));

export const isAuthed = derived(user, $u => !!($u && $u.username));

export const perms = derived(user, ($u) => ({
  role: $u?.role || 'user',
  canCreateDoc: !!$u?.username,       // user & admin
  canEditDoc:  $u?.role === 'admin',  // sadece admin
  canDeleteDoc:$u?.role === 'admin',  // sadece admin
  canManageUsers: $u?.role === 'admin',
  canEditOwnProfile: !!$u?.username,
}));

function getCurrent() { let v; const unsub = user.subscribe(x => v = x); unsub(); return v; }

// ----- API -----
export function login(username, password) {
  const u = USERS[username];
  if (!u || u.password !== password) return { ok: false, msg: 'Kullanıcı adı veya şifre hatalı' };
  user.set({ username, role: u.role, email: u.email || '' });
  return { ok: true };
}
export function signup(username, password, email = '') {
  if (USERS[username]) return { ok: false, msg: 'Bu kullanıcı adı zaten kayıtlı' };
  USERS[username] = { password, role: 'user', email };
  saveUsers(USERS);
  return { ok: true };
}
export function updateOwnProfile({ newUsername, newPassword, newEmail }) {
  const cur = getCurrent(); if (!cur) return { ok: false, msg: 'Oturum yok' };
  const old = cur.username; const rec = USERS[old];
  if (!rec) return { ok: false, msg: 'Kayıt bulunamadı' };

  const name = newUsername?.trim() || old;
  if (name !== old && USERS[name]) return { ok: false, msg: 'Bu kullanıcı adı zaten kullanılıyor' };

  const next = {
    ...rec,
    password: newPassword?.trim() ? newPassword.trim() : rec.password,
    email: newEmail?.trim() ?? rec.email
  };
  delete USERS[old]; USERS[name] = next; saveUsers(USERS);
  user.set({ username: name, role: next.role, email: next.email || '' });
  return { ok: true };
}

// ----- Admin -----
export function listUsers() {
  return Object.entries(USERS).map(([k, v]) => ({ username: k, role: v.role, email: v.email || '' }));
}
export function adminCreateUser(username, password, role = 'user', email = '') {
  if (!username || !password) return { ok: false, msg: 'Kullanıcı adı ve şifre gerekli' };
  if (USERS[username]) return { ok: false, msg: 'Kullanıcı mevcut' };
  USERS[username] = { password, role: ['user','admin'].includes(role) ? role : 'user', email };
  saveUsers(USERS); return { ok: true };
}
export function adminDeleteUser(username) {
  if (!USERS[username]) return { ok: false, msg: 'Kullanıcı bulunamadı' };
  delete USERS[username]; saveUsers(USERS);
  const cur = getCurrent(); if (cur?.username === username) logout();
  return { ok: true };
}
export function adminSetRole(username, role) {
  if (!USERS[username]) return { ok: false, msg: 'Kullanıcı yok' };
  USERS[username].role = role === 'admin' ? 'admin' : 'user';
  saveUsers(USERS);
  const cur = getCurrent();
  if (cur?.username === username) user.set({ username, role: USERS[username].role, email: USERS[username].email || '' });
  return { ok: true };
}
export function logout() { user.set({ username: '', role: '', email: '' }); }
