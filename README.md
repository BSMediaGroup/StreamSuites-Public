# StreamSuites-Public
Public StreamSuites web surface (static GitHub Pages site).

## Current Release
- Public surface target: `v0.4.1-alpha`.
- `index.html`, `requests.html`, and `404.html` are stamped `v0.4.1-alpha`.
- Runtime-displayed version/build labels are fetched at runtime from:
  - `https://admin.streamsuites.app/runtime/exports/version.json` (see `js/utils/versioning.js`).

## Scope
- This repo serves the static public site at `https://streamsuites.app` (GitHub Pages from repository root with custom domain via `CNAME`).
- This repo is not a canonical state authority. It renders runtime-exported artifacts/JSON and API responses.
- Canonical state is authored outside this repo (runtime/admin services).

## Public Surface Behavior
- Static pages and assets are shipped from this repository root.
- Public galleries and metadata views hydrate from exported JSON artifacts (for example files in `/data` plus runtime version export).
- Feature Requests (`requests.html`) includes authenticated creator flows backed by `api.streamsuites.app` (fetch/vote/comment/submit). This is UI-only client integration; no backend logic is hosted here.

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
  - Auth-aware top-right user widget in the media/community shell (`js/public-shell.js`, `js/public-pages-app.js`).
- Lightweight public-page visit reporting:
  - Shared visit instrumentation now reports non-blocking page-load beacons from the public site to the authoritative runtime/Auth API via `js/status-widget.js`.
  - The public repo remains non-authoritative; visit events are only forwarded for runtime-owned alerting and short-window counters.

## Repository Tree (Abridged, Current)
```text
StreamSuites-Public/
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
