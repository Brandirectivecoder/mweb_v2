/* =========================================================
   Maulik Gajjar — site behaviors
   ========================================================= */

// ---------- THEME ----------
(function () {
  const stored = localStorage.getItem("theme");
  const initial = stored || "dark";
  document.documentElement.setAttribute("data-theme", initial);

  const btn = document.querySelector(".theme-toggle");
  btn?.addEventListener("click", () => {
    const cur = document.documentElement.getAttribute("data-theme");
    const next = cur === "dark" ? "light" : "dark";
    if (document.startViewTransition) {
      document.startViewTransition(() => {
        document.documentElement.setAttribute("data-theme", next);
      });
    } else {
      document.documentElement.setAttribute("data-theme", next);
    }
    localStorage.setItem("theme", next);
  });
})();

// ---------- HERO TITLE REVEAL ----------
(function () {
  const words = document.querySelectorAll(".hero-title .word");
  words.forEach((w, i) => {
    w.style.transition = "transform 1.2s cubic-bezier(.7,0,.2,1)";
    w.style.transitionDelay = (0.2 + i * 0.08) + "s";
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        w.style.transform = "translateY(0)";
      });
    });
  });
})();

// ---------- INTERSECTION REVEAL ----------
const io = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (e.isIntersecting) {
      e.target.classList.add("in");
      io.unobserve(e.target);
    }
  });
}, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });

document.querySelectorAll(".reveal, .reveal-stagger").forEach((el) => io.observe(el));

// Fallback: a scroll-position check that adds .in for any element whose top has
// passed (viewport bottom - 40px). Belt-and-braces in case IO is unreliable
// (e.g. iframe offscreen / capture context).
function revealByScroll() {
  const vh = window.innerHeight;
  document.querySelectorAll(".reveal:not(.in), .reveal-stagger:not(.in)").forEach((el) => {
    const r = el.getBoundingClientRect();
    if (r.top < vh - 40 && r.bottom > 0) el.classList.add("in");
  });
}
window.addEventListener("scroll", revealByScroll, { passive: true });
window.addEventListener("resize", revealByScroll);
window.addEventListener("load", revealByScroll);
// One-shot after first paint
requestAnimationFrame(revealByScroll);

// ---------- COUNTERS ----------
const counters = document.querySelectorAll("[data-count]");
const cio = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (!e.isIntersecting) return;
    const el = e.target;
    const target = parseFloat(el.dataset.count);
    const dur = 1800;
    const start = performance.now();
    const isFloat = !Number.isInteger(target);
    function step(t) {
      const p = Math.min(1, (t - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      const val = target * eased;
      el.textContent = isFloat ? val.toFixed(1) : Math.round(val).toString();
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
    cio.unobserve(el);
  });
}, { threshold: 0.4 });
counters.forEach((c) => cio.observe(c));

// ---------- MAGNETIC ----------
document.querySelectorAll(".magnetic").forEach((el) => {
  const strength = parseFloat(el.dataset.strength || "0.35");
  el.addEventListener("mousemove", (ev) => {
    const r = el.getBoundingClientRect();
    const x = ev.clientX - r.left - r.width / 2;
    const y = ev.clientY - r.top - r.height / 2;
    el.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
  });
  el.addEventListener("mouseleave", () => {
    el.style.transform = "translate(0,0)";
  });
});

// ---------- VOICES CAROUSEL ----------
(function () {
  const qs = document.querySelectorAll(".voices .q");
  if (!qs.length) return;
  let i = 0;
  function show(n) {
    qs.forEach((q, idx) => q.classList.toggle("active", idx === n));
  }
  show(0);
  let timer = setInterval(() => { i = (i + 1) % qs.length; show(i); }, 5500);
  document.querySelector(".voices .next")?.addEventListener("click", () => {
    clearInterval(timer); i = (i + 1) % qs.length; show(i);
  });
  document.querySelector(".voices .prev")?.addEventListener("click", () => {
    clearInterval(timer); i = (i - 1 + qs.length) % qs.length; show(i);
  });
})();

// ---------- CLOCK (Ahmedabad IST) ----------
(function () {
  const el = document.querySelector(".clock");
  if (!el) return;
  function tick() {
    const now = new Date();
    const fmt = new Intl.DateTimeFormat("en-US", {
      hour: "2-digit", minute: "2-digit", second: "2-digit",
      hour12: false, timeZone: "Asia/Kolkata"
    });
    el.textContent = fmt.format(now) + " IST · Ahmedabad";
  }
  tick();
  setInterval(tick, 1000);
})();

// ---------- WORK CARD CURSOR PARALLAX ----------
document.querySelectorAll(".work .card").forEach((card) => {
  const swatch = card.querySelector(".swatch");
  card.addEventListener("mousemove", (e) => {
    const r = card.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width - 0.5) * 14;
    const y = ((e.clientY - r.top) / r.height - 0.5) * 14;
    if (swatch) swatch.style.transform = `scale(1.05) translate(${x}px, ${y}px)`;
  });
  card.addEventListener("mouseleave", () => {
    if (swatch) swatch.style.transform = "";
  });
});

// ---------- SMOOTH NAV ----------
document.querySelectorAll('a[href^="#"]').forEach((a) => {
  a.addEventListener("click", (e) => {
    const id = a.getAttribute("href").slice(1);
    const t = document.getElementById(id);
    if (t) {
      e.preventDefault();
      if (window.__lenis) {
        window.__lenis.scrollTo(t, { offset: -20, duration: 1.4 });
      } else {
        const y = t.getBoundingClientRect().top + window.scrollY - 20;
        window.scrollTo({ top: y, behavior: "smooth" });
      }
    }
  });
});
