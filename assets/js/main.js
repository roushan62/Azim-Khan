/* Azim Khan — site interactions. Vanilla JS, no dependencies. */
(function () {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ---------- Header: scrolled state, mobile menu, progress ---------- */
  const header = $('.header');
  const progress = $('.progress');
  const totop = $('.totop');
  let ticking = false;
  function onScroll() {
    const y = window.scrollY || document.documentElement.scrollTop;
    if (header) header.classList.toggle('scrolled', y > 24);
    if (totop) totop.classList.toggle('show', y > 600);
    if (progress) {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.transform = 'scaleX(' + (h > 0 ? Math.min(1, y / h) : 0) + ')';
    }
    ticking = false;
  }
  window.addEventListener('scroll', () => { if (!ticking) { requestAnimationFrame(onScroll); ticking = true; } }, { passive: true });
  onScroll();

  const burger = $('.burger');
  if (burger && header) {
    const nav = $('.nav', header);
    $$('a', nav).forEach((a, i) => a.style.setProperty('--i', i));
    const close = () => { header.classList.remove('open'); burger.setAttribute('aria-expanded', 'false'); document.body.style.overflow = ''; };
    burger.addEventListener('click', () => {
      const open = header.classList.toggle('open');
      burger.setAttribute('aria-expanded', String(open));
      document.body.style.overflow = open ? 'hidden' : '';
    });
    nav.addEventListener('click', (e) => { if (e.target.closest('a')) close(); });
    window.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
    window.matchMedia('(min-width: 961px)').addEventListener('change', (e) => { if (e.matches) close(); });
  }
  if (totop) totop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }));

  /* ---------- Reveal on scroll ---------- */
  const revealEls = $$('[data-reveal], [data-stagger], .reveal-img');
  if ('IntersectionObserver' in window && !reduce) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('in'));
  }

  /* ---------- Count-up numbers ---------- */
  const counters = $$('[data-count]');
  if (counters.length) {
    const fmt = (n, dec) => n.toLocaleString('en-IN', { minimumFractionDigits: dec, maximumFractionDigits: dec });
    const run = (el) => {
      const target = parseFloat(el.dataset.count);
      const dec = (el.dataset.count.split('.')[1] || '').length;
      const dur = 1600; const t0 = performance.now();
      const step = (t) => {
        const p = Math.min(1, (t - t0) / dur); const e = 1 - Math.pow(1 - p, 4);
        el.textContent = fmt(target * e, dec);
        if (p < 1) requestAnimationFrame(step); else el.textContent = fmt(target, dec);
      };
      if (reduce) { el.textContent = fmt(target, dec); return; }
      requestAnimationFrame(step);
    };
    const cio = new IntersectionObserver((ens) => ens.forEach((en) => { if (en.isIntersecting) { run(en.target); cio.unobserve(en.target); } }), { threshold: 0.5 });
    counters.forEach((c) => cio.observe(c));
  }

  /* ---------- Pointer spotlight + 3D tilt on glass cards ---------- */
  if (finePointer && !reduce) {
    $$('.spot').forEach((card) => {
      card.addEventListener('pointermove', (e) => {
        const r = card.getBoundingClientRect();
        card.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100).toFixed(2) + '%');
        card.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100).toFixed(2) + '%');
      });
    });
    $$('[data-tilt]').forEach((card) => {
      const max = parseFloat(card.dataset.tilt) || 6;
      let raf = 0;
      card.addEventListener('pointermove', (e) => {
        if (raf) return;
        raf = requestAnimationFrame(() => {
          const r = card.getBoundingClientRect();
          const x = (e.clientX - r.left) / r.width - 0.5; const y = (e.clientY - r.top) / r.height - 0.5;
          card.style.transform = 'perspective(900px) rotateX(' + (-y * max).toFixed(2) + 'deg) rotateY(' + (x * max).toFixed(2) + 'deg) translateY(-4px)';
          raf = 0;
        });
      });
      card.addEventListener('pointerleave', () => { card.style.transform = ''; });
    });
  }

  /* ---------- Sliders (scroll-snap + drag + arrows + dots + autoplay) ---------- */
  $$('.slider').forEach((slider) => {
    const track = $('.track', slider);
    if (!track) return;
    const slides = $$('.slide', track);
    const prev = $('.prev', slider), next = $('.next', slider), dots = $('.dots', slider);
    const auto = slider.dataset.autoplay ? parseInt(slider.dataset.autoplay, 10) : 0;
    let timer = 0, idx = 0;

    if (dots) {
      slides.forEach((_, i) => {
        const b = document.createElement('button'); b.type = 'button'; b.setAttribute('aria-label', 'Go to slide ' + (i + 1));
        b.addEventListener('click', () => go(i)); dots.appendChild(b);
      });
    }
    const dotBtns = dots ? $$('button', dots) : [];
    let gapCache = -1;
    const trackGap = () => { if (gapCache < 0) gapCache = parseFloat(getComputedStyle(track).gap) || 0; return gapCache; };
    const perView = () => { const w = slides[0] ? slides[0].getBoundingClientRect().width : 1; const gap = trackGap(); return Math.max(1, Math.round((track.clientWidth + gap) / (w + gap))); };
    const maxIdx = () => Math.max(0, slides.length - perView());
    function update() {
      const w = slides[0] ? slides[0].getBoundingClientRect().width + trackGap() : 1;
      idx = Math.round(track.scrollLeft / w);
      dotBtns.forEach((d, i) => d.classList.toggle('active', i === Math.min(idx, dotBtns.length - 1)));
      if (prev) prev.disabled = track.scrollLeft <= 2;
      if (next) next.disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 2;
    }
    function go(i) {
      i = Math.max(0, Math.min(i, maxIdx()));
      const s = slides[i]; if (!s) return;
      track.scrollTo({ left: s.offsetLeft - track.offsetLeft, behavior: reduce ? 'auto' : 'smooth' });
    }
    prev && prev.addEventListener('click', () => { go(idx - 1); restart(); });
    next && next.addEventListener('click', () => { go(idx >= maxIdx() ? 0 : idx + 1); restart(); });
    let sTick = false;
    track.addEventListener('scroll', () => { if (!sTick) { requestAnimationFrame(() => { update(); sTick = false; }); sTick = true; } }, { passive: true });
    window.addEventListener('resize', () => { gapCache = -1; update(); });

    // pointer drag (desktop)
    let down = false, startX = 0, startL = 0, moved = false;
    track.addEventListener('pointerdown', (e) => { if (e.pointerType !== 'mouse') return; down = true; moved = false; startX = e.clientX; startL = track.scrollLeft; track.classList.add('dragging'); });
    window.addEventListener('pointermove', (e) => { if (!down) return; const dx = e.clientX - startX; if (Math.abs(dx) > 4) moved = true; track.scrollLeft = startL - dx; });
    const up = () => { if (!down) return; down = false; track.classList.remove('dragging'); go(Math.round(track.scrollLeft / (slides[0].getBoundingClientRect().width + trackGap()))); };
    window.addEventListener('pointerup', up); window.addEventListener('pointercancel', up);
    track.addEventListener('click', (e) => { if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; } }, true);

    // keyboard
    slider.addEventListener('keydown', (e) => { if (e.key === 'ArrowRight') { go(idx + 1); } if (e.key === 'ArrowLeft') { go(idx - 1); } });

    function restart() { if (!auto || reduce) return; clearInterval(timer); timer = setInterval(() => { go(idx >= maxIdx() ? 0 : idx + 1); }, auto); }
    if (auto && !reduce) {
      restart();
      slider.addEventListener('pointerenter', () => clearInterval(timer));
      slider.addEventListener('pointerleave', restart);
      slider.addEventListener('focusin', () => clearInterval(timer));
      slider.addEventListener('focusout', restart);
      document.addEventListener('visibilitychange', () => { document.hidden ? clearInterval(timer) : restart(); });
    }
    update();
  });

  /* ---------- Filters ---------- */
  $$('[data-filters]').forEach((wrap) => {
    const grid = $(wrap.dataset.filters);
    if (!grid) return;
    const items = Array.from(grid.children);
    wrap.addEventListener('click', (e) => {
      const b = e.target.closest('button[data-filter]'); if (!b) return;
      $$('button', wrap).forEach((x) => x.classList.toggle('active', x === b));
      const f = b.dataset.filter;
      items.forEach((it) => {
        const show = f === 'all' || (it.dataset.tags || '').split(' ').includes(f);
        if (show) { it.classList.remove('hide'); requestAnimationFrame(() => it.classList.remove('out')); }
        else { it.classList.add('out'); setTimeout(() => it.classList.add('hide'), 320); }
      });
    });
  });

  /* ---------- Lightbox ---------- */
  const lbLinks = $$('[data-lightbox]');
  if (lbLinks.length) {
    const lb = document.createElement('div');
    lb.className = 'lightbox'; lb.setAttribute('role', 'dialog'); lb.setAttribute('aria-modal', 'true'); lb.setAttribute('aria-label', 'Image viewer');
    lb.innerHTML = '<button class="x" aria-label="Close"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg></button>' +
      '<button class="p" aria-label="Previous"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg></button>' +
      '<figure><img alt=""><figcaption></figcaption></figure>' +
      '<button class="n" aria-label="Next"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"/></svg></button>';
    document.body.appendChild(lb);
    const img = $('img', lb), cap = $('figcaption', lb);
    let group = [], i = 0, lastFocus = null;
    const show = () => { const a = group[i]; img.src = a.getAttribute('href'); img.alt = a.dataset.caption || ''; cap.textContent = a.dataset.caption || ''; };
    const open = (a) => {
      const g = a.dataset.lightbox || 'default';
      group = lbLinks.filter((x) => (x.dataset.lightbox || 'default') === g); i = group.indexOf(a);
      lastFocus = document.activeElement; show(); lb.classList.add('open'); document.body.style.overflow = 'hidden'; $('.x', lb).focus();
    };
    const close = () => { lb.classList.remove('open'); document.body.style.overflow = ''; if (lastFocus) lastFocus.focus(); };
    lbLinks.forEach((a) => a.addEventListener('click', (e) => { e.preventDefault(); open(a); }));
    $('.x', lb).addEventListener('click', close);
    $('.p', lb).addEventListener('click', () => { i = (i - 1 + group.length) % group.length; show(); });
    $('.n', lb).addEventListener('click', () => { i = (i + 1) % group.length; show(); });
    lb.addEventListener('click', (e) => { if (e.target === lb) close(); });
    window.addEventListener('keydown', (e) => {
      if (!lb.classList.contains('open')) return;
      if (e.key === 'Escape') close(); if (e.key === 'ArrowRight') $('.n', lb).click(); if (e.key === 'ArrowLeft') $('.p', lb).click();
    });
    let tx = 0; lb.addEventListener('touchstart', (e) => { tx = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend', (e) => { const dx = e.changedTouches[0].clientX - tx; if (Math.abs(dx) > 50) (dx < 0 ? $('.n', lb) : $('.p', lb)).click(); });
  }

  /* ---------- Timeline progress line ---------- */
  const tl = $('.timeline');
  if (tl) {
    const items = $$('.tl', tl);
    const tio = new IntersectionObserver((ens) => ens.forEach((en) => { if (en.isIntersecting) en.target.classList.add('in'); }), { threshold: 0.4 });
    items.forEach((it) => tio.observe(it));
    const fill = () => {
      const r = tl.getBoundingClientRect(); const vh = window.innerHeight;
      const p = Math.max(0, Math.min(1, (vh * 0.7 - r.top) / r.height));
      tl.style.setProperty('--fill', (p * 100).toFixed(1) + '%');
    };
    window.addEventListener('scroll', fill, { passive: true }); fill();
  }

  /* ---------- Copy-to-clipboard + toast ---------- */
  const toast = document.createElement('div'); toast.className = 'toast'; toast.setAttribute('role', 'status'); document.body.appendChild(toast);
  let toastT = 0;
  const say = (msg) => { toast.textContent = msg; toast.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(() => toast.classList.remove('show'), 2200); };
  $$('[data-copy]').forEach((b) => b.addEventListener('click', async (e) => {
    e.preventDefault();
    try { await navigator.clipboard.writeText(b.dataset.copy); b.classList.add('done'); const t = b.textContent; b.textContent = 'Copied'; say('Copied to clipboard'); setTimeout(() => { b.classList.remove('done'); b.textContent = t; }, 1600); }
    catch (err) { say('Copy failed — please select the text'); }
  }));

  /* ---------- Contact form → mailto (no backend on GitHub Pages) ---------- */
  const form = $('#contact-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const d = Object.fromEntries(new FormData(form).entries());
      if (!d.name || !d.email || !d.message) { say('Please fill in your name, email and message'); return; }
      const subject = encodeURIComponent('[Website] ' + (d.topic || 'Enquiry') + ' — ' + d.name);
      const body = encodeURIComponent(d.message + '\n\n—\n' + d.name + (d.company ? ' · ' + d.company : '') + '\n' + d.email + (d.phone ? ' · ' + d.phone : ''));
      window.location.href = 'mailto:' + form.dataset.to + '?subject=' + subject + '&body=' + body;
      say('Opening your email app…');
    });
  }

  /* ---------- Share buttons ---------- */
  $$('[data-share]').forEach((b) => b.addEventListener('click', async (e) => {
    e.preventDefault();
    const url = location.href, title = document.title;
    if (b.dataset.share === 'native' && navigator.share) { try { await navigator.share({ title, url }); } catch (_) {} return; }
    if (b.dataset.share === 'copy') { try { await navigator.clipboard.writeText(url); say('Link copied'); } catch (_) {} return; }
    const map = { linkedin: 'https://www.linkedin.com/sharing/share-offsite/?url=' + encodeURIComponent(url), x: 'https://twitter.com/intent/tweet?url=' + encodeURIComponent(url) + '&text=' + encodeURIComponent(title), whatsapp: 'https://wa.me/?text=' + encodeURIComponent(title + ' ' + url) };
    if (map[b.dataset.share]) window.open(map[b.dataset.share], '_blank', 'noopener,width=640,height=560');
  }));

  /* ---------- Blog index: auto reading time on cards without one ---------- */
  $$('[data-readtime]').forEach((el) => { const sel = el.dataset.readtime; if (!sel) return; const words = el.textContent.trim().split(/\s+/).length; const t = $(sel); if (t) t.textContent = Math.max(1, Math.round(words / 200)) + ' min read'; });

  /* ---------- Current year ---------- */
  $$('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });
})();
