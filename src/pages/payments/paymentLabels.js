export const PAYMENT_TYPE_LABELS = {
  sale: 'Sale',
  purchase: 'Purchase',
  in: 'Cash In',
  out: 'Cash Out',
};

export const paymentTypeLabel = (value) => PAYMENT_TYPE_LABELS[value] || value || '—';
