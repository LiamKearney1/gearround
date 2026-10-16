/* GearRound: single-page app with four tabs. Sample data only; no backend yet. */
(function () {
  'use strict';

  // ---------- Sample data ----------
  const LISTINGS = [
    { id: 1, title: 'Baseball glove, 11"', size: 'Ages 7–9', condition: 'Good', sport: 'Baseball', seller: 'Jen K.', location: 'Beverly, MA', miles: 3, cost: 15, types: ['Sale', 'Trade'], delivery: ['In person'] },
    { id: 2, title: 'Soccer cleats', size: 'Youth size 2', condition: 'Like new', sport: 'Soccer', seller: 'Marcus T.', location: 'Salem, MA', miles: 6, cost: 0, types: ['Give-away'], delivery: ['In person'] },
    { id: 3, title: 'Hockey helmet w/ cage', size: 'Youth S', condition: 'Good', sport: 'Hockey', seller: 'Dana R.', location: 'Peabody, MA', miles: 9, cost: 25, types: ['Sale'], delivery: ['Shipped', 'In person'] },
    { id: 4, title: 'Shin guards (2 pairs)', size: 'Ages 5–7', condition: 'Well loved', sport: 'Soccer', seller: 'Priya S.', location: 'Danvers, MA', miles: 12, cost: 0, types: ['Give-away', 'Trade'], delivery: ['In person'] },
    { id: 5, title: 'Lacrosse stick', size: 'Youth 37"', condition: 'Fair', sport: 'Lacrosse', seller: 'Tom B.', location: 'Marblehead, MA', miles: 18, cost: 0, types: ['Trade'], delivery: ['Shipped'] },
    { id: 6, title: 'Football shoulder pads', size: 'Youth M', condition: 'Good', sport: 'Football', seller: 'Alicia W.', location: 'Lynn, MA', miles: 22, cost: 30, types: ['Sale', 'Give-away', 'Trade'], delivery: ['In person'] },
    { id: 7, title: 'Basketball, size 5', size: 'Ages 9–11', condition: 'Like new', sport: 'Basketball', seller: 'Sam L.', location: 'Swampscott, MA', miles: 4, cost: 8, types: ['Sale'], delivery: ['Shipped', 'In person'] },
    { id: 8, title: 'Batting helmet', size: 'Youth', condition: 'New', sport: 'Baseball', seller: 'Chris P.', location: 'Beverly, MA', miles: 2, cost: 0, types: ['Give-away'], delivery: ['In person'] },
    { id: 9, title: 'Hockey skates', size: 'Youth 3', condition: 'Good', sport: 'Hockey', seller: 'Nina F.', location: 'Wenham, MA', miles: 31, cost: 40, types: ['Sale', 'Trade'], delivery: ['Shipped'] },
    { id: 10, title: 'Soccer ball, size 4', size: 'Ages 8–12', condition: 'Fair', sport: 'Soccer', seller: 'Owen H.', location: 'Salem, MA', miles: 7, cost: 0, types: ['Give-away'], delivery: ['In person'] }
  ];

  const TYPES = ['Sale', 'Give-away', 'Trade'];
  const DELIVERY = ['Shipped', 'In person'];
  const RADII = [5, 10, 25, 50, 0]; // 0 = any distance
  const CONDITIONS = [
    { label: 'New', desc: 'Never used, may have tags' },
    { label: 'Like new', desc: 'Used once or twice, no visible wear' },
    { label: 'Good', desc: 'Light wear, works perfectly' },
    { label: 'Fair', desc: 'Noticeable wear, still fully usable' },
    { label: 'Well loved', desc: 'Heavy wear, good for practice or a backup' }
  ];
  const SPORTS = ['Baseball', 'Soccer', 'Basketball', 'Hockey', 'Football', 'Lacrosse', 'Softball', 'Other'];
  const AGES = ['Under 5', '6–8', '9–11', '12–14', '15–18'];

  const THREADS = [
    {
      group: 'Getting',
      items: [
        { initials: 'JK', name: 'Jen K.', time: '9:41 AM', item: 'Baseball glove, 11"', preview: 'Yes, still available! I can do Saturday morning at the rec center.', unread: true },
        { initials: 'DR', name: 'Dana R.', time: 'Yesterday', item: 'Hockey helmet w/ cage', preview: 'Shipped it this morning. Tracking number is in the app.', unread: true },
        { initials: 'TB', name: 'Tom B.', time: 'Tuesday', item: 'Lacrosse stick', preview: 'Would you trade for a pair of youth cleats, size 3?', unread: false }
      ]
    },
    {
      group: 'Giving',
      items: [
        { initials: 'PS', name: 'Priya S.', time: '10:15 AM', item: 'Soccer cleats, youth 2', preview: 'Thank you so much! My daughter is going to love these.', unread: true },
        { initials: 'OH', name: 'Owen H.', time: 'Yesterday', item: 'Batting helmet', preview: 'Is $8 okay? I can pick up after practice tonight.', unread: false },
        { initials: 'AW', name: 'Alicia W.', time: '10/8/26', item: 'Football shoulder pads', preview: 'Picked up, all set. Thanks again!', unread: false }
      ]
    }
  ];

  // ---------- State (filters are shared by Marketplace and Search) ----------
  const STORAGE_KEY = 'gearround:v1';
  const defaults = {
    query: '',
    types: [],
    delivery: [],
    conditions: [],
    radius: 25,
    location: 'Beverly, MA',
    saved: [1, 10, 9, 5],
    prefs: { delivery: ['In person'], sports: ['Baseball', 'Soccer'], ages: ['6–8', '9–11'] }
  };
  const ui = { radiusOpen: false, closedGroups: [] };
  const state = load();

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return Object.assign({}, defaults, JSON.parse(raw));
    } catch (e) { /* storage unavailable */ }
    return JSON.parse(JSON.stringify(defaults));
  }
  function persist() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) { /* ignore */ }
  }

  // ---------- Helpers ----------
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const toggleIn = (arr, v) => (arr.includes(v) ? arr.filter((x) => x !== v) : arr.concat([v]));
  const radiusLabel = (r) => (r === 0 ? 'Any distance' : r + ' mi');
  const priceOf = (l) => (l.types.includes('Sale') ? '$' + l.cost : l.types.includes('Give-away') ? 'Free' : 'Trade only');

  const ICON = {
    pin: '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-7-6.2-7-11a7 7 0 0114 0c0 4.8-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/></svg>',
    chev: '<svg class="icon chev" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>',
    search: '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg>',
    heart: '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20s-7-4.5-7-10a4 4 0 017-2.6A4 4 0 0119 10c0 5.5-7 10-7 10z"/></svg>',
    photo: '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M21 16l-5-5-8 8"/></svg>',
    check: '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12l5 5 9-10"/></svg>',
    plus: '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>',
    compose: '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M13 7l4 4"/></svg>'
  };

  function matches(l) {
    const q = state.query.trim().toLowerCase();
    if (q && !(l.title + ' ' + l.sport + ' ' + l.size).toLowerCase().includes(q)) return false;
    if (state.radius !== 0 && l.miles > state.radius) return false;
    if (state.types.length && !state.types.some((t) => l.types.includes(t))) return false;
    if (state.delivery.length && !state.delivery.some((d) => l.delivery.includes(d))) return false;
    if (state.conditions.length && !state.conditions.includes(l.condition)) return false;
    return true;
  }
  const results = () => LISTINGS.filter(matches);

  function chip(label, pressed, action, value) {
    return '<button type="button" class="chip" aria-pressed="' + pressed + '" data-action="' + action + '" data-value="' + esc(value) + '">' + esc(label) + '</button>';
  }

  function card(l) {
    const saved = state.saved.includes(l.id);
    return (
      '<article class="card">' +
        '<div class="photo">' +
          (l.photo
            ? '<img src="' + esc(l.photo) + '" alt="' + esc(l.title) + '" loading="lazy" decoding="async" onerror="this.remove()">'
            : '') +
          ICON.photo +
          '<button type="button" class="save-btn" aria-pressed="' + saved + '" aria-label="' + (saved ? 'Unsave ' : 'Save ') + esc(l.title) + '" data-action="save" data-value="' + l.id + '">' + ICON.heart + '</button>' +
        '</div>' +
        '<div class="price">' + esc(priceOf(l)) + '</div>' +
        '<div class="title">' + esc(l.title) + '</div>' +
        '<div class="info">' + esc(l.size) + ' · ' + esc(l.condition) + '</div>' +
        '<div class="seller">' + esc(l.seller) + ' · ' + esc(l.location) + ' · ' + l.miles + ' mi</div>' +
        '<div class="tags">' +
          l.types.map((t) => '<span class="tag type">' + esc(t) + '</span>').join('') +
          l.delivery.map((d) => '<span class="tag delivery">' + esc(d) + '</span>').join('') +
        '</div>' +
      '</article>'
    );
  }

  function gridHTML() {
    const list = results();
    if (!list.length) return '<div class="empty">No listings match these filters.</div>';
    return '<div class="grid">' + list.map(card).join('') + '</div>';
  }

  function radiusSegmented() {
    return '<div class="segmented" role="group" aria-label="Distance">' +
      RADII.map((r) => '<button type="button" aria-pressed="' + (state.radius === r) + '" data-action="radius" data-value="' + r + '">' + (r === 0 ? 'Any' : r + ' mi') + '</button>').join('') +
      '</div>';
  }

  function locationInput(id) {
    return '<label class="input input-icon" for="' + id + '">' + ICON.pin +
      '<span class="sr-only">Location</span>' +
      '<input id="' + id + '" type="text" placeholder="Town or ZIP" value="' + esc(state.location) + '" data-bind="location" autocomplete="postal-code">' +
      '</label>';
  }

  // ---------- Views ----------
  function marketplace() {
    return (
      '<header class="page-head bordered">' +
        '<div class="row">' +
          '<h1 class="page-title">Marketplace</h1>' +
          '<button type="button" class="location-btn" data-action="radius-panel" aria-expanded="' + ui.radiusOpen + '">' +
            ICON.pin + '<span>' + esc(state.location || 'Set location') + ' · ' + radiusLabel(state.radius) + '</span>' + ICON.chev +
          '</button>' +
        '</div>' +
        (ui.radiusOpen
          ? '<div class="panel">' +
              '<div class="field">Location' + locationInput('loc-market') + '</div>' +
              '<div class="field">Show listings within' + radiusSegmented() + '</div>' +
              '<button type="button" class="btn" data-action="radius-panel" data-count>Show ' + results().length + ' listings</button>' +
            '</div>'
          : '') +
        '<label class="searchbox">' + ICON.search +
          '<span class="sr-only">Search gear</span>' +
          '<input type="search" placeholder="Search youth gear" value="' + esc(state.query) + '" data-bind="query">' +
        '</label>' +
        '<div class="chips scroll">' +
          TYPES.map((t) => chip(t, state.types.includes(t), 'type', t)).join('') +
          DELIVERY.map((d) => chip(d, state.delivery.includes(d), 'delivery', d)).join('') +
        '</div>' +
      '</header>' +
      '<div data-results>' + gridHTML() + '</div>'
    );
  }

  function search() {
    const size = { 5: 60, 10: 100, 25: 160, 50: 230 }[state.radius];
    return (
      '<header class="page-head bordered">' +
        '<div class="row">' +
          '<h1 class="page-title">Search</h1>' +
          '<button type="button" class="link-btn" data-action="clear">Clear all</button>' +
        '</div>' +
        '<label class="searchbox">' + ICON.search +
          '<span class="sr-only">Search gear</span>' +
          '<input type="search" placeholder="Cleats, helmets, gloves…" value="' + esc(state.query) + '" data-bind="query">' +
        '</label>' +
      '</header>' +
      '<div class="sections">' +
        '<section class="section"><h2>Listing type</h2><div class="hint">Pick any combination</div>' +
          '<div class="chips">' + TYPES.map((t) => chip(t, state.types.includes(t), 'type', t)).join('') + '</div></section>' +
        '<section class="section"><h2>Delivery</h2>' +
          '<div class="chips">' + DELIVERY.map((d) => chip(d, state.delivery.includes(d), 'delivery', d)).join('') + '</div></section>' +
        '<section class="section"><h2>Condition</h2><div class="hint">Pick any combination</div>' +
          '<div class="cond-list">' + CONDITIONS.map((c) => {
            const on = state.conditions.includes(c.label);
            return '<button type="button" class="cond" aria-pressed="' + on + '" data-action="condition" data-value="' + esc(c.label) + '">' +
              '<span><span class="name">' + esc(c.label) + '</span><span class="desc">' + esc(c.desc) + '</span></span>' +
              '<span class="checkbox">' + (on ? ICON.check : '') + '</span></button>';
          }).join('') + '</div></section>' +
        '<section class="section"><h2>Distance</h2>' +
          locationInput('loc-search') +
          '<div class="map" role="img" aria-label="' + esc(mapLabel()) + '">' +
            '<div class="road" style="left:0;right:0;top:30%;height:6px"></div>' +
            '<div class="road" style="left:0;right:0;top:72%;height:4px"></div>' +
            '<div class="road" style="top:0;bottom:0;left:22%;width:4px"></div>' +
            '<div class="road" style="top:0;bottom:0;left:64%;width:6px"></div>' +
            '<div class="water"></div>' +
            (size ? '<div class="radius" style="width:' + size + 'px;height:' + size + 'px"></div>' : '') +
            '<svg class="pin" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 22s-7-6.2-7-12a7 7 0 0114 0c0 5.8-7 12-7 12z" fill="var(--accent)" stroke="#fff" stroke-width="1.5"/><circle cx="12" cy="10" r="2.5" fill="#fff"/></svg>' +
            '<div class="label" data-map-label>' + esc(mapLabel()) + '</div>' +
          '</div>' +
          '<div class="chips">' + RADII.map((r) => chip(radiusLabel(r), state.radius === r, 'radius', r)).join('') + '</div>' +
        '</section>' +
      '</div>' +
      '<div class="sticky-cta"><a class="btn" href="#/marketplace" data-count>Show ' + results().length + ' results</a></div>'
    );
  }

  function mapLabel() {
    return state.radius === 0
      ? 'Showing listings at any distance'
      : 'Within ' + state.radius + ' mi of ' + (state.location || 'your location');
  }

  function messages() {
    return (
      '<header class="page-head">' +
        '<div class="row">' +
          '<h1 class="page-title big">Messages</h1>' +
          '<button type="button" class="link-btn" aria-label="New message" data-action="toast" data-value="New messages are coming soon.">' + ICON.compose + '</button>' +
        '</div>' +
        '<label class="searchbox">' + ICON.search +
          '<span class="sr-only">Search messages</span>' +
          '<input type="search" placeholder="Search" data-bind="msgquery">' +
        '</label>' +
      '</header>' +
      THREADS.map((g) => {
        const open = !ui.closedGroups.includes(g.group);
        const unread = g.items.filter((t) => t.unread).length;
        return '<section>' +
          '<button type="button" class="group-head" aria-expanded="' + open + '" data-action="group" data-value="' + g.group + '">' +
            '<span class="gtitle">' + g.group + '</span>' +
            '<span class="gmeta">' + (unread ? unread + ' unread' : g.items.length + ' chats') + ICON.chev + '</span>' +
          '</button>' +
          (open ? g.items.map((t) =>
            '<button type="button" class="thread" data-action="toast" data-value="Conversations open in the next version.">' +
              '<span class="dot' + (t.unread ? ' unread' : '') + '"></span>' +
              '<span class="avatar">' + esc(t.initials) + '</span>' +
              '<span class="body">' +
                '<span class="top"><span class="name">' + esc(t.name) + '</span><span class="time">' + esc(t.time) + '</span></span>' +
                '<span class="item">' + esc(t.item) + '</span>' +
                '<span class="preview">' + esc(t.preview) + '</span>' +
              '</span>' +
            '</button>').join('') : '') +
        '</section>';
      }).join('')
    );
  }

  function profile() {
    const saved = LISTINGS.filter((l) => state.saved.includes(l.id));
    const pref = (title, key, options) =>
      '<div class="pref"><h3>' + title + '</h3><div class="chips">' +
      options.map((o) => chip(o, state.prefs[key].includes(o), 'pref-' + key, o)).join('') +
      '</div></div>';
    return (
      '<header class="page-head">' +
        '<div class="row">' +
          '<h1 class="page-title big">Profile</h1>' +
          '<button type="button" class="fab" aria-label="Create a listing" data-action="toast" data-value="Creating listings is coming soon.">' + ICON.plus + '</button>' +
        '</div>' +
      '</header>' +
      '<div class="sections" style="padding-top:4px">' +
        '<section class="section">' +
          '<div class="profile-top">' +
            '<div class="avatar">Y</div>' +
            '<div><div class="pname">Your Name</div>' +
            '<div class="pmeta">Member since Oct 2026</div>' +
            '<div class="pmeta">New member · 0 swaps</div></div>' +
          '</div>' +
          '<div class="stats">' +
            '<div class="stat"><b>0</b><span>Active</span></div>' +
            '<div class="stat"><b>0</b><span>Given</span></div>' +
            '<div class="stat"><b>0</b><span>Gotten</span></div>' +
          '</div>' +
          '<button type="button" class="btn secondary" data-action="toast" data-value="Profile editing is coming soon.">Edit profile</button>' +
        '</section>' +
        '<section class="section"><h2>Location</h2>' +
          '<div class="loc-card">' +
            '<div class="badge">' + ICON.pin + '</div>' +
            '<div class="main"><b>' + esc(state.location || 'Not set') + '</b><span>Show listings within ' + radiusLabel(state.radius) + '</span></div>' +
            '<a href="#/search" class="link-btn" style="text-decoration:none">Change</a>' +
          '</div>' +
        '</section>' +
        '<section class="section"><div><h2>Preferences</h2><div class="hint">Used to personalize your Marketplace feed</div></div>' +
          pref('Shipping or in person', 'delivery', DELIVERY) +
          pref('Sports', 'sports', SPORTS) +
          pref('Ages', 'ages', AGES) +
        '</section>' +
        '<section class="section">' +
          '<div class="section-row"><h2>Saved listings</h2><span class="hint">' + saved.length + ' saved</span></div>' +
          (saved.length ? '<div class="grid">' + saved.map(card).join('') + '</div>' : '<div class="empty">Tap the heart on a listing to save it.</div>') +
        '</section>' +
      '</div>'
    );
  }

  const VIEWS = { marketplace, search, messages, profile };

  // ---------- Rendering ----------
  const viewEl = document.getElementById('view');
  function route() {
    const r = (location.hash.replace(/^#\/?/, '') || 'marketplace').split('?')[0];
    return VIEWS[r] ? r : 'marketplace';
  }
  function render() {
    const r = route();
    viewEl.innerHTML = VIEWS[r]();
    document.querySelectorAll('.tabbar a').forEach((a) => {
      if (a.dataset.tab === r) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
    document.title = r.charAt(0).toUpperCase() + r.slice(1) + ' · GearRound';
  }
  // Update only result-dependent parts so typing keeps focus
  function refreshResults() {
    const box = viewEl.querySelector('[data-results]');
    if (box) box.innerHTML = gridHTML();
    const n = results().length;
    viewEl.querySelectorAll('[data-count]').forEach((el) => {
      el.textContent = el.textContent.replace(/\d+/, n);
    });
    const label = viewEl.querySelector('[data-map-label]');
    if (label) label.textContent = mapLabel();
  }

  let toastTimer;
  function toast(msg) {
    const el = document.getElementById('toast');
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), 2200);
  }

  // ---------- Events ----------
  viewEl.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const { action, value } = btn.dataset;
    switch (action) {
      case 'type': state.types = toggleIn(state.types, value); break;
      case 'delivery': state.delivery = toggleIn(state.delivery, value); break;
      case 'condition': state.conditions = toggleIn(state.conditions, value); break;
      case 'radius': state.radius = Number(value); break;
      case 'radius-panel': ui.radiusOpen = !ui.radiusOpen; break;
      case 'clear': Object.assign(state, { query: '', types: [], delivery: [], conditions: [], radius: 25 }); break;
      case 'save': state.saved = toggleIn(state.saved, Number(value)); break;
      case 'group': ui.closedGroups = toggleIn(ui.closedGroups, value); break;
      case 'pref-delivery': state.prefs.delivery = toggleIn(state.prefs.delivery, value); break;
      case 'pref-sports': state.prefs.sports = toggleIn(state.prefs.sports, value); break;
      case 'pref-ages': state.prefs.ages = toggleIn(state.prefs.ages, value); break;
      case 'toast': toast(value); return;
      default: return;
    }
    persist();
    const scroll = window.scrollY;
    render();
    window.scrollTo(0, scroll);
  });

  viewEl.addEventListener('input', (e) => {
    const key = e.target.dataset.bind;
    if (key === 'query' || key === 'location') {
      state[key] = e.target.value;
      persist();
      refreshResults();
    }
  });

  window.addEventListener('hashchange', () => {
    ui.radiusOpen = false;
    render();
    window.scrollTo(0, 0);
  });

  render();

  // ---------- PWA: offline support and update banner ----------
  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    const banner = document.getElementById('update-banner');
    let waitingWorker = null;
    let refreshing = false;

    // Only offer an update when a previous version is already running
    function offerUpdate(worker) {
      if (!worker || !navigator.serviceWorker.controller) return;
      waitingWorker = worker;
      banner.hidden = false;
    }

    banner.addEventListener('click', (e) => {
      const choice = e.target.closest('[data-update]');
      if (!choice) return;
      if (choice.dataset.update === 'refresh' && waitingWorker) {
        refreshing = true;
        waitingWorker.postMessage({ type: 'SKIP_WAITING' });
      }
      banner.hidden = true;
    });

    // The new version took over: reload once so the page uses it
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (refreshing) location.reload();
    });

    window.addEventListener('load', () => {
      navigator.serviceWorker.register('sw.js').then((reg) => {
        if (reg.waiting) offerUpdate(reg.waiting);
        reg.addEventListener('updatefound', () => {
          const worker = reg.installing;
          if (!worker) return;
          worker.addEventListener('statechange', () => {
            if (worker.state === 'installed') offerUpdate(worker);
          });
        });
        // Check for a new version whenever the app comes back to the foreground
        document.addEventListener('visibilitychange', () => {
          if (document.visibilityState === 'visible') reg.update().catch(() => {});
        });
      }).catch(() => { /* offline support unavailable */ });
    });
  }
})();
