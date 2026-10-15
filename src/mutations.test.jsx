// @vitest-environment happy-dom
import { test, expect, beforeEach } from 'vitest';
import { render, click, type, button, setRoutes, calls, alerts, fail } from './test-dom.js';
import App from './App.jsx';
import TravelExpenses from './TravelExpenses.jsx';
import InvestmentTracker from './InvestmentTracker.jsx';

const fmt = (n) => `Rp ${n}`;
beforeEach(() => alerts.mockClear());

test('a failed transaction delete alerts and keeps the row', async () => {
  setRoutes({
    'GET /api/expenses': [{ id: 7, amount: 5000, description: 'Lunch', date: '2026-10-14', type: 'expense' }],
    'GET /api/categories': [],
    'GET /api/stats/summary': { byCategory: [] },
    'DELETE /api/expenses/:id': fail,
  });
  await render(App);
  await click('Transactions');
  await click('Delete Lunch');
  expect(alerts).toHaveBeenCalledWith('Server said no');
  expect(calls.filter((c) => c.method === 'GET' && c.url.startsWith('/api/expenses'))).toHaveLength(1);
  expect(document.body.textContent).toContain('Lunch');
});

test('a failed travel delete alerts and keeps the row', async () => {
  setRoutes({
    'GET /api/travel-expenses/categories': [],
    'GET /api/travel-expenses/trips': [],
    'GET /api/travel-expenses': [{ id: 3, amount: 10, currency: 'USD', description: 'Taxi', date: '2026-10-14' }],
    'DELETE /api/travel-expenses/:id': fail,
  });
  await render(TravelExpenses, { formatCurrency: fmt });
  await click('Delete Taxi');
  expect(alerts).toHaveBeenCalledWith('Server said no');
  expect(document.body.textContent).toContain('Taxi');
});

const investRoutes = (extra) => ({
  'GET /api/investments/summary': { holdings: [{ type: 'gold', current_value: 1000, current_grams: 1 }], buckets: {}, portfolioBreakdown: [], activeAllocation: [] },
  'GET /api/investments/contribution-plan': { monthlyBudget: 5000000 },
  'GET /api/investments/contributions': [],
  'GET /api/investments/action-items': [],
  ...extra,
});

test('an empty budget is not sent', async () => {
  setRoutes(investRoutes({ 'PUT /api/investments/config': { ok: true } }));
  await render(InvestmentTracker, { formatCurrency: fmt });
  await click('Settings');
  await type(document.querySelector('[role=dialog] input, .scrim input'), '');
  await click(button('Save'));
  expect(calls.some((c) => c.method === 'PUT')).toBe(false);
  expect(alerts).toHaveBeenCalled();
});

test('a failed budget save alerts and keeps the dialog open', async () => {
  setRoutes(investRoutes({ 'PUT /api/investments/config': fail }));
  await render(InvestmentTracker, { formatCurrency: fmt });
  await click('Settings');
  await click(button('Save'));
  expect(alerts).toHaveBeenCalledWith('Server said no');
  expect(button('Save')).toBeTruthy();
});

test('a failed holdings save alerts and keeps the dialog open', async () => {
  setRoutes(investRoutes({ 'PUT /api/investments/holdings/gold': fail }));
  await render(InvestmentTracker, { formatCurrency: fmt });
  await click('Update values');
  await click(button('Update'));
  expect(alerts).toHaveBeenCalledWith('Server said no');
  expect(button('Update')).toBeTruthy();
});
