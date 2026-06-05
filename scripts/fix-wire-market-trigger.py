from pathlib import Path

p = Path(__file__).resolve().parents[1] / "js" / "public-pages-app.js"
t = p.read_text(encoding="utf-8")
old = """  function wireMarketItemDetailsTrigger(trigger, item = {}, options = {}) {
    trigger.dataset.marketItemDetailsTrigger = "";
    const navigationItems = Array.isArray(options.navigationItems) ? options.navigationItems : [];
    const navigationIndex = navigationItems.indexOf(item);
    trigger.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      openMarketItemLightbox(item, { ...options, navigationItems, navigationIndex }, trigger);
    });
    trigger.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openMarketItemLightbox(lightboxItem, { ...options, navigationItems, navigationIndex }, trigger);
      }
    });
  }"""
new = """  function wireMarketItemDetailsTrigger(trigger, item = {}, options = {}) {
    trigger.dataset.marketItemDetailsTrigger = "";
    const navigationItems = Array.isArray(options.navigationItems) ? options.navigationItems : [];
    const navigationIndex = findEconomyCatalogNavigationIndex(navigationItems, item);
    const openDetails = (event) => {
      event.preventDefault();
      event.stopPropagation();
      openMarketItemLightbox(item, { ...options, navigationItems, navigationIndex }, trigger);
    };
    trigger.addEventListener("click", openDetails);
    trigger.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") openDetails(event);
    });
  }"""
if old not in t:
    raise SystemExit("wireMarketItemDetailsTrigger block not found")
p.write_text(t.replace(old, new, 1), encoding="utf-8")
print("fixed trigger")