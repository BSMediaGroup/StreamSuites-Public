# StreamSuites-Public
Public StreamSuites™ website repository.

## Purpose
- Hosts the public-only StreamSuites website served from the repository root (no authentication logic lives here).
- Deployed via GitHub Pages to https://streamsuites.app (public, unauthenticated surface).
- Public, static surface that consumes runtime exports for read-only displays and does not mutate state.
- Does not define version or build numbers locally; version/build are provided by runtime exports.
- Does not host the Admin or Creator dashboards (those live in separate repos/apps).
- Links to Creator and Admin login surfaces via the auth API (https://api.streamsuites.app/auth/login/google?surface=creator and https://api.streamsuites.app/auth/login/google|github?surface=admin) using absolute URLs.
- Loads CSS, JS, and static assets with root-absolute paths (for example: `/css/theme-dark.css`, `/js/public-data.js`, `/assets/logos/logo.png`).
- Stores all CSS, JS, and static assets locally in this repository (no cross-repo or external asset hosting).
- Fetches public version/build metadata from runtime exports at `/runtime/exports/version.json` (single source of truth).

## Repo Structure:
```
StreamSuites-Public/
├── CNAME
├── COMMERCIAL-LICENSE-NOTICE.md
├── EULA.md
├── LICENSE
├── index.html
├── clips.html
├── polls.html
├── scoreboards.html
├── tallies.html
├── changelog.html
├── about.html
├── tools.html
├── support.html
├── privacy.html
├── accessibility.html
├── postmortem.html
├── README.md
├── about/
│   ├── about.manifest.json
│   ├── about_part1_core.json
│   ├── about_part2_platforms_interfaces.json
│   └── about_part3_about_system_spec.json
├── clips/
│   └── detail.html
├── polls/
│   ├── detail.html
│   └── results.html
├── scoreboards/
│   └── detail.html
├── tallies/
│   └── detail.html
├── js/
│   ├── public-*.js
│   ├── changelog-merge.js
│   └── utils/
│       ├── about-data.js
│       ├── versioning.js
│       └── version-stamp.js
├── css/
│   ├── base.css
│   ├── components.css
│   ├── layout.css
│   ├── overrides.css
│   ├── public-pages.css
│   ├── theme-dark.css
│   └── updates.css
├── data/
│   ├── changelog.json
│   ├── changelog.runtime.json
│   ├── clips.json
│   ├── meta.json
│   ├── polls.json
│   ├── roadmap.json
│   ├── scoreboards.json
│   └── tallies.json
├── assets/
│   ├── backgrounds/
│   ├── icons/
│   ├── logos/
│   └── placeholders/
└── favicon.ico
```
