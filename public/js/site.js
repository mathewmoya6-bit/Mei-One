(() => {
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const sb = window.meiSupabase;
$('#currentYear').textContent = new Date().getFullYear();

const menuBtn = $('#mobileMenuButton'), nav = $('#mainNavigation');
const setMenu = o => { nav.classList.toggle('open', o); menuBtn.setAttribute('aria-expanded', o); };
menuBtn.onclick = () => setMenu(!nav.classList.contains('open'));
$$('#mainNavigation a').forEach(a => a.addEventListener('click', () => setMenu(false)));

// Landing service names -> app service keys. null = not live yet.
const APP_KEY = { rides: 'ride', delivery: 'delivery', towing: 'towing', roadside: 'roadside', auto: 'auto', marketplace: null, 'home-services': null, learn: null };
const field = (id, l, t, ac) => `<label for="${id}">${l}</label><input id="${id}" type="${t || 'text'}" required autocomplete="${ac || 'off'}">`;
const form = (title, sub, fields, cta) => `<h2 id="modalTitle">${title}</h2><p>${sub}</p><form id="mf">${fields}<p class="form-msg" id="msg" role="alert"></p><button class="btn btn-primary btn-block" id="go">${cta}</button></form>`;
const VIEWS = {
  login: () => form('Sign in', 'Welcome back to MEI One.', field('e', 'Email', 'email', 'email') + field('w', 'Password', 'password', 'current-password'), 'Sign in'),
  signup: () => form('Create your account', 'One account for every MEI One service.', field('n', 'Full name', 'text', 'name') + field('p', 'Phone', 'tel', 'tel') + field('e', 'Email', 'email', 'email') + field('w', 'Password (8+ characters)', 'password', 'new-password'), 'Create account'),
  emergency: () => `<h2 id="modalTitle">Vehicle emergency</h2><p>If anyone is in danger or hurt, call <b>999</b> or <b>112</b> first.</p><p>Then request towing or roadside help and we will connect you with an operator.</p><a class="btn btn-primary btn-block" href="app.html#towing">Request towing</a><a class="btn btn-outline btn-block" href="app.html#roadside">Request roadside help</a>`,
  partner: () => `<h2 id="modalTitle">Become a partner</h2><p>Sign in, then submit your details and documents. We verify them before you can take jobs or sell.</p><a class="btn btn-primary btn-block" href="partner.html">Partner sign in and application</a><a class="btn btn-outline btn-block" href="business.html">Merchant sign in and application</a>`,
  soon: name => `<h2 id="modalTitle">Coming soon</h2><p>${name} is not live yet. Create an account and you will see it as soon as it opens.</p><button class="btn btn-primary btn-block" data-modal="signup" type="button">Create account</button>`
};

const modal = $('#globalModal'), box = $('#modalContent'); let opener = null;
function open(name, arg) {
  box.innerHTML = VIEWS[name](arg);
  modal.classList.add('open'); modal.setAttribute('aria-hidden', 'false');
  const f = $('#mf'); if (f) { $('input', f).focus(); f.onsubmit = ev => submit(ev, name); }
  box.querySelectorAll('[data-modal]').forEach(b => b.onclick = () => open(b.dataset.modal));
}
function close() { modal.classList.remove('open'); modal.setAttribute('aria-hidden', 'true'); opener && opener.focus(); }
async function submit(ev, name) {
  ev.preventDefault(); const msg = $('#msg'), go = $('#go'); msg.textContent = '';
  if (!sb) return msg.textContent = 'Could not load required files. Check your connection and reload.';
  go.disabled = true;
  const email = $('#e').value.trim(), password = $('#w').value;
  const r = name === 'signup'
    ? await sb.auth.signUp({ email, password, options: { data: { full_name: $('#n').value.trim(), phone: $('#p').value.trim() } } })
    : await sb.auth.signInWithPassword({ email, password });
  go.disabled = false;
  if (r.error) return msg.textContent = r.error.message;
  if (name === 'signup' && !r.data.session) return msg.textContent = 'Check your email to confirm your account, then sign in.';
  location.href = 'app.html';
}
document.addEventListener('click', e => {
  const m = e.target.closest('[data-modal]'), s = e.target.closest('[data-service]');
  if (e.target.closest('[data-modal-close]')) return close();
  if (m && !box.contains(m)) { opener = m; open(m.dataset.modal); }
  if (s) { const k = APP_KEY[s.dataset.service]; k ? location.href = 'app.html#' + k : (opener = s, open('soon', s.closest('.service-card')?.querySelector('h3')?.textContent || 'This service')); }
});
document.addEventListener('keydown', e => { if (e.key === 'Escape' && modal.classList.contains('open')) close(); });
})();
