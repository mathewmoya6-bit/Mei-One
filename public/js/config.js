
/* ============================================================
   MEI ONE — GLOBAL CONFIGURATION
   File: public/js/config.js
   Version: 1.3.0
   ============================================================ */

(function (window) {
  "use strict";

  // ----------------------------------------------------------
  // SUPABASE CONFIGURATION
  // ----------------------------------------------------------

  const SUPABASE_URL =
    "https://tsvejnzxrxrrecgquxbq.supabase.co";

  const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_P8gaG4CyyHuiKJJbW3t6Dw_we4UODZ_";

  // ----------------------------------------------------------
  // APPLICATION CONFIGURATION
  // ----------------------------------------------------------

  const MEI_CONFIG = {
    appName: "MEI One",
    appShortName: "MEI",
    appVersion: "1.3.0",

    supabaseUrl: SUPABASE_URL,
    supabaseKey: SUPABASE_PUBLISHABLE_KEY,
    supabasePublishableKey: SUPABASE_PUBLISHABLE_KEY,

    turnstileSiteKey: "0x4AAAAAAFxLazVm6RMFUblv",

    siteName: "MEI One",
    siteDescription:
      "One platform for mobility, delivery, towing, roadside assistance, automotive services, marketplace, home services and learning.",

    // ROUTES
    routes: {
      home: "/index.html",
      customerLogin: "/customer-signin.html",
      customerSignup: "/customer-signin.html?mode=signup",
      customerDashboard: "/customer/dashboard.html",
      providerLogin: "/provider-signin.html",
      providerRegister: "/provider/register.html",
      providerDashboard: "/provider/dashboard.html"
    },

    // SERVICES
    services: {
      rides: {
        name: "MEI Rides",
        shortName: "Rides",
        description: "Move with ease.",
        icon: "🚗",
        route: "/customer-signin.html?service=rides"
      },
      delivery: {
        name: "MEI Delivery",
        shortName: "Delivery",
        description: "Send and receive.",
        icon: "📦",
        route: "/customer-signin.html?service=delivery"
      },
      towing: {
        name: "MEI Towing",
        shortName: "Towing",
        description: "Vehicle recovery.",
        icon: "🚙",
        route: "/customer-signin.html?service=towing"
      },
      roadside: {
        name: "MEI Roadside Assistance",
        shortName: "Roadside",
        description: "Help when needed.",
        icon: "🛠️",
        route: "/customer-signin.html?service=roadside"
      },
      garage: {
        name: "MEI Garage Services",
        shortName: "Garage",
        description: "Vehicle servicing and repairs.",
        icon: "🔧",
        route: "/customer-signin.html?service=garage"
      },
      auto: {
        name: "MEI Auto",
        shortName: "Auto",
        description: "Automotive services.",
        icon: "🚘",
        route: "https://auto-d.meipressgroup.com/",
        external: true
      },
      "vehicle-valuation": {
        name: "Vehicle Valuation",
        shortName: "Valuation",
        description: "Vehicle inspection and valuation.",
        icon: "📊",
        route: "https://auto-d.meipressgroup.com/",
        external: true
      },
      marketplace: {
        name: "MEI Marketplace",
        shortName: "Marketplace",
        description: "Shop and discover.",
        icon: "🛍️",
        route: "/customer-signin.html?service=marketplace"
      },
      "home-services": {
        name: "MEI Home Services",
        shortName: "Home Services",
        description: "Services at home.",
        icon: "🏠",
        route: "/customer-signin.html?service=home-services"
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

    // PROVIDER DISPLAY TYPES
    // These are not database permissions.
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
        sections: [
          "overview", "available", "jobs", "earnings", "profile"
        ]
      },
      towing: {
        label: "Towing Provider",
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
        sections: [
          "overview", "available", "jobs", "earnings", "profile"
        ]
      },
      roadside: {
        label: "Roadside Assistance Provider",
        serves: ["roadside"],
        job: "call-out",
        jobs: "Call-outs",
        tagline: "Help drivers get moving again.",
        offerSub: "Roadside help requests near you.",
        flow: {
          accepted: ["en_route", "On my way"],
          en_route: ["completed", "Mark complete"]
        },
        sections: [
          "overview", "available", "jobs", "earnings", "profile"
        ]
      },
      garage: {
        label: "Garage / Auto Provider",
        serves: ["garage"],
        job: "service booking",
        jobs: "Bookings",
        tagline: "Servicing and repair bookings.",
        offerSub: "Customers asking for a service or repair.",
        flow: {
          accepted: ["in_progress", "Start service"],
          in_progress: ["completed", "Mark complete"]
        },
        sections: [
          "overview", "available", "jobs", "earnings", "profile"
        ]
      },
      marketplace: {
        label: "Marketplace Seller",
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
        sections: [
          "overview", "available", "jobs", "products", "earnings", "profile"
        ]
      },
      home: {
        label: "Home Services Provider",
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
        sections: [
          "overview", "available", "jobs", "earnings", "profile"
        ]
      }
    },

    // BRANDING
    branding: {
      primary: "#071A2F",
      secondary: "#0B2A4A",
      accent: "#C7F36B",
      accentDark: "#00B85C",
      white: "#FFFFFF",
      black: "#050A10"
    },

    // FEATURES
    features: {
      authentication: true,
      customerPortal: true,
      providerPortal: true,
      rides: true,
      delivery: true,
      towing: true,
      roadside: true,
      automotive: true,
      garage: true,
      marketplace: true,
      homeServices: true,
      learning: true
    },

    // LOCALIZATION
    settings: {
      currency: "KES",
      currencySymbol: "KSh",
      country: "KE",
      countryName: "Kenya",
      timezone: "Africa/Nairobi",
      language: "en"
    },

    emergency: {
      enabled: true,
      service: "MEI Emergency Assistance",
      country: "Kenya"
    },

    debug: true
  };

  // ----------------------------------------------------------
  // GLOBAL CONFIGURATION
  // ----------------------------------------------------------

  window.MEI_CONFIG = MEI_CONFIG;
  window.MEIConfig = MEI_CONFIG;
  window.CONFIG = MEI_CONFIG;

  // ----------------------------------------------------------
  // SUPABASE INITIALIZATION
  // ----------------------------------------------------------

  function initializeMEISupabase() {
    if (window.MEI_SUPABASE) {
      return window.MEI_SUPABASE;
    }

    if (
      !window.supabase ||
      typeof window.supabase.createClient !== "function"
    ) {
      console.error(
        "MEI One: Supabase JS v2 has not loaded. Check script order."
      );
      return null;
    }

    if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
      console.error("MEI One: Supabase configuration is incomplete.");
      return null;
    }

    try {
      const client = window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_PUBLISHABLE_KEY,
        {
          auth: {
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: true,
            storageKey: "mei-one-auth"
          }
        }
      );

      window.MEI_SUPABASE = client;
      window.supabaseClient = client;

      console.info("MEI One: Supabase client initialized.");

      return client;

    } catch (error) {
      console.error("MEI One: Supabase initialization failed.", error);
      return null;
    }
  }

  window.initializeMEISupabase = initializeMEISupabase;

  initializeMEISupabase();

})(window);
