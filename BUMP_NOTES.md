# Bump Notes

## CURRENT VER= 0.4.2-alpha / PENDING VER= 0.4.8-alpha

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
- The existing `data/changelog.json` entry remains in place for the hydrated public changelog page and is not the GitHub-release markdown artifact.
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
