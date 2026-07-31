(() => {
  const root = document.documentElement;
  const productTabs = Array.from(document.querySelectorAll('[data-product-tab]'));
  const productCards = Array.from(document.querySelectorAll('[data-product-card]'));
  const productSelectButtons = Array.from(document.querySelectorAll('[data-select-product]'));
  const primaryCta = document.querySelector('[data-primary-product-cta]');
  const primaryCtaLabel = document.querySelector('[data-primary-product-label]');
  const windowTitle = document.querySelector('[data-product-window-title]');
  const railState = document.querySelector('[data-rail-state]');
  const outputLabel = document.querySelector('[data-output-label]');
  const architectureLabel = document.querySelector('[data-product-architecture-label]');
  const architecture = document.querySelector('[data-product-architecture]');
  const productStatus = document.querySelector('[data-product-status]');
  const captionTitle = document.querySelector('[data-product-caption-title]');
  const captionCopy = document.querySelector('[data-product-caption-copy]');

  const products = Object.freeze({
    browser: {
      windowTitle: 'STREAMSUITES STUDIO',
      railState: 'Realtime ready',
      outputLabel: 'Not configured',
      architectureLabel: 'BROWSER MEDIA',
      architecture: 'Cloudflare Realtime',
      status: 'Closed Alpha',
      captionTitle: 'Browser Studio',
      captionCopy: 'Room-based production with guests, layouts, branding, and browser media.',
      ctaLabel: 'Open Browser Studio',
      ctaHref: 'https://studio.streamsuites.app',
    },
    native: {
      windowTitle: 'STREAMSUITES STUDIOAPP',
      railState: 'Engine ready',
      outputLabel: 'Local output idle',
      architectureLabel: 'NATIVE MEDIA',
      architecture: 'Supervised C++ engine',
      status: 'Windows Alpha',
      captionTitle: 'StudioApp',
      captionCopy: 'Native capture, preview, audio, detachable surfaces, and local output foundations.',
      ctaLabel: 'View StudioApp',
      ctaHref: 'https://streamsuites.app/downloads/studioapp/',
    },
    obs: {
      windowTitle: 'STREAMSUITES STUDIO FOR OBS',
      railState: 'OBS connected',
      outputLabel: 'Owned by OBS',
      architectureLabel: 'OBS MEDIA',
      architecture: 'OBS-owned pipeline',
      status: 'In development',
      captionTitle: 'Studio for OBS',
      captionCopy: 'StreamSuites-authenticated controls and automation inside an existing OBS workflow.',
      ctaLabel: 'View OBS Integration',
      ctaHref: 'https://streamsuites.app/downloads/obs-plugin/',
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

    productCards.forEach((card) => {
      card.classList.toggle('is-selected', card.dataset.productCard === productId);
    });

    if (windowTitle) windowTitle.textContent = product.windowTitle;
    if (railState) railState.textContent = product.railState;
    if (outputLabel) outputLabel.textContent = product.outputLabel;
    if (architectureLabel) architectureLabel.textContent = product.architectureLabel;
    if (architecture) architecture.textContent = product.architecture;
    if (productStatus) productStatus.textContent = product.status;
    if (captionTitle) captionTitle.textContent = product.captionTitle;
    if (captionCopy) captionCopy.textContent = product.captionCopy;
    if (primaryCtaLabel) primaryCtaLabel.textContent = product.ctaLabel;
    if (primaryCta) primaryCta.href = product.ctaHref;

    if (scrollToHero) {
      document.querySelector('#top')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
  navToggle?.addEventListener('click', () => {
    const open = !primaryNav?.classList.contains('is-open');
    primaryNav?.classList.toggle('is-open', open);
    navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });

  primaryNav?.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      primaryNav.classList.remove('is-open');
      navToggle?.setAttribute('aria-expanded', 'false');
    });
  });

  document.addEventListener('click', (event) => {
    if (!primaryNav?.classList.contains('is-open')) return;
    const target = event.target;
    if (target instanceof Node && (primaryNav.contains(target) || navToggle?.contains(target))) return;
    primaryNav.classList.remove('is-open');
    navToggle?.setAttribute('aria-expanded', 'false');
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

  setProduct('browser');
})();
