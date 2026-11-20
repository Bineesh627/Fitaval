(function () {
  var root = document.documentElement;
  if (!root.classList.contains('js-anim')) return; // reduced motion or flag missing: leave page static

  // ---------- 1. split hero headline into words for a masked reveal ----------
  var h1 = document.querySelector('.hero h1');
  if (h1) {
    var i = 0;
    (function split(node) {
      [].slice.call(node.childNodes).forEach(function (n) {
        if (n.nodeType === 3) {
          var frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(function (part) {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
            var wd = document.createElement('span'), inner = document.createElement('span');
            wd.className = 'wd'; inner.textContent = part; inner.style.setProperty('--i', i++);
            wd.appendChild(inner); frag.appendChild(wd);
          });
          node.replaceChild(frag, n);
        } else if (n.nodeType === 1 && n.tagName !== 'BR') split(n);
      });
    })(h1);
  }

  // ---------- 2. tag elements for scroll reveal ----------
  function tag(sel, kind, stagger) {
    [].forEach.call(document.querySelectorAll(sel), function (el, k) {
      el.setAttribute('data-reveal', kind);
      if (stagger) el.style.setProperty('--d', (k % 4) * stagger + 's');
    });
  }
  tag('.sec-title', 'up');
  tag('.lead', 'up');
  tag('.gallery', 'group'); // images reveal together (some sit off-screen on narrow viewports)
  tag('.stats', 'up');
  tag('.card', 'up', 0.14);
  tag('.testi-wrap', 'up');
  tag('.faq details', 'up', 0.08);
  tag('.cta-card', 'left');
  tag('.join-wrap', 'right');
  tag('.foot-links, .foot-contact, .subscribe', 'up', 0.12);
  tag('.foot-bar', 'up');

  // ---------- 3. count-up for stats ----------
  var counters = [].map.call(document.querySelectorAll('.stats strong'), function (el) {
    var m = el.textContent.match(/^(\d+)(.*)$/);
    return m ? { el: el, to: +m[1], suffix: m[2], done: false } : null;
  }).filter(Boolean);
  counters.forEach(function (c) { c.el.textContent = '0' + c.suffix; });

  function runCounters() {
    counters.forEach(function (c, k) {
      if (c.done) return; c.done = true;
      var start = null, dur = 1700, delay = k * 140;
      function step(t) {
        if (start === null) start = t + delay;
        var p = Math.min(Math.max((t - start) / dur, 0), 1), e = 1 - Math.pow(1 - p, 3);
        c.el.textContent = Math.round(c.to * e) + c.suffix;
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    });
  }

  // ---------- 4. observe ----------
  var targets = [].slice.call(document.querySelectorAll('[data-reveal]'));
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add('in');
        if (en.target.classList.contains('stats')) runCounters();
        io.unobserve(en.target);
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -6% 0px' });
    targets.forEach(function (t) { io.observe(t); });
  } else {
    targets.forEach(function (t) { t.classList.add('in'); });
    runCounters();
  }

  // ---------- 5. scroll progress bar + header state ----------
  var bar = document.createElement('div');
  bar.className = 'scroll-bar'; bar.setAttribute('aria-hidden', 'true');
  document.body.appendChild(bar);
  var header = document.querySelector('.site-header'), ticking = false;
  function onScroll() {
    var max = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.transform = 'scaleX(' + (max > 0 ? Math.min(window.scrollY / max, 1) : 0) + ')';
    header.classList.toggle('scrolled', window.scrollY > 30);
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  onScroll();

  // ---------- 6. shake the form when validation fails ----------
  var join = document.querySelector('.join');
  if (join) join.addEventListener('submit', function () {
    if (join.querySelector('.invalid')) {
      join.classList.remove('shake'); void join.offsetWidth; join.classList.add('shake');
    }
  });
})();
