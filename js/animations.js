/* ═══════════════════════════════════════════════════════════
   ANIMATIONS.JS — Efectos visuales por capítulo (Canvas + DOM)
   ═══════════════════════════════════════════════════════════ */

window.Animations = {};

/* ════════════════════════════════════════
   CAPÍTULO 1 — Confeti
   ════════════════════════════════════════ */
Animations.startConfetti = function() {
  const canvas = document.getElementById('confetti-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const COLORS = [
    '#ff6b8a', '#ff9de2', '#ffd166', '#06d6a0',
    '#118ab2', '#ef476f', '#ffffff', '#c77dff',
  ];
  const pieces = [];

  for (let i = 0; i < 120; i++) {
    pieces.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height - canvas.height,
      w: Math.random() * 10 + 5,
      h: Math.random() * 6 + 3,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      angle: Math.random() * Math.PI * 2,
      spin: (Math.random() - 0.5) * 0.15,
      vx: (Math.random() - 0.5) * 1.5,
      vy: Math.random() * 2 + 1,
      opacity: Math.random() * 0.6 + 0.4,
    });
  }

  let raf;
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    pieces.forEach(p => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.angle);
      ctx.globalAlpha = p.opacity;
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();

      p.x     += p.vx;
      p.y     += p.vy;
      p.angle += p.spin;

      if (p.y > canvas.height + 20) {
        p.y = -20;
        p.x = Math.random() * canvas.width;
      }
    });
    raf = requestAnimationFrame(draw);
  }
  draw();

  return () => {
    cancelAnimationFrame(raf);
    window.removeEventListener('resize', resize);
  };
};



/* ════════════════════════════════════════
   CAPÍTULO 2 — Hortensias Abstractas CSS
   ════════════════════════════════════════ */
Animations.startFlowers = function() {
  const container = document.getElementById('flowers-container');
  if (!container) return;
  container.innerHTML = '';

  const colors = ['color-pink', 'color-peach', 'color-white'];

  // 1. Rosas abstractas gigantes
  const count = 15; 
  for (let i = 0; i < count; i++) {
    const rose = document.createElement('div');
    rose.className = `css-rose ${colors[Math.floor(Math.random() * colors.length)]}`;
    
    // Crear las 4 capas de la rosa
    for(let j = 0; j < 4; j++) {
       const layer = document.createElement('div');
       layer.className = 'rose-petal-layer';
       rose.appendChild(layer);
    }

    const isLeft = Math.random() > 0.5;
    rose.style.left = isLeft ? `${-15 + Math.random() * 25}%` : `${75 + Math.random() * 30}%`;
    rose.style.top  = `${-10 + Math.random() * 90}%`;
    
    // Rosas colosales para llenar los bordes
    const size = 180 + Math.random() * 250; 
    rose.style.width = `${size}px`;
    rose.style.height = `${size}px`;

    // Efecto de profundidad
    if (size > 300) {
      rose.style.filter = 'blur(4px) opacity(0.8)';
      rose.style.zIndex = '3';
    } else {
      rose.style.filter = 'blur(1px) opacity(0.6)';
      rose.style.zIndex = '0';
    }

    const delay = Math.random() * 2;
    rose.style.animationDelay = `${delay}s`;

    setTimeout(() => {
      rose.style.animation = `flowerSway ${6 + Math.random() * 4}s ease-in-out infinite alternate`;
    }, (delay + 1.5) * 1000);

    container.appendChild(rose);
  }

  // 2. Lluvia súper densa de pétalos gigantes
  for (let i = 0; i < 35; i++) {
    const petal = document.createElement('div');
    const pColor = colors[Math.floor(Math.random() * colors.length)];
    petal.className = `css-petal ${pColor}`;
    
    petal.style.left = `${-20 + Math.random() * 120}%`;
    
    // Tamaños gigantescos y variados
    const pSize = 50 + Math.random() * 90;
    petal.style.width = `${pSize}px`;
    petal.style.height = `${pSize}px`;
    
    petal.style.animationDuration = `${8 + Math.random() * 12}s`;
    petal.style.animationDelay = `${Math.random() * 8}s`;
    
    // Desenfocar algunos pétalos para dar efecto de cámara
    if (Math.random() > 0.6) {
      petal.style.filter = 'blur(5px)';
      petal.style.zIndex = '3';
    } else {
      petal.style.zIndex = '1';
    }
    
    container.appendChild(petal);
  }
};

/* ════════════════════════════════════════
   CAPÍTULO 3 — Efervescencia Extrema y Cristal
   ════════════════════════════════════════ */
Animations.startColaElements = function() {
  const lc = document.getElementById('liquidCanvas');
  const bc = document.getElementById('bubbleCanvas');
  if (!lc || !bc) return;

  const lctx = lc.getContext('2d');
  const bctx = bc.getContext('2d');

  function resize() {
    lc.width  = bc.width  = window.innerWidth;
    lc.height = bc.height = window.innerHeight;
    initSurface();
  }

  const N = 90;
  let verts = [], vels = [], accs = [];
  let fillHeight = 0;

  const TENSION = 0.022;
  const DAMPING = 0.935;
  const SPREAD  = 0.16;

  function initSurface() {
    const y = lc.height || window.innerHeight;
    for (let i = 0; i < N; i++) {
      verts[i] = y;
      vels[i]  = 0;
      accs[i]  = 0;
    }
  }

  resize();
  window.addEventListener('resize', resize);

  function splash(x, strength) {
    const idx = Math.round((x / lc.width) * (N - 1));
    if (idx >= 0 && idx < N) vels[idx] -= strength;
  }

  function updateSurface() {
    const surfY = lc.height - fillHeight;
    for (let i = 0; i < N; i++) {
      accs[i] = TENSION * (surfY - verts[i]);
    }
    const lD = new Array(N).fill(0);
    const rD = new Array(N).fill(0);
    for (let p = 0; p < 8; p++) {
      for (let i = 0; i < N; i++) {
        if (i > 0) { lD[i] = SPREAD * (verts[i] - verts[i-1]); vels[i-1] += lD[i]; }
        if (i < N-1) { rD[i] = SPREAD * (verts[i] - verts[i+1]); vels[i+1] += rD[i]; }
      }
      for (let i = 0; i < N; i++) {
        if (i > 0)   verts[i-1] += lD[i];
        if (i < N-1) verts[i+1] += rD[i];
      }
    }
    for (let i = 0; i < N; i++) {
      vels[i] = (vels[i] + accs[i]) * DAMPING;
      verts[i] += vels[i];
    }
  }

  function drawLiquid() {
    const W = lc.width, H = lc.height;
    // Limpiamos el canvas sin dibujar nada negro de fondo
    lctx.clearRect(0, 0, W, H);

    if (fillHeight <= 0) return;

    const step = W / (N - 1);
    lctx.beginPath();
    lctx.moveTo(0, verts[0]);
    for (let i = 1; i < N; i++) {
      const cx = (i - 0.5) * step;
      const cy = (verts[i-1] + verts[i]) / 2;
      lctx.quadraticCurveTo((i-1)*step, verts[i-1], cx, cy);
    }
    lctx.lineTo(W, verts[N-1]);
    lctx.lineTo(W, H);
    lctx.lineTo(0, H);
    lctx.closePath();

    const grad = lctx.createLinearGradient(0, H - fillHeight, 0, H);
    grad.addColorStop(0,    'rgba(90, 25, 8, 0.97)');
    grad.addColorStop(0.07, 'rgba(45, 12, 4, 0.99)');
    grad.addColorStop(0.35, 'rgba(18, 5, 2, 1)');
    grad.addColorStop(1,    'rgba(6, 1, 1, 1)');
    lctx.fillStyle = grad;
    lctx.fill();

    lctx.beginPath();
    lctx.moveTo(0, verts[0]);
    for (let i = 1; i < N; i++) {
      const cx = (i - 0.5) * step;
      const cy = (verts[i-1] + verts[i]) / 2;
      lctx.quadraticCurveTo((i-1)*step, verts[i-1], cx, cy);
    }
    lctx.lineTo(W, verts[N-1]);
    lctx.lineTo(W, verts[N-1] + 22);
    lctx.lineTo(0, verts[0] + 22);
    lctx.closePath();
    const foamGrad = lctx.createLinearGradient(0, 0, 0, 22);
    foamGrad.addColorStop(0, 'rgba(160, 65, 18, 0.38)');
    foamGrad.addColorStop(1, 'rgba(60, 15, 5, 0)');
    lctx.fillStyle = foamGrad;
    lctx.fill();
  }

  // ── BURBUJAS MEJORADAS (MÁS Y MÁS GRANDES) ──
  const BUBBLE_COUNT = 250; // Casi el doble de burbujas
  const bubs = [];

  function resetBubble(b) {
    b.x       = 8 + Math.random() * (bc.width - 16);
    b.y       = bc.height + 5;
    // Burbujas mucho más grandes
    b.r       = 1.5 + Math.random() * 6; 
    // Suben mucho más rápido (simulando gas real)
    b.vy      = -(1.5 + Math.random() * 3.5); 
    b.vx      = (Math.random() - 0.5) * 0.4;
    b.phase   = Math.random() * Math.PI * 2;
    // Más opacas y brillantes
    b.opacity = 0.4 + Math.random() * 0.6; 
    b.age     = 0;
    b.maxAge  = 40 + Math.random() * 100;
  }

  for (let i = 0; i < BUBBLE_COUNT; i++) {
    const b = {};
    resetBubble(b);
    b.y   = bc.height - Math.random() * Math.max(fillHeight, 1);
    b.age = Math.random() * b.maxAge;
    bubs.push(b);
  }

  function drawBubbles() {
    const W = bc.width, H = bc.height;
    bctx.clearRect(0, 0, W, H);
    if (fillHeight < 8) return;

    const surfY = H - fillHeight;

    bubs.forEach(b => {
      b.x   += b.vx + Math.sin(b.phase + b.age * 0.1) * 0.2;
      b.y   += b.vy;
      b.age++;

      if (b.y < surfY + 3 || b.age > b.maxAge) {
        if (Math.random() < 0.15) splash(b.x, 0.5 + Math.random() * 1.5);
        resetBubble(b);
        b.y = H - Math.random() * fillHeight * 0.92;
        return;
      }
      if (b.y > H) { resetBubble(b); return; }

      const fade = Math.min(1, b.age / 10);
      bctx.save();
      bctx.globalAlpha = b.opacity * fade;
      bctx.beginPath();
      bctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      bctx.strokeStyle = 'rgba(255,255,255,0.7)'; // Bordes más blancos
      bctx.lineWidth = 1.2; // Bordes más gruesos
      bctx.stroke();
      
      // Brillo intenso en la burbuja
      bctx.beginPath();
      bctx.arc(b.x - b.r * 0.3, b.y - b.r * 0.3, b.r * 0.3, 0, Math.PI * 2);
      bctx.fillStyle = 'rgba(255,255,255,0.9)';
      bctx.fill();
      bctx.restore();
    });
  }

  // ── LLENADO ──
  let raf;
  let t = 0;
  let filled = false;
  const fillDur = 250; 
  let fillFrame = 0;

  const fizz = setInterval(() => {
    if (fillHeight > 15) {
      splash(20 + Math.random() * (lc.width - 40), 0.5 + Math.random() * 1.5);
    }
  }, 400); // Salpicaduras más frecuentes

  function loop() {
    t++;
    fillFrame++;

    const currentMaxFill = window.innerHeight * 0.88;

    if (fillFrame <= fillDur) {
      const p = fillFrame / fillDur;
      const e = p < 0.5 ? 2*p*p : 1 - Math.pow(-2*p+2, 2)/2;
      fillHeight = e * currentMaxFill;
      
      if (fillFrame % 10 === 0 && p < 0.92) {
        splash(Math.random() * lc.width, 2 + Math.random() * 4);
      }
    } else {
      fillHeight = currentMaxFill;
    }

    if (!filled && fillFrame > fillDur * 0.6) {
      filled = true;
      const labelEl = document.getElementById('cola-label-el');
      if (labelEl) {
        setTimeout(() => labelEl.classList.add('label-visible'), 200);
      }
    }

    updateSurface();
    drawLiquid();
    drawBubbles();

    raf = requestAnimationFrame(loop);
  }

  loop();

  return () => {
    cancelAnimationFrame(raf);
    clearInterval(fizz);
    window.removeEventListener('resize', resize);
  };
};

/* ════════════════════════════════════════
   CAPÍTULO 4 — Océano (Canvas)
   ════════════════════════════════════════ */
Animations.startOcean = function() {
  const canvas = document.getElementById('ocean-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const bubbles = [];
  for (let i = 0; i < 22; i++) {
    bubbles.push({
      x: Math.random() * window.innerWidth,
      y: window.innerHeight + Math.random() * 200,
      r: Math.random() * 8 + 3,
      vy: -(Math.random() * 0.8 + 0.3),
      vx: (Math.random() - 0.5) * 0.3,
      opacity: Math.random() * 0.4 + 0.1,
      wander: Math.random() * Math.PI * 2,
      wanderSpeed: (Math.random() - 0.5) * 0.02,
    });
  }

  const fishes = [];
  const FISH = ['🐟', '🐠', '🐡', '🦑'];
  for (let i = 0; i < 5; i++) {
    fishes.push({
      emoji: FISH[Math.floor(Math.random() * FISH.length)],
      x: Math.random() < 0.5 ? -80 : window.innerWidth + 80,
      y: 60 + Math.random() * (window.innerHeight * 0.65),
      dir: Math.random() < 0.5 ? 1 : -1,
      speed: 0.4 + Math.random() * 0.5,
      size: 1.2 + Math.random() * 0.8,
      opacity: 0.55 + Math.random() * 0.3,
    });
  }

  let t = 0;
  let raf;

  function drawLightRays() {
    const W = canvas.width;
    const H = canvas.height;
    const cx = W * 0.5;

    for (let i = 0; i < 4; i++) {
      const angle   = (-0.3 + i * 0.2) + Math.sin(t * 0.008 + i) * 0.05;
      const width   = 30 + i * 18;
      const opacity = 0.06 + Math.sin(t * 0.01 + i * 0.8) * 0.03;

      ctx.save();
      ctx.globalAlpha = opacity;
      const grad = ctx.createLinearGradient(cx, 0, cx, H * 0.8);
      grad.addColorStop(0, 'rgba(120,200,255,0.7)');
      grad.addColorStop(1, 'rgba(0,60,120,0)');

      ctx.beginPath();
      ctx.moveTo(cx, 0);
      ctx.lineTo(
        cx + Math.tan(angle) * H * 0.8 - width / 2,
        H * 0.8
      );
      ctx.lineTo(
        cx + Math.tan(angle) * H * 0.8 + width / 2,
        H * 0.8
      );
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.restore();
    }
  }

  function drawBubbles() {
    bubbles.forEach(b => {
      b.wander += b.wanderSpeed;
      b.x += b.vx + Math.sin(b.wander) * 0.3;
      b.y += b.vy;

      if (b.y < -20) {
        b.y = canvas.height + 20;
        b.x = Math.random() * canvas.width;
        b.opacity = Math.random() * 0.4 + 0.1;
      }

      ctx.save();
      ctx.globalAlpha = b.opacity;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(160,220,255,0.8)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Highlight
      ctx.beginPath();
      ctx.arc(b.x - b.r * 0.3, b.y - b.r * 0.3, b.r * 0.3, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.fill();
      ctx.restore();
    });
  }

  function drawFish() {
    fishes.forEach(f => {
      f.x += f.speed * f.dir;
      const W = canvas.width;
      if (f.dir > 0 && f.x > W + 100) {
        f.x = -80;
        f.y = 60 + Math.random() * (canvas.height * 0.65);
      } else if (f.dir < 0 && f.x < -100) {
        f.x = W + 80;
        f.y = 60 + Math.random() * (canvas.height * 0.65);
      }

      ctx.save();
      ctx.globalAlpha = f.opacity;
      ctx.font = `${f.size * 28}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      if (f.dir < 0) {
        ctx.scale(-1, 1);
        ctx.fillText(f.emoji, -f.x, f.y);
      } else {
        ctx.fillText(f.emoji, f.x, f.y);
      }
      ctx.restore();
    });
  }

  function draw() {
    t++;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Gradiente base
    const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    grad.addColorStop(0, '#0d2a5e');
    grad.addColorStop(0.4, '#071a3e');
    grad.addColorStop(1, '#020710');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawLightRays();
    drawBubbles();
    drawFish();

    // Sutil ondulación en la parte superior
    const waveY = 50 + Math.sin(t * 0.02) * 8;
    const wGrad = ctx.createLinearGradient(0, 0, 0, waveY + 40);
    wGrad.addColorStop(0, 'rgba(13,42,94,0.9)');
    wGrad.addColorStop(1, 'rgba(13,42,94,0)');
    ctx.fillStyle = wGrad;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(canvas.width, 0);
    ctx.lineTo(canvas.width, waveY + 20);

    const wStep = canvas.width / 8;
    for (let x = canvas.width; x >= 0; x -= wStep) {
      const phase = (x / canvas.width) * Math.PI * 2;
      const y = waveY + Math.sin(t * 0.025 + phase) * 6;
      ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();

    raf = requestAnimationFrame(draw);
  }
  draw();

  return () => {
    cancelAnimationFrame(raf);
    window.removeEventListener('resize', resize);
  };
};

/* ════════════════════════════════════════
   CAPÍTULO 5 — Cielo estrellado (Canvas)
   ════════════════════════════════════════ */
Animations.startStars = function() {
  const canvas = document.getElementById('stars-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    buildStars();
  }

  let stars = [];
  let specialStarIndex = -1; // se activa después

  function buildStars() {
    stars = [];
    const count = Math.floor((canvas.width * canvas.height) / 5000);
    for (let i = 0; i < count; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height * 0.75,
        r: Math.random() * 1.8 + 0.4,
        phase: Math.random() * Math.PI * 2,
        speed: 0.02 + Math.random() * 0.03,
        baseOpacity: 0.3 + Math.random() * 0.5,
      });
    }
  }

  resize();
  window.addEventListener('resize', resize);

  let t = 0;
  let raf;
  let shootingStarTimer = null;

  function drawStars() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    stars.forEach((s, i) => {
      const opacity = s.baseOpacity * (0.5 + 0.5 * Math.sin(s.phase + t * s.speed));
      ctx.save();
      ctx.globalAlpha = opacity;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.restore();
    });
  }

  function draw() {
    t++;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawStars();
    raf = requestAnimationFrame(draw);
  }
  draw();

  // API pública para activar la estrella especial
  const api = {
    activateSpecialStar(onClickCallback) {
      // Elige una posición visible en el cielo
      const el = document.createElement('div');
      el.className = 'special-star';
      el.textContent = '⭐';
      el.style.position = 'fixed';
      el.style.left = `${20 + Math.random() * 60}%`;
      el.style.top  = `${10 + Math.random() * 35}%`;
      el.style.zIndex = 10;
      el.style.cursor = 'pointer';
      document.body.appendChild(el);

      el.addEventListener('click', () => {
        el.remove();
        onClickCallback();
      });

      return el;
    },
    destroy() {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      if (shootingStarTimer) clearTimeout(shootingStarTimer);
    }
  };

  return api;
};
