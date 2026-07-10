document.addEventListener('DOMContentLoaded', async () => {
  renderNavbar('admin');
  if (!requireAdmin()) return;

  setupTabs();
  setupModal();

  await loadStats();
  await loadProducts();
  await loadOrders();
  await loadUsers();
});

// ---------- Tabs ----------
function setupTabs() {
  document.querySelectorAll('.admin-tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.admin-tab').forEach((t) => t.classList.remove('active'));
      document.querySelectorAll('.admin-panel').forEach((p) => p.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById(`panel-${tab.dataset.tab}`).classList.add('active');
    });
  });
}

// ---------- Stats ----------
async function loadStats() {
  try {
    const stats = await api.get('/admin/stats');
    document.getElementById('statsRow').innerHTML = `
      <div class="stat-card"><div class="value">${stats.userCount}</div><div class="label">Total Users</div></div>
      <div class="stat-card"><div class="value">${stats.productCount}</div><div class="label">Total Products</div></div>
      <div class="stat-card"><div class="value">${stats.orderCount}</div><div class="label">Total Orders</div></div>
      <div class="stat-card"><div class="value">${formatCurrency(stats.totalRevenue)}</div><div class="label">Total Revenue</div></div>
    `;
  } catch (error) {
    showToast(error.message, 'error');
  }
}

// ---------- Products ----------
let allProducts = [];

async function loadProducts() {
  try {
    const data = await api.get('/products?limit=200', { auth: false });
    allProducts = data.products;
    document.getElementById('productCount').textContent = `${data.total} product${data.total === 1 ? '' : 's'}`;

    document.getElementById('productsTableBody').innerHTML = allProducts
      .map(
        (p) => `
        <tr>
          <td><img class="table-img" src="${p.image}" alt="${escapeHtml(p.name)}" /></td>
          <td>${escapeHtml(p.name)}</td>
          <td>${escapeHtml(p.category)}</td>
          <td>${formatCurrency(p.price)}</td>
          <td>${p.stock}</td>
          <td class="table-actions">
            <button class="btn btn-outline btn-sm" data-edit="${p._id}">Edit</button>
            <button class="btn btn-danger btn-sm" data-delete="${p._id}">Delete</button>
          </td>
        </tr>`
      )
      .join('');

    document.querySelectorAll('[data-edit]').forEach((btn) =>
      btn.addEventListener('click', () => openProductModal(btn.dataset.edit))
    );
    document.querySelectorAll('[data-delete]').forEach((btn) =>
      btn.addEventListener('click', () => deleteProduct(btn.dataset.delete))
    );
  } catch (error) {
    showToast(error.message, 'error');
  }
}

async function deleteProduct(id) {
  if (!confirm('Delete this product? This cannot be undone.')) return;
  try {
    await api.delete(`/products/${id}`);
    showToast('Product deleted', 'success');
    await loadProducts();
    await loadStats();
  } catch (error) {
    showToast(error.message, 'error');
  }
}

// ---------- Product Modal ----------
function setupModal() {
  const overlay = document.getElementById('productModal');
  document.getElementById('addProductBtn').addEventListener('click', () => openProductModal());
  document.getElementById('modalClose').addEventListener('click', closeProductModal);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeProductModal();
  });
  document.getElementById('productForm').addEventListener('submit', saveProduct);
}

function openProductModal(productId = null) {
  const modalAlert = document.getElementById('modalAlert');
  modalAlert.classList.remove('show');
  document.getElementById('productForm').reset();
  document.getElementById('productId').value = '';

  if (productId) {
    const product = allProducts.find((p) => p._id === productId);
    if (!product) return;
    document.getElementById('modalTitle').textContent = 'Edit Product';
    document.getElementById('productId').value = product._id;
    document.getElementById('pName').value = product.name;
    document.getElementById('pDescription').value = product.description;
    document.getElementById('pPrice').value = product.price;
    document.getElementById('pStock').value = product.stock;
    document.getElementById('pCategory').value = product.category;
    document.getElementById('pImage').value = product.image;
  } else {
    document.getElementById('modalTitle').textContent = 'Add Product';
  }

  document.getElementById('productModal').classList.add('open');
}

function closeProductModal() {
  document.getElementById('productModal').classList.remove('open');
}

async function saveProduct(e) {
  e.preventDefault();
  const id = document.getElementById('productId').value;
  const payload = {
    name: document.getElementById('pName').value.trim(),
    description: document.getElementById('pDescription').value.trim(),
    price: parseFloat(document.getElementById('pPrice').value),
    stock: parseInt(document.getElementById('pStock').value, 10),
    category: document.getElementById('pCategory').value.trim(),
    image: document.getElementById('pImage').value.trim() || undefined,
  };

  const btn = document.getElementById('saveProductBtn');
  btn.disabled = true;
  btn.textContent = 'Saving...';

  try {
    if (id) {
      await api.put(`/products/${id}`, payload);
      showToast('Product updated', 'success');
    } else {
      await api.post('/products', payload);
      showToast('Product created', 'success');
    }
    closeProductModal();
    await loadProducts();
    await loadStats();
  } catch (error) {
    const modalAlert = document.getElementById('modalAlert');
    modalAlert.textContent = error.message;
    modalAlert.classList.add('show');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Save Product';
  }
}

// ---------- Orders ----------
const STATUS_OPTIONS = ['Pending', 'Processing', 'Shipped', 'Delivered'];

async function loadOrders() {
  try {
    const orders = await api.get('/admin/orders');
    document.getElementById('orderCount').textContent = `${orders.length} order${orders.length === 1 ? '' : 's'}`;

    document.getElementById('ordersTableBody').innerHTML = orders
      .map(
        (o) => `
        <tr>
          <td class="order-id">${o.orderId}</td>
          <td>${escapeHtml(o.user?.name || o.customerName)}<br/><span style="color:var(--color-text-muted); font-size:0.78rem;">${escapeHtml(o.email)}</span></td>
          <td>${formatDate(o.createdAt)}</td>
          <td>${o.items.reduce((sum, i) => sum + i.quantity, 0)} item(s)</td>
          <td>${formatCurrency(o.totalAmount)}</td>
          <td>
            <select class="status-select" data-order="${o._id}">
              ${STATUS_OPTIONS.map((s) => `<option value="${s}" ${s === o.status ? 'selected' : ''}>${s}</option>`).join('')}
            </select>
          </td>
        </tr>`
      )
      .join('');

    document.querySelectorAll('[data-order]').forEach((select) =>
      select.addEventListener('change', () => updateOrderStatus(select.dataset.order, select.value))
    );
  } catch (error) {
    showToast(error.message, 'error');
  }
}

async function updateOrderStatus(orderId, status) {
  try {
    await api.put(`/admin/orders/${orderId}/status`, { status });
    showToast('Order status updated', 'success');
  } catch (error) {
    showToast(error.message, 'error');
    await loadOrders();
  }
}

// ---------- Users ----------
async function loadUsers() {
  try {
    const users = await api.get('/admin/users');
    document.getElementById('userCount').textContent = `${users.length} user${users.length === 1 ? '' : 's'}`;

    document.getElementById('usersTableBody').innerHTML = users
      .map(
        (u) => `
        <tr>
          <td>${escapeHtml(u.name)}</td>
          <td>${escapeHtml(u.email)}</td>
          <td><span class="role-badge role-${u.role}">${u.role}</span></td>
          <td>${formatDate(u.createdAt)}</td>
        </tr>`
      )
      .join('');
  } catch (error) {
    showToast(error.message, 'error');
  }
}
