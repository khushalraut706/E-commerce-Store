document.addEventListener('DOMContentLoaded', async () => {
  renderNavbar('dashboard');
  if (!requireAuth()) return;

  await loadProfile();
  await loadOrders();
});

async function loadProfile() {
  try {
    const profile = await api.get('/auth/profile');
    const initials = profile.name
      .split(' ')
      .map((p) => p[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();

    document.getElementById('profileCard').innerHTML = `
      <div class="avatar-circle">${initials}</div>
      <div>
        <h2 style="font-size:1.15rem;">${escapeHtml(profile.name)}</h2>
        <p style="color:var(--color-text-muted); font-size:0.9rem;">${escapeHtml(profile.email)}</p>
        <p style="color:var(--color-text-muted); font-size:0.8rem; margin-top:4px;">Member since ${formatDate(profile.createdAt)} ${profile.role === 'admin' ? '· <span class="role-badge role-admin">Admin</span>' : ''}</p>
      </div>
    `;
  } catch (error) {
    showToast(error.message, 'error');
  }
}

async function loadOrders() {
  const spinner = document.getElementById('loadingSpinner');
  const list = document.getElementById('ordersList');
  const emptyState = document.getElementById('emptyOrders');

  spinner.classList.remove('hidden');

  try {
    const orders = await api.get('/orders');

    const totalSpent = orders.reduce((sum, o) => sum + o.totalAmount, 0);
    const pending = orders.filter((o) => o.status === 'Pending' || o.status === 'Processing').length;

    document.getElementById('statTotalOrders').textContent = orders.length;
    document.getElementById('statTotalSpent').textContent = formatCurrency(totalSpent);
    document.getElementById('statPending').textContent = pending;

    if (orders.length === 0) {
      emptyState.classList.remove('hidden');
      return;
    }

    list.innerHTML = orders.map(renderOrderCard).join('');
  } catch (error) {
    showToast(error.message, 'error');
  } finally {
    spinner.classList.add('hidden');
  }
}

function renderOrderCard(order) {
  const itemsHtml = order.items
    .map(
      (item) => `
      <div class="order-item-mini">
        <span>${escapeHtml(item.name)} × ${item.quantity}</span>
        <span>${formatCurrency(item.price * item.quantity)}</span>
      </div>`
    )
    .join('');

  return `
    <div class="order-card">
      <div class="order-card-head">
        <div>
          <div class="order-id">${order.orderId}</div>
          <div class="order-date">Placed on ${formatDate(order.createdAt)}</div>
        </div>
        <span class="status-badge status-${order.status}">${order.status}</span>
      </div>
      <div class="order-items-mini">${itemsHtml}</div>
      <div class="order-total-line">
        <span>Total</span>
        <span>${formatCurrency(order.totalAmount)}</span>
      </div>
    </div>
  `;
}
