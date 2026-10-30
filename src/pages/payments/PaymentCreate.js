import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '../../components/Navigation';
import FormWrapper from '../../components/FormWrapper';
import FormField from '../../components/FormField';
import RequireShop from '../../components/RequireShop';
import CashAccountFields, {
  buildPaymentSplitPayload,
  emptyCashAccount,
  validateCashAccount,
} from '../../components/CashAccountFields';
import { paymentsApi } from '../../services/api';
import { useShop } from '../../contexts/ShopContext';

const PaymentCreate = () => {
  const navigate = useNavigate();
  const { selectedShop } = useShop();
  const [direction, setDirection] = useState('out');
  const [paymentSplit, setPaymentSplit] = useState(emptyCashAccount());
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    if (!selectedShop?.id) {
      alert('Select a shop first');
      return;
    }

    const paymentError = validateCashAccount(paymentSplit);
    if (paymentError) {
      alert(paymentError);
      return;
    }

    const split = buildPaymentSplitPayload(paymentSplit);
    if (!split) {
      alert('Enter a cash and/or account amount greater than 0');
      return;
    }

    setLoading(true);
    try {
      await paymentsApi.create({
        direction,
        shopId: selectedShop.id,
        cashAmount: split.cashAmount,
        accountAmount: split.accountAmount,
        receiverName: split.receiverName,
        notes: split.notes,
      });
      navigate('/payments');
    } catch (error) {
      console.error('Error creating payment:', error);
      alert(error.message || 'Failed to create payment');
      setLoading(false);
    }
  };

  return (
    <div>
      <Navigation />
      <RequireShop block>
        <FormWrapper title="Add Cash In / Out" onSubmit={handleSubmit}>
          <p style={{ margin: '0 0 12px', fontSize: 13, color: '#666' }}>
            Money in or out of the shop. Cash and Account both count in Cash All / Account All.
          </p>
          <div className="form-fields-row">
            <FormField label="Type" htmlFor="direction" required>
              <select
                id="direction"
                name="direction"
                value={direction}
                onChange={(e) => setDirection(e.target.value)}
              >
                <option value="in">Cash In</option>
                <option value="out">Cash Out</option>
              </select>
            </FormField>
          </div>
          <CashAccountFields
            title="Cash / Account"
            hint="Use cash, account, or both. These amounts are added to Cash All and Account All. Account needs a receiver."
            value={paymentSplit}
            onChange={setPaymentSplit}
          />
          <div className="form-actions">
            <button type="button" onClick={() => navigate('/payments')} className="form-button form-button-secondary">
              Cancel
            </button>
            <button type="submit" className="form-button form-button-primary" disabled={loading}>
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </FormWrapper>
      </RequireShop>
    </div>
  );
};

export default PaymentCreate;
