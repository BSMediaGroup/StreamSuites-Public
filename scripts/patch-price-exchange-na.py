from pathlib import Path

root = Path(__file__).resolve().parents[1]
app = root / "js" / "public-pages-app.js"
css = root / "css" / "public-shell.css"
t = app.read_text(encoding="utf-8")

replacements = [
    (
        """  function buildEconomyCurrencyAmount(value, options = {}) {
    const wrap = create("span", "economy-currency-amount");
    const icon = create("span", "economy-currency-amount-icon");
    icon.style.setProperty("--economy-currency-symbol", `url("${economyAssetPath(ECONOMY_CURRENCY_SYMBOL_PATH)}")`);
    icon.setAttribute("aria-hidden", "true");
    wrap.append(icon, create("span", "economy-currency-amount-value", formatNumber(value)));
    if (options.currency) wrap.appendChild(create("span", "economy-currency-amount-label", options.currency));
    return wrap;
  }""",
        """  function buildEconomyCurrencyAmount(value, options = {}) {
    const wrap = create("span", "economy-currency-amount");
    const icon = create("span", "economy-currency-amount-icon");
    icon.style.setProperty("--economy-currency-symbol", `url("${economyAssetPath(ECONOMY_CURRENCY_SYMBOL_PATH)}")`);
    icon.setAttribute("aria-hidden", "true");
    if (options.unavailable) wrap.classList.add("is-unavailable-value");
    wrap.append(icon, create("span", "economy-currency-amount-value", options.unavailable ? "N/A" : formatNumber(value)));
    if (options.currency) wrap.appendChild(create("span", "economy-currency-amount-label", options.currency));
    return wrap;
  }""",
    ),
    (
        """    addStat("Unit value", firstPresent(item.unit_value, item.value_in_credits, item.currency_value, definition.currency_value), { currency: true });
    addStat("Exchange value", firstPresent(item.exchange_value_stekels, item.exchange_value, item.exchange_value_credits, definition.exchange_value), { currency: true });
    addStat("Price", firstPresent(item.market_price_stekels, item.price, item.price_credits, definition.market_price_stekels), { currency: true });
    addStat("Stock", item.unlimited_stock ? "Unlimited" : firstPresent(item.stock, item.stock_limit, item.max_quantity, item.purchase_limit));""",
        """    addStat("Unit value", firstPresent(item.unit_value, item.value_in_credits, item.currency_value, definition.currency_value), { currency: true });
    if (kind !== "wallet") {
      const saleEnabled = economyItemMarketSaleEnabled(item);
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
      }
    }
    addStat("Stock", item.unlimited_stock ? "Unlimited" : firstPresent(item.stock, item.stock_limit, item.max_quantity, item.purchase_limit));""",
    ),
    (
        """        const value = stat.currency && Number.isFinite(Number(stat.rawValue))
          ? buildEconomyCurrencyAmount(Number(stat.rawValue))
          : stat.value;""",
        """        const value = stat.currency
          ? (stat.unavailable
            ? buildEconomyCurrencyAmount(0, { unavailable: true })
            : Number.isFinite(Number(stat.rawValue))
              ? buildEconomyCurrencyAmount(Number(stat.rawValue))
              : stat.value)
          : stat.value;""",
    ),
    (
        """  function economyItemSoldOut(item = {}) {
    if (item.sold_out === true || item.is_sold_out === true) return true;""",
        """  function economyItemMarketSaleEnabled(item = {}) {
    return item.can_buy !== false && item.purchasable !== false && item.market_enabled !== false;
  }

  function economyItemSoldOut(item = {}) {
    if (item.sold_out === true || item.is_sold_out === true) return true;""",
    ),
]

for old, new in replacements:
    if old not in t:
        raise SystemExit(f"missing js block: {old[:70]}")
    t = t.replace(old, new, 1)

app.write_text(t, encoding="utf-8")

c = css.read_text(encoding="utf-8")
css_old = """.market-item-lightbox-price .market-item-price-icon {
  width: 22px;
  height: 22px;
  flex-basis: 22px;
}"""
css_new = """.market-item-lightbox-price .market-item-price-icon {
  width: 1.2rem;
  height: 1.2rem;
  flex-basis: 1.2rem;
}

.market-item-lightbox-stat .economy-currency-amount-icon {
  width: 1.2rem;
  height: 1.2rem;
  flex-basis: 1.2rem;
}"""
if css_old not in c:
    raise SystemExit("missing css block")
css.write_text(c.replace(css_old, css_new, 1), encoding="utf-8")
print("patched")