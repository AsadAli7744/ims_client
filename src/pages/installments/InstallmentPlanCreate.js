import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '../../components/Navigation';
import FormWrapper from '../../components/FormWrapper';
import FormField from '../../components/FormField';
import Input from '../../components/Input';
import RequireShop from '../../components/RequireShop';
import { installmentsApi } from '../../services/api';
import { CustomerSearchSelect } from '../../components/entitySearchSelects';
import InlineCreatePanel from '../../components/InlineCreatePanel';
import { money } from '../sales/salePayment';
import '../sales/SaleCreate.css';

const InstallmentPlanCreate = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    notes: '',
    totalAmount: '',
    downPayment: '',
    installmentCount: '3',
    schedule: 'first_of_month',
    dayOfMonth: '1',
    firstDueDate: '',
    customerId: '',
    newCustomerName: '',
    newCustomerPhone: '',
    newCustomerCnic: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    const next = { ...formData, [name]: value };
    if (name === 'schedule' && value === 'first_of_month') {
      next.dayOfMonth = '1';
    }
    setFormData(next);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    if (!formData.title.trim()) {
      alert('Title is required');
      return;
    }
    if (!formData.customerId && !formData.newCustomerName.trim()) {
      alert('Select a customer or add a new one');
      return;
    }
    const totalAmount = money(formData.totalAmount);
    const downPayment = money(formData.downPayment);
    const installmentCount = Number(formData.installmentCount);
    if (totalAmount <= 0) {
      alert('Total amount must be greater than 0');
      return;
    }
    if (downPayment >= totalAmount) {
      alert('Down payment must leave an amount to schedule');
      return;
    }
    if (!installmentCount || installmentCount < 1) {
      alert('Enter how many installments to collect');
      return;
    }
    if (!formData.firstDueDate) {
      alert('First due date is required');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        title: formData.title.trim(),
        notes: formData.notes.trim() || undefined,
        totalAmount,
        downPayment,
        installmentCount,
        schedule: formData.schedule,
        dayOfMonth: formData.schedule === 'first_of_month' ? 1 : Number(formData.dayOfMonth || 1),
        firstDueDate: formData.firstDueDate,
      };
      if (formData.customerId) {
        payload.customerId = Number(formData.customerId);
      } else {
        payload.newCustomer = {
          name: formData.newCustomerName.trim(),
          phone: formData.newCustomerPhone.trim() || undefined,
          cnic: formData.newCustomerCnic.trim() || undefined,
        };
      }
      const created = await installmentsApi.createPlan(payload);
      navigate(`/installments/plans/${created.id}`);
    } catch (error) {
      alert(error.message || 'Failed to create installment plan');
      setLoading(false);
    }
  };

  return (
    <div>
      <Navigation />
      <RequireShop block>
        <FormWrapper title="Create Installment Plan" onSubmit={handleSubmit}>
          <p className="sale-payment-hint">
            Name the plan anything — a product, a repair, consultancy, or any other charge.
            Stock is not reduced. Every payment collected here is added to profit.
          </p>
          <div className="form-fields-row">
            <FormField label="Title" htmlFor="title" required>
              <Input
                type="text"
                name="title"
                placeholder="Phone, repair, pouch, consultancy..."
                value={formData.title}
                onChange={handleChange}
              />
            </FormField>
            <FormField label="Total amount" htmlFor="totalAmount" required>
              <Input
                type="number"
                name="totalAmount"
                min="0.01"
                step="any"
                value={formData.totalAmount}
                onChange={handleChange}
              />
            </FormField>
          </div>
          <div className="form-fields-row">
            <FormField label="Customer" htmlFor="customerId">
              <CustomerSearchSelect
                id="customerId"
                name="customerId"
                placeholder="Search customer"
                emptyOption={{ value: '', label: 'Select customer' }}
                value={formData.customerId}
                onChange={handleChange}
              />
            </FormField>
          </div>
          {!formData.customerId && (
            <InlineCreatePanel title="Add new customer">
              <div className="form-fields-row">
                <FormField label="Customer name" htmlFor="newCustomerName">
                  <Input
                    type="text"
                    name="newCustomerName"
                    placeholder="Customer name"
                    value={formData.newCustomerName}
                    onChange={handleChange}
                  />
                </FormField>
                <FormField label="Phone" htmlFor="newCustomerPhone">
                  <Input
                    type="text"
                    name="newCustomerPhone"
                    placeholder="Optional phone"
                    value={formData.newCustomerPhone}
                    onChange={handleChange}
                  />
                </FormField>
              </div>
              <div className="form-fields-row">
                <FormField label="CNIC / ID" htmlFor="newCustomerCnic">
                  <Input
                    type="text"
                    name="newCustomerCnic"
                    placeholder="Optional CNIC / ID"
                    value={formData.newCustomerCnic}
                    onChange={handleChange}
                  />
                </FormField>
              </div>
            </InlineCreatePanel>
          )}
          <div className="form-fields-row">
            <FormField label="Down payment" htmlFor="downPayment">
              <Input
                type="number"
                name="downPayment"
                min="0"
                step="any"
                value={formData.downPayment}
                onChange={handleChange}
              />
            </FormField>
            <FormField label="Number of installments" htmlFor="installmentCount" required>
              <Input
                type="number"
                name="installmentCount"
                min="1"
                max="120"
                value={formData.installmentCount}
                onChange={handleChange}
              />
            </FormField>
          </div>
          <div className="form-fields-row">
            <FormField label="Monthly schedule" htmlFor="schedule" required>
              <Input
                type="dropdown"
                name="schedule"
                value={formData.schedule}
                onChange={handleChange}
                options={[
                  { value: 'first_of_month', label: '1st of every month' },
                  { value: 'monthly_on_day', label: 'Same chosen day every month' },
                ]}
              />
            </FormField>
            {formData.schedule === 'monthly_on_day' && (
              <FormField label="Day of month (1-28)" htmlFor="dayOfMonth" required>
                <Input
                  type="number"
                  name="dayOfMonth"
                  min="1"
                  max="28"
                  value={formData.dayOfMonth}
                  onChange={handleChange}
                />
              </FormField>
            )}
            <FormField label="First due date" htmlFor="firstDueDate" required>
              <Input
                type="date"
                name="firstDueDate"
                value={formData.firstDueDate}
                onChange={handleChange}
              />
            </FormField>
          </div>
          <FormField label="Notes" htmlFor="notes">
            <Input
              type="text"
              name="notes"
              placeholder="Optional"
              value={formData.notes}
              onChange={handleChange}
            />
          </FormField>
          <div className="form-actions">
            <button type="button" onClick={() => navigate('/installments')} className="form-button form-button-secondary">
              Cancel
            </button>
            <button type="submit" className="form-button form-button-primary" disabled={loading}>
              {loading ? 'Creating...' : 'Create Plan'}
            </button>
          </div>
        </FormWrapper>
      </RequireShop>
    </div>
  );
};

export default InstallmentPlanCreate;
