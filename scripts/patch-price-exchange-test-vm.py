from pathlib import Path

p = Path(__file__).resolve().parents[1] / "tests" / "public-authority-wiring.test.mjs"
t = p.read_text(encoding="utf-8")

old1 = """    economyItemAvailabilityLabel(item = {}) {
      return String(item.availability || "").trim();
    },
    create() {
      return { append() {} };
    }
  };"""

new1 = """    economyItemAvailabilityLabel(item = {}) {
      return String(item.availability || "").trim();
    },
    economyItemMarketSaleEnabled(item = {}) {
      return item.can_buy !== false && item.purchasable !== false && item.market_enabled !== false;
    },
    isEconomyExchangeCapableItem(item = {}) {
      if (item.can_exchange === false || item.exchange_enabled === false || item.exchangeable === false) return false;
      return item.can_exchange === true || item.exchange_enabled === true || item.exchangeable === true || Number(item.exchange_value_stekels || 0) > 0;
    },
    create() {
      return { append() {} };
    }
  };"""

old2 = """  assert.ok(marketDetail.stats.some((row) => row.label === "Price" && row.currency === true));

  const fallbackDetail = context.fallbackEconomyItemLightboxData({ item_code: "fallback.item" }, { kind: "inventory" });"""

new2 = """  assert.ok(marketDetail.stats.some((row) => row.label === "Price" && row.currency === true));

  const saleOnlyDetail = context.normalizeEconomyItemLightboxData({
    item_code: "material.brick",
    market_price_stekels: 12,
    market_enabled: true,
    can_buy: true,
    can_exchange: false,
    exchange_enabled: false,
    exchange_value_stekels: 0
  }, { kind: "market", actionLabel: "Buy" });
  assert.ok(saleOnlyDetail.stats.some((row) => row.label === "Exchange value" && row.unavailable === true));

  const exchangeOnlyDetail = context.normalizeEconomyItemLightboxData({
    item_code: "currency.gem.green",
    exchange_value_stekels: 50,
    can_exchange: true,
    exchange_enabled: true,
    market_enabled: false,
    can_buy: false,
    market_price_stekels: 0
  }, { kind: "market", actionLabel: "Exchange" });
  assert.ok(exchangeOnlyDetail.stats.some((row) => row.label === "Price" && row.unavailable === true));

  const fallbackDetail = context.fallbackEconomyItemLightboxData({ item_code: "fallback.item" }, { kind: "inventory" });"""

for old, new in [(old1, new1), (old2, new2)]:
    if old not in t:
        raise SystemExit("block missing")
    t = t.replace(old, new, 1)

p.write_text(t, encoding="utf-8")
print("vm test ok")