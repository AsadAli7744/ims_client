import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Table from './Table';
import Navigation from './Navigation';
import Pagination from './Pagination';
import FilterPanel from './FilterPanel';
import CollapsibleFilters from './CollapsibleFilters';
import { hasPermission } from '../services/session';
import { clearListingState, compactFilters, readListingState, writeListingState } from '../services/listingFilters';
import { useShop } from '../contexts/ShopContext';
import { getViewTenantId } from '../services/session';
import { formatAmount } from '../utils/formatAmount';
import './Listing.css';

const Listing = ({
  title,
  columns,
  fetchData,
  basePath,
  createPath,
  getViewPath,
  getEditPath,
  hideEdit = false,
  hideCreate = false,
  onDelete,
  showFilters = true,
  renderFilters,
  fetchTotals,
  totalsConfig,
  writePermission,
  deletePermission,
}) => {
  const navigate = useNavigate();
  const { selectedShop } = useShop();
  const viewTenantId = getViewTenantId();
  const stored = readListingState(basePath);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const loadRequest = useRef(0);
  const [filters, setFilters] = useState(stored.filters);
  const [totals, setTotals] = useState(null);
  const [pagination, setPagination] = useState({
    page: stored.page,
    limit: stored.limit,
    total: 0,
    totalPages: 0,
  });

  const persist = (nextFilters, page, limit) => {
    writeListingState(basePath, {
      filters: compactFilters(nextFilters),
      page,
      limit,
    });
  };

  const loadData = async (page = 1, limit = 10, currentFilters = {}) => {
    const requestId = ++loadRequest.current;
    setLoading(true);
    try {
      const result = await fetchData(page, limit, compactFilters(currentFilters));
      if (requestId !== loadRequest.current) {
        return;
      }

      if (result && result.data && result.total !== undefined) {
        setData(result.data);
        setPagination({
          page: result.page || page,
          limit: result.limit || limit,
          total: result.total || 0,
          totalPages: result.totalPages || 0,
        });
      } else {
        const rows = Array.isArray(result) ? result : [];
        setData(rows);
        setPagination({
          page: 1,
          limit,
          total: rows.length,
          totalPages: 1,
        });
      }
    } catch (error) {
      if (requestId !== loadRequest.current) {
        return;
      }
      console.error('Error loading data:', error);
      setData([]);
      setPagination({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
      });
    } finally {
      if (requestId === loadRequest.current) {
        setLoading(false);
      }
    }
  };

  const loadTotals = async (currentFilters = {}) => {
    if (!fetchTotals) return;
    try {
      const result = await fetchTotals(compactFilters(currentFilters));
      setTotals(result);
    } catch (error) {
      console.error('Error loading totals:', error);
      setTotals(null);
    }
  };

  useEffect(() => {
    const next = readListingState(basePath);
    setFilters(next.filters);
    loadData(next.page, next.limit, next.filters);
    if (fetchTotals) {
      loadTotals(next.filters);
    }
  }, [basePath, selectedShop?.id, viewTenantId]);

  const handleFilterChange = (newFilters) => {
    const next = newFilters || {};
    setFilters(next);
    persist(next, 1, pagination.limit);
    loadData(1, pagination.limit, next);
    if (fetchTotals) {
      loadTotals(next);
    }
  };

  const handleClearFilters = () => {
    setFilters({});
    clearListingState(basePath);
    loadData(1, pagination.limit, {});
    if (fetchTotals) {
      loadTotals({});
    }
  };

  const handlePageChange = (newPage) => {
    persist(filters, newPage, pagination.limit);
    loadData(newPage, pagination.limit, filters);
  };

  const handleRefresh = () => {
    loadData(pagination.page, pagination.limit, filters);
    if (fetchTotals) {
      loadTotals(filters);
    }
  };

  const handleCreate = () => {
    navigate(createPath || `${basePath}/create`);
  };

  const handleView = (id, row) => {
    if (getViewPath) {
      navigate(getViewPath(row || { id }));
      return;
    }
    navigate(`${basePath}/${id}`);
  };

  const handleEdit = (id, row) => {
    if (getEditPath) {
      navigate(getEditPath(row || { id }));
      return;
    }
    navigate(`${basePath}/${id}/edit`);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        if (onDelete) {
          await onDelete(id);
        }
        await loadData(pagination.page, pagination.limit, filters);
        if (fetchTotals) {
          await loadTotals(filters);
        }
      } catch (error) {
        console.error('Error deleting:', error);
        alert('Failed to delete item');
      }
    }
  };

  return (
    <div>
      <Navigation />
      <div className="listing-container">
        <div className="listing-header">
          <h1>{title}</h1>
          <div className="listing-header-actions">
            <button type="button" onClick={handleRefresh} className="listing-refresh-button" disabled={loading}>
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
            {!hideCreate && (!writePermission || hasPermission(writePermission)) && (
              <button type="button" onClick={handleCreate} className="listing-create-button">
                Create New
              </button>
            )}
          </div>
        </div>
        {showFilters && (
          <CollapsibleFilters title="Filters">
            {renderFilters ? (
              <div className="listing-filters">
                {renderFilters(handleFilterChange, filters, handleClearFilters)}
              </div>
            ) : (
              <FilterPanel
                onFilterChange={handleFilterChange}
                onClear={handleClearFilters}
                currentFilters={filters}
              />
            )}
          </CollapsibleFilters>
        )}
        {loading && data.length > 0 && <p className="listing-refreshing">Updating...</p>}
        <Table
          columns={columns}
          data={data}
          loading={loading}
          emptyMessage={title ? `No ${title} yet` : 'No records yet'}
          onView={handleView}
          onEdit={!hideEdit && (!writePermission || hasPermission(writePermission)) ? handleEdit : undefined}
          onDelete={onDelete && (!deletePermission || hasPermission(deletePermission)) ? handleDelete : undefined}
        />
        {pagination.totalPages > 1 && (
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
          />
        )}
        {pagination.total > 0 && (
          <div className="pagination-info">
            Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
            {pagination.total} entries
          </div>
        )}
        {totals && totalsConfig && (
          <div className="listing-totals">
            {totalsConfig.map((config, index) => {
              const value = totals[config.key];
              const displayValue = formatAmount(value);
              return (
                <div key={index} className="total-item">
                  <span className="total-label">{config.label}:</span>
                  <span className="total-value">{displayValue}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Listing;
