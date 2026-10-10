import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navigation from '../../components/Navigation';
import PermissionLink from '../../components/PermissionLink';
import { itemsApi } from '../../services/api';
import { conditionLabel } from './itemCondition';
import { formatAmount } from '../../utils/formatAmount';
import { hasPermission } from '../../services/session';
import '../../components/SingleView.css';
import '../sales/SaleView.css';
import './ItemView.css';

const ItemView = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        const result = await itemsApi.getOne(id);
        if (active) setItem(result);
      } catch (error) {
        console.error('Error loading item:', error);
        if (active) setItem(null);
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
        <div className="item-view-page">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div>
        <Navigation />
        <div className="item-view-page">
          <p>Item not found</p>
          <button type="button" onClick={() => navigate('/items')} className="single-view-button">
            Back to List
          </button>
        </div>
      </div>
    );
  }

  const canWrite = hasPermission('items.write');
  const categories = Array.isArray(item.categories) && item.categories.length > 0
    ? item.categories.map((c) => c.name || c).join(', ')
    : 'No categories';
  const stockValue = typeof item.fifoValue === 'number'
    ? item.fifoValue
    : (item.quantity ?? 0) * (Number(item.purchasePrice) || 0);
  const lots = Array.isArray(item.lots) ? item.lots : [];

  const Stat = ({ label, children }) => (
    <div className="sale-view-stat">
      <span>{label}</span>
      <strong>{children}</strong>
    </div>
  );

  return (
    <div>
      <Navigation />
      <div className="item-view-page">
        <div className="sale-view-header">
          <div>
            <h1>Item Details</h1>
            <p className="sale-view-subtitle">
              {item.name || 'Untitled item'}
              {item.uniqueIdentifier ? ` · ${item.uniqueIdentifier}` : ''}
            </p>
          </div>
          <div className="single-view-actions">
            <button type="button" onClick={() => navigate('/items')} className="single-view-button">
              Back
            </button>
            {canWrite && (
              <button
                type="button"
                onClick={() => navigate(`/items/${id}/edit`)}
                className="single-view-button single-view-button-primary"
              >
                Edit
              </button>
            )}
          </div>
        </div>

        <div className="sale-view-card">
          <div className="sale-view-grid">
            <Stat label="Name">{item.name || '—'}</Stat>
            <Stat label="Company">
              {item.company?.id ? (
                <PermissionLink module="companies" to={`/companies/${item.company.id}`}>
                  {item.company.name || 'N/A'}
                </PermissionLink>
              ) : (item.company?.name || 'N/A')}
            </Stat>
            <Stat label="Categories">{categories}</Stat>
            <Stat label="Item type">{item.itemType?.name || '—'}</Stat>
            <Stat label="Condition">{conditionLabel(item.condition)}</Stat>
            <Stat label="Unique ID">{item.uniqueIdentifier || '—'}</Stat>
            <Stat label="Shop">
              {item.shop?.id ? (
                <PermissionLink module="shops" to={`/shops/${item.shop.id}`}>
                  {item.shop.name || 'N/A'}
                </PermissionLink>
              ) : (item.shop?.name || 'N/A')}
            </Stat>
            <Stat label="Store">
              {item.store?.id ? (
                <PermissionLink module="stores" to={`/stores/${item.store.id}`}>
                  {item.store.name || 'N/A'}
                </PermissionLink>
              ) : (item.store?.name || 'N/A')}
            </Stat>
            <Stat label="Location">{item.location || '—'}</Stat>
          </div>
        </div>

        <div className="sale-view-card">
          <h3>Stock</h3>
          <div className="sale-view-grid">
            <Stat label="Quantity">{item.quantity ?? 0}</Stat>
            <Stat label="FIFO cost">{formatAmount(item.purchasePrice)}</Stat>
            <Stat label="Stock value">{formatAmount(stockValue)}</Stat>
            <Stat label="Min sale price">{formatAmount(item.minimumSalePrice)}</Stat>
          </div>
        </div>

        <div className="sale-view-card">
          <h3>FIFO lots</h3>
          {lots.length === 0 ? (
            <p className="sale-view-empty">No remaining lots</p>
          ) : (
            <table className="sale-items-table">
              <thead>
                <tr>
                  <th>Received</th>
                  <th>Remaining</th>
                  <th>Unit cost</th>
                </tr>
              </thead>
              <tbody>
                {lots.map((lot) => (
                  <tr key={lot.id}>
                    <td>{lot.receivedAt ? new Date(lot.receivedAt).toLocaleDateString() : 'N/A'}</td>
                    <td>{lot.remainingQuantity}</td>
                    <td>{formatAmount(lot.unitCost)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default ItemView;
