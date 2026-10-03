/* ============================================================
   MEI ONE — GLOBAL SITE JAVASCRIPT
   File: public/js/site.js
   ============================================================ */

(function (window, document) {
  "use strict";

  /* ==========================================================
     MEI NAMESPACE
     ========================================================== */

  const MEI = window.MEI || {};

  window.MEI = MEI;

  /* ==========================================================
     CONFIGURATION
     ========================================================== */

  const CONFIG =
    window.MEI_CONFIG ||
    window.MEIConfig ||
    window.CONFIG ||
    {};

  const SUPABASE =
    window.supabaseClient ||
    window.MEISupabase ||
    null;

  /* ==========================================================
     DOM HELPERS
     ========================================================== */

  const $ = (selector, parent = document) =>
    parent.querySelector(selector);

  const $$ = (selector, parent = document) =>
    Array.from(parent.querySelectorAll(selector));

  /* ==========================================================
     INITIALIZATION
     ========================================================== */

  document.addEventListener("DOMContentLoaded", () => {
    initMobileNavigation();
    initModalSystem();
    initServiceButtons();
    initSmoothScrolling();
    initCurrentYear();
    initAuthState();
    initEscapeKey();
    initGlobalLinks();

    console.log(
      `${CONFIG.appName || "MEI One"} initialized successfully.`
    );
  });

  /* ==========================================================
     MOBILE NAVIGATION
     ========================================================== */

  function initMobileNavigation() {
    const menuButton = $("#mobileMenuButton");
    const navigation = $("#mainNavigation");

    if (!menuButton || !navigation) {
      return;
    }

    menuButton.addEventListener("click", () => {
      const isOpen = navigation.classList.toggle("open");

      menuButton.setAttribute(
        "aria-expanded",
        String(isOpen)
      );

      menuButton.setAttribute(
        "aria-label",
        isOpen
          ? "Close navigation menu"
          : "Open navigation menu"
      );
    });

    /* Close menu after clicking navigation link */

    $$("#mainNavigation a").forEach((link) => {
      link.addEventListener("click", () => {
        navigation.classList.remove("open");

        menuButton.setAttribute(
          "aria-expanded",
          "false"
        );

        menuButton.setAttribute(
          "aria-label",
          "Open navigation menu"
        );
      });
    });

    /* Close menu when clicking outside */

    document.addEventListener("click", (event) => {
      if (
        navigation.classList.contains("open") &&
        !navigation.contains(event.target) &&
        !menuButton.contains(event.target)
      ) {
        navigation.classList.remove("open");

        menuButton.setAttribute(
          "aria-expanded",
          "false"
        );
      }
    });
  }

  /* ==========================================================
     MODAL SYSTEM
     ========================================================== */

  function initModalSystem() {
    $$("[data-modal]").forEach((trigger) => {
      trigger.addEventListener("click", (event) => {
        event.preventDefault();

        const modalName =
          trigger.getAttribute("data-modal");

        if (modalName) {
          openModal(modalName);
        }
      });
    });

    $$("[data-modal-close]").forEach((button) => {
      button.addEventListener("click", () => {
        closeModal();
      });
    });

    const modal = $("#globalModal");

    if (modal) {
      modal.addEventListener("click", (event) => {
        if (
          event.target.classList.contains(
            "modal-backdrop"
          )
        ) {
          closeModal();
        }
      });
    }
  }

  function openModal(name) {
    const modal = $("#globalModal");
    const content = $("#modalContent");

    if (!modal || !content) {
      return;
    }

    content.innerHTML = getModalContent(name);

    modal.classList.add("open");

    modal.setAttribute("aria-hidden", "false");

    document.body.classList.add("modal-open");

    bindModalActions(name);

    const firstInput =
      content.querySelector(
        "input, textarea, select, button"
      );

    if (firstInput) {
      setTimeout(() => {
        firstInput.focus();
      }, 100);
    }
  }

  function closeModal() {
    const modal = $("#globalModal");

    if (!modal) {
      return;
    }

    modal.classList.remove("open");

    modal.setAttribute("aria-hidden", "true");

    document.body.classList.remove("modal-open");
  }

  /* ==========================================================
     MODAL CONTENT
     ========================================================== */

  function getModalContent(name) {
    switch (name) {
      case "login":
        return `
          <h2>Welcome Back</h2>

          <p class="modal-description">
            Sign in to your MEI One account.
          </p>

          <form id="modalLoginForm">

            <div class="form-group">
              <label for="loginEmail">
                Email
              </label>

              <input
                id="loginEmail"
                name="email"
                type="email"
                placeholder="you@example.com"
                autocomplete="email"
                required
              >
            </div>

            <div class="form-group">
              <label for="loginPassword">
                Password
              </label>

              <input
                id="loginPassword"
                name="password"
                type="password"
                placeholder="Enter your password"
                autocomplete="current-password"
                required
              >
            </div>

            <div
              id="loginMessage"
              class="form-message"
              aria-live="polite"
            ></div>

            <button
              type="submit"
              class="btn btn-primary"
              style="width:100%;"
            >
              Sign In
            </button>

          </form>

          <p style="margin-top:18px;text-align:center;">
            Don't have an account?
            <button
              type="button"
              class="service-link"
              data-switch-modal="signup"
            >
              Create one
            </button>
          </p>
        `;

      case "signup":
        return `
          <h2>Create Your MEI Account</h2>

          <p class="modal-description">
            Join MEI One and access our growing range
            of services.
          </p>

          <form id="modalSignupForm">

            <div class="form-group">
              <label for="signupName">
                Full Name
              </label>

              <input
                id="signupName"
                name="full_name"
                type="text"
                placeholder="Your full name"
                autocomplete="name"
                required
              >
            </div>

            <div class="form-group">
              <label for="signupPhone">
                Phone Number
              </label>

              <input
                id="signupPhone"
                name="phone"
                type="tel"
                placeholder="07XXXXXXXX"
                autocomplete="tel"
                required
              >
            </div>

            <div class="form-group">
              <label for="signupEmail">
                Email
              </label>

              <input
                id="signupEmail"
                name="email"
                type="email"
                placeholder="you@example.com"
                autocomplete="email"
                required
              >
            </div>

            <div class="form-group">
              <label for="signupPassword">
                Password
              </label>

              <input
                id="signupPassword"
                name="password"
                type="password"
                placeholder="Minimum 6 characters"
                autocomplete="new-password"
                minlength="6"
                required
              >
            </div>

            <div
              id="signupMessage"
              class="form-message"
              aria-live="polite"
            ></div>

            <button
              type="submit"
              class="btn btn-primary"
              style="width:100%;"
            >
              Create Account
            </button>

          </form>

          <p style="margin-top:18px;text-align:center;">
            Already have an account?
            <button
              type="button"
              class="service-link"
              data-switch-modal="login"
            >
              Sign in
            </button>
          </p>
        `;

      case "emergency":
        return `
          <h2>Emergency Assistance</h2>

          <p class="modal-description">
            Tell us what assistance you need.
            If you are in immediate danger, contact
            the appropriate emergency services first.
          </p>

          <form id="emergencyForm">

            <div class="form-group">
              <label for="emergencyName">
                Name
              </label>

              <input
                id="emergencyName"
                name="name"
                type="text"
                placeholder="Your name"
                required
              >
            </div>

            <div class="form-group">
              <label for="emergencyPhone">
                Phone
              </label>

              <input
                id="emergencyPhone"
                name="phone"
                type="tel"
                placeholder="07XXXXXXXX"
                required
              >
            </div>

            <div class="form-group">
              <label for="emergencyType">
                Assistance Required
              </label>

              <select
                id="emergencyType"
                name="type"
                required
              >
                <option value="">
                  Select assistance
                </option>

                <option value="accident">
                  Accident
                </option>

                <option value="medical">
                  Medical Emergency
                </option>

                <option value="roadside">
                  Roadside Assistance
                </option>

                <option value="towing">
                  Emergency Towing
                </option>

                <option value="other">
                  Other
                </option>
              </select>
            </div>

            <div class="form-group">
              <label for="emergencyLocation">
                Location
              </label>

              <input
                id="emergencyLocation"
                name="location"
                type="text"
                placeholder="Current location"
                required
              >
            </div>

            <div class="form-group">
              <label for="emergencyMessage">
                Details
              </label>

              <textarea
                id="emergencyMessage"
                name="message"
                placeholder="Briefly describe the situation"
              ></textarea>
            </div>

            <div
              id="emergencyMessageBox"
              class="form-message"
              aria-live="polite"
            ></div>

            <button
              type="submit"
              class="btn"
              style="
                width:100%;
                background:#e53935;
                color:#fff;
              "
            >
              Request Assistance
            </button>

          </form>
        `;

      case "partner":
        return `
          <h2>Become a MEI Partner</h2>

          <p class="modal-description">
            Tell us about your business and the services
            you would like to provide through MEI One.
          </p>

          <form id="partnerForm">

            <div class="form-group">
              <label for="partnerName">
                Full Name
              </label>

              <input
                id="partnerName"
                name="name"
                type="text"
                placeholder="Your full name"
                required
              >
            </div>

            <div class="form-group">
              <label for="partnerBusiness">
                Business Name
              </label>

              <input
                id="partnerBusiness"
                name="business"
                type="text"
                placeholder="Business name"
                required
              >
            </div>

            <div class="form-group">
              <label for="partnerPhone">
                Phone
              </label>

              <input
                id="partnerPhone"
                name="phone"
                type="tel"
                placeholder="07XXXXXXXX"
                required
              >
            </div>

            <div class="form-group">
              <label for="partnerEmail">
                Email
              </label>

              <input
                id="partnerEmail"
                name="email"
                type="email"
                placeholder="business@example.com"
              >
            </div>

            <div class="form-group">
              <label for="partnerService">
                Service Category
              </label>

              <select
                id="partnerService"
                name="service"
                required
              >
                <option value="">
                  Select category
                </option>

                <option value="rides">
                  Rides / Transport
                </option>

                <option value="delivery">
                  Delivery
                </option>

                <option value="towing">
                  Towing
                </option>

                <option value="roadside">
                  Roadside Assistance
                </option>

                <option value="auto">
                  Automotive
                </option>

                <option value="marketplace">
                  Marketplace
                </option>

                <option value="home-services">
                  Home Services
                </option>

                <option value="learn">
                  Learning
                </option>
              </select>
            </div>

            <div class="form-group">
              <label for="partnerMessage">
                Message
              </label>

              <textarea
                id="partnerMessage"
                name="message"
                placeholder="Tell us about your business..."
              ></textarea>
            </div>

            <div
              id="partnerMessageBox"
              class="form-message"
              aria-live="polite"
            ></div>

            <button
              type="submit"
              class="btn btn-primary"
              style="width:100%;"
            >
              Submit Partnership Request
            </button>

          </form>
        `;

      default:
        return `
          <h2>MEI One</h2>
          <p>
            Please select an available MEI One option.
          </p>
        `;
    }
  }

  /* ==========================================================
     MODAL ACTIONS
     ========================================================== */

  function bindModalActions(name) {

    /* Switch between login/signup */

    $$("[data-switch-modal]").forEach((button) => {
      button.addEventListener("click", () => {
        const target =
          button.getAttribute("data-switch-modal");

        openModal(target);
      });
    });

    /* Login */

    const loginForm = $("#modalLoginForm");

    if (loginForm) {
      loginForm.addEventListener(
        "submit",
        handleLogin
      );
    }

    /* Signup */

    const signupForm = $("#modalSignupForm");

    if (signupForm) {
      signupForm.addEventListener(
        "submit",
        handleSignup
      );
    }

    /* Emergency */

    const emergencyForm = $("#emergencyForm");

    if (emergencyForm) {
      emergencyForm.addEventListener(
        "submit",
        handleEmergency
      );
    }

    /* Partner */

    const partnerForm = $("#partnerForm");

    if (partnerForm) {
      partnerForm.addEventListener(
        "submit",
        handlePartner
      );
    }
  }

  /* ==========================================================
     LOGIN
     ========================================================== */

  async function handleLogin(event) {
    event.preventDefault();

    const form = event.currentTarget;

    const email =
      form.email.value.trim();

    const password =
      form.password.value;

    const message =
      $("#loginMessage");

    const button =
      form.querySelector(
        'button[type="submit"]'
      );

    if (!SUPABASE) {
      showFormMessage(
        message,
        "Authentication is not available. Check Supabase configuration.",
        "error"
      );

      return;
    }

    setButtonLoading(
      button,
      true,
      "Signing In..."
    );

    try {
      const {
        data,
        error
      } =
        await SUPABASE.auth.signInWithPassword({
          email,
          password
        });

      if (error) {
        throw error;
      }

      if (!data || !data.session) {
        throw new Error(
          "Login completed but no session was created."
        );
      }

      showFormMessage(
        message,
        "Login successful. Redirecting...",
        "success"
      );

      setTimeout(() => {
        window.location.href =
          CONFIG.routes?.dashboard ||
          "dashboard.html";
      }, 500);

    } catch (error) {

      console.error(
        "MEI One login error:",
        error
      );

      showFormMessage(
        message,
        getFriendlyAuthError(error),
        "error"
      );

      setButtonLoading(
        button,
        false,
        "Sign In"
      );
    }
  }

  /* ==========================================================
     SIGNUP
     ========================================================== */

  async function handleSignup(event) {
    event.preventDefault();

    const form = event.currentTarget;

    const fullName =
      form.full_name.value.trim();

    const phone =
      form.phone.value.trim();

    const email =
      form.email.value.trim();

    const password =
      form.password.value;

    const message =
      $("#signupMessage");

    const button =
      form.querySelector(
        'button[type="submit"]'
      );

    if (!SUPABASE) {
      showFormMessage(
        message,
        "Authentication is not available. Check Supabase configuration.",
        "error"
      );

      return;
    }

    if (password.length < 6) {
      showFormMessage(
        message,
        "Password must contain at least 6 characters.",
        "error"
      );

      return;
    }

    setButtonLoading(
      button,
      true,
      "Creating Account..."
    );

    try {
      const {
        data,
        error
      } =
        await SUPABASE.auth.signUp({
          email,
          password,

          options: {
            data: {
              full_name: fullName,
              phone: phone
            }
          }
        });

      if (error) {
        throw error;
      }

      if (data?.session) {
        showFormMessage(
          message,
          "Account created successfully. Redirecting...",
          "success"
        );

        setTimeout(() => {
          window.location.href =
            CONFIG.routes?.dashboard ||
            "dashboard.html";
        }, 700);

      } else {
        showFormMessage(
          message,
          "Account created. Check your email to confirm your account before signing in.",
          "success"
        );

        setButtonLoading(
          button,
          false,
          "Create Account"
        );
      }

    } catch (error) {

      console.error(
        "MEI One signup error:",
        error
      );

      showFormMessage(
        message,
        getFriendlyAuthError(error),
        "error"
      );

      setButtonLoading(
        button,
        false,
        "Create Account"
      );
    }
  }

  /* ==========================================================
     SERVICE BUTTONS
     ========================================================== */

  function initServiceButtons() {
    $$("[data-service]").forEach((button) => {
      button.addEventListener("click", () => {

        const service =
          button.getAttribute("data-service");

        if (!service) {
          return;
        }

        handleService(service);
      });
    });
  }

  function handleService(service) {
    const serviceConfig =
      CONFIG.services?.[service];

    const route =
      serviceConfig?.route ||
      `dashboard.html?service=${encodeURIComponent(
        service
      )}`;

    window.location.href = route;
  }

  MEI.handleService = handleService;

  /* ==========================================================
     EMERGENCY REQUEST
     ========================================================== */

  function handleEmergency(event) {
    event.preventDefault();

    const form = event.currentTarget;

    const request = {
      id: generateId(),

      name: form.name.value.trim(),

      phone: form.phone.value.trim(),

      type: form.type.value,

      location:
        form.location.value.trim(),

      message:
        form.message.value.trim(),

      created_at:
        new Date().toISOString(),

      status: "pending"
    };

    try {
      const existing =
        JSON.parse(
          localStorage.getItem(
            "mei_emergency_requests"
          ) || "[]"
        );

      existing.push(request);

      localStorage.setItem(
        "mei_emergency_requests",
        JSON.stringify(existing)
      );

      showFormMessage(
        $("#emergencyMessageBox"),
        "Your request has been recorded. MEI assistance workflow will be connected to the backend next.",
        "success"
      );

      form.reset();

    } catch (error) {

      console.error(error);

      showFormMessage(
        $("#emergencyMessageBox"),
        "Unable to record the request on this device.",
        "error"
      );
    }
  }

  /* ==========================================================
     PARTNER REQUEST
     ========================================================== */

  function handlePartner(event) {
    event.preventDefault();

    const form = event.currentTarget;

    const request = {
      id: generateId(),

      name: form.name.value.trim(),

      business:
        form.business.value.trim(),

      phone:
        form.phone.value.trim(),

      email:
        form.email.value.trim(),

      service:
        form.service.value,

      message:
        form.message.value.trim(),

      created_at:
        new Date().toISOString(),

      status: "pending"
    };

    try {

      const existing =
        JSON.parse(
          localStorage.getItem(
            "mei_partner_requests"
          ) || "[]"
        );

      existing.push(request);

      localStorage.setItem(
        "mei_partner_requests",
        JSON.stringify(existing)
      );

      showFormMessage(
        $("#partnerMessageBox"),
        "Thank you. Your partnership request has been recorded.",
        "success"
      );

      form.reset();

    } catch (error) {

      console.error(error);

      showFormMessage(
        $("#partnerMessageBox"),
        "Unable to submit the request on this device.",
        "error"
      );
    }
  }

  /* ==========================================================
     AUTH STATE
     ========================================================== */

  async function initAuthState() {
    if (!SUPABASE) {
      return;
    }

    try {

      const {
        data: {
          session
        }
      } =
        await SUPABASE.auth.getSession();

      updateAuthUI(session);

      SUPABASE.auth.onAuthStateChange(
        (_event, newSession) => {
          updateAuthUI(newSession);
        }
      );

    } catch (error) {

      console.error(
        "MEI One auth state error:",
        error
      );
    }
  }

  function updateAuthUI(session) {

    $$("[data-auth='login']").forEach(
      (element) => {
        element.hidden = Boolean(session);
      }
    );

    $$("[data-auth='logout']").forEach(
      (element) => {
        element.hidden = !session;
      }
    );

    $$("[data-auth='dashboard']").forEach(
      (element) => {
        element.hidden = !session;
      }
    );
  }

  /* ==========================================================
     SMOOTH SCROLLING
     ========================================================== */

  function initSmoothScrolling() {
    $$('a[href^="#"]').forEach((link) => {

      link.addEventListener("click", (event) => {

        const targetId =
          link.getAttribute("href");

        if (
          !targetId ||
          targetId === "#"
        ) {
          return;
        }

        const target =
          $(targetId);

        if (!target) {
          return;
        }

        event.preventDefault();

        target.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });
      });
    });
  }

  /* ==========================================================
     CURRENT YEAR
     ========================================================== */

  function initCurrentYear() {
    const year =
      new Date().getFullYear();

    $$("[data-current-year]").forEach(
      (element) => {
        element.textContent = year;
      }
    );

    const footerYear =
      $("#currentYear");

    if (footerYear) {
      footerYear.textContent = year;
    }
  }

  /* ==========================================================
     GLOBAL LINKS
     ========================================================== */

  function initGlobalLinks() {

    $$("[data-dashboard]").forEach(
      (element) => {

        element.addEventListener(
          "click",
          (event) => {

            event.preventDefault();

            window.location.href =
              CONFIG.routes?.dashboard ||
              "dashboard.html";
          }
        );
      }
    );
  }

  /* ==========================================================
     ESCAPE KEY
     ========================================================== */

  function initEscapeKey() {

    document.addEventListener(
      "keydown",
      (event) => {

        if (event.key === "Escape") {

          const modal =
            $("#globalModal");

          if (
            modal &&
            modal.classList.contains("open")
          ) {
            closeModal();
          }

          const navigation =
            $("#mainNavigation");

          const menuButton =
            $("#mobileMenuButton");

          if (
            navigation &&
            navigation.classList.contains("open")
          ) {

            navigation.classList.remove(
              "open"
            );

            if (menuButton) {
              menuButton.setAttribute(
                "aria-expanded",
                "false"
              );
            }
          }
        }
      }
    );
  }

  /* ==========================================================
     FORM MESSAGE
     ========================================================== */

  function showFormMessage(
    element,
    message,
    type = "info"
  ) {

    if (!element) {
      return;
    }

    element.textContent = message;

    element.style.marginTop = "12px";
    element.style.padding = "10px 12px";
    element.style.borderRadius = "8px";
    element.style.fontSize = "0.85rem";
    element.style.fontWeight = "600";

    if (type === "success") {

      element.style.background =
        "rgba(0, 230, 118, 0.10)";

      element.style.color =
        "#008f48";

    } else if (type === "error") {

      element.style.background =
        "rgba(229, 57, 53, 0.10)";

      element.style.color =
        "#b71c1c";

    } else {

      element.style.background =
        "#eef3f5";

      element.style.color =
        "#334155";
    }
  }

  /* ==========================================================
     BUTTON LOADING
     ========================================================== */

  function setButtonLoading(
    button,
    loading,
    text
  ) {

    if (!button) {
      return;
    }

    if (loading) {

      button.dataset.originalText =
        button.innerHTML;

      button.disabled = true;

      button.innerHTML = text;

    } else {

      button.disabled = false;

      button.innerHTML =
        button.dataset.originalText ||
        text;
    }
  }

  /* ==========================================================
     FRIENDLY AUTH ERRORS
     ========================================================== */

  function getFriendlyAuthError(error) {

    const message =
      String(
        error?.message || ""
      ).toLowerCase();

    if (
      message.includes(
        "invalid login credentials"
      )
    ) {
      return "Incorrect email or password.";
    }

    if (
      message.includes(
        "email not confirmed"
      )
    ) {
      return "Please confirm your email address before signing in.";
    }

    if (
      message.includes(
        "user already registered"
      )
    ) {
      return "An account with this email already exists.";
    }

    if (
      message.includes(
        "password"
      ) &&
      message.includes(
        "characters"
      )
    ) {
      return "Your password does not meet the minimum requirements.";
    }

    if (
      message.includes(
        "rate limit"
      )
    ) {
      return "Too many attempts. Please wait a moment and try again.";
    }

    return (
      error?.message ||
      "Something went wrong. Please try again."
    );
  }

  /* ==========================================================
     TOAST
     ========================================================== */

  function showToast(
    message,
    duration = 3500
  ) {

    let toast =
      $("#meiToast");

    if (!toast) {

      toast =
        document.createElement(
          "div"
        );

      toast.id = "meiToast";

      toast.className =
        "toast";

      toast.setAttribute(
        "role",
        "status"
      );

      document.body.appendChild(
        toast
      );
    }

    toast.textContent = message;

    toast.classList.add("show");

    clearTimeout(
      toast._timeout
    );

    toast._timeout =
      setTimeout(() => {
        toast.classList.remove(
          "show"
        );
      }, duration);
  }

  /* ==========================================================
     ID GENERATOR
     ========================================================== */

  function generateId() {

    if (
      window.crypto &&
      typeof window.crypto.randomUUID ===
        "function"
    ) {
      return window.crypto.randomUUID();
    }

    return (
      Date.now().toString(36) +
      Math.random()
        .toString(36)
        .substring(2)
    );
  }

  /* ==========================================================
     PUBLIC API
     ========================================================== */

  MEI.openModal = openModal;

  MEI.closeModal = closeModal;

  MEI.showToast = showToast;

  MEI.config = CONFIG;

  MEI.supabase = SUPABASE;

})(window, document);
