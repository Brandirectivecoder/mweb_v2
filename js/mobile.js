/* =========================================================
   MOBILE.JS — Hamburger nav drawer + touch enhancements
   Load AFTER core.js
   ========================================================= */
(function () {
  "use strict";

  /* ── Only run on mobile viewports ── */
  const isMobile = () => window.innerWidth <= 900;

  /* ── Build the hamburger button + drawer once ── */
  function buildMobileNav() {
    const nav = document.querySelector(".nav");
    if (!nav || document.querySelector(".nav-mobile-menu")) return;

    /* --- Hamburger button --- */
    const btn = document.createElement("button");
    btn.className = "nav-mobile-menu";
    btn.setAttribute("aria-label", "Toggle navigation");
    btn.innerHTML = "<span></span><span></span><span></span>";
    nav.appendChild(btn);

    /* --- Drawer --- */
    const drawer = document.createElement("nav");
    drawer.className = "nav-drawer";
    drawer.setAttribute("aria-hidden", "true");

    const links = [
      { href: "#about",    ix: "01", label: "About"   },
      { href: "#practice", ix: "02", label: "Practice" },
      { href: "#process",  ix: "03", label: "Process"  },
      { href: "#work",     ix: "04", label: "Work"     },
      { href: "#contact",  ix: "05", label: "Contact"  },
    ];

    links.forEach((lk) => {
      const a = document.createElement("a");
      a.href = lk.href;
      a.innerHTML = `${lk.label}<span class="ix">${lk.ix}</span>`;
      drawer.appendChild(a);
    });

    document.body.appendChild(drawer);

    /* --- Toggle logic --- */
    let open = false;

    function openDrawer() {
      open = true;
      btn.classList.add("open");
      drawer.classList.add("open");
      drawer.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
    }

    function closeDrawer() {
      open = false;
      btn.classList.remove("open");
      drawer.classList.remove("open");
      drawer.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
    }

    btn.addEventListener("click", () => (open ? closeDrawer() : openDrawer()));

    /* Close on link tap */
    drawer.querySelectorAll("a").forEach((a) => {
      a.addEventListener("click", () => {
        closeDrawer();
        /* Smooth scroll via lenis if available */
        const id = a.getAttribute("href").slice(1);
        const target = document.getElementById(id);
        if (!target) return;
        setTimeout(() => {
          if (window.__lenis) window.__lenis.scrollTo(target, { offset: -10, duration: 1.2 });
          else target.scrollIntoView({ behavior: "smooth" });
        }, 260); /* wait for drawer to close */
      });
    });

    /* Close on outside tap */
    document.addEventListener("pointerdown", (e) => {
      if (open && !drawer.contains(e.target) && !btn.contains(e.target)) closeDrawer();
    });

    /* Close on Escape */
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && open) closeDrawer();
    });
  }

  /* ── Init ── */
/* ── Init ── */
  function init() {
    if (isMobile()) {
      buildMobileNav();
      
      const htmlEl = document.documentElement;

      /* Function to rip off Lenis classes */
      const stripLenis = () => {
        htmlEl.classList.remove('lenis', 'lenis-smooth', 'lenis-scrolling', 'lenis-stopped');
      };

      /* 1. Do an initial strip */
      stripLenis();

      /* 2. Set up a guard to watch the HTML tag. 
            If Lenis tries to add the classes back, instantly remove them. */
      const observer = new MutationObserver(stripLenis);
      observer.observe(htmlEl, { attributes: true, attributeFilter: ['class'] });

      /* 3. Still try to destroy the instance if it happens to be global */
      if (window.__lenis) window.__lenis.destroy();
    }
  }

  /* Re-check on resize (handles rotation) */
  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (isMobile()) buildMobileNav();
    }, 200);
  });

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();

})();
