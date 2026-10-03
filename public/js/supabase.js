/* ============================================================
   MEI ONE — SUPABASE CLIENT
   File: public/js/supabase.js
   ============================================================ */

(function (window) {
  "use strict";

  /* ----------------------------------------------------------
     DEPENDENCY CHECK
     ---------------------------------------------------------- */

  if (!window.supabase) {
    console.error(
      "MEI One: Supabase library was not loaded. " +
      "Check the Supabase CDN script in your HTML."
    );
    return;
  }

  /* ----------------------------------------------------------
     CONFIGURATION
     ---------------------------------------------------------- */

  const config =
    window.MEI_CONFIG ||
    window.MEIConfig ||
    window.CONFIG ||
    {};

  const SUPABASE_URL =
    config.supabaseUrl ||
    config.SUPABASE_URL ||
    config.url;

  const SUPABASE_KEY =
    config.supabaseKey ||
    config.SUPABASE_KEY ||
    config.publishableKey ||
    config.anonKey ||
    config.SUPABASE_ANON_KEY;

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error(
      "MEI One: Supabase configuration is missing."
    );
    return;
  }

  /* ----------------------------------------------------------
     REUSE EXISTING CLIENT
     ---------------------------------------------------------- */

  if (window.supabaseClient) {
    console.info("MEI One: Existing Supabase client detected.");
    return;
  }

  /* ----------------------------------------------------------
     CREATE CLIENT
     ---------------------------------------------------------- */

  try {
    window.supabaseClient = window.supabase.createClient(
      SUPABASE_URL,
      SUPABASE_KEY,
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
          flowType: "pkce"
        }
      }
    );

    /* --------------------------------------------------------
       GLOBAL ALIASES
       -------------------------------------------------------- */

    window.MEISupabase = window.supabaseClient;

    /* --------------------------------------------------------
       DEBUG
       -------------------------------------------------------- */

    if (config.debug === true) {
      console.log("==========================================");
      console.log("MEI One Supabase initialized");
      console.log("Project:", SUPABASE_URL);
      console.log("==========================================");
    }

  } catch (error) {
    console.error(
      "MEI One: Failed to initialize Supabase.",
      error
    );
  }

})(window);
