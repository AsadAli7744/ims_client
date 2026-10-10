import React from 'react';
import Listing from '../../components/Listing';
import { salesApi } from '../../services/api';
import SaleInstallmentFilterPanel from './SaleInstallmentFilterPanel';
import { FREQUENCY_LABELS, moneyText, paymentLabel, todayIso } from '../sales/salePayment';
import '../sales/SaleView.css';

const dueLabel = (row) => {
  const due = row.nextDueDate || row.promiseDate;
  if (!due) return '—';
  const today = todayIso();
  if (due < today) return 'Overdue';
  if (due === today) return 'Due today';
  return 'Upcoming';
};

const dueClass = (row) => {
  const due = row.nextDueDate || row.promiseDate;
  if (!due) return 'pending';
  const today = todayIso();
  if (due < today) return 'pending';
  if (due === today) return 'partial';
  return 'completed';
};

const SaleInstallmentList = () => {
  const fetchInstallments = (page, limit, filters = {}) =>
    salesApi.getAll(page, limit, { ...filters, installmentsOnly: 'true' });

  const fetchTotals = (filters = {}) =>
    salesApi.getTotals({ ...filters, installmentsOnly: 'true' });

  const columns = [
    {
      header: 'Customer',
      accessor: 'customer',
      render: (value) => value?.name || 'Walk-in',
    },
    {
      header: 'Plan',
      accessor: 'installmentMonths',
      render: (value, row) => {
        const months = value ? `${value} month${Number(value) === 1 ? '' : 's'}` : (FREQUENCY_LABELS[row.installmentFrequency] || 'Monthly');
        const amount = row.installmentAmount != null ? ` · ${moneyText(row.installmentAmount)}/mo` : '';
        return `${months}${amount}`;
      },
    },
    {
      header: 'Due date',
      accessor: 'nextDueDate',
      render: (value, row) => value || row.promiseDate || '—',
    },
    {
      header: 'Due status',
      accessor: 'nextDueDate',
      render: (_value, row) => (
        <span className={`payment-badge payment-badge-${dueClass(row)}`}>
          {dueLabel(row)}
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
      title="Installments"
      columns={columns}
      fetchData={fetchInstallments}
      basePath="/installments"
      getViewPath={(row) => `/sales/${row.id}`}
      getEditPath={(row) => `/sales/${row.id}/edit`}
      hideCreate
      writePermission="sales.write"
      fetchTotals={fetchTotals}
      totalsConfig={[
        { key: 'outstanding', label: 'Outstanding', format: 'currency' },
        { key: 'totalAmount', label: 'Total Selling Price', format: 'currency' },
      ]}
      renderFilters={(handleFilterChange, currentFilters, handleClear) => (
        <SaleInstallmentFilterPanel
          onFilterChange={handleFilterChange}
          onClear={handleClear}
          currentFilters={currentFilters}
        />
      )}
    />
  );
};

export default SaleInstallmentList;
