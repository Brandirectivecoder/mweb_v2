/* =========================================================
   SECTIONS — practice · process · work · proof · voices · form
   ========================================================= */
(function () {
  "use strict";

  /* ---------- PRACTICE · discipline index ↔ preview ---------- */
  (function () {
    const discs = document.querySelectorAll(".practice .disc");
    const pvs = document.querySelectorAll(".practice .pv");
    if (!discs.length) return;
    function activate(key) {
      discs.forEach((d) => d.classList.toggle("on", d.dataset.pv === key));
      pvs.forEach((p) => p.classList.toggle("on", p.dataset.pv === key));
    }
    discs.forEach((d) => {
      d.addEventListener("mouseenter", () => activate(d.dataset.pv));
      d.addEventListener("click", () => activate(d.dataset.pv));
    });
  })();

  /* ---------- PROCESS · horizontal flight (GSAP pin + paper plane) ---------- */
  (function () {
    const sec = document.querySelector(".process");
    if (!sec) return;
    const pin = sec.querySelector(".process-pin");
    const track = sec.querySelector(".process-track");
    const cards = [...sec.querySelectorAll(".m-card")];
    const plane = sec.querySelector(".plane");
    const trail = sec.querySelector(".trail");
    const done = sec.querySelector(".trail-done");
    const flight = sec.querySelector(".flight");
    const curEl = sec.querySelector(".process-count .cur");
    if (!track || !cards.length) return;

    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const small = matchMedia("(max-width: 900px)").matches;
    const hasGSAP = !!(window.gsap && window.ScrollTrigger);

    let len = 0;
    const measure = () => { try { len = trail.getTotalLength(); } catch (e) { len = 0; } };
    function placePlane(p) {
      if (!len) measure();
      if (!len) return;
      const fw = flight.clientWidth, fh = flight.clientHeight;
      const at = (d) => trail.getPointAtLength(Math.max(0, Math.min(len, d)));
      const a = at(p * len), b = at(p * len + 0.6);
      const x = (a.x / 100) * fw, y = (a.y / 100) * fh;
      const x2 = (b.x / 100) * fw, y2 = (b.y / 100) * fh;
      const ang = Math.atan2(y2 - y, x2 - x) * 180 / Math.PI;
      plane.style.left = x + "px"; plane.style.top = y + "px";
      plane.style.transform = `translate(-50%,-50%) rotate(${ang}deg)`;
      if (done) done.style.strokeDashoffset = (100 - p * 100).toFixed(2);
    }
    function setActive(p) {
      const idx = Math.round(p * (cards.length - 1));
      cards.forEach((c, i) => c.classList.toggle("active", i === idx));
      if (curEl) curEl.textContent = String(idx + 1).padStart(2, "0");
    }

    if (!hasGSAP || reduce || small) {
      sec.classList.add("no-pin");
      cards.forEach((c) => c.classList.add("active"));
      return;
    }

    const overflow = () => Math.max(0, track.scrollWidth - window.innerWidth);
    gsap.to(track, {
      x: () => -overflow() + "px", ease: "none",
      scrollTrigger: {
        trigger: sec, start: "top top",
        end: () => "+=" + (overflow() + window.innerHeight * 0.4),
        pin: pin, scrub: 0.6, anticipatePin: 1, invalidateOnRefresh: true,
        onRefresh: measure,
        onUpdate: (self) => { placePlane(self.progress); setActive(self.progress); },
      },
    });
    measure(); placePlane(0); setActive(0);
    window.addEventListener("load", () => { measure(); window.ScrollTrigger && ScrollTrigger.refresh(); });
  })();

  /* ---------- WORK · Beli's commerce demo (tabs + live cart) ---------- */
  (function () {
    const render = document.querySelector(".r-beli");
    if (!render) return;

    // reveal dishes on view
    const dishes = render.querySelectorAll(".dish");
    const dio = new IntersectionObserver((es) => {
      es.forEach((e) => {
        if (!e.isIntersecting) return;
        dishes.forEach((d, i) => setTimeout(() => d.classList.add("show"), 90 * i));
        dio.disconnect();
      });
    }, { threshold: 0.3 });
    dio.observe(render);
    // safety: ensure dishes are visible even if IO never fires
    setTimeout(() => dishes.forEach((d) => d.classList.add("show")), 2200);

    // tab switching
    const tabs = render.querySelectorAll(".tab");
    const panes = render.querySelectorAll(".pane");
    tabs.forEach((t) => t.addEventListener("click", () => {
      tabs.forEach((x) => x.classList.toggle("on", x === t));
      panes.forEach((p) => p.classList.toggle("on", p.dataset.pane === t.dataset.pane));
    }));
    // auto-cycle tabs while in view (so the story tells itself)
    let order = ["shop", "admin", "kpi"], idx = 0, cycling = false, hovered = false;
    render.addEventListener("pointerenter", () => hovered = true);
    render.addEventListener("pointerleave", () => hovered = false);
    const cio = new IntersectionObserver((es) => { cycling = es[0].isIntersecting; }, { threshold: 0.4 });
    cio.observe(render);
    setInterval(() => {
      if (!cycling || hovered) return;
      idx = (idx + 1) % order.length;
      const key = order[idx];
      tabs.forEach((x) => x.classList.toggle("on", x.dataset.pane === key));
      panes.forEach((p) => p.classList.toggle("on", p.dataset.pane === key));
    }, 3400);

    // live cart counter — clicking + adds
    const countEl = render.querySelector(".beli-count");
    const itemsEl = render.querySelector(".beli-items");
    const totalEl = render.querySelector(".beli-total");
    let count = 3, total = 1760;
    const prices = [420, 360, 980, 1500, 640, 2200];
    render.querySelectorAll(".dish .add").forEach((add, i) => {
      add.addEventListener("click", (e) => {
        e.stopPropagation();
        count++; total += prices[i] || 400;
        if (countEl) countEl.textContent = count;
        if (itemsEl) itemsEl.textContent = count + " items";
        if (totalEl) totalEl.textContent = "₹ " + total.toLocaleString("en-IN");
        add.animate([{ transform: "scale(1)" }, { transform: "scale(1.4)" }, { transform: "scale(1)" }], { duration: 300, easing: "ease-out" });
      });
    });
  })();

  /* ---------- WORK · shirt configurator ---------- */
  (function () {
    const shirt = document.getElementById("shirt-obj");
    const swatches = document.querySelectorAll(".r-shirt .panel .swatches:first-of-type .sw");
    if (!shirt || !swatches.length) return;
    swatches.forEach((sw) => sw.addEventListener("click", () => {
      swatches.forEach((s) => s.classList.toggle("on", s === sw));
      shirt.style.setProperty("--shirt", sw.dataset.c);
    }));
    // collar swatches just toggle selection
    document.querySelectorAll(".r-shirt .panel .swatches").forEach((row) => {
      const sws = row.querySelectorAll(".sw");
      sws.forEach((sw) => sw.addEventListener("click", () => sws.forEach((s) => s.classList.toggle("on", s === sw))));
    });
    // auto-cycle fabric while in view
    let i = 0, on = false;
    const io = new IntersectionObserver((es) => on = es[0].isIntersecting, { threshold: 0.4 });
    io.observe(shirt);
    setInterval(() => { if (!on) return; i = (i + 1) % swatches.length; swatches[i].click(); }, 2600);
  })();

  /* ---------- WORK · browser tilt on pointer ---------- */
  document.querySelectorAll(".browser.tilt").forEach((b) => {
    const host = b.closest(".showcase");
    if (!host) return;
    host.addEventListener("pointermove", (e) => {
      const r = host.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      b.style.setProperty("--ry", (px * 7).toFixed(2) + "deg");
      b.style.setProperty("--rx", (-py * 5).toFixed(2) + "deg");
    });
    host.addEventListener("pointerleave", () => { b.style.setProperty("--ry", "0deg"); b.style.setProperty("--rx", "0deg"); });
  });

  /* ---------- PROOF · slot-machine digits ---------- */
  (function () {
    const slots = document.querySelectorAll(".proof .slot");
    if (!slots.length) return;
    function buildReel(digit) {
      const reel = document.createElement("div"); reel.className = "reel";
      for (let n = 0; n <= 9; n++) { const s = document.createElement("span"); s.textContent = String(n); reel.appendChild(s); }
      const f = document.createElement("span"); f.textContent = digit; reel.appendChild(f); return reel;
    }
    slots.forEach((slot) => {
      [...(slot.dataset.value || "0")].forEach((ch) => {
        if (/\d/.test(ch)) { const col = document.createElement("div"); col.className = "col"; col.appendChild(buildReel(ch)); slot.appendChild(col); }
        else { const s = document.createElement("span"); s.textContent = ch; s.style.display = "inline-block"; slot.appendChild(s); }
      });
    });
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.querySelectorAll(".reel").forEach((r, idx) => {
          r.style.transitionDelay = (idx * 0.12) + "s";
          r.style.transform = `translateY(-${(r.children.length - 1) * 0.85}em)`;
        });
        io.unobserve(e.target);
      });
    }, { threshold: 0.4 });
    slots.forEach((s) => io.observe(s));
  })();

  /* ---------- VOICES · 3D stack ---------- */
  (function () {
    const stack = document.querySelector(".voices .stack");
    if (!stack) return;
    const cards = [...stack.querySelectorAll(".vcard")];
    const dots = document.querySelectorAll(".voices .dots span");
    const n = cards.length; let top = 0;
    function render() {
      cards.forEach((c, i) => { const pos = (i - top + n) % n; c.dataset.pos = pos < 4 ? pos : 3; });
      dots.forEach((d, i) => d.classList.toggle("on", i === top));
    }
    render();
    function advance() {
      const card = cards[top % n];
      card.style.transition = "transform .6s cubic-bezier(.4,0,.2,1), opacity .6s";
      card.style.transform = "translate3d(120%, -20px, 0) rotate(8deg) scale(0.94)"; card.style.opacity = "0";
      setTimeout(() => { card.style.transition = ""; card.style.transform = ""; card.style.opacity = ""; top = (top + 1) % n; render(); }, 450);
    }
    document.querySelector(".voices .next-card")?.addEventListener("click", advance);
    let dragging = false, startX = 0, dx = 0;
    stack.addEventListener("pointerdown", (e) => {
      const t = cards[top % n]; if (!t) return;
      dragging = true; startX = e.clientX; dx = 0; t.classList.add("dragging");
      t.setPointerCapture(e.pointerId);
      t.addEventListener("pointermove", onMove); t.addEventListener("pointerup", onUp); t.addEventListener("pointercancel", onUp);
    });
    function onMove(e) { if (!dragging) return; dx = e.clientX - startX; cards[top % n].style.transform = `translate3d(${dx}px, ${Math.abs(dx)*0.05}px, 0) rotate(${dx*0.04}deg)`; }
    function onUp() {
      if (!dragging) return; dragging = false;
      const t = cards[top % n]; t.classList.remove("dragging");
      t.removeEventListener("pointermove", onMove); t.removeEventListener("pointerup", onUp);
      if (Math.abs(dx) > 90) advance();
      else { t.style.transition = "transform .4s cubic-bezier(.4,0,.2,1)"; t.style.transform = ""; setTimeout(() => t.style.transition = "", 400); }
    }
    setInterval(advance, 6000);
  })();

/* ---------- CONTACT FORM ---------- */
/* ---------- CONTACT FORM ---------- */
  (function () {
    const form = document.getElementById("contact-form");
    if (!form) return;
    
    form.addEventListener("submit", (e) => {
      // 1. Run your custom UI validation
      const required = form.querySelectorAll("[required]"); 
      let valid = true;
      
      required.forEach((el) => { 
        if (!el.value.trim()) { 
          el.style.borderBottomColor = "var(--accent)"; 
          valid = false; 
        } 
      });
      
      // 2. If fields are missing, STOP the form from sending
      if (!valid) { 
        e.preventDefault(); // This stops the HTML action
        [...required].find((el) => !el.value.trim())?.focus(); 
        return; 
      }

      // 3. If valid, just change the button text and let the HTML take over!
      const submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) submitBtn.textContent = "Sending...";
    });
  })();
  })();