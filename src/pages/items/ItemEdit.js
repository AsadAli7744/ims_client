import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navigation from '../../components/Navigation';
import FormWrapper from '../../components/FormWrapper';
import FormField from '../../components/FormField';
import Input from '../../components/Input';
import { itemsApi, companiesApi, categoriesApi, itemTypesApi, storesApi, shopsApi, unwrapList } from '../../services/api';
import { ITEM_CONDITIONS } from './itemCondition';

const ItemEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    categories: [],
    storeId: '',
    shopId: '',
    itemTypeId: '',
    location: '',
    uniqueIdentifier: '',
    condition: '',
    quantity: 1,
    purchasePrice: '',
    minimumSalePrice: ''
  });
  const [companies, setCompanies] = useState([]);
  const [categories, setCategories] = useState([]);
  const [itemTypes, setItemTypes] = useState([]);
  const [stores, setStores] = useState([]);
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    loadData();
    loadCompanies();
    loadCategories();
    loadStores();
    loadShops();
  }, [id]);

  useEffect(() => {
    if (!formData.shopId) {
      setItemTypes([]);
      return;
    }
    itemTypesApi.getAll(1, 100, { shopId: formData.shopId })
      .then((data) => setItemTypes(unwrapList(data)))
      .catch(() => setItemTypes([]));
  }, [formData.shopId]);

  const loadData = async () => {
    try {
      setLoadingData(true);
      const data = await itemsApi.getOne(id);
      // Map the nested store/shop objects to IDs
      setFormData({
        ...data,
        company: data.company?.id || data.company || '',
        categories: data.categories?.map(c => c.id || c) || data.categories || [],
        storeId: data.store?.id || data.storeId || '',
        shopId: data.shop?.id || data.shopId || '',
        itemTypeId: data.itemType?.id || '',
        uniqueIdentifier: data.uniqueIdentifier || '',
        condition: data.condition || '',
        quantity: data.quantity ?? 0
      });
    } catch (error) {
      console.error('Error loading item:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const loadCompanies = async () => {
    try {
      const data = await companiesApi.getAll();
      setCompanies(unwrapList(data));
    } catch (error) {
      console.error('Error loading companies:', error);
    }
  };

  const loadCategories = async () => {
    try {
      const data = await categoriesApi.getAll();
      setCategories(unwrapList(data));
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadStores = async () => {
    try {
      const data = await storesApi.getAll();
      setStores(unwrapList(data));
    } catch (error) {
      console.error('Error loading stores:', error);
    }
  };

  const loadShops = async () => {
    try {
      const data = await shopsApi.getAll();
      setShops(unwrapList(data));
    } catch (error) {
      console.error('Error loading shops:', error);
    }
  };

  const handleChange = (e) => {
    if (e.target.name === 'categories') {
      const selectedOptions = Array.from(e.target.selectedOptions, option => parseInt(option.value));
      setFormData({
        ...formData,
        categories: selectedOptions
      });
    } else if (e.target.name === 'storeId') {
      // When selecting a store, clear shop
      const value = e.target.value ? parseInt(e.target.value) : '';
      setFormData({
        ...formData,
        storeId: value,
        shopId: '',
        itemTypeId: '',
      });
    } else if (e.target.name === 'shopId') {
      // When selecting a shop, clear store
      const value = e.target.value ? parseInt(e.target.value) : '';
      setFormData({
        ...formData,
        shopId: value,
        storeId: '',
        itemTypeId: '',
      });
    } else {
      setFormData({
        ...formData,
        [e.target.name]: e.target.value
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return; // Prevent multiple submissions
    
    // Validate required fields
    if (!formData.name || !formData.name.trim()) {
      alert('Please enter an item name');
      return;
    }
    if (!formData.company || formData.company === '') {
      alert('Please select a company');
      return;
    }
    
    setLoading(true);
    try {
      // Prepare data for API - convert empty strings to undefined and ensure proper types
      const submitData = {
        name: formData.name.trim(),
        company: formData.company ? parseInt(formData.company) : undefined,
        categories: Array.isArray(formData.categories) && formData.categories.length > 0 
          ? formData.categories.map(c => parseInt(c)) 
          : [],
        storeId: formData.storeId && formData.storeId !== '' ? parseInt(formData.storeId) : undefined,
        shopId: formData.shopId && formData.shopId !== '' ? parseInt(formData.shopId) : undefined,
        itemTypeId: formData.itemTypeId ? parseInt(formData.itemTypeId, 10) : null,
        location: formData.location || '',
        uniqueIdentifier: formData.uniqueIdentifier?.trim() || null,
        condition: formData.condition || null,
        quantity: formData.quantity ?? 0,
        purchasePrice: formData.purchasePrice || 0,
        minimumSalePrice: formData.minimumSalePrice || 0
      };
      await itemsApi.update(id, submitData);
      navigate('/items');
    } catch (error) {
      console.error('Error updating item:', error);
      alert(error.message || 'Failed to update item');
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

  const companyOptions = companies.map(comp => ({ value: comp.id, label: comp.name }));
  const categoryOptions = categories.map(cat => ({ value: cat.id, label: cat.name }));
  const itemTypeOptions = itemTypes.map((entry) => ({ value: entry.id, label: entry.name }));
  const storeOptions = stores.map(store => ({ value: store.id, label: store.name }));
  const shopOptions = shops.map(shop => ({ value: shop.id, label: shop.name }));

  return (
    <div>
      <Navigation />
      <FormWrapper title="Edit Item" onSubmit={handleSubmit}>
        <div className="form-fields-row">
          <FormField label="Name" htmlFor="name" required>
            <Input
              type="text"
              name="name"
              placeholder="Name"
              value={formData.name}
              onChange={handleChange}
            />
          </FormField>
          <FormField label="Company" htmlFor="company" required>
            <Input
              type="dropdown"
              name="company"
              placeholder="Select Company"
              value={formData.company}
              onChange={handleChange}
              options={companyOptions}
            />
          </FormField>
        </div>
        <div className="form-fields-row">
          <FormField label="Categories" htmlFor="categories">
            <Input
              type="dropdown"
              name="categories"
              placeholder="Select Categories"
              value={formData.categories}
              onChange={handleChange}
              options={categoryOptions}
              multiple={true}
            />
          </FormField>
          <FormField label="Item type (optional)" htmlFor="itemTypeId">
            <Input
              type="dropdown"
              name="itemTypeId"
              placeholder={formData.shopId ? 'Select item type' : 'Select a shop first'}
              value={formData.itemTypeId}
              onChange={handleChange}
              options={itemTypeOptions}
              disabled={!formData.shopId}
            />
          </FormField>
        </div>
        <div className="form-fields-row">
          <FormField label="Location" htmlFor="location">
            <Input
              type="text"
              name="location"
              placeholder="Location"
              value={formData.location}
              onChange={handleChange}
            />
          </FormField>
        </div>
        <div className="form-fields-row">
          <FormField label="Unique Identifier (optional)" htmlFor="uniqueIdentifier">
            <Input
              type="text"
              name="uniqueIdentifier"
              placeholder="IMEI, serial, tag, chassis..."
              value={formData.uniqueIdentifier}
              onChange={handleChange}
            />
          </FormField>
          <FormField label="Condition / Grade (optional)" htmlFor="condition">
            <select id="condition" name="condition" value={formData.condition} onChange={handleChange}>
              <option value="">Not set</option>
              {ITEM_CONDITIONS.map((entry) => (
                <option key={entry.value} value={entry.value}>{entry.label}</option>
              ))}
            </select>
          </FormField>
        </div>
        <div className="form-fields-row">
          <FormField label="Store (optional)" htmlFor="storeId">
            <Input
              type="dropdown"
              name="storeId"
              placeholder="Select Store (optional)"
              value={formData.storeId}
              onChange={handleChange}
              options={storeOptions}
            />
          </FormField>
          <FormField label="Shop (optional)" htmlFor="shopId">
            <Input
              type="dropdown"
              name="shopId"
              placeholder="Select Shop (optional)"
              value={formData.shopId}
              onChange={handleChange}
              options={shopOptions}
            />
          </FormField>
        </div>
        <div className="form-fields-row">
          <FormField label="Quantity" htmlFor="quantity" required>
            <Input
              type="number"
              name="quantity"
              placeholder="Quantity"
              value={formData.quantity}
              onChange={handleChange}
              min="1"
            />
          </FormField>
          <FormField label="Purchase Price (per unit)" htmlFor="purchasePrice" required>
            <Input
              type="number"
              name="purchasePrice"
              placeholder="Purchase Price (per unit)"
              value={formData.purchasePrice}
              onChange={handleChange}
              step="any"
            />
          </FormField>
        </div>
        <div className="form-fields-row">
          <FormField label="Minimum Sale Price" htmlFor="minimumSalePrice" required>
            <Input
              type="number"
              name="minimumSalePrice"
              placeholder="Minimum Sale Price"
              value={formData.minimumSalePrice}
              onChange={handleChange}
            />
          </FormField>
        </div>
        <div className="form-actions">
          <button type="button" onClick={() => navigate('/items')} className="form-button form-button-secondary">
            Cancel
          </button>
          <button type="submit" className="form-button form-button-primary" disabled={loading}>
            {loading ? 'Updating...' : 'Update'}
          </button>
        </div>
      </FormWrapper>
    </div>
  );
};

export default ItemEdit;

