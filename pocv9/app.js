(() => {
  const root = document.documentElement;
  const productTabs = Array.from(document.querySelectorAll('[data-product-tab]'));
  const productCards = Array.from(document.querySelectorAll('[data-product-card]'));
  const productSelectButtons = Array.from(document.querySelectorAll('[data-select-product]'));
  const previewStates = Array.from(document.querySelectorAll('[data-preview-state]'));
  const primaryCta = document.querySelector('[data-primary-product-cta]');
  const primaryCtaLabel = document.querySelector('[data-primary-product-label]');
  const windowTitle = document.querySelector('[data-product-window-title]');
  const railState = document.querySelector('[data-rail-state]');
  const outputLabel = document.querySelector('[data-output-label]');
  const architectureLabel = document.querySelector('[data-product-architecture-label]');
  const architecture = document.querySelector('[data-product-architecture]');
  const productMediaIconShell = document.querySelector('[data-product-media-icon-shell]');
  const productStatus = document.querySelector('[data-product-status]');
  const captionTitle = document.querySelector('[data-product-caption-title]');
  const captionCopy = document.querySelector('[data-product-caption-copy]');
  const commentName = document.querySelector('[data-comment-name]');
  const commentText = document.querySelector('[data-comment-text]');
  const commentAvatar = document.querySelector('[data-comment-avatar]');

  const products = Object.freeze({
    browser: {
      previewState: 'studio',
      windowTitle: 'STREAMSUITES STUDIO',
      railState: 'Private room ready',
      outputLabel: 'LIVE NOW',
      architectureLabel: 'BROWSER MEDIA',
      architecture: 'Cloudflare RealtimeKit',
      mediaIcon: '../assets/icons/ui/cast.svg',
      status: 'Closed access',
      captionTitle: 'Browser Studio',
      captionCopy: 'Private rooms, guests, layouts, branding, destinations, and direct browser media shown in an illustrative live-state production mock.',
      ctaLabel: 'Open Browser Studio',
      ctaHref: 'https://studio.streamsuites.app',
      commentName: 'BUBBLE BOB',
      commentText: 'Is it true you guys invented Jimothy?',
      commentAvatar: '../assets/placeholders/livecommenter1.webp',
    },
    native: {
      previewState: 'studio',
      windowTitle: 'STREAMSUITES STUDIOAPP',
      railState: 'Engine supervised',
      outputLabel: 'LIVE NOW',
      architectureLabel: 'NATIVE MEDIA',
      architecture: 'Supervised C++ engine',
      mediaIcon: '../assets/icons/ui/cast.svg',
      status: 'Windows Alpha',
      captionTitle: 'StudioApp',
      captionCopy: 'The same production-room concept in a native Windows workspace, with supervised native media and an illustrative live-state output view.',
      ctaLabel: 'View StudioApp',
      ctaHref: 'https://streamsuites.app/downloads/studioapp/',
      commentName: 'THIRD RAILIFY',
      commentText: "Hey bro that's a pretty nice chair you have...",
      commentAvatar: '../assets/placeholders/livecommenter2.webp',
    },
    obs: {
      previewState: 'obs',
      windowTitle: 'STREAMSUITES STUDIO FOR OBS',
      railState: 'Receiver bridge',
      outputLabel: 'Owned by OBS',
      architectureLabel: 'OBS MEDIA',
      architecture: 'OBS-owned pipeline',
      mediaIcon: '../assets/icons/obs.svg',
      status: 'In development',
      captionTitle: 'Studio for OBS',
      captionCopy: 'Runtime/Auth-authorized ingress feeds an OBS-owned media workflow. OBS retains scenes, mixing, encoding, recording, and output.',
      ctaLabel: 'View OBS Integration',
      ctaHref: 'https://streamsuites.app/downloads/obs-plugin/',
    },
    public: {
      previewState: 'public',
      windowTitle: 'STREAMSUITES PUBLIC',
      railState: 'Authority-backed artifacts',
      outputLabel: 'PUBLIC',
      architectureLabel: 'PUBLIC SURFACES',
      architecture: 'Runtime/Auth-backed',
      mediaIcon: '../assets/icons/ui/clipcards.svg',
      status: 'Public surfaces',
      captionTitle: 'Public Shell',
      captionCopy: 'Clips, polls, wheels, leaderboards, tallies, games, community pages, and other public artifacts presented through the Runtime/Auth-backed public shell.',
      ctaLabel: 'Explore Public Clips',
      ctaHref: 'https://streamsuites.app/clips',
    },
  });

  const setProduct = (productId, { focusTab = false, scrollToHero = false } = {}) => {
    const product = products[productId];
    if (!product) return;

    root.dataset.product = productId;
    productTabs.forEach((tab) => {
      const active = tab.dataset.productTab === productId;
      tab.classList.toggle('is-active', active);
      tab.setAttribute('aria-selected', active ? 'true' : 'false');
      tab.tabIndex = active ? 0 : -1;
      if (active && focusTab) tab.focus();
    });

    previewStates.forEach((state) => {
      const active = state.dataset.previewState === product.previewState;
      state.classList.toggle('is-active', active);
      state.setAttribute('aria-hidden', active ? 'false' : 'true');
    });

    productCards.forEach((card) => {
      card.classList.toggle('is-selected', card.dataset.productCard === productId);
    });

    if (windowTitle) windowTitle.textContent = product.windowTitle;
    if (railState) railState.textContent = product.railState;
    if (outputLabel) outputLabel.textContent = product.outputLabel;
    if (architectureLabel) architectureLabel.textContent = product.architectureLabel;
    if (architecture) architecture.textContent = product.architecture;
    if (productMediaIconShell) {
      const mediaIconImage = productMediaIconShell.querySelector('img');
      if (mediaIconImage) mediaIconImage.src = product.mediaIcon;
      else productMediaIconShell.style.setProperty('--icon-url', "url('" + product.mediaIcon + "')");
    }
    if (productStatus) productStatus.textContent = product.status;
    if (captionTitle) captionTitle.textContent = product.captionTitle;
    if (captionCopy) captionCopy.textContent = product.captionCopy;
    if (primaryCtaLabel) primaryCtaLabel.textContent = product.ctaLabel;
    if (primaryCta) primaryCta.href = product.ctaHref;
    if (commentName && product.commentName) commentName.textContent = product.commentName;
    if (commentText && product.commentText) commentText.textContent = product.commentText;
    if (commentAvatar && product.commentAvatar) commentAvatar.src = product.commentAvatar;

    if (scrollToHero) {
      document.querySelector('#top')?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
    }
  };

  productTabs.forEach((tab, index) => {
    tab.addEventListener('click', () => setProduct(tab.dataset.productTab));
    tab.addEventListener('keydown', (event) => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      let nextIndex = index;
      if (event.key === 'ArrowLeft') nextIndex = (index - 1 + productTabs.length) % productTabs.length;
      if (event.key === 'ArrowRight') nextIndex = (index + 1) % productTabs.length;
      if (event.key === 'Home') nextIndex = 0;
      if (event.key === 'End') nextIndex = productTabs.length - 1;
      setProduct(productTabs[nextIndex].dataset.productTab, { focusTab: true });
    });
  });

  productSelectButtons.forEach((button) => {
    button.addEventListener('click', () => {
      setProduct(button.dataset.selectProduct, { scrollToHero: true });
    });
  });

  const surfaceImage = document.querySelector('[data-ecosystem-image]');
  const surfaceTabs = Array.from(document.querySelectorAll('[data-surface-tab]'));
  surfaceTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      if (!surfaceImage || tab.classList.contains('is-active')) return;
      surfaceTabs.forEach((candidate) => {
        const active = candidate === tab;
        candidate.classList.toggle('is-active', active);
        candidate.setAttribute('aria-selected', active ? 'true' : 'false');
      });
      surfaceImage.classList.add('is-changing');
      window.setTimeout(() => {
        surfaceImage.src = tab.dataset.image || surfaceImage.src;
        surfaceImage.alt = tab.dataset.surfaceTab === 'public'
          ? 'StreamSuites public media dashboard interface'
          : 'StreamSuites creator dashboard interface';
        surfaceImage.classList.remove('is-changing');
      }, 170);
    });
  });

  const alphaStrip = document.querySelector('[data-alpha-strip]');
  document.querySelector('[data-alpha-close]')?.addEventListener('click', () => {
    alphaStrip?.classList.add('is-dismissed');
  });

  const siteHeader = document.querySelector('[data-site-header]');
  const updateHeader = () => siteHeader?.classList.toggle('is-scrolled', window.scrollY > 18);
  window.addEventListener('scroll', updateHeader, { passive: true });
  updateHeader();

  const navToggle = document.querySelector('[data-nav-toggle]');
  const primaryNav = document.querySelector('[data-primary-nav]');
  const setNavOpen = (open, { restoreFocus = false } = {}) => {
    primaryNav?.classList.toggle('is-open', open);
    navToggle?.setAttribute('aria-expanded', open ? 'true' : 'false');
    document.body.classList.toggle('nav-open', open);
    if (!open && restoreFocus) navToggle?.focus();
  };

  navToggle?.addEventListener('click', () => {
    setNavOpen(!primaryNav?.classList.contains('is-open'));
  });

  primaryNav?.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => setNavOpen(false));
  });

  document.addEventListener('click', (event) => {
    if (!primaryNav?.classList.contains('is-open')) return;
    const target = event.target;
    if (target instanceof Node && (primaryNav.contains(target) || navToggle?.contains(target))) return;
    setNavOpen(false);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape' || !primaryNav?.classList.contains('is-open')) return;
    event.preventDefault();
    setNavOpen(false, { restoreFocus: true });
  });

  const revealItems = Array.from(document.querySelectorAll('.reveal'));
  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px' });
    revealItems.forEach((item) => observer.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add('is-visible'));
  }



  /* -------------------------------------------------------------------
     Motion enhancement study
     One bounded particle field, pointer-relative depth, card edge light,
     section ambience, and scroll progress. All nonessential motion yields
     to prefers-reduced-motion and pauses when the document is hidden.
  ------------------------------------------------------------------- */

  const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointerQuery = window.matchMedia('(hover: hover) and (pointer: fine)');
  const hero = document.querySelector('.hero');
  const particleCanvas = document.querySelector('[data-particle-canvas]');
  const motionProgress = document.querySelector('[data-motion-progress]');
  const studioDevice = document.querySelector('[data-studio-device]');
  const glowSurfaces = Array.from(document.querySelectorAll('.glow-surface'));
  const ambientSections = Array.from(document.querySelectorAll('[data-ambient-section]'));

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  const scheduleFrame = (() => {
    let frame = 0;
    return (callback) => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        callback();
      });
    };
  })();

  const updateScrollProgress = () => {
    const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const ratio = clamp(window.scrollY / max, 0, 1);
    root.style.setProperty('--scroll-ratio', ratio.toFixed(4));
  };

  window.addEventListener('scroll', () => scheduleFrame(updateScrollProgress), { passive: true });
  window.addEventListener('resize', () => scheduleFrame(updateScrollProgress), { passive: true });
  updateScrollProgress();

  const resetHeroPointer = () => {
    root.style.setProperty('--pointer-x', '0');
    root.style.setProperty('--pointer-y', '0');
    studioDevice?.style.setProperty('--tilt-x', '0deg');
    studioDevice?.style.setProperty('--tilt-y', '0deg');
  };

  if (hero && finePointerQuery.matches && !reducedMotionQuery.matches) {
    hero.addEventListener('pointermove', (event) => {
      const bounds = hero.getBoundingClientRect();
      const x = clamp(((event.clientX - bounds.left) / bounds.width) * 2 - 1, -1, 1);
      const y = clamp(((event.clientY - bounds.top) / bounds.height) * 2 - 1, -1, 1);
      scheduleFrame(() => {
        root.style.setProperty('--pointer-x', x.toFixed(4));
        root.style.setProperty('--pointer-y', y.toFixed(4));
        studioDevice?.style.setProperty('--tilt-y', `${(x * 1.55).toFixed(3)}deg`);
        studioDevice?.style.setProperty('--tilt-x', `${(-y * 0.9).toFixed(3)}deg`);
      });
    }, { passive: true });
    hero.addEventListener('pointerleave', resetHeroPointer, { passive: true });
  }

  glowSurfaces.forEach((surface) => {
    if (!finePointerQuery.matches || reducedMotionQuery.matches) return;
    surface.addEventListener('pointermove', (event) => {
      const bounds = surface.getBoundingClientRect();
      const x = clamp(((event.clientX - bounds.left) / bounds.width) * 100, 0, 100);
      const y = clamp(((event.clientY - bounds.top) / bounds.height) * 100, 0, 100);
      scheduleFrame(() => {
        surface.style.setProperty('--glow-x', `${x.toFixed(2)}%`);
        surface.style.setProperty('--glow-y', `${y.toFixed(2)}%`);
      });
    }, { passive: true });
  });

  if ('IntersectionObserver' in window) {
    const surfaceObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        entry.target.classList.toggle('is-in-view', entry.isIntersecting);
      });
    }, { threshold: 0.16, rootMargin: '0px 0px -10%' });
    glowSurfaces.forEach((surface) => surfaceObserver.observe(surface));

    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-section-visible');
        sectionObserver.unobserve(entry.target);
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -12%' });
    ambientSections.forEach((section) => sectionObserver.observe(section));
  } else {
    glowSurfaces.forEach((surface) => surface.classList.add('is-in-view'));
    ambientSections.forEach((section) => section.classList.add('is-section-visible'));
  }

  // Stagger sibling reveal elements without changing document order or markup.
  document.querySelectorAll('.product-grid, .bento-grid, .value-grid').forEach((group) => {
    Array.from(group.querySelectorAll(':scope > .reveal')).forEach((item, index) => {
      item.style.setProperty('--reveal-delay', `${Math.min(index, 6) * 85}ms`);
    });
  });


  // The POC references the exact current live header/footer logo assets. When
  // network access is unavailable, the lockup falls back to a local typographic
  // rendering without producing a broken-image marker.
  document.querySelectorAll('.brand--current img').forEach((image) => {
    const hideFallback = () => {
      image.hidden = false;
      image.parentElement?.classList.add('has-live-brand-asset');
    };
    const showFallback = () => {
      image.hidden = true;
      image.parentElement?.classList.remove('has-live-brand-asset');
    };
    if (image.complete && image.naturalWidth > 0) hideFallback();
    image.addEventListener('load', hideFallback, { once: true });
    image.addEventListener('error', showFallback, { once: true });
  });

  class AuthorityTopology {
    constructor(map) {
      this.map = map;
      this.status = map.querySelector('[data-topology-status]');
      this.routes = [
        { id: 'browser', label: 'Authority → Browser Studio' },
        { id: 'public', label: 'Authority → Public surfaces' },
        { id: 'obs', label: 'Authority → Studio for OBS' },
        { id: 'native', label: 'Authority → Native StudioApp' },
      ];
      this.svg = map.querySelector('.authority-routes');
      this.core = map.querySelector('[data-topology-node="core"]');
      this.nodes = new Map(this.routes.map((route) => [
        route.id,
        map.querySelector(`[data-topology-node="${route.id}"]`),
      ]));
      this.ports = new Map(this.routes.map((route) => [
        route.id,
        map.querySelector(`.authority-port--${route.id}`),
      ]));
      this.resizeObserver = 'ResizeObserver' in window
        ? new ResizeObserver(() => this.refreshRoutes())
        : null;
      this.index = 0;
      this.timer = 0;
      this.pending = 0;
      this.visible = false;
      this.ready = false;
      this.observer = 'IntersectionObserver' in window
        ? new IntersectionObserver((entries) => {
            this.visible = entries.some((entry) => entry.isIntersecting);
            if (this.visible) this.start();
            else this.stop();
          }, { threshold: 0.22, rootMargin: '0px 0px -8%' })
        : null;

      this.observer?.observe(map);
      this.resizeObserver?.observe(map);
      window.addEventListener('resize', () => this.refreshRoutes(), { passive: true });
      if (!this.observer) {
        this.visible = true;
        this.start();
      }
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) this.stop();
        else if (this.visible) this.start();
      });
    }

    refreshRoutes() {
      if (!this.svg || !this.core) return;
      const mapRect = this.map.getBoundingClientRect();
      const width = Math.max(1, this.map.clientWidth);
      const height = Math.max(1, this.map.clientHeight);
      this.svg.setAttribute('viewBox', `0 0 ${width} ${height}`);

      const coreRect = this.core.getBoundingClientRect();
      const coreLeft = coreRect.left - mapRect.left;
      const coreTop = coreRect.top - mapRect.top;
      const coreRight = coreLeft + coreRect.width;

      const startPoint = (id) => {
        if (id === 'browser') return { x: coreLeft, y: coreTop + coreRect.height * 0.30 };
        if (id === 'native') return { x: coreLeft, y: coreTop + coreRect.height * 0.70 };
        if (id === 'public') return { x: coreRight, y: coreTop + coreRect.height * 0.30 };
        return { x: coreRight, y: coreTop + coreRect.height * 0.70 };
      };

      const targetPoint = (id, node) => {
        if (!node) return { x: width / 2, y: height / 2 };
        const rect = node.getBoundingClientRect();
        const left = rect.left - mapRect.left;
        const top = rect.top - mapRect.top;
        const centerX = left + rect.width * 0.5;
        if (id === 'browser' || id === 'public') return { x: centerX, y: top + rect.height };
        return { x: centerX, y: top };
      };

      const routePath = (id, start, end) => {
        const outward = id === 'browser' || id === 'native' ? -92 : 92;
        const control1X = start.x + outward;
        const control1Y = start.y;
        const control2X = end.x;
        const control2Y = start.y;
        return `M${start.x.toFixed(1)} ${start.y.toFixed(1)} C${control1X.toFixed(1)} ${control1Y.toFixed(1)} ${control2X.toFixed(1)} ${control2Y.toFixed(1)} ${end.x.toFixed(1)} ${end.y.toFixed(1)}`;
      };

      this.routes.forEach((route) => {
        const start = startPoint(route.id);
        const end = targetPoint(route.id, this.nodes.get(route.id));
        const d = routePath(route.id, start, end);
        this.map.querySelectorAll(`[data-topology-route="${route.id}"] path`).forEach((path) => path.setAttribute('d', d));
      });
    }

    prepare() {
      if (this.ready) return;
      this.ready = true;
      this.map.classList.add('is-topology-ready');
      window.requestAnimationFrame(() => this.refreshRoutes());
      window.setTimeout(() => this.refreshRoutes(), 900);
    }

    activate(route) {
      this.map.classList.remove('is-topology-running');
      this.map.dataset.activeRoute = route.id;
      if (this.status) this.status.textContent = route.label;
      // A layout read restarts the single semantic trace animation without
      // introducing a persistent per-frame JavaScript loop.
      void this.map.offsetWidth;
      this.map.classList.add('is-topology-running');
    }

    cycle() {
      const route = this.routes[this.index % this.routes.length];
      this.activate(route);
      this.index = (this.index + 1) % this.routes.length;
    }

    start() {
      this.prepare();
      if (reducedMotionQuery.matches || document.hidden || !this.visible || this.timer) {
        if (reducedMotionQuery.matches) {
          this.map.classList.remove('is-topology-running');
          this.map.dataset.activeRoute = 'browser';
          if (this.status) this.status.textContent = 'Static authority topology';
        }
        return;
      }
      this.pending = window.setTimeout(() => {
        this.pending = 0;
        if (!this.visible || document.hidden || reducedMotionQuery.matches) return;
        this.cycle();
        this.timer = window.setInterval(() => this.cycle(), 3200);
      }, this.map.classList.contains('has-cycled') ? 0 : 950);
      this.map.classList.add('has-cycled');
    }

    stop() {
      if (this.pending) window.clearTimeout(this.pending);
      if (this.timer) window.clearInterval(this.timer);
      this.pending = 0;
      this.timer = 0;
      this.map.classList.remove('is-topology-running');
    }

    syncPreference() {
      this.stop();
      if (this.visible) this.start();
    }
  }

  const topologyMap = document.querySelector('[data-authority-map]');
  const authorityTopology = topologyMap ? new AuthorityTopology(topologyMap) : null;

  class ParticleField {
    constructor(canvas) {
      this.canvas = canvas;
      this.context = canvas.getContext('2d', { alpha: true });
      this.particles = [];
      this.frame = 0;
      this.visible = true;
      this.running = false;
      this.lastTime = 0;
      this.width = 0;
      this.height = 0;
      this.dpr = 1;
      this.accent = '#76c3ff';
      this.resizeObserver = 'ResizeObserver' in window ? new ResizeObserver(() => this.resize()) : null;
      this.intersectionObserver = 'IntersectionObserver' in window
        ? new IntersectionObserver((entries) => {
            this.visible = entries.some((entry) => entry.isIntersecting);
            if (this.visible) this.start();
            else this.stop();
          }, { threshold: 0.01 })
        : null;

      this.resizeObserver?.observe(canvas);
      this.intersectionObserver?.observe(canvas);
      window.addEventListener('resize', () => this.resize(), { passive: true });
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) this.stop();
        else if (this.visible) this.start();
      });
      this.resize();
      this.refreshAccent();
      this.seed();
      if (reducedMotionQuery.matches) this.drawStatic();
      else this.start();
    }

    refreshAccent() {
      const computed = getComputedStyle(root).getPropertyValue('--product-accent-bright').trim();
      if (computed) this.accent = computed;
    }

    resize() {
      const bounds = this.canvas.getBoundingClientRect();
      const nextWidth = Math.max(1, Math.round(bounds.width));
      const nextHeight = Math.max(1, Math.round(bounds.height));
      const nextDpr = Math.min(window.devicePixelRatio || 1, 1.5);
      if (nextWidth === this.width && nextHeight === this.height && nextDpr === this.dpr) return;
      this.width = nextWidth;
      this.height = nextHeight;
      this.dpr = nextDpr;
      this.canvas.width = Math.round(this.width * this.dpr);
      this.canvas.height = Math.round(this.height * this.dpr);
      this.context.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
      this.seed();
      if (reducedMotionQuery.matches) this.drawStatic();
    }

    seed() {
      const compact = this.width < 760;
      const count = compact ? 24 : Math.round(clamp(this.width / 25, 42, 62));
      this.particles = Array.from({ length: count }, (_, index) => ({
        x: Math.random() * this.width,
        y: Math.random() * this.height * 0.9,
        radius: index % 11 === 0 ? 1.45 : Math.random() * 0.85 + 0.28,
        alpha: Math.random() * 0.42 + 0.12,
        speedX: (Math.random() - 0.5) * 0.045,
        speedY: Math.random() * 0.035 + 0.006,
        phase: Math.random() * Math.PI * 2,
        accent: index % 9 === 0,
      }));
    }

    start() {
      if (this.running || reducedMotionQuery.matches || document.hidden || !this.visible) return;
      this.running = true;
      this.lastTime = performance.now();
      this.frame = requestAnimationFrame((time) => this.tick(time));
    }

    stop() {
      this.running = false;
      if (this.frame) cancelAnimationFrame(this.frame);
      this.frame = 0;
    }

    tick(time) {
      if (!this.running) return;
      const delta = Math.min(32, time - this.lastTime || 16.7);
      this.lastTime = time;
      this.draw(time, delta);
      this.frame = requestAnimationFrame((nextTime) => this.tick(nextTime));
    }

    drawStatic() {
      this.draw(0, 0, true);
    }

    draw(time, delta, staticFrame = false) {
      const context = this.context;
      context.clearRect(0, 0, this.width, this.height);
      context.save();

      if (!staticFrame) {
        const multiplier = delta / 16.7;
        this.particles.forEach((particle) => {
          particle.x += particle.speedX * multiplier;
          particle.y += particle.speedY * multiplier;
          if (particle.x < -4) particle.x = this.width + 4;
          if (particle.x > this.width + 4) particle.x = -4;
          if (particle.y > this.height + 4) particle.y = -4;
        });
      }

      const maxLinks = this.width < 760 ? 22 : 58;
      let links = 0;
      for (let i = 0; i < this.particles.length && links < maxLinks; i += 1) {
        for (let j = i + 1; j < this.particles.length && links < maxLinks; j += 1) {
          const a = this.particles[i];
          const b = this.particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance > 92) continue;
          context.beginPath();
          context.moveTo(a.x, a.y);
          context.lineTo(b.x, b.y);
          context.strokeStyle = `rgba(154, 174, 198, ${(1 - distance / 92) * 0.045})`;
          context.lineWidth = 0.5;
          context.stroke();
          links += 1;
        }
      }

      this.particles.forEach((particle) => {
        const twinkle = staticFrame ? 0.8 : 0.62 + Math.sin(time * 0.0007 + particle.phase) * 0.28;
        context.beginPath();
        context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        context.fillStyle = particle.accent ? this.accent : '#dce8f4';
        context.globalAlpha = particle.alpha * twinkle;
        context.fill();
        if (particle.radius > 1.2) {
          context.beginPath();
          context.arc(particle.x, particle.y, particle.radius * 3.8, 0, Math.PI * 2);
          context.fillStyle = particle.accent ? this.accent : '#ffffff';
          context.globalAlpha = particle.alpha * 0.045;
          context.fill();
        }
      });
      context.restore();
      context.globalAlpha = 1;
    }
  }

  const particleField = particleCanvas ? new ParticleField(particleCanvas) : null;

  const productObserver = new MutationObserver((mutations) => {
    if (!mutations.some((mutation) => mutation.attributeName === 'data-product')) return;
    particleField?.refreshAccent();
    hero?.classList.remove('is-product-changing');
    // Restarting the class in a new frame produces one subtle horizon response.
    requestAnimationFrame(() => {
      hero?.classList.add('is-product-changing');
      window.setTimeout(() => hero?.classList.remove('is-product-changing'), 720);
    });
  });
  productObserver.observe(root, { attributes: true, attributeFilter: ['data-product'] });

  const syncMotionPreference = () => {
    if (reducedMotionQuery.matches) {
      resetHeroPointer();
      particleField?.stop();
      particleField?.drawStatic();
    } else {
      particleField?.start();
    }
  };
  reducedMotionQuery.addEventListener?.('change', () => {
    syncMotionPreference();
    authorityTopology?.syncPreference();
  });
  syncMotionPreference();
  authorityTopology?.syncPreference();

  root.classList.add('motion-ready');

  const initialPreview = new URLSearchParams(window.location.search).get('preview');
  setProduct(products[initialPreview] ? initialPreview : 'browser');
})();
