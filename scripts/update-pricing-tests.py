from pathlib import Path

p = Path(__file__).resolve().parents[1] / "tests" / "public-authority-wiring.test.mjs"
t = p.read_text(encoding="utf-8")

old = """    economyItemMarketSaleEnabled(item = {}) {
      return item.can_buy !== false && item.purchasable !== false && item.market_enabled !== false;
    },
    isEconomyExchangeCapableItem(item = {}) {
      if (item.can_exchange === false || item.exchange_enabled === false || item.exchangeable === false) return false;
      return item.can_exchange === true || item.exchange_enabled === true || item.exchangeable === true || Number(item.exchange_value_stekels || 0) > 0;
    },"""

new = """    economyItemDefinition(item = {}) {
      return item.definition && typeof item.definition === "object" ? item.definition : {};
    },
    economyItemMarketSaleEnabled(item = {}) {
      const definition = context.economyItemDefinition(item);
      const marketEnabled = item.market_enabled ?? definition.market_enabled;
      const canBuy = item.can_buy ?? definition.can_buy;
      const purchasable = item.purchasable ?? definition.purchasable;
      if (marketEnabled === false || canBuy === false || purchasable === false) return false;
      if (marketEnabled === true || canBuy === true || purchasable === true) return true;
      const marketPrice = Number(item.market_price_stekels ?? item.price ?? definition.market_price_stekels ?? 0);
      return Number.isFinite(marketPrice) && marketPrice > 0;
    },
    isEconomyExchangeCapableItem(item = {}) {
      const definition = context.economyItemDefinition(item);
      const exchangeEnabled = item.exchange_enabled ?? definition.exchange_enabled;
      const canExchange = item.can_exchange ?? definition.can_exchange;
      const exchangeable = item.exchangeable ?? definition.exchangeable;
      if (exchangeEnabled === false || canExchange === false || exchangeable === false) return false;
      if (exchangeEnabled === true || canExchange === true || exchangeable === true) return true;
      const exchangeValue = Number(item.exchange_value_stekels ?? item.exchange_value ?? definition.exchange_value_stekels ?? definition.exchange_value ?? 0);
      return Number.isFinite(exchangeValue) && exchangeValue > 0;
    },"""

if old not in t:
    raise SystemExit("mock block missing")
t = t.replace(old, new, 1)

insert_after = """  assert.ok(exchangeOnlyDetail.stats.some((row) => row.label === "Price" && row.unavailable === true));

  const fallbackDetail"""

insert = """  assert.ok(exchangeOnlyDetail.stats.some((row) => row.label === "Price" && row.unavailable === true));

  const profileInventoryPricing = context.normalizeEconomyItemLightboxData({
    item_code: "vehicle.limo",
    quantity: 3,
    definition: {
      label: "Limo",
      market_price_stekels: 1200,
      market_enabled: true,
      exchange_enabled: false,
      exchange_value_stekels: 0
    }
  }, { kind: "inventory" });
  assert.ok(profileInventoryPricing.stats.some((row) => row.label === "Price" && row.rawValue === 1200));
  assert.ok(profileInventoryPricing.stats.some((row) => row.label === "Exchange value" && row.unavailable === true));

  const profileExchangeOnlyPricing = context.normalizeEconomyItemLightboxData({
    item_code: "currency.gem.green",
    quantity: 2,
    definition: {
      exchange_value_stekels: 50,
      exchange_enabled: true,
      market_enabled: false,
      market_price_stekels: 0
    }
  }, { kind: "inventory" });
  assert.ok(profileExchangeOnlyPricing.stats.some((row) => row.label === "Price" && row.unavailable === true));
  assert.ok(profileExchangeOnlyPricing.stats.some((row) => row.label === "Exchange value" && row.rawValue === 50));

  const fallbackDetail"""

if insert_after not in t:
    raise SystemExit("insert point missing")
t = t.replace(insert_after, insert, 1)
p.write_text(t, encoding="utf-8")
print("tests updated")