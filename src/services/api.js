import { clearSession, getToken, getViewTenantId } from './session';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3668';

export const unwrapList = (data) => Array.isArray(data) ? data : (data?.data || []);

export const authApi = {
  login: (data) => apiCall('/auth/login', { method: 'POST', body: data, public: true }),
};

const apiCall = async (endpoint, options = {}) => {
  let url = `${API_BASE_URL}${endpoint}`;
  
  // Add query parameters for pagination and filters
  const params = new URLSearchParams();
  if (options.page) params.append('page', options.page);
  if (options.limit) params.append('limit', options.limit);
  
  // Add filter parameters
  if (options.filters) {
    if (options.filters.date) params.append('date', options.filters.date);
    if (options.filters.dateFrom) params.append('dateFrom', options.filters.dateFrom);
    if (options.filters.dateTo) params.append('dateTo', options.filters.dateTo);
    if (options.filters.search && options.filters.search.trim()) params.append('search', options.filters.search.trim());
    if (options.filters.filterType && options.filters.filterType.trim()) params.append('filterType', options.filters.filterType.trim());
    if (options.filters.tenantId) params.append('tenantId', options.filters.tenantId);
    if (options.filters.paymentStatus) params.append('paymentStatus', options.filters.paymentStatus);
    if (options.filters.dueToday) params.append('dueToday', options.filters.dueToday);
    if (options.filters.customerId) params.append('customerId', options.filters.customerId);
    if (options.filters.sellerId) params.append('sellerId', options.filters.sellerId);
    if (options.filters.kind) params.append('kind', options.filters.kind);
    if (options.filters.installmentStatus) params.append('installmentStatus', options.filters.installmentStatus);
    if (options.filters.condition && options.filters.condition.trim()) params.append('condition', options.filters.condition.trim());
    if (options.filters.companyId) params.append('companyId', options.filters.companyId);
    if (options.filters.categoryId) params.append('categoryId', options.filters.categoryId);
  }
  
  if (options.storeId) params.append('storeId', options.storeId);
  if (options.shopId) params.append('shopId', options.shopId);
  if (options.itemId) params.append('itemId', options.itemId);
  if (options.filterType && options.filterType.trim() && !params.has('filterType')) {
    params.append('filterType', options.filterType.trim());
  }
  if (options.tenantId) params.append('tenantId', options.tenantId);
  
  if (params.toString()) {
    url += `?${params.toString()}`;
  }

  const headers = {
    'Content-Type': 'application/json',
  };
  const token = getToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  const tenantId = options.tenantId || options.filters?.tenantId || getViewTenantId();
  if (tenantId) {
    headers['X-Tenant-Id'] = String(tenantId);
  }
  
  const config = {
    headers,
    credentials: 'include',
    method: options.method || 'GET',
  };

  if (options.body) {
    config.body = JSON.stringify(options.body);
  }

  const response = await fetch(url, config);
  const text = await response.text();
  let payload = null;
  try {
    payload = text ? JSON.parse(text) : null;
  } catch (e) {
    payload = { message: text };
  }

  if (response.status === 401 && !options.public) {
    clearSession();
    if (window.location.pathname !== '/') {
      window.location.assign('/');
    }
    throw new Error('Session expired. Please log in again.');
  }
  
  if (!response.ok) {
    const message = payload?.message || payload?.error || response.statusText;
    throw new Error(Array.isArray(message) ? message.join(', ') : message);
  }

  return payload;
};

const getSelectedShopId = () => {
  const shopStr = localStorage.getItem('selectedShop');
  if (shopStr) {
    try {
      const shop = JSON.parse(shopStr);
      return shop.id;
    } catch (e) {
      console.error('Error parsing selected shop from localStorage:', e);
    }
  }
  return null;
};

const resolveShopId = (filters) => {
  if (filters?.shopId) {
    return Number(filters.shopId);
  }
  return getSelectedShopId();
};

export const shopsApi = {
  getAll: (page, limit, filters) => apiCall('/shops', { page, limit, filters, tenantId: filters?.tenantId }),
  getOne: (id) => apiCall(`/shops/${id}`),
  getItems: (id) => apiCall(`/shops/${id}/items`),
  getAssetValue: (id) => apiCall(`/shops/${id}/asset-value`),
  create: (data) => apiCall('/shops', { method: 'POST', body: data }),
  update: (id, data) => apiCall(`/shops/${id}`, { method: 'PATCH', body: data }),
  delete: (id) => apiCall(`/shops/${id}`, { method: 'DELETE' }),
};

export const usersApi = {
  getAll: () => apiCall('/users'),
  getOne: (id) => apiCall(`/users/${id}`),
  getTenants: () => apiCall('/users/tenants'),
  create: (data) => apiCall('/users', { method: 'POST', body: data }),
  update: (id, data) => apiCall(`/users/${id}`, { method: 'PATCH', body: data }),
  assignShops: (id, shopIds) => apiCall(`/users/${id}/shops`, { method: 'PATCH', body: { shopIds } }),
  assignRole: (id, role) => apiCall(`/users/${id}/role`, { method: 'PATCH', body: { role } }),
  resetPassword: (id, password) => apiCall(`/users/${id}/password`, { method: 'PATCH', body: { password } }),
  revealPassword: (id) => apiCall(`/users/${id}/password`),
  archive: (id) => apiCall(`/users/${id}`, { method: 'DELETE' }),
};

export const userPermissionsApi = {
  listModules: () => apiCall('/user-permissions/modules'),
  list: (tenantId) => apiCall('/user-permissions', { tenantId }),
  set: (userId, modules) => apiCall(`/user-permissions/${userId}`, { method: 'PUT', body: { modules } }),
};

export const storesApi = {
  getAll: (page, limit, filters) => apiCall('/stores', { page, limit, filters }),
  getOne: (id) => apiCall(`/stores/${id}`),
  getItems: (id) => apiCall(`/stores/${id}/items`),
  getAssetValue: (id) => apiCall(`/stores/${id}/asset-value`),
  create: (data) => apiCall('/stores', { method: 'POST', body: data }),
  update: (id, data) => apiCall(`/stores/${id}`, { method: 'PATCH', body: data }),
  delete: (id) => apiCall(`/stores/${id}`, { method: 'DELETE' }),
};

export const categoriesApi = {
  getAll: (page, limit, filters) => apiCall('/category', { page, limit, filters }),
  getOne: (id) => apiCall(`/category/${id}`),
  create: (data) => apiCall('/category', { method: 'POST', body: data }),
  update: (id, data) => apiCall(`/category/${id}`, { method: 'PATCH', body: data }),
  delete: (id) => apiCall(`/category/${id}`, { method: 'DELETE' }),
};

export const companiesApi = {
  getAll: (page, limit, filters) => apiCall('/companies', { page, limit, filters }),
  getOne: (id) => apiCall(`/companies/${id}`),
  create: (data) => apiCall('/companies', { method: 'POST', body: data }),
  update: (id, data) => apiCall(`/companies/${id}`, { method: 'PATCH', body: data }),
  delete: (id) => apiCall(`/companies/${id}`, { method: 'DELETE' }),
};

export const itemsApi = {
  getAll: (page, limit, filters) => {
    const options = { page, limit };
    const shopId = resolveShopId(filters);
    if (filters) {
      options.filters = filters;
      if (filters.storeId) options.storeId = filters.storeId;
    }
    if (shopId) {
      options.shopId = shopId;
    }
    return apiCall('/items', options);
  },
  getOne: (id) => apiCall(`/items/${id}`),
  create: (data) => {
    const shopId = getSelectedShopId();
    if (shopId && !data.shopId && !data.storeId) {
      data.shopId = shopId;
    }
    return apiCall('/items', { method: 'POST', body: data });
  },
  update: (id, data) => apiCall(`/items/${id}`, { method: 'PATCH', body: data }),
  delete: (id) => apiCall(`/items/${id}`, { method: 'DELETE' }),
  transfer: (data) => apiCall('/items/transfer', { method: 'POST', body: data }),
};

export const salesApi = {
  getAll: (page, limit, filters) => {
    const options = { page, limit, filters };
    const shopId = resolveShopId(filters);
    if (shopId) {
      options.shopId = shopId;
    }
    return apiCall('/sales', options);
  },
  getOne: (id) => apiCall(`/sales/${id}`),
  getTotals: (filters, shopId) => {
    const options = { filters };
    options.shopId = shopId ?? resolveShopId(filters);
    return apiCall('/sales/totals', options);
  },
  create: (data) => {
    const shopId = getSelectedShopId();
    if (shopId && !data.shopId) {
      data.shopId = shopId;
    }
    return apiCall('/sales', { method: 'POST', body: data });
  },
  update: (id, data) => apiCall(`/sales/${id}`, { method: 'PATCH', body: data }),
  addPayment: (id, data) => apiCall(`/sales/${id}/payments`, { method: 'POST', body: data }),
  delete: (id) => apiCall(`/sales/${id}`, { method: 'DELETE' }),
};

export const servicesApi = {
  getAll: (page, limit, filters) => {
    const options = { page, limit, filters };
    const shopId = resolveShopId(filters);
    if (shopId) {
      options.shopId = shopId;
    }
    return apiCall('/services', options);
  },
  getOne: (id) => apiCall(`/services/${id}`),
  getTotals: (filters, shopId) => {
    const options = { filters };
    options.shopId = shopId ?? resolveShopId(filters);
    return apiCall('/services/totals', options);
  },
  create: (data) => {
    const shopId = getSelectedShopId();
    if (shopId && !data.shopId) {
      data.shopId = shopId;
    }
    return apiCall('/services', { method: 'POST', body: data });
  },
  update: (id, data) => apiCall(`/services/${id}`, { method: 'PATCH', body: data }),
  addPayment: (id, data) => apiCall(`/services/${id}/payments`, { method: 'POST', body: data }),
  delete: (id) => apiCall(`/services/${id}`, { method: 'DELETE' }),
};

export const installmentsApi = {
  getAll: (page, limit, filters) => {
    const options = { page, limit, filters };
    const shopId = resolveShopId(filters);
    if (shopId) {
      options.shopId = shopId;
    }
    return apiCall('/installments', options);
  },
  getTotals: (filters, shopId) => {
    const options = { filters };
    options.shopId = shopId ?? resolveShopId(filters);
    return apiCall('/installments/totals', options);
  },
  getPlans: (page, limit, filters) => {
    const options = { page, limit, filters };
    const shopId = resolveShopId(filters);
    if (shopId) {
      options.shopId = shopId;
    }
    return apiCall('/installments/plans', options);
  },
  getPlan: (id) => apiCall(`/installments/plans/${id}`),
  createPlan: (data) => {
    const shopId = getSelectedShopId();
    if (shopId && !data.shopId) {
      data.shopId = shopId;
    }
    return apiCall('/installments/plans', { method: 'POST', body: data });
  },
  updatePlan: (id, data) => apiCall(`/installments/plans/${id}`, { method: 'PATCH', body: data }),
  deletePlan: (id) => apiCall(`/installments/plans/${id}`, { method: 'DELETE' }),
  payDue: (id, data) => apiCall(`/installments/dues/${id}/pay`, { method: 'POST', body: data }),
};

export const sellersApi = {
  getAll: (page, limit, filters) => {
    const options = { page, limit, filters };
    const shopId = resolveShopId(filters);
    if (shopId) {
      options.shopId = shopId;
    }
    return apiCall('/sellers', options);
  },
  getOne: (id) => apiCall(`/sellers/${id}`),
  create: (data) => {
    const shopId = getSelectedShopId();
    if (shopId && !data.shopId) {
      data.shopId = shopId;
    }
    return apiCall('/sellers', { method: 'POST', body: data });
  },
  update: (id, data) => apiCall(`/sellers/${id}`, { method: 'PATCH', body: data }),
  delete: (id) => apiCall(`/sellers/${id}`, { method: 'DELETE' }),
};

export const customersApi = {
  getAll: (page, limit, filters) => {
    const options = { page, limit, filters };
    const shopId = resolveShopId(filters);
    if (shopId) {
      options.shopId = shopId;
    }
    return apiCall('/customers', options);
  },
  getOne: (id) => apiCall(`/customers/${id}`),
  create: (data) => {
    const shopId = getSelectedShopId();
    if (shopId && !data.shopId) {
      data.shopId = shopId;
    }
    return apiCall('/customers', { method: 'POST', body: data });
  },
  update: (id, data) => apiCall(`/customers/${id}`, { method: 'PATCH', body: data }),
  delete: (id) => apiCall(`/customers/${id}`, { method: 'DELETE' }),
};

export const ordersApi = {
  getAll: (page, limit, filters) => {
    const options = { page, limit, filters };
    const shopId = resolveShopId(filters);
    if (shopId) {
      options.shopId = shopId;
    }
    return apiCall('/orders', options);
  },
  getOne: (id) => apiCall(`/orders/${id}`),
  create: (data) => {
    const shopId = getSelectedShopId();
    if (shopId && !data.shopId) {
      data.shopId = shopId;
    }
    return apiCall('/orders', { method: 'POST', body: data });
  },
  update: (id, data) => apiCall(`/orders/${id}`, { method: 'PATCH', body: data }),
  returnItems: (id, itemId, returnedQuantity) => apiCall(`/orders/${id}/return-items`, { 
    method: 'POST', 
    body: { itemId, returnedQuantity } 
  }),
  delete: (id) => apiCall(`/orders/${id}`, { method: 'DELETE' }),
};

export const purchasesApi = {
  getAll: (page, limit, filters) => {
    const options = { page, limit, filters: {} };
    const shopId = resolveShopId(filters);
    if (shopId) {
      options.shopId = shopId;
    }
    // Pass date filters in filters object
    if (filters?.date) options.filters.date = filters.date;
    if (filters?.dateFrom) options.filters.dateFrom = filters.dateFrom;
    if (filters?.dateTo) options.filters.dateTo = filters.dateTo;
    // Pass itemId as a separate option (not in filters)
    if (filters?.itemId) options.itemId = filters.itemId;
    if (filters?.sellerId) options.filters.sellerId = filters.sellerId;
    if (filters?.condition) options.filters.condition = filters.condition;
    return apiCall('/purchases', options);
  },
  getOne: (id) => apiCall(`/purchases/${id}`),
  getTotals: (filters) => {
    const options = { filters: {} };
    const shopId = resolveShopId(filters);
    if (shopId) {
      options.shopId = shopId;
    }
    if (filters?.date) options.filters.date = filters.date;
    if (filters?.dateFrom) options.filters.dateFrom = filters.dateFrom;
    if (filters?.dateTo) options.filters.dateTo = filters.dateTo;
    if (filters?.itemId) options.itemId = filters.itemId;
    if (filters?.sellerId) options.filters.sellerId = filters.sellerId;
    if (filters?.condition) options.filters.condition = filters.condition;
    return apiCall('/purchases/totals', options);
  },
  create: (data) => {
    const shopId = getSelectedShopId();
    if (shopId && !data.shopId) {
      data.shopId = shopId;
    }
    return apiCall('/purchases', { method: 'POST', body: data });
  },
  update: (id, data) => apiCall(`/purchases/${id}`, { method: 'PATCH', body: data }),
  delete: (id) => apiCall(`/purchases/${id}`, { method: 'DELETE' }),
};

export const expensesApi = {
  getAll: (page, limit, filters) => {
    const options = { page, limit, filters };
    const shopId = resolveShopId(filters);
    if (shopId) {
      options.shopId = shopId;
    }
    return apiCall('/expense', options);
  },
  getOne: (id) => apiCall(`/expense/${id}`),
  getTotals: (filters) => {
    const options = { filters: {} };
    const shopId = resolveShopId(filters);
    if (shopId) {
      options.shopId = shopId;
    }
    if (filters?.date) options.filters.date = filters.date;
    if (filters?.dateFrom) options.filters.dateFrom = filters.dateFrom;
    if (filters?.dateTo) options.filters.dateTo = filters.dateTo;
    return apiCall('/expense/totals', options);
  },
  create: (data) => {
    const shopId = getSelectedShopId();
    if (shopId && !data.shopId) {
      data.shopId = shopId;
    }
    return apiCall('/expense', { method: 'POST', body: data });
  },
  update: (id, data) => apiCall(`/expense/${id}`, { method: 'PATCH', body: data }),
  delete: (id) => apiCall(`/expense/${id}`, { method: 'DELETE' }),
};

export const issuesApi = {
  getAll: () => apiCall('/issues'),
  getOne: (id) => apiCall(`/issues/${id}`),
  create: (data) => apiCall('/issues', { method: 'POST', body: data }),
  update: (id, data) => apiCall(`/issues/${id}`, { method: 'PATCH', body: data }),
  delete: (id) => apiCall(`/issues/${id}`, { method: 'DELETE' }),
};
