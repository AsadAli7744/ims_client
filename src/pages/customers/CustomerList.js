import React from 'react';
import Listing from '../../components/Listing';
import { customersApi } from '../../services/api';

const CustomerList = () => {
  const columns = [
    { header: 'Name', accessor: 'name' },
    { header: 'Phone', accessor: 'phone', render: (value) => value || '—' },
    { header: 'Email', accessor: 'email', render: (value) => value || '—' },
    { header: 'Address', accessor: 'address', render: (value) => value || '—' },
    { header: 'CNIC / ID', accessor: 'cnic', render: (value) => value || '—' },
    {
      header: 'Shop',
      accessor: 'shop',
      render: (value) => value?.name || 'Organization',
    },
  ];

  return (
    <Listing
      title="Customers"
      columns={columns}
      fetchData={customersApi.getAll}
      basePath="/customers"
      onDelete={customersApi.delete}
      writePermission="customers.write"
      deletePermission="customers.delete"
    />
  );
};

export default CustomerList;
