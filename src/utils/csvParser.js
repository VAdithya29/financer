import Papa from 'papaparse';

const KEEP_KEYS = [
  'Posted Transactions Date',
  'Description1',
  'Debit Amount',
  'Credit Amount',
  'Balance',
  'Transaction Type',
  'Local Currency Amount',
];

const UNCATEGORIZED_ID = '';

function normalizeHeader(h) {
  return String(h).trim();
}

function normalizeRow(row, headers) {
  const normalized = {};
  headers.forEach((h, i) => {
    const key = normalizeHeader(h);
    if (KEEP_KEYS.includes(key)) {
      normalized[key] = row[i] != null ? String(row[i]).trim() : '';
    }
  });
  return normalized;
}

function parseNumber(val) {
  if (val === '' || val == null) return 0;
  const s = String(val).replace(/,/g, '');
  const n = parseFloat(s);
  return Number.isNaN(n) ? 0 : n;
}

/**
 * Parse CSV file content. Keeps only: Posted Transactions Date, Description1,
 * Debit Amount, Credit Amount, Balance, Transaction Type, Local Currency Amount.
 * Drops: Description2, Description3, Posted Currency, Local Currency.
 * @param {string} csvText - Raw CSV string
 * @returns {{ transactions: Array, error: string | null }}
 */
export function parseTransactionsCsv(csvText) {
  const result = Papa.parse(csvText, { skipEmptyLines: true });
  if (result.errors.length > 0) {
    return { transactions: [], error: result.errors[0].message };
  }
  const rows = result.data;
  if (!rows.length) return { transactions: [], error: null };
  const rawHeaders = rows[0];
  const headers = rawHeaders.map(normalizeHeader);
  const dataRows = rows.slice(1);
  const transactions = dataRows
    .filter((row) => row.some((cell) => cell != null && String(cell).trim() !== ''))
    .map((row, index) => {
      const raw = normalizeRow(row, headers);
      return {
        id: `tx-${index}-${Date.now()}`,
        categoryId: UNCATEGORIZED_ID,
        date: raw['Posted Transactions Date'] ?? '',
        description: raw['Description1'] ?? '',
        debitAmount: parseNumber(raw['Debit Amount']),
        creditAmount: parseNumber(raw['Credit Amount']),
        balance: parseNumber(raw['Balance']),
        transactionType: raw['Transaction Type'] ?? '',
        localCurrencyAmount: parseNumber(raw['Local Currency Amount']),
      };
    });
  return { transactions, error: null };
}

export { UNCATEGORIZED_ID };
