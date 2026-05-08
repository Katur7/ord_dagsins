// Orð dagsins — headword auto-fit
// Binary-searches the largest font-size (in [min, max]) that fits the
// container width on a single line. Falls back to wrapping if even
// the minimum doesn't fit.
//
// See ../DESIGN.md §3 for full rationale.

(function () {
  function fit(container) {
    const measure = container.querySelector('.headword-measure');
    const visible = container.querySelector('.headword-visible');
    if (!measure || !visible) return;

    const isDesktop = window.matchMedia('(min-width: 720px)').matches;
    const minPx = parseFloat(container.dataset[isDesktop ? 'minDesktop' : 'minPhone']) || 32;
    const maxPx = parseFloat(container.dataset[isDesktop ? 'maxDesktop' : 'maxPhone']) || 76;

    const available = container.clientWidth;
    if (!available) return;

    measure.style.fontSize = maxPx + 'px';
    if (measure.offsetWidth <= available) {
      visible.classList.remove('wraps');
      visible.style.fontSize = maxPx + 'px';
      return;
    }
    measure.style.fontSize = minPx + 'px';
    if (measure.offsetWidth > available) {
      visible.classList.add('wraps');
      visible.style.fontSize = minPx + 'px';
      return;
    }
    let lo = minPx, hi = maxPx, best = minPx;
    for (let i = 0; i < 22; i++) {
      const mid = (lo + hi) / 2;
      measure.style.fontSize = mid + 'px';
      if (measure.offsetWidth <= available) { best = mid; lo = mid; }
      else { hi = mid; }
    }
    visible.classList.remove('wraps');
    visible.style.fontSize = Math.floor(best) + 'px';
  }

  function init() {
    const containers = document.querySelectorAll('.headword-fit');
    if (!containers.length) return;
    const run = () => containers.forEach(fit);
    run();
    if (window.ResizeObserver) {
      const ro = new ResizeObserver(run);
      containers.forEach(c => ro.observe(c));
    } else {
      window.addEventListener('resize', run);
    }
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(run);
    }
    window.addEventListener('load', run);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
