import React from 'react';
import SingleView from '../../components/SingleView';
import PermissionLink from '../../components/PermissionLink';
import { customersApi } from '../../services/api';
import { hasPermission } from '../../services/session';
import { moneyText, paymentLabel, SERVICE_KIND_LABELS } from '../sales/salePayment';
import '../sales/SaleView.css';

const CustomerView = () => {
  const fields = [
    { label: 'Name', accessor: 'name' },
    { label: 'Phone', accessor: 'phone', render: (value) => value || '—' },
    { label: 'Email', accessor: 'email', render: (value) => value || '—' },
    { label: 'Address', accessor: 'address', render: (value) => value || '—' },
    { label: 'CNIC / ID', accessor: 'cnic', render: (value) => value || '—' },
    { label: 'Shop', accessor: 'shop', render: (value) => value?.name || 'Organization' },
    { label: 'Notes', accessor: 'notes', render: (value) => value || '—' },
  ];

  if (hasPermission('sales')) {
    fields.push({
      label: 'Sales',
      accessor: 'sales',
      render: (value) => {
        if (!value || !Array.isArray(value) || value.length === 0) {
          return 'No sales recorded';
        }
        return (
          <div className="sale-items-display">
            <table className="sale-items-table">
              <thead>
                <tr>
                  <th>Sale</th>
                  <th>Amount</th>
                  <th>Paid</th>
                  <th>Payment</th>
                  <th>Due</th>
                </tr>
              </thead>
              <tbody>
                {value.map((sale) => (
                  <tr key={sale.id}>
                    <td>
                      <PermissionLink module="sales" to={`/sales/${sale.id}`}>#{sale.id}</PermissionLink>
                    </td>
                    <td>{moneyText(sale.totalAmount)}</td>
                    <td>{moneyText(sale.amountPaid == null ? sale.totalAmount : sale.amountPaid)}</td>
                    <td>
                      <span className={`payment-badge payment-badge-${sale.paymentStatus || 'completed'}`}>
                        {paymentLabel(sale.paymentStatus)}
                      </span>
                    </td>
                    <td>{sale.nextDueDate || sale.promiseDate || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      },
    });
  }

  if (hasPermission('services')) {
    fields.push({
      label: 'Services',
      accessor: 'serviceJobs',
      render: (value) => {
        if (!value || !Array.isArray(value) || value.length === 0) {
          return 'No services recorded';
        }
        return (
          <div className="sale-items-display">
            <table className="sale-items-table">
              <thead>
                <tr>
                  <th>Service</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Payment</th>
                  <th>Due</th>
                </tr>
              </thead>
              <tbody>
                {value.map((job) => (
                  <tr key={job.id}>
                    <td>
                      <PermissionLink module="services" to={`/services/${job.id}`}>{job.title}</PermissionLink>
                    </td>
                    <td>{SERVICE_KIND_LABELS[job.kind] || job.kind}</td>
                    <td>{moneyText(job.amount)}</td>
                    <td>
                      <span className={`payment-badge payment-badge-${job.paymentStatus || 'completed'}`}>
                        {paymentLabel(job.paymentStatus)}
                      </span>
                    </td>
                    <td>{job.nextDueDate || job.promiseDate || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      },
    });
  }

  if (hasPermission('installments')) {
    fields.push({
      label: 'Installments',
      accessor: 'installmentPlans',
      render: (value) => {
        if (!value || !Array.isArray(value) || value.length === 0) {
          return 'No installment plans';
        }
        return (
          <div className="sale-items-display">
            <table className="sale-items-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Total</th>
                  <th>Paid</th>
                  <th>Count</th>
                </tr>
              </thead>
              <tbody>
                {value.map((plan) => (
                  <tr key={plan.id}>
                    <td>
                      <PermissionLink module="installments" to={`/installments/plans/${plan.id}`}>{plan.title}</PermissionLink>
                    </td>
                    <td>{moneyText(plan.totalAmount)}</td>
                    <td>{moneyText(plan.amountPaid)}</td>
                    <td>{plan.installmentCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      },
    });
  }

  return (
    <SingleView
      title="Customer Details"
      fetchData={customersApi.getOne}
      fields={fields}
      basePath="/customers"
      writePermission="customers.write"
    />
  );
};

export default CustomerView;
