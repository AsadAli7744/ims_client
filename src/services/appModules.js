export const APP_MODULE_CATALOG = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'sales', label: 'Sales' },
  { key: 'services', label: 'Services' },
  { key: 'installments', label: 'Installments' },
  { key: 'customers', label: 'Customers' },
  { key: 'sellers', label: 'Sellers' },
  { key: 'items', label: 'Items' },
  { key: 'issues', label: 'Stock Transfers' },
  { key: 'categories', label: 'Categories' },
  { key: 'companies', label: 'Companies' },
  { key: 'purchases', label: 'Purchases' },
  { key: 'expenses', label: 'Expenses' },
  { key: 'payments', label: 'Payments' },
  { key: 'shops', label: 'Shops' },
  { key: 'stores', label: 'Stores' },
  { key: 'users', label: 'Users & permissions' },
];

export function mergeModuleCatalog(apiModules) {
  const byKey = new Map(APP_MODULE_CATALOG.map((module) => [module.key, module]));
  (apiModules || []).forEach((module) => {
    if (module?.key) {
      byKey.set(module.key, { key: module.key, label: module.label || module.key });
    }
  });
  const seen = new Set();
  const ordered = [];
  APP_MODULE_CATALOG.forEach((module) => {
    if (!seen.has(module.key) && byKey.has(module.key)) {
      seen.add(module.key);
      ordered.push(byKey.get(module.key));
    }
  });
  (apiModules || []).forEach((module) => {
    if (module?.key && !seen.has(module.key)) {
      seen.add(module.key);
      ordered.push(byKey.get(module.key));
    }
  });
  return ordered;
}
