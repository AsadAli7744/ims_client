import React from 'react';
import Listing from '../../components/Listing';
import { salesApi } from '../../services/api';
import PromiseFilterPanel from './PromiseFilterPanel';
import { moneyText, paymentLabel, todayIso } from '../sales/salePayment';
import '../sales/SaleView.css';

const promiseDueLabel = (row) => {
  const due = row.promiseDate || row.nextDueDate;
  if (!due) return '—';
  const today = todayIso();
  if (due < today) return 'Overdue';
  if (due === today) return 'Due today';
  return 'Upcoming';
};

const promiseDueClass = (row) => {
  const due = row.promiseDate || row.nextDueDate;
  if (!due) return 'pending';
  const today = todayIso();
  if (due < today) return 'pending';
  if (due === today) return 'partial';
  return 'completed';
};

const PromiseList = () => {
  const fetchPromises = (page, limit, filters = {}) =>
    salesApi.getAll(page, limit, { ...filters, promisesOnly: 'true' });

  const fetchTotals = (filters = {}) =>
    salesApi.getTotals({ ...filters, promisesOnly: 'true' });

  const columns = [
    {
      header: 'Customer',
      accessor: 'customer',
      render: (value) => value?.name || 'Walk-in',
    },
    {
      header: 'Promise date',
      accessor: 'promiseDate',
      render: (value, row) => value || row.nextDueDate || '—',
    },
    {
      header: 'Due status',
      accessor: 'promiseDate',
      render: (_value, row) => (
        <span className={`payment-badge payment-badge-${promiseDueClass(row)}`}>
          {promiseDueLabel(row)}
        </span>
      ),
    },
    {
      header: 'Payment',
      accessor: 'paymentStatus',
      render: (value) => (
        <span className={`payment-badge payment-badge-${value || 'pending'}`}>
          {paymentLabel(value)}
        </span>
      ),
    },
    {
      header: 'Selling Price',
      accessor: 'totalAmount',
      render: (value) => moneyText(value),
    },
    {
      header: 'Paid',
      accessor: 'amountPaid',
      render: (value) => moneyText(value),
    },
    {
      header: 'Balance',
      accessor: 'balance',
      render: (value) => moneyText(value),
    },
    {
      header: 'Sale date',
      accessor: 'createdAt',
      render: (value) => {
        if (!value) return 'N/A';
        const date = new Date(value);
        return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
      },
    },
  ];

  return (
    <Listing
      title="Promises"
      columns={columns}
      fetchData={fetchPromises}
      basePath="/promises"
      getViewPath={(row) => `/sales/${row.id}`}
      getEditPath={(row) => `/sales/${row.id}/edit`}
      hideCreate
      writePermission="sales.write"
      fetchTotals={fetchTotals}
      totalsConfig={[
        { key: 'totalAmount', label: 'Total Selling Price', format: 'currency' },
        { key: 'outstanding', label: 'Outstanding', format: 'currency' },
      ]}
      renderFilters={(handleFilterChange, currentFilters, handleClear) => (
        <PromiseFilterPanel
          onFilterChange={handleFilterChange}
          onClear={handleClear}
          currentFilters={currentFilters}
        />
      )}
    />
  );
};

export default PromiseList;
