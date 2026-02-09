# StreamSuites-Public
Public StreamSuites™ website repository.

## Overview
- **Static public marketing surface:** this repository contains the public-facing, unauthenticated StreamSuites website only.
- **GitHub Pages deployment:** the site is deployed via GitHub Pages from the repository root.
- **Read-only repository:** this repo is read-only and consumes **runtime-exported data only** (no local source of truth).

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

## Repository Must Not
- **No state mutation:** this repo must not create, update, or delete backend data.
- **No version authority:** version/build data is owned by runtime exports, not this repo.
- **No backend logic:** no server-side processing, APIs, or authenticated workflows live here.

## Repo Structure
```
StreamSuites-Public/
├── about
│   ├── about.manifest.json
│   ├── about_part1_core.json
│   ├── about_part2_platforms_interfaces.json
│   └── about_part3_about_system_spec.json
├── assets
│   ├── backgrounds
│   │   ├── .gitkeep
│   │   ├── seodash.jpg
│   │   ├── seodashxS1.png
│   │   ├── seoshare.jpg
│   │   ├── SS-YTBANNER-01.png
│   │   └── STSS-RUMBLEBANNER-01.png
│   ├── fonts
│   │   ├── Recharge-Bold.otf
│   │   └── SuiGeneris-Regular.otf
│   ├── icons
│   │   ├── .gitkeep
│   │   ├── adminhex.ico
│   │   ├── adminx.ico
│   │   ├── bk-favicon.ico
│   │   ├── blu-buph8wYp_400x400.ico
│   │   ├── browser-extension.svg
│   │   ├── buph8wYp_400x400.ico
│   │   ├── dcbadge.svg
│   │   ├── discord-0.svg
│   │   ├── discord-muted.svg
│   │   ├── discord-silver.svg
│   │   ├── discord-white.svg
│   │   ├── discord.svg
│   │   ├── favicon.ico
│   │   ├── favicon1.ico
│   │   ├── github-0.svg
│   │   ├── github-muted.svg
│   │   ├── github-silver.svg
│   │   ├── github-white.svg
│   │   ├── github.svg
│   │   ├── google-0.svg
│   │   ├── google-muted.svg
│   │   ├── google-silver.svg
│   │   ├── google-white.svg
│   │   ├── google.svg
│   │   ├── kick-0.svg
│   │   ├── kick-muted.svg
│   │   ├── kick-silver.svg
│   │   ├── kick-white.svg
│   │   ├── kick.svg
│   │   ├── LOG2TRIM.ico
│   │   ├── logoshield-white.ico
│   │   ├── mod.svg
│   │   ├── newcon.ico
│   │   ├── newconx.ico
│   │   ├── obs-0.svg
│   │   ├── obs-silver.svg
│   │   ├── obs-white.svg
│   │   ├── obs.svg
│   │   ├── pilled-0.svg
│   │   ├── pilled-muted.svg
│   │   ├── pilled-silver.svg
│   │   ├── pilled-white.svg
│   │   ├── pilled.svg
│   │   ├── prossuser.svg
│   │   ├── prouser.svg
│   │   ├── pu-favicon.ico
│   │   ├── red-favicon.ico
│   │   ├── rumble-0.svg
│   │   ├── rumble-muted.svg
│   │   ├── rumble-silver.svg
│   │   ├── rumble-white.svg
│   │   ├── rumble.svg
│   │   ├── studioconmain.ico
│   │   ├── Thumbs.db
│   │   ├── twitch-0.svg
│   │   ├── twitch-muted.svg
│   │   ├── twitch-silver.svg
│   │   ├── twitch-white.svg
│   │   ├── twitch.svg
│   │   ├── twitter-0.svg
│   │   ├── twitter-muted.svg
│   │   ├── twitter-silver.svg
│   │   ├── twitter-square-0.svg
│   │   ├── twitter-square-muted.svg
│   │   ├── twitter-square-silver.svg
│   │   ├── twitter-square-white.svg
│   │   ├── twitter-square.svg
│   │   ├── twitter-white.svg
│   │   ├── twitter.svg
│   │   ├── ui
│   │   │   ├── admin.svg
│   │   │   ├── api.svg
│   │   │   ├── automation.svg
│   │   │   ├── bot.svg
│   │   │   ├── brick.svg
│   │   │   ├── browser.svg
│   │   │   ├── cards.svg
│   │   │   ├── clickpoint.svg
│   │   │   ├── codeblock.svg
│   │   │   ├── cog.svg
│   │   │   ├── dashboard.svg
│   │   │   ├── dashgear.svg
│   │   │   ├── devices.svg
│   │   │   ├── emoji.svg
│   │   │   ├── extension.svg
│   │   │   ├── globe.svg
│   │   │   ├── identity.svg
│   │   │   ├── inputs.svg
│   │   │   ├── joystick.svg
│   │   │   ├── memory.svg
│   │   │   ├── options.svg
│   │   │   ├── package.svg
│   │   │   ├── pc.svg
│   │   │   ├── plus.svg
│   │   │   ├── portal.svg
│   │   │   ├── profile.svg
│   │   │   ├── send.svg
│   │   │   ├── settingsquare.svg
│   │   │   ├── sidebar.svg
│   │   │   ├── storage.svg
│   │   │   ├── switch.svg
│   │   │   ├── terminal.svg
│   │   │   ├── tune.svg
│   │   │   ├── ui.svg
│   │   │   ├── uiscreen.svg
│   │   │   ├── webhook.svg
│   │   │   ├── widget.svg
│   │   │   └── windows.svg
│   │   ├── white-favicon.ico
│   │   ├── win1.ico
│   │   ├── x.svg
│   │   ├── youtube-0.svg
│   │   ├── youtube-muted.svg
│   │   ├── youtube-silver.svg
│   │   ├── youtube-white.svg
│   │   └── youtube.svg
│   ├── illustrations
│   │   └── .gitkeep
│   ├── logos
│   │   ├── admingold.png
│   │   ├── admingold.webp
│   │   ├── adminredshield.png
│   │   ├── adminredshield.webp
│   │   ├── adminshieldcon.ico
│   │   ├── adminshieldcon.png
│   │   ├── adminshieldcon.webp
│   │   ├── adminshieldcongold.png
│   │   ├── adminshieldcongold.webp
│   │   ├── adminx.ico
│   │   ├── adminx.png
│   │   ├── adminx.webp
│   │   ├── bsmgx.png
│   │   ├── bsmgx.svg
│   │   ├── bsmgy.png
│   │   ├── bsmgy.svg
│   │   ├── dclive.svg
│   │   ├── dcliveblack.png
│   │   ├── dcliveblack.svg
│   │   ├── dcx.svg
│   │   ├── docscon.png
│   │   ├── docscon3d.ico
│   │   ├── docscon3d.png
│   │   ├── docscon3d.webp
│   │   ├── LOG2-3D-SML.png
│   │   ├── LOG2-3D.png
│   │   ├── LOG2TRIM-SML.png
│   │   ├── LOG2TRIM.png
│   │   ├── loghealth-green.png
│   │   ├── loghealth-red.png
│   │   ├── loghealth-yellow.png
│   │   ├── logo-old.png
│   │   ├── logo.png
│   │   ├── logocircle.png
│   │   ├── logocircle.svg
│   │   ├── logoshield-gold.ico
│   │   ├── logoshield-gold.png
│   │   ├── logoshield-white.ico
│   │   ├── logoshield-white.png
│   │   ├── logoshield-white3dx.png
│   │   ├── logoshield-white3dx.webp
│   │   ├── logoshield-whitex.webp
│   │   ├── logoshield.png
│   │   ├── logoshield.svg
│   │   ├── pubcon.ico
│   │   ├── pubcon.png
│   │   ├── pubcon.webp
│   │   ├── seodash.jpg
│   │   ├── ssblueshield.png
│   │   ├── ssblueshield.webp
│   │   ├── sscmatte.ico
│   │   ├── sscmatte.png
│   │   ├── sscmatte.webp
│   │   ├── sscmatte2.webp
│   │   ├── sscmatteblue.png
│   │   ├── sscmatteblue.webp
│   │   ├── sscmattegold.png
│   │   ├── sscmattegold.webp
│   │   ├── sscmattepfp.png
│   │   ├── sscmattepfpdark.png
│   │   ├── sscmattepurple.png
│   │   ├── sscmattered.png
│   │   ├── sscmattered.webp
│   │   ├── sscmattesilver.ico
│   │   ├── sscmattesilver.png
│   │   ├── sscmattesilver.webp
│   │   ├── sscmattex.ico
│   │   ├── sscmattex.png
│   │   ├── ssconchrome.ico
│   │   ├── ssconchrome.png
│   │   ├── ssconchrome.webp
│   │   ├── ssconchromeblue.ico
│   │   ├── ssconchromeblue.png
│   │   ├── ssconchromeblue.webp
│   │   ├── ssicon.png
│   │   ├── ssicon.webp
│   │   ├── ssnewcon.ico
│   │   ├── ssnewcon.webp
│   │   ├── ssnewfavicon.ico
│   │   ├── ssnewfavicon.png
│   │   ├── sspfpbluechrome.png
│   │   ├── sspfpchrome.png
│   │   ├── sswm.png
│   │   ├── ssxshieldblack.ico
│   │   ├── ssxshieldblack.png
│   │   ├── ssxshieldblack.webp
│   │   ├── ssxshieldblue.ico
│   │   ├── ssxshieldblue.png
│   │   ├── ssxshieldblue.webp
│   │   ├── ssxshieldred.ico
│   │   ├── ssxshieldred.png
│   │   ├── ssxshieldred.webp
│   │   ├── ssxshieldsilver.ico
│   │   ├── ssxshieldsilver.png
│   │   ├── ssxshieldsilver.webp
│   │   ├── streamsuites.svg
│   │   ├── studioconmain.ico
│   │   ├── xbsmgmainx1.png
│   │   ├── xbsmgmainx1.svg
│   │   ├── xbsmgshield.png
│   │   ├── xbsmgshield.svg
│   │   ├── xbsmgy.png
│   │   └── xbsmgy.svg
│   └── placeholders
│       ├── .gitkeep
│       ├── daniel.png
│       ├── hotdog.jpg
│       └── streamsuites.jpg
├── clips
│   └── detail.html
├── css
│   ├── aurora-landing.css
│   ├── base.css
│   ├── components.css
│   ├── donate.css
│   ├── layout.css
│   ├── overrides.css
│   ├── public-pages.css
│   ├── public-pages-v2.css
│   ├── status-widget.css
│   ├── theme-dark.css
│   └── updates.css
├── data
│   ├── changelog.json
│   ├── changelog.runtime.json
│   ├── clips.json
│   ├── meta.json
│   ├── polls.json
│   ├── roadmap.json
│   ├── scoreboards.json
│   └── tallies.json
├── js
│   ├── changelog-merge.js
│   ├── clip-detail.js
│   ├── clips.js
│   ├── poll-detail.js
│   ├── public-about.js
│   ├── public-changelog.js
│   ├── public-clips.js
│   ├── public-data.js
│   ├── public-donate.js
│   ├── public-polls.js
│   ├── public-roadmap.js
│   ├── public-tallies.js
│   ├── status-widget.js
│   ├── tally-detail.js
│   └── utils
│       ├── about-data.js
│       ├── version-stamp.js
│       └── versioning.js
├── polls
│   ├── detail.html
│   └── results.html
├── scoreboards
│   └── detail.html
├── tallies
│   └── detail.html
├── .gitignore
├── about.html
├── accessibility.html
├── bg-poc.html
├── changelog.html
├── clips.html
├── CNAME
├── COMMERCIAL-LICENSE-NOTICE.md
├── donate-cancel.html
├── donate-success.html
├── donate.html
├── EULA.md
├── favicon.ico
├── index.html
├── index-old.html
├── LICENSE
├── media.html
├── polls.html
├── postmortem.html
├── privacy.html
├── README.md
├── scoreboards.html
├── support.html
├── tallies.html
├── terms.html
└── tools.html
```

## README Update Notes
- Updated the overview to clarify the static, GitHub Pages deployment from the repository root, and the read-only/runtime-exported data-only scope.
- Added explicit non-responsibilities (no state mutation, no version authority, no backend logic) to prevent scope creep.
- Replaced the repo tree with a complete, current listing of files and directories.
