import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '../../components/Navigation';
import FormWrapper from '../../components/FormWrapper';
import FormField from '../../components/FormField';
import Input from '../../components/Input';
import { salesApi, itemsApi } from '../../services/api';
import RequireShop from '../../components/RequireShop';
import SalePaymentFields from './SalePaymentFields';
import { ItemSearchSelect } from '../../components/entitySearchSelects';
import { buildSalePaymentPayload, emptyPaymentForm, validatePaymentForm } from './salePayment';
import { itemNameLabel, itemOptionLabel } from '../items/itemCondition';
import { formatAmount } from '../../utils/formatAmount';
import '../../components/ItemInfoBox.css';
import './SaleCreate.css';

const SaleCreate = () => {
  const navigate = useNavigate();
  const [saleItems, setSaleItems] = useState([
    {
      itemId: '',
      quantity: 1,
      amount: '',
      profit: 0,
      selectedItem: null
    }
  ]);
  const [payment, setPayment] = useState(emptyPaymentForm());
  const [loading, setLoading] = useState(false);

  const loadItemDetails = async (itemId, index) => {
    try {
      const item = await itemsApi.getOne(itemId);
      const updatedItems = [...saleItems];
      updatedItems[index].selectedItem = item;
      setSaleItems(updatedItems);
      calculateItemProfit(index);
    } catch (error) {
      console.error('Error loading item details:', error);
    }
  };

  const calculateProfit = (amount, quantity, purchasePrice) => {
    if (!amount || !quantity || !purchasePrice) return 0;
    const totalCost = purchasePrice * quantity;
    const profit = amount - totalCost;
    return Number(formatAmount(profit));
  };

  const calculateItemProfit = (index) => {
    const updatedItems = [...saleItems];
    const item = updatedItems[index];
    
    if (item.selectedItem && item.quantity > 0 && item.amount > 0) {
      const purchasePrice = typeof item.selectedItem.purchasePrice === 'string' 
        ? parseFloat(item.selectedItem.purchasePrice) 
        : (item.selectedItem.purchasePrice || 0);
      item.profit = calculateProfit(item.amount, item.quantity, purchasePrice);
      setSaleItems(updatedItems);
    }
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...saleItems];
    updatedItems[index][field] = value;

    if (field === 'itemId') {
      updatedItems[index].selectedItem = null;
      updatedItems[index].profit = 0;
      updatedItems[index].amount = '';
      setSaleItems(updatedItems);
      if (value) {
        loadItemDetails(value, index);
      }
    } else {
      setSaleItems(updatedItems);
      if (field === 'quantity' || field === 'amount') {
        calculateItemProfit(index);
      }
    }
  };

  const addSaleItem = () => {
    setSaleItems([
      ...saleItems,
      {
        itemId: '',
        quantity: 1,
        amount: '',
        profit: 0,
        selectedItem: null
      }
    ]);
  };

  const removeSaleItem = (index) => {
    if (saleItems.length > 1) {
      const updatedItems = saleItems.filter((_, i) => i !== index);
      setSaleItems(updatedItems);
    } else {
      alert('Sale must have at least one item');
    }
  };

  const totalAmount = saleItems.reduce((sum, item) => sum + (item.amount || 0), 0);
  // const totalProfit = saleItems.reduce((sum, item) => sum + (item.profit || 0), 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    // Validate
    for (let i = 0; i < saleItems.length; i++) {
      const item = saleItems[i];
      if (!item.itemId) {
        alert(`Please select an item for row ${i + 1}`);
        return;
      }
      if (item.quantity <= 0) {
        alert(`Quantity must be greater than 0 for row ${i + 1}`);
        return;
      }
      if (item.amount <= 0) {
        alert(`Amount must be greater than 0 for row ${i + 1}`);
        return;
      }
      if (item.selectedItem && item.quantity > item.selectedItem.quantity) {
        alert(`Insufficient quantity for ${item.selectedItem.name || 'item'}. Available: ${item.selectedItem.quantity}, Requested: ${item.quantity}`);
        return;
      }
    }

    const paymentError = validatePaymentForm(payment, totalAmount);
    if (paymentError) {
      alert(paymentError);
      return;
    }

    setLoading(true);
    try {
      const saleData = {
        items: saleItems.map(item => ({
          itemId: parseInt(item.itemId),
          quantity: item.quantity,
          profit: item.profit,
          amount: item.amount
        })),
        ...buildSalePaymentPayload(payment, totalAmount),
      };

      await salesApi.create(saleData);
      navigate('/sales');
    } catch (error) {
      console.error('Error creating sale:', error);
      alert('Failed to create sale: ' + (error.message || 'Unknown error'));
      setLoading(false);
    }
  };

  return (
    <div className="sale-create-page">
      <Navigation />
      <RequireShop block>
      <FormWrapper title="Create Sale" onSubmit={handleSubmit}>
        <div className="sale-items-container">
          <div className="sale-items-header">
            <h3>Sale Items</h3>
            <button type="button" onClick={addSaleItem} className="add-item-button">
              + Add Item
            </button>
          </div>

          {saleItems.map((saleItem, index) => (
            <div key={index} className="sale-item-row">
              <div className="sale-item-header">
                <h4>Item {index + 1}</h4>
                {saleItems.length > 1 && (
                  <button 
                    type="button" 
                    onClick={() => removeSaleItem(index)} 
                    className="remove-item-button"
                  >
                    Remove
                  </button>
                )}
              </div>

              <div className="form-fields-row">
                <FormField label="Item" htmlFor={`item-${index}`} required>
                  <ItemSearchSelect
                    id={`item-${index}`}
                    name="itemId"
                    shopOnly
                    placeholder="Search item"
                    value={saleItem.itemId}
                    selectedLabel={saleItem.selectedItem ? itemNameLabel(saleItem.selectedItem) : undefined}
                    onChange={(e) => handleItemChange(index, 'itemId', e.target.value)}
                  />
                </FormField>
                <FormField label="Quantity" htmlFor={`quantity-${index}`} required>
                  <Input
                    type="number"
                    name="quantity"
                    placeholder="Quantity"
                    value={saleItem.quantity}
                    onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                    min="1"
                    max={saleItem.selectedItem?.quantity || 999999}
                  />
                </FormField>
              </div>

              {saleItem.selectedItem && (
                <div className="item-info-box">
                  <span className="item-info-stat"><strong>Item</strong> {itemOptionLabel(saleItem.selectedItem)}</span>
                  <span className="item-info-stat"><strong>Available</strong> {saleItem.selectedItem.quantity}</span>
                  <span className="item-info-stat"><strong>FIFO cost</strong> {formatAmount(saleItem.selectedItem.purchasePrice)}</span>
                  <span className="item-info-hint">Profit is estimated from FIFO cost and finalized on save.</span>
                </div>
              )}

              <div className="form-fields-row">
                <FormField label="Selling Price" htmlFor={`amount-${index}`} required>
                  <Input
                    type="number"
                    name="amount"
                    placeholder="Amount"
                    value={saleItem.amount}
                    onChange={(e) => handleItemChange(index, 'amount', e.target.value)}
                    step="any"
                    min="0"
                  />
                </FormField>
                <FormField label="Profit" htmlFor={`profit-${index}`}>
                  <Input
                    type="number"
                    name="profit"
                    placeholder="Profit (Auto-calculated)"
                    value={saleItem.profit || 0}
                    disabled={true}
                    step="any"
                  />
                </FormField>
              </div>
            </div>
          ))}
        </div>

        {/* <div className="sale-totals">
          <div className="total-row">
            <strong>Selling Price</strong> {formatAmount(totalAmount)}
          </div>
          <div className="total-row">
            <strong>Profit</strong> {formatAmount(totalProfit)}
          </div>
        </div> */}

        <SalePaymentFields
          totalAmount={totalAmount}
          value={payment}
          onChange={setPayment}
        />

        <div className="form-actions">
          <button type="button" onClick={() => navigate('/sales')} className="form-button form-button-secondary">
            Cancel
          </button>
          <button type="submit" className="form-button form-button-primary" disabled={loading}>
            {loading ? 'Creating...' : 'Create Sale'}
          </button>
        </div>
      </FormWrapper>
      </RequireShop>
    </div>
  );
};

export default SaleCreate;