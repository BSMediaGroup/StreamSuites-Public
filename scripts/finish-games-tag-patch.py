from pathlib import Path

p = Path(__file__).resolve().parents[1] / "js" / "public-pages-app.js"
t = p.read_text(encoding="utf-8")

replacements = [
    (
        """  function openEconomyItemLightbox(item = {}, options = {}, sourceElement = null) {
    const navigationItems = Array.isArray(options.navigationItems) ? options.navigationItems.filter(Boolean) : [];
    let currentItem = item || {};
    let currentIndex = Number.isFinite(Number(options.navigationIndex)) ? Number(options.navigationIndex) : navigationItems.indexOf(currentItem);
    if (currentIndex < 0 && navigationItems.length) {
      const currentCode = String(currentItem.item_code || currentItem.asset_code || currentItem.denomination_code || "").trim();
      currentIndex = navigationItems.findIndex((entry) => String(entry?.item_code || entry?.asset_code || entry?.denomination_code || "").trim() === currentCode);
    }
    if (currentIndex < 0) currentIndex = 0;""",
        """  function openEconomyItemLightbox(item = {}, options = {}, sourceElement = null) {
    const rawNavigationItems = Array.isArray(options.navigationItems) ? options.navigationItems.filter(Boolean) : [];
    const navigationItems = rawNavigationItems.map((entry) => hydrateEconomyCatalogItemForLightbox(entry, options));
    let currentItem = hydrateEconomyCatalogItemForLightbox(item || {}, options);
    let currentIndex = Number.isFinite(Number(options.navigationIndex))
      ? Number(options.navigationIndex)
      : findEconomyCatalogNavigationIndex(rawNavigationItems, item);
    if (currentIndex < 0 && navigationItems.length) {
      currentIndex = findEconomyCatalogNavigationIndex(navigationItems, currentItem);
    }
    if (currentIndex < 0) currentIndex = 0;""",
    ),
    (
        "      currentItem = navigationItems[currentIndex] || currentItem || {};\n      const itemOptions = economyItemEffectiveOptions(currentItem, options);",
        "      currentItem = hydrateEconomyCatalogItemForLightbox(navigationItems[currentIndex] || currentItem || {}, options);\n      const itemOptions = economyItemEffectiveOptions(currentItem, options);",
    ),
    (
        "        items: exchangeItems,\n        authReady: Boolean(payload?.authenticated),\n        actionLabel: \"Exchange\",",
        "        items: exchangeItems,\n        catalogPayload: payload,\n        authReady: Boolean(payload?.authenticated),\n        actionLabel: \"Exchange\",",
    ),
    (
        "        items: buildGamesStorefrontItems(payload),\n        authReady: Boolean(payload?.authenticated),\n        actionLabel: \"Buy\",",
        "        items: buildGamesStorefrontItems(payload),\n        catalogPayload: payload,\n        authReady: Boolean(payload?.authenticated),\n        actionLabel: \"Buy\",",
    ),
    (
        "    const load = async () => {\n      try {\n        if (gamesState.payload && gamesState.authReady === authReady) {",
        "    const load = async () => {\n      try {\n        await ensurePublicItemCatalogTagIndex();\n        if (gamesState.payload && gamesState.authReady === authReady) {",
    ),
    (
        "    const load = async () => {\n      try {\n        const payload = await fetchPublicMarketExchange();\n        renderPayload(payload);\n      } catch (error) {\n        status.textContent = error instanceof Error ? error.message : \"Market & Exchange is unavailable right now.\";",
        "    const load = async () => {\n      try {\n        await ensurePublicItemCatalogTagIndex();\n        const payload = await fetchPublicMarketExchange();\n        renderPayload(payload);\n      } catch (error) {\n        status.textContent = error instanceof Error ? error.message : \"Market & Exchange is unavailable right now.\";",
    ),
    (
        "        items: enrichEconomyCatalogItems(payload?.exchange || [], payload),\n        authReady: Boolean(payload?.authenticated),\n        actionLabel: \"Exchange\",",
        "        items: enrichEconomyCatalogItems(payload?.exchange || [], payload),\n        catalogPayload: payload,\n        authReady: Boolean(payload?.authenticated),\n        actionLabel: \"Exchange\",",
    ),
    (
        "        items: enrichEconomyCatalogItems(payload?.market || [], payload),\n        authReady: Boolean(payload?.authenticated),\n        actionLabel: \"Buy\",",
        "        items: enrichEconomyCatalogItems(payload?.market || [], payload),\n        catalogPayload: payload,\n        authReady: Boolean(payload?.authenticated),\n        actionLabel: \"Buy\",",
    ),
]

for old, new in replacements:
    if old not in t:
        raise SystemExit(f"missing block:\n{old[:80]}...")
    t = t.replace(old, new, 1)

p.write_text(t, encoding="utf-8")
print("finished")