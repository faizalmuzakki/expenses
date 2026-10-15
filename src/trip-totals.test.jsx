// @vitest-environment happy-dom
import { test, expect } from 'vitest';
import { render, click, setRoutes } from './test-dom.js';
import TravelExpenses from './TravelExpenses.jsx';

const base = { expense_count: 2, start_date: '2026-10-01', end_date: '2026-10-03', total_converted: 765000, converted_currency: 'IDR' };

async function tripCard(trip) {
  setRoutes({
    'GET /api/travel-expenses/categories': [],
    'GET /api/travel-expenses/trips': [trip],
    'GET /api/travel-expenses': [],
  });
  await render(TravelExpenses, { formatCurrency: String });
  await click('Trips');
  return document.querySelector('.sheet.p-5').textContent.replace(/ /g, ' ');
}

test('current API (no breakdown) still shows the single total', async () => {
  const card = await tripCard({ ...base, trip_name: 'Bali', currency: 'USD', total_amount: 120 });
  expect(card).toContain('Total (USD)');
  expect(card).toContain('$120');
});

test('a mixed-currency trip shows one total per currency', async () => {
  const card = await tripCard({
    ...base, trip_name: 'Japan + Singapore', currency: null, total_amount: null,
    totals_by_currency: [{ currency: 'JPY', total_amount: 1000, expense_count: 1 }, { currency: 'SGD', total_amount: 55, expense_count: 1 }],
  });
  expect(card).toContain('¥1,000 + SGD 55');
  expect(card).not.toContain('null');
  expect(card).not.toContain('$0');
});

test('a single-currency trip on the new API reads as before', async () => {
  const card = await tripCard({ ...base, trip_name: 'Bali', currency: 'USD', total_amount: 120, totals_by_currency: [{ currency: 'USD', total_amount: 120, expense_count: 2 }] });
  expect(card).toContain('Total (USD)');
  expect(card).toContain('$120');
});
