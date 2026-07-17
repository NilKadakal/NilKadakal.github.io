(() => {
  'use strict';

  const header = document.querySelector('.site-header');
  const menuButton = document.querySelector('.menu-button');
  const navLinks = document.querySelector('.nav-links');
  const navAnchors = [...document.querySelectorAll('.nav-links a')];
  const revealItems = document.querySelectorAll('.reveal');
  const year = document.getElementById('year');
  const typedOutput = document.getElementById('typed-output');
  const canvas = document.getElementById('code-background');

  year.textContent = String(new Date().getFullYear());

  const closeMenu = () => {
    navLinks.classList.remove('open');
    menuButton.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('menu-open');
  };

  menuButton.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    menuButton.setAttribute('aria-expanded', String(isOpen));
    document.body.classList.toggle('menu-open', isOpen);
  });

  navAnchors.forEach((link) => link.addEventListener('click', closeMenu));
  window.addEventListener('resize', () => {
    if (window.innerWidth > 820) closeMenu();
  });
  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeMenu();
  });

  const updateHeader = () => header.classList.toggle('scrolled', window.scrollY > 12);
  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      });
    }, { threshold: 0.12 });

    revealItems.forEach((item) => revealObserver.observe(item));

    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navAnchors.forEach((link) => {
          link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`);
        });
      });
    }, { rootMargin: '-25% 0px -65% 0px' });

    document.querySelectorAll('main section[id]').forEach((section) => sectionObserver.observe(section));
  } else {
    revealItems.forEach((item) => item.classList.add('visible'));
  }

  const phrases = [
    'shipping thoughtful software',
    'building local-first AI systems',
    'turning data into decisions',
    'learning by making things work'
  ];

  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    let phraseIndex = 0;
    let charIndex = phrases[0].length;
    let deleting = true;

    const typeLoop = () => {
      const phrase = phrases[phraseIndex];

      if (deleting) {
        charIndex -= 1;
        typedOutput.textContent = phrase.slice(0, charIndex);
        if (charIndex <= 0) {
          deleting = false;
          phraseIndex = (phraseIndex + 1) % phrases.length;
          setTimeout(typeLoop, 350);
          return;
        }
      } else {
        charIndex += 1;
        typedOutput.textContent = phrases[phraseIndex].slice(0, charIndex);
        if (charIndex >= phrases[phraseIndex].length) {
          deleting = true;
          setTimeout(typeLoop, 1900);
          return;
        }
      }

      setTimeout(typeLoop, deleting ? 28 : 48);
    };

    setTimeout(typeLoop, 1800);
  }

  const motionReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!canvas) return;

  const context = canvas.getContext('2d', { alpha: true });
  const snippets = [
    'const build = (idea) => system;',
    'python main.py --local',
    'git commit -m "ship it"',
    'SELECT context FROM knowledge;',
    'model.fit(X_train, y_train)',
    'return usefulSoftware;',
    'def retrieve(query, top_k=5):',
    'npm run build',
    'response.status === 200',
    'while (curious) learn();',
    'vectorStore.search(query)',
    'interface Engineer {',
    'docker compose up',
    'pytest -q',
    'from data import insight',
    'if (problem) understand();'
  ];

  let width = 0;
  let height = 0;
  let dpr = 1;
  let particles = [];
  let animationFrame = 0;
  let lastFrame = 0;

  class CodeParticle {
    constructor(initial = false) {
      this.reset(initial);
    }

    reset(initial = false) {
      this.text = snippets[Math.floor(Math.random() * snippets.length)];
      this.size = Math.random() * 3 + 9;
      this.speed = Math.random() * 9 + 5;
      this.opacity = Math.random() * 0.13 + 0.075;
      this.x = Math.random() * width;
      this.y = initial ? Math.random() * height : height + Math.random() * 120;
      this.drift = (Math.random() - 0.5) * 4;
      this.width = 0;
    }

    update(delta) {
      const motionScale = motionReduced ? 0.18 : 1;
      this.y -= this.speed * delta * motionScale;
      this.x += this.drift * delta * motionScale;
      if (this.y < -35 || this.x < -420 || this.x > width + 80) this.reset(false);
    }

    draw() {
      context.font = `500 ${this.size}px IBM Plex Mono, monospace`;
      const tint = this.text.includes('git') || this.text.includes('npm') || this.text.includes('docker')
        ? `rgba(139, 188, 255, ${this.opacity * 0.92})`
        : `rgba(158, 240, 197, ${this.opacity})`;
      context.fillStyle = tint;
      context.fillText(this.text, this.x, this.y);
      this.width = context.measureText(this.text).width;
    }
  }

  const resizeCanvas = () => {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    context.setTransform(dpr, 0, 0, dpr, 0, 0);

    const count = Math.max(26, Math.min(56, Math.floor((width * height) / 32000)));
    particles = Array.from({ length: count }, () => new CodeParticle(true));
  };

  const drawConnections = () => {
    for (let i = 0; i < particles.length; i += 1) {
      for (let j = i + 1; j < particles.length; j += 1) {
        const a = particles[i];
        const b = particles[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const distance = Math.hypot(dx, dy);

        if (distance < 135) {
          context.strokeStyle = `rgba(139, 188, 255, ${(1 - distance / 135) * 0.025})`;
          context.lineWidth = 0.6;
          context.beginPath();
          context.moveTo(a.x, a.y - 4);
          context.lineTo(b.x, b.y - 4);
          context.stroke();
        }
      }
    }
  };

  const animate = (timestamp) => {
    const delta = Math.min((timestamp - lastFrame) / 1000 || 0, 0.05);
    lastFrame = timestamp;
    context.clearRect(0, 0, width, height);

    particles.forEach((particle) => {
      particle.update(delta);
      particle.draw();
    });
    drawConnections();

    animationFrame = window.requestAnimationFrame(animate);
  };

  resizeCanvas();
  animationFrame = window.requestAnimationFrame(animate);

  let resizeTimer;
  window.addEventListener('resize', () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(resizeCanvas, 140);
  }, { passive: true });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      window.cancelAnimationFrame(animationFrame);
    } else {
      lastFrame = performance.now();
      animationFrame = window.requestAnimationFrame(animate);
    }
  });
})();
