/* =========================================================
   DELIVERABLE controller
   - Picks the active scene based on which section is most in view
   - Cross-fades + restarts per-scene CSS animations
   - Animates the URL bar text & status label per scene
   - Also runs the work slideshow + status clock
   ========================================================= */

(function () {
  const del = document.querySelector(".deliverable");
  if (!del) return;

  // ---------- map sections → scenes ----------
  const MAP = [
    { sel: "#top",       scene: "hero",    label: "01 — Hero · Booting",         url: "tripearlsoft.com" },
    { sel: ".marquee",   scene: "wire",    label: "02 — Wireframe · Sketching",  url: "design/wires" },
    { sel: "#about",     scene: "ui",      label: "03 — UI · Filling in",         url: "/director/maulik" },
    { sel: "#expertise", scene: "panels",  label: "04 — Expertise · 5 disciplines", url: "/practice" },
    { sel: "#approach",  scene: "net",     label: "05 — Approach · Network",      url: "devtools://network" },
    { sel: "#work",      scene: "work",    label: "06 — Work · Case studies",     url: "/portfolio" },
    { sel: ".numbers",   scene: "gauges",  label: "07 — Lighthouse · 100s",       url: "lighthouse://audit" },
    { sel: "#voices",    scene: "voices",  label: "08 — Voices · Comments",       url: "/testimonials" },
    { sel: "#contact",   scene: "cal",     label: "09 — Contact · Book a slot",   url: "/book" },
  ];

  const scenes = del.querySelectorAll(".scene");
  const labelEl = document.getElementById("del-label");
  const urlEl   = document.getElementById("del-url");

  let activeScene = "hero";

  function setScene(sceneName, label, url) {
    if (sceneName === activeScene) return;
    activeScene = sceneName;

    // Cross-fade scenes
    scenes.forEach((s) => {
      const on = s.dataset.scene === sceneName;
      s.classList.toggle("active", on);
    });

    // Update label
    if (labelEl) labelEl.textContent = label;

    // Animate URL text retype
    if (urlEl) {
      urlEl.classList.add("typing");
      typeText(urlEl, url);
    }
  }

  // typewriter for URL
  let typingTimer;
  function typeText(el, text) {
    clearInterval(typingTimer);
    el.textContent = "";
    let i = 0;
    typingTimer = setInterval(() => {
      el.textContent += text[i++] || "";
      if (i >= text.length) clearInterval(typingTimer);
    }, 40);
  }

  // ---------- which section is most in view? ----------
  function activeSection() {
    const vh = window.innerHeight;
    let best = MAP[0], bestScore = -Infinity;
    for (const m of MAP) {
      const el = document.querySelector(m.sel);
      if (!el) continue;
      const r = el.getBoundingClientRect();
      const visible = Math.max(0, Math.min(r.bottom, vh) - Math.max(r.top, 0));
      // Bias: prefer the section whose midpoint is closest to viewport's upper-middle
      const mid = (r.top + r.bottom) / 2;
      const dist = Math.abs(mid - vh * 0.4);
      const score = visible - dist * 0.2;
      if (score > bestScore) { bestScore = score; best = m; }
    }
    return best;
  }

  function tick() {
    const m = activeSection();
    setScene(m.scene, m.label, m.url);
  }

  let raf = null;
  window.addEventListener("scroll", () => {
    if (raf) return;
    raf = requestAnimationFrame(() => { tick(); raf = null; });
  }, { passive: true });
  window.addEventListener("resize", tick);
  window.addEventListener("load", tick);

  // initial URL type
  setTimeout(() => { if (urlEl) typeText(urlEl, "tripearlsoft.com"); }, 200);
  tick();

  // ---------- Minimize toggle ----------
  document.getElementById("del-minimize")?.addEventListener("click", () => {
    del.classList.toggle("minimized");
  });

  // ---------- Work slideshow inside scene-work ----------
  (function workSlideshow() {
    const slides = del.querySelectorAll(".scene-work .slide");
    if (!slides.length) return;
    let i = 0;
    setInterval(() => {
      if (!del.querySelector('.scene-work.active')) return;
      slides[i].classList.remove("on");
      i = (i + 1) % slides.length;
      slides[i].classList.add("on");
    }, 2400);
  })();

  // ---------- Status time ticker ----------
  (function statusTime() {
    const el = document.getElementById("del-time");
    if (!el) return;
    const start = Date.now();
    setInterval(() => {
      const s = Math.floor((Date.now() - start) / 1000);
      const mm = String(Math.floor(s / 60)).padStart(2, "0");
      const ss = String(s % 60).padStart(2, "0");
      el.textContent = mm + ":" + ss;
    }, 1000);
  })();

  // ---------- Restart scene animations on entry ----------
  // Toggling `active` already replays CSS animations via :not(.active) -> .active flip.
  // But for SVG draw-in we need the dasharray to reset.
  const wire = del.querySelector(".scene-wireframe");
  if (wire) {
    const obs = new MutationObserver(() => {
      if (wire.classList.contains("active")) {
        wire.querySelectorAll("[data-d]").forEach((node) => {
          node.style.animation = "none";
          node.getBoundingClientRect();
          node.style.animation = "";
        });
      }
    });
    obs.observe(wire, { attributes: true, attributeFilter: ["class"] });
  }
})();

/* =========================================================
   CONTACT FORM
   ========================================================= */
(function () {
  const form = document.getElementById("contact-form");
  if (!form) return;
  const ok = document.getElementById("cf-ok");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    // Simple required-field check
    const required = form.querySelectorAll("[required]");
    let valid = true;
    required.forEach((el) => {
      if (!el.value.trim()) {
        el.style.borderBottomColor = "var(--accent)";
        valid = false;
      }
    });
    if (!valid) {
      const first = [...required].find((el) => !el.value.trim());
      if (first) first.focus();
      return;
    }

    // Surface success state (no backend wired — visual confirmation only)
    ok?.classList.add("show");
    form.querySelectorAll("input, select, textarea, button").forEach((el) => el.setAttribute("disabled", "true"));
    setTimeout(() => {
      ok?.scrollIntoView ? null : null; // intentionally avoid scrollIntoView
    }, 100);
  });
})();
