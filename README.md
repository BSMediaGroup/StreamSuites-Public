# StreamSuites-Public
Public StreamSuites web surface (static Cloudflare Pages site).

## Current Release
- Public surface target: `v0.4.1-alpha`.
- `index.html`, `requests.html`, and `404.html` are stamped `v0.4.1-alpha`.
- Runtime-displayed version/build labels are fetched at runtime from:
  - `https://admin.streamsuites.app/runtime/exports/version.json` (see `js/utils/versioning.js`).

## Scope
- This repo serves the canonical static public site at `https://streamsuites.app` on Cloudflare Pages.
- This repo is not a canonical state authority. It renders runtime-exported artifacts/JSON and API responses.
- Canonical state is authored outside this repo (runtime/admin services).
- This repo now owns the canonical standalone public profile route foundation at `/u/<slug>`, backed by the authoritative public slug model exported by `StreamSuites`, while retaining migration-safe legacy `user_code` compatibility in community/profile resolution.
- Canonical public profiles now consume the authoritative StreamSuites profile surface model for visibility, StreamSuites vs FindMeHere eligibility, canonical share URLs, and reserved profile media fields (`cover`/`banner`, reserved `background`).

## Public Surface Behavior
- Static pages and assets are shipped from this repository root.
- Public galleries and metadata views hydrate from exported JSON artifacts (for example files in `/data` plus runtime version export).
- Feature Requests (`requests.html`) includes authenticated creator flows backed by `api.streamsuites.app` (fetch/vote/comment/submit). This is UI-only client integration; no backend logic is hosted here.
- Standalone public profiles now resolve on the canonical site via `/u/<slug>`, with slug-first lookup, legacy `user_code` fallback during migration, and Cloudflare Pages rewrite/function support that preserves deep links.
- Public artifact detail links now canonicalize to clean routes at `/clips/<id-or-slug>`, `/polls/<id-or-slug>`, and `/scores/<id-or-slug>`, while legacy `detail.html?id=...` entrypoints remain migration-safe and client-canonicalize to the clean route where applicable.
- Canonical public profile rendering now trusts the authoritative exported profile/account fields from `StreamSuites` for:
  - `streamsuites_profile_enabled|eligible|visible|status_reason`
  - `findmehere_enabled|eligible|visible|profile_url|share_url|status_reason`
  - `creator_capable`, `viewer_only`, and `public_surface_account_type`
  - `cover_image_url`, `banner_image_url`, and reserved `background_image_url`
- On `https://streamsuites.app/u/<slug>`, StreamSuites share links always use the canonical slug URL and FindMeHere share links only render when the authoritative export says the account is eligible/listed there.
- `/community/settings.html` now provides a real viewer/public account profile settings surface backed by `api.streamsuites.app/api/public/profile/me`, including authoritative StreamSuites profile visibility, canonical URL preview, profile media/link fields already supported by the backend, and truthful FindMeHere creator-only upgrade messaging.

## What Is New (v0.4.1-alpha surface)
- Aurora landing experience and refreshed layout shell (`index.html`, `css/aurora-landing.css`).
- Branded public `404.html` aligned to the landing visual language.
- Footer status widget integration (`js/status-widget.js`, `css/status-widget.css`) with external Statuspage summary.
- Requests surface upgrades:
  - Dedicated auth bridge/login completion pages (`auth-bridge.html`, `requests-login.html`, `requests-auth-complete.html`).
  - Updated requests layout/styling (`css/public-pages-v2.css`, `css/requests.css`, `css/requests-auth.css`).
  - Public voting and creator-auth comment/submit flows in `js/public-requests.js`.
- Public account auth upgrades:
  - Dedicated public login/complete pages (`public-login.html`, `public-auth-complete.html`).
  - Public login assets (`css/public-login.css`, `js/public-login.js`, `js/public-auth-complete.js`).
  - Cloudflare Pages auth/API proxy routes now forward public auth/session traffic from same-origin `streamsuites.app` function paths to the authoritative Auth API, avoiding direct browser-side cross-origin login/session hops during the Pages deployment model.
  - Auth-aware top-right user widget in the media/community shell (`js/public-shell.js`, `js/public-pages-app.js`).
  - Viewer/public account settings now expose real StreamSuites profile controls in `community/settings.html`, with save/load wiring in `js/public-pages-app.js` and supporting styles in `css/public-shell.css`.
- Lightweight public-page visit reporting:
  - Shared visit instrumentation now reports non-blocking page-load beacons from the public site to the authoritative runtime/Auth API via `js/status-widget.js`.
  - The public repo remains non-authoritative; visit events are only forwarded for runtime-owned alerting and short-window counters.

## Repository Tree (Abridged, Current)
```text
StreamSuites-Public/
├── functions/
│   ├── _shared/
│   │   ├── artifact-route.js
│   │   └── auth-api-proxy.js
│   ├── api/
│   │   └── [[path]].js
│   ├── auth/
│   │   └── [[path]].js
│   ├── clips/
│   │   ├── [[artifact]].js
│   │   └── index.js
│   ├── oauth/
│   │   └── [[path]].js
│   ├── polls/
│   │   ├── [[artifact]].js
│   │   └── index.js
│   ├── scores/
│   │   ├── [[artifact]].js
│   │   └── index.js
│   └── u/
│       └── [[slug]].js
├── u/
│   └── index.html
├── about/
│   ├── about.manifest.json
│   ├── about_part1_core.json
│   ├── about_part2_platforms_interfaces.json
│   └── about_part3_about_system_spec.json
├── assets/
│   ├── css/
│   │   └── ss-profile-hovercard.css
│   ├── js/
│   │   └── ss-profile-hovercard.js
│   └── [truncated: backgrounds/, fonts/, icons/, illustrations/, logos/, placeholders/, and root asset files]
├── clips/
│   ├── detail.html
│   ├── sampleclip00.mp4
│   ├── sampleclip01.mp4
│   ├── sampleclip02.mp4
│   ├── sampleclip03.mp4
│   ├── sampleclip04.mp4
│   ├── sampleclip05.mp4
│   └── samplewebm.webm
├── community/
│   ├── index.html
│   ├── members.html
│   ├── notices.html
│   ├── profile.html
│   └── settings.html
├── css/
│   ├── aurora-landing.css
│   ├── base.css
│   ├── components.css
│   ├── donate.css
│   ├── layout.css
│   ├── overrides.css
│   ├── public-pages.css
│   ├── public-pages-v2.css
│   ├── public-login.css
│   ├── public-shell.css
│   ├── requests-auth.css
│   ├── requests.css
│   ├── status-widget.css
│   ├── theme-dark.css
│   └── updates.css
├── data/
│   ├── changelog.json
│   ├── changelog.runtime.json
│   ├── clips.json
│   ├── meta.json
│   ├── notices.json
│   ├── polls.json
│   ├── profiles.json
│   ├── roadmap.json
│   ├── scoreboards.json
│   └── tallies.json
├── js/
│   ├── changelog-merge.js
│   ├── clip-detail.js
│   ├── clips.js
│   ├── poll-detail.js
│   ├── public-about.js
│   ├── public-changelog.js
│   ├── public-clips.js
│   ├── public-data.js
│   ├── public-data-hub.js
│   ├── public-donate.js
│   ├── public-pages-app.js
│   ├── public-auth-complete.js
│   ├── public-login.js
│   ├── public-polls.js
│   ├── public-requests.js
│   ├── public-roadmap.js
│   ├── public-shell.js
│   ├── public-tallies.js
│   ├── status-widget.js
│   ├── tally-detail.js
│   └── utils/
│       ├── about-data.js
│       ├── version-stamp.js
│       └── versioning.js
├── login/
│   └── index.html
├── polls/
│   ├── detail.html
│   └── results.html
├── scoreboards/
│   └── detail.html
├── tallies/
│   └── detail.html
├── .gitignore
├── _redirects
├── 404.html
├── about.html
├── accessibility.html
├── auth-bridge.html
├── changelog.html
├── clips.html
├── CNAME
├── COMMERCIAL-LICENSE-NOTICE.md
├── donate-cancel.html
├── donate-success.html
├── donate.html
├── EULA.md
├── favicon.ico
├── index-old.html
├── index.html
├── LICENSE
├── login.html
├── media.html
├── polls.html
├── postmortem.html
├── privacy.html
├── resources.html
├── public-auth-complete.html
├── public-login.html
├── README.md
├── requests-auth-complete.html
├── requests-login.html
├── requests.html
├── scoreboards.html
├── status-check.html
├── stats.html
├── support.html
├── tallies.html
├── terms.html
├── Thumbs.db
└── tools.html
```
