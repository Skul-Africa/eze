/* ============================================================
   EZEKIEL ADEGOKE — Portfolio JavaScript
   Features:
   - Custom cursor with glow trail
   - Particles that follow / react to cursor
   - Typing animation
   - Scroll reveal
   - Active nav link tracking
   - Mobile menu
   - Smooth anchor scroll
   ============================================================ */

'use strict';

/* ── 1. CUSTOM CURSOR ── */
(function () {
  // Only on devices that have a fine pointer (i.e. real mouse)
  if (!window.matchMedia('(pointer: fine)').matches) return;

  const cursor     = document.createElement('div');
  const cursorDot  = document.createElement('div');
  cursor.className    = 'cursor-ring';
  cursorDot.className = 'cursor-dot';
  document.body.appendChild(cursor);
  document.body.appendChild(cursorDot);

  let mx = -200, my = -200; // start off-screen
  let rx = -200, ry = -200; // ring lags behind

  document.addEventListener('mousemove', e => {
    mx = e.clientX;
    my = e.clientY;
    cursorDot.style.transform = `translate(${mx}px, ${my}px)`;
  });

  // Smooth ring follow with lerp
  function lerp(a, b, t) { return a + (b - a) * t; }

  function animateCursor() {
    rx = lerp(rx, mx, 0.12);
    ry = lerp(ry, my, 0.12);
    cursor.style.transform = `translate(${rx}px, ${ry}px)`;
    requestAnimationFrame(animateCursor);
  }
  animateCursor();

  // Enlarge ring on interactive elements
  const interactive = 'a, button, .btn, .project-card, .skill-category, .contact-item, .creative-card';
  document.querySelectorAll(interactive).forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('cursor-expand'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('cursor-expand'));
  });

  document.addEventListener('mouseleave', () => {
    cursor.style.opacity = '0';
    cursorDot.style.opacity = '0';
  });
  document.addEventListener('mouseenter', () => {
    cursor.style.opacity = '1';
    cursorDot.style.opacity = '1';
  });
})();

/* ── 2. NAVBAR: scroll style + active link ── */
(function () {
  const navbar   = document.getElementById('navbar');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');

  function onScroll() {
    navbar.classList.toggle('scrolled', window.scrollY > 50);

    let current = '';
    sections.forEach(sec => {
      if (window.scrollY >= sec.offsetTop - 120) current = sec.getAttribute('id');
    });
    navLinks.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === '#' + current);
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

/* ── 3. MOBILE NAV TOGGLE ── */
(function () {
  const toggle = document.getElementById('navToggle');
  const links  = document.getElementById('navLinks');
  if (!toggle || !links) return;

  toggle.addEventListener('click', () => {
    const open = links.classList.toggle('open');
    toggle.setAttribute('aria-expanded', open);
  });

  links.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      links.classList.remove('open');
      toggle.setAttribute('aria-expanded', false);
    });
  });
})();

/* ── 4. TYPING ANIMATION ── */
(function () {
  const el = document.getElementById('typedText');
  if (!el) return;

  const phrases = [
    'Junior Cybersecurity Analyst',
    'SOC Analyst',
    'Defensive Security Engineer',
    'Log Analysis Specialist',
    'Security Operations Analyst',
  ];

  let phraseIdx = 0, charIdx = 0, deleting = false;
  const typeSpeed = 70, deleteSpeed = 38, pauseAfter = 1800, pauseBefore = 300;

  function type() {
    const phrase = phrases[phraseIdx];
    if (!deleting) {
      el.textContent = phrase.substring(0, ++charIdx);
      if (charIdx === phrase.length) { deleting = true; setTimeout(type, pauseAfter); return; }
    } else {
      el.textContent = phrase.substring(0, --charIdx);
      if (charIdx === 0) {
        deleting = false;
        phraseIdx = (phraseIdx + 1) % phrases.length;
        setTimeout(type, pauseBefore); return;
      }
    }
    setTimeout(type, deleting ? deleteSpeed : typeSpeed);
  }
  setTimeout(type, 500);
})();

/* ── 5. PARTICLE CANVAS — cursor-reactive ── */
(function () {
  const canvas = document.getElementById('particleCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const PARTICLE_COUNT = 70;
  const CONNECT_DIST   = 130;
  const CURSOR_DIST    = 160;   // radius within which particles flee / attract
  const CURSOR_FORCE   = 0.055; // how strongly particles react to cursor
  const ACCENT         = '77, 166, 255';

  let w, h;
  let mouse = { x: -999, y: -999 };

  function resize() {
    w = canvas.width  = canvas.offsetWidth;
    h = canvas.height = canvas.offsetHeight;
  }

  // Track cursor — use canvas-relative coords
  window.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });
  window.addEventListener('mouseleave', () => { mouse.x = -999; mouse.y = -999; });

  class Particle {
    constructor() { this.init(); }

    init() {
      this.x  = Math.random() * w;
      this.y  = Math.random() * h;
      this.ox = this.x;           // origin / base position
      this.oy = this.y;
      this.vx = (Math.random() - 0.5) * 0.35;
      this.vy = (Math.random() - 0.5) * 0.35;
      this.r  = Math.random() * 1.8 + 0.5;
      this.a  = Math.random() * 0.55 + 0.15;
    }

    update() {
      // Base drift
      this.ox += this.vx;
      this.oy += this.vy;
      if (this.ox < 0 || this.ox > w) this.vx *= -1;
      if (this.oy < 0 || this.oy > h) this.vy *= -1;

      // Cursor repulsion — particles gently push away from mouse
      const dx   = this.ox - mouse.x;
      const dy   = this.oy - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < CURSOR_DIST && dist > 0) {
        const force  = (1 - dist / CURSOR_DIST) * CURSOR_FORCE;
        // Push away from cursor
        this.x = this.ox + (dx / dist) * force * CURSOR_DIST * 0.6;
        this.y = this.oy + (dy / dist) * force * CURSOR_DIST * 0.6;
      } else {
        // Gently return to drift position
        this.x += (this.ox - this.x) * 0.08;
        this.y += (this.oy - this.y) * 0.08;
      }
    }

    draw() {
      // Brighten particles close to cursor
      const dx   = this.x - mouse.x;
      const dy   = this.y - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const bright = dist < CURSOR_DIST ? this.a + (1 - dist / CURSOR_DIST) * 0.4 : this.a;

      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${ACCENT}, ${Math.min(bright, 0.9)})`;
      ctx.fill();
    }
  }

  let particles = [];

  function init() {
    resize();
    particles = Array.from({ length: PARTICLE_COUNT }, () => new Particle());
  }

  function drawConnections() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx   = particles[i].x - particles[j].x;
        const dy   = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < CONNECT_DIST) {
          const alpha = (1 - dist / CONNECT_DIST) * 0.18;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(${ACCENT}, ${alpha})`;
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
      }
    }

    // Extra: draw lines from nearby particles to cursor
    if (mouse.x !== -999) {
      particles.forEach(p => {
        const dx   = p.x - mouse.x;
        const dy   = p.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < CURSOR_DIST * 0.75) {
          const alpha = (1 - dist / (CURSOR_DIST * 0.75)) * 0.35;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.strokeStyle = `rgba(${ACCENT}, ${alpha})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      });

      // Cursor glow spot on canvas
      const grad = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 80);
      grad.addColorStop(0, `rgba(${ACCENT}, 0.07)`);
      grad.addColorStop(1, `rgba(${ACCENT}, 0)`);
      ctx.beginPath();
      ctx.arc(mouse.x, mouse.y, 80, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();
    }
  }

  function animate() {
    ctx.clearRect(0, 0, w, h);
    particles.forEach(p => { p.update(); p.draw(); });
    drawConnections();
    requestAnimationFrame(animate);
  }

  window.addEventListener('resize', () => {
    resize();
    particles.forEach(p => p.init());
  }, { passive: true });

  init();
  animate();
})();

/* ── 6. SCROLL REVEAL ── */
(function () {
  const items = document.querySelectorAll(
    '.skill-category, .project-card, .cert-card, .creative-card, .contact-item, ' +
    '.about-grid, .github-showcase, .certs-empty, .project-placeholder'
  );
  items.forEach(el => el.classList.add('reveal'));

  const observer = new IntersectionObserver(
    entries => entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target); }
    }),
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
  );
  items.forEach(el => observer.observe(el));
})();

/* ── 7. STAGGERED SKILL CARD REVEAL ── */
(function () {
  document.querySelectorAll('.skill-category').forEach((cat, i) => {
    cat.style.transitionDelay = `${i * 70}ms`;
  });
})();

/* ── 8. SMOOTH ANCHOR SCROLL ── */
(function () {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const top = target.getBoundingClientRect().top + window.scrollY - 72;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });
})();
