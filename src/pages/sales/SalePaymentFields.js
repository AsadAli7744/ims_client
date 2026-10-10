import React, { useState } from 'react';
import FormField from '../../components/FormField';
import Input from '../../components/Input';
import { CustomerSearchSelect } from '../../components/entitySearchSelects';
import CollapseBody from '../../components/CollapseBody';
import InlineCreatePanel from '../../components/InlineCreatePanel';
import {
  CREDIT_PLAN_LABELS,
  calcMonthlyInstallment,
  money,
  moneyText,
  resolvePaidAmount,
} from './salePayment';

const SalePaymentFields = ({
  totalAmount,
  value,
  onChange,
  allowNewCustomer = true,
}) => {
  const [open, setOpen] = useState(false);
  const update = (field, fieldValue) => onChange({ ...value, [field]: fieldValue });
  const paid = resolvePaidAmount(value, totalAmount);
  const remaining = Math.max(0, money(totalAmount) - paid);
  const isCredit = remaining > 0.001;
  const hasPlan = value.installmentFrequency && value.installmentFrequency !== 'none';
  const months = Number(value.installmentMonths) || 0;
  const monthlyAmount = hasPlan ? calcMonthlyInstallment(remaining, months) : 0;

  const setPlanMode = (mode) => {
    if (mode === 'monthly') {
      onChange({
        ...value,
        installmentFrequency: 'monthly',
        installmentMonths: value.installmentMonths || '6',
      });
      return;
    }
    onChange({
      ...value,
      installmentFrequency: 'none',
      installmentMonths: '',
      installmentAmount: '',
    });
  };

  return (
    <div className={`sale-payment-section${open ? ' is-open' : ' is-collapsed'}`}>
      <button
        type="button"
        className="sale-payment-toggle"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
      >
        <span>Customer & Payment</span>
        <span className="sale-payment-toggle-label">{open ? 'Hide' : 'Show'}</span>
      </button>
      <CollapseBody open={open} className="sale-payment-body">
      <p className="sale-payment-hint">
        Leave customer empty for a cash walk-in. Amount paid defaults to the sale total.
        For a pending balance, use a promise date or split it into monthly installments.
      </p>

      <div className="form-fields-row">
        <FormField label="Customer" htmlFor="customerId">
          <CustomerSearchSelect
            id="customerId"
            name="customerId"
            placeholder="Walk-in / no customer"
            value={value.customerId}
            selectedLabel={value.customerLabel}
            onChange={(e) => update('customerId', e.target.value)}
          />
        </FormField>
      </div>

      {allowNewCustomer && !value.customerId && (
        <InlineCreatePanel title="Add new customer">
          <div className="form-fields-row">
            <FormField label="Customer name" htmlFor="newCustomerName">
              <Input
                type="text"
                name="newCustomerName"
                placeholder="Optional new customer"
                value={value.newCustomerName}
                onChange={(e) => update('newCustomerName', e.target.value)}
              />
            </FormField>
            <FormField label="Phone" htmlFor="newCustomerPhone">
              <Input
                type="text"
                name="newCustomerPhone"
                placeholder="Optional phone"
                value={value.newCustomerPhone}
                onChange={(e) => update('newCustomerPhone', e.target.value)}
              />
            </FormField>
          </div>
          <div className="form-fields-row">
            <FormField label="CNIC / ID" htmlFor="newCustomerCnic">
              <Input
                type="text"
                name="newCustomerCnic"
                placeholder="Optional CNIC / ID"
                value={value.newCustomerCnic}
                onChange={(e) => update('newCustomerCnic', e.target.value)}
              />
            </FormField>
          </div>
        </InlineCreatePanel>
      )}

      <div className="form-fields-row">
        <FormField label="Amount paid" htmlFor="amountPaid">
          <Input
            type="number"
            name="amountPaid"
            placeholder={moneyText(totalAmount)}
            value={value.amountPaid}
            onChange={(e) => update('amountPaid', e.target.value)}
            min="0"
            step="any"
          />
        </FormField>
        <FormField label="Remaining" htmlFor="remaining">
          <Input
            type="text"
            name="remaining"
            value={moneyText(remaining)}
            disabled
          />
        </FormField>
      </div>

      {isCredit && (
        <>
          <div className="form-fields-row">
            <FormField label="Credit plan" htmlFor="creditPlan">
              <Input
                type="dropdown"
                name="creditPlan"
                value={hasPlan ? 'monthly' : 'none'}
                onChange={(e) => setPlanMode(e.target.value || 'none')}
                options={Object.entries(CREDIT_PLAN_LABELS).map(([mode, label]) => ({
                  value: mode,
                  label,
                }))}
              />
            </FormField>
            <FormField
              label={hasPlan ? 'Installment date' : 'Promise date'}
              htmlFor="promiseDate"
              required
            >
              <Input
                type="date"
                name="promiseDate"
                value={value.promiseDate}
                onChange={(e) => update('promiseDate', e.target.value)}
              />
            </FormField>
          </div>

          {hasPlan && (
            <div className="form-fields-row">
              <FormField label="Months" htmlFor="installmentMonths" required>
                <Input
                  type="number"
                  name="installmentMonths"
                  placeholder="e.g. 6"
                  value={value.installmentMonths}
                  onChange={(e) => update('installmentMonths', e.target.value)}
                  min="1"
                  step="1"
                />
              </FormField>
              <FormField label="Amount each month" htmlFor="installmentAmount">
                <Input
                  type="text"
                  name="installmentAmount"
                  value={months > 0 ? moneyText(monthlyAmount) : '—'}
                  disabled
                />
              </FormField>
            </div>
          )}
          {hasPlan && months > 0 && (
            <p className="sale-payment-hint">
              Pending {moneyText(remaining)} over {months} month{months === 1 ? '' : 's'}
              {' '}→ {moneyText(monthlyAmount)} each month, starting {value.promiseDate || 'the installment date'}.
            </p>
          )}
        </>
      )}
      </CollapseBody>
    </div>
  );
};

export default SalePaymentFields;
