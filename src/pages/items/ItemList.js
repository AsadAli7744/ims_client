import React from 'react';
import Listing from '../../components/Listing';
import ItemFilterPanel from './ItemFilterPanel';
import { itemsApi } from '../../services/api';
import { useShop } from '../../contexts/ShopContext';
import { getAssignedShops, getUser, isSuperAdmin, isTenantAdmin } from '../../services/session';
import { conditionLabel } from './itemCondition';
import { formatAmount } from '../../utils/formatAmount';

const ItemList = () => {
  const { selectedShop } = useShop();
  const user = getUser();
  const canSeeAllTypes = isSuperAdmin(user) || isTenantAdmin(user);
  const showShopOption = canSeeAllTypes || !!selectedShop || getAssignedShops(user).length > 0;
  const showStoreOption = canSeeAllTypes;
  const columns = [
    { header: 'Name', accessor: 'name' },
    { header: 'Unique ID', accessor: 'uniqueIdentifier', render: (value) => value || '—' },
    { header: 'Condition', accessor: 'condition', render: (value) => conditionLabel(value) },
    { 
      header: 'Company', 
      accessor: 'company',
      render: (value) => value?.name || 'N/A'
    },
    { 
      header: 'Categories', 
      accessor: 'categories',
      render: (value) => Array.isArray(value) && value.length > 0 
        ? value.map(c => c.name || c).join(', ') 
        : 'No categories'
    },
    { 
      header: 'Quantity', 
      accessor: 'quantity',
      render: (value) => value ?? 0
    },
    { 
      header: 'FIFO Cost (next out)', 
      accessor: 'purchasePrice',
      render: (value) => formatAmount(value)
    },
    { 
      header: 'Min Sale Price', 
      accessor: 'minimumSalePrice',
      render: (value) => formatAmount(value)
    },
  ];

  return (
    <Listing
      title="Items"
      columns={columns}
      fetchData={itemsApi.getAll}
      basePath="/items"
      onDelete={itemsApi.delete}
      writePermission="items.write"
      deletePermission="items.delete"
      renderFilters={(handleFilterChange, currentFilters, handleClear) => (
        <ItemFilterPanel
          onFilterChange={handleFilterChange}
          onClear={handleClear}
          currentFilters={currentFilters}
          showStoreOption={showStoreOption}
          showShopOption={showShopOption}
        />
      )}
    />
  );
};

export default ItemList;

