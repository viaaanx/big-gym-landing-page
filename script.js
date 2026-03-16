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
      const navbarHeight = navbar.getBoundingClientRect().height;
      const targetTop    = target.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top: targetTop - navbarHeight - 12, behavior: "smooth" });
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
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMenu();
  });
})();

(function () {
  const sections = document.querySelectorAll(".reveal-section");
  if (!sections.length || !("IntersectionObserver" in window)) {
    sections.forEach((s) => s.classList.add("section-revealed"));
    return;
  }

  sections.forEach((section) => {
    const rect = section.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.85) {
      section.classList.add("section-visible");
    }
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const section = entry.target;
        if (section.classList.contains("section-visible")) {
          observer.unobserve(section);
          return;
        }
        section.classList.add("section-revealed");
        observer.unobserve(section);
      });
    },
    { threshold: 0.08 }
  );

  sections.forEach((section) => {
    if (!section.classList.contains("section-visible")) {
      observer.observe(section);
    }
  });
})();

(function () {
  const lightbox  = document.getElementById("lightbox");
  const lbImg     = lightbox?.querySelector(".lightbox-img");
  const lbCaption = lightbox?.querySelector(".lightbox-caption");
  const lbClose   = lightbox?.querySelector(".lightbox-close");
  const lbBg      = lightbox?.querySelector(".lightbox-backdrop");
  const triggers  = document.querySelectorAll("[data-lightbox]");

  if (!lightbox || !triggers.length) return;

  function openLightbox(src, caption) {
    lbImg.src = src;
    lbImg.alt = caption || "";
    lbCaption.textContent = caption || "";
    lightbox.hidden = false;
    document.body.style.overflow = "hidden";
    lbClose.focus();
  }

  function closeLightbox() {
    lightbox.hidden = true;
    lbImg.src = "";
    document.body.style.overflow = "";
  }

  triggers.forEach((el) => {
    el.addEventListener("click", () =>
      openLightbox(el.dataset.lightbox, el.dataset.caption)
    );
    el.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openLightbox(el.dataset.lightbox, el.dataset.caption);
      }
    });
  });

  lbClose?.addEventListener("click", closeLightbox);
  lbBg?.addEventListener("click", closeLightbox);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !lightbox.hidden) closeLightbox();
  });
})();

(function () {
  const track   = document.querySelector(".feedback-track");
  const nextBtn = document.querySelector('[data-feedback="next"]');
  const prevBtn = document.querySelector('[data-feedback="prev"]');

  if (!track || !nextBtn || !prevBtn) return;

  const originalCards = Array.from(track.children);

  function getStep() {
    const card = track.firstElementChild;
    if (!card) return 0;
    const gap = parseFloat(getComputedStyle(track).gap) || 0;
    return card.offsetWidth + gap;
  }

  function appendClones() {
    originalCards.forEach((card) => track.appendChild(card.cloneNode(true)));
  }

  function scrollNext() {
    const step = getStep();
    track.scrollBy({ left: step, behavior: "smooth" });
    const last = track.lastElementChild;
    const nearEnd =
      last.getBoundingClientRect().right <
      track.getBoundingClientRect().right + step * 2;
    if (nearEnd) appendClones();
  }

  function scrollPrev() {
    track.scrollBy({ left: -getStep(), behavior: "smooth" });
  }

  nextBtn.addEventListener("click", scrollNext);
  prevBtn.addEventListener("click", scrollPrev);
})();

(function () {
  if (window.innerWidth > 768) return;

  document.querySelectorAll(".scroll-hint").forEach((wrapper) => {
    const scroller = wrapper.querySelector(
      ".diferencial-grid, .instrutores-grid, .feedback-viewport, .feedback-track"
    );
    if (!scroller) return;

    function update() {
      const remaining = scroller.scrollWidth - scroller.clientWidth - scroller.scrollLeft;
      wrapper.classList.toggle("show-hint", remaining > 8);
    }

    scroller.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update, { passive: true });
    update();
  });
})();