(() => {
  "use strict";

  const root = document.documentElement;
  const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  const finePointerQuery = window.matchMedia("(hover: hover) and (pointer: fine)");
  const productTabs = Array.from(document.querySelectorAll("[data-product-tab]"));
  const productCards = Array.from(document.querySelectorAll("[data-product-card]"));
  const productSelectButtons = Array.from(document.querySelectorAll("[data-select-product]"));
  const previewStates = Array.from(document.querySelectorAll("[data-preview-state]"));
  const primaryCta = document.querySelector("[data-primary-product-cta]");
  const primaryCtaLabel = document.querySelector("[data-primary-product-label]");
  const windowTitle = document.querySelector("[data-product-window-title]");
  const railState = document.querySelector("[data-rail-state]");
  const outputLabel = document.querySelector("[data-output-label]");
  const layoutLabel = document.querySelector("[data-layout-label]");
  const stageLabel = document.querySelector("[data-stage-label]");
  const architectureLabel = document.querySelector("[data-product-architecture-label]");
  const architecture = document.querySelector("[data-product-architecture]");
  const productMediaIconShell = document.querySelector("[data-product-media-icon-shell]");
  const productStatus = document.querySelector("[data-product-status]");
  const captionTitle = document.querySelector("[data-product-caption-title]");
  const captionCopy = document.querySelector("[data-product-caption-copy]");
  const commentName = document.querySelector("[data-comment-name]");
  const commentText = document.querySelector("[data-comment-text]");
  const commentAvatar = document.querySelector("[data-comment-avatar]");
  const productCycleControls = document.querySelector("[data-product-cycle-controls]");
  const productCycleToggle = document.querySelector("[data-product-cycle-toggle]");
  const productCycleToggleLabel = document.querySelector("[data-product-cycle-toggle-label]");
  const productCycleDots = Array.from(document.querySelectorAll("[data-product-cycle-dot]"));
  const heroVisual = document.querySelector(".hero__visual");
  const studioDevice = document.querySelector("[data-studio-device]");
  const productCaption = document.querySelector(".product-caption");
  const isProductLanding = root.hasAttribute("data-product") && productTabs.length > 1 && Boolean(productCycleControls);

  const products = Object.freeze({
    browser: {
      previewState: "studio",
      windowTitle: "STREAMSUITES STUDIO",
      railState: "Private room ready",
      outputLabel: "LIVE NOW",
      layoutLabel: "Interview",
      stageLabel: "2 participants",
      architectureLabel: "BROWSER MEDIA",
      architecture: "Cloudflare RealtimeKit",
      mediaIcon: "/assets/icons/ui/cast.svg",
      status: "Closed access",
      captionTitle: "Browser Studio",
      captionCopy: "Private rooms, guests, layouts, branding, and direct browser media. Broadcast output remains unimplemented.",
      ctaLabel: "Open Browser Studio",
      ctaHref: "https://studio.streamsuites.app",
      commentName: "BUBBLE BOB",
      commentText: "Is it true you guys invented Jimothy?",
      commentAvatar: "/assets/placeholders/livecommenter1.webp",
    },
    native: {
      previewState: "studio",
      windowTitle: "STREAMSUITES STUDIOAPP",
      railState: "Engine supervised",
      outputLabel: "LIVE NOW",
      layoutLabel: "Solo",
      stageLabel: "1 local source",
      architectureLabel: "NATIVE MEDIA",
      architecture: "Supervised C++ engine",
      mediaIcon: "/assets/icons/ui/cast.svg",
      status: "Windows Alpha",
      captionTitle: "StudioApp",
      captionCopy: "Native capture, preview, audio, recording, replay, and one authorized custom RTMP/RTMPS output path.",
      ctaLabel: "View StudioApp",
      ctaHref: "/downloads/studioapp/",
      commentName: "THIRD RAILIFY",
      commentText: "Hey bro that's a pretty nice chair you have...",
      commentAvatar: "/assets/placeholders/livecommenter2.webp",
    },
    obs: {
      previewState: "obs",
      status: "In development",
      captionTitle: "Studio for OBS",
      captionCopy: "Room and guest receiver foundations for existing OBS workflows. OBS keeps capture, mixing, encoding, and output.",
      ctaLabel: "View OBS Integration",
      ctaHref: "/downloads/obs-plugin/",
    },
    public: {
      previewState: "public",
      status: "Public surfaces",
      captionTitle: "Public Shell",
      captionCopy: "Clips and other public artifacts are downstream Runtime/Auth-backed surfaces, not another production media engine.",
      ctaLabel: "Explore Public Clips",
      ctaHref: "https://streamsuites.app/clips",
    },
  });

  const productIds = Object.freeze(Object.keys(products));
  const PRODUCT_CYCLE_DELAY = 10000;
  let currentProductId = products[root.dataset.product] ? root.dataset.product : "browser";
  let productCycleTimer = 0;
  let productCycleRequested = true;
  let productCycleVisible = true;
  let previewTransitionLayer = null;
  let previewTransitionTimer = 0;
  let previewEnterTimer = 0;

  const removePreviewTransitionLayer = () => {
    if (previewTransitionTimer) window.clearTimeout(previewTransitionTimer);
    previewTransitionTimer = 0;
    previewTransitionLayer?.remove();
    previewTransitionLayer = null;
  };

  const createPreviewTransitionLayer = (productId) => {
    if (!studioDevice || reducedMotionQuery.matches) return null;
    const activePreview = previewStates.find((state) => state.classList.contains("is-active"));
    if (!activePreview) return null;

    removePreviewTransitionLayer();
    const layer = activePreview.cloneNode(true);
    layer.removeAttribute("id");
    layer.removeAttribute("data-preview-state");
    layer.removeAttribute("aria-labelledby");
    layer.classList.remove("is-active", "is-product-entering");
    layer.classList.add("preview-transition-layer");
    layer.dataset.transitionProduct = productId;
    layer.setAttribute("aria-hidden", "true");
    layer.setAttribute("role", "presentation");
    layer.inert = true;
    layer.querySelectorAll("[id]").forEach((element) => element.removeAttribute("id"));
    layer.querySelectorAll("[aria-live]").forEach((element) => element.removeAttribute("aria-live"));

    const rootStyle = getComputedStyle(root);
    ["--product-accent", "--product-accent-bright", "--product-glow"].forEach((property) => {
      const value = rootStyle.getPropertyValue(property).trim();
      if (value) layer.style.setProperty(property, value);
    });

    studioDevice.append(layer);
    previewTransitionLayer = layer;
    void layer.offsetWidth;
    window.requestAnimationFrame(() => layer.classList.add("is-leaving"));
    previewTransitionTimer = window.setTimeout(removePreviewTransitionLayer, 940);
    return layer;
  };

  const setProduct = (productId, { focusTab = false, scrollToHero = false } = {}) => {
    const product = products[productId];
    if (!product) return;

    const previousProductId = currentProductId;
    const changingProduct = previousProductId !== productId;
    if (changingProduct) createPreviewTransitionLayer(previousProductId);
    currentProductId = productId;

    root.dataset.product = productId;
    productTabs.forEach((tab) => {
      const active = tab.dataset.productTab === productId;
      tab.classList.toggle("is-active", active);
      tab.setAttribute("aria-selected", active ? "true" : "false");
      tab.tabIndex = active ? 0 : -1;
      if (active && focusTab) tab.focus();
    });

    previewStates.forEach((state) => {
      const active = state.dataset.previewState === product.previewState;
      state.classList.toggle("is-active", active);
      state.setAttribute("aria-hidden", active ? "false" : "true");
      if (active) state.setAttribute("aria-labelledby", `product-tab-${productId}`);
    });

    productCycleDots.forEach((dot) => {
      const active = dot.dataset.productCycleDot === productId;
      dot.classList.toggle("is-active", active);
      if (active) dot.setAttribute("aria-current", "true");
      else dot.removeAttribute("aria-current");
    });

    productCards.forEach((card) => {
      card.classList.toggle("is-selected", card.dataset.productCard === productId);
    });

    if (windowTitle && product.windowTitle) windowTitle.textContent = product.windowTitle;
    if (railState && product.railState) railState.textContent = product.railState;
    if (outputLabel && product.outputLabel) outputLabel.textContent = product.outputLabel;
    if (layoutLabel && product.layoutLabel) layoutLabel.textContent = product.layoutLabel;
    if (stageLabel && product.stageLabel) stageLabel.textContent = product.stageLabel;
    if (architectureLabel && product.architectureLabel) architectureLabel.textContent = product.architectureLabel;
    if (architecture && product.architecture) architecture.textContent = product.architecture;
    if (productMediaIconShell && product.mediaIcon) {
      productMediaIconShell.style.setProperty("--icon-url", `url("${product.mediaIcon}")`);
    }
    if (productStatus) productStatus.textContent = product.status;
    if (captionTitle) captionTitle.textContent = product.captionTitle;
    if (captionCopy) captionCopy.textContent = product.captionCopy;
    if (primaryCtaLabel) primaryCtaLabel.textContent = product.ctaLabel;
    if (primaryCta) primaryCta.href = product.ctaHref;
    if (commentName && product.commentName) commentName.textContent = product.commentName;
    if (commentText && product.commentText) commentText.textContent = product.commentText;
    if (commentAvatar && product.commentAvatar) commentAvatar.src = product.commentAvatar;

    if (changingProduct && !reducedMotionQuery.matches) {
      const activePreview = previewStates.find((state) => state.classList.contains("is-active"));
      previewStates.forEach((state) => state.classList.remove("is-product-entering"));
      if (activePreview) {
        void activePreview.offsetWidth;
        activePreview.classList.add("is-product-entering");
        if (previewEnterTimer) window.clearTimeout(previewEnterTimer);
        previewEnterTimer = window.setTimeout(() => activePreview.classList.remove("is-product-entering"), 940);
      }
      productCaption?.classList.remove("is-product-changing");
      void productCaption?.offsetWidth;
      productCaption?.classList.add("is-product-changing");
      window.setTimeout(() => productCaption?.classList.remove("is-product-changing"), 760);
    }

    if (scrollToHero) {
      document.querySelector("#top")?.scrollIntoView({
        behavior: reducedMotionQuery.matches ? "auto" : "smooth",
        block: "start",
      });
    }
  };

  const clearProductCycle = () => {
    if (productCycleTimer) window.clearTimeout(productCycleTimer);
    productCycleTimer = 0;
  };

  const productCycleCanRun = () =>
    isProductLanding &&
    productCycleRequested &&
    !reducedMotionQuery.matches &&
    !document.hidden &&
    productCycleVisible;

  const updateProductCycleControls = () => {
    if (!productCycleToggle) return;
    const paused = !productCycleRequested || reducedMotionQuery.matches;
    const label = reducedMotionQuery.matches
      ? "Automatic product previews are disabled by reduced motion"
      : paused
        ? "Play automatic product previews"
        : "Pause automatic product previews";
    productCycleToggle.classList.toggle("is-paused", paused);
    productCycleToggle.setAttribute("aria-pressed", paused ? "true" : "false");
    productCycleToggle.setAttribute("aria-label", label);
    productCycleToggle.title = label;
    productCycleToggle.disabled = reducedMotionQuery.matches;
    if (productCycleToggleLabel) productCycleToggleLabel.textContent = label;
    productCycleControls?.classList.toggle("is-paused", paused);
  };

  const scheduleProductCycle = () => {
    clearProductCycle();
    if (!productCycleCanRun() || productIds.length < 2) return;
    productCycleTimer = window.setTimeout(() => {
      productCycleTimer = 0;
      const currentIndex = Math.max(0, productIds.indexOf(currentProductId));
      setProduct(productIds[(currentIndex + 1) % productIds.length]);
      scheduleProductCycle();
    }, PRODUCT_CYCLE_DELAY);
  };

  const activateProduct = (productId, options = {}) => {
    setProduct(productId, options);
    scheduleProductCycle();
  };

  productTabs.forEach((tab, index) => {
    tab.addEventListener("click", () => activateProduct(tab.dataset.productTab));
    tab.addEventListener("keydown", (event) => {
      if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
      event.preventDefault();
      let nextIndex = index;
      if (event.key === "ArrowLeft") nextIndex = (index - 1 + productTabs.length) % productTabs.length;
      if (event.key === "ArrowRight") nextIndex = (index + 1) % productTabs.length;
      if (event.key === "Home") nextIndex = 0;
      if (event.key === "End") nextIndex = productTabs.length - 1;
      activateProduct(productTabs[nextIndex].dataset.productTab, { focusTab: true });
    });
  });

  productCycleDots.forEach((dot) => {
    dot.addEventListener("click", () => activateProduct(dot.dataset.productCycleDot));
  });

  productCycleToggle?.addEventListener("click", () => {
    productCycleRequested = !productCycleRequested;
    updateProductCycleControls();
    scheduleProductCycle();
  });

  if (heroVisual && "IntersectionObserver" in window) {
    const productCycleObserver = new IntersectionObserver(
      (entries) => {
        productCycleVisible = entries.some((entry) => entry.isIntersecting);
        scheduleProductCycle();
      },
      { threshold: 0.22 }
    );
    productCycleObserver.observe(heroVisual);
  }

  document.addEventListener("visibilitychange", scheduleProductCycle);

  productSelectButtons.forEach((button) => {
    button.addEventListener("click", () => {
      activateProduct(button.dataset.selectProduct, { scrollToHero: true });
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

  const LEGACY_ALPHA_NOTICE_KEY = "streamsuites.public.alphaNotice.dismissed";
  const alphaStrip = document.querySelector("[data-alpha-strip]");
  const alphaClose = document.querySelector("[data-alpha-close]");
  try {
    window.sessionStorage.removeItem(LEGACY_ALPHA_NOTICE_KEY);
  } catch (_error) {
    // Legacy dismissal cleanup is best effort; the notice remains visible.
  }
  alphaClose?.addEventListener("click", () => {
    alphaStrip?.classList.add("is-dismissed");
  });

  const pendingFrameTasks = new Set();
  let pendingFrame = 0;
  const scheduleFrame = (callback) => {
    pendingFrameTasks.add(callback);
    if (pendingFrame) return;
    pendingFrame = window.requestAnimationFrame(() => {
      pendingFrame = 0;
      const tasks = Array.from(pendingFrameTasks);
      pendingFrameTasks.clear();
      tasks.forEach((task) => task());
    });
  };

  const siteHeader = document.querySelector("[data-site-header]");
  const updateScrollState = () => {
    siteHeader?.classList.toggle("is-scrolled", window.scrollY > 18);
    const range = document.documentElement.scrollHeight - window.innerHeight;
    const ratio = range <= 1 ? 1 : Math.min(1, Math.max(0, window.scrollY / range));
    root.style.setProperty("--scroll-progress", ratio.toFixed(4));
  };
  const scheduleScrollState = () => scheduleFrame(updateScrollState);
  window.addEventListener("scroll", scheduleScrollState, { passive: true });
  window.addEventListener("resize", scheduleScrollState, { passive: true });
  updateScrollState();

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
  if ("IntersectionObserver" in window && !reducedMotionQuery.matches) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px" }
    );
    revealItems.forEach((item) => revealObserver.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  }

  document.querySelectorAll(".product-grid, .bento-grid, .value-grid").forEach((group) => {
    Array.from(group.querySelectorAll(":scope > .reveal")).forEach((item, index) => {
      item.style.setProperty("--reveal-delay", `${Math.min(index, 6) * 80}ms`);
    });
  });

  const clamp = (value, minimum, maximum) => Math.min(maximum, Math.max(minimum, value));
  const hero = document.querySelector(".landing-hero");
  const resetHeroPointer = () => {
    root.style.setProperty("--pointer-x", "0");
    root.style.setProperty("--pointer-y", "0");
    studioDevice?.style.setProperty("--tilt-x", "0deg");
    studioDevice?.style.setProperty("--tilt-y", "0deg");
  };

  hero?.addEventListener(
    "pointermove",
    (event) => {
      if (!finePointerQuery.matches || reducedMotionQuery.matches) return;
      const bounds = hero.getBoundingClientRect();
      const x = clamp(((event.clientX - bounds.left) / bounds.width) * 2 - 1, -1, 1);
      const y = clamp(((event.clientY - bounds.top) / bounds.height) * 2 - 1, -1, 1);
      scheduleFrame(() => {
        root.style.setProperty("--pointer-x", x.toFixed(4));
        root.style.setProperty("--pointer-y", y.toFixed(4));
        studioDevice?.style.setProperty("--tilt-y", `${(x * 0.55).toFixed(3)}deg`);
        studioDevice?.style.setProperty("--tilt-x", `${(-y * 0.34).toFixed(3)}deg`);
      });
    },
    { passive: true }
  );
  hero?.addEventListener("pointerleave", resetHeroPointer, { passive: true });
  finePointerQuery.addEventListener?.("change", resetHeroPointer);

  const glowSurfaces = Array.from(
    document.querySelectorAll(".product-card, .bento-card, .dashboard-browser, .value-card, .alpha-panel")
  );
  glowSurfaces.forEach((surface) => {
    surface.classList.add("glow-surface");
    surface.addEventListener(
      "pointermove",
      (event) => {
        if (!finePointerQuery.matches || reducedMotionQuery.matches) return;
        const bounds = surface.getBoundingClientRect();
        const x = clamp(((event.clientX - bounds.left) / bounds.width) * 100, 0, 100);
        const y = clamp(((event.clientY - bounds.top) / bounds.height) * 100, 0, 100);
        scheduleFrame(() => {
          surface.style.setProperty("--glow-x", `${x.toFixed(2)}%`);
          surface.style.setProperty("--glow-y", `${y.toFixed(2)}%`);
        });
      },
      { passive: true }
    );
  });

  class AuthorityTopology {
    constructor(map) {
      this.map = map;
      this.status = map.querySelector("[data-topology-status]");
      this.svg = map.querySelector(".authority-routes");
      this.core = map.querySelector('[data-topology-node="core"]');
      this.routes = [
        { id: "browser", label: "Authority → Browser Studio" },
        { id: "public", label: "Authority → Public surfaces" },
        { id: "obs", label: "Authority → Studio for OBS" },
        { id: "native", label: "Authority → StudioApp" },
      ];
      this.nodes = new Map(
        this.routes.map((route) => [route.id, map.querySelector(`[data-topology-node="${route.id}"]`)])
      );
      this.index = 0;
      this.timer = 0;
      this.pending = 0;
      this.visible = !("IntersectionObserver" in window);
      this.ready = false;
      this.resizeObserver =
        "ResizeObserver" in window ? new ResizeObserver(() => this.refreshRoutes()) : null;
      this.observer =
        "IntersectionObserver" in window
          ? new IntersectionObserver(
              (entries) => {
                this.visible = entries.some((entry) => entry.isIntersecting);
                if (this.visible) this.start();
                else this.stop();
              },
              { threshold: 0.18, rootMargin: "0px 0px -8%" }
            )
          : null;

      this.observer?.observe(map);
      this.resizeObserver?.observe(map);
      window.addEventListener("resize", () => scheduleFrame(() => this.refreshRoutes()), { passive: true });
      document.addEventListener("visibilitychange", () => {
        if (document.hidden) this.stop();
        else if (this.visible) this.start();
      });
      if (!this.observer) this.start();
    }

    refreshRoutes() {
      if (!this.svg || !this.core) return;
      const mapRect = this.map.getBoundingClientRect();
      const width = Math.max(1, this.map.clientWidth);
      const height = Math.max(1, this.map.clientHeight);
      this.svg.setAttribute("viewBox", `0 0 ${width} ${height}`);

      const coreRect = this.core.getBoundingClientRect();
      const coreLeft = coreRect.left - mapRect.left;
      const coreTop = coreRect.top - mapRect.top;
      const coreRight = coreLeft + coreRect.width;
      const startPoint = (id) => {
        if (id === "browser") return { x: coreLeft, y: coreTop + coreRect.height * 0.3 };
        if (id === "native") return { x: coreLeft, y: coreTop + coreRect.height * 0.7 };
        if (id === "public") return { x: coreRight, y: coreTop + coreRect.height * 0.3 };
        return { x: coreRight, y: coreTop + coreRect.height * 0.7 };
      };
      const targetPoint = (id, node) => {
        if (!node) return { x: width / 2, y: height / 2 };
        const rect = node.getBoundingClientRect();
        const left = rect.left - mapRect.left;
        const top = rect.top - mapRect.top;
        return {
          x: left + rect.width * 0.5,
          y: id === "browser" || id === "public" ? top + rect.height : top,
        };
      };

      this.routes.forEach((route) => {
        const start = startPoint(route.id);
        const end = targetPoint(route.id, this.nodes.get(route.id));
        const outward = route.id === "browser" || route.id === "native" ? -Math.min(96, width * 0.14) : Math.min(96, width * 0.14);
        const d = `M${start.x.toFixed(1)} ${start.y.toFixed(1)} C${(start.x + outward).toFixed(1)} ${start.y.toFixed(1)} ${end.x.toFixed(1)} ${start.y.toFixed(1)} ${end.x.toFixed(1)} ${end.y.toFixed(1)}`;
        this.map
          .querySelectorAll(`[data-topology-route="${route.id}"] path`)
          .forEach((path) => path.setAttribute("d", d));
      });
    }

    prepare() {
      if (this.ready) return;
      this.ready = true;
      this.map.classList.add("is-topology-ready");
      scheduleFrame(() => this.refreshRoutes());
      window.setTimeout(() => this.refreshRoutes(), 500);
    }

    activate(route) {
      this.map.classList.remove("is-topology-running");
      this.map.dataset.activeRoute = route.id;
      if (this.status) this.status.textContent = route.label;
      void this.map.offsetWidth;
      this.map.classList.add("is-topology-running");
    }

    cycle() {
      const route = this.routes[this.index % this.routes.length];
      this.activate(route);
      this.index = (this.index + 1) % this.routes.length;
    }

    start() {
      this.prepare();
      if (reducedMotionQuery.matches || document.hidden || !this.visible || this.timer || this.pending) {
        if (reducedMotionQuery.matches) {
          this.map.classList.remove("is-topology-running");
          this.map.dataset.activeRoute = "browser";
          if (this.status) this.status.textContent = "Static authority topology";
        }
        return;
      }
      this.pending = window.setTimeout(() => {
        this.pending = 0;
        if (!this.visible || document.hidden || reducedMotionQuery.matches) return;
        this.cycle();
        this.timer = window.setInterval(() => this.cycle(), 3200);
      }, this.map.classList.contains("has-cycled") ? 0 : 700);
      this.map.classList.add("has-cycled");
    }

    stop() {
      if (this.pending) window.clearTimeout(this.pending);
      if (this.timer) window.clearInterval(this.timer);
      this.pending = 0;
      this.timer = 0;
      this.map.classList.remove("is-topology-running");
    }

    syncPreference() {
      this.stop();
      if (reducedMotionQuery.matches) {
        this.map.dataset.activeRoute = "browser";
        if (this.status) this.status.textContent = "Static authority topology";
        return;
      }
      if (this.visible) this.start();
    }
  }

  class ParticleField {
    constructor(canvas) {
      this.canvas = canvas;
      this.context = canvas.getContext("2d", { alpha: true });
      this.particles = [];
      this.signals = [];
      this.frame = 0;
      this.visible = !("IntersectionObserver" in window);
      this.running = false;
      this.lastTime = 0;
      this.width = 0;
      this.height = 0;
      this.dpr = 1;
      this.accent = "#76c3ff";
      this.resizeObserver = "ResizeObserver" in window ? new ResizeObserver(() => this.resize()) : null;
      this.intersectionObserver =
        "IntersectionObserver" in window
          ? new IntersectionObserver(
              (entries) => {
                this.visible = entries.some((entry) => entry.isIntersecting);
                if (this.visible) this.start();
                else this.stop();
              },
              { threshold: 0.01 }
            )
          : null;
      this.resizeObserver?.observe(canvas);
      this.intersectionObserver?.observe(canvas);
      document.addEventListener("visibilitychange", () => {
        if (document.hidden) this.stop();
        else if (this.visible) this.start();
      });
      this.resize();
      this.refreshAccent();
      if (reducedMotionQuery.matches) this.drawStatic();
      else if (!this.intersectionObserver) this.start();
    }

    refreshAccent() {
      const computed = getComputedStyle(root).getPropertyValue("--product-accent-bright").trim();
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
      const count = compact ? 54 : Math.round(clamp(this.width / 9, 96, 156));
      const leftWeightedCount = Math.ceil(count * 0.7);
      this.particles = Array.from({ length: count }, (_, index) => {
        const depth = Math.random() * 0.72 + 0.28;
        const beacon = index % 17 === 0;
        const accent = beacon || index % 5 === 0;
        const x =
          index < leftWeightedCount
            ? this.width * (0.015 + Math.random() * 0.655)
            : this.width * (0.58 + Math.random() * 0.405);
        return {
          x,
          y: this.height * (0.035 + Math.random() * 0.91),
          depth,
          radius: beacon ? 1.75 : accent ? Math.random() * 0.7 + 0.62 : Math.random() * 0.72 + 0.2,
          alpha: beacon ? 0.76 : Math.random() * 0.42 + 0.24,
          speedX: (Math.random() - 0.42) * 0.07 * depth,
          speedY: (Math.random() * 0.042 + 0.007) * depth,
          phase: Math.random() * Math.PI * 2,
          accent,
          beacon,
        };
      });
      const signalCount = compact ? 2 : 5;
      this.signals = Array.from({ length: signalCount }, (_, index) => ({
        phase: (index / signalCount + Math.random() * 0.16) % 1,
        speed: 0.000018 + Math.random() * 0.000018,
        startY: this.height * (0.18 + index * (0.54 / Math.max(1, signalCount - 1))),
        curve: this.height * ((index % 2 === 0 ? -1 : 1) * (0.05 + Math.random() * 0.08)),
        alpha: 0.34 + Math.random() * 0.28,
      }));
    }

    start() {
      if (this.running || reducedMotionQuery.matches || document.hidden || !this.visible) return;
      this.running = true;
      this.lastTime = performance.now();
      this.frame = window.requestAnimationFrame((time) => this.tick(time));
    }

    stop() {
      this.running = false;
      if (this.frame) window.cancelAnimationFrame(this.frame);
      this.frame = 0;
    }

    tick(time) {
      if (!this.running) return;
      const delta = Math.min(32, time - this.lastTime || 16.7);
      this.lastTime = time;
      this.draw(time, delta);
      this.frame = window.requestAnimationFrame((nextTime) => this.tick(nextTime));
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
          if (particle.x < -12) particle.x = this.width + 12;
          if (particle.x > this.width + 12) particle.x = -12;
          if (particle.y > this.height + 12) particle.y = -12;
        });
      }

      const positions = this.particles.map((particle) => ({
        x: particle.x + Math.sin(time * 0.00023 * particle.depth + particle.phase) * 4.5 * particle.depth,
        y: particle.y + Math.cos(time * 0.00019 * particle.depth + particle.phase) * 2.8 * particle.depth,
      }));

      context.globalCompositeOperation = "lighter";
      const maxLinks = this.width < 760 ? 44 : 144;
      let links = 0;
      for (let index = 0; index < this.particles.length && links < maxLinks; index += 1) {
        for (let peer = index + 1; peer < this.particles.length && links < maxLinks; peer += 1) {
          const first = this.particles[index];
          const second = this.particles[peer];
          const firstPosition = positions[index];
          const secondPosition = positions[peer];
          const distance = Math.hypot(firstPosition.x - secondPosition.x, firstPosition.y - secondPosition.y);
          if (distance > 124) continue;
          context.beginPath();
          context.moveTo(firstPosition.x, firstPosition.y);
          context.lineTo(secondPosition.x, secondPosition.y);
          context.strokeStyle = first.accent || second.accent ? this.accent : "#b9cee1";
          context.globalAlpha = (1 - distance / 124) * (first.accent || second.accent ? 0.11 : 0.068);
          context.lineWidth = first.accent || second.accent ? 0.65 : 0.42;
          context.stroke();
          links += 1;
        }
      }

      const signalPoint = (signal, progress) => {
        const inverse = 1 - progress;
        const startX = this.width * -0.05;
        const controlX = this.width * 0.28;
        const endX = this.width * 0.72;
        const endY = signal.startY + signal.curve * 0.28;
        return {
          x: inverse * inverse * startX + 2 * inverse * progress * controlX + progress * progress * endX,
          y: inverse * inverse * signal.startY + 2 * inverse * progress * (signal.startY + signal.curve) + progress * progress * endY,
        };
      };

      this.signals.forEach((signal) => {
        const progress = staticFrame ? signal.phase : (signal.phase + time * signal.speed) % 1;
        const tail = signalPoint(signal, Math.max(0, progress - 0.055));
        const point = signalPoint(signal, progress);
        const glowRadius = this.width < 760 ? 7 : 11;
        context.beginPath();
        context.moveTo(tail.x, tail.y);
        context.lineTo(point.x, point.y);
        context.strokeStyle = this.accent;
        context.lineWidth = 1;
        context.globalAlpha = signal.alpha * Math.sin(Math.PI * progress);
        context.stroke();
        const glow = context.createRadialGradient(point.x, point.y, 0, point.x, point.y, glowRadius);
        glow.addColorStop(0, "#ffffff");
        glow.addColorStop(0.18, this.accent);
        glow.addColorStop(1, "rgba(0,0,0,0)");
        context.fillStyle = glow;
        context.globalAlpha = signal.alpha * 0.62 * Math.sin(Math.PI * progress);
        context.fillRect(point.x - glowRadius, point.y - glowRadius, glowRadius * 2, glowRadius * 2);
      });

      this.particles.forEach((particle, index) => {
        const position = positions[index];
        const twinkle = staticFrame ? 0.82 : 0.66 + Math.sin(time * (0.00052 + particle.depth * 0.00031) + particle.phase) * 0.34;
        if (particle.accent || particle.beacon) {
          const haloRadius = particle.beacon ? 18 : 8 + particle.depth * 4;
          const halo = context.createRadialGradient(position.x, position.y, 0, position.x, position.y, haloRadius);
          halo.addColorStop(0, particle.beacon ? "#ffffff" : this.accent);
          halo.addColorStop(0.2, this.accent);
          halo.addColorStop(1, "rgba(0,0,0,0)");
          context.fillStyle = halo;
          context.globalAlpha = particle.alpha * twinkle * (particle.beacon ? 0.42 : 0.22);
          context.fillRect(position.x - haloRadius, position.y - haloRadius, haloRadius * 2, haloRadius * 2);
        }
        context.beginPath();
        context.arc(position.x, position.y, particle.radius, 0, Math.PI * 2);
        context.fillStyle = particle.accent ? this.accent : "#dce8f4";
        context.globalAlpha = particle.alpha * twinkle;
        context.fill();
        if (particle.beacon) {
          context.beginPath();
          context.moveTo(position.x - 4.5, position.y);
          context.lineTo(position.x + 4.5, position.y);
          context.moveTo(position.x, position.y - 4.5);
          context.lineTo(position.x, position.y + 4.5);
          context.strokeStyle = "#ffffff";
          context.lineWidth = 0.55;
          context.globalAlpha = particle.alpha * twinkle * 0.42;
          context.stroke();
        }
      });
      context.globalCompositeOperation = "source-over";
      context.restore();
      context.globalAlpha = 1;
    }
  }

  const topologyMap = document.querySelector("[data-authority-map]");
  const authorityTopology = topologyMap ? new AuthorityTopology(topologyMap) : null;
  const particleCanvas = document.querySelector("[data-particle-canvas]");
  const particleField = particleCanvas ? new ParticleField(particleCanvas) : null;

  const productObserver = new MutationObserver((mutations) => {
    if (!mutations.some((mutation) => mutation.attributeName === "data-product")) return;
    particleField?.refreshAccent();
    if (reducedMotionQuery.matches) particleField?.drawStatic();
    hero?.classList.remove("is-product-changing");
    window.requestAnimationFrame(() => {
      hero?.classList.add("is-product-changing");
      window.setTimeout(() => hero?.classList.remove("is-product-changing"), 680);
    });
  });
  productObserver.observe(root, { attributes: true, attributeFilter: ["data-product"] });

  const syncMotionPreference = () => {
    if (reducedMotionQuery.matches) {
      resetHeroPointer();
      particleField?.stop();
      particleField?.drawStatic();
    } else {
      particleField?.start();
    }
    authorityTopology?.syncPreference();
    updateProductCycleControls();
    scheduleProductCycle();
  };
  reducedMotionQuery.addEventListener?.("change", syncMotionPreference);

  if (isProductLanding) {
    const initialPreview = new URLSearchParams(window.location.search).get("preview");
    setProduct(products[initialPreview] ? initialPreview : "browser");
  }
  root.classList.add("motion-ready");
  syncMotionPreference();
})();
