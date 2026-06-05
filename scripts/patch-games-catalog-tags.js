#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

const appPath = path.join(__dirname, "..", "js", "public-pages-app.js");
let text = fs.readFileSync(appPath, "utf8");

const constantInsert = `  const PUBLIC_ITEM_CATALOG_TAGS_URL = "/assets/data/public-item-catalog-tags.json";
  let publicItemCatalogTagIndex = null;
  let publicItemCatalogTagIndexPromise = null;

`;

if (!text.includes("PUBLIC_ITEM_CATALOG_TAGS_URL")) {
  text = text.replace(
    "  const AUTH_PUBLIC_MARKET_EXCHANGE_URL = ",
    constantInsert + "  const AUTH_PUBLIC_MARKET_EXCHANGE_URL = "
  );
}

const helperBlock = `  async function ensurePublicItemCatalogTagIndex() {
    if (publicItemCatalogTagIndex instanceof Map) return publicItemCatalogTagIndex;
    if (!publicItemCatalogTagIndexPromise) {
      publicItemCatalogTagIndexPromise = fetch(PUBLIC_ITEM_CATALOG_TAGS_URL, { cache: "no-store" })
        .then((response) => (response.ok ? response.json() : {}))
        .catch(() => ({}))
        .then((payload) => {
          publicItemCatalogTagIndex = new Map();
          Object.entries(payload || {}).forEach(([itemCode, tags]) => {
            const code = String(itemCode || "").trim();
            if (!code || !Array.isArray(tags) || !tags.length) return;
            publicItemCatalogTagIndex.set(code, {
              tags,
              definition: { item_code: code, tags }
            });
          });
          return publicItemCatalogTagIndex;
        });
    }
    return publicItemCatalogTagIndexPromise;
  }

  function mergeEconomyItemTagIndexes(...indexes) {
    const merged = new Map();
    indexes.forEach((index) => {
      if (!(index instanceof Map)) return;
      index.forEach((value, key) => {
        const existing = merged.get(key) || { tags: [], definition: {} };
        const tags = Array.isArray(value?.tags) && value.tags.length ? value.tags : existing.tags;
        merged.set(key, {
          tags,
          definition: {
            ...existing.definition,
            ...(value?.definition && typeof value.definition === "object" ? value.definition : {}),
            item_code: key,
            tags
          }
        });
      });
    });
    return merged;
  }

  function economyCatalogItemCode(item = {}) {
    return String(item?.item_code || item?.asset_code || item?.denomination_code || "").trim();
  }

  function findEconomyCatalogNavigationIndex(items = [], item = {}) {
    const code = economyCatalogItemCode(item);
    if (!code) return items.indexOf(item);
    const byCode = items.findIndex((entry) => economyCatalogItemCode(entry) === code);
    return byCode >= 0 ? byCode : items.indexOf(item);
  }

  function hydrateEconomyCatalogItemForLightbox(item = {}, options = {}) {
    const tagIndex = mergeEconomyItemTagIndexes(
      publicItemCatalogTagIndex,
      buildEconomyItemTagIndex(options.catalogPayload || {})
    );
    return enrichEconomyCatalogItem(item, tagIndex);
  }

`;

if (!text.includes("function ensurePublicItemCatalogTagIndex")) {
  text = text.replace(
    "  function buildEconomyItemTagIndex(payload = {}) {",
    helperBlock + "  function buildEconomyItemTagIndex(payload = {}) {"
  );
}

text = text.replace(
`  function buildEconomyItemTagIndex(payload = {}) {
    const index = new Map();
    (Array.isArray(payload?.inventory) ? payload.inventory : []).forEach((entry) => {
      const code = String(entry?.item_code || entry?.asset_code || "").trim();
      if (!code) return;
      const definition = entry?.definition && typeof entry.definition === "object" ? entry.definition : {};
      const tags = Array.isArray(entry?.tags) && entry.tags.length
        ? entry.tags
        : Array.isArray(definition?.tags) ? definition.tags : [];
      if (!tags.length) return;
      index.set(code, { tags, definition });
    });
    return index;
  }`,
`  function buildEconomyItemTagIndex(payload = {}) {
    const index = new Map();
    const add = (code, tags, definition = {}) => {
      const key = String(code || "").trim();
      if (!key || !Array.isArray(tags) || !tags.length) return;
      index.set(key, {
        tags,
        definition: {
          ...(definition && typeof definition === "object" ? definition : {}),
          item_code: key,
          tags
        }
      });
    };
    const ingest = (entry) => {
      if (!entry || typeof entry !== "object") return;
      const code = entry.item_code || entry.asset_code || entry.denomination_code;
      const definition = entry.definition && typeof entry.definition === "object" ? entry.definition : {};
      const tags = Array.isArray(entry.tags) && entry.tags.length
        ? entry.tags
        : Array.isArray(definition.tags) ? definition.tags : [];
      if (tags.length) add(code, tags, definition);
    };
    ["inventory", "market", "exchange"].forEach((bucket) => {
      (Array.isArray(payload?.[bucket]) ? payload[bucket] : []).forEach(ingest);
    });
    return index;
  }`
);

text = text.replace(
`  function enrichEconomyCatalogItems(items = [], payload = {}) {
    const tagIndex = buildEconomyItemTagIndex(payload);
    return (Array.isArray(items) ? items : []).map((item) => enrichEconomyCatalogItem(item, tagIndex));
  }`,
`  function enrichEconomyCatalogItems(items = [], payload = {}) {
    const tagIndex = mergeEconomyItemTagIndexes(publicItemCatalogTagIndex, buildEconomyItemTagIndex(payload));
    return (Array.isArray(items) ? items : []).map((item) => enrichEconomyCatalogItem(item, tagIndex));
  }`
);

text = text.replace(
`  function openEconomyItemLightbox(item = {}, options = {}, sourceElement = null) {
    const navigationItems = Array.isArray(options.navigationItems) ? options.navigationItems.filter(Boolean) : [];
    let currentItem = item || {};
    let currentIndex = Number.isFinite(Number(options.navigationIndex)) ? Number(options.navigationIndex) : navigationItems.indexOf(currentItem);
    if (currentIndex < 0 && navigationItems.length) {
      const currentCode = String(currentItem.item_code || currentItem.asset_code || currentItem.denomination_code || "").trim();
      currentIndex = navigationItems.findIndex((entry) => String(entry?.item_code || entry?.asset_code || entry?.denomination_code || "").trim() === currentCode);
    }`,
`  function openEconomyItemLightbox(item = {}, options = {}, sourceElement = null) {
    const rawNavigationItems = Array.isArray(options.navigationItems) ? options.navigationItems.filter(Boolean) : [];
    const navigationItems = rawNavigationItems.map((entry) => hydrateEconomyCatalogItemForLightbox(entry, options));
    let currentItem = hydrateEconomyCatalogItemForLightbox(item || {}, options);
    let currentIndex = Number.isFinite(Number(options.navigationIndex))
      ? Number(options.navigationIndex)
      : findEconomyCatalogNavigationIndex(rawNavigationItems, item);
    if (currentIndex < 0 && navigationItems.length) {
      currentIndex = findEconomyCatalogNavigationIndex(navigationItems, currentItem);
    }`
);

text = text.replace(
`      currentItem = navigationItems[currentIndex] || currentItem || {};
      const itemOptions = economyItemEffectiveOptions(currentItem, options);`,
`      currentItem = hydrateEconomyCatalogItemForLightbox(navigationItems[currentIndex] || currentItem || {}, options);
      const itemOptions = economyItemEffectiveOptions(currentItem, options);`
);

text = text.replace(
`    const navigationItems = Array.isArray(options.navigationItems) ? options.navigationItems : [];
    const navigationIndex = navigationItems.indexOf(item);
    trigger.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      openMarketItemLightbox(item, { ...options, navigationItems, navigationIndex }, trigger);`,
`    const navigationItems = Array.isArray(options.navigationItems) ? options.navigationItems : [];
    const navigationIndex = findEconomyCatalogNavigationIndex(navigationItems, item);
    const lightboxItem = hydrateEconomyCatalogItemForLightbox(item, options);
    trigger.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      openMarketItemLightbox(lightboxItem, { ...options, navigationItems, navigationIndex }, trigger);`
);

text = text.replace(
`        openMarketItemLightbox(item, { ...options, navigationItems, navigationIndex }, trigger);`,
`        openMarketItemLightbox(lightboxItem, { ...options, navigationItems, navigationIndex }, trigger);`
);

const gamesRenderNeedle = `      renderMarketExchangeSection({
        host: exchangeSection,
        title: "Exchange",
        subtitle: "Convert eligible held items into Stekels",
        items: exchangeItems,`;
if (!text.includes("catalogPayload: payload")) {
  text = text.replace(gamesRenderNeedle, gamesRenderNeedle.replace("items: exchangeItems,", "items: exchangeItems,\n        catalogPayload: payload,"));
  text = text.replace(
`        items: buildGamesStorefrontItems(payload),
        authReady: Boolean(payload?.authenticated),
        actionLabel: "Buy",`,
`        items: buildGamesStorefrontItems(payload),
        catalogPayload: payload,
        authReady: Boolean(payload?.authenticated),
        actionLabel: "Buy",`
  );
  text = text.replace(
`        items: enrichEconomyCatalogItems(payload?.exchange || [], payload),
        authReady: Boolean(payload?.authenticated),
        actionLabel: "Exchange",`,
`        items: enrichEconomyCatalogItems(payload?.exchange || [], payload),
        catalogPayload: payload,
        authReady: Boolean(payload?.authenticated),
        actionLabel: "Exchange",`
  );
  text = text.replace(
`        items: enrichEconomyCatalogItems(payload?.market || [], payload),
        authReady: Boolean(payload?.authenticated),
        actionLabel: "Buy",`,
`        items: enrichEconomyCatalogItems(payload?.market || [], payload),
        catalogPayload: payload,
        authReady: Boolean(payload?.authenticated),
        actionLabel: "Buy",`
  );
}

text = text.replace(
`    const load = async () => {
      try {
        if (gamesState.payload && gamesState.authReady === authReady) {
          renderPayload(gamesState.payload);
          return;
        }
        const payload = await fetchPublicMarketExchange();
        renderPayload(payload);`,
`    const load = async () => {
      try {
        await ensurePublicItemCatalogTagIndex();
        if (gamesState.payload && gamesState.authReady === authReady) {
          renderPayload(gamesState.payload);
          return;
        }
        const payload = await fetchPublicMarketExchange();
        renderPayload(payload);`
);

text = text.replace(
`    const load = async () => {
      try {
        const payload = await fetchPublicMarketExchange();
        renderPayload(payload);
      } catch (error) {
        status.textContent = error instanceof Error ? error.message : "Market & Exchange is unavailable right now.";`,
`    const load = async () => {
      try {
        await ensurePublicItemCatalogTagIndex();
        const payload = await fetchPublicMarketExchange();
        renderPayload(payload);
      } catch (error) {
        status.textContent = error instanceof Error ? error.message : "Market & Exchange is unavailable right now.";`
);

fs.writeFileSync(appPath, text, "utf8");
console.log("patched public-pages-app.js");