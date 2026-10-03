/* ============================================================
MEI ONE — GLOBAL SITE JAVASCRIPT
public/js/site.js
============================================================ */

(function (window, document) {
"use strict";

/* ----------------------------------------------------------
CONFIG
---------------------------------------------------------- */

const CONFIG =
window.MEI_CONFIG ||
window.MEIConfig ||
window.CONFIG ||
{};

const supabase = window.supabaseClient || null;

/* ----------------------------------------------------------
HELPERS
---------------------------------------------------------- */

const $ = (selector, parent = document) =>
parent.querySelector(selector);

const $$ = (selector, parent = document) =>
Array.from(parent.querySelectorAll(selector));

const escapeHTML = (value) => {
const div = document.createElement("div");
div.textContent = value ?? "";
return div.innerHTML;
};

const getService = (name) => {
return CONFIG.services && CONFIG.services[name]
? CONFIG.services[name]
: null;
};

/* ----------------------------------------------------------
TOAST
---------------------------------------------------------- */

function showToast(message, type = "info", duration = 4000) {
const container = $("#toastContainer");

```
if (!container) {
  console.log(message);
  return;
}

const toast = document.createElement("div");

toast.className = `toast toast-${type}`;
toast.setAttribute("role", "status");

toast.innerHTML = escapeHTML(message);

container.appendChild(toast);

window.setTimeout(() => {
  toast.style.opacity = "0";
  toast.style.transform = "translateY(8px)";

  window.setTimeout(() => {
    toast.remove();
  }, 200);
}, duration);
```

}

/* ----------------------------------------------------------
MOBILE NAVIGATION
---------------------------------------------------------- */

function initMobileNavigation() {
const button = $("#mobileMenuButton");
const navigation = $("#mainNavigation");

```
if (!button || !navigation) return;

button.addEventListener("click", () => {
  const isOpen = navigation.classList.toggle("open");

  button.setAttribute(
    "aria-expanded",
    String(isOpen)
  );

  button.setAttribute(
    "aria-label",
    isOpen ? "Close navigation" : "Open navigation"
  );
});

$$("#mainNavigation a, #mainNavigation button").forEach(
  (element) => {
    element.addEventListener("click", () => {
      navigation.classList.remove("open");

      button.setAttribute(
        "aria-expanded",
        "false"
      );

      button.setAttribute(
        "aria-label",
        "Open navigation"
      );
    });
  }
);
```

}

/* ----------------------------------------------------------
MODAL
---------------------------------------------------------- */

const modal = {
element: null,
content: null,

```
init() {
  this.element = $("#globalModal");
  this.content = $("#modalContent");

  if (!this.element || !this.content) return;

  $$("[data-modal-close]").forEach((element) => {
    element.addEventListener("click", () => {
      this.close();
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      this.close();
    }
  });
},

open(type) {
  if (!this.element || !this.content) return;

  let content = "";

  switch (type) {
    case "signup":
      content = this.signupTemplate();
      break;

    case "login":
      content = this.loginTemplate();
      break;

    case "emergency":
      content = this.emergencyTemplate();
      break;

    case "partner":
      content = this.partnerTemplate();
      break;

    default:
      return;
  }

  this.content.innerHTML = content;

  this.element.classList.add("open");
  this.element.setAttribute("aria-hidden", "false");

  document.body.style.overflow = "hidden";

  this.bindForm(type);

  const firstInput = this.content.querySelector(
    "input, textarea, select, button"
  );

  if (firstInput) {
    window.setTimeout(() => firstInput.focus(), 50);
  }
},

close() {
  if (!this.element) return;

  this.element.classList.remove("open");
  this.element.setAttribute("aria-hidden", "true");

  document.body.style.overflow = "";

  if (this.content) {
    this.content.innerHTML = "";
  }
},

signupTemplate() {
  return `
    <div class="modal-content">
      <span class="section-label">MEI ONE</span>
      <h2 id="modalTitle">Create your account</h2>
      <p>
        Create one MEI One account to access connected services.
      </p>

      <form id="signupForm" novalidate>

        <label>
          Full Name
          <input
            type="text"
            name="full_name"
            autocomplete="name"
            required
            placeholder="Your full name"
          >
        </label>

        <label>
          Phone
          <input
            type="tel"
            name="phone"
            autocomplete="tel"
            required
            placeholder="07XXXXXXXX"
          >
        </label>

        <label>
          Email
          <input
            type="email"
            name="email"
            autocomplete="email"
            required
            placeholder="you@example.com"
          >
        </label>

        <label>
          Password
          <input
            type="password"
            name="password"
            autocomplete="new-password"
            minlength="6"
            required
            placeholder="Minimum 6 characters"
          >
        </label>

        <div
          class="form-message"
          id="signupMessage"
          aria-live="polite"
        ></div>

        <button
          type="submit"
          class="button button-primary button-large"
        >
          Create Account
        </button>
      </form>

      <p class="modal-switch">
        Already have an account?
        <button type="button" data-switch-modal="login">
          Sign in
        </button>
      </p>
    </div>
  `;
},

loginTemplate() {
  return `
    <div class="modal-content">
      <span class="section-label">MEI ONE</span>
      <h2 id="modalTitle">Welcome back</h2>
      <p>
        Sign in to continue to your MEI One account.
      </p>

      <form id="loginForm" novalidate>

        <label>
          Email
          <input
            type="email"
            name="email"
            autocomplete="email"
            required
            placeholder="you@example.com"
          >
        </label>

        <label>
          Password
          <input
            type="password"
            name="password"
            autocomplete="current-password"
            required
            placeholder="Your password"
          >
        </label>

        <div
          class="form-message"
          id="loginMessage"
          aria-live="polite"
        ></div>

        <button
          type="submit"
          class="button button-primary button-large"
        >
          Sign In
        </button>
      </form>

      <p class="modal-switch">
        Don't have an account?
        <button type="button" data-switch-modal="signup">
          Create one
        </button>
      </p>
    </div>
  `;
},

emergencyTemplate() {
  return `
    <div class="modal-content">
      <span class="section-label">EMERGENCY SUPPORT</span>
      <h2 id="modalTitle">Request emergency help</h2>
      <p>
        Provide your details and describe the assistance you need.
      </p>

      <form id="emergencyForm" novalidate>

        <label>
          Full Name
          <input
            type="text"
            name="name"
            autocomplete="name"
            required
            placeholder="Your full name"
          >
        </label>

        <label>
          Phone
          <input
            type="tel"
            name="phone"
            autocomplete="tel"
            required
            placeholder="07XXXXXXXX"
          >
        </label>

        <label>
          Service Needed
          <select name="service" required>
            <option value="">Select assistance</option>
            <option value="towing">Vehicle Towing</option>
            <option value="roadside">Roadside Assistance</option>
            <option value="vehicle-recovery">
              Vehicle Recovery
            </option>
            <option value="other">Other Emergency Assistance</option>
          </select>
        </label>

        <label>
          Location
          <input
            type="text"
            name="location"
            required
            placeholder="Area / town / landmark"
          >
        </label>

        <label>
          What do you need help with?
          <textarea
            name="message"
            required
            placeholder="Briefly describe the situation..."
          ></textarea>
        </label>

        <div
          class="form-message"
          id="emergencyMessage"
          aria-live="polite"
        ></div>

        <button
          type="submit"
          class="button button-emergency button-large"
        >
          Submit Emergency Request
        </button>
      </form>
    </div>
  `;
},

partnerTemplate() {
  return `
    <div class="modal-content">
      <span class="section-label">FOR BUSINESS</span>
      <h2 id="modalTitle">Become a MEI One partner</h2>
      <p>
        Tell us about your business or service and our team can
        review your partnership enquiry.
      </p>

      <form id="partnerForm" novalidate>

        <label>
          Business / Organisation Name
          <input
            type="text"
            name="business_name"
            required
            placeholder="Business name"
          >
        </label>

        <label>
          Contact Person
          <input
            type="text"
            name="contact_name"
            required
            placeholder="Full name"
          >
        </label>

        <label>
          Phone
          <input
            type="tel"
            name="phone"
            required
            placeholder="07XXXXXXXX"
          >
        </label>

        <label>
          Email
          <input
            type="email"
            name="email"
            required
            placeholder="business@example.com"
          >
        </label>

        <label>
          Partnership Area
          <select name="partnership_type" required>
            <option value="">Select an area</option>
            <option value="service-provider">
              Service Provider
            </option>
            <option value="merchant">
              Merchant
            </option>
            <option value="business-partner">
              Business Partner
            </option>
            <option value="driver-operator">
              Driver / Operator
            </option>
            <option value="other">
              Other
            </option>
          </select>
        </label>

        <label>
          Message
          <textarea
            name="message"
            required
            placeholder="Tell us about your partnership proposal..."
          ></textarea>
        </label>

        <div
          class="form-message"
          id="partnerMessage"
          aria-live="polite"
        ></div>

        <button
          type="submit"
          class="button button-primary button-large"
        >
          Submit Partnership Enquiry
        </button>
      </form>
    </div>
  `;
}
```

};

/* ----------------------------------------------------------
FORM HELPERS
---------------------------------------------------------- */

function showFormMessage(element, message, type = "info") {
if (!element) return;

```
element.textContent = message;
element.dataset.type = type;
```

}

function setButtonLoading(button, loading, loadingText = "Please wait...") {
if (!button) return;

```
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
```

}

/* ----------------------------------------------------------
AUTHENTICATION
---------------------------------------------------------- */

async function signUp(form) {
if (!supabase) {
showFormMessage(
$("#signupMessage"),
"Authentication is temporarily unavailable.",
"error"
);
return;
}

```
const formData = new FormData(form);

const fullName =
  String(formData.get("full_name") || "").trim();

const phone =
  String(formData.get("phone") || "").trim();

const email =
  String(formData.get("email") || "").trim();

const password =
  String(formData.get("password") || "");

const message = $("#signupMessage");
const button = form.querySelector("button[type='submit']");

if (!fullName || !phone || !email || !password) {
  showFormMessage(
    message,
    "Please complete all required fields.",
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
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        phone
      }
    }
  });

  if (error) throw error;

  if (data.session) {
    showToast(
      "Account created successfully.",
      "success"
    );

    modal.close();

    window.setTimeout(() => {
      window.location.href =
        CONFIG.routes?.dashboard || "dashboard.html";
    }, 400);
  } else {
    showFormMessage(
      message,
      "Account created. Check your email to confirm your account.",
      "success"
    );

    form.reset();
  }
} catch (error) {
  showFormMessage(
    message,
    friendlyAuthError(error),
    "error"
  );
} finally {
  setButtonLoading(button, false);
}
```

}

async function signIn(form) {
if (!supabase) {
showFormMessage(
$("#loginMessage"),
"Authentication is temporarily unavailable.",
"error"
);
return;
}

```
const formData = new FormData(form);

const email =
  String(formData.get("email") || "").trim();

const password =
  String(formData.get("password") || "");

const message = $("#loginMessage");
const button = form.querySelector("button[type='submit']");

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
  const { error } =
    await supabase.auth.signInWithPassword({
      email,
      password
    });

  if (error) throw error;

  showToast("Signed in successfully.", "success");

  modal.close();

  window.setTimeout(() => {
    window.location.href =
      CONFIG.routes?.dashboard || "dashboard.html";
  }, 300);

} catch (error) {
  showFormMessage(
    message,
    friendlyAuthError(error),
    "error"
  );
} finally {
  setButtonLoading(button, false);
}
```

}

async function signOut() {
if (!supabase) return;

```
try {
  const { error } =
    await supabase.auth.signOut();

  if (error) throw error;

  showToast("You have been signed out.", "success");

  window.setTimeout(() => {
    window.location.href =
      CONFIG.routes?.home || "index.html";
  }, 500);

} catch (error) {
  console.error(error);
  showToast(
    "Unable to sign out. Please try again.",
    "error"
  );
}
```

}

function friendlyAuthError(error) {
const message =
String(error?.message || "").toLowerCase();

```
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

if (message.includes("rate limit")) {
  return "Too many attempts. Please wait and try again.";
}

return error?.message ||
  "Something went wrong. Please try again.";
```

}

/* ----------------------------------------------------------
AUTH UI
---------------------------------------------------------- */

async function updateAuthUI() {
if (!supabase) return;

```
try {
  const { data } =
    await supabase.auth.getSession();

  const session = data?.session || null;

  $$("[data-auth='login']").forEach((element) => {
    element.style.display =
      session ? "none" : "";
  });

  $$("[data-auth='dashboard']").forEach((element) => {
    element.style.display =
      session ? "" : "none";
  });

  $$("[data-auth='logout']").forEach((element) => {
    element.style.display =
      session ? "" : "none";
  });

  $$("[data-auth='guest']").forEach((element) => {
    element.style.display =
      session ? "none" : "";
  });

} catch (error) {
  console.error(
    "MEI One: Unable to read authentication state.",
    error
  );
}
```

}

function initAuthListener() {
if (!supabase) return;

```
supabase.auth.onAuthStateChange(() => {
  updateAuthUI();
});
```

}

/* ----------------------------------------------------------
SERVICE NAVIGATION
---------------------------------------------------------- */

function handleService(serviceName) {
const service = getService(serviceName);

```
if (!service || !service.route) {
  showToast(
    "This service is not currently available.",
    "error"
  );
  return;
}

if (service.external) {
  window.location.href = service.route;
  return;
}

window.location.href = service.route;
```

}

function initServiceButtons() {
$$("[data-service]").forEach((element) => {
element.addEventListener("click", (event) => {
event.preventDefault();

```
    const service =
      element.dataset.service;

    handleService(service);
  });
});
```

}

/* ----------------------------------------------------------
SMOOTH SCROLL
---------------------------------------------------------- */

function initSmoothScrolling() {
$$('a[href^="#"]').forEach((link) => {
link.addEventListener("click", (event) => {
const targetId =
link.getAttribute("href");

```
    if (!targetId || targetId === "#") return;

    const target =
      document.querySelector(targetId);

    if (!target) return;

    event.preventDefault();

    target.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  });
});
```

}

/* ----------------------------------------------------------
CURRENT YEAR
---------------------------------------------------------- */

function updateCurrentYear() {
const year =
String(new Date().getFullYear());

```
$$("[data-current-year]").forEach((element) => {
  element.textContent = year;
});

const currentYear = $("#currentYear");

if (currentYear) {
  currentYear.textContent = year;
}
```

}

/* ----------------------------------------------------------
GLOBAL DASHBOARD LINKS
---------------------------------------------------------- */

function initDashboardLinks() {
$$("[data-dashboard]").forEach((element) => {
element.addEventListener("click", () => {
window.location.href =
CONFIG.routes?.dashboard ||
"dashboard.html";
});
});
}

/* ----------------------------------------------------------
FORM SUBMISSIONS
---------------------------------------------------------- */

async function submitEmergency(form) {
const formData = new FormData(form);

```
const data = {
  id: `EMG-${Date.now()}`,
  name: String(formData.get("name") || "").trim(),
  phone: String(formData.get("phone") || "").trim(),
  service: String(formData.get("service") || "").trim(),
  location: String(formData.get("location") || "").trim(),
  message: String(formData.get("message") || "").trim(),
  created_at: new Date().toISOString()
};

const message = $("#emergencyMessage");
const button = form.querySelector("button[type='submit']");

if (
  !data.name ||
  !data.phone ||
  !data.service ||
  !data.location ||
  !data.message
) {
  showFormMessage(
    message,
    "Please complete all required fields.",
    "error"
  );
  return;
}

setButtonLoading(
  button,
  true,
  "Submitting request..."
);

try {
  /*
   * No database table is assumed here.
   * Store temporarily in the browser until a dedicated
   * Supabase emergency_requests table is created.
   */

  const existing =
    JSON.parse(
      localStorage.getItem("mei_emergency_requests") ||
      "[]"
    );

  existing.push(data);

  localStorage.setItem(
    "mei_emergency_requests",
    JSON.stringify(existing)
  );

  showFormMessage(
    message,
    "Your emergency request has been recorded. Please remain reachable on the phone number provided.",
    "success"
  );

  form.reset();

  showToast(
    "Emergency request submitted.",
    "success"
  );

} catch (error) {
  console.error(error);

  showFormMessage(
    message,
    "Unable to submit the request. Please try again.",
    "error"
  );
} finally {
  setButtonLoading(button, false);
}
```

}

async function submitPartner(form) {
const formData = new FormData(form);

```
const data = {
  id: `PARTNER-${Date.now()}`,
  business_name:
    String(
      formData.get("business_name") || ""
    ).trim(),

  contact_name:
    String(
      formData.get("contact_name") || ""
    ).trim(),

  phone:
    String(
      formData.get("phone") || ""
    ).trim(),

  email:
    String(
      formData.get("email") || ""
    ).trim(),

  partnership_type:
    String(
      formData.get("partnership_type") || ""
    ).trim(),

  message:
    String(
      formData.get("message") || ""
    ).trim(),

  created_at:
    new Date().toISOString()
};

const message = $("#partnerMessage");
const button =
  form.querySelector("button[type='submit']");

if (
  !data.business_name ||
  !data.contact_name ||
  !data.phone ||
  !data.email ||
  !data.partnership_type ||
  !data.message
) {
  showFormMessage(
    message,
    "Please complete all required fields.",
    "error"
  );
  return;
}

setButtonLoading(
  button,
  true,
  "Submitting..."
);

try {
  /*
   * No database table is assumed here.
   * Store temporarily in the browser until a dedicated
   * Supabase partner_requests table is created.
   */

  const existing =
    JSON.parse(
      localStorage.getItem("mei_partner_requests") ||
      "[]"
    );

  existing.push(data);

  localStorage.setItem(
    "mei_partner_requests",
    JSON.stringify(existing)
  );

  showFormMessage(
    message,
    "Thank you. Your partnership enquiry has been submitted.",
    "success"
  );

  form.reset();

  showToast(
    "Partnership enquiry submitted.",
    "success"
  );

} catch (error) {
  console.error(error);

  showFormMessage(
    message,
    "Unable to submit the enquiry. Please try again.",
    "error"
  );
} finally {
  setButtonLoading(button, false);
}
```

}

/* ----------------------------------------------------------
MODAL FORM BINDING
---------------------------------------------------------- */

function bindModalSwitches() {
$$("[data-switch-modal]").forEach((button) => {
button.addEventListener("click", () => {
const target =
button.dataset.switchModal;

```
    modal.open(target);
  });
});
```

}

function bindForms(type) {
bindModalSwitches();

```
if (type === "signup") {
  const form = $("#signupForm");

  if (form) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      signUp(form);
    });
  }
}

if (type === "login") {
  const form = $("#loginForm");

  if (form) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      signIn(form);
    });
  }
}

if (type === "emergency") {
  const form = $("#emergencyForm");

  if (form) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      submitEmergency(form);
    });
  }
}

if (type === "partner") {
  const form = $("#partnerForm");

  if (form) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      submitPartner(form);
    });
  }
}
```

}

modal.bindForm = bindForms;

/* ----------------------------------------------------------
DATA-MODAL BUTTONS
---------------------------------------------------------- */

function initModalButtons() {
$$("[data-modal]").forEach((button) => {
button.addEventListener("click", () => {
const type = button.dataset.modal;

```
    modal.open(type);
  });
});
```

}

/* ----------------------------------------------------------
LOGOUT BUTTONS
---------------------------------------------------------- */

function initLogoutButtons() {
$$("[data-auth='logout']").forEach((button) => {
button.addEventListener("click", (event) => {
event.preventDefault();
signOut();
});
});
}

/* ----------------------------------------------------------
GLOBAL API
---------------------------------------------------------- */

window.MEI = {
config: CONFIG,
supabase,

```
openModal(type) {
  modal.open(type);
},

closeModal() {
  modal.close();
},

showToast,

handleService,

signIn,

signUp,

signOut
```

};

/* ----------------------------------------------------------
INITIALIZATION
---------------------------------------------------------- */

function init() {
initMobileNavigation();

```
modal.init();

initModalButtons();

initModalButtons();

initServiceButtons();

initSmoothScrolling();

initDashboardLinks();

initLogoutButtons();

updateCurrentYear();

updateAuthUI();

initAuthListener();

bindModalSwitches();

console.log(
  "MEI One initialized successfully."
);
```

}

if (document.readyState === "loading") {
document.addEventListener(
"DOMContentLoaded",
init
);
} else {
init();
}

})(window, document);
