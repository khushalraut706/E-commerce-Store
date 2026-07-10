// ---------- Toasts ----------
function ensureToastContainer() {
  let el = document.querySelector('.toast-container');
  if (!el) {
    el = document.createElement('div');
    el.className = 'toast-container';
    document.body.appendChild(el);
  }
  return el;
}

function showToast(message, type = 'default', duration = 3200) {
  const container = ensureToastContainer();
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), duration);
}

// ---------- Formatting ----------
function formatCurrency(value) {
  return `$${Number(value).toFixed(2)}`;
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

function escapeHtml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ---------- Auth state ----------
function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem('user'));
  } catch {
    return null;
  }
}

function isLoggedIn() {
  return !!localStorage.getItem('token');
}

function isAdmin() {
  const user = getCurrentUser();
  return !!user && user.role === 'admin';
}

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = 'index.html';
}

// Redirects to login if not authenticated. Call at the top of protected pages.
function requireAuth() {
  if (!isLoggedIn()) {
    window.location.href = `login.html?redirect=${encodeURIComponent(window.location.pathname.split('/').pop())}`;
    return false;
  }
  return true;
}

function requireAdmin() {
  if (!requireAuth()) return false;
  if (!isAdmin()) {
    window.location.href = 'index.html';
    return false;
  }
  return true;
}

// ---------- Stock helpers (drives the stock-meter signature element) ----------
function stockLevel(stock) {
  if (stock <= 0) return 'out';
  if (stock <= 10) return 'low';
  return 'high';
}

function stockMeterHtml(stock, maxRef = 50) {
  const level = stockLevel(stock);
  const pct = Math.max(Math.min((stock / maxRef) * 100, 100), stock > 0 ? 6 : 0);
  const label = level === 'out' ? 'Out of stock' : level === 'low' ? `Only ${stock} left` : `${stock} in stock`;
  return `
    <div class="stock-meter" title="${label}">
      <div class="stock-meter-track"><div class="stock-meter-fill ${level}" style="width:${pct}%"></div></div>
      <span class="stock-meter-label">${label}</span>
    </div>`;
}
