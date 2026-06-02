/* =========================================================
   CORE — theme · smooth scroll · reveals · cursor · nav · clock
   ========================================================= */
(function () {
  "use strict";
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- THEME ---------- */
  const stored = localStorage.getItem("theme");
  document.documentElement.setAttribute("data-theme", stored || "dark");
  document.querySelector(".theme-toggle")?.addEventListener("click", () => {
    const cur = document.documentElement.getAttribute("data-theme");
    const next = cur === "dark" ? "light" : "dark";
    const apply = () => document.documentElement.setAttribute("data-theme", next);
    if (document.startViewTransition) document.startViewTransition(apply); else apply();
    localStorage.setItem("theme", next);
  });

  /* ---------- HERO TITLE REVEAL ---------- */
  (function () {
    const words = document.querySelectorAll(".hero-title .word");
    if (!words.length) return;
    let revealed = false;
    function reveal() {
      if (revealed) return; revealed = true;
      words.forEach((w, i) => {
        w.style.transition = "transform 1.2s cubic-bezier(.7,0,.2,1)";
        w.style.transitionDelay = (0.25 + i * 0.08) + "s";
        w.style.transform = "translateY(0)";
      });
    }
    // primary: double-rAF for a clean paint-synced entrance
    requestAnimationFrame(() => requestAnimationFrame(reveal));
    // fallbacks: never leave the headline clipped if rAF is throttled
    setTimeout(reveal, 200);
    window.addEventListener("load", reveal);
  })();

  /* ---------- LENIS ---------- */
  let lenis = null;
  if (window.Lenis && !reduce) {
    lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1, smoothWheel: true, smoothTouch: false });
    window.__lenis = lenis;
  }
  const hasGSAP = !!(window.gsap && window.ScrollTrigger);
  if (hasGSAP) {
    gsap.registerPlugin(ScrollTrigger);
    if (lenis) {
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add((t) => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
    }
  } else if (lenis) {
    const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
  }

  /* ---------- GSAP scene work ---------- */
  if (hasGSAP && !reduce) {
    const heroST = { trigger: ".hero", start: "top top", end: "bottom top", scrub: 0.4 };
    gsap.to(".hero-title", { yPercent: 14, ease: "none", scrollTrigger: heroST });
    gsap.to(".hero-meta", { yPercent: -28, opacity: 0.2, ease: "none", scrollTrigger: heroST });
    gsap.to(".hero-canvas", { yPercent: 18, ease: "none", scrollTrigger: heroST });
    gsap.to(".scroll-hint", { opacity: 0, ease: "none", scrollTrigger: { ...heroST, end: "40% top" } });

    // section-title mask wipe
    gsap.utils.toArray(".section-title").forEach((t) => {
      gsap.fromTo(t, { clipPath: "inset(0 100% -12% 0)" }, {
        clipPath: "inset(0 0% -12% 0)", duration: 1.1, ease: "power3.out",
        scrollTrigger: { trigger: t, start: "top 84%" },
      });
    });
    // browser frames float in with a slight parallax + tilt settle
    gsap.utils.toArray(".browser.tilt").forEach((b) => {
      gsap.fromTo(b, { yPercent: 8, rotateY: 6 }, {
        yPercent: -8, rotateY: 0, ease: "none",
        scrollTrigger: { trigger: b, start: "top bottom", end: "bottom top", scrub: 0.6 },
      });
    });
    window.addEventListener("load", () => ScrollTrigger.refresh());
  }

  /* ---------- TICKER velocity skew ---------- */
  if (lenis) {
    const mq = document.querySelector(".ticker");
    if (mq) lenis.on("scroll", ({ velocity }) => {
      const sk = Math.max(-4, Math.min(4, velocity * 0.22));
      mq.style.setProperty("--mq-skew", sk.toFixed(2) + "deg");
    });
  }

  /* ---------- INTERSECTION REVEAL ---------- */
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
  }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
  document.querySelectorAll(".reveal, .reveal-stagger, .lines").forEach((el) => io.observe(el));
  function revealByScroll() {
    const vh = window.innerHeight;
    document.querySelectorAll(".reveal:not(.in), .reveal-stagger:not(.in), .lines:not(.in)").forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.top < vh - 40 && r.bottom > 0) el.classList.add("in");
    });
  }
  window.addEventListener("scroll", revealByScroll, { passive: true });
  window.addEventListener("load", revealByScroll);
  requestAnimationFrame(revealByScroll);

  /* ---------- MAGNETIC ---------- */
  document.querySelectorAll(".magnetic").forEach((el) => {
    const s = parseFloat(el.dataset.strength || "0.3");
    el.addEventListener("mousemove", (ev) => {
      const r = el.getBoundingClientRect();
      const x = ev.clientX - r.left - r.width / 2;
      const y = ev.clientY - r.top - r.height / 2;
      el.style.transform = `translate(${x * s}px, ${y * s}px)`;
    });
    el.addEventListener("mouseleave", () => { el.style.transform = "translate(0,0)"; });
  });

  /* ---------- NAV GLASS ON SCROLL ---------- */
  (function () {
    const nav = document.querySelector(".nav");
    if (!nav) return;
    function onScroll() { nav.classList.toggle("scrolled", window.scrollY > 40); }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  })();

  /* ---------- SCROLL PROGRESS ---------- */
  (function () {
    const bar = document.querySelector(".scroll-progress .bar");
    if (!bar) return;    function update() {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.setProperty("--p", (max <= 0 ? 0 : (window.scrollY / max) * 100).toFixed(2) + "%");
    }
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update); update();
  })();

  /* ---------- CUSTOM CURSOR ---------- */
  (function () {
    if (matchMedia("(hover: none)").matches) return;
    const c = document.querySelector(".cursor");
    if (!c) return;
    const lbl = c.querySelector(".lbl");
    let x = innerWidth / 2, y = innerHeight / 2, cx = x, cy = y;
    document.addEventListener("pointermove", (e) => { x = e.clientX; y = e.clientY; if (!c.classList.contains("ready")) c.classList.add("ready"); });
    (function loop() { cx += (x - cx) * 0.5; cy += (y - cy) * 0.5; c.style.setProperty("--cx", cx + "px"); c.style.setProperty("--cy", cy + "px"); requestAnimationFrame(loop); })();
    document.querySelectorAll("a, button, .magnetic, .practice .disc, .voices .vcard, .work .mini").forEach((el) => {
      el.addEventListener("pointerenter", () => c.classList.add("hovered"));
      el.addEventListener("pointerleave", () => { c.classList.remove("hovered"); c.classList.remove("labeled"); if (lbl) lbl.textContent = ""; });
    });
    document.querySelectorAll(".browser").forEach((el) => {
      el.addEventListener("pointerenter", () => { c.classList.add("labeled"); if (lbl) lbl.textContent = "Live"; });
      el.addEventListener("pointerleave", () => { c.classList.remove("labeled"); if (lbl) lbl.textContent = ""; });
    });
  })();

  /* ---------- SMOOTH NAV ---------- */
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href").slice(1);
      const t = document.getElementById(id);
      if (!t) return;
      e.preventDefault();
      if (window.__lenis) window.__lenis.scrollTo(t, { offset: -10, duration: 1.4 });
      else window.scrollTo({ top: t.getBoundingClientRect().top + scrollY - 10, behavior: "smooth" });
    });
  });
  document.querySelectorAll("[data-noop]").forEach((a) => a.addEventListener("click", (e) => e.preventDefault()));

  /* ---------- HERO STATUS ROTATOR ---------- */
  (function () {
    const rotator = document.querySelector(".status-chip .rotator");
    if (!rotator) return;
    const items = ["AI Powered Solutions", "Boosting Startups", "Building Founder Brands", "Shipping Digital Products", "Creating Growth Systems"];
    let i = 0;
    function show() {
      rotator.innerHTML = "";
      const cur = document.createElement("span");
      cur.className = "item"; cur.textContent = items[i]; rotator.appendChild(cur);
      cur.animate([{ transform: "translateY(100%)", opacity: 0 }, { transform: "translateY(0)", opacity: 1 }], { duration: 700, easing: "cubic-bezier(.7,0,.2,1)", fill: "forwards" });
      setTimeout(() => cur.animate([{ transform: "translateY(0)", opacity: 1 }, { transform: "translateY(-100%)", opacity: 0 }], { duration: 500, easing: "cubic-bezier(.7,0,.2,1)", fill: "forwards" }), 2400);
      i = (i + 1) % items.length;
    }
    show(); setInterval(show, 3100);
  })();

  /* ---------- CLOCK (IST) ---------- */
  (function () {
    const el = document.querySelector(".clock");
    if (!el) return;
    const fmt = new Intl.DateTimeFormat("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false, timeZone: "Asia/Kolkata" });
    const tick = () => { el.textContent = fmt.format(new Date()) + " IST · Ahmedabad"; };
    tick(); setInterval(tick, 1000);
  })();
})();
