# StreamSuites-Public
Public StreamSuites™ website repository.

## Purpose
- Hosts the public StreamSuites website.
- Deployed via GitHub Pages to https://streamsuites.app.
- Consumes runtime exports for read-only displays and does not mutate state.
- Links to the Creator dashboard at https://creator.streamsuites.app and the Admin dashboard at https://admin.streamsuites.app using absolute URLs.

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
│   └── public-*.js
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
