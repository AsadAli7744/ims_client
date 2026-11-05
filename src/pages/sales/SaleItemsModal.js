import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatAmount } from '../../utils/formatAmount';
import { conditionLabel } from '../items/itemCondition';
import { salesApi } from '../../services/api';
import './SaleItemsModal.css';

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

const SaleItemsModal = ({ sale, onClose }) => {
  const navigate = useNavigate();
  const [saleData, setSaleData] = useState(sale || null);
  const [loading, setLoading] = useState(false);

  // Close on Escape & lock body scrolling
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

  // Fetch full sale if items aren't populated
  useEffect(() => {
    let cancelled = false;
    if (sale?.id && (!sale.saleItems || sale.saleItems.length === 0)) {
      setLoading(true);
      salesApi.getOne(sale.id)
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
    return () => {
      cancelled = true;
    };
  }, [sale]);

  const activeSale = saleData || sale;

  const { items, totalQty, totalAmount, totalProfit, hasProfit, hasIdentifier } = useMemo(() => {
    if (!activeSale) {
      return { items: [], totalQty: 0, totalAmount: 0, totalProfit: 0, hasProfit: false, hasIdentifier: false };
    }

    const raw = (activeSale.saleItems || []).filter((si) => !si.is_archived);
    const normalized = raw.map((si, idx) => ({
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
    const sumProfit = normalized.reduce((acc, curr) => acc + (curr.profit || 0), 0);
    const anyProfit = normalized.some((i) => i.profit !== null);
    const anyIdentifier = normalized.some((i) => Boolean(i.uniqueIdentifier));

    return {
      items: normalized,
      totalQty: sumQty,
      totalAmount: sumAmount,
      totalProfit: sumProfit,
      hasProfit: anyProfit,
      hasIdentifier: anyIdentifier,
    };
  }, [activeSale]);

  const customerName = activeSale?.customer?.name || 'Walk-in';
  const displayTotal = activeSale?.totalAmount != null ? formatAmount(activeSale.totalAmount) : formatAmount(totalAmount);

  return (
    <div className="sale-modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="sale-modal" onClick={(e) => e.stopPropagation()}>
        <div className="sale-modal-header">
          <div>
            <div className="sale-modal-title-row">
              <h2>Sale #{activeSale?.id} Items</h2>
              {totalQty > 0 && (
                <span className="sale-modal-badge">
                  {totalQty} {totalQty === 1 ? 'item' : 'items'}
                </span>
              )}
            </div>
            <p className="sale-modal-subtitle">
              Customer: {customerName} · Total: {displayTotal}
            </p>
          </div>
          <button
            type="button"
            className="sale-modal-close"
            onClick={onClose}
            aria-label="Close modal"
            title="Close (Esc)"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="sale-modal-body">
          {loading ? (
            <div className="sale-modal-loading">Loading items...</div>
          ) : items.length === 0 ? (
            <div className="sale-modal-empty">No items recorded for this sale.</div>
          ) : (
            <div className="sale-modal-table-wrapper">
              <table className="sale-modal-table">
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
                        <div className="sale-modal-item-name">{item.name}</div>
                      </td>
                      {hasIdentifier && (
                        <td>
                          {item.uniqueIdentifier ? (
                            <span className="sale-modal-imei" title="IMEI / Serial">
                              {item.uniqueIdentifier}
                            </span>
                          ) : (
                            <span className="sale-modal-muted">—</span>
                          )}
                        </td>
                      )}
                      <td>
                        {item.condition ? (
                          <span className="sale-modal-condition-tag">
                            {conditionLabel(item.condition)}
                          </span>
                        ) : (
                          <span className="sale-modal-muted">—</span>
                        )}
                      </td>
                      <td style={{ textAlign: 'center', fontWeight: 600 }}>{item.quantity}</td>
                      <td style={{ textAlign: 'right', fontWeight: 500 }}>{formatAmount(item.amount)}</td>
                      {hasProfit && (
                        <td
                          style={{
                            textAlign: 'right',
                            color: item.profit >= 0 ? '#059669' : '#dc2626',
                            fontWeight: 500,
                          }}
                        >
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
                    {hasProfit && (
                      <td
                        style={{
                          textAlign: 'right',
                          fontWeight: 700,
                          color: totalProfit >= 0 ? '#059669' : '#dc2626',
                        }}
                      >
                        {formatAmount(totalProfit)}
                      </td>
                    )}
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>

        <div className="sale-modal-footer">
          <div className="sale-modal-footer-left">
            {activeSale?.id && (
              <button
                type="button"
                className="sale-modal-btn sale-modal-btn-link"
                onClick={() => {
                  onClose?.();
                  navigate(`/sales/${activeSale.id}`);
                }}
              >
                <ExternalLinkIcon />
                Open Sale Details
              </button>
            )}
          </div>
          <button
            type="button"
            className="sale-modal-btn sale-modal-btn-primary"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default SaleItemsModal;
