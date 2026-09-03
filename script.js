/* AttaID — Delivery Plan
   Theme, scroll-spy, phase accordion, timeline↔phase linking. */

(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------- theme ---------------- */

  var root = document.documentElement;
  var themeBtn = document.getElementById('theme');
  var STORE = 'attaid-theme';

  function readStored() {
    try { return localStorage.getItem(STORE); } catch (e) { return null; }
  }
  function writeStored(v) {
    try { localStorage.setItem(STORE, v); } catch (e) { /* private mode */ }
  }

  function applyTheme(next) {
    root.setAttribute('data-theme', next);
    var toDark = next === 'light';
    themeBtn.querySelector('.theme__label').textContent = toDark ? 'Dark' : 'Light';
    themeBtn.setAttribute('aria-label', 'Switch to ' + (toDark ? 'dark' : 'light') + ' theme');
  }

  var stored = readStored();
  if (stored === 'dark' || stored === 'light') {
    applyTheme(stored);
  } else {
    applyTheme(window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  }

  themeBtn.addEventListener('click', function () {
    var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    writeStored(next);
  });

  /* ---------------- scroll-spy ---------------- */

  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.rail__list a[data-spy]'));
  var sections = navLinks
    .map(function (a) { return document.querySelector(a.getAttribute('href')); })
    .filter(Boolean);

  function markHere(id) {
    navLinks.forEach(function (a) {
      a.classList.toggle('is-here', a.getAttribute('href') === '#' + id);
    });
  }

  if ('IntersectionObserver' in window && sections.length) {
    var visible = new Map();
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) visible.set(en.target.id, en.intersectionRatio);
        else visible.delete(en.target.id);
      });
      var best = null, bestRatio = -1;
      visible.forEach(function (ratio, id) {
        if (ratio > bestRatio) { bestRatio = ratio; best = id; }
      });
      if (best) markHere(best);
    }, { rootMargin: '-15% 0px -55% 0px', threshold: [0, 0.15, 0.4, 0.75, 1] });

    sections.forEach(function (s) { spy.observe(s); });
  }

  /* ---------------- phase accordion ---------------- */

  var heads = Array.prototype.slice.call(document.querySelectorAll('.phase__head'));

  function setPhase(head, open) {
    var body = document.getElementById(head.getAttribute('aria-controls'));
    head.setAttribute('aria-expanded', String(open));
    body.hidden = !open;
  }

  heads.forEach(function (head) {
    head.addEventListener('click', function () {
      var isOpen = head.getAttribute('aria-expanded') === 'true';
      setPhase(head, !isOpen);
      if (!isOpen) syncBars(head.closest('.phase').id);
      else syncBars(null);
    });
  });

  /* open the first phase so the section never reads as empty */
  if (heads.length) setPhase(heads[0], true);

  /* ---------------- timeline ↔ phase ---------------- */

  var bars = Array.prototype.slice.call(document.querySelectorAll('.bar--link'));

  function syncBars(activeId) {
    bars.forEach(function (b) {
      b.classList.toggle('is-active', !!activeId && b.dataset.phase === activeId);
    });
  }

  bars.forEach(function (bar) {
    bar.addEventListener('click', function () {
      var id = bar.dataset.phase;
      var phase = document.getElementById(id);
      if (!phase) return;

      heads.forEach(function (h) { setPhase(h, h.closest('.phase').id === id); });
      syncBars(id);

      phase.scrollIntoView({
        behavior: reduceMotion ? 'auto' : 'smooth',
        block: 'start'
      });
    });
  });

  syncBars(heads.length ? heads[0].closest('.phase').id : null);
})();
