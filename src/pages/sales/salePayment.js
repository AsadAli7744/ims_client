import { formatAmount } from '../../utils/formatAmount';

export const PAYMENT_LABELS = {
  completed: 'Completed',
  pending: 'Pending',
  partial: 'Partially given',
};

export const DUE_LABELS = {
  pending: 'Pending',
  upcoming: 'Upcoming',
  completed: 'Completed',
};

export const SERVICE_KIND_LABELS = {
  repair: 'Repair',
  consultancy: 'Consultancy',
  accessory: 'Accessory / pouch / hands-free',
  other: 'Other service',
};

export const FREQUENCY_LABELS = {
  none: 'No installment',
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly',
};

export const CREDIT_PLAN_LABELS = {
  none: 'Promise date only',
  monthly: 'Monthly installments',
};

export function money(value) {
  const parsed = Number(value || 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function moneyText(value) {
  return formatAmount(value);
}

export function todayIso() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function paymentLabel(status) {
  return PAYMENT_LABELS[status] || status || 'Completed';
}

export function calcMonthlyInstallment(remaining, months) {
  const balance = money(remaining);
  const count = Number(months);
  if (balance <= 0 || !count || count < 1) {
    return 0;
  }
  return money(balance / count);
}

export function emptyPaymentForm() {
  return {
    customerId: '',
    customerLabel: '',
    newCustomerName: '',
    newCustomerPhone: '',
    newCustomerCnic: '',
    amountPaid: '',
    promiseDate: '',
    installmentFrequency: 'none',
    installmentAmount: '',
    installmentMonths: '',
  };
}

const customerDisplayLabel = (customer) => {
  if (!customer) {
    return '';
  }
  const extras = [customer.phone, customer.cnic].filter(Boolean);
  return extras.length ? `${customer.name} (${extras.join(' · ')})` : customer.name;
};

export function paymentFormFromSale(sale) {
  return {
    customerId: sale?.customer?.id || '',
    customerLabel: customerDisplayLabel(sale?.customer),
    newCustomerName: '',
    newCustomerPhone: '',
    newCustomerCnic: '',
    amountPaid: sale?.amountPaid == null ? '' : formatAmount(sale.amountPaid, ''),
    promiseDate: sale?.promiseDate || '',
    installmentFrequency: sale?.installmentFrequency || 'none',
    installmentAmount: sale?.installmentAmount == null ? '' : formatAmount(sale.installmentAmount, ''),
    installmentMonths: sale?.installmentMonths == null ? '' : String(sale.installmentMonths),
  };
}

export function resolvePaidAmount(form, totalAmount) {
  if (form.amountPaid === '' || form.amountPaid == null) {
    return money(totalAmount);
  }
  return money(form.amountPaid);
}

export function validatePaymentForm(form, totalAmount) {
  const total = money(totalAmount);
  const paid = resolvePaidAmount(form, total);
  if (paid < 0) {
    return 'Amount paid cannot be negative';
  }
  if (paid > total + 0.001) {
    return 'Amount paid cannot exceed sale total';
  }
  const remaining = Math.max(0, total - paid);
  if (remaining > 0.001) {
    const hasPlan = form.installmentFrequency && form.installmentFrequency !== 'none';
    if (!form.promiseDate) {
      return hasPlan
        ? 'Installment date is required'
        : 'Promise date is required when payment is pending or partial';
    }
    if (hasPlan) {
      const months = Number(form.installmentMonths);
      if (!months || months < 1) {
        return 'Enter how many months for the pending amount';
      }
      const installment = calcMonthlyInstallment(remaining, months);
      if (installment <= 0) {
        return 'Installment amount must be greater than 0';
      }
    }
  }
  return null;
}

export function buildSalePaymentPayload(form, totalAmount, { allowClearCustomer = false } = {}) {
  const payload = {};
  if (form.customerId) {
    payload.customerId = Number(form.customerId);
  } else if (form.newCustomerName?.trim()) {
    payload.newCustomer = {
      name: form.newCustomerName.trim(),
      phone: form.newCustomerPhone?.trim() || undefined,
      cnic: form.newCustomerCnic?.trim() || undefined,
    };
  } else if (allowClearCustomer) {
    payload.customerId = null;
  }

  const total = money(totalAmount);
  const paid = resolvePaidAmount(form, total);
  payload.amountPaid = paid;
  if (paid + 0.001 < total) {
    if (form.promiseDate) {
      payload.promiseDate = form.promiseDate;
    }
    const hasPlan = form.installmentFrequency && form.installmentFrequency !== 'none';
    if (hasPlan) {
      const months = Number(form.installmentMonths);
      const remaining = Math.max(0, total - paid);
      payload.installmentFrequency = 'monthly';
      payload.installmentMonths = months;
      payload.installmentAmount = calcMonthlyInstallment(remaining, months);
    } else {
      payload.installmentFrequency = 'none';
      payload.installmentMonths = null;
    }
  } else {
    payload.installmentFrequency = 'none';
    payload.installmentMonths = null;
  }
  return payload;
}
