const KEY = 'expense_auth';

export function getToken() {
  try {
    return JSON.parse(localStorage.getItem(KEY))?.token || null;
  } catch {
    return null;
  }
}

// <img> can't send headers, so receipt URLs carry the token as a query param.
export const withToken = (url) => {
  const token = getToken();
  return token ? `${url}${url.includes('?') ? '&' : '?'}token=${encodeURIComponent(token)}` : url;
};

// Every API call goes through fetch, so add the token here once instead
// of at each call site. A 401 means the token is missing/expired: back to login.
export function installAuthFetch(apiUrl, onUnauthorized = () => location.reload()) {
  const original = globalThis.fetch.bind(globalThis);
  globalThis.fetch = async (input, init = {}) => {
    const url = typeof input === 'string' ? input : input.url;
    if (!url.startsWith(apiUrl) || url.startsWith(`${apiUrl}/api/auth/`)) return original(input, init);

    const headers = new Headers(init.headers);
    const token = getToken();
    if (token) headers.set('Authorization', `Bearer ${token}`);
    const res = await original(input, { ...init, headers });
    if (res.status === 401) {
      localStorage.removeItem(KEY);
      onUnauthorized();
    }
    return res;
  };
}
