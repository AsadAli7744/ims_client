import React from 'react';
import Listing from '../../components/Listing';
import { installmentsApi } from '../../services/api';
import InstallmentFilterPanel from './InstallmentFilterPanel';
import { DUE_LABELS, moneyText } from '../sales/salePayment';
import '../sales/SaleView.css';
import './Installments.css';

const InstallmentList = () => {
  const columns = [
    {
      header: 'Title',
      accessor: 'plan',
      render: (value) => value?.title || '—',
    },
    {
      header: 'Customer',
      accessor: 'plan',
      render: (value) => value?.customer?.name || '—',
    },
    {
      header: '#',
      accessor: 'sequence',
      render: (value, row) => `${value}${row.plan?.installmentCount ? ` / ${row.plan.installmentCount}` : ''}`,
    },
    {
      header: 'Due date',
      accessor: 'dueDate',
      render: (value) => value || '—',
    },
    {
      header: 'Amount',
      accessor: 'amount',
      render: (value) => moneyText(value),
    },
    {
      header: 'Paid',
      accessor: 'paidAmount',
      render: (value) => moneyText(value),
    },
    {
      header: 'Remaining',
      accessor: 'remaining',
      render: (value) => moneyText(value),
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (value) => (
        <span className={`payment-badge payment-badge-${value === 'completed' ? 'completed' : value === 'upcoming' ? 'partial' : 'pending'}`}>
          {DUE_LABELS[value] || value}
        </span>
      ),
    },
  ];

  return (
    <Listing
      title="Installment Plans"
      columns={columns}
      fetchData={installmentsApi.getAll}
      basePath="/installment-plans"
      createPath="/installments/plans/create"
      getViewPath={(row) => (row.plan?.id ? `/installments/plans/${row.plan.id}` : '/installment-plans')}
      hideEdit
      writePermission="installments.write"
      fetchTotals={installmentsApi.getTotals}
      totalsConfig={[
        { key: 'pending', label: 'Pending', format: 'currency' },
        { key: 'dueSoon', label: 'Due in 2 days', format: 'currency' },
        { key: 'upcoming', label: 'Upcoming', format: 'currency' },
        { key: 'completedThisWeek', label: 'Completed this week', format: 'currency' },
        { key: 'profit', label: 'Collected profit', format: 'currency' },
      ]}
      renderFilters={(handleFilterChange, currentFilters, handleClear) => (
        <InstallmentFilterPanel
          onFilterChange={handleFilterChange}
          onClear={handleClear}
          currentFilters={currentFilters}
        />
      )}
    />
  );
};

export default InstallmentList;
