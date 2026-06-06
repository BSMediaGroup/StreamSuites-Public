from pathlib import Path

p = Path(__file__).resolve().parents[1] / "tests" / "public-authority-wiring.test.mjs"
t = p.read_text(encoding="utf-8")

insertions = [
    (
        '  assert.match(app, /detail\\.stats\\.forEach/);\n',
        '  assert.match(app, /function economyItemMarketSaleEnabled\\(/);\n  assert.match(app, /stat\\.unavailable[\\s\\S]*buildEconomyCurrencyAmount\\(0, \\{ unavailable: true \\}\\)/);\n  assert.match(app, /options\\.unavailable \\? "N\\/A" : formatNumber\\(value\\)/);\n  assert.match(app, /pushCurrencyStat\\("Price", priceNumber, true\\)/);\n  assert.match(app, /pushCurrencyStat\\("Exchange value", exchangeNumber, true\\)/);\n',
    ),
    (
        '  assert.match(css, /\\.market-item-lightbox-price/);\n',
        '  assert.match(css, /\\.market-item-lightbox-price \\.market-item-price-icon\\s*\\{[\\s\\S]*width:\\s*1\\.2rem/);\n  assert.match(css, /\\.market-item-lightbox-stat \\.economy-currency-amount-icon\\s*\\{[\\s\\S]*width:\\s*1\\.2rem/);\n',
    ),
]

for needle, insert in insertions:
    if insert.strip().split("\n")[0].replace("  assert.match", "") not in t:
        if needle not in t:
            raise SystemExit(f"needle missing: {needle}")
        t = t.replace(needle, insert, 1)

# update old stat render assertion if present
t = t.replace(
    '  assert.match(app, /buildEconomyCurrencyAmount\\(Number\\(stat\\.rawValue\\)\\)/);',
    '  assert.match(app, /stat\\.unavailable[\\s\\S]*buildEconomyCurrencyAmount\\(0, \\{ unavailable: true \\}\\)/);',
    1,
)

p.write_text(t, encoding="utf-8")
print("tests ok")