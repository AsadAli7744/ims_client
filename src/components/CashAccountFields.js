import React, { useEffect, useState } from 'react';
import FormField from './FormField';
import Input from './Input';
import { money } from '../pages/sales/salePayment';
import { shopsApi } from '../services/api';
import { useShop } from '../contexts/ShopContext';

/**
 * Cash + Account split. Account shows shop-user receiver dropdown + notes when account amount > 0.
 */
const CashAccountFields = ({
  value,
  onChange,
  title = 'Cash / Account',
  hint = 'Belongs to this sale or purchase (customer / seller optional). Use cash, account, or both. Account needs a receiver.',
}) => {
  const { selectedShop } = useShop();
  const [shopUsers, setShopUsers] = useState([]);
  const cashAmount = value?.cashAmount ?? '';
  const accountAmount = value?.accountAmount ?? '';
  const receiverName = value?.receiverName ?? '';
  const notes = value?.notes ?? '';
  const showAccountDetails = money(accountAmount) > 0;

  useEffect(() => {
    if (!selectedShop?.id) {
      setShopUsers([]);
      return;
    }
    let cancelled = false;
    shopsApi.getUsers(selectedShop.id)
      .then((rows) => {
        if (!cancelled) {
          setShopUsers(Array.isArray(rows) ? rows : []);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setShopUsers([]);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [selectedShop?.id]);

  const update = (field, fieldValue) => onChange({ ...value, [field]: fieldValue });

  const receiverOptions = [...shopUsers];
  if (receiverName && !shopUsers.some((user) => user.name === receiverName)) {
    receiverOptions.push({ id: `saved-${receiverName}`, name: receiverName });
  }

  return (
    <div className="cash-account-fields" style={{ marginTop: 16, marginBottom: 8 }}>
      {title ? <h3 style={{ margin: '12px 0 8px', fontSize: 16 }}>{title}</h3> : null}
      {hint ? (
        <p style={{ margin: '0 0 10px', fontSize: 13, color: '#666' }}>{hint}</p>
      ) : null}
      <div className="form-fields-row">
        <FormField label="Cash amount" htmlFor="cashAmount">
          <Input
            type="number"
            name="cashAmount"
            placeholder="0"
            value={cashAmount}
            onChange={(e) => update('cashAmount', e.target.value)}
            min="0"
            step="any"
          />
        </FormField>
        <FormField label="Account amount" htmlFor="accountAmount">
          <Input
            type="number"
            name="accountAmount"
            placeholder="0"
            value={accountAmount}
            onChange={(e) => update('accountAmount', e.target.value)}
            min="0"
            step="any"
          />
        </FormField>
      </div>
      {showAccountDetails && (
        <div className="form-fields-row">
          <FormField label="Receiver name" htmlFor="receiverName" required>
            <select
              id="receiverName"
              name="receiverName"
              value={receiverName}
              onChange={(e) => update('receiverName', e.target.value)}
            >
              <option value="">
                {selectedShop?.id
                  ? (shopUsers.length ? 'Select shop user' : 'No users assigned to this shop')
                  : 'Select a shop first'}
              </option>
              {receiverOptions.map((user) => (
                <option key={user.id} value={user.name}>
                  {user.name}
                </option>
              ))}
            </select>
          </FormField>
        </div>
      )}
      <div className="form-fields-row">
        <FormField label="Notes" htmlFor="paymentNotes">
          <Input
            type="text"
            name="notes"
            placeholder="Optional notes"
            value={notes}
            onChange={(e) => update('notes', e.target.value)}
          />
        </FormField>
      </div>
    </div>
  );
};

export const emptyCashAccount = () => ({
  cashAmount: '',
  accountAmount: '',
  receiverName: '',
  notes: '',
});

export const cashAccountFromPayment = (payment) => {
  if (!payment) {
    return emptyCashAccount();
  }
  return {
    cashAmount: payment.cashAmount == null || Number(payment.cashAmount) === 0 ? '' : payment.cashAmount,
    accountAmount: payment.accountAmount == null || Number(payment.accountAmount) === 0 ? '' : payment.accountAmount,
    receiverName: payment.receiverName || '',
    notes: payment.notes || '',
  };
};

export const buildPaymentSplitPayload = (form) => {
  const cash = money(form?.cashAmount);
  const account = money(form?.accountAmount);
  if (cash <= 0 && account <= 0) {
    return null;
  }
  const payload = {
    cashAmount: cash,
    accountAmount: account,
  };
  if (account > 0) {
    payload.receiverName = String(form?.receiverName || '').trim();
  }
  const notes = String(form?.notes || '').trim();
  if (notes) {
    payload.notes = notes;
  }
  return payload;
};

export const validateCashAccount = (form) => {
  const cash = money(form?.cashAmount);
  const account = money(form?.accountAmount);
  if (cash < 0 || account < 0) {
    return 'Cash and account amounts cannot be negative';
  }
  if (account > 0 && !String(form?.receiverName || '').trim()) {
    return 'Receiver name is required for account payment';
  }
  return null;
};

export default CashAccountFields;
