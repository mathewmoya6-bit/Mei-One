(function () {
  'use strict';

  const SUPABASE =
    window.supabaseClient ||
    window.MEISupabase ||
    null;

  const CONFIG = window.MEI_CONFIG || {};

  const ROUTES = CONFIG.routes || {};

  const LOGIN_ROUTE =
    ROUTES.login || 'login.html';

  const DASHBOARD_ROUTE =
    ROUTES.dashboard || 'dashboard.html';

  function $(selector) {
    return document.querySelector(selector);
  }

  function showMessage(message, type) {
    const element = $('#loginMessage');

    if (!element) {
      return;
    }

    element.textContent = message;
    element.className = 'message show ' + (
      type === 'success'
        ? 'success'
        : 'error'
    );
  }

  function clearMessage() {
    const element = $('#loginMessage');

    if (!element) {
      return;
    }

    element.textContent = '';
    element.className = 'message';
  }

  function setLoading(isLoading) {
    const button = $('#loginButton');

    if (!button) {
      return;
    }

    button.disabled = isLoading;
    button.textContent = isLoading
      ? 'Signing in...'
      : 'Sign In';
  }

  function redirectToDashboard() {
    window.location.replace(DASHBOARD_ROUTE);
  }

  function getFriendlyError(error) {
    if (!error) {
      return 'Unable to sign in. Please try again.';
    }

    const message = String(
      error.message || ''
    ).toLowerCase();

    if (
      message.includes('invalid login credentials') ||
      message.includes('invalid credentials')
    ) {
      return 'Incorrect email or password.';
    }

    if (message.includes('email not confirmed')) {
      return 'Please confirm your email address before signing in.';
    }

    if (message.includes('too many requests')) {
      return 'Too many attempts. Please wait a moment and try again.';
    }

    return error.message ||
      'Unable to sign in. Please try again.';
  }

  async function checkExistingSession() {
    if (!SUPABASE) {
      showMessage(
        'Authentication is not configured. Check js/config.js and js/supabase.js.',
        'error'
      );
      return;
    }

    try {
      const result = await SUPABASE.auth.getSession();

      if (result.error) {
        console.error(
          'Session check failed:',
          result.error
        );
        return;
      }

      if (result.data && result.data.session) {
        redirectToDashboard();
      }
    } catch (error) {
      console.error(
        'Unexpected session error:',
        error
      );
    }
  }

  async function handleLogin(event) {
    event.preventDefault();

    clearMessage();

    if (!SUPABASE) {
      showMessage(
        'Authentication is not configured.',
        'error'
      );
      return;
    }

    const emailInput = $('#email');
    const passwordInput = $('#password');

    const email = emailInput
      ? emailInput.value.trim()
      : '';

    const password = passwordInput
      ? passwordInput.value
      : '';

    if (!email) {
      showMessage(
        'Please enter your email address.',
        'error'
      );

      if (emailInput) {
        emailInput.focus();
      }

      return;
    }

    if (!password) {
      showMessage(
        'Please enter your password.',
        'error'
      );

      if (passwordInput) {
        passwordInput.focus();
      }

      return;
    }

    setLoading(true);

    try {
      const result =
        await SUPABASE.auth.signInWithPassword({
          email: email,
          password: password
        });

      if (result.error) {
        throw result.error;
      }

      showMessage(
        'Login successful. Opening your dashboard...',
        'success'
      );

      window.setTimeout(
        redirectToDashboard,
        350
      );

    } catch (error) {
      console.error(
        'Login failed:',
        error
      );

      showMessage(
        getFriendlyError(error),
        'error'
      );

      setLoading(false);
    }
  }

  async function handlePasswordReset() {
    clearMessage();

    if (!SUPABASE) {
      showMessage(
        'Authentication is not configured.',
        'error'
      );
      return;
    }

    const emailInput = $('#email');

    const email = emailInput
      ? emailInput.value.trim()
      : '';

    if (!email) {
      showMessage(
        'Enter your email address first, then select Forgot password.',
        'error'
      );

      if (emailInput) {
        emailInput.focus();
      }

      return;
    }

    try {
      const redirectBase =
        window.location.origin +
        window.location.pathname
          .replace(/\/[^/]*$/, '/');

      const redirectUrl =
        redirectBase +
        'reset-password.html';

      const result =
        await SUPABASE.auth.resetPasswordForEmail(
          email,
          {
            redirectTo: redirectUrl
          }
        );

      if (result.error) {
        throw result.error;
      }

      showMessage(
        'Password reset instructions have been sent to your email.',
        'success'
      );

    } catch (error) {
      console.error(
        'Password reset failed:',
        error
      );

      showMessage(
        error.message ||
        'Unable to send password reset instructions.',
        'error'
      );
    }
  }

  function setupPasswordToggle() {
    const toggle = $('#togglePassword');
    const input = $('#password');

    if (!toggle || !input) {
      return;
    }

    toggle.addEventListener(
      'click',
      function () {
        const isPassword =
          input.type === 'password';

        input.type =
          isPassword
            ? 'text'
            : 'password';

        toggle.textContent =
          isPassword
            ? 'HIDE'
            : 'SHOW';
      }
    );
  }

  function setup() {
    const form = $('#loginForm');

    if (form) {
      form.addEventListener(
        'submit',
        handleLogin
      );
    }

    const forgotButton =
      $('#forgotPassword');

    if (forgotButton) {
      forgotButton.addEventListener(
        'click',
        handlePasswordReset
      );
    }

    setupPasswordToggle();

    checkExistingSession();
  }

  if (document.readyState === 'loading') {
    document.addEventListener(
      'DOMContentLoaded',
      setup
    );
  } else {
    setup();
  }

})();
