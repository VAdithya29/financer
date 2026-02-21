export function TransactionFilters({
  filterCategoryId,
  onFilterCategoryChange,
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
  searchText,
  onSearchChange,
  categories,
  hasTransactions,
}) {
  return (
    <div className="filters">
      <label>
        Category
        <select
          value={filterCategoryId}
          onChange={(e) => onFilterCategoryChange(e.target.value)}
          disabled={!hasTransactions}
        >
          <option value="">All</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
          <option value="__uncategorized__">Uncategorized</option>
        </select>
      </label>
      <label>
        From date
        <input
          type="date"
          value={dateFrom}
          onChange={(e) => onDateFromChange(e.target.value)}
          disabled={!hasTransactions}
        />
      </label>
      <label>
        To date
        <input
          type="date"
          value={dateTo}
          onChange={(e) => onDateToChange(e.target.value)}
          disabled={!hasTransactions}
        />
      </label>
      <label>
        Search description
        <input
          type="search"
          placeholder="Search…"
          value={searchText}
          onChange={(e) => onSearchChange(e.target.value)}
          disabled={!hasTransactions}
        />
      </label>
    </div>
  );
}
