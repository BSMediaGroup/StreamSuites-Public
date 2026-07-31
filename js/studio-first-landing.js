(() => {
  "use strict";

  const root = document.documentElement;
  const productTabs = Array.from(document.querySelectorAll("[data-product-tab]"));
  const productCards = Array.from(document.querySelectorAll("[data-product-card]"));
  const productSelectButtons = Array.from(document.querySelectorAll("[data-select-product]"));
  const primaryCta = document.querySelector("[data-primary-product-cta]");
  const primaryCtaLabel = document.querySelector("[data-primary-product-label]");
  const windowTitle = document.querySelector("[data-product-window-title]");
  const railState = document.querySelector("[data-rail-state]");
  const outputLabel = document.querySelector("[data-output-label]");
  const architectureLabel = document.querySelector("[data-product-architecture-label]");
  const architecture = document.querySelector("[data-product-architecture]");
  const productStatus = document.querySelector("[data-product-status]");
  const captionTitle = document.querySelector("[data-product-caption-title]");
  const captionCopy = document.querySelector("[data-product-caption-copy]");

  const products = Object.freeze({
    browser: {
      windowTitle: "STREAMSUITES STUDIO",
      railState: "Private room ready",
      outputLabel: "OFF AIR",
      architectureLabel: "BROWSER MEDIA",
      architecture: "Cloudflare RealtimeKit",
      status: "Closed access",
      captionTitle: "Browser Studio",
      captionCopy: "Private rooms, guests, layouts, branding, and direct browser media. Broadcast output remains unimplemented.",
      ctaLabel: "Open Browser Studio",
      ctaHref: "https://studio.streamsuites.app",
    },
    native: {
      windowTitle: "STREAMSUITES STUDIOAPP",
      railState: "Engine supervised",
      outputLabel: "Local output idle",
      architectureLabel: "NATIVE MEDIA",
      architecture: "Supervised C++ engine",
      status: "Windows Alpha",
      captionTitle: "StudioApp",
      captionCopy: "Native capture, preview, audio, recording, replay, and one authorized custom RTMP/RTMPS output path.",
      ctaLabel: "View StudioApp",
      ctaHref: "/downloads/studioapp/",
    },
    obs: {
      windowTitle: "STREAMSUITES STUDIO FOR OBS",
      railState: "Receiver bridge",
      outputLabel: "Owned by OBS",
      architectureLabel: "OBS MEDIA",
      architecture: "OBS-owned pipeline",
      status: "In development",
      captionTitle: "Studio for OBS",
      captionCopy: "Room and guest receiver foundations for existing OBS workflows. OBS keeps capture, mixing, encoding, and output.",
      ctaLabel: "View OBS Integration",
      ctaHref: "/downloads/obs-plugin/",
    },
  });

  const setProduct = (productId, { focusTab = false, scrollToHero = false } = {}) => {
    const product = products[productId];
    if (!product) return;

    root.dataset.product = productId;
    productTabs.forEach((tab) => {
      const active = tab.dataset.productTab === productId;
      tab.classList.toggle("is-active", active);
      tab.setAttribute("aria-selected", active ? "true" : "false");
      tab.tabIndex = active ? 0 : -1;
      if (active && focusTab) tab.focus();
    });

    productCards.forEach((card) => {
      card.classList.toggle("is-selected", card.dataset.productCard === productId);
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
      document.querySelector("#top")?.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
        block: "start",
      });
    }
  };

  productTabs.forEach((tab, index) => {
    tab.addEventListener("click", () => setProduct(tab.dataset.productTab));
    tab.addEventListener("keydown", (event) => {
      if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
      event.preventDefault();
      let nextIndex = index;
      if (event.key === "ArrowLeft") nextIndex = (index - 1 + productTabs.length) % productTabs.length;
      if (event.key === "ArrowRight") nextIndex = (index + 1) % productTabs.length;
      if (event.key === "Home") nextIndex = 0;
      if (event.key === "End") nextIndex = productTabs.length - 1;
      setProduct(productTabs[nextIndex].dataset.productTab, { focusTab: true });
    });
  });

  productSelectButtons.forEach((button) => {
    button.addEventListener("click", () => {
      setProduct(button.dataset.selectProduct, { scrollToHero: true });
    });
  });

  const surfaceImage = document.querySelector("[data-ecosystem-image]");
  const surfaceTabs = Array.from(document.querySelectorAll("[data-surface-tab]"));
  surfaceTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      if (!surfaceImage || tab.classList.contains("is-active")) return;
      surfaceTabs.forEach((candidate) => {
        const active = candidate === tab;
        candidate.classList.toggle("is-active", active);
        candidate.setAttribute("aria-selected", active ? "true" : "false");
        candidate.tabIndex = active ? 0 : -1;
      });
      surfaceImage.classList.add("is-changing");
      window.setTimeout(() => {
        surfaceImage.src = tab.dataset.image || surfaceImage.src;
        surfaceImage.alt =
          tab.dataset.surfaceTab === "public"
            ? "StreamSuites Public dashboard interface"
            : "StreamSuites Creator dashboard interface";
        surfaceImage.classList.remove("is-changing");
      }, 140);
    });
  });

  const ALPHA_NOTICE_KEY = "streamsuites.public.alphaNotice.dismissed";
  const alphaStrip = document.querySelector("[data-alpha-strip]");
  const alphaClose = document.querySelector("[data-alpha-close]");
  try {
    alphaStrip?.classList.toggle("is-dismissed", window.sessionStorage.getItem(ALPHA_NOTICE_KEY) === "true");
  } catch (_error) {
    // The notice remains visible when session storage is unavailable.
  }
  alphaClose?.addEventListener("click", () => {
    alphaStrip?.classList.add("is-dismissed");
    try {
      window.sessionStorage.setItem(ALPHA_NOTICE_KEY, "true");
    } catch (_error) {
      // Dismissal still applies for the current document.
    }
  });

  const siteHeader = document.querySelector("[data-site-header]");
  const updateHeader = () => siteHeader?.classList.toggle("is-scrolled", window.scrollY > 18);
  window.addEventListener("scroll", updateHeader, { passive: true });
  updateHeader();

  const navToggle = document.querySelector("[data-nav-toggle]");
  const primaryNav = document.querySelector("[data-primary-nav]");
  const setNavOpen = (open, { restoreFocus = false } = {}) => {
    primaryNav?.classList.toggle("is-open", open);
    navToggle?.setAttribute("aria-expanded", open ? "true" : "false");
    document.body.classList.toggle("nav-open", open);
    if (!open && restoreFocus) navToggle?.focus();
  };

  navToggle?.addEventListener("click", () => {
    setNavOpen(!primaryNav?.classList.contains("is-open"));
  });

  primaryNav?.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => setNavOpen(false));
  });

  const headerLoginMenu = document.querySelector("[data-header-login-menu]");
  const headerLoginTrigger = headerLoginMenu?.querySelector("[data-creator-cta]");
  const setHeaderLoginMenuOpen = (open, { restoreFocus = false } = {}) => {
    headerLoginMenu?.classList.toggle("is-open", open);
    headerLoginTrigger?.setAttribute("aria-expanded", open ? "true" : "false");
    if (!open && restoreFocus) headerLoginTrigger?.focus();
  };

  headerLoginMenu?.addEventListener("pointerenter", () => setHeaderLoginMenuOpen(true));
  headerLoginMenu?.addEventListener("pointerleave", () => setHeaderLoginMenuOpen(false));
  headerLoginMenu?.addEventListener("focusin", () => setHeaderLoginMenuOpen(true));
  headerLoginMenu?.addEventListener("focusout", () => {
    window.setTimeout(() => {
      if (!headerLoginMenu.contains(document.activeElement)) setHeaderLoginMenuOpen(false);
    }, 0);
  });
  headerLoginMenu?.querySelectorAll(".header-login-menu__item").forEach((link) => {
    link.addEventListener("click", () => {
      setHeaderLoginMenuOpen(false);
      setNavOpen(false);
    });
  });

  document.querySelectorAll("[data-auth-trigger]").forEach((trigger) => {
    trigger.addEventListener("click", () => setNavOpen(false), { capture: true });
  });

  document.addEventListener("click", (event) => {
    if (!primaryNav?.classList.contains("is-open")) return;
    const target = event.target;
    if (target instanceof Node && (primaryNav.contains(target) || navToggle?.contains(target))) return;
    setNavOpen(false);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && headerLoginMenu?.classList.contains("is-open")) {
      event.preventDefault();
      setHeaderLoginMenuOpen(false, { restoreFocus: true });
      return;
    }
    if (event.key === "Escape" && primaryNav?.classList.contains("is-open")) {
      event.preventDefault();
      setNavOpen(false, { restoreFocus: true });
    }
  });

  const revealItems = Array.from(document.querySelectorAll(".reveal"));
  if ("IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px" }
    );
    revealItems.forEach((item) => observer.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  }

  setProduct("browser");
})();
