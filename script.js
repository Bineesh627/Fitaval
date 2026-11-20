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
  function render() {
    var n = items.length, out = '';
    [-1, 0, 1].forEach(function (o) {
      var it = items[(idx + o + n) % n];
      out += '<figure class="t' + (o === 0 ? ' mid' : '') + '"' + (o !== 0 ? ' aria-hidden="true"' : '') + '><blockquote><p>' + it.q + '</p></blockquote><cite>' + it.a + '</cite></figure>';
    });
    box.innerHTML = out;
  }
  document.querySelector('.prev').addEventListener('click', function () { idx = (idx - 1 + items.length) % items.length; render(); });
  document.querySelector('.next').addEventListener('click', function () { idx = (idx + 1) % items.length; render(); });
  render();

  // Registration form (client-side only, nothing is sent)
  var form = document.querySelector('.join');
  var msg = form.querySelector('.form-msg');
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var bad = 0;
    [].forEach.call(form.querySelectorAll('input,select'), function (f) {
      var v = (f.value || '').trim(), ok = !!v;
      if (ok && f.type === 'email') ok = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v);
      if (ok && f.type === 'tel') ok = /^[+\d][\d\s-]{6,}$/.test(v);
      f.classList.toggle('invalid', !ok); if (!ok) bad++;
    });
    msg.className = 'form-msg ' + (bad ? 'err' : 'ok');
    msg.textContent = bad ? 'Please fill in all fields with valid details.' : 'Thanks! Your details look good. (Demo form: nothing was sent.)';
    if (!bad) form.reset();
  });

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
