import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navigation from '../../components/Navigation';
import Input from '../../components/Input';
import PermissionLink from '../../components/PermissionLink';
import DownloadPngButton from '../../components/DownloadPngButton';
import { salesApi } from '../../services/api';
import { FREQUENCY_LABELS, money, moneyText, paymentLabel, todayIso } from './salePayment';
import { itemOptionLabel } from '../items/itemCondition';
import { hasPermission } from '../../services/session';
import '../../components/SingleView.css';
import './SaleView.css';

const SaleView = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const captureRef = useRef(null);
  const [sale, setSale] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    paidOn: todayIso(),
    notes: '',
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const result = await salesApi.getOne(id);
      setSale(result);
    } catch (error) {
      console.error('Error loading sale:', error);
      setSale(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    const amount = money(paymentForm.amount);
    if (amount <= 0) {
      alert('Payment amount must be greater than 0');
      return;
    }
    if (amount > money(sale.balance) + 0.001) {
      alert(`Payment exceeds remaining balance of ${moneyText(sale.balance)}`);
      return;
    }
    setSaving(true);
    try {
      const updated = await salesApi.addPayment(id, {
        amount,
        paidOn: paymentForm.paidOn || todayIso(),
        notes: paymentForm.notes.trim() || undefined,
      });
      setSale(updated);
      setPaymentForm({ amount: '', paidOn: todayIso(), notes: '' });
    } catch (error) {
      alert(error.message || 'Failed to record payment');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div>
        <Navigation />
        <div className="sale-view-page">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!sale) {
    return (
      <div>
        <Navigation />
        <div className="sale-view-page">
          <p>Item not found</p>
          <button onClick={() => navigate('/sales')} className="single-view-button">
            Back to List
          </button>
        </div>
      </div>
    );
  }

  const remaining = money(sale.balance);
  const canWrite = hasPermission('sales.write');
  const payments = Array.isArray(sale.payments) ? sale.payments : [];
  const hasPlan = sale.installmentFrequency && sale.installmentFrequency !== 'none';
  const customerName = sale.customer?.name || 'Walk-in';
  const customerExtra = [sale.customer?.phone, sale.customer?.email].filter(Boolean).join(' · ');

  const Stat = ({ label, children }) => (
    <div className="sale-view-stat">
      <span>{label}</span>
      <strong>{children}</strong>
    </div>
  );

  return (
    <div>
      <Navigation />
      <div className="sale-view-page">
        <div className="sale-view-header">
          <div>
            <h1>Sale Details</h1>
            <p className="sale-view-subtitle">
              {sale.customer ? (
                <PermissionLink module="customers" to={`/customers/${sale.customer.id}`}>{customerName}</PermissionLink>
              ) : customerName}
              {customerExtra ? ` · ${customerExtra}` : ''}
            </p>
          </div>
          <div className="single-view-actions">
            <button onClick={() => navigate('/sales')} className="single-view-button">
              Back
            </button>
            <DownloadPngButton targetRef={captureRef} filename={`sale-${sale.id || id}.png`} />
            {canWrite && (
              <button onClick={() => navigate(`/sales/${id}/edit`)} className="single-view-button single-view-button-primary">
                Edit
              </button>
            )}
          </div>
        </div>

        <div ref={captureRef} className="download-capture">
        <div className="sale-view-card">
          <div className="sale-view-header" style={{ marginBottom: 12 }}>
            <div>
              <h1 style={{ fontSize: 22 }}>Sale #{sale.id}</h1>
              <p className="sale-view-subtitle">
                {customerName}
                {customerExtra ? ` · ${customerExtra}` : ''}
              </p>
            </div>
          </div>
          <div className="sale-view-grid">
            <Stat label="Customer">
              {sale.customer ? (
                <PermissionLink module="customers" to={`/customers/${sale.customer.id}`}>{customerName}</PermissionLink>
              ) : customerName}
            </Stat>
            <Stat label="Payment">
              <span className={`payment-badge payment-badge-${sale.paymentStatus || 'completed'}`}>
                {paymentLabel(sale.paymentStatus)}
              </span>
            </Stat>
            <Stat label="Total">{moneyText(sale.totalAmount)}</Stat>
            <Stat label="Paid">{moneyText(sale.amountPaid)}</Stat>
            <Stat label="Balance">{moneyText(remaining)}</Stat>
            <Stat label="Profit">{moneyText(sale.totalProfit)}</Stat>
            {sale.promiseDate && <Stat label="Promise date">{sale.promiseDate}</Stat>}
            {hasPlan && (
              <Stat label="Installment">
                {sale.installmentMonths
                  ? `${sale.installmentMonths} month${Number(sale.installmentMonths) === 1 ? '' : 's'}`
                  : (FREQUENCY_LABELS[sale.installmentFrequency] || sale.installmentFrequency)}
                {sale.installmentAmount != null ? ` · ${moneyText(sale.installmentAmount)}/mo` : ''}
              </Stat>
            )}
            {sale.nextDueDate && (
              <Stat label={hasPlan ? 'Next due' : 'Due date'}>{sale.nextDueDate}</Stat>
            )}
            <Stat label="Date">
              {sale.createdAt
                ? `${new Date(sale.createdAt).toLocaleDateString()} ${new Date(sale.createdAt).toLocaleTimeString()}`
                : 'N/A'}
            </Stat>
          </div>
        </div>

        <div className="sale-view-card">
          <h3>Items</h3>
          {!sale.saleItems || sale.saleItems.length === 0 ? (
            <p className="sale-view-empty">No items</p>
          ) : (
            <table className="sale-items-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Qty</th>
                  <th>Amount</th>
                  <th>Profit</th>
                </tr>
              </thead>
              <tbody>
                {sale.saleItems.map((saleItem, index) => (
                  <tr key={index}>
                    <td>{itemOptionLabel(saleItem.item)}</td>
                    <td>{saleItem.quantity || 0}</td>
                    <td>{moneyText(saleItem.amount)}</td>
                    <td>{moneyText(saleItem.profit)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="sale-view-card">
          <h3>Payments</h3>
          {payments.length === 0 ? (
            <p className="sale-view-empty">No recorded payments</p>
          ) : (
            <table className="sale-items-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((entry) => (
                  <tr key={entry.id}>
                    <td>{entry.paidOn || '—'}</td>
                    <td>{moneyText(entry.amount)}</td>
                    <td>{entry.notes || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        </div>

        {canWrite && remaining > 0.001 && (
          <form className="sale-record-payment" onSubmit={handleRecordPayment}>
            <h3>Record payment</h3>
            <div className="form-fields-row">
              <label>
                Amount
                <Input
                  type="number"
                  name="amount"
                  min="0"
                  step="any"
                  max={remaining}
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                  required
                />
              </label>
              <label>
                Paid on
                <input
                  type="date"
                  value={paymentForm.paidOn}
                  onChange={(e) => setPaymentForm({ ...paymentForm, paidOn: e.target.value })}
                />
              </label>
              <label>
                Notes
                <input
                  type="text"
                  value={paymentForm.notes}
                  onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                  placeholder="Optional"
                />
              </label>
            </div>
            <button type="submit" className="single-view-button single-view-button-primary" disabled={saving}>
              {saving ? 'Saving...' : 'Add payment'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default SaleView;
