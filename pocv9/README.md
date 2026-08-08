# StreamSuites Landing Motion POC — pocv9

This revision is intended to live at `{StreamSuites-Public repo root}/pocv9/`. Its asset references deliberately use `../assets/...` so it reuses the real repository assets without duplicating them.

Key final-refinement changes: file://-safe normal image icons in the hero mocks, output gradient flush to the stage border, native StudioApp solo-stream mock with its own comment state, OBS preview expanded to the same frame geometry as the Studio previews, and a resized/clipped two-row Public Clips mock with a StreamSuites S header mark.

# StreamSuites™ Landing Motion Enhancement POC — Revision 5

Revision 5 keeps the accepted cinematic motion system and four-corner Runtime/Auth topology from Revision 4, then updates only the two areas requested for final POC approval:

1. the architecture route geometry now leaves the Runtime/Auth card from its left/right sides with looser cubic curves into the four corner nodes; and
2. the hero product preview is rebuilt from the current live landing-page Studio Command Center baseline and expanded to four states.

No production repository is modified by this standalone POC.

## Hero baseline

The hero retains the current live landing composition: Browser Studio, StudioApp, and Studio for OBS tabs above the large product preview, followed by the current product caption. Revision 5 adds a fourth **Public Shell** tab while keeping the Browser Studio and StudioApp states on the same production-workspace geometry.

### Browser Studio

- Same Studio Command Center workspace structure as the current live landing page.
- Blue accent system.
- Top-right preview state is an illustrative green pulsing **LIVE NOW** state.
- Mock left sidebar uses real StreamSuites SVG UI assets instead of numeric prefixes.
- Destinations flyout is expanded to show Rumble, YouTube, Twitch, Twitter (X), and Kick using the existing full-colour platform SVGs.
- Room Activity and Browser Media flyouts use real UI SVG assets.
- MIC, Desktop, and Master meters now show separate L/R stereo channels.

### StudioApp

- Reuses the same Studio workspace geometry and all Browser Studio refinements.
- Lime/native product accent.
- Native title, engine state, and supervised C++ media label.
- Illustrative LIVE NOW state retained for visual parity with the Browser Studio mock.

### Studio for OBS

The earlier generic Studio-workspace substitution is replaced with an OBS-specific bridge visualization based on the current production OBS Plugin download-page diagram:

- Runtime/Auth control-plane rail;
- authorized ingress node;
- bounded bridge signal;
- OBS-owned output node;
- explicit `NO DUPLICATE MEDIA ENGINE` footer.

This visually reinforces that OBS owns scenes, mixing, encoding, recording, and output.

### Public Shell

A new gold-accented fourth tab represents the current public application shell using the Clips page as the visual reference:

- compact StreamSuites Public sidebar;
- Clips selected;
- Polls, Wheels, Leaderboards, Tallies, Games & Economy;
- Browser Studio, StudioApp, and Studio for OBS links;
- Clips topbar/search treatment;
- three representative clip cards;
- gold product-tab / preview-edge treatment while preserving the cooler Public-shell interior styling.

The Public state is a downstream Runtime/Auth-backed surface, not another media owner.

## Architecture topology correction

The four cards remain evenly distributed around Runtime/Auth:

- top-left: Browser Studio / blue;
- top-right: Public Surfaces / gold;
- bottom-left: StudioApp / lime;
- bottom-right: Studio for OBS / violet.

Revision 5 changes the route geometry so signals no longer appear stretched from top/bottom ports. Instead:

- Browser and StudioApp leave the left side of Runtime/Auth at upper/lower side anchors;
- Public and OBS leave the right side at upper/lower side anchors;
- each route bows outward before arriving gracefully at the appropriate near corner of the destination card;
- the semantic travelling halo/spark/packet animation continues to follow the exact connector path.

The connector geometry is recalculated from rendered card positions on resize.

## Current production assets referenced by the isolated POC

The standalone POC intentionally references current production assets rather than redistributing the repository font package or duplicating the complete asset tree.

Key references include:

- `assets/icons/rumble.svg`
- `assets/icons/youtube.svg`
- `assets/icons/twitch.svg`
- `assets/icons/twitter.svg`
- `assets/icons/kick.svg`
- existing `/assets/icons/ui/*` shell icons
- `assets/icons/obs-white.svg`
- current StreamSuites logo files

The later Codex implementation should use the existing repo-local paths directly.

## Run

Serve the POC folder:

```text
python -m http.server 8080
```

Then open:

```text
http://127.0.0.1:8080/
```

POC-only query helpers are available for quick state review:

```text
?preview=browser
?preview=native
?preview=obs
?preview=public
```

## Validation performed in this environment

- HTML parsed successfully.
- Exactly one `h1`.
- No duplicate IDs.
- Four product tabs are present.
- Three preview canvases are present: shared Studio, OBS-specific, and Public-specific.
- JavaScript passes `node --check`.
- CSS brace balance passes.
- The five requested platform SVG paths were verified against the current GitHub repository.
- Current OBS visual structure and Public shell navigation were reviewed from the current GitHub source before implementation.
- No production files were modified.

The container's Chromium binary does not complete screenshot-mode execution in this session even for a trivial data URL, so this revision does **not** claim a fresh browser-render screenshot or responsive interaction run from this environment. The source remains the artifact for review; the later local Codex pass must run the repository's normal browser validation before production implementation is accepted.

## Typography

Unchanged:

- **Tektur** — display/product titles.
- **Geist Sans** — body/UI.
- **IBM Plex Mono** — system/status/technical metadata.

## Production boundary

This remains a standalone design POC. It does not implement or replace production Auth, access gating, Turnstile, Runtime/Auth calls, version/status hydration, Cloudflare routing, download manifests, or other production contracts.


## Revision 7 corrections

- Restores the exact current live landing icon system for Browser Studio, StudioApp, OBS, and the mock header StreamSuites S mark.
- Uses repo-local `../assets/...` references so the supplied local placeholder images resolve when this POC lives under the StreamSuites-Public checkout.
- Uses `scenes.svg` for Scenes and `media.svg` for Sources.
- Uses `destinations-filled.svg` and `cast.svg` for the two requested feature cards.
- Adds `livecommenter1.webp` as Bubble Bob's avatar.
- Adds an explicit dark gradient inside the mock livestream output safe area.
- Replaces the Runtime/Auth topology traces with single smooth symmetric quadratic arcs.
