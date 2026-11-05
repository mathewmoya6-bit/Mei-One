/* MEI One admin extension: services and prices, providers, finance.
   Load AFTER the inline admin script. Needs admin-setup.sql to have been run. */
(function (window, document) {
  "use strict";

  var sb = window.MEI_SUPABASE || window.supabaseClient || window.MEISupabase;

  // Sidebar section -> text matched against services.service_code / service_name
  var SERVICE_SECTIONS = {
    delivery: "deliver", towing: "tow", roadside: "roadside", accident: "accident",
    auto: "auto", marketplace: "market", home: "home", learn: "learn"
  };
  var PAID = ["completed", "success", "successful", "paid", "succeeded"];
  var PROVIDER_FILTERS = [["all", "All"], ["pending", "Pending"], ["approved", "Approved"], ["suspended", "Suspended"], ["rejected", "Rejected"]];

  function h(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined && text !== null) n.textContent = text;
    return n;
  }
  function btn(text, cls, fn) {
    var b = h("button", "btn btn-small " + (cls || ""), text);
    b.type = "button";
    b.addEventListener("click", function () { fn(b); });
    return b;
  }
  function field(label, node) {
    var l = h("label", "field", label);
    l.appendChild(node);
    return l;
  }
  function num(value) {
    var i = h("input");
    i.type = "number"; i.min = "0"; i.step = "any"; i.value = value == null ? 0 : value;
    return i;
  }
  function chip(text, status) {
    var c = h("span", "chip", text);
    c.dataset.status = status;
    return c;
  }
  function kes(n) { return "KES " + Math.round(Number(n) || 0).toLocaleString("en-KE"); }
  function when(v) { return v ? new Date(v).toLocaleString("en-KE", { dateStyle: "medium", timeStyle: "short" }) : "—"; }
  function toast(msg, isError) {
    var t = document.getElementById("toast");
    if (!t) return;
    t.textContent = msg; t.dataset.type = isError ? "error" : "info"; t.hidden = false;
    clearTimeout(toast.timer);
    toast.timer = setTimeout(function () { t.hidden = true; }, 4000);
  }
  function wrap(body) {
    body.replaceChildren();
    var w = h("div"); w.style.padding = "20px";
    body.appendChild(w);
    return w;
  }
  function message(w, text) { w.replaceChildren(h("div", "empty-state", text)); }

  async function call(name, args, ok, done, button) {
    if (button) button.disabled = true;
    try {
      var r = await sb.rpc(name, args);
      if (r.error) throw r.error;
      toast(ok);
      if (done) done();
    } catch (e) {
      console.error("MEI Admin:", name, e);
      toast(e.message || "That didn't work. Try again.", true);
    } finally {
      if (button) button.disabled = false;
    }
  }

  function statCards(items) {
    var g = h("div", "stat-grid");
    items.forEach(function (it) {
      var c = h("article", "stat-card");
      c.appendChild(h("div", "stat-label", it[0]));
      c.appendChild(h("div", "stat-value", it[1]));
      if (it[2]) c.appendChild(h("div", "stat-note", it[2]));
      g.appendChild(c);
    });
    return g;
  }

  /* ---------------- SERVICES AND PRICES ---------------- */

  async function loadServices() {
    var r = await sb.from("services").select("*").order("display_order", { ascending: true });
    if (r.error) throw r.error;
    return r.data || [];
  }

  function serviceCard(s, reload) {
    var card = h("article", "item");
    var top = h("div", "item-top");
    top.appendChild(h("div", "title", (s.icon || "📋") + " " + s.service_name));
    top.appendChild(chip(s.is_active ? "Active" : "Switched off", s.is_active ? "on" : "off"));
    card.appendChild(top);
    if (s.description) card.appendChild(h("div", "meta", s.description));

    var grid = h("div", "grid-2"); grid.style.marginTop = "12px";
    var base = num(s.base_price), km = num(s.price_per_km), com = num(s.commission_pct);
    com.max = "100";
    grid.appendChild(field("Base price (KES)", base));
    grid.appendChild(field("Price per km (KES)", km));
    grid.appendChild(field("Platform commission (%)", com));
    card.appendChild(grid);

    var actions = h("div", "actions");
    actions.appendChild(btn("Save prices", "", function (b) {
      call("admin_set_service_pricing", {
        p_service: s.id, p_base: Number(base.value), p_per_km: Number(km.value), p_commission: Number(com.value)
      }, "Prices saved.", reload, b);
    }));
    actions.appendChild(btn(s.is_active ? "Switch off" : "Switch on", s.is_active ? "btn-danger" : "btn-outline", function (b) {
      if (s.is_active && !window.confirm("Switch off " + s.service_name + "? Customers won't be able to request it.")) return;
      call("admin_set_service_active", { p_service: s.id, p_active: !s.is_active },
        s.is_active ? "Service switched off." : "Service switched on.", reload, b);
    }));
    card.appendChild(actions);
    return card;
  }

  async function renderServices(body, keyword) {
    var w = wrap(body);
    message(w, "Loading…");
    try {
      var all = await loadServices();
      var rows = keyword ? all.filter(function (s) {
        return (String(s.service_code || "") + " " + String(s.service_name || "")).toLowerCase().indexOf(keyword) !== -1;
      }) : all;

      var reload = function () { renderServices(body, keyword); };
      w.replaceChildren();

      if (!rows.length) {
        w.appendChild(h("div", "empty-state", keyword
          ? "No matching service found. Add it to the services table, then refresh."
          : "No services found in the services table."));
        return;
      }

      var list = h("div", "list");
      rows.forEach(function (s) { list.appendChild(serviceCard(s, reload)); });
      w.appendChild(list);

      if (keyword) await appendRequests(w, rows);
    } catch (e) {
      console.error(e);
      message(w, "Could not load services: " + (e.message || e));
    }
  }

  async function appendRequests(w, services) {
    var ids = services.map(function (s) { return s.id; });
    var r = await sb.from("service_requests").select("*").in("service_id", ids)
      .order("created_at", { ascending: false }).limit(50);
    var head = h("h3", "", "Recent requests"); head.style.margin = "24px 0 12px";
    w.appendChild(head);
    if (r.error) { w.appendChild(h("div", "empty-state", "Could not load requests: " + r.error.message)); return; }
    if (!r.data.length) { w.appendChild(h("div", "empty-state", "No requests for this service yet.")); return; }

    var list = h("div", "list");
    r.data.forEach(function (q) {
      var c = h("article", "item");
      var top = h("div", "item-top");
      top.appendChild(h("div", "title", q.title || q.service || q.request_type || "Service request"));
      var st = String(q.status || "").toLowerCase();
      top.appendChild(chip(st.replace(/_/g, " ") || "unknown", st));
      c.appendChild(top);
      c.appendChild(h("div", "meta", (q.pickup_address || q.pickup || "No location") + " · " +
        (q.price == null ? "No price" : kes(q.price)) + " · " + when(q.created_at)));
      list.appendChild(c);
    });
    w.appendChild(list);
  }

  /* ---------------- PROVIDERS ---------------- */

  var providerFilter = "all";

  async function renderProviders(body) {
    var w = wrap(body);
    message(w, "Loading…");
    try {
      var res = await Promise.all([
        sb.from("partners").select("*"),
        sb.from("partner_services").select("partner_id,service_id,status"),
        loadServices(),
        sb.from("partner_applications").select("*").in("status", ["new", "reviewing"]).order("created_at", { ascending: false })
      ]);
      if (res[0].error) throw res[0].error;
      if (res[1].error) throw res[1].error;

      var partners = (res[0].data || []).sort(function (a, b) {
        return String(b.created_at || "").localeCompare(String(a.created_at || ""));
      });
      var links = res[1].data || [];
      var services = res[2];
      var apps = res[3].error ? [] : (res[3].data || []);
      var reload = function () { renderProviders(body); };

      w.replaceChildren();

      var counts = {};
      partners.forEach(function (p) { counts[p.status] = (counts[p.status] || 0) + 1; });
      w.appendChild(statCards([
        ["Providers", partners.length],
        ["Approved", counts.approved || 0],
        ["Pending", counts.pending || 0],
        ["Suspended", counts.suspended || 0]
      ]));

      // Waiting applications
      if (apps.length) {
        var ah = h("h3", "", "Applications waiting (" + apps.length + ")");
        ah.style.margin = "4px 0 12px";
        w.appendChild(ah);
        var alist = h("div", "list"); alist.style.marginBottom = "24px";
        apps.forEach(function (a) {
          var c = h("article", "item");
          var top = h("div", "item-top");
          top.appendChild(h("div", "title", a.full_name + (a.business_name ? " (" + a.business_name + ")" : "")));
          top.appendChild(chip(a.status, a.status));
          c.appendChild(top);
          c.appendChild(h("div", "meta", (a.partner_type || "") + " · " + (a.location || "") + " · " + (a.phone || "") + " · " + (a.email || "")));
          var act = h("div", "actions");
          act.appendChild(btn("Approve as provider", "", function (b) {
            call("admin_approve_application", { p_app: a.id }, "Provider approved. Assign their services below.", reload, b);
          }));
          c.appendChild(act);
          alist.appendChild(c);
        });
        w.appendChild(alist);
      }

      // Filters
      var tb = h("div", "toolbar");
      var fl = h("div", "filters");
      PROVIDER_FILTERS.forEach(function (f) {
        var b = h("button", "filter", f[1]);
        b.type = "button";
        b.setAttribute("aria-pressed", providerFilter === f[0] ? "true" : "false");
        b.addEventListener("click", function () { providerFilter = f[0]; reload(); });
        fl.appendChild(b);
      });
      tb.appendChild(fl);
      w.appendChild(tb);

      var rows = partners.filter(function (p) { return providerFilter === "all" || p.status === providerFilter; });
      if (!rows.length) { w.appendChild(h("div", "empty-state", "No providers in this group.")); return; }

      var list = h("div", "list");
      rows.forEach(function (p) { list.appendChild(providerCard(p, links, services, reload)); });
      w.appendChild(list);
    } catch (e) {
      console.error(e);
      message(w, "Could not load providers: " + (e.message || e) + ". Run admin-setup.sql first if you haven't.");
    }
  }

  function providerCard(p, links, services, reload) {
    var card = h("article", "item");
    var top = h("div", "item-top");
    top.appendChild(h("div", "title", p.business_name || p.full_name || "Unnamed provider"));
    top.appendChild(chip(p.status, p.status === "approved" ? "approved" : p.status === "pending" ? "new" : "rejected"));
    card.appendChild(top);
    card.appendChild(h("div", "meta", [p.type, p.phone, p.email].filter(Boolean).join(" · ") +
      (p.is_online ? " · Online" : " · Offline")));
    if (p.status_reason) card.appendChild(h("div", "notes", "Reason: " + p.status_reason));

    // Assigned services
    var mine = links.filter(function (l) { return l.partner_id === p.id; }).map(function (l) { return l.service_id; });
    var sh = h("div", "meta"); sh.style.marginTop = "10px";
    sh.textContent = mine.length ? "Services:" : "No services assigned yet.";
    card.appendChild(sh);
    var chips = h("div", "actions");
    mine.forEach(function (sid) {
      var s = services.filter(function (x) { return x.id === sid; })[0];
      if (!s) return;
      chips.appendChild(btn((s.icon || "") + " " + s.service_name + "  ✕", "btn-outline", function (b) {
        call("admin_set_partner_service", { p_partner: p.id, p_service: sid, p_assigned: false }, "Service removed.", reload, b);
      }));
    });
    var free = services.filter(function (s) { return mine.indexOf(s.id) === -1; });
    if (free.length) {
      var sel = h("select");
      var o0 = h("option", "", "Add a service…"); o0.value = ""; sel.appendChild(o0);
      free.forEach(function (s) { var o = h("option", "", s.service_name); o.value = s.id; sel.appendChild(o); });
      sel.addEventListener("change", function () {
        if (!sel.value) return;
        call("admin_set_partner_service", { p_partner: p.id, p_service: sel.value, p_assigned: true }, "Service added.", reload, null);
      });
      chips.appendChild(sel);
    }
    card.appendChild(chips);

    // Status actions
    var act = h("div", "actions");
    var name = p.business_name || p.full_name || "this provider";
    if (p.status !== "approved") {
      act.appendChild(btn(p.status === "suspended" ? "Reinstate" : "Approve", "", function (b) {
        call("admin_set_partner_status", { p_partner: p.id, p_status: "approved", p_reason: null }, "Provider approved.", reload, b);
      }));
    }
    if (p.status === "approved") {
      act.appendChild(btn("Suspend", "btn-danger", function (b) {
        var reason = window.prompt("Reason for suspending " + name + "?");
        if (reason === null) return;
        call("admin_set_partner_status", { p_partner: p.id, p_status: "suspended", p_reason: reason.trim() || null }, "Provider suspended.", reload, b);
      }));
    }
    if (p.status === "pending") {
      act.appendChild(btn("Reject", "btn-danger", function (b) {
        var reason = window.prompt("Reason for rejecting " + name + "?");
        if (reason === null) return;
        call("admin_set_partner_status", { p_partner: p.id, p_status: "rejected", p_reason: reason.trim() || null }, "Provider rejected.", reload, b);
      }));
    }
    act.appendChild(btn("Delete", "btn-danger", function (b) {
      if (!window.confirm("Delete " + name + "? This removes their provider profile and service assignments. Their login account is kept. This can't be undone.")) return;
      call("admin_delete_partner", { p_partner: p.id }, "Provider deleted.", reload, b);
    }));
    card.appendChild(act);
    return card;
  }

  /* ---------------- FINANCE ---------------- */

  function amountOf(p) { return Number(p.amount != null ? p.amount : p.total != null ? p.total : p.price) || 0; }
  function statusOf(p) { return String(p.status || "").toLowerCase(); }

  async function renderFinance(body) {
    var w = wrap(body);
    message(w, "Loading…");
    try {
      var res = await Promise.all([
        sb.from("payments").select("*").order("created_at", { ascending: false }).limit(500),
        loadServices()
      ]);
      if (res[0].error) throw res[0].error;
      var pay = res[0].data || [];
      var services = res[1];

      var paid = pay.filter(function (p) { return PAID.indexOf(statusOf(p)) !== -1; });
      var revenue = paid.reduce(function (t, p) { return t + amountOf(p); }, 0);
      var pending = pay.filter(function (p) { return statusOf(p) === "pending"; })
        .reduce(function (t, p) { return t + amountOf(p); }, 0);
      var failed = pay.filter(function (p) { return ["failed", "cancelled", "refunded"].indexOf(statusOf(p)) !== -1; }).length;
      var avgCom = services.length
        ? services.reduce(function (t, s) { return t + Number(s.commission_pct || 0); }, 0) / services.length : 0;

      w.replaceChildren();
      w.appendChild(statCards([
        ["Revenue collected", kes(revenue), paid.length + " completed payments"],
        ["Platform commission", kes(revenue * avgCom / 100), "Estimate at " + avgCom.toFixed(1) + "% average"],
        ["Pending", kes(pending), "Awaiting confirmation"],
        ["Failed or refunded", failed, "Payments"]
      ]));

      var tb = h("div", "toolbar");
      tb.appendChild(h("h3", "", "Latest payments (" + pay.length + ")"));
      tb.appendChild(btn("Export CSV", "btn-outline", function () { exportCsv(pay); }));
      w.appendChild(tb);

      if (!pay.length) { w.appendChild(h("div", "empty-state", "No payments recorded yet.")); return; }

      var wrapT = h("div", "table-wrap");
      var t = h("table", "data-table");
      var hr = h("tr");
      ["Date", "Reference", "Method", "Amount", "Status"].forEach(function (x) { hr.appendChild(h("th", "", x)); });
      var th = h("thead"); th.appendChild(hr); t.appendChild(th);
      var tbd = h("tbody");
      pay.slice(0, 100).forEach(function (p) {
        var tr = h("tr");
        [when(p.created_at), p.reference || p.transaction_id || p.mpesa_receipt || String(p.id).slice(0, 8),
         p.method || p.provider || "—", kes(amountOf(p)), statusOf(p) || "unknown"]
          .forEach(function (x) { tr.appendChild(h("td", "", x)); });
        tbd.appendChild(tr);
      });
      t.appendChild(tbd); wrapT.appendChild(t); w.appendChild(wrapT);
    } catch (e) {
      console.error(e);
      message(w, "Could not load payments: " + (e.message || e) + ". Run admin-setup.sql first if you haven't.");
    }
  }

  function exportCsv(rows) {
    if (!rows.length) { toast("Nothing to export.", true); return; }
    var cols = Object.keys(rows[0]);
    var esc = function (v) { v = v == null ? "" : String(v); return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; };
    var csv = [cols.join(",")].concat(rows.map(function (r) { return cols.map(function (c) { return esc(r[c]); }).join(","); })).join("\n");
    var a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = "mei-one-payments-" + new Date().toISOString().slice(0, 10) + ".csv";
    document.body.appendChild(a); a.click(); a.remove();
  }

  /* ---------------- ENTRY POINT ---------------- */

  // Returns true when this module drew the section.
  window.MEIAdmin = {
    render: function (name, body, titleEl) {
      if (!sb) return false;
      var titles = { services: "Services and prices", providers: "Service providers", finance: "Financial management", payments: "Financial management" };
      if (name === "services") { titleEl.textContent = titles[name]; renderServices(body, null); return true; }
      if (name === "providers") { titleEl.textContent = titles[name]; renderProviders(body); return true; }
      if (name === "finance" || name === "payments") { titleEl.textContent = titles[name]; renderFinance(body); return true; }
      if (SERVICE_SECTIONS[name]) {
        titleEl.textContent = titleEl.textContent || name;
        renderServices(body, SERVICE_SECTIONS[name]);
        return true;
      }
      return false;
    }
  };
})(window, document);
