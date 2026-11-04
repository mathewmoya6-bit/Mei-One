```javascript
/* =========================================================
   MEI ONE — SUPABASE CONFIGURATION
   Shared configuration for customer and provider portals
   ========================================================= */

(function () {
  "use strict";

  const SUPABASE_URL =
    "https://tsvejnzxrxrrecgquxbq.supabase.co";

  const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_P8ga4Gcyb3W3t6Dw_we4UODZ_";

  // -------------------------------------------------------
  // 1. Expose configuration
  // -------------------------------------------------------

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
  window.MEIConfig = config;
  window.CONFIG = config;

  // -------------------------------------------------------
  // 2. Check Supabase CDN
  // -------------------------------------------------------

  if (
    !window.supabase ||
    typeof window.supabase.createClient !== "function"
  ) {
    console.error(
      "MEI One: Supabase library failed to load. Check the Supabase CDN script."
    );
    return;
  }

  // -------------------------------------------------------
  // 3. Create or reuse shared Supabase client
  // -------------------------------------------------------

  const existingClient =
    window.MEI_SUPABASE &&
    typeof window.MEI_SUPABASE.from === "function"
      ? window.MEI_SUPABASE
      : window.supabaseClient &&
        typeof window.supabaseClient.from === "function"
          ? window.supabaseClient
          : null;

  const client =
    existingClient ||
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

  // -------------------------------------------------------
  // 4. Expose shared client
  // -------------------------------------------------------

  window.MEI_SUPABASE = client;
  window.supabaseClient = client;

  // Separate configuration object for pages that need it.
  window.MEI_SUPABASE_CONFIG = config;

  // -------------------------------------------------------
  // 5. Initialization confirmation
  // -------------------------------------------------------

  console.info(
    "MEI One: Shared Supabase client initialized successfully."
  );

})();```
