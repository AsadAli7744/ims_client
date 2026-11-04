import React, { useState } from 'react';
import Listing from '../../components/Listing';
import { paymentsApi } from '../../services/api';
import { formatAmount } from '../../utils/formatAmount';
import { isSuperAdmin } from '../../services/session';
import PaymentFilterPanel from './PaymentFilterPanel';
import { paymentTypeLabel } from './paymentLabels';
import PaymentItemsModal from './PaymentItemsModal';
import './PaymentItemsModal.css';

const isGeneralPayment = (row) => row?.sourceType === 'in' || row?.sourceType === 'out';

const PaymentList = () => {
  const [selectedPayment, setSelectedPayment] = useState(null);

  const renderItemsCell = (row) => {
    if (isGeneralPayment(row)) {
      return <span className="payment-items-general">—</span>;
    }

    if (row.sourceType === 'sale') {
      const saleItems = (row.sale?.saleItems || []).filter((si) => !si.is_archived);

      if (saleItems.length === 0) {
        if (row.sale?.id) {
          return (
            <button
              type="button"
              className="payment-items-btn"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedPayment(row);
              }}
              title="Click to view sale items"
            >
              <span className="payment-items-fallback">Sale #{row.sale.id}</span>
            </button>
          );
        }
        return <span className="payment-items-none">—</span>;
      }

      if (saleItems.length === 1) {
        const item = saleItems[0]?.item;
        const itemName = item?.name || 'Item';
        const qty = saleItems[0]?.quantity || 1;
        const label = `${itemName}${qty > 1 ? ` (×${qty})` : ''}`;

        return (
          <button
            type="button"
            className="payment-items-btn payment-items-btn-single"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedPayment(row);
            }}
            title={
              item?.uniqueIdentifier
                ? `${label} · IMEI: ${item.uniqueIdentifier}`
                : `${label} · Click to view details`
            }
          >
            <span className="payment-item-name">{label}</span>
          </button>
        );
      }

      // More than 1 item -> display preview with count badge; click opens popup
      const firstItem = saleItems[0]?.item;
      const firstItemName = firstItem?.name || 'Item';
      const firstQty = saleItems[0]?.quantity || 1;
      const remainingCount = saleItems.length - 1;
      const firstLabel = `${firstItemName}${firstQty > 1 ? ` (×${firstQty})` : ''}`;

      return (
        <button
          type="button"
          className="payment-items-btn payment-items-btn-multi"
          onClick={(e) => {
            e.stopPropagation();
            setSelectedPayment(row);
          }}
          title={`Click to view all ${saleItems.length} items`}
        >
          <span className="payment-item-name">{firstLabel}</span>
          <span className="payment-items-badge">+{remainingCount} more</span>
        </button>
      );
    }

    if (row.sourceType === 'purchase') {
      const item = row.purchase?.item;
      if (item) {
        const itemName = item.name || 'Item';
        const qty = row.purchase?.quantity || 1;
        const label = `${itemName}${qty > 1 ? ` (×${qty})` : ''}`;

        return (
          <button
            type="button"
            className="payment-items-btn payment-items-btn-single"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedPayment(row);
            }}
            title={
              item.uniqueIdentifier
                ? `${label} · IMEI: ${item.uniqueIdentifier}`
                : `${label} · Click to view details`
            }
          >
            <span className="payment-item-name">{label}</span>
          </button>
        );
      }

      if (row.purchase?.id) {
        return (
          <button
            type="button"
            className="payment-items-btn"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedPayment(row);
            }}
            title="Click to view purchase details"
          >
            <span className="payment-items-fallback">Purchase #{row.purchase.id}</span>
          </button>
        );
      }

      return <span className="payment-items-none">—</span>;
    }

    return <span className="payment-items-none">—</span>;
  };

  const columns = [
    {
      header: 'Type',
      accessor: 'sourceType',
      render: (value) => paymentTypeLabel(value),
    },
    {
      header: 'Items',
      accessor: 'id',
      render: (_value, row) => renderItemsCell(row),
    },
    {
      header: 'Cash',
      accessor: 'cashAmount',
      render: (value, row) => {
        const amount = Number(value || 0);
        if (row.sourceType === 'out') {
          return amount ? `−${formatAmount(amount)}` : formatAmount(0);
        }
        return formatAmount(amount);
      },
    },
    {
      header: 'Account',
      accessor: 'accountAmount',
      render: (value, row) => {
        const amount = Number(value || 0);
        if (row.sourceType === 'out') {
          return amount ? `−${formatAmount(amount)}` : formatAmount(0);
        }
        return formatAmount(amount);
      },
    },
    {
      header: 'Total',
      accessor: 'cashAmount',
      render: (_value, row) => {
        const amount = Number(row.cashAmount || 0) + Number(row.accountAmount || 0);
        if (row.sourceType === 'out') {
          return amount ? `−${formatAmount(amount)}` : formatAmount(0);
        }
        return formatAmount(amount);
      },
    },
    {
      header: 'Person',
      accessor: 'receiverName',
      render: (value) => value || '—',
    },
    {
      header: 'Notes',
      accessor: 'notes',
      render: (value) => value || '—',
    },
    {
      header: 'Date',
      accessor: 'createdAt',
      render: (value) => {
        if (!value) return 'N/A';
        const date = new Date(value);
        return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
      },
    },
  ];

  const totalsConfig = [
    { key: 'cashTotal', label: 'Cash All', format: 'currency' },
    { key: 'accountTotal', label: 'Account All', format: 'currency' },
    { key: 'inTotal', label: 'In total', format: 'currency' },
    { key: 'outTotal', label: 'Out total', format: 'currency' },
  ];

  return (
    <>
      <Listing
        title="Payments"
        columns={columns}
        fetchData={paymentsApi.getAll}
        basePath="/payments"
        onDelete={isSuperAdmin() ? paymentsApi.delete : undefined}
        writePermission="payments.write"
        canEdit={isGeneralPayment}
        fetchTotals={paymentsApi.getTotals}
        totalsConfig={totalsConfig}
        renderFilters={(handleFilterChange, currentFilters, handleClear) => (
          <PaymentFilterPanel
            onFilterChange={handleFilterChange}
            currentFilters={currentFilters}
            onClear={handleClear}
          />
        )}
      />
      {selectedPayment && (
        <PaymentItemsModal
          payment={selectedPayment}
          onClose={() => setSelectedPayment(null)}
        />
      )}
    </>
  );
};

export default PaymentList;
