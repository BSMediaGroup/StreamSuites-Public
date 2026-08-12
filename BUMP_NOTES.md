# Bump Notes

## RELEASED / PACKAGED: 0.5.0-alpha

Packaged / released and no longer the active pending bucket. Preserve new notes for the open `0.5.4-alpha` section below.

## CURRENT VER= 0.5.4-alpha / PENDING VER= 0.5.5-alpha

### 2026-08-13 - Profile editor framing, footer, status, and Rumble input correction

- Reframed the owner editor as a fixed-height dialog grid with one independently scrolling content body and a stable action row. Sidebar links now scroll that body without mutating the page hash, synchronize active section/progress state, and retain keyboard focus semantics; desktop and mobile action controls remain reachable without the former blank lower region.
- Corrected the remaining dialog frame defects: focus can no longer scroll the outer modal and clip its header, the action row uses border-box sizing instead of adding its padding below the declared height, and the theme spine now paints continuously above the header, scrolling body, action row, and rounded bottom edge. The desktop action row measures exactly 72px; the mobile editor remains exactly viewport-contained with no horizontal overflow.
- Promoted the selected profile preset to the standalone page root so detached profile overlays inherit it. Editor chrome, primary controls, inventory item popovers/lightboxes, badge tooltips, and the footer edge now consume the same active gradient variables. Signal Red was strengthened to a bolder `#f02038` / `#ff3348` pair with a deeper `#580817` scarlet endpoint.
- Replaced the fixed slim profile footer with a compact normal-flow footer derived from the main landing page's lockup, grouped links, copyright, and version treatment. The profile-only inline status override was removed, so the shared status widget once again floats at the viewport edge and uses its existing homepage geometry to rise 12px above the footer when it enters view.
- Expanded the profile footer's inner track to the same 1280px responsive gutter as the page and replaced the short offset accent segment with a continuous full-viewport theme gradient, eliminating the narrow-footer appearance and hard colour cut.
- Updated the Rumble fallback guidance in the on-page editor to request the direct iframe URL from Rumble Share → Embed. Runtime/Auth validates that deterministic player shape without a provider fetch; Public still never mints or trusts a player URL from raw input. No deployment, version/build change, commit, or push was performed.
- Validation passed all 172 Public Node tests, JavaScript syntax, and rendered Chromium checks at 1366×768, 1060×640, 768×1024, and 390×844. At 1060×640 the desktop dialog measured from 22px to 618px with outer `scrollTop: 0`, a fully visible 162.9px header after Page Style navigation, and an exact 72px action row ending at the dialog bottom. Signal Red computed as `#f02038`, `#ff3348`, and `#580817` on the page root, with matching editor and inventory-lightbox spine gradients. The footer measured the full 1060px viewport with a 996.4px inner track and continuous edge, while the shared status widget rested 12.95px above it. Mobile measured exactly 390×844 with zero horizontal overflow. A mocked Runtime-approved Rumble projection created exactly one iframe at `https://rumble.com/embed/v7bv5ia/?pub=vmzw3`; live Rumble playback was not claimed.

### 2026-08-13 - Public profile edit icon correction

- Replaced the public profile owner's former generic edit glyph with the supplied `assets/icons/ui/editcon.svg` asset in both edit-profile entry points. The existing button labels, tooltip, focus behavior, modal workflow, layout, and Runtime/Auth contract are unchanged; `editcon-filled.svg` remains unused. No deployment, version/build change, commit, or push was performed.

### 2026-08-13 - Safe video-based extended About presentation

#### Technical notes

- Extended the existing standalone profile and owner editor so About selects exactly one Runtime/Auth-backed variant: preserved text or one validated YouTube video/live, Rumble video/live, or Kick live-channel player. Bio, routes, anchors, identity data, live state, artifacts, progression, economy, social links, and profile themes remain unchanged.
- Added provider guidance, authenticated validate/preview feedback, explicit video removal, responsive 16:9 presentation, provider attribution/source actions, loading and unavailable fallbacks, and DOM-created lazy iframes with fullscreen support, strict referrer policy, and no client-added autoplay. Public performs defense-in-depth validation but never derives canonical embed authority.
- Added a narrow Pages CSP `frame-src` allowlist retaining existing Turnstile, YouTube-nocookie, and Twitch frame origins while permitting the three Runtime-approved players. Focused Public tests passed 47/47. No deployment, version/build change, commit, or push was performed.

#### Human-readable notes

Public profiles can now use their expanded About area for either a written story or a clean, responsive provider video without accepting pasted embed code or weakening the rest of the page.

### 2026-08-13 - Owner profile studio, distinct About story, and coordinated page themes

#### Technical notes

- Restored a separate expanded About section without duplicating the concise hero biography: Runtime `bio` remains the identity-header Bio, while the new authoritative `about` field renders as a dedicated profile-story section beneath the hero and preserves safe paragraph breaks.
- Rebuilt the signed-in owner editor as a responsive, keyboard-contained lightbox with live cover/avatar/identity preview, explicit Identity, Bio and About, Page Style, and Social Links panels, focused edit affordances, character limits, validation, sticky actions, Escape handling, and mobile full-screen behavior. The owner and Creator editors use the same Runtime-backed fields.
- Added twelve restrained feature-gradient presets: Violet Blue (default), Crimson Magenta, Signal Red, Emerald Cyan, Gold Amber, Royal Blue, Magenta Violet, Red Gold, Green Gold, Dark Slate, Neutral Greytone, and Frosted Silver. The chosen preset coordinates the page flourish system and the CSS-masked StreamSuites header emblem, while the default emblem cycles through violet-blue shades into its established luminous hover gradient and remains static under reduced motion.
- Rebalanced the default Violet Blue emblem toward brighter violet-blue tones at rest and a restrained, non-white hover spectrum. Owner editing now uses a familiar pencil glyph in a discreet icon-only header control, while the redundant bulky `Manage` action was removed from the hero signal widget; the lower owner-controls edit entry remains available.
- The hero's primary visitor action now prefers the first canonical social platform link, producing labels such as `View on Rumble`, after a real live action and before the public-work/copy fallbacks. No route, auth, live, artifact, economy, inventory, social ordering, or authority contract was replaced.

#### Human-readable notes

Creators can now treat the short hero introduction and their fuller story as two deliberate pieces of profile content, edit both in a polished on-page studio, and choose a coordinated colour or neutral finish for the whole profile—including the header mark.

### 2026-08-12 - Premium adaptive standalone public profiles

#### Technical notes

- Rebuilt the canonical `/u/<slug>` presentation around a cinematic media-aware identity hero, one truthful live/offline status and action rail, a compact sticky section navigator, a concise overview composition, deliberate live-stream framing, type-accented public work, identity badges, Runtime-backed game/progression panels, content-volume-aware social/share layouts, owner controls, and a quiet authority/safety boundary. The new `css/public-profile.css` layer is scoped only to the standalone profile route; shared Public shell, community, artifact, Status, Health, landing, and download surfaces retain their existing presentation contracts.
- Replaced the initial full-bleed profile treatment after rendered review with a cohesive creator-dashboard composition informed by the approved visual references: a contained violet/blue cover frame, overlapping portrait and identity dock, compact integrated status/actions/identity metrics, equalized overview cards, denser artifact/badge/presence modules, and a substantially shorter responsive page. The correction applies to the whole standalone route rather than only its hero and preserves the same data and interaction contracts.
- Follow-up profile polish now exposes the authoritative user-defined cover without decorative replacement artwork, clips the hero feature spine to the identity card radius, restores the existing compact social-link rail and account dropdown in the header, moves identity badges ahead of the public-work gallery, restores badge-specific colour treatments, and corrects artifact-card media/body spacing. The portrait is top-aligned, the identity badges lead the handle on one compact metadata row, and the redundant lower About card has been removed while its stable anchor now resolves to the hero biography. Subtle section accents, container tints, badge tooltips, inventory hover cards, and economy item lightboxes now share the same restrained violet/blue profile system without changing their data, keyboard, focus, or Runtime authority contracts.
- Corrected the remaining late-breakpoint portrait offsets so the avatar stays fully contained inside the identity card on desktop, tablet, and phone. The role label now occupies a dedicated responsive grid position: top-right at tablet widths and directly beneath the portrait on phones. The profile header brand is no longer wrapped in a rectangular container; it now uses the existing `streamsuites-filled.svg` as a CSS mask inside an independent gradient icon well, an 800-weight wordmark, restrained hover depth, a subtle ambient pulse, and a static reduced-motion fallback inspired by the approved ThirdRailify header treatment.
- Preserved every existing Runtime/Auth-backed identity, visibility, role/tier, live, artifact, social, sharing, owner-edit, authority-request, progression, economy, inventory, scoped-board, auth-widget, footer-version, and status-widget path. Public remains presentation-only. The standalone resolver no longer borrows the generic local profile when a different authoritative identity has no exact local match, preventing sparse profiles from inheriting unrelated biography or artifact content.
- Added truthful loading, not-found, private/unavailable, transport-failure, malformed-payload, sparse, missing-media, offline, and live states. Transport or malformed responses no longer become false 404s; absent economy/inventory data renders Unavailable instead of a fabricated starting state; unsafe optional media transports fall back to the established local cover; single/few/many artifact and presence layouts adapt without empty wall-like cards.
- Added synchronized client title, description, canonical, Open Graph, and Twitter metadata for profile and failure states, plus canonical SSR link output. Canonical profile navigation continues to preserve query strings and fragments during `/@slug` migration and browser history, and supported hyphenated or underscored slugs are no longer collapsed by the Function, client renderer, or data hub.
- Added a keyboard skip link, one `h1`, semantic `main` and section landmarks, stable section IDs, visible focus treatment, bounded content, reduced-motion final states, forced-colour fallbacks, and responsive compositions for wide desktop, desktop, tablet, and phone viewports. No framework, dependency, API, route, schema, canonical version/build value, Runtime/Auth file, deployment configuration, or provider contract changed.
- Validation passed JavaScript and Pages Function module syntax, all 56 focused profile/shell tests, all 168 direct Public Node tests, SSR canonical metadata checks (including a hyphenated slug), and browser route smoke checks returning HTTP 200 for `/`, `/u/danielclancy`, `/status`, `/health`, and `/version`. Chromium verified the resolved profile at 1920x1080, 1440x900, 1024x768, 768x1024, and 390x844 with all six section anchors, one `h1`, correct canonical metadata, no duplicate lower About card, badges-before-handle hero metadata, no horizontal overflow, static reduced-motion hero/action states, working social/account menus, upgraded badge and inventory tooltips, a keyboard-dismissable item lightbox, working copy feedback, preserved alias query/hash and back/forward navigation, and explicit mocked not-found, network, malformed, private, sparse, unsafe-media, offline, and live states. The final 1440px, 768px, and 390px breakpoint pass also measured the portrait fully inside the identity card at each width, the tablet role chip at the card's top-right, the phone role chip directly below the portrait, the transparent outer brand wrapper, the 800-weight wordmark, the SVG-mask hover state, and complete pulse shutdown under reduced-motion preference. Local-only Runtime/Auth connection refusals and cross-origin diagnostics/analytics CORS messages were expected; no script exception was observed. No deployment was performed.

#### Human-readable notes

Public profiles now feel like premium creator destinations instead of dense utility dashboards. Identity and the most relevant action lead the page, while live activity, public work, badges, game data, platform presence, sharing, and safety controls gain clear hierarchy and adapt to the amount of real content available.

Empty or unavailable data is also much more honest: a missing profile, a private profile, and a temporary service failure are visibly different, sparse accounts stay sparse, and missing media or metrics no longer create misleading content.

### 2026-08-11 - Resolved incident timeline alignment and presentation polish

#### Technical notes

- Rebuilt the `/status` resolved-incident timeline gutter around one explicit rail coordinate shared by each state marker and connector. The former container-border/child-offset combination measured 2.5px off-centre in Chromium; the new 32px desktop/tablet and 24px phone gutter measures a 0px marker-to-connector centre delta, with the connector beginning at the exact vertical centre of its marker and ending at the next event only.
- Reframed the loaded Atlassian incident records as state-aware dark event cards with restrained surface tint, a contained connector rail, stronger date/title/body hierarchy, luminous impact chips, hover depth, and staggered in-view arrival inherited from the existing visibility observer. The final event deliberately has no trailing connector, and empty/unavailable states use the same frame without inventing a record.
- Added a bounded archive header that reports the real number of resolved records in the loaded feed. Upgraded the adjacent authority panel with a refined blue/violet edge, layered dark surface, and explicit `Official source: Atlassian Statuspage` / `Public role: Presentation layer` facts; the hosted archive link and Atlassian authority boundary remain unchanged.
- Added phone-specific rail and surface composition, immediate final reduced-motion rendering, focused source assertions, and bounded Status stylesheet/controller cache keys. No incident, timestamp, impact, update body, source, route, API, dependency, widget boundary, Runtime/Auth file, canonical version/build value, Statuspage configuration, or deployment configuration changed.
- Validation passed all 35 focused Status tests, all 166 direct Public Node tests, JavaScript syntax, and `git diff --check`. Chromium rendered the live Atlassian resolved records at 1440x900, 768x1024, and 390x844 with exact 0px marker/rail deltas and zero document overflow; reduced motion produced opacity 1, no transform, and effectively disabled transitions. Local optional Runtime diagnostics and analytics remained unavailable through expected cross-origin CORS responses, while the official Atlassian incident feed and page renderer completed without script errors. Validation was local and read-only; no deployment or Runtime/Auth mutation was performed.

#### Human-readable notes

Recent incidents now read as a deliberate event log rather than loose text beside a slightly misaligned line. Every marker is precisely centred on its connector, each resolved incident has a richer state-aware card, and the Atlassian source-of-record panel now feels like part of the same polished composition.

### 2026-08-11 - Retained stale watchdog history and truthful offline spans

#### Technical notes

- Preserved the last valid Runtime/Auth watchdog diagnostics when the server projection is stale and added a bounded in-memory fallback for a later transport failure in the same browser session. Atlassian remains the official current-state source; stale direct state is labelled Watchdog offline and cannot trigger a fresh discrepancy warning.
- Extended component, Core API Response Time, and `overall-availability-v1` graphs to retain every real measured segment and append only a presentation-time neutral trailing offline span from the last real observation to the browser clock. The span contains no synthetic bucket, measured line, area fill, operational rail, availability/downtime, min/average/max, or sample-count contribution; pre-monitoring time remains a distinct empty region.
- Kept Runtime-projected 5H/24H/7D/30D percentages and derived summaries frozen as-of the last snapshot. Current watchdog-derived overall state becomes unavailable while stale, Core API remains a Last measured value, and Studio Room Readiness remains Deferred.
- Extended PNG, PDF-print, and JSON reports to retain stale component/Core API/overall history, last-snapshot provenance, explicit fresh/stale/current-direct availability fields, and trailing unobserved graph geometry where supported. Public still performs no canonical availability recomputation.
- Added focused transport-fallback, stale graph geometry, no-fake-data, range, card/discrepancy, overall, metric, reduced-motion, and report-model coverage. No file, route, dependency, canonical version/build value, Runtime authority, deployment configuration, or official status source was removed or changed.

#### Human-readable notes

Historical status and latency graphs now remain visible when the watchdog is offline, clearly freezing at the last real observation rather than disappearing.

### 2026-08-11 - Health topology, canonical rails, and bounded rendering

#### Technical notes

- Replaced the `/health` radial starburst with an explicit Runtime Authority source and three truthful product groups: Core & Identity, Public & Web, and Studio & Clients. The same nine existing nodes and Runtime-owned relationships remain; each group now uses one structural trunk and one status signal, with no travelling SVG particles, duplicated glow route, or invented product-to-product dependency.
- Rebuilt retained component history against one Runtime-projected canonical time axis per 5H/24H/7D/30D range. Sparse observations now occupy their actual time slots, every absent slot is visibly Unknown, and all directly retained rows share the same axis before bounded 96/72/48-segment display aggregation. Vendor-managed, current-only, deferred/unmeasured, and externally retained classifications render deliberately instead of empty or healthy-looking rails; Public still calculates no availability or canonical state.
- Reduced response-history SVG complexity to one real-only line path, one optional area, one latest-point marker, one reusable hover marker, and delegated pointer/keyboard interaction. Component, topology, response, and history sections now skip unchanged redraws, large child insertion is fragment-batched, rail capacity updates only at responsive boundaries, and focus is restored after a genuinely changed render.
- Added a single topology visibility controller that pauses nonessential route motion while the section is off-screen, while the document is hidden, or when reduced motion is requested. Reduced-motion output is static rather than continuously animated. Existing visibility-aware 60-second diagnostics polling, the credential-free sanitized Runtime/Auth contract, all route/anchor boundaries, and stale/failed/unknown fail-closed behavior are preserved.
- Replaced availability chips' native browser titles with one reusable dark, state-themed tooltip that presents the canonical interval, observed/unobserved slots, retained buckets, raw observation count, state mix, retained source window, and no-backfill boundary. Every retained component chip is now a real `/status#component-…` deep link, the overall rail links to the complete Status component directory, and the tooltip makes that action visible without changing the rail geometry.
- Added an explicit `View on Status` action to every current-only, deferred/unmeasured, and vendor-managed no-rail card. Status component cards now expose stable fragment IDs; a component fragment clears an obstructing local search/filter, expands the matching real diagnostics card, scrolls it below the header, moves keyboard focus to its diagnostics control, and uses a brief state-coloured arrival highlight. All 21 Health component destinations were matched to the 21 rendered Status targets; no component, source, state, history, or authority mapping was invented.
- Refined the existing grouped topology with staged in-view authority, route, and group arrival, restrained state-aware surface depth, stronger hover/focus isolation, and a visibility-paused authority accent while retaining exactly three line-only routes and no particles. Core API history now uses the same feather-mask draw-in choreography as the Status component graphs on initial in-view load and genuine range changes; a frame-throttled narrow-screen visibility fallback handles content-visibility without creating a persistent scroll workload, and reduced motion renders the complete final graph immediately.
- Expanded focused coverage for canonical sparse alignment, conservative aggregation, classification, grouped line-only topology, animation pausing, bounded rails, delegated events, and constant graph marker count. No dependency, framework, file, route, Pages Function, Runtime/Auth source, canonical version/build value, Cloudflare configuration, deployment, or monitoring data changed.
- Validation passed all 42 focused Health/Status tests, all 159 direct Public Node tests, JavaScript syntax, and `git diff --check`. Local Pages routing returned HTTP 200 for `/`, `/health`, `/status`, and `/version`. Chromium rendered a captured public diagnostics projection at 1920x1080, 1440x900, 768x1024, and 390x844 with zero document overflow, topology overlap, or final console messages; reduced motion was static, off-screen and emulated-hidden topology states paused, and keyboard/pointer graph inspection reused the same marker. Follow-up browser checks confirmed all 1,152 rendered desktop rail chips were links, all 10 no-rail cards had explicit links, the 21 unique Health targets matched all 21 live Status cards, component fragments expanded and focused their target, filtered-out targets restored the complete directory, the graph completed and replayed its draw-in at 390px, and the 366px mobile tooltip stayed inside the 390px viewport. Three identical refreshes held the DOM at 2,502 nodes, 12 retained rows, 1,152 desktop 24H cells, and two graph circles; a three-pass scroll trace recorded no task over 200 ms (51 ms maximum). The live sanitized payload scan found no secret/private key or suspicious local/private value pattern. Validation was local and read-only apart from marking the captured fixture fresh; no deployment or Runtime/Auth mutation was performed.

#### Human-readable notes

System Health now reads as a clear architecture map instead of a busy radial animation. Its history rows line up to the same clock, visibly show what was not observed, and explain why a component has no retained rail instead of leaving an ambiguous blank.

The page also performs substantially less browser work: the response graph reuses a single hover point, topology animation stops when it is not useful, and unchanged live refreshes keep the existing UI intact.

Availability history is now much easier to inspect and act on. Hovering or focusing a chip opens a designed detail panel instead of a browser tooltip, clicking it opens that exact component on Status, and components without retained history now provide the same direct route rather than ending in an informational dead end. The topology arrives with cleaner depth and sequencing, and the response line again draws itself into view.

### 2026-08-11 - Landing-only feature-colour cycle boundary

#### Technical notes

- Reproduced the deployed defect across `/version`, `/donate`, `/roadmap`, `/support`, `/about`, `/accessibility`, and `/privacy`: each standalone document incorrectly gained `data-product="browser"` on load, then advanced to `native` after the shared controller’s ten-second timer, changing primary-button and accent tokens from blue to lime despite having no product switcher.
- Gated product initialization and automatic cycling in `js/studio-first-landing.js` behind the real main-landing contract: an existing root `data-product` marker, multiple product tabs, and the cycle-control group. Shared standalone navigation, reveal, header, footer, and reduced-motion behavior remain active. The landing still advances Browser to StudioApp after ten seconds; standalone pages retain their default Public-blue tokens and never receive a product state. The seven affected standalone documents use one bounded script revision so existing four-hour browser caches cannot retain the cycling controller after deployment.
- Audited `/health` separately. It does not load the landing controller, never receives `data-product`, and its primary button remained the same blue treatment across the timing boundary. Its semantic health-state colours remain intact because they communicate authoritative operational/degraded/outage/maintenance/unknown state rather than product feature selection.
- Added focused source coverage for the landing-only opt-in, every standalone page’s lack of product-cycle markup, and the existing `/health` separation. No route, API, data contract, dependency, visual framework, canonical version/build value, deployment configuration, or Runtime/Auth file changed.
- Restored the established dark foreground on the header `Open Studio` CTA with an explicit header-scoped rule in both Public shell style systems. The seven standalone pages and `/health` now carry bounded stylesheet revisions so cached CSS cannot leave that text white after deployment; this does not alter the landing-only cycling boundary or any semantic health colour. Follow-up validation passed all 13 focused standalone tests, all 155 direct Public Node tests, JavaScript syntax, `git diff --check`, and 10.8-second Chromium renders of both `/version` and `/health` with visibly dark header CTA text.
- Validation passed JavaScript syntax, all 28 focused standalone/landing/health tests, all 154 direct Public Node tests, and `git diff --check`. A real-browser live baseline proved the seven affected deployed standalone pages changed Browser blue to StudioApp lime after 10.6 seconds while `/health` stayed independent. The corrected local pages were then observed concurrently for 10.8 seconds: all eight requested routes retained identical computed accent and primary-button values with no `data-product`, while the main landing still advanced `browser` to `native`. Donate, Roadmap, Support, About, Accessibility, Privacy, and Health produced zero console errors; Version and the landing emitted only expected local-static-server 404 diagnostics for unavailable Runtime/Auth/API proxy routes, not controller or rendering errors. No deployment was performed.

#### Human-readable notes

The main landing page still rotates through Browser Studio, StudioApp, Studio for OBS, and Public every ten seconds. Version, Donate, Roadmap, Support, About, Accessibility, Privacy, and Health now stay on their own default colours instead of inheriting that product showcase loop.

The blue `Open Studio` button in those page headers again uses its intended dark text instead of white.

### 2026-08-10 - Public system health and observability surface

#### Technical notes

- Aggressively redesigned the existing `/health` presentation without changing its Runtime/Auth contract or truth model. The hero now uses the current public title scale, state-aware feature gradient, layered grid/aurora atmosphere, stronger authoritative timestamp panel, refined action hierarchy, and a substantially richer live posture instrument that remains visually complete for operational, degraded, outage, maintenance, stale, and Unknown states.
- Recomposed the real nine-node topology into explicit Core/Authority, Studio Surfaces/Clients, and Public/Web tiers. Runtime Authority is now the unmistakable multi-layer nucleus and directly renders the existing `/assets/icons/streamsuites-0.svg` mark; every one of the eight real relationships has separate structural, glow, illuminated signal, and travelling-packet SVG layers with semantic state colour, node hover/focus route isolation, stronger observed-at/legend framing, and a deliberate vertical authority spine on tablet and phone. No node, product relationship, media boundary, or authoritative classification was invented or removed.
- Brought availability and retained-history presentation up to the `/status` visual standard with status-grade 5H/24H/7D/30D controls, actual Runtime-projected availability/coverage/downtime/bucket metrics, aligned time-axis framing, dimensional state segments, neutral unobserved gaps, keyboard focus tooltips, and intentionally internal horizontal scrolling on narrow screens. Replaced the sparse response bars with a real-only SVG line/area graph, retained-sample points, grid/ticks, statistics, and explicit gap bands; missing response history still renders a designed Not Measured state rather than a flat synthetic graph.
- Polished all four component groups with stronger ownership separation, real local icons, differentiated major/core treatments, data-driven 24H micro-history rails, dimensional state badges, refined facts, and a distinct external/upstream frame. Freshness received a connected signal rail with clearer current/stale/unavailable states. Responsive composition, focus treatments, forced colours, section pacing, and reduced-motion behavior were extended without adding a framework, chart library, dependency, route, Pages Function, API, canonical version/build value, deployment, or Statuspage change.
- Added the canonical `/health` page as a dependency-free HTML/CSS/SVG/JavaScript observability console. It includes a Runtime-authoritative overall posture, measured/attention/unknown counts, a public-safe nine-node product topology, all 21 diagnostics components grouped by the existing taxonomy, freshness and Core API response characteristics, a real-bucket 5H/24H/7D/30D heatmap, explicit external/upstream separation, and concise methodology. Stable section anchors, responsive reflow, keyboard labels, forced-colour support, and reduced-motion fallbacks are included.
- Reused the existing unauthenticated, read-only `/api/public/status/diagnostics` projection and Runtime’s canonical `overall-availability-v1` state instead of adding a Public-owned state model or new API. Requests are same-origin, credential-free, visibility-aware, bounded by an eight-second timeout, and limited to a 60-second cadence. Loading, stale, malformed, unavailable, unmeasured, and no-history states remain non-operational; latency summaries and heatmap cells derive only from finite retained watchdog samples.
- Kept `/status` as the Atlassian-backed user-impact, incident, maintenance, archive, and subscription surface, adding only restrained reciprocal `/health` links in its hero and footer. Added focused contract/presentation/security tests and README route/tree documentation. No dependency, framework, Pages Function, Runtime/Auth file, Statuspage configuration, canonical version/build value, deployment configuration, or widget authority changed.
- Validation passed all 152 direct Public Node tests, JavaScript syntax, `git diff --check`, and 33 focused Runtime/Auth diagnostics/watchdog/statuspage tests. Local Cloudflare Pages routing returned HTTP 200 for `/`, `/health`, `/status`, and `/version`; headed Chromium rendered the fresh 21-component projection with four groups and 12 historical rows, truthful loading/stale/503 and degraded scenarios, zero final console errors in the isolated normal-data session, no document overflow at 1920x1080, 1440x900, 768x1024, or 390x844, internally scrollable heatmap history, and static ring/path treatment under reduced motion. The sanitized live projection audit found no private IP, local hostname, Windows path, token/key/cookie/tunnel/trace/database-path field, or dynamic HTML sink; its four uses of `credential` are the deliberate public component identifier, display name, and description, not credential values. No deployed Pages or Worker claim is made.
- Final redesign validation passed all 9 focused `/health` tests and all 153 direct Public Node tests, JavaScript syntax, and `git diff --check`. Local Pages routing again returned HTTP 200 for `/`, `/health`, `/status`, and `/version`; the redesigned page was rendered and inspected at 1920x1080, 1440x900, 768x1024, and 390x844 with no document-level horizontal overflow, no topology overlap or clipping, zero console messages in the isolated normal-data session, and static signal/core treatment under emulated reduced motion. Validation remained local and read-only against the existing public diagnostics projection; nothing was deployed.

#### Human-readable notes

System Health is now a substantially richer public observability experience: the architecture has a clear Runtime centre, live paths are easy to follow, history and response graphs are as polished as the Status Center, and owned services remain visually distinct from upstream dependencies. The page now has the presentation depth and clarity of the current `/status`, `/version`, and main StreamSuites site without making missing telemetry look healthy.

StreamSuites now has a dedicated System Health page for understanding how measured services are operating. It pairs an interactive topology and designed component matrix with honest freshness, response, dependency, and real-history views, while the existing Status Center remains the place to understand incidents and user impact.

### 2026-08-10 - Status-aware hero, component tinting, and report-control polish

#### Technical notes

- Bound the existing official Atlassian overall state to scoped hero presentation attributes. Normal operations retain the approved blue-black atmosphere, steel/cyan/pale/violet feature-line gradient, multicolour system diagram, and neutral operational component surfaces unchanged. Degraded, partial-outage, major/critical-outage, maintenance, and unavailable states now recolour the animated ambient orbs, hero atmosphere, feature-text gradient, pulse frame, rings, routes, nodes, and authority hub with the matching gold, orange, red, violet, or steel state colour; optional watchdog posture still does not override official hero state.
- Extended the existing per-component semantic colour to the complete non-operational card border, surface gradient, top rail, glow, expanded frame, icon container, and a current-colour mask of the exact mapped local icon. Operational cards continue to use the prior neutral surface and original light icon rendering. Maintenance changed from the normal-operation-adjacent blue to a distinct violet semantic treatment; no icon asset, component ID, source, coverage, or status normalization was replaced.
- Relocated each existing component report menu from the expanded detail header into the persistent footer immediately beside View/Close diagnostics, making the same single menu available in both collapsed and expanded states. The footer menu opens upward inside the clipped card, aligns inward on narrow screens, and no longer lets trigger focus pre-open then invert the first click. Its text `⌄` glyph was replaced by a bordered CSS chevron that rotates with open state, and the shared report modal/backdrop now use 6px dark Chromium scrollbars plus the platform `thin` scrollbar contract. No report format, schema, allowlist, range, modal, or export generator was duplicated or changed.
- Added focused source assertions for official-state hero scoping, operational exclusions, semantic card/icon masks, persistent report placement, the shaped chevron, inward dropdown, and dark slim modal scrollbars. Advanced only the bounded `/status` stylesheet/controller presentation cache key. No file, dependency, route, Runtime/Auth source, Statuspage configuration, Cloudflare configuration, component ID, canonical version/build value, deployment, or widget boundary was added, removed, or changed. The CSS is longer because the requested semantic states are additive; the JavaScript is effectively the same size apart from state bindings, the icon-mask source, and report-menu relocation.

#### Human-readable notes

Status problems now look like status problems: affected cards tint their full frame and icon, and the hero shifts from its normal blue presentation to gold, orange, red, violet, or steel when the official system posture changes. Export now stays beside the diagnostics button whether a card is open or closed, with a clearer arrow and a slimmer dark report-window scrollbar.

### 2026-08-10 - Overall availability, 5H analytics, and operational status reports

#### Technical notes

- Added the Runtime-owned `overall-availability-v1` critical-path feature graph to `/status`, including exact 5H/24H/7D/30D range consumption, coverage, downtime, degraded/maintenance/unknown/pre-monitoring durations, current critical-path counts, stepped availability geometry, and the canonical state rail. Atlassian remains the official current-state and incident authority; no critical IDs, aggregation policy, 5H buckets, uptime, or missing history are synthesized in Public.
- Extended real watchdog-history selectors for component analytics and the Core API overview to 5H while retaining the existing graph gap semantics, in-view/range-replay choreography, keyboard controls, reduced-motion final state, deferred/manual behavior, vendor-managed behavior, and explicit compatibility messaging for an older public projection.
- Added one reusable accessible report menu/modal and the presentation-neutral allowlisted `streamsuites-status-report-v1` model for complete and component scopes. JSON uses formatted Blob downloads; PNG uses local fonts/assets and bounded 1600x2200 Canvas pages with deterministic numbered pagination and real graphs; PDF uses a same-origin HTML/SVG print document and the browser Save as PDF flow. All formats keep Atlassian and watchdog data separate, preserve partial-source and association-unavailable states, include provenance, and exclude private/process/local-path fields.
- Added focused overall/report model and renderer coverage, 5H compatibility cases, filename/security checks, report CSS, README tree/status documentation, and bounded presentation cache keys. No dependency, lockfile, route, component ID, canonical version/build value, Runtime/Auth file, Statuspage configuration, Cloudflare configuration, deployment, or widget boundary changed.

#### Human-readable notes

The Status Center now shows a canonical watchdog-observed overall availability view alongside 5H component analytics. You can also download full or component operational reports as polished paginated PNGs, browser-generated vector PDFs, or structured JSON, with official Atlassian status and independent watchdog evidence clearly separated throughout.

### 2026-08-10 - Status graph trailing-edge animation repair

#### Technical notes

- Reproduced the remaining trailing-section defect frame by frame in a headed Chromium session, then reproduced it again on a 24H-to-7D toggle. `getTotalLength()` reports SVG user-space units, but the entrance code appended CSS `px`; once the responsive viewBox scaled to the on-screen graph, the dash covered only part of the measured path. Timer cleanup then removed the undersized dash and made the missing last section snap into view. The full-width area fill exposed that missing trailing geometry before cleanup, making the defect more obvious.
- Cleanup-boundary screenshots proved that both unitless dash values and rendered-length dash sampling still left a small terminal downstroke difference under Chromium's non-scaling-stroke pipeline. The final repair therefore removes dash clipping from the entrance entirely. Every measured line now uses a `userSpaceOnUse` SVG mask with a feathered leading edge, 64 units of left reserve, and enough right-side reserve for the gradient to become fully opaque beyond the latest point. The mask moves left-to-right in viewBox space, remains complete after entrance, and has no cleanup mutation capable of snapping missing line geometry into view.
- Reduced the measured line duration from 2050ms to 1640ms and proportionally reduced the plot, observability rail, gap, legend, current-point, and tip choreography. The fill begins only after the 1840ms line transition has completed, and the complete entrance settles at roughly 2.2 seconds with a bounded 2480ms cleanup. Range changes retain their outgoing fade and replay the repaired entrance against newly calculated real geometry; reduced motion still renders the final un-clipped composition immediately.
- Advanced only the bounded `/status` stylesheet/controller presentation cache key and added focused coverage for the responsive mask geometry, feather stops, explicit absence of dash cleanup, new line/fill timing, and shortened rail motion. No dependency, file, route, API, component ID, canonical version/build value, Runtime/Auth source, Atlassian configuration, Cloudflare configuration, deployment, or monitoring data was added, removed, or changed.
- Validation passed all 25 focused Status Center tests and all 132 direct Public Node tests, JavaScript syntax, `git diff --check`, and headed Chromium rendering with zero final console errors. A clearly labelled deterministic diagnostics fixture exercised the exact long 24H terminal-spike shape plus a 24H-to-7D-to-24H replay because the deployed diagnostics projection was unavailable during the run. Frame captures proved the 844-unit mask travelled from `translateX(-100%)` to `none`, the fill stayed at zero until the line completed, and line-isolated plot captures immediately before and after entrance-class cleanup produced byte-identical 163,986-byte PNGs. A 390x844 animated run retained a 390px viewport with 383px document/body widths, while reduced motion returned `chartMotion=reduced`, a complete mask, full area opacity, and no transform. The local headed browser, deterministic routes, screenshots, and temporary HTTP server were removed after validation; no deployed Pages or Worker claim is made.

#### Human-readable notes

The status graph now draws its line cleanly through the final section before the gradient fill settles underneath it. The last point no longer clips or snaps into place, and the complete entrance runs about 20% faster on both first view and every time-range change.

### 2026-08-10 - In-view graph motion, observability rail, and incident tick correction

#### Technical notes

- Reproduced the deployed Core API expansion in a real browser and measured the motion against viewport geometry. The chart draw began while the plot was still more than 800px below a 720px viewport; by the time even its top edge arrived, the area was already roughly three-quarters revealed and the line draw was well underway. The graph now primes invisibly while off-screen and uses a bounded `IntersectionObserver` threshold to start its measured area, line, rail, gap, and current-point sequence only once a meaningful portion of the plot is actually visible.
- Corrected the line-prime boundary so the exact measured SVG path length is applied before paint without an inline dash offset overriding the transition. Every 24H/7D/30D selection now counts as a new chart load: the outgoing range still fades briefly, the new real geometry is rebuilt, and its full in-view entrance sequence replays. Reduced motion continues to bypass every draw/grow transition and renders final geometry immediately.
- Polished the observed-availability rail with restrained per-state `userSpaceOnUse` vertical gradients, fine inset strokes, and a bounded baseline-up reveal. Genuine internal missing buckets now receive short, flat grey gradient markers at the exact expected bucket positions. These markers derive only from internal gaps, exclude any explicit observed bucket, remain unmeasured, and are never generated for selected-range time before history began.
- Re-measured the exact local `assets/icons/ui/tick.svg` artwork rather than aligning only its CSS mask box. Although its bounds are geometrically centred, its asymmetric visual centroid sits left and below centre. The compact Active Incidents tick is now absolutely centred inside the 42px rounded square and receives the corresponding small right/up optical correction; the full healthy empty-state tick and all real incident rendering remain unchanged.
- Extended focused status coverage for internal-only missing rail markers, gradient rail primitives, in-view entrance gating, range replay, reduced-motion final state, and the new measurable tick-centering contract. Advanced only the bounded `/status` stylesheet/controller presentation cache key so the corrected assets are not confused with the prior deployed rendering; no file, dependency, Runtime/Auth source, API, component ID, route, canonical version/build value, Cloudflare configuration, Atlassian configuration, or deployment was added, removed, or changed.
- Validation passed all 24 focused Status Center tests and all 131 direct Public Node tests, JavaScript syntax, HTML parsing, exact-case asset checks, and `git diff --check`. Playwright validation against the live accumulated diagnostic response proved the off-screen prime remained at full path offset and zero area/rail opacity until the graph entered view, then measured both live SVG line segments drawing to zero while the area and rail rose. Clearly labelled intercepted 7D and 30D history scenarios separately proved both range switches replayed their measured lines from full offset to zero; reduced motion rendered the switched range immediately with no dash, transform, or partial opacity. The live 24H rail rendered 57 flat markers inside its genuine internal gap and none in the leading unavailable-history span, while the tick pseudo-element measured absolute zero insets, automatic centring margins, and the intended `0.6px / -1.2px` optical correction. Browser checks at 390x844, 844x390, and 1600x1000 retained exact document widths with the graph visibly mid-draw and the same centred tick geometry.

#### Human-readable notes

Status graphs now wait until you can actually see them before smoothly drawing in, and changing the time range replays that entrance instead of merely swapping the finished graph. The observability rail has more dimensional state bars plus honest flat grey markers only where checks are missing, and the Active Incidents tick now sits in the true visual centre of its rounded square.

### 2026-08-10 - Live-history graph source and rendering correction

#### Technical notes

- Reproduced the deployed `/status` page in a real browser against the current accumulated diagnostics projection and found that the graph labelled `Core API response time` was incorrectly attached to the Public APIs, Exports & Version Registry component. Runtime/Auth explicitly derives that Atlassian custom metric from `authentication_accounts_sessions`; Public now binds the custom-metric graph to the matching Authentication, Accounts & Sessions component, so its current value, bucket count, raw sample count, and 24H/7D/30D history share one authoritative source.
- Corrected the graph entrance mechanism itself. The previous class change added the hidden state and transition simultaneously, causing the browser to begin from the already-visible final state and effectively skip the draw. The renderer now primes one unanimated hidden frame, measures each actual SVG path length, runs a 1.35-second area rise and 2.05-second line draw, stages the gap/tip/legend reveal, then removes dash clipping entirely so the settled line remains continuous through the latest real point.
- Increased real-area visibility with a four-stop `userSpaceOnUse` vertical gradient, including a stronger low/tail stop where the accumulated Core latency curve actually sits. Selected-range time before the first available observation now receives a labelled leading band, while the one genuine live internal observation gap remains a separately labelled neutral band and dashed bridge with no measured line, fill, glow, or statistical weight.
- Removed inherited group feature colour from component surfaces, borders, hover/expanded frames, icons' container context, and graph controls. Group accents remain only in the category heading marker/eyebrow as requested; card surfaces are neutral graphite/steel and icon/state treatments remain semantic.
- Added a direct `View 24H / 7D / 30D history` control to the Core API overview metric. Studio Room Readiness remains explicitly deferred and has no expandable graph until a genuine Studio/room/RealtimeKit transaction produces real samples. Public still does not render an overall-system downtime graph because neither the official public summary nor the sanitized diagnostics contract defines a canonical aggregate across monitored, deferred, and provider-managed components; no uptime is averaged or fabricated in the client.
- Optically centred the exact local tick mask in the compact Active Incidents header while retaining the full empty-state tick, official incident renderer, component IDs, routes, data sources, versions, and read-only authority boundaries. Updated focused source/model coverage for the authoritative Core mapping, leading-history ranges, measured-path animation, stronger gradient, neutral card boundary, metric-history control, widget history guidance, and tick alignment. No dependency, file, Runtime/Auth source, Atlassian configuration, Cloudflare configuration, version/build value, or deployment was added, removed, or changed.
- Validation passed all 130 direct Public Node tests. A Playwright browser session loaded the current deployed `/status` route, then replayed the same live Runtime/Auth response into the changed local page: the overview and Authentication custom-metric graph used matching live raw-observation counts; the settled line endpoint and current marker both reached SVG x=742 with no dash clipping; area stops computed to `0.34 / 0.18 / 0.11 / 0.015`; leading and internal unobserved spans were labelled; the 390px viewport held document/body width to 390px; reduced motion rendered `none` dash arrays, zero offsets, full area opacity, and no transform. The incident icon and header divider shared the same measured left edge, and the fully expanded global widget rendered both live custom-metric cards. Local analytics CORS errors remained expected static-server noise; no deployed Worker or Pages freshness claim was made.

#### Human-readable notes

The Core API graph now uses the right live history, its line visibly draws and stays present all the way to the current point, the fill is strong enough to read, and genuinely unavailable time is labelled instead of looking like a broken chart. Component cards are neutral again, category colour stays in the headers, the incident tick is centred, and the Core metric has a direct history control without inventing Studio Room Readiness or overall-system history that does not exist yet.

### 2026-08-09 - Expanded widget custom-metric parity

#### Technical notes

- Added a dedicated two-card Atlassian custom-metrics section to the existing fully expanded status widget on Public pages while preserving the intentional no-widget boundary on `/status` itself. Core API response time renders only a finite measured Runtime/Auth diagnostic value, and Studio Room Readiness retains its explicit deferred state and genuine-transaction reason.
- The metrics use the existing sanitized `GET /api/public/status/diagnostics` projection already fetched by `js/status-data.js`; the widget does not call the Statuspage Manage API or expose an API key. Missing or stale diagnostics never replace Atlassian's official state and render as labelled unavailable or stale readings instead of fabricated readiness.
- Renamed the existing widget request timing label from `Response` to `Feed latency` so it cannot be mistaken for the new measured Core API metric. Added responsive two-card/one-card styling and focused source assertions for both fixed metric keys, observed/deferred/unavailable semantics, and the read-only boundary. No route, component ID, version/build value, dependency, deployment configuration, or file was added or removed.

#### Human-readable notes

The fully expanded Public status widget now includes Core API response time and Studio Room Readiness. The first shows a real measured value when available; the second remains honestly deferred until StreamSuites has a genuine room-readiness transaction.

### 2026-08-09 - Comprehensive Status Center presentation correction

#### Technical notes

- Diagnosed the visible 24H graph disconnections against the Runtime/Auth public-history schema and representative accumulated diagnostics. The normal five-minute sequence was being plotted correctly, while the live Core API history contained one genuine missing observation interval; the renderer now normalizes bucket timestamps, deduplicates normalized buckets, preserves adjacent measurements as one curve, and keeps explicit or timestamp-derived gaps outside measured segments instead of concealing them.
- Made genuine missing periods intentional and truthful with a faint accessible `No observations` band plus a neutral steel dashed bridge between the surrounding real points. Measured curves and measured area fills stop at each gap; the bridge carries no measured glow or area and is excluded from latency, availability, minimum, average, and maximum calculations. A latest real point after a gap remains the explicit bridge destination.
- Replaced the ambiguous `Real samples` presentation with separate plotted-bucket, latency-bucket, raw-observation, and missing-interval values. The 24H label names five-minute buckets, while 7D/30D name daily aggregate buckets, so a large raw probe count no longer implies that every probe is drawn as a graph point.
- Corrected each measured area definition to an explicit `userSpaceOnUse` vertical gradient with equal `x1`/`x2`, chart-top `y1`, chart-baseline `y2`, restrained accent opacity near the measured curve, and transparency at the baseline. Refined the current point to a smaller connected marker with a restrained halo and kept the right edge free of a broad cyan wash.
- Shortened each group spine to a header-local accent rail, returned component-card borders to neutral graphite, and limited group colour to subtle corner, icon, hover, and expanded-state cues while retaining semantic state colour for health badges. This preserves four distinct group identities without competing with component-level state.
- Upgraded the existing hero system diagram in place with quieter base routes, sequential semantic traces, bounded moving packets, restrained node response, slower hub energy, and the real `assets/icons/streamsuites-0.svg` central mark. The operational hero indicator and healthy incident/maintenance empty states now use the exact local `assets/icons/ui/tick.svg` mask instead of text or Unicode checkmarks.
- Added a slow steel/cyan/pale/violet gradient to the existing hero feature line and enriched the existing blue-black hero canvas with bounded arcs, grid depth, particles, and vignette layers without moving or restructuring the hero. Reduced motion stops the feature, atmosphere, ring, route, packet, and graph choreography while retaining the complete final visual state.
- Reused the established standalone Public `js/utils/versioning.js` and `js/utils/version-stamp.js` hydration path for the `/status` header control. It now displays the canonical current system version when available and preserves the existing `Version unavailable` fallback; no version or build value is hardcoded or changed.
- Refined the existing Active Incidents and Scheduled Maintenance panels with clearer hierarchy, calmer semantic framing, consistent empty-state icon treatment, and responsive balance. Their Atlassian-backed non-empty item creation and incident-update rendering paths remain unchanged.
- Extended focused regression coverage for normalized buckets, five-minute tolerance, adjacent versus missing intervals, one/two-point history, selected-range domains, unmeasured bridge semantics, segment-only area fills, vertical gradient geometry, latest-point provenance, raw-versus-plotted labels, reduced motion, hero SVG assets and semantic routes, canonical version hydration, healthy empty states, real event paths, four groups, 21 children, and the explicit no-widget/no-chart-dependency boundary.

#### Human-readable notes

The Status Center received a comprehensive refinement of its analytics, system-posture visualization, hierarchy, and operational empty states. Graphs now explain the difference between observations and plotted buckets, show genuine missing time as deliberately unmeasured, fade their real data vertically, and keep the latest measurement restrained; the hero, component directory, version control, and incident/maintenance panels now feel like one premium system without changing which source is authoritative or inventing data.

### 2026-08-09 - Premium expandable status analytics graphs

#### Technical notes

- Replaced the basic straight-segment component-history presentation with a dependency-free native SVG/CSS/JavaScript analytics renderer while retaining the existing `/status` cards, ranges, IDs, endpoints, official/direct source hierarchy, and real-watchdog-history-only contract. No Chart.js, D3, ApexCharts, ECharts, Highcharts, Recharts, package, lockfile, route, Runtime/Auth source, Statuspage topology, widget source, version, or build metadata changed.
- Added dynamically scaled latency graphs with monotone cubic curves only between adjacent real measurements, restrained group-aware cyan/blue/violet gradient strokes, translucent baseline area fills for three-or-more-point real segments, professional steel-blue grids/axes, compact latest/freshness/availability/sample summaries, and real selected-range min/observed-average/max values only when at least three measured buckets exist. The Core API response-time card receives the full metric rail, selected-range change, current point, last successful observation, and graph freshness without invented quality thresholds.
- Added a first-expansion sequence that reveals the frame quickly, grows each real area from its baseline, draws each SVG line through `stroke-dasharray`/`stroke-dashoffset`, settles the current point, and runs one restrained final-tip glow. Dense mature histories keep their smooth line and current point instead of painting a dot on every bucket; sparse histories retain every actual point. Missing timestamp intervals and explicit null-latency buckets split both line and fill segments, and zero remains a measured value rather than a fallback.
- Added controlled 24H/7D/30D range transitions with a short outgoing fade, recalculated geometry, a short incoming settle, preserved `aria-pressed` state, restored focus, and Arrow/Home/End keyboard navigation. Range changes hold chart depth to avoid layout jumps and do not replay the longer initial draw sequence.
- Added fine-pointer nearest-observation inspection with a restrained vertical guide, emphasized real observation, in-bounds tooltip, exact timestamp, measured latency when present, state label, and watchdog availability. The visible latest-value callout remains the primary mobile/touch presentation, while only the current observation is keyboard-focusable so mature histories do not create hundreds of tab stops.
- Added a dedicated state-history renderer for real watchdog observations that have no meaningful latency. Its continuous low-profile micro-bars use operational, degraded, partial, major, maintenance, and unknown colours without manufacturing a response-time series. Deferred/manual cards use an intentional monitoring-boundary panel; Atlassian third-party cards use a provider-owned panel; both retain official state and render no fake watchdog graph. Studio Room Readiness still says `Deferred` and explicitly explains that no genuine Studio/room/media-readiness transaction exists.
- Refined graph depth, group accents, summary rail, responsive density, mobile axis labels, tooltip containment, state legend, and sparse-history treatment. `History is still accumulating` includes received bucket count, one point remains a point, two points may use only their real direct connection, and missing periods remain open. Reduced motion bypasses area growth, line draw, moving/glowing tip, and range choreography and renders the final graph immediately.
- Extended focused regression coverage for real-observation preservation, null-versus-measured-zero handling, one/two-point geometry, explicit and timestamp-derived gaps, exact 24H/7D/30D domains, state-only history, real tooltip provenance, gradient/area/current-point primitives, selected-range accessibility, reduced-motion bypass, deferred/vendor no-graph states, widget exclusion on `/status`, and the no-chart-dependency boundary.

#### Human-readable notes

Component diagnostics now present accumulated watchdog history through a significantly more polished analytics-style experience: smooth restrained curves, real area depth, clear current values, responsive inspection, purposeful status timelines, and honest sparse or missing-data states. The upgrade adds visual quality without inventing history or changing which source is authoritative.

### 2026-08-09 - Final Status Center component and graph polish

#### Technical notes

- Refined the locked four-group/21-child directory without changing the hero, route, dark typography system, group taxonomy, official incident/maintenance logic, or Atlassian authority. Group headers now carry restrained per-group accents, concise roles, operational totals, monitored/deferred/external coverage, and attention counts without rendering parent records as cards.
- Aligned compact component cards around consistent icon frames, long-name-safe identity blocks, official state badges, exact official/direct/vendor/manual source labels, coverage chips, check/latency metadata, stable footers, focus treatment, and polished expanded selection. Existing local product, internal, and vendor assets remain mapped; the fallback is a generic local current-color icon, never an initial letter or redrawn third-party logo.
- Rebuilt the expanded detail hierarchy around a clear official-versus-direct summary rail, aligned ownership/coverage/availability/check facts, close affordance, intentional deferred/manual and provider-managed explanations, stale direct-observation handling, and a fresh-only reconciliation warning that preserves both values without changing official state in the browser.
- Polished real-history-only 24H/7D/30D graphs with selected controls, keyboard-focusable point labels/tooltips, screen-reader summaries, axes, latest measured latency, state-band and gap legends, sparse-history messaging, and segmented lines across missing periods. No sample is interpolated, randomized, backfilled, or replaced with a zero; Studio Room Readiness remains a deliberate deferred state without an empty graph.
- Added focused source regressions for group summaries, exact source labels, aligned icon/card/detail structure, sparse and missing-history behavior, non-interpolation gaps, keyboard expansion, graph accessibility, discrepancy staleness, widget exclusion on `/status`, unchanged widget inclusion elsewhere, and reduced motion. No files, dependencies, routes, component IDs, version/build metadata, Worker source, Runtime/Auth state, or deployment configuration were added, removed, or changed in this Public repository.

#### Human-readable notes

The Status Center’s component directory now reads like one finished operating view: groups explain their role and coverage at a glance, compact cards line up cleanly, expanded details separate official status from direct evidence, and graphs stay honest when history is sparse or missing. The floating status widget remains unchanged everywhere except `/status`, where it is still intentionally absent.

### 2026-08-09 - Public Status Center diagnostics and component-directory polish

#### Technical notes

- Upgraded the existing `/status` component directory without replacing its hero, header, typography, section order, incidents, maintenance, history, transparency, or dark visual language. The locked four-group/21-child topology now has explicit group ordering, excludes group records from cards, and retains Atlassian as the official state and incident authority.
- Added optional reads from Runtime/Auth `GET /api/public/status/diagnostics`. Missing or stale diagnostics degrade to clear Atlassian-only operation; direct observations remain secondary, and a fresh official/direct disagreement produces a restrained reconciliation warning without changing either signal in the browser.
- Replaced initial-letter tiles with meaningful local feature icons. Existing product/vendor assets are reused for Studio, StudioApp, OBS, Creator, Admin, Developer, Stripe, and GitHub; three generic current-color bell/cloud/envelope SVGs were added where no suitable local generic asset existed. No external logo was approximated.
- Added source, ownership, coverage, freshness, official/direct timestamps, latency, and expandable details. Implemented components can show only real 24H/7D/30D watchdog history through dependency-free accessible SVG latency points and state bands; missing samples remain gaps. Deferred/manual and Atlassian vendor-managed cards explain their coverage and never render fake uptime.
- Added a real Core API latency summary with awaiting-data behavior and kept Studio Room Readiness explicitly deferred because homepage latency is not a room transaction substitute. Graph range controls disable unavailable ranges, expansion uses native keyboard-operable buttons, screen-reader summaries accompany charts, and reduced motion collapses transitions to an immediate static state.
- Removed the component card’s prior full-surface animated sheen because this milestone explicitly calls for restrained motion; hover elevation, focus treatment, details reveal, and graph presentation remain. The stylesheet is longer overall because diagnostics, responsive, and accessibility states were added.
- Preserved the approved floating widget byte-for-byte and kept `/status` free of widget CSS, script, host, and slot references. Added focused coverage for the final taxonomy, icon files, official/direct hierarchy, optional diagnostics, deferred/vendor behavior, discrepancy state, real-history-only graphs, range controls, expansion, accessibility, reduced motion, and the no-widget boundary.
- No version/build metadata, route, Auth contract, download gate, Worker/Cloudflare configuration, deployment, commit, push, or sibling repository outside the coordinated Runtime/Auth root changed.

#### Human-readable notes

The Status Center now explains what is official, what the independent watchdog directly observed, and what is not monitored yet. Components have recognizable icons and calm expandable evidence instead of letter tiles or made-up uptime, while the approved floating widget remains unchanged everywhere else and absent from `/status`.

### 2026-08-09 - Cinematic hero atmosphere and transition polish

#### Technical notes

- Rebuilt the landing hero atmosphere around the existing single bounded canvas with a denser 54-mobile / 96-to-156-desktop fine-particle field, accent beacons, depth-weighted drift, up to 44/144 nearby links, and two/five curved light-signal pulses. Added slow localized radiance, bloom, light-ray, ribbon, tracer, aurora, horizon, grid, scan, and constellation layers; all remain decorative, product-color aware, left weighted, DPR-capped, and suspended when hidden or offscreen. Reduced motion keeps a complete static atmosphere and does not create animated transition clones.
- Refined the selected-product headline into a light, midtone, and subtly dark three-stage treatment derived only from the active feature color. The light end stays close enough to white to blend toward the line above but now retains a minimum active-color tint at every animation position, while the darkened terminal accent adds depth without reintroducing a simultaneous rainbow. The gentle 10-second motion remains unchanged. Restored the sticky-header progress meter's previous violet-to-selected-product gradient exactly. Removed the shared product-color pseudo-edge from headers while retaining the existing footer edge and its selected-product transition; the separately owned Status page remains unchanged.
- Removed session-persisted suppression from the Alpha disclaimer and backend-active restricted-access notice. Their legacy session keys are cleared on hydration; each close control still dismisses its notice for the current document, but the Alpha disclaimer returns on reload and restricted-access truth returns whenever Runtime/Auth reports maintenance/development mode with `show_lockout_banner: true`.
- Replaced the apparent hard four-product preview cut with an overlapping 900ms outgoing snapshot plus 880ms incoming fade/blur/settle and set the default-on tab dwell to exactly ten seconds. Browser Studio and StudioApp preserve their corrected shared POC stage during the overlap, and the active preview resumes only its bounded float after entrance completes. Consolidated the four dots and play/pause control into one compact inline capsule.
- Retained the exact 8% Browser Studio/StudioApp output geometry while separating its tonal planes: the inset live-output background now uses slightly lifted dark stops plus `brightness(1.15)`, while the surrounding program-stage gutter uses near-black `#020306` to `#000103`, an 80%-reduced accent wash, and a much fainter grid. Participants, solo media, labels, safe area, lower third, and all diagram dimensions remain unchanged.
- Moved each product-family number to the top-right corner, reserved its small footprint in the top row, reduced card padding and title/body gaps, and lowered the wide-screen card minimum height. A later shared glow-content positioning rule was narrowed for the number so the rendered absolute position cannot fall back into document flow.
- No routes, copy contracts, auth/status/version behavior, download gates, manifests, installers, product authority, media ownership, dependencies, builds, deployments, commits, or sibling repositories changed. No production source files were created, removed, or renamed, and the corrected hero diagrams plus protected `pocv9` files were not modified.
- Validation passed with `node --check js/studio-first-landing.js`, the focused landing/edge suite (11/11), the complete repository suite (113/113), and `git diff --check`. Playwright MCP rendered both headline-gradient animation extremes plus the balanced midpoint, desktop and narrow hero states, stale-key banner hydration, the two Studio stage tones, an actual mid-crossfade frame, the tightened four-card row, ten-second default autoplay, explicit pause, sustained atmosphere movement, footer-only feature-edge paint, the restored progress gradient, reduced-motion shutdown, and zero measured narrow-page overflow. Five current proof PNGs were retained under `output/playwright/`; local analytics CORS failures remain expected static-preview noise and are not production-service evidence.

#### Human-readable notes

The opening now has a much more visible cinematic field of fine particles, illuminated paths, broad moving light, and atmospheric depth without washing over the product diagram. Required top notices no longer disappear because of an earlier session dismissal, product changes overlap smoothly every ten seconds, the first two Studio stages separate the darker program gutter from the subtly brighter live output, the headline moves from a very light active tint through the full feature color into a slightly darker shade without ever becoming colorless, the controls read as one element, and the four product cards no longer waste their upper area.

### 2026-08-08 - POC-exact hero output and controlled product cycle correction

#### Technical notes

- Restored the Browser Studio and StudioApp main output area from the protected `pocv9` implementation instead of approximating it through an added wrapper. The production stage now uses the POC's direct child order, identical 8% output-background and safe-area insets, exact Browser participant/lower-third positions, exact StudioApp solo-output inset, and the POC dark output gradients. The full four-state device also uses the POC's default `perspective(1600px) rotateY(-3.2deg) rotateX(1.4deg)` attitude and gently straightens to `rotateY(-1.3deg) rotateX(0.5deg)` on hover.
- Corrected `Run it your way.` to use one smoothly animated tonal gradient derived only from the selected product feature color. Switching Browser, StudioApp, OBS, or Public now crossfades the preview and moves the line through blue-only, lime-only, violet-only, or gold-only tones; the prior simultaneous multicolor treatment was removed from this headline.
- Added a default-on ten-second four-product cycle with a compact four-dot switcher and an accessible play/pause button. Manual tab, card, or dot selection restarts the interval; explicit pause persists; hidden-document and offscreen-hero states suspend it; reduced motion disables autoplay and leaves a complete static selected state.
- Strengthened the existing bounded particle canvas without introducing another renderer: desktop now uses 72–118 fine points and at most 96 links, mobile uses 42 points and at most 30 links, most points remain left weighted, and accent particles receive a soft halo pass. The particle canvas now paints above the grain veil, while preserving the DPR 1.5 cap plus hidden/offscreen suspension.
- Made the central Runtime/Auth card, icon, ports, health point, and orbit ease over 880ms to the Browser blue, StudioApp lime, OBS violet, or Public gold of the route currently feeding it. Authority and media-boundary copy, node ownership, route geometry, and the one visible topology timer remain unchanged.
- Hardened shared feature-edge painting with explicit header/footer anchoring, visibility, paint order, solid active-color backgrounds through the retained linear mask, and eased color transitions. The landing no longer turns `body` into an unintended vertical scroll container, so the sticky header and its active-product progress/edge color remain geometrically present and topmost after deep scrolling.
- Updated focused source coverage for the POC-exact geometry and perspective, active-only headline tones, autoplay/dot/pause behavior, particle density and halo bounds, topology core color mapping, persistent feature-edge paint rules, cache revisions, and reduced-motion behavior. No route, auth/status/version, protected download gate, manifest, installer, authority, media, dependency, build, deployment, commit, or sibling-repository contract changed. No production files were created, removed, or renamed, and protected `pocv9` content was not modified.
- Validation passed with `node --check js/studio-first-landing.js`, the focused corrective suite (11/11), the complete repository suite (113/113), and `git diff --check`. Local HTTP Playwright MCP proof covered the final Browser and StudioApp outputs, desktop architecture, narrow hero, exact output/safe-area alignment, perspective/hover state, ten-second automatic advance, explicit pause persistence, all four Runtime/Auth color states, reduced-motion static behavior, zero narrow-viewport overflow, and header/footer edge persistence across top, deep, returned, and footer scroll positions. The local server produced only the expected unavailable `/auth/access-state` response and analytics CORS failure; neither is production-service evidence. Four generated proof PNGs were retained in `output/playwright/` for review.

#### Human-readable notes

The hero now carries the depth and precision of the approved proof: the stage output is the protected POC composition, the whole device relaxes toward the viewer on hover, the headline follows one product color at a time, and the denser fine-particle field gives the opening more presence. The four product states advance gently by default but remain directly switchable and pausable. Lower on the page, Runtime/Auth visibly takes on the color of the product it is feeding, and the header/footer feature edge keeps its color after scrolling.

### 2026-08-08 - Landing hero atmosphere and cross-surface feature edges

#### Technical notes

- Rebalanced the production landing hero around a left-weighted blue atmosphere with two broad aurora layers, a restrained horizon/grid/constellation field, and stronger but still slow ambient movement, plus a product-aware blue/lime/violet/gold gradient on the existing `Run it your way.` line. The single bounded canvas remains the particle renderer; its seeded distribution now favors the illuminated left field while preserving the existing DPR cap, visibility pause, and intersection pause.
- Reconstructed each preview inside a clipping inner output frame and limited new drift, border glint, top-edge light, and signal motion to the selected preview. StudioApp's solo-creator still is now contained edge to edge, the Browser Studio people/assets remain unchanged, and the Destinations card uses a fixed icon/text grid so `Runtime-owned` stays intact at supported widths and 125% scale.
- Expanded the existing product family section from three to four truthful cards by adding StreamSuites Public as the downstream audience surface, with `/clips` as its existing route. The grid presents four equal columns on wide desktop, two columns through desktop/tablet widths, and one column on phones without changing the surrounding section order or product ownership boundaries.
- Added one shared, token-driven 1px header/footer feature edge across human-facing Public shells. Landing pages use the selected product accent; StudioApp downloads use lime, OBS downloads use violet, and the remaining Public/standalone surfaces use blue. The Status center retains its existing exact pseudo-element pair and does not load the shared treatment, preventing a duplicate line. Login entry pages opt in; callbacks, the auth bridge, redirects, diagnostic/archive pages, and all read-only POCs remain excluded.
- Kept motion progressive and restrained. `prefers-reduced-motion` disables the new hero, headline, preview, and edge animation while retaining the complete static composition; no image, font, dependency, route, auth, download, manifest, version, build, deployment, or sibling-repository contract changed. The protected `pocv9` files remain byte-for-byte unchanged, and no files were removed.
- Validation passed with `node --check js/studio-first-landing.js`, the focused corrective tests (11/11), the complete repository suite (113/113), and `git diff --check`. HTTP-served browser proof covered 390x844, 430x932, 768x1024, 1024x768, 1366x768, 1600x1000, 1920x1080, 844x390, 1600x640, and a 1.25 device-scale pass: all had zero horizontal overflow, the intended 1/2/4-column product grid, contained preview output and destination copy, correct product edge colors, active-only motion, reduced-motion static rendering, and canvas visibility/intersection pause and resume. Local static preview produced the expected unavailable `/auth/access-state` and analytics/CORS noise; those were not treated as production API evidence.

#### Human-readable notes

The landing now opens with a calmer, brighter StreamSuites atmosphere that pulls the eye toward the message, keeps the product demos crisp, and makes all four connected surfaces easier to understand. A fine product-colored line now carries that same visual language through the public site without changing how any page, login, download, or status route works.

### 2026-08-08 - Approved POCV9 landing motion and authority topology

#### Technical notes

- Adapted the approved read-only `pocv9` landing treatment into the production `/` surface without editing the reference. The hero now has one bounded canvas particle field, a restrained signal horizon, grid, constellation, scan, and orbit layers, plus a 3px desktop/2px mobile sticky-header reading-progress signal that does not add layout height or accept pointer input.
- Expanded the existing equal-footprint preview switcher to four keyboard-accessible states: Browser Studio keeps direct Cloudflare RealtimeKit media and the shared illustrative stage; StudioApp uses the same stage composition with its native Windows/WPF plus supervised C++ ownership and a solo-creator media example; Studio for OBS shows authorized Runtime/Auth ingress into a bounded bridge and an OBS-owned output pipeline without implying a duplicate engine; Public Shell shows a compact six-artifact downstream surface without assigning it media ownership.
- Replaced the former three-branch architecture illustration with a five-node topology: Browser Studio and Public Shell above central Runtime/Auth, with native StudioApp and StreamSuites Studio for OBS below. Four matching curved side-port routes use synchronized base, draw, halo, spark, and packet geometry while retaining truthful identity, permission, room, invitation, destination, credential, alert, automation, export, shared-state, and version authority in Runtime/Auth and keeping all product media paths outside Python runtime.
- Added restrained directional gradients to the existing primary actions, localized fine-pointer card glow/parallax, and product-aware preview accents without changing button dimensions, card structure, route destinations, header/footer composition, section order, or production copy outside the approved landing presentation.
- Kept motion bounded and progressive: canvas DPR is capped at 1.5, particle/link counts are capped by viewport size, canvas and topology work stop when hidden or offscreen, route sequencing uses a single visible timer, and no dependency or font load was added. `prefers-reduced-motion` renders the complete interface immediately, leaves a static authority route visible, and disables canvas animation, route drawing, packets, sparks, parallax, reveal transitions, and decorative motion.
- Added focused source coverage for the four tabs and preview panels, real repository-owned assets, Browser/StudioApp/OBS/Public ownership wording, particle limits and visibility handling, five topology nodes, four shared-geometry route layers, reduced-motion behavior, the bounded production cache revision, and the landing-scoped mobile footer guard. HTTP-served browser validation covered desktop, tablet, portrait phone, landscape phone, short-height desktop, keyboard tab control, mobile navigation, Alpha dismissal, auth-modal Escape handling, access-notice insertion, 50% progress state, equal preview footprints, reduced motion, horizontal-overflow checks, and the floating status control yielding while the mobile footer's own Status link is visible.
- The original `/auth/access-state`, `/auth/session`, OAuth/email login, Turnstile, temporary access, lockout banner, creator routing, status/version hydration, analytics, protected download gates, manifests, routes, and Runtime/Auth authority contracts are unchanged. No version/build allocation, artifact, dependency, deployment, commit, or remote state changed. The unresolved Tektur redistribution-license publication blocker remains unchanged.

#### Human-readable notes

The landing page now feels alive without becoming noisy: its four product previews explain where production and public output actually live, the Runtime/Auth diagram makes the shared authority boundary easy to follow, and every animation becomes a complete static presentation for people who prefer reduced motion.

### 2026-08-08 - Status center dark-theme and alignment correction

#### Technical notes

- Repaired the status-page stylesheet region that had been replaced by a literal truncation placeholder. That corruption removed the intended metric signal, component-toolbar, search-field, keyboard-hint, and filter-button rules, causing browser-native controls and broken layout. The invalid placeholder was removed and the stylesheet is now longer because the complete dark-theme rules are present again.
- Applied a consistent post-hero layout system across the overview, component directory, incident/maintenance, history, and transparency sections: heading copy now sits in a deliberate bordered detail rail; all four overview records use the same card class, height, padding, value baseline, label baseline, and dividers; component cards have stable minimum heights; and control surfaces use explicit graphite backgrounds, restrained blue active/focus states, visible keyboard focus, dark search affordances, and equal-height targets.
- Narrow layouts now collapse the heading rail cleanly, stack the metric card into one column, use two balanced filter controls plus a full-width attention control on phones, and retain zero horizontal overflow. Component search/filter behavior, Statuspage reads, IDs, routes, header/footer structure, widget isolation, Runtime/Auth authority, version, protected download contracts, and deployment state are unchanged.
- Added a focused source regression for the four metric-card classes, explicit dark control presentation, focus treatment, aligned metric layout, and absence of truncation placeholders.

#### Human-readable notes

The status page now looks and behaves like one intentional dark interface: the search and filters are properly themed, the overview rail is evenly aligned, and every lower section follows the same spacing and information hierarchy on desktop, tablet, and phone.

### 2026-08-08 - Branded status center and complete Public status widget

#### Technical notes

- Added canonical `status.html` at `/status`, following the existing extensionless `/version` Pages convention. The page uses current `ssmainlogosq.webp` and `wmnew.webp` branding plus the local Tektur, Geist Sans, and IBM Plex Mono system, and presents overall posture, grouped health, operational/total/latency metrics, every Statuspage component, search, operational/attention filters, active incidents, scheduled maintenance, recent public incident history, and a read-only source/transparency section.
- Added `js/status-data.js` as the shared read-only Public controller for Atlassian `summary.json`, `incidents.json`, and `scheduled-maintenances.json`. It uses `cache: no-store`, an 8-second request timeout, 60-second polling, visible-page refresh, manual forced refresh, response latency, last-successful in-memory stale retention, and a truthful unavailable first-read state. It contains no demo query, local persistence, fake component dataset, Manage API request, credential, or write method.
- Added `css/status-page.css` and `js/status-page.js` as production adaptations of the approved `statuspocv4` reference. The hero action order is Refresh, See components, then Atlassian; the component target has sticky-header clearance; responsive navigation, focus treatment, ARIA live status, keyboard search/filter behavior, and reduced-motion handling are retained. `/status` does not load or instantiate the floating widget and has no widget host or automatic status slot.
- Replaced the previous reduced Public tooltip with the approved floating 50px square signal, smooth hover/focus summary chip, and complete click-pinned panel showing all grouped components, active incidents, maintenance, freshness, response latency, stale warning, `/status` primary action, and Atlassian secondary action. The square signal owns `overflow: hidden`/isolation, while the idle toggle has transparent background and no outer backdrop blur, preventing the rejected rectangular haze. The standalone `/u` profile retains its existing explicit inline slimline-footer mount and receives the same upgraded panel rather than regressing that shell contract.
- The chip reserves a stable right-side control and uses inline plus/cross geometry derived from `/assets/icons/ui/plus.svg` and `/assets/icons/ui/cross.svg`; Escape and outside click close the panel. Footer avoidance measures the real lowest visible footer or content-info region on RAF-bounded scroll/resize updates, applies a 12px target clearance with safe-area support, and constrains the panel height from the raised anchor.
- Moved the existing page-visit reporter from `js/status-widget.js` into new `js/public-page-visit.js` without changing its analytics endpoint, payload fields, sessionStorage session marker, 30-second path dedupe, Beacon-first send, fetch fallback, or credential omission. Existing widget pages load the module automatically; `/status` loads it directly without loading the widget controller.
- Changed primary StreamSuites Status links on the landing, standalone/footer, Support, and Version surfaces to `/status`. Explicit Atlassian hosted-page and incident-history links remain on `/status`. `status-check.html` retains its diagnostic role, and no Runtime/Auth, Statuspage synchronization, download gate, protected manifest, version, build, dependency, deployment, commit, or remote state changed.
- Added `tests/status-center.test.mjs` and updated the existing Support assertion to cover canonical metadata and brand assets, widget absence on `/status`, public-read-only endpoints, no fake fallback or Manage API, all-component rendering, idle blur containment, pulse clipping, plus/cross geometry, footer avoidance, reduced motion, primary/external actions, existing widget inclusions, POC isolation, and primary status-link routing.

#### Human-readable notes

StreamSuites now has a branded, comprehensive service-health page at `/status`, while the existing Public surfaces use a richer but unobtrusive square status signal that expands only when asked and stays clear of footer content.

### 2026-08-07 - Support pathway card presentation

#### Technical notes

- Upgraded the six existing `/support.html` pathway cards with distinct repository-owned feature-icon masks, pathway-specific restrained accents, clearer icon/index/title composition, stronger depth, and a scoped hover/focus sheen. The established documentation, email, status, and Discord destinations and all surrounding Support behavior remain unchanged.
- Added compact mobile sizing and explicit reduced-motion handling for the new icon and sheen transitions. No new image assets, routes, integrations, or support capabilities were introduced.
- Validation: focused standalone-page tests and real desktop/mobile rendering were run for this scoped presentation change; results are recorded in the implementation handoff.

#### Human-readable notes

The six Support pathways are now easier to scan and visually identify, with a dedicated feature icon and accent for each kind of help while preserving the same verified destinations.

### 2026-08-07 - Custom live Discord community widget

#### Technical notes

- Replaced the stock Discord iframe on `/support.html` with a first-party, progressively enhanced community presentation backed only by Discord's enabled public widget JSON for guild `1449303974086967306`. The client performs a bounded read-only GET, validates the expected guild and payload shape, renders text through DOM text nodes, restricts invite/avatar URLs to Discord-owned HTTPS hosts, and times out cleanly without adding a Public proxy, account state, Discord credential, or canonical community authority.
- Added live server identity, presence count, visible voice-channel count and directory, member avatars/status, a manual refresh control, clear loading/live/unavailable states, and a prominent Join server action. The join action has the live-verified `https://discord.com/invite/fv3CBc4g` fallback in server-rendered HTML, while the existing verified support-channel deep link remains available independently of JavaScript or Discord presence availability.
- Added a responsive graphite/blue/indigo card treatment using the existing Public typography, borders, buttons, focus language, restrained hover depth, reduced-motion behavior, forced-colors support, safe long-text handling, and single-column mobile reflow. Removed the obsolete iframe markup and iframe-only CSS; `js/support-discord-widget.js` is new and is listed in the README repository tree.
- Validation: the live Discord widget endpoint returned HTTP 200 with the expected guild, invite, seven presences, and two visible voice channels. `node --check`, the focused standalone suite (10/10), and `git diff --check` passed. Wrangler and Playwright rendered the live widget at 1440×900 and 390×844; the manual refresh returned to `Live from Discord`, all seven avatars decoded, the Join server action retained the verified invite, and the mobile page had zero horizontal overflow. Browser console output contained only the existing local-preview analytics CORS failure, not a Discord-widget error.

#### Human-readable notes

The Support page now has a native StreamSuites Discord panel instead of Discord's generic embed. It shows the live community cleanly, restores an unmistakable Join server button, and still provides working support and join routes if the live preview is temporarily unavailable.

### 2026-08-06 - Download subnavigation active-border colors

#### Technical notes

- Corrected the active download-rail border on the Downloads index, OBS Plugin, and Extensions pages so it follows each page's existing feature palette instead of inheriting the shared StudioApp-green border. Downloads and Extensions now use blue; OBS uses violet.
- Preserved the already-correct green StudioApp state by leaving `downloads/studioapp/index.html`, `css/studioapp-download.css`, and the shared green default unchanged. Revised only the three affected page-specific stylesheet cache keys; navigation markup, links, sticky behavior, focus treatment, routes, and download behavior are unchanged.

#### Human-readable notes

Each selected download tab now has a border that matches its own product color instead of every tab appearing green.

### 2026-08-06 - Download diagram titlebar glyph parity

#### Technical notes

- Matched the OBS and Extensions hero-diagram mock titlebars to the already-correct StudioApp implementation by using the same `assets/icons/icondiag-studioapp.svg` current-color mask at the existing 17px geometry.
- Preserved each surface's established feature palette through its own `--download-accent-bright` token: violet on OBS and blue on Extensions. StudioApp remains unchanged with its existing lime treatment. No diagram nodes, labels, layout, product header icons, controls, routes, or download behavior changed.
- Revised only the OBS and Extensions stylesheet cache keys and updated the focused source assertions. `downloads/studioapp/index.html` and `css/studioapp-download.css` were not edited.

#### Human-readable notes

The three download diagrams now share the same mock-window title icon, with each product retaining its own identifying color.

### 2026-08-06 - Dedicated OBS extension identity correction

#### Technical notes

- Superseded the earlier incorrect Studio-logo substitution on all five StreamSuites Studio for OBS product identities with the dedicated existing `assets/icons/icon-obsextension.webp` asset: the Downloads index diagram node and product card, StudioApp related-product card, OBS page hero identity, and Extensions related-product card.
- Deliberately left the OBS page's complete hero diagram unchanged, including its mock-window titlebar, authorized-ingress mark, and `OBS-owned output` node. Download controls, routes, product state, manifest/catalog behavior, protected gates, Runtime/Auth authority, and unavailable OBS-package posture are unchanged.
- Added a focused hash assertion for the exact dedicated asset and context assertions for every affected download surface. The earlier Bump Notes entry remains as historical record; this correction explicitly supersedes its mistaken product-identity asset choice.

#### Human-readable notes

Every download-page label or card representing the StreamSuites OBS extension now uses its dedicated OBS-extension icon. The technical diagram on the OBS page has not been changed.

### 2026-08-06 - Compact Version Reference hero navigation

#### Technical notes

- Tightened only the Version Reference hero's responsive outer padding, column gap, display scale, lede/action spacing, and registry-summary rhythm so the diagnostic entry surface occupies less vertical space without changing its content or live data bindings.
- Added a progressively enhanced `Jump to components` anchor targeting the existing component directory, with a stable section ID and header-safe scroll offset. Registry hydration, filters, clipboard actions, Runtime/Auth authority, component rendering, routes, and the rest of the page layout remain unchanged.
- Deployment-identity-only component cards now display the live manifest's system semantic version under an explicit `System version` label and pair it with a restrained `System aligned` chip. Their registry policy remains deployment identity only, their own semantic status remains not applicable, and no independent component version is invented or stored in Public. A bounded script revision ensures browsers receive this renderer update instead of retaining the earlier unversioned client.
- Validation: `node --check js/public-version.js`, the focused 5/5 Version Reference tests, and `git diff --check` passed. Wrangler and Playwright verified a 444px desktop hero at 1365×768, a working `#components` jump with header-safe landing space, full-width mobile hero actions and zero overflow at 390×844, and six deployment-identity cards showing the live `0.5.4-alpha` system version with `System aligned` chips. The only console messages were the existing local-preview analytics CORS failures.

#### Human-readable notes

The Version Reference now reaches its technical content faster: the opening summary is more compact, and a new hero action jumps straight to the individual component directory. System-aligned web clients also show the system version they follow while remaining clearly distinguished from independently versioned products.

### 2026-08-06 - OBS extension icon consistency across Downloads

#### Technical notes

- Replaced every StreamSuites Studio for OBS product-identity use on the Downloads index, StudioApp related-products section, OBS download hero and mock titlebar, and Extensions related-products section with the exact existing `assets/logos/studiologo3.png` asset. The generic OBS mark remains only on the diagram node that explicitly represents `OBS-owned output`, and `obs-0.svg` remains the platform-action mask for the OBS download control.
- Revised only the OBS product stylesheet cache key and added focused asset-hash and context assertions. Download routes, product copy and status, StudioApp manifest hydration, protected access gate, HMAC/cookie behavior, controlled artifact redirect, Runtime/Auth authority, and unavailable OBS-package state are unchanged. No asset, file, version, release data, deployment, commit, or push was created or changed.

#### Human-readable notes

StreamSuites Studio for OBS now carries the requested Studio logo consistently wherever that extension is presented across the download pages, while the OBS logo still correctly identifies OBS itself.

### 2026-08-06 - Roadmap card sheen stacking correction

#### Technical notes

- Corrected the Roadmap programme-card sheen from a negative stacking layer hidden behind each card surface to a visible, pointer-transparent overlay above the surface. Summary and expanded-detail content now establish the next stacking layer so headings, percentages, descriptions, controls, and progress bars remain crisp above the moving highlight.
- Slightly strengthened the existing restrained highlight band without changing the independently animated progress bar. Hover and keyboard focus move the sheen across the complete card; reduced-motion continues to remove the card sheen and hover translation entirely.
- Validation: the focused standalone suite passed 9/9 and `git diff --check` passed apart from repository line-ending notices. Wrangler served `/roadmap` at 1365×768; Playwright confirmed the overlay at stacking level 0, summary content at level 1, a full left-to-right transform change on pointer hover, the same visible transition on keyboard focus, zero horizontal overflow, and `display: none` for the overlay under reduced motion. The rendered hover screenshot visibly showed the highlight band above the card surface while the independent progress animation remained intact.

#### Human-readable notes

Roadmap programme cards now visibly receive the same subtle whole-card hover sheen as the Version Reference cards. The progress bar keeps its own separate animation.

### 2026-08-06 - Live master Version Reference and final public polish

#### Technical notes

- Added canonical `/version` as a fully presentational, human-readable consumer of the authoritative `version-registry-public-v1` feed. `js/public-version.js` reads only the existing same-origin `/api/public/version-registry` proxy path, validates the public schema, and renders all returned component identity, semantic policy/status/version, registry state, build/deployment/publication event summaries, and compatibility posture. It contains no hardcoded system version/build snapshot, private administrative registry data, version allocation, registry mutation, or write request; an unavailable feed produces an explicit retry/source-manifest state with no stale substitute.
- Added compact system/revision/build/freshness metrics, a policy guide, searchable four-group component directory, relevant first-party product icons with the canonical StreamSuites mark as the runtime fallback, semantic state treatments, responsive long-value handling, strong focus states, forced-colour support, and reduced-motion behavior. The exact StudioApp-owned Release Manager icon is copied into Public for the presentation. Release Manager remains a clearly separated local diagnostic companion because it has no separately projected public product version; StudioApp, Alerts Client, and Admin guidance distinguishes public ecosystem identity from executable-local or privileged diagnostic data.
- Added slim per-component Copy details controls, a complete-reference copy control, an `execCommand` fallback for environments without the modern Clipboard API, and one polite status announcement. Copied output is human-readable text containing all public manifest components plus the explicit Release Manager boundary; it does not serialize raw JSON or include credentials, tokens, cookies, stream keys, bypass codes, private exports, device state, or invented local version values.
- Replaced the production landing footer’s obsolete `sswordmarktm.webp` image with the exact `ssmainlogosq.webp` plus `wmnew.webp` header lockup, added the Version Reference to landing discovery, and pointed active public version badges/tooltips to `/version`. Added a restrained whole-card sheen, lift, and border response to Roadmap programme items while preserving the existing progress-bar hover animation and one-time in-view percentage counter; both card and bar motion are suppressed under `prefers-reduced-motion`.
- Added `version.html`, `css/version-page.css`, `js/public-version.js`, `tests/version-page.test.mjs`, and `assets/icons/icon-releasemanager.png`; updated the README route/design/authority documentation and repository tree for every created file. No file was removed, renamed, or materially shortened.
- Validation: changed JavaScript passed `node --check`; `node --test` passed 101/101; `git diff --check` passed apart from existing line-ending notices. Wrangler 4.60.0 compiled the Pages Worker, parsed 20 valid redirect rules, and served the preview; it also repeated the repository’s six pre-existing clean-URL loop warnings and compatibility-date fallback warning. Local route checks returned `/version` 200, `/version/` and `/version.html` 308 to `/version`, `/roadmap` 200, `/tools` 301 to `/downloads/`, and `/changelog` 301 to the canonical Docs changelog index. The same-origin registry returned schema `version-registry-public-v1`, 13 components, system `0.5.4-alpha`, revision 26, and build `2026.08.05+002`.
- Playwright inspected `/version` at 1440×900, 1365×768, and 390×844, the landing footer at 1365×768, and Roadmap card hover/reduced-motion states at 1440×900. The Version Reference rendered all 13 components across four groups with no broken images or horizontal overflow; its hero measured 60.06px at 1365px and 40.95px on mobile; footer-after-main flow, narrow controls, open/closed mobile navigation, component filtering, complete/component clipboard contents, honest 503 fallback/recovery, and exact footer logo dimensions were checked. Roadmap sheen transforms changed on hover and were absent under reduced motion while its percentage and bar became immediately final. Browser console output contained only the already-existing local-preview analytics preflight/CORS failure, not a new Version Reference error.

#### Human-readable notes

`streamsuites.app/version` is now the polished master reference for support and diagnostics: it turns the live registry into readable system, product, web-client, desktop, and companion records, makes each record or the entire reference easy to copy, and clearly explains why a missing independent version is different from a failure. The landing footer finally uses the same real StreamSuites logo lockup as its header, and Roadmap cards now carry the requested subtle sheen without forcing motion on users who disable it.

### 2026-08-06 - Standalone-page content and visual correction

#### Technical notes

- Restored the donation page's six established suggested amounts and amount-specific impact explanations, five original funding-use areas, trust FAQ, and local donor-message draft preview inside the redesigned shell. The draft remains browser-local and is explicitly excluded from checkout; the only donation network action remains the existing one-time `{ amount, source: "public" }` Stripe-session request. Placeholder raised/target totals were not restored because they were not live billing data. This corrective milestone supersedes the earlier removal statement below while retaining it as historical record of the first pass.
- Reduced standalone hero title bounds and excess hero offset, including the About hero override, without changing the Tektur display contract. Corrected the About primary story CTA by excluding it from the generic inline-link color rule so its intended dark text contrasts against the blue action surface.
- Replaced the incorrect wordmark-only footer image on all eight standalone/return pages with the exact `ssmainlogosq.webp` plus `wmnew.webp` header lockup. The landing and download page cascades remain untouched.
- Roadmap programme percentages now count once from zero to their authoritative integer as each row enters the viewport. Progress fills reveal to the same numeric value and use smooth hover/focus scale, glow, and sheen transitions; reduced-motion users receive immediate static values and no hover animation.
- Validation: `git diff --check` passed apart from the repository's line-ending notices; changed JavaScript passed `node --check`; `node --test` passed 96/96. Wrangler 4.60.0 parsed 20 valid redirect rules and served the local Pages preview. Playwright checked all eight standalone/return routes at 1440×900 and 390×844 plus Donate at 1365×768: every route had zero horizontal overflow, footer-after-main flow, bounded 40–74.88px rendered hero text, and the exact two footer logo assets. Donate rendered six amount controls, six impact cards, five funding areas, and three FAQ entries; a typed local draft stayed out of the intercepted unchanged `{ amount: 25, source: "public" }` request. About computed dark `rgb(3, 17, 31)` text on the intended `rgb(80, 168, 255)` CTA. An offscreen Roadmap value remained `0%`, counted upward once after intersection, settled at `63%` with matching 63/0/100 ARIA and 63% fill geometry, kept `63%` through hover while the bar scale/glow/sheen changed, and rendered all eight final values immediately under reduced motion. Browser console output contained only the pre-existing local-preview analytics CORS failure.

#### Human-readable notes

The redesign now preserves the donation information people need to understand each suggested amount, keeps the page hierarchy readable instead of oversized, uses the right StreamSuites brand in both ends of the page, fixes the About action contrast, and gives Roadmap progress the intended polished motion without repeatedly restarting its counters.

### 2026-08-06 - Standalone public pages, Roadmap, and support-hub redesign

#### Technical notes

- Rebuilt `/about.html`, `/donate.html`, `/support.html`, `/privacy.html`, `/accessibility.html`, plus the donation success/cancel returns, on the accepted Studio-first header/footer, exact `ssmainlogosq.webp` plus `wmnew.webp` header brand, local Tektur/Geist Sans/IBM Plex Mono contract, shared gutters, active navigation, compact hydrated version state, visible focus treatment, responsive menu, normal-flow footer, and reduced-motion behavior. Added the scoped `css/standalone-pages.css` layer; the accepted landing and download cascades were not redesigned.
- Preserved the real one-time `https://api.streamsuites.app/billing/donate/session` POST and Stripe Checkout redirect with `{ amount, source: "public" }`, while aligning integer validation and unavailable/error/busy states to the backend contract. Removed the superseded placeholder goal totals, donor-message draft, invented amount-to-infrastructure claims, and obsolete `css/donate.css`; the functional donation client is materially shorter.
- Replaced the disabled presentation of Discord-only support with a complete verified support hub for Docs, account/access guidance, troubleshooting, donation questions, incidents/status, email, and the existing Discord channel/widget. Added stable future ticket-centre form/account/history identifiers and disabled category, priority, subject, description, attachment, and submit controls; there is no form action, request code, upload, persistence, fake ticket, or Public-owned ticket/account state.
- Preserved the February 22, 2026 Privacy Policy wording, provider references, rights, obligations, and date while adding a responsive sticky section index, stable anchor offsets, legal reading width, long-link wrapping, and semantic heading order. Accessibility now states current keyboard/focus, contrast/type, reduced-motion, reflow, and semantic intentions alongside explicit audit, product-coverage, third-party, and assistive-technology limitations; it makes no formal conformance or certification claim.
- Deleted the obsolete rendered `tools.html` page and removed Tools navigation links across live Public HTML. A user-directed follow-up supersedes the initial landing-page fallback: `/tools`, `/tools/`, and `/tools.html` now redirect permanently to `/downloads/`, alongside new `/download`, `/download/`, and `/download.html` compatibility redirects. Generic tool-category copy, the archived landing reference, historical BUMP/changelog records, and compatibility redirect rules remain where semantically appropriate.
- Renamed the rendered Changelog surface to canonical `/roadmap` through `roadmap.html` and updated public navigation/footer/version links and metadata. A user-directed follow-up supersedes the initial compatibility target: retired `/changelog`, `/changelog/`, and `/changelog.html` requests now redirect permanently to the canonical Docs changelog index at `https://docs.streamsuites.app/docs/changelog`, while `/roadmap` remains the sole rendered programme page. Removed the old inline-changelog clients `js/public-changelog.js` and `js/changelog-merge.js` plus their now-unreferenced `public-pages.css` presentation block.
- Consolidated `data/roadmap.json` into eight evidence-based programme estimates: Runtime/Auth/shared state 74%, Public/Creator/Admin/Developer surfaces 68%, Browser Studio 56%, native StudioApp/media engine 64%, Studio for OBS 48%, platform integrations/destinations 47%, live chat/automation/alerts/creator tools 58%, and release engineering/packaging/documentation 63%. The renderer uses native disclosure controls and identical integer values for visible labels, bar widths, `aria-valuenow`, `aria-valuemin`, `aria-valuemax`, and value text, with immediate reduced-motion rendering.
- Replaced the inaccurate inline release-entry collection with verified StreamSuites Docs links for `0.4.0-alpha`, `0.4.2-alpha`, `0.5.0-alpha`, and `0.5.4-alpha`; all four matching source routes exist in the read-only Docs repository.
- Corrected one older release-prep sentence that still described `data/changelog.json` as hydrating a rendered public Changelog page. The data file remains as historical release material, but the rendered page and its hydration clients are now intentionally removed.
- Validation: changed JavaScript passed `node --check`; `node --test` passed 95/95; Wrangler 4.60.0 parsed the affected redirect rules and served the real Pages preview. The original redesign validation exercised all retained pages, direct and trailing-slash Roadmap routes, all 26 local links, all four Docs changelog sources, reduced motion, Privacy anchors, the inert ticket scaffold, and the preserved donation contract across 1365×768, 1440×900, and 390×844. The follow-up route pass exercised all nine `/download`, `/tools`, and `/changelog` compatibility forms, their exact destinations, query preservation, and the unchanged local `/roadmap` page. Wrangler also reported its existing compatibility-date fallback and six pre-existing loop warnings for unrelated `/live/`, `/u/*`, and download trailing-slash rewrites. Local preview still logs the pre-existing cross-origin page-visit analytics rejection from `status-widget.js`; no page-script exception or redesign-specific console error was observed.

#### Human-readable notes

Donate, Support, Privacy, Roadmap, Accessibility, and About now feel like parts of the same current StreamSuites site instead of isolated legacy panels. Tools has been retired cleanly into the Downloads path, the former on-site Changelog is now an evidence-based Roadmap, and the old Changelog address hands release-history readers to Docs. Legal and accessibility information reads more clearly, and the future ticket centre is visibly useful as a design preview without pretending a backend exists.

### 2026-08-06 - Download hero mock-titlebar icon correction

#### Technical notes

- Replaced the StudioApp download diagram's raw black-rendering `streamsuites-0.svg` image with the exact `icondiag-studioapp.svg` current-color mask used by the native tab on the main landing hero, using the same `#b4ef5b` bright-lime state color.
- Added the matching `obs-0.svg` mask and `#c2b3ff` active violet to the OBS download diagram titlebar, and added the StudioApp diagram mask in bright lime to the Extensions diagram titlebar. Revised only the three product-specific download stylesheet cache keys.
- Preserved diagram layout/content, release and catalog states, routes, download controls, HMAC/cookie access gate, manifest validation, controlled redirect, Runtime/Auth authority, and the no-installer-in-Public boundary. No version was bumped and no deployment, commit, or push was performed.

#### Human-readable notes

The three download diagrams now carry the correct colored product mark in their mock titlebars instead of a black or missing icon.

### 2026-08-06 - Landing product-card icon parity

#### Technical notes

- Replaced the three legacy CSS-drawn product-card emblems with the exact `icondiag-studioweb.svg`, `icondiag-studioapp.svg`, and `obs-0.svg` masks already used by their respective hero preview tabs. Cards retain their existing blue, lime, and violet feature colors while matching the tab icons at the same 24px footprint.
- Removed only the superseded pseudo-element glyph geometry and revised the landing stylesheet cache key. Product cards, selection state, preview controls, routes, copy, anchors, access/auth/session contracts, Runtime/Auth authority, protected downloads, and deployment configuration remain unchanged. No version was bumped and no deployment, commit, or push was performed.

#### Human-readable notes

The three product cards now use the same recognizable Studio, StudioApp, and OBS symbols as the matching tabs in the hero diagram.

### 2026-08-06 - Download center and product-page visual polish

#### Technical notes

- Added `/downloads/` as a searchable, responsive parent index for the existing StudioApp, Studio for OBS, and Extensions surfaces. The index uses the main StreamSuites favicon and square brand mark, provides a high-detail product-library diagram, preserves search state in the URL, and links only to real product pages; it contains no artifact, installer, package, or independent release registry.
- Reworked the four download hero treatments around a neutral graphite/steel shell with product feature colors constrained to title gradients, trim, status, and local diagram glow. Added eased perspective/hover depth, restrained section entrances, responsive layouts, reduced-motion/forced-colors fallbacks, and a bounded stylesheet revision so a newly deployed document does not retain the prior cached presentation. Replaced the former sparse OBS identity lockup and Extensions status grid with richer, still non-operational workflow/catalog diagrams; no product behavior was removed.
- Switched the StudioApp, OBS Plugin, and Extensions pages to the exact existing Browser Studio favicon. Added dark high-contrast text to bright primary controls and supplied `windows-0.svg`, `obs-0.svg`, `apple-0.svg`, and `linux-0.svg` as current-color button masks. Removed six stale preload hints for legacy Sui Generis/Recharge faces that these pages no longer use; actual approved Public typography continues to load through `public-fonts.css`.
- Added disabled macOS and Linux StudioApp release/requirements sections with explicit Coming Soon state and no invented version, build, release date, package size, compatibility baseline, signature, or artifact link. Expanded Windows storage guidance using the authoritative manifest-hydrated installer size plus installation/update headroom and separate production-media storage; no unsupported fixed disk, RAM, CPU, GPU, or vendor minimum was introduced.
- Added truthful compatibility/storage disclosures to the unreleased OBS and empty Extensions surfaces. Preserved the StudioApp Pages gate variables, HMAC cookie, locked-safe release metadata, strict manifest validation, release IDs, same-origin controlled redirect, no-installer-in-Public boundary, extension catalog schema and empty production catalog. No version was bumped and no deploy, commit, push, manifest, R2 object, Pages binding, or release data was changed.

#### Human-readable notes

The download family now has a polished searchable home, richer product diagrams, clearer platform actions, and consistent feature-color detailing. StudioApp visibly includes future macOS and Linux destinations without pretending either build exists, while the real Windows release flow remains protected and authoritative.

### 2026-08-06 - Public landing product-diagram icon and depth correction

#### Technical notes

- Replaced the three CSS-drawn product-tab glyphs with the supplied first-party `icondiag-studioweb.svg`, `icondiag-studioapp.svg`, and existing `obs-0.svg` assets. They render as masks at the existing 24px size so inactive and product-active colors remain governed by the established tab state.
- Replaced the mock-window titlebar `S` with `streamsuites-0.svg` inside the existing 19px rounded badge, and replaced the Alpha card's text character with `alpha.svg` at the existing green visual scale. The tracked `beta.svg` remains unused and reserved for a future explicitly authorized release-state change.
- Corrected the preview seam by placing the angled device above the tab strip and overlapping it by two pixels. Added a bounded eased hover transform that relaxes the perspective and returns smoothly, with the existing reduced-motion contract preventing the hover transform. Increased the separation below the diagram by moving the `Explore the suite` cue 20px lower within the hero.
- Updated the landing stylesheet cache key and focused source coverage. Product-tab behavior, keyboard navigation, hero copy, anchors, routes, access/auth/session/Turnstile contracts, Runtime/Auth authority, status/version hydration, protected downloads, and deployment configuration remain unchanged. No version was bumped and no deployment, commit, or push was performed.

#### Human-readable notes

The hero diagram now uses the correct StreamSuites product icons, its angled mock window sits cleanly above the tab seam and eases naturally on hover, the jump cue has more breathing room, and the Alpha card uses the refined brand symbol.

### 2026-08-05 - Public landing header identity and edge reset

#### Technical notes

- Prefixed the production landing header wordmark with the existing first-party `assets/logos/ssmainlogosq.webp` square mark, using separately scoped mark and wordmark sizing so the combined identity remains clear across desktop, tablet, and mobile header layouts.
- Reset the live landing document body margin and padding to zero, removing the browser-default 8px outer inset so the access notices, header, hero, and remaining page frame reach the viewport edges as intended.
- Revised only the landing stylesheet cache key and focused source assertions. Existing hero composition, routes, access/auth/session/Turnstile contracts, Runtime/Auth authority, status/version hydration, download surfaces, product data, and deployment configuration remain unchanged. No file was created or removed, no version was bumped, and no deployment, commit, or push was performed.

#### Human-readable notes

The main StreamSuites icon now leads the header wordmark, and the unintended dark gutter around the entire landing page is gone.

### 2026-08-01 - Major Public application-surface polish

#### Technical notes

- Polished the existing Public application shell with a cooler near-black graphite/steel/blue palette, selective cyan-indigo and purple depth, a bounded 1540px content track, larger page/hero hierarchy, roomier section rhythm, less fragmented dashboard grids, stronger selected sidebar/filter states, layered cards, modal depth, and restrained route/card motion with reduced-motion fallbacks. Narrow viewports now normalize a stored expanded desktop sidebar to the compact icon rail without overwriting the desktop preference.
- Harmonized standalone support, legal, informational, account, auth, requests, stats, resources, tools, donation, and related pages through the existing `public-pages-v2.css`, `public-login.css`, and `requests-auth.css` layers. Their HTML structure, form IDs, handlers, routes, copy, and server contracts remain unchanged.
- Kept production `/` unchanged on its accepted independent `studio-first-landing.css` cascade. Explicitly excluded `.download-surface` from the new standalone overrides and did not change StudioApp/OBS/Extensions HTML, JavaScript, manifest/catalog data, Pages Functions, HMAC/cookie access gate, controlled redirect, download metadata, installer state, or specialized product layouts.
- Extended the focused source regression to require the new shell/content/grid/selected-state, standalone-page, auth, and reduced-motion seams while asserting that the production landing does not load either application polish stylesheet.
- Preserved all public routes, aliases, slugs, hashes, queries, deep links, filters, pagination, sort/view state, API calls, auth/session flows, Runtime/Auth ownership, live/profile/artifact/economy hydration, loading/empty/error states, canonical version/build authority, and deployment configuration. No file was created or removed, no version was bumped, and no deployment, commit, or push was performed.
- Publication remains blocked on locating and reviewing genuine redistribution license text for the supplied Tektur binary; no license text was fabricated and the required family was not substituted.

#### Human-readable notes

The Public dashboard and supporting pages now have stronger hierarchy, more breathing room, and calmer premium depth while behaving exactly as before. The approved landing and the protected download experiences were deliberately left alone.

### 2026-07-31 - Studio-first Public experience

#### Technical notes

- Rebuilt production `/` around the Studio Command Center direction: a responsive Studio-first hero, keyboard-accessible Browser Studio / StudioApp / Studio for OBS preview tabs, an illustrative non-operational production workspace, three truthful product cards, a Runtime/Auth authority and media-ownership diagram, connected-capability modules, wider ecosystem links, integrated Alpha disclosure, and a responsive status/version footer.
- Corrected the product hierarchy to center Browser Studio and native StudioApp, with StreamSuites Studio for OBS as the separate plugin/integration and automation, chat, alerts, overlays, clips, polls, wheels, tallies, scoreboards, public profiles, and progression as connected capabilities. Browser Studio remains closed-access and OFF AIR with Cloudflare RealtimeKit media; StudioApp remains native C#/.NET/WPF plus a supervised C++20 engine; OBS retains its own media pipeline. No production media path is shown through Python.
- Rebuilt `/about.html` as an editorial product story covering the product family, shared authority, browser/native/OBS boundaries, engagement foundation, wider client ecosystem, Brainstream Media Group attribution, and explicit Alpha posture. The existing manifest renderer, stable section/entry anchors, expandable developer details, error slot, and version/build/owner/copyright metadata hooks remain. The three About JSON sources were updated in their existing schema and order, replacing the obsolete three-repository/static-no-auth narrative with current product and authority truth.
- Added the shared local typography contract in `css/public-fonts.css`: Tektur display (`assets/fonts/Tektur-VariableFont_wdth,wght.ttf`), Geist Sans body/UI (`Geist-Light`, `Regular`, `Medium`, `SemiBold`, `Bold`, and `ExtraBold`), and IBM Plex Mono metadata (`mono/IBMPlexMono-Light`, `Regular`, `Medium`, `SemiBold`, and `Bold`). All required font binaries already existed in production and matched the POC copies, so none was copied. Faces use `font-display: swap`; refreshed surfaces disable synthesis; no external font request or JavaScript font loader was added.
- Added `css/studio-first-landing.css` and `js/studio-first-landing.js` for the production landing presentation, accessible product switching, ecosystem preview selection, mobile menu, session-scoped Alpha-notice dismissal, sticky-header state, IntersectionObserver reveals, and reduced-motion fallback. Auth/access/session/Turnstile/status/version logic remains in its established production implementation and was not moved into the decorative client.
- Harmonized functional Public Dashboard, gallery, profile, community, live, progression, economy, support, legal, auth, requests, changelog, resources, tools, stats, and donation surfaces through the existing `theme-dark.css`, `public-pages.css`, `public-pages-v2.css`, `public-shell.css`, `base.css`, and `components.css` layers. Dense application layouts, APIs, query/hash/slug resolution, filters, loading/empty/error states, profile hydration, and route aliases remain intact. The Public sidebar now includes real Browser Studio, StudioApp, and Studio for OBS entries, and the Public Dashboard hero now frames existing public artifacts around the production family without inventing new data.
- Preserved the specialized StudioApp, OBS, and Extensions download layouts, authoritative icons, manifest/catalog clients, fail-closed access state, HMAC cookie boundary, controlled redirect, extension schema, and real routes. Their shared `download-surface.css` and StudioApp hash metadata typography now use the approved Public font roles; no installer, raw download URL, bypass code, product version/build, manifest, R2 object, Pages binding, or deployment was changed.
- Preserved every landing production access contract: `/auth/access-state`, lockout banner and session dismissal, `/auth/session`, creator CTA switching, login/signup modal, Google/GitHub/X/Discord/Twitch OAuth routing, creator `surface` and return routing, email/password flows, verification/resend, password validation, `/auth/turnstile/config`, Turnstile tokens, short-lived `/auth/debug/unlock`, cookies, onboarding redirects, query-driven opening, backdrop/close/Escape handling, and access-disabled states. Status widget, changelog link, and Runtime/Auth version hydration remain wired.
- Retired the obsolete live `css/aurora-landing.css` centered-hero/About-slide presentation after its still-required auth/access styles were consolidated into `css/studio-first-landing.css`; the removed file is therefore shorter by deletion rather than replacement. Removed the matching dead About slide/progress/wheel listener from `index.html`. No dead slide selector or listener remains in the live landing. The historical `index-v2.html` and `css/aurora-landing-v2.css`, the `sspoc1/` reference, and both POC ZIP archives remain unchanged for reference.
- Reworked `404.html` away from the retired live landing stylesheet into a quiet Studio-first not-found surface while preserving its requested-path message, status widget, Runtime version hydration, and established destination links.
- Follow-up: replaced the top brand icon in both active login modals—the landing modal and the shared Public-shell modal—with the existing first-party `assets/logos/ssmainlogosq.webp` square mark. Standalone login/request pages and all auth behavior remain unchanged.
- Follow-up: restored the prior login-modal presentation hierarchy after the Studio-first consolidation made lower controls too compressed. The landing modal is centered again at every breakpoint, uses the available viewport height, restores readable legal and expandable other-surface controls, and again renders `assets/icons/ui/key.svg` on the temporary bypass notice. OAuth buttons, email/password expansion, login/signup switching, legal copy, and Public/Admin/Developer surface links remain present; no auth endpoint or handler changed.
- Follow-up: aligned the marked landing and Public-shell chrome without changing auth authority or routes. The landing header now uses `assets/logos/wmnew.webp`; its dismissible access notice uses `assets/icons/ui/info.svg` and `assets/icons/ui/close.svg`; and the existing Creator Login control exposes Public, Studio, and Developer login links on hover or keyboard focus, explicitly excluding Admin. In the Public shell, Dashboard now precedes Production, the StreamSuites title and subheading chip use Tektur at extra-bold and regular weights, and account-overview values use the system monospace stack.
- Follow-up: corrected the Public-shell brand icon to `assets/logos/ssmainlogosq.webp` and reduced the Tektur StreamSuites™ title from weight 900 to weight 700 so it remains bold without reading as extra-heavy. The landing `wmnew.webp` wordmark and prior shell/navigation fixes remain unchanged.
- Follow-up: restored the production landing's approved `sspoc1` visual language where the live implementation had been reduced too far. The hero's second line again uses the silver/product-accent gradient and includes the animated `Explore the suite` jump link; Connected Creator Tools again uses the six colored bento modules with room avatars, destination tokens, chat events, alert waveform, engagement pills, and media previews; and the Runtime/Auth architecture is again a clean central authority node with explicit browser, native, and OBS branches. The landing stylesheet URL now carries a bounded presentation revision so deployed HTML cannot be paired with the previous long-cached CSS. Existing public artifact routes remain linked, RealtimeKit wording remains current, and no authority or media ownership moved into Public.
- Added `tests/studio-first-public-experience.test.mjs`, updated existing typography/auth assertions for the new production contract, and made the affected source-block extractors accept both LF and Windows CRLF without weakening their function-body checks. Coverage checks product truth, media boundaries, auth/status/version hooks, exact local font assets, About records, real product routes, POC preservation, and removal of the obsolete live landing stylesheet.
- Accessibility and performance safeguards include skip links, semantic tablists, roving keyboard focus, visible focus rings, mobile navigation with Escape/focus return, accessible modal state, reduced-motion fallbacks, CSS-only ambient effects, bounded visual layers, no autoplay media/WebGL/canvas dependency, and one passive scroll listener plus IntersectionObserver-based reveals.
- Route and hosting contracts remain unchanged: `_redirects`, `wrangler.toml`, Pages Functions, clean artifact/profile paths, deep links, aliases, hashes, queries, canonical URLs, auth callbacks, and specialized download routes were not rewritten. No sibling repository, Runtime/Auth API, canonical version/build, environment, deployment, commit, or push was changed.
- Licensing follow-up: the existing `assets/fonts/GEISTMONOOFL.txt` and `assets/fonts/mono/IBMPLEXMONOOFL.txt` remain present. The POC documentation references a Tektur `OFL.txt`, but that exact file was not found in the POC or neighboring StreamSuites font directories. No license text was fabricated and the selected Tektur family was not substituted; the missing license file must be recovered and reviewed before publication.

#### Human-readable notes

The Public site now introduces StreamSuites around Browser Studio, native StudioApp, and the OBS integration. The existing engagement and audience tools are still present, but they now read as capabilities connected around the production workflow. Account access, security checks, public data, downloads, and routes continue to use the same production contracts underneath the new presentation.

### 2026-07-28 - Direct R2 StudioApp release reads

#### Technical notes

- Bound Pages Functions directly to the existing `streamsuites-updates` bucket as `STREAMSUITES_UPDATES_BUCKET` and replaced the production same-zone HTTP manifest fetch with bounded direct R2 reads. The product object remains preferred; legacy fallback is permitted only when that object is missing or declares an unsupported integer schema.
- Preserved strict release identity, immutable host/path, size, hash and signature-state validation. Missing binding, R2 read, body-size, UTF-8, JSON, schema, contract and projection failures remain distinct nonsecret diagnostics instead of collapsing into `manifest_unavailable`.
- Production cannot silently use HTTP fallback. The explicit compatibility seam is restricted to localhost, `127.0.0.1`, and Cloudflare Preview `.pages.dev` hosts. Locked users still receive validated release metadata, while only the controlled installer request remains denied.
- Focused contracts cover direct R2 product and legacy reads, fallback boundaries, invalid and hostile objects, missing binding, locked metadata, exact redirect, and arbitrary-redirect rejection. No Pages binding/environment mutation, deployment, R2 write, installer upload, version/build bump, commit, or push was performed.

#### Human-readable notes

After the checked-in binding is configured for both Cloudflare Production and Preview and this source is deployed, the locked StudioApp page can read the published release directly from its R2 bucket without depending on a same-zone network fetch. The earlier compatibility flag did not repair the active production path and is no longer the production design.

### 2026-07-27 - StudioApp manifest hydration and retry idempotence

#### Technical notes

- Identified the production `manifest_unavailable` cause as the Pages Function's same-zone global fetch to `updates.streamsuites.app`: the update manifest was healthy over public HTTPS, while the deployed Worker runtime was not routing that subrequest through Cloudflare's public front door. Added the Pages Wrangler compatibility configuration with `global_fetch_strictly_public`; strict product/legacy validation remains unchanged.
- Replaced the collapsing diagnostic with bounded nonsecret fetch, HTTP-status, content-type, parse, contract, and projection categories. Valid current schema-v2 metadata hydrates while locked; unauthorized download remains fail-closed and an authorized request can redirect only to the exact validated installer URL.
- Deployment-marker schema 2 is deterministic from canonical relevant Public source excluding the marker, StudioApp product/version/build, and route. It contains no timestamp, random value, branch, or self-referential commit SHA; remote Git SHA remains a separate verification.
- Focused tests cover same-zone runtime configuration, exact locked metadata, diagnostic classification, strict malformed-manifest rejection, marker contract, unauthorized denial, and exact controlled redirect. No Pages deployment, environment mutation, installer upload, R2 write, version/build bump, commit, or push was performed.

#### Human-readable notes

The locked page can show the real published release again after this source is deployed. Repeating the same Public release step produces the same marker bytes instead of endless marker-only commits, while the download gate remains closed to unauthorized users.

### 2026-07-27 - Locked StudioApp release metadata and deployment proof

- Added a locked-safe same-origin StudioApp release metadata endpoint backed by bounded strict schema-v2 validation and a strict schema-v1 compatibility fallback. The page now shows the real `0.2.4-alpha / 2026.07.26+002` identity, exact installer size/hash, system compatibility and unsigned ALPHA state while truthfully remaining **Locked**.
- Preserved the existing fail-closed access boundary: only a valid short-lived HttpOnly cookie enables the controlled route, arbitrary redirect inputs and stale version/build requests are rejected, and the browser receives no bypass secret. Access state now distinguishes configured from missing required Pages variables without exposing their values.
- Added a nonsecret deployment-correlation marker and expanded focused contracts for valid, missing, malformed and incompatible manifests, locked metadata, invalid authorization, exact authorized redirect and secret-free browser responses.
- No installer, StudioApp/Runtime version or build, R2 object/manifest, Pages environment, deployment, commit or push was changed.

### 2026-07-24 - Studio product download surfaces

- Rebuilt `/downloads/studioapp/` as a polished responsive Windows-native ALPHA product page using Browser Studio's exact local Sui Generis body font, Recharge display font, and Studio brand mark. Existing Pages gate variables, HMAC cookie, Functions, manifest preference/fallback, strict validation, and same-origin controlled download remain authoritative and fail closed.
- Added `/downloads/obs-plugin/` for **StreamSuites Studio for OBS** with an explicit in-development state, real project boundaries, and no invented public artifact, version, release date, or compatibility range.
- Added `/downloads/studioapp/extensions/` with accessible search, filters, sorting, URL state, loading/empty/unavailable/error states, strict schema validation, and a production catalog that is deliberately non-authoritative and empty. Runtime/Auth or its authoritative generated export remains the future listing authority; no extension-download contract was created.
- Added shared/product CSS and focused Node contracts for routes, copy, asset provenance, gate preservation, safe catalog rendering, unsafe-field rejection, and fixture-only populated states. Local Cloudflare Functions compilation and real-browser desktop/tablet/mobile checks covered locked, rejected-code, unlocked manifest, loading, unavailable, empty, populated, filtered, keyboard-focus, reduced-motion/forced-colors-aware styling, and overflow behavior.
- Human note: the Studio family now has one clear, restrained download area that says exactly what is available today and what is still being built.
- Updated the Extensions / Plugin Store visual identity so `/downloads/studioapp/extensions/` and related cross-links now use `/assets/icons/packboxicon-plugin.webp` (`StreamSuites StudioApp Extensions`/`StreamSuites Plugin Store`) while preserving StudioApp app branding and OBS plugin branding in their own contexts.
- No runtime, Studio, StudioApp, OBS, Dashboard, Pages environment, installer, deployment, release, commit, or version metadata was changed.

### 2026-07-24 - Version-cycle synchronization only

- Opened the next Public bucket at `0.5.4-alpha / 0.5.5-alpha`.
- Updated Public runtime mirror metadata to match runtime `0.5.4-alpha`.
- No user-facing behavior changes are included in this cycle.

### 2026-07-23 - Independent StudioApp manifest preference

- The guarded download endpoint now requests schema-v2 `product-manifest.json` first so the page presents independent `0.2.4-alpha` StudioApp identity, then safely falls back to the exact deployed schema-v1 `manifest.json` bridge for rollout/offline compatibility.
- Existing access lockout, HMAC cookie, strict host/path/hash/size/AppId validation, controlled redirect, no-installer boundary, and no-secret browser payload remain unchanged. Focused tests cover product preference and legacy fallback.
- No installer, live manifest, bypass code, Pages variable or deployment was changed.
- All seven focused Node gate suites passed locally. The production page was checked only for unauthenticated reachability; no gate bypass, Preview or production deployment was exercised.

### 2026-07-23 - Explicit StudioApp product release metadata

- Updated the guarded StudioApp download manifest parser to accept both deployed legacy v1 and explicit `streamsuites-studioapp` v2 manifests. StudioApp product version/build is primary; optional StreamSuites system compatibility version/build is secondary and no Runtime export is used as installer identity.
- The existing `/downloads/studioapp` route, server-side bypass validation, gate variables, controlled redirect, alpha-manifest hydration and no-installer-in-Public boundary remain intact. Normal StudioApp R2 releases require no Public redeployment; the private StudioApp Release Manager only verifies this page and guides a separate manual Public deployment when Public source itself changes.
- Added focused old/new manifest, product identity, secondary metadata, gate-preservation, secret-boundary and route-presentation assertions. No installer was copied here and no Cloudflare Pages deployment was performed.

### 2026-07-22 - Canonical guarded StudioApp ALPHA download page

- Added the responsive `/downloads/studioapp` landing page with truthful native-Windows ALPHA capabilities, requirements, unsigned-build guidance, reduced-motion/high-contrast support, and the existing Public access-modal and lockout-banner visual language.
- Added server-side Pages access configuration, constant-shape tester-code comparison, bounded unlock requests, short-lived HMAC-signed HttpOnly/Secure/SameSite cookies, same-origin mutation checks, expiry/tamper/code-rotation rejection, and a presentation-only banner dismissal that never grants access.
- Added canonical update-manifest validation and a same-origin controlled download redirect. Product, channel, architecture, immutable release path, filename, size, SHA-256, HTTPS host, and optional safe release-notes metadata fail closed; no raw installer URL or bypass secret is shipped to the static page.
- Added focused Node tests for locked/unlocked configuration, cookie lifecycle, request bounds/origin, malicious manifest fields, static secret/installer leakage, route aliases, and server-only download control. No deployment, R2 publication, installer rebuild, version change, or Runtime/Auth change was performed.
- All six focused Node gate suites and module syntax checks passed. Local desktop, tablet, and mobile browser fixtures covered locked/no-bypass, locked/bypass, rejected-code, manifest-unavailable, and unlocked metadata/download states; Cloudflare Preview/production execution and a real production bypass were deliberately not run.

Approved testers can use the temporary access field when the Pages operator enables it. Everyone else sees the honest ALPHA access notice, and a missing or invalid server response keeps Download disabled.

- Public item detail price/exchange stat cards now show currency-icon `N/A` when an item is sale-only (exchange unavailable) or exchange-only (purchase unavailable) instead of misleading `0` Stekel values; lightbox currency symbols stay ~12% larger than adjacent value text (`1.12em`) and vertically center-align with values on `/games` and profile modals.
- Item detail lightbox layout: desktop economy item modals on `/games` and public profiles are wider (`min(1360px, calc(100vw - 32px))`) with a larger copy column ratio and slim dark-themed scrollbars on the modal surface.
- Item detail metadata parity: Chat alias now renders immediately after Item code in wallet, inventory, and market lightbox metadata on `/games` and public profiles, using the same scoped `SUSEMono` blue tint (`economy-item-code-value`) as item codes; empty aliases show `—`.
- Authoritative item-definition `tags` field: Runtime/Auth now stores comma-normalized catalog tags on all 157 public item definitions, exposes them on profile/global inventory payloads, and Public profile inventory rows hoist `item.tags` / `definition.tags` into item detail modal chip sources.
- Emergency regression fix: item detail modals now render all available tags as individual hashtag chips instead of only one tag.
- Item-level catalog tags: Runtime/Auth now stores `tags` on all 157 public item definitions (3-5 tags each) and exports them on inventory/listing payloads; Public profile and `/games` item detail lightboxes read listing `tags` for hashtag chips.
- `/games` market/exchange modal fix (Public-only): flat market-exchange catalog rows now hydrate with `definition.tags` from bundled `assets/data/public-item-catalog-tags.json` plus live inventory definitions before the lightbox normalizer runs, matching profile inventory and Dashboard definition modals without Runtime changes.
- Follow-up fix: hashtag chips exclude chat/command aliases and singular `alias`; those remain in the Chat alias metadata row while catalog/search `tags`, `search_tags`, `aliases`, and nested definition/metadata fields supply chip text.
- Technical note: tag extraction now aggregates all supported tag sources (strings, arrays, object rows, nested definition/metadata/attributes fields) before normalization and case-insensitive dedupe across Public `/games` and profile lightboxes.
- Economy item detail hashtag chips use Sui Generis Regular (lightest available face) with a soft light-blue tint for chip text; item code values remain SUSEMono.
- Economy item detail hashtag chips render in the description block again (after short/details copy, before stats/metadata), not in the bottom metadata table, on `/games` and public profile lightboxes.
- Emergency regression fix: economy item detail modals again show associated tags as slim `#hashtag` chips after the prior chip pass stopped rendering tags when payloads used nested definition/metadata fields, object-shaped tag arrays, or alternate tag field names.
- Public and profile economy item detail lightboxes render associated tags as slim `#hashtag` chips instead of plaintext comma-separated lines; item code values use scoped `SUSEMono` with a subtle blue tint; modal quantity inputs use dark-themed native spinner styling.
- Technical note: tag chip rendering is presentation-only and consumes existing Runtime/Auth tag/chip/attribute fields already exposed to the shared lightbox normalizer; navigation, currency masks, timestamp formatting, and market action payloads are unchanged.
- Human note: More Details on `/games`, wallet/inventory rows, and public profile economy rows should show premium tag chips and monospace item codes without changing buy/exchange behavior.

- Public `/games` Exchange category columns still share full row height with empty space below short categories, while item rows stay top-aligned; each category keeps its own page index and only the global rows-per-category count is shared.
- Exchange category item thumbnails are 50% larger in-category, and the More Details action spans the full item card width.
- Exchange per-category Prev/Next now scrolls the paginated category card into view instead of jumping to the top of the whole Exchange section.
- Exchange categories now paginate independently with a global `Rows per category` control (5/10/25/50, default 5), compact per-category Prev/Next controls, and truthful `Showing X-Y of Z` counts that do not reuse Market page-level pagination.
- Exchange category ordering now prioritizes Gemstones/Gems first and Currency/Wallet/Stekels categories second before the existing logical category sort.
- Technical note: exchange pagination is presentation-only and slices already-hydrated public-safe exchange rows per category; Runtime/Auth remains the authority for exchange eligibility, held quantities, values, and mutations.
- Human note: Exchange should no longer show tall empty columns beside live categories, and large categories like Combat Vehicles can be browsed five rows at a time without affecting Gems or Currency paging.

- Public `/games` and profile item detail lightboxes now use a compact header navigation group for Previous/Next instead of side-positioned controls, preserving disabled edge states, Left/Right navigation, Escape close, focus return, and mobile stacking without covering item art or copy.
- Public lightbox currency/Stekel/Credit values now force the currentColor `currencyunit.svg` mask and numeric value back to high-contrast white in modal price, value, balance, unit value, and exchange/cost rows while leaving pure quantities and metadata unsymbolized.
- Public `/games` Exchange now hydrates categories from existing public-safe exchange-capable payload rows across exchange arrays, market/catalog rows, and public item definitions, deduped by item code; empty Future-ready cards only appear when no live exchange-capable rows exist.
- Public `/games` Exchange category cards now use a wider responsive grid and larger in-category item rows so thumbnails, title, value, held/unavailable state, action controls, and More Details have room.
- Technical note: the exchange collector remains a read-only consumer of Runtime/Auth payload fields such as `exchange_enabled`, `exchangeable`, `can_exchange`, `exchange_value_*`, and exchange input/output metadata; it does not invent balances, inventory, prices, exchange rules, or mutation paths.
- Human note: exchange-capable items should now appear as real category listings where Runtime/Auth provides them, while scaffold empty states remain truthful for genuinely absent exchange data.

- Public `/games` and profile economy item detail lightboxes now support scoped Previous/Next navigation inside the open modal for market pages, wallet rows, and inventory rows, with Left/Right arrow key support, disabled edge controls, Escape close behavior, and focus return to the original trigger preserved.
- Lightbox currency, stekel, and credit amount fields now use the existing `assets/games/currencyunit.svg` via a currentColor CSS mask so the symbol renders inline before values at text height instead of as a black image.
- Lightbox timestamp metadata now formats parseable ISO/machine timestamps as human UTC strings with ordinal suffixes while preserving unparseable source text.
- Technical note: navigation context is presentation-only and scoped to the currently rendered visible collection where available; Public continues to consume Runtime/Auth wallet, inventory, market, and item-definition payloads without owning balances, inventory, prices, exchange rules, or mutations.
- Human note: players can inspect adjacent items without closing the modal, while currency values and Updated/Created/Granted/Acquired/Expires dates should read cleanly across `/games` and public profiles.

- Emergency regression fix: Public item detail modal was blocked by a JavaScript ReferenceError and now opens on games/profile surfaces.
- Technical note: `normalizeEconomyItemLightboxData` no longer references an undeclared `categoryDisplayLabel` and now handles wallet/inventory/market/profile payloads defensively.

- Emergency regression fix: Public wallet/inventory item rows now use delegated click and keyboard activation for the maximum-detail economy item lightbox, scoped to the shared wallet/inventory/profile row data attributes so `/games` and `/u/*` rows continue working after hydration, pagination, and profile scope re-renders.
- The old row-local click/key modal wiring is no longer the active lightbox path; row-local listeners remain for hover/focus tooltip behavior only, while click/tap and Enter/Space close the tooltip state and open the read-only item lightbox with the existing public-safe row payload.
- Human note: clicking wallet units, inventory items, and profile economy rows should open the full detail viewer again instead of only affecting the tooltip, while Dashboard `/economy` remains untouched.

- Public `/u/*` and `/@*` profile wallet/inventory rows now share the public economy item lightbox path: hover/focus keeps the enlarged tooltip, while click/tap or Enter/Space opens the maximum-detail read-only item viewer and Escape returns focus to the triggering row.
- The shared public item detail normalizer now includes additional profile-safe fields when present, including lore/flavour text, subtype, limited state, requirements, costs, exchange inputs/outputs, acquisition/grant timestamps, and existing source/version/tag metadata without fabricating empty rows.
- Human note: profile visitors can inspect held items and wallet units with the same polished viewer used by `/games`, while Public remains a read-only consumer of Runtime/Auth profile economy data.

- Public `/games` wallet and inventory entries now open the shared maximum-detail economy item lightbox on click/tap or Enter/Space while preserving hover/focus tooltips.
- Wallet/inventory tooltip media was enlarged from the previous 80px/70px presentation to a 160px media well with 140px item art, with a mobile clamp to prevent small-screen overflow.
- The `/games` item detail lightbox now uses a presentation-only normalizer for market, inventory, and wallet/currency rows so it can show available titles, imagery, descriptions, quantities, balances, values, availability, source/version/timestamp metadata, tags, and other returned public-safe fields without inventing empty rows.
- Existing market/shop lightbox behavior remains backed by the same Runtime/Auth market payload and continues to render buy/exchange controls only for market items.
- Human note: players can inspect wallet units and held inventory like premium game items, but Public still does not own balances, inventory, pricing, exchange rules, availability, or mutations.

- Public `/games` now uses the fixed Public shell topbar search for shop, market, and exchange catalog filtering, with an explicit clear/reset button shared with the existing shell search pattern.
- `/games` market results now support Gallery, Condensed, and Compact view modes. Gallery remains the default, while Condensed/Compact hide in-card descriptions and reveal buy/exchange/details actions on hover or keyboard focus.
- Market result paging now defaults to 50 results per page with 20/50/100 page-size options, truthful result summaries, and safe page resets when search, view, or page-size settings change.
- Exchange-only items are merged into the storefront as exchange actions without adding Public-side authority, sold-out items remain visible with `SOLD OUT` state, and signed-in users without required exchange inventory see disabled exchange CTAs with a reason.
- Exchange rendering now groups Runtime/Auth-provided exchange rows into slimmer category cards and shows truthful future-ready empty categories for non-currency/gem item types when no live exchange rules exist.
- Human note: Games & Economy should feel more like a browsable public shop hub while still treating Runtime/Auth as the only source for balances, inventory, availability, prices, and mutation rules.

- Restored Public profile/header avatar rendering from legacy and normalized Runtime/Auth image fields.
- Fallback initials now apply only when no usable image URL exists or an individual image fails.
- Public image helpers now reject known local fallback profile icons as source image URLs while preserving real external/custom/provider URLs unchanged.

- Emergency hotfixed Public avatar/profile image rendering with legacy-field compatibility for provider picture, profile photo, display/public avatar, nested media, and legacy `avatar` aliases.
- Public image hydration now preserves external provider URLs without cache-query mutation and falls back visually only when no usable URL exists or an individual image element fails.
- Human note: Public login/header, profile pages, and community/member cards should show real Runtime/Auth-owned images again instead of hiding valid URLs behind initials.

- Public login/header, profile, community/member, and data-hub image hydration now consumes Runtime/Auth normalized image/profile media fields before legacy avatar aliases.
- Added stable image cache-key handling and broken-image fallback behavior so Public swaps to initials/local fallback UI without clearing the stored Runtime/Auth URL.
- Human note: Public avatars and profile images should survive refresh/cache clears more reliably and avoid raw broken image icons.

- Corrected stale Public HTML version comments and runtime/shared-state mirror metadata that still reported `v0.4.2-alpha`; the public surface remains downstream of runtime/export authority.
- Human note: Public static fallbacks and mirrored current-state payloads now align with the `v0.5.0-alpha` platform release.

- Public `/games` store category fallback display now recognizes Armor, Platform Badges, and Fish & Treasures while preserving Combat Vehicles and Weapons.
- Store/category labels remain human-facing and avoid exposing raw internal category values such as `armor`, `platform_badge`, `fish_treasure`, or `combat_vehicle` in chips, groups, and detail metadata.
- Store cards continue to consume improved Runtime/Auth item descriptions, with only human-facing local fallback copy when catalog text is absent.

- Public `/games` store grouping now recognizes `combat_vehicle` and displays the category as `Combat Vehicles` in gallery groups, chips, and detail views.
- Store cards continue to consume Runtime/Auth item descriptions, with local fallback copy kept human-facing when catalog text is missing.
- Weapons and combat vehicles are no longer presented as the same Public category.
- Human note: tactical aircraft, drones, tanks, and helicopters can now sit in their own storefront group instead of being buried under Weapons.

- `/games` market gallery cards now show prominent item pricing with the StreamSuites currency icon.
- Market items can expand into a responsive lightbox detail view.
- Lightbox exposes large item art, descriptions, pricing, category/rarity, and action state from public-safe payload data.
- `/games` item prices now render the primary Stekels shop price only when both Stekels and Credits fields are present, avoiding duplicate price pills in gallery cards and lightbox details.
- `/games` top hero spacing and the Market Gallery/List toggle alignment were corrected so the hero content is not clipped and the view toggle sits on the right margin.
- `/games` hero decoration was simplified by removing the circular patterned background layer and using a content-sized stat layout that stays inside the hero container.
- Jump-to anchor toggle now collapses the entire anchor container instead of only hiding buttons.
- Anchor overflow arrows remain hidden unless overflow exists.
- `/games` Games & Economy page redesigned and polished with a stronger public storefront hero while preserving Runtime/Auth as the economy authority.
- Market/store now defaults to a gallery card view with larger item imagery, graceful image fallbacks, compact sale metadata, and unavailable states that do not invent price, stock, or purchase data.
- Market list view remains available through an in-page Gallery/List toggle that only changes local presentation state.
- Sale items are grouped by category/type from the public economy payload, with safe display-only code-derived grouping when explicit category metadata is missing.
- Jump-to anchor collapse button moved out of the anchor bar into the top toolbar using `assets/icons/ui/tabs.svg`.
- Anchor arrows now only appear when the anchor bar has horizontal overflow and update after render, resize, collapse/expand, and scroll changes.

## Release Prep — v0.5.0-alpha

- BUMP_NOTES.md updated with proper `RELEASED / PACKAGED: 0.4.2-alpha` archiving section following runtime conventions.
- New detailed release notes created at `changelog/v0.5.0-CHANGELOG.md`.
- Runtime-fed version labels and snapshot mirrors aligned to the 0.5.0-alpha platform cycle.
- Several HTML comment version markers and data snapshot references refreshed for the new release train.
- Master platform changelog published at `v0.5.0-PROJECT-CHANGELOG.md` in the runtime repo.

### Files / Areas Touched

- `BUMP_NOTES.md`
- `changelog/v0.5.0-CHANGELOG.md` (new)
- `README.md`
- `index.html`, `index-v2.html`, `requests.html`, `404.html` (version comments)
- Various `runtime/exports/` and `shared/state/` snapshot mirrors
- `data/changelog.json`

- Restored the Public shell sidebar badge/sublabel to `PUBLIC DASHBOARD` across normal public shell pages without changing Admin, Creator, or standalone public profile labels.
- Renamed the Public first-page shell asset from `media.html` to `home.html`; `/home`, `/home/`, and `/home.html` now direct-serve `home.html` as the canonical Public Dashboard home.
- Kept `/media` and `/media/` as compatibility aliases that direct-serve the same `home.html` content, while `media.html` remains only a minimal compatibility shim for old `.html` links. Preferred navigation stays on `/home`.
- Games & Economy aliases, the shell-level section bar, and `/games`-backed economy behavior remain intact; preferred Public links still avoid `/market-exchange`.
- Reordered `/home` so compact gallery/action content for Clips, Polls, Wheels, Leaderboards, Games & Economy, Live/Community, and My Data appears directly beneath the hero before status/scaffold notes.
- Reduced the old `/home` scaffold/status cards into compact lower-priority Public status notes with short labels, one-line descriptions, and smaller Public-shell controls.
- Standardized oversized scaffold buttons to smaller Public-shell controls in the lower `/home` status section.
- Preserved `/home` canonical routing, `/media` compatibility, and the `PUBLIC DASHBOARD` shell label.

- Replaced the incorrect in-page Games & Economy anchor row with a shell-level dashboard-style fixed/collapsible/overflow-scrollable section bar.
- Matched the Admin Dashboard `/economy` section-shell anchor bar placement and behavior more closely by rendering the Public economy section bar directly below the top bar instead of inside normal page content.
- Fixed Games & Economy anchor jump offsets so Overview, Market, Exchange, Inventory, Wallet, and Games / Rewards sections are not hidden behind pinned shell bars.
- Confirmed the shell-level section bar is configured only for the Games & Economy routes and not for other Public pages.

- Fixed `/economy` ERR_TOO_MANY_REDIRECTS by consolidating Public Games & Economy alias handling in the catch-all Pages Function and removing the overlapping `_redirects` economy rewrites. `/economy`, `/economy/`, `/economy.html`, `/games`, `/market`, `/exchange`, `/shop`, and compatibility `/market-exchange` paths now direct-serve the canonical economy hub asset without redirect chains.
- Added stable short Games & Economy shims for `/games`, `/market`, `/exchange`, and `/shop`. `/market-exchange` remains compatibility-only and is no longer the preferred Public shell or livechat-facing page slug.
- Changed the Public shell canonical first page from `/media` to `/home` while keeping `/media`, `/media/`, and `/media.html` compatibility mapped to the same home shell content.
- Superseded the earlier Games & Economy content-flow jump bar implementation with the shell-level section bar above; the section links remain collapsible, compact, horizontally scrollable, and hash-safe.
- Consolidated Market & Exchange into the existing `economy.html` Games & Economy surface. The canonical public hub now renders overview/status, Market, Exchange, Inventory, Wallet, and Games / Rewards sections from the existing Runtime/Auth market-exchange payload where available, while preserving honest unavailable/coming-online states where no backend contract exists.
- Removed the earlier compact anchor/jump row beneath the Games & Economy hero because that placement was incorrect; `/economy.html#market`, `/economy.html#exchange`, and `/economy.html#wallet` deep links remain handled additively without taking over existing SPA hash routing.
- Kept `/market-exchange`, `/market-exchange/`, and `/market-exchange.html` as safe entry points with no `_redirects` loop. Those routes now render the canonical Games & Economy hub and keep using the existing Runtime/Auth `/api/public/economy/market-exchange`, `/api/public/economy/exchange`, and `/api/public/economy/market/buy` contracts.
- Removed the duplicate top-level Public sidebar `Market & Exchange` entry because Market and Exchange now live as sections under the canonical `Games & Economy` nav item. The removed nav row was redundant only; the static route entry points remain valid.
- Human note: Public still does not calculate balances, inventory, prices, or mutations locally; successful exchange/buy actions continue to refresh server-backed catalog, wallet, and inventory state.

- Updated Public wallet/inventory tooltip rendering to display Runtime/Auth-provided `chat_alias` as optional public-safe item metadata. Scoped wallet/inventory hydration continues to use the scoped/global payload fields returned by Runtime/Auth, and Public still does not fabricate missing scoped values.
- Human note: item popovers can now show `Chat alias: lumber` when the backend sends it, while aliases stay hidden for items without one.

- Fixed the Market & Exchange route redirect loop by removing the clean-route `_redirects` dependency and adding a real static `market-exchange/index.html` route. `/market-exchange` and `/market-exchange/` now resolve as a normal static directory page, `/market-exchange.html` remains a direct static page, and the catch-all Function still does not handle Market & Exchange.
- Confirmed the Market & Exchange page keeps its loading/error/offline catalog state and mounts even when the Runtime/Auth catalog fetch fails, instead of using client-side redirects as a fallback.
- Added routing regression coverage for the clean, trailing-slash, and `.html` Market & Exchange URLs and pinned the sidebar/router route to the non-looping path.

- Added the combined Public `Market & Exchange` page at `/market-exchange`. The route uses the existing Public shell/sidebar/router, fetches Runtime/Auth `/api/public/economy/market-exchange`, renders separate Exchange and Market sections, shows signed-in Stekels balance/held quantities when available, keeps guests in a read-only catalog state, and posts exchange/buy actions only to the Runtime/Auth mutation endpoints before refreshing server truth.
- Added focused route/sidebar styling for responsive item cards, quantity controls, result feedback, loading/error/empty states, and the new sidebar entry without redesigning the Public shell or changing profile wallet/inventory behavior.
- Human note: Public users now have one polished Market & Exchange destination, but Public still does not calculate or mutate balances locally.

- Restored and hardened the `/u/*` Latest Stream past/recent tray. The tray now renders from any valid latest/recent evidence Public receives: current live stream rows, ended recent stream rows, Runtime `tray_sources`, or a single current/latest source record with a source URL/channel. Missing thumbnails now show compact platform placeholder tiles instead of hiding the row, and the PlayViewer shows a source card with an `Open on Kick`/source link when no safe iframe exists.
- Human note: live Kick still uses the safe `https://player.kick.com/{slug}` iframe, but ended or non-live Kick evidence renders as a recent/source card plus tray item rather than a fake live player. Profiles with genuinely no current/recent/latest stream data keep the compact no-data state.

- Inventory card now uses the dedicated `/assets/games/icon-inventory-2.webp` icon and a wallet-matched lead/header layout marker so the `/u/*` and `/@*` wallet and inventory lists align visually after the header/value area.
- Follow-up corrected the remaining inventory-list spacing mismatch: the inventory stack no longer adds an extra top margin on top of the shared list margin, and inventory rows now keep the same full row border as wallet rows instead of suppressing their top border.

- Enforced one shared public profile wallet/inventory row sizing contract. Wallet denomination and inventory rows now share the same min-height, grid layout, icon token, padding token, border radius, title/subtitle line-height, quantity alignment, clickable affordance, and hover/focus glow, with the old inventory-only event-row spacing removed from the profile inventory row path. Tooltip media now uses the same singleton popover path for wallet and inventory with a larger shared 70px icon inside an 80px media box, and wallet/inventory pagination remains capped at six rows per page.
- Human note: `/u/*` and `/@*` Game & Competition wallet and inventory rows should line up visually again, item popovers should show larger icons on both sides, and pagers should still sit cleanly below each list.

- Force-replaced the broken per-row `/u/*` and `/@*` wallet/inventory tooltip implementation with a single shared singleton popover controller. Wallet and inventory item info now use the same hover/focus/click/tap path, only one row can be active or pinned at a time, Escape/outside click dismisses it, and the old row-child popover display CSS was removed so inventory popovers cannot stack open all at once. Wallet and inventory popover icons are enlarged consistently, rows share the same height/rhythm/hover glow treatment, wallet pagination now exposes `data-wallet-pager` plus `data-wallet-page` when more than six wallet asset rows exist, and inventory pagination is preserved.

- Fixed `/u/*` and `/@*` wallet/inventory item tooltip behavior. Public now uses one active item-info controller so hover/focus/tap/click can show or pin a single wallet or inventory popover at a time, Escape/outside click dismiss pinned popovers, and inventory rows no longer render every per-row popover visibly at once.
- Added a subtle interactive hover/focus glow for wallet and inventory rows, enlarged tooltip popover icons by 50%, and normalized wallet/inventory row rhythm around the same shared row marker, icon sizing token, min-height, padding, metadata spacing, and right-aligned quantity treatment while preserving existing wallet/inventory pagination.
- Human note: public profile Game & Competition wallet and inventory rows should now feel equally clickable, align visually in height, keep pagers working, and show only the hovered or pinned item tooltip instead of a stacked inventory tooltip pile.

- Fixed `/u/*` Game & Competition wallet/inventory item browsing and information display. Inventory and wallet denomination rows now share the same compact row height/sizing, expose hover/focus/click item info popovers with public-safe metadata and fallback copy, and paginate inside each card when more than six rows exist instead of silently discarding extra inventory rows.
- Human note: larger inventories can now be browsed with Previous/Next controls, row alignment between Current Balance and Inventory is consistent, and scoped/global mode switches rebuild the compact pager from the selected Runtime/Auth payload without fabricating missing scoped descriptions or values.

- Updated Public wallet denomination rendering to prefer Runtime/Auth-provided denomination image references (`icon_url`, `icon_path`, and `image_asset_key`) before falling back to the existing text fallback treatment. Inventory icon rendering remains on the existing item-definition path, and wallet image load failures now replace the broken image with a compact fallback mark instead of leaving a broken image in the row.
- Human note: `/u/*` wallet/current-balance rows should now reflect Admin-selected Coin, Banknote, Gem, and Diamond icons after Runtime/Auth refresh, matching the inventory section when both surfaces share the same asset.

## CURRENT VER= 0.4.2-alpha / PENDING VER= 0.4.8-alpha

- Corrected `/leaderboards` and `/community/leaderboard` hub cards to use real loaded global/scoped counts. Ranked identities and Lifetime XP now compute from the active board rows, Wallet Index avoids scoped/global leakage when scoped wallet summaries are absent, Creator Boards reports actual scoped board availability from `/api/public/progression/scopes` instead of `Soon`, and Boards Count reports real global + scoped inventory instead of preview text. The leaderboard hero is now shorter/slimmer with a smaller title, and scoped board mode updates the hero title, avatar/fallback, platform/current-board status, and current-board endpoint from selected Runtime/Auth scope metadata.

- Updated `/u/*` Latest Stream handling for Runtime/Auth recent stream history. Live Kick streams still render the allowlisted `https://player.kick.com/{slug}` iframe, while ended Kick `recent_streams` records render as an ended/recent poster-card fallback with source metadata and an `Open on Kick` link instead of a fake live iframe. The previous-stream tray now renders only when real recent rows exist.
- Human note: a Kick stream that was seen live can remain visible as recent evidence after it ends, but Public no longer labels it Live Now or embeds the live-only Kick player. Profile badges, scoped progression, wallet, inventory, leaderboards, and Rumble iframe allowlisting remain unchanged.

- Follow-up corrected the required `visible.svg` / `hidden.svg` expand-collapse image assets so their black artwork is filtered into the light profile-control color, and added a real grid gap between the main Latest Stream card and the past-streams tray so the tray no longer sits hard against the player container. No Runtime/Auth files were changed.

- Corrected the `/u/*` and `/@*` expand/collapse follow-up so the labelled controls again use the required image assets: `/assets/icons/ui/visible.svg` for expanded `Collapse` state and `/assets/icons/ui/hidden.svg` for collapsed `Expand` state. Also upgraded the Latest Stream past-streams tray empty state from plain text to a compact styled tray with a dashed empty card and muted placeholder-thumbnail marks. No Runtime/Auth files were changed.

- Follow-up fixed the remaining `/u/*`, `/@*`, `/leaderboards`, and `/community/leaderboard` Public polish without changing Runtime/Auth. Scoped boards actions now read `VIEW`, Latest Stream always renders a discreet past-streams tray with a small empty state when no real entries exist, scoped leaderboard gallery cards now include full-color platform chips, owner avatar/fallbacks, and a bounded top-3 preview/unavailable state, and leaderboard scoped platform chips now use original full-color branded SVG image mode while generic fallback icons remain masked. The expand/collapse icon detail from this note is superseded by the required `visible.svg` / `hidden.svg` correction above.

- Polished `/u/*`, `/@*`, `/leaderboards`, and `/community/leaderboard` without changing Runtime/Auth. Profile expand/collapse controls now render labelled slim `Collapse` / `Expand` buttons, Latest Stream no longer duplicates Kick/Featured Source labels in the header, and the real previous-stream tray caps at 6 compact thumbnail cards with fallback icons when Runtime supplies historical entries. Scoped boards now use aligned table-style columns, the action label is `VIEW BOARD`, channel avatars fall back to visible icons instead of blank squares, and profile platform chips use full-color platform SVGs where appropriate. Game & Competition balance can show an inline bracketed Cash component from authoritative wallet/denomination fields, scoped inventory now distinguishes explicit empty arrays from unavailable fields, and leaderboard View Profile links resolve canonical profile URLs/slugs/user codes plus safe public-user fallbacks instead of showing unavailable when public identity data is sufficient.

- Forcibly replaced the broken bulky `/leaderboards` and `/community/leaderboard` scope selector with a slim full-width `data-scope-toolbar="leaderboard"` row. The old stacked/card-style scoped control layout, visible "Leaderboard scope" label, visible "Search channel scopes" label, visible "Scope picker" label, and helper paragraph were removed from the rendered leaderboard UI. Global remains the default, Channel + scope still loads the scoped Runtime/Auth leaderboard endpoint, switching back to Global restores the global endpoint, platform SVG prefixes stay compact/current-color masked, and source regression coverage now rejects the bulky stacked selector shape.

- Follow-up corrected the `/u/*` Game & Competition header after the scoped selector pass. The visibility icon is restored to the far-right summary column, the compact scope selector now sits immediately before it, and the redundant `Global default` / channel-count summary labels were removed from that header so the row has room to breathe. No runtime/Auth or scoped progression data behavior changed.

- Corrected the broken Public scoped progression layout and behavior without changing Runtime/Auth. `/leaderboards` now uses a slim `data-scope-toolbar="leaderboard"` toolbar with search, Global/Channel mode, scoped picker, active scope chip, and platform SVG icon prefixes without overlapping controls. `/u/*` and `/@*` profiles now move scope selection into the Game & Competition top row, remove the redundant lower Global Stats/Channel Stats toggle cards, and rehydrate the main XP/rank/level/wallet/inventory cards when a real channel scope is selected. Scoped wallet/inventory cards show compact "No scoped wallet data yet" / "No scoped inventory data yet" states when the payload has no scoped fields. The lower scoped-board area is now a streamlined paginated table/list with platform icons, channel/avatar, rank, XP, level, message count, update time, and "View scoped leaderboard." Latest Stream now uses a stable two-column layout with top-aligned wrapping copy so long titles/details do not shrink the player column.

- Polished the public `/u/*` PlayViewer, scoped leaderboard controls, scoped gallery, and Game & Competition controls without changing Public authority ownership. `js/public-pages-app.js` now accepts Kick `channel_slug`/`channelHandle` and `kick.com/{slug}/videos/{id}` source URLs for `https://player.kick.com/{slug}` fallback embeds, restricts Rumble iframes to `https://rumble.com/embed/v.../` URLs, ignores script/embedJS strings, keeps fallback platform links, and preserves recent thumbnail player updates only for safe rows. `css/public-shell.css` makes the Latest Stream card slimmer, reduces empty-state/player padding, and tightens chips/buttons so text and media do not crowd each other.
- Reworked `/leaderboards` scoped controls into a compact toolbar and replaced the old cramped placeholder "soon" pill row/gallery with real Runtime/Auth scope cards from `/api/public/progression/scopes`; selecting a card loads the scoped board through the existing `scope_key` URL state. `/u/*` Game & Competition now adds a slim global/channel scope selector and scoped Rank/XP/Level/Messages strip when real scoped rows exist, while global remains the default. Wallet denomination breakdown metadata now renders as muted bracketed text. No files were created, removed, or renamed; profile badges, socials, overview, inventory, wallet, leaderboard rows, podium, pagination, and hover/detail behavior remain intact.
- Human note: `/u/bsmediagroup`-style Kick payloads with `https://kick.com/streamsuites/videos/<id>` now resolve to `https://player.kick.com/streamsuites`; `/u/danielclancy`-style Kick channel data resolves to `https://player.kick.com/danielclancy`. Rumble playback is iframe-only and requires a Runtime-provided or safely normalized `/embed/v.../` URL.

- Upgraded the standalone `/u/*` latest stream PlayViewer to consume the normalized Runtime/Auth live-status contract for Kick first, then Rumble/Twitch/YouTube when safe fields are present. `js/public-pages-app.js` now allowlists provider embed URLs, derives a Kick player URL only from safe channel data, sandboxes iframes, preserves fallback source links, and adds a slim recent-stream thumbnail row that updates the player only from real `recent_streams` rows.
- Extended Public live/latest stream normalization in `js/public-data-hub.js` and kept stale/error authority records offline so Live Now indicators come only from the runtime `live_status` aggregate. `css/public-shell.css` adds only compact PlayViewer thumbnail styling; profile badges, socials, scoped progression, wallet, inventory, and leaderboard behavior are preserved. Pilled was not newly surfaced.
- Human note: `/u/<slug>` can now show a Kick live player and a compact recent-stream strip when Runtime exports those fields, while non-live or stale profiles avoid false Live Now states and keep the existing profile layout.

- Corrected the Public scoped progression UI pass because the previous support was too conditional and easy to miss. `/leaderboards` and `/community/leaderboard` now mount the same active leaderboard renderer with an always-visible "Leaderboard scope" control, default "Global" mode, "Channel scoped" affordance, searchable scope picker, status chip, explicit no-scopes empty text, scoped-load error text, and retry action while preserving global leaderboard rows as the default. Standalone `/u/*` and `/@*` profile aliases now always render a secondary Progression Scope area with visible "Global Stats" and "Channel Stats" controls; Channel Stats shows real scoped rows when returned, otherwise explicit empty/error states without breaking the global profile. `_redirects` now rewrites `/community/leaderboard` to the active leaderboard shell so direct Cloudflare Pages loads reach the patched router; the existing `/@*` Pages Function alias remains the profile entry path. No files were created, removed, or renamed; global progression, profile, wallet, inventory, row, podium, and drawer behavior remains intact.

- Added the Public consumer UI for Runtime/Auth scoped progression contracts without changing Runtime/Auth. `/leaderboards` remains global by default, now adds a compact scope filter/select control populated from `/api/public/progression/scopes`, and fetches `/api/public/progression/leaderboard?scope_key=...` only when a creator/channel scope is selected. Scoped rows reuse the existing leaderboard row, podium, pagination, hover, profile CTA, wallet, and inventory renderers, while showing scoped XP/message/channel/platform metadata only from API payloads. Standalone `/u/*` profiles now fetch `/api/public/progression/profile/{identifier}/scopes` after the authoritative profile load and render a collapsed "Channel stats" section only when scoped rows exist, with per-scope XP, level, rank, message count, updated timestamp, and a scoped leaderboard link. Scoped wallet/inventory mini-sections render only when real payload fields exist. No files were created, removed, or renamed; the global progression/profile behavior remains the default and scoped fetch failures fall back to the existing clean global/profile views.

- Added a self-profile edit experience to standalone `/u/*` profiles without changing Runtime/Auth. Logged-in owners now get a discreet `Edit profile` button in the profile header and owner panel; the modal edits display name, bio, avatar, cover, anonymous/private state, and canonical social links through the existing `/api/public/profile/me` endpoint, uses local image previews only before successful save, validates Pickax and OnlyFans links for `https://pickax.com/<handle>` / `https://onlyfans.com/<handle>` shape before save, and rerenders the visible profile after the backend returns the updated payload. Public self-edit keeps the handle read-only because the current public self-edit API does not expose slug mutation. `js/public-data-hub.js` also adds Pickax and OnlyFans to the public social registry using the provided `pickax.svg` and `onlyfans.svg` icons so profile social rendering stays canonical. No files were created, removed, or renamed; the old bottom owner bio/privacy inline controls were replaced by a compact modal entry point to avoid another long profile editing block.

- Improved the standalone `/u/*` unknown-profile fallback without changing runtime/Auth or the Pages Function metadata fallback. Missing profile routes now render a clear "No such profile was found" message, display the attempted `@handle` when available, and provide a normal `/members` link back to member discovery while staying inside the existing dark standalone profile shell. Source coverage pins the fallback copy and member link. No files were created, removed, or renamed.

- Fixed slow standalone `/u/*` profile first paint and generic social embeds without changing runtime/Auth. `functions/u/[[slug]].js` now resolves the existing public profile endpoint with a short timeout, injects public-safe title/description/OG/Twitter metadata plus an escaped profile bootstrap payload into the initial HTML shell, falls back to the existing `seoshare.jpg` share image and generic metadata on lookup failure, and applies conservative public caching. `js/public-pages-app.js` now consumes that bootstrap before the full data hub resolves, dedupes short-lived profile requests, keeps runtime profile fetches as the source of truth, and shows route-scoped loading skeletons for secondary profile sections until hydration completes. `css/public-shell.css` adds the compact skeleton treatment with reduced-motion support, and source tests pin the metadata/bootstrap/cache hooks. No files were created, removed, or renamed.

- Replaced the live `index.html` lander composition with a darker graphite/black hero using `assets/backgrounds/bghdblack1.webp` and `assets/logos/sswordmarktm.webp`, while preserving the existing login modal, Creator CTA session check, runtime/Auth access notice banner, status widget, version hydration, and in-page See more/about morph logic. The previous homepage implementation was preserved as `index-v2.html`, with its matching stylesheet snapshot at `css/aurora-landing-v2.css`, so it remains manually restorable without depending on the new live lander CSS. Technical scope stayed inside `StreamSuites-Public`; no runtime/Auth, Creator, Dashboard, Members, Docs, Developer, or Launcher contracts were changed.

- Replaced the old homepage hero UI elements explicitly: the old hero platform row was repositioned into a bottom-right footer marquee with the same Rumble, YouTube, Twitch, Kick, Discord, and OBS ordering/assets; the old `POLLS`, `CLIPS`, and `MORE` hero links were removed from the hero area and replaced by a single discreet `/media.html` Public Dashboard link; and the `/DONATE` footer link was removed from the homepage footer while `/SUPPORT`, `/PRIVACY`, and `/ABOUT` remain. The live `index.html` is expected to be shorter in markup because the old hero platform block and secondary links moved/contracted, while `css/aurora-landing.css` is expected to be longer because it now carries the new graphite background, footer marquee, responsive footer, and reduced-motion treatments. The preserved `index-v2.html` and `css/aurora-landing-v2.css` are additive files.

- Follow-up tuned the new homepage lander CSS without changing markup or auth behavior: `css/aurora-landing.css` now makes `bghdblack1.webp` materially more visible, keeps the supported-platform marquee at 50% opacity until hover/focus, fades the `SUPPORTED PLATFORMS` label in above the marquee only on hover/focus, and left-aligns the transformed See more wordmark to the same content shell margin as the about text. No files were created, removed, or renamed in this follow-up.

- Corrected the `/leaderboards` expanded details drawer inventory and wallet rendering without redesigning the page. `js/public-pages-app.js` now reads real runtime inventory rows from `inventory_summary` and compatibility `economy_summary.inventory`, keeps coin/banknote wallet units out of ordinary inventory while allowing held gems and diamonds through, and renders each visible item with icon, label, category/rarity metadata, and quantity. The drawer wallet value now uses the same non-compact value sizing as neighboring Rank and XP cards while preserving compact-number abbreviation. `css/public-shell.css` adds only drawer-scoped inventory subtitle and wallet sizing hooks, and source tests pin the field paths and styling. No files or assets were created, removed, or renamed.

- Polished `/leaderboards` top-three row hover behavior without changing the leaderboard renderer. `css/public-shell.css` now gives `.progression-leaderboard-row--top:hover` its own placement-color-based background, border, and glow so first, second, and third place rows subtly brighten while retaining their gold, silver, or bronze identity instead of falling through to the generic row hover treatment. Source coverage in `tests/public-authority-wiring.test.mjs` pins the dedicated top-placement hover hook. No files or assets were created, removed, or renamed.

- Corrected the focused `/leaderboards` polish pass after the hub upgrade. `js/public-pages-app.js` now consumes leaderboard wallet totals from nested `wallet`, `wallet_summary`, `economy`, `economy_summary`, and flat safe balance fields, uses compact M/B/T display formatting for crowded XP/wallet leaderboard values, computes Wallet Index from visible row totals, removes the persistent Details/Hide Details button, keeps the row itself as the accessible click/Enter/Space expander, and renders a subtle first-place sparkle hook on the Top 3 podium. `css/public-shell.css` aligns header and row columns on one shared grid variable, tightens the expanded Rank/XP/Level/Wallet stat drawer, preserves the level banner card treatment with middle-left chip alignment, fixes leaderboard search input font inheritance, and adds scoped hover/sparkle podium polish with reduced-motion handling. No files or assets were created, removed, or renamed.

- Upgraded the real `/leaderboards` page into the requested premium public leaderboard hub without replacing the Public shell/sidebar/topbar/status/footer. `js/public-pages-app.js` now adapts the POC structure into the shell-native main content region with a board intro/current-board panel, compact real-data stat cards, tie-aware Hall of Fame podium using the existing `lb-first.webp`/`lb-second.webp`/`lb-third.webp` assets, signed-in/signed-out Your Standing states, a muted column header, full-width expandable leaderboard rows, 20-entry pagination after search filtering, and a creator-defined boards gallery that is explicitly scaffold/coming-soon. The main rows continue to hydrate only from `/api/public/progression/leaderboard`, top-three entries remain in the main list below the podium, `@handle` text still requires canonical public/profile slug fields rather than user codes, and wallet/season/creator-board values stay marked as unavailable/scaffolded unless runtime data is present. `css/public-shell.css` adds only route-scoped leaderboard hub styling and responsive behavior. No files or assets were created, removed, or renamed; no StreamSuites runtime/Auth changes were needed because the current Public consumer already handles the required slug, avatar, level, placement, and optional wallet fields defensively.

- Corrected the follow-up `/leaderboards` regression from the prior leaderboard pass. `js/public-pages-app.js` now renders every leaderboard entry, including #1/#2/#3, through the same full-width `.progression-leaderboard-list` row path with only rank modifier classes for the top placements; the separate narrower podium render path was removed because it compressed the top three rows. Leaderboard handle/profile resolution now defensively consumes canonical slug fields (`public_slug`, `profile_slug`, `slug`, `handle`, `canonical_slug`) and profile URLs while continuing to refuse user-code handles/links when no slug exists. `css/public-shell.css` reworks the expanded details drawer into a responsive profile-action plus Rank/XP/Level row on normal desktop widths, keeps the level banner card treatment, and stacks gracefully on narrower screens. Source tests pin the shared row path, slug-only handle/profile route behavior, and desktop drawer grid. No files or assets were created, removed, or renamed; the obsolete podium wrapper behavior was replaced and the touched JS/CSS may be shorter in that area without changing runtime authority.

- Corrected the `/u/*` Current Level card banner falloff so the fade works regardless of the current banner asset aspect ratio. The background image layer now uses `cover` across the full card before the mask is applied, avoiding the visible hard vertical edge caused by the bitmap ending before the falloff region. Source coverage pins the full-card cover behavior. No files or assets were created, removed, or renamed.

- Repaired the public `/leaderboards` page layout and interaction inside the existing Public shell. `js/public-pages-app.js` now treats each listing row as the expand/collapse target with Enter/Space support, keeps the Details button subtle until row hover/focus/expanded state, renders top-three rows vertically with gold/silver/bronze-tinted treatments, moves the placement medallion asset beside the display name instead of before the rank number, and stops presenting user codes as public `@handle` values or `/u/*` links. Leaderboard handles and profile CTAs now require a canonical public/profile slug or canonical profile URL from runtime authority; otherwise the handle is omitted and the profile CTA remains unavailable. `css/public-shell.css` removes the leaderboard card's full-height/min-height trap, keeps the list in normal page flow, scopes the background pattern to the page/list region, and reuses the existing Current Level banner/chip treatment in the details drawer level card. Source tests pin the authority URL, slug-only handle path, row keyboard toggle, medallion placement, and level-banner reuse. No files or assets were created, removed, or renamed; the inner layout behavior was replaced because the prior card/list arrangement made the leaderboard feel trapped and compressed.

- Refined the `/u/*` profile Game & Competition Current Level banner treatment. `css/public-shell.css` now removes the prior hard left edge from the banner layer, increases the banner visibility, uses a smoother right-to-left mask/falloff, and retunes the readability overlays so light and dark level banners remain premium without overpowering the level chip or progress copy. Source coverage in `tests/public-authority-wiring.test.mjs` pins the smoothed mask and stronger banner opacity. No files or assets were created, removed, or renamed.

- Upgraded only the `/u/*` profile Game & Competition Current Level card presentation. `js/public-pages-app.js` now derives a safe `assets/backgrounds/lvlbanner-*.webp` banner path from the authoritative runtime level label/code, applies the runtime level color as scoped card CSS variables, and gracefully keeps the generic tinted treatment when no matching banner slug exists. `css/public-shell.css` adds the focused right-weighted, fade-left banner layer and restrained level-color glow for `.profile-game-preview-card--current-level` without changing XP, level, rank, economy, inventory, or leaderboard logic. No files or assets were created, removed, or renamed; the existing level banner assets in `assets/backgrounds/` are consumed as-is.

- Repaired the `/u/*` profile Game & Competition economy layout without changing runtime authority. `js/public-pages-app.js` now routes balance denomination rows and inventory rows through a shared `buildEconomyBreakdownList` structure, keeps cash coin/banknote denominations balance-only while held gems/diamonds still render as inventory/exchangeable value items, gives Current Balance and Inventory deliberate matching half-width card spans, and marks the Next Level Progress meter with animated/electric fill classes. `css/public-shell.css` now uses one compact itemized row treatment for balance and inventory, prevents the inventory card from narrowing into an awkward column, and replays the progress fill from a low state when the progress card or meter is hovered while respecting reduced-motion. Source tests pin the shared breakdown structure, explicit card spans, held-value item filtering, and progress animation classes. No files or assets were created, removed, or renamed.

- Added compact public self-service exchange presentation for held green gems, red gems, blue gems, and diamonds. `js/public-pages-app.js` now posts owner/signed-in exchanges to the runtime-owned `/api/public/economy/me/exchange` endpoint, shows exchange controls only when exchangeable held value items are returned, itemizes inventory rows with icons/labels/quantities instead of count-only text, and keeps the profile Current Balance card on the full-color `/assets/games/sscurrency.webp` icon. `css/public-shell.css` aligns inventory icon sizing with balance denomination chips and changes the profile next-level meter to an electric blue CSS animation. No files or assets were created, removed, or renamed.

- Corrected `/u/*` and My Data economy inventory filtering for the cash-plus-held-value wallet model. Public now continues to display `balance_total_credits` with the full-color `/assets/games/sscurrency.webp` icon only on the profile Current Balance card, keeps coin/banknote wallet denominations out of ordinary inventory rows, and no longer hides held green gems, red gems, blue gems, or diamonds solely because their item definitions are economy denomination assets. Source tests pin the `sscurrency.webp` profile balance icon and the narrower inventory filter. No files or assets were created, removed, or renamed.

- Tweaked standalone `/u/*` profile social/share link labels so visible button subtext suppresses the leading `https://` while preserving the underlying href and copy/share target URLs unchanged. This is display-only for the profile Social links gallery and compact Share Links rows; no files were created, removed, or renamed.

- Paused the public Leaderboards upgrade and corrected the `/u/*` Game & Competition profile foundation in place. `js/public-pages-app.js` now combines Current XP and Global Rank into one profile card, keeps Current Level as a separate card, uses leaderboard placement assets for first/second/third ranks, preserves non-top-three and unranked rendering, and uses the full-color `/assets/games/sscurrency.webp` icon only for the profile Current Balance card while leaving overview-table currency symbols on `/assets/games/currencyunit.svg`. `css/public-shell.css` adds only scoped profile-card icon/combo styling. No files or assets were created, removed, or renamed.

- Upgraded the public `/leaderboards` page inside the existing Public shell/sidebar instead of replacing the shell with the standalone POC. `js/public-pages-app.js` now keeps `/api/public/progression/leaderboard` as the only authority source while adding a premium hero, compact truthful future-scope tabs, search by display name/@handle/level/badge metadata, top-three/tie-aware placement treatment using the existing `lb-first.webp`, `lb-second.webp`, and `lb-third.webp` assets, in-place expandable details with profile CTAs, and shared profile-hovercard attributes on leaderboard names/avatars. The listing subtext now prefers real public/account handles before falling back to public identity codes. `css/public-shell.css` adds the scoped dark glass leaderboard presentation and responsive card-first behavior without altering sidebar selectors. No files were created, removed, or renamed; StreamSuites runtime remained read-only because the current payload already exposes the needed account code, avatar, display name, level, and placement fields.

- Added global XP leaderboard placement display to individual `/u/*` public profiles without changing the Leaderboards page presentation. `js/public-pages-app.js` now reads runtime `global_placement_rank`/`global_rank` from the existing profile progression payload, formats positive placements as ordinals such as `1st globally`, keeps missing placements as `Unranked`, and renders Global Rank separately from Level in the Public Overview and Game & Competition sections. `css/public-shell.css` adds compact/prominent text styling for the new value, and source tests pin ordinal logic, level-vs-rank separation, and null-rank empty state. No files were created, removed, or renamed.

- Upgraded Public economy rendering to consume the runtime wallet as `balance_total_credits` plus configurable `currency_unit_label`, `currency_unit_plural_label`, `currency_symbol_path`, and derived `denomination_breakdown`. Public profile and My Data balance displays now render the `currencyunit.svg` symbol as a current-color mask, show coin/banknote denomination chips by default, show gem/diamond chips only when returned with nonzero derived counts, and keep wallet denominations distinct from inventory rows so normal coin/banknote balances are not double-counted as collectibles. No files were created, removed, or renamed.

- Removed the redundant visible `Level` text prefix from Public XP level chips in `js/public-pages-app.js`; chips now render the actual level material label only, such as `Emerald`, while surrounding rows/sections still provide the level context. Source tests now pin that the chip builder does not reintroduce the prefix. No files were created or removed.

- Updated the Public progression consumers from XP/rank tier wording to XP/level wording while preserving leaderboard rank for ordered placement only. `js/public-pages-app.js` now prefers canonical `level_*`, `next_level`, `xp_to_next_level`, and `progress_to_next_level` fields with legacy rank aliases as fallback, renders level chips with the approved level icon paths, labels Public Overview and Game & Competition as Level, and shows Leaderboards placement separately from each user's level chip. `css/public-shell.css` adds canonical level-chip selectors while retaining rank-chip compatibility classes during migration. `README.md` and source tests now describe the XP/level API contract. No files were created, removed, or renamed.

- Replaced the public economy balance makeshift `SS` text circle with the canonical `/assets/games/sscoin.webp` asset in `js/public-pages-app.js` and `css/public-shell.css`. The change is presentation-only for existing runtime-backed economy consumers and does not alter wallet, ledger, inventory, profile, or My Data authority behavior. No files were created or removed; the CSS is slightly shorter because the old text-badge styling was removed.

- Added the first Public consumer pass for the runtime-owned economy/inventory authority. `js/public-pages-app.js` now fetches `/api/public/economy/me` for signed-in My Data wallet, economy ledger, inventory summary, and inventory event history; `/u/*` profile normalization carries `economy` and `inventory` payloads from the runtime profile API, and the Public Overview plus Game & Competition section render compact truthful wallet/inventory starting states without adding storefront, transfer, or consumption controls. `css/public-shell.css` adds compact balance, economy event, and inventory row styling; source tests now pin the API-first economy hydration seam. No files were created or removed.

- Refined the approved public XP/rank presentation without changing the runtime progression contract. `/u/*` Public Overview keeps the compact XP/rank chips, while the Game & Competition section in `js/public-pages-app.js` now opts into larger XP/rank visuals, richer runtime-backed current XP/current rank/progress-to-next copy when those fields are present, and no longer falls back to a hardcoded Bronze label when progression data is absent. `css/public-shell.css` adds restrained prominent sizing only for that section plus a subtle hover sheen for shared public rank chips. No files were created or removed.

- Added the first real public XP/rank presentation layer to the existing runtime-backed consumers. `js/public-pages-app.js` now renders rank chips from authoritative rank `color_hex`/`icon_path` metadata and uses the shared XP star on `/u/*` profile overview/game sections, public My Data, and Leaderboards; `css/public-shell.css` adds compact dark-theme chip/icon styling with readable light-rank treatment. Added source coverage for the shared rank/XP render seam. No files were created or removed; the required `.webp` assets were already present in the worktree.

- Corrected Public profile/account hydration so `/u/*` profile normalization and the public account dropdown prefer canonical account `user_code`/`account_user_code` fields from the runtime profile/auth/authority payload before falling back to public identity codes. `public-data-hub.js` now preserves the separate `publicIdentityCode` diagnostic key while mapping claimed identities by real account user code and carrying authority avatar URLs. No files were created or removed.

- Fixed the standalone `/u/*` Public Overview table in `js/public-pages-app.js` so its XP and Rank rows now read the same `profile.progression` runtime summary already used by the Game & Competition section. The rows still show `Pending` only when no authoritative progression payload exists. Added source coverage in `tests/public-authority-wiring.test.mjs`. No files were created or removed.

- Updated the public progression consumers in `js/public-pages-app.js` to read the approved runtime XP/rank field names while retaining compatibility with the prior aliases: My Data and Leaderboards now prefer `xp_total`, ledger rows prefer `reason_text` and `source_domain`, and `/u/*` Game & Competition now shows the same runtime-owned XP/rank summary as the rest of the public surface. Economy, inventory, and season standing copy remains explicitly deferred. Tests now pin API-first progression hydration, global leaderboard rendering, and profile XP/rank rendering. No files were created or removed.

- Replaced the remaining public XP/rank placeholders with first-pass live authority consumers in `js/public-pages-app.js`: `/community/my-data.html` now loads `/api/public/progression/me` for current XP, rank, progress-to-next-rank, identity context, and recent XP events, while `/leaderboards` loads `/api/public/progression/leaderboard` for the global public progression leaderboard. Styling in `css/public-shell.css` keeps the new progression panels compact and dark, and README/BUMP notes now describe the real runtime API contract. No files were created or removed.

- Follow-up corrected the Public polish pass in `css/public-shell.css` by removing the sidebar-specific selectors from the added theme-alignment block. This restores the previous Public sidebar/nav item treatment and keeps the polish scoped to non-sidebar shell/page surfaces. No files were created or removed; this is a small CSS removal and is expected to make the touched CSS shorter than the prior polish pass. Behavior is unchanged, and individual `/u/{user}` profile pages remain preserved and not intentionally redesigned.

- Restrained-polished non-profile Public shell surfaces in `css/public-shell.css` to better match the current `/u/*` profile design language: darker graphite base, muted blue-slate glass panels, thinner rim borders, quieter card/button/chip treatments, and tighter page spacing. Technical scope is body-scoped to `body.public-shell-page` plus non-profile standalone pages, so individual `body[data-public-page="public-profile-standalone"]` `/u/{user}` profile pages were preserved and not intentionally redesigned. Affected files: `css/public-shell.css`, `BUMP_NOTES.md`. Verification: `node --test tests` passed, and Playwright screenshot checks covered `/u/danielclancy` plus `/community/` at desktop and mobile-sized viewports. Risks/follow-ups: review any less-used non-profile public page with custom card classes for an additional scoped polish hook; no runtime authority/state behavior was introduced.

- Narrow-polished the standalone `/u/*` public profile header and hero alignment in `css/public-shell.css` and `tests/auth-surface-parity.test.mjs`: the small-breakpoint overlay header now keeps the brand, social rail, and account widget on one row, the compact account button collapses its hidden text wrapper so the avatar/login icon centers inside the button, and the hero identity stack is nudged upward for better vertical balance across breakpoints. Replaced the old `max-width: 820px` one-column header rule because it forced the action controls onto a second row on mobile; no files were created or removed.

- Corrected the logged-out public header account widget fallback avatar in `css/public-shell.css` and `tests/auth-surface-parity.test.mjs`: the masked `/assets/icons/ui/profile.svg` icon now renders through `currentColor` as `#9099AE`, and the fallback avatar no longer carries the previous blue gradient backdrop. No files were created or removed.

- Narrow-corrected the standalone `/u/*` Public Badges detail/gallery path in `js/public-pages-app.js` and `tests/auth-surface-parity.test.mjs`: entitlement badges now stay on badge-detail metadata instead of being folded through tier metadata, restoring Founding Member to `/assets/icons/founder-gold.svg` with the founder card palette and Moderator to `/assets/icons/modgavel-blue.svg` with the moderator card palette. The gallery now suppresses only the DEVELOPER tier detail card when the DEVELOPER role detail is present, leaving the role card and all chip rendering paths unchanged. Replaced the broken gallery-local entitlement-as-tier mapping because it allowed founder/moderator cards to inherit generic tier fallback metadata; the touched JS is slightly longer due to the explicit gallery detail metadata helper and targeted suppression rule. No files were created or removed.

- Focused the standalone `/u/*` public profile chip semantics in `js/public-pages-app.js`, `css/public-shell.css`, and `tests/auth-surface-parity.test.mjs`: role, hero-role, tier, and badge-style profile chips now resolve through a shared public chip metadata/render seam with explicit icon permissions, so role chips remain text-only while tier chips keep their SVG icon treatment. DEVELOPER now resolves as both a green text-only role chip and a green icon-bearing DEVELOPER tier chip using `/assets/icons/dev-green.svg`, with developer-role profiles surfacing DEVELOPER instead of generic PRO for tier display and Public Badges alignment. Replaced the route-local tier folding and one-off role/tier chip builders that allowed developer tier and role semantics to drift. No files were created or removed.

- Hard-corrected the standalone `/u/*` public profile tier/badge/social follow-up in `js/public-pages-app.js`, `css/public-shell.css`, and `tests/auth-surface-parity.test.mjs`: Public Overview tier chips now reuse the working tier badge icon contract with `ss-tier-badge` metadata and explicit CORE/GOLD/PRO palette selectors matching the existing StreamSuites tier-pill treatment, while role chips remain text-only `profile-role-chip` elements. The Public Badges gallery now includes the profile's public tier and admin/developer/founder/moderator badge-like entries with polished public-safe copy, and a compact social-links gallery renders defined social URLs directly above Share Links. Replaced the divergent route-local tier-chip palette fallback because CORE was still inheriting the neutral shared chip treatment and PRO had drifted from the working tier-pill palette. No files were created or removed.

- Hard-corrected the standalone `/u/*` public profile follow-up in `js/public-pages-app.js`, `css/public-shell.css`, and `tests/auth-surface-parity.test.mjs`: Latest Stream now always builds the supported Rumble/YouTube/Twitch/Kick source-family row for creator-capable profiles with real SVG icons, active buttons where URLs exist, and disabled grey buttons in fallback/no-stream states; Public Overview role chips now use a separate text-only role-chip path while tier chips stay on the SVG badge-chip treatment for CORE/GOLD/PRO; and a full-width public badge gallery now renders above Game & Competition with founder/moderator badge cards and public-safe descriptions. Replaced the broken overview account-type reuse of the badge/tier chip helper because it allowed role chips to inherit SVG behavior, and replaced the latest-stream alternate-only row builder because it silently omitted supported platforms whenever no alternate URL array was present. No files were created or removed.

- Narrow-corrected the standalone `/u/*` profile follow-up regressions in `js/public-pages-app.js`, `css/public-shell.css`, and `tests/auth-surface-parity.test.mjs` so the Public Overview account-type/tier rows now resolve from the canonical main account type instead of badge-only concepts, DEVELOPER and ADMIN profiles default their overview tier chip back to `PRO` when no truthful tier is supplied, the hero emits only one main role chip, and Latest Stream fallback mode now keeps a contained centered placeholder plus a disabled supported-platform source row with real Rumble/YouTube/Twitch/Kick SVG icons. Replaced the route-local hero/account-type chip derivation that was re-reading public badges because it could leak `FOUNDER`/`MODERATOR` into role rendering and misclassify `DEVELOPER` as `VIEWER`; also replaced the overly broad `.profile-latest-stream-media img` fallback selector with direct-child media targeting because it was stretching the fallback platform icon across the whole viewport. No files were created or removed.

- Corrected the standalone `/u/*` Latest Stream and badge parity regressions in `js/public-pages-app.js`, `js/public-data-hub.js`, `css/public-shell.css`, and `tests/auth-surface-parity.test.mjs`. The broken masked latest-stream fallback preview icon was replaced with a real existing SVG image path so the route no longer risks the blank-square regression, the fallback preview surface now uses a darker screen-off gradient only on that unavailable media state, the stream header/buttons now carry proper platform SVG icons, and an additive in-card alternate-platform button row renders only when authoritative alternate source URLs exist. Also aligned the divergent ADMIN chip palette back to the existing gold treatment and restored PRO parity on both hero/public chip selectors. The broken latest-stream placeholder mask treatment was explicitly replaced because that route-local icon path had drifted back into the same square-regression family; no files were created or removed.

- Followed up the `/u/*` public profile body polish in `js/public-pages-app.js`, `css/public-shell.css`, and `tests/auth-surface-parity.test.mjs` so the Latest Stream module now always renders for public profiles, opens by default only when usable stream/latest-video data exists, collapses by default into a polished fallback state when no supported public livestream data is available, and the Game & Competition preview now uses the same collapsible interaction family as Public Authority while remaining expanded by default. Replaced the divergent local `profile-tier-chip` overview styling with a shared `profile-badge-chip` treatment that reuses the existing glass/sheen badge language and real SVG badge icons used by the working public/dashboard badge surfaces, which removes the route-local blank-square risk from the old mask-based overview chip path. No files were created or removed; `css/public-shell.css` is expected to be slightly shorter in the retired overview-tier block because that divergent styling was replaced instead of expanded.

- Reverted the `/u/*` profile header brand label away from the SVG text experiment and back to the original text-label approach, with no CSS uppercase transform on either state and literal label strings of `StreamSuites™` and `COMMUNITY HOME`. This restores the original font behavior while keeping the hover crossfade intact. No files were created or removed.

- Reworked the standalone `/u/*` profile header default `StreamSuites™` label as an inline SVG text mark using the bold title font so the title-font styling and size are restored while the text keeps exact mixed-case casing. The hover/focus `Community Home` label remains unchanged. No files were created or removed.

- Corrected the standalone `/u/*` profile header default `StreamSuites™` label again by removing inherited tracking from the shared text wrapper, using a normal case-preserving bold UI font for the default state, and keeping uppercase/tracking only on the hover/focus `Community Home` label. No files were created or removed.

- Upgraded the standalone `/u/*` profile body in `js/public-pages-app.js` and `css/public-shell.css` with a default-open premium latest/current stream module for creator-capable profiles, consuming the new public-safe `latest_stream` contract and falling back to polished source-unavailable states instead of broken iframes. Viewer-only profiles do not render the stream section.
- Cleaned up the `/u/*` Public Overview table by removing the StreamSuites and FindMeHere visibility rows, hydrating `Joined` from the authoritative `joined_at` value, and restyling the tier value as a badge/tier-chip instead of plain text.
- Added a polished `/u/*` game and competition preview section with explicitly non-authoritative future economy, inventory, competition-points, and seasonal-standing placeholders. `js/public-data-hub.js` now preserves the public-safe `latest_stream` shape for local profile normalization, and `tests/auth-surface-parity.test.mjs` pins the route-scoped additions. No files were created or removed.

- Adjusted the standalone `/u/*` profile header brand text so the default `StreamSuites™` label keeps its exact mixed-case casing while the hover/focus `Community Home` label remains uppercase. No files were created or removed.

- Corrected the standalone `/u/*` Public Authority state icon swap so the collapsed icon is set to `/assets/icons/ui/hidden.svg` and the `<details>` toggle handler updates the same inline mask to `/assets/icons/ui/visible.svg` when expanded. The prior CSS-only override could not reliably beat the icon's inline mask custom property. No files were created or removed.

- Updated the standalone `/u/*` profile header brand text so the existing Community Home link now shows `StreamSuites™` by default in the bold title font and smoothly crossfades to `Community Home` on hover/focus, without changing the logo image or link destination. No files were created or removed.

- Fixed the standalone `/u/*` profile utility icons that were rendering as solid squares by routing the profile-specific mask classes through the same CSS mask-image rule as the shared icon classes, so share-link brand icons, mini-gallery fallback icons, and authority icons inherit the intended text color. The collapsed authority state icon now uses `/assets/icons/ui/hidden.svg`, and the expanded state swaps to `/assets/icons/ui/visible.svg`. No files were created or removed.

- Cleaned up the standalone `/u/*` profile mini-gallery and utility strip by normalizing stale local clip thumbnail placeholders such as `/assets/backgrounds/seosupport.jpg` and `/assets/backgrounds/seoaccessibility.jpg` to the existing checked-in fallback before render, adding a mini-gallery image error fallback, removing the compact share-row outer container styling so only the three inline controls remain visible, and relabeling the collapsed authority toggle to `PUBLIC AUTHORITY` with the requested shield-tick icon. No files were created or removed.

- Fixed the standalone `/u/*` hero role-chip hover artifact by adding paint containment and rounded clipping to the existing chip shell in `css/public-shell.css`, preserving the current role-chip colors, sizing, glow, and sheen animation while preventing the hovered chip compositor layer from leaking onto adjacent chips. No files were created or removed.

- Completed the standalone `/u/*` public profile body polish in `js/public-pages-app.js` and `css/public-shell.css` with a profile-only public overview board, curated mini artifact showcase, compact inline StreamSuites/FindMeHere share rows with copy plus native-share/fallback actions, and a slim collapsed authority request control that preserves the existing full request panel when expanded. The old standalone profile share/authority two-column utility layout was replaced because it left the new hero sitting over clunkier legacy modules; no files were created or removed, so `README.md` repo tree changes were not required. While validating, also hardened `js/public-data-hub.js` so VM-style tests without `window.location` do not crash the API-base fallback.

- Added a focused `/u/*` profile hydration regression in `tests/auth-surface-parity.test.mjs` so standalone public profiles must keep no-store runtime profile fetches and must prefer authoritative API avatar/cover/banner media over local fallback profile data. No public source files were removed or replaced in this pass.

- Corrected the standalone `/u/*` profile body polish by removing the route-scoped decorative body glow and panel orb pseudo-elements that could read as a drifting, misaligned shape between the hero and lower profile card. This was a CSS-only replacement/removal in `css/public-shell.css`; the file is expected to be shorter than the prior profile-body pass because the stray decorative layers were deleted instead of restyled.
- Continued the standalone `/u/*` public profile redesign by restyling the below-hero body in `css/public-shell.css` as a route-scoped premium dark glass composition, with richer panel surfaces, improved spacing rhythm, refined share/authority/owner-control cards, stronger strokes, and footer-safe bottom spacing while preserving the existing profile data and action wiring in `js/public-pages-app.js`.
- Replaced the old standalone profile return-only footer helper with a persistent `/u/index.html` slimline fixed profile footer inspired by the dashboard footer structure, including the existing Community Home affordance, runtime version tooltip wiring, and an inline `data-status-slot` so `js/status-widget.js` mounts the status widget inside the footer instead of floating above the profile page.
- Restyled the standalone profile role chips in the existing size/shape family with dashboard-style glass badge colors and the animated hover sheen treatment used by Creator/Admin tier badges. No files were created or removed, so `README.md` repo tree changes were not required; the touched files are slightly longer except `js/public-pages-app.js`, which is shorter because the obsolete profile-only return-footer helper was removed after the footer moved to the stable route shell.
- Rebuilt the standalone `/u/*` public profile route in `js/public-pages-app.js` and `css/public-shell.css` with a profile-scoped cinematic hero, full-bleed cover treatment, slim overlay header, centered avatar/identity stack, clamped bio reveal, refined role chips, header social rail with overflow panel, and matching account dropdown widget behavior. The shared `/community/profile.html` profile renderer and unrelated public shell routes were intentionally left on their existing structure.
- Replaced the old standalone `/u/*` in-card cover/social/bio top stack with the new hero/header composition, while keeping the existing share links, authority request panel, owner bio/privacy controls, social link targets, auth menu actions, and profile data wiring intact below the hero. No files were created or removed in this profile polish pass; the touched JS/CSS/test files are longer because the new route-scoped profile chrome and source guards are additive.
- Added a discreet profile-only `Community Home` return link to the standalone profile footer and extended `tests/auth-surface-parity.test.mjs` so the profile route keeps its standalone hero/header hooks, social overflow panel, 4-line bio clamp, and return affordance.
- Followed up the standalone profile header polish with the StreamSuites `ssnewcon.webp` logo beside the Community Home link, a rounded-square mask only for the header account avatar, and a slim profile-only hero/body trim line with gradient falloff at the ends. No files were created or removed.
- Tightened that profile header/body polish by removing the extra Community Home SVG prefix beside the new logo and adding a small responsive gap after the hero trim so the lower profile body no longer sits hard against the divider.
- Nudged the standalone profile divider down slightly with a small top margin so the trim has a little more breathing room beneath the hero.
- Increased the standalone profile divider breathing room again and changed the hero bio reveal control so `Show more` only appears when the rendered clamped bio actually overflows its four-line block.
- Corrected the standalone profile divider spacing so the added breathing room is carried by the hero height instead of external trim margin, keeping the cover-image falloff continuous all the way to the divider.

- Finished the wheel/artifact corrective pass in `js/public-pages-app.js`, `js/public-data-hub.js`, and `css/public-shell.css`: the live wheel detail now keeps the real wheel title in the browser/topbar, keeps `/scoreboards` only as a legacy alias into the `Leaderboards` scaffold instead of a current standalone List Views destination, preserves per-wheel list view as an internal mode, and exposes the repaired slug/share/owner-spin/center-image wheel detail polish on the public surface. Added `assets/icons/wheelarrow.svg` and `assets/placeholders/wheelcenterdefault.webp`, and updated `README.md` so the public repo tree reflects those new assets. No files were removed in this follow-up.
- Reworked `js/public-pages-app.js` and `css/public-shell.css` so the public wheel detail experience no longer depends on the broken owner-only `escapeHtml(...)` call path, now uses a real local draw-history model for `Spin`, `Spin Again`, `Re-spin`, and `Reset Wheel`, moves spin click audio onto actual pointer boundary crossings during active spins, rotates slice labels radially, restores visible trim/glow lighting around the real wheel stage, and upgrades the winner celebration into a fuller confetti burst that still respects the existing celebration toggle. No files were removed in this corrective pass; the touched public wheel JS/CSS files are longer because the session/history, trim, and audio logic are now real instead of thin placeholders.
- Removed the extra wheel-detail layout-toggle toolbar from `js/public-pages-app.js` instead of replacing it with another layout switch, and added preview buttons for each sound category inside the compact public owner editor so owners can audition selected assets without saving first.
- Updated `js/public-shell.js` so the public sidebar no longer carries a duplicate standalone `List Views` destination. The separate `Leaderboards` scaffold remains the sidebar entry and now reuses the outgoing list-view sidebar icon, while legacy `/scoreboards` routing remains preserved as a compatibility lens rather than the main IA target.

- Reworked `js/public-data-hub.js`, `js/public-pages-app.js`, and `css/public-shell.css` so the public wheel detail route is now a denser premium stage: slow idle drift, hover-highlighted slices, click-through entrant detail, real-time pointer label updates, local spin/respin/reset session logic, trim/pointer lighting, restrained celebration, real wheel sound-category support, and truthful session-scoped winner handling that respects `winner_limit`, duplicate posture, and auto-remove behavior without inventing backend persistence.
- Added the compact public wheel support rail in `js/public-pages-app.js`: a collapsed owner-only inline editor that saves back through the same authoritative creator wheel PATCH path, slim collapsed authority-request access, richer entrant public-detail rendering, and disabled non-owner editor posture instead of a broken invitation.
- Renamed wheel-facing “scoreboard” copy to “List view” across the public wheel/list-view experience, preserved `/scoreboards` as the legacy list-view lens, and added the minimal `/leaderboards` scaffold via `leaderboards.html` plus `functions/leaderboards/index.js`. No existing files were removed; the public repo is two files longer because the new leaderboards scaffold was added.
- Reworked `js/public-data-hub.js` so wheel hydration is now API-first against `/api/public/wheels`, with `/shared/state/wheels.json`, `/runtime/exports/wheels.json`, and `data/wheels.json` retained only as fallback mirrors. Added cache invalidation so open pages can truthfully rehydrate from the live wheel authority contract when wheel events arrive.
- Extended `js/public-pages-app.js` with a narrow wheel live-sync subscription to `/api/public/wheels/events` and fixed the public wheel detail crash by restoring a real `toTitle(...)` helper used by the detail/authority render path. Open `/wheels` and `/wheels/<slug>` pages now refresh live without pretending mirrored exports are the active truth source.
- Expanded `tests/wheels-authority.test.mjs` additively to pin the API-first wheel loader, SSE subscription wiring, and the repaired `toTitle(...)` detail helper. No files were removed or replaced in this pass; the touched public JS/test files are slightly longer because of the additive live-sync and crash-fix coverage.

## 2026-04-20 - Public Wheel Slug Resolution Guard

### Technical Notes

- Expanded `tests/wheels-authority.test.mjs` additively to pin slug-based detail lookup through `findArtifactByIdentifier(...)` and normalized `routeKeys` matching, so the real `/wheels/<slug>` path remains locked to the authoritative wheel normalization contract once mirrored wheel data is present.
- No production files were removed or replaced in this public repo pass. The test file is only slightly longer because it now guards the exact slug-resolution seam involved in the empty-shell regression.

## 2026-04-20 - Public Artifact Detail Sidebar Default-Collapse Repair

### Technical Notes

- Extended `js/public-pages-app.js` with a narrow `resolveDefaultSidebarState(...)` path so individual artifact detail pages default the shared public shell sidebar to icon-only mode while gallery/index pages keep their normal defaults. The behavior is route-aware and reuses the existing shell state contract instead of introducing a parallel detail-page-only sidebar system.
- Updated `js/public-shell.js` so `defaultSidebarState` is treated only as an auto-mode default when no stored user preference exists. Detail pages can therefore open collapsed on first render without overwriting persisted sidebar preference, without forcing later interactions, and without breaking the existing mobile/icon default path.
- Expanded `tests/wheels-authority.test.mjs` additively to pin the new detail-page sidebar default wiring. No files were removed or replaced in this repair; the touched public JS files are slightly longer because they now carry the route-aware shell default logic and the matching regression coverage.

## 2026-04-20 - Public Wheel / Scoreboard Artifact Flow

### Technical Notes

- Replaced the old `/wheels` placeholder path by extending `js/public-data-hub.js` to consume the authoritative runtime `wheels.json` export first, normalize wheel artifact records, and derive the `/scoreboards` gallery from the same wheel artifacts rather than inventing a second scoreboard authority layer.
- Extended `js/public-pages-app.js`, `js/public-shell.js`, and `css/public-shell.css` so the unified public shell now has a real `/wheels` gallery, clean `/wheels/<artifact>` detail routing, an interactive local-only wheel spin viewer, a ranked scoreboard presentation for the same artifact data, persisted default-view respect on the wheel route, and clean `/scores/<artifact>` routing as the scoreboard lens over the same wheel artifact.
- Added `functions/wheels/index.js`, `functions/wheels/[[artifact]].js`, `wheels/detail.html`, `data/wheels.json`, and `tests/wheels-authority.test.mjs` so direct entry, refresh, local fallback hydration, and focused source-level regression checks now exist for the wheel route family. The public viewer remains consumer-only: it does not expose editing, fake owner controls, winner-history persistence, or livechat automation.

### Human-Readable Notes

- Public now has a real wheel gallery and detail viewer instead of a reserved placeholder route.
- The same published wheel artifact can be viewed either as a spinning wheel or as a scoreboard, and the scoreboard route is now just that alternate lens rather than a separate data source.
- Spins on the public page are explicitly local to the browser session, so viewers get a polished interaction without fake backend winner history.

## Public Authority Contract Wiring - 2026-04-20

### Technical Notes

- Extended `js/public-data-hub.js` so the public shell now consumes the runtime-published `public_identities.json` and `public_artifacts.json` authority summaries, indexing real `identity_code` targets for profile surfaces and only enabling artifact-side request actions when a real `artifact_code` is already present instead of guessing.
- Replaced the old placeholder-only authority scaffold in `js/public-pages-app.js` with real `POST /api/public/authority/requests` submission handling on contextual profile/detail surfaces, including truthful duplicate-pending, validation, auth-required, success, and failure messaging plus guest sign-in handoff through the existing shared auth modal.
- Reworked `/community/my-data.html` through the existing shared SPA renderer so signed-in users now load `GET /api/public/authority/requests/mine`, see real request type/status/target/note history, and get a proper empty state instead of a fake account-history placeholder.
- Added authority-panel styling in `css/public-shell.css`, updated `README.md`, and added `tests/public-authority-wiring.test.mjs` so the repo now pins the export hydration and real request-history wiring.

### Human-Readable Notes

- Public profile surfaces can now submit real authority review requests when the page can resolve a real backend identity target.
- My Data now shows your real request history instead of placeholder copy.
- Artifact pages stay honest: if the public payload does not expose a real authority artifact code yet, the request UI remains visible but disabled rather than guessing.

## Public /@slug Alias Bootstrap Repair - 2026-04-19

### Technical Notes

- Removed the alias-specific `_redirects` rewrite pair for `/@` and `/@*` because that redirect layer was collapsing real `/@slug` requests into `/u/` before the standalone profile bootstrap could preserve the slug.
- Added `functions/@/[[slug]].js` so direct entry and refresh on `/@slug` still serve the existing `/u/index.html` standalone profile bootstrap without rewriting the browser-visible pathname away from the raw alias request.
- Kept alias normalization in `js/public-pages-app.js`, where the bootstrap and same-origin navigation paths continue to read `window.location.pathname`, normalize only valid `/@slug` or `/@slug/` requests to canonical `/u/<slug>`, preserve query strings and hashes, and avoid generating an empty `/u/` state from a valid alias.
- Replaced the prior redirect assertions in `tests/auth-surface-parity.test.mjs` with coverage that the bad `_redirects` rule is gone and the alias Pages Function now carries direct-entry traffic into the existing standalone profile bootstrap.

### Human-Readable Notes

- Public `@handle` profile links now normalize to `/u/handle` in the app without depending on the broken redirect rule that was dropping the slug in real browser navigation.
- The redirect manifest is shorter because the bad alias-specific rewrite pair was removed and replaced by a dedicated Pages Function that preserves the original alias URL until bootstrap canonicalizes it.

## Public /@slug Profile Alias Shim - 2026-04-19

### Technical Notes

- Added additive Cloudflare Pages rewrites in `_redirects` for `/@` and `/@*` so direct entry and refresh on the profile alias path resolve through the existing `/u/index.html` standalone profile bootstrap instead of falling through to the static 404 surface.
- Updated `js/public-pages-app.js` with a narrow profile-alias normalizer that matches only `^/@([^/?#]+)/?$`, converts the captured identifier into the existing canonical `/u/<slug>` route, preserves the current query string and hash, and calls `history.replaceState()` before initial standalone route resolution.
- Reused that same alias normalizer inside client-side navigation so intercepted in-app links or manual same-origin `/@slug` navigation fetch and store only the canonical `/u/<slug>` URL, avoiding redirect loops and keeping `/u/*` as the sole real profile route.
- Extended `tests/auth-surface-parity.test.mjs` with focused source coverage for the new `_redirects` rewrite pair and the early `/@slug` to `/u/<slug>` normalization hook in the public app bootstrap.

### Human-Readable Notes

- Profile links in the `@handle` format now land on the same public profile as before and immediately normalize to the canonical `/u/handle` address.
- Direct loads, refreshes, and internal public-site navigation now treat `@handle` profile links as a compatibility alias instead of a separate route system.

## Shared Public Badge Tooltip Upgrade - 2026-04-12

### Technical Notes

- Added the shared helper `js/public-badge-ui.js` and wired it into the public entry points that already load the public shell/app stack so badge and live-status tooltip behavior comes from one floating tooltip implementation instead of page-local `title` hacks or duplicated per-surface tooltip DOM.
- Updated `js/public-pages-app.js`, `js/public-shell.js`, and `assets/js/ss-profile-hovercard.js` so the real public-facing badge/status set already rendered by this repo now resolves tooltip labels from the existing badge payloads and maps: Admin, Core, Gold, Pro, Founder, Moderator, Developer, plus the existing public `LIVE` status pills where they render in badge rows.
- Added the compact dark glass tooltip styling in `css/public-shell.css` and fixed the members-directory pagination font regression at the shared control layer by restoring inheritance on `.member-gallery-page-btn` instead of adding page-specific overrides.
- Extended `tests/auth-surface-parity.test.mjs` with source checks for the shared badge-tooltip helper wiring and the pagination-font fix.

### Human-Readable Notes

- Public profile badges and live pills now explain themselves on hover and keyboard focus across the shared public profile surfaces instead of appearing as unlabeled icons.
- The `/community` and `/community/members` pagination buttons now use the same font as the surrounding public UI again.

## Community Member Card Composition Cleanup - 2026-04-12

### Technical Notes

- Reworked the shared member gallery card composition in `js/public-pages-app.js`, `js/public-data-hub.js`, and `css/public-shell.css` so `/community/index.html` and `/community/members.html` now follow the existing profile-hovercard hierarchy more closely: avatar, name row, grouped badges/live state, slug-derived handle subline, bio, optional artifact summary, social row, and profile CTA.
- Replaced the old gallery-only metadata pill row on those cards by removing the meaningless default `StreamSuites` platform chip, dropping the duplicate `LIVE` status pill, and moving artifact counts into a quieter text summary that only renders when a member actually has public artifacts.
- Stopped exposing internal user codes as public handles on the gallery cards by introducing slug-first handle resolution that prefers authoritative slug fields and canonical `/u/<slug>` URLs before any fallback username/user-code path.
- Updated the gallery-card social buttons to render their icons through themed mask slots instead of raw `<img>` SVGs so the website/globe icon now follows the intended current-color button treatment rather than showing its original black fill.
- Extended `tests/auth-surface-parity.test.mjs` with source checks covering the cleaned gallery-card composition, the slug-first handle helper, and the scoped removal of the old platform/live pill row from the member-card renderer.

### Human-Readable Notes

- Community member cards now read like deliberate profile previews instead of loose chips and scattered metadata.
- Public handles on those cards now come from the canonical profile slug, duplicate live labels are gone, and website links match the themed icon styling used by the rest of the card actions.

## Public Community Member Gallery Pagination Refresh - 2026-04-12

### Technical Notes

- `js/public-pages-app.js` now routes both `/community/index.html` and `/community/members.html` through a shared member-gallery renderer that preserves the existing authoritative member-directory visibility rules while sorting by the displayed public/member name, applying search plus A-Z or `#` filtering together, and paginating the filtered result set at `20` members per page.
- Replaced the old simple member-card/list rendering on those two surfaces with full gallery cards composed from the existing public profile fields already exposed to the page: avatar, display name, supporting identity line, authoritative badges/live state, bio, artifact counts, platform/status pills, social links, and the canonical open-profile CTA.
- Scoped tooltip suppression to the affected member galleries by removing hover-trigger wiring from those page-specific cards instead of changing the global hovercard script, and added the additive gallery/filter/pagination styling in `css/public-shell.css` so the cards inherit the existing hovercard visual language directly on-page.

### Human-Readable Notes

- The Community home members block and the standalone Members directory now browse as a paginated card gallery instead of long repeated rows.
- Search still works from the existing top bar, and now combines with an A-Z rail plus previous/next paging so larger directories are easier to browse without hover-only profile details.

## Runtime Turnstile Kill-Switch Coverage - 2026-04-09

### Technical Notes

- Added focused source coverage in `tests/auth-surface-parity.test.mjs` so the shared public auth helper keeps Turnstile visibility tied to the runtime `/auth/turnstile/config` `enabled` flag and preserves the hidden-panel collapse path when the runtime disables it.

### Human-Readable Notes

- Public login surfaces still trust the runtime-owned Turnstile state, and the hidden widget path stays gap-free.

## Public Community Member Hydration Authority Fix - 2026-04-07

### Technical Notes

- Replaced the public community member source in `js/public-data-hub.js` from the checked-in scaffold file `data/profiles.json` to the authoritative runtime/Auth endpoint `/api/public/community/members`, while leaving clips, polls, tallies, scoreboards, notices, and other artifact/sample payloads on their existing placeholder/static paths.
- Added a minimal member-directory fetch status contract in `js/public-data-hub.js` and used it in `js/public-pages-app.js` so `/community/index.html` and `/community/members.html` now show a truthful directory-unavailable state instead of the old misleading empty-search message when the authoritative member fetch fails.
- Removed `data/profiles.json` outright because it contained the scaffold/sample member records that were still feeding the community pages; the repo tree in `README.md` was updated accordingly, and `tests/auth-surface-parity.test.mjs` now checks that the public data hub points at the runtime endpoint instead of the deleted sample file.

### Human-Readable Notes

- The community home and members directory now load the real member list from StreamSuites instead of showing placeholder people.
- Only the member directory hydration changed. Public clips, polls, tallies, scoreboards, notices, and other sample artifact sections remain intentionally placeholder content for now.

## Emergency Public Login Modal Visual Parity Hotfix - 2026-04-06

### Technical Notes

- Traced the source-of-truth public lander modal in `index.html` plus `css/aurora-landing.css` against the shared non-lander modal in `js/public-shell.js` plus `css/public-shell.css` and fixed the parity gap at the implementation path instead of adding more override-only styling.
- Replaced the malformed non-lander variant path where the shared modal rendered lander-style `auth-modal-section-divider`, `ss-auth-surface-links`, and `ss-turnstile-*` markup without the matching `public-shell.css` selector set; the shared modal now ships the same canonical hooks, typography, pill treatment, chevron treatment, and Turnstile wrapper styling as the lander reference.
- Added the lander's compact alternate-surface hook to the shared modal markup in `js/public-shell.js`, aligned the shared modal disclaimer/toggle treatment to the same blue-link and muted-copy pattern, and increased the divider rhythm on both modal paths by moving the divider to `10px` top spacing plus `8px` spacing before the alternate-surface block.
- Extended `tests/auth-surface-parity.test.mjs` so the shared modal now fails source review if the compact alternate-surface hook or the required lander-parity selector set drops out again.

### Human-Readable Notes

- The `/media`-style public login modal no longer falls back to malformed plain text for `Login to other surfaces`; it now uses the same muted expandable pill treatment and lower Turnstile block presentation as the main `index` modal.
- The disclaimer copy, link sizing, and divider spacing now read the same between the lander modal and the shared public-page modal without touching auth logic or Turnstile enforcement.

## Public Login Modal Parity Polish - 2026-04-06

### Technical Notes

- Added a shared `auth-modal-section-divider` hook in `index.html` and `js/public-shell.js` so both public login modals now place the same ultra-subtle separator directly above the `Login to other surfaces` details block with minimal extra spacing.
- Updated `css/aurora-landing.css` so the lander modal legal links now use the same blue link treatment as the public-shell modal while keeping the rest of the lander modal intact.
- Re-tuned the shared public-shell modal presentation in `css/public-shell.css` to match the lander reference values for modal shell, access-gate chrome, close control, auth copy rhythm, disclaimer styling, and alternate-surface spacing instead of keeping a separate visual variant.
- Aligned the shared modal disclaimer copy in `js/public-shell.js` to the lander login/signup wording without changing any auth, Turnstile, or cross-surface routing logic.
- Extended `tests/auth-surface-parity.test.mjs` with lightweight source checks covering the new divider hook and the shared blue disclaimer-link treatment.

### Human-Readable Notes

- The main lander login modal now keeps its existing design, but its Terms and Privacy links are blue and there is a faint separator above the other-surfaces section.
- The `/media`-style public modal now follows the same visual rhythm and disclaimer treatment as the lander modal, so the two no longer read like separate modal designs.

## Emergency Login Turnstile Parity Hotfix - 2026-04-06

### Technical Notes

- Root-caused the live `streamsuites.app` lander modal omission to `index.html`: the page loaded `/js/turnstile-inline.js` with `defer`, but the separate auth-modal inline script still attempted to construct the controller immediately during parse, so `window.StreamSuitesTurnstileInline` was not ready and the modal never mounted a widget.
- Replaced that broken lander-only init timing with an explicit `initLandingPageAuthModal()` bootstrap that waits for the deferred helper before creating the inline controller, while leaving runtime-side Turnstile enforcement untouched.
- Moved the Turnstile blocks to the lower auth section in `index.html`, `js/public-shell.js`, `public-login.html`, and `requests-login.html`, and capped the shared helper/status text at `9px` in both `css/public-pages-v2.css` and the lander-specific `css/aurora-landing.css`.
- Tightened `tests/auth-surface-parity.test.mjs` so the lander now fails source review if the modal controller is moved back to eager init or if the lower auth surfaces lose the expected alternate-surface-links then Turnstile ordering.

### Human-Readable Notes

- The main public lander modal was missing Turnstile because its login script ran too early, not because the widget markup was absent.
- Public login surfaces now keep the security check lower in the auth block with smaller helper text, and the main lander modal once again has a real Turnstile controller path.

## Public User Menu Dropdown Parity + Developer-Link Gating - 2026-04-05

### Technical Notes

- Added a compact Creator-style account overview card to the shared public shell dropdown by extending `js/public-shell.js` plus `css/public-shell.css` rather than inventing a separate public-only menu design.
- Updated `js/public-pages-app.js` auth normalization to consume the existing runtime `access_class`, `effective_tier.display_tier_label`, `creator_workspace_access`, `admin_access`, and `developer_console_access` fields so cross-surface menu links are capability-aware.
- The Public dropdown now shows `Developer Console` only when `developer_console_access.allowed === true`; Creator and Admin links now follow the same authoritative access posture instead of relying on coarse account-type guesses.

### Human-Readable Notes

- The Public account menu now starts with the same compact account-summary card style used on Creator.
- Developer Console only appears for sessions that actually have developer access.

## RELEASED / PACKAGED: 0.4.2-alpha

Packaged / released and no longer the active pending bucket. Preserve new notes for the open `0.4.8-alpha` section below.

## Public Badge Payload Trust Cleanup - 2026-03-28

### Technical Notes

- Removed the stale local admin-over-tier and developer-over-Pro badge filter from `js/public-data-hub.js` when normalizing authoritative profile badges for public profile consumers.
- The backend already resolves the final visible badge set through the matrix model, so this extra client filter could incorrectly strip legitimate runtime-owned combinations and was no longer a safe compatibility shim.
- The file became shorter because the legacy `hasAdminBadge` / `hasDeveloperBadge` suppression branch was deleted outright.

### Human-Readable Notes

- Public profile consumers now follow the badge payload they receive instead of hiding badges with older rules.
- The compact public header widget still keeps its deliberate one-badge summary behavior as a separate space-constrained presentation choice.

### Files / Areas Touched

- `js/public-data-hub.js`
- `BUMP_NOTES.md`

## Public Compact Widget Cleanup - 2026-03-27

### Technical Notes

- The public shell top-bar account widget now normalizes authoritative badge arrays into a compact-only subset, allowing admin or developer to suppress tier where appropriate, falling back to a single tier badge otherwise, and explicitly excluding founder from the compact widget.
- Widget spacing, avatar sizing, and badge sizing were tightened so the public account pill stays visually closer to adjacent top-bar controls without touching richer profile/card badge rendering.

### Human-Readable Notes

- The public header account pill is slimmer and cleaner.
- Founder still exists on fuller profile surfaces where intended, but it no longer crowds the compact top-bar widget.

### Files / Areas Touched

- `js/public-shell.js`
- `css/public-shell.css`
- `BUMP_NOTES.md`

## Public Static Badge Contract Alignment - 2026-03-27

- The static public/community data-hub path now consumes authoritative badge arrays from profile payloads instead of rebuilding badge display from role and tier alone, which keeps non-API-backed profile rows aligned with the runtime-owned badge contract.
- Admin-over-tier suppression and Developer-over-Pro suppression now apply on that fallback/static path too, so community/profile surfaces do not regress back to redundant tier icons when developer or admin badges are already present.

### Files / Areas Touched

- `js/public-data-hub.js`
- `BUMP_NOTES.md`

## Public Admin Badge Priority Alignment - 2026-03-27

- Public badge normalization now drops creator-tier icons whenever an Admin badge is present, so public account widgets, creator rows, and hovercards no longer show redundant admin-plus-tier combinations from stale fallback or legacy payload shapes.
- The public repo still acts only as a contract consumer: admin creator capability and implicit Pro entitlement are resolved by StreamSuites/Auth, while this repo now mirrors the authoritative Admin-over-Pro display rule more reliably.

### Files / Areas Touched

- `js/public-pages-app.js`
- `assets/js/ss-profile-hovercard.js`
- `BUMP_NOTES.md`

## Public Badge Contract Alignment - 2026-03-26

- Public profile normalization and public auth-state hydration now prefer the backend-authored badge arrays, falling back to old role/tier-only badge derivation only when the payload is still legacy-shaped.
- Public badge icon rendering and hovercard normalization now understand the expanded authoritative badge set, including founder, moderator, and developer badge keys, while still resolving the repo-local icon assets.
- This keeps the public surface as a badge consumer only: badge possession, visibility policy, FindMeHere subset rules, and founder automation remain runtime/Auth-owned.

### Files / Areas Touched

- `js/public-pages-app.js`
- `assets/js/ss-profile-hovercard.js`
- `BUMP_NOTES.md`

## Cross-Repo README Architecture Alignment - 2026-03-21

- The public README now includes a repo-scoped Mermaid flowchart, clearer consumer-boundary wording for Functions versus runtime/Auth ownership, normalized repo-tree formatting, and direct links back to the runtime and sibling-surface READMEs.
- Public profile, artifact, live-view, and FindMeHere relationship wording was aligned to the runtime-owned slug, visibility, and share-policy model already reflected in the repo.
- This was a documentation-only pass. No public routing, proxy behavior, SEO surface, or profile/live implementation changed in this note.

### Files / Areas Touched

- `README.md`
- `BUMP_NOTES.md`

## Release Prep Completion - v0.4.2-alpha

- Public-facing runtime-fed version labels remain downstream of `https://admin.streamsuites.app/runtime/exports/version.json`, and this release-prep pass now aligns the repo's local release state to `0.4.2-alpha`.
- Repo-local release-note source material for this bump now lives in `changelog/v0.4.2-alpha.md`, using the compare range `v0.4.0-alpha...v0.4.2-alpha`.
- The existing `data/changelog.json` entry was the public-page hydration source at this milestone and was not the GitHub-release markdown artifact. The 2026-08-06 Roadmap replacement later retired that rendered hydration path while retaining this file as historical release material.
- The repo-local HTML version comments in `index.html`, `404.html`, and `requests.html` are now consistent with the release-prep state instead of trailing at `v0.4.1-alpha`.
- Earlier sections below remain the cumulative milestone record for the public auth-gate, shell, and profile-surface work behind this bump.

### Technical Notes

- Public-facing version labels are loaded from the authoritative runtime export at `https://admin.streamsuites.app/runtime/exports/version.json` via `js/utils/versioning.js` and `js/utils/version-stamp.js`, so the best grounded current version remains `0.4.1-alpha`.
- `README.md` is already prepared for `v0.4.2-alpha`, which means this repo is in release-prep posture even though the runtime-fed version source has not been bumped in this task.
- Recent repo-visible UI work in `css/public-shell.css`, `css/theme-dark.css`, `js/public-shell.js`, and `js/public-pages-app.js` focused on top-bar alignment, fallback avatar behavior, shell search/footer polish, and profile share-link cleanup.
- Recent local history also added or refreshed sample clip media and clip naming fixes, which supports the current public media/gallery presentation visible in the repo.

### Human-Readable Notes

- The public shell is being tightened around everyday polish details: the user widget aligns correctly, fallback avatars are more consistent, and share-link behavior is cleaner.
- Public-facing media/demo content was refreshed at the same time, which makes this repo useful as a release-note source for both UI polish and sample-content prep.
- The repo is clearly being staged for `0.4.2-alpha`, but its displayed version still comes from the runtime export stream that currently reads `0.4.1-alpha`.

### Files / Areas Touched

- `js/public-shell.js`
- `js/public-pages-app.js`
- `css/public-shell.css`
- `css/theme-dark.css`
- `js/utils/versioning.js`
- `js/utils/version-stamp.js`
- `clips/sampleclip00.mp4`
- `clips/sampleclip01.mp4`
- `clips/sampleclip02.mp4`
- `clips/sampleclip03.mp4`
- `clips/sampleclip04.mp4`
- `README.md`

### Follow-Ups / Risks

- Keep public share-link behavior aligned with the authoritative public-profile payload as the runtime bump and export refresh happen.
- README release-state copy already references `v0.4.2-alpha`, so the actual bump pass should ensure the runtime-fed version stamp and sample-content packaging move together.

## Session Milestone - 2026-03-20 - Public Access Gate UX + Passive Banner

### Completed / Implemented

- Public auth entry points in `functions/auth/[[path]].js`, `js/public-login.js`, `public-login.html`, and the inline landing/login flow in `index.html` now consume the runtime-owned `GET /auth/access-state` contract and the short-lived `POST /auth/debug/unlock` bypass flow instead of hard-coding local lockout rules.
- The public login surfaces now render maintenance/development lockout messaging with an inline access-code unlock form, session-scoped bypass persistence, and gated login/signup starts that still defer actual enforcement to the runtime/Auth API.
- The bypass affordance and related auth polish are present in the current tree: the reveal control is wired in `public-login.html` and `index.html`, shared gate styling lives in `css/public-login.css` and `css/aurora-landing.css`, and close/info icon rendering now uses `assets/icons/ui/close.svg` and `assets/icons/ui/info.svg`.
- Passive page-level lockout banner behavior is present in `js/public-shell.js`, `css/public-shell.css`, and `css/aurora-landing.css`: banner visibility is driven by `show_lockout_banner` from runtime access-state, dismissal is stored in `sessionStorage`, and the banner is rendered as informational UI rather than auth enforcement.
- Repo-visible routing and shell behavior indicate the banner/access-state work is decoupled from page availability: `/`, `/community`, `/media`, `/clips`, and `/polls` remain ordinary public routes, while auth starts link outward to `/public-login.html` with `return_to` handling instead of mutating browseable public-page access.

### Useful Release-Note Framing

- This repo now has the public-side lockout UX needed for runtime maintenance/development mode without turning public pages themselves into gated routes: auth starts can be paused, bypass can be granted temporarily, and a dismissible banner can inform visitors when `SHOW_LOCKOUT_BANNER` is enabled upstream.

### Pending / Follow-Up

- Dedicated `/clips` and `/polls` gallery routes, detail routes, and hydration codepaths are present in `js/public-pages-app.js`, `js/public-data-hub.js`, `functions/clips/*`, and `functions/polls/*`, but there is no repo-visible automated verification here proving that all same-pattern category pages are fully resolved end-to-end. Keep `/clips` / `/polls` category hydration as a follow-up verification item for release readiness.

## CURRENT VER= 0.4.2-alpha / PENDING VER= 0.4.8-alpha

Open bucket for future work only. Do not add new `0.4.8-alpha` prep notes into the released `0.4.2-alpha` section above.

## Public /@slug Catch-All Intercept Repair - 2026-04-20

### Technical Notes

- Removed `functions/@/[[slug]].js` because the literal `@` Pages Function route was not being matched reliably for direct public `/@slug` entry in the deployed Pages runtime, which left those requests falling through to a real 404 before the client bootstrap could run.
- Replaced it with the supported root catch-all handler `functions/[[path]].js`, which intercepts only `^/@([^/?#]+)/?$`, internally serves the existing `/u/index.html` standalone profile bootstrap, and calls `context.next()` for every non-alias request so unrelated public routes keep their existing behavior.
- Kept `_redirects` free of alias-specific `/@` rewrites and kept `js/public-pages-app.js` as the canonicalization layer, where valid `/@slug` requests still normalize client-side to `/u/slug`, preserve query strings and hashes, and avoid generating an empty canonical slug.
- Updated `tests/auth-surface-parity.test.mjs` to assert the supported catch-all intercept is present, the broken alias-specific function path is no longer the mechanism, and alias canonicalization still preserves query/hash handling on the client.

### Human-Readable Notes

- Direct public `/@handle` links should now reach the same standalone profile bootstrap as `/u/handle` instead of 404ing before the app can normalize them.
- The server-side alias implementation is simpler now: one supported catch-all intercept replaced the non-matching literal `@` function route, so the routed files are shorter overall.

### Files / Areas Touched

- `functions/[[path]].js`
- `tests/auth-surface-parity.test.mjs`
- `README.md`
- `BUMP_NOTES.md`

### Risks / Follow-Ups

- This repair is based on the supported Pages catch-all shape and local verification; final confirmation still needs deployed browser checks for direct entry, refresh, and trailing-slash/query variants on `https://streamsuites.app/@slug`.

## Public Viewer Dashboard Shell Unification - 2026-04-19

### Technical Notes

- Replaced the old split media-vs-community sidebar model in `js/public-shell.js` with one shared public dashboard navigation tree that now covers Home, Clips, Polls, Wheels, Scoreboards, Tallies, Games / Economy, Live, Community, My Data, Settings, and the existing quicklinks.
- Reworked the `/media` and `/community` landing renderers in `js/public-pages-app.js` so both surfaces now use the same dashboard-oriented hero, overview-card, and placeholder language instead of feeling like separate apps that merely shared a stylesheet.
- Added new public dashboard route wrappers and SPA-aware page configs for `/wheels.html`, `/economy.html`, and `/community/my-data.html`, keeping the existing router/fetch navigation pattern intact while truthfully marking those destinations as not-yet-wired placeholders.
- Added reusable dashboard card/hero/action-scaffold styling in `css/public-shell.css`, including a discreet non-submitting claim / assign / report / removal-request CTA pattern that prepares future moderation or ownership workflows without faking backend behavior.
- Expanded the existing `/community/settings.html` render path so the settings surface now reads like part of the same viewer/member dashboard while still preserving the current authoritative public-profile save behavior and clearly separating planned controls from active ones.
- No runtime-side artifact authority, FFmpeg clip generation, approval workflows, launcher work, OBS overlay transport, or creator/admin trigger logic were implemented in this milestone.

### Human-Readable Notes

- The public media and community areas now feel like one viewer/member dashboard instead of two different shells.
- `/media` remains the default public home, but it now introduces the broader dashboard structure for clips, polls, scoreboards, tallies, live, community, and future modules.
- New My Data, Wheels, and Games / Economy destinations exist as polished placeholders so the public shell can grow without another navigation reset later.

### Files / Areas Touched

- `js/public-shell.js`
- `js/public-pages-app.js`
- `css/public-shell.css`
- `wheels.html`
- `economy.html`
- `community/my-data.html`
- `README.md`
- `BUMP_NOTES.md`

### Risks / Follow-Ups

- The new placeholder routes are intentionally UI-only until authoritative backend/public-runtime support exists for wheels, economy, and member data exports/history.
- The shared dashboard language is now in place, but later milestone work should decide whether additional public artifact families need dedicated detail routes or remain placeholder-only.

## Public Social Platform Registry + Overflow Pass - 2026-04-19

### Technical Notes

- Replaced the duplicated partial social icon/order maps in `js/public-pages-app.js` and `assets/js/ss-profile-hovercard.js` with one canonical social-platform registry exported from `js/public-data-hub.js`, including alias normalization for existing payload variants such as `twitter` -> `x`, `site`/`web` -> `website`, `apple_podcasts`, `whatsapp_channels`, and `ko-fi`.
- Expanded downstream public rendering support to the full first-class plus extended platform list, switched website rendering to the canonical full-color `assets/icons/website.svg`, and kept WhatsApp Channels on the existing `assets/icons/whatsapp.svg` asset instead of adding a separate channel-specific icon file.
- Replaced the old member-card social-row renderer in `js/public-pages-app.js` so compact gallery/card surfaces now hard-cap at eight icons and append a restrained `+N` overflow indicator instead of spilling indefinitely.
- Replaced the old hovercard social-row ordering/icon logic in `assets/js/ss-profile-hovercard.js` with the shared canonical registry and the same compact max-eight rule plus `+N` indicator.
- Replaced the full-profile social strip path in `js/public-pages-app.js` so canonical ordering is preserved and narrower layouts collapse only the overflow portion behind a slim inline toggle rather than growing the row without bound.

### Human-Readable Notes

- Public profile pages, community member cards, and profile hovercards now recognize the expanded social-platform set in one consistent order instead of showing only the older short list.
- Compact preview surfaces stay visually restrained at eight icons, while full profile pages still expose the rest of the links through a small inline expander when space gets tight.

### Files / Areas Touched

- `js/public-data-hub.js`
- `js/public-pages-app.js`
- `assets/js/ss-profile-hovercard.js`
- `css/public-shell.css`
- `assets/css/ss-profile-hovercard.css`
- `README.md`
- `BUMP_NOTES.md`

## Public Rumble-Only Live Truth Cleanup - 2026-04-14

- Replaced the remaining fake/sample live authority in `js/public-data-hub.js` by removing embedded-profile live-state participation from `resolveLiveStatus(...)`, restricting renderable live providers to authoritative Rumble entries only, and treating `rumble_live_discovery.json` as enrichment-only metadata instead of a source that can create live state by itself.
- Replaced the standalone public profile fallback in `js/public-pages-app.js` so detailed profile pages now trust only the already-hydrated runtime-backed `fallbackProfile.liveStatus` instead of re-merging `payload.live_status` from the profile response.
- Replaced the hovercard fetch fallback in `assets/js/ss-profile-hovercard.js` so card hover state no longer rehydrates `LIVE` from fetched profile payload samples; it now reads only the runtime-backed card state that was already attached by the page.
- Removed the fake checked-in Twitch sample from `data/live-status.json` and replaced it with an intentionally empty Rumble-phase mirror snapshot. The file is much shorter now because it no longer ships a demo `LIVE` creator.
- Added focused regression coverage in `tests/live-status-authority.test.mjs` for Rumble-only gating, discovery-without-aggregate staying offline, and embedded/sample `live_status` no longer overriding missing runtime truth.

### Public Authoritative Live Status Downstream Pass - 2026-04-13

### Technical Notes

- Replaced the public repo’s fallback-first live-status hydration path in `js/public-data-hub.js` with runtime-export-first loading from `/shared/state/live_status.json`, keeping `data/live-status.json` only as a graceful mirror fallback instead of the primary source.
- Added a narrow Rumble discovery enrichment adapter in `js/public-data-hub.js` that optionally reads `/shared/state/rumble_live_discovery.json` and only fills already-existing live presentation fields such as watch URL, title, and viewer count when the aggregate runtime `live_status` entry is already authoritative but sparse.
- Kept source-of-truth separation intact by leaving the live/offline decision owned by the aggregate runtime export: stale or offline aggregate entries still render as not-live even if Rumble discovery data exists, and `js/public-pages-app.js` now merges sparse embedded profile live payloads with the already-normalized fallback export state instead of inventing new local truth.
- Added focused regression coverage in `tests/live-status-authority.test.mjs` for Rumble enrichment, stale/offline handling, and the shared-state-to-mirror fallback path.
- No files were removed in this repo during this pass. The placeholder-style `data/live-status.json` file was not deleted because it remains the intentional static fallback, but the consuming code path is now shorter-lived and secondary to the runtime export.

### Human-Readable Notes

- Public profile pages, community live cards, and `/live` now prefer the real runtime live export instead of treating the checked-in sample mirror as the main source.
- When the runtime already knows the creator is live on Rumble but the aggregate payload is missing a watch URL or title, the public site now fills that detail from the runtime’s Rumble discovery export without turning the public repo into a new authority layer.

### Files / Areas Touched

- `js/public-data-hub.js`
- `js/public-pages-app.js`
- `tests/live-status-authority.test.mjs`
- `README.md`
- `BUMP_NOTES.md`

### Community Member Card Header + Social Icon Corrective Pass - 2026-04-12

### Technical Notes

- Replaced the gallery-only two-column header split in `js/public-pages-app.js` and `css/public-shell.css` with a tighter grouped identity block so the avatar, display name, slug-derived handle, and badge/live row stay anchored together instead of rendering as separated islands with dead space.
- Removed the prior blanket masked social-icon rendering from the community member gallery card path and restored native per-platform SVG rendering for non-website links; only the website/globe icon now keeps the themed masked treatment on these cards because the underlying `globe.svg` asset still renders black when used as a raw image.
- The corrective CSS pass also removed the card-specific grid overrides that had been forcing badge clusters away from the display name, so the affected files are slightly shorter while preserving the existing grid, search, alphabetical filtering, pagination, slug-first handles, duplicate-LIVE suppression, removed `StreamSuites` chip, and tooltip suppression.

### Human-Readable Notes

- Community member cards on `/community` and `/community/members` now keep the avatar, name, handle, and badges packed together like the hovercard reference instead of leaving a floating badge block.
- Social icons are back to their normal platform appearance, and only the website icon gets the themed fix needed to avoid the original black globe.

### Files / Areas Touched

- `js/public-pages-app.js`
- `css/public-shell.css`
- `tests/auth-surface-parity.test.mjs`
- `BUMP_NOTES.md`

### Community Member Card Vertical Header Follow-up - 2026-04-12

### Technical Notes

- Replaced the interim left-column gallery identity wrapper in `js/public-pages-app.js` with the hovercard-style vertical stack actually used by the tooltip reference: overlapping avatar first, then the compact name-plus-badge row, then the handle/role subtitle.
- Removed the gallery-only wrapper styles in `css/public-shell.css` that were still preserving the old side-by-side composition, so the header now changes visibly on real member data instead of only shifting internal flex alignment.
- This follow-up keeps the website-only social-icon mask fix while preserving native platform SVG rendering for the other social links.

### Human-Readable Notes

- Community member cards now read like the tooltip header instead of a card with a stuck-on avatar column.
- The badge cluster sits next to the display name, and the handle is directly underneath instead of floating off in a separate block.

### Files / Areas Touched

- `js/public-pages-app.js`
- `css/public-shell.css`
- `tests/auth-surface-parity.test.mjs`
- `BUMP_NOTES.md`

### Public Requests Redirect To Developer Console Feedback Hub - 2026-04-04

### Technical Notes

- Updated the root `_redirects` manifest so the legacy `/requests`, `/requests/`, and `/requests.html` entry points now redirect to `https://console.streamsuites.app/feedback` using a simple Pages-compatible external redirect.
- This milestone intentionally does not move runtime authority into the public repo and does not add a duplicate local feedback implementation here. The public repo now hands off the feedback/request intake role to the dedicated developer console surface.
- No files were created or removed in this repo during this change.

### Human-Readable Notes

- The old public requests route now points visitors to the new console feedback hub.
- The public site keeps its existing role as the main public surface instead of also trying to host the new intake workflow.

### Files / Areas Touched

- `_redirects`
- `README.md`
- `BUMP_NOTES.md`

### Technical Notes

- Pending entries for `0.4.8-alpha` go here.

### Human-Readable Notes

- Pending entries for `0.4.8-alpha` go here.

### Files / Areas Touched

- Pending entries for `0.4.8-alpha` go here.

### Risks / Follow-Ups

- Pending entries for `0.4.8-alpha` go here.

## Task 3P - Developer Tier + Badge Surface Matrix - 2026-03-28

### Technical Notes

- Public badge consumers now stop applying the old local admin/developer suppression rules and trust the backend-authored badge payload more directly.
- Public hover/profile-card badge inputs can now prefer the backend profile-card/directory badge projections when they are present.

### Human-Readable Notes

- Public-facing profile and card badges are now much closer to the backend source of truth, which reduces client-side badge mismatches.

### Files / Areas Touched

- `js/public-pages-app.js`
- `js/public-shell.js`
- `assets/js/ss-profile-hovercard.js`

### Risks / Follow-Ups

- The compact shell widget still intentionally compresses badges for space, so future widget design work should decide whether to keep that curated subset or show the full backend-visible list for the widget surface.

## Task 3X - Turnstile Auth Rollout Verification - 2026-04-04

### Technical Notes

- Confirmed the public-surface inline Turnstile rollout covers the modal auth shell, the standalone public login route, and the requests-login handoff flow using `/auth/turnstile/config` plus the shared explicit-render controller in `js/turnstile-inline.js`.
- Updated the repo tree so the auth rollout's newly created `requests-login.html` route and `js/turnstile-inline.js` helper are reflected in the root README.

### Human-Readable Notes

- Public login starts and the requests-login bridge now stay behind the inline Cloudflare Turnstile check without changing the existing page layouts.

### Files / Areas Touched

- `README.md`
- `BUMP_NOTES.md`

### Risks / Follow-Ups

- Public auth starts still depend on the runtime's deployed Turnstile config endpoint. A stale runtime deployment will hide the widget rather than creating local fallback validation.

## Task 3Y - Auth Surface Parity + Turnstile Repair Pass - 2026-04-05

### Technical Notes

- Added the shared `js/turnstile-inline.js` helper to every `public-shell` route that opens the shared auth modal, closing the missed parity gap on routes such as `/media`, `/clips`, `/polls`, `/scoreboards`, and `/tallies`.
- Added the same low-footprint alternate-surface login link strip to the shared modal plus the direct `public-login.html` and `requests-login.html` routes, and tightened the inline Turnstile panel spacing so the widget reads like part of the form instead of a dropped-in block.
- Added a lightweight source-audit regression at `tests/auth-surface-parity.test.mjs` covering both helper inclusion and alternate-surface link presence.

### Human-Readable Notes

- Public login modals now show Turnstile consistently across the previously missed route variants.

## Task 3Z - Auth Surface Login Repair Follow-up - 2026-04-05

### Technical
- Fixed the main public lander `index.html` auth modal init path so the inline Turnstile controller is created only after the deferred `js/turnstile-inline.js` helper is ready, matching the intended explicit-render flow instead of racing it during HTML parse.
- Hardened the same deferred-helper pattern on `requests-login.html`, replaced the old flat `Elsewhere` selector treatment with a collapsed `Login to other surfaces` section on the lander modal, shared public-shell modal markup, `public-login.html`, and `requests-login.html`, and added the new `ss-public.svg`, `ss-creator.svg`, `ss-admin.svg`, and `ss-developer.svg` icon assets under `assets/icons/ui/`.
- Extended the source-audit regression at `tests/auth-surface-parity.test.mjs` so the lander init path and collapsed alternate-surface wording are covered alongside the existing public-shell helper parity checks.

### Human
- The public lander login modal now follows the same inline Turnstile startup pattern as the working public auth surfaces instead of silently missing the widget.
- The old `Elsewhere Public Creator Admin Developer` strip was replaced because it read like leftover utility text and took too much visual attention for a secondary navigation affordance.
- Public login surfaces now expose the same small “elsewhere” links for Creator, Admin, and Developer access without changing the overall auth layout.

### Files / Areas Touched

- `media.html`
- `clips.html`
- `clips/detail.html`
- `polls.html`
- `polls/detail.html`
- `polls/results.html`
- `scoreboards.html`
- `scoreboards/detail.html`
- `tallies.html`
- `tallies/detail.html`
- `public-login.html`
- `requests-login.html`
- `js/public-shell.js`
- `css/public-pages-v2.css`
- `tests/auth-surface-parity.test.mjs`
- `README.md`
- `BUMP_NOTES.md`

### Risks / Follow-Ups

- The shared modal now depends on the helper being loaded on every shell entrypoint. Future route additions that use `public-shell.js` need to keep that helper script include or the modal will regress again.
- Restored the standalone `/u/*` profile header brand label to the original text crossfade path with the header title font stack explicitly reapplied on the shared brand-text wrapper, while keeping CSS case transforms disabled and using literal strings `StreamSuites™` and `COMMUNITY HOME`. This removes the fallback-font regression without reintroducing the broken SVG text workaround. No files were created or removed.
- Increased only the default standalone `/u/*` profile header `StreamSuites™` label by about 15% via the default-state span, leaving the `COMMUNITY HOME` hover label size unchanged. No files were created or removed.

## Task 3AA - Public Leaderboards Focused Polish Pass - 2026-05-07

### Technical Notes

- Refined only the existing `/leaderboards` implementation in `js/public-pages-app.js` and `css/public-shell.css`: drawer cards now order Rank, XP, Wallet, Level; the old explanatory fallback copy is removed; the profile CTA and handle occupy the compact left drawer area; and expanded rows now include a full-width, horizontal inventory overview sourced from the leaderboard/profile identity payload when present.
- Replaced the text/chevron expand affordance with the existing `plus.svg` / `minus.svg` icon-mask treatment, removed the leaderboard container dotted pattern, muted the cyan leaderboard-specific accents, and added explicit pagination button typography hooks.
- Replaced the first-place sparkle dots with a scoped premium shimmer/glow treatment that respects reduced-motion preferences, and updated overview cards so Lifetime XP includes the `XP` suffix while Wallet Index uses the same currency-symbol balance component as other economy surfaces.
- Follow-up: fixed the Wallet Index aggregate so it preserves the real leaderboard wallet currency label/symbol metadata instead of rebuilding the total as a generic Credits wallet, and made the Your Standing wallet value inherit the same stat text size as the XP value.
- Extended `tests/public-authority-wiring.test.mjs` to cover the drawer text removal, inventory overview hook, Wallet-before-Level order, plus/minus expand icon path, overview stat formatting, and pagination class hook.

### Human-Readable Notes

- The public leaderboard drawer is denser and more useful: profile action/handle are compact, wallet precedes level, and inventory appears without turning the row into a tall list.
- Leaderboard accents now better match the muted public shell language, the expand button is quieter, the dotted table texture is gone, and the first-place podium effect is less gimmicky.
- Wallet labels now stay consistent between the top Wallet Index card, leaderboard rows, and Your Standing.

### Files / Areas Touched

- `js/public-pages-app.js`
- `css/public-shell.css`
- `tests/public-authority-wiring.test.mjs`
- `BUMP_NOTES.md`

### Risks / Follow-Ups

- The inventory drawer row depends on inventory arrays being present in the leaderboard row or nested identity payload; if runtime does not include inventory on leaderboard entries, the row truthfully shows an empty public inventory state instead of inventing profile data.

## 2026-07-26
- Replaced placeholder changelog content with complete, sectioned release notes for the requested alpha release(s), preserving repository scope boundaries and canonical versioning.
- Added/updated the project-level changelog references to keep multi-repo release notes synchronized and truthful to Runtime/Auth ownership model.
- This change is documentation-only: no runtime, API, auth, package, route, or version-control behavior was modified.
