/* ============================================================
   MEI ONE — GLOBAL CONFIGURATION
   File: public/js/config.js
   ============================================================ */

(function (window) {
  "use strict";

  const MEI_CONFIG = {

    /* ==========================================================
       APPLICATION
       ========================================================== */

    appName: "MEI One",

    appShortName: "MEI",

    appVersion: "1.0.0",


    /* ==========================================================
       SUPABASE
       ========================================================== */

    supabaseUrl:
      "https://tsvejnzxrxrrecgquxbq.supabase.co",

    supabaseKey:
      "sb_publishable_P8gaG4CyyHuiKJJbW3t6Dw_we4UODZ_",


    /* ==========================================================
       WEBSITE
       ========================================================== */

    siteName: "MEI One",

    siteDescription:
      "One connected platform for mobility, delivery, towing, roadside assistance, automotive services, marketplace, home services and learning.",


    /* ==========================================================
       INTERNAL ROUTES
       ========================================================== */

    routes: {

      home:
        "index.html",

      login:
        "login.html",

      dashboard:
        "dashboard.html"

    },


    /* ==========================================================
       SERVICES
       ========================================================== */

    services: {

      rides: {
        name: "MEI Rides",
        type: "internal",
        route: "dashboard.html?service=rides"
      },


      delivery: {
        name: "MEI Delivery",
        type: "internal",
        route: "dashboard.html?service=delivery"
      },


      towing: {
        name: "MEI Towing",
        type: "internal",
        route: "dashboard.html?service=towing"
      },


      roadside: {
        name: "MEI Roadside Assistance",
        type: "internal",
        route: "dashboard.html?service=roadside"
      },


      auto: {
        name: "MEI Auto",
        type: "internal",
        route: "dashboard.html?service=auto"
      },


      marketplace: {
        name: "MEI Marketplace",
        type: "internal",
        route: "dashboard.html?service=marketplace"
      },


      "home-services": {
        name: "MEI Home Services",
        type: "internal",
        route: "dashboard.html?service=home-services"
      },


      /* ========================================================
         MEI LEARN
         External live platform
         ======================================================== */

      learn: {
        name: "MEI Learn",
        type: "external",
        route: "https://www.meidriveafrica.com",
        target: "_blank"
      }

    },


    /* ==========================================================
       BRANDING
       ========================================================== */

    branding: {

      primary:
        "#071A2F",

      secondary:
        "#0B2A4A",

      accent:
        "#00E676",

      accentDark:
        "#00B85C",

      white:
        "#FFFFFF",

      black:
        "#050A10"

    },


    /* ==========================================================
       FEATURES
       ========================================================== */

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


    /* ==========================================================
       PLATFORM SETTINGS
       ========================================================== */

    settings: {

      currency:
        "KES",

      currencySymbol:
        "KSh",

      country:
        "KE",

      countryName:
        "Kenya",

      timezone:
        "Africa/Nairobi",

      language:
        "en"

    },


    /* ==========================================================
       EXTERNAL PLATFORMS
       ========================================================== */

    externalPlatforms: {

      meiLearn:
        "https://www.meidriveafrica.com"

    },


    /* ==========================================================
       DEBUG
       ========================================================== */

    debug:
      false

  };


  /* ============================================================
     GLOBAL CONFIG ALIASES
     ============================================================ */

  window.MEI_CONFIG = MEI_CONFIG;

  window.MEIConfig = MEI_CONFIG;

  window.CONFIG = MEI_CONFIG;


})(window);
