# Financer

A simple web app to upload bank transaction CSVs, assign transactions to categories (baskets), and view a summary by category. Runs entirely in the browser on localhost—no backend.

## Features

- **CSV upload** – Upload a single CSV file with bank transaction logs. The app parses it and drops columns you don’t need (Description2, Description3, Posted Currency, Local Currency).
- **Custom categories** – Add your own category names (e.g. Food, Transport). Categories are stored in your browser (localStorage) and persist across sessions.
- **Categorize transactions** – Assign each transaction to a category via a per-row dropdown, or select multiple rows and assign them all at once.
- **Filters** – Filter the table by category (All / specific category / Uncategorized), date range (from–to), and text search on the description.
- **Sortable table** – Click any column header (Date, Description, Debit, Credit, Balance, Type, Local amount, Category) to sort; click again to toggle ascending/descending.
- **Summary** – A summary table shows per-category count, total debit, total credit, and net. It uses the full dataset (not the filtered view).

## CSV format

The CSV must include these columns (names are normalized by trimming):

- `Posted Transactions Date`
- `Description1`
- `Description2` (dropped)
- `Description3` (dropped)
- `Debit Amount`
- `Credit Amount`
- `Balance`
- `Posted Currency` (dropped)
- `Transaction Type`
- `Local Currency Amount`
- `Local Currency` (dropped)

Only the non-dropped columns are kept and shown. A sample file `sample.csv` is included for testing.

## Running the app

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the dev server:
   ```bash
   npm run dev
   ```
3. Open the URL shown (e.g. `http://localhost:5173`) in your browser.
4. Click **Upload CSV** and choose your bank export CSV (or use `sample.csv` to try it).

## Scripts

- `npm run dev` – Start development server (Vite).
- `npm run build` – Build for production.
- `npm run preview` – Preview the production build locally.

## Project structure

```
Financer/
  index.html
  package.json
  vite.config.js
  sample.csv
  src/
    main.jsx
    App.jsx
    App.css
    components/
      FileUpload.jsx      # CSV file input
      TransactionFilters.jsx
      TransactionsTable.jsx  # Sortable table, checkboxes, bulk assign
      CategorySummary.jsx
    hooks/
      useLocalStorage.js   # Persist categories
    utils/
      csvParser.js         # Parse CSV, drop columns, normalize
    data/
      defaultCategories.js # Optional seed categories (empty by default)
```

## Tech stack

- React 18
- Vite
- PapaParse (CSV parsing)
- No backend; data stays in the browser (localStorage for categories only; transactions and assignments are in-memory for the current session).
