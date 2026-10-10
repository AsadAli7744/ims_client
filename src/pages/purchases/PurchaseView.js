import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navigation from '../../components/Navigation';
import PermissionLink from '../../components/PermissionLink';
import DownloadPngButton from '../../components/DownloadPngButton';
import { purchasesApi } from '../../services/api';
import { formatAmount } from '../../utils/formatAmount';
import { itemOptionLabel } from '../items/itemCondition';
import { hasPermission } from '../../services/session';
import '../../components/SingleView.css';
import '../sales/SaleView.css';
import './PurchaseView.css';

const PurchaseView = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const captureRef = useRef(null);
  const [purchase, setPurchase] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        const result = await purchasesApi.getOne(id);
        if (active) setPurchase(result);
      } catch (error) {
        console.error('Error loading purchase:', error);
        if (active) setPurchase(null);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [id]);

  if (loading) {
    return (
      <div>
        <Navigation />
        <div className="purchase-view-page">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!purchase) {
    return (
      <div>
        <Navigation />
        <div className="purchase-view-page">
          <p>Purchase not found</p>
          <button type="button" onClick={() => navigate('/purchases')} className="single-view-button">
            Back to List
          </button>
        </div>
      </div>
    );
  }

  const canWrite = hasPermission('purchases.write');
  const unitPrice = Number(purchase.purchasePrice) || 0;
  const qty = purchase.quantity || 1;
  const total = unitPrice * qty;
  const itemLabel = itemOptionLabel(purchase.item);
  const sellerExtras = [purchase.seller?.phone, purchase.seller?.cnic].filter(Boolean).join(' · ');

  const Stat = ({ label, children }) => (
    <div className="sale-view-stat">
      <span>{label}</span>
      <strong>{children}</strong>
    </div>
  );

  return (
    <div>
      <Navigation />
      <div className="purchase-view-page">
        <div className="sale-view-header">
          <div>
            <h1>Purchase Details</h1>
            <p className="sale-view-subtitle">
              {purchase.item?.id ? (
                <PermissionLink module="items" to={`/items/${purchase.item.id}`}>{itemLabel}</PermissionLink>
              ) : itemLabel}
              {purchase.purchaseDate
                ? ` · ${new Date(purchase.purchaseDate).toLocaleDateString()}`
                : ''}
            </p>
          </div>
          <div className="single-view-actions">
            <button type="button" onClick={() => navigate('/purchases')} className="single-view-button">
              Back
            </button>
            <DownloadPngButton targetRef={captureRef} filename={`purchase-${purchase.id || id}.png`} />
            {canWrite && (
              <button
                type="button"
                onClick={() => navigate(`/purchases/${id}/edit`)}
                className="single-view-button single-view-button-primary"
              >
                Edit
              </button>
            )}
          </div>
        </div>

        <div ref={captureRef} className="download-capture">
        <div className="sale-view-card">
          <div className="sale-view-header" style={{ marginBottom: 12 }}>
            <div>
              <h1 style={{ fontSize: 22 }}>Purchase #{purchase.id}</h1>
              <p className="sale-view-subtitle">{itemLabel}</p>
            </div>
          </div>
          <div className="sale-view-grid">
            <Stat label="Item">
              {purchase.item?.id ? (
                <PermissionLink module="items" to={`/items/${purchase.item.id}`}>{itemLabel}</PermissionLink>
              ) : itemLabel}
            </Stat>
            <Stat label="Shop">{purchase.shop?.name || '—'}</Stat>
            <Stat label="Seller">
              {purchase.seller?.id ? (
                <PermissionLink module="sellers" to={`/sellers/${purchase.seller.id}`}>
                  {purchase.seller.name}
                </PermissionLink>
              ) : '—'}
            </Stat>
            <Stat label="Seller contact">{sellerExtras || '—'}</Stat>
            <Stat label="Purchase date">
              {purchase.purchaseDate
                ? new Date(purchase.purchaseDate).toLocaleDateString()
                : 'N/A'}
            </Stat>
            <Stat label="Created">
              {purchase.createdAt
                ? `${new Date(purchase.createdAt).toLocaleDateString()} ${new Date(purchase.createdAt).toLocaleTimeString()}`
                : 'N/A'}
            </Stat>
          </div>
        </div>

        <div className="sale-view-card">
          <h3>Amounts</h3>
          <div className="sale-view-grid">
            <Stat label="Unit price">{formatAmount(unitPrice)}</Stat>
            <Stat label="Quantity">{qty}</Stat>
            <Stat label="Total">{formatAmount(total)}</Stat>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};

export default PurchaseView;
