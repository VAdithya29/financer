import { UNCATEGORIZED_ID } from '../utils/csvParser';

function formatNum(n) {
  return Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function CategorySummary({ transactions, categories }) {
  const byCategory = new Map();
  byCategory.set(UNCATEGORIZED_ID, { name: 'Uncategorized', count: 0, debit: 0, credit: 0 });
  categories.forEach((c) => {
    byCategory.set(c.id, { name: c.name, count: 0, debit: 0, credit: 0 });
  });

  transactions.forEach((tx) => {
    const id = tx.categoryId === '' ? UNCATEGORIZED_ID : tx.categoryId;
    const row = byCategory.get(id) ?? byCategory.get(UNCATEGORIZED_ID);
    if (row) {
      row.count += 1;
      row.debit += tx.debitAmount;
      row.credit += tx.creditAmount;
    }
  });

  const rows = [
    ...Array.from(byCategory.entries()).map(([id, r]) => ({ id, ...r, net: r.credit - r.debit })),
  ].filter((r) => r.count > 0 || r.id === UNCATEGORIZED_ID);

  return (
    <div className="summary-wrap">
      <h2>Summary by category</h2>
      <table className="summary-table">
        <thead>
          <tr>
            <th>Category</th>
            <th>Count</th>
            <th>Total debit</th>
            <th>Total credit</th>
            <th>Net</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id}>
              <td>{r.name}</td>
              <td className="num">{r.count}</td>
              <td className="num">{formatNum(r.debit)}</td>
              <td className="num">{formatNum(r.credit)}</td>
              <td className="num">{formatNum(r.net)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
