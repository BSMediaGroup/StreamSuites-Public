# Bump Notes

## RELEASED / PACKAGED: 0.4.2-alpha

Packaged / released and no longer the active pending bucket. Preserve new notes for the open `0.4.8-alpha` section below.

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

### Technical Notes

- Pending entries for `0.4.8-alpha` go here.

### Human-Readable Notes

- Pending entries for `0.4.8-alpha` go here.

### Files / Areas Touched

- Pending entries for `0.4.8-alpha` go here.

### Risks / Follow-Ups

- Pending entries for `0.4.8-alpha` go here.
