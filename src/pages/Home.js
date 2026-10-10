import React, { useCallback, useEffect, useState } from 'react';
import Navigation from '../components/Navigation';
import { expensesApi, installmentsApi, purchasesApi, salesApi, servicesApi, shopsApi, unwrapList } from '../services/api';
import { hasPermission } from '../services/session';
import { formatAmount } from '../utils/formatAmount';
import './installments/Installments.css';
import { useShop } from '../contexts/ShopContext';
import CollapsibleFilters from '../components/CollapsibleFilters';
import ItemTypeFilterField from '../components/ItemTypeFilterField';
import '../components/FilterPanel.css';
import './Home.css';

const emptyFilters = {
  date: '',
  dateFrom: '',
  dateTo: '',
  itemTypeId: '',
};

const money = (value) => formatAmount(value);

const Home = () => {
  const { selectedShop } = useShop();
  const [filters, setFilters] = useState(emptyFilters);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    sales: 0,
    services: 0,
    outstanding: 0,
    purchases: 0,
    expenses: 0,
    profit: 0,
    stockValue: 0,
    installments: 0,
    installmentsPending: 0,
    installmentsDueSoon: 0,
    installmentsWeek: 0,
  });
  const [salesByType, setSalesByType] = useState([]);

  const loadStockValue = useCallback(async () => {
    if (selectedShop?.id) {
      const result = await shopsApi.getAssetValue(selectedShop.id);
      return Number(result?.assetValue || 0);
    }
    if (!hasPermission('shops')) {
      return 0;
    }
    const shops = unwrapList(await shopsApi.getAll());
    if (!shops.length) {
      return 0;
    }
    const values = await Promise.all(
      shops.map(async (shop) => {
        try {
          const result = await shopsApi.getAssetValue(shop.id);
          return Number(result?.assetValue || 0);
        } catch (err) {
          return 0;
        }
      })
    );
    return values.reduce((sum, value) => sum + value, 0);
  }, [selectedShop]);

  const loadStats = useCallback(async () => {
    setLoading(true);
    setError('');
    const query = {};
    if (filters.date) {
      query.date = filters.date;
    } else {
      if (filters.dateFrom) query.dateFrom = filters.dateFrom;
      if (filters.dateTo) query.dateTo = filters.dateTo;
    }
    if (selectedShop?.id) {
      query.shopId = selectedShop.id;
    }
    if (filters.itemTypeId) {
      query.itemTypeId = filters.itemTypeId;
    }
    try {
      const canSales = hasPermission('sales');
      const canServices = hasPermission('services');
      const canInstallments = hasPermission('installments');
      const canPurchases = hasPermission('purchases');
      const canExpenses = hasPermission('expenses');
      const canStock = hasPermission('items') || hasPermission('shops');
      const [salesTotals, serviceTotals, installmentTotals, purchaseTotals, expenseTotals, stockValue, byType] = await Promise.all([
        canSales ? salesApi.getTotals(query, selectedShop?.id) : Promise.resolve({}),
        canServices ? servicesApi.getTotals(query, selectedShop?.id) : Promise.resolve({}),
        canInstallments ? installmentsApi.getTotals(query, selectedShop?.id) : Promise.resolve({}),
        canPurchases ? purchasesApi.getTotals(query) : Promise.resolve({}),
        canExpenses ? expensesApi.getTotals(query) : Promise.resolve({}),
        canStock ? loadStockValue() : Promise.resolve(0),
        canSales ? salesApi.getTotalsByType(query, selectedShop?.id) : Promise.resolve([]),
      ]);
      const hasDate = !!(filters.date || filters.dateFrom || filters.dateTo);
      const installmentProfit = canInstallments
        ? (hasDate
          ? Number(installmentTotals?.periodProfit ?? installmentTotals?.profit ?? 0)
          : Number(installmentTotals?.profit || 0))
        : 0;
      setStats({
        sales: canSales ? Number(salesTotals?.totalAmount || 0) : 0,
        services: canServices ? Number(serviceTotals?.totalAmount || 0) : 0,
        outstanding:
          (canSales ? Number(salesTotals?.outstanding || 0) : 0)
          + (canServices ? Number(serviceTotals?.outstanding || 0) : 0)
          + (canInstallments ? Number(installmentTotals?.pending || 0) : 0),
        purchases: canPurchases ? Number(purchaseTotals?.total || 0) : 0,
        expenses: canExpenses ? Number(expenseTotals?.total || 0) : 0,
        profit:
          (canSales ? Number(salesTotals?.totalProfit || 0) : 0)
          + (canServices ? Number(serviceTotals?.totalProfit || 0) : 0)
          + installmentProfit,
        stockValue: Number(stockValue || 0),
        installments: installmentProfit,
        installmentsPending: Number(installmentTotals?.pending || 0),
        installmentsDueSoon: Number(installmentTotals?.dueSoon || 0),
        installmentsWeek: Number(installmentTotals?.completedThisWeek || 0),
      });
      setSalesByType(Array.isArray(byType) ? byType : []);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard');
      setSalesByType([]);
    } finally {
      setLoading(false);
    }
  }, [filters.date, filters.dateFrom, filters.dateTo, filters.itemTypeId, loadStockValue, selectedShop?.id]);

  useEffect(() => {
    loadStats();
    const refresh = () => loadStats();
    window.addEventListener('ims-session', refresh);
    return () => window.removeEventListener('ims-session', refresh);
  }, [loadStats]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => {
      const next = { ...prev, [name]: value };
      if (name === 'date' && value) {
        next.dateFrom = '';
        next.dateTo = '';
      }
      if ((name === 'dateFrom' || name === 'dateTo') && (value || (name === 'dateFrom' ? next.dateTo : next.dateFrom))) {
        next.date = '';
      }
      return next;
    });
  };

  const handleClear = () => {
    setFilters(emptyFilters);
  };

  const periodLabel = filters.date
    ? `Date: ${filters.date}`
    : (filters.dateFrom || filters.dateTo)
      ? `Range: ${filters.dateFrom || '...'} to ${filters.dateTo || '...'}`
      : 'All time';

  const canSales = hasPermission('sales');
  const canServices = hasPermission('services');
  const canInstallments = hasPermission('installments');
  const canPurchases = hasPermission('purchases');
  const canExpenses = hasPermission('expenses');
  const canStock = hasPermission('items') || hasPermission('shops');
  const outstandingParts = [
    canSales && 'sales',
    canServices && 'services',
    canInstallments && 'installments',
  ].filter(Boolean);
  const cards = [
    canSales && { key: 'sales', label: 'Sales', value: stats.sales, hint: periodLabel },
    canServices && { key: 'services', label: 'Services', value: stats.services, hint: periodLabel },
    outstandingParts.length > 0 && {
      key: 'outstanding',
      label: 'Outstanding',
      value: stats.outstanding,
      hint: `Unpaid ${outstandingParts.join(', ')}`,
    },
    canPurchases && { key: 'purchases', label: 'Purchase', value: stats.purchases, hint: periodLabel },
    canExpenses && { key: 'expenses', label: 'Expense', value: stats.expenses, hint: periodLabel },
    outstandingParts.length > 0 && { key: 'profit', label: 'Profit', value: stats.profit, hint: periodLabel },
    canStock && { key: 'stockValue', label: 'Stock Value', value: stats.stockValue, hint: 'Current inventory' },
  ].filter(Boolean);

  return (
    <div>
      <Navigation />
      <div className="dashboard">
        <div className="dashboard-header">
          <h1>Dashboard</h1>
          {selectedShop && (
            <p className="dashboard-shop">Shop: {selectedShop.name}</p>
          )}
        </div>

        <CollapsibleFilters title="Filters">
          <div className="filter-panel">
            <div className="filter-panel-header">
              <h3>Filters</h3>
              <button type="button" onClick={handleClear} className="filter-clear-button">Clear</button>
            </div>
            <div className="filter-panel-body">
              <div className="filter-row">
                <div className="filter-field">
                  <label htmlFor="dashboard-date">Specific Date</label>
                  <input
                    type="date"
                    id="dashboard-date"
                    name="date"
                    value={filters.date}
                    onChange={handleFilterChange}
                    className="filter-input"
                  />
                </div>
                <div className="filter-field">
                  <label htmlFor="dashboard-dateFrom">Date From</label>
                  <input
                    type="date"
                    id="dashboard-dateFrom"
                    name="dateFrom"
                    value={filters.dateFrom}
                    onChange={handleFilterChange}
                    className="filter-input"
                  />
                </div>
                <div className="filter-field">
                  <label htmlFor="dashboard-dateTo">Date To</label>
                  <input
                    type="date"
                    id="dashboard-dateTo"
                    name="dateTo"
                    value={filters.dateTo}
                    onChange={handleFilterChange}
                    className="filter-input"
                  />
                </div>
                <ItemTypeFilterField filters={filters} onChange={handleFilterChange} />
              </div>
            </div>
          </div>
        </CollapsibleFilters>

        {error && <div className="dashboard-error">{error}</div>}

        <div className="dashboard-cards">
          {cards.length === 0 && !canInstallments && !loading && (
            <div className="dashboard-card">
              <div className="dashboard-card-label">No module totals</div>
              <div className="dashboard-card-value">—</div>
              <div className="dashboard-card-hint">Your account has no money-module access</div>
            </div>
          )}
          {cards.map((card) => (
            <div key={card.key} className={`dashboard-card dashboard-card-${card.key}`}>
              <div className="dashboard-card-label">{card.label}</div>
              <div className="dashboard-card-value">{loading ? '...' : money(card.value)}</div>
              <div className="dashboard-card-hint">{card.hint}</div>
            </div>
          ))}
        </div>

        {canInstallments && (
          <>
            <h2 className="dashboard-section-title">Installments</h2>
            <div className="dashboard-cards">
              {[
                { key: 'installments', label: 'Collected profit', value: stats.installments, hint: 'Down payments + dues collected' },
                { key: 'installmentsPending', label: 'Pending', value: stats.installmentsPending, hint: 'Due today or overdue' },
                { key: 'installmentsDueSoon', label: 'Due in 2 days', value: stats.installmentsDueSoon, hint: 'Call list' },
                { key: 'installmentsWeek', label: 'Completed this week', value: stats.installmentsWeek, hint: 'Paid this week' },
              ].map((card) => (
                <div key={card.key} className={`dashboard-card dashboard-card-${card.key}`}>
                  <div className="dashboard-card-label">{card.label}</div>
                  <div className="dashboard-card-value">{loading ? '...' : money(card.value)}</div>
                  <div className="dashboard-card-hint">{card.hint}</div>
                </div>
              ))}
            </div>
          </>
        )}

        {canSales && salesByType.length > 0 && (
          <>
            <h2 className="dashboard-section-title">Sales by item type</h2>
            <div className="dashboard-cards">
              {salesByType.map((row) => (
                <div key={row.itemTypeId ?? 'none'} className="dashboard-card dashboard-card-sales">
                  <div className="dashboard-card-label">{row.itemTypeName}</div>
                  <div className="dashboard-card-value">{loading ? '...' : money(row.totalAmount)}</div>
                  <div className="dashboard-card-hint">
                    Profit: {loading ? '...' : money(row.totalProfit)}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Home;
