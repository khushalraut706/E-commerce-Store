/**
 * Thin wrapper around fetch() that:
 *  - prefixes API_BASE
 *  - attaches the JWT (if present) as a Bearer token
 *  - parses JSON and throws a normalized Error with the server's message
 */
async function apiRequest(path, { method = 'GET', body, auth = true } = {}) {
  const headers = { 'Content-Type': 'application/json' };

  if (auth) {
    const token = localStorage.getItem('token');
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  let response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (networkError) {
    throw new Error('Could not reach the server. Please check your connection and try again.');
  }

  let data = null;
  const text = await response.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = null;
    }
  }

  if (!response.ok) {
    // Auto-logout on an expired/invalid token so the UI doesn't get stuck
    if (response.status === 401 && auth) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    const message = (data && data.message) || `Request failed (${response.status})`;
    throw new Error(message);
  }

  return data;
}

const api = {
  get: (path, opts) => apiRequest(path, { ...opts, method: 'GET' }),
  post: (path, body, opts) => apiRequest(path, { ...opts, method: 'POST', body }),
  put: (path, body, opts) => apiRequest(path, { ...opts, method: 'PUT', body }),
  delete: (path, opts) => apiRequest(path, { ...opts, method: 'DELETE' }),
};
