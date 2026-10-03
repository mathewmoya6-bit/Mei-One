/* ============================================================
   MEI ONE — ADMIN PANEL
   js/admin.js
   ============================================================ */

(function () {
  "use strict";

  const LOGIN_URL = "admin-login.html";
  const ALLOWED_ROLES = ["SUPER_ADMIN", "ADMIN", "OPERATIONS", "FINANCE", "SUPPORT", "AUDITOR"];

  /* Sections that show a table of live data. */
  const DATA_SECTIONS = {
    users:    { table: "profiles",     title: "Users" },
    services: { table: "services",     title: "Services" },
    payments: { table: "payments",     title: "Payments" },
    activity: { table: "activity_logs", title: "Activity" }
  };

  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => Array.from(document.querySelectorAll(selector));

  const escapeHtml = (value) =>
    String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

  const SUPABASE = window.supabaseClient || window.MEISupabase;

  let currentUser = null;
  let currentAdmin = null;

  /* ----------------------------------------------------------
     UI HELPERS
  ---------------------------------------------------------- */

  function hideLoading() {
    const screen = $("#adminLoading");
    if (screen) screen.classList.add("hidden");
  }

  function showToast(message, type = "info") {
    if (window.MEI && typeof window.MEI.showToast === "function") {
      window.MEI.showToast(message, type);
    } else {
      console[type === "error" ? "error" : "log"](message);
    }
  }

  function formatRole(role) {
    return String(role || "")
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  }

  function formatDate(value) {
    const date = new Date(value);
    if (!value || Number.isNaN(date.getTime())) return "Unknown time";
    return date.toLocaleString("en-KE", { dateStyle: "medium", timeStyle: "short" });
  }

  /* ----------------------------------------------------------
     AUTH
  ---------------------------------------------------------- */

  async function getSession() {
    const { data, error } = await SUPABASE.auth.getSession();
    if (error) {
      console.error("MEI One: Session error:", error);
      return null;
    }
    return data?.session || null;
  }

  async function verifyAdmin(session) {
    if (!session?.user?.id) return null;

    const { data, error } = await SUPABASE
      .from("admin_users")
      .select("id, user_id, role, is_active, created_at")
      .eq("user_id", session.user.id)
      .maybeSingle();

    if (error) {
      console.error("MEI One: Admin verification failed:", error);
      showToast("Unable to verify administrator access.", "error");
      return null;
    }

    if (!data || !data.is_active || !ALLOWED_ROLES.includes(data.role)) return null;
    return data;
  }

  function accessDenied() {
    document.body.innerHTML = `
      <div style="min-height:100vh;display:grid;place-items:center;padding:24px;background:#07111f;color:#fff;font-family:Inter,system-ui,sans-serif;">
        <div style="width:100%;max-width:460px;padding:36px;border-radius:20px;background:#0d1b2e;border:1px solid rgba(255,255,255,.08);text-align:center;box-shadow:0 20px 60px rgba(0,0,0,.35);">
          <div style="display:grid;place-items:center;width:64px;height:64px;margin:0 auto 20px;border-radius:50%;background:rgba(239,68,68,.12);color:#ef4444;font-size:30px;">!</div>
          <h1 style="margin:0 0 10px;font-size:28px;">Access denied</h1>
          <p style="margin:0 0 24px;color:#94a3b8;line-height:1.6;">Your account does not have an active MEI One administrator role.</p>
          <button id="accessDeniedLogout" style="border:0;border-radius:12px;padding:13px 22px;background:#39ff88;color:#061018;font-weight:800;cursor:pointer;">Sign out</button>
        </div>
      </div>`;

    $("#accessDeniedLogout").addEventListener("click", async () => {
      await SUPABASE.auth.signOut();
      window.location.href = LOGIN_URL;
    });
  }

  /* ----------------------------------------------------------
     USER DISPLAY
  ---------------------------------------------------------- */

  function getUserName(user) {
    return (
      user?.user_metadata?.full_name ||
      user?.user_metadata?.name ||
      user?.email?.split("@")[0] ||
      "Administrator"
    );
  }

  function getInitials(name) {
    const words = String(name).trim().split(/\s+/).filter(Boolean);
    if (!words.length) return "A";
    if (words.length === 1) return words[0].substring(0, 2).toUpperCase();
    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
  }

  function updateUserInterface() {
    const name = getUserName(currentUser);
    const initials = getInitials(name);

    $$("#adminUserName, [data-admin-name]").forEach((el) => { el.textContent = name; });
    $$("#adminUserEmail, [data-admin-email]").forEach((el) => { el.textContent = currentUser.email || ""; });
    $$("#adminAvatar, [data-admin-avatar]").forEach((el) => {
      el.textContent = initials;
      el.title = formatRole(currentAdmin.role);
    });
    $$("[data-admin-role]").forEach((el) => { el.textContent = formatRole(currentAdmin.role); });
  }

  /* ----------------------------------------------------------
     DASHBOARD STATS
  ---------------------------------------------------------- */

  async function countRows(table) {
    const { count, error } = await SUPABASE
      .from(table)
      .select("*", { count: "exact", head: true });

    if (error) {
      console.error(`MEI One: Could not count ${table}:`, error);
      return null;
    }
    return count ?? 0;
  }

  async function loadDashboardStats() {
    const [users, services, payments, activity] = await Promise.all([
      countRows("profiles"),
      countRows("services"),
      countRows("payments"),
      countRows("activity_logs")
    ]);

    const set = (selector, value) => {
      $$(selector).forEach((el) => { el.textContent = value === null ? "—" : value; });
    };

    set("#statUsers", users);
    set("#statServices", services);
    set("#statPayments", payments);
    set("#statActivity", activity);
  }

  /* ----------------------------------------------------------
     RECENT ACTIVITY
  ---------------------------------------------------------- */

  async function loadRecentActivity() {
    const { data, error } = await SUPABASE
      .from("activity_logs")
      .select("id, action, entity_type, description, created_at")
      .order("created_at", { ascending: false })
      .limit(10);

    if (error) {
      console.error("MEI One: Could not load activity:", error);
      return;
    }

    renderRecentActivity(data || []);
  }

  function renderRecentActivity(items) {
    const container = $("#recentActivity");
    if (!container || !items.length) return; // keep the empty state in the page

    container.innerHTML = items.map((item) => `
      <div class="activity-item">
        <div class="activity-icon" aria-hidden="true">✓</div>
        <div class="activity-content">
          <div class="activity-title">${escapeHtml(item.description || item.action || "System activity")}</div>
          <div class="activity-meta">${escapeHtml(item.entity_type || "System")} · ${escapeHtml(formatDate(item.created_at))}</div>
        </div>
      </div>`).join("");
  }

  /* ----------------------------------------------------------
     ACTIVITY LOGGING
  ---------------------------------------------------------- */

  async function logActivity(action, description = "", entityType = null, entityId = null, metadata = {}) {
    if (!currentAdmin || !currentUser) return;

    const { error } = await SUPABASE.from("activity_logs").insert({
      user_id: currentUser.id,
      admin_user_id: currentAdmin.id,
      action,
      entity_type: entityType,
      entity_id: entityId,
      description,
      metadata
    });

    if (error) console.error("MEI One: Activity log error:", error);
  }

  /* ----------------------------------------------------------
     SECTION VIEWS
  ---------------------------------------------------------- */

  function formatCell(key, value) {
    if (value === null || value === undefined || value === "") return "—";
    if (typeof value === "boolean") return value ? "Yes" : "No";
    if (/(_at|date)$/i.test(key)) return formatDate(value);
    if (/(^id$|_id$)/.test(key)) return String(value).slice(0, 8);
    return String(value);
  }

  function renderTable(rows) {
    if (!rows.length) {
      return `<div class="empty-state"><div class="empty-icon" aria-hidden="true">◷</div><strong>Nothing here yet</strong><p>Records will appear here once they exist.</p></div>`;
    }

    const columns = Object.keys(rows[0])
      .filter((key) => typeof rows[0][key] !== "object" || rows[0][key] === null)
      .slice(0, 8);

    const head = columns.map((key) => `<th>${escapeHtml(key.replace(/_/g, " "))}</th>`).join("");
    const body = rows.map((row) =>
      `<tr>${columns.map((key) => `<td>${escapeHtml(formatCell(key, row[key]))}</td>`).join("")}</tr>`
    ).join("");

    return `<div class="table-wrap"><table class="data-table"><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></div>`;
  }

  async function loadSectionData(section) {
    const config = DATA_SECTIONS[section];
    const title = $("#viewTitle");
    const body = $("#viewBody");
    if (!title || !body) return;

    if (!config) {
      title.textContent = "Settings";
      body.innerHTML = `<div class="empty-state"><div class="empty-icon" aria-hidden="true">⚙</div><strong>Settings</strong><p>Platform configuration options will appear here.</p></div>`;
      return;
    }

    title.textContent = config.title;
    body.innerHTML = `<div class="empty-state"><p>Loading…</p></div>`;

    let { data, error } = await SUPABASE.from(config.table).select("*").order("created_at", { ascending: false }).limit(100);

    if (error) {
      // The table may not have a created_at column; retry without ordering.
      ({ data, error } = await SUPABASE.from(config.table).select("*").limit(100));
    }

    if (error) {
      console.error(`MEI One: Could not load ${config.table}:`, error);
      body.innerHTML = `<div class="empty-state"><strong>Could not load ${escapeHtml(config.title.toLowerCase())}</strong><p>${escapeHtml(error.message || "Check the database permissions.")}</p></div>`;
      return;
    }

    body.innerHTML = renderTable(data || []);
  }

  function activateSection(section) {
    const isDashboard = section === "dashboard";

    const dashboard = $("#viewDashboard");
    const view = $("#viewSection");
    if (dashboard) dashboard.hidden = !isDashboard;
    if (view) view.hidden = isDashboard;

    $$(".admin-nav [data-admin-section]").forEach((item) => {
      item.classList.toggle("active", item.dataset.adminSection === section);
    });

    if (isDashboard) {
      loadDashboardStats();
      loadRecentActivity();
    } else {
      loadSectionData(section);
    }

    window.scrollTo({ top: 0 });
  }

  /* ----------------------------------------------------------
     NAVIGATION, SIDEBAR, LOGOUT
  ---------------------------------------------------------- */

  function setSidebar(open) {
    const sidebar = $("#adminSidebar");
    const overlay = $("#adminOverlay");
    const button = $("#mobileMenu");
    if (!sidebar) return;

    sidebar.classList.toggle("open", open);
    if (overlay) overlay.classList.toggle("show", open);
    if (button) {
      button.setAttribute("aria-expanded", String(open));
      button.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    }
  }

  function setupNavigation() {
    document.addEventListener("click", (event) => {
      const trigger = event.target.closest("[data-admin-section]");
      if (!trigger) return;

      event.preventDefault();
      activateSection(trigger.dataset.adminSection);
      setSidebar(false);
    });

    const menu = $("#mobileMenu");
    if (menu) menu.addEventListener("click", () => setSidebar(!$("#adminSidebar").classList.contains("open")));

    const overlay = $("#adminOverlay");
    if (overlay) overlay.addEventListener("click", () => setSidebar(false));

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") setSidebar(false);
    });
  }

  function setupLogout() {
    const button = $("#adminLogout");
    if (!button) return;

    button.addEventListener("click", async (event) => {
      event.preventDefault();
      button.disabled = true;

      try {
        await logActivity("LOGOUT", "Administrator signed out of MEI One.");
        const { error } = await SUPABASE.auth.signOut();
        if (error) throw error;
        window.location.href = LOGIN_URL;
      } catch (error) {
        console.error("MEI One: Logout failed:", error);
        button.disabled = false;
        showToast("Unable to sign out. Please try again.", "error");
      }
    });
  }

  function listenForAuthChanges() {
    SUPABASE.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT" || !session) window.location.href = LOGIN_URL;
    });
  }

  /* ----------------------------------------------------------
     INIT
  ---------------------------------------------------------- */

  async function initAdmin() {
    if (!SUPABASE) {
      console.error("MEI One: Supabase client is not available.");
      hideLoading();
      showToast("Supabase is not available. Check js/config.js and js/supabase.js.", "error");
      return;
    }

    try {
      const session = await getSession();

      if (!session) {
        window.location.href = LOGIN_URL;
        return;
      }

      currentUser = session.user;
      currentAdmin = await verifyAdmin(session);

      if (!currentAdmin) {
        accessDenied();
        return;
      }

      updateUserInterface();
      setupNavigation();
      setupLogout();
      listenForAuthChanges();

      await Promise.allSettled([loadDashboardStats(), loadRecentActivity()]);
      hideLoading();

      logActivity("ADMIN_LOGIN", "Administrator opened the MEI One admin dashboard.");

    } catch (error) {
      console.error("MEI One: Admin initialization failed:", error);
      hideLoading();
      showToast("Admin dashboard could not be loaded.", "error");
    }
  }

  /* ----------------------------------------------------------
     PUBLIC HELPERS
  ---------------------------------------------------------- */

  window.MEIAdmin = {
    getUser: () => currentUser,
    getAdmin: () => currentAdmin,
    isSuperAdmin: () => currentAdmin?.role === "SUPER_ADMIN",
    isAdmin: () => Boolean(currentAdmin?.is_active),
    logActivity,
    reloadStats: loadDashboardStats,
    reloadActivity: loadRecentActivity
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAdmin);
  } else {
    initAdmin();
  }
})();
