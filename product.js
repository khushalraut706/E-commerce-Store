let currentProduct = null;
let selectedQty = 1;

document.addEventListener('DOMContentLoaded', async () => {
  renderNavbar();

  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');

  if (!id) {
    showNotFound();
    return;
  }

  try {
    currentProduct = await api.get(`/products/${id}`, { auth: false });
    renderProduct(currentProduct);
    loadRelated(currentProduct.category, currentProduct._id);
  } catch (error) {
    showNotFound();
  } finally {
    document.getElementById('loadingSpinner').classList.add('hidden');
  }
});

function showNotFound() {
  document.getElementById('loadingSpinner').classList.add('hidden');
  document.getElementById('notFound').classList.remove('hidden');
}

function renderProduct(p) {
  document.title = `${p.name} — Cartly`;
  const level = stockLevel(p.stock);
  const statusHtml =
    level === 'out' ? '<span class="stock-status out">● Out of stock</span>'
    : level === 'low' ? `<span class="stock-status low">● Only ${p.stock} left in stock</span>`
    : `<span class="stock-status in">● In stock (${p.stock} available)</span>`;

  const container = document.getElementById('productDetail');
  container.classList.remove('hidden');
  container.innerHTML = `
    <div class="product-detail-img">
      <img src="${p.image}" alt="${escapeHtml(p.name)}" />
    </div>
    <div class="product-detail-info">
      <span class="product-category">${escapeHtml(p.category)}</span>
      <h1>${escapeHtml(p.name)}</h1>
      <div class="product-detail-price">${formatCurrency(p.price)}</div>
      ${statusHtml}
      <p class="product-detail-desc">${escapeHtml(p.description)}</p>

      <div class="qty-selector" id="qtySelector">
        <button type="button" id="qtyMinus">−</button>
        <input type="number" id="qtyInput" value="1" min="1" max="${p.stock}" />
        <button type="button" id="qtyPlus">+</button>
      </div>

      <div class="detail-actions">
        <button class="btn btn-primary" id="addToCartBtn" ${p.stock <= 0 ? 'disabled' : ''}>Add to Cart</button>
        <a class="btn btn-outline" href="cart.html">View Cart</a>
      </div>
    </div>
  `;

  const qtyInput = document.getElementById('qtyInput');
  document.getElementById('qtyMinus').addEventListener('click', () => {
    selectedQty = Math.max(1, selectedQty - 1);
    qtyInput.value = selectedQty;
  });
  document.getElementById('qtyPlus').addEventListener('click', () => {
    selectedQty = Math.min(p.stock, selectedQty + 1);
    qtyInput.value = selectedQty;
  });
  qtyInput.addEventListener('change', () => {
    let v = parseInt(qtyInput.value, 10) || 1;
    v = Math.max(1, Math.min(p.stock, v));
    selectedQty = v;
    qtyInput.value = v;
  });

  document.getElementById('addToCartBtn')?.addEventListener('click', addCurrentToCart);
}

async function addCurrentToCart() {
  if (!isLoggedIn()) {
    showToast('Please log in to add items to your cart', 'error');
    setTimeout(() => (window.location.href = `login.html?redirect=product.html?id=${currentProduct._id}`), 900);
    return;
  }
  try {
    await api.post('/cart', { productId: currentProduct._id, quantity: selectedQty });
    showToast(`Added ${selectedQty} × ${currentProduct.name} to cart`, 'success');
    updateCartBadge();
  } catch (error) {
    showToast(error.message, 'error');
  }
}

async function loadRelated(category, excludeId) {
  try {
    const data = await api.get(`/products?category=${encodeURIComponent(category)}&limit=4`, { auth: false });
    const related = data.products.filter((p) => p._id !== excludeId).slice(0, 4);
    if (related.length === 0) return;

    const grid = document.getElementById('relatedGrid');
    related.forEach((p) => {
      const card = document.createElement('a');
      card.href = `product.html?id=${p._id}`;
      card.className = 'product-card';
      card.innerHTML = `
        <div class="product-card-img"><img src="${p.image}" alt="${escapeHtml(p.name)}" loading="lazy" /></div>
        <div class="product-card-body">
          <span class="product-category">${escapeHtml(p.category)}</span>
          <h3 class="product-name">${escapeHtml(p.name)}</h3>
          <div class="product-price">${formatCurrency(p.price)}</div>
        </div>
      `;
      grid.appendChild(card);
    });
    document.getElementById('relatedSection').classList.remove('hidden');
  } catch (error) {
    console.error(error);
  }
}
