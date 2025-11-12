export function downloadJSON(filename, rows) {
  const blob = new Blob([JSON.stringify(rows, null, 2)], { type: 'application/json' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
  a.download = filename.endsWith('.json') ? filename : filename + '.json';
  a.click(); URL.revokeObjectURL(a.href);
}
export function downloadCSV(filename, rows) {
  if (!rows || !rows.length) { alert('Dışa aktarılacak kayıt yok'); return; }
  const headers = Object.keys(rows[0]);
  const esc = (v) => {
    const s = String(v ?? '');
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [ headers.map(esc).join(','), ...rows.map(r => headers.map(h => esc(r[h])).join(',')) ].join('\n');
  const blob = new Blob([lines], { type: 'text/csv;charset=utf-8;' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
  a.download = filename.endsWith('.csv') ? filename : filename + '.csv';
  a.click(); URL.revokeObjectURL(a.href);
}
