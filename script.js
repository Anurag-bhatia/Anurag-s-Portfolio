// ------------------------------------------------------------------
// Anurag Bhatia · portfolio micro-interactions
// Keep it light: reveal on scroll, cursor dot, metric count-up, clock
// ------------------------------------------------------------------

// Local time in the hero ---------------------------------------------
const timeEl = document.getElementById("localTime");
function tickTime() {
  if (!timeEl) return;
  const now = new Date();
  const h = String(now.getHours()).padStart(2, "0");
  const m = String(now.getMinutes()).padStart(2, "0");
  timeEl.textContent = `IST ${h}:${m}`;
}
tickTime();
setInterval(tickTime, 30_000);

// Year in footer ------------------------------------------------------
const y = document.getElementById("year");
if (y) y.textContent = new Date().getFullYear();
document.querySelectorAll(".js-year").forEach((el) => {
  el.textContent = new Date().getFullYear();
});

// Testimonials marquee: clone children so the loop is seamless -------
const quotesTrack = document.querySelector(".quotes__track");
if (quotesTrack) {
  [...quotesTrack.children].forEach((item) => {
    const clone = item.cloneNode(true);
    clone.setAttribute("aria-hidden", "true");
    quotesTrack.appendChild(clone);
  });
}

// Companies marquee: same clone trick for the logo strip -----------
const companiesRow = document.querySelector(".companies__row");
if (companiesRow) {
  [...companiesRow.children].forEach((item) => {
    const clone = item.cloneNode(true);
    clone.setAttribute("aria-hidden", "true");
    clone.querySelector("img").alt = "";
    companiesRow.appendChild(clone);
  });
}

// Case-study TOC: highlight the current section ---------------------
const tocLinks = document.querySelectorAll(".cs-toc a");
if (tocLinks.length) {
  const idToLink = new Map();
  tocLinks.forEach((a) => {
    const id = a.getAttribute("href").slice(1);
    idToLink.set(id, a);
  });

  const tocIO = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const id = entry.target.id;
        tocLinks.forEach((a) => a.classList.remove("is-active"));
        const link = idToLink.get(id);
        if (link) link.classList.add("is-active");
      });
    },
    { rootMargin: "-20% 0px -70% 0px", threshold: 0 }
  );
  idToLink.forEach((_, id) => {
    const sec = document.getElementById(id);
    if (sec) tocIO.observe(sec);
  });
}

// Case-study: Final / Iterations tab toggle -------------------------
document.querySelectorAll(".cs-tabs").forEach((group) => {
  group.addEventListener("click", (e) => {
    const target = e.target.closest(".cs-tab");
    if (!target) return;
    group.querySelectorAll(".cs-tab").forEach((t) => t.classList.remove("is-active"));
    target.classList.add("is-active");
  });
});

// Reveal on scroll with intersection observer ------------------------
const revealEls = document.querySelectorAll(".reveal");
const io = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const delay = Number(el.dataset.delay || 0);
      el.style.transitionDelay = `${delay}ms`;
      el.classList.add("is-visible");
      io.unobserve(el);
    });
  },
  { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
);
revealEls.forEach((el) => io.observe(el));

// Metric count-up ----------------------------------------------------
const counters = document.querySelectorAll("[data-count]");
const countIO = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = Number(el.dataset.count);
      const duration = 1200;
      const start = performance.now();
      const startVal = 0;

      function frame(now) {
        const p = Math.min(1, (now - start) / duration);
        // easeOutCubic
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(startVal + (target - startVal) * eased);
        if (p < 1) requestAnimationFrame(frame);
      }
      requestAnimationFrame(frame);
      countIO.unobserve(el);
    });
  },
  { threshold: 0.4 }
);
counters.forEach((el) => countIO.observe(el));

// Nav: compact on scroll-down, full on scroll-up + dark/light theming
const siteNav = document.getElementById("siteNav");
if (siteNav) {
  let lastY = window.scrollY;
  let ticking = false;
  const THRESHOLD = 6;  // ignore tiny jitter
  const TOP_GUARD = 80; // always full near the top
  const darkSections = document.querySelectorAll(".work, .shipping, .testimonials, .cs-hero");

  function updateNavTheme() {
    const navRect = siteNav.getBoundingClientRect();
    const probe = navRect.top + navRect.height / 2;
    let onDark = false;
    darkSections.forEach((sec) => {
      const r = sec.getBoundingClientRect();
      if (r.top <= probe && r.bottom >= probe) onDark = true;
    });
    siteNav.classList.toggle("nav--on-dark", onDark);
  }

  function updateNav() {
    const y = window.scrollY;
    const delta = y - lastY;

    if (y < TOP_GUARD) {
      siteNav.classList.remove("nav--compact");
    } else if (delta > THRESHOLD) {
      siteNav.classList.add("nav--compact");
    } else if (delta < -THRESHOLD) {
      siteNav.classList.remove("nav--compact");
    }
    updateNavTheme();
    lastY = y;
    ticking = false;
  }

  window.addEventListener(
    "scroll",
    () => {
      if (!ticking) {
        requestAnimationFrame(updateNav);
        ticking = true;
      }
    },
    { passive: true }
  );
  updateNavTheme();
}

// Custom cursor dot --------------------------------------------------
const dot = document.querySelector(".cursor-dot");
const isCoarse = window.matchMedia("(pointer: coarse)").matches;

if (dot && !isCoarse) {
  let targetX = window.innerWidth / 2;
  let targetY = window.innerHeight / 2;
  let x = targetX;
  let y = targetY;

  window.addEventListener("mousemove", (e) => {
    targetX = e.clientX;
    targetY = e.clientY;
  });

  function loop() {
    // tiny easing — feels less snappy than mouse, more considered
    x += (targetX - x) * 0.22;
    y += (targetY - y) * 0.22;
    dot.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
    requestAnimationFrame(loop);
  }
  loop();

  const hoverables = document.querySelectorAll(
    'a, button, .project, .btn, .nav__cta, [role="button"]'
  );
  hoverables.forEach((h) => {
    h.addEventListener("mouseenter", () => dot.classList.add("is-hover"));
    h.addEventListener("mouseleave", () => dot.classList.remove("is-hover"));
  });

  document.addEventListener("mouseleave", () => (dot.style.opacity = "0"));
  document.addEventListener("mouseenter", () => (dot.style.opacity = ""));
}

// Feature card: phone mockup tabs ------------------------------------
document.querySelectorAll(".phone__tabs").forEach((tabs) => {
  const phone = tabs.parentElement.querySelector("[data-phone]");
  tabs.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-tab]");
    if (!btn || !phone) return;
    tabs.querySelectorAll("[data-tab]").forEach((b) => b.classList.toggle("is-active", b === btn));
    phone.querySelectorAll("[data-screen]").forEach((s) => {
      s.hidden = s.dataset.screen !== btn.dataset.tab;
    });
  });
});

// Shipping lately: filter cards by kind ------------------------------
document.querySelectorAll(".shipping__filters").forEach((group) => {
  const section = group.closest(".shipping");
  const cards = section.querySelectorAll(".ship");
  const empty = section.querySelector(".shipping__empty");
  group.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-filter]");
    if (!btn) return;
    group.querySelectorAll("[data-filter]").forEach((b) => {
      b.classList.toggle("is-active", b === btn);
      b.setAttribute("aria-pressed", String(b === btn));
    });
    const f = btn.dataset.filter;
    let shown = 0;
    cards.forEach((c) => {
      c.hidden = f !== "all" && c.dataset.kind !== f;
      if (!c.hidden) shown++;
    });
    if (empty) empty.hidden = shown > 0;
  });
});

// Hero: rotate the highlighted word ---------------------------------
document.querySelectorAll(".rotator").forEach((box) => {
  const word = box.querySelector(".rotator__word");
  const words = box.dataset.words.split("|");
  if (!word || words.length < 2) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  // padding from computed style, not a width difference, so a late font
  // swap or a stale fixed width can never leave extra space in the pill
  const pad = () => {
    const cs = getComputedStyle(box);
    return parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight);
  };
  let i = 0;
  setInterval(() => {
    i = (i + 1) % words.length;
    word.classList.add("is-out");
    setTimeout(() => {
      // fix current width so the change animates, then swap the text
      box.style.width = `${box.offsetWidth}px`;
      word.textContent = words[i];
      word.classList.remove("is-out");
      word.classList.add("is-below");
      box.style.width = `${word.offsetWidth + pad()}px`;
      void word.offsetWidth; // commit the below position before sliding in
      word.classList.remove("is-below");
    }, 450);
  }, 2400);
});

// Work cards: expose each card's height so tall ones pin bottom-aligned
const projects = document.querySelectorAll(".work .project");
function measureProjects() {
  projects.forEach((p) => p.style.setProperty("--h", `${p.offsetHeight}px`));
}
measureProjects();
window.addEventListener("resize", measureProjects);
window.addEventListener("load", measureProjects);
