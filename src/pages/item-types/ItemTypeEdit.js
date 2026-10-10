import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navigation from '../../components/Navigation';
import FormWrapper from '../../components/FormWrapper';
import FormField from '../../components/FormField';
import Input from '../../components/Input';
import { itemTypesApi, shopsApi, unwrapList } from '../../services/api';

const ItemTypeEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [shops, setShops] = useState([]);
  const [formData, setFormData] = useState({ name: '', shopId: '' });
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    shopsApi.getAll()
      .then((data) => setShops(unwrapList(data)))
      .catch(() => setShops([]));
    itemTypesApi.getOne(id)
      .then((data) => {
        setFormData({
          name: data.name || '',
          shopId: data.shop?.id || '',
        });
      })
      .catch(() => alert('Item type not found'))
      .finally(() => setLoadingData(false));
  }, [id]);

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
      await itemTypesApi.update(id, {
        name: formData.name.trim(),
        shopId: Number(formData.shopId),
      });
      navigate('/item-types');
    } catch (error) {
      alert(error.message || 'Failed to update item type');
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div>
        <Navigation />
        <p style={{ padding: 20 }}>Loading...</p>
      </div>
    );
  }

  return (
    <div>
      <Navigation />
      <FormWrapper title="Edit Item Type" onSubmit={handleSubmit}>
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
            {loading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </FormWrapper>
    </div>
  );
};

export default ItemTypeEdit;
