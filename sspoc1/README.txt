StreamSuites Landing Page POC — Option 1: Studio Command Center

Direction
A Studio-first, product-led public landing page that positions Browser Studio,
StudioApp, and Studio for OBS as the production core. Runtime/Auth is shown as
the shared authority, while automation, engagement, alerts, public artifacts,
and the other web surfaces are presented as connected capabilities.

Files
- index.html: complete proof-of-concept page
- styles.css: responsive visual system
- app.js: product switcher, ecosystem preview, mobile navigation, notice dismissal, and reveal motion
- assets/: StreamSuites wordmark plus existing Public/Creator interface previews
- previews/: rendered desktop, mobile, and full-page reference images

Run
Open index.html directly, or serve this directory with any static HTTP server.
Example: python -m http.server 8080

Scope
This is a visual and interaction proof of concept. It does not replace or alter
the live authentication modal, access-gate enforcement, Runtime/Auth
integrations, version hydration, production routes, or existing repository
files. Production implementation must preserve those contracts explicitly.
