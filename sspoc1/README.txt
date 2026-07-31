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

Typography milestone
The approved local typography roles are:
- Display/title: Tektur for the hero, major section headings, product-family
  titles, prominent product names, architecture titles, and closing statements.
- Body/UI: Geist Sans for paragraphs, navigation, ordinary controls, links,
  card copy, forms, labels, and mobile navigation.
- Technical/system: IBM Plex Mono for status, runtime/media labels, room and
  output values, architecture metadata, technical indexes, and footer state.

Local font delivery
All font files were copied without conversion from:
C:\NEPTUNE LOCAL\GIT\StreamSuites-Studio\assets\fonts\

- Tektur-VariableFont_wdth,wght.ttf: variable upright face; CSS weight
  400-900; width 75%-100%.
- Geist-Light.ttf, Geist-Regular.ttf, Geist-Medium.ttf,
  Geist-SemiBold.ttf, Geist-Bold.ttf, Geist-ExtraBold.ttf: static upright
  faces; CSS weights 300, 400, 500, 600, 700, and 800.
- IBMPlexMono-Light.ttf, IBMPlexMono-Regular.ttf, IBMPlexMono-Medium.ttf,
  IBMPlexMono-SemiBold.ttf, IBMPlexMono-Bold.ttf: static upright faces copied
  from the source mono\ directory; CSS weights 300, 400, 500, 600, and 700.

Copied licenses:
- assets\licenses\GEISTMONOOFL.txt
- assets\licenses\IBMPLEXMONOOFL.txt

The local Tektur README refers to OFL.txt, but no Tektur OFL.txt was present in
any listed StreamSuites font source. No unrelated license was relabelled or
copied as a Tektur license; that packaging uncertainty remains explicit.

Fallback stacks
- Display: Tektur, Geist Sans, Segoe UI Variable, Segoe UI, system-ui,
  sans-serif.
- Body/UI: Geist Sans, Segoe UI Variable, Segoe UI, system-ui, sans-serif.
- Technical/system: IBM Plex Mono, Cascadia Mono, Consolas, Menlo, Monaco,
  monospace.

Text-density decisions
Body copy uses zero tracking and 1.5-1.75 line height. Display headings use
-0.015em tracking and genuine 600 weight. Navigation uses 500 at 0.035em;
ordinary buttons use 600 at 0.045em. Uppercase system/status labels use IBM
Plex Mono at 400-600 with approximately 0.05em-0.10em tracking. Existing visible
wording and casing were preserved.

Typography previews
- previews\StreamSuites-Landing-POC-Option-1-Typography-Desktop.png
  (1600 x 1000)
- previews\StreamSuites-Landing-POC-Option-1-Typography-Mobile.png
  (390 x 844)
- previews\StreamSuites-Landing-POC-Option-1-Typography-Full.png
  (full desktop page)

Validation run
- C:\Python311\python.exe -m http.server 8765 --bind 127.0.0.1
- node --check app.js
- Python html.parser feed/close check for index.html
- PowerShell local href/src/CSS-url existence check: 48 references, 0 missing
- Installed Chrome through the provided Playwright browser runtime at
  1600 x 1000 and 390 x 844, including computed font roles and weights,
  local font responses, console/page errors, horizontal overflow, text
  clipping, product tabs, Creator/Public switching, alpha dismissal, mobile
  navigation, keyboard product selection, full-page scrolling, and captures
- Delayed-font check with a 250 ms local TTF delay: content and CTA remained
  usable through the fallback phase; fonts completed and no horizontal
  overflow appeared

This remains a visual and interaction prototype. It contains no production
authentication behavior.
