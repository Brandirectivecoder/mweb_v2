/* =========================================================
   ENHANCE — wow beats per section
   ========================================================= */

// ---------- 1. HERO · live status ticker rotator ----------
(function () {
  const rotator = document.querySelector(".status-chip .rotator");
  if (!rotator) return;
  const items = ["BYD MHE India", "Beli's Catering", "The Shirt Makers", "Healthcare portal", "D2C launch"];
  let i = 0;
  function show() {
    rotator.innerHTML = "";
    const cur = document.createElement("span");
    cur.className = "item";
    cur.textContent = items[i];
    rotator.appendChild(cur);
    cur.animate(
      [{ transform: "translateY(100%)", opacity: 0 }, { transform: "translateY(0)", opacity: 1 }],
      { duration: 700, easing: "cubic-bezier(.7,0,.2,1)", fill: "forwards" }
    );
    setTimeout(() => {
      cur.animate(
        [{ transform: "translateY(0)", opacity: 1 }, { transform: "translateY(-100%)", opacity: 0 }],
        { duration: 500, easing: "cubic-bezier(.7,0,.2,1)", fill: "forwards" }
      );
    }, 2400);
    i = (i + 1) % items.length;
  }
  show();
  setInterval(show, 3100);
})();

// ---------- 4. APPROACH · scroll-linked progress rail ----------
(function () {
  const sec = document.querySelector(".approach");
  if (!sec) return;
  const rail = sec.querySelector(".rail");
  const steps = sec.querySelectorAll(".step");

  function update() {
    const r = sec.getBoundingClientRect();
    const vh = window.innerHeight;
    // Progress: how far the section has scrolled past viewport center
    const p = Math.min(1, Math.max(0, (vh * 0.6 - r.top) / (r.height - vh * 0.3)));
    rail?.style.setProperty("--rail", (p * 100).toFixed(1) + "%");

    // Step "in-view" state based on whether step's midpoint is above center
    steps.forEach((s) => {
      const sr = s.getBoundingClientRect();
      const mid = sr.top + sr.height / 2;
      s.classList.toggle("in-view", mid < vh * 0.65);
    });
  }
  window.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update);
  update();
})();

// ---------- 5. WORK · typewriter URL bar when card scrolls in ----------
(function () {
  const cards = document.querySelectorAll(".work .card");
  const urls = {
    "byd":    "byd-mhe.in",
    "beli":   "belistasteofhome.com",
    "shirt":  "theshirtmakers.in",
    "health": "healthcare-portal.app",
    "d2c":    "d2c-launch.store",
  };
  cards.forEach((card) => {
    const url = card.dataset.url || urls[card.dataset.key] || "site.com";
    const span = card.querySelector(".urlbar .url");
    if (!span) return;
    let typed = false;
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting && !typed) {
          typed = true;
          card.classList.add("in-view");
          typeUrl(span, url);
          obs.unobserve(card);
        }
      });
    }, { threshold: 0.4 });
    obs.observe(card);
    // Fallback for non-IO environments
    setTimeout(() => {
      const r = card.getBoundingClientRect();
      if (!typed && r.top < window.innerHeight * 0.85) {
        typed = true;
        card.classList.add("in-view");
        typeUrl(span, url);
      }
    }, 600);
  });
  function typeUrl(el, text) {
    el.innerHTML = '<span class="typed"></span>';
    const t = el.firstElementChild;
    let i = 0;
    const id = setInterval(() => {
      t.textContent += text[i++] || "";
      if (i >= text.length) clearInterval(id);
    }, 55);
  }
})();

// ---------- 6. NUMBERS · slot-machine digit roll ----------
(function () {
  const stats = document.querySelectorAll(".numbers .slot");
  if (!stats.length) return;

  function buildReel(digit) {
    const reel = document.createElement("div");
    reel.className = "reel";
    // 0..9 + final digit at end so target sits at -10em
    for (let n = 0; n <= 9; n++) {
      const s = document.createElement("span"); s.textContent = String(n); reel.appendChild(s);
    }
    const final = document.createElement("span"); final.textContent = digit; reel.appendChild(final);
    return reel;
  }

  stats.forEach((slot) => {
    const final = slot.dataset.value || "0";
    // Tokenise: digits roll, non-digits stay static
    [...final].forEach((ch) => {
      if (/\d/.test(ch)) {
        const col = document.createElement("div");
        col.className = "col";
        col.appendChild(buildReel(ch));
        slot.appendChild(col);
      } else {
        const s = document.createElement("span");
        s.textContent = ch; s.style.display = "inline-block";
        slot.appendChild(s);
      }
    });
  });

  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const slot = e.target;
      const reels = slot.querySelectorAll(".reel");
      reels.forEach((r, idx) => {
        // Each reel needs to land such that its LAST <span> (the target digit) is showing.
        // Reel height = (children count) em. Last child at index (count - 1).
        const count = r.children.length;
        const offset = (count - 1);
        // staggered start
        r.style.transitionDelay = (idx * 0.12) + "s";
        r.style.transform = `translateY(-${offset}em)`;
      });
      io.unobserve(slot);
    });
  }, { threshold: 0.4 });
  stats.forEach((s) => io.observe(s));
  // Fallback
  setTimeout(() => {
    stats.forEach((slot) => {
      if (slot.dataset.fired) return;
      const r = slot.getBoundingClientRect();
      if (r.top < window.innerHeight) {
        slot.dataset.fired = "1";
        slot.querySelectorAll(".reel").forEach((reel, idx) => {
          const count = reel.children.length;
          reel.style.transitionDelay = (idx * 0.12) + "s";
          reel.style.transform = `translateY(-${count - 1}em)`;
        });
      }
    });
  }, 1000);
})();

// ---------- 7. VOICES · 3D card stack with drag-to-advance ----------
(function () {
  const stack = document.querySelector(".voices .stack");
  if (!stack) return;
  const cards = [...stack.querySelectorAll(".vcard")];
  const dots = document.querySelectorAll(".voices .dots span");
  const n = cards.length;
  let top = 0;

  function render() {
    cards.forEach((c, i) => {
      const pos = (i - top + n) % n;
      c.dataset.pos = pos < 4 ? pos : 3;
    });
    dots.forEach((d, i) => d.classList.toggle("on", i === top));
  }
  render();

  function advance() {
    const card = cards[top % n];
    card.style.transition = "transform .6s cubic-bezier(.4,0,.2,1), opacity .6s";
    card.style.transform = "translate3d(120%, -20px, 0) rotate(8deg) scale(0.94)";
    card.style.opacity = "0";
    setTimeout(() => {
      card.style.transition = "";
      card.style.transform = "";
      card.style.opacity = "";
      top = (top + 1) % n;
      render();
    }, 450);
  }

  document.querySelector(".voices .next-card")?.addEventListener("click", advance);

  // Drag-to-advance
  let dragging = false, startX = 0, dx = 0;
  cards[0]?.addEventListener("pointerdown", onDown);
  stack.addEventListener("pointerdown", (e) => {
    const t = cards[top % n];
    if (!t || t.contains(e.target) === false && e.target !== t) return;
    onDown(e);
  });
  function onDown(e) {
    const t = cards[top % n];
    if (!t) return;
    dragging = true; startX = e.clientX; dx = 0;
    t.classList.add("dragging");
    t.setPointerCapture(e.pointerId);
    t.addEventListener("pointermove", onMove);
    t.addEventListener("pointerup", onUp);
    t.addEventListener("pointercancel", onUp);
  }
  function onMove(e) {
    if (!dragging) return;
    dx = e.clientX - startX;
    const t = cards[top % n];
    t.style.transform = `translate3d(${dx}px, ${Math.abs(dx)*0.05}px, 0) rotate(${dx*0.04}deg)`;
  }
  function onUp() {
    if (!dragging) return;
    dragging = false;
    const t = cards[top % n];
    t.classList.remove("dragging");
    t.removeEventListener("pointermove", onMove);
    t.removeEventListener("pointerup", onUp);
    if (Math.abs(dx) > 90) {
      advance();
    } else {
      t.style.transition = "transform .4s cubic-bezier(.4,0,.2,1)";
      t.style.transform = "";
      setTimeout(() => { t.style.transition = ""; }, 400);
    }
  }

  // Auto-advance
  setInterval(advance, 6000);
})();

// ---------- 8. SCROLL PROGRESS BAR ----------
(function () {
  const bar = document.querySelector(".scroll-progress .bar");
  if (!bar) return;
  function update() {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const p = max <= 0 ? 0 : (window.scrollY / max) * 100;
    bar.style.setProperty("--p", p.toFixed(2) + "%");
  }
  window.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update);
  update();
})();

// ---------- 9. CUSTOM CURSOR ----------
(function () {
  if (matchMedia("(hover: none)").matches) return;
  const c = document.querySelector(".cursor");
  if (!c) return;
  let x = window.innerWidth / 2, y = window.innerHeight / 2;
  let cx = x, cy = y;
  document.addEventListener("pointermove", (e) => {
    x = e.clientX; y = e.clientY;
    if (!c.classList.contains("ready")) c.classList.add("ready");
  });
  function loop() {
    cx += (x - cx) * 0.2;
    cy += (y - cy) * 0.2;
    c.style.setProperty("--cx", cx + "px");
    c.style.setProperty("--cy", cy + "px");
    requestAnimationFrame(loop);
  }
  loop();
  document.querySelectorAll("a, button, .magnetic, .work .card, .expertise .cell, .approach .step, .voices .vcard")
    .forEach((el) => {
      el.addEventListener("pointerenter", () => c.classList.add("hovered"));
      el.addEventListener("pointerleave", () => c.classList.remove("hovered"));
    });
})();
