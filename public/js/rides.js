/* ============================================================
   MEI ONE — MEI RIDES (public page)
   File: public/js/rides.js

   - Handles the "Request a Ride" button on rides.html.
   - Signed in  -> dashboard ride form.
   - Signed out -> global login modal (site.js), and the ride
     destination is remembered so sign-in lands on the ride form
     instead of the dashboard overview.
   - Does NOT duplicate authentication logic.
   ============================================================ */

(function (window, document) {
  "use strict";

  const supabase = window.supabaseClient || null;

  const RIDE_DESTINATION = "dashboard.html?service=rides";
  const AFTER_LOGIN_KEY = "mei_after_login"; // read by site.js after sign-in / sign-up

  function goToRideDashboard() {
    window.location.href = RIDE_DESTINATION;
  }

  function rememberDestination() {
    try {
      sessionStorage.setItem(AFTER_LOGIN_KEY, RIDE_DESTINATION);
    } catch (_) {
      /* storage unavailable: sign-in will land on the default dashboard view */
    }
  }

  function openLogin() {
    rememberDestination();

    if (window.MEI && typeof window.MEI.openModal === "function") {
      window.MEI.openModal("login");
      return;
    }

    // Fallback if the global modal is unavailable.
    window.location.href = "login.html?redirect=" + encodeURIComponent(RIDE_DESTINATION);
  }

  async function requestRide(event) {
    if (event) event.preventDefault();

    if (!supabase) {
      console.error("MEI Rides: Supabase client is unavailable.");
      openLogin();
      return;
    }

    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;

      if (data && data.session) {
        goToRideDashboard();
        return;
      }

      openLogin();
    } catch (error) {
      console.error("MEI Rides: authentication check failed.", error);
      openLogin();
    }
  }

  function init() {
    const requestButton = document.getElementById("requestRideBtn");
    if (!requestButton) return;

    requestButton.addEventListener("click", requestRide);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})(window, document);
