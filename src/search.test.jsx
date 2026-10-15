// @vitest-environment happy-dom
import { test, expect } from 'vitest';
import { act } from 'react';
import { render, click, type, setRoutes, calls } from './test-dom.js';
import App from './App.jsx';

const wait = (ms) => act(() => new Promise((r) => setTimeout(r, ms)));
const searchOf = (c) => new URL(c.url, 'http://x').searchParams.get('search');

function routes() {
  setRoutes({
    // "a" answers slowly, "ab" quickly: without stale-dropping, "a" lands last and wins.
    'GET /api/expenses': async (url) => {
      const q = new URL(url, 'http://x').searchParams.get('search');
      if (q === 'a') await new Promise((r) => setTimeout(r, 500));
      return q ? [{ id: q.length, amount: 1, description: `result for ${q}`, date: '2026-10-14', type: 'expense' }] : [];
    },
    'GET /api/categories': [],
    'GET /api/stats/summary': { byCategory: [] },
  });
}

test('typing a word fires one search, and no category reloads', async () => {
  routes();
  await render(App);
  await click('Transactions');
  const box = document.querySelector('input[type=search]');
  for (const v of ['l', 'lu', 'lun', 'lunc', 'lunch']) await type(box, v);
  await wait(400);
  const searched = calls.filter((c) => c.url.startsWith('/api/expenses') && searchOf(c));
  expect(searched.map(searchOf)).toEqual(['lunch']);
  expect(calls.filter((c) => c.url.startsWith('/api/categories'))).toHaveLength(1);
});

test('a slow stale search response does not overwrite a newer one', async () => {
  routes();
  await render(App);
  await click('Transactions');
  const box = document.querySelector('input[type=search]');
  await type(box, 'a');
  await wait(350); // "a" in flight (slow)
  await type(box, 'ab');
  await wait(900); // "ab" answers, then "a" would
  expect(document.body.textContent).toContain('result for ab');
  expect(document.body.textContent).not.toMatch(/result for a(?!b)/);
});
