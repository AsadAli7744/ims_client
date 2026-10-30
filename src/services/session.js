const TOKEN_KEY = 'token';
const USER_KEY = 'user';
const TENANT_KEY = 'viewTenantId';
const SHOP_KEY = 'selectedShop';

export function notifySession() {
  window.dispatchEvent(new Event('ims-session'));
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getUser() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY) || 'null');
  } catch (e) {
    return null;
  }
}

export function isSuperAdmin(user = getUser()) {
  return user?.role === 'super_admin';
}

export function isTenantAdmin(user = getUser()) {
  return user?.role === 'tenant_admin';
}

export function getUserModules(user = getUser()) {
  return Array.isArray(user?.permissions) ? user.permissions : [];
}

export function hasPermission(permission, user = getUser()) {
  if (!getToken() || !user) {
    return false;
  }
  if (user.role === 'super_admin') {
    return true;
  }
  const modules = getUserModules(user);
  if (!permission) {
    return false;
  }
  if (modules.includes(permission)) {
    return true;
  }
  const moduleKey = String(permission).split('.')[0];
  return modules.some((entry) => entry === moduleKey || String(entry).startsWith(`${moduleKey}.`));
}

export function isAuthenticated() {
  return !!getToken() && !!getUser();
}

export function getAssignedShops(user = getUser()) {
  return Array.isArray(user?.shops) ? user.shops : [];
}

export function hasSingleAssignedShop(user = getUser()) {
  return user?.role === 'user' && getAssignedShops(user).length === 1;
}

const HOME_PATHS = [
  ['dashboard', '/home'],
  ['sales', '/sales'],
  ['services', '/services'],
  ['installments', '/installments'],
  ['customers', '/customers'],
  ['sellers', '/sellers'],
  ['items', '/items'],
  ['issues', '/stock-transfers'],
  ['categories', '/categories'],
  ['companies', '/companies'],
  ['purchases', '/purchases'],
  ['expenses', '/expenses'],
  ['payments', '/payments'],
  ['shops', '/shops'],
  ['stores', '/stores'],
  ['users', '/permissions'],
];

export function defaultHomePath(user = getUser()) {
  if (!user) {
    return '/';
  }
  const match = HOME_PATHS.find(([module]) => hasPermission(module, user));
  if (!match) {
    return isSuperAdmin(user) ? '/admin/users' : '/';
  }
  if (match[0] === 'users' && isSuperAdmin(user)) {
    return '/admin/users';
  }
  return match[1];
}

export function getViewTenantId() {
  return localStorage.getItem(TENANT_KEY);
}

export function setViewTenantId(id) {
  if (id) {
    localStorage.setItem(TENANT_KEY, String(id));
  } else {
    localStorage.removeItem(TENANT_KEY);
  }
  notifySession();
}

export function saveSession(token, user) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  notifySession();
}

export function updateStoredUser(user) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  notifySession();
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(TENANT_KEY);
  localStorage.removeItem(SHOP_KEY);
  notifySession();
}
