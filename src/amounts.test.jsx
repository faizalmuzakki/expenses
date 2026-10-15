// @vitest-environment happy-dom
import { test, expect } from 'vitest';
import { act } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { render, click, setRoutes } from './test-dom.js';
import { SignedAmount, AmountBox } from './ui.jsx';
import App from './App.jsx';

const rp = (n) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);
const text = (el) => renderToStaticMarkup(el).replace(/<[^>]+>/g, '').replace(/ /g, ' ');

test('a negative amount gets one minus sign, not two', () => {
  expect(text(<SignedAmount type="expense" amount={-5000} formatCurrency={rp} />)).toBe('−Rp 5.000');
  expect(text(<AmountBox value={-5000} sign="−" />)).toBe('Rp−5.000');
});

const keyBlocked = async (input, key) => {
  const ev = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true });
  await act(async () => input.dispatchEvent(ev));
  return ev.defaultPrevented;
};

test('the Rupiah amount input refuses minus, exponent and decimal keys', async () => {
  setRoutes({ 'GET /api/expenses': [], 'GET /api/categories': [], 'GET /api/stats/summary': { byCategory: [] } });
  await render(App);
  await click('Transactions');
  await click('Add expense');
  const amount = document.querySelector('#tx-form input[type=number]');
  for (const k of ['-', 'e', '.', ',']) expect(await keyBlocked(amount, k), k).toBe(true);
  expect(await keyBlocked(amount, '5')).toBe(false);
  expect(amount.getAttribute('min')).toBe('0');
});
