import React, { useState, useEffect, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useShop } from '../contexts/ShopContext';
import { usersApi } from '../services/api';
import { clearSession, getToken, getUser, getViewTenantId, hasPermission, hasSingleAssignedShop, isSuperAdmin, isTenantAdmin, setViewTenantId } from '../services/session';
import './Navigation.css';

const SIDEBAR_KEY = 'ims.sidebar.collapsed';

const isActivePath = (pathname, path) => {
  if (path === '/home') {
    return pathname === '/home';
  }
  // Sale installments listing must not stay active on plan routes under /installments/plans
  if (path === '/installments') {
    return pathname === '/installments';
  }
  return pathname === path || pathname.startsWith(`${path}/`);
};

const readCollapsed = () => {
  try {
    return localStorage.getItem(SIDEBAR_KEY) === '1';
  } catch (e) {
    return false;
  }
};

const NavIcon = ({ name }) => {
  const icons = {
    dashboard: 'M3 10.5 12 3l9 7.5V21h-7v-6H10v6H3z',
    users: 'M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4zm-8 9v-1.2A6.8 6.8 0 0 1 12 13a6.8 6.8 0 0 1 8 6.8V21z',
    permissions: 'M12 2 4 5v6c0 5.2 3.4 10 8 11.2C16.6 21 20 16.2 20 11V5l-8-3z',
    sales: 'M4 18V8h4v10zm6 0V4h4v14zm6 0v-7h4v7z',
    promises: 'M19 4h-1V2h-2v2H8V2H6v2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm0 16H5V10h14zm0-12H5V6h14zm-7 5 1.4 1.4L16.2 11l1.4 1.4-3.2 3.2L11 12.2z',
    services: 'M21 7.5 12 2 3 7.5V21h7v-6h4v6h7z',
    installments: 'M7 3h10v3H7zm-3 5h16v13H4zm4 3h8v2H8z',
    customers: 'M8 11a3.5 3.5 0 1 0-3.5-3.5A3.5 3.5 0 0 0 8 11zm8 0a3 3 0 1 0-3-3 3 3 0 0 0 3 3zM2 20v-1.4A5.4 5.4 0 0 1 8 13a5.3 5.3 0 0 1 4.6 2.6A4.7 4.7 0 0 1 16 13a4.8 4.8 0 0 1 6 5.6V20z',
    sellers: 'M12 7a3 3 0 1 0-3-3 3 3 0 0 0 3 3zm-7 14v-1.3A6.3 6.3 0 0 1 12 13a6.3 6.3 0 0 1 7 6.7V21zM4 11h16v2H4z',
    items: 'M4 7 12 3l8 4-8 4-8-4zm0 5 8 4 8-4M4 17l8 4 8-4',
    transfers: 'M7 7h11l-3-3 1.4-1.4L21.8 8 16.4 13.4 15 12l3-3H7zm10 10H6l3 3-1.4 1.4L2.2 16 7.6 10.6 9 12l-3 3h11z',
    categories: 'M4 4h7v7H4zm9 0h7v7h-7zM4 13h7v7H4zm9 0h7v7h-7z',
    itemTypes: 'M4 4h6v6H4zm10 0h6v6h-6zM4 14h6v6H4zm10 2h2v2h-2zm4-2h2v6h-2zm-4 4h2v2h-2z',
    companies: 'M4 21V7l6-4 4 2.7V7h6v14H4zm4-3h2v-3H8zm5 0h2v-3h-2zm5 0h2v-3h-2z',
    purchases: 'M7 18a2 2 0 1 0 2 2 2 2 0 0 0-2-2zm10 0a2 2 0 1 0 2 2 2 2 0 0 0-2-2zM3 4h2l.4 2H21l-2.2 8H8.1L7 7.3 6.3 6H3zm5.3 8h9.2l1.2-4H7.6z',
    expenses: 'M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm1 15h-2v-2h2zm0-4h-2V7h2z',
    shops: 'M3 10 5 4h14l2 6v10H3zm3-4.5L5.2 9h13.6L16 5.5zM5 12h14v6H5z',
    stores: 'M4 7h16v3H4zm1 4h14v9H5zm3 2v5h2v-5zm6 0v5h2v-5z',
  };
  return (
    <svg className="sidebar-icon" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path fill="currentColor" d={icons[name] || icons.dashboard} />
    </svg>
  );
};

const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { selectedShop, hideStoresNav } = useShop();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(readCollapsed);
  const [user, setUser] = useState(getUser());
  const [tenants, setTenants] = useState([]);
  const [viewTenantId, setLocalTenantId] = useState(getViewTenantId() || '');

  useEffect(() => {
    const refreshUser = () => setUser(getUser());
    window.addEventListener('ims-session', refreshUser);
    window.addEventListener('storage', refreshUser);
    return () => {
      window.removeEventListener('ims-session', refreshUser);
      window.removeEventListener('storage', refreshUser);
    };
  }, []);

  useEffect(() => {
    document.body.classList.add('ims-has-sidebar');
    document.body.classList.toggle('ims-sidebar-collapsed', collapsed);
    return () => {
      document.body.classList.remove('ims-has-sidebar');
      document.body.classList.remove('ims-sidebar-collapsed');
    };
  }, [collapsed]);

  useEffect(() => {
    if (!getToken()) {
      navigate('/', { replace: true });
    }
  }, [navigate, user]);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!isSuperAdmin(user)) {
      return;
    }
    usersApi.getTenants().then(setTenants).catch(() => setTenants([]));
  }, [user]);

  const menuGroups = useMemo(() => {
    const adminItems = [];
    if (hasPermission('users', user) && (isSuperAdmin(user) || isTenantAdmin(user))) {
      if (isSuperAdmin(user)) {
        adminItems.push({ path: '/admin/users', label: 'Users', icon: 'users' });
        adminItems.push({ path: '/item-types', label: 'Item Types', icon: 'itemTypes' });
      }
      adminItems.push({ path: '/permissions', label: 'Permissions', icon: 'permissions' });
    }

    const groups = [
      { title: 'Overview', items: [{ path: '/home', label: 'Dashboard', module: 'dashboard', icon: 'dashboard' }, ...adminItems] },
      {
        title: 'Business',
        items: [
          { path: '/sales', label: 'Sales', module: 'sales', icon: 'sales' },
          { path: '/promises', label: 'Promises', module: 'sales', icon: 'promises' },
          { path: '/installments', label: 'Installments', module: 'sales', icon: 'installments' },
          { path: '/installment-plans', label: 'Installment Plans', module: 'installments', icon: 'installments' },
          { path: '/services', label: 'Services', module: 'services', icon: 'services' },
          { path: '/customers', label: 'Customers', module: 'customers', icon: 'customers' },
          { path: '/sellers', label: 'Sellers', module: 'sellers', icon: 'sellers' },
        ],
      },
      {
        title: 'Stock',
        items: [
          { path: '/items', label: 'Items', module: 'items', icon: 'items' },
          { path: '/stock-transfers', label: 'Stock Transfers', module: 'issues', icon: 'transfers' },
          { path: '/categories', label: 'Categories', module: 'categories', icon: 'categories' },
          { path: '/companies', label: 'Companies', module: 'companies', icon: 'companies' },
          { path: '/purchases', label: 'Purchases', module: 'purchases', icon: 'purchases' },
        ],
      },
      {
        title: 'Money',
        items: [{ path: '/expenses', label: 'Expenses', module: 'expenses', icon: 'expenses' }],
      },
      {
        title: 'Locations',
        items: [
          { path: '/shops', label: 'Shops', module: 'shops', hide: hasSingleAssignedShop(user), icon: 'shops' },
          { path: '/stores', label: 'Stores', module: 'stores', hide: hideStoresNav, icon: 'stores' },
        ],
      },
    ];

    return groups
      .map((group) => ({
        ...group,
        items: group.items.filter((item) => !item.hide && (!item.module || hasPermission(item.module, user))),
      }))
      .filter((group) => group.items.length > 0);
  }, [user, hideStoresNav]);

  const closeMenu = () => setIsMenuOpen(false);

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(SIDEBAR_KEY, next ? '1' : '0');
      } catch (e) {
        // ignore storage errors
      }
      return next;
    });
  };

  const handleLogout = () => {
    clearSession();
    setUser(null);
    navigate('/');
    closeMenu();
  };

  const handleTenantChange = (e) => {
    const value = e.target.value;
    setLocalTenantId(value);
    setViewTenantId(value || null);
  };

  const shopChip = selectedShop && (
    hasPermission('shops', user) && !hasSingleAssignedShop(user) ? (
      <Link to="/shops" className="nav-shop-info" onClick={closeMenu}>
        {selectedShop.name}
      </Link>
    ) : (
      <span className="nav-shop-info">{selectedShop.name}</span>
    )
  );

  return (
    <>
      <header className="sidebar-topbar">
        <button
          className="nav-toggle"
          onClick={() => setIsMenuOpen((open) => !open)}
          aria-label="Toggle menu"
          aria-expanded={isMenuOpen}
        >
          <span className={isMenuOpen ? 'hamburger open' : 'hamburger'}></span>
          <span className={isMenuOpen ? 'hamburger open' : 'hamburger'}></span>
          <span className={isMenuOpen ? 'hamburger open' : 'hamburger'}></span>
        </button>
        <h2 className="nav-logo">IMS</h2>
        {shopChip}
        {user ? (
          <button className="nav-logout-btn" onClick={handleLogout}>Logout</button>
        ) : (
          <button className="nav-login-btn" onClick={() => navigate('/')}>Login</button>
        )}
      </header>

      {isMenuOpen && <div className="sidebar-backdrop" onClick={closeMenu} />}

      <aside className={`sidebar ${isMenuOpen ? 'open' : ''} ${collapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-brand">
          <h2 className="nav-logo">{collapsed ? <NavIcon name="items" /> : 'IMS'}</h2>
          <button
            type="button"
            className="sidebar-collapse-btn"
            onClick={toggleCollapsed}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={collapsed ? 'Expand' : 'Collapse'}
          >
            {collapsed ? '›' : '‹'}
          </button>
        </div>

        <nav className="sidebar-nav">
          {menuGroups.map((group) => (
            <div key={group.title} className="sidebar-group">
              <p className="sidebar-group-title">{group.title}</p>
              <ul className="sidebar-menu">
                {group.items.map((item) => (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className={isActivePath(location.pathname, item.path) ? 'active' : ''}
                      onClick={closeMenu}
                      title={item.label}
                    >
                      <span className="sidebar-link-mark" aria-hidden="true">
                        <NavIcon name={item.icon} />
                      </span>
                      <span className="sidebar-link-label">{item.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          {user ? (
            <>
              {shopChip}
              {isSuperAdmin(user) && (
                <select
                  className="nav-tenant-select"
                  value={viewTenantId}
                  onChange={handleTenantChange}
                  title="Organization scope for create and list"
                >
                  <option value="">All organizations</option>
                  {tenants.map((tenant) => (
                    <option key={tenant.id} value={tenant.id}>{tenant.name}</option>
                  ))}
                </select>
              )}
              <span className="nav-user-info" title={user.name || user.email}>
                {user.name || user.email}
              </span>
              <button className="nav-logout-btn" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <button className="nav-login-btn" onClick={() => { navigate('/'); closeMenu(); }}>
              Login
            </button>
          )}
        </div>
      </aside>
    </>
  );
};

export default Navigation;
