import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '../../components/Navigation';
import FormWrapper from '../../components/FormWrapper';
import FormField from '../../components/FormField';
import Input from '../../components/Input';
import { itemTypesApi, shopsApi, unwrapList } from '../../services/api';
import { useShop } from '../../contexts/ShopContext';

const ItemTypeCreate = () => {
  const navigate = useNavigate();
  const { selectedShop } = useShop();
  const [shops, setShops] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    shopId: selectedShop?.id || '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    shopsApi.getAll()
      .then((data) => setShops(unwrapList(data)))
      .catch(() => setShops([]));
  }, []);

  useEffect(() => {
    if (selectedShop?.id && !formData.shopId) {
      setFormData((prev) => ({ ...prev, shopId: selectedShop.id }));
    }
  }, [selectedShop?.id, formData.shopId]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    if (!formData.name.trim()) {
      alert('Name is required');
      return;
    }
    if (!formData.shopId) {
      alert('Shop is required');
      return;
    }
    setLoading(true);
    try {
      await itemTypesApi.create({
        name: formData.name.trim(),
        shopId: Number(formData.shopId),
      });
      navigate('/item-types');
    } catch (error) {
      alert(error.message || 'Failed to create item type');
      setLoading(false);
    }
  };

  return (
    <div>
      <Navigation />
      <FormWrapper title="Create Item Type" onSubmit={handleSubmit}>
        <div className="form-fields-row">
          <FormField label="Name" htmlFor="name" required>
            <Input
              type="text"
              name="name"
              placeholder="e.g. Mobile, Accessories"
              value={formData.name}
              onChange={handleChange}
            />
          </FormField>
          <FormField label="Shop" htmlFor="shopId" required>
            <select
              id="shopId"
              name="shopId"
              value={formData.shopId}
              onChange={handleChange}
              className="form-input"
            >
              <option value="">Select shop</option>
              {shops.map((shop) => (
                <option key={shop.id} value={shop.id}>{shop.name}</option>
              ))}
            </select>
          </FormField>
        </div>
        <div className="form-actions">
          <button type="button" onClick={() => navigate('/item-types')} className="form-button form-button-secondary">
            Cancel
          </button>
          <button type="submit" className="form-button form-button-primary" disabled={loading}>
            {loading ? 'Creating...' : 'Create'}
          </button>
        </div>
      </FormWrapper>
    </div>
  );
};

export default ItemTypeCreate;
