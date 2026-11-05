import React, { useState } from 'react';
import Listing from '../../components/Listing';
import { salesApi } from '../../services/api';
import SaleFilterPanel from './SaleFilterPanel';
import { moneyText, paymentLabel } from './salePayment';
import SaleItemsModal from './SaleItemsModal';
import './SaleItemsModal.css';
import './SaleView.css';

const SaleList = () => {
  const [selectedSale, setSelectedSale] = useState(null);

  const renderItemsCell = (saleItems, row) => {
    const items = (saleItems || row?.saleItems || []).filter((si) => !si.is_archived);

    if (items.length === 0) {
      if (row?.id) {
        return (
          <button
            type="button"
            className="sale-items-btn"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedSale(row);
            }}
            title="Click to view sale items"
          >
            <span className="sale-items-fallback">Sale #{row.id}</span>
          </button>
        );
      }
      return <span className="sale-items-none">No items</span>;
    }

    if (items.length === 1) {
      const item = items[0]?.item;
      const itemName = item?.name || 'Item';
      const qty = items[0]?.quantity || 1;
      const label = `${itemName}${qty > 1 ? ` (×${qty})` : ''}`;

      return (
        <button
          type="button"
          className="sale-items-btn sale-items-btn-single"
          onClick={(e) => {
            e.stopPropagation();
            setSelectedSale(row);
          }}
          title={
            item?.uniqueIdentifier
              ? `${label} · IMEI: ${item.uniqueIdentifier}`
              : `${label} · Click to view details`
          }
        >
          <span className="sale-item-name">{label}</span>
        </button>
      );
    }

    // More than 1 item -> display preview with count badge; click opens popup
    const firstItem = items[0]?.item;
    const firstItemName = firstItem?.name || 'Item';
    const firstQty = items[0]?.quantity || 1;
    const remainingCount = items.length - 1;
    const firstLabel = `${firstItemName}${firstQty > 1 ? ` (×${firstQty})` : ''}`;

    return (
      <button
        type="button"
        className="sale-items-btn sale-items-btn-multi"
        onClick={(e) => {
          e.stopPropagation();
          setSelectedSale(row);
        }}
        title={`Click to view all ${items.length} items`}
      >
        <span className="sale-item-name">{firstLabel}</span>
        <span className="sale-items-badge">+{remainingCount} more</span>
      </button>
    );
  };

  const columns = [
    {
      header: 'Customer',
      accessor: 'customer',
      render: (value) => value?.name || 'Walk-in',
    },
    {
      header: 'Items',
      accessor: 'saleItems',
      render: (value, row) => renderItemsCell(value, row),
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
      header: 'Payment',
      accessor: 'paymentStatus',
      render: (value) => (
        <span className={`payment-badge payment-badge-${value || 'completed'}`}>
          {paymentLabel(value)}
        </span>
      ),
    },
    {
      header: 'Due',
      accessor: 'nextDueDate',
      render: (value, row) => value || row.promiseDate || '—',
    },
    {
      header: 'Total Profit',
      accessor: 'totalProfit',
      render: (value) => moneyText(value),
    },
    {
      header: 'Date',
      accessor: 'createdAt',
      render: (value) => {
        if (!value) return 'N/A';
        const date = new Date(value);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
      },
    },
  ];

  const totalsConfig = [
    { key: 'totalAmount', label: 'Total Selling Price', format: 'currency' },
    { key: 'totalProfit', label: 'Total Profit', format: 'currency' },
    { key: 'outstanding', label: 'Outstanding', format: 'currency' },
  ];

  return (
    <>
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
      {selectedSale && (
        <SaleItemsModal
          sale={selectedSale}
          onClose={() => setSelectedSale(null)}
        />
      )}
    </>
  );
};

export default SaleList;
