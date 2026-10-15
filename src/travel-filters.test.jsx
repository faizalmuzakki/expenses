// @vitest-environment happy-dom
import { test, expect } from 'vitest';
import { render, click, setRoutes, calls } from './test-dom.js';
import TravelExpenses from './TravelExpenses.jsx';

const lastList = () => calls.filter((c) => c.method === 'GET' && /^\/api\/travel-expenses\?/.test(c.url)).at(-1);
const param = (c, k) => new URL(c.url, 'http://x').searchParams.get(k);

const setup = () => {
  setRoutes({
    'GET /api/travel-expenses/categories': [],
    'GET /api/travel-expenses/trips': [{ trip_name: 'Tokyo', currency: 'JPY', total_amount: 1000, expense_count: 1, start_date: '2026-10-01', end_date: '2026-10-02' }],
    'GET /api/travel-expenses': [],
  });
  return render(TravelExpenses, { formatCurrency: String });
};

test('"View expenses" fetches with the chosen trip', async () => {
  await setup();
  await click('Trips');
  await click('View expenses');
  expect(param(lastList(), 'tripName')).toBe('Tokyo');
});

test('"Clear" fetches without the old filters', async () => {
  await setup();
  await click('Trips');
  await click('View expenses');
  await click('Clear');
  expect(param(lastList(), 'tripName')).toBeNull();
});
