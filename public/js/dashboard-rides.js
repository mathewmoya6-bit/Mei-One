/* ============================================================
   MEI ONE — DASHBOARD RIDES
   File: public/js/dashboard-rides.js

   Adds a "Rides" section to dashboard.html:
   - request form (inserts into public.ride_requests)
   - live driver tracking once a driver is assigned
     (driver, vehicle, distance, arrival estimate, map)
   - "My rides" list with status + cancel
   - opens automatically for ?service=rides

   Self-contained: injects its own nav item, section and styles.
   Needs driver-assignment SQL (drivers + driver_locations tables).
   Load AFTER dashboard.js:
     <script src="js/dashboard-rides.js"></script>
   ============================================================ */

(function (window, document) {
  "use strict";

  const supabase = window.supabaseClient || null;
  const CONFIG = window.MEI_CONFIG || window.MEIConfig || window.CONFIG || {};

  const TABLE = "ride_requests";
  const DRIVERS_TABLE = "drivers";
  const LOCATIONS_TABLE = "driver_locations";
  const AFTER_LOGIN_KEY = "mei_after_login";
  const MAX_ACTIVE_REQUESTS = 3;
  const TIMEZONE = (CONFIG.settings && CONFIG.settings.timezone) || "Africa/Nairobi";

  // Tracking
  const LOCATION_POLL_MS = 15000;   // fallback if realtime is unavailable
  const TICK_MS = 5000;             // refresh "updated x seconds ago"
  const STALE_AFTER_S = 90;         // warn when the driver's last update is older than this
  const ROAD_FACTOR = 1.3;          // straight-line distance -> rough road distance
  const DEFAULT_SPEED_KMH = 25;     // used when the driver is slow or stationary
  const LEAFLET_CSS = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.css";
  const LEAFLET_JS = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.js";

  // Placeholder categories. Override with CONFIG.rides.categories = [["value","Label"], ...]
  const CATEGORIES = (CONFIG.rides && CONFIG.rides.categories) || [
    ["standard", "Standard car"],
    ["comfort", "Comfort"],
    ["large", "Van / large group"],
    ["bike", "Motorbike"]
  ];

  const STATUS_LABELS = {
    requested: "Requested",
    accepted: "Accepted",
    arrived: "Driver arrived",
    completed: "Completed",
    cancelled: "Cancelled"
  };

  const $ = (selector, parent = document) => parent.querySelector(selector);
  const $$ = (selector, parent = document) => Array.from(parent.querySelectorAll(selector));

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  const read = (formData, name) => String(formData.get(name) || "").trim();

  const dateFormat = new Intl.DateTimeFormat("en-KE", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: TIMEZONE
  });

  const formatDate = (value) => dateFormat.format(new Date(value));

  /* ----------------------------------------------------------
     STYLES
  ---------------------------------------------------------- */

  function injectStyles() {
    const style = document.createElement("style");
    style.textContent = `
      .ride-card{max-width:640px}
      .ride-card[hidden]{display:none}
      .ride-form{display:grid;gap:16px}
      .ride-form label{display:grid;gap:6px;color:var(--navy,#071a2f);font-weight:700;font-size:.9rem}
      .ride-form label small{font-weight:400;color:var(--muted,#5b6b7b)}
      .ride-form input,.ride-form select,.ride-form textarea{
        font:inherit;color:var(--navy,#071a2f);width:100%;box-sizing:border-box;
        background:#fff;border:1px solid var(--border,#d8e1e8);border-radius:10px;padding:12px}
      .ride-form input:focus,.ride-form select:focus,.ride-form textarea:focus{
        outline:2px solid var(--green-2,#00b85c);outline-offset:1px}
      .ride-row{display:grid;grid-template-columns:2fr 1fr;gap:12px}
      @media(max-width:520px){.ride-row{grid-template-columns:1fr}}
      .ride-note{font-size:.85rem;color:var(--muted,#5b6b7b);margin:0}
      .ride-location{display:grid;gap:8px;justify-items:start}
      .ride-locate{font:inherit;font-size:.9rem;font-weight:700;cursor:pointer;color:var(--navy,#071a2f);
        background:#fff;border:1px solid var(--border,#d8e1e8);border-radius:999px;padding:8px 16px}
      .ride-locate:hover:not(:disabled){border-color:var(--green-2,#00b85c)}
      .ride-locate:disabled{opacity:.6;cursor:default}
      .ride-location-status{font-size:.85rem;color:#067a43}
      .ride-locate-remove{margin-left:8px;font:inherit;font-size:.8rem;cursor:pointer;
        color:var(--muted,#5b6b7b);background:none;border:0;text-decoration:underline}
      .ride-map-link{display:inline-block;margin-top:6px;font-size:.85rem;font-weight:700;color:#067a43}
      .ride-form .form-message[data-type="error"]{color:var(--danger,#b91c1c)}
      .ride-form .form-message[data-type="success"]{color:#067a43}
      .ride-item{padding:14px 0;border-top:1px solid #edf2f6}
      .ride-item:first-child{border-top:0;padding-top:0}
      .ride-item-top{display:flex;justify-content:space-between;gap:12px;align-items:flex-start}
      .ride-item-top strong{color:var(--navy,#071a2f);overflow-wrap:anywhere}
      .ride-item-meta{font-size:.85rem;color:var(--muted,#5b6b7b);margin-top:4px}
      .ride-status{font-size:.7rem;font-weight:800;text-transform:uppercase;letter-spacing:.06em;
        padding:3px 10px;border-radius:999px;white-space:nowrap}
      .ride-status[data-status="requested"]{background:#fff6e0;color:#92600a}
      .ride-status[data-status="accepted"]{background:#eafff4;color:#067a43}
      .ride-status[data-status="arrived"]{background:#e0f7ea;color:#05603a}
      .ride-status[data-status="completed"]{background:#e8f1ff;color:#1d4ed8}
      .ride-status[data-status="cancelled"]{background:#fff0f0;color:var(--danger,#b91c1c)}
      .ride-cancel{margin-top:10px;font:inherit;font-size:.85rem;font-weight:700;cursor:pointer;
        color:var(--navy,#071a2f);background:#fff;border:1px solid var(--border,#d8e1e8);
        border-radius:999px;padding:6px 14px}
      .ride-cancel:hover:not(:disabled){color:var(--danger,#b91c1c);border-color:#f3b8b8;background:#fff5f5}
      .ride-cancel:disabled{opacity:.5;cursor:default}

      /* Tracking */
      .track-status{font-weight:800;font-size:1.05rem;color:var(--navy,#071a2f)}
      .track-driver{margin-top:4px;color:var(--navy,#071a2f)}
      .track-driver small{display:block;color:var(--muted,#5b6b7b)}
      .track-stats{display:flex;flex-wrap:wrap;gap:10px 28px;margin:14px 0}
      .track-stat strong{display:block;font-size:1.25rem;line-height:1.2;color:var(--navy,#071a2f)}
      .track-stat span{font-size:.8rem;color:var(--muted,#5b6b7b)}
      .track-map{height:280px;border-radius:12px;border:1px solid var(--border,#d8e1e8);
        overflow:hidden;background:#eef3f7;z-index:0}
      .track-map[hidden]{display:none}
      .track-foot{display:flex;flex-wrap:wrap;justify-content:space-between;gap:8px;margin-top:10px}
      .track-foot a{font-size:.85rem;font-weight:700;color:#067a43}
      .track-warn{color:#92600a}
      .ride-marker{font-size:26px;line-height:1;text-align:center;
        filter:drop-shadow(0 1px 2px rgba(0,0,0,.35))}
    `;
    document.head.appendChild(style);
  }

  /* ----------------------------------------------------------
     SECTION + NAV
  ---------------------------------------------------------- */

  function buildSection() {
    const main = $("#dashboardMain");
    if (!main || $('[data-section-content="rides"]')) return false;

    const section = el("section", "dashboard-section");
    section.dataset.sectionContent = "rides";
    section.innerHTML = `
      <div class="page-heading">
        <div>
          <h1>Request a ride</h1>
          <p>Tell us where you're going and we'll review your request.</p>
        </div>
      </div>

      <div class="content-card ride-card" id="trackCard" hidden style="margin-bottom:22px">
        <div class="card-header"><h2>Your driver</h2></div>
        <div class="track-status" id="trackStatus" aria-live="polite"></div>
        <div class="track-driver" id="trackDriver"></div>
        <div class="track-stats" id="trackStats" aria-live="polite"></div>
        <div class="track-map" id="trackMap" hidden></div>
        <div class="track-foot">
          <span class="ride-note" id="trackUpdated"></span>
          <a id="trackExternal" href="#" target="_blank" rel="noopener noreferrer" hidden>Open in Google Maps</a>
        </div>
        <p class="ride-note" style="margin-top:8px">Distance and arrival time are estimates and can change with traffic.</p>
      </div>

      <div class="content-card ride-card">
        <form id="rideForm" class="ride-form">
          <label>Pickup location
            <input name="pickup" type="text" required minlength="3" maxlength="200"
                   placeholder="Area / street / landmark" autocomplete="off">
          </label>
          <div class="ride-location">
            <button type="button" class="ride-locate" id="rideUseLocation">📍 Use my current location</button>
            <div class="ride-location-status" id="rideLocationStatus" aria-live="polite"></div>
            <p class="ride-note">Your location is shared only with this ride request. Sharing it also lets you see how far your driver is.</p>
          </div>
          <label>Destination
            <input name="destination" type="text" required minlength="3" maxlength="200"
                   placeholder="Where to?" autocomplete="off">
          </label>
          <div class="ride-row">
            <label>Vehicle category
              <select name="vehicle_category" id="rideCategory" required></select>
            </label>
            <label>Passengers
              <input name="passengers" type="number" min="1" max="8" value="1" required>
            </label>
          </div>
          <label>Pickup time <small>(leave empty for as soon as possible)</small>
            <input name="pickup_time" id="ridePickupTime" type="datetime-local">
          </label>
          <label>Phone number
            <input name="phone" id="ridePhone" type="tel" required maxlength="20"
                   autocomplete="tel" placeholder="07XXXXXXXX">
          </label>
          <label>Notes <small>(optional)</small>
            <textarea name="notes" rows="3" maxlength="500"
                      placeholder="Anything the driver should know"></textarea>
          </label>
          <p class="ride-note">This sends a request to the MEI team for review. A driver is not
            assigned until you hear from us.</p>
          <div class="form-message" id="rideMessage" aria-live="polite"></div>
          <button type="submit" class="button button-primary button-large" id="rideSubmit">Request ride</button>
        </form>
      </div>

      <div class="content-card ride-card" style="margin-top:22px">
        <div class="card-header"><h2>My rides</h2></div>
        <div id="ridesList" aria-live="polite"><div class="loading-state">Loading…</div></div>
      </div>`;
    main.appendChild(section);

    const select = $("#rideCategory", section);
    CATEGORIES.forEach(([value, label]) => {
      const option = el("option", "", label);
      option.value = value;
      select.appendChild(option);
    });

    const pickupTime = $("#ridePickupTime", section);
    pickupTime.min = toLocalInputValue(new Date());

    $("#rideForm", section).addEventListener("submit", submitRide);
    $("#rideUseLocation", section).addEventListener("click", (event) => useMyLocation(event.currentTarget));
    return true;
  }

  function addNavItem() {
    const nav = $(".dashboard-nav");
    if (!nav || $('[data-section="rides"]', nav)) return;

    const link = el("a", "nav-item");
    link.href = "#rides";
    link.dataset.section = "rides";
    link.innerHTML = '<span class="nav-icon" aria-hidden="true">🚗</span><span>Rides</span>';

    // Place it right after Overview.
    nav.insertBefore(link, nav.children[1] || null);
  }

  function showSection(name) {
    $$(".dashboard-section").forEach((section) => {
      section.classList.toggle("active", section.dataset.sectionContent === name);
    });
    $$(".dashboard-nav .nav-item").forEach((item) => {
      item.classList.toggle("active", item.dataset.section === name);
    });
    if (window.history && history.replaceState) history.replaceState(null, "", "#" + name);

    // The map can't measure itself while its section is hidden.
    if (name === "rides" && track.map) {
      window.setTimeout(() => track.map && track.map.invalidateSize(), 60);
    }
  }

  function toLocalInputValue(date) {
    const pad = (n) => String(n).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }

  /* ----------------------------------------------------------
     AUTH
  ---------------------------------------------------------- */

  async function getUser() {
    if (!supabase) return null;
    try {
      const { data } = await supabase.auth.getSession();
      return (data && data.session && data.session.user) || null;
    } catch (error) {
      console.error("MEI Rides: unable to read session.", error);
      return null;
    }
  }

  function rememberDestination() {
    try {
      sessionStorage.setItem(AFTER_LOGIN_KEY, "dashboard.html?service=rides");
    } catch (_) { /* storage unavailable */ }
  }

  /* ----------------------------------------------------------
     FORM
  ---------------------------------------------------------- */

  function setMessage(text, type) {
    const message = $("#rideMessage");
    if (!message) return;
    message.textContent = text;
    message.dataset.type = type || "info";
  }

  async function submitRide(event) {
    event.preventDefault();

    const form = event.currentTarget;
    const button = $("#rideSubmit");

    const user = await getUser();
    if (!user) {
      setMessage("Please sign in to request a ride.", "error");
      rememberDestination();
      if (window.MEI && window.MEI.openModal) window.MEI.openModal("login");
      return;
    }

    const data = new FormData(form);
    const pickup = read(data, "pickup");
    const destination = read(data, "destination");
    const category = read(data, "vehicle_category");
    const passengers = parseInt(read(data, "passengers"), 10);
    const phone = read(data, "phone");
    const notes = read(data, "notes");
    const when = read(data, "pickup_time");

    if (pickup.length < 3 || destination.length < 3) {
      setMessage("Please enter both a pickup location and a destination.", "error");
      return;
    }
    if (!/^\+?[0-9\s-]{9,15}$/.test(phone)) {
      setMessage("Please enter a valid phone number.", "error");
      return;
    }
    if (!Number.isInteger(passengers) || passengers < 1 || passengers > 8) {
      setMessage("Passengers must be between 1 and 8.", "error");
      return;
    }

    let pickupTime = null;
    if (when) {
      const date = new Date(when);
      const now = Date.now();
      if (Number.isNaN(date.getTime()) || date.getTime() < now - 60000) {
        setMessage("Pickup time must be in the future.", "error");
        return;
      }
      if (date.getTime() > now + 30 * 24 * 60 * 60 * 1000) {
        setMessage("Please choose a pickup time within the next 30 days.", "error");
        return;
      }
      pickupTime = date.toISOString();
    }

    button.disabled = true;
    const originalText = button.textContent;
    button.textContent = "Sending…";
    setMessage("", "info");

    try {
      const { count } = await supabase
        .from(TABLE)
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("status", "requested");

      if (typeof count === "number" && count >= MAX_ACTIVE_REQUESTS) {
        setMessage(`You already have ${MAX_ACTIVE_REQUESTS} open requests. Cancel one or wait to hear from us.`, "error");
        return;
      }

      const { error } = await supabase.from(TABLE).insert({
        pickup,
        destination,
        vehicle_category: category,
        passengers,
        pickup_time: pickupTime,
        phone,
        notes: notes || null,
        pickup_lat: pickupCoords ? pickupCoords.lat : null,
        pickup_lng: pickupCoords ? pickupCoords.lng : null,
        pickup_accuracy_m: pickupCoords ? pickupCoords.accuracy : null
      });
      if (error) throw error;

      form.reset();
      clearLocation(false);
      prefillPhone(user);
      setMessage("Ride request sent. We'll review it and contact you on " + phone + ".", "success");
      if (window.MEI && window.MEI.showToast) window.MEI.showToast("Ride request sent.", "success");
      loadRides();
    } catch (error) {
      console.error("MEI Rides: request failed.", error);
      setMessage("We couldn't send your request. Please try again.", "error");
    } finally {
      button.disabled = false;
      button.textContent = originalText;
    }
  }

  /* ----------------------------------------------------------
     GEOLOCATION (navigator.geolocation)
  ---------------------------------------------------------- */

  const CURRENT_LOCATION_TEXT = "My current location";
  let pickupCoords = null; // { lat, lng, accuracy }

  function showLocationStatus(text) {
    const box = $("#rideLocationStatus");
    if (!box) return;

    box.replaceChildren(el("span", "", text));

    const remove = el("button", "ride-locate-remove", "Remove");
    remove.type = "button";
    remove.addEventListener("click", () => clearLocation(true));
    box.appendChild(remove);
  }

  function clearLocation(clearField) {
    pickupCoords = null;

    const box = $("#rideLocationStatus");
    if (box) box.replaceChildren();

    const field = $('#rideForm [name="pickup"]');
    if (clearField && field && field.value === CURRENT_LOCATION_TEXT) field.value = "";
  }

  function useMyLocation(button) {
    if (!("geolocation" in navigator)) {
      setMessage("Your browser doesn't support location. Please type your pickup location.", "error");
      return;
    }
    if (window.isSecureContext === false) {
      setMessage("Location needs a secure (HTTPS) connection. Please type your pickup location.", "error");
      return;
    }

    const originalText = button.textContent;
    const restore = () => {
      button.disabled = false;
      button.textContent = originalText;
    };

    button.disabled = true;
    button.textContent = "Finding your location…";
    setMessage("", "info");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        restore();

        const { latitude, longitude, accuracy } = position.coords;
        pickupCoords = {
          lat: Number(latitude.toFixed(6)),
          lng: Number(longitude.toFixed(6)),
          accuracy: Math.round(accuracy)
        };

        const field = $('#rideForm [name="pickup"]');
        if (field && !field.value.trim()) field.value = CURRENT_LOCATION_TEXT;

        let text = `Location captured (accurate to about ${pickupCoords.accuracy} m).`;
        if (pickupCoords.accuracy > 200) text += " Accuracy is low, so add a landmark to your pickup.";
        showLocationStatus(text);
      },
      (error) => {
        restore();

        const messages = {
          1: "Location permission is blocked. Allow it in your browser settings, or type your pickup location.",
          2: "We couldn't work out your location. Check your GPS or signal, or type your pickup location.",
          3: "Finding your location took too long. Try again, or type your pickup location."
        };
        setMessage(messages[error.code] || "Unable to get your location. Please type your pickup location.", "error");
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  }

  function prefillPhone(user) {
    const field = $("#ridePhone");
    const phone = user && user.user_metadata && user.user_metadata.phone;
    if (field && phone && !field.value) field.value = phone;
  }

  /* ----------------------------------------------------------
     LIVE TRACKING
  ---------------------------------------------------------- */

  const track = {
    seq: 0,            // guards against overlapping syncs
    ride: null,
    driverId: null,
    driver: null,      // { name, vehicle_description, plate }
    loc: null,         // { lat, lng, accuracy_m, heading, speed_kmh, updated_at }
    channel: null,
    pollTimer: null,
    tickTimer: null,
    map: null,
    car: null,
    pin: null,
    fitted: false
  };

  const isTrackable = (row) => (row.status === "accepted" || row.status === "arrived") && !!row.driver_id;

  function haversineKm(lat1, lng1, lat2, lng2) {
    const rad = (d) => (d * Math.PI) / 180;
    const dLat = rad(lat2 - lat1);
    const dLng = rad(lng2 - lng1);
    const a = Math.sin(dLat / 2) ** 2 +
      Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLng / 2) ** 2;
    return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  function formatDistance(km) {
    if (km < 1) return `${Math.max(10, Math.round((km * 1000) / 10) * 10)} m`;
    return `${km.toFixed(1)} km`;
  }

  function secondsSince(value) {
    return Math.max(0, Math.round((Date.now() - new Date(value).getTime()) / 1000));
  }

  function ageText(seconds) {
    if (seconds < 10) return "Live";
    if (seconds < 60) return `Updated ${seconds} s ago`;
    return `Updated ${Math.floor(seconds / 60)} min ago`;
  }

  function loadLeaflet() {
    if (window.L && window.L.map) return Promise.resolve(window.L);
    if (loadLeaflet.promise) return loadLeaflet.promise;

    loadLeaflet.promise = new Promise((resolve, reject) => {
      const css = document.createElement("link");
      css.rel = "stylesheet";
      css.href = LEAFLET_CSS;
      document.head.appendChild(css);

      const script = document.createElement("script");
      script.src = LEAFLET_JS;
      script.async = true;
      script.onload = () => (window.L ? resolve(window.L) : reject(new Error("Leaflet missing")));
      script.onerror = () => reject(new Error("Leaflet failed to load"));
      document.head.appendChild(script);
    }).catch((error) => {
      loadLeaflet.promise = null;
      throw error;
    });

    return loadLeaflet.promise;
  }

  async function updateMap(seq) {
    const box = $("#trackMap");
    if (!box) return;

    const ride = track.ride;
    const hasPin = ride && typeof ride.pickup_lat === "number" && typeof ride.pickup_lng === "number";
    const hasCar = !!track.loc;

    box.hidden = !(hasPin || hasCar);
    if (box.hidden) return;

    let L;
    try {
      L = await loadLeaflet();
    } catch (error) {
      console.warn("MEI Rides: map unavailable.", error);
      box.hidden = true;
      return;
    }
    if (seq !== track.seq) return;

    const first = hasCar ? [track.loc.lat, track.loc.lng] : [ride.pickup_lat, ride.pickup_lng];

    if (!track.map) {
      track.map = L.map(box, { zoomControl: true, attributionControl: true }).setView(first, 15);
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: "&copy; OpenStreetMap contributors"
      }).addTo(track.map);
    }

    const icon = (emoji, label) => L.divIcon({
      className: "ride-marker",
      html: `<span role="img" aria-label="${label}">${emoji}</span>`,
      iconSize: [32, 32],
      iconAnchor: [16, 26]
    });

    if (hasPin) {
      const pinAt = [ride.pickup_lat, ride.pickup_lng];
      if (!track.pin) track.pin = L.marker(pinAt, { icon: icon("📍", "Pickup") }).addTo(track.map);
      else track.pin.setLatLng(pinAt);
    } else if (track.pin) {
      track.pin.remove();
      track.pin = null;
    }

    if (hasCar) {
      const carAt = [track.loc.lat, track.loc.lng];
      if (!track.car) track.car = L.marker(carAt, { icon: icon("🚗", "Your driver") }).addTo(track.map);
      else track.car.setLatLng(carAt);
    } else if (track.car) {
      track.car.remove();
      track.car = null;
    }

    track.map.invalidateSize();

    // Fit once; afterwards only re-fit if the car drifts out of view.
    const points = [];
    if (track.car) points.push(track.car.getLatLng());
    if (track.pin) points.push(track.pin.getLatLng());

    if (points.length > 1) {
      const bounds = L.latLngBounds(points);
      if (!track.fitted || !track.map.getBounds().contains(track.car.getLatLng())) {
        track.map.fitBounds(bounds, { padding: [40, 40], maxZoom: 17 });
        track.fitted = true;
      }
    } else if (!track.fitted) {
      track.map.setView(points[0], 15);
      track.fitted = true;
    }
  }

  function renderTrack() {
    const ride = track.ride;
    const card = $("#trackCard");
    if (!card || !ride) return;
    card.hidden = false;

    const arrived = ride.status === "arrived";
    $("#trackStatus").textContent = arrived ? "Your driver has arrived." : "Your driver is on the way.";

    const driverBox = $("#trackDriver");
    driverBox.replaceChildren();
    if (track.driver) {
      driverBox.appendChild(el("strong", "", track.driver.name));
      const vehicle = [track.driver.vehicle_description, track.driver.plate].filter(Boolean).join(" · ");
      if (vehicle) driverBox.appendChild(el("small", "", vehicle));
    } else {
      driverBox.appendChild(el("small", "", "Driver details are loading."));
    }

    const stats = $("#trackStats");
    stats.replaceChildren();
    const updated = $("#trackUpdated");
    const external = $("#trackExternal");

    const hasPin = typeof ride.pickup_lat === "number" && typeof ride.pickup_lng === "number";
    const loc = track.loc;

    if (!loc) {
      stats.appendChild(el("p", "ride-note", "Waiting for your driver to share their location."));
      updated.textContent = "";
      updated.className = "ride-note";
      external.hidden = true;
    } else {
      const age = secondsSince(loc.updated_at);
      updated.textContent = ageText(age) + (age > STALE_AFTER_S ? ". Location may be out of date." : "");
      updated.className = "ride-note" + (age > STALE_AFTER_S ? " track-warn" : "");

      external.href = `https://www.google.com/maps?q=${loc.lat},${loc.lng}`;
      external.hidden = false;

      const stat = (value, label) => {
        const box = el("div", "track-stat");
        box.appendChild(el("strong", "", value));
        box.appendChild(el("span", "", label));
        stats.appendChild(box);
      };

      if (arrived) {
        stat("At pickup", "Please meet your driver");
      } else if (hasPin) {
        const km = haversineKm(loc.lat, loc.lng, ride.pickup_lat, ride.pickup_lng) * ROAD_FACTOR;
        const speed = typeof loc.speed_kmh === "number" && loc.speed_kmh >= 10
          ? Math.min(loc.speed_kmh, 60)
          : DEFAULT_SPEED_KMH;
        const minutes = Math.max(1, Math.round((km / speed) * 60));
        stat(formatDistance(km), "Away from pickup");
        stat(km < 0.1 ? "Almost there" : `About ${minutes} min`, "Estimated arrival");
      } else {
        stats.appendChild(el("p", "ride-note",
          "Share your location when you request a ride to see distance and arrival time."));
      }
    }
  }

  async function loadDriverInfo(seq) {
    try {
      const { data, error } = await supabase
        .from(DRIVERS_TABLE)
        .select("name, vehicle_description, plate")
        .eq("id", track.driverId)
        .maybeSingle();
      if (error) throw error;
      if (seq === track.seq) track.driver = data || null;
    } catch (error) {
      console.warn("MEI Rides: unable to load driver details.", error);
    }
  }

  async function loadDriverLocation(seq) {
    try {
      const { data, error } = await supabase
        .from(LOCATIONS_TABLE)
        .select("lat, lng, accuracy_m, heading, speed_kmh, updated_at")
        .eq("driver_id", track.driverId)
        .maybeSingle();
      if (error) throw error;
      if (seq === track.seq) track.loc = data || null;
    } catch (error) {
      console.warn("MEI Rides: unable to load driver location.", error);
    }
  }

  function subscribeLocation(seq) {
    try {
      track.channel = supabase
        .channel("driver-location-" + track.driverId)
        .on("postgres_changes",
          { event: "*", schema: "public", table: LOCATIONS_TABLE, filter: `driver_id=eq.${track.driverId}` },
          (payload) => {
            if (seq !== track.seq) return;
            track.loc = payload.eventType === "DELETE" ? null : payload.new;
            renderTrack();
            updateMap(seq);
          })
        .subscribe();
    } catch (error) {
      console.warn("MEI Rides: live tracking unavailable.", error);
    }
  }

  function stopTracking() {
    track.seq++;
    if (track.channel) {
      try { supabase.removeChannel(track.channel); } catch (_) { /* ignore */ }
      track.channel = null;
    }
    window.clearInterval(track.pollTimer);
    window.clearInterval(track.tickTimer);
    track.pollTimer = track.tickTimer = null;

    if (track.map) {
      track.map.remove();
      track.map = null;
    }
    track.car = track.pin = null;
    track.fitted = false;
    track.ride = null;
    track.driverId = null;
    track.driver = null;
    track.loc = null;

    const card = $("#trackCard");
    if (card) card.hidden = true;
  }

  async function syncTracking(rows) {
    // rows are newest first; track the most recent ride with a driver on it.
    const active = rows.find(isTrackable);

    if (!active) {
      if (track.driverId) stopTracking();
      return;
    }

    if (track.driverId !== active.driver_id) {
      stopTracking();
      track.driverId = active.driver_id;
      track.ride = active;
      const seq = track.seq;

      renderTrack();
      await Promise.all([loadDriverInfo(seq), loadDriverLocation(seq)]);
      if (seq !== track.seq) return;

      renderTrack();
      updateMap(seq);
      subscribeLocation(seq);

      // Polling backs up realtime; the tick keeps "updated x s ago" fresh.
      track.pollTimer = window.setInterval(async () => {
        await loadDriverLocation(seq);
        if (seq !== track.seq) return;
        renderTrack();
        updateMap(seq);
      }, LOCATION_POLL_MS);
      track.tickTimer = window.setInterval(() => {
        if (seq === track.seq) renderTrack();
      }, TICK_MS);
      return;
    }

    // Same driver: the ride's status or pickup pin may have changed.
    track.ride = active;
    renderTrack();
    updateMap(track.seq);
  }

  /* ----------------------------------------------------------
     MY RIDES
  ---------------------------------------------------------- */

  function categoryLabel(value) {
    const match = CATEGORIES.find(([key]) => key === value);
    return match ? match[1] : value;
  }

  function rideItem(row) {
    const item = el("article", "ride-item");

    const top = el("div", "ride-item-top");
    top.appendChild(el("strong", "", `${row.pickup} → ${row.destination}`));
    const status = el("span", "ride-status", STATUS_LABELS[row.status] || row.status);
    status.dataset.status = row.status;
    top.appendChild(status);
    item.appendChild(top);

    const people = `${row.passengers} passenger${row.passengers === 1 ? "" : "s"}`;
    const when = row.pickup_time ? formatDate(row.pickup_time) : "As soon as possible";
    item.appendChild(el("div", "ride-item-meta", `${categoryLabel(row.vehicle_category)} · ${people} · ${when}`));
    item.appendChild(el("div", "ride-item-meta", `Requested ${formatDate(row.created_at)}`));

    if (typeof row.pickup_lat === "number" && typeof row.pickup_lng === "number") {
      const map = el("a", "ride-map-link", "View pickup on map");
      map.href = `https://www.google.com/maps?q=${row.pickup_lat},${row.pickup_lng}`;
      map.target = "_blank";
      map.rel = "noopener noreferrer";
      item.appendChild(map);
    }

    if (row.status === "requested") {
      const cancel = el("button", "ride-cancel", "Cancel request");
      cancel.type = "button";
      cancel.addEventListener("click", () => cancelRide(row.id, cancel));
      item.appendChild(cancel);
    }

    return item;
  }

  async function loadRides() {
    const list = $("#ridesList");
    if (!list) return;

    const user = await getUser();
    if (!user) {
      list.replaceChildren(el("p", "ride-note", "Sign in to see your rides."));
      stopTracking();
      return;
    }

    try {
      const { data, error } = await supabase
        .from(TABLE)
        .select("id, created_at, pickup, destination, vehicle_category, passengers, pickup_time, pickup_lat, pickup_lng, status, driver_id")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;

      list.replaceChildren();

      if (!data.length) {
        const empty = el("div", "empty-state");
        empty.appendChild(el("h3", "", "No rides yet"));
        empty.appendChild(el("p", "", "Your ride requests will appear here."));
        list.appendChild(empty);
      } else {
        data.forEach((row) => list.appendChild(rideItem(row)));
      }

      syncTracking(data);
    } catch (error) {
      console.error("MEI Rides: unable to load rides.", error);
      list.replaceChildren(el("p", "ride-note", "We couldn't load your rides. Please refresh and try again."));
    }
  }

  async function cancelRide(id, button) {
    if (!window.confirm("Cancel this ride request?")) return;

    button.disabled = true;

    try {
      const { data, error } = await supabase
        .from(TABLE)
        .update({ status: "cancelled" })
        .eq("id", id)
        .eq("status", "requested")
        .select("id");
      if (error) throw error;

      if (!data || !data.length) {
        if (window.MEI && window.MEI.showToast) {
          window.MEI.showToast("This request can no longer be cancelled. It may already have been accepted.", "error");
        }
      } else if (window.MEI && window.MEI.showToast) {
        window.MEI.showToast("Ride request cancelled.", "success");
      }
    } catch (error) {
      console.error("MEI Rides: cancel failed.", error);
      if (window.MEI && window.MEI.showToast) window.MEI.showToast("Unable to cancel. Please try again.", "error");
    }

    loadRides();
  }

  // Live updates when your team or the driver changes a status.
  function subscribe(user) {
    try {
      supabase
        .channel("ride-requests-" + user.id)
        .on("postgres_changes",
          { event: "*", schema: "public", table: TABLE, filter: `user_id=eq.${user.id}` },
          () => loadRides())
        .subscribe();
    } catch (error) {
      console.warn("MEI Rides: live updates unavailable.", error);
    }
  }

  /* ----------------------------------------------------------
     INIT
  ---------------------------------------------------------- */

  function wantsRides(user) {
    const params = new URLSearchParams(window.location.search);
    if (params.get("service") === "rides" || window.location.hash === "#rides") return true;

    // Intent saved before sign-in that wasn't consumed by the redirect.
    if (user) {
      try {
        const saved = sessionStorage.getItem(AFTER_LOGIN_KEY);
        if (saved && /service=rides/.test(saved)) {
          sessionStorage.removeItem(AFTER_LOGIN_KEY);
          return true;
        }
      } catch (_) { /* storage unavailable */ }
    }
    return false;
  }

  function bindNavigation() {
    document.addEventListener("click", (event) => {
      const rideLink = event.target.closest('[data-section="rides"], [data-section-link="rides"], .dashboard-main a[href="rides.html"]');
      if (!rideLink) return;
      event.preventDefault();
      showSection("rides");
    });
  }

  async function init() {
    if (!$("#dashboardMain")) return;

    injectStyles();
    buildSection();
    addNavItem();
    bindNavigation();

    if (!supabase) {
      setMessage("Ride requests are temporarily unavailable.", "error");
      return;
    }

    const user = await getUser();

    if (user) {
      prefillPhone(user);
      loadRides();
      subscribe(user);
    }

    if (wantsRides(user)) {
      showSection("rides");
      // dashboard.js may finish its own start-up after this runs; apply once more.
      window.setTimeout(() => showSection("rides"), 400);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})(window, document);
