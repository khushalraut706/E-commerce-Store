document.addEventListener('DOMContentLoaded', () => {
  renderNavbar('login');

  // If already logged in, skip straight to the dashboard
  if (isLoggedIn() && (document.getElementById('loginForm') || document.getElementById('registerForm'))) {
    window.location.href = 'dashboard.html';
    return;
  }

  document.getElementById('loginForm')?.addEventListener('submit', handleLogin);
  document.getElementById('registerForm')?.addEventListener('submit', handleRegister);
});

function setFieldError(id, hasError) {
  const el = document.getElementById(id);
  if (!el) return;
  el.closest('.form-group').classList.toggle('invalid', hasError);
}

function showAlert(message) {
  const box = document.getElementById('alertBox');
  box.textContent = message;
  box.classList.add('show');
}

function hideAlert() {
  document.getElementById('alertBox').classList.remove('show');
}

async function handleLogin(e) {
  e.preventDefault();
  hideAlert();

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  const emailOk = /^\S+@\S+\.\S+$/.test(email);
  setFieldError('email', !emailOk);
  setFieldError('password', !password);

  if (!emailOk || !password) return;

  const btn = document.getElementById('loginBtn');
  btn.disabled = true;
  btn.textContent = 'Logging in...';

  try {
    const data = await api.post('/auth/login', { email, password }, { auth: false });
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify({ _id: data._id, name: data.name, email: data.email, role: data.role }));

    const params = new URLSearchParams(window.location.search);
    const redirect = params.get('redirect');
    window.location.href = redirect && !redirect.includes('login') ? redirect : 'dashboard.html';
  } catch (error) {
    showAlert(error.message);
    btn.disabled = false;
    btn.textContent = 'Log In';
  }
}

async function handleRegister(e) {
  e.preventDefault();
  hideAlert();

  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirmPassword').value;

  const emailOk = /^\S+@\S+\.\S+$/.test(email);
  const passwordOk = password.length >= 6;
  const matchOk = password === confirmPassword && confirmPassword.length > 0;

  setFieldError('name', !name);
  setFieldError('email', !emailOk);
  setFieldError('password', !passwordOk);
  setFieldError('confirmPassword', !matchOk);

  if (!name || !emailOk || !passwordOk || !matchOk) return;

  const btn = document.getElementById('registerBtn');
  btn.disabled = true;
  btn.textContent = 'Creating account...';

  try {
    const data = await api.post('/auth/register', { name, email, password, confirmPassword }, { auth: false });
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify({ _id: data._id, name: data.name, email: data.email, role: data.role }));
    window.location.href = 'dashboard.html';
  } catch (error) {
    showAlert(error.message);
    btn.disabled = false;
    btn.textContent = 'Create Account';
  }
}
