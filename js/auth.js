// ══════════════════════════════════════════════════════════════════════
// Auth Module — Marcador de Consumo Alimentar
// ══════════════════════════════════════════════════════════════════════

// ── Helpers ──────────────────────────────────────────────────────────

/**
 * Show a message (error or success) in the auth message area.
 * @param {string} text   - Message text.
 * @param {'error'|'success'} type - Message type.
 */
function showAuthMessage(text, type = 'error') {
  const el = document.getElementById('authMessage');
  if (!el) return;
  el.className = `auth-message ${type}`;
  const icon = type === 'error' ? 'ti-alert-circle' : 'ti-circle-check';
  el.innerHTML = `<i class="ti ${icon}"></i> ${text}`;
}

/** Hide the auth message area. */
function hideAuthMessage() {
  const el = document.getElementById('authMessage');
  if (!el) return;
  el.className = 'auth-message';
  el.innerHTML = '';
}

/**
 * Toggle loading state on an auth button.
 * @param {HTMLButtonElement} btn - The button element.
 * @param {boolean} loading       - Whether to show loading state.
 */
function setButtonLoading(btn, loading) {
  if (!btn) return;
  if (loading) {
    btn.classList.add('loading');
    btn.disabled = true;
  } else {
    btn.classList.remove('loading');
    btn.disabled = false;
  }
}

/**
 * Map common Supabase auth error messages to friendly pt-BR strings.
 * @param {string} message - Original error message from Supabase.
 * @returns {string} Translated message.
 */
function translateAuthError(message) {
  const map = {
    'Invalid login credentials':
      'E-mail ou senha incorretos.',
    'Email not confirmed':
      'Seu e-mail ainda não foi confirmado. Verifique sua caixa de entrada.',
    'User already registered':
      'Este e-mail já está cadastrado.',
    'Password should be at least 6 characters':
      'A senha deve ter no mínimo 6 caracteres.',
    'Unable to validate email address: invalid format':
      'Formato de e-mail inválido.',
    'Email rate limit exceeded':
      'Muitas tentativas. Aguarde alguns minutos e tente novamente.',
    'For security purposes, you can only request this after 60 seconds':
      'Por segurança, aguarde 60 segundos antes de tentar novamente.',
  };

  for (const [key, value] of Object.entries(map)) {
    if (message.includes(key)) return value;
  }
  return 'Ocorreu um erro. Tente novamente.';
}

// ── Core Auth Functions ──────────────────────────────────────────────

/**
 * Handle user login.
 * @param {string} email    - User e-mail.
 * @param {string} password - User password.
 */
async function handleLogin(email, password) {
  const btn = document.getElementById('loginBtn');
  hideAuthMessage();
  setButtonLoading(btn, true);

  try {
    const { data, error } = await db.auth.signInWithPassword({ email, password });

    if (error) {
      showAuthMessage(translateAuthError(error.message), 'error');
      return;
    }

    // Successful login → redirect
    window.location.href = 'app.html';
  } catch (err) {
    showAuthMessage('Erro de conexão. Verifique sua internet.', 'error');
  } finally {
    setButtonLoading(btn, false);
  }
}

/**
 * Handle user sign-up.
 * @param {string} name     - Full name.
 * @param {string} email    - User e-mail.
 * @param {string} password - User password.
 */
async function handleSignUp(name, email, password) {
  const btn = document.getElementById('registerBtn');
  hideAuthMessage();
  setButtonLoading(btn, true);

  try {
    const { data, error } = await db.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
      },
    });

    if (error) {
      showAuthMessage(translateAuthError(error.message), 'error');
      return;
    }

    // Supabase with email confirmation enabled returns a user but no session
    showAuthMessage(
      'Conta criada! Verifique seu e-mail para confirmar o cadastro.',
      'success'
    );

    // Clear the form
    document.getElementById('registerForm').reset();
  } catch (err) {
    showAuthMessage('Erro de conexão. Verifique sua internet.', 'error');
  } finally {
    setButtonLoading(btn, false);
  }
}

/**
 * Sign the current user out and redirect to the login page.
 */
async function handleLogout() {
  try {
    await db.auth.signOut();
  } catch (err) {
    // Ignore sign-out errors
  }
  window.location.href = 'index.html';
}

/**
 * Require an authenticated user. If not logged in, redirect to index.html.
 * @returns {Promise<object|null>} The user object, or null (after redirect).
 */
async function requireAuth() {
  try {
    const { data: { user } } = await db.auth.getUser();
    if (!user) {
      window.location.href = 'index.html';
      return null;
    }
    return user;
  } catch (err) {
    window.location.href = 'index.html';
    return null;
  }
}

/**
 * Get the currently authenticated user (no redirect).
 * @returns {Promise<object|null>} The user object or null.
 */
async function getCurrentUser() {
  try {
    const { data: { user } } = await db.auth.getUser();
    return user;
  } catch (err) {
    return null;
  }
}

// ── Page Initialization ──────────────────────────────────────────────

/**
 * Initialize the auth page (index.html).
 * Sets up tab switching, form handlers, and checks existing session.
 */
async function initAuthPage() {
  // ── If already logged in, go straight to the app ──
  const user = await getCurrentUser();
  if (user) {
    window.location.href = 'app.html';
    return;
  }

  // ── Tab Switching ──
  const tabs = document.querySelectorAll('.auth-tab');
  const forms = document.querySelectorAll('.auth-form');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.tab;

      // Update active tab
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      // Show corresponding form
      forms.forEach(f => f.classList.remove('active'));
      const formId = target === 'login' ? 'loginForm' : 'registerForm';
      document.getElementById(formId).classList.add('active');

      // Clear messages on tab switch
      hideAuthMessage();
    });
  });

  // ── Login Form ──
  const loginForm = document.getElementById('loginForm');
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;

    if (!email || !password) {
      showAuthMessage('Preencha todos os campos.', 'error');
      return;
    }

    await handleLogin(email, password);
  });

  // ── Register Form ──
  const registerForm = document.getElementById('registerForm');
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('registerName').value.trim();
    const email = document.getElementById('registerEmail').value.trim();
    const password = document.getElementById('registerPassword').value;

    if (!name || !email || !password) {
      showAuthMessage('Preencha todos os campos.', 'error');
      return;
    }

    if (password.length < 6) {
      showAuthMessage('A senha deve ter no mínimo 6 caracteres.', 'error');
      return;
    }

    await handleSignUp(name, email, password);
  });
}
