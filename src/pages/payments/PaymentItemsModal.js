import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatAmount } from '../../utils/formatAmount';
import { conditionLabel } from '../items/itemCondition';
import { salesApi, purchasesApi } from '../../services/api';
import { hasPermission } from '../../services/session';
import './PaymentItemsModal.css';

const CloseIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
    <path
      fill="currentColor"
      d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
    />
  </svg>
);

const ExternalLinkIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" style={{ verticalAlign: 'middle', marginRight: 4 }}>
    <path
      fill="currentColor"
      d="M19 19H5V5h7V3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z"
    />
  </svg>
);

const PaymentItemsModal = ({ payment, onClose }) => {
  const navigate = useNavigate();
  const [saleData, setSaleData] = useState(payment?.sale || null);
  const [purchaseData, setPurchaseData] = useState(payment?.purchase || null);
  const [loading, setLoading] = useState(false);

  // Close on Escape & prevent background scroll
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose?.();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  // Fetch full sale or purchase details if items aren't populated
  useEffect(() => {
    let cancelled = false;

    if (payment?.sourceType === 'sale' && payment.sale?.id) {
      const existingItems = payment.sale.saleItems;
      if (!existingItems || existingItems.length === 0) {
        setLoading(true);
        salesApi.getOne(payment.sale.id)
          .then((res) => {
            if (!cancelled && res && !res.error) {
              setSaleData(res);
            }
          })
          .catch((err) => {
            console.error('Failed to load sale details:', err);
          })
          .finally(() => {
            if (!cancelled) setLoading(false);
          });
      }
    } else if (payment?.sourceType === 'purchase' && payment.purchase?.id) {
      if (!payment.purchase.item) {
        setLoading(true);
        purchasesApi.getOne(payment.purchase.id)
          .then((res) => {
            if (!cancelled && res && !res.error) {
              setPurchaseData(res);
            }
          })
          .catch((err) => {
            console.error('Failed to load purchase details:', err);
          })
          .finally(() => {
            if (!cancelled) setLoading(false);
          });
      }
    }

    return () => {
      cancelled = true;
    };
  }, [payment]);

  // Normalize items list
  const { items, title, subtitle, totalQty, totalAmount, hasProfit, targetPath, canViewTarget } = useMemo(() => {
    if (!payment) {
      return { items: [], title: 'Items', subtitle: '', totalQty: 0, totalAmount: 0, hasProfit: false };
    }

    if (payment.sourceType === 'sale') {
      const activeSale = saleData || payment.sale;
      const saleId = activeSale?.id;
      const rawItems = (activeSale?.saleItems || []).filter((si) => !si.is_archived);
      const normalized = rawItems.map((si, idx) => ({
        key: si.id || idx,
        name: si.item?.name || 'Item',
        uniqueIdentifier: si.item?.uniqueIdentifier || '',
        condition: si.item?.condition || '',
        quantity: Number(si.quantity || 1),
        amount: Number(si.amount || 0),
        profit: si.profit != null ? Number(si.profit) : null,
      }));

      const sumQty = normalized.reduce((acc, curr) => acc + curr.quantity, 0);
      const sumAmount = normalized.reduce((acc, curr) => acc + curr.amount, 0);
      const anyProfit = normalized.some((item) => item.profit !== null);

      const customerName = activeSale?.customer?.name || 'Walk-in';
      const saleTotal = activeSale?.totalAmount != null ? formatAmount(activeSale.totalAmount) : formatAmount(sumAmount);

      return {
        items: normalized,
        title: saleId ? `Sale #${saleId} Items` : 'Sale Items',
        subtitle: `Customer: ${customerName} · Total: ${saleTotal}`,
        totalQty: sumQty,
        totalAmount: sumAmount,
        hasProfit: anyProfit,
        targetPath: saleId ? `/sales/${saleId}` : null,
        canViewTarget: hasPermission('sales'),
      };
    }

    if (payment.sourceType === 'purchase') {
      const activePurchase = purchaseData || payment.purchase;
      const purchaseId = activePurchase?.id;
      const item = activePurchase?.item;
      const normalized = item
        ? [
            {
              key: item.id || 1,
              name: item.name || 'Item',
              uniqueIdentifier: item.uniqueIdentifier || '',
              condition: item.condition || '',
              ram: activePurchase.ram,
              rom: activePurchase.rom,
              quantity: Number(activePurchase.quantity || 1),
              amount: Number(activePurchase.purchasePrice || 0) * Number(activePurchase.quantity || 1),
              profit: null,
            },
          ]
        : [];

      const sumQty = normalized.reduce((acc, curr) => acc + curr.quantity, 0);
      const sumAmount = normalized.reduce((acc, curr) => acc + curr.amount, 0);
      const sellerName = activePurchase?.seller?.name || '—';

      return {
        items: normalized,
        title: purchaseId ? `Purchase #${purchaseId} Items` : 'Purchase Items',
        subtitle: `Seller: ${sellerName} · Total: ${formatAmount(sumAmount)}`,
        totalQty: sumQty,
        totalAmount: sumAmount,
        hasProfit: false,
        targetPath: purchaseId ? `/purchases/${purchaseId}` : null,
        canViewTarget: hasPermission('purchases'),
      };
    }

    return {
      items: [],
      title: 'Payment Items',
      subtitle: payment.receiverName ? `Person: ${payment.receiverName}` : '',
      totalQty: 0,
      totalAmount: 0,
      hasProfit: false,
      targetPath: null,
      canViewTarget: false,
    };
  }, [payment, saleData, purchaseData]);

  const hasIdentifier = items.some((item) => Boolean(item.uniqueIdentifier));

  return (
    <div className="payment-modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="payment-modal" onClick={(e) => e.stopPropagation()}>
        <div className="payment-modal-header">
          <div>
            <div className="payment-modal-title-row">
              <h2>{title}</h2>
              {totalQty > 0 && (
                <span className="payment-modal-badge">
                  {totalQty} {totalQty === 1 ? 'item' : 'items'}
                </span>
              )}
            </div>
            {subtitle && <p className="payment-modal-subtitle">{subtitle}</p>}
          </div>
          <button
            type="button"
            className="payment-modal-close"
            onClick={onClose}
            aria-label="Close modal"
            title="Close (Esc)"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="payment-modal-body">
          {loading ? (
            <div className="payment-modal-loading">Loading items...</div>
          ) : items.length === 0 ? (
            <div className="payment-modal-empty">No items recorded for this payment.</div>
          ) : (
            <div className="payment-modal-table-wrapper">
              <table className="payment-modal-table">
                <thead>
                  <tr>
                    <th style={{ width: 44, textAlign: 'center' }}>#</th>
                    <th>Item</th>
                    {hasIdentifier && <th>IMEI / Identifier</th>}
                    <th>Condition</th>
                    <th style={{ textAlign: 'center' }}>Qty</th>
                    <th style={{ textAlign: 'right' }}>Amount</th>
                    {hasProfit && <th style={{ textAlign: 'right' }}>Profit</th>}
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => (
                    <tr key={item.key}>
                      <td style={{ textAlign: 'center', color: '#6b7280' }}>{index + 1}</td>
                      <td>
                        <div className="payment-modal-item-name">{item.name}</div>
                        {(item.ram || item.rom) && (
                          <div className="payment-modal-item-specs">
                            {[item.ram && `RAM: ${item.ram}`, item.rom && `ROM: ${item.rom}`]
                              .filter(Boolean)
                              .join(' · ')}
                          </div>
                        )}
                      </td>
                      {hasIdentifier && (
                        <td>
                          {item.uniqueIdentifier ? (
                            <span className="payment-modal-imei" title="IMEI / Serial">
                              {item.uniqueIdentifier}
                            </span>
                          ) : (
                            <span className="payment-modal-muted">—</span>
                          )}
                        </td>
                      )}
                      <td>
                        {item.condition ? (
                          <span className="payment-modal-condition-tag">
                            {conditionLabel(item.condition)}
                          </span>
                        ) : (
                          <span className="payment-modal-muted">—</span>
                        )}
                      </td>
                      <td style={{ textAlign: 'center', fontWeight: 600 }}>{item.quantity}</td>
                      <td style={{ textAlign: 'right', fontWeight: 500 }}>{formatAmount(item.amount)}</td>
                      {hasProfit && (
                        <td style={{ textAlign: 'right', color: item.profit >= 0 ? '#059669' : '#dc2626' }}>
                          {item.profit != null ? formatAmount(item.profit) : '—'}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={hasIdentifier ? 4 : 3} style={{ fontWeight: 600, textAlign: 'right' }}>
                      Total:
                    </td>
                    <td style={{ textAlign: 'center', fontWeight: 700 }}>{totalQty}</td>
                    <td style={{ textAlign: 'right', fontWeight: 700 }}>{formatAmount(totalAmount)}</td>
                    {hasProfit && <td />}
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>

        <div className="payment-modal-footer">
          <div className="payment-modal-footer-left">
            {targetPath && canViewTarget && (
              <button
                type="button"
                className="payment-modal-btn payment-modal-btn-link"
                onClick={() => {
                  onClose?.();
                  navigate(targetPath);
                }}
              >
                <ExternalLinkIcon />
                {payment.sourceType === 'sale' ? 'Open Sale Details' : 'Open Purchase Details'}
              </button>
            )}
          </div>
          <button
            type="button"
            className="payment-modal-btn payment-modal-btn-primary"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentItemsModal;
