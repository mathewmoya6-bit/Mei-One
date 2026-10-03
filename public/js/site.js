/* ============================================================
   MEI SUPER APP
   GLOBAL SITE JAVASCRIPT
   ============================================================ */

(() => {
  "use strict";

  /* ------------------------------------------------------------
     GLOBAL CONFIG
     ------------------------------------------------------------ */

  window.MEISite = {
    name: "MEI Super App",
    version: "1.0.0"
  };


  /* ------------------------------------------------------------
     DOM READY
     ------------------------------------------------------------ */

  document.addEventListener("DOMContentLoaded", () => {
    initMobileMenu();
    initPasswordToggles();
    initModals();
    initGlobalButtons();
    setCurrentYear();
  });


  /* ------------------------------------------------------------
     MOBILE MENU
     ------------------------------------------------------------ */

  function initMobileMenu() {
    const menuButtons = document.querySelectorAll(
      "[data-menu-toggle], .menu-toggle, #menuToggle"
    );

    const nav = document.querySelector(
      "[data-mobile-menu], .mobile-menu, #mobileMenu"
    );

    if (!nav) return;

    menuButtons.forEach((button) => {
      button.addEventListener("click", () => {
        nav.classList.toggle("active");
        button.classList.toggle("active");

        const expanded = nav.classList.contains("active");
        button.setAttribute("aria-expanded", String(expanded));
      });
    });

    nav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        nav.classList.remove("active");

        menuButtons.forEach((button) => {
          button.classList.remove("active");
          button.setAttribute("aria-expanded", "false");
        });
      });
    });
  }


  /* ------------------------------------------------------------
     PASSWORD VISIBILITY
     ------------------------------------------------------------ */

  function initPasswordToggles() {
    const toggles = document.querySelectorAll(
      "[data-password-toggle], .password-toggle"
    );

    toggles.forEach((toggle) => {
      toggle.addEventListener("click", () => {
        const targetId = toggle.dataset.target;

        if (!targetId) return;

        const input = document.getElementById(targetId);

        if (!input) return;

        const isPassword = input.type === "password";

        input.type = isPassword ? "text" : "password";

        toggle.setAttribute(
          "aria-label",
          isPassword ? "Hide password" : "Show password"
        );

        toggle.classList.toggle("active", isPassword);
      });
    });
  }


  /* ------------------------------------------------------------
     MODALS
     ------------------------------------------------------------ */

  function initModals() {
    document.querySelectorAll("[data-modal-open]").forEach((button) => {
      button.addEventListener("click", () => {
        const modalId = button.dataset.modalOpen;
        const modal = document.getElementById(modalId);

        if (modal) {
          modal.classList.add("active");
          document.body.classList.add("modal-open");
        }
      });
    });

    document.querySelectorAll("[data-modal-close]").forEach((button) => {
      button.addEventListener("click", () => {
        closeModal(button.closest(".modal"));
      });
    });

    document.querySelectorAll(".modal").forEach((modal) => {
      modal.addEventListener("click", (event) => {
        if (event.target === modal) {
          closeModal(modal);
        }
      });
    });

    document.addEventListener("keydown", (event) => {
      if (event.key !== "Escape") return;

      const modal = document.querySelector(".modal.active");

      if (modal) {
        closeModal(modal);
      }
    });
  }

  function closeModal(modal) {
    if (!modal) return;

    modal.classList.remove("active");
    document.body.classList.remove("modal-open");
  }


  /* ------------------------------------------------------------
     GLOBAL BUTTON FEEDBACK
     ------------------------------------------------------------ */

  function initGlobalButtons() {
    document.querySelectorAll("[data-loading-button]").forEach((button) => {
      button.addEventListener("click", () => {
        setButtonLoading(button, true);
      });
    });
  }


  /* ------------------------------------------------------------
     BUTTON LOADING
     ------------------------------------------------------------ */

  function setButtonLoading(button, loading = true) {
    if (!button) return;

    if (loading) {
      if (!button.dataset.originalText) {
        button.dataset.originalText = button.innerHTML;
      }

      button.disabled = true;

      button.innerHTML = `
        <span class="button-spinner" aria-hidden="true"></span>
        <span>Processing...</span>
      `;
    } else {
      button.disabled = false;

      if (button.dataset.originalText) {
        button.innerHTML = button.dataset.originalText;
      }
    }
  }


  /* ------------------------------------------------------------
     TOAST NOTIFICATIONS
     ------------------------------------------------------------ */

  function showToast(message, type = "info", duration = 3500) {
    let container = document.getElementById("toastContainer");

    if (!container) {
      container = document.createElement("div");
      container.id = "toastContainer";
      container.className = "toast-container";

      document.body.appendChild(container);
    }

    const toast = document.createElement("div");

    toast.className = `toast toast-${type}`;

    toast.innerHTML = `
      <div class="toast-content">
        <span class="toast-message"></span>
      </div>
      <button
        type="button"
        class="toast-close"
        aria-label="Close notification"
      >
        &times;
      </button>
    `;

    toast.querySelector(".toast-message").textContent = message;

    toast
      .querySelector(".toast-close")
      .addEventListener("click", () => {
        removeToast(toast);
      });

    container.appendChild(toast);

    requestAnimationFrame(() => {
      toast.classList.add("show");
    });

    setTimeout(() => {
      removeToast(toast);
    }, duration);
  }

  function removeToast(toast) {
    if (!toast) return;

    toast.classList.remove("show");

    setTimeout(() => {
      toast.remove();
    }, 250);
  }


  /* ------------------------------------------------------------
     PAGE LOADING
     ------------------------------------------------------------ */

  function showPageLoader() {
    let loader = document.getElementById("pageLoader");

    if (loader) {
      loader.classList.add("active");
      return;
    }

    loader = document.createElement("div");

    loader.id = "pageLoader";
    loader.className = "page-loader";

    loader.innerHTML = `
      <div class="page-loader-spinner"></div>
      <div class="page-loader-text">Loading...</div>
    `;

    document.body.appendChild(loader);

    requestAnimationFrame(() => {
      loader.classList.add("active");
    });
  }

  function hidePageLoader() {
    const loader = document.getElementById("pageLoader");

    if (!loader) return;

    loader.classList.remove("active");

    setTimeout(() => {
      loader.remove();
    }, 250);
  }


  /* ------------------------------------------------------------
     CURRENT YEAR
     ------------------------------------------------------------ */

  function setCurrentYear() {
    const year = new Date().getFullYear();

    document.querySelectorAll("[data-current-year]").forEach((element) => {
      element.textContent = year;
    });
  }


  /* ------------------------------------------------------------
     FORM HELPERS
     ------------------------------------------------------------ */

  function getFormData(form) {
    if (!form) return {};

    const formData = new FormData(form);

    return Object.fromEntries(formData.entries());
  }


  function clearForm(form) {
    if (!form) return;

    form.reset();

    form.querySelectorAll(".error").forEach((element) => {
      element.classList.remove("error");
    });

    form.querySelectorAll(".field-error").forEach((element) => {
      element.remove();
    });
  }


  /* ------------------------------------------------------------
     SAFE REDIRECT
     ------------------------------------------------------------ */

  function goTo(url) {
    if (!url) return;

    window.location.href = url;
  }


  /* ------------------------------------------------------------
     LOCAL STORAGE HELPERS
     ------------------------------------------------------------ */

  function saveLocal(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error("Local storage save failed:", error);
      return false;
    }
  }


  function getLocal(key, fallback = null) {
    try {
      const value = localStorage.getItem(key);

      if (value === null) {
        return fallback;
      }

      return JSON.parse(value);
    } catch (error) {
      console.error("Local storage read failed:", error);
      return fallback;
    }
  }


  function removeLocal(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error("Local storage remove failed:", error);
      return false;
    }
  }


  /* ------------------------------------------------------------
     FORMAT CURRENCY
     ------------------------------------------------------------ */

  function formatKES(value) {
    const number = Number(value) || 0;

    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(number);
  }


  /* ------------------------------------------------------------
     FORMAT NUMBERS
     ------------------------------------------------------------ */

  function formatNumber(value) {
    const number = Number(value) || 0;

    return new Intl.NumberFormat("en-KE").format(number);
  }


  /* ------------------------------------------------------------
     DATE FORMAT
     ------------------------------------------------------------ */

  function formatDate(dateValue) {
    if (!dateValue) return "—";

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return "—";
    }

    return new Intl.DateTimeFormat("en-KE", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    }).format(date);
  }


  /* ------------------------------------------------------------
     EXPOSE GLOBAL HELPERS
     ------------------------------------------------------------ */

  window.MEISite.showToast = showToast;

  window.MEISite.showPageLoader = showPageLoader;

  window.MEISite.hidePageLoader = hidePageLoader;

  window.MEISite.setButtonLoading = setButtonLoading;

  window.MEISite.closeModal = closeModal;

  window.MEISite.getFormData = getFormData;

  window.MEISite.clearForm = clearForm;

  window.MEISite.goTo = goTo;

  window.MEISite.saveLocal = saveLocal;

  window.MEISite.getLocal = getLocal;

  window.MEISite.removeLocal = removeLocal;

  window.MEISite.formatKES = formatKES;

  window.MEISite.formatNumber = formatNumber;

  window.MEISite.formatDate = formatDate;

})();
