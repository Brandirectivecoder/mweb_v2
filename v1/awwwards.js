/* =========================================================
   AWWWARDS LAYER — behaviours
   1. Lenis smooth scroll  (window.__lenis)
   2. GSAP ScrollTrigger parallax  (hero, work, marquee skew)
   3. Three.js morphing noise sphere + particle field in hero
   ========================================================= */

(function () {
  "use strict";
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ----------------------------------------------------------
     1. LENIS SMOOTH SCROLL
  ---------------------------------------------------------- */
  let lenis = null;
  if (window.Lenis && !reduce) {
    lenis = new Lenis({
      lerp: 0.1,
      wheelMultiplier: 1,
      smoothWheel: true,
      smoothTouch: false,
    });
    window.__lenis = lenis;
  }

  /* ----------------------------------------------------------
     2. GSAP + SCROLLTRIGGER
  ---------------------------------------------------------- */
  const hasGSAP = !!(window.gsap && window.ScrollTrigger);

  if (hasGSAP) {
    gsap.registerPlugin(ScrollTrigger);
    if (lenis) {
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add((time) => lenis.raf(time * 1000));
      gsap.ticker.lagSmoothing(0);
    }
  } else if (lenis) {
    // no gsap: drive lenis with our own loop
    const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
  }

  if (hasGSAP && !reduce) {
    // Hero layered parallax as it leaves the viewport
    const heroST = {
      trigger: ".hero",
      start: "top top",
      end: "bottom top",
      scrub: 0.4,
    };
    gsap.to(".hero-title", { yPercent: 14, ease: "none", scrollTrigger: heroST });
    gsap.to(".hero-meta", { yPercent: -26, opacity: 0.25, ease: "none", scrollTrigger: heroST });
    gsap.to(".hero-canvas", { yPercent: 18, ease: "none", scrollTrigger: heroST });
    gsap.to(".scroll-hint", { opacity: 0, ease: "none", scrollTrigger: { ...heroST, end: "40% top" } });

    // Big faint serif brand-marks drift inside their frames
    gsap.utils.toArray(".work .card .brand-mark").forEach((el) => {
      const card = el.closest(".card");
      gsap.fromTo(el, { yPercent: -14 }, {
        yPercent: 14, ease: "none",
        scrollTrigger: { trigger: card, start: "top bottom", end: "bottom top", scrub: true },
      });
    });

    // Section titles: a clean mask-wipe reveal
    gsap.utils.toArray(".section-title").forEach((title) => {
      gsap.fromTo(title,
        { clipPath: "inset(0 100% -10% 0)" },
        {
          clipPath: "inset(0 0% -10% 0)",
          duration: 1.1, ease: "power3.out",
          scrollTrigger: { trigger: title, start: "top 82%" },
        });
    });

    window.addEventListener("load", () => ScrollTrigger.refresh());
  }

  // Marquee velocity skew (premium "speed" cue)
  if (lenis) {
    const mq = document.querySelector(".marquee");
    if (mq) {
      lenis.on("scroll", ({ velocity }) => {
        const sk = Math.max(-4, Math.min(4, velocity * 0.22));
        mq.style.setProperty("--mq-skew", sk.toFixed(2) + "deg");
      });
    }
  }

  /* ----------------------------------------------------------
     3. THREE.JS — morphing noise sphere + particles
  ---------------------------------------------------------- */
  const vertexShader = `
    uniform float uTime;
    uniform float uHover;
    varying float vNoise;
    varying vec3 vNormalW;
    varying vec3 vViewDir;

    vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x,289.0);}
    vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
    float snoise(vec3 v){
      const vec2 C = vec2(1.0/6.0, 1.0/3.0);
      const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
      vec3 i  = floor(v + dot(v, C.yyy));
      vec3 x0 = v - i + dot(i, C.xxx);
      vec3 g = step(x0.yzx, x0.xyz);
      vec3 l = 1.0 - g;
      vec3 i1 = min(g.xyz, l.zxy);
      vec3 i2 = max(g.xyz, l.zxy);
      vec3 x1 = x0 - i1 + 1.0*C.xxx;
      vec3 x2 = x0 - i2 + 2.0*C.xxx;
      vec3 x3 = x0 - 1.0 + 3.0*C.xxx;
      i = mod(i, 289.0);
      vec4 p = permute(permute(permute(
                i.z + vec4(0.0, i1.z, i2.z, 1.0))
              + i.y + vec4(0.0, i1.y, i2.y, 1.0))
              + i.x + vec4(0.0, i1.x, i2.x, 1.0));
      float n_ = 1.0/7.0;
      vec3 ns = n_ * D.wyz - D.xzx;
      vec4 j = p - 49.0 * floor(p * ns.z *ns.z);
      vec4 x_ = floor(j * ns.z);
      vec4 y_ = floor(j - 7.0 * x_);
      vec4 x = x_ *ns.x + ns.yyyy;
      vec4 y = y_ *ns.x + ns.yyyy;
      vec4 h = 1.0 - abs(x) - abs(y);
      vec4 b0 = vec4(x.xy, y.xy);
      vec4 b1 = vec4(x.zw, y.zw);
      vec4 s0 = floor(b0)*2.0 + 1.0;
      vec4 s1 = floor(b1)*2.0 + 1.0;
      vec4 sh = -step(h, vec4(0.0));
      vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
      vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
      vec3 p0 = vec3(a0.xy, h.x);
      vec3 p1 = vec3(a0.zw, h.y);
      vec3 p2 = vec3(a1.xy, h.z);
      vec3 p3 = vec3(a1.zw, h.w);
      vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
      p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
      vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
      m = m * m;
      return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
    }

    void main(){
      float n  = snoise(position*0.9 + vec3(0.0, uTime*0.18, 0.0));
      float n2 = snoise(position*2.3 + vec3(uTime*0.12));
      float disp = n*0.32 + n2*0.10;
      disp *= (1.0 + uHover*0.5);
      vec3 newPos = position + normal * disp;
      vNoise = n;
      vNormalW = normalize(normalMatrix * normal);
      vec4 mvPos = modelViewMatrix * vec4(newPos, 1.0);
      vViewDir = normalize(-mvPos.xyz);
      gl_Position = projectionMatrix * mvPos;
    }
  `;

  const fragmentShader = `
    uniform vec3 uColorA;
    uniform vec3 uColorB;
    varying float vNoise;
    varying vec3 vNormalW;
    varying vec3 vViewDir;
    void main(){
      float t = smoothstep(-0.5, 0.5, vNoise);
      vec3 col = mix(uColorB, uColorA, t);
      float fres = pow(1.0 - max(dot(normalize(vNormalW), normalize(vViewDir)), 0.0), 2.2);
      col += fres * vec3(1.0, 0.92, 0.72) * 0.95;
      col *= 0.82 + 0.18 * t;
      gl_FragColor = vec4(col, 1.0);
    }
  `;

  function initWebGL() {
    if (!window.THREE) return;
    const canvas = document.querySelector(".hero-canvas");
    if (!canvas) return;
    const hero = canvas.parentElement;

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    } catch (e) { return; }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

    const dim = () => ({ w: hero.clientWidth || window.innerWidth, h: hero.clientHeight || window.innerHeight });
    let { w, h } = dim();
    renderer.setSize(w, h, false);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 100);
    camera.position.set(0, 0, 5);

    const group = new THREE.Group();
    scene.add(group);

    function placeGroup() {
      const wide = w >= h;
      group.position.set(wide ? 1.35 : 0.4, wide ? 0.55 : 1.0, 0);
    }
    placeGroup();

    const uniforms = {
      uTime:   { value: 0 },
      uHover:  { value: 0.3 },
      uColorA: { value: new THREE.Color("#f0b15a") }, // warm amber
      uColorB: { value: new THREE.Color("#c2562e") }, // clay
    };
    const mat = new THREE.ShaderMaterial({ uniforms, vertexShader, fragmentShader });
    const mesh = new THREE.Mesh(new THREE.IcosahedronGeometry(1.5, 48), mat);
    group.add(mesh);

    // faint wireframe shell
    const wire = new THREE.Mesh(
      new THREE.IcosahedronGeometry(1.66, 5),
      new THREE.MeshBasicMaterial({ color: 0xf0b15a, wireframe: true, transparent: true, opacity: 0.08 })
    );
    group.add(wire);

    // particle dust
    const N = 700;
    const pos = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      const r = 2.0 + Math.random() * 1.7;
      const th = Math.random() * Math.PI * 2;
      const ph = Math.acos(2 * Math.random() - 1);
      pos[i * 3]     = r * Math.sin(ph) * Math.cos(th);
      pos[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th);
      pos[i * 3 + 2] = r * Math.cos(ph);
    }
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    const points = new THREE.Points(pGeo, new THREE.PointsMaterial({
      color: 0xf0b15a, size: 0.028, transparent: true, opacity: 0.55,
      blending: THREE.AdditiveBlending, depthWrite: false,
    }));
    group.add(points);

    // pointer parallax
    const target = { x: 0, y: 0 };
    window.addEventListener("pointermove", (e) => {
      target.x = (e.clientX / window.innerWidth) * 2 - 1;
      target.y = (e.clientY / window.innerHeight) * 2 - 1;
    }, { passive: true });

    function resize() {
      const d = dim(); w = d.w; h = d.h;
      renderer.setSize(w, h, false);
      camera.aspect = w / h; camera.updateProjectionMatrix();
      placeGroup();
    }
    window.addEventListener("resize", resize);

    // pause when hero off-screen
    let visible = true;
    if (window.IntersectionObserver) {
      new IntersectionObserver((es) => { visible = es[0].isIntersecting; }, { threshold: 0 }).observe(hero);
    }

    const clock = new THREE.Clock();
    let rotX = 0, rotY = 0;

    function frame() {
      uniforms.uTime.value = clock.getElapsedTime();
      rotY += ((target.x * 0.45) - rotY) * 0.05;
      rotX += ((target.y * 0.30) - rotX) * 0.05;
      group.rotation.y = rotY + uniforms.uTime.value * 0.07;
      group.rotation.x = rotX;
      wire.rotation.y -= 0.0012; wire.rotation.x += 0.0007;
      points.rotation.y -= 0.0009;
      const aim = Math.hypot(target.x, target.y) > 0.05 ? 1.0 : 0.35;
      uniforms.uHover.value += (aim - uniforms.uHover.value) * 0.04;
      renderer.render(scene, camera);
    }

    requestAnimationFrame(() => canvas.classList.add("ready"));

    if (reduce) {
      uniforms.uTime.value = 1.5;
      renderer.render(scene, camera);
      return;
    }
    (function loop() {
      requestAnimationFrame(loop);
      if (visible) frame();
    })();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initWebGL);
  } else {
    initWebGL();
  }
})();
