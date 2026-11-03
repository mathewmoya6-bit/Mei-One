/* ============================================================
   MEI ONE — GLOBAL CONFIGURATION
   public/js/config.js
   ============================================================ */

(function (window) {
  "use strict";

  const MEI_CONFIG = {
    appName: "MEI One",
    appShortName: "MEI",
    appVersion: "1.1.0",

    /* --------------------------------------------------------
       SUPABASE
       -------------------------------------------------------- */
    supabaseUrl: "https://tsvejnzxrxrrecgquxbq.supabase.co",

    supabaseKey:
      "sb_publishable_P8gaG4CyyHuiKJJbW3t6Dw_we4UODZ_",

    /* --------------------------------------------------------
       CLOUDFLARE TURNSTILE
       -------------------------------------------------------- */
    turnstileSiteKey: "0x4AAAAAAFxLazVm6RMFUblv",

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
      dashboard: "dashboard.html",
      providerDashboard: "provider-dashboard.html"
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
       PROVIDER TYPES
       Key = partners.type.
       serves   = service_requests.service values the role can see
       flow     = { currentStatus: [nextStatus, buttonLabel] }
       sections = dashboard sections the role gets
       -------------------------------------------------------- */
    providerTypes: {
      driver: {
        label: "Driver",
        serves: ["rides", "delivery"],
        job: "ride or delivery",
        jobs: "Trips",
        tagline: "Rides and deliveries near you.",
        offerSub: "Rides and deliveries waiting for a driver.",
        flow: {
          accepted: ["arrived", "I've arrived"],
          arrived: ["in_progress", "Start trip"],
          in_progress: ["completed", "Complete trip"]
        },
        sections: ["overview", "available", "jobs", "earnings", "profile"]
      },

      towing: {
        label: "Towing",
        serves: ["towing"],
        job: "tow",
        jobs: "Tow jobs",
        tagline: "Recovery requests from stranded customers.",
        offerSub: "Customers waiting for a tow truck.",
        flow: {
          accepted: ["en_route", "On my way"],
          en_route: ["arrived", "Arrived"],
          arrived: ["completed", "Mark complete"]
        },
        sections: ["overview", "available", "jobs", "earnings", "profile"]
      },

      roadside: {
        label: "Roadside",
        serves: ["roadside"],
        job: "call-out",
        jobs: "Call-outs",
        tagline: "Help drivers get moving again.",
        offerSub: "Roadside help requests near you.",
        flow: {
          accepted: ["en_route", "On my way"],
          en_route: ["completed", "Mark complete"]
        },
        sections: ["overview", "available", "jobs", "earnings", "profile"]
      },

      garage: {
        label: "Garage / Auto",
        serves: ["auto"],
        job: "service booking",
        jobs: "Bookings",
        tagline: "Servicing and repair bookings.",
        offerSub: "Customers asking for a service or repair.",
        flow: {
          accepted: ["in_progress", "Start service"],
          in_progress: ["completed", "Mark complete"]
        },
        sections: ["overview", "available", "jobs", "earnings", "profile"]
      },

      marketplace: {
        label: "Marketplace seller",
        serves: ["marketplace"],
        job: "order",
        jobs: "Orders",
        tagline: "Orders from customers shopping on MEI One.",
        offerSub: "New orders for your products.",
        flow: {
          accepted: ["packed", "Mark packed"],
          packed: ["shipped", "Mark shipped"],
          shipped: ["completed", "Delivered"]
        },
        sections: ["overview", "available", "jobs", "products", "earnings", "profile"]
      },

      home: {
        label: "Home services",
        serves: ["home-services"],
        job: "home job",
        jobs: "Home jobs",
        tagline: "Home service requests in your area.",
        offerSub: "Customers who need help at home.",
        flow: {
          accepted: ["en_route", "On my way"],
          en_route: ["in_progress", "Start job"],
          in_progress: ["completed", "Mark complete"]
        },
        sections: ["overview", "available", "jobs", "earnings", "profile"]
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
