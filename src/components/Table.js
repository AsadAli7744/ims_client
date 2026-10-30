import React from 'react';
import './Table.css';

const ActionIcon = ({ name }) => {
  const paths = {
    view: 'M12 5c-5 0-9 4.5-10 6 1 1.5 5 6 10 6s9-4.5 10-6c-1-1.5-5-6-10-6zm0 10a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm0-2.2A1.8 1.8 0 1 0 12 9a1.8 1.8 0 0 0 0 3.6z',
    edit: 'M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z',
    delete: 'M6 19a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z',
  };
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
      <path fill="currentColor" d={paths[name]} />
    </svg>
  );
};

const Table = ({
  columns,
  data = [],
  onEdit,
  onDelete,
  onView,
  canEdit,
  canDelete,
  loading = false,
  emptyMessage = 'No records yet',
}) => {
  return (
    <div className="table-container">
      <table className="common-table">
        <thead>
          <tr>
            {columns.map((col, index) => (
              <th key={index}>{col.header}</th>
            ))}
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {loading && data.length === 0 ? (
            <tr>
              <td colSpan={columns.length + 1} className="table-empty">
                Loading...
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length + 1} className="table-empty">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {columns.map((col, colIndex) => (
                  <td key={colIndex}>
                    {col.render ? col.render(row[col.accessor], row) : row[col.accessor]}
                  </td>
                ))}
                <td className="table-actions">
                  <div className="table-actions-inner">
                    {onView && (
                      <button
                        type="button"
                        onClick={() => onView(row.id || rowIndex, row)}
                        className="table-button table-button-view"
                        aria-label="View"
                        title="View"
                      >
                        <ActionIcon name="view" />
                      </button>
                    )}
                    {onEdit && (!canEdit || canEdit(row)) && (
                      <button
                        type="button"
                        onClick={() => onEdit(row.id || rowIndex, row)}
                        className="table-button table-button-edit"
                        aria-label="Edit"
                        title="Edit"
                      >
                        <ActionIcon name="edit" />
                      </button>
                    )}
                    {onDelete && (!canDelete || canDelete(row)) && (
                      <button
                        type="button"
                        onClick={() => onDelete(row.id || rowIndex)}
                        className="table-button table-button-delete"
                        aria-label="Delete"
                        title="Delete"
                      >
                        <ActionIcon name="delete" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
