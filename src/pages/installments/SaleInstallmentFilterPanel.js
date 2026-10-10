import React, { useEffect, useState } from 'react';
import FilterActions from '../../components/FilterActions';
import '../../components/FilterPanel.css';

const emptyFilters = {
  installmentStatus: '',
  search: '',
  date: '',
  dateFrom: '',
  dateTo: '',
};

const SaleInstallmentFilterPanel = ({ onFilterChange, onClear, currentFilters = {} }) => {
  const [filters, setFilters] = useState({ ...emptyFilters, ...currentFilters });

  useEffect(() => {
    setFilters({ ...emptyFilters, ...currentFilters });
  }, [
    currentFilters.installmentStatus,
    currentFilters.search,
    currentFilters.date,
    currentFilters.dateFrom,
    currentFilters.dateTo,
  ]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newFilters = { ...filters, [name]: value };
    if (name === 'date' && value) {
      newFilters.dateFrom = '';
      newFilters.dateTo = '';
    }
    if ((name === 'dateFrom' || name === 'dateTo') && (newFilters.dateFrom || newFilters.dateTo)) {
      newFilters.date = '';
    }
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleClear = () => {
    setFilters(emptyFilters);
    if (onClear) {
      onClear();
    } else {
      onFilterChange(emptyFilters);
    }
  };

  return (
    <div className="filter-panel">
      <div className="filter-panel-header">
        <h3>Filters</h3>
      </div>
      <div className="filter-panel-body">
        <div className="filter-row">
          <div className="filter-field">
            <label htmlFor="installmentStatus">Status:</label>
            <select
              id="installmentStatus"
              name="installmentStatus"
              value={filters.installmentStatus}
              onChange={handleChange}
              className="filter-input"
            >
              <option value="">All</option>
              <option value="overdue">Overdue</option>
              <option value="dueToday">Due today</option>
              <option value="upcoming">Upcoming</option>
              <option value="pending">Pending payment</option>
              <option value="partial">Partially paid</option>
            </select>
          </div>
          <div className="filter-field">
            <label htmlFor="search">Customer:</label>
            <input
              type="text"
              id="search"
              name="search"
              value={filters.search}
              onChange={handleChange}
              placeholder="Customer, item, or unique ID"
              className="filter-input"
            />
          </div>
          <div className="filter-field">
            <label htmlFor="date">Due date:</label>
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
            <label htmlFor="dateFrom">Due from:</label>
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
            <label htmlFor="dateTo">Due to:</label>
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

export default SaleInstallmentFilterPanel;
