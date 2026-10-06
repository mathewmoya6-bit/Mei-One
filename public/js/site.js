/* ============================================================
   MEI ONE — GLOBAL SITE JAVASCRIPT
   js/site.js
   ============================================================ */

(function (window, document) {
  "use strict";

  /* ----------------------------------------------------------
     CONFIG & HELPERS
  ---------------------------------------------------------- */

  const CONFIG = window.MEI_CONFIG || window.MEIConfig || window.CONFIG || {};
  const supabase = window.supabaseClient || null;

  const $ = (selector, parent = document) => parent.querySelector(selector);
  const $$ = (selector, parent = document) => Array.from(parent.querySelectorAll(selector));

  const route = (name, fallback) => (CONFIG.routes && CONFIG.routes[name]) || fallback;

  // A page can store where the person was heading before sign-in (e.g. rides.js),
  // so login returns them there instead of the default dashboard view.
  // Only same-site relative .html paths are accepted, so this can't redirect elsewhere.
  const AFTER_LOGIN_KEY = "mei_after_login";

  function postLoginDestination(fallback) {
    try {
      const destination = sessionStorage.getItem(AFTER_LOGIN_KEY);
      if (destination) {
        sessionStorage.removeItem(AFTER_LOGIN_KEY);
        if (/^[\w-]+\.html(\?[\w=&%.-]*)?(#[\w-]*)?$/i.test(destination)) return destination;
      }
    } catch (_) { /* storage unavailable */ }
    return fallback;
  }

  // Optional: set emergencyPhone (or supportPhone) in config.js to show a direct call link.
  const supportPhone = String(CONFIG.emergencyPhone || CONFIG.supportPhone || "").replace(/[^\d+]/g, "");

  const FOCUSABLE = [
    "a[href]",
    "button:not([disabled])",
    "input:not([disabled])",
    "select:not([disabled])",
    "textarea:not([disabled])",
    '[tabindex]:not([tabindex="-1"])'
  ].join(",");

  /* ----------------------------------------------------------
     TOAST
     (#toastContainer is the live region, so toasts don't need a role)
  ---------------------------------------------------------- */

  function showToast(message, type = "info", duration = 4000) {
    const container = $("#toastContainer");

    if (!container) {
      console.log(message);
      return;
    }

    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    container.appendChild(toast);

    window.setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateY(8px)";
      window.setTimeout(() => toast.remove(), 200);
    }, duration);
  }

  /* ----------------------------------------------------------
     MOBILE NAVIGATION
  ---------------------------------------------------------- */

  function initMobileNavigation() {
    const button = $("#mobileMenuButton");
    const navigation = $("#mainNavigation");
    if (!button || !navigation) return;

    const setOpen = (open) => {
      navigation.classList.toggle("open", open);
      button.setAttribute("aria-expanded", String(open));
      button.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
    };

    button.addEventListener("click", () => setOpen(!navigation.classList.contains("open")));

    $$("#mainNavigation a, #mainNavigation button").forEach((element) => {
      element.addEventListener("click", () => setOpen(false));
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && navigation.classList.contains("open")) {
        setOpen(false);
        button.focus();
      }
    });
  }

  /* ----------------------------------------------------------
     MODAL TEMPLATES
  ---------------------------------------------------------- */

  const input = (label, name, type, placeholder, extra = "") => `
    <label>${label}
      <input type="${type}" name="${name}" placeholder="${placeholder}" required ${extra}>
    </label>`;

  const textarea = (label, name, placeholder) => `
    <label>${label}
      <textarea name="${name}" placeholder="${placeholder}" required></textarea>
    </label>`;

  const select = (label, name, options) => `
    <label>${label}
      <select name="${name}" required>
        ${options.map(([value, text]) => `<option value="${value}">${text}</option>`).join("")}
      </select>
    </label>`;

  const templates = {
    signup: () => `
      <div class="modal-content">
        <span class="section-label">MEI ONE</span>
        <h2 id="modalTitle">Create your account</h2>
        <p>Create one MEI One account to access connected services.</p>
        <form id="signupForm">
          ${input("Full name", "full_name", "text", "Your full name", 'autocomplete="name"')}
          ${input("Phone", "phone", "tel", "07XXXXXXXX", 'autocomplete="tel"')}
          ${input("Email", "email", "email", "you@example.com", 'autocomplete="email"')}
          ${input("Password", "password", "password", "Minimum 6 characters", 'autocomplete="new-password" minlength="6"')}
          <div class="form-message" id="signupMessage" aria-live="polite"></div>
          <button type="submit" class="button button-primary button-large">Create account</button>
        </form>
        <p class="modal-switch">Already have an account?
          <button type="button" data-switch-modal="login">Sign in</button>
        </p>
      </div>`,

    login: () => `
      <div class="modal-content">
        <span class="section-label">MEI ONE</span>
        <h2 id="modalTitle">Welcome back</h2>
        <p>Sign in to continue to your MEI One account.</p>
        <form id="loginForm">
          ${input("Email", "email", "email", "you@example.com", 'autocomplete="email"')}
          ${input("Password", "password", "password", "Your password", 'autocomplete="current-password"')}
          <div class="form-message" id="loginMessage" aria-live="polite"></div>
          <button type="submit" class="button button-primary button-large">Sign in</button>
        </form>
        <p class="modal-switch">Don't have an account?
          <button type="button" data-switch-modal="signup">Create one</button>
        </p>
      </div>`,

    emergency: () => `
      <div class="modal-content">
        <span class="section-label">EMERGENCY SUPPORT</span>
        <h2 id="modalTitle">Request emergency help</h2>
        <p><strong>If anyone's life is in danger, call 999 or 112 now.</strong>${supportPhone ? ` You can also call us on <a href="tel:${supportPhone}">${supportPhone}</a>.` : ""}</p>
        <p>Otherwise, provide your details and describe the assistance you need.</p>
        <form id="emergencyForm">
          ${input("Full name", "name", "text", "Your full name", 'autocomplete="name"')}
          ${input("Phone", "phone", "tel", "07XXXXXXXX", 'autocomplete="tel"')}
          ${select("Service needed", "service", [
            ["", "Select assistance"],
            ["towing", "Vehicle towing"],
            ["roadside", "Roadside assistance"],
            ["vehicle-recovery", "Vehicle recovery"],
            ["other", "Other emergency assistance"]
          ])}
          ${input("Location", "location", "text", "Area / town / landmark")}
          ${textarea("What do you need help with?", "message", "Briefly describe the situation…")}
          <div class="form-message" id="emergencyMessage" aria-live="polite"></div>
          <button type="submit" class="button button-emergency button-large">Submit emergency request</button>
        </form>
      </div>`,

    partner: () => `
      <div class="modal-content">
        <span class="section-label">FOR BUSINESS</span>
        <h2 id="modalTitle">Become a MEI One partner</h2>
        <p>Tell us about your business or service and our team can review your partnership enquiry.</p>
        <form id="partnerForm">
          ${input("Business / organisation name", "business_name", "text", "Business name")}
          ${input("Contact person", "contact_name", "text", "Full name")}
          ${input("Phone", "phone", "tel", "07XXXXXXXX")}
          ${input("Email", "email", "email", "business@example.com")}
          ${select("Partnership area", "partnership_type", [
            ["", "Select an area"],
            ["service-provider", "Service provider"],
            ["merchant", "Merchant"],
            ["business-partner", "Business partner"],
            ["driver-operator", "Driver / operator"],
            ["other", "Other"]
          ])}
          ${textarea("Message", "message", "Tell us about your partnership proposal…")}
          <div class="form-message" id="partnerMessage" aria-live="polite"></div>
          <button type="submit" class="button button-primary button-large">Submit partnership enquiry</button>
        </form>
      </div>`
  };

  /* ----------------------------------------------------------
     MODAL
  ---------------------------------------------------------- */

  const modal = {
    element: null,
    dialog: null,
    content: null,
    lastFocused: null,

    isOpen() {
      return Boolean(this.element && this.element.classList.contains("open"));
    },

    init() {
      this.element = $("#globalModal");
      this.content = $("#modalContent");
      this.dialog = this.element ? $(".modal-dialog", this.element) : null;
      if (!this.element || !this.content) return;

      $$("[data-modal-close]", this.element).forEach((element) => {
        element.addEventListener("click", () => this.close());
      });

      document.addEventListener("keydown", (event) => {
        if (!this.isOpen()) return;

        if (event.key === "Escape") {
          this.close();
        } else if (event.key === "Tab") {
          this.trapFocus(event);
        }
      });
    },

    trapFocus(event) {
      const scope = this.dialog || this.element;
      const items = $$(FOCUSABLE, scope).filter((el) => el.getClientRects().length > 0);
      if (!items.length) return;

      const first = items[0];
      const last = items[items.length - 1];

      if (!scope.contains(document.activeElement)) {
        event.preventDefault();
        first.focus();
      } else if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    },

    open(type) {
      if (!this.element || !this.content || !templates[type]) return;

      // Remember the trigger only on first open, so switching Sign in <-> Sign up keeps the original.
      if (!this.isOpen()) this.lastFocused = document.activeElement;

      this.content.innerHTML = templates[type]();
      this.element.classList.add("open");
      this.element.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";

      if (this.dialog && $("#modalTitle", this.content)) {
        this.dialog.setAttribute("aria-labelledby", "modalTitle");
      }

      bindModalForm(type);

      const firstField = this.content.querySelector("input, textarea, select, button");
      if (firstField) window.setTimeout(() => firstField.focus(), 50);
    },

    close() {
      if (!this.element || !this.isOpen()) return;

      this.element.classList.remove("open");
      this.element.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";

      if (this.dialog) this.dialog.removeAttribute("aria-labelledby");
      if (this.content) this.content.innerHTML = "";

      if (this.lastFocused && document.contains(this.lastFocused)) this.lastFocused.focus();
      this.lastFocused = null;
    }
  };

  /* ----------------------------------------------------------
     FORM HELPERS
  ---------------------------------------------------------- */

  function showFormMessage(element, message, type = "info") {
    if (!element) return;
    element.textContent = message;
    element.dataset.type = type;
  }

  function setButtonLoading(button, loading, loadingText = "Please wait…") {
    if (!button) return;

    if (loading) {
      button.dataset.originalText = button.textContent;
      button.disabled = true;
      button.textContent = loadingText;
    } else {
      button.disabled = false;
      if (button.dataset.originalText) {
        button.textContent = button.dataset.originalText;
        delete button.dataset.originalText;
      }
    }
  }

  const readField = (formData, name) => String(formData.get(name) || "").trim();

  function friendlyAuthError(error) {
    const message = String(error?.message || "").toLowerCase();

    if (message.includes("invalid login credentials")) return "Incorrect email or password.";
    if (message.includes("email not confirmed")) return "Please confirm your email before signing in.";
    if (message.includes("user already registered")) return "An account with this email already exists.";
    if (message.includes("rate limit")) return "Too many attempts. Please wait and try again.";
    if (message.includes("password")) return error.message;

    return error?.message || "Something went wrong. Please try again.";
  }

  /* ----------------------------------------------------------
     AUTHENTICATION
  ---------------------------------------------------------- */

  async function signUp(form) {
    const message = $("#signupMessage");
    const button = form.querySelector("button[type='submit']");

    if (!supabase) {
      showFormMessage(message, "Authentication is temporarily unavailable.", "error");
      return;
    }

    const formData = new FormData(form);
    const fullName = readField(formData, "full_name");
    const phone = readField(formData, "phone");
    const email = readField(formData, "email");
    const password = String(formData.get("password") || "");

    if (!fullName || !phone || !email || !password) {
      showFormMessage(message, "Please complete all required fields.", "error");
      return;
    }

    if (password.length < 6) {
      showFormMessage(message, "Password must contain at least 6 characters.", "error");
      return;
    }

    setButtonLoading(button, true, "Creating account…");

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName, phone } }
      });

      if (error) throw error;

      // With email confirmation on, Supabase returns a fake "success" for an existing email
      // (a user object with no identities). Detect it so the person isn't told to check email for nothing.
      if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
        showFormMessage(message, "An account with this email already exists. Try signing in instead.", "error");
        return;
      }

      if (data.session) {
        showToast("Account created successfully.", "success");
        modal.close();
        window.setTimeout(() => { window.location.href = postLoginDestination(route("dashboard", "dashboard.html")); }, 400);
      } else {
        showFormMessage(message, "Account created. Check your email to confirm your account.", "success");
        form.reset();
      }
    } catch (error) {
      showFormMessage(message, friendlyAuthError(error), "error");
    } finally {
      setButtonLoading(button, false);
    }
  }

  async function signIn(form) {
    const message = $("#loginMessage");
    const button = form.querySelector("button[type='submit']");

    if (!supabase) {
      showFormMessage(message, "Authentication is temporarily unavailable.", "error");
      return;
    }

    const formData = new FormData(form);
    const email = readField(formData, "email");
    const password = String(formData.get("password") || "");

    if (!email || !password) {
      showFormMessage(message, "Please enter your email and password.", "error");
      return;
    }

    setButtonLoading(button, true, "Signing in…");

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      showToast("Signed in successfully.", "success");
      modal.close();
      window.setTimeout(() => { window.location.href = postLoginDestination(route("dashboard", "dashboard.html")); }, 300);
    } catch (error) {
      showFormMessage(message, friendlyAuthError(error), "error");
    } finally {
      setButtonLoading(button, false);
    }
  }

  async function signOut() {
    if (!supabase) return;

    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      showToast("You have been signed out.", "success");
      window.setTimeout(() => { window.location.href = route("home", "index.html"); }, 500);
    } catch (error) {
      console.error(error);
      showToast("Unable to sign out. Please try again.", "error");
    }
  }

  /* ----------------------------------------------------------
     AUTH UI
  ---------------------------------------------------------- */

  function setVisible(element, visible) {
    // The Dashboard link is hidden by CSS, so it needs an explicit display value.
    const shown = element.classList.contains("nav-dashboard") ? "block" : "";
    element.style.display = visible ? shown : "none";
  }

  function applyAuthUI(signedIn) {
    $$("[data-auth='login'], [data-auth='guest']").forEach((el) => setVisible(el, !signedIn));
    $$("[data-auth='dashboard'], [data-auth='logout']").forEach((el) => setVisible(el, signedIn));
  }

  async function updateAuthUI() {
    if (!supabase) return;

    try {
      const { data } = await supabase.auth.getSession();
      applyAuthUI(Boolean(data?.session));
    } catch (error) {
      console.error("MEI One: Unable to read authentication state.", error);
    }
  }

  function initAuthListener() {
    if (!supabase) return;

    // Use the session passed to the callback instead of calling Supabase again inside it.
    supabase.auth.onAuthStateChange((_event, session) => applyAuthUI(Boolean(session)));
  }

  /* ----------------------------------------------------------
     SERVICES, SCROLLING, YEAR, LINKS
  ---------------------------------------------------------- */

  function handleService(serviceName) {
    const service = CONFIG.services && CONFIG.services[serviceName];

    if (!service || !service.route) {
      showToast("This service is not currently available.", "error");
      return;
    }

    window.location.href = service.route;
  }

  function initServiceButtons() {
    $$("[data-service]").forEach((element) => {
      element.addEventListener("click", (event) => {
        event.preventDefault();
        handleService(element.dataset.service);
      });
    });
  }

  function initSmoothScrolling() {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    $$('a[href^="#"]').forEach((link) => {
      link.addEventListener("click", (event) => {
        const targetId = link.getAttribute("href");
        if (!targetId || targetId === "#") return;

        const target = document.getElementById(targetId.slice(1));
        if (!target) return;

        event.preventDefault();
        target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
      });
    });
  }

  function updateCurrentYear() {
    const year = String(new Date().getFullYear());
    $$("[data-current-year], #currentYear").forEach((element) => { element.textContent = year; });
  }

  function initDashboardLinks() {
    $$("[data-dashboard]").forEach((element) => {
      element.addEventListener("click", () => { window.location.href = route("dashboard", "dashboard.html"); });
    });
  }

  function initLogoutButtons() {
    $$("[data-auth='logout']").forEach((button) => {
      button.addEventListener("click", (event) => {
        event.preventDefault();
        signOut();
      });
    });
  }

  /* ----------------------------------------------------------
     EMERGENCY & PARTNER FORMS
     Sent to Supabase tables `emergency_requests` and `partner_requests`.
     Success is only reported when the insert really succeeds. Nothing is
     stored in the browser, and nobody is told a request was received
     when it wasn't.
  ---------------------------------------------------------- */

  async function submitRequest({ form, table, fields, messageId, loadingText, successMessage, toastMessage, failMessage }) {
    const formData = new FormData(form);
    const record = {};
    fields.forEach((name) => { record[name] = readField(formData, name); });

    const message = $(messageId);
    const button = form.querySelector("button[type='submit']");

    if (fields.some((name) => !record[name])) {
      showFormMessage(message, "Please complete all required fields.", "error");
      return;
    }

    if (!supabase) {
      showFormMessage(message, failMessage, "error");
      return;
    }

    setButtonLoading(button, true, loadingText);

    try {
      const { error } = await supabase.from(table).insert(record);
      if (error) throw error;

      showFormMessage(message, successMessage, "success");
      form.reset();
      showToast(toastMessage, "success");
    } catch (error) {
      console.error(error);
      showFormMessage(message, failMessage, "error");
    } finally {
      setButtonLoading(button, false);
    }
  }

  const submitEmergency = (form) => submitRequest({
    form,
    table: "emergency_requests",
    fields: ["name", "phone", "service", "location", "message"],
    messageId: "#emergencyMessage",
    loadingText: "Submitting request…",
    successMessage: "Your emergency request has been sent. Please keep your phone on and stay reachable.",
    toastMessage: "Emergency request sent.",
    failMessage: `We couldn't send your request. If anyone's life is in danger, call 999 or 112 now.${supportPhone ? ` You can also call us on ${supportPhone}.` : " Please try again."}`
  });

  const submitPartner = (form) => submitRequest({
    form,
    table: "partner_requests",
    fields: ["business_name", "contact_name", "phone", "email", "partnership_type", "message"],
    messageId: "#partnerMessage",
    loadingText: "Submitting…",
    successMessage: "Thank you. Your partnership enquiry has been sent.",
    toastMessage: "Partnership enquiry sent.",
    failMessage: "We couldn't send your enquiry. Please try again."
  });

  /* ----------------------------------------------------------
     MODAL BINDING
  ---------------------------------------------------------- */

  const submitHandlers = {
    signup: ["#signupForm", signUp],
    login: ["#loginForm", signIn],
    emergency: ["#emergencyForm", submitEmergency],
    partner: ["#partnerForm", submitPartner]
  };

  function bindModalForm(type) {
    $$("[data-switch-modal]").forEach((button) => {
      button.addEventListener("click", () => modal.open(button.dataset.switchModal));
    });

    const entry = submitHandlers[type];
    if (!entry) return;

    const [selector, handler] = entry;
    const form = $(selector);
    if (!form) return;

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      handler(form);
    });
  }

  function initModalButtons() {
    $$("[data-modal]").forEach((button) => {
      button.addEventListener("click", () => modal.open(button.dataset.modal));
    });
  }

  /* ----------------------------------------------------------
     GLOBAL API
  ---------------------------------------------------------- */

  window.MEI = {
    config: CONFIG,
    supabase,
    openModal: (type) => modal.open(type),
    closeModal: () => modal.close(),
    showToast,
    handleService,
    signIn,
    signUp,
    signOut
  };

  /* ----------------------------------------------------------
     INIT
  ---------------------------------------------------------- */

  function init() {
    initMobileNavigation();
    modal.init();
    initModalButtons();
    initServiceButtons();
    initSmoothScrolling();
    initDashboardLinks();
    initLogoutButtons();
    updateCurrentYear();
    updateAuthUI();
    initAuthListener();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})(window, document);
