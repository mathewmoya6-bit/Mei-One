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

  function $(selector) {
    return document.querySelector(selector);
  }

  function $$(selector) {
    return Array.from(
      document.querySelectorAll(selector)
    );
  }

  function redirectToLogin() {
    window.location.replace(
      LOGIN_ROUTE
    );
  }

  function hideLoading() {
    const loading = $('#adminLoading');

    if (loading) {
      loading.classList.add('hidden');
    }
  }

  function showLoading() {
    const loading = $('#adminLoading');

    if (loading) {
      loading.classList.remove('hidden');
    }
  }

  function getDisplayName(user) {
    if (!user) {
      return 'Administrator';
    }

    const metadata =
      user.user_metadata || {};

    return (
      metadata.full_name ||
      metadata.name ||
      metadata.display_name ||
      user.email ||
      'Administrator'
    );
  }

  function getInitials(name) {
    if (!name) {
      return 'A';
    }

    const words =
      String(name)
        .trim()
        .split(/\s+/)
        .filter(Boolean);

    if (words.length === 1) {
      return words[0]
        .substring(0, 2)
        .toUpperCase();
    }

    return (
      words[0][0] +
      words[words.length - 1][0]
    ).toUpperCase();
  }

  function updateUserInterface(user) {
    const name =
      getDisplayName(user);

    const email =
      user && user.email
        ? user.email
        : '';

    const nameElement =
      $('#adminUserName');

    const emailElement =
      $('#adminUserEmail');

    const avatar =
      $('#adminAvatar');

    if (nameElement) {
      nameElement.textContent = name;
    }

    if (emailElement) {
      emailElement.textContent =
        email || 'Authenticated user';
    }

    if (avatar) {
      avatar.textContent =
        getInitials(name);
    }
  }

  function showSectionMessage(section) {
    const labels = {
      dashboard: 'Dashboard',
      users: 'Users',
      services: 'Services',
      payments: 'Payments',
      activity: 'Activity',
      settings: 'Settings'
    };

    const label =
      labels[section] || 'Section';

    if (window.MEI &&
        typeof window.MEI.showToast === 'function') {

      window.MEI.showToast(
        label +
        ' is ready for database integration.',
        'info'
      );
    } else {
      console.info(
        label +
        ' selected.'
      );
    }
  }

  function activateSection(section) {
    if (!section) {
      return;
    }

    $$('.admin-nav [data-admin-section]')
      .forEach(function (button) {

        const active =
          button.dataset.adminSection ===
          section;

        button.classList.toggle(
          'active',
          active
        );
      });

    showSectionMessage(section);

    closeMobileSidebar();
  }

  function setupNavigation() {
    $$('[data-admin-section]')
      .forEach(function (element) {

        element.addEventListener(
          'click',
          function () {

            const section =
              element.dataset.adminSection;

            activateSection(section);
          }
        );

      });
  }

  function setupMobileMenu() {
    const menu =
      $('#mobileMenu');

    const sidebar =
      $('#adminSidebar');

    const overlay =
      $('#adminOverlay');

    if (!menu || !sidebar) {
      return;
    }

    menu.addEventListener(
      'click',
      function () {

        sidebar.classList.toggle(
          'open'
        );

        if (overlay) {
          overlay.classList.toggle(
            'show'
          );
        }
      }
    );

    if (overlay) {
      overlay.addEventListener(
        'click',
        closeMobileSidebar
      );
    }
  }

  function closeMobileSidebar() {
    const sidebar =
      $('#adminSidebar');

    const overlay =
      $('#adminOverlay');

    if (sidebar) {
      sidebar.classList.remove(
        'open'
      );
    }

    if (overlay) {
      overlay.classList.remove(
        'show'
      );
    }
  }

  async function logout() {
    if (!SUPABASE) {
      redirectToLogin();
      return;
    }

    const button =
      $('#adminLogout');

    if (button) {
      button.disabled = true;
      button.textContent =
        'Signing out...';
    }

    try {
      const result =
        await SUPABASE.auth.signOut();

      if (result.error) {
        throw result.error;
      }

      redirectToLogin();

    } catch (error) {

      console.error(
        'Logout failed:',
        error
      );

      if (window.MEI &&
          typeof window.MEI.showToast === 'function') {

        window.MEI.showToast(
          'Unable to sign out. Please try again.',
          'error'
        );
      }

      if (button) {
        button.disabled = false;
        button.textContent =
          'Sign Out';
      }
    }
  }

  function setupLogout() {
    const button =
      $('#adminLogout');

    if (!button) {
      return;
    }

    button.addEventListener(
      'click',
      logout
    );
  }

  async function authenticateAdmin() {
    showLoading();

    if (!SUPABASE) {

      console.error(
        'Supabase client is unavailable.'
      );

      hideLoading();

      redirectToLogin();

      return;
    }

    try {

      const result =
        await SUPABASE.auth.getSession();

      if (result.error) {
        throw result.error;
      }

      const session =
        result.data
          ? result.data.session
          : null;

      if (!session || !session.user) {
        redirectToLogin();
        return;
      }

      updateUserInterface(
        session.user
      );

      /*
       * IMPORTANT:
       *
       * There is currently no public database
       * table containing MEI One admin/staff roles.
       *
       * Therefore this frontend only confirms
       * that the user is authenticated.
       *
       * Once the admin/staff table exists,
       * this is where role verification will be
       * added.
       */

      hideLoading();

    } catch (error) {

      console.error(
        'Admin authentication failed:',
        error
      );

      hideLoading();

      redirectToLogin();
    }
  }

  function setupAuthListener() {
    if (!SUPABASE) {
      return;
    }

    SUPABASE.auth.onAuthStateChange(
      function (event, session) {

        if (
          event === 'SIGNED_OUT' ||
          !session
        ) {
          redirectToLogin();
          return;
        }

        if (session.user) {
          updateUserInterface(
            session.user
          );
        }

      }
    );
  }

  function setup() {

    setupNavigation();

    setupMobileMenu();

    setupLogout();

    setupAuthListener();

    authenticateAdmin();

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
