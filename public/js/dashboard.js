```css
/* =========================================================
   MEI ONE — DASHBOARD
   Dark Navy / Neon Green
   Production Dashboard Styles
   ========================================================= */

/* =========================================================
   RESET
   ========================================================= */

*,
*::before,
*::after {
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
  font-size: 16px;
}

body.dashboard-page {
  margin: 0;
  min-height: 100vh;
  background:
    radial-gradient(circle at 80% 0%, rgba(57, 255, 20, 0.06), transparent 28%),
    #050b14;
  color: #f4f7f8;
  font-family:
    Inter,
    ui-sans-serif,
    system-ui,
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    sans-serif;
  line-height: 1.5;
  overflow-x: hidden;
}

body.dashboard-page a {
  color: inherit;
  text-decoration: none;
}

button,
a {
  -webkit-tap-highlight-color: transparent;
}

button {
  font: inherit;
}

img {
  max-width: 100%;
  display: block;
}

/* =========================================================
   VARIABLES
   ========================================================= */

:root {
  --mei-bg: #050b14;
  --mei-bg-soft: #08111d;
  --mei-panel: #0b1624;
  --mei-panel-2: #0e1b2b;
  --mei-panel-3: #101f31;

  --mei-border: rgba(255, 255, 255, 0.08);
  --mei-border-strong: rgba(57, 255, 20, 0.24);

  --mei-green: #39ff14;
  --mei-green-dark: #19c900;
  --mei-green-soft: rgba(57, 255, 20, 0.1);
  --mei-green-glow: rgba(57, 255, 20, 0.22);

  --mei-white: #ffffff;
  --mei-text: #f4f7f8;
  --mei-muted: #8d9aaa;
  --mei-muted-2: #687789;

  --mei-danger: #ff4d67;
  --mei-warning: #ffbf3f;
  --mei-blue: #42a5ff;

  --sidebar-width: 260px;
  --header-height: 76px;

  --radius-sm: 10px;
  --radius-md: 16px;
  --radius-lg: 22px;

  --shadow:
    0 18px 50px rgba(0, 0, 0, 0.28);

  --transition:
    180ms ease;
}

/* =========================================================
   ACCESSIBILITY
   ========================================================= */

.skip-link {
  position: fixed;
  top: -100px;
  left: 16px;
  z-index: 9999;
  padding: 12px 18px;
  border-radius: 10px;
  background: var(--mei-green);
  color: #031006;
  font-weight: 800;
  transition: top var(--transition);
}

.skip-link:focus {
  top: 16px;
  outline: none;
}

/* =========================================================
   SIDEBAR
   ========================================================= */

.dashboard-sidebar {
  position: fixed;
  inset: 0 auto 0 0;
  z-index: 1000;

  width: var(--sidebar-width);
  height: 100vh;

  display: flex;
  flex-direction: column;

  background:
    linear-gradient(
      180deg,
      #07101c 0%,
      #06101a 100%
    );

  border-right: 1px solid var(--mei-border);

  overflow-y: auto;
  overflow-x: hidden;

  scrollbar-width: thin;
  scrollbar-color: rgba(57, 255, 20, 0.25) transparent;
}

.dashboard-sidebar::-webkit-scrollbar {
  width: 5px;
}

.dashboard-sidebar::-webkit-scrollbar-track {
  background: transparent;
}

.dashboard-sidebar::-webkit-scrollbar-thumb {
  background: rgba(57, 255, 20, 0.25);
  border-radius: 20px;
}

/* =========================================================
   BRAND
   ========================================================= */

.sidebar-brand {
  min-height: var(--header-height);

  display: flex;
  align-items: center;

  padding: 18px 20px;

  border-bottom: 1px solid var(--mei-border);
}

.sidebar-brand a {
  display: inline-flex;
  align-items: center;
  gap: 12px;
}

.brand-mark {
  width: 42px;
  height: 42px;

  display: grid;
  place-items: center;

  border-radius: 12px;

  background: var(--mei-green);
  color: #031006;

  font-size: 20px;
  font-weight: 950;

  box-shadow:
    0 0 0 4px rgba(57, 255, 20, 0.06),
    0 0 22px rgba(57, 255, 20, 0.18);
}

.sidebar-brand .brand-name {
  color: var(--mei-white);
  font-size: 20px;
  font-weight: 900;
  letter-spacing: -0.04em;
}

/* =========================================================
   NAVIGATION
   ========================================================= */

.dashboard-nav {
  padding: 18px 12px;
}

.nav-item {
  position: relative;

  width: 100%;
  min-height: 48px;

  display: flex;
  align-items: center;
  gap: 13px;

  margin-bottom: 5px;
  padding: 11px 14px;

  border: 1px solid transparent;
  border-radius: 12px;

  color: var(--mei-muted);

  font-size: 14px;
  font-weight: 750;

  transition:
    background var(--transition),
    color var(--transition),
    border-color var(--transition),
    transform var(--transition);
}

.nav-item:hover {
  color: var(--mei-white);
  background: rgba(255, 255, 255, 0.035);
  border-color: var(--mei-border);
  transform: translateX(2px);
}

.nav-item.active {
  color: var(--mei-green);
  background:
    linear-gradient(
      90deg,
      rgba(57, 255, 20, 0.12),
      rgba(57, 255, 20, 0.035)
    );
  border-color: rgba(57, 255, 20, 0.15);
}

.nav-item.active::before {
  content: "";

  position: absolute;
  left: -12px;
  top: 9px;
  bottom: 9px;

  width: 3px;

  border-radius: 0 5px 5px 0;

  background: var(--mei-green);
  box-shadow: 0 0 12px var(--mei-green-glow);
}

.nav-icon {
  width: 22px;
  min-width: 22px;

  display: inline-flex;
  align-items: center;
  justify-content: center;

  font-size: 17px;
}

.logout-link {
  color: #a5afba;
}

.logout-link:hover {
  color: var(--mei-danger);
  background: rgba(255, 77, 103, 0.06);
  border-color: rgba(255, 77, 103, 0.12);
}

.sidebar-bottom {
  margin-top: auto;
  padding: 12px;
  border-top: 1px solid var(--mei-border);
}

/* =========================================================
   OVERLAY
   ========================================================= */

.sidebar-overlay {
  display: none;

  position: fixed;
  inset: 0;
  z-index: 900;

  background: rgba(0, 0, 0, 0.68);
  backdrop-filter: blur(3px);
}

/* =========================================================
   MAIN APP AREA
   ========================================================= */

.dashboard-main {
  min-height: 100vh;
  margin-left: var(--sidebar-width);
}

/* =========================================================
   HEADER
   ========================================================= */

.app-header {
  position: sticky;
  top: 0;
  z-index: 800;

  height: var(--header-height);

  display: flex;
  align-items: center;
  justify-content: space-between;

  padding: 0 30px;

  background:
    rgba(5, 11, 20, 0.9);

  border-bottom: 1px solid var(--mei-border);

  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
}

.header-left,
.header-right {
  display: flex;
  align-items: center;
}

.header-left {
  gap: 15px;
}

.header-right {
  gap: 14px;
}

.menu-btn {
  display: none;

  width: 42px;
  height: 42px;

  align-items: center;
  justify-content: center;

  border: 1px solid var(--mei-border);
  border-radius: 10px;

  background: var(--mei-panel);
  color: var(--mei-white);

  cursor: pointer;
}

.menu-btn:hover {
  border-color: var(--mei-border-strong);
  color: var(--mei-green);
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
}

.brand .brand-mark {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  font-size: 17px;
}

.brand-name {
  color: var(--mei-white);
  font-size: 18px;
  font-weight: 900;
  letter-spacing: -0.04em;
}

.header-user {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-avatar {
  width: 40px;
  height: 40px;

  display: grid;
  place-items: center;

  border-radius: 50%;

  background:
    linear-gradient(
      135deg,
      rgba(57, 255, 20, 0.2),
      rgba(57, 255, 20, 0.04)
    );

  border: 1px solid rgba(57, 255, 20, 0.3);

  color: var(--mei-green);
  font-size: 14px;
  font-weight: 900;
}

.user-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.user-info strong {
  max-width: 180px;

  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  color: var(--mei-white);
  font-size: 13px;
  font-weight: 800;
}

.user-info span {
  color: var(--mei-muted);
  font-size: 11px;
}

.logout-btn {
  min-height: 40px;

  padding: 8px 13px;

  border: 1px solid var(--mei-border);
  border-radius: 10px;

  background: transparent;
  color: var(--mei-muted);

  font-size: 12px;
  font-weight: 800;

  cursor: pointer;

  transition:
    color var(--transition),
    border-color var(--transition),
    background var(--transition);
}

.logout-btn:hover {
  color: var(--mei-danger);
  border-color: rgba(255, 77, 103, 0.25);
  background: rgba(255, 77, 103, 0.05);
}

/* =========================================================
   DASHBOARD CONTENT
   ========================================================= */

.dashboard-section {
  display: none;
  width: 100%;
  padding: 34px 30px 60px;
}

.dashboard-section.active {
  display: block;
}

.page-heading {
  margin-bottom: 28px;
}

.page-heading h1 {
  margin: 0;

  color: var(--mei-white);

  font-size: clamp(26px, 3vw, 38px);
  line-height: 1.1;

  font-weight: 950;
  letter-spacing: -0.045em;
}

.page-heading p {
  max-width: 720px;
  margin: 9px 0 0;

  color: var(--mei-muted);
  font-size: 14px;
}

.status-pill {
  display: inline-flex;
  align-items: center;
  gap: 7px;

  margin-top: 15px;
  padding: 7px 11px;

  border: 1px solid rgba(57, 255, 20, 0.2);
  border-radius: 999px;

  background: rgba(57, 255, 20, 0.07);
  color: var(--mei-green);

  font-size: 11px;
  font-weight: 850;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.status-pill::before {
  content: "";

  width: 7px;
  height: 7px;

  border-radius: 50%;
  background: var(--mei-green);

  box-shadow: 0 0 9px rgba(57, 255, 20, 0.7);
}

/* =========================================================
   QUICK ACTIONS
   ========================================================= */

.quick-actions {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;

  margin-bottom: 30px;
}

.quick-action {
  min-height: 92px;

  display: flex;
  align-items: center;
  gap: 13px;

  padding: 16px;

  border: 1px solid var(--mei-border);
  border-radius: var(--radius-md);

  background:
    linear-gradient(
      145deg,
      rgba(14, 27, 43, 0.95),
      rgba(8, 17, 29, 0.95)
    );

  box-shadow: 0 12px 35px rgba(0, 0, 0, 0.16);

  transition:
    transform var(--transition),
    border-color var(--transition),
    background var(--transition),
    box-shadow var(--transition);
}

.quick-action:hover {
  transform: translateY(-3px);

  border-color: rgba(57, 255, 20, 0.28);

  background:
    linear-gradient(
      145deg,
      rgba(16, 34, 48, 1),
      rgba(8, 20, 30, 1)
    );

  box-shadow:
    0 16px 40px rgba(0, 0, 0, 0.28),
    0 0 24px rgba(57, 255, 20, 0.05);
}

.quick-icon {
  width: 48px;
  height: 48px;
  min-width: 48px;

  display: grid;
  place-items: center;

  border-radius: 13px;

  background: var(--mei-green-soft);
  border: 1px solid rgba(57, 255, 20, 0.16);

  font-size: 22px;
}

.quick-action strong {
  display: block;

  color: var(--mei-white);
  font-size: 13px;
  font-weight: 900;
}

.quick-action span {
  display: block;
  margin-top: 2px;

  color: var(--mei-muted);
  font-size: 11px;
}

/* =========================================================
   DASHBOARD STATS
   ========================================================= */

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;

  margin-bottom: 30px;
}

.dashboard-card {
  position: relative;

  min-width: 0;
  padding: 21px;

  border: 1px solid var(--mei-border);
  border-radius: var(--radius-md);

  background:
    linear-gradient(
      145deg,
      rgba(13, 27, 43, 0.96),
      rgba(7, 16, 27, 0.96)
    );

  overflow: hidden;
}

.dashboard-card::after {
  content: "";

  position: absolute;
  width: 100px;
  height: 100px;

  right: -45px;
  bottom: -45px;

  border-radius: 50%;

  background: rgba(57, 255, 20, 0.05);
}

.card-icon {
  width: 42px;
  height: 42px;

  display: grid;
  place-items: center;

  margin-bottom: 15px;

  border-radius: 11px;

  background: rgba(57, 255, 20, 0.08);
  border: 1px solid rgba(57, 255, 20, 0.12);

  font-size: 18px;
}

.card-label {
  margin-bottom: 4px;

  color: var(--mei-muted);
  font-size: 11px;
  font-weight: 750;
  text-transform: uppercase;
  letter-spacing: 0.07em;
}

.card-value {
  color: var(--mei-white);
  font-size: 28px;
  line-height: 1;
  font-weight: 950;
  letter-spacing: -0.04em;
}

/* =========================================================
   CONTENT CARDS
   ========================================================= */

.content-card {
  min-width: 0;

  margin-bottom: 22px;
  padding: 22px;

  border: 1px solid var(--mei-border);
  border-radius: var(--radius-lg);

  background:
    linear-gradient(
      145deg,
      rgba(10, 22, 36, 0.97),
      rgba(6, 14, 24, 0.97)
    );

  box-shadow: var(--shadow);
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;

  margin-bottom: 20px;
}

.card-header h2,
.card-header h3 {
  margin: 0;

  color: var(--mei-white);

  font-size: 17px;
  font-weight: 900;
  letter-spacing: -0.02em;
}

.text-button {
  padding: 7px 10px;

  border: 1px solid transparent;
  border-radius: 8px;

  background: transparent;
  color: var(--mei-green);

  font-size: 12px;
  font-weight: 800;

  cursor: pointer;
}

.text-button:hover {
  background: rgba(57, 255, 20, 0.07);
  border-color: rgba(57, 255, 20, 0.12);
}

/* =========================================================
   EMPTY / LOADING STATES
   ========================================================= */

.empty-state,
.loading-state {
  padding: 45px 20px;

  text-align: center;

  border: 1px dashed rgba(255, 255, 255, 0.09);
  border-radius: 14px;

  color: var(--mei-muted);
}

.empty-icon {
  width: 56px;
  height: 56px;

  display: grid;
  place-items: center;

  margin: 0 auto 14px;

  border-radius: 50%;

  background: rgba(57, 255, 20, 0.07);
  border: 1px solid rgba(57, 255, 20, 0.12);

  font-size: 22px;
}

.empty-state strong {
  display: block;

  margin-bottom: 5px;

  color: var(--mei-white);
  font-size: 14px;
}

.empty-state p,
.loading-state p {
  margin: 0;

  color: var(--mei-muted);
  font-size: 12px;
}

/* =========================================================
   SERVICES
   ========================================================= */

.services-grid {
  display: grid;

  grid-template-columns:
    repeat(4, minmax(0, 1fr));

  gap: 16px;

  margin-top: 4px;
}

.service-card {
  position: relative;

  min-height: 190px;

  display: flex;
  flex-direction: column;
  justify-content: space-between;

  padding: 20px;

  border: 1px solid var(--mei-border);
  border-radius: var(--radius-lg);

  background:
    linear-gradient(
      145deg,
      rgba(14, 29, 45, 0.98),
      rgba(7, 16, 27, 0.98)
    );

  overflow: hidden;

  transition:
    transform var(--transition),
    border-color var(--transition),
    box-shadow var(--transition),
    background var(--transition);
}

.service-card::before {
  content: "";

  position: absolute;
  left: 0;
  top: 0;

  width: 100%;
  height: 2px;

  background: linear-gradient(
    90deg,
    transparent,
    var(--mei-green),
    transparent
  );

  opacity: 0;

  transition: opacity var(--transition);
}

.service-card::after {
  content: "";

  position: absolute;

  width: 150px;
  height: 150px;

  right: -80px;
  bottom: -80px;

  border-radius: 50%;

  background: rgba(57, 255, 20, 0.055);

  pointer-events: none;
}

.service-card:hover {
  transform: translateY(-5px);

  border-color: rgba(57, 255, 20, 0.32);

  background:
    linear-gradient(
      145deg,
      rgba(16, 35, 51, 1),
      rgba(7, 18, 29, 1)
    );

  box-shadow:
    0 18px 45px rgba(0, 0, 0, 0.32),
    0 0 28px rgba(57, 255, 20, 0.06);
}

.service-card:hover::before {
  opacity: 1;
}

.service-card-icon {
  position: relative;
  z-index: 1;

  width: 56px;
  height: 56px;

  display: grid;
  place-items: center;

  margin-bottom: 20px;

  border-radius: 16px;

  background:
    linear-gradient(
      145deg,
      rgba(57, 255, 20, 0.15),
      rgba(57, 255, 20, 0.045)
    );

  border: 1px solid rgba(57, 255, 20, 0.18);

  font-size: 27px;

  transition:
    transform var(--transition),
    box-shadow var(--transition);
}

.service-card:hover .service-card-icon {
  transform: scale(1.06);

  box-shadow:
    0 0 20px rgba(57, 255, 20, 0.09);
}

.service-card-content {
  position: relative;
  z-index: 1;

  flex: 1;
}

.service-card-content h3 {
  margin: 0 0 6px;

  color: var(--mei-white);

  font-size: 16px;
  line-height: 1.25;

  font-weight: 900;
  letter-spacing: -0.025em;
}

.service-card-content p {
  margin: 0;

  color: var(--mei-muted);

  font-size: 12px;
  line-height: 1.55;
}

.service-arrow {
  position: relative;
  z-index: 1;

  align-self: flex-end;

  display: flex;
  align-items: center;
  justify-content: center;

  width: 32px;
  height: 32px;

  margin-top: 15px;

  border: 1px solid rgba(57, 255, 20, 0.15);
  border-radius: 50%;

  background: rgba(57, 255, 20, 0.07);
  color: var(--mei-green);

  font-size: 16px;
  font-weight: 900;

  transition:
    transform var(--transition),
    background var(--transition);
}

.service-card:hover .service-arrow {
  transform: translateX(3px);

  background: rgba(57, 255, 20, 0.13);
}

/* =========================================================
   PROFILE
   ========================================================= */

.profile-card {
  display: grid;

  grid-template-columns: auto minmax(0, 1fr);

  gap: 24px;

  padding: 25px;

  border: 1px solid var(--mei-border);
  border-radius: var(--radius-lg);

  background:
    linear-gradient(
      145deg,
      rgba(13, 27, 43, 0.97),
      rgba(7, 16, 27, 0.97)
    );

  box-shadow: var(--shadow);
}

.profile-avatar {
  width: 82px;
  height: 82px;

  display: grid;
  place-items: center;

  border-radius: 22px;

  background:
    linear-gradient(
      145deg,
      rgba(57, 255, 20, 0.18),
      rgba(57, 255, 20, 0.05)
    );

  border: 1px solid rgba(57, 255, 20, 0.25);

  color: var(--mei-green);

  font-size: 30px;
  font-weight: 950;
}

.profile-details {
  min-width: 0;
}

.profile-details h2 {
  margin: 0 0 4px;

  color: var(--mei-white);

  font-size: 20px;
  font-weight: 900;
}

.profile-details > p {
  margin: 0 0 20px;

  color: var(--mei-muted);
  font-size: 13px;
}

.profile-row {
  display: grid;

  grid-template-columns:
    minmax(110px, 150px)
    minmax(0, 1fr);

  gap: 15px;

  padding: 12px 0;

  border-top: 1px solid var(--mei-border);
}

.profile-row strong {
  color: var(--mei-muted);
  font-size: 12px;
  font-weight: 750;
}

.profile-row span {
  min-width: 0;

  overflow-wrap: anywhere;

  color: var(--mei-white);
  font-size: 13px;
  font-weight: 650;
}

.active-text {
  color: var(--mei-green) !important;
  font-weight: 850 !important;
}

/* =========================================================
   REQUEST / PAYMENT TABLE-LIKE CONTENT
   ========================================================= */

.request-list,
.payment-list {
  width: 100%;
}

.request-item,
.payment-item {
  display: grid;

  grid-template-columns:
    minmax(0, 1fr)
    auto;

  gap: 20px;

  padding: 16px 0;

  border-bottom: 1px solid var(--mei-border);
}

.request-item:last-child,
.payment-item:last-child {
  border-bottom: 0;
}

.request-item strong,
.payment-item strong {
  color: var(--mei-white);
  font-size: 13px;
}

.request-item span,
.payment-item span {
  display: block;

  margin-top: 3px;

  color: var(--mei-muted);
  font-size: 11px;
}

/* =========================================================
   STATUS BADGES
   ========================================================= */

.status-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;

  min-height: 28px;

  padding: 5px 10px;

  border-radius: 999px;

  font-size: 10px;
  font-weight: 850;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.status-pending {
  color: var(--mei-warning);
  background: rgba(255, 191, 63, 0.09);
  border: 1px solid rgba(255, 191, 63, 0.16);
}

.status-completed,
.status-paid,
.status-active {
  color: var(--mei-green);
  background: rgba(57, 255, 20, 0.08);
  border: 1px solid rgba(57, 255, 20, 0.16);
}

.status-cancelled,
.status-failed {
  color: var(--mei-danger);
  background: rgba(255, 77, 103, 0.08);
  border: 1px solid rgba(255, 77, 103, 0.16);
}

.status-processing,
.status-progress {
  color: var(--mei-blue);
  background: rgba(66, 165, 255, 0.08);
  border: 1px solid rgba(66, 165, 255, 0.16);
}

/* =========================================================
   FORMS / INPUTS IF USED ON DASHBOARD
   ========================================================= */

.dashboard-page input,
.dashboard-page select,
.dashboard-page textarea {
  width: 100%;

  min-height: 44px;

  padding: 10px 13px;

  border: 1px solid var(--mei-border);
  border-radius: 10px;

  outline: none;

  background: #07121f;
  color: var(--mei-white);

  font: inherit;
  font-size: 13px;

  transition:
    border-color var(--transition),
    box-shadow var(--transition);
}

.dashboard-page textarea {
  min-height: 100px;
  resize: vertical;
}

.dashboard-page input::placeholder,
.dashboard-page textarea::placeholder {
  color: var(--mei-muted-2);
}

.dashboard-page input:focus,
.dashboard-page select:focus,
.dashboard-page textarea:focus {
  border-color: rgba(57, 255, 20, 0.45);

  box-shadow:
    0 0 0 3px rgba(57, 255, 20, 0.07);
}

/* =========================================================
   BUTTONS
   ========================================================= */

.dashboard-page .primary-btn {
  min-height: 44px;

  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  padding: 10px 17px;

  border: 1px solid var(--mei-green);
  border-radius: 10px;

  background: var(--mei-green);
  color: #031006;

  font-size: 13px;
  font-weight: 900;

  cursor: pointer;

  transition:
    transform var(--transition),
    box-shadow var(--transition),
    background var(--transition);
}

.dashboard-page .primary-btn:hover {
  transform: translateY(-1px);

  background: #4dff2b;

  box-shadow:
    0 8px 22px rgba(57, 255, 20, 0.16);
}

.dashboard-page .secondary-btn {
  min-height: 44px;

  display: inline-flex;
  align-items: center;
  justify-content: center;

  padding: 10px 17px;

  border: 1px solid var(--mei-border);
  border-radius: 10px;

  background: transparent;
  color: var(--mei-white);

  font-size: 13px;
  font-weight: 800;

  cursor: pointer;
}

.dashboard-page .secondary-btn:hover {
  border-color: rgba(57, 255, 20, 0.25);
  color: var(--mei-green);
  background: rgba(57, 255, 20, 0.05);
}

/* =========================================================
   LINKS
   ========================================================= */

.dashboard-page a:focus-visible,
.dashboard-page button:focus-visible,
.dashboard-page input:focus-visible,
.dashboard-page select:focus-visible,
.dashboard-page textarea:focus-visible {
  outline: 2px solid var(--mei-green);
  outline-offset: 3px;
}

/* =========================================================
   SCROLLBAR
   ========================================================= */

.dashboard-page {
  scrollbar-width: thin;
  scrollbar-color: rgba(57, 255, 20, 0.25) #050b14;
}

.dashboard-page::-webkit-scrollbar {
  width: 8px;
}

.dashboard-page::-webkit-scrollbar-track {
  background: #050b14;
}

.dashboard-page::-webkit-scrollbar-thumb {
  background: rgba(57, 255, 20, 0.25);
  border-radius: 20px;
}

.dashboard-page::-webkit-scrollbar-thumb:hover {
  background: rgba(57, 255, 20, 0.4);
}

/* =========================================================
   LARGE DESKTOP
   ========================================================= */

@media (max-width: 1200px) {
  .services-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .quick-actions {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .dashboard-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

/* =========================================================
   TABLET
   ========================================================= */

@media (max-width: 900px) {
  :root {
    --sidebar-width: 245px;
  }

  .app-header {
    padding: 0 20px;
  }

  .dashboard-section {
    padding: 28px 20px 50px;
  }

  .services-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .quick-actions {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .dashboard-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

/* =========================================================
   MOBILE
   ========================================================= */

@media (max-width: 720px) {
  body.dashboard-page {
    background:
      radial-gradient(
        circle at 100% 0%,
        rgba(57, 255, 20, 0.05),
        transparent 32%
      ),
      #050b14;
  }

  .dashboard-sidebar {
    width: min(84vw, 300px);

    transform: translateX(-105%);

    transition:
      transform 220ms ease;

    box-shadow:
      20px 0 60px rgba(0, 0, 0, 0.4);
  }

  body.sidebar-open .dashboard-sidebar {
    transform: translateX(0);
  }

  body.sidebar-open .sidebar-overlay {
    display: block;
  }

  .dashboard-main {
    margin-left: 0;
  }

  .app-header {
    height: 68px;

    padding: 0 15px;
  }

  .menu-btn {
    display: inline-flex;
  }

  .brand .brand-mark {
    width: 35px;
    height: 35px;
  }

  .brand-name {
    font-size: 17px;
  }

  .header-user {
    gap: 0;
  }

  .user-info {
    display: none;
  }

  .logout-btn {
    width: 40px;
    height: 40px;

    padding: 0;

    font-size: 0;
  }

  .logout-btn::before {
    content: "↪";

    font-size: 18px;
  }

  .dashboard-section {
    padding: 24px 15px 45px;
  }

  .page-heading {
    margin-bottom: 22px;
  }

  .page-heading h1 {
    font-size: 28px;
  }

  .page-heading p {
    font-size: 13px;
  }

  .quick-actions {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .quick-action {
    min-height: 76px;
  }

  .quick-icon {
    width: 43px;
    height: 43px;
    min-width: 43px;
  }

  .dashboard-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
  }

  .dashboard-card {
    padding: 16px;
  }

  .card-icon {
    width: 37px;
    height: 37px;
    margin-bottom: 11px;
  }

  .card-value {
    font-size: 23px;
  }

  .services-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .service-card {
    min-height: 165px;
    padding: 18px;
  }

  .service-card-icon {
    width: 50px;
    height: 50px;
    margin-bottom: 15px;
    font-size: 24px;
  }

  .content-card {
    padding: 17px;
    border-radius: 16px;
  }

  .card-header {
    margin-bottom: 16px;
  }

  .profile-card {
    grid-template-columns: 1fr;
    padding: 20px;
    gap: 18px;
  }

  .profile-avatar {
    width: 68px;
    height: 68px;
    border-radius: 18px;
    font-size: 25px;
  }

  .profile-row {
    grid-template-columns: 1fr;
    gap: 4px;
  }
}

/* =========================================================
   SMALL PHONES
   ========================================================= */

@media (max-width: 430px) {
  .dashboard-section {
    padding-left: 12px;
    padding-right: 12px;
  }

  .dashboard-grid {
    grid-template-columns: 1fr 1fr;
  }

  .dashboard-card {
    padding: 14px;
  }

  .card-label {
    font-size: 9px;
  }

  .card-value {
    font-size: 21px;
  }

  .quick-action {
    padding: 13px;
  }

  .service-card {
    min-height: 155px;
  }

  .page-heading h1 {
    font-size: 25px;
  }
}

/* =========================================================
   REDUCED MOTION
   ========================================================= */

@media (prefers-reduced-motion: reduce) {
  html {
    scroll-behavior: auto;
  }

  *,
  *::before,
  *::after {
    transition-duration: 0.01ms !important;
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
  }
}
```
