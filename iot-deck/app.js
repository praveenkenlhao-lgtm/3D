(() => {
  const slides = [...document.querySelectorAll('.slide')];
  const counter = document.getElementById('counter');
  const progress = document.getElementById('progress');
  const stage = document.getElementById('stage');
  let current = 0;
  function show(index) {
    current = Math.max(0, Math.min(slides.length - 1, index));
    slides.forEach((slide, i) => { slide.classList.toggle('active', i === current); slide.setAttribute('aria-hidden', i === current ? 'false' : 'true'); });
    counter.textContent = String(current + 1).padStart(2, '0') + ' / ' + String(slides.length).padStart(2, '0');
    progress.style.width = ((current + 1) / slides.length * 100) + '%';
    document.title = String(current + 1).padStart(2, '0') + ' — IoT สำหรับโรงงาน';
  }
  document.getElementById('prev').addEventListener('click', () => show(current - 1));
  document.getElementById('next').addEventListener('click', () => show(current + 1));
  document.getElementById('fullscreen').addEventListener('click', async () => { try { if (!document.fullscreenElement) await stage.requestFullscreen(); else await document.exitFullscreen(); } catch (_) {} });
  document.addEventListener('keydown', event => {
    if (['ArrowRight','PageDown',' '].includes(event.key)) { event.preventDefault(); show(current + 1); }
    if (['ArrowLeft','PageUp'].includes(event.key)) { event.preventDefault(); show(current - 1); }
    if (event.key === 'Home') show(0);
    if (event.key === 'End') show(slides.length - 1);
  });
  let touchX = null;
  stage.addEventListener('touchstart', e => { touchX = e.changedTouches[0].clientX; }, {passive:true});
  stage.addEventListener('touchend', e => { if (touchX === null) return; const dx = e.changedTouches[0].clientX - touchX; if (Math.abs(dx) > 48) show(current + (dx < 0 ? 1 : -1)); touchX = null; }, {passive:true});
  show(0);
})();
