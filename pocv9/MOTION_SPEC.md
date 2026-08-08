# Revision 5 motion / topology specification

## Preserve

- Existing hero horizon, particle field, constellation paths, grid plane, and restrained parallax.
- Existing card-edge lighting and scroll reveals.
- Existing four-corner architecture node arrangement.
- Existing semantic route colours: Browser blue, StudioApp lime, OBS violet, Public gold.
- Existing `prefers-reduced-motion` behaviour.

## Architecture connector geometry

The Runtime/Auth core is the origin. Do not route from four top/bottom ports.

Use side anchors:

- Browser: upper-left side of core → lower-right area of Browser card.
- StudioApp: lower-left side of core → upper-right area of StudioApp card.
- Public: upper-right side of core → lower-left area of Public card.
- OBS: lower-right side of core → upper-left area of OBS card.

Each path should first travel outward horizontally from Runtime/Auth, then bow toward the destination. Use a cubic Bezier with the first control point outside the core and the second control point outside the destination card. The route should read as relaxed signal routing rather than a stretched diagonal tether.

The trace animation remains semantic:

1. quiet base route;
2. travelling low-opacity halo;
3. narrow bright spark;
4. packet carrier;
5. destination arrival response.

## Hero state transitions

Product switcher has four states:

1. Browser Studio — shared Studio canvas, blue.
2. StudioApp — shared Studio canvas, lime.
3. Studio for OBS — OBS bridge canvas, violet.
4. Public Shell — Clips/public-shell canvas, gold.

State changes should use a short fade + 5px vertical settle + resolving blur. No large motion.

## Studio shared canvas

Browser and Native states share geometry. Only product-specific title, accent, media label, status copy, and icon change.

### Live state

The mock topbar shows a green `LIVE NOW` indicator with a restrained 1.6s pulse. The stage chip and bottom live control use the same semantic green.

### Sidebar

Replace numeric prefixes with real SVG UI icons in the existing rounded-square slots:

- Scenes → cards-style UI icon.
- Sources → media/cards UI icon.
- Guests → community/participant UI icon.
- Destinations → cast UI icon.

### Destinations flyout

Expanded card with full-colour platform icons:

- Rumble
- YouTube
- Twitch
- Twitter (X)
- Kick

Each line has a small green ready-state dot. This is illustrative UI only.

### Audio

MIC, Desktop, and Master each contain two visually distinct meter rows labelled `L` and `R`.

## OBS state

Use the current production OBS download-page mental model rather than pretending OBS is another Studio canvas:

Runtime/Auth control plane → authorized ingress → bounded bridge → OBS-owned output.

The OBS output node should use the OBS mark and explicitly describe `Scenes · mix · encode`. Footer retains `BOUNDED LOCAL BRIDGE` and `NO DUPLICATE MEDIA ENGINE`.

## Public state

Represent the current public Clips shell rather than another production workspace:

- shell sidebar and product links;
- Clips active;
- search bar;
- Clips Gallery header;
- compact three-card gallery;
- public-account indicator.

Use gold for the tab/outer presentation accent only. The interior shell remains its current cool graphite/blue public identity.

## Reduced motion

When reduced motion is requested:

- disable LIVE NOW pulse;
- disable OBS bridge dot loop;
- disable route cycling/travelling packets;
- keep static connector lines visible;
- show preview states immediately without animated entry;
- preserve all keyboard/state-switch functionality.


## Revision 7 topology rule

Each Runtime/Auth route is a single quadratic corner arc (`M … Q …`) with the control point aligned to the destination x-coordinate and Runtime/Auth start y-coordinate. This intentionally creates the smooth quarter-arc geometry requested in the final markup instead of stretched multi-control curves.
