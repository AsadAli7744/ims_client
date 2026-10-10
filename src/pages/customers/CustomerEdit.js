import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navigation from '../../components/Navigation';
import FormWrapper from '../../components/FormWrapper';
import FormField from '../../components/FormField';
import Input from '../../components/Input';
import { customersApi } from '../../services/api';

const CustomerEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [formData, setFormData] = useState({ name: '', phone: '', email: '', address: '', notes: '', cnic: '' });
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await customersApi.getOne(id);
        setFormData({
          name: data.name || '',
          phone: data.phone || '',
          email: data.email || '',
          address: data.address || '',
          notes: data.notes || '',
          cnic: data.cnic || '',
        });
      } catch (error) {
        console.error('Error loading customer:', error);
      } finally {
        setLoadingData(false);
      }
    };
    loadData();
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    if (!formData.name.trim()) {
      alert('Customer name is required');
      return;
    }
    setLoading(true);
    try {
      await customersApi.update(id, {
        name: formData.name.trim(),
        phone: formData.phone.trim() || null,
        email: formData.email.trim() || null,
        address: formData.address.trim() || null,
        notes: formData.notes.trim() || null,
        cnic: formData.cnic.trim() || null,
      });
      navigate('/customers');
    } catch (error) {
      alert(error.message || 'Failed to update customer');
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

  return (
    <div>
      <Navigation />
      <FormWrapper title="Edit Customer" onSubmit={handleSubmit}>
        <div className="form-fields-row">
          <FormField label="Name" htmlFor="name" required>
            <Input
              type="text"
              name="name"
              placeholder="Customer name"
              value={formData.name}
              onChange={handleChange}
            />
          </FormField>
          <FormField label="Phone" htmlFor="phone">
            <Input
              type="text"
              name="phone"
              placeholder="Optional phone"
              value={formData.phone}
              onChange={handleChange}
            />
          </FormField>
        </div>
        <div className="form-fields-row">
          <FormField label="Email" htmlFor="email">
            <Input
              type="email"
              name="email"
              placeholder="Optional email"
              value={formData.email}
              onChange={handleChange}
            />
          </FormField>
          <FormField label="Address" htmlFor="address">
            <Input
              type="text"
              name="address"
              placeholder="Optional address"
              value={formData.address}
              onChange={handleChange}
            />
          </FormField>
        </div>
        <div className="form-fields-row">
          <FormField label="CNIC / ID" htmlFor="cnic">
            <Input
              type="text"
              name="cnic"
              placeholder="Optional CNIC / ID"
              value={formData.cnic}
              onChange={handleChange}
              maxLength={20}
            />
          </FormField>
        </div>
        <FormField label="Notes" htmlFor="notes">
          <Input
            type="text"
            name="notes"
            placeholder="Optional notes"
            value={formData.notes}
            onChange={handleChange}
          />
        </FormField>
        <div className="form-actions">
          <button type="button" onClick={() => navigate('/customers')} className="form-button form-button-secondary">
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

export default CustomerEdit;
