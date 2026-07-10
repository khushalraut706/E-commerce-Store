function renderNavbar(activePage = '') {
  const mount = document.getElementById('navbar');
  if (!mount) return;

  const user = getCurrentUser();
  const loggedIn = isLoggedIn();
  const admin = isAdmin();

  const link = (href, label, key) =>
    `<a class="nav-link" href="${href}" ${activePage === key ? 'style="color:var(--color-primary);font-weight:700;"' : ''}>${label}</a>`;

  mount.innerHTML = `
    <nav class="navbar">
      <div class="container">
        <a href="index.html" class="brand">Cart<span class="brand-dot">ly</span></a>

        <form class="nav-search" id="navSearchForm">
          <input type="search" id="navSearchInput" placeholder="Search products..." autocomplete="off" />
          <button type="submit" aria-label="Search">🔍</button>
        </form>

        <button class="nav-toggle" id="navToggle" aria-label="Toggle menu">☰</button>

        <div class="nav-links" id="navLinks">
          ${link('index.html', 'Shop', 'shop')}
          <a class="nav-link nav-cart" href="cart.html">
            🛒 Cart
            <span class="cart-badge hidden" id="cartBadge">0</span>
          </a>
          ${loggedIn ? link('dashboard.html', 'Dashboard', 'dashboard') : ''}
          ${admin ? link('admin.html', 'Admin', 'admin') : ''}
          ${loggedIn
            ? `<a class="nav-link" href="#" id="logoutBtn">Logout (${escapeHtml(user?.name?.split(' ')[0] || 'Account')})</a>`
            : `${link('login.html', 'Login', 'login')} ${link('register.html', 'Sign Up', 'register')}`}
        </div>
      </div>
    </nav>
  `;

  document.getElementById('navToggle')?.addEventListener('click', () => {
    document.getElementById('navLinks').classList.toggle('open');
  });

  document.getElementById('logoutBtn')?.addEventListener('click', (e) => {
    e.preventDefault();
    logout();
  });

  const searchForm = document.getElementById('navSearchForm');
  searchForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const q = document.getElementById('navSearchInput').value.trim();
    window.location.href = `index.html${q ? `?search=${encodeURIComponent(q)}` : ''}`;
  });

  updateCartBadge();
}

async function updateCartBadge() {
  const badge = document.getElementById('cartBadge');
  if (!badge) return;

  if (!isLoggedIn()) {
    badge.classList.add('hidden');
    return;
  }

  try {
    const cart = await api.get('/cart');
    if (cart.itemCount > 0) {
      badge.textContent = cart.itemCount;
      badge.classList.remove('hidden');
    } else {
      badge.classList.add('hidden');
    }
  } catch {
    badge.classList.add('hidden');
  }
}
