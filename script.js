/* INFINORA – navigation + magical motion
   Sections: 1) mobile menu  2) pointer depth  3) scarf wave  4) billowing clouds
             5) stars / dust / sparkles  6) the messenger owl (flies over every page) */
(() => {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const small = window.matchMedia("(max-width: 700px)").matches;
  const lerp = (a, b, t) => a + (b - a) * t;
  const rand = (a, b) => a + Math.random() * (b - a);

  /* ---------- 1) mobile menu ---------- */
  const menuToggle = document.getElementById("menuToggle");
  const navLinks = document.getElementById("navLinks");
  if (menuToggle && navLinks) {
    menuToggle.addEventListener("click", () => {
      const isOpen = navLinks.classList.toggle("open");
      menuToggle.setAttribute("aria-expanded", String(isOpen));
      menuToggle.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
    });
    navLinks.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        navLinks.classList.remove("open");
        menuToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---------- 2) gentle pointer depth (desktop) ---------- */
  const scene = document.getElementById("scene");
  const motion = scene && scene.querySelector(".scene-motion");
  if (motion && !reduce && window.matchMedia("(pointer: fine)").matches) {
    window.addEventListener("pointermove", (e) => {
      motion.style.setProperty("--px", ((e.clientX / innerWidth - 0.5) * -14).toFixed(1) + "px");
      motion.style.setProperty("--py", ((e.clientY / innerHeight - 0.5) * -10).toFixed(1) + "px");
    });
  }

  /* ---------- sparkles shared with the owl trail ---------- */
  let addSpark = () => {};

  /* ---------- 5) stars, dust, shooting stars ---------- */
  const canvas = document.getElementById("sparks");
  if (canvas && !reduce) {
    const ctx = canvas.getContext("2d");
    let W = 0, H = 0, dpr = 1;
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = canvas.clientWidth; H = canvas.clientHeight;
      canvas.width = W * dpr; canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize(); window.addEventListener("resize", resize);

    const starCount = small ? 45 : 90, dustCount = small ? 22 : 46;
    const stars = Array.from({ length: starCount }, () => ({
      x: Math.random(), y: Math.random() * 0.6, r: rand(0.4, 1.5), ph: rand(0, 6.28), sp: rand(0.6, 2.2)
    }));
    const dust = Array.from({ length: dustCount }, () => ({
      x: Math.random(), y: Math.random(), r: rand(0.6, 2), vy: rand(0.008, 0.03), vx: rand(-0.01, 0.015), ph: rand(0, 6.28)
    }));
    const sparks = [];
    let shooter = null, nextShot = performance.now() + rand(4000, 9000);
    addSpark = (x, y) => { if (sparks.length < 80) sparks.push({ x, y, vx: rand(-14, 14), vy: rand(-10, 22), life: 1, r: rand(0.8, 2.2) }); };

    let last = performance.now();
    const draw = (now) => {
      const dt = Math.min((now - last) / 1000, 0.05); last = now;
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "#f6dcab";
      for (const s of stars) {
        const a = 0.25 + 0.75 * (0.5 + 0.5 * Math.sin(now / 1000 * s.sp + s.ph));
        ctx.globalAlpha = a * 0.85;
        ctx.beginPath(); ctx.arc(s.x * W, s.y * H, s.r, 0, 6.283); ctx.fill();
      }
      for (const d of dust) {
        d.y -= d.vy * dt; d.x += d.vx * dt + Math.sin(now / 2400 + d.ph) * 0.00025;
        if (d.y < -0.02) { d.y = 1.02; d.x = Math.random(); }
        if (d.x > 1.02) d.x = -0.02; if (d.x < -0.02) d.x = 1.02;
        const a = 0.3 + 0.5 * Math.sin(now / 900 + d.ph);
        const g = ctx.createRadialGradient(d.x * W, d.y * H, 0, d.x * W, d.y * H, d.r * 4);
        g.addColorStop(0, `rgba(240,209,154,${Math.max(a, 0.08)})`); g.addColorStop(1, "rgba(240,209,154,0)");
        ctx.globalAlpha = 1; ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(d.x * W, d.y * H, d.r * 4, 0, 6.283); ctx.fill();
      }
      for (let i = sparks.length - 1; i >= 0; i--) {
        const p = sparks[i]; p.life -= dt * 0.9; p.x += p.vx * dt; p.y += p.vy * dt;
        if (p.life <= 0) { sparks.splice(i, 1); continue; }
        ctx.globalAlpha = p.life * 0.9; ctx.fillStyle = "#ffe3a8";
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r * p.life + 0.3, 0, 6.283); ctx.fill();
      }
      if (!shooter && now > nextShot) {
        shooter = { x: rand(0.45, 0.95) * W, y: rand(0.04, 0.22) * H, life: 1 };
        nextShot = now + rand(9000, 17000);
      }
      if (shooter) {
        shooter.life -= dt * 1.1; shooter.x -= 520 * dt; shooter.y += 210 * dt;
        if (shooter.life <= 0) shooter = null;
        else {
          const g = ctx.createLinearGradient(shooter.x, shooter.y, shooter.x + 110, shooter.y - 45);
          g.addColorStop(0, `rgba(255,236,190,${shooter.life})`); g.addColorStop(1, "rgba(255,236,190,0)");
          ctx.globalAlpha = 1; ctx.strokeStyle = g; ctx.lineWidth = 1.6;
          ctx.beginPath(); ctx.moveTo(shooter.x, shooter.y); ctx.lineTo(shooter.x + 110, shooter.y - 45); ctx.stroke();
        }
      }
      ctx.globalAlpha = 1;
      requestAnimationFrame(draw);
    };
    requestAnimationFrame(draw);
  }

  /* ---------- 3) scarf wave ---------- */
  const scarf = document.getElementById("scarf");
  if (scarf && !reduce) {
    const N = 28, strips = [];
    for (let i = 0; i < N; i++) {
      const s = document.createElement("i");
      s.style.left = (i * 100 / N) + "%";
      s.style.width = `calc(${100 / N}% + 1px)`;
      s.style.backgroundSize = (N * 100) + "% 100%";
      s.style.backgroundPosition = (i / (N - 1) * 100) + "% 0";
      scarf.appendChild(s); strips.push(s);
    }
    const dy = new Array(N).fill(0);
    const tick = (ms) => {
      const t = ms / 1000, h = scarf.clientHeight, sw = scarf.clientWidth / N;
      for (let i = 0; i < N; i++) {
        const d = N - 1 - i;                    // distance from the neck (right end)
        const w = Math.pow(d / (N - 1), 1.15);  // 0 at the neck → 1 at the free end
        dy[i] = h * w * (0.34 * Math.sin(d * 0.36 - t * 3.0) + 0.14 * w * Math.sin(d * 0.72 - t * 4.6 + 1.3))
              + h * 0.12 * w * Math.sin(t * 1.1);                 // slow overall lift
      }
      for (let i = 0; i < N; i++) {
        const next = i < N - 1 ? dy[i + 1] : dy[i] + (dy[i] - dy[i - 1]);
        const ang = Math.atan2(next - dy[i], sw) * 57.2958;
        strips[i].style.transform = `translateY(${dy[i].toFixed(2)}px) skewY(${ang.toFixed(2)}deg)`;
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  /* ---------- 4) billowing clouds (moves the noise map under the clouds) ---------- */
  const offA = document.getElementById("offA"), offB = document.getElementById("offB");
  if (offA && offB && !reduce && !small) {
    let lastRun = 0;
    const flow = (ms) => {
      if (ms - lastRun > 45) {                // ~22 fps is plenty for slow clouds
        lastRun = ms; const t = ms / 1000;
        offA.setAttribute("dx", (t * 9 % 400).toFixed(1));
        offA.setAttribute("dy", (Math.sin(t * 0.3) * 18).toFixed(1));
        offB.setAttribute("dx", (-t * 7 % 400).toFixed(1));
        offB.setAttribute("dy", (Math.cos(t * 0.25) * 16).toFixed(1));
      }
      requestAnimationFrame(flow);
    };
    requestAnimationFrame(flow);
  } else if (small) {
    document.querySelectorAll(".warp").forEach((w) => (w.style.display = "none"));
  }

  /* ---------- 6) the messenger owl ---------- */
  const OW = 329, OH = 217;                    // owl artwork size
  const owl = document.createElement("div");
  owl.className = "owl";
  owl.setAttribute("aria-hidden", "true");
  owl.innerHTML = '<div class="owl-in"><img class="bd" src="images/owl-body.png" alt=""><img class="wl" src="images/owl-wing-l.png" alt=""><img class="wr" src="images/owl-wing-r.png" alt=""></div>';
  document.body.appendChild(owl);
  const wl = owl.querySelector(".wl"), wr = owl.querySelector(".wr"), inner = owl.querySelector(".owl-in");

  const KEY = "infinoraOwl";
  let base = Math.min(270, Math.max(110, innerWidth * 0.21));
  window.addEventListener("resize", () => { base = Math.min(270, Math.max(110, innerWidth * 0.21)); });

  const homeSpot = () => {                       // where the owl sits in the artwork (by the moon)
    if (!scene) return null;
    const r = scene.getBoundingClientRect();
    const w = 0.2712 * r.width;
    const x = r.left + 0.6694 * r.width, y = r.top + 0.1665 * r.height;
    if (x < 0 || x + w > innerWidth + 4 || y < 0) return null;   // moon not on screen (small phones)
    return { x, y, w };
  };

  let mode = "rest", restUntil = 0, seg = null, home = null, homeStart = 0, last = { x: 0, y: 0, dir: 1 };

  function newSegment(from) {
    const dir = from ? from.dir : (Math.random() < 0.5 ? 1 : -1);
    const margin = base * 1.3;
    const sx = from ? from.x : (dir > 0 ? -margin : innerWidth + margin);
    const sy = from ? from.y : rand(0.12, 0.6) * innerHeight;
    const ex = dir > 0 ? innerWidth + margin : -margin;
    const ey = rand(0.1, 0.62) * innerHeight;
    const dist = Math.abs(ex - sx);
    seg = {
      sx, sy, ex, ey, dir, start: performance.now(),
      dur: Math.max(7000, dist / rand(95, 130) * 1000),
      amp: rand(0.05, 0.11) * innerHeight, freq: rand(1.2, 2.2), ph: rand(0, 6.28),
      s0: from && from.w ? from.w / base : rand(0.6, 0.85), s1: rand(0.65, 1.05)
    };
    mode = "fly";
  }
  const pos = (p) => {
    const x = lerp(seg.sx, seg.ex, p);
    const fade = Math.min(1, p * 5);             // flap-path wave eases in so take-off is smooth
    const y = lerp(seg.sy, seg.ey, p) + seg.amp * fade * Math.sin(p * 6.283 * seg.freq + seg.ph);
    return { x, y };
  };

  function place(x, y, w, tilt, dirX, flap) {
    const h = w * OH / OW;
    owl.style.width = w + "px"; owl.style.height = h + "px";
    owl.style.transform = `translate3d(${(x - w / 2).toFixed(1)}px, ${(y - h / 2).toFixed(1)}px, 0)`;
    inner.style.transform = `scaleX(${dirX}) rotate(${tilt.toFixed(2)}deg) translateY(${(flap * -2.5).toFixed(2)}px)`;
    wl.style.transform = `rotate(${(flap * 10).toFixed(2)}deg)`;
    wr.style.transform = `rotate(${(-flap * 10).toFixed(2)}deg)`;
  }

  // start-up: continue from where the owl was on the previous page, or sit by the moon first
  let saved = null;
  try { saved = JSON.parse(sessionStorage.getItem(KEY) || "null"); } catch (e) {}
  if (saved && Date.now() - saved.ts < 9000) {
    owl.classList.add("on");
    newSegment({ x: saved.x * innerWidth, y: saved.y * innerHeight, dir: saved.dir, w: saved.w * base });
  } else {
    home = homeSpot();
    if (home) { mode = "home"; homeStart = performance.now(); owl.classList.add("on"); }
    else { mode = "rest"; restUntil = performance.now() + 1500; }
  }

  if (reduce) {                                   // calm mode: owl rests by the moon, no flying
    const h = homeSpot();
    if (h) { owl.classList.add("on"); place(h.x + h.w / 2, h.y + (h.w * OH / OW) / 2, h.w, 0, 1, 0); }
    return;
  }

  let sparkAt = 0, saveAt = 0;
  const loop = (now) => {
    const flap = Math.sin(now / 1000 * (mode === "home" ? 6 : 8.5));
    if (mode === "home") {
      const h = homeSpot() || home;
      const cx = h.x + h.w / 2, cy = h.y + (h.w * OH / OW) / 2;
      place(cx, cy + Math.sin(now / 700) * 4, h.w, 0, 1, flap * 0.6);
      if (now - homeStart > 2600) {               // take off from the moon and sweep across the page
        newSegment({ x: cx, y: cy, dir: -1, w: h.w });
        seg.ex = -base * 1.3; seg.ey = innerHeight * 0.34; seg.dur = Math.max(9000, (cx + base) / 105 * 1000);
        seg.amp = innerHeight * 0.07; seg.freq = 1.5; seg.ph = 0;
      }
    } else if (mode === "fly") {
      const p = Math.min(1, (now - seg.start) / seg.dur);
      const a = pos(p), b = pos(Math.min(1, p + 0.01));
      const w = base * lerp(seg.s0, seg.s1, Math.sin(p * Math.PI * 0.5));
      const tilt = Math.max(-14, Math.min(14, Math.atan2(b.y - a.y, Math.abs(b.x - a.x) + 0.001) * 57.3 * 0.9));
      place(a.x, a.y, w, tilt, seg.dir, flap);
      last = { x: a.x, y: a.y, dir: seg.dir, w };
      if (now - sparkAt > 70) { sparkAt = now; addSpark(a.x - seg.dir * w * 0.3, a.y + w * 0.18); }
      if (now - saveAt > 300) {
        saveAt = now;
        try { sessionStorage.setItem(KEY, JSON.stringify({ x: a.x / innerWidth, y: a.y / innerHeight, dir: seg.dir, w: w / base, ts: Date.now() })); } catch (e) {}
      }
      if (p >= 1) { mode = "rest"; owl.classList.remove("on"); restUntil = now + rand(2500, 7000); }
    } else if (mode === "rest" && now > restUntil) {
      newSegment(null); owl.classList.add("on");
    }
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
})();
