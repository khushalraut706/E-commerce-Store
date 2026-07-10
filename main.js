let state = {
  search: '',
  category: 'All',
  sort: '',
  page: 1,
  pages: 1,
};

document.addEventListener('DOMContentLoaded', async () => {
  renderNavbar('shop');

  const params = new URLSearchParams(window.location.search);
  if (params.get('search')) {
    state.search = params.get('search');
    document.getElementById('navSearchInput').value = state.search;
  }

  await loadCategories();
  await loadProducts();

  document.getElementById('sortSelect').addEventListener('change', (e) => {
    state.sort = e.target.value;
    state.page = 1;
    loadProducts();
  });

  document.getElementById('loadMoreBtn').addEventListener('click', () => {
    state.page += 1;
    loadProducts(true);
  });
});

async function loadCategories() {
  try {
    const categories = await api.get('/products/categories', { auth: false });
    const container = document.getElementById('categoryPills');
    categories.forEach((cat) => {
      const btn = document.createElement('button');
      btn.className = 'pill';
      btn.dataset.category = cat;
      btn.textContent = cat;
      container.appendChild(btn);
    });

    container.querySelectorAll('.pill').forEach((pill) => {
      pill.addEventListener('click', () => {
        container.querySelectorAll('.pill').forEach((p) => p.classList.remove('active'));
        pill.classList.add('active');
        state.category = pill.dataset.category;
        state.page = 1;
        loadProducts();
      });
    });
  } catch (error) {
    console.error('Failed to load categories', error);
  }
}

async function loadProducts(append = false) {
  const grid = document.getElementById('productGrid');
  const spinner = document.getElementById('loadingSpinner');
  const emptyState = document.getElementById('emptyState');
  const loadMoreBtn = document.getElementById('loadMoreBtn');

  if (!append) grid.innerHTML = '';
  spinner.classList.remove('hidden');
  emptyState.classList.add('hidden');

  try {
    const query = new URLSearchParams();
    if (state.search) query.set('search', state.search);
    if (state.category && state.category !== 'All') query.set('category', state.category);
    if (state.sort) query.set('sort', state.sort);
    query.set('page', state.page);
    query.set('limit', 12);

    const data = await api.get(`/products?${query.toString()}`, { auth: false });
    state.pages = data.pages;

    document.getElementById('resultCount').textContent = `${data.total} product${data.total === 1 ? '' : 's'}`;

    if (data.products.length === 0 && !append) {
      emptyState.classList.remove('hidden');
    } else {
      data.products.forEach((p) => grid.appendChild(buildProductCard(p)));
    }

    loadMoreBtn.classList.toggle('hidden', state.page >= state.pages);
  } catch (error) {
    showToast(error.message, 'error');
  } finally {
    spinner.classList.add('hidden');
  }
}

function buildProductCard(product) {
  const card = document.createElement('div');
  card.className = 'product-card';

  const level = stockLevel(product.stock);
  const badge =
    level === 'out' ? '<span class="product-badge badge-out">Out of stock</span>'
    : level === 'low' ? '<span class="product-badge badge-low">Low stock</span>'
    : '';

  card.innerHTML = `
    <a href="product.html?id=${product._id}" class="product-card-img">
      <img src="${product.image}" alt="${escapeHtml(product.name)}" loading="lazy" />
      ${badge}
    </a>
    <div class="product-card-body">
      <span class="product-category">${escapeHtml(product.category)}</span>
      <a href="product.html?id=${product._id}"><h3 class="product-name">${escapeHtml(product.name)}</h3></a>
      <div class="product-price">${formatCurrency(product.price)}</div>
      ${stockMeterHtml(product.stock)}
      <div class="product-card-actions">
        <button class="btn btn-primary" data-add-to-cart="${product._id}" ${product.stock <= 0 ? 'disabled' : ''}>
          Add to Cart
        </button>
        <a class="btn btn-outline" href="product.html?id=${product._id}">Details</a>
      </div>
    </div>
  `;

  card.querySelector('[data-add-to-cart]')?.addEventListener('click', () => addToCartQuick(product._id));
  return card;
}

async function addToCartQuick(productId) {
  if (!isLoggedIn()) {
    showToast('Please log in to add items to your cart', 'error');
    setTimeout(() => (window.location.href = 'login.html'), 900);
    return;
  }
  try {
    await api.post('/cart', { productId, quantity: 1 });
    showToast('Added to cart', 'success');
    updateCartBadge();
  } catch (error) {
    showToast(error.message, 'error');
  }
}
