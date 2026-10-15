import { test, expect, vi, beforeEach } from 'vitest';
import { installAuthFetch, withToken } from './auth.js';

const store = new Map();
globalThis.localStorage = {
  getItem: (k) => store.get(k) ?? null,
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: (k) => store.delete(k),
};

const API = 'https://api.test';
const seen = [];
let status = 200;
let body = '{}';
globalThis.fetch = async (input, init) => {
  seen.push({ url: input, auth: new Headers(init?.headers).get('Authorization') });
  return new Response(body, { status });
};
const onUnauthorized = vi.fn();
installAuthFetch(API, onUnauthorized);

beforeEach(() => {
  seen.length = 0;
  status = 200;
  body = '{}';
  localStorage.setItem('expense_auth', JSON.stringify({ authenticated: true, token: 't0k' }));
});

test('API calls carry the bearer token', async () => {
  await fetch(`${API}/api/expenses`, { headers: { 'Content-Type': 'application/json' } });
  expect(seen[0].auth).toBe('Bearer t0k');
});

test('login and third-party calls are left alone', async () => {
  await fetch(`${API}/api/auth/verify-pin`, { method: 'POST' });
  await fetch('https://elsewhere.test/x');
  expect(seen.map((s) => s.auth)).toEqual([null, null]);
});

test('401 logs out', async () => {
  status = 401;
  await expect(fetch(`${API}/api/expenses`)).rejects.toMatchObject({ status: 401 });
  expect(localStorage.getItem('expense_auth')).toBeNull();
  expect(onUnauthorized).toHaveBeenCalled();
});

test('API errors reject instead of resolving with the error payload', async () => {
  status = 500;
  await expect(fetch(`${API}/api/expenses`)).rejects.toMatchObject({ status: 500, message: 'Request failed (500)' });
});

test('the server error message is kept', async () => {
  status = 400;
  body = JSON.stringify({ error: 'Category in use' });
  await expect(fetch(`${API}/api/categories/1`, { method: 'DELETE' })).rejects.toThrow('Category in use');
});

test('receipt image URLs get the token', () => {
  expect(withToken(`${API}/uploads/r.jpg`)).toBe(`${API}/uploads/r.jpg?token=t0k`);
});
