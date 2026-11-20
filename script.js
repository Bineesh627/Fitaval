(function () {
  // Mobile nav
  var toggle = document.querySelector('.nav-toggle');
  var links = document.getElementById('nav-links');
  toggle.addEventListener('click', function () {
    var open = links.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
  });
  links.addEventListener('click', function (e) {
    if (e.target.tagName === 'A') { links.classList.remove('open'); toggle.setAttribute('aria-expanded', 'false'); }
  });

  // Active nav link on scroll
  var navLinks = [].slice.call(links.querySelectorAll('a'));
  var secs = navLinks.map(function (a) { return document.querySelector(a.getAttribute('href')); });
  function spy() {
    var y = window.scrollY + 140, cur = 0;
    secs.forEach(function (s, i) { if (s && s.offsetTop <= y) cur = i; });
    navLinks.forEach(function (a, i) { a.classList.toggle('active', i === cur); });
  }
  window.addEventListener('scroll', spy, { passive: true }); spy();

  // Testimonials (placeholder copy — edit freely)
  var items = [
    { q: 'Joining Fitaval has completely changed how I see fitness. The platform made it easy to find a great gym and connect with people who keep me motivated.', a: 'Aarav M.' },
    { q: "I love how simple Fitaval makes everything. I found a gym that fits my schedule, met new workout buddies, and tracking my progress easily. My fitness routine finally feels exciting again!", a: 'Sara L.' },
    { q: 'Thanks to Fitaval, I actually look forward to my workouts. The community energy is contagious and I’ve discovered things I wouldn’t have known otherwise.', a: 'Rahul S.' },
    { q: 'Finding classes near me used to be a hassle. Now it takes a minute, and I’ve joined a weekend running group through the app.', a: 'Meera K.' }
  ];
  var idx = 1, box = document.querySelector('.testi');
  var calm = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  // dir: +1 = next (cards glide left), -1 = previous (cards glide right), 0/undefined = no animation
  function render(dir) {
    var old = box.querySelectorAll('.t'),
        off = old.length > 1 ? old[1].getBoundingClientRect().left - old[0].getBoundingClientRect().left : 0;
    var n = items.length, out = '';
    [-1, 0, 1].forEach(function (o) {
      var it = items[(idx + o + n) % n];
      out += '<figure class="t' + (o === 0 ? ' mid' : '') + '"' + (o !== 0 ? ' aria-hidden="true"' : '') + '><blockquote><p>' + it.q + '</p></blockquote><cite>' + it.a + '</cite></figure>';
    });
    box.innerHTML = out;
    if (dir && off && !calm && box.firstChild.animate) {
      // every card slides one slot; the centre card fades up while the old centre fades back
      var from = dir > 0 ? [1, 0.28, 0] : [0, 0.28, 1];
      [].forEach.call(box.children, function (el, i) {
        el.animate(
          [{ translate: (dir * off) + 'px 0', opacity: from[i] }, { translate: '0 0', opacity: i === 1 ? 1 : 0.28 }],
          { duration: 700, easing: 'cubic-bezier(.22,.8,.24,1)' }
        );
      });
    }
  }
  document.querySelector('.prev').addEventListener('click', function () { idx = (idx - 1 + items.length) % items.length; render(-1); });
  document.querySelector('.next').addEventListener('click', function () { idx = (idx + 1) % items.length; render(1); });
  render();

  // Registration form (client-side only, nothing is sent)
  var form = document.querySelector('.join');
  var msg = form.querySelector('.form-msg');
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var bad = 0;
    [].forEach.call(form.querySelectorAll('input:not([type=hidden]):not([type=search]),select'), function (f) {
      var v = (f.value || '').trim(), ok = !!v;
      if (ok && f.type === 'email') ok = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v);
      if (ok && f.type === 'tel') ok = /^[+\d][\d\s-]{6,}$/.test(v);
      f.classList.toggle('invalid', !ok); if (!ok) bad++;
    });
    msg.className = 'form-msg ' + (bad ? 'err' : 'ok');
    msg.textContent = bad ? 'Please fill in all fields with valid details.' : 'Thanks! Your details look good. (Demo form: nothing was sent.)';
    if (!bad) form.reset();
  });


  // Country-code picker (inline SVG flags, no external images)
  (function () {
    var S = function (b) { return '<svg viewBox="0 0 24 24" preserveAspectRatio="none" aria-hidden="true">' + b + '</svg>'; };
    function stripes(cols, vert, w) {
      var t = 0, tot = (w || cols.map(function () { return 1; })).reduce(function (a, b) { return a + b; }, 0), o = '';
      cols.forEach(function (col, i) {
        var s = 24 * (w ? w[i] : 1) / tot;
        o += vert ? '<rect x="' + t + '" y="0" width="' + (s + .1) + '" height="24" fill="' + col + '"/>' : '<rect x="0" y="' + t + '" width="24" height="' + (s + .1) + '" fill="' + col + '"/>';
        t += s;
      });
      return o;
    }
    var circ = function (bg, fg, r) { return '<rect width="24" height="24" fill="' + bg + '"/><circle cx="12" cy="12" r="' + (r || 5) + '" fill="' + fg + '"/>'; };
    var F = {
      in: stripes(['#FF9933', '#fff', '#138808']) + '<circle cx="12" cy="12" r="2.600" fill="none" stroke="#000080" stroke-width=".7"/><circle cx="12" cy="12" r=".6" fill="#000080"/>',
      iq: stripes(['#ce1126', '#fff', '#000']), hu: stripes(['#cd2a3e', '#fff', '#436f4d']), id: stripes(['#e70011', '#fff']),
      ir: stripes(['#239f40', '#fff', '#da0000']), de: stripes(['#000', '#dd0000', '#ffce00']), ru: stripes(['#fff', '#0039a6', '#d52b1e']),
      nl: stripes(['#ae1c28', '#fff', '#21468b']), ng: stripes(['#008751', '#fff', '#008751'], 1), fr: stripes(['#0055a4', '#fff', '#ef4135'], 1),
      it: stripes(['#009246', '#fff', '#ce2b37'], 1), ie: stripes(['#169b62', '#fff', '#ff883e'], 1), pl: stripes(['#fff', '#dc143c']),
      ua: stripes(['#0057b7', '#ffd700']), sg: stripes(['#ed2939', '#fff']), es: stripes(['#aa151b', '#f1bf00', '#aa151b'], 0, [1, 2, 1]),
      ca: stripes(['#d52b1e', '#fff', '#d52b1e'], 1, [1, 2, 1]) + '<circle cx="12" cy="12" r="3" fill="#d52b1e"/>',
      jp: circ('#fff', '#bc002d', 5.500), bd: circ('#006a4e', '#f42a41', 5.500), cn: circ('#de2910', '#ffde00', 4),
      kr: circ('#fff', '#cd2e3a', 5) + '<path d="M7 12a5 5 0 0010 0z" fill="#0047a0"/>',
      br: '<rect width="24" height="24" fill="#009c3b"/><path d="M12 3l9 9-9 9-9-9z" fill="#ffdf00"/><circle cx="12" cy="12" r="4" fill="#002776"/>',
      us: stripes(['#b22234', '#fff', '#b22234', '#fff', '#b22234', '#fff', '#b22234']) + '<rect width="11" height="13" fill="#3c3b6e"/>',
      gb: '<rect width="24" height="24" fill="#012169"/><path d="M0 0l24 24M24 0L0 24" stroke="#fff" stroke-width="4"/><path d="M0 0l24 24M24 0L0 24" stroke="#c8102e" stroke-width="1.500"/><path d="M12 0v24M0 12h24" stroke="#fff" stroke-width="7"/><path d="M12 0v24M0 12h24" stroke="#c8102e" stroke-width="4"/>',
      is: '<rect width="24" height="24" fill="#02529c"/><path d="M8 0v24M0 12h24" stroke="#fff" stroke-width="6"/><path d="M8 0v24M0 12h24" stroke="#dc1e35" stroke-width="3"/>',
      ae: '<rect width="24" height="24" fill="#fff"/><rect width="24" height="8" fill="#00732f"/><rect y="16" width="24" height="8" fill="#000"/><rect width="7" height="24" fill="#ff0000"/>',
      pk: '<rect width="24" height="24" fill="#01411c"/><rect width="6" height="24" fill="#fff"/><circle cx="15" cy="12" r="4" fill="#fff"/><circle cx="16.500" cy="11" r="3.500" fill="#01411c"/>',
      sa: '<rect width="24" height="24" fill="#006c35"/><rect x="6" y="14" width="12" height="1.500" fill="#fff"/>',
      au: '<rect width="24" height="24" fill="#012169"/><rect width="12" height="12" fill="#012169"/><path d="M0 0l12 12M12 0L0 12" stroke="#fff" stroke-width="2"/><path d="M6 0v12M0 6h12" stroke="#c8102e" stroke-width="2.500"/><circle cx="17" cy="17" r="2" fill="#fff"/>',
      lk: '<rect width="24" height="24" fill="#8d153a"/><rect x="2" y="2" width="20" height="20" fill="#ffbe29"/><rect x="8" y="2" width="14" height="20" fill="#8d153a"/>',
      za: stripes(['#de3831', '#fff', '#002395']) + '<path d="M0 0l12 12L0 24z" fill="#007a4d"/>'
    };
    var L = [['Australia', '+61', 'au'], ['Bangladesh', '+880', 'bd'], ['Brazil', '+55', 'br'], ['Canada', '+1', 'ca'], ['China', '+86', 'cn'], ['France', '+33', 'fr'], ['Germany', '+49', 'de'], ['Hungary', '+36', 'hu'], ['Iceland', '+354', 'is'], ['India', '+91', 'in'], ['Indonesia', '+62', 'id'], ['Iran', '+98', 'ir'], ['Iraq', '+964', 'iq'], ['Ireland', '+353', 'ie'], ['Italy', '+39', 'it'], ['Japan', '+81', 'jp'], ['Netherlands', '+31', 'nl'], ['Nigeria', '+234', 'ng'], ['Pakistan', '+92', 'pk'], ['Poland', '+48', 'pl'], ['Russia', '+7', 'ru'], ['Saudi Arabia', '+966', 'sa'], ['Singapore', '+65', 'sg'], ['South Africa', '+27', 'za'], ['South Korea', '+82', 'kr'], ['Spain', '+34', 'es'], ['Sri Lanka', '+94', 'lk'], ['Ukraine', '+380', 'ua'], ['United Arab Emirates', '+971', 'ae'], ['United Kingdom', '+44', 'gb'], ['United States', '+1', 'us']];
    var root = document.querySelector('.cc'); if (!root) return;
    var btn = root.querySelector('.cc-btn'), panel = root.querySelector('.cc-panel'), list = root.querySelector('.cc-list'),
        search = root.querySelector('.cc-search input'), hidden = root.querySelector('input[type=hidden]'), sel = 'India';
    function flag(k) { return S(F[k]); }
    function render(q) {
      q = (q || '').trim().toLowerCase().replace(/^\+/, '');
      var items = L.filter(function (c) { return !q || c[0].toLowerCase().indexOf(q) > -1 || c[1].replace('+', '').indexOf(q) === 0; });
      list.innerHTML = items.length ? items.map(function (c) {
        return '<li role="option" tabindex="0" data-n="' + c[0] + '" aria-selected="' + (c[0] === sel) + '"><span class="flag">' + flag(c[2]) + '</span><b>' + c[0] + '</b><span class="c">(' + c[1] + ')</span><svg class="tick" aria-hidden="true"><use href="#i-check"/></svg></li>';
      }).join('') : '<li class="none">No results</li>';
    }
    function setBtn() {
      var c = L.filter(function (x) { return x[0] === sel; })[0];
      btn.querySelector('.flag').innerHTML = flag(c[2]); btn.querySelector('.cc-code').textContent = c[1]; hidden.value = c[1];
    }
    function open(o) {
      panel.hidden = !o; btn.setAttribute('aria-expanded', String(o));
      if (o) { search.value = ''; render(''); var s = list.querySelector('[aria-selected=true]'); if (s) list.scrollTop = s.offsetTop - 60; search.focus({ preventScroll: true }); }
    }
    function pick(li) { if (!li || !li.dataset.n) return; sel = li.dataset.n; setBtn(); open(false); btn.focus(); }
    btn.addEventListener('click', function () { open(panel.hidden); });
    search.addEventListener('input', function () { render(search.value); });
    list.addEventListener('click', function (e) { pick(e.target.closest('li')); });
    list.addEventListener('keydown', function (e) {
      var li = e.target.closest('li'); if (!li) return;
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(li); }
      if (e.key === 'ArrowDown' && li.nextElementSibling) { e.preventDefault(); li.nextElementSibling.focus(); }
      if (e.key === 'ArrowUp') { e.preventDefault(); (li.previousElementSibling || search).focus(); }
    });
    search.addEventListener('keydown', function (e) { if (e.key === 'ArrowDown') { e.preventDefault(); var f = list.querySelector('li'); if (f) f.focus(); } });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !panel.hidden) { open(false); btn.focus(); } });
    document.addEventListener('click', function (e) { if (!panel.hidden && !root.contains(e.target)) open(false); });
    setBtn(); render('');
  })();

  // Custom "My Role" dropdown (the native <select> stays in the DOM as the source of truth)
  (function () {
    var wrap = document.querySelector('.select'); if (!wrap) return;
    var sel = wrap.querySelector('select'), chev = wrap.querySelector('svg');
    var btn = document.createElement('button'); btn.type = 'button'; btn.className = 'role-btn';
    btn.setAttribute('aria-haspopup', 'listbox'); btn.setAttribute('aria-expanded', 'false');
    var label = document.createElement('span'); btn.appendChild(label);
    var panel = document.createElement('div'); panel.className = 'role-panel'; panel.hidden = true;
    var ul = document.createElement('ul'); ul.setAttribute('role', 'listbox'); ul.setAttribute('aria-label', 'My Role'); panel.appendChild(ul);
    wrap.insertBefore(btn, chev); wrap.insertBefore(panel, chev); wrap.classList.add('custom');
    var opts = [].filter.call(sel.options, function (o) { return !o.disabled; });
    ul.innerHTML = opts.map(function (o) {
      return '<li role="option" tabindex="0" data-v="' + o.text + '"><span>' + o.text + '</span><svg class="tick" aria-hidden="true"><use href="#i-check"/></svg></li>';
    }).join('');
    function sync() {
      var v = sel.value;
      label.textContent = v || sel.options[0].text;
      btn.classList.toggle('has-value', !!v);
      [].forEach.call(ul.children, function (li) { li.setAttribute('aria-selected', String(li.dataset.v === v)); });
    }
    function open(o) {
      panel.hidden = !o; wrap.classList.toggle('open', o); btn.setAttribute('aria-expanded', String(o));
      if (o) { var s = ul.querySelector('[aria-selected=true]') || ul.firstChild; s.focus({ preventScroll: true }); }
    }
    function pick(li) {
      if (!li || !li.dataset.v) return;
      sel.value = li.dataset.v; sel.classList.remove('invalid'); sync(); open(false); btn.focus();
    }
    btn.addEventListener('click', function () { open(panel.hidden); });
    ul.addEventListener('click', function (e) { pick(e.target.closest('li')); });
    ul.addEventListener('keydown', function (e) {
      var li = e.target.closest('li'); if (!li) return;
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(li); }
      if (e.key === 'ArrowDown' && li.nextElementSibling) { e.preventDefault(); li.nextElementSibling.focus(); }
      if (e.key === 'ArrowUp' && li.previousElementSibling) { e.preventDefault(); li.previousElementSibling.focus(); }
    });
    btn.addEventListener('keydown', function (e) { if (e.key === 'ArrowDown' && panel.hidden) { e.preventDefault(); open(true); } });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !panel.hidden) { open(false); btn.focus(); } });
    document.addEventListener('click', function (e) { if (!panel.hidden && !wrap.contains(e.target)) open(false); });
    sel.form.addEventListener('reset', function () { setTimeout(sync, 0); });
    sync();
  })();

  // Subscribe (local confirmation only)
  var sub = document.querySelector('.subscribe');
  var sm = sub.querySelector('.form-msg');
  sub.addEventListener('submit', function (e) {
    e.preventDefault();
    var i = sub.querySelector('input'), ok = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(i.value.trim());
    sm.className = 'form-msg ' + (ok ? 'ok' : 'err');
    sm.textContent = ok ? 'Looks good! (Demo only: no subscription was created.)' : 'Please enter a valid email address.';
    if (ok) i.value = '';
  });
})();
