# StreamSuites-Public

Canonical public StreamSuites surface deployed to Cloudflare Pages at `https://streamsuites.app`.

## Release State

- README state prepared for `v0.4.2-alpha`.
- Runtime-displayed version/build labels are consumed at runtime from `https://admin.streamsuites.app/runtime/exports/version.json`.
- This repo is not a canonical state authority. It renders authoritative runtime exports and Auth API responses.

## Current Surface Model

- Canonical public profiles resolve at `/u/<slug>`, backed by the authoritative public slug model exported by `StreamSuites`.
- Legacy `user_code` compatibility is still preserved during profile resolution and migration-safe routing.
- Clean public artifact routes are supported for clips, polls, and scores via `/clips/<id-or-slug>`, `/polls/<id-or-slug>`, and `/scores/<id-or-slug>`, while legacy detail entry points remain available.
- `/community/settings.html` is the viewer/public account profile settings surface and loads or saves supported authoritative fields through the public profile API.
- Public profiles render dual share behavior truthfully: StreamSuites links always use the canonical slug URL, and FindMeHere links render only when the authoritative payload marks the account eligible and visible there.
- Live badge, live ring, and live profile-banner treatment consume the centralized runtime `live-status` payload.
- `/live` is the dedicated public live view and only lists creators whose StreamSuites public profile is currently eligible and visible.
- Reserved media fields are reflected from the authoritative payload, including cover or banner usage plus reserved `background_image_url`.

## Routing and Runtime Integration

- Cloudflare Pages routing is handled by the root `_redirects` file plus Pages Functions under `functions/`.
- Same-origin auth and API proxy paths forward browser requests to the authoritative Auth API without moving backend ownership into this repo.
- Public auth entry points now consume `/auth/access-state` and the short-lived `/auth/debug/unlock` bypass flow so public pages remain browseable while new auth starts can be gated by runtime mode.
- Route handlers under `functions/clips`, `functions/polls`, `functions/scoreboards`, `functions/scores`, `functions/tallies`, and `functions/u` preserve gallery deep links plus clean artifact and profile routes.
- Public shell/profile code in `js/public-pages-app.js` and `js/public-data-hub.js` consumes the authoritative slug, visibility, FindMeHere eligibility, media, and live-status fields.

## Repository Tree (Abridged, Current)

```text
StreamSuites-Public/
├── BUMP_NOTES.md
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
│   ├── scoreboards/
│   │   └── index.js
│   ├── scores/
│   │   ├── [[artifact]].js
│   │   └── index.js
│   ├── tallies/
│   │   └── index.js
│   └── u/
│       └── [[slug]].js
├── u/
│   └── index.html
├── live/
│   └── index.html
├── login/
│   └── index.html
├── community/
│   ├── index.html
│   ├── members.html
│   ├── notices.html
│   ├── profile.html
│   └── settings.html
├── clips/
│   ├── detail.html
│   └── [sample media files]
├── polls/
│   ├── detail.html
│   └── results.html
├── scoreboards/
│   └── detail.html
├── tallies/
│   └── detail.html
├── data/
│   ├── changelog.json
│   ├── changelog.runtime.json
│   ├── clips.json
│   ├── live-status.json
│   ├── meta.json
│   ├── notices.json
│   ├── polls.json
│   ├── profiles.json
│   ├── roadmap.json
│   ├── scoreboards.json
│   └── tallies.json
├── js/
│   ├── public-data-hub.js
│   ├── public-pages-app.js
│   ├── public-toast.js
│   ├── public-requests.js
│   ├── public-shell.js
│   ├── status-widget.js
│   └── utils/
│       ├── about-data.js
│       ├── version-stamp.js
│       └── versioning.js
├── css/
│   ├── aurora-landing.css
│   ├── public-login.css
│   ├── public-pages-v2.css
│   ├── public-shell.css
│   ├── requests-auth.css
│   ├── requests.css
│   └── status-widget.css
├── assets/
│   ├── css/
│   │   └── ss-profile-hovercard.css
│   ├── fonts/
│   │   └── mono/
│   │       └── SUSEMono-Variable.ttf
│   └── icons/
│       └── ui/
│           ├── clipboard.svg
│           ├── cmdkey.svg
│           ├── filters.svg
│           ├── findmehereicon.svg
│           ├── search.svg
│           ├── sidebar.svg
│           ├── sidebarclose.svg
│           ├── sidebaropen.svg
│           └── streamsuitesicon.svg
├── _redirects
├── 404.html
├── about.html
├── auth-bridge.html
├── index.html
├── public-auth-complete.html
├── public-login.html
├── requests-auth-complete.html
├── requests-login.html
├── requests.html
└── README.md
```
