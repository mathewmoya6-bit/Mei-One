/* ============================================================
   MEI ONE — MEI RIDES
   File: public/js/rides.js

   Purpose:
   - Handles the public MEI Rides "Request a Ride" button.
   - Uses the existing MEI One Supabase client.
   - Uses the existing global login modal from site.js.
   - Does NOT duplicate authentication logic.
   ============================================================ */

(function (window, document) {
  "use strict";

  /* ----------------------------------------------------------
     SUPABASE
  ---------------------------------------------------------- */

  const supabase = window.supabaseClient || null;

  /* ----------------------------------------------------------
     ROUTE
  ---------------------------------------------------------- */

  function goToRideDashboard() {
    window.location.href = "dashboard.html?service=rides";
  }

  /* ----------------------------------------------------------
     LOGIN
  ---------------------------------------------------------- */

  function openLogin() {
    if (
      window.MEI &&
      typeof window.MEI.openModal === "function"
    ) {
      window.MEI.openModal("login");
      return;
    }

    /*
     * Fallback if the global modal is unavailable.
     */
    window.location.href =
      "login.html?redirect=dashboard.html%3Fservice%3Drides";
  }

  /* ----------------------------------------------------------
     REQUEST RIDE
  ---------------------------------------------------------- */

  async function requestRide(event) {
    if (event) {
      event.preventDefault();
    }

    /*
     * Supabase client should already have been created by
     * public/js/supabase.js.
     */
    if (!supabase) {
      console.error(
        "MEI Rides: Supabase client is unavailable."
      );

      openLogin();
      return;
    }

    try {
      const { data, error } =
        await supabase.auth.getSession();

      if (error) {
        throw error;
      }

      /*
       * User is already authenticated.
       */
      if (data && data.session) {
        goToRideDashboard();
        return;
      }

      /*
       * User is not authenticated.
       */
      openLogin();

    } catch (error) {
      console.error(
        "MEI Rides: authentication check failed.",
        error
      );

      /*
       * If authentication cannot be determined,
       * send the user to the existing login flow.
       */
      openLogin();
    }
  }

  /* ----------------------------------------------------------
     INITIALIZE
  ---------------------------------------------------------- */

  function init() {
    /*
     * This ID must exist on rides.html:
     *
     * id="requestRideBtn"
     */
    const requestButton =
      document.getElementById("requestRideBtn");

    if (!requestButton) {
      return;
    }

    requestButton.addEventListener(
      "click",
      requestRide
    );
  }

  /* ----------------------------------------------------------
     DOM READY
  ---------------------------------------------------------- */

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      init
    );
  } else {
    init();
  }

})(window, document);
