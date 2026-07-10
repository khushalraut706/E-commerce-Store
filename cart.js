document.addEventListener('DOMContentLoaded', async () => {
  renderNavbar();
  if (!requireAuth()) return;
  await loadCart();

  document.getElementById('clearCartBtn').addEventListener('click', async () => {
    if (!confirm('Remove all items from your cart?')) return;
    try {
      await api.delete('/cart');
      await loadCart();
      updateCartBadge();
      showToast('Cart emptied', 'success');
    } catch (error) {
      showToast(error.message, 'error');
    }
  });
});

async function loadCart() {
  const spinner = document.getElementById('loadingSpinner');
  const layout = document.getElementById('cartLayout');
  const emptyState = document.getElementById('emptyCart');

  spinner.classList.remove('hidden');
  layout.classList.add('hidden');
  emptyState.classList.add('hidden');

  try {
    const cart = await api.get('/cart');

    if (cart.items.length === 0) {
      emptyState.classList.remove('hidden');
      return;
    }

    renderCartItems(cart);
    layout.classList.remove('hidden');
  } catch (error) {
    showToast(error.message, 'error');
  } finally {
    spinner.classList.add('hidden');
  }
}

function renderCartItems(cart) {
  const list = document.getElementById('cartItemsList');
  list.innerHTML = '';

  cart.items.forEach((item) => {
    const row = document.createElement('div');
    row.className = 'cart-item';
    row.innerHTML = `
      <div class="cart-item-img"><img src="${item.image}" alt="${escapeHtml(item.name)}" /></div>
      <div>
        <div class="cart-item-name">${escapeHtml(item.name)}</div>
        <div class="cart-item-price">${formatCurrency(item.price)} each</div>
        <button class="cart-item-remove" data-remove="${item.product}">Remove</button>
      </div>
      <div class="cart-item-qty">
        <div class="qty-selector-sm">
          <button type="button" data-decrease="${item.product}">−</button>
          <span>${item.quantity}</span>
          <button type="button" data-increase="${item.product}" ${item.quantity >= item.stock ? 'disabled' : ''}>+</button>
        </div>
      </div>
      <div class="cart-item-total">${formatCurrency(item.totalPrice)}</div>
    `;
    list.appendChild(row);
  });

  document.getElementById('summaryItemCount').textContent = cart.itemCount;
  document.getElementById('summarySubtotal').textContent = formatCurrency(cart.subtotal);
  document.getElementById('summaryTotal').textContent = formatCurrency(cart.total);

  list.querySelectorAll('[data-increase]').forEach((btn) =>
    btn.addEventListener('click', () => changeQuantity(btn.dataset.increase, 1, cart))
  );
  list.querySelectorAll('[data-decrease]').forEach((btn) =>
    btn.addEventListener('click', () => changeQuantity(btn.dataset.decrease, -1, cart))
  );
  list.querySelectorAll('[data-remove]').forEach((btn) =>
    btn.addEventListener('click', () => removeItem(btn.dataset.remove))
  );
}

async function changeQuantity(productId, delta, cart) {
  const item = cart.items.find((i) => i.product === productId);
  if (!item) return;

  const newQty = item.quantity + delta;
  if (newQty < 1) {
    return removeItem(productId);
  }

  try {
    await api.put(`/cart/${productId}`, { quantity: newQty });
    await loadCart();
    updateCartBadge();
  } catch (error) {
    showToast(error.message, 'error');
  }
}

async function removeItem(productId) {
  try {
    await api.delete(`/cart/${productId}`);
    await loadCart();
    updateCartBadge();
    showToast('Item removed', 'success');
  } catch (error) {
    showToast(error.message, 'error');
  }
}
