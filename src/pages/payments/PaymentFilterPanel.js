import React, { useEffect, useState } from 'react';

const PaymentFilterPanel = ({ onFilterChange, currentFilters = {}, onClear }) => {
  const [filters, setFilters] = useState({
    sourceType: currentFilters.sourceType || '',
    date: currentFilters.date || '',
    dateFrom: currentFilters.dateFrom || '',
    dateTo: currentFilters.dateTo || '',
    search: currentFilters.search || '',
  });

  useEffect(() => {
    setFilters({
      sourceType: currentFilters.sourceType || '',
      date: currentFilters.date || '',
      dateFrom: currentFilters.dateFrom || '',
      dateTo: currentFilters.dateTo || '',
      search: currentFilters.search || '',
    });
  }, [
    currentFilters.sourceType,
    currentFilters.date,
    currentFilters.dateFrom,
    currentFilters.dateTo,
    currentFilters.search,
  ]);

  const handleChange = (e) => {
    const next = { ...filters, [e.target.name]: e.target.value };
    setFilters(next);
    onFilterChange?.(next);
  };

  const handleClear = () => {
    const cleared = {
      sourceType: '',
      date: '',
      dateFrom: '',
      dateTo: '',
      search: '',
    };
    setFilters(cleared);
    onClear?.(cleared);
  };

  return (
    <div className="filter-panel">
      <div className="form-fields-row">
        <label htmlFor="sourceType">
          Type
          <select id="sourceType" name="sourceType" value={filters.sourceType} onChange={handleChange}>
            <option value="">All</option>
            <option value="sale">Sale</option>
            <option value="purchase">Purchase</option>
            <option value="in">Cash In</option>
            <option value="out">Cash Out</option>
          </select>
        </label>
        <label htmlFor="search">
          Search
          <input
            id="search"
            name="search"
            type="text"
            placeholder="Receiver / notes"
            value={filters.search}
            onChange={handleChange}
          />
        </label>
      </div>
      <div className="form-fields-row">
        <label htmlFor="date">
          Date
          <input id="date" name="date" type="date" value={filters.date} onChange={handleChange} />
        </label>
        <label htmlFor="dateFrom">
          From
          <input id="dateFrom" name="dateFrom" type="date" value={filters.dateFrom} onChange={handleChange} />
        </label>
        <label htmlFor="dateTo">
          To
          <input id="dateTo" name="dateTo" type="date" value={filters.dateTo} onChange={handleChange} />
        </label>
      </div>
      <button type="button" className="form-button form-button-secondary" onClick={handleClear}>
        Clear filters
      </button>
    </div>
  );
};

export default PaymentFilterPanel;
