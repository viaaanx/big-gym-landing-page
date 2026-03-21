(function () {
  const navbar = document.querySelector(".navbar");
  const toggle = document.querySelector(".nav-toggle");
  const menu   = document.querySelector(".nav-menu");
  const links  = menu ? menu.querySelectorAll("a") : [];

  if (!navbar) return;

  function onScroll() {
    navbar.classList.toggle("scrolled", window.scrollY > 40);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (e) => {
      const id = link.getAttribute("href");
      if (id === "#") return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const navH = navbar.getBoundingClientRect().height;
      if (id === "#hero") { window.scrollTo({ top: 0, behavior: "smooth" }); return; }
      const targetTop = target.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top: targetTop - navH - 8, behavior: "smooth" });
    });
  });

  if (!toggle || !menu) return;

  function openMenu() {
    menu.classList.add("is-open");
    toggle.setAttribute("aria-expanded", "true");
    toggle.setAttribute("aria-label", "Fechar menu");
    document.body.classList.add("nav-open");
  }
  function closeMenu() {
    menu.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Abrir menu");
    document.body.classList.remove("nav-open");
  }

  toggle.addEventListener("click", () =>
    menu.classList.contains("is-open") ? closeMenu() : openMenu()
  );
  links.forEach((link) => link.addEventListener("click", closeMenu));
  document.addEventListener("click", (e) => {
    if (!menu.contains(e.target) && !toggle.contains(e.target)) closeMenu();
  });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeMenu(); });
})();

(function () {
  const sections = document.querySelectorAll(".reveal-section");
  if (!sections.length || !("IntersectionObserver" in window)) {
    sections.forEach((s) => s.classList.add("section-revealed"));
    return;
  }
  sections.forEach((section) => {
    if (section.getBoundingClientRect().top < window.innerHeight * 0.85)
      section.classList.add("section-visible");
  });
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const s = entry.target;
      if (s.classList.contains("section-visible")) { observer.unobserve(s); return; }
      s.classList.add("section-revealed");
      observer.unobserve(s);
    });
  }, { threshold: 0.08 });
  sections.forEach((s) => {
    if (!s.classList.contains("section-visible")) observer.observe(s);
  });
})();

(function () {
  const lightbox  = document.getElementById("lightbox");
  const lbImg     = lightbox?.querySelector(".lightbox-img");
  const lbCaption = lightbox?.querySelector(".lightbox-caption");
  const lbClose   = lightbox?.querySelector(".lightbox-close");
  const lbBg      = lightbox?.querySelector(".lightbox-backdrop");
  const triggers  = Array.from(document.querySelectorAll("[data-lightbox]"));

  if (!lightbox || !triggers.length) return;

  const prevBtn = document.createElement("button");
  prevBtn.className = "lightbox-nav lightbox-nav-prev";
  prevBtn.setAttribute("aria-label", "Foto anterior");
  prevBtn.innerHTML = "&#8249;";

  const nextBtn = document.createElement("button");
  nextBtn.className = "lightbox-nav lightbox-nav-next";
  nextBtn.setAttribute("aria-label", "Proxima foto");
  nextBtn.innerHTML = "&#8250;";

  const counter = document.createElement("p");
  counter.className = "lightbox-counter";

  lightbox.appendChild(prevBtn);
  lightbox.appendChild(nextBtn);
  lbCaption.insertAdjacentElement("afterend", counter);

  let currentIndex = 0;

  function updateCounter() {
    counter.textContent = (currentIndex + 1) + " / " + triggers.length;
  }

  function showSlide(index, animate) {
    currentIndex = (index + triggers.length) % triggers.length;
    const el = triggers[currentIndex];
    if (animate) {
      lbImg.classList.add("is-transitioning");
      setTimeout(() => {
        lbImg.src = el.dataset.lightbox;
        lbImg.alt = el.dataset.caption || "";
        lbCaption.textContent = el.dataset.caption || "";
        updateCounter();
        lbImg.classList.remove("is-transitioning");
      }, 180);
    } else {
      lbImg.src = el.dataset.lightbox;
      lbImg.alt = el.dataset.caption || "";
      lbCaption.textContent = el.dataset.caption || "";
      updateCounter();
    }
  }

  function openLightbox(index) {
    lightbox.hidden = false;
    document.body.style.overflow = "hidden";
    showSlide(index, false);
    lbClose.focus();
  }

  function closeLightbox() {
    lightbox.hidden = true;
    lbImg.src = "";
    document.body.style.overflow = "";
  }

  triggers.forEach((el, i) => {
    el.addEventListener("click", () => openLightbox(i));
    el.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openLightbox(i); }
    });
  });

  prevBtn.addEventListener("click", (e) => { e.stopPropagation(); showSlide(currentIndex - 1, true); });
  nextBtn.addEventListener("click", (e) => { e.stopPropagation(); showSlide(currentIndex + 1, true); });
  lbClose?.addEventListener("click", closeLightbox);
  lbBg?.addEventListener("click", closeLightbox);
  document.addEventListener("keydown", (e) => {
    if (lightbox.hidden) return;
    if (e.key === "Escape")     closeLightbox();
    if (e.key === "ArrowLeft")  showSlide(currentIndex - 1, true);
    if (e.key === "ArrowRight") showSlide(currentIndex + 1, true);
  });
})();

(function () {
  const track    = document.querySelector(".feedback-track");
  const nextBtn  = document.querySelector('[data-feedback="next"]');
  const prevBtn  = document.querySelector('[data-feedback="prev"]');
  const carousel = document.querySelector(".feedback-carousel");

  if (!track || !nextBtn || !prevBtn) return;

  const originalCards = Array.from(track.children);
  const originalCount = originalCards.length;

  const barWrap  = document.createElement("div");
  barWrap.className = "feedback-bar-wrap";
  const barThumb = document.createElement("div");
  barThumb.className = "feedback-bar-thumb";
  barWrap.appendChild(barThumb);

  if (carousel && carousel.parentNode) {
    carousel.parentNode.insertBefore(barWrap, carousel.nextSibling);
  }

  const viewport = document.querySelector(".feedback-viewport");

  function alignBar() {
    if (!viewport || !carousel) return;
    const vpRect  = viewport.getBoundingClientRect();
    const barRect = barWrap.parentElement.getBoundingClientRect();
    barWrap.style.marginLeft  = (vpRect.left  - barRect.left)  + "px";
    barWrap.style.marginRight = (barRect.right - vpRect.right) + "px";
  }

  window.addEventListener("resize", alignBar, { passive: true });
  setTimeout(alignBar, 0);
  setTimeout(alignBar, 200);

  function getCardWidth() {
    const card = track.firstElementChild;
    if (!card) return 0;
    return card.offsetWidth + (parseFloat(getComputedStyle(track).gap) || 0);
  }

  function updateBar() {
    const sl  = track.scrollLeft;
    const max = track.scrollWidth - track.clientWidth;
    if (max <= 0) return;

    const thumbW  = Math.max(track.clientWidth / track.scrollWidth, 0.08) * 100;
    const maxLeft = 100 - thumbW;

    barThumb.style.width = thumbW + "%";
    barThumb.style.left  = (sl / max) * maxLeft + "%";

    const atEnd   = sl >= max - 4;
    const atStart = sl <= 4;
    nextBtn.style.opacity = atEnd   ? "0.3" : "1";
    prevBtn.style.opacity = atStart ? "0.3" : "1";
    nextBtn.style.pointerEvents = atEnd   ? "none" : "";
    prevBtn.style.pointerEvents = atStart ? "none" : "";
  }

  function scrollNext() {
    const max = track.scrollWidth - track.clientWidth;
    if (track.scrollLeft >= max - 4) return;
    track.scrollBy({ left: getCardWidth(), behavior: "smooth" });
  }

  function scrollPrev() {
    if (track.scrollLeft <= 4) return;
    track.scrollBy({ left: -getCardWidth(), behavior: "smooth" });
  }

  nextBtn.addEventListener("click", scrollNext);
  prevBtn.addEventListener("click", scrollPrev);
  track.addEventListener("scroll", updateBar, { passive: true });
  window.addEventListener("resize", updateBar, { passive: true });
  setTimeout(updateBar, 150);
})();

(function () {
  const style = document.createElement("style");
  style.textContent = `
    .js-fade-host {
      position: relative;
    }
    .js-fade-host::before {
      content: "";
      position: absolute;
      top: 0; left: 0;
      width: 64px;
      height: calc(100% - 18px);
      pointer-events: none;
      z-index: 5;
      background: linear-gradient(to left, transparent, var(--bg-fade-color, #141414));
      opacity: 0;
      transition: opacity 0.3s ease;
    }
    .js-fade-host::after {
      content: "";
      position: absolute;
      top: 0; right: 0;
      width: 64px;
      height: calc(100% - 18px);
      pointer-events: none;
      z-index: 5;
      background: linear-gradient(to right, transparent, var(--bg-fade-color, #141414));
      opacity: 0;
      transition: opacity 0.3s ease;
    }
    .js-fade-host.show-fade-right::after { opacity: 1; }
    .js-fade-host.show-fade-left::before { opacity: 1; }
    .js-scroll-bar-wrap {
      height: 3px;
      background: rgba(255,255,255,0.08);
      border-radius: 99px;
      margin-top: 12px;
      position: relative;
    }
    .js-scroll-bar-thumb {
      height: 100%;
      background: #facc14;
      border-radius: 99px;
      position: absolute;
      top: 0; left: 0;
      transition: width 0.12s ease, left 0.12s ease;
      min-width: 8%;
    }
  `;
  document.head.appendChild(style);

  function attachBar(scroller, bgColor) {
    if (scroller.dataset.scrollBarAttached) return;
    scroller.dataset.scrollBarAttached = "1";

    const parent = scroller.parentNode;
    parent.classList.add("js-fade-host");
    if (bgColor) parent.style.setProperty("--bg-fade-color", bgColor);

    const wrap  = document.createElement("div");
    wrap.className = "js-scroll-bar-wrap";
    const thumb = document.createElement("div");
    thumb.className = "js-scroll-bar-thumb";
    wrap.appendChild(thumb);
    parent.insertBefore(wrap, scroller.nextSibling);

    function update() {
      const sl  = scroller.scrollLeft;
      const sw  = scroller.scrollWidth;
      const cw  = scroller.clientWidth;
      const max = sw - cw;

      if (max <= 4) {
        parent.classList.remove("show-fade-right", "show-fade-left");
        wrap.style.opacity = "0";
        return;
      }

      wrap.style.opacity = "1";
      parent.classList.toggle("show-fade-right", sl < max - 8);
      parent.classList.toggle("show-fade-left",  sl > 8);

      const thumbW   = Math.max(cw / sw, 0.08) * 100;
      const thumbMax = 100 - thumbW;
      thumb.style.width = thumbW + "%";
      thumb.style.left  = (sl / max) * thumbMax + "%";
    }

    scroller.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize",   update, { passive: true });
    setTimeout(update, 200);
  }

  const difGrid    = document.querySelector(".diferencial-grid");
  const instrGrid  = document.querySelector(".instrutores-grid");
  const planosGrid = document.querySelector(".planos-grid");

  if (difGrid)    attachBar(difGrid,    "#000");
  if (instrGrid)  attachBar(instrGrid,  "#141414");
  if (planosGrid) attachBar(planosGrid, "#000");
})();

(function () {
  const iframe = document.querySelector(".localizacao-mapa iframe[data-src]");
  if (!iframe) return;
  const obs = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      iframe.src = iframe.dataset.src;
      obs.disconnect();
    });
  }, { rootMargin: "200px" });
  obs.observe(iframe);
})();

(function () {
  const stats = document.querySelectorAll(".hero-stat-number[data-target]");
  if (!stats.length) return;

  function easeOut(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function animateStat(el) {
    const target  = parseInt(el.dataset.target, 10);
    const dur     = 1800;
    const start   = performance.now();

    function step(now) {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / dur, 1);
      const value    = Math.round(easeOut(progress) * target);
      el.textContent = value;
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = target;
    }

    requestAnimationFrame(step);
  }

  const obs = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      animateStat(entry.target);
      obs.unobserve(entry.target);
    });
  }, { threshold: 0.5 });

  stats.forEach((el) => obs.observe(el));
})();