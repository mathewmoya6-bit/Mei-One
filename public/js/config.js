/* ============================================================
   MEI ONE — GLOBAL CONFIGURATION
   public/js/config.js
   ============================================================ */

(function (window) {
  "use strict";

  const MEI_CONFIG = {
    appName: "MEI One",
    appShortName: "MEI",
    appVersion: "1.0.0",

    /* --------------------------------------------------------
       SUPABASE
       -------------------------------------------------------- */
    supabaseUrl: "https://tsvejnzxrxrrecgquxbq.supabase.co",

    supabaseKey:
      "sb_publishable_P8gaG4CyyHuiKJJbW3t6Dw_we4UODZ_",

    /* --------------------------------------------------------
       SITE
       -------------------------------------------------------- */
    siteName: "MEI One",

    siteDescription:
      "One platform for mobility, delivery, towing, roadside assistance, automotive, marketplace, home services and learning.",

    /* --------------------------------------------------------
       MAIN ROUTES
       -------------------------------------------------------- */
    routes: {
      home: "index.html",
      login: "login.html",
      dashboard: "dashboard.html"
    },

    /* --------------------------------------------------------
       SERVICES
       -------------------------------------------------------- */
    services: {
      rides: {
        name: "MEI Rides",
        shortName: "Rides",
        description: "Move with ease.",
        icon: "🚗",
        route: "rides.html"
      },

      delivery: {
        name: "MEI Delivery",
        shortName: "Delivery",
        description: "Send and receive.",
        icon: "📦",
        route: "delivery.html"
      },

      towing: {
        name: "MEI Towing",
        shortName: "Towing",
        description: "Vehicle recovery.",
        icon: "🚙",
        route: "towing.html"
      },

      roadside: {
        name: "MEI Roadside Assistance",
        shortName: "Roadside",
        description: "Help when needed.",
        icon: "🛠️",
        route: "roadside.html"
      },

      auto: {
        name: "MEI Auto",
        shortName: "Auto",
        description: "Automotive services.",
        icon: "🔧",
        route: "auto.html"
      },

      marketplace: {
        name: "MEI Marketplace",
        shortName: "Marketplace",
        description: "Shop and discover.",
        icon: "🛍️",
        route: "marketplace.html"
      },

      "home-services": {
        name: "MEI Home Services",
        shortName: "Home Services",
        description: "Services at home.",
        icon: "🏠",
        route: "home-services.html"
      },

      learn: {
        name: "MEI Learn",
        shortName: "Learn",
        description: "Learn and practise.",
        icon: "🎓",
        route: "https://www.meidriveafrica.com",
        external: true
      }
    },

    /* --------------------------------------------------------
       BRANDING
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
       PLATFORM FEATURES
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
       LOCATION / LOCALIZATION
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
       EMERGENCY
       -------------------------------------------------------- */
    emergency: {
      enabled: true,
      service: "MEI Emergency Assistance",
      country: "Kenya"
    },

    /* --------------------------------------------------------
       DEBUG
       -------------------------------------------------------- */
    debug: false
  };

  /* ----------------------------------------------------------
     GLOBAL CONFIG ALIASES
     ---------------------------------------------------------- */

  window.MEI_CONFIG = MEI_CONFIG;
  window.MEIConfig = MEI_CONFIG;
  window.CONFIG = MEI_CONFIG;

})(window);
