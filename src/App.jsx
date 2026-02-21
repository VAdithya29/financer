import { useState, useCallback } from 'react';
import { parseTransactionsCsv, UNCATEGORIZED_ID } from './utils/csvParser';
import { useLocalStorage } from './hooks/useLocalStorage';
import { defaultCategories } from './data/defaultCategories';
import { FileUpload } from './components/FileUpload';
import { TransactionFilters } from './components/TransactionFilters';
import { TransactionsTable } from './components/TransactionsTable';
import { CategorySummary } from './components/CategorySummary';

const CATEGORIES_KEY = 'financer-categories';

function ensureCategoriesHaveIds(list) {
  return list.map((c) =>
    typeof c === 'string' ? { id: `cat-${c.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`, name: c } : c
  );
}

function filterTransactions(transactions, { filterCategoryId, dateFrom, dateTo, searchText }) {
  return transactions.filter((tx) => {
    if (filterCategoryId === '__uncategorized__') {
      if (tx.categoryId !== '' && tx.categoryId != null) return false;
    } else if (filterCategoryId) {
      if (tx.categoryId !== filterCategoryId) return false;
    }
    if (dateFrom && tx.date < dateFrom) return false;
    if (dateTo && tx.date > dateTo) return false;
    if (searchText.trim()) {
      const term = searchText.trim().toLowerCase();
      if (!(tx.description || '').toLowerCase().includes(term)) return false;
    }
    return true;
  });
}

export default function App() {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useLocalStorage(
    CATEGORIES_KEY,
    ensureCategoriesHaveIds(defaultCategories)
  );
  const [filterCategoryId, setFilterCategoryId] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [searchText, setSearchText] = useState('');
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [parseError, setParseError] = useState(null);

  const addCategory = useCallback(
    (name) => {
      const trimmed = (name || '').trim();
      if (!trimmed) return;
      const id = `cat-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      setCategories((prev) => [...prev, { id, name: trimmed }]);
    },
    [setCategories]
  );

  const handleFileParsed = useCallback(
    (text, _fileName) => {
      setParseError(null);
      const { transactions: next, error } = parseTransactionsCsv(text);
      if (error) {
        setParseError(error);
        setTransactions([]);
        return;
      }
      setTransactions(next);
      setSelectedIds(new Set());
    },
    []
  );

  const filteredTransactions = filterTransactions(transactions, {
    filterCategoryId,
    dateFrom,
    dateTo,
    searchText,
  });

  const handleToggleSelect = useCallback((id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleSelectAll = useCallback((checked) => {
    if (!checked) {
      setSelectedIds(new Set());
      return;
    }
    setSelectedIds(new Set(filteredTransactions.map((t) => t.id)));
  }, [filteredTransactions]);

  const handleAssignCategory = useCallback((txId, categoryId) => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === txId ? { ...t, categoryId: categoryId || UNCATEGORIZED_ID } : t))
    );
  }, []);

  const handleBulkAssignCategory = useCallback((categoryId) => {
    const idSet = new Set(selectedIds);
    setTransactions((prev) =>
      prev.map((t) =>
        idSet.has(t.id) ? { ...t, categoryId: categoryId || UNCATEGORIZED_ID } : t
      )
    );
    setSelectedIds(new Set());
  }, [selectedIds]);

  const [newCategoryName, setNewCategoryName] = useState('');
  const onAddCategorySubmit = (e) => {
    e.preventDefault();
    addCategory(newCategoryName);
    setNewCategoryName('');
  };

  return (
    <div className="app">
      <header className="header">
        <h1>Financer</h1>
        <p className="tagline">Upload bank CSV and categorize transactions</p>
      </header>

      <section className="upload-section">
        <FileUpload onFileParsed={handleFileParsed} />
        {parseError && <p className="error">CSV error: {parseError}</p>}
      </section>

      <section className="categories-section">
        <form onSubmit={onAddCategorySubmit} className="add-category-form">
          <label>
            Add category
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="e.g. Food, Transport"
            />
          </label>
          <button type="submit">Add</button>
        </form>
      </section>

      {transactions.length > 0 && (
        <>
          <section className="filters-section">
            <TransactionFilters
              filterCategoryId={filterCategoryId}
              onFilterCategoryChange={setFilterCategoryId}
              dateFrom={dateFrom}
              dateTo={dateTo}
              onDateFromChange={setDateFrom}
              onDateToChange={setDateTo}
              searchText={searchText}
              onSearchChange={setSearchText}
              categories={categories}
              hasTransactions={transactions.length > 0}
            />
          </section>

          <section className="table-section">
            <TransactionsTable
              transactions={filteredTransactions}
              categories={categories}
              selectedIds={selectedIds}
              onToggleSelect={handleToggleSelect}
              onSelectAll={handleSelectAll}
              onAssignCategory={handleAssignCategory}
              onBulkAssignCategory={handleBulkAssignCategory}
            />
          </section>

          <section className="summary-section">
            <CategorySummary transactions={transactions} categories={categories} />
          </section>
        </>
      )}

      {transactions.length === 0 && !parseError && (
        <p className="hint">Upload a CSV file to get started.</p>
      )}
    </div>
  );
}
