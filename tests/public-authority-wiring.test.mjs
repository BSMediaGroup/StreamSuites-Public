import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const repoRoot = process.cwd();

function read(relativePath) {
  return fs.readFileSync(path.join(repoRoot, relativePath), "utf8");
}

function extractBetween(source, start, end) {
  const startIndex = source.indexOf(start);
  const endIndex = source.indexOf(end, startIndex);
  assert.notEqual(startIndex, -1, `Missing start marker: ${start}`);
  assert.notEqual(endIndex, -1, `Missing end marker: ${end}`);
  return source.slice(startIndex, endIndex);
}

test("public data hub consumes runtime public authority exports", () => {
  const source = read("js/public-data-hub.js");
  assert.match(source, /publicAuthorityIdentities:\s*\["\/shared\/state\/public_identities\.json", "\/runtime\/exports\/public_identities\.json"\]/);
  assert.match(source, /publicAuthorityArtifacts:\s*\["\/shared\/state\/public_artifacts\.json", "\/runtime\/exports\/public_artifacts\.json"\]/);
  assert.match(source, /buildPublicAuthorityIdentityMap/);
  assert.match(source, /accountUserCode:\s*normalizeAuthorityKey\(raw\.user_code \|\| raw\.canonical_user_code \|\| raw\.account_user_code\)/);
  assert.match(source, /publicIdentityCode:/);
  assert.match(source, /authority:\s*\{/);
});

test("public app wires authority request submission and my-data history to the real endpoints", () => {
  const source = read("js/public-pages-app.js");
  assert.match(source, /AUTH_PUBLIC_AUTHORITY_REQUESTS_URL = `\$\{AUTH_API_BASE\}\/api\/public\/authority\/requests`/);
  assert.match(source, /AUTH_PUBLIC_AUTHORITY_REQUESTS_MINE_URL = `\$\{AUTH_API_BASE\}\/api\/public\/authority\/requests\/mine`/);
  assert.match(source, /AUTH_PUBLIC_PROGRESSION_ME_URL = `\$\{AUTH_API_BASE\}\/api\/public\/progression\/me`/);
  assert.match(source, /AUTH_PUBLIC_ECONOMY_ME_URL = `\$\{AUTH_API_BASE\}\/api\/public\/economy\/me`/);
  assert.match(source, /AUTH_PUBLIC_ECONOMY_EXCHANGE_URL = `\$\{AUTH_API_BASE\}\/api\/public\/economy\/me\/exchange`/);
  assert.match(source, /AUTH_PUBLIC_MARKET_EXCHANGE_URL = `\$\{AUTH_API_BASE\}\/api\/public\/economy\/market-exchange`/);
  assert.match(source, /AUTH_PUBLIC_MARKET_BUY_URL = `\$\{AUTH_API_BASE\}\/api\/public\/economy\/market\/buy`/);
  assert.match(source, /submitPublicAuthorityRequest/);
  assert.match(source, /fetchMyPublicAuthorityRequests/);
  assert.match(source, /fetchMyPublicProgression/);
  assert.match(source, /fetchMyPublicEconomy/);
  assert.match(source, /exchangeMyPublicValueItem/);
  assert.match(source, /renderMarketExchangeWorkspace/);
  assert.match(source, /fetchPublicMarketExchange/);
  assert.match(source, /buyPublicMarketItem/);
  assert.match(source, /summary\.xp_total \?\? summary\.total_xp/);
  assert.match(source, /PUBLIC_XP_ICON_PATH = "\/assets\/games\/xpstar\.webp"/);
  assert.match(source, /function buildProgressionLevelChip/);
  assert.match(source, /function formatOrdinal\(value\)/);
  assert.match(source, /mod100 >= 11 && mod100 <= 13/);
  assert.match(source, /\{ 1: "st", 2: "nd", 3: "rd" \}\[parsed % 10\] \|\| "th"/);
  assert.match(source, /function progressionGlobalPlacementRank\(summary = \{\}\)/);
  assert.match(source, /function buildProgressionGlobalRankValue\(summary = \{\}, options = \{\}\)/);
  assert.match(source, /chip\.append\(icon, create\("span", "", presentation\.label\)\)/);
  assert.doesNotMatch(source, /`Level \$\{presentation\.label\}`/);
  assert.match(source, /event\?\.source_domain/);
  assert.match(source, /buildAuthorityRequestPanel/);
  assert.match(source, /resolveProfileAuthorityContext/);
  assert.match(source, /renderCommunityMyData/);
  assert.match(source, /Public progression/);
  assert.match(source, /Recent XP events/);
  assert.match(source, /Public economy and inventory/);
  assert.match(source, /Recent economy history/);
  assert.match(source, /Pending review/);
  assert.match(source, /openAuthModal:\s*ctx\.openAuthModal/);
});

test("games economy page uses gallery-first market groups and shell toolbar anchors", () => {
  const app = read("js/public-pages-app.js");
  const shell = read("js/public-shell.js");
  const css = read("css/public-shell.css");

  assert.match(app, /"media-economy": \{[\s\S]*aliases: \["\/economy", "\/economy\/", "\/games", "\/games\/", "\/market", "\/market\/", "\/exchange", "\/exchange\/", "\/shop", "\/shop\/"\][\s\S]*render: renderGamesEconomyWorkspace/);
  assert.match(app, /"media-market-exchange": \{[\s\S]*sectionBar: ECONOMY_SECTION_BAR[\s\S]*render: renderGamesEconomyWorkspace/);
  assert.match(app, /host\.dataset\.gamesEconomyPage = "present"/);
  assert.match(app, /GAMES_MARKET_VIEW_STORAGE_KEY = "ss-public-games-market-view"/);
  assert.match(app, /GAMES_MARKET_PAGE_SIZE_OPTIONS = Object\.freeze\(\[20, 50, 100\]\)/);
  assert.match(app, /GAMES_MARKET_DEFAULT_PAGE_SIZE = 50/);
  assert.match(app, /searchPlaceholder: "Search shop, market, exchange"/);
  assert.match(app, /hideSearch: false/);
  assert.match(app, /viewMode: gamesState\.viewMode/);
  assert.match(app, /host\.dataset\.marketView = viewMode/);
  assert.match(app, /\["gallery", "condensed", "compact"\]\.includes/);
  assert.match(app, /buildGamesStorefrontItems\(payload\)/);
  assert.match(app, /__storefront_action: "exchange"/);
  assert.match(app, /filterEconomyItems\(items, options\.searchQuery, options\)/);
  assert.match(app, /clampMarketPage\(options\.page, filteredItems\.length, pageSize\)/);
  assert.match(app, /buildMarketPaginationControls/);
  assert.match(app, /allowViewToggle: true/);
  assert.match(app, /market-view-toggle-button/);
  assert.match(app, /options\.onViewChange\?\.\(mode\)/);
  assert.match(app, /economyMarketGroups\(pageItems\)\.forEach/);
  assert.match(app, /function economyItemCategoryLabel\(item = \{\}\)/);
  assert.match(app, /Materials/);
  assert.match(app, /Weapons/);
  assert.match(app, /Equipment/);
  assert.match(app, /Tools/);
  assert.match(app, /Collectibles/);
  assert.match(app, /Currency/);
  assert.match(app, /Gems/);
  assert.match(app, /Crates \/ Rewards/);
  assert.match(app, /Consumables/);
  assert.match(app, /Cosmetics/);
  assert.match(app, /section\.dataset\.marketCategoryGroup = group\.label/);
  assert.match(app, /card\.dataset\.marketItemCard = ""/);
  assert.match(app, /buildMarketGalleryItemCard/);
  assert.match(app, /buildEconomyItemMedia\(item, "market-gallery-item-media"\)/);
  assert.match(app, /market-gallery-item-fallback/);
  assert.match(app, /economyItemTitle\(item\)/);
  assert.match(app, /function economyItemPriceEntries\(item = \{\}, options = \{\}\)/);
  assert.match(app, /return \[\{\s*key: candidate\.key,[\s\S]*currency: candidate\.currency,[\s\S]*value[\s\S]*\}\];/);
  assert.match(app, /function buildMarketPriceDisplay\(item = \{\}, options = \{\}, displayOptions = \{\}\)/);
  assert.match(app, /wrap\.dataset\.marketPrice = entries\.length \? "available" : "unavailable"/);
  assert.match(app, /icon\.style\.setProperty\("--economy-currency-symbol", `url\("\$\{economyAssetPath\(ECONOMY_CURRENCY_SYMBOL_PATH\)\}"\)`\)/);
  assert.match(app, /icon\.dataset\.marketPriceIcon = ""/);
  assert.match(app, /Price unavailable/);
  assert.match(app, /buildMarketPriceDisplay\(item, itemOptions, \{ className: "market-item-price market-item-price--gallery" \}\)/);
  assert.match(app, /economyItemSoldOut\(item\)/);
  assert.match(app, /SOLD OUT/);
  assert.match(app, /You do not hold the required item\./);
  assert.match(app, /buildMarketExchangeItemCard\(item, options\)/);
  assert.match(app, /buildMarketQuickItemCard\(item, scopedOptions, viewMode\)/);
  assert.match(app, /function openMarketItemLightbox\(item = \{\}, options = \{\}, sourceElement = null\)/);
  assert.match(app, /function openEconomyItemLightbox\(item = \{\}, options = \{\}, sourceElement = null\)/);
  assert.match(app, /normalizeEconomyItemLightboxData\(currentItem, itemOptions\)/);
  assert.match(app, /overlay\.dataset\.marketItemLightbox = ""/);
  assert.match(app, /price\.dataset\.marketLightboxPrice = ""/);
  assert.match(app, /function wireMarketItemDetailsTrigger\(trigger, item = \{\}, options = \{\}\)/);
  assert.match(app, /trigger\.dataset\.marketItemDetailsTrigger = ""/);
  assert.match(app, /buildEconomyItemMedia\(currentItem, "market-item-lightbox-media"\)/);
  assert.match(app, /detail\.stats\.forEach/);
  assert.match(app, /detail\.meta\.forEach/);
  assert.match(app, /appendItemDetailRow\(meta, row\.label, value\)/);
  assert.match(app, /event\.key === "Escape"/);
  assert.match(app, /document\.body\?\.classList\?\.add\("market-item-lightbox-open"\)/);
  assert.match(app, /market-item-details-action/);
  assert.match(app, /Inventory item available for rewards, collections, and market listings/);
  assert.match(app, /combat_vehicle/);
  assert.match(app, /Combat Vehicles/);
  assert.match(app, /marketSection\.dataset\.marketView = "gallery"/);
  assert.match(app, /economy-unavailable-state/);
  assert.match(shell, /layoutStack: "\/assets\/icons\/ui\/tabs\.svg"/);
  assert.match(shell, /searchClear = create\("button", "search-clear-button"\)/);
  assert.match(shell, /searchClear\.setAttribute\("aria-label", "Clear search"\)/);
  assert.match(shell, /callbacks\.onSearch\(""\)/);
  assert.match(shell, /sectionBarToggle\.dataset\.gamesAnchorToggle = ""/);
  assert.match(shell, /sectionBar\.dataset\.gamesAnchorToolbar = ""/);
  assert.match(shell, /sectionBar\.dataset\.gamesAnchorContainer = ""/);
  assert.match(shell, /sectionBar\.dataset\.gamesAnchorCollapsed = "false"/);
  assert.match(shell, /sectionBar\.dataset\.gamesAnchorOverflow = "false"/);
  assert.match(shell, /topbarLeft\.appendChild\(sectionBarToggle\)/);
  assert.match(shell, /sectionBar\.append\(sectionBarPrev, sectionBarViewport, sectionBarNext\)/);
  assert.doesNotMatch(shell, /sectionBar\.append\(sectionBarToggle/);
  assert.match(shell, /sectionBar\.hidden = isCollapsed/);
  assert.match(shell, /sectionBar\.dataset\.gamesAnchorCollapsed = String\(isCollapsed\)/);
  assert.match(shell, /sectionBar\.dataset\.gamesAnchorOverflow = "false"/);
  assert.match(shell, /sectionBar\.classList\.remove\("has-overflow", "show-left-fade", "show-right-fade"\)/);
  assert.match(shell, /sectionBarPrev\.hidden = !hasOverflow/);
  assert.match(shell, /sectionBarNext\.hidden = !hasOverflow/);
  assert.match(shell, /sectionBar\.dataset\.gamesAnchorOverflow = hasOverflow \? "true" : "false"/);
  assert.match(shell, /window\.addEventListener\("resize", updateSectionBarOverflow/);
  assert.match(shell, /event\.preventDefault\(\);[\s\S]*window\.history\.pushState\(window\.history\.state, "", `#\$\{section\.id\}`\);[\s\S]*scrollToSectionHash/);
  assert.match(css, /\.games-economy-hero\.dashboard-hero/);
  assert.match(css, /\.games-economy-hero\.dashboard-hero\s*\{[\s\S]*overflow:\s*hidden/);
  assert.match(css, /\.games-economy-hero\.dashboard-hero\s*\{[\s\S]*min-height:\s*220px/);
  assert.match(css, /\.games-economy-hero\.dashboard-hero\s*\{[\s\S]*grid-template-columns:\s*minmax\(0, 1fr\) minmax\(360px, 0\.52fr\)/);
  assert.doesNotMatch(css, /\.games-economy-hero\.dashboard-hero::after/);
  assert.match(css, /\.games-economy-hero \.dashboard-stat-card:last-child\s*\{[\s\S]*grid-column:\s*1 \/ -1/);
  assert.match(css, /\.market-gallery-card-grid\s*\{[\s\S]*grid-template-columns:\s*repeat\(3, minmax\(0, 1fr\)\)/);
  assert.match(css, /\.market-gallery-item-media\s*\{[\s\S]*min-height:\s*156px/);
  assert.match(css, /\.market-gallery-item-fallback/);
  assert.match(css, /\.market-item-price-row\s*\{[\s\S]*border:\s*1px solid rgba\(251, 191, 36, 0\.32\)/);
  assert.match(css, /\.market-item-price-icon\s*\{[\s\S]*object-fit:\s*contain/);
  assert.match(css, /\.market-item-price-unavailable/);
  assert.match(css, /\.search-clear-button/);
  assert.match(css, /\.market-quick-layout--compact\s*\{[\s\S]*grid-template-columns:\s*repeat\(auto-fill, minmax\(138px, 1fr\)\)/);
  assert.match(css, /\.market-quick-item-actions\s*\{[\s\S]*opacity:\s*0/);
  assert.match(css, /\.market-quick-item-card:focus-within \.market-quick-item-actions\s*\{[\s\S]*opacity:\s*1/);
  assert.match(css, /\.market-pagination\s*\{/);
  assert.match(css, /\.market-exchange-category-layout\s*\{/);
  assert.match(css, /\.market-gallery-item-card\[data-market-sold-out="true"\]::after/);
  assert.match(css, /\.market-item-lightbox-backdrop\s*\{[\s\S]*position:\s*fixed/);
  assert.match(css, /\.market-item-lightbox\s*\{[\s\S]*grid-template-columns:\s*minmax\(260px, 0\.92fr\) minmax\(0, 1\.08fr\)/);
  assert.match(css, /\.market-item-lightbox-media\s*\{[\s\S]*min-height:\s*360px/);
  assert.match(css, /\.market-item-lightbox-price/);
  assert.match(css, /\.market-item-lightbox-stats/);
  assert.match(css, /\.market-item-lightbox-open\s*\{[\s\S]*overflow:\s*hidden/);
  assert.match(css, /\.market-exchange-section-heading\s*\{[\s\S]*grid-template-columns:\s*minmax\(0, 1fr\)/);
  assert.match(css, /\.market-view-toolbar\s*\{[\s\S]*justify-content:\s*flex-end/);
  assert.match(css, /\.market-view-toggle-button\.is-active/);
  assert.match(css, /\.public-section-tabs-toggle\[hidden\],[\s\S]*\.public-section-tab-scroll\[hidden\]/);
  assert.match(css, /\.public-section-shell-tabs\.is-collapsed\s*\{[\s\S]*display:\s*none/);
  assert.match(css, /@media \(max-width: 680px\)[\s\S]*\.market-gallery-card-grid\s*\{[\s\S]*grid-template-columns:\s*1fr/);
  assert.match(css, /@media \(max-width: 680px\)[\s\S]*\.market-item-lightbox\s*\{[\s\S]*grid-template-columns:\s*1fr/);
});

test("public profile owner editor stays runtime-backed and uses canonical social assets", () => {
  const app = read("js/public-pages-app.js");
  const hub = read("js/public-data-hub.js");
  const css = read("css/public-shell.css");

  assert.match(hub, /key: "pickax"[\s\S]*label: "Pickax"[\s\S]*icon: "\/assets\/icons\/pickax\.svg"/);
  assert.match(hub, /key: "onlyfans"[\s\S]*label: "OnlyFans"[\s\S]*icon: "\/assets\/icons\/onlyfans\.svg"/);
  assert.match(app, /function openPublicProfileEditModal/);
  assert.match(app, /saveMyPublicProfile\(payload\)/);
  assert.match(app, /function validatePublicProfileEditorSocialUrl/);
  assert.match(app, /https:\/\/\$\{expectedHost\}\/yourhandle/);
  assert.match(app, /data-profile-edit-social/);
  assert.match(app, /profile-edit-open-button/);
  assert.match(app, /canEditProfile: canEdit/);
  assert.match(app, /if \(canEdit && \(error\?\.status === 401 \|\| error\?\.status === 403\)\)/);
  assert.match(css, /\.profile-edit-modal-backdrop/);
  assert.match(css, /\.profile-edit-media/);
  assert.match(css, /\.profile-edit-social-grid/);
});

test("public leaderboards route hydrates from authoritative progression API", () => {
  const app = read("js/public-pages-app.js");
  const css = read("css/public-shell.css");
  assert.match(app, /AUTH_PUBLIC_PROGRESSION_LEADERBOARD_URL = `\$\{AUTH_API_BASE\}\/api\/public\/progression\/leaderboard`/);
  assert.match(app, /AUTH_PUBLIC_PROGRESSION_SCOPES_URL = `\$\{AUTH_API_BASE\}\/api\/public\/progression\/scopes`/);
  assert.match(app, /AUTH_PUBLIC_PROGRESSION_PROFILE_URL = `\$\{AUTH_API_BASE\}\/api\/public\/progression\/profile`/);
  assert.match(app, /fetchPublicProgressionLeaderboard/);
  assert.match(app, /fetchPublicProgressionScopes/);
  assert.match(app, /fetchPublicProfileProgressionScopes/);
  assert.match(app, /endpoint\.searchParams\.set\("scope_key", scopeKey\)/);
  assert.match(app, /renderLeaderboards/);
  assert.match(app, /aliases: \["\/leaderboards", "\/leaderboards\/", "\/community\/leaderboard", "\/community\/leaderboard\/"\]/);
  assert.doesNotMatch(app, /renderLeaderboardsPlaceholder/);
  assert.match(app, /StreamSuites public leaderboards hub/);
  assert.match(app, /Global XP Leaderboards/);
  assert.match(app, /hero\.dataset\.leaderboardHero = scoped \? "scoped" : "global"/);
  assert.match(app, /progression-leaderboard-hero progression-leaderboard-hero--slim/);
  assert.match(app, /heroTitle\.textContent = scoped \? `\$\{scopeLabel\} Leaderboard` : "Global XP Leaderboards"/);
  assert.match(app, /heroAvatar\.appendChild\(createScopedProgressionAvatar\(currentScopeMeta\)\)/);
  assert.match(app, /heroAvatar\.appendChild\(createScopedPlatformBrandIcon\("global", "progression-leaderboard-hero-avatar-icon"\)\)/);
  assert.match(app, /Current Board/);
  assert.match(app, /boardCard\.dataset\.leaderboardCurrentBoard = scoped \? "scoped" : "global"/);
  assert.match(app, /boardCardStatus\.textContent = scoped \? "Channel scoped" : "Global board"/);
  assert.match(app, /entry\?\.xp_total \?\? entry\?\.total_xp/);
  assert.match(app, /buildProgressionXpValue\(leaderboardXpTotal\(entry\), \{ compact: true, compactNumber: true \}\)/);
  assert.match(app, /placement_rank \|\| entry\?\.rank \|\| entry\?\.position/);
  assert.match(app, /buildProgressionLevelChip\(entry, \{ compact: true \}\)/);
  assert.match(app, /payload\?\.canonical_user_code/);
  assert.match(app, /authorityIdentity\?\.account_user_code/);
  assert.match(app, /function leaderboardHandle\(identity = \{\}\)/);
  assert.match(app, /identity\.public_slug[\s\S]*identity\.profile_slug[\s\S]*identity\.slug[\s\S]*identity\.handle[\s\S]*identity\.canonical_slug[\s\S]*profileUrlSlug/);
  assert.doesNotMatch(app.match(/function leaderboardHandle\(identity = \{\}\) \{[\s\S]*?return "";\n  \}/)?.[0] || "", /identity\.user_code/);
  assert.match(app, /return `@\$\{handle\}`/);
  assert.match(app, /fallback_public_identity_code/);
  assert.match(app, /function leaderboardProfileHref\(entry = \{\}\)/);
  assert.match(app, /identity\.public_slug \|\| identity\.publicSlug \|\| identity\.profile_slug \|\| identity\.profileSlug \|\| identity\.slug \|\| identity\.handle \|\| identity\.canonical_slug/);
  assert.match(app, /const link = create\("a", "dashboard-action progression-leaderboard-profile-link", "View profile"\)/);
  assert.match(app, /if \(slug\) return `\$\{CANONICAL_PROFILE_PREFIX\}\$\{encodeURIComponent\(slug\)\}`/);
  assert.match(app, /function safeLeaderboardProfileUrl\(value = ""\)/);
  assert.match(app, /const explicitHref = safeLeaderboardProfileUrl\(explicit\)/);
  assert.match(app, /if \(userCode\) return `\$\{CANONICAL_PROFILE_PREFIX\}\$\{encodeURIComponent\(userCode\)\}`/);
  assert.match(app, /identityCode && identityCode\.startsWith\("public-user"\)/);
  assert.match(app, /return `\$\{CANONICAL_PROFILE_PREFIX\}\$\{PROFILE_FALLBACK_SLUG\}`/);
  assert.match(app, /function buildLeaderboardDetail\(entry = \{\}\)/);
  assert.match(app, /row\.setAttribute\("aria-expanded", isExpanded \? "true" : "false"\)/);
  assert.match(app, /function toggleLeaderboardRow\(entry = \{\}, state = \{\}, isExpanded = false\)/);
  assert.match(app, /row\.addEventListener\("keydown"/);
  assert.match(app, /event\.key !== "Enter" && event\.key !== " "/);
  assert.match(app, /isInteractiveLeaderboardTarget\(event\.target\)/);
  assert.doesNotMatch(app, /"progression-leaderboard-expand", isExpanded \? "Hide details" : "Details"/);
  assert.doesNotMatch(app, /"Actions"\]/);
  assert.match(app, /create\("button", "progression-leaderboard-chevron"\)/);
  assert.match(app, /chevron\.type = "button"/);
  assert.match(app, /chevron\.addEventListener\("click"/);
  assert.match(app, /createIcon\(isExpanded \? UI_ICON_MAP\.minus : UI_ICON_MAP\.plus, "progression-leaderboard-chevron-icon"\)/);
  assert.doesNotMatch(app, /create\("span", "progression-leaderboard-chevron", isExpanded \? "Hide" : "Show"\)/);
  assert.match(app, /function filterLeaderboardRows\(rows = \[\], query = ""\)/);
  assert.match(app, /Search by name, @handle, level, or badge/);
  assert.match(app, /search\.className = "progression-leaderboard-search-input"/);
  assert.match(app, /leaderboard-scope-toolbar progression-leaderboard-controls/);
  assert.equal((app.match(/dataset\.scopeToolbar = "leaderboard"/g) || []).length, 1);
  assert.match(app, /controls\.dataset\.scopeToolbar = "leaderboard"/);
  assert.match(app, /leaderboard-scope-toolbar-controls/);
  assert.match(app, /scopeControl\.dataset\.scopeControl = "leaderboard"/);
  assert.match(app, /scopeControl\.dataset\.scopeMode = "global"/);
  assert.match(app, /Global leaderboard/);
  assert.match(app, /scopedProgressionScopeLabel\(state\.scopeMeta/);
  assert.match(app, /createScopedPlatformBrandIcon\(scoped \? state\.scopeMeta : "global", "progression-leaderboard-scope-chip-icon"\)/);
  assert.match(app, /Channel/);
  assert.match(app, /scopeSelect\.disabled = !scoped \|\| \(!availableScopes\.length && !state\.scopeKey\)/);
  assert.match(app, /No channel scopes/);
  assert.match(app, /No channel scoped leaderboards found yet\./);
  assert.match(app, /Channel scoped leaderboards could not be loaded\./);
  assert.doesNotMatch(app, /progression-leaderboard-scope-control/);
  assert.doesNotMatch(app, /progression-leaderboard-scope-field-label/);
  assert.doesNotMatch(app, /Search channel scopes/);
  assert.doesNotMatch(app, /Leaderboard scope/);
  assert.doesNotMatch(app, /Global remains the default\. Channel scoped views show XP\/rank earned inside a creator\/channel context\./);
  assert.match(app, /renderLeaderboardScopeOptions\(scopeSelect, availableScopes/);
  assert.match(app, /readLeaderboardScopeFromUrl/);
  assert.match(app, /writeLeaderboardScopeToUrl\(cleanScope\)/);
  assert.match(app, /loadLeaderboard\(""\)/);
  assert.match(app, /loadLeaderboard\(nextScope\)/);
  assert.match(app, /fetchPublicProgressionScopes\(\)/);
  assert.match(app, /normalizeScopedProgressionRows\(rawRows\)/);
  assert.match(app, /No scoped XP rows were returned for this creator\/channel yet/);
  assert.match(app, /aliases: \["\/leaderboards", "\/leaderboards\/", "\/community\/leaderboard", "\/community\/leaderboard\/"\]/);
  assert.match(app, /kick: "\/assets\/icons\/kick\.svg"/);
  assert.match(app, /youtube: "\/assets\/icons\/youtube\.svg"/);
  assert.match(app, /rumble: "\/assets\/icons\/rumble\.svg"/);
  assert.match(app, /twitch: "\/assets\/icons\/twitch\.svg"/);
  assert.match(app, /pilled: "\/assets\/icons\/pilled\.svg"/);
  assert.match(app, /global: "\/assets\/icons\/ui\/globe\.svg"/);
  assert.match(app, /unknown: "\/assets\/icons\/ui\/cast\.svg"/);
  assert.match(app, /state\.page = 1/);
  assert.match(app, /const LEADERBOARD_PAGE_SIZE = 20/);
  assert.match(app, /const pageRows = filteredRows\.slice\(pageStart, pageStart \+ LEADERBOARD_PAGE_SIZE\)/);
  assert.match(app, /paginationHost\.appendChild\(buildLeaderboardPagination\(state, totalPages\)\)/);
  assert.match(app, /progressionLevelPresentation\(entry\)/);
  assert.match(app, /addStat\("Rank", `#\$\{formatNumber/);
  assert.match(app, /function formatCompactNumber\(value\)/);
  assert.match(app, /1_000_000[\s\S]*suffix: "M"/);
  assert.match(app, /1_000_000_000[\s\S]*suffix: "B"/);
  assert.match(app, /1_000_000_000_000[\s\S]*suffix: "T"/);
  assert.match(app, /stats\.appendChild\(walletStat\);\s*stats\.appendChild\(buildLeaderboardLevelCard\(entry\)\)/);
  assert.match(app, /applyProfileCurrentLevelCardTheme\(item, entry\)/);
  assert.match(app, /walletStat\.append\(create\("dt", "", "Wallet"\)\)/);
  assert.match(app, /function leaderboardInventoryItems\(entry = \{\}\)/);
  assert.match(app, /function buildLeaderboardInventoryOverview\(entry = \{\}\)/);
  assert.match(app, /detail\.append\(summary, stats, buildLeaderboardInventoryOverview\(entry\)\)/);
  assert.match(app, /entry\?\.economy_summary\?\.inventory/);
  assert.match(app, /entry\?\.inventory_summary/);
  assert.match(app, /progression-leaderboard-inventory-meta/);
  assert.match(app, /\[definition\.category, definition\.rarity\]\.filter\(Boolean\)\.join\(" • "\)/);
  assert.match(app, /progression-leaderboard-inventory-overflow/);
  assert.match(app, /return buildEconomyBalanceValue\(wallet, \{ compactNumber: true \}\)/);
  assert.doesNotMatch(app, /This public identity is ranked from authoritative StreamSuites XP only/);
  assert.match(app, /function normalizeLeaderboardWalletFields\(source = \{\}\)/);
  assert.match(app, /entry\?\.wallet_summary/);
  assert.match(app, /entry\?\.economy_summary/);
  assert.match(app, /candidate\.balance_total_credits/);
  assert.match(app, /candidate\.cash_balance_credits/);
  assert.match(app, /candidate\.held_value_credits/);
  assert.match(app, /candidate\.currency_unit_plural_label/);
  assert.match(app, /value:\s*`\$\{formatCompactNumber\(stats\.lifetimeXp\)\} XP`/);
  assert.match(app, /label: "Ranked identities"[\s\S]*value: formatNumber\(stats\.entries\)/);
  assert.match(app, /note: scoped \? "Loaded for selected scoped board" : "Loaded from global leaderboard rows"/);
  assert.match(app, /label: "Lifetime XP"[\s\S]*"Computed from selected scoped rows"[\s\S]*"Computed from loaded global rows"/);
  assert.match(app, /const walletCurrency = wallets\[0\] \|\| \{\}/);
  assert.match(app, /buildEconomyBalanceValue\(\{ \.\.\.stats\.walletCurrency, balance_total_credits: stats\.walletTotal \}, \{ compact: true, compactNumber: true \}\)/);
  assert.match(app, /label: "Wallet Index"[\s\S]*"Unavailable for this board"/);
  assert.match(app, /"Scoped rows do not expose wallet summaries"/);
  assert.match(app, /function computeLeaderboardBoardInventory\(scopes = \[\], options = \{\}\)/);
  assert.match(app, /scopedCount = uniqueProgressionScopes\(scopes\)\.length/);
  assert.match(app, /creatorBoardValue = scopesLoading \? "Loading" : scopesError \? "Unavailable" : `\$\{formatNumber\(boardInventory\.scopedCount\)\} available`/);
  assert.match(app, /boardCountValue = scopesLoading \? "Loading" : scopesError \? "Unavailable" : `\$\{formatNumber\(boardInventory\.totalCount\)\} board/);
  assert.match(app, /dataKey === "creator"[\s\S]*leaderboardCreatorBoardCount/);
  assert.match(app, /dataKey === "boards"[\s\S]*leaderboardBoardCount/);
  assert.doesNotMatch(app, /Creator boards soon/);
  assert.doesNotMatch(app, /value: scoped \? "Live" : "Preview"/);
  assert.doesNotMatch(app, /addStat\("Rank", level\.label/);
  assert.match(app, /LEADERBOARD_PLACEMENT_ASSETS = Object\.freeze/);
  assert.match(app, /1: "\/assets\/games\/lb-first\.webp"/);
  assert.match(app, /2: "\/assets\/games\/lb-second\.webp"/);
  assert.match(app, /3: "\/assets\/games\/lb-third\.webp"/);
  assert.match(app, /function computeLeaderboardTiePlacements\(rows = \[\]\)/);
  assert.match(app, /currentPlacement = index \+ 1/);
  assert.match(app, /tie_placement_rank: currentPlacement/);
  assert.match(app, /function renderLeaderboardPodium\(host, rows = \[\]\)/);
  assert.match(app, /const topRows = rows\.filter/);
  assert.match(app, /placement >= 1 && placement <= 3/);
  assert.match(app, /renderLeaderboardPodium\(podium, state\.rows\)/);
  assert.match(app, /ss-lb-podium-card--first/);
  assert.match(app, /create\("span", "ss-lb-premium-shimmer"\)/);
  assert.match(app, /pageRows\.forEach\(\(entry\) => list\.appendChild\(buildLeaderboardRow\(entry, state\)\)\)/);
  assert.match(app, /renderSignedOutStanding\(standingHost, openAuthModal\)/);
  assert.match(app, /renderSignedInStanding\(standingHost, standingEntry, progressionPayload, economyPayload, authState \|\| \{\}\)/);
  const standingBlock = app.match(/function renderSignedInStanding\(host, entry = null, progressionPayload = \{\}, economyPayload = \{\}, authState = \{\}\) \{[\s\S]*?host\.appendChild\(card\);\n  \}/)?.[0] || "";
  assert.match(standingBlock, /const authSlug = getCanonicalProfileSlug\(authState, ""\)/);
  assert.doesNotMatch(standingBlock, /buildProfileHref\(authState\)/);
  assert.match(standingBlock, /buildEconomyBalanceValue\(wallet, \{ compact: true, compactNumber: true, standing: true \}\)/);
  assert.match(app, /renderLeaderboardGallery\(gallery, availableScopes/);
  assert.match(app, /renderLeaderboardGallery\(gallery, availableScopes,[\s\S]*state\.scopeKey\)/);
  assert.match(app, /Creator and channel boards/);
  assert.match(app, /Available boards come from the Runtime\/Auth scoped progression contract/);
  assert.match(app, /progression-leaderboard-gallery-action/);
  assert.match(app, /card\.dataset\.leaderboardScopeSelected = isSelected \? "true" : "false"/);
  assert.match(app, /loadLeaderboard\(scopeKey \|\| ""\)/);
  assert.doesNotMatch(app, /Creator-defined boards preview/);
  assert.doesNotMatch(app, /progression-leaderboard-future-tab/);
  assert.match(css, /\.progression-leaderboard-row/);
  assert.match(css, /\.progression-leaderboard-row--top-1/);
  assert.match(css, /\.progression-leaderboard-row--top:hover\s*\{[\s\S]*--leaderboard-placement-color/);
  assert.match(css, /\.progression-leaderboard-hero/);
  assert.match(css, /\.progression-leaderboard-hero--slim/);
  assert.match(css, /\.progression-leaderboard-hero-avatar/);
  assert.match(css, /\.progression-leaderboard-current-board-status/);
  assert.match(css, /\.progression-leaderboard-stat-grid/);
  assert.match(css, /\.progression-leaderboard-podium/);
  assert.match(css, /\.progression-leaderboard-podium-card--1/);
  assert.match(css, /\.progression-leaderboard-standing-card/);
  assert.match(css, /\.progression-leaderboard-standing-stats \.economy-balance-value--standing\s*\{[\s\S]*font-size:\s*inherit/);
  assert.match(css, /\.progression-leaderboard-detail-stat \.economy-balance-value\s*\{[\s\S]*font-size:\s*inherit/);
  assert.match(css, /\.progression-leaderboard-table-header/);
  assert.match(css, /--progression-leaderboard-row-grid/);
  assert.match(css, /\.progression-leaderboard-header-profile\s*\{[\s\S]*grid-column:\s*2 \/ 4/);
  assert.match(css, /\.progression-leaderboard-row-main\s*\{[\s\S]*grid-template-columns:\s*var\(--progression-leaderboard-row-grid\)/);
  assert.match(css, /\.progression-leaderboard-chevron-icon/);
  assert.match(css, /\.progression-leaderboard-pagination/);
  assert.match(app, /progression-leaderboard-page-button progression-leaderboard-page-button--/);
  assert.match(css, /\.progression-leaderboard-gallery-card/);
  assert.match(css, /\.progression-leaderboard-medallion/);
  assert.match(css, /\.progression-leaderboard-level-card/);
  assert.match(css, /\.progression-leaderboard-detail\s*\{[\s\S]*grid-template-columns:\s*minmax\(180px, 220px\) minmax\(0, 1fr\)/);
  assert.match(css, /\.progression-leaderboard-detail-stats\s*\{[\s\S]*grid-template-columns:\s*repeat\(4, minmax\(0, 1fr\)\)/);
  assert.match(css, /\.progression-leaderboard-detail-stat\s*\{[\s\S]*min-height:\s*74px/);
  assert.match(css, /\.progression-leaderboard-level-card dd\s*\{[\s\S]*align-items:\s*center/);
  assert.match(css, /\.progression-leaderboard-profile-link\s*\{[\s\S]*width:\s*min\(100%, 174px\)/);
  assert.match(css, /\.progression-leaderboard-detail-actions/);
  assert.match(css, /\.progression-leaderboard-inventory-overview/);
  assert.match(css, /\.progression-leaderboard-inventory-rail/);
  assert.match(css, /\.progression-leaderboard-inventory-body/);
  assert.match(css, /\.progression-leaderboard-inventory-meta/);
  assert.match(css, /\.progression-board\.dashboard-card/);
  assert.match(css, /\.progression-leaderboard-detail/);
  assert.match(css, /\.leaderboard-scope-toolbar/);
  assert.match(css, /grid-template-columns:\s*minmax\(260px, 1fr\) auto minmax\(220px, 320px\) minmax\(112px, 180px\) auto/);
  assert.match(css, /\.leaderboard-scope-toolbar-controls\s*\{\s*display:\s*contents/);
  assert.match(css, /\.progression-leaderboard-search,[\s\S]*\.progression-leaderboard-scope-select,[\s\S]*\.progression-leaderboard-scope-feedback\s*\{[\s\S]*min-width:\s*0/);
  assert.match(css, /\.progression-leaderboard-search input/);
  assert.match(css, /\.progression-leaderboard-search input::placeholder/);
  assert.match(css, /\.progression-leaderboard-scope-chip/);
  assert.match(css, /\.progression-leaderboard-scope-mode/);
  assert.match(css, /\.progression-leaderboard-scope-feedback/);
  assert.match(css, /\.progression-leaderboard-scope-search input/);
  assert.match(css, /\.progression-leaderboard-scope-select select/);
  assert.match(css, /\.progression-leaderboard-scope-select select:disabled/);
  assert.match(css, /\.progression-leaderboard-scope-chip-icon/);
  assert.match(css, /img\.profile-game-scope-chip-icon,[\s\S]*img\.scoped-platform-chip-icon,[\s\S]*img\.progression-leaderboard-scope-chip-icon\s*\{[\s\S]*-webkit-mask:\s*none/);
  assert.doesNotMatch(css, /\.progression-leaderboard-scope-control/);
  assert.doesNotMatch(css, /\.progression-leaderboard-scope-label/);
  assert.doesNotMatch(css, /\.progression-leaderboard-scope-field-label/);
  assert.doesNotMatch(css, /\.progression-leaderboard-scope-note/);
  assert.match(css, /\.progression-leaderboard-gallery-action/);
  assert.match(css, /\.ss-lb-premium-shimmer/);
  assert.match(css, /@keyframes ss-lb-premium-shimmer/);
  assert.match(css, /prefers-reduced-motion:\s*reduce[\s\S]*\.ss-lb-premium-shimmer::before/);
  assert.match(css, /\.progression-level-chip/);
  assert.match(css, /\.progression-xp-icon/);
});

test("public profile game section renders runtime progression and economy authority summaries", () => {
  const app = read("js/public-pages-app.js");
  const css = read("css/public-shell.css");
  const profileSection = app.match(/function buildProfileGameCompetitionSection\(profile = null, options = \{\}\) \{[\s\S]*?return details;\n  \}/)?.[0] || "";
  const scopedProfileSection = app.match(/function buildProfileScopedProgressionSection\(profile = null\) \{[\s\S]*?return section;\n  \}/)?.[0] || "";
  assert.ok(profileSection, "profile progression section should exist");
  assert.ok(scopedProfileSection, "profile scoped progression section should exist");
  assert.match(app, /payload\?\.progression && typeof payload\.progression === "object"/);
  assert.match(app, /payload\?\.economy && typeof payload\.economy === "object"/);
  assert.match(app, /Array\.isArray\(payload\?\.inventory\)/);
  assert.match(app, /ECONOMY_CURRENCY_SYMBOL_PATH = "\/assets\/games\/currencyunit\.svg"/);
  assert.match(app, /function buildEconomyDenominationBreakdown\(wallet = \{\}\)/);
  assert.match(app, /function buildEconomyBreakdownList\(rows = \[\], emptyText = "No entries available yet\.", className = "", options = \{\}\)/);
  assert.match(app, /economy-breakdown-meta/);
  assert.match(app, /meta \? `\[\$\{meta\}\]` : ""/);
  assert.match(app, /wallet\.denomination_breakdown\.filter/);
  assert.match(app, /item\?\.should_display \|\| item\?\.always_show_in_balance \|\| Number\(item\?\.count \|\| 0\) > 0/);
  assert.match(app, /icon\.style\.setProperty\("--economy-currency-symbol"/);
  assert.match(app, /fullColorIcon/);
  assert.match(profileSection, /progression\.xp_total \?\? progression\.total_xp/);
  assert.match(profileSection, /const scopedRows = normalizeScopedProgressionRows/);
  assert.match(profileSection, /scopeWrap\.dataset\.profileScopeSelector = "compact"/);
  assert.match(profileSection, /profile-game-scope-select-input/);
  assert.match(profileSection, /details\.dataset\.profileProgressionMode = scoped \? "scoped" : "global"/);
  assert.match(profileSection, /panel\.dataset\.profileProgressionMode = scoped \? "scoped" : "global"/);
  assert.match(profileSection, /Current XP \/ Scoped rank/);
  assert.match(profileSection, /Scoped level/);
  assert.match(profileSection, /Messages/);
  assert.match(profileSection, /No scoped wallet data yet/);
  assert.match(profileSection, /No scoped inventory data yet/);
  assert.match(profileSection, /buildEconomyBalanceValue\(economy \|\| \{\}, \{ prominent: true, fullColorIcon: true, showCashComponent: true, leadClassName: "profile-game-card-lead profile-game-card-lead--balance" \}\)/);
  assert.match(profileSection, /buildInventoryCardLeadValue\(scoped \? scopedInventory\.length \? "Itemized" : scopedInventoryAvailable \? "Empty" : "Unavailable" : displayInventory\.length \? "Itemized" : "Empty"\)/);
  assert.match(profileSection, /buildEconomyDenominationBreakdown\(economy \|\| \{\}\)/);
  assert.match(profileSection, /buildInventorySummaryList\(displayInventory, \{ context: "Global profile inventory" \}\)/);
  assert.match(profileSection, /buildPublicValueItemExchangePanel\(exchangeableItems\)/);
  assert.match(profileSection, /options\.canEdit/);
  assert.match(profileSection, /buildProgressionXpValue\(sourceXpTotal, \{ prominent: true \}\)/);
  assert.match(profileSection, /buildProgressionLevelChip\(source, \{ prominent: true \}\)/);
  assert.match(app, /function publicLevelBannerImagePath\(presentation = \{\}\)/);
  assert.match(app, /PUBLIC_LEVEL_BANNER_ASSET_SLUGS = new Set/);
  assert.match(app, /\/assets\/backgrounds\/lvlbanner-\$\{slug\}\.webp/);
  assert.match(profileSection, /profile-game-preview-card--featured profile-game-preview-card--current-level/);
  assert.match(profileSection, /applyProfileCurrentLevelCardTheme\(card, source\)/);
  assert.match(profileSection, /scoped \? "Current XP \/ Scoped rank" : "Current XP \/ Global rank"/);
  assert.match(profileSection, /buildProgressionGlobalRankValue\(progression, \{ prominent: true, emptyLabel: "Unranked" \}\)/);
  assert.match(profileSection, /LEADERBOARD_PLACEMENT_ASSETS\[sourcePlacementRank\]/);
  assert.match(profileSection, /Leaderboard placement is separate from/);
  assert.match(profileSection, /No global leaderboard placement has been returned for this identity yet/);
  assert.match(profileSection, /profile-game-preview-card--featured/);
  assert.match(profileSection, /profile-game-progress-meter/);
  assert.match(profileSection, /No level yet/);
  assert.doesNotMatch(profileSection, /value: progression \? buildProgressionRankChip\(progression, \{ compact: true \}\) : "Bronze"/);
  assert.match(profileSection, /XP, level, wallet balance, and inventory hydrate from runtime public authority/);
  assert.match(css, /\.progression-xp-value--prominent/);
  assert.match(css, /\.progression-global-rank-value--prominent/);
  assert.match(css, /\.economy-balance-value--prominent/);
  assert.match(css, /\.economy-balance-icon--full-color/);
  assert.match(css, /\.profile-game-xp-rank-combo--top-1/);
  assert.match(css, /\.profile-game-xp-rank-combo--top-2/);
  assert.match(css, /\.profile-game-xp-rank-combo--top-3/);
  assert.match(css, /\.profile-game-xp-rank-placement-icon/);
  assert.match(css, /\.profile-game-scope-compact/);
  assert.match(css, /\.profile-game-scope-select-input/);
  assert.match(app, /1: "\/assets\/games\/lb-first\.webp"/);
  assert.match(app, /2: "\/assets\/games\/lb-second\.webp"/);
  assert.match(app, /3: "\/assets\/games\/lb-third\.webp"/);
  assert.match(css, /\.progression-level-chip--prominent/);
  assert.match(css, /\.profile-game-preview-card--featured/);
  assert.match(css, /\.profile-game-preview-card--current-level/);
  assert.match(css, /--profile-current-level-color/);
  assert.match(css, /--profile-current-level-banner-image/);
  assert.match(css, /var\(--profile-current-level-banner-image\) right center \/ cover no-repeat/);
  assert.match(css, /\.profile-game-preview-card--current-level::before\s*\{[\s\S]*mask-image:\s*linear-gradient/);
  assert.match(css, /\.profile-game-preview-card--current-level\.has-level-banner::before\s*\{[\s\S]*opacity:\s*0\.62/);
  assert.match(css, /\.profile-game-preview-card--breakdown,[\s\S]*\.profile-game-preview-card--progress\s*\{[\s\S]*grid-column:\s*span 3/);
  assert.match(profileSection, /profile-game-preview-card--breakdown profile-game-preview-card--balance/);
  assert.match(profileSection, /profile-game-preview-card--breakdown profile-game-preview-card--inventory/);
  assert.match(css, /\.profile-game-inventory-stack/);
  assert.match(app, /buildProfileGameCompetitionSection\(profile, \{ canEdit \}\)/);
  assert.match(app, /function buildProfileScopedProgressionSection\(profile = null\)/);
  assert.match(app, /profile\?\.scopedProgression \|\| profile\?\.scoped_progression/);
  assert.doesNotMatch(app, /if \(!rows\.length\) return null/);
  assert.match(app, /hydrateProfileScopedProgression\(profile, profileCode\)/);
  assert.match(app, /"VIEW"/);
  assert.doesNotMatch(scopedProfileSection, /"VIEW BOARD"/);
  assert.match(app, /scopedLeaderboardHref\(row\.scope_key\)/);
  assert.match(profileSection, /buildInventorySummaryList\(scopedInventory, \{ context: scopedProgressionScopeLabel\(selectedRow\) \}\)/);
  assert.match(profileSection, /leaderboardHasInventoryPayload\(selectedRow\)/);
  assert.match(profileSection, /scopedInventoryAvailable \? "Empty" : "Unavailable"/);
  assert.match(css, /\.profile-scoped-progression-section/);
  assert.match(scopedProfileSection, /section\.dataset\.profileChannelStats = "present"/);
  assert.doesNotMatch(scopedProfileSection, /Global Stats/);
  assert.doesNotMatch(scopedProfileSection, /Channel Stats/);
  assert.match(scopedProfileSection, /No channel-scoped XP has been recorded for this profile yet\./);
  assert.match(scopedProfileSection, /Channel scoped progression could not be loaded\./);
  assert.match(scopedProfileSection, /section\.dataset\.scopedBoardsList = "profile"/);
  assert.match(scopedProfileSection, /profile-scoped-progression-list/);
  assert.match(scopedProfileSection, /profile-scoped-progression-table-head/);
  assert.match(app, /"VIEW"/);
  assert.match(css, /\.profile-scoped-progression-row/);
  assert.match(css, /\.profile-scoped-progression-table-head/);
  assert.match(css, /\.profile-scoped-progression-empty/);
  assert.doesNotMatch(app, /profile-scoped-progression-tabs/);
});

test("public scoped platform icons and stable latest stream layout are pinned", () => {
  const app = read("js/public-pages-app.js");
  const hub = read("js/public-data-hub.js");
  const css = read("css/public-shell.css");
  assert.match(app, /SCOPED_PLATFORM_ICON_MAP = Object\.freeze/);
  ["kick", "youtube", "rumble", "twitch", "pilled", "global", "unknown"].forEach((key) => {
    assert.match(app, new RegExp(`${key}:`));
  });
  assert.match(app, /function createScopedPlatformIcon/);
  assert.match(app, /function createScopedPlatformBrandIcon/);
  assert.match(app, /function createScopedPlatformChip/);
  assert.match(app, /createScopedPlatformBrandIcon\(source, "scoped-platform-chip-icon"\)/);
  assert.match(app, /function createScopedProgressionAvatar\(row = \{\}\)/);
  assert.match(app, /icon\.dataset\.scopeOwnerAvatar = "fallback"/);
  assert.match(app, /avatar\.dataset\.scopeOwnerAvatar = "image"/);
  assert.match(app, /avatar\.replaceWith\(fallback\(\)\)/);
  assert.match(css, /img\.profile-game-scope-chip-icon,[\s\S]*img\.scoped-platform-chip-icon,[\s\S]*img\.progression-leaderboard-scope-chip-icon\s*\{[\s\S]*-webkit-mask:\s*none/);
  assert.match(app, /function buildProfileCollapsibleToggle\(details, className = "profile-collapsible-toggle"\)/);
  assert.match(app, /const icon = create\("img", `\$\{className\}-icon`\)/);
  assert.match(app, /label\.textContent = details\.open \? "Collapse" : "Expand"/);
  assert.match(app, /icon\.src = details\.open \? "\/assets\/icons\/ui\/visible\.svg" : "\/assets\/icons\/ui\/hidden\.svg"/);
  assert.match(app, /summary\.append\(action, meta, buildProfileCollapsibleToggle\(details\)\)/);
  assert.match(app, /summary\.append\(action, scopeWrap, buildProfileCollapsibleToggle\(details\)\)/);
  assert.doesNotMatch(app, /hasUsableStream \? stream\?\.platformLabel : "No data available"/);
  assert.doesNotMatch(app, /hasUsableStream \? \(stream\?\.isLive \? "Current live" : "Featured source"\) : "Expand for details"/);
  assert.match(css, /\.profile-collapsible-toggle\s*\{[\s\S]*border-radius:\s*999px/);
  assert.match(css, /\.profile-collapsible-toggle-icon\s*\{[\s\S]*object-fit:\s*contain[\s\S]*filter:\s*brightness\(0\) saturate\(100%\) invert/);
  assert.doesNotMatch(app, /createIcon\(details\.open \? "\/assets\/icons\/ui\/visible\.svg" : "\/assets\/icons\/ui\/hidden\.svg"/);
  assert.match(app, /card\.dataset\.latestStreamLayout = "stable"/);
  assert.match(app, /row\.dataset\.previousStreamsTray = "true"/);
  assert.match(app, /if \(!realRows\.length\) return null/);
  assert.doesNotMatch(app, /No past streams to show yet\./);
  assert.match(app, /function buildLatestStreamTrayEntries\(baseStream\)/);
  assert.match(app, /\.\.\.\(Array\.isArray\(baseStream\?\.recentStreams\) \? baseStream\.recentStreams : \[\]\)/);
  assert.match(app, /\.\.\.\(Array\.isArray\(baseStream\?\.traySources\) \? baseStream\.traySources : \[\]\)/);
  assert.match(app, /candidates\.push\(baseStream\)/);
  assert.match(app, /entry\.isLive \|\| entry\.title \|\| entry\.thumbnailUrl \|\| entry\.posterUrl \|\| entry\.url \|\| entry\.sourceUrl \|\| entry\.channelSlug \|\| entry\.channelHandle/);
  assert.match(app, /buildLatestStreamSourcePreview\(stream\)/);
  assert.match(app, /profile-latest-stream-source-card/);
  assert.match(app, /stream\.platform === "kick" && stream\.isLive && host === "player\.kick\.com"/);
  assert.match(app, /if \(!stream\.isLive\) return ""/);
  assert.match(app, /"Open on Kick"/);
  assert.match(hub, /traySources:\s*\(Array\.isArray\(value\.tray_sources\)/);
  assert.match(app, /traySources:\s*\(Array\.isArray\(value\.tray_sources\)/);
  assert.match(app, /data-latest-stream-state/);
  assert.match(css, /\.profile-latest-stream-card\s*\{[\s\S]*grid-template-columns:\s*minmax\(320px, 1\.18fr\) minmax\(0, 0\.82fr\)/);
  assert.match(css, /\.profile-stream-panel\s*\{[\s\S]*display:\s*grid[\s\S]*gap:\s*10px/);
  assert.match(css, /\.profile-latest-stream-source-card\s*\{/);
  assert.match(css, /\.profile-latest-stream-thumbnails\s*\{[\s\S]*grid-template-columns:\s*repeat\(6, minmax\(0, 1fr\)\)/);
  assert.match(css, /\.profile-latest-stream-thumbnails\s*\{[\s\S]*overflow-x:\s*auto/);
  assert.match(css, /\.profile-latest-stream-thumbnails\s*\{[\s\S]*border:\s*1px solid rgba\(203, 219, 246, 0\.13\)/);
  assert.match(css, /\.profile-latest-stream-thumbnails-empty\s*\{[\s\S]*border:\s*1px dashed rgba\(203, 219, 246, 0\.16\)/);
  assert.match(css, /\.profile-latest-stream-thumbnails-empty::before/);
  assert.match(css, /\.profile-latest-stream-body\s*\{[\s\S]*align-content:\s*start/);
  assert.match(css, /\.profile-latest-stream-body h3\s*\{[\s\S]*overflow-wrap:\s*anywhere/);
  assert.match(app, /function renderScopedLeaderboardTopPreview\(host, state = \{\}\)/);
  assert.match(app, /fetchPublicProgressionLeaderboard\(\{ scopeKey \}\)/);
  assert.match(app, /SCOPED_LEADERBOARD_GALLERY_LIMIT/);
  assert.match(app, /Top 3 unavailable/);
  assert.match(app, /No rankings yet/);
  assert.match(app, /progression-leaderboard-gallery-top-row/);
  assert.match(app, /createScopedProgressionAvatar\(scope\)/);
  assert.match(app, /createScopedPlatformChip\(scope, scopedProgressionPlatformLabel\(scope\)\)/);
  assert.match(app, /"dashboard-action progression-leaderboard-gallery-action", "VIEW"/);
  assert.match(css, /\.progression-leaderboard-gallery-avatar-wrap/);
  assert.match(css, /\.progression-leaderboard-gallery-top-row/);
});

test("public profile overview table uses the same runtime progression summary as games", () => {
  const app = read("js/public-pages-app.js");
  const overviewSection = app.match(/function buildProfileOverviewPanel\(profile, artifacts, helpers\) \{[\s\S]*?return section;\n  \}/)?.[0] || "";
  assert.ok(overviewSection, "profile overview section should exist");
  assert.match(overviewSection, /const progression = profile\?\.progression && typeof profile\.progression === "object" \? profile\.progression : null/);
  assert.match(overviewSection, /const economy = profile\?\.economy && typeof profile\.economy === "object" \? profile\.economy : null/);
  assert.match(overviewSection, /progression\.xp_total \?\? progression\.total_xp \?\? 0/);
  assert.match(overviewSection, /buildProgressionXpValue\(progression\.xp_total \?\? progression\.total_xp \?\? 0, \{ compact: true \}\)/);
  assert.match(overviewSection, /buildProgressionLevelChip\(progression, \{ compact: true \}\)/);
  assert.match(overviewSection, /buildProgressionGlobalRankValue\(progression, \{ compact: true, emptyLabel: "Unranked" \}\)/);
  assert.match(overviewSection, /addRow\("XP", overviewXpValue, !progression\)/);
  assert.match(overviewSection, /addRow\("Level", overviewLevelValue, !progression\)/);
  assert.match(overviewSection, /addRow\("Global Rank", overviewGlobalRankValue, !progression\)/);
  assert.match(overviewSection, /addRow\("Balance", economy \? buildEconomyBalanceValue\(economy, \{ compact: true \}\) : "Starting", false\)/);
  assert.match(overviewSection, /addRow\("Inventory", displayInventory\.length \? `\$\{formatNumber\(displayInventory\.length\)\} item type/);
  assert.doesNotMatch(overviewSection, /addRow\("XP", "Pending", true\)/);
  assert.doesNotMatch(overviewSection, /addRow\("Rank", "Pending", true\)/);
});

test("public level chips include restrained hover sheen without changing compact consumers", () => {
  const css = read("css/public-shell.css");

  assert.match(css, /\.progression-level-chip::before,[\s\S]*\.progression-rank-chip::before\s*\{/);
  assert.match(css, /\.progression-level-chip:hover::before,[\s\S]*\.progression-rank-chip:focus-visible::before\s*\{[\s\S]*animation:\s*progression-rank-chip-sheen 3\.2s/);
  assert.match(css, /@keyframes progression-rank-chip-sheen/);
  assert.match(css, /prefers-reduced-motion:\s*reduce[\s\S]*\.progression-rank-chip::before/);
  assert.match(css, /\.progression-level-chip--compact,[\s\S]*\.economy-balance-value--compact\s*\{[\s\S]*font-size:\s*12px/);
  assert.match(css, /\.progression-level-chip--compact \.progression-level-chip-icon,[\s\S]*\.economy-balance-value--compact \.economy-balance-icon\s*\{[\s\S]*width:\s*16px/);
  assert.match(css, /\.economy-balance-icon\s*\{[\s\S]*mask:\s*var\(--economy-currency-symbol\) center \/ contain no-repeat/);
  assert.match(css, /\.economy-denomination-breakdown\s*\{/);
  assert.match(css, /\.economy-breakdown-icon,[\s\S]*\.economy-denomination-chip img,[\s\S]*\.inventory-summary-icon\s*\{[\s\S]*object-fit:\s*contain/);
});

test("public economy rendering keeps denominations separate from inventory rows", () => {
  const app = read("js/public-pages-app.js");
  const css = read("css/public-shell.css");

  assert.match(app, /currency_unit_label \|\| "Credit"/);
  assert.match(app, /currency_unit_plural_label \|\| `\$\{singular\}s`/);
  assert.match(app, /walletOrValue\.balance_total_credits \?\? walletOrValue\.balance_current/);
  assert.match(app, /function resolveEconomyCashComponent\(wallet = \{\}, totalValue = 0\)/);
  assert.match(app, /options\.showCashComponent && cashValue !== null/);
  assert.match(app, /economy-balance-cash-component/);
  assert.match(app, /walletCard\.appendChild\(buildEconomyDenominationBreakdown\(wallet\)\)/);
  assert.match(app, /icon\.src = economyAssetPath\("\/assets\/games\/sscurrency\.webp"\)/);
  assert.match(app, /function buildInventoryCardLeadValue\(statusText = "Empty"\)/);
  assert.match(app, /economy-balance-value economy-balance-value--prominent profile-game-card-lead profile-game-card-lead--inventory/);
  assert.match(app, /icon\.src = economyAssetPath\("\/assets\/games\/icon-inventory-2\.webp"\)/);
  assert.match(app, /icon\.addEventListener\("error", \(\) => \{[\s\S]*createIcon\("\/assets\/icons\/ui\/moneybag\.svg", "inline-icon-mask economy-balance-icon profile-game-card-lead-icon profile-game-card-lead-icon--fallback profile-game-inventory-lead-icon-fallback"\)[\s\S]*icon\.replaceWith\(fallback\)/);
  assert.match(app, /leadClassName: "profile-game-card-lead profile-game-card-lead--balance"/);
  assert.match(app, /value: buildInventoryCardLeadValue\(scoped \? scopedInventory\.length \? "Itemized" : scopedInventoryAvailable \? "Empty" : "Unavailable" : displayInventory\.length \? "Itemized" : "Empty"\)/);
  assert.doesNotMatch(app, /profile-game-inventory-lead-icon[\s\S]{0,300}(?:□|⬚|blank square)/i);
  assert.match(app, /function economyDenominationIconPath\(item = \{\}\)/);
  assert.match(app, /item\.icon_url \|\|[\s\S]*item\.icon_path \|\|[\s\S]*item\.image_asset_key/);
  assert.match(app, /iconPath: economyDenominationIconPath\(item\)/);
  assert.match(app, /icon\.addEventListener\("error", \(\) => \{/);
  assert.match(app, /function isWalletDenominationInventoryItem\(item = \{\}\)/);
  assert.match(app, /\["currency\.coin", "currency\.bank_token"\]\.includes\(itemCode\)/);
  assert.doesNotMatch(app, /metadata\.system_asset_type === "economy_denomination"/);
  assert.match(app, /return Number\(item\?\.quantity \|\| 0\) > 0 && !isWalletDenominationInventoryItem\(item\)/);
  assert.match(app, /const displayInventory = inventory\.filter\(\(item\) => !isWalletDenominationInventoryItem\(item\)\)/);
  assert.match(app, /"currency\.gem\.green"/);
  assert.match(app, /"currency\.gem\.red"/);
  assert.match(app, /"currency\.gem\.blue"/);
  assert.match(app, /"currency\.diamond"/);
  assert.match(app, /className: "inventory-summary-row"/);
  assert.match(app, /rowDataAttribute: "data-inventory-row"/);
  assert.match(app, /rowDataAttribute: "data-wallet-row"/);
  assert.match(app, /itemInfoKind: "wallet"/);
  assert.match(app, /itemInfoKind: "inventory"/);
  assert.match(app, /pagerAttribute: "data-inventory-pager"/);
  assert.match(app, /pagerAttribute: "data-wallet-pager"/);
  assert.match(app, /pageAttribute: "data-wallet-page"/);
  assert.match(app, /pageAttribute: "data-inventory-page"/);
  assert.match(app, /data-item-info-trigger/);
  assert.match(app, /data-item-tooltip-state/);
  assert.match(app, /data-item-tooltip-active/);
  assert.match(app, /data-item-tooltip-pinned/);
  assert.match(app, /chatAlias: entry\.chat_alias \|\| definition\.chat_alias \|\| publicMetadata\.chat_alias \|\| ""/);
  assert.match(app, /Chat alias: \$\{info\.chatAlias\}/);
  assert.match(app, /dataset\.itemInfoPopover = "singleton"/);
  assert.match(app, /ITEM_INFO_FALLBACK_DESCRIPTION = "No public item description has been added yet\."/);
  assert.match(app, /row\.classList\.add\("economy-asset-row", "economy-item-row", "profile-economy-item-row"\)/);
  assert.match(app, /dataset\.profileEconomyRow = "true"/);
  assert.match(app, /quantityPrefix: "x"/);
  assert.match(app, /row\.append\(icon, body, create\("strong", "economy-breakdown-quantity", `\$\{entry\.quantityPrefix \|\| ""\}\$\{formatNumber\(entry\.quantity \|\| 0\)\}`\)\)/);
  assert.match(app, /entries\.slice\(\(page - 1\) \* pageSize, page \* pageSize\)/);
  assert.match(app, /const ECONOMY_LIST_PAGE_SIZE = 6/);
  assert.match(app, /if \(options\.pageAttribute\) pager\.setAttribute\(options\.pageAttribute, String\(page\)\)/);
  assert.match(app, /const width = Math\.min\(560, Math\.max\(320, window\.innerWidth - 32\)\)/);
  assert.doesNotMatch(app, /rows\.slice\(0, 6\)\.map/);
  assert.doesNotMatch(app, /row\.appendChild\(buildItemInfoPopover\(info\)\)/);
  assert.match(app, /const exchangePanel = buildPublicValueItemExchangePanel\(exchangeableItems\)/);
  assert.match(app, /Gems and diamonds cannot be purchased directly/);
  assert.match(app, /body: JSON\.stringify\(\{[\s\S]*item_code: itemCode,[\s\S]*quantity,[\s\S]*reason_text: reasonText/);
  assert.match(css, /--profile-economy-row-min-height:\s*44px/);
  assert.match(css, /--profile-economy-row-padding-y:\s*7px/);
  assert.match(css, /--profile-economy-row-icon-size:\s*24px/);
  assert.match(css, /--profile-economy-row-radius:\s*10px/);
  assert.match(css, /\.economy-breakdown-row,[\s\S]*\.economy-denomination-chip,[\s\S]*\.inventory-summary-row\s*\{[\s\S]*grid-template-columns:\s*var\(--profile-economy-row-icon-size, 24px\) minmax\(0, 1fr\) auto/);
  assert.match(css, /\.economy-breakdown-row,[\s\S]*\.economy-denomination-chip,[\s\S]*\.inventory-summary-row\s*\{[\s\S]*min-height:\s*var\(--profile-economy-row-min-height, 44px\)/);
  assert.match(css, /\.economy-breakdown-row,[\s\S]*\.economy-denomination-chip,[\s\S]*\.inventory-summary-row\s*\{[\s\S]*padding:\s*var\(--profile-economy-row-padding-y, 7px\) var\(--profile-economy-row-padding-x, 9px\)/);
  assert.match(css, /\.economy-breakdown-row,[\s\S]*\.economy-denomination-chip,[\s\S]*\.inventory-summary-row\s*\{[\s\S]*border-radius:\s*var\(--profile-economy-row-radius, 10px\)/);
  assert.match(css, /\.economy-breakdown-icon,[\s\S]*\.economy-denomination-chip img,[\s\S]*\.inventory-summary-icon\s*\{[\s\S]*width:\s*var\(--profile-economy-row-icon-size, 24px\)/);
  assert.doesNotMatch(css, /\.inventory-summary-row\s*\{\s*border-top:\s*0;\s*\}/);
  assert.match(css, /\.profile-game-inventory-stack\s*\{\s*margin-top:\s*0;\s*\}/);
  assert.match(css, /\.item-info-popover\s*\{/);
  assert.match(css, /\.item-info-popover\[data-item-info-popover="singleton"\]:not\(\[hidden\]\)/);
  assert.doesNotMatch(css, /\.economy-asset-row\[data-item-tooltip-active="true"\] > \.item-info-popover/);
  assert.match(css, /\.economy-breakdown-pager\s*\{/);
  assert.match(css, /\.economy-balance-cash-component\s*\{/);
  assert.match(css, /\.profile-game-card-lead\s*\{[\s\S]*min-height:\s*34px/);
  assert.match(css, /\.profile-game-card-lead \.profile-game-card-lead-icon,[\s\S]*\.profile-game-card-lead \.economy-balance-icon\s*\{[\s\S]*width:\s*30px/);
  assert.match(css, /\.profile-game-card-lead-icon--fallback\s*\{[\s\S]*place-items:\s*center/);
});

test("public economy item tooltip controller keeps one active popover and preserves fallback copy", () => {
  const app = read("js/public-pages-app.js");
  const css = read("css/public-shell.css");

  assert.match(app, /const itemInfoController = \{[\s\S]*activeItemId:\s*"",[\s\S]*activeSource:\s*"",[\s\S]*activeRow:\s*null,[\s\S]*activeMode:\s*"closed"[\s\S]*pinned:\s*false,[\s\S]*popover:\s*null/);
  assert.match(app, /function getItemInfoPopover\(\)/);
  assert.match(app, /popover\.dataset\.itemInfoPopover = "singleton"/);
  assert.match(app, /function positionItemInfoPopover\(row, popover\)/);
  assert.match(app, /function renderItemInfoPopoverContent\(popover, info = \{\}\)/);
  assert.match(app, /function activateItemInfo\(row, mode = "hover"\)/);
  assert.match(app, /itemInfoController\.activeRow && itemInfoController\.activeRow !== row[\s\S]*markItemInfoRow\(itemInfoController\.activeRow, "closed"\)/);
  assert.match(app, /mode === "hover" && itemInfoController\.activeMode === "pinned"/);
  assert.match(app, /row\.__streamsuitesItemInfo = info/);
  assert.match(app, /itemInfoController\.activeItemId = row\.dataset\.itemInfoId \|\| ""/);
  assert.match(app, /itemInfoController\.activeSource = row\.dataset\.itemInfoKind \|\| ""/);
  assert.match(app, /popover\.dataset\.itemInfoKind = itemInfoController\.activeSource/);
  assert.match(app, /row\.addEventListener\("mouseenter", \(\) => activateItemInfo\(row, "hover"\)\)/);
  assert.match(app, /row\.addEventListener\("mouseleave", \(\) => \{[\s\S]*closeActiveItemInfo\(document\)/);
  assert.match(app, /row\.addEventListener\("focus", \(\) => activateItemInfo\(row, "hover"\)\)/);
  assert.match(app, /function findItemInfoActivationRow\(target\)/);
  assert.match(app, /target\?\.closest\?\.\("\[data-item-info-trigger\]"\)/);
  assert.match(app, /row\.matches\?\.\('\[data-wallet-row="true"\], \[data-inventory-row="true"\], \[data-profile-economy-row="true"\]'\)/);
  assert.match(app, /function shouldIgnoreItemInfoActivation\(target, row\)/);
  assert.match(app, /function openItemInfoLightboxFromRow\(row\)/);
  assert.match(app, /openEconomyItemLightbox\(payload, \{[\s\S]*kind: row\.dataset\.itemInfoKind \|\| "item"[\s\S]*navigationItems: row\.__streamsuitesItemInfoNavigationItems \|\| \[\][\s\S]*navigationIndex: Number\(row\.dataset\.itemInfoNavigationIndex \|\| 0\)[\s\S]*\}, row\)/);
  assert.match(app, /document\.addEventListener\("click", \(event\) => \{[\s\S]*const row = findItemInfoActivationRow\(event\.target\)[\s\S]*openItemInfoLightboxFromRow\(row\)/);
  assert.match(app, /document\.addEventListener\("keydown", \(event\) => \{[\s\S]*event\.key === "Enter" \|\| event\.key === " "[\s\S]*openItemInfoLightboxFromRow\(row\)/);
  const wireItemInfoTriggerBlock = extractBetween(app, "  function wireItemInfoTrigger(row) {", "  if (!window.__streamsuitesItemInfoDismissBound) {");
  assert.doesNotMatch(wireItemInfoTriggerBlock, /row\.addEventListener\("click"/);
  assert.doesNotMatch(wireItemInfoTriggerBlock, /openEconomyItemLightbox/);
  assert.match(app, /row\.__streamsuitesItemInfoRaw = entry\.itemInfo \|\| entry/);
  assert.match(app, /event\.key === "Escape"[\s\S]*closeActiveItemInfo\(document\)/);
  assert.match(app, /event\.target\?\.closest\?\.\('\[data-item-info-popover="singleton"\]'\)/);
  assert.match(app, /ITEM_INFO_FALLBACK_DESCRIPTION = "No public item description has been added yet\."/);
  assert.match(css, /\.economy-asset-row:hover,[\s\S]*\.economy-asset-row:focus-visible,[\s\S]*\.economy-asset-row\[data-item-tooltip-active="true"\]\s*\{[\s\S]*box-shadow:/);
  assert.match(css, /\.item-info-popover\s*\{[\s\S]*display:\s*none/);
  assert.doesNotMatch(css, /\.economy-asset-row:hover \.item-info-popover/);
  assert.doesNotMatch(css, /\.inventory-summary-list:hover \.item-info-popover/);
  assert.doesNotMatch(css, /\[data-item-info-popover\][^{]*\{[\s\S]*display:\s*grid/);
  assert.match(css, /\.item-info-popover\s*\{[\s\S]*grid-template-columns:\s*160px minmax\(0, 1fr\)/);
  assert.match(css, /\.item-info-popover-media\s*\{[\s\S]*width:\s*160px/);
  assert.match(css, /\.item-info-popover-icon\s*\{[\s\S]*width:\s*140px/);
  assert.match(app, /item-info-popover-icon item-info-popover-icon--large/);
  assert.match(app, /info\.description \|\| ITEM_INFO_FALLBACK_DESCRIPTION/);
});

test("public economy item lightbox normalizes wallet inventory profile and market payloads safely", () => {
  const app = read("js/public-pages-app.js");
  assert.doesNotMatch(app, /categoryDisplayLabel/);
  const snippet = extractBetween(app, "  function firstPresent(...values) {", "  function wireItemInfoTrigger(row) {");
  const context = {
    console,
    toTitle(value) {
      return String(value || "").trim().replace(/[_-]+/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
    },
    formatLabel(value) {
      return String(value || "").trim().replace(/[_-]+/g, " ");
    },
    formatNumber(value) {
      return String(value);
    },
    economyItemCategoryLabel(item = {}) {
      if (String(item.item_code || "").includes("combat_vehicle")) return "Combat Vehicles";
      return String(item.category_label || item.category || item.item_type || item.type || item.item_code || "").trim().replace(/[_-]+/g, " ") || "Other";
    },
    economyItemImagePath(item = {}) {
      return String(item.image_url || item.image_path || item.icon_url || item.icon_path || "").trim();
    },
    economyDenominationIconPath(item = {}) {
      return String(item.denomination_icon_url || item.icon_url || "").trim();
    },
    economyItemActionLabel(item = {}, options = {}) {
      return options.actionLabel || (item.__storefront_action === "exchange" ? "Exchange" : "Buy");
    },
    economyItemAvailabilityLabel(item = {}) {
      return String(item.availability || "").trim();
    },
    create() {
      return { append() {} };
    }
  };
  vm.runInNewContext(`${snippet}
this.normalizeEconomyItemLightboxData = normalizeEconomyItemLightboxData;
this.fallbackEconomyItemLightboxData = fallbackEconomyItemLightboxData;
this.formatEconomyDetailTimestamp = formatEconomyDetailTimestamp;
this.normalizeItemDetailTags = normalizeItemDetailTags;
this.collectEconomyItemDetailTagSources = collectEconomyItemDetailTagSources;`, context, { filename: "item-lightbox-normalizer.js" });

  const walletDetail = context.normalizeEconomyItemLightboxData({
    denomination_code: "currency.coin",
    display_name: "Coin",
    count: 4,
    balance_total_credits: 400,
    type: "currency"
  }, { kind: "wallet" });
  assert.equal(walletDetail.title, "Coin");
  assert.ok(walletDetail.chips.includes("Wallet"));
  assert.ok(walletDetail.meta.some((row) => row.label === "Category" && row.value === "currency"));

  const inventoryDetail = context.normalizeEconomyItemLightboxData({
    item_code: "gem.red",
    label: "Red Gem",
    quantity: 2,
    category: "gems",
    definition: { public_metadata: {} }
  }, { kind: "inventory" });
  assert.equal(inventoryDetail.title, "Red Gem");
  assert.ok(inventoryDetail.chips.includes("Inventory"));
  assert.ok(inventoryDetail.stats.some((row) => row.label === "Held" && row.value === "2"));

  const profileDetail = context.normalizeEconomyItemLightboxData({
    item_code: "profile.badge",
    display_name: "Profile Badge",
    quantity: 1,
    category_label: "Platform Badges"
  }, { kind: "inventory" });
  assert.equal(profileDetail.title, "Profile Badge");
  assert.ok(profileDetail.meta.some((row) => row.label === "Category" && row.value === "Platform Badges"));

  const marketDetail = context.normalizeEconomyItemLightboxData({
    item_code: "combat_vehicle.tank",
    display_name: "Tank",
    market_price_stekels: 25,
    availability: "Available"
  }, { kind: "market", actionLabel: "Buy" });
  assert.equal(marketDetail.title, "Tank");
  assert.ok(marketDetail.chips.includes("Buy"));
  assert.ok(marketDetail.meta.some((row) => row.label === "Category" && row.value === "Combat Vehicles"));
  assert.ok(marketDetail.stats.some((row) => row.label === "Price" && row.currency === true));

  const fallbackDetail = context.fallbackEconomyItemLightboxData({ item_code: "fallback.item" }, { kind: "inventory" });
  assert.equal(fallbackDetail.title, "fallback.item");
  assert.ok(fallbackDetail.chips.includes("Inventory"));
  assert.equal(context.formatEconomyDetailTimestamp("2026-06-06T03:44:17Z"), "June 6th, 2026 at 03:44am UTC");
  assert.equal(context.formatEconomyDetailTimestamp("not-a-date"), "not-a-date");

  const commaTagsDetail = context.normalizeEconomyItemLightboxData({
    item_code: "vehicle.limo",
    label: "Limo",
    tags: "limo, limousine, Cadillac"
  }, { kind: "market" });
  assert.equal(commaTagsDetail.tags.join("|"), "limo|limousine|cadillac");
  assert.equal(commaTagsDetail.meta.find((row) => row.variant === "tags"), undefined);

  const nestedDefinitionTags = context.normalizeEconomyItemLightboxData({
    item_code: "vehicle.limo",
    definition: { tags: ["#Limo", { label: "Cadillac" }] }
  }, { kind: "inventory" });
  assert.equal(nestedDefinitionTags.tags.join("|"), "limo|cadillac");

  assert.equal(context.normalizeItemDetailTags("A, a, B").join("|"), "a|b");

  assert.equal(context.normalizeItemDetailTags(["limo", "limousine", "Cadillac"]).length, 3);
  assert.equal(
    context.normalizeItemDetailTags([{ label: "limo" }, { name: "limousine" }, { value: "Cadillac" }]).join("|"),
    "limo|limousine|cadillac"
  );
  assert.equal(
    context.normalizeItemDetailTags(
      ...context.collectEconomyItemDetailTagSources(
        { item_code: "vehicle.limo" },
        { tags: ["limousine", "Cadillac"] },
        { tags: ["limo"] },
        {}
      )
    ).join("|"),
    "limo|limousine|cadillac"
  );
  assert.equal(
    context.normalizeItemDetailTags(
      ...context.collectEconomyItemDetailTagSources({ attributes: { tags: ["limo", "limousine", "Cadillac"] } }, {}, {}, {})
    ).join("|"),
    "limo|limousine|cadillac"
  );
  assert.equal(
    context.normalizeItemDetailTags(
      ...context.collectEconomyItemDetailTagSources({ tags: [{ label: "limo, limousine, Cadillac" }] }, {}, {}, {})
    ).join("|"),
    "limo|limousine|cadillac"
  );
});

test("public economy item lightbox renders hashtag tag chips and scoped item code styling", () => {
  const app = read("js/public-pages-app.js");
  const css = read("css/public-shell.css");

  assert.match(app, /function collectEconomyItemDetailTagSources\(/);
  assert.match(app, /function appendEconomyItemDetailTagFields\(/);
  assert.match(app, /function economyItemDetailTagContainer\(/);
  assert.match(app, /function normalizeItemDetailTags\(\.\.\.sources\)/);
  assert.match(app, /function buildEconomyItemTagChips\(tags = \[\]\)/);
  assert.match(app, /economyItemTagChipLabel\(tag\)/);
  assert.match(app, /tags: normalizeItemDetailTags/);
  assert.match(app, /variant: "item-code"/);
  assert.match(app, /create\("dd", "economy-item-code-value", row\.value\)/);
  assert.match(app, /buildEconomyItemDetailTagGroup\(detail\.tags\)/);
  assert.match(app, /tags: normalizeItemDetailTags\(\.\.\.collectEconomyItemDetailTagSources/);
  assert.match(css, /\.market-item-lightbox-tags\s*\{/);
  assert.match(css, /\.economy-item-tag-chip\s*\{[\s\S]*SuiGenerisRg[\s\S]*font-weight:\s*400[\s\S]*rgba\(186,\s*220,\s*255/);
  assert.match(css, /\.market-item-lightbox \.economy-item-code-value\s*\{[\s\S]*SUSEMono/);
  assert.match(css, /\.market-item-lightbox \.market-exchange-quantity\s*\{[\s\S]*color-scheme:\s*dark/);
});

test("public economy item lightbox exposes scoped navigation and currentColor currency symbols", () => {
  const app = read("js/public-pages-app.js");
  const css = read("css/public-shell.css");

  assert.match(app, /navigationItems: row\.__streamsuitesItemInfoNavigationItems \|\| \[\]/);
  assert.match(app, /navigationItems = Array\.isArray\(options\.navigationItems\)/);
  assert.match(app, /event\.key === "ArrowLeft"[\s\S]*navigate\(-1\)/);
  assert.match(app, /event\.key === "ArrowRight"[\s\S]*navigate\(1\)/);
  assert.match(app, /market-item-lightbox-header/);
  assert.match(app, /market-item-lightbox-nav-group/);
  assert.match(app, /buildEconomyCurrencyAmount\(Number\(stat\.rawValue\)\)/);
  assert.match(app, /market-item-price-icon"\);[\s\S]*--economy-currency-symbol/);
  assert.match(css, /\.market-item-lightbox-nav--prev/);
  assert.match(css, /\.market-item-lightbox-nav--next/);
  assert.doesNotMatch(css, /\.market-item-lightbox-nav\s*\{[\s\S]*position:\s*absolute[\s\S]*top:\s*50%/);
  assert.match(css, /\.market-item-lightbox-header\s*\{[\s\S]*grid-column:\s*1 \/ -1/);
  assert.match(css, /\.market-item-price-icon\s*\{[\s\S]*background:\s*currentColor[\s\S]*mask:\s*var\(--economy-currency-symbol\)/);
  assert.match(css, /\.economy-currency-amount-icon\s*\{[\s\S]*height:\s*0\.92em[\s\S]*background:\s*currentColor/);
  assert.match(css, /\.market-item-lightbox \.economy-currency-amount-value[\s\S]*color:\s*#f8fbff/);
});

test("public games exchange section hydrates exchange-capable payload rows into wider category cards", () => {
  const app = read("js/public-pages-app.js");
  const css = read("css/public-shell.css");

  assert.match(app, /function buildGamesExchangeItems\(payload = \{\}\)/);
  assert.match(app, /appendPublicExchangeItems\(rows, payload\?\.public_item_definitions/);
  assert.match(app, /appendPublicExchangeItems\(rows, payload\?\.market/);
  assert.match(app, /isEconomyExchangeCapableItem/);
  assert.match(app, /items: exchangeItems/);
  assert.match(app, /if \(!groups\.length\) wanted\.forEach/);
  assert.match(css, /\.market-exchange-category-layout\s*\{[\s\S]*minmax\(min\(100%, 360px\), 1fr\)/);
  assert.match(css, /\.market-exchange-category-layout\s*\{[\s\S]*align-items:\s*stretch/);
  assert.match(css, /\.market-exchange-category-card\s*\{[\s\S]*align-self:\s*stretch/);
  assert.match(css, /\.market-exchange-category-card\s*\{[\s\S]*grid-template-rows:\s*auto minmax\(0, 1fr\)/);
  assert.match(css, /\.market-exchange-category-rows\s*\{[\s\S]*align-content:\s*start/);
  assert.match(css, /\.market-exchange-category-rows \.market-exchange-item-card\s*\{[\s\S]*grid-template-columns:\s*87px minmax\(0, 1fr\)/);
  assert.match(css, /\.market-exchange-category-rows \.market-exchange-item-card > \.market-item-details-action\s*\{[\s\S]*width:\s*100%/);
  assert.match(app, /wireMarketItemDetailsTrigger\(detailsButton, item, itemOptions\)/);
});

test("public games exchange section paginates categories independently with gems and currency first", () => {
  const app = read("js/public-pages-app.js");
  const css = read("css/public-shell.css");

  assert.match(app, /GAMES_EXCHANGE_CATEGORY_PAGE_SIZE_OPTIONS = Object\.freeze\(\[5, 10, 25, 50\]\)/);
  assert.match(app, /GAMES_EXCHANGE_DEFAULT_CATEGORY_PAGE_SIZE = 5/);
  assert.match(app, /function sortExchangeCategoryGroups/);
  assert.match(app, /function exchangeCategorySortRank/);
  assert.match(app, /const wanted = \["Gems", "Currency"/);
  assert.match(app, /sortExchangeCategoryGroups\([\s\S]*economyMarketGroups/);
  assert.match(app, /buildExchangeCategoryPageSizeControl/);
  assert.match(app, /Rows per category/);
  assert.match(app, /buildExchangeCategoryPaginationControls/);
  assert.match(app, /onExchangeCategoryPageChange/);
  assert.match(app, /onExchangeCategoryPageSizeChange/);
  assert.match(app, /gamesState\.exchangeCategoryPages = clampExchangeCategoryPages/);
  assert.match(app, /dataset\.exchangeCategoryPagination = options\.categoryLabel/);
  assert.match(app, /onPageChange: \(nextPage\) => options\.onExchangeCategoryPageChange\?\.\(group\.label/);
  assert.match(app, /function scrollExchangeCategoryIntoView/);
  assert.match(app, /pendingExchangeCategoryScroll/);
  assert.match(app, /scrollExchangeCategoryIntoView\(pendingCategoryScroll\)/);
  assert.match(app, /allRows\.slice\(pageStart, pageStart \+ pageSize\)/);
  assert.match(app, /totalRows > pageSize/);
  assert.match(css, /\.market-exchange-page-size-toolbar/);
  assert.match(css, /\.market-exchange-category-pagination/);
});

test("public economy item rows delegate click and keyboard activation to the lightbox", () => {
  const app = read("js/public-pages-app.js");
  const snippet = extractBetween(app, "  const itemInfoController = {", "  function economyCurrencyLabel(wallet = {}, value = 0) {");
  const listeners = { click: [], keydown: [] };
  const opened = [];
  const context = {
    window: {
      __streamsuitesItemInfoDismissBound: false,
      addEventListener() {}
    },
    document: {
      addEventListener(type, handler) {
        if (listeners[type]) listeners[type].push(handler);
      },
      querySelector() {
        return null;
      },
      querySelectorAll() {
        return [];
      }
    },
    requestAnimationFrame() {},
    openEconomyItemLightbox(payload, options, row) {
      opened.push({ payload, options, row });
    }
  };
  vm.runInNewContext(snippet, context, { filename: "item-info-delegation.js" });

  const row = {
    dataset: { itemInfoKind: "inventory", itemTooltipActive: "false", itemTooltipState: "closed", itemTooltipPinned: "false" },
    __streamsuitesItemInfoRaw: { item_code: "gem.red", quantity: 2 },
    classList: { toggle() {}, remove() {} },
    setAttribute(name, value) {
      this[name] = value;
    },
    matches(selector) {
      return selector.includes("[data-inventory-row=\"true\"]");
    },
    closest(selector) {
      return selector === "[data-item-info-trigger]" ? this : null;
    }
  };
  const clickEvent = {
    target: row,
    defaultPrevented: false,
    propagationStopped: false,
    preventDefault() {
      this.defaultPrevented = true;
    },
    stopPropagation() {
      this.propagationStopped = true;
    }
  };
  listeners.click.forEach((handler) => handler(clickEvent));
  assert.equal(opened.length, 1);
  assert.equal(opened[0].payload.item_code, "gem.red");
  assert.equal(opened[0].options.kind, "inventory");
  assert.equal(opened[0].row, row);
  assert.equal(clickEvent.defaultPrevented, true);
  assert.equal(clickEvent.propagationStopped, true);
  assert.equal(row.dataset.itemTooltipState, "closed");

  const keyEvent = {
    target: { ...row, dataset: { ...row.dataset, itemInfoKind: "wallet" }, __streamsuitesItemInfoRaw: { denomination_code: "currency.coin", count: 4 } },
    key: " ",
    defaultPrevented: false,
    preventDefault() {
      this.defaultPrevented = true;
    },
    stopPropagation() {}
  };
  listeners.keydown.forEach((handler) => handler(keyEvent));
  assert.equal(opened.length, 2);
  assert.equal(opened[1].options.kind, "wallet");
  assert.equal(opened[1].payload.denomination_code, "currency.coin");
  assert.equal(keyEvent.defaultPrevented, true);

  const profileRow = {
    dataset: { itemInfoKind: "inventory", itemTooltipActive: "false", itemTooltipState: "closed", itemTooltipPinned: "false" },
    __streamsuitesItemInfoRaw: { item_code: "profile.badge", quantity: 1 },
    classList: { toggle() {}, remove() {} },
    setAttribute(name, value) {
      this[name] = value;
    },
    matches(selector) {
      return selector.includes("[data-profile-economy-row=\"true\"]");
    },
    closest(selector) {
      return selector === "[data-item-info-trigger]" ? this : null;
    }
  };
  listeners.click.forEach((handler) => handler({ target: profileRow, preventDefault() {}, stopPropagation() {} }));
  assert.equal(opened.length, 3);
  assert.equal(opened[2].payload.item_code, "profile.badge");
});

test("public profile progress meter uses animated electric blue fill", () => {
  const app = read("js/public-pages-app.js");
  const css = read("css/public-shell.css");

  assert.match(app, /fill\.style\.setProperty\("--profile-progress-target", `\$\{sourceProgressPercent\}%`\)/);
  assert.match(app, /profile-game-progress-meter profile-game-progress-meter--animated/);
  assert.match(app, /profile-game-progress-meter-fill profile-game-progress-meter-fill--electric/);
  assert.match(css, /\.profile-game-progress-meter-fill\s*\{[\s\S]*linear-gradient\(90deg, #0487ff 0%, #18c3ff 52%, #78ecff 100%\)/);
  assert.match(css, /animation:\s*profile-game-progress-fill 820ms/);
  assert.match(css, /\.profile-game-preview-card--progress:hover \.profile-game-progress-meter-fill\s*\{[\s\S]*animation:\s*profile-game-progress-refill 620ms/);
  assert.match(css, /@keyframes profile-game-progress-fill/);
  assert.match(css, /@keyframes profile-game-progress-refill/);
  assert.match(css, /prefers-reduced-motion:\s*reduce[\s\S]*profile-game-progress-meter-fill/);
});
