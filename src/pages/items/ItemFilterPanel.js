import React, { useState, useEffect } from 'react';
import FilterActions from '../../components/FilterActions';
import CatalogFilterFields from '../../components/CatalogFilterFields';
import { ITEM_CONDITIONS } from './itemCondition';
import './ItemFilterPanel.css';

const ItemFilterPanel = ({
  onFilterChange,
  onClear,
  currentFilters = {},
  showStoreOption = true,
  showShopOption = true,
}) => {
  const [filters, setFilters] = useState({
    filterType: currentFilters.filterType || '',
    search: currentFilters.search || '',
    date: currentFilters.date || '',
    dateFrom: currentFilters.dateFrom || '',
    dateTo: currentFilters.dateTo || '',
    condition: currentFilters.condition || '',
    companyId: currentFilters.companyId || '',
    categoryId: currentFilters.categoryId || '',
    itemTypeId: currentFilters.itemTypeId || '',
  });

  const showTypeFilter = showStoreOption || showShopOption;

  useEffect(() => {
    setFilters({
      filterType: currentFilters.filterType || '',
      search: currentFilters.search || '',
      date: currentFilters.date || '',
      dateFrom: currentFilters.dateFrom || '',
      dateTo: currentFilters.dateTo || '',
      condition: currentFilters.condition || '',
      companyId: currentFilters.companyId || '',
      categoryId: currentFilters.categoryId || '',
      itemTypeId: currentFilters.itemTypeId || '',
    });
  }, [currentFilters.filterType, currentFilters.search, currentFilters.date, currentFilters.dateFrom, currentFilters.dateTo, currentFilters.condition, currentFilters.companyId, currentFilters.categoryId, currentFilters.itemTypeId]);

  useEffect(() => {
    if (filters.filterType === 'store' && !showStoreOption) {
      const next = { ...filters, filterType: '' };
      setFilters(next);
      onFilterChange(next);
    }
    if (filters.filterType === 'shop' && !showShopOption) {
      const next = { ...filters, filterType: '' };
      setFilters(next);
      onFilterChange(next);
    }
  }, [showStoreOption, showShopOption]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newFilters = {
      ...filters,
      [name]: value
    };
    if (name === 'date' && value) {
      newFilters.dateFrom = '';
      newFilters.dateTo = '';
    }
    if ((name === 'dateFrom' || name === 'dateTo') && value) {
      newFilters.date = '';
    }

    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleClear = () => {
    const clearedFilters = {
      filterType: '',
      search: '',
      date: '',
      dateFrom: '',
      dateTo: '',
      condition: '',
      companyId: '',
      categoryId: '',
      itemTypeId: '',
    };
    setFilters(clearedFilters);
    onClear();
  };

  return (
    <div className="filter-panel">
      <div className="filter-panel-header">
        <h3>Filters</h3>
      </div>
      <div className="filter-panel-body">
        <div className="filter-row">
          {showTypeFilter && (
            <div className="filter-field">
              <label htmlFor="filterType">Filter by Type:</label>
              <select
                id="filterType"
                name="filterType"
                value={filters.filterType}
                onChange={handleChange}
                className="filter-input"
              >
                <option value="">All Items</option>
                {showStoreOption && <option value="store">Store Items Only</option>}
                {showShopOption && <option value="shop">Shop Items Only</option>}
              </select>
            </div>
          )}
          <div className="filter-field">
            <label htmlFor="search">Search:</label>
            <input
              type="text"
              id="search"
              name="search"
              value={filters.search}
              onChange={handleChange}
              placeholder="Search name or unique ID"
              className="filter-input"
            />
          </div>
          <CatalogFilterFields filters={filters} onChange={handleChange} />
          <div className="filter-field">
            <label htmlFor="condition">Condition:</label>
            <select
              id="condition"
              name="condition"
              value={filters.condition}
              onChange={handleChange}
              className="filter-input"
            >
              <option value="">All items</option>
              <option value="second_hand">Second-hand only</option>
              {ITEM_CONDITIONS.map((entry) => (
                <option key={entry.value} value={entry.value}>{entry.label}</option>
              ))}
            </select>
          </div>
          <div className="filter-field">
            <label htmlFor="date">Single Date:</label>
            <input
              type="date"
              id="date"
              name="date"
              value={filters.date}
              onChange={handleChange}
              className="filter-input"
            />
          </div>
          <div className="filter-field">
            <label htmlFor="dateFrom">Date From:</label>
            <input
              type="date"
              id="dateFrom"
              name="dateFrom"
              value={filters.dateFrom}
              onChange={handleChange}
              className="filter-input"
            />
          </div>
          <div className="filter-field">
            <label htmlFor="dateTo">Date To:</label>
            <input
              type="date"
              id="dateTo"
              name="dateTo"
              value={filters.dateTo}
              onChange={handleChange}
              className="filter-input"
            />
          </div>
        </div>
        <FilterActions onClear={handleClear} />
      </div>
    </div>
  );
};

export default ItemFilterPanel;
