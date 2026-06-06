from pathlib import Path

# === PUBLIC ===
app = Path(__file__).resolve().parents[1] / "js" / "public-pages-app.js"
t = app.read_text(encoding="utf-8")

t = t.replace(
    """  let publicItemCatalogTagIndex = null;
  let publicItemCatalogTagIndexPromise = null;

  const AUTH_PUBLIC_MARKET_EXCHANGE_URL""",
    """  let publicItemCatalogTagIndex = null;
  let publicItemCatalogTagIndexPromise = null;
  let publicMarketExchangeCatalogIndex = null;
  let publicMarketExchangeCatalogIndexPromise = null;

  const AUTH_PUBLIC_MARKET_EXCHANGE_URL""",
    1,
)

old_stats = """      const saleEnabled = economyItemMarketSaleEnabled(item);
      const exchangeEnabled = isEconomyExchangeCapableItem(item);
      const marketPrice = firstPresent(item.market_price_stekels, item.price, item.price_credits, definition.market_price_stekels);
      const exchangeValue = firstPresent(item.exchange_value_stekels, item.exchange_value, item.exchange_value_credits, definition.exchange_value);
      const priceNumber = Number(marketPrice);
      const exchangeNumber = Number(exchangeValue);
      const pushCurrencyStat = (labelText, numeric, unavailable = false) => {
        if (unavailable) {
          stats.push({ label: labelText, currency: true, unavailable: true });
          return;
        }
        if (!Number.isFinite(numeric)) return;
        stats.push({ label: labelText, rawValue: numeric, currency: true, value: formatNumber(numeric) });
      };
      if (!saleEnabled && exchangeEnabled) {
        pushCurrencyStat("Price", priceNumber, true);
      } else if (Number.isFinite(priceNumber)) {
        pushCurrencyStat("Price", priceNumber, false);
      }
      if (saleEnabled && !exchangeEnabled) {
        pushCurrencyStat("Exchange value", exchangeNumber, true);
      } else if (Number.isFinite(exchangeNumber)) {
        pushCurrencyStat("Exchange value", exchangeNumber, false);
      }"""

new_stats = """      const saleEnabled = economyItemMarketSaleEnabled(item);
      const exchangeEnabled = isEconomyExchangeCapableItem(item);
      const marketPrice = firstPresent(
        item.market_price_stekels,
        item.price,
        item.price_credits,
        definition.market_price_stekels,
        definition.market_price_credits
      );
      const exchangeValue = firstPresent(
        item.exchange_value_stekels,
        item.exchange_value,
        item.exchange_value_credits,
        definition.exchange_value_stekels,
        definition.exchange_value,
        definition.exchange_value_credits
      );
      const priceNumber = Number(marketPrice);
      const exchangeNumber = Number(exchangeValue);
      const pushCurrencyStat = (labelText, numeric, unavailable = false) => {
        if (unavailable) {
          stats.push({ label: labelText, currency: true, unavailable: true });
          return;
        }
        if (!Number.isFinite(numeric)) return;
        stats.push({ label: labelText, rawValue: numeric, currency: true, value: formatNumber(numeric) });
      };
      if (!saleEnabled) {
        pushCurrencyStat("Price", priceNumber, true);
      } else if (Number.isFinite(priceNumber)) {
        pushCurrencyStat("Price", priceNumber, false);
      }
      if (!exchangeEnabled) {
        pushCurrencyStat("Exchange value", exchangeNumber, true);
      } else if (Number.isFinite(exchangeNumber)) {
        pushCurrencyStat("Exchange value", exchangeNumber, false);
      }"""

if old_stats not in t:
    raise SystemExit("public stats block missing")
t = t.replace(old_stats, new_stats, 1)

old_sale = """  function economyItemMarketSaleEnabled(item = {}) {
    return item.can_buy !== false && item.purchasable !== false && item.market_enabled !== false;
  }"""

new_sale = """  function economyItemDefinition(item = {}) {
    return item.definition && typeof item.definition === "object" ? item.definition : {};
  }

  function economyItemMarketSaleEnabled(item = {}) {
    const definition = economyItemDefinition(item);
    const marketEnabled = firstPresent(item.market_enabled, definition.market_enabled);
    const canBuy = firstPresent(item.can_buy, definition.can_buy);
    const purchasable = firstPresent(item.purchasable, definition.purchasable);
    if (marketEnabled === false || canBuy === false || purchasable === false) return false;
    if (marketEnabled === true || canBuy === true || purchasable === true) return true;
    const marketPrice = Number(firstPresent(
      item.market_price_stekels,
      item.price,
      item.price_credits,
      definition.market_price_stekels,
      definition.market_price_credits
    ));
    return Number.isFinite(marketPrice) && marketPrice > 0;
  }"""

if old_sale not in t:
    raise SystemExit("public sale enabled block missing")
t = t.replace(old_sale, new_sale, 1)

old_ex = """  function isEconomyExchangeCapableItem(item = {}) {
    if (!item || typeof item !== "object") return false;
    if (item.can_exchange === false || item.exchange_enabled === false || item.exchangeable === false) return false;
    if (item.can_exchange === true || item.exchange_enabled === true || item.exchangeable === true) return true;
    if (Number(item.exchange_value_stekels ?? item.exchange_value_credits ?? item.exchange_value) > 0) return true;
    const exchangeInputs = item.exchange_inputs || item.exchange_input || item.input_items || item.required_exchange_items || item.exchange_requirements;
    const exchangeOutputs = item.exchange_outputs || item.exchange_output || item.output_items || item.grants;
    return Boolean(
      (Array.isArray(exchangeInputs) && exchangeInputs.length) ||
      (Array.isArray(exchangeOutputs) && exchangeOutputs.length) ||
      (exchangeInputs && typeof exchangeInputs === "object" && Object.keys(exchangeInputs).length) ||
      (exchangeOutputs && typeof exchangeOutputs === "object" && Object.keys(exchangeOutputs).length)
    );
  }"""

new_ex = """  function isEconomyExchangeCapableItem(item = {}) {
    if (!item || typeof item !== "object") return false;
    const definition = economyItemDefinition(item);
    const exchangeEnabled = firstPresent(item.exchange_enabled, definition.exchange_enabled);
    const canExchange = firstPresent(item.can_exchange, definition.can_exchange);
    const exchangeable = firstPresent(item.exchangeable, definition.exchangeable);
    if (exchangeEnabled === false || canExchange === false || exchangeable === false) return false;
    if (exchangeEnabled === true || canExchange === true || exchangeable === true) return true;
    const exchangeValue = Number(firstPresent(
      item.exchange_value_stekels,
      item.exchange_value_credits,
      item.exchange_value,
      definition.exchange_value_stekels,
      definition.exchange_value_credits,
      definition.exchange_value
    ));
    if (Number.isFinite(exchangeValue) && exchangeValue > 0) return true;
    const exchangeInputs = firstPresent(item.exchange_inputs, definition.exchange_inputs)
      || item.exchange_input
      || item.input_items
      || item.required_exchange_items
      || item.exchange_requirements
      || definition.exchange_input
      || definition.input_items
      || definition.required_exchange_items
      || definition.exchange_requirements;
    const exchangeOutputs = firstPresent(item.exchange_outputs, definition.exchange_outputs)
      || item.exchange_output
      || item.output_items
      || item.grants
      || definition.exchange_output
      || definition.output_items
      || definition.grants;
    return Boolean(
      (Array.isArray(exchangeInputs) && exchangeInputs.length) ||
      (Array.isArray(exchangeOutputs) && exchangeOutputs.length) ||
      (exchangeInputs && typeof exchangeInputs === "object" && Object.keys(exchangeInputs).length) ||
      (exchangeOutputs && typeof exchangeOutputs === "object" && Object.keys(exchangeOutputs).length)
    );
  }"""

if old_ex not in t:
    raise SystemExit("public exchange capable block missing")
t = t.replace(old_ex, new_ex, 1)

catalog_helpers = """
  async function ensurePublicMarketExchangeCatalogIndex() {
    if (publicMarketExchangeCatalogIndex instanceof Map) return publicMarketExchangeCatalogIndex;
    if (!publicMarketExchangeCatalogIndexPromise) {
      publicMarketExchangeCatalogIndexPromise = fetchPublicMarketExchange()
        .then((payload) => {
          publicMarketExchangeCatalogIndex = new Map();
          const append = (entry) => {
            const code = economyCatalogItemCode(entry);
            if (!code) return;
            const existing = publicMarketExchangeCatalogIndex.get(code);
            publicMarketExchangeCatalogIndex.set(code, existing ? { ...existing, ...entry } : { ...entry });
          };
          (Array.isArray(payload?.market) ? payload.market : []).forEach(append);
          (Array.isArray(payload?.exchange) ? payload.exchange : []).forEach(append);
          return publicMarketExchangeCatalogIndex;
        })
        .catch(() => {
          publicMarketExchangeCatalogIndex = new Map();
          return publicMarketExchangeCatalogIndex;
        });
    }
    return publicMarketExchangeCatalogIndexPromise;
  }

  function mergeEconomyCatalogListing(item = {}, catalogEntry = {}) {
    if (!catalogEntry || typeof catalogEntry !== "object" || !Object.keys(catalogEntry).length) return item;
    const definition = {
      ...(catalogEntry.definition && typeof catalogEntry.definition === "object" ? catalogEntry.definition : {}),
      ...(item.definition && typeof item.definition === "object" ? item.definition : {})
    };
    return {
      ...catalogEntry,
      ...item,
      definition,
      market_price_stekels: firstPresent(item.market_price_stekels, catalogEntry.market_price_stekels, definition.market_price_stekels),
      exchange_value_stekels: firstPresent(item.exchange_value_stekels, catalogEntry.exchange_value_stekels, definition.exchange_value_stekels),
      market_enabled: firstPresent(item.market_enabled, catalogEntry.market_enabled, definition.market_enabled),
      exchange_enabled: firstPresent(item.exchange_enabled, catalogEntry.exchange_enabled, definition.exchange_enabled),
      can_buy: firstPresent(item.can_buy, catalogEntry.can_buy, definition.can_buy),
      can_exchange: firstPresent(item.can_exchange, catalogEntry.can_exchange, definition.can_exchange),
      purchasable: firstPresent(item.purchasable, catalogEntry.purchasable, definition.purchasable),
      quantity: firstPresent(item.quantity, item.count, item.held_quantity),
      count: firstPresent(item.count, item.quantity),
      held_quantity: firstPresent(item.held_quantity, item.quantity)
    };
  }
"""

marker = "  function mergeEconomyItemTagIndexes(...indexes) {"
if "ensurePublicMarketExchangeCatalogIndex" not in t:
    t = t.replace(marker, catalog_helpers + marker, 1)

old_hydrate = """  function hydrateEconomyCatalogItemForLightbox(item = {}, options = {}) {
    const tagIndex = mergeEconomyItemTagIndexes(
      publicItemCatalogTagIndex,
      buildEconomyItemTagIndex(options.catalogPayload || {})
    );
    return enrichEconomyCatalogItem(item, tagIndex);
  }"""

new_hydrate = """  function hydrateEconomyCatalogItemForLightbox(item = {}, options = {}) {
    const tagIndex = mergeEconomyItemTagIndexes(
      publicItemCatalogTagIndex,
      buildEconomyItemTagIndex(options.catalogPayload || {})
    );
    let hydrated = enrichEconomyCatalogItem(item, tagIndex);
    const code = economyCatalogItemCode(hydrated);
    const catalogEntry = publicMarketExchangeCatalogIndex instanceof Map && code
      ? publicMarketExchangeCatalogIndex.get(code)
      : null;
    if (catalogEntry) hydrated = mergeEconomyCatalogListing(hydrated, catalogEntry);
    return hydrated;
  }"""

if old_hydrate not in t:
    raise SystemExit("public hydrate block missing")
t = t.replace(old_hydrate, new_hydrate, 1)

old_open = """  function openEconomyItemLightbox(item = {}, options = {}, sourceElement = null) {
    const rawNavigationItems = Array.isArray(options.navigationItems) ? options.navigationItems.filter(Boolean) : [];"""

new_open = """  function openEconomyItemLightbox(item = {}, options = {}, sourceElement = null) {
    const launchLightbox = () => openEconomyItemLightboxReady(item, options, sourceElement);
    Promise.all([
      ensurePublicItemCatalogTagIndex().catch(() => null),
      ensurePublicMarketExchangeCatalogIndex().catch(() => null)
    ]).then(launchLightbox).catch((error) => {
      console.error("Failed to preload economy catalog for item lightbox.", error);
      launchLightbox();
    });
  }

  function openEconomyItemLightboxReady(item = {}, options = {}, sourceElement = null) {
    const rawNavigationItems = Array.isArray(options.navigationItems) ? options.navigationItems.filter(Boolean) : [];"""

if old_open not in t:
    raise SystemExit("public open lightbox block missing")
t = t.replace(old_open, new_open, 1)

app.write_text(t, encoding="utf-8")
print("public patched")

# === DASHBOARD ===
eco = Path(r"C:\NEPTUNE LOCAL\GIT\StreamSuites-Dashboard\docs\js\economy.js")
d = eco.read_text(encoding="utf-8")

old_model = """    const stats = [];
    const addStat = (label, value) => {
      const formatted = detailValue(value);
      if (formatted) {
        const rawNumber = Number(value);
        stats.push({
          label,
          value: formatted,
          currency: isEconomyDetailCurrencyLabel(label) && Number.isFinite(rawNumber),
          rawValue: rawNumber
        });
      }
    };
    addStat(kind === "wallet" ? "Count" : "Held", firstPresent(item.count, item.quantity, item.held_quantity));
    addStat("Balance / value", firstPresent(item.value_total_credits, item.balance_total_credits, item.balance_current, item.value_in_credits));
    addStat("Market price", firstPresent(item.market_price_stekels, item.market_price_credits, item.price));
    addStat("Exchange value", firstPresent(item.exchange_value_stekels, item.exchange_value_credits, item.exchange_value));
    addStat("Stock", item.unlimited_stock ? "Unlimited" : firstPresent(item.stock, item.stock_limit, item.max_quantity, item.purchase_limit));"""

new_model = """    const stats = [];
    const addStat = (label, value) => {
      const formatted = detailValue(value);
      if (formatted) {
        const rawNumber = Number(value);
        stats.push({
          label,
          value: formatted,
          currency: isEconomyDetailCurrencyLabel(label) && Number.isFinite(rawNumber),
          rawValue: rawNumber
        });
      }
    };
    const pushCurrencyStat = (label, numeric, unavailable = false) => {
      if (unavailable) {
        stats.push({ label, currency: true, unavailable: true, rawValue: 0, value: "N/A" });
        return;
      }
      if (!Number.isFinite(numeric)) return;
      stats.push({ label, currency: true, rawValue: numeric, value: formatNumber(numeric) });
    };
    const saleEnabled = economyDetailMarketSaleEnabled(item, definition);
    const exchangeCapable = economyDetailExchangeEnabled(item, definition);
    const marketPrice = Number(firstPresent(
      item.market_price_stekels,
      item.market_price_credits,
      item.price,
      definition.market_price_stekels,
      definition.market_price_credits
    ));
    const exchangeValueAmount = Number(firstPresent(
      item.exchange_value_stekels,
      item.exchange_value_credits,
      item.exchange_value,
      definition.exchange_value_stekels,
      definition.exchange_value_credits,
      definition.exchange_value
    ));
    addStat(kind === "wallet" ? "Count" : "Held", firstPresent(item.count, item.quantity, item.held_quantity));
    addStat("Balance / value", firstPresent(item.value_total_credits, item.balance_total_credits, item.balance_current, item.value_in_credits));
    if (kind !== "wallet") {
      if (!saleEnabled) pushCurrencyStat("Price", marketPrice, true);
      else if (Number.isFinite(marketPrice)) pushCurrencyStat("Price", marketPrice, false);
      if (!exchangeCapable) pushCurrencyStat("Exchange value", exchangeValueAmount, true);
      else if (Number.isFinite(exchangeValueAmount)) pushCurrencyStat("Exchange value", exchangeValueAmount, false);
    }
    addStat("Stock", item.unlimited_stock ? "Unlimited" : firstPresent(item.stock, item.stock_limit, item.max_quantity, item.purchase_limit));"""

if old_model not in d:
    raise SystemExit("dashboard model block missing")
d = d.replace(old_model, new_model, 1)

old_cur = """  function renderItemDetailCurrencyAmount(value) {
    return `<span class="ss-economy-detail-currency">${renderCurrencySymbol({ compact: true })}<span>${escapeHtml(formatNumber(value))}</span></span>`;
  }"""

new_cur = """  function economyDetailMarketSaleEnabled(item = {}, definition = {}) {
    const def = definition && typeof definition === "object" ? definition : {};
    const marketEnabledValue = firstPresent(item.market_enabled, def.market_enabled);
    const canBuy = firstPresent(item.can_buy, def.can_buy);
    const purchasable = firstPresent(item.purchasable, def.purchasable);
    if (marketEnabledValue === false || canBuy === false || purchasable === false) return false;
    if (marketEnabledValue === true || canBuy === true || purchasable === true) return true;
    const marketPrice = Number(firstPresent(
      item.market_price_stekels,
      item.market_price_credits,
      item.price,
      def.market_price_stekels,
      def.market_price_credits
    ));
    return Number.isFinite(marketPrice) && marketPrice > 0;
  }

  function economyDetailExchangeEnabled(item = {}, definition = {}) {
    const def = definition && typeof definition === "object" ? definition : {};
    const exchangeEnabledValue = firstPresent(item.exchange_enabled, def.exchange_enabled);
    const canExchange = firstPresent(item.can_exchange, def.can_exchange);
    const exchangeable = firstPresent(item.exchangeable, def.exchangeable);
    if (exchangeEnabledValue === false || canExchange === false || exchangeable === false) return false;
    if (exchangeEnabledValue === true || canExchange === true || exchangeable === true) return true;
    const exchangeValueAmount = Number(firstPresent(
      item.exchange_value_stekels,
      item.exchange_value_credits,
      item.exchange_value,
      def.exchange_value_stekels,
      def.exchange_value_credits,
      def.exchange_value
    ));
    return Number.isFinite(exchangeValueAmount) && exchangeValueAmount > 0;
  }

  function renderItemDetailCurrencyAmount(value, options = {}) {
    if (options.unavailable) {
      return `<span class="ss-economy-detail-currency is-unavailable-value">${renderCurrencySymbol({ compact: true })}<span>N/A</span></span>`;
    }
    return `<span class="ss-economy-detail-currency">${renderCurrencySymbol({ compact: true })}<span>${escapeHtml(formatNumber(value))}</span></span>`;
  }"""

if old_cur not in d:
    raise SystemExit("dashboard currency block missing")
d = d.replace(old_cur, new_cur, 1)

d = d.replace(
    "renderItemDetailCurrencyAmount(stat.rawValue)",
    "renderItemDetailCurrencyAmount(stat.rawValue, { unavailable: stat.unavailable })",
    1,
)

eco.write_text(d, encoding="utf-8")
print("dashboard patched")