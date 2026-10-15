function escapeCell(value) {
  if (value === null || value === undefined) return '';
  const text = String(value);
  if (/[",\r\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

function toCsv(columns, rows) {
  const header = columns.map((col) => escapeCell(col.label)).join(',');
  const lines = rows.map((row) => columns.map((col) => escapeCell(col.value(row))).join(','));
  return [header, ...lines].join('\r\n');
}

module.exports = { toCsv };
