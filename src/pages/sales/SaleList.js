import React from 'react';
import Listing from '../../components/Listing';
import { salesApi } from '../../services/api';
import SaleFilterPanel from './SaleFilterPanel';
import { moneyText, paymentLabel } from './salePayment';
import './SaleView.css';

const SaleList = () => {
  const columns = [
    {
      header: 'Customer',
      accessor: 'customer',
      render: (value) => value?.name || 'Walk-in',
    },
    {
      header: 'Items',
      accessor: 'saleItems',
      render: (value) => {
        if (!value || !Array.isArray(value)) return 'No items';
        return `${value.length} item(s)`;
      }
    },
    {
      header: 'Selling Price',
      accessor: 'totalAmount',
      render: (value) => moneyText(value)
    },
    {
      header: 'Paid',
      accessor: 'amountPaid',
      render: (value) => moneyText(value)
    },
    {
      header: 'Balance',
      accessor: 'balance',
      render: (value) => moneyText(value)
    },
    {
      header: 'Payment',
      accessor: 'paymentStatus',
      render: (value) => (
        <span className={`payment-badge payment-badge-${value || 'completed'}`}>
          {paymentLabel(value)}
        </span>
      )
    },
    {
      header: 'Due',
      accessor: 'nextDueDate',
      render: (value, row) => value || row.promiseDate || '—'
    },
    {
      header: 'Total Profit',
      accessor: 'totalProfit',
      render: (value) => moneyText(value)
    },
    {
      header: 'Date',
      accessor: 'createdAt',
      render: (value) => {
        if (!value) return 'N/A';
        const date = new Date(value);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
      }
    },
  ];

  const totalsConfig = [
    { key: 'totalAmount', label: 'Total Selling Price', format: 'currency' },
    { key: 'totalProfit', label: 'Total Profit', format: 'currency' },
    { key: 'outstanding', label: 'Outstanding', format: 'currency' },
  ];

  return (
    <Listing
      title="Sales"
      columns={columns}
      fetchData={salesApi.getAll}
      basePath="/sales"
      onDelete={salesApi.delete}
      writePermission="sales.write"
      deletePermission="sales.delete"
      fetchTotals={salesApi.getTotals}
      totalsConfig={totalsConfig}
      renderFilters={(handleFilterChange, currentFilters, handleClear) => (
        <SaleFilterPanel
          onFilterChange={handleFilterChange}
          onClear={handleClear}
          currentFilters={currentFilters}
        />
      )}
    />
  );
};

export default SaleList;
