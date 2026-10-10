import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '../../components/Navigation';
import FormWrapper from '../../components/FormWrapper';
import FormField from '../../components/FormField';
import Input from '../../components/Input';
import RequireShop from '../../components/RequireShop';
import { customersApi } from '../../services/api';
import { getUser } from '../../services/session';

const CustomerCreate = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', phone: '', email: '', address: '', notes: '', cnic: '' });
  const [loading, setLoading] = useState(false);

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
      await customersApi.create({
        name: formData.name.trim(),
        phone: formData.phone.trim() || undefined,
        email: formData.email.trim() || undefined,
        address: formData.address.trim() || undefined,
        notes: formData.notes.trim() || undefined,
        cnic: formData.cnic.trim() || undefined,
      });
      navigate('/customers');
    } catch (error) {
      alert(error.message || 'Failed to create customer');
      setLoading(false);
    }
  };

  const user = getUser();

  return (
    <div>
      <Navigation />
      <RequireShop block={user?.role === 'user'}>
      <FormWrapper title="Create Customer" onSubmit={handleSubmit}>
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
            {loading ? 'Creating...' : 'Create'}
          </button>
        </div>
      </FormWrapper>
      </RequireShop>
    </div>
  );
};

export default CustomerCreate;
