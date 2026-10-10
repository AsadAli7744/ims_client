import React, { useEffect, useState } from 'react';
import { itemTypesApi, unwrapList } from '../services/api';
import { useShop } from '../contexts/ShopContext';

const ItemTypeFilterField = ({ filters = {}, onChange, shopId }) => {
  const { selectedShop } = useShop();
  const resolvedShopId = shopId || filters.shopId || selectedShop?.id;
  const [itemTypes, setItemTypes] = useState([]);

  useEffect(() => {
    if (!resolvedShopId) {
      setItemTypes([]);
      return;
    }
    itemTypesApi.getAll(1, 100, { shopId: resolvedShopId })
      .then((data) => setItemTypes(unwrapList(data)))
      .catch(() => setItemTypes([]));
  }, [resolvedShopId]);

  if (!resolvedShopId) {
    return null;
  }

  return (
    <div className="filter-field">
      <label htmlFor="itemTypeId">Item type:</label>
      <select
        id="itemTypeId"
        name="itemTypeId"
        value={filters.itemTypeId || ''}
        onChange={onChange}
        className="filter-input"
      >
        <option value="">All types</option>
        {itemTypes.map((entry) => (
          <option key={entry.id} value={entry.id}>{entry.name}</option>
        ))}
      </select>
    </div>
  );
};

export default ItemTypeFilterField;
