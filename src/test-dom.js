// Tiny DOM test harness for vitest + happy-dom (files opt in with `// @vitest-environment happy-dom`).
// A fake API (routes keyed "METHOD /path"; value = JSON body, or a function returning
// a body or a Response) behind the real auth fetch wrapper; render/click/type helpers.
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { vi } from 'vitest';
import { installAuthFetch } from './auth.js';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;
localStorage.setItem('expense_auth', JSON.stringify({ authenticated: true, token: 't' }));

export const calls = [];
export let routes = {};
export const setRoutes = (r) => { routes = r; calls.length = 0; };

globalThis.fetch = async (url, init = {}) => {
  const method = init.method || 'GET';
  const path = String(url).split('?')[0];
  calls.push({ method, url: String(url), body: init.body });
  const h = routes[`${method} ${path}`] ?? routes[`${method} ${path.replace(/\/\d+$/, '/:id')}`];
  const r = typeof h === 'function' ? await h(String(url), init) : h;
  if (r === undefined) return new Response('{"error":"no route"}', { status: 404 });
  return r instanceof Response ? r : new Response(JSON.stringify(r));
};
installAuthFetch('', () => {});
export const fail = () => new Response(JSON.stringify({ error: 'Server said no' }), { status: 500 });

window.confirm = () => true;
export const alerts = vi.fn();
window.alert = alerts;

export const flush = () => act(() => new Promise((r) => setTimeout(r, 0)));

export async function render(Component, props = {}) {
  const el = document.createElement('div');
  document.body.replaceChildren(el);
  const root = createRoot(el);
  await act(async () => root.render(createElement(Component, props)));
  await flush();
  return el;
}

// Searches an open dialog first, so a dialog's "Save" wins over a same-named page button.
const byText = (sel, text) => {
  const scopes = [document.querySelector('[role=dialog]'), document].filter(Boolean);
  const hit = scopes.flatMap((s) => [...s.querySelectorAll(sel)]).find((e) =>
    e.getAttribute('aria-label') === text || e.textContent.trim() === text);
  if (!hit) throw new Error(`no ${sel} "${text}"`);
  return hit;
};
export const button = (text) => byText('button', text);

export async function click(target) {
  const el = typeof target === 'string' ? button(target) : target;
  await act(async () => el.click());
  await flush();
}

export async function type(input, value) {
  await act(async () => {
    Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set.call(input, value);
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });
}
