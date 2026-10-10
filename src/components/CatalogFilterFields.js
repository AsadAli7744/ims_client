import React, { useEffect, useState } from 'react';
import { categoriesApi, companiesApi, unwrapList } from '../services/api';
import ItemTypeFilterField from './ItemTypeFilterField';

const CatalogFilterFields = ({ filters = {}, onChange, showItemType = true }) => {
  const [companies, setCompanies] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    companiesApi.getAll()
      .then((data) => setCompanies(unwrapList(data)))
      .catch(() => setCompanies([]));
    categoriesApi.getAll()
      .then((data) => setCategories(unwrapList(data)))
      .catch(() => setCategories([]));
  }, []);

  return (
    <>
      <div className="filter-field">
        <label htmlFor="companyId">Company:</label>
        <select
          id="companyId"
          name="companyId"
          value={filters.companyId || ''}
          onChange={onChange}
          className="filter-input"
        >
          <option value="">All companies</option>
          {companies.map((company) => (
            <option key={company.id} value={company.id}>{company.name}</option>
          ))}
        </select>
      </div>
      <div className="filter-field">
        <label htmlFor="categoryId">Category:</label>
        <select
          id="categoryId"
          name="categoryId"
          value={filters.categoryId || ''}
          onChange={onChange}
          className="filter-input"
        >
          <option value="">All categories</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>{category.name}</option>
          ))}
        </select>
      </div>
      {showItemType && (
        <ItemTypeFilterField filters={filters} onChange={onChange} />
      )}
    </>
  );
};

export default CatalogFilterFields;
