/* =========================================================
   MEI ONE — SUPABASE CONFIGURATION
   Shared configuration for customer and provider portals.
   Must be loaded BEFORE any page script that uses Supabase.
   ========================================================= */

(function () {
  "use strict";

  const SUPABASE_URL = "https://tsvejnzxrxrrecgquxbq.supabase.co";
  const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_P8gaG4CyyHuiKJJbW3t6Dw_we4UODZ_";

  const config = Object.freeze({
    url: SUPABASE_URL,
    anonKey: SUPABASE_PUBLISHABLE_KEY,
    SUPABASE_URL,
    SUPABASE_ANON_KEY: SUPABASE_PUBLISHABLE_KEY,
    SUPABASE_PUBLISHABLE_KEY,
    supabaseUrl: SUPABASE_URL,
    supabaseKey: SUPABASE_PUBLISHABLE_KEY
  });

  window.MEI_CONFIG = config;
  window.MEI_SUPABASE_CONFIG = config;

  if (!window.supabase || typeof window.supabase.createClient !== "function") {
    console.error(
      "MEI One: Supabase library failed to load. Check the Supabase CDN script."
    );
    return;
  }

  const existingClient =
    window.MEI_SUPABASE && typeof window.MEI_SUPABASE.from === "function"
      ? window.MEI_SUPABASE
      : window.supabaseClient && typeof window.supabaseClient.from === "function"
        ? window.supabaseClient
        : null;

  const client =
    existingClient ||
    window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    });

  window.MEI_SUPABASE = client;
  window.supabaseClient = client;

  console.info("MEI One: Shared Supabase client initialized.");
})();
