from pathlib import Path

p = Path(__file__).resolve().parents[1] / "tests" / "public-authority-wiring.test.mjs"
t = p.read_text(encoding="utf-8")
needle = '  assert.match(app, /return enrichEconomyCatalogItems\\(\\[\\.\\.\\.market, \\.\\.\\.exchangeOnly\\], payload\\)/);\n'
insert = needle + """  assert.match(app, /PUBLIC_ITEM_CATALOG_TAGS_URL = "\\/assets\\/data\\/public-item-catalog-tags\\.json"/);
  assert.match(app, /function ensurePublicItemCatalogTagIndex\\(/);
  assert.match(app, /function hydrateEconomyCatalogItemForLightbox\\(/);
  assert.match(app, /catalogPayload: payload/);
  assert.match(app, /hydrateEconomyCatalogItemForLightbox\\(navigationItems\\[currentIndex\\]/);
"""
if "PUBLIC_ITEM_CATALOG_TAGS_URL" not in t:
    if needle not in t:
        raise SystemExit("needle missing")
    t = t.replace(needle, insert, 1)
    p.write_text(t, encoding="utf-8")
print("tests ok")