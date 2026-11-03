
/* =========================================================
   MEI ONE — SUPABASE CONFIGURATION
   Shared configuration for customer and provider portals
   ========================================================= */

(function () {
  "use strict";

  const SUPABASE_URL =
    "https://tsvejnzxrxrrecgquxbq.supabase.co";

  const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_P8gaG4CyyHuiKJJbW3t6Dw_we4UODZ_";

  // Expose configuration globally.
  const config = Object.freeze({
    SUPABASE_URL,
    SUPABASE_ANON_KEY: SUPABASE_PUBLISHABLE_KEY,
    SUPABASE_PUBLISHABLE_KEY,
    supabaseUrl: SUPABASE_URL,
    supabaseKey: SUPABASE_PUBLISHABLE_KEY
  });

  window.MEI_CONFIG = config;
  window.MEIConfig = config;
  window.CONFIG = config;

  // Confirm that the Supabase CDN loaded.
  if (
    !window.supabase ||
    typeof window.supabase.createClient !== "function"
  ) {
    console.error(
      "MEI One: Supabase library failed to load."
    );
    return;
  }

  // Create one shared Supabase client.
  if (!window.MEI_SUPABASE) {
    window.MEI_SUPABASE =
      window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_PUBLISHABLE_KEY,
        {
          auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true
          }
        }
      );
  }

  // Shared client aliases.
  window.supabaseClient = window.MEI_SUPABASE;

  console.info(
    "MEI One: Supabase configuration loaded successfully."
  );
})();
