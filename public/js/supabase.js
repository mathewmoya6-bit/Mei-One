/* ============================================================
   MEI SUPER APP
   SUPABASE CLIENT
   ============================================================ */

(() => {
  "use strict";

  const SUPABASE_URL =
    "https://tsvejnzxrxrrecgquxbq.supabase.co";

  const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_P8gaG4CyyHuiKJJbW3t6Dw_we4UODZ_";


  /* ------------------------------------------------------------
     CHECK SUPABASE LIBRARY
     ------------------------------------------------------------ */

  if (!window.supabase) {
    console.error(
      "Supabase library was not loaded. " +
      "Load @supabase/supabase-js before js/supabase.js."
    );

    window.MEISupabaseError =
      "Supabase library was not loaded.";

    return;
  }


  /* ------------------------------------------------------------
     CREATE CLIENT
     ------------------------------------------------------------ */

  const supabaseClient = window.supabase.createClient(
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


  /* ------------------------------------------------------------
     GLOBAL REFERENCES
     ------------------------------------------------------------ */

  window.supabaseClient = supabaseClient;

  window.MEISupabase = supabaseClient;


  /* ------------------------------------------------------------
     CONFIG
     ------------------------------------------------------------ */

  window.MEIConfig = {
    supabaseUrl: SUPABASE_URL,
    appName: "MEI Super App",
    version: "1.0.0"
  };


  console.log("MEI Super App: Supabase initialized.");
})();
