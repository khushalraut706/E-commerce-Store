let checkoutCart = null;

document.addEventListener('DOMContentLoaded', async () => {
  renderNavbar();
  if (!requireAuth()) return;

  // Pre-fill name/email from account profile
  try {
    const profile = await api.get('/auth/profile');
    document.getElementById('customerName').value = profile.name || '';
    document.getElementById('email').value = profile.email || '';
  } catch {
    /* non-fatal */
  }

  await loadCheckoutCart();

  document.getElementById('checkoutForm').addEventListener('submit', placeOrder);
});

async function loadCheckoutCart() {
  const spinner = document.getElementById('loadingSpinner');
  const layout = document.getElementById('checkoutLayout');
  const emptyNotice = document.getElementById('emptyCartNotice');

  spinner.classList.remove('hidden');

  try {
    checkoutCart = await api.get('/cart');

    if (checkoutCart.items.length === 0) {
      emptyNotice.classList.remove('hidden');
      return;
    }

    const linesContainer = document.getElementById('orderLines');
    linesContainer.innerHTML = checkoutCart.items
      .map(
        (item) => `
        <div class="order-line">
          <span>${escapeHtml(item.name)} <span class="qty">× ${item.quantity}</span></span>
          <span>${formatCurrency(item.totalPrice)}</span>
        </div>`
      )
      .join('');

    document.getElementById('checkoutTotal').textContent = formatCurrency(checkoutCart.total);
    layout.classList.remove('hidden');
  } catch (error) {
    showToast(error.message, 'error');
  } finally {
    spinner.classList.add('hidden');
  }
}

function setFieldError(id, hasError) {
  const group = document.getElementById(id).closest('.form-group');
  group.classList.toggle('invalid', hasError);
}

function validateForm() {
  const name = document.getElementById('customerName').value.trim();
  const email = document.getElementById('email').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const address = document.getElementById('address').value.trim();

  let valid = true;

  setFieldError('customerName', !name);
  if (!name) valid = false;

  const emailOk = /^\S+@\S+\.\S+$/.test(email);
  setFieldError('email', !emailOk);
  if (!emailOk) valid = false;

  const phoneOk = phone.replace(/\D/g, '').length >= 7;
  setFieldError('phone', !phoneOk);
  if (!phoneOk) valid = false;

  setFieldError('address', !address);
  if (!address) valid = false;

  return valid;
}

async function placeOrder(e) {
  e.preventDefault();
  const alertBox = document.getElementById('alertBox');
  alertBox.classList.remove('show');

  if (!validateForm()) {
    alertBox.textContent = 'Please fix the highlighted fields before continuing.';
    alertBox.classList.add('show');
    return;
  }

  const payload = {
    customerName: document.getElementById('customerName').value.trim(),
    email: document.getElementById('email').value.trim(),
    phone: document.getElementById('phone').value.trim(),
    address: document.getElementById('address').value.trim(),
  };

  const btn = document.getElementById('placeOrderBtn');
  btn.disabled = true;
  btn.textContent = 'Placing order...';

  try {
    const order = await api.post('/orders', payload);
    showToast(`Order ${order.orderId} placed successfully!`, 'success');
    updateCartBadge();
    setTimeout(() => {
      window.location.href = `dashboard.html?order=${order.orderId}`;
    }, 900);
  } catch (error) {
    alertBox.textContent = error.message;
    alertBox.classList.add('show');
    btn.disabled = false;
    btn.textContent = 'Place Order';
  }
}
