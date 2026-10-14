// ============================================================
//  Premium UI components + user session / activity tracking
// ============================================================
import { esc, qs, toBn, cleanHtml, textToHtml, autoDir, plainText } from './islamic.js';
import { db, doc, getDoc, getDocs, collection, setDoc } from './firebase.js';
import { T, setLabels } from './labels.js';
export { esc, qs, toBn, cleanHtml, textToHtml, autoDir, plainText, T };

/* ---------------- icons (inline svg, no CDN) ---------------- */
const S = (p, extra = '') => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" ${extra}>${p}</svg>`;
export const ICON = {
  home: S('<path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 10v9.5h13V10"/><path d="M10 19.5v-5h4v5"/>'),
  search: S('<circle cx="11" cy="11" r="6.5"/><path d="m20 20-4-4"/>'),
  user: S('<circle cx="12" cy="8.5" r="3.8"/><path d="M4.5 20c.7-3.8 3.7-5.8 7.5-5.8s6.8 2 7.5 5.8"/>'),
  back: S('<path d="m14.5 5-7 7 7 7"/>'),
  next: S('<path d="m9.5 5 7 7-7 7"/>'),
  check: S('<path d="m5 12.5 4.5 4.5L19 7.5"/>'),
  out: S('<path d="M9 4.5H5.5v15H9"/><path d="M16 8l4 4-4 4"/><path d="M20 12H9.5"/>'),
  eye: S('<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z"/><circle cx="12" cy="12" r="2.8"/>'),
  flame: S('<path d="M12 3c.5 3.2 4.5 5 4.5 9.5a4.5 4.5 0 0 1-9 0c0-1.8.8-3 1.8-4 .2 1.2.9 1.8 1.7 2C11 8.5 11 5.5 12 3Z"/>'),
  book: S('<path d="M4 5.5C6.5 4.5 9.5 4.5 12 6c2.5-1.5 5.5-1.5 8-.5v13c-2.5-1-5.5-1-8 .5-2.5-1.5-5.5-1.5-8-.5Z"/><path d="M12 6v13"/>'),
  clock: S('<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>'),
  cal: S('<rect x="4" y="5.5" width="16" height="14.5" rx="3"/><path d="M4 10h16M8.5 3.5v4M15.5 3.5v4"/>'),
  edit: S('<path d="M4 20h4l10.5-10.5a2.1 2.1 0 0 0-4-4L4 16v4Z"/>'),
  shield: S('<path d="M12 3.5 19 6v5.5c0 4.3-3 7.6-7 9-4-1.4-7-4.7-7-9V6l7-2.5Z"/><path d="m9 12 2.2 2.2L15.5 10"/>'),
  eyeoff: S('<path d="M3 3l18 18"/><path d="M10.6 6A9.5 9.5 0 0 1 12 5.5c6 0 9.5 6.5 9.5 6.5a16 16 0 0 1-3 3.8M6.5 7.5A16 16 0 0 0 2.5 12S6 18.5 12 18.5c1.4 0 2.6-.3 3.7-.8"/>'),
  mail: S('<rect x="3.5" y="5.5" width="17" height="13" rx="3"/><path d="m4.5 8 7.5 5.5L19.5 8"/>'),
  lock: S('<rect x="5" y="10.5" width="14" height="9.5" rx="3"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/>'),
  plus: S('<path d="M12 5v14M5 12h14"/>'),
  minus: S('<path d="M5 12h14"/>'),
};
const DIA = `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2.5 21.5 12 12 21.5 2.5 12Z"/></svg>`;
export { DIA };

/* ---------------- Islamic backgrounds: green / gold / white only ---------------- */
const rnd = (() => { let x = 13; return () => (x = (x * 16807) % 2147483647) / 2147483647; })();
const pts = (n, ro, ri, c = 100) => Array.from({ length: n * 2 }, (_, i) => { const r = i % 2 ? ri : ro, a = Math.PI * i / n - Math.PI / 2; return (c + r * Math.cos(a)).toFixed(1) + ',' + (c + r * Math.sin(a)).toFixed(1); }).join(' ');
let uid = 0;
const G = 'var(--c2)', GD = 'var(--deep)', GOLD = 'var(--gold)', GOLDL = 'var(--gold-l)', WHITE = '#FFFFFF', PALE = 'var(--pale)';
/* ---- colour palette: 4 colours [background, primary, accent, light]; set from admin, applied on every page ---- */
export function applyPalette(p) {
  if (!Array.isArray(p) || p.length !== 4 || !p.every(c => /^#[0-9a-f]{6}$/i.test(c))) return;
  const r = document.documentElement.style; ['--c1', '--c2', '--c3', '--c4'].forEach((k, i) => r.setProperty(k, p[i]));
  try { localStorage.setItem('p_pal', JSON.stringify(p)); } catch (e) { /* ignore */ }
}
export const DEFAULT_PALETTES = [
  { id: 'p1', c: ['#0E4D3A', '#0F5A46', '#D4A83F', '#F7F1E1'] },
  { id: 'p2', c: ['#0B3B3C', '#14706F', '#E8B84F', '#F4F8F5'] },
  { id: 'p3', c: ['#12264A', '#1D3F7A', '#E3B04B', '#F6F2E6'] },
  { id: 'p4', c: ['#4A1220', '#7A1F36', '#E0AE5A', '#FBF3E8'] },
  { id: 'p5', c: ['#2D1B4E', '#4A2F7C', '#E6B35C', '#F7F2FA'] }
];
/* auto mode: every 24h the next colour box of the saved list is used (computed from the saved start time, no server needed) */
export function autoPalette(s) {
  if (!s || !s.paletteAuto || !Array.isArray(s.paletteBoxes) || !s.paletteBoxes.length) return null;
  const n = s.paletteBoxes.length, d = Math.max(0, Math.floor((Date.now() - (s.paletteAutoStart || Date.now())) / 86400000));
  const b = s.paletteBoxes[(((s.paletteAutoIdx || 0) + d) % n + n) % n];
  return b && b.c;
}
try { applyPalette(JSON.parse(localStorage.getItem('p_pal') || 'null')); } catch (e) { /* ignore */ }
const STAR8 = `<svg viewBox="0 0 200 200" fill="currentColor"><polygon points="${pts(8, 98, 52)}"/></svg>`;
const MOON = () => { const m = 'mn' + (uid++); return `<svg viewBox="0 0 100 100"><defs><mask id="${m}"><rect width="100" height="100" fill="#fff"/><circle cx="66" cy="40" r="36" fill="#000"/></mask></defs><circle cx="46" cy="52" r="40" fill="currentColor" mask="url(#${m})"/></svg>`; };

/* ---------------- hero: clean banner ---------------- */
export function heroHtml(title, sub = '') {
  return `<section class="p-hero"><div class="hr-ic"><span style="color:${GOLD}">${MOON()}</span><span style="color:${WHITE}">${STAR8}</span></div>
    <h1 class="p-sitename p-t">${esc(title)}</h1>${sub ? `<p class="p-subt">${esc(sub)}</p>` : ''}</section>`;
}

/* ---------------- background: one flat colour + a few small stars ---------------- */
export function mountBg() {
  if (document.querySelector('.p-bg')) return;
  document.documentElement.style.setProperty('--bar', 'var(--deep)');
  const r = (() => { let x = 7; return () => (x = (x * 16807) % 2147483647) / 2147483647; })();
  const st = Array.from({ length: 34 }, (_, i) => { const z = 7 + Math.floor(r() * 14), gold = i % 3 !== 0;
    return `<i style="left:${(r() * 96 + 2).toFixed(1)}%;top:${(r() * 92 + 2).toFixed(1)}%;width:${z}px;height:${z}px;background:${gold ? 'var(--gold)' : '#fff'};--d:${(1.6 + r() * 2.8).toFixed(2)}s;--w:${(-r() * 5).toFixed(2)}s"></i>`; }).join('');
  document.body.insertAdjacentHTML('afterbegin', `<div class="p-bg" aria-hidden="true">${st}</div>`);
  let tk = false;
  const update = () => {
    tk = false; const vh = innerHeight;
    document.querySelectorAll('.rv.in').forEach(n => {
      const q = n.getBoundingClientRect(); if (q.bottom < -40 || q.top > vh + 40) return;
      const d = Math.max(-1, Math.min(1, ((q.top + q.height / 2) - vh / 2) / (vh / 2)));
      n.style.setProperty('--t', (d * 10).toFixed(1) + 'deg');
    });
  };
  const on = () => { if (!tk) { tk = true; requestAnimationFrame(update); } };
  addEventListener('scroll', on, { passive: true }); addEventListener('resize', on); setTimeout(update, 300); setInterval(update, 900);
}

/* ---------------- site data (settings + home buttons) and editable texts ---------------- */
export const SITE_KEY = 'p_site_v2';
const readCache = () => { try { return JSON.parse(sessionStorage.getItem(SITE_KEY) || 'null'); } catch (e) { return null; } };
async function fetchSite() {
  const d = { s: {}, h: [] };
  try { const s = await getDoc(doc(db, 'settings', 'main')); if (s.exists()) { d.s = s.data(); const ap = autoPalette(d.s); if (ap || d.s.palette) applyPalette(ap || d.s.palette); } } catch (e) { /* ignore */ }
  try { const q = await getDocs(collection(db, 'home_buttons')); d.h = q.docs.map(x => ({ id: x.id, name: x.data().name || '', order: x.data().order || 0 })).filter(x => x.name).sort((a, b) => a.order - b.order); } catch (e) { /* ignore */ }
  try { sessionStorage.setItem(SITE_KEY, JSON.stringify({ t: Date.now(), d })); } catch (e) { /* ignore */ }
  return d;
}
export async function siteData() {
  const c = readCache();
  if (c) { if (Date.now() - c.t > 120000) fetchSite(); return c.d; }
  return fetchSite();
}
try { const d = await siteData(); setLabels(d.s && d.s.labels); const ap = autoPalette(d.s); if (ap) applyPalette(ap); } catch (e) { /* defaults are used */ }

/* ---------------- clouds at the very bottom of every page (drifting, no footer) ---------------- */
function cloudTile(seed, W, H, base, rmin, rmax, c1, c2) {
  let x = seed; const r = () => (x = (x * 16807) % 2147483647) / 2147483647;
  const n = Math.round(W / (rmin * 0.85)); let body = '';
  for (let i = 0; i < n; i++) {
    const cx = (i + .5) * (W / n) + (r() - .5) * 8, rad = rmin + r() * (rmax - rmin), cy = base + (r() - .5) * 6 - (rad - rmin) * .35;
    [-W, 0, W].forEach(o => { body += `<circle cx="${(cx + o).toFixed(1)}" cy="${cy.toFixed(1)}" r="${rad.toFixed(1)}"/>`; });
  }
  body += `<rect x="0" y="${base + rmin * .3}" width="${W}" height="${H}"/>`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><defs><linearGradient id="g" gradientUnits="userSpaceOnUse" x1="0" y1="${base - rmax}" x2="0" y2="${base + rmax * 1.6}"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient></defs><g fill="url(#g)">${body}</g></svg>`;
  return 'url("data:image/svg+xml,' + encodeURIComponent(svg) + '")';
}
export function mountClouds() {
  if (document.querySelector('.p-clouds')) return;
  const L = [
    [11, 900, 190, 70, 30, 52, '#AFC0C3', '#E9F0F0', 'pCl1', 110],
    [29, 700, 160, 78, 28, 46, '#D5E0E1', '#FFFFFF', 'pCl2', 70],
    [47, 600, 120, 76, 24, 40, '#F2F6F6', '#FFFFFF', 'pCl1', 46]
  ];
  const el = document.createElement('div'); el.className = 'p-clouds'; el.setAttribute('aria-hidden', '1');
  L.forEach(([sd, W, H, base, a, b, c1, c2, anim, dur]) => {
    const d = document.createElement('div'); d.className = 'cl';
    d.style.height = H + 'px'; d.style.backgroundImage = cloudTile(sd, W, H, base, a, b, c1, c2); d.style.backgroundSize = W + 'px ' + H + 'px';
    d.style.setProperty('--w', W + 'px'); d.style.animation = `${anim} ${dur}s linear infinite`; el.appendChild(d);
  });
  document.body.appendChild(el);
}

export function navHtml(active = 'home') {
  const it = (k, href, ic, label) =>
    `<a href="${href}" class="${active === k ? 'on' : ''}" ${active === k ? 'aria-current="page"' : ''}><b>${ic}</b><span>${label}</span></a>`;
  return `<nav class="p-nav" aria-label="মূল মেনু">${it('home', 'index.html', ICON.home, esc(T('nav_home')))}${it('search', 'search.html', ICON.search, esc(T('nav_search')))}${it('profile', 'profile.html', ICON.user, esc(T('nav_profile')))}</nav>`;
}
export function mountNav(active) { document.body.insertAdjacentHTML('beforeend', navHtml(active)); mountClouds(); }

export function topHtml({ title = '', sub = '', back = 'index.html', right = '' } = {}) {
  return `<header class="p-top"><div class="p-top-in">
    <a class="p-back" id="pBack" href="${esc(back)}" aria-label="পেছনে">${ICON.back}</a>
    <div class="p-top-mid"><h1 id="pTitle">${esc(title)}</h1><small id="pSub">${esc(sub)}</small></div>
    <div class="p-top-r">${right}</div></div></header>`;
}
export function setTop(title, sub) {
  const t = document.getElementById('pTitle'), s = document.getElementById('pSub');
  if (t && title != null) t.textContent = title;
  if (s && sub != null) s.textContent = sub;
}

export const loaderHtml = (n = 4) => `<div class="p-skel">${'<i></i>'.repeat(n)}</div>`;
export const msgHtml = (text, err = false) => `<p class="p-msg${err ? ' err' : ''}">${esc(text)}</p>`;
export const emptyHtml = (icon, title, sub = '') => `<div class="p-empty"><b>${icon}</b><h3>${esc(title)}</h3>${sub ? `<p>${esc(sub)}</p>` : ''}</div>`;
export const divider = (text = '') => `<div class="p-div"><i></i>${text ? `<span>${esc(text)}</span>` : `<em>${DIA}</em>`}<i></i></div>`;

/* ---------------- the buttons ---------------- */
// ornate golden cartouche (home button) — outline generated in polar form: 4 pointed tips + fat diagonal lobes
const cartPath = (k) => {
  const q = Math.PI / 2, out = [];
  for (let i = 0; i <= 240; i++) {
    const th = i / 240 * Math.PI * 2, phi = Math.abs(((th + q / 2) % q + q) % q - q / 2);
    const r = (60 + Math.pow(Math.max(0, 1 - phi / 0.62), 1.5) * 31 + 9 * Math.pow(Math.sin(2 * th), 2)) * k;
    out.push((100 + r * Math.sin(th)).toFixed(1) + ' ' + (100 - r * Math.cos(th)).toFixed(1));
  }
  return 'M' + out.join('L') + 'Z';
};
const CART = (() => {
  const dots = [45, 135, 225, 315].map(a => { const r = 67, x = 100 + r * Math.sin(a * Math.PI / 180), y = 100 - r * Math.cos(a * Math.PI / 180); return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="4.2" style="fill:var(--gold-d)"/>`; }).join('');
  const drops = [0, 90, 180, 270].map(a => `<path d="M0 0C-5 -7 -4 -12 0 -16C4 -12 5 -7 0 0Z" style="fill:var(--gold-l)" transform="translate(100 100) rotate(${a}) translate(0 -77)"/>`).join('');
  return `<svg viewBox="0 0 200 200" aria-hidden="true"><path d="${cartPath(1.04)}" style="fill:var(--gold);stroke:var(--deep)" stroke-width="3" stroke-linejoin="round"/><path d="${cartPath(0.9)}" fill="none" style="stroke:var(--pale)" stroke-width="2" stroke-linejoin="round"/><path d="${cartPath(0.74)}" style="fill:var(--c2);stroke:var(--pale)" stroke-width="4" stroke-linejoin="round"/><path d="${cartPath(0.7)}" fill="none" style="stroke:var(--gold)" stroke-width="1.2" stroke-linejoin="round"/>${dots}${drops}</svg>`;
})();
export function homeBtnHtml({ label, href = '#', i = 0 }) {
  return `<a class="p-card rv" href="${esc(href)}" style="--i:${Math.min(i, 10)}">${CART}<span class="p-card-txt"><span class="p-t">${esc(label)}</span></span></a>`;
}
const BODY = ['#FFF6DF', '#E3F1E6', '#F6E4B0', '#FFFFFF'];
const GOURD = 'M50 4C58 22 74 24 74 40C74 50 66 54 66 60C66 66 74 70 74 82C74 100 58 104 50 116C42 104 26 100 26 82C26 70 34 66 34 60C34 54 26 50 26 40C26 24 42 22 50 4Z';
const starSvg = (inner = true) => `<svg viewBox="0 0 100 100"><polygon points="${pts(8, 49, 35, 50)}" style="fill:var(--c2);stroke:var(--pale)" stroke-width="2"/><polygon points="${pts(8, 41, 29, 50)}" fill="none" style="stroke:var(--pale)" stroke-width="1.2" opacity=".7"/></svg>`;
const gourdSvg = `<svg viewBox="0 0 100 120"><path d="${GOURD}" style="fill:var(--c2);stroke:var(--pale)" stroke-width="2.4"/><path d="${GOURD}" fill="none" style="stroke:var(--pale)" stroke-width="1.2" opacity=".7" transform="translate(50 60) scale(.8) translate(-50 -60)"/></svg>`;
// Number button: star badge (with the number) + plaque. Section buttons have 5 designs; the design follows the folder depth
// (top level = k0, inside it = k1, inside that = k2 ... then it repeats after 5). Text is always centred on the plaque.
export function btnHtml({ label, href = '#', num = null, i = 0, read = false, kind = 0 }) {
  const isNum = num != null, k = ((kind % 5) + 5) % 5;
  const dia = `<i>${DIA}</i>`;
  let badge = '', cls = isNum ? 'num' : 'sec k' + k, tail = '';
  if (isNum) badge = `<span class="p-bd">${starSvg()}<b>${toBn(num)}</b>${read ? `<u>${ICON.check}</u>` : ''}</span>`;
  else if (k === 0) badge = `<span class="p-bd g lt">${gourdSvg}${dia}</span>`;
  else if (k === 1) badge = `<span class="p-bd lobe l">${dia}</span><span class="p-bd lobe r">${dia}</span>`;
  else if (k === 2) badge = `<span class="p-bd rt">${starSvg()}${dia}</span>`;
  else if (k === 3) { badge = `<span class="p-bd">${starSvg()}${dia}</span>`; tail = '<span class="p-tail"></span>'; }
  else badge = `<span class="p-bd g">${gourdSvg}${dia}</span>`;
  if (isNum) tail = '<span class="p-tail"></span>';
  return `<a class="p-btn rv ${cls}${read ? ' is-read' : ''}" href="${esc(href)}" style="--i:${Math.min(i, 8)};--bf:${BODY[i % 4]}">
    ${tail}<span class="p-pl"><span class="p-t">${esc(label)}</span></span>${badge}</a>`;
}

/* ---------------- scroll reveal + click animation + page curtain ---------------- */
function initFx() {
  if (!document.body.classList.contains('p-body')) return;
  const curtain = document.createElement('div'); curtain.className = 'p-curtain'; document.body.appendChild(curtain);
  // arriving: open the curtain from where the previous click happened
  try {
    const f = sessionStorage.getItem('p_from');
    if (f) {
      sessionStorage.removeItem('p_from'); const [x, y] = f.split(',');
      curtain.style.setProperty('--cx', x + 'px'); curtain.style.setProperty('--cy', y + 'px');
      curtain.classList.add('full'); void curtain.offsetWidth;
      requestAnimationFrame(() => { curtain.classList.remove('full'); curtain.classList.add('open'); });
    }
  } catch (e) { /* ignore */ }
  addEventListener('pageshow', (e) => { if (e.persisted) { curtain.className = 'p-curtain'; document.querySelectorAll('.go').forEach(n => n.classList.remove('go')); } });

  const io = 'IntersectionObserver' in window ? new IntersectionObserver((en) => en.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .12, rootMargin: '0px 0px -20px 0px' }) : null;
  const scan = () => document.querySelectorAll('.rv:not(.in):not([data-o])').forEach(n => { n.dataset.o = 1; io ? io.observe(n) : n.classList.add('in'); });
  new MutationObserver(scan).observe(document.body, { childList: true, subtree: true }); scan();
  setTimeout(() => document.querySelectorAll('.rv:not(.in)').forEach(n => { const r = n.getBoundingClientRect(); if (r.top < innerHeight) n.classList.add('in'); }), 1800);

  document.addEventListener('click', (e) => {
    const a = e.target.closest('a.p-btn, a.p-card, a.p-row'); if (!a || e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey) return;
    const href = a.getAttribute('href'); if (!href || href === '#') return;
    e.preventDefault();
    const r = a.getBoundingClientRect(), x = e.clientX || r.left + r.width / 2, y = e.clientY || r.top + r.height / 2;
    const rip = document.createElement('span'); rip.className = 'p-rip'; rip.style.left = (x - r.left) + 'px'; rip.style.top = (y - r.top) + 'px'; (a.querySelector('.p-pl') || (a.classList.contains('p-card') ? null : a))?.appendChild(rip);
    a.classList.add('go');
    curtain.style.setProperty('--cx', x + 'px'); curtain.style.setProperty('--cy', y + 'px');
    setTimeout(() => { curtain.className = 'p-curtain cover'; }, 120);
    setTimeout(() => { try { sessionStorage.setItem('p_from', Math.round(x) + ',' + Math.round(y)); } catch (er) { /* ignore */ } location.href = href; }, 560);
  });
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initFx); else initFx();

/* ---------------- session + activity ---------------- */
export const dayKey = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
export function streakOf(days = []) {
  const set = new Set(days); let n = 0; const d = new Date();
  if (!set.has(dayKey(d))) d.setDate(d.getDate() - 1);
  while (set.has(dayKey(d))) { n++; d.setDate(d.getDate() - 1); }
  return n;
}
export function ago(ts) {
  if (!ts) return '';
  const s = Math.max(0, (Date.now() - ts) / 1000);
  if (s < 60) return 'এইমাত্র';
  if (s < 3600) return toBn(Math.floor(s / 60)) + ' মিনিট আগে';
  if (s < 86400) return toBn(Math.floor(s / 3600)) + ' ঘন্টা আগে';
  if (s < 86400 * 30) return toBn(Math.floor(s / 86400)) + ' দিন আগে';
  return fmtDate(ts);
}
export function fmtDate(ts) {
  try { return new Date(ts).toLocaleDateString('bn-BD', { day: 'numeric', month: 'short', year: 'numeric' }); } catch (e) { return ''; }
}
export const nameOf = (u, p) => (p && p.name) || (u && (u.displayName || (u.email || '').split('@')[0])) || 'ভাই/বোন';

/* ---- own login system (data lives in Firestore `users`, Firebase Authentication NOT needed) ---- */
const SESSION_KEY = 'isl_uid';
const hex = (buf) => [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
const need = () => { if (!(window.crypto && crypto.subtle)) throw Object.assign(new Error('https'), { code: 'no-crypto' }); };
export async function hashPw(pass, salt) {
  need();
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(pass), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt: new TextEncoder().encode(salt), iterations: 100000, hash: 'SHA-256' }, key, 256);
  return hex(bits);
}
export async function uidOf(email) {
  need();
  return 'u_' + hex(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(String(email).trim().toLowerCase()))).slice(0, 32);
}
const publicUser = (d) => ({ uid: d.uid, email: d.email, displayName: d.name || '', photoURL: '' });
export async function signUp({ name, email, pass }) {
  email = email.trim().toLowerCase();
  const uid = await uidOf(email), ref = doc(db, 'users', uid);
  if ((await getDoc(ref)).exists()) throw Object.assign(new Error('exists'), { code: 'email-exists' });
  const salt = hex(crypto.getRandomValues(new Uint8Array(12))), now = Date.now();
  const d = { uid, name: name.trim(), email, salt, passHash: await hashPw(pass, salt), createdAt: now, lastLoginAt: now, activeDays: [dayKey()] };
  await setDoc(ref, d);
  localStorage.setItem(SESSION_KEY, uid);
  return publicUser(d);
}
export async function signIn(email, pass) {
  email = email.trim().toLowerCase();
  const uid = await uidOf(email), snap = await getDoc(doc(db, 'users', uid));
  if (!snap.exists()) throw Object.assign(new Error('nouser'), { code: 'no-user' });
  const d = snap.data();
  if ((await hashPw(pass, d.salt || '')) !== d.passHash) throw Object.assign(new Error('bad'), { code: 'bad-pass' });
  localStorage.setItem(SESSION_KEY, uid);
  return publicUser(d);
}

export async function requireUser() {
  let uid = null; try { uid = localStorage.getItem(SESSION_KEY); } catch (e) {}
  const goLogin = () => {
    const here = location.pathname.split('/').pop() || 'index.html';
    location.replace('login.html?next=' + encodeURIComponent(here + location.search));
    return new Promise(() => {});
  };
  if (!uid) return goLogin();
  try {
    const snap = await getDoc(doc(db, 'users', uid));
    if (!snap.exists()) { localStorage.removeItem(SESSION_KEY); return goLogin(); }
    profileCache = snap.data();
    return publicUser(profileCache);
  } catch (e) { console.warn('session', e); return goLogin(); }
}

let profileCache = null;
export async function touchUser(u) {
  if (!u) return null;
  try {
    const ref = doc(db, 'users', u.uid), today = dayKey(), now = Date.now();
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    const d = snap.data(), days = Array.isArray(d.activeDays) ? d.activeDays : [];
    let changed = false;
    if (!days.includes(today)) { days.push(today); d.activeDays = days.slice(-400); changed = true; }
    if (!sessionStorage.getItem('p_seen')) { d.lastLoginAt = now; changed = true; }
    if (changed) await setDoc(ref, { activeDays: d.activeDays, lastLoginAt: d.lastLoginAt }, { merge: true });
    try { sessionStorage.setItem('p_seen', '1'); } catch (e) {}
    profileCache = d;
  } catch (e) { console.warn('profile', e); }
  return profileCache;
}

export async function trackRead(u, note) {
  if (!u || !note) return;
  try {
    const id = u.uid + '_' + note.id, ref = doc(db, 'reads', id), now = Date.now();
    const snap = await getDoc(ref);
    const old = snap.exists() ? snap.data() : {};
    await setDoc(ref, { uid: u.uid, noteId: note.id, name: note.name || '', sectionId: note.sectionId || '', sectionName: note.sectionName || '',
      homeId: note.homeId || '', homeName: note.homeName || '', count: (old.count || 0) + 1, firstAt: old.firstAt || now, lastAt: now });
    await setDoc(doc(db, 'users', u.uid), { lastRead: { id: note.id, name: note.name || '', sectionName: note.sectionName || '', at: now } }, { merge: true });
  } catch (e) { console.warn('track', e); }
}

export function logout() { try { localStorage.removeItem(SESSION_KEY); sessionStorage.removeItem('p_seen'); } catch (e) {} location.replace('login.html'); }
export const isLoggedIn = () => { try { return !!localStorage.getItem(SESSION_KEY); } catch (e) { return false; } };

export function avatarHtml(name, photo, cls = '') {
  const ch = esc((name || '?').trim().charAt(0).toUpperCase());
  return `<span class="p-avatar ${cls}">${photo ? `<img src="${esc(photo)}" alt="" referrerpolicy="no-referrer" onerror="this.remove()">` : ''}<em>${ch}</em></span>`;
}
