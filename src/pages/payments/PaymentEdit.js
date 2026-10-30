import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navigation from '../../components/Navigation';
import FormWrapper from '../../components/FormWrapper';
import FormField from '../../components/FormField';
import RequireShop from '../../components/RequireShop';
import CashAccountFields, {
  buildPaymentSplitPayload,
  cashAccountFromPayment,
  emptyCashAccount,
  validateCashAccount,
} from '../../components/CashAccountFields';
import { paymentsApi } from '../../services/api';
import { useShop } from '../../contexts/ShopContext';

const PaymentEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { selectedShop } = useShop();
  const [direction, setDirection] = useState('out');
  const [paymentSplit, setPaymentSplit] = useState(emptyCashAccount());
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setLoadingData(true);
      const data = await paymentsApi.getOne(id);
      if (data?.error || !data) {
        alert('Payment not found');
        navigate('/payments');
        return;
      }
      if (data.sourceType !== 'in' && data.sourceType !== 'out') {
        alert('Only Cash In / Out entries can be edited here');
        navigate(`/payments/${id}`);
        return;
      }
      setDirection(data.sourceType);
      setPaymentSplit(cashAccountFromPayment(data));
    } catch (error) {
      console.error('Error loading payment:', error);
      alert(error.message || 'Failed to load payment');
      navigate('/payments');
    } finally {
      setLoadingData(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

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
      await paymentsApi.update(id, {
        direction,
        shopId: selectedShop?.id,
        cashAmount: split.cashAmount,
        accountAmount: split.accountAmount,
        receiverName: split.receiverName || null,
        notes: split.notes || null,
      });
      navigate('/payments');
    } catch (error) {
      console.error('Error updating payment:', error);
      alert(error.message || 'Failed to update payment');
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div>
        <Navigation />
        <div className="form-wrapper-container">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navigation />
      <RequireShop block>
        <FormWrapper title="Edit Cash In / Out" onSubmit={handleSubmit}>
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
            hint="Use cash, account, or both. Cash Out subtracts from Cash All / Account All."
            value={paymentSplit}
            onChange={setPaymentSplit}
          />
          <div className="form-actions">
            <button type="button" onClick={() => navigate('/payments')} className="form-button form-button-secondary">
              Cancel
            </button>
            <button type="submit" className="form-button form-button-primary" disabled={loading}>
              {loading ? 'Saving...' : 'Update'}
            </button>
          </div>
        </FormWrapper>
      </RequireShop>
    </div>
  );
};

export default PaymentEdit;
