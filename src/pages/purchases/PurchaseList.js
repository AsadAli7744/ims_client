import React from 'react';
import Listing from '../../components/Listing';
import { purchasesApi } from '../../services/api';
import { formatAmount } from '../../utils/formatAmount';
import { itemOptionLabel } from '../items/itemCondition';
import PurchaseFilterPanel from './PurchaseFilterPanel';

const PurchaseList = () => {
  const columns = [
    { 
      header: 'Item', 
      accessor: 'item',
      render: (value) => {
        if (!value) return 'N/A';
        return itemOptionLabel(value);
      }
    },
    { 
      header: 'Purchase Price (per unit)', 
      accessor: 'purchasePrice',
      render: (value) => formatAmount(value)
    },
    { 
      header: 'Quantity', 
      accessor: 'quantity',
      render: (value) => value || 1
    },
    { 
      header: 'Total Amount', 
      accessor: 'totalAmount',
      render: (value, row) => {
        const price = typeof row.purchasePrice === 'string' 
          ? parseFloat(row.purchasePrice) 
          : (row.purchasePrice || 0);
        const qty = row.quantity || 1;
        return formatAmount(price * qty);
      }
    },
    { 
      header: 'Purchase Date', 
      accessor: 'purchaseDate',
      render: (value) => {
        if (!value) return 'N/A';
        const date = new Date(value);
        return date.toLocaleDateString();
      }
    },
    {
      header: 'Invoice price',
      accessor: 'invoicePrice',
      render: (value) => (value == null || value === '' ? '—' : formatAmount(value)),
    },
    {
      header: 'RAM',
      accessor: 'ram',
      render: (value) => value || '—',
    },
    {
      header: 'ROM',
      accessor: 'rom',
      render: (value) => value || '—',
    },
    {
      header: 'Seller',
      accessor: 'seller',
      render: (value) => value?.name || '—',
    },
    { 
      header: 'Created At', 
      accessor: 'createdAt',
      render: (value) => {
        if (!value) return 'N/A';
        const date = new Date(value);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
      }
    },
  ];

  const totalsConfig = [
    { key: 'total', label: 'Total Purchases', format: 'currency' },
  ];

  return (
    <Listing
      title="Purchases"
      columns={columns}
      fetchData={purchasesApi.getAll}
      basePath="/purchases"
      onDelete={purchasesApi.delete}
      writePermission="purchases.write"
      deletePermission="purchases.delete"
      fetchTotals={purchasesApi.getTotals}
      totalsConfig={totalsConfig}
      renderFilters={(handleFilterChange, currentFilters, handleClear) => (
        <PurchaseFilterPanel
          onFilterChange={handleFilterChange}
          onClear={handleClear}
          currentFilters={currentFilters}
        />
      )}
    />
  );
};

export default PurchaseList;
