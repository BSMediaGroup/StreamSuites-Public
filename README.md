# StreamSuites-Public
Public StreamSuites™ website repository.

## Purpose
- Hosts the public StreamSuites website.
- Deployed via GitHub Pages to https://streamsuites.app.
- Consumes runtime exports for read-only displays and does not mutate state.
- Links to the Creator dashboard at https://creator.streamsuites.app and the Admin dashboard at https://admin.streamsuites.app using absolute URLs.
- Loads CSS, JS, and static assets with root-absolute paths (for example: `/css/theme-dark.css`, `/js/public-data.js`, `/assets/logos/logo.png`).
- Fetches public version/build metadata from the Admin dashboard at https://admin.streamsuites.app/version.json (this public repo does not host `version.json`).

## Repo Structure:
```
StreamSuites-Public/
├── index.html
├── clips.html
├── polls.html
├── scoreboards.html
├── tallies.html
├── changelog.html
├── about.html
├── privacy.html
├── accessibility.html
├── postmortem.html
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
│   └── utils/
│       ├── versioning.js
│       └── version-stamp.js
├── css/
│   └── public-pages.css
├── data/
│   └── *.json
├── assets/
│   ├── backgrounds/
│   ├── logos/
│   └── placeholders/
└── favicon.ico
```
