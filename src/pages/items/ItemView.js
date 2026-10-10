import React from 'react';
import SingleView from '../../components/SingleView';
import PermissionLink from '../../components/PermissionLink';
import { itemsApi } from '../../services/api';
import { conditionLabel } from './itemCondition';
import { formatAmount } from '../../utils/formatAmount';

const ItemView = () => {
  const fields = [
    { label: 'Name', accessor: 'name' },
    { 
      label: 'Company', 
      accessor: 'company',
      render: (value) => value?.id
        ? <PermissionLink module="companies" to={`/companies/${value.id}`}>{value.name || 'N/A'}</PermissionLink>
        : (value?.name || 'N/A')
    },
    { 
      label: 'Categories', 
      accessor: 'categories',
      render: (value) => Array.isArray(value) && value.length > 0
        ? value.map(c => c.name || c).join(', ')
        : 'No categories'
    },
    {
      label: 'Item type',
      accessor: 'itemType',
      render: (value) => value?.name || '—',
    },
    { 
      label: 'Store', 
      accessor: 'store',
      render: (value) => value?.id
        ? <PermissionLink module="stores" to={`/stores/${value.id}`}>{value.name || 'N/A'}</PermissionLink>
        : (value?.name || 'N/A')
    },
    { 
      label: 'Shop', 
      accessor: 'shop',
      render: (value) => value?.id
        ? <PermissionLink module="shops" to={`/shops/${value.id}`}>{value.name || 'N/A'}</PermissionLink>
        : (value?.name || 'N/A')
    },
    { label: 'Location', accessor: 'location' },
    { label: 'Unique Identifier', accessor: 'uniqueIdentifier', render: (value) => value || '—' },
    { label: 'Condition / Grade', accessor: 'condition', render: (value) => conditionLabel(value) },
    { 
      label: 'Quantity', 
      accessor: 'quantity',
      render: (value) => value ?? 0
    },
    { 
      label: 'FIFO Cost (next out)', 
      accessor: 'purchasePrice',
      render: (value) => formatAmount(value)
    },
    { 
      label: 'Stock Value (FIFO)', 
      accessor: 'fifoValue',
      render: (value, row) => {
        if (typeof value === 'number') {
          return formatAmount(value);
        }
        const qty = row.quantity ?? 0;
        const price = typeof row.purchasePrice === 'string' 
          ? parseFloat(row.purchasePrice) 
          : (row.purchasePrice || 0);
        return formatAmount(qty * price);
      }
    },
    { 
      label: 'FIFO Lots', 
      accessor: 'lots',
      render: (lots) => {
        if (!Array.isArray(lots) || lots.length === 0) {
          return 'No remaining lots';
        }
        return (
          <table className="sale-items-table">
            <thead>
              <tr>
                <th>Received</th>
                <th>Remaining</th>
                <th>Unit Cost</th>
              </tr>
            </thead>
            <tbody>
              {lots.map((lot) => (
                <tr key={lot.id}>
                  <td>{lot.receivedAt ? new Date(lot.receivedAt).toLocaleDateString() : 'N/A'}</td>
                  <td>{lot.remainingQuantity}</td>
                  <td>{formatAmount(lot.unitCost)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        );
      }
    },
    { 
      label: 'Minimum Sale Price', 
      accessor: 'minimumSalePrice',
      render: (value) => formatAmount(value)
    },
  ];

  return (
    <SingleView
      title="Item Details"
      fetchData={itemsApi.getOne}
      fields={fields}
      basePath="/items"
      writePermission="items.write"
    />
  );
};

export default ItemView;

