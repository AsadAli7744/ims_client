import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navigation from '../../components/Navigation';
import { paymentsApi } from '../../services/api';
import { formatAmount } from '../../utils/formatAmount';
import { hasPermission } from '../../services/session';
import { paymentTypeLabel } from './paymentLabels';
import { conditionLabel } from '../items/itemCondition';
import '../../components/SingleView.css';

const PaymentView = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const canWrite = hasPermission('payments.write');
  const isGeneral = payment?.sourceType === 'in' || payment?.sourceType === 'out';

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    paymentsApi.getOne(id)
      .then((data) => {
        if (!cancelled) setPayment(data?.error ? null : data);
      })
      .catch(() => {
        if (!cancelled) setPayment(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [id]);

  if (loading) {
    return (
      <div>
        <Navigation />
        <div className="single-view-container"><p>Loading...</p></div>
      </div>
    );
  }

  if (!payment) {
    return (
      <div>
        <Navigation />
        <div className="single-view-container">
          <p>Payment not found</p>
          <button type="button" onClick={() => navigate('/payments')} className="single-view-button">
            Back to List
          </button>
        </div>
      </div>
    );
  }

  const fields = [
    { label: 'Type', value: paymentTypeLabel(payment.sourceType) },
    { label: 'Linked sale', value: payment.sale?.id ? `#${payment.sale.id}` : '—' },
    { label: 'Linked purchase', value: payment.purchase?.id ? `#${payment.purchase.id}` : '—' },
    { label: 'Cash amount', value: formatAmount(payment.cashAmount) },
    { label: 'Account amount', value: formatAmount(payment.accountAmount) },
    {
      label: 'Total',
      value: formatAmount(Number(payment.cashAmount || 0) + Number(payment.accountAmount || 0)),
    },
    { label: 'Person', value: payment.receiverName || '—' },
    { label: 'Notes', value: payment.notes || '—' },
    { label: 'Shop', value: payment.shop?.name || '—' },
    {
      label: 'Created',
      value: payment.createdAt
        ? `${new Date(payment.createdAt).toLocaleDateString()} ${new Date(payment.createdAt).toLocaleTimeString()}`
        : 'N/A',
    },
  ];

  const saleItems = (payment.sale?.saleItems || []).filter((si) => !si.is_archived);
  const purchaseItem = payment.purchase?.item;

  return (
    <div>
      <Navigation />
      <div className="single-view-container">
        <div className="single-view-header">
          <h1>Payment Details</h1>
          <div className="single-view-actions">
            <button type="button" onClick={() => navigate('/payments')} className="single-view-button">
              Back
            </button>
            {canWrite && isGeneral && (
              <button
                type="button"
                onClick={() => navigate(`/payments/${id}/edit`)}
                className="single-view-button single-view-button-primary"
              >
                Edit
              </button>
            )}
          </div>
        </div>

        <div className="single-view-content">
          {fields.map((field) => (
            <div key={field.label} className="single-view-field">
              <label className="single-view-label">{field.label}:</label>
              <div className="single-view-value">{field.value}</div>
            </div>
          ))}
        </div>

        {saleItems.length > 0 && (
          <div className="single-view-content" style={{ marginTop: 20 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 12px 0' }}>Sale Items ({saleItems.length})</h2>
            <div style={{ overflowX: 'auto', width: '100%' }}>
              <table className="common-table" style={{ width: '100%' }}>
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>IMEI / Identifier</th>
                    <th>Condition</th>
                    <th>Qty</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {saleItems.map((si, idx) => (
                    <tr key={si.id || idx}>
                      <td><strong>{si.item?.name || 'Item'}</strong></td>
                      <td>
                        {si.item?.uniqueIdentifier ? (
                          <span style={{ fontFamily: 'monospace', background: '#f3f4f6', padding: '2px 6px', borderRadius: 4 }}>
                            {si.item.uniqueIdentifier}
                          </span>
                        ) : '—'}
                      </td>
                      <td>{si.item?.condition ? conditionLabel(si.item.condition) : '—'}</td>
                      <td>{si.quantity || 1}</td>
                      <td>{formatAmount(si.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {purchaseItem && (
          <div className="single-view-content" style={{ marginTop: 20 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 12px 0' }}>Purchase Item</h2>
            <div style={{ overflowX: 'auto', width: '100%' }}>
              <table className="common-table" style={{ width: '100%' }}>
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>IMEI / Identifier</th>
                    <th>Specs</th>
                    <th>Condition</th>
                    <th>Qty</th>
                    <th>Price</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>{purchaseItem.name || 'Item'}</strong></td>
                    <td>
                      {purchaseItem.uniqueIdentifier ? (
                        <span style={{ fontFamily: 'monospace', background: '#f3f4f6', padding: '2px 6px', borderRadius: 4 }}>
                          {purchaseItem.uniqueIdentifier}
                        </span>
                      ) : '—'}
                    </td>
                    <td>
                      {[payment.purchase.ram && `RAM: ${payment.purchase.ram}`, payment.purchase.rom && `ROM: ${payment.purchase.rom}`]
                        .filter(Boolean)
                        .join(' · ') || '—'}
                    </td>
                    <td>{purchaseItem.condition ? conditionLabel(purchaseItem.condition) : '—'}</td>
                    <td>{payment.purchase.quantity || 1}</td>
                    <td>{formatAmount(payment.purchase.purchasePrice)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentView;
