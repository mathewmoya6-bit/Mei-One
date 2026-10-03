```javascript
/* ============================================================
   MEI ONE — DASHBOARD LOGIC
   Frontend-first architecture
   ============================================================ */

(function () {
  "use strict";

  /* ==========================================================
     CLIENT
     ========================================================== */

  const SUPABASE =
    window.supabaseClient ||
    window.MEISupabase ||
    null;

  const CONFIG =
    window.MEI_CONFIG ||
    window.MEIConfig ||
    window.CONFIG ||
    {};


  /* ==========================================================
     DOM
     ========================================================== */

  const $ = (selector) =>
    document.querySelector(selector);

  const $$ = (selector) =>
    document.querySelectorAll(selector);


  const loading =
    $("#dashboardLoading");

  const sidebar =
    $("#dashboardSidebar");

  const overlay =
    $("#dashboardOverlay");

  const mobileMenu =
    $("#dashboardMobileMenu");

  const logoutButton =
    $("#logoutButton");

  const welcomeName =
    $("#welcomeName");

  const accountName =
    $("#accountName");

  const accountEmail =
    $("#accountEmail");

  const sidebarUserName =
    $("#sidebarUserName");

  const sidebarUserEmail =
    $("#sidebarUserEmail");

  const sidebarAvatar =
    $("#sidebarAvatar");

  const activityLoading =
    $("#activityLoading");

  const activityEmpty =
    $("#activityEmpty");

  const activityError =
    $("#activityError");

  const activityList =
    $("#activityList");

  const retryActivityButton =
    $("#retryActivityButton");

  const viewHistoryButton =
    $("#viewHistoryButton");


  /* ==========================================================
     HELPERS
     ========================================================== */

  function hideLoading() {

    if (loading) {
      loading.classList.add("hidden");
    }

  }


  function showLoading() {

    if (loading) {
      loading.classList.remove("hidden");
    }

  }


  function getFirstName(name) {

    if (!name) {
      return "User";
    }

    return (
      name
        .trim()
        .split(/\s+/)[0] ||
      "User"
    );

  }


  function getInitials(name, email) {

    if (name) {

      const parts =
        name
          .trim()
          .split(/\s+/)
          .filter(Boolean);

      if (parts.length >= 2) {

        return (
          parts[0][0] +
          parts[parts.length - 1][0]
        ).toUpperCase();

      }

      if (parts.length === 1) {
        return parts[0][0].toUpperCase();
      }

    }

    if (email) {
      return email[0].toUpperCase();
    }

    return "M";

  }


  function showToast(
    message,
    type = "info"
  ) {

    if (
      window.MEI &&
      typeof window.MEI.showToast ===
        "function"
    ) {

      window.MEI.showToast(
        message,
        type
      );

      return;
    }

    console.log(
      `[MEI ${type}] ${message}`
    );

  }


  /* ==========================================================
     MOBILE SIDEBAR
     ========================================================== */

  function openSidebar() {

    if (!sidebar) return;

    sidebar.classList.add("open");

    if (overlay) {
      overlay.classList.add("open");
    }

    if (mobileMenu) {

      mobileMenu.setAttribute(
        "aria-expanded",
        "true"
      );

    }

  }


  function closeSidebar() {

    if (!sidebar) return;

    sidebar.classList.remove("open");

    if (overlay) {
      overlay.classList.remove("open");
    }

    if (mobileMenu) {

      mobileMenu.setAttribute(
        "aria-expanded",
        "false"
      );

    }

  }


  if (mobileMenu) {

    mobileMenu.addEventListener(
      "click",
      function () {

        if (
          sidebar &&
          sidebar.classList.contains("open")
        ) {

          closeSidebar();

        } else {

          openSidebar();

        }

      }
    );

  }


  if (overlay) {
    overlay.addEventListener(
      "click",
      closeSidebar
    );
  }


  /* ==========================================================
     SERVICE ROUTING
     ========================================================== */

  function openService(service) {

    if (!service) return;


    if (
      CONFIG.services &&
      CONFIG.services[service] &&
      CONFIG.services[service].route
    ) {

      window.location.href =
        CONFIG.services[service].route;

      return;

    }


    /*
     * Frontend-first fallback.
     *
     * Until each service page exists,
     * keep the user on the dashboard and
     * expose the selected service through URL.
     */

    window.location.href =
      "dashboard.html?service=" +
      encodeURIComponent(service);

  }


  $$("[data-service]")
    .forEach(function (element) {

      element.addEventListener(
        "click",
        function () {

          const service =
            element.getAttribute(
              "data-service"
            );

          closeSidebar();

          openService(service);

        }
      );

    });


  /* ==========================================================
     PROFILE
     ========================================================== */

  function openProfile() {

    if (
      window.MEI &&
      typeof window.MEI.openModal ===
        "function"
    ) {

      window.MEI.openModal(
        "profile"
      );

      return;

    }

    showToast(
      "Profile management will be available here.",
      "info"
    );

  }


  const profileButton =
    $("#profileButton");

  const accountProfileLink =
    $("#accountProfileLink");


  if (profileButton) {

    profileButton.addEventListener(
      "click",
      openProfile
    );

  }


  if (accountProfileLink) {

    accountProfileLink.addEventListener(
      "click",
      openProfile
    );

  }


  /* ==========================================================
     SETTINGS
     ========================================================== */

  const settingsButton =
    $("#settingsButton");


  if (settingsButton) {

    settingsButton.addEventListener(
      "click",
      function () {

        showToast(
          "Account settings will be available here.",
          "info"
        );

      }
    );

  }


  /* ==========================================================
     NOTIFICATIONS
     ========================================================== */

  const notificationButton =
    $("#notificationButton");


  if (notificationButton) {

    notificationButton.addEventListener(
      "click",
      function () {

        showToast(
          "You have no new notifications.",
          "info"
        );

      }
    );

  }


  /* ==========================================================
     HELP
     ========================================================== */

  const helpButton =
    $("#helpButton");


  if (helpButton) {

    helpButton.addEventListener(
      "click",
      function () {

        showToast(
          "MEI One Help Center is coming soon.",
          "info"
        );

      }
    );

  }


  /* ==========================================================
     EMERGENCY
     ========================================================== */

  const emergencyButton =
    $("#emergencyButton");


  if (emergencyButton) {

    emergencyButton.addEventListener(
      "click",
      function () {

        if (
          window.MEI &&
          typeof window.MEI.openModal ===
            "function"
        ) {

          window.MEI.openModal(
            "emergency"
          );

          return;

        }

        showToast(
          "Emergency request is being prepared.",
          "info"
        );

      }
    );

  }


  /* ==========================================================
     USER INTERFACE
     ========================================================== */

  function updateUserInterface(user) {

    if (!user) return;


    const metadata =
      user.user_metadata || {};


    const fullName =
      metadata.full_name ||
      metadata.name ||
      metadata.display_name ||
      "";


    const email =
      user.email || "";


    const displayName =
      fullName ||
      email ||
      "MEI User";


    const firstName =
      getFirstName(displayName);


    if (welcomeName) {

      welcomeName.textContent =
        firstName;

    }


    if (accountName) {

      accountName.textContent =
        displayName;

    }


    if (accountEmail) {

      accountEmail.textContent =
        email || "—";

    }


    if (sidebarUserName) {

      sidebarUserName.textContent =
        displayName;

    }


    if (sidebarUserEmail) {

      sidebarUserEmail.textContent =
        email ||
        "MEI Account";

    }


    if (sidebarAvatar) {

      sidebarAvatar.textContent =
        getInitials(
          fullName,
          email
        );

    }

  }


  /* ==========================================================
     ACTIVITY DATA LAYER
     ========================================================== */

  /*
   * IMPORTANT:
   *
   * No production database tables exist yet.
   *
   * Therefore this function deliberately returns
   * an empty array instead of inventing table names.
   *
   * Later we can replace ONLY this function with
   * Supabase queries.
   */

  async function getActivityHistory() {

    /*
     * Future:
     *
     * const { data, error } =
     *   await SUPABASE
     *     .from("...")
     *     .select("...")
     *     .eq("user_id", user.id);
     *
     * Do not add database assumptions here yet.
     */

    return [];

  }


  /* ==========================================================
     ACTIVITY UI
     ========================================================== */

  function showActivityState(
    state
  ) {

    if (activityLoading) {
      activityLoading.hidden =
        state !== "loading";
    }

    if (activityEmpty) {
      activityEmpty.hidden =
        state !== "empty";
    }

    if (activityError) {
      activityError.hidden =
        state !== "error";
    }

    if (activityList) {
      activityList.hidden =
        state !== "list";
    }

  }


  function escapeHTML(value) {

    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

  }


  function renderActivity(
    activities
  ) {

    if (!activityList) return;


    activityList.innerHTML = "";


    if (
      !Array.isArray(activities) ||
      activities.length === 0
    ) {

      showActivityState("empty");

      return;

    }


    activities
      .slice(0, 10)
      .forEach(function (activity) {

        const item =
          document.createElement("div");

        item.className =
          "activity-item";


        item.innerHTML = `
          <div class="activity-icon">
            ${escapeHTML(activity.icon || "•")}
          </div>

          <div class="activity-info">

            <div class="activity-title">
              ${escapeHTML(
                activity.title ||
                "MEI One Activity"
              )}
            </div>

            <div class="activity-description">
              ${escapeHTML(
                activity.description ||
                ""
              )}
            </div>

          </div>

          <div class="activity-meta">
            ${escapeHTML(
              activity.status ||
              ""
            )}
          </div>
        `;


        activityList.appendChild(item);

      });


    showActivityState("list");

  }


  async function loadActivity() {

    showActivityState("loading");


    try {

      const activities =
        await getActivityHistory();


      renderActivity(
        activities
      );


    } catch (error) {

      console.error(
        "MEI One activity error:",
        error
      );

      showActivityState(
        "error"
      );

    }

  }


  if (retryActivityButton) {

    retryActivityButton.addEventListener(
      "click",
      loadActivity
    );

  }


  if (viewHistoryButton) {

    viewHistoryButton.addEventListener(
      "click",
      function () {

        const historyRoute =
          CONFIG.routes &&
          CONFIG.routes.history
            ? CONFIG.routes.history
            : "history.html";


        window.location.href =
          historyRoute;

      }
    );

  }


  /* ==========================================================
     LOGOUT
     ========================================================== */

  if (logoutButton) {

    logoutButton.addEventListener(
      "click",
      async function () {

        logoutButton.disabled =
          true;


        try {

          if (SUPABASE) {

            const {
              error
            } =
              await SUPABASE.auth.signOut();


            if (error) {
              throw error;
            }

          }


          const loginRoute =
            CONFIG.routes &&
            CONFIG.routes.login
              ? CONFIG.routes.login
              : "login.html";


          window.location.href =
            loginRoute;


        } catch (error) {

          console.error(
            "MEI One logout error:",
            error
          );


          logoutButton.disabled =
            false;


          showToast(
            "Unable to sign out. Please try again.",
            "error"
          );

        }

      }
    );

  }


  /* ==========================================================
     URL SERVICE PARAMETER
     ========================================================== */

  function processServiceParameter() {

    const params =
      new URLSearchParams(
        window.location.search
      );


    const service =
      params.get("service");


    if (!service) return;


    const validServices = [
      "rides",
      "delivery",
      "towing",
      "roadside",
      "auto",
      "marketplace",
      "home-services",
      "learn"
    ];


    if (
      !validServices.includes(
        service
      )
    ) {

      return;

    }


    $$
      (
        ".dashboard-service-card"
      )
      .forEach(function (card) {

        if (
          card.getAttribute(
            "data-service"
          ) === service
        ) {

          card.style.borderColor =
            "rgba(0,184,92,.55)";

          card.style.boxShadow =
            "0 0 0 3px rgba(0,230,118,.08)";

        }

      });


    $$
      (
        ".dashboard-nav-link"
      )
      .forEach(function (link) {

        if (
          link.getAttribute(
            "data-service"
          ) === service
        ) {

          link.classList.add(
            "active"
          );

        }

      });

  }


  /* ==========================================================
     AUTHENTICATION
     ========================================================== */

  async function initialiseDashboard() {

    showLoading();


    if (!SUPABASE) {

      console.error(
        "MEI One: Supabase client unavailable."
      );


      window.location.href =
        (
          CONFIG.routes &&
          CONFIG.routes.login
        )
          ? CONFIG.routes.login
          : "login.html";


      return;

    }


    try {

      const {
        data,
        error
      } =
        await SUPABASE.auth.getSession();


      if (error) {
        throw error;
      }


      const session =
        data &&
        data.session;


      if (
        !session ||
        !session.user
      ) {

        window.location.href =
          (
            CONFIG.routes &&
            CONFIG.routes.login
          )
            ? CONFIG.routes.login
            : "login.html";


        return;

      }


      updateUserInterface(
        session.user
      );


      hideLoading();


      /*
       * Activity is deliberately loaded
       * separately from authentication.
       */

      await loadActivity();


      SUPABASE.auth.onAuthStateChange(
        function (
          event,
          newSession
        ) {

          if (
            event ===
            "SIGNED_OUT"
          ) {

            window.location.href =
              (
                CONFIG.routes &&
                CONFIG.routes.login
              )
                ? CONFIG.routes.login
                : "login.html";


            return;

          }


          if (
            newSession &&
            newSession.user
          ) {

            updateUserInterface(
              newSession.user
            );

          }

        }
      );


    } catch (error) {

      console.error(
        "MEI One dashboard authentication error:",
        error
      );


      window.location.href =
        (
          CONFIG.routes &&
          CONFIG.routes.login
        )
          ? CONFIG.routes.login
          : "login.html";

    }

  }


  /* ==========================================================
     KEYBOARD
     ========================================================== */

  document.addEventListener(
    "keydown",
    function (event) {

      if (
        event.key === "Escape"
      ) {

        closeSidebar();

      }

    }
  );


  /* ==========================================================
     START
     ========================================================== */

  processServiceParameter();

  initialiseDashboard();

})();
```
