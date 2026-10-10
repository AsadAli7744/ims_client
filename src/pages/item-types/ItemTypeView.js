import React from 'react';
import SingleView from '../../components/SingleView';
import { itemTypesApi } from '../../services/api';

const ItemTypeView = () => {
  const fields = [
    { label: 'Name', accessor: 'name' },
    {
      label: 'Shop',
      accessor: 'shop',
      render: (value) => value?.name || '—',
    },
  ];

  return (
    <SingleView
      title="Item Type"
      fields={fields}
      fetchData={itemTypesApi.getOne}
      basePath="/item-types"
    />
  );
};

export default ItemTypeView;
