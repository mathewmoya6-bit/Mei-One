/* ============================================================
   MEI ONE — DASHBOARD
   File: public/js/dashboard.js

   Responsibilities:
   - Protect dashboard access
   - Load authenticated user/profile
   - Handle dashboard navigation
   - Handle ?service=rides
   - Display ride request form
   - Submit ride requests
   - Load ride requests
   - Load payments
   - Handle logout

   Depends on:
   - config.js
   - supabase.js
   - site.js
   ============================================================ */

(function (window, document) {
  "use strict";

  const supabase = window.supabaseClient || null;

  let currentSession = null;
  let currentUser = null;

  /* ==========================================================
     HELPERS
     ========================================================== */

  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function $$(selector, root) {
    return Array.from(
      (root || document).querySelectorAll(selector)
    );
  }

  function escapeHTML(value) {
    if (value === null || value === undefined) {
      return "";
    }

    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function showToast(message, type) {
    if (
      window.MEI &&
      typeof window.MEI.showToast === "function"
    ) {
      window.MEI.showToast(message, type || "info");
      return;
    }

    console.log(message);
  }

  function getServiceFromURL() {
    const params = new URLSearchParams(
      window.location.search
    );

    return params.get("service") || "";
  }

  /* ==========================================================
     AUTHENTICATION
     ========================================================== */

  async function requireSession() {
    if (!supabase) {
      console.error(
        "MEI One Dashboard: Supabase client unavailable."
      );

      window.location.href = "login.html";
      return false;
    }

    try {
      const { data, error } =
        await supabase.auth.getSession();

      if (error) {
        throw error;
      }

      if (!data || !data.session) {
        window.location.href = "login.html";
        return false;
      }

      currentSession = data.session;
      currentUser = data.session.user;

      return true;

    } catch (error) {
      console.error(
        "MEI One Dashboard: session check failed.",
        error
      );

      window.location.href = "login.html";
      return false;
    }
  }

  /* ==========================================================
     PROFILE
     ========================================================== */

  async function loadProfile() {
    if (!currentUser) {
      return null;
    }

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", currentUser.id)
        .maybeSingle();

      if (error) {
        console.warn(
          "MEI One Dashboard: profile could not be loaded.",
          error
        );

        return null;
      }

      if (data) {
        populateProfile(data);
      }

      return data;

    } catch (error) {
      console.warn(
        "MEI One Dashboard: profile error.",
        error
      );

      return null;
    }
  }

  function getUserName(profile) {
    if (!profile) {
      return (
        currentUser?.user_metadata?.full_name ||
        currentUser?.user_metadata?.name ||
        currentUser?.email?.split("@")[0] ||
        "Customer"
      );
    }

    return (
      profile.full_name ||
      profile.name ||
      [profile.first_name, profile.last_name]
        .filter(Boolean)
        .join(" ") ||
      currentUser?.user_metadata?.full_name ||
      currentUser?.email?.split("@")[0] ||
      "Customer"
    );
  }

  function populateProfile(profile) {
    const name = getUserName(profile);

    const nameElements = [
      "#userName",
      "#profileName",
      "[data-user-name]"
    ];

    nameElements.forEach(function (selector) {
      $$(selector).forEach(function (element) {
        element.textContent = name;
      });
    });

    const emailElements = [
      "#userEmail",
      "#profileEmail",
      "[data-user-email]"
    ];

    emailElements.forEach(function (selector) {
      $$(selector).forEach(function (element) {
        element.textContent =
          profile.email ||
          currentUser?.email ||
          "";
      });
    });

    const phoneElements = [
      "#profilePhone",
      "[data-user-phone]"
    ];

    phoneElements.forEach(function (selector) {
      $$(selector).forEach(function (element) {
        element.textContent =
          profile.phone ||
          profile.phone_number ||
          "";
      });
    });

    const welcome = $("#welcomeName");

    if (welcome) {
      welcome.textContent = name;
    }
  }

  /* ==========================================================
     DASHBOARD NAVIGATION
     ========================================================== */

  function showSection(sectionName) {
    const sections = $$(
      ".dashboard-section, [data-dashboard-section]"
    );

    sections.forEach(function (section) {
      const value =
        section.dataset.dashboardSection ||
        section.id ||
        "";

      const normalized = value
        .replace(/Section$/i, "")
        .toLowerCase();

      section.style.display =
        normalized === sectionName.toLowerCase()
          ? ""
          : "none";
    });

    const navItems = $$(
      "[data-section], [data-dashboard-nav]"
    );

    navItems.forEach(function (item) {
      const value =
        item.dataset.section ||
        item.dataset.dashboardNav ||
        "";

      item.classList.toggle(
        "active",
        value.toLowerCase() ===
          sectionName.toLowerCase()
      );
    });
  }

  function initNavigation() {
    $$("[data-section]").forEach(function (item) {
      item.addEventListener("click", function (event) {
        event.preventDefault();

        const section =
          item.dataset.section;

        if (!section) {
          return;
        }

        showSection(section);

        const sidebar =
          $(".dashboard-sidebar") ||
          $(".sidebar");

        if (sidebar) {
          sidebar.classList.remove("open");
        }
      });
    });
  }

  /* ==========================================================
     MOBILE SIDEBAR
     ========================================================== */

  function initMobileSidebar() {
    const toggle =
      $("#sidebarToggle") ||
      $(".sidebar-toggle") ||
      $("[data-sidebar-toggle]");

    const sidebar =
      $(".dashboard-sidebar") ||
      $(".sidebar");

    if (!toggle || !sidebar) {
      return;
    }

    toggle.addEventListener("click", function () {
      sidebar.classList.toggle("open");
    });
  }

  /* ==========================================================
     RIDES — UI
     ========================================================== */

  function createRideSection() {
    let section = $("#rideRequestSection");

    if (section) {
      return section;
    }

    section = document.createElement("section");

    section.id = "rideRequestSection";
    section.className =
      "dashboard-section content-card";
    section.dataset.dashboardSection = "rides";

    section.innerHTML = `
      <div class="section-header">
        <div>
          <h2>Request a Ride</h2>
          <p>
            Enter your pickup and destination to request
            a MEI Ride.
          </p>
        </div>
      </div>

      <form id="rideRequestForm" class="ride-request-form">

        <div class="form-grid">

          <div class="form-group">
            <label for="ridePickup">
              Pickup location
            </label>

            <input
              type="text"
              id="ridePickup"
              name="pickup_address"
              placeholder="Where should we pick you up?"
              autocomplete="street-address"
              required
            />
          </div>

          <div class="form-group">
            <label for="rideDestination">
              Destination
            </label>

            <input
              type="text"
              id="rideDestination"
              name="destination_address"
              placeholder="Where are you going?"
              autocomplete="street-address"
              required
            />
          </div>

          <div class="form-group">
            <label for="rideVehicle">
              Vehicle type
            </label>

            <select
              id="rideVehicle"
              name="vehicle_type"
            >
              <option value="economy">
                Economy
              </option>

              <option value="comfort">
                Comfort
              </option>

              <option value="xl">
                XL
              </option>
            </select>
          </div>

          <div class="form-group">
            <label for="rideNotes">
              Additional notes
            </label>

            <input
              type="text"
              id="rideNotes"
              name="notes"
              placeholder="Optional instructions"
            />
          </div>

        </div>

        <div class="form-actions">
          <button
            type="submit"
            class="btn btn-primary"
            id="submitRideRequest"
          >
            Request Ride
          </button>
        </div>

        <div
          id="rideRequestMessage"
          class="form-message"
          aria-live="polite"
        ></div>

      </form>

      <div class="ride-history">
        <div class="section-header">
          <div>
            <h3>My Ride Requests</h3>
          </div>
        </div>

        <div id="rideRequestsList">
          <p>Loading ride requests...</p>
        </div>
      </div>
    `;

    const main =
      $(".dashboard-main") ||
      $("main") ||
      document.body;

    main.appendChild(section);

    return section;
  }

  /* ==========================================================
     RIDES — FORM
     ========================================================== */

  function setRideMessage(message, type) {
    const element =
      $("#rideRequestMessage");

    if (!element) {
      return;
    }

    element.textContent = message || "";

    element.className =
      "form-message" +
      (type ? " " + type : "");
  }

  async function submitRideRequest(event) {
    event.preventDefault();

    if (!currentUser) {
      setRideMessage(
        "Your session has expired. Please sign in again.",
        "error"
      );

      return;
    }

    const form = event.currentTarget;

    const pickup =
      $("#ridePickup")?.value.trim();

    const destination =
      $("#rideDestination")?.value.trim();

    const vehicle =
      $("#rideVehicle")?.value || "economy";

    const notes =
      $("#rideNotes")?.value.trim();

    if (!pickup || !destination) {
      setRideMessage(
        "Please enter both pickup and destination.",
        "error"
      );

      return;
    }

    const button =
      $("#submitRideRequest");

    if (button) {
      button.disabled = true;
      button.textContent = "Submitting...";
    }

    setRideMessage(
      "Submitting your ride request...",
      "loading"
    );

    try {
      const payload = {
        user_id: currentUser.id,
        pickup_address: pickup,
        destination_address: destination,
        vehicle_type: vehicle,
        notes: notes || null,
        status: "pending"
      };

      const { data, error } =
        await supabase
          .from("ride_requests")
          .insert(payload)
          .select()
          .single();

      if (error) {
        throw error;
      }

      console.log(
        "MEI Ride request created:",
        data
      );

      form.reset();

      setRideMessage(
        "Your ride request has been submitted successfully.",
        "success"
      );

      showToast(
        "Ride request submitted successfully.",
        "success"
      );

      await loadRideRequests();

    } catch (error) {
      console.error(
        "MEI Rides: request submission failed.",
        error
      );

      setRideMessage(
        error?.message ||
          "Unable to submit your ride request. Please try again.",
        "error"
      );

      showToast(
        "Unable to submit ride request.",
        "error"
      );

    } finally {
      if (button) {
        button.disabled = false;
        button.textContent = "Request Ride";
      }
    }
  }

  /* ==========================================================
     RIDES — LOAD REQUESTS
     ========================================================== */

  async function loadRideRequests() {
    const list =
      $("#rideRequestsList");

    if (!list || !currentUser) {
      return;
    }

    list.innerHTML =
      "<p>Loading ride requests...</p>";

    try {
      const { data, error } =
        await supabase
          .from("ride_requests")
          .select("*")
          .eq("user_id", currentUser.id)
          .order("created_at", {
            ascending: false
          });

      if (error) {
        throw error;
      }

      renderRideRequests(data || []);

    } catch (error) {
      console.error(
        "MEI Rides: unable to load requests.",
        error
      );

      list.innerHTML = `
        <div class="empty-state">
          <p>
            Ride requests could not be loaded.
          </p>
        </div>
      `;
    }
  }

  function renderRideRequests(requests) {
    const list =
      $("#rideRequestsList");

    if (!list) {
      return;
    }

    if (!requests.length) {
      list.innerHTML = `
        <div class="empty-state">
          <p>
            You have not requested a ride yet.
          </p>
        </div>
      `;

      return;
    }

    list.innerHTML = requests
      .map(function (request) {
        const status =
          request.status || "pending";

        const created =
          request.created_at
            ? new Date(
                request.created_at
              ).toLocaleString()
            : "";

        return `
          <div class="request-card">

            <div class="request-card-header">
              <strong>
                MEI Ride
              </strong>

              <span class="status status-${escapeHTML(
                status.toLowerCase()
              )}">
                ${escapeHTML(status)}
              </span>
            </div>

            <div class="request-route">

              <div>
                <small>Pickup</small>
                <p>
                  ${escapeHTML(
                    request.pickup_address
                  )}
                </p>
              </div>

              <div>
                <small>Destination</small>
                <p>
                  ${escapeHTML(
                    request.destination_address
                  )}
                </p>
              </div>

            </div>

            <div class="request-meta">
              <span>
                ${escapeHTML(
                  request.vehicle_type ||
                    "Economy"
                )}
              </span>

              <span>
                ${escapeHTML(created)}
              </span>
            </div>

          </div>
        `;
      })
      .join("");
  }

  /* ==========================================================
     RIDES — INITIALIZE
     ========================================================== */

  function initRides() {
    const section =
      createRideSection();

    const form =
      $("#rideRequestForm", section);

    if (form) {
      form.addEventListener(
        "submit",
        submitRideRequest
      );
    }

    showSection("rides");

    loadRideRequests();
  }

  /* ==========================================================
     GENERAL REQUESTS
     ========================================================== */

  async function loadRequests() {
    const list =
      $("#requestsList");

    if (!list || !currentUser) {
      return;
    }

    try {
      const { data, error } =
        await supabase
          .from("ride_requests")
          .select("*")
          .eq("user_id", currentUser.id)
          .order("created_at", {
            ascending: false
          })
          .limit(10);

      if (error) {
        throw error;
      }

      renderGeneralRequests(
        data || []
      );

    } catch (error) {
      console.warn(
        "MEI One Dashboard: requests could not be loaded.",
        error
      );

      list.innerHTML = `
        <div class="empty-state">
          <p>No requests available.</p>
        </div>
      `;
    }
  }

  function renderGeneralRequests(requests) {
    const list =
      $("#requestsList");

    if (!list) {
      return;
    }

    if (!requests.length) {
      list.innerHTML = `
        <div class="empty-state">
          <p>
            You have no service requests yet.
          </p>
        </div>
      `;

      return;
    }

    list.innerHTML = requests
      .map(function (request) {
        const status =
          request.status || "pending";

        return `
          <div class="request-card">

            <div class="request-card-header">
              <strong>
                MEI Rides
              </strong>

              <span class="status">
                ${escapeHTML(status)}
              </span>
            </div>

            <p>
              ${escapeHTML(
                request.pickup_address || ""
              )}
              →
              ${escapeHTML(
                request.destination_address || ""
              )}
            </p>

          </div>
        `;
      })
      .join("");
  }

  /* ==========================================================
     PAYMENTS
     ========================================================== */

  async function loadPayments() {
    const list =
      $("#paymentsList");

    if (!list || !currentUser) {
      return;
    }

    try {
      const { data, error } =
        await supabase
          .from("payments")
          .select("*")
          .eq("user_id", currentUser.id)
          .order("created_at", {
            ascending: false
          })
          .limit(10);

      if (error) {
        throw error;
      }

      renderPayments(data || []);

    } catch (error) {
      console.warn(
        "MEI One Dashboard: payments could not be loaded.",
        error
      );

      list.innerHTML = `
        <div class="empty-state">
          <p>No payment records available.</p>
        </div>
      `;
    }
  }

  function renderPayments(payments) {
    const list =
      $("#paymentsList");

    if (!list) {
      return;
    }

    if (!payments.length) {
      list.innerHTML = `
        <div class="empty-state">
          <p>
            No payment records yet.
          </p>
        </div>
      `;

      return;
    }

    list.innerHTML = payments
      .map(function (payment) {
        const amount =
          payment.amount !== undefined &&
          payment.amount !== null
            ? `KSh ${Number(
                payment.amount
              ).toLocaleString()}`
            : "—";

        const status =
          payment.status || "pending";

        return `
          <div class="payment-card">

            <div>
              <strong>
                ${escapeHTML(amount)}
              </strong>

              <p>
                ${escapeHTML(status)}
              </p>
            </div>

          </div>
        `;
      })
      .join("");
  }

  /* ==========================================================
     LOGOUT
     ========================================================== */

  async function logout() {
    if (!supabase) {
      window.location.href =
        "login.html";

      return;
    }

    try {
      const { error } =
        await supabase.auth.signOut();

      if (error) {
        throw error;
      }

      window.location.href =
        "index.html";

    } catch (error) {
      console.error(
        "MEI One Dashboard: logout failed.",
        error
      );

      showToast(
        "Unable to log out. Please try again.",
        "error"
      );
    }
  }

  function initLogout() {
    const buttons = $$(
      "#logoutBtn, [data-dashboard-logout]"
    );

    buttons.forEach(function (button) {
      button.addEventListener(
        "click",
        function (event) {
          event.preventDefault();
          logout();
        }
      );
    });
  }

  /* ==========================================================
     DASHBOARD SERVICE QUERY
     ========================================================== */

  function handleServiceQuery() {
    const service =
      getServiceFromURL();

    if (!service) {
      return;
    }

    switch (service.toLowerCase()) {
      case "rides":
      case "ride":
        initRides();
        break;

      default:
        console.log(
          "MEI One: service not yet implemented:",
          service
        );
    }
  }

  /* ==========================================================
     INITIALIZE
     ========================================================== */

  async function init() {
    const authenticated =
      await requireSession();

    if (!authenticated) {
      return;
    }

    await loadProfile();

    initNavigation();
    initMobileSidebar();
    initLogout();

    await loadRequests();
    await loadPayments();

    handleServiceQuery();
  }

  /* ==========================================================
     DOM READY
     ========================================================== */

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      init
    );
  } else {
    init();
  }

  /* ==========================================================
     PUBLIC API
     ========================================================== */

  window.MEIDashboard = {
    loadRequests,
    loadPayments,
    loadRideRequests,
    logout
  };

})(window, document);
