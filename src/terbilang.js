const ONES = ['', 'satu', 'dua', 'tiga', 'empat', 'lima', 'enam', 'tujuh', 'delapan', 'sembilan', 'sepuluh', 'sebelas'];

function below1000(n) {
  if (n < 12) return ONES[n];
  if (n < 20) return `${ONES[n - 10]} belas`;
  if (n < 100) return `${ONES[Math.floor(n / 10)]} puluh ${ONES[n % 10]}`.trim();
  const h = Math.floor(n / 100);
  return `${h === 1 ? 'seratus' : `${ONES[h]} ratus`} ${below1000(n % 100)}`.trim();
}

// Indonesian amount in words, as written on a kwitansi ("terbilang").
export function terbilang(value) {
  let n = Math.floor(Math.abs(Number(value)));
  if (!Number.isFinite(n) || n === 0) return n === 0 ? 'nol' : '';
  if (n >= 1e15) return '';
  const scales = [[1e12, 'triliun'], [1e9, 'miliar'], [1e6, 'juta'], [1e3, 'ribu']];
  const parts = [];
  for (const [size, word] of scales) {
    const q = Math.floor(n / size);
    if (q) parts.push(size === 1e3 && q === 1 ? 'seribu' : `${below1000(q)} ${word}`);
    n %= size;
  }
  if (n) parts.push(below1000(n));
  return parts.join(' ');
}
