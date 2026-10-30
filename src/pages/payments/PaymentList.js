import React from 'react';
import Listing from '../../components/Listing';
import { paymentsApi } from '../../services/api';
import { formatAmount } from '../../utils/formatAmount';
import { isSuperAdmin } from '../../services/session';
import PaymentFilterPanel from './PaymentFilterPanel';
import { paymentTypeLabel } from './paymentLabels';

const isGeneralPayment = (row) => row?.sourceType === 'in' || row?.sourceType === 'out';

const PaymentList = () => {
  const columns = [
    {
      header: 'Type',
      accessor: 'sourceType',
      render: (value) => paymentTypeLabel(value),
    },
    {
      header: 'Ref',
      accessor: 'id',
      render: (_value, row) => {
        if (row.sourceType === 'purchase' && row.purchase?.id) {
          return `Purchase #${row.purchase.id}`;
        }
        if (row.sourceType === 'sale' && row.sale?.id) {
          return `Sale #${row.sale.id}`;
        }
        if (isGeneralPayment(row)) {
          return 'General';
        }
        return '—';
      },
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
  );
};

export default PaymentList;
