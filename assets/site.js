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

  // ---------- back to top on long pages ----------
  // The user guides and update logs run to several screens; short pages never
  // get the button, so it lives here rather than in the template. Built fresh
  // only when it isn't already in the DOM, and torn down if a soft refresh
  // lands on a page too short to warrant it.
  (function () {
    var btn = document.querySelector('.at-top-link');
    if (document.documentElement.scrollHeight < 3000) {
      if (btn) btn.remove();
      return;
    }
    if (!btn) {
      btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'at-top-link';
      btn.setAttribute('aria-label', 'Back to top');
      btn.innerHTML = '<svg viewBox="0 0 16 16" aria-hidden="true">'
        + '<path d="M8 2.6 2.6 8l1.15 1.15L7.2 5.7V13.4h1.6V5.7l3.45 3.45L13.4 8z"/></svg>';
      document.body.appendChild(btn);
    }
    once(btn, function () {
      btn.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
      function sync() { btn.classList.toggle('is-visible', window.scrollY > 700); }
      window.addEventListener('scroll', sync, { passive: true });
      sync();
    });
  })();

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

  // ---------- newsletter signup (first-party capture worker) ----------
  // Submits in the background and swaps the form for an inline thanks. The
  // Turnstile spam-check script only loads once someone focuses the email box,
  // so pages stay light. With JS off the form still POSTs natively and the
  // worker bounces back to /?subscribed=…, which the load-time check renders.
  // Turnstile calls this (data-before-interactive-callback) when it needs to
  // show a visible challenge — until then CSS keeps its box collapsed.
  window.dcmsxTurnstileInteractive = function () {
    document.querySelectorAll('.cf-turnstile').forEach(function (el) { el.classList.add('cf-turnstile-show'); });
  };
  document.querySelectorAll('form[data-newsletter]').forEach(function (form) {
    once(form, function () {
      var msg = form.querySelector('.nl-msg');
      function show(text, isError) {
        if (!msg) return;
        msg.hidden = false;
        msg.textContent = text;
        msg.classList.toggle('nl-msg-error', !!isError);
      }
      function done() {
        form.querySelectorAll('.sign-up-box, .mc-button, .cf-turnstile').forEach(function (el) {
          el.style.display = 'none';
        });
        show('Thank you – your details have been received');
      }
      if (/[?&]subscribed=1\b/.test(location.search)) return done();
      if (/[?&]subscribed=error\b/.test(location.search)) {
        show('Something went wrong — please try signing up again.', true);
      }
      function loadTurnstile() {
        if (!form.querySelector('.cf-turnstile')) return;
        if (document.querySelector('script[src*="challenges.cloudflare.com/turnstile"]')) return;
        var s = document.createElement('script');
        s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
        s.async = true;
        document.head.appendChild(s);
      }
      var email = form.querySelector('input[type="email"]');
      if (email) email.addEventListener('focus', loadTurnstile, { once: true });
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        loadTurnstile();
        var needsToken = !!form.querySelector('.cf-turnstile');
        var tries = 0;
        (function attempt() {
          // the invisible check may still be running — wait for its token
          var token = form.querySelector('[name="cf-turnstile-response"]');
          if (needsToken && !(token && token.value)) {
            if (++tries > 40) return show('Couldn’t run the spam check — please reload and try again.', true);
            show('Checking…');
            return setTimeout(attempt, 250);
          }
          var button = form.querySelector('.mc-button');
          if (button) button.disabled = true;
          var data = new URLSearchParams(new FormData(form));
          data.set('source', location.origin + location.pathname);
          data.set('js', '1');
          fetch(form.action, { method: 'POST', body: data })
            .then(function (r) { return r.json(); })
            .then(function (j) {
              if (j.ok) return done();
              show(j.error || 'Something went wrong — please try again.', true);
              if (button) button.disabled = false;
            })
            .catch(function () { form.submit(); }); // fetch blocked → native POST
        })();
      });
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
