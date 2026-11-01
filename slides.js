(() => {
  const total = 10;
  const slidesHost = document.querySelector('#slides');
  const thumbsHost = document.querySelector('#thumbnails');
  const currentLabel = document.querySelector('#current-number');
  const progress = document.querySelector('#progress');
  const progressTrack = document.querySelector('.progress-track');
  const overview = document.querySelector('#overview');
  let current = 0;
  let zoom = 1;
  let touchStartX = null;

  const pad = value => String(value).padStart(2, '0');
  const slidePath = number => `slides/slide-${pad(number)}.jpg`;

  for (let number = 1; number <= total; number += 1) {
    const slide = document.createElement('article');
    slide.className = 'slide';
    slide.id = `slide-${number}`;
    slide.setAttribute('aria-label', `สไลด์ ${number} จาก ${total}`);
    slide.setAttribute('aria-hidden', 'true');
    const img = document.createElement('img');
    img.src = slidePath(number);
    img.alt = `สไลด์ Resin 3D Printing หน้า ${number}`;
    img.fetchPriority = number === 1 ? 'high' : 'auto';
    img.draggable = false;
    slide.append(img);
    slidesHost.append(slide);

    const button = document.createElement('button');
    button.className = 'thumbnail';
    button.type = 'button';
    button.setAttribute('aria-label', `ไปที่สไลด์ ${number}`);
    button.innerHTML = `<img src="${slidePath(number)}" alt="" loading="lazy"><span>สไลด์ ${pad(number)}</span>`;
    button.addEventListener('click', () => { show(number - 1); toggleOverview(false); });
    thumbsHost.append(button);
  }

  const slideEls = [...slidesHost.children];
  const thumbEls = [...thumbsHost.children];

  function show(index) {
    current = Math.max(0, Math.min(total - 1, index));
    slideEls.forEach((slide, i) => {
      const active = i === current;
      slide.classList.toggle('active', active);
      slide.setAttribute('aria-hidden', String(!active));
    });
    thumbEls.forEach((thumb, i) => {
      if (i === current) thumb.setAttribute('aria-current', 'true');
      else thumb.removeAttribute('aria-current');
    });
    currentLabel.textContent = pad(current + 1);
    progress.style.width = `${((current + 1) / total) * 100}%`;
    progressTrack.setAttribute('aria-valuenow', String(current + 1));
    slidesHost.style.setProperty('--slide-zoom', String(zoom));
    document.querySelector('#prev').disabled = current === 0;
    document.querySelector('#prev-bottom').disabled = current === 0;
    document.querySelector('#next').disabled = current === total - 1;
    document.querySelector('#next-bottom').disabled = current === total - 1;
    history.replaceState(null, '', `#slide-${current + 1}`);
  }

  function setZoom(value) {
    zoom = Math.max(0.6, Math.min(2.5, Math.round(value * 10) / 10));
    slidesHost.style.setProperty('--slide-zoom', String(zoom));
    document.querySelector('#zoom-level').textContent = `${Math.round(zoom * 100)}%`;
    document.querySelector('#zoom-out').disabled = zoom <= 0.6;
    document.querySelector('#zoom-in').disabled = zoom >= 2.5;
  }

  function toggleOverview(force) {
    const open = typeof force === 'boolean' ? force : overview.hidden;
    overview.hidden = !open;
    document.querySelector('#overview-toggle').setAttribute('aria-expanded', String(open));
  }

  document.querySelector('#prev').addEventListener('click', () => show(current - 1));
  document.querySelector('#next').addEventListener('click', () => show(current + 1));
  document.querySelector('#prev-bottom').addEventListener('click', () => show(current - 1));
  document.querySelector('#next-bottom').addEventListener('click', () => show(current + 1));
  document.querySelector('#overview-toggle').addEventListener('click', () => toggleOverview());
  document.querySelector('#zoom-out').addEventListener('click', () => setZoom(zoom - 0.1));
  document.querySelector('#zoom-in').addEventListener('click', () => setZoom(zoom + 0.1));
  document.querySelector('#fullscreen-toggle').addEventListener('click', async () => {
    if (!document.fullscreenElement) await document.documentElement.requestFullscreen?.();
    else await document.exitFullscreen?.();
  });

  document.addEventListener('keydown', event => {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    if (['ArrowRight', 'PageDown', ' '].includes(event.key)) { event.preventDefault(); show(current + 1); }
    else if (['ArrowLeft', 'PageUp'].includes(event.key)) { event.preventDefault(); show(current - 1); }
    else if (event.key === 'Home') show(0);
    else if (event.key === 'End') show(total - 1);
    else if (event.key === 'Escape') toggleOverview(false);
    else if (event.key.toLowerCase() === 'o') toggleOverview();
  });

  slidesHost.addEventListener('touchstart', event => { touchStartX = event.changedTouches[0].clientX; }, { passive: true });
  slidesHost.addEventListener('touchend', event => {
    if (touchStartX === null) return;
    const distance = event.changedTouches[0].clientX - touchStartX;
    if (Math.abs(distance) > 55) show(current + (distance < 0 ? 1 : -1));
    touchStartX = null;
  }, { passive: true });

  const initial = Number(location.hash.match(/^#slide-(\d+)$/)?.[1]);
  setZoom(1);
  show(Number.isFinite(initial) && initial > 0 && initial <= total ? initial - 1 : 0);
})();
