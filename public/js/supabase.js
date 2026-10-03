/* ============================================================
   MEI ONE
   SUPABASE CLIENT
   ============================================================ */

(() => {
  "use strict";


  /* ============================================================
     SUPABASE LIBRARY CHECK
     ============================================================ */

  if (!window.supabase) {
    console.error(
      "MEI One: Supabase JavaScript library was not loaded."
    );

    window.MEISupabaseError =
      "Supabase JavaScript library was not loaded.";

    return;
  }


  /* ============================================================
     CONFIGURATION
     ============================================================ */

  const DEFAULT_SUPABASE_URL =
    "https://tsvejnzxrxrrecgquxbq.supabase.co";

  const DEFAULT_SUPABASE_KEY =
    "sb_publishable_P8gaG4CyyHuiKJJbW3t6Dw_we4UODZ_";


  /*
   * config.js is loaded before this file.
   *
   * We support several common configuration names so
   * the application does not break if config.js exposes
   * the credentials differently.
   */

  const config =
    window.MEI_CONFIG ||
    window.MEIConfig ||
    window.CONFIG ||
    {};


  const SUPABASE_URL =
    config.supabaseUrl ||
    config.SUPABASE_URL ||
    config.url ||
    DEFAULT_SUPABASE_URL;


  const SUPABASE_KEY =
    config.supabaseKey ||
    config.SUPABASE_KEY ||
    config.publishableKey ||
    config.anonKey ||
    config.SUPABASE_ANON_KEY ||
    DEFAULT_SUPABASE_KEY;


  /* ============================================================
     VALIDATION
     ============================================================ */

  if (!SUPABASE_URL) {
    console.error(
      "MEI One: Supabase URL is missing."
    );

    window.MEISupabaseError =
      "Supabase URL is missing.";

    return;
  }


  if (!SUPABASE_KEY) {
    console.error(
      "MEI One: Supabase publishable key is missing."
    );

    window.MEISupabaseError =
      "Supabase publishable key is missing.";

    return;
  }


  /* ============================================================
     REUSE EXISTING CLIENT
     ============================================================ */

  if (window.supabaseClient) {
    console.log(
      "MEI One: Existing Supabase client reused."
    );

    window.MEISupabase =
      window.supabaseClient;

    return;
  }


  /* ============================================================
     CREATE SUPABASE CLIENT
     ============================================================ */

  try {

    const client =
      window.supabase.createClient(
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


    /* ==========================================================
       GLOBAL REFERENCES
       ========================================================== */

    window.supabaseClient = client;

    window.MEISupabase = client;


    window.MEIConfig = {
      ...(window.MEIConfig || {}),
      supabaseUrl: SUPABASE_URL,
      appName: "MEI One",
      version: "1.0.0"
    };


    console.log(
      "MEI One: Supabase initialized successfully."
    );


  } catch (error) {

    console.error(
      "MEI One: Failed to initialize Supabase.",
      error
    );

    window.MEISupabaseError =
      error?.message ||
      "Failed to initialize Supabase.";
  }

})();
