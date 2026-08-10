// AudioTheory site behaviour — vanilla JS, no dependencies.
// Bound once via WeakSet guards so the DCMSX preview can re-run this script
// after a soft refresh without double-binding survivors.
(function () {
  var bound = window.__atBound || (window.__atBound = new WeakSet());
  function once(el, fn) { if (!el || bound.has(el)) return; bound.add(el); fn(el); }

  // ---------- lightbox: one shared <dialog>, delegated ----------
  var lb = document.querySelector('.at-lightbox');
  if (!lb) {
    lb = document.createElement('dialog');
    lb.className = 'at-lightbox';
    lb.innerHTML = '<button class="lightbox-close" aria-label="Close">×</button><img alt="">';
    document.body.appendChild(lb);
    lb.querySelector('.lightbox-close').addEventListener('click', function () { lb.close(); });
    lb.addEventListener('click', function (e) { if (e.target === lb) lb.close(); });
  }
  once(document.body, function (body) {
    body.addEventListener('click', function (e) {
      var img = e.target.closest('[data-lightbox]');
      if (!img) return;
      lb.querySelector('img').src = img.currentSrc || img.src;
      lb.querySelector('img').alt = img.alt || '';
      lb.showModal();
    });
  });

  // ---------- off-canvas drawer ----------
  document.querySelectorAll('[data-nav-toggle]').forEach(function (btn) {
    once(btn, function () {
      btn.addEventListener('click', function () { document.body.classList.toggle('nav-open'); });
    });
  });
  once(document.documentElement, function () {
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') document.body.classList.remove('nav-open');
    });
    // click outside the drawer closes it
    document.addEventListener('click', function (e) {
      if (!document.body.classList.contains('nav-open')) return;
      if (e.target.closest('.at-drawer') || e.target.closest('[data-nav-toggle]')) return;
      document.body.classList.remove('nav-open');
    });
  });

  // ---------- carousel prev/next (the track itself is CSS scroll-snap) ----------
  document.querySelectorAll('.block-news-carousel').forEach(function (wrap) {
    once(wrap, function () {
      var track = wrap.querySelector('[data-carousel]');
      if (!track) return;
      function step() {
        var card = track.querySelector('.news-card');
        return card ? card.getBoundingClientRect().width + 30 : track.clientWidth;
      }
      var prev = wrap.querySelector('.carousel-prev');
      var next = wrap.querySelector('.carousel-next');
      // An arrow only shows when there is somewhere to scroll — so on load
      // (newest articles in view) there is no left arrow. Measured off the
      // cards rather than scrollLeft: the track's side padding and scroll-snap
      // park it a few pixels in, so scrollLeft is never 0 at the start.
      function sync() {
        var cards = track.querySelectorAll('.news-card');
        var box = track.getBoundingClientRect();
        var first = cards.length ? cards[0].getBoundingClientRect() : box;
        var last = cards.length ? cards[cards.length - 1].getBoundingClientRect() : box;
        if (prev) prev.hidden = !cards.length || first.left >= box.left - 1;
        if (next) next.hidden = !cards.length || last.right <= box.right + 1;
      }
      if (prev) prev.addEventListener('click', function () { track.scrollBy({ left: -step(), behavior: 'smooth' }); });
      if (next) next.addEventListener('click', function () { track.scrollBy({ left: step(), behavior: 'smooth' }); });
      track.addEventListener('scroll', sync, { passive: true });
      window.addEventListener('resize', sync);
      sync();
    });
  });

  // ---------- hover-to-play video (two-tap on touch) ----------
  document.querySelectorAll('.at-video--hover').forEach(function (v) {
    once(v, function () {
      v.addEventListener('mouseenter', function () { v.play().catch(function () {}); });
      v.addEventListener('mouseleave', function () { v.pause(); });
      v.addEventListener('touchstart', function () {
        if (v.paused) v.play().catch(function () {}); else v.pause();
      }, { passive: true });
    });
  });

  // ---------- GoatCounter events on store buttons ----------
  // any element with data-goat-event fires a named event; shows up in the
  // GoatCounter dashboard alongside pageviews (replaces the old gtag calls)
  once(document.head, function () {
    document.addEventListener('click', function (e) {
      var el = e.target.closest('[data-goat-event]');
      if (!el || !window.goatcounter || !window.goatcounter.count) return;
      window.goatcounter.count({ path: el.dataset.goatEvent, title: el.dataset.goatEvent, event: true });
    });
  });
})();
