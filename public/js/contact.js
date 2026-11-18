/* MEI ONE — fills support contact details from js/config.js (supportEmail / supportPhone).
   Elements with data-mei-email / data-mei-phone are shown only when a value is configured;
   elements with data-mei-contact-fallback are shown only when none is. */
(function () {
  "use strict";
  var c = window.MEI_CONFIG || {};
  var email = String(c.supportEmail || "").trim();
  var phone = String(c.supportPhone || "").trim();
  var phoneDigits = phone.replace(/[^\d+]/g, "");

  document.querySelectorAll("[data-mei-email]").forEach(function (el) {
    if (!email) { el.hidden = true; return; }
    var a = el.querySelector("a") || el;
    a.textContent = email; if (a.tagName === "A") a.href = "mailto:" + email;
  });
  document.querySelectorAll("[data-mei-phone]").forEach(function (el) {
    if (!phone) { el.hidden = true; return; }
    var a = el.querySelector("a") || el;
    a.textContent = phone; if (a.tagName === "A") a.href = "tel:" + phoneDigits;
  });
  document.querySelectorAll("[data-mei-contact-fallback]").forEach(function (el) {
    el.hidden = !!(email || phone);
  });
})();
