/* AttaID — CEO deck
   Keyboard, click and swipe navigation; deep-linkable via #s3. */

(function () {
  'use strict';

  var slides = Array.prototype.slice.call(document.querySelectorAll('.slide'));
  if (!slides.length) return;

  var cur = document.getElementById('cur');
  var tot = document.getElementById('tot');
  var prev = document.getElementById('prev');
  var next = document.getElementById('next');
  var bar = document.getElementById('progress');

  var i = 0;
  tot.textContent = slides.length;

  /* on narrow screens the deck reflows into one scrolling column —
     navigation is meaningless there, so leave every slide visible. */
  function isStacked() {
    return !window.matchMedia('(min-width: 701px) and (min-aspect-ratio: 4/5)').matches;
  }

  function show(n, push) {
    i = Math.max(0, Math.min(slides.length - 1, n));

    slides.forEach(function (s, k) { s.classList.toggle('is-on', k === i); });
    cur.textContent = i + 1;
    bar.style.width = ((i + 1) / slides.length * 100) + '%';
    prev.disabled = i === 0;
    next.disabled = i === slides.length - 1;

    if (push) {
      try { history.replaceState(null, '', '#s' + (i + 1)); } catch (e) { /* file:// */ }
    }
  }

  function go(step) { if (!isStacked()) show(i + step, true); }

  /* --- controls --- */

  prev.addEventListener('click', function () { go(-1); });
  next.addEventListener('click', function () { go(1); });

  document.addEventListener('keydown', function (e) {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    switch (e.key) {
      case 'ArrowRight': case 'PageDown': case ' ': go(1); e.preventDefault(); break;
      case 'ArrowLeft':  case 'PageUp':          go(-1); e.preventDefault(); break;
      case 'Home': show(0, true); e.preventDefault(); break;
      case 'End':  show(slides.length - 1, true); e.preventDefault(); break;
    }
  });

  /* click the right or left half of the deck to advance or go back */
  document.getElementById('deck').addEventListener('click', function (e) {
    if (isStacked()) return;
    if (e.target.closest('a, button')) return;
    var box = this.getBoundingClientRect();
    go(e.clientX - box.left > box.width / 2 ? 1 : -1);
  });

  /* swipe */
  var x0 = null;
  document.addEventListener('touchstart', function (e) { x0 = e.changedTouches[0].clientX; }, { passive: true });
  document.addEventListener('touchend', function (e) {
    if (x0 === null) return;
    var dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
    x0 = null;
  }, { passive: true });

  /* --- start --- */

  var hash = /^#s(\d+)$/.exec(window.location.hash);
  show(hash ? parseInt(hash[1], 10) - 1 : 0, false);

  /* if the layout flips between stacked and deck, re-assert the right state */
  window.addEventListener('resize', function () {
    if (isStacked()) slides.forEach(function (s) { s.classList.remove('is-on'); });
    else show(i, false);
  });
})();
