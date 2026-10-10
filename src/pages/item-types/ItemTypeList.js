import React from 'react';
import Listing from '../../components/Listing';
import SearchFilterPanel from '../../components/SearchFilterPanel';
import { itemTypesApi } from '../../services/api';

const ItemTypeList = () => {
  const columns = [
    { header: 'Name', accessor: 'name' },
    {
      header: 'Shop',
      accessor: 'shop',
      render: (value) => value?.name || '—',
    },
  ];

  return (
    <Listing
      title="Item Types"
      columns={columns}
      fetchData={itemTypesApi.getAll}
      basePath="/item-types"
      onDelete={itemTypesApi.delete}
      renderFilters={(handleFilterChange, currentFilters, handleClear) => (
        <SearchFilterPanel
          onFilterChange={handleFilterChange}
          onClear={handleClear}
          currentFilters={currentFilters}
          placeholder="Search item type"
        />
      )}
    />
  );
};

export default ItemTypeList;
