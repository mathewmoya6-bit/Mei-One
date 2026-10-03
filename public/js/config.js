/* ============================================================
   MEI ONE — GLOBAL CONFIGURATION
   File: public/js/config.js
   ============================================================ */

(function (window) {
  "use strict";

  const MEI_CONFIG = {
    /* --------------------------------------------------------
       APPLICATION
       -------------------------------------------------------- */
    appName: "MEI One",
    appShortName: "MEI",
    appVersion: "1.0.0",

    /* --------------------------------------------------------
       SUPABASE
       -------------------------------------------------------- */
    supabaseUrl: "https://tsvejnzxrxrrecgquxbq.supabase.co",

    // Frontend publishable key only.
    // NEVER place a Supabase service_role/secret key here.
    supabaseKey:
      "sb_publishable_P8gaG4CyyHuiKJJbW3t6Dw_we4UODZ_",

    /* --------------------------------------------------------
       WEBSITE
       -------------------------------------------------------- */
    siteName: "MEI One",
    siteDescription:
      "One platform for mobility, delivery, towing, roadside assistance, automotive, marketplace, home services and learning.",

    /* --------------------------------------------------------
       ROUTES
       -------------------------------------------------------- */
    routes: {
      home: "index.html",
      login: "login.html",
      dashboard: "dashboard.html"
    },

    /* --------------------------------------------------------
       SERVICE ROUTES
       -------------------------------------------------------- */
    services: {
      rides: {
        name: "MEI Rides",
        route: "dashboard.html?service=rides"
      },

      delivery: {
        name: "MEI Delivery",
        route: "dashboard.html?service=delivery"
      },

      towing: {
        name: "MEI Towing",
        route: "dashboard.html?service=towing"
      },

      roadside: {
        name: "MEI Roadside Assistance",
        route: "dashboard.html?service=roadside"
      },

      auto: {
        name: "MEI Auto",
        route: "dashboard.html?service=auto"
      },

      marketplace: {
        name: "MEI Marketplace",
        route: "dashboard.html?service=marketplace"
      },

      "home-services": {
        name: "MEI Home Services",
        route: "dashboard.html?service=home-services"
      },

      learn: {
        name: "MEI Learn",
        route: "dashboard.html?service=learn"
      }
    },

    /* --------------------------------------------------------
       BRAND
       -------------------------------------------------------- */
    branding: {
      primary: "#071A2F",
      secondary: "#0B2A4A",
      accent: "#00E676",
      accentDark: "#00B85C",
      white: "#FFFFFF",
      black: "#050A10"
    },

    /* --------------------------------------------------------
       FEATURES
       -------------------------------------------------------- */
    features: {
      authentication: true,
      rides: true,
      delivery: true,
      towing: true,
      roadside: true,
      automotive: true,
      marketplace: true,
      homeServices: true,
      learning: true
    },

    /* --------------------------------------------------------
       APP SETTINGS
       -------------------------------------------------------- */
    settings: {
      currency: "KES",
      currencySymbol: "KSh",
      country: "KE",
      countryName: "Kenya",
      timezone: "Africa/Nairobi",
      language: "en"
    },

    /* --------------------------------------------------------
       DEBUG
       -------------------------------------------------------- */
    debug: false
  };

  /* ----------------------------------------------------------
     EXPOSE GLOBAL CONFIG
     ---------------------------------------------------------- */

  window.MEI_CONFIG = MEI_CONFIG;

  // Compatibility aliases for other scripts
  window.MEIConfig = MEI_CONFIG;
  window.CONFIG = MEI_CONFIG;

})(window);
