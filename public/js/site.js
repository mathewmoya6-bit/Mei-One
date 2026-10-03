/* ============================================================
   MEI ONE
   GLOBAL SITE JAVASCRIPT
   ============================================================ */

(() => {
  "use strict";

  const MEI = {
    appName: "MEI One",
    version: "1.0.0"
  };

  window.MEI = MEI;


  /* ============================================================
     DOM READY
     ============================================================ */

  document.addEventListener("DOMContentLoaded", () => {
    initMobileNavigation();
    initModalSystem();
    initServiceButtons();
    initSmoothScrolling();
    initCurrentYear();
    initKeyboardHandling();
  });


  /* ============================================================
     MOBILE NAVIGATION
     Matches:
     #mobileMenuButton
     #mainNavigation
     ============================================================ */

  function initMobileNavigation() {
    const button = document.getElementById("mobileMenuButton");
    const navigation = document.getElementById("mainNavigation");

    if (!button || !navigation) {
      return;
    }

    button.addEventListener("click", () => {
      const isOpen = navigation.classList.toggle("open");

      button.classList.toggle("active", isOpen);

      button.setAttribute(
        "aria-expanded",
        String(isOpen)
      );

      button.setAttribute(
        "aria-label",
        isOpen ? "Close navigation" : "Open navigation"
      );
    });

    navigation.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        closeMobileNavigation();
      });
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 820) {
        closeMobileNavigation();
      }
    });
  }


  function closeMobileNavigation() {
    const button = document.getElementById("mobileMenuButton");
    const navigation = document.getElementById("mainNavigation");

    if (!button || !navigation) {
      return;
    }

    navigation.classList.remove("open");
    button.classList.remove("active");

    button.setAttribute("aria-expanded", "false");
    button.setAttribute("aria-label", "Open navigation");
  }


  /* ============================================================
     MODAL SYSTEM
     Matches:
     data-modal="login"
     data-modal="signup"
     data-modal="emergency"
     data-modal="partner"

     Modal:
     #globalModal
     #modalContent
     ============================================================ */

  function initModalSystem() {
    const modal = document.getElementById("globalModal");

    if (!modal) {
      return;
    }

    document.addEventListener("click", (event) => {
      const trigger = event.target.closest("[data-modal]");

      if (trigger) {
        event.preventDefault();

        const modalName = trigger.getAttribute("data-modal");

        openModal(modalName);

        return;
      }

      const closeButton = event.target.closest("[data-modal-close]");

      if (closeButton) {
        closeModal();

        return;
      }

      if (event.target.classList.contains("modal-backdrop")) {
        closeModal();
      }
    });
  }


  function openModal(name) {
    const modal = document.getElementById("globalModal");
    const content = document.getElementById("modalContent");

    if (!modal || !content) {
      return;
    }

    content.innerHTML = getModalContent(name);

    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");

    document.body.style.overflow = "hidden";

    const firstInput = content.querySelector(
      "input, select, textarea, button"
    );

    if (firstInput) {
      setTimeout(() => {
        firstInput.focus();
      }, 50);
    }

    bindModalActions(name);
  }


  function closeModal() {
    const modal = document.getElementById("globalModal");
    const content = document.getElementById("modalContent");

    if (!modal) {
      return;
    }

    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");

    document.body.style.overflow = "";

    if (content) {
      content.innerHTML = "";
    }
  }


  /* ============================================================
     MODAL CONTENT
     ============================================================ */

  function getModalContent(name) {
    switch (name) {

      case "login":
        return `
          <h2 id="modalTitle">Welcome back</h2>

          <p>
            Sign in to your MEI One account.
          </p>

          <form id="modalLoginForm">

            <label for="modalLoginEmail">
              Email address
            </label>

            <input
              id="modalLoginEmail"
              name="email"
              type="email"
              autocomplete="email"
              placeholder="you@example.com"
              required
            >

            <label for="modalLoginPassword">
              Password
            </label>

            <input
              id="modalLoginPassword"
              name="password"
              type="password"
              autocomplete="current-password"
              placeholder="Your password"
              required
            >

            <button
              type="submit"
              class="btn btn-primary btn-block"
            >
              Sign In
            </button>

            <div
              id="modalLoginMessage"
              class="form-msg"
              role="status"
              aria-live="polite"
            ></div>

          </form>

          <button
            type="button"
            class="link"
            data-modal-switch="signup"
          >
            Don't have an account? Create one
          </button>
        `;


      case "signup":
        return `
          <h2 id="modalTitle">Create your account</h2>

          <p>
            Create one MEI One account for connected services.
          </p>

          <form id="modalSignupForm">

            <label for="modalSignupName">
              Full name
            </label>

            <input
              id="modalSignupName"
              name="full_name"
              type="text"
              autocomplete="name"
              placeholder="Your full name"
              required
            >

            <label for="modalSignupPhone">
              Phone number
            </label>

            <input
              id="modalSignupPhone"
              name="phone"
              type="tel"
              autocomplete="tel"
              placeholder="07XXXXXXXX"
              required
            >

            <label for="modalSignupEmail">
              Email address
            </label>

            <input
              id="modalSignupEmail"
              name="email"
              type="email"
              autocomplete="email"
              placeholder="you@example.com"
              required
            >

            <label for="modalSignupPassword">
              Password
            </label>

            <input
              id="modalSignupPassword"
              name="password"
              type="password"
              autocomplete="new-password"
              minlength="6"
              placeholder="Minimum 6 characters"
              required
            >

            <button
              type="submit"
              class="btn btn-primary btn-block"
            >
              Create Account
            </button>

            <div
              id="modalSignupMessage"
              class="form-msg"
              role="status"
              aria-live="polite"
            ></div>

          </form>

          <button
            type="button"
            class="link"
            data-modal-switch="login"
          >
            Already have an account? Sign in
          </button>
        `;


      case "emergency":
        return `
          <h2 id="modalTitle">Vehicle Emergency</h2>

          <p>
            Request towing or roadside assistance.
          </p>

          <form id="emergencyForm">

            <label for="emergencyPhone">
              Phone number
            </label>

            <input
              id="emergencyPhone"
              name="phone"
              type="tel"
              placeholder="07XXXXXXXX"
              required
            >

            <label for="emergencyType">
              What do you need?
            </label>

            <select
              id="emergencyType"
              name="service"
              required
            >
              <option value="">Select service</option>
              <option value="towing">Towing & Recovery</option>
              <option value="roadside">Roadside Assistance</option>
              <option value="battery">Battery Assistance</option>
              <option value="puncture">Puncture Assistance</option>
              <option value="fuel">Fuel Assistance</option>
              <option value="other">Other</option>
            </select>

            <label for="emergencyLocation">
              Location
            </label>

            <textarea
              id="emergencyLocation"
              name="location"
              placeholder="Tell us where you are..."
              required
            ></textarea>

            <button
              type="submit"
              class="btn btn-sos btn-block"
            >
              Request Emergency Help
            </button>

            <div
              id="emergencyMessage"
              class="form-msg"
              role="status"
              aria-live="polite"
            ></div>

          </form>
        `;


      case "partner":
        return `
          <h2 id="modalTitle">Become an MEI One Partner</h2>

          <p>
            Join the MEI One partner network.
          </p>

          <form id="partnerForm">

            <label for="partnerName">
              Full name / Business name
            </label>

            <input
              id="partnerName"
              name="name"
              type="text"
              required
            >

            <label for="partnerPhone">
              Phone number
            </label>

            <input
              id="partnerPhone"
              name="phone"
              type="tel"
              required
            >

            <label for="partnerType">
              Partner type
            </label>

            <select
              id="partnerType"
              name="partner_type"
              required
            >
              <option value="">Select type</option>
              <option value="driver">Driver / Rider</option>
              <option value="towing">Towing / Recovery Operator</option>
              <option value="merchant">Merchant</option>
              <option value="service_provider">Service Provider</option>
            </select>

            <button
              type="submit"
              class="btn btn-primary btn-block"
            >
              Apply as Partner
            </button>

            <div
              id="partnerMessage"
              class="form-msg"
              role="status"
              aria-live="polite"
            ></div>

          </form>
        `;


      default:
        return `
          <h2 id="modalTitle">MEI One</h2>
          <p>This service is coming soon.</p>
        `;
    }
  }


  /* ============================================================
     MODAL ACTIONS
     ============================================================ */

  function bindModalActions(name) {

    document.querySelectorAll("[data-modal-switch]").forEach((button) => {
      button.addEventListener("click", () => {
        const target = button.getAttribute("data-modal-switch");

        openModal(target);
      });
    });


    if (name === "login") {
      const form = document.getElementById("modalLoginForm");

      if (form) {
        form.addEventListener("submit", handleLogin);
      }
    }


    if (name === "signup") {
      const form = document.getElementById("modalSignupForm");

      if (form) {
        form.addEventListener("submit", handleSignup);
      }
    }


    if (name === "emergency") {
      const form = document.getElementById("emergencyForm");

      if (form) {
        form.addEventListener("submit", handleEmergency);
      }
    }


    if (name === "partner") {
      const form = document.getElementById("partnerForm");

      if (form) {
        form.addEventListener("submit", handlePartner);
      }
    }
  }


  /* ============================================================
     LOGIN
     ============================================================ */

  async function handleLogin(event) {
    event.preventDefault();

    const form = event.currentTarget;
    const message = document.getElementById("modalLoginMessage");
    const button = form.querySelector("button[type='submit']");

    const email = form.email.value.trim();
    const password = form.password.value;

    if (!email || !password) {
      showFormMessage(
        message,
        "Please enter your email and password.",
        "error"
      );

      return;
    }

    setButtonLoading(button, true, "Signing in...");

    try {

      if (!window.supabaseClient) {
        throw new Error(
          "Supabase is not initialized."
        );
      }

      const { data, error } =
        await window.supabaseClient.auth.signInWithPassword({
          email,
          password
        });

      if (error) {
        throw error;
      }

      showFormMessage(
        message,
        "Login successful. Redirecting...",
        "success"
      );

      setTimeout(() => {
        window.location.href = "dashboard.html";
      }, 500);

    } catch (error) {

      console.error("MEI One login error:", error);

      showFormMessage(
        message,
        getAuthErrorMessage(error),
        "error"
      );

      setButtonLoading(button, false);
    }
  }


  /* ============================================================
     SIGN UP
     ============================================================ */

  async function handleSignup(event) {
    event.preventDefault();

    const form = event.currentTarget;
    const message = document.getElementById("modalSignupMessage");
    const button = form.querySelector("button[type='submit']");

    const fullName = form.full_name.value.trim();
    const phone = form.phone.value.trim();
    const email = form.email.value.trim();
    const password = form.password.value;

    if (!fullName || !phone || !email || !password) {
      showFormMessage(
        message,
        "Please complete all fields.",
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

    setButtonLoading(button, true, "Creating account...");

    try {

      if (!window.supabaseClient) {
        throw new Error(
          "Supabase is not initialized."
        );
      }

      const { data, error } =
        await window.supabaseClient.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              phone
            }
          }
        });

      if (error) {
        throw error;
      }

      if (data.session) {

        showFormMessage(
          message,
          "Account created successfully. Redirecting...",
          "success"
        );

        setTimeout(() => {
          window.location.href = "dashboard.html";
        }, 500);

      } else {

        showFormMessage(
          message,
          "Account created. Check your email to confirm your account.",
          "success"
        );

        setButtonLoading(button, false);
      }

    } catch (error) {

      console.error("MEI One signup error:", error);

      showFormMessage(
        message,
        getAuthErrorMessage(error),
        "error"
      );

      setButtonLoading(button, false);
    }
  }


  /* ============================================================
     SERVICE BUTTONS
     ============================================================ */

  function initServiceButtons() {
    document.addEventListener("click", (event) => {

      const button = event.target.closest("[data-service]");

      if (!button) {
        return;
      }

      event.preventDefault();

      const service = button.getAttribute("data-service");

      handleService(service);
    });
  }


  function handleService(service) {

    const routes = {
      rides: "dashboard.html?service=rides",
      delivery: "dashboard.html?service=delivery",
      towing: "dashboard.html?service=towing",
      roadside: "dashboard.html?service=roadside",
      auto: "dashboard.html?service=auto",
      marketplace: "dashboard.html?service=marketplace",
      "home-services": "dashboard.html?service=home-services",
      learn: "dashboard.html?service=learn"
    };

    if (!service) {
      return;
    }

    const route = routes[service];

    if (!route) {
      showToast(
        "This service is coming soon.",
        "info"
      );

      return;
    }

    /*
     * For services that require authentication,
     * take the user to dashboard.
     *
     * The dashboard can then verify the session.
     */

    window.location.href = route;
  }


  /* ============================================================
     EMERGENCY FORM
     ============================================================ */

  async function handleEmergency(event) {
    event.preventDefault();

    const form = event.currentTarget;
    const message = document.getElementById("emergencyMessage");
    const button = form.querySelector("button[type='submit']");

    const phone = form.phone.value.trim();
    const service = form.service.value;
    const location = form.location.value.trim();

    if (!phone || !service || !location) {
      showFormMessage(
        message,
        "Please complete all emergency details.",
        "error"
      );

      return;
    }

    setButtonLoading(button, true, "Sending request...");

    try {

      /*
       * Database table can be connected here once
       * the emergency_requests table is confirmed.
       *
       * For now, preserve the request locally so
       * the frontend works without assuming a table
       * that may not yet exist.
       */

      const request = {
        phone,
        service,
        location,
        created_at: new Date().toISOString()
      };

      localStorage.setItem(
        "mei_pending_emergency",
        JSON.stringify(request)
      );

      showFormMessage(
        message,
        "Emergency request captured. We will connect this to the live dispatch system next.",
        "success"
      );

      setButtonLoading(button, false);

    } catch (error) {

      console.error(error);

      showFormMessage(
        message,
        "Unable to process the request.",
        "error"
      );

      setButtonLoading(button, false);
    }
  }


  /* ============================================================
     PARTNER FORM
     ============================================================ */

  async function handlePartner(event) {
    event.preventDefault();

    const form = event.currentTarget;
    const message = document.getElementById("partnerMessage");
    const button = form.querySelector("button[type='submit']");

    const name = form.name.value.trim();
    const phone = form.phone.value.trim();
    const partnerType = form.partner_type.value;

    if (!name || !phone || !partnerType) {
      showFormMessage(
        message,
        "Please complete all fields.",
        "error"
      );

      return;
    }

    setButtonLoading(button, true, "Submitting...");

    try {

      const application = {
        name,
        phone,
        partner_type: partnerType,
        created_at: new Date().toISOString()
      };

      localStorage.setItem(
        "mei_partner_application",
        JSON.stringify(application)
      );

      showFormMessage(
        message,
        "Partner application received. We will connect this to the partner database next.",
        "success"
      );

      setButtonLoading(button, false);

    } catch (error) {

      console.error(error);

      showFormMessage(
        message,
        "Unable to submit your application.",
        "error"
      );

      setButtonLoading(button, false);
    }
  }


  /* ============================================================
     SMOOTH SCROLL
     ============================================================ */

  function initSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach((link) => {

      link.addEventListener("click", (event) => {

        const href = link.getAttribute("href");

        if (!href || href === "#") {
          return;
        }

        const target = document.querySelector(href);

        if (!target) {
          return;
        }

        event.preventDefault();

        target.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });

        closeMobileNavigation();
      });
    });
  }


  /* ============================================================
     CURRENT YEAR
     ============================================================ */

  function initCurrentYear() {
    const yearElement =
      document.getElementById("currentYear");

    if (yearElement) {
      yearElement.textContent =
        new Date().getFullYear();
    }
  }


  /* ============================================================
     ESCAPE KEY
     ============================================================ */

  function initKeyboardHandling() {
    document.addEventListener("keydown", (event) => {

      if (event.key !== "Escape") {
        return;
      }

      closeModal();
      closeMobileNavigation();
    });
  }


  /* ============================================================
     TOAST
     ============================================================ */

  function showToast(message, type = "info") {

    let toast =
      document.getElementById("meiToast");

    if (!toast) {

      toast = document.createElement("div");

      toast.id = "meiToast";

      toast.style.position = "fixed";
      toast.style.left = "50%";
      toast.style.bottom = "30px";
      toast.style.transform = "translateX(-50%)";
      toast.style.zIndex = "9999";
      toast.style.padding = "12px 18px";
      toast.style.borderRadius = "999px";
      toast.style.fontWeight = "700";
      toast.style.maxWidth = "90vw";
      toast.style.textAlign = "center";
      toast.style.boxShadow =
        "0 10px 30px rgba(0,0,0,.20)";

      document.body.appendChild(toast);
    }

    toast.textContent = message;

    toast.style.background =
      type === "error"
        ? "#d7263d"
        : type === "success"
          ? "#2f6f5e"
          : "#10231f";

    toast.style.color = "#ffffff";

    toast.style.opacity = "1";

    clearTimeout(toast._timer);

    toast._timer = setTimeout(() => {
      toast.style.opacity = "0";
    }, 3500);
  }


  /* ============================================================
     FORM MESSAGE
     ============================================================ */

  function showFormMessage(element, message, type) {

    if (!element) {
      return;
    }

    element.textContent = message;

    element.style.color =
      type === "error"
        ? "#d7263d"
        : type === "success"
          ? "#2f6f5e"
          : "inherit";
  }


  /* ============================================================
     BUTTON LOADING
     ============================================================ */

  function setButtonLoading(
    button,
    loading,
    text = "Processing..."
  ) {

    if (!button) {
      return;
    }

    if (loading) {

      if (!button.dataset.originalText) {
        button.dataset.originalText =
          button.innerHTML;
      }

      button.disabled = true;
      button.innerHTML = text;

    } else {

      button.disabled = false;

      if (button.dataset.originalText) {
        button.innerHTML =
          button.dataset.originalText;

        delete button.dataset.originalText;
      }
    }
  }


  /* ============================================================
     AUTH ERROR MESSAGE
     ============================================================ */

  function getAuthErrorMessage(error) {

    const message =
      String(error?.message || "").toLowerCase();

    if (message.includes("invalid login credentials")) {
      return "Incorrect email or password.";
    }

    if (message.includes("email not confirmed")) {
      return "Please confirm your email before signing in.";
    }

    if (message.includes("user already registered")) {
      return "An account with this email already exists.";
    }

    if (message.includes("password")) {
      return error.message;
    }

    return (
      error?.message ||
      "Something went wrong. Please try again."
    );
  }


  /* ============================================================
     PUBLIC API
     ============================================================ */

  MEI.openModal = openModal;
  MEI.closeModal = closeModal;
  MEI.showToast = showToast;
  MEI.handleService = handleService;

})();
