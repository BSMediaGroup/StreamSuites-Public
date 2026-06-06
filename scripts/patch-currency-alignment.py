from pathlib import Path

css = Path(__file__).resolve().parents[1] / "css" / "public-shell.css"
t = css.read_text(encoding="utf-8")

old = """.market-item-lightbox-price .market-item-price-row {
  min-height: 44px;
  padding: 7px 13px;
}

.market-item-lightbox-price .market-item-price-icon {
  width: 1.2rem;
  height: 1.2rem;
  flex-basis: 1.2rem;
}

.market-item-lightbox-stat .economy-currency-amount-icon {
  width: 1.2rem;
  height: 1.2rem;
  flex-basis: 1.2rem;
}

.market-item-lightbox-price .market-item-price-value {
  font-size: 1.35rem;
}

.market-item-lightbox .market-item-price-row,
.market-item-lightbox .market-item-price-icon,
.market-item-lightbox .market-item-price-value,
.market-item-lightbox .economy-currency-amount,
.market-item-lightbox .economy-currency-amount-icon,
.market-item-lightbox .economy-currency-amount-value {
  color: #f8fbff;
}"""

new = """.market-item-lightbox-price .market-item-price-row {
  min-height: 44px;
  padding: 7px 13px;
  align-items: center;
  font-size: 1.35rem;
}

.market-item-lightbox-price .market-item-price-icon {
  width: 1.12em;
  height: 1.12em;
  flex: 0 0 1.12em;
}

.market-item-lightbox-price .market-item-price-value {
  font-size: 1em;
  line-height: 1;
}

.market-item-lightbox .economy-currency-amount {
  align-items: center;
  gap: 0.34em;
}

.market-item-lightbox .economy-currency-amount-icon {
  width: 1.12em;
  height: 1.12em;
  flex: 0 0 1.12em;
  transform: none;
}

.market-item-lightbox-stat strong .economy-currency-amount {
  font-size: 0.96rem;
}

.market-item-lightbox .market-item-price-row,
.market-item-lightbox .market-item-price-icon,
.market-item-lightbox .market-item-price-value,
.market-item-lightbox .economy-currency-amount,
.market-item-lightbox .economy-currency-amount-icon,
.market-item-lightbox .economy-currency-amount-value {
  color: #f8fbff;
}"""

if old not in t:
    raise SystemExit("css block missing")
css.write_text(t.replace(old, new, 1), encoding="utf-8")

tests = Path(__file__).resolve().parents[1] / "tests" / "public-authority-wiring.test.mjs"
tt = tests.read_text(encoding="utf-8")
tt = tt.replace(
    '  assert.match(css, /\\.market-item-lightbox-price \\.market-item-price-icon\\s*\\{[\\s\\S]*width:\\s*1\\.2rem/);\n  assert.match(css, /\\.market-item-lightbox-stat \\.economy-currency-amount-icon\\s*\\{[\\s\\S]*width:\\s*1\\.2rem/);',
    '  assert.match(css, /\\.market-item-lightbox-price \\.market-item-price-icon\\s*\\{[\\s\\S]*width:\\s*1\\.12em/);\n  assert.match(css, /\\.market-item-lightbox \\.economy-currency-amount\\s*\\{[\\s\\S]*align-items:\\s*center/);\n  assert.match(css, /\\.market-item-lightbox \\.economy-currency-amount-icon\\s*\\{[\\s\\S]*width:\\s*1\\.12em[\\s\\S]*transform:\\s*none/);',
    1,
)
tests.write_text(tt, encoding="utf-8")
print("fixed alignment")