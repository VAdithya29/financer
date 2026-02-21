import { useState, useMemo } from 'react';
import { UNCATEGORIZED_ID } from '../utils/csvParser';

function formatNum(n) {
  if (n === 0) return '—';
  return Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const SORTABLE_COLUMNS = [
  { key: 'date', label: 'Date' },
  { key: 'description', label: 'Description' },
  { key: 'debitAmount', label: 'Debit' },
  { key: 'creditAmount', label: 'Credit' },
  { key: 'balance', label: 'Balance' },
  { key: 'transactionType', label: 'Type' },
  { key: 'localCurrencyAmount', label: 'Local amount' },
  { key: 'category', label: 'Category' },
];

function getSortValue(tx, key, categories) {
  if (key === 'category') {
    if (!tx.categoryId) return 'Uncategorized';
    const cat = categories.find((c) => c.id === tx.categoryId);
    return cat ? cat.name : '';
  }
  const v = tx[key];
  if (typeof v === 'number') return v;
  return (v ?? '').toString().toLowerCase();
}

export function TransactionsTable({
  transactions,
  categories,
  selectedIds,
  onToggleSelect,
  onSelectAll,
  onAssignCategory,
  onBulkAssignCategory,
}) {
  const [sortBy, setSortBy] = useState('date');
  const [sortDir, setSortDir] = useState('asc');

  const sortedTransactions = useMemo(() => {
    if (!sortBy) return [...transactions];
    const dir = sortDir === 'asc' ? 1 : -1;
    return [...transactions].sort((a, b) => {
      const va = getSortValue(a, sortBy, categories);
      const vb = getSortValue(b, sortBy, categories);
      if (typeof va === 'number' && typeof vb === 'number') return dir * (va - vb);
      const sa = String(va);
      const sb = String(vb);
      return dir * (sa < sb ? -1 : sa > sb ? 1 : 0);
    });
  }, [transactions, sortBy, sortDir, categories]);

  const allSelected = sortedTransactions.length > 0 && sortedTransactions.every((t) => selectedIds.has(t.id));
  const someSelected = selectedIds.size > 0;

  function handleSort(key) {
    if (sortBy === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(key);
      setSortDir('asc');
    }
  }

  function handleSelectAll(e) {
    onSelectAll(e.target.checked);
  }

  return (
    <div className="transactions-wrap">
      {someSelected && (
        <div className="bulk-assign">
          <span>Assign selected ({selectedIds.size}) to</span>
          <select
            value=""
            onChange={(e) => {
              const v = e.target.value;
              if (v !== '') {
                onBulkAssignCategory(v === '__uncategorized__' ? UNCATEGORIZED_ID : v);
                e.target.value = '';
              }
            }}
          >
            <option value="">— choose category —</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
            <option value="__uncategorized__">Uncategorized</option>
          </select>
        </div>
      )}
      <div className="table-scroll">
        <table className="transactions-table">
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={handleSelectAll}
                  aria-label="Select all"
                />
              </th>
              {SORTABLE_COLUMNS.map(({ key, label }) => (
                <th
                  key={key}
                  className="sortable"
                  onClick={() => handleSort(key)}
                  onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleSort(key)}
                  role="button"
                  tabIndex={0}
                  aria-sort={sortBy === key ? (sortDir === 'asc' ? 'ascending' : 'descending') : undefined}
                >
                  {label}
                  {sortBy === key && (
                    <span className="sort-indicator" aria-hidden>
                      {sortDir === 'asc' ? ' ↑' : ' ↓'}
                    </span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedTransactions.map((tx) => (
              <tr key={tx.id}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedIds.has(tx.id)}
                    onChange={() => onToggleSelect(tx.id)}
                    aria-label={`Select ${tx.description || tx.id}`}
                  />
                </td>
                <td>{tx.date}</td>
                <td className="desc">{tx.description}</td>
                <td className="num">{formatNum(tx.debitAmount)}</td>
                <td className="num">{formatNum(tx.creditAmount)}</td>
                <td className="num">{formatNum(tx.balance)}</td>
                <td>{tx.transactionType}</td>
                <td className="num">{formatNum(tx.localCurrencyAmount)}</td>
                <td>
                  <select
                    value={tx.categoryId === '' ? '__uncategorized__' : tx.categoryId}
                    onChange={(e) => {
                      const v = e.target.value;
                      onAssignCategory(tx.id, v === '__uncategorized__' ? UNCATEGORIZED_ID : v);
                    }}
                  >
                    <option value="__uncategorized__">Uncategorized</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
