# StreamSuites Status POC — Final Widget/Footer Refinement

This revision preserves the approved `/status` page and complete expanded service-status panel while correcting the final floating-widget interaction and page-header details.

## Final widget behavior

- Idle state: only the rounded status signal square and live indicator dot are visible.
- Mouse hover or keyboard focus: the control smoothly expands left into the full summary chip.
- The summary chip now reserves a dedicated right-side expand/collapse control so the icon is never clipped.
- The control uses the existing StreamSuites UI assets:
  - `assets/icons/ui/plus.svg` while the detailed panel is closed.
  - `assets/icons/ui/cross.svg` while the detailed panel is open.
- Click: opens the already-approved complete detailed status panel.
- Escape / outside click: closes the detailed panel as before.
- When the footer enters the viewport, the fixed widget rises to a 12px clearance above the footer's top edge so it never obscures footer content.
- The footer-aware anchor is resolved on the widget host itself so the dynamic CSS variable is applied correctly rather than being frozen at the root default.
- The detailed panel's maximum height continues to contract relative to the lifted anchor so it stays within the viewport.
- Reduced-motion mode suppresses nonessential transition timing.

## Status-page refinements

- Added a `See components ↓` anchor action between `Refresh status` and `Atlassian hosted page` in the hero.
- The anchor lands at the component directory with sticky-header clearance.
- Reduced the shared desktop header height from 74px to 66px while preserving its structure, navigation, colours, buttons, and visual design.

## Preview states

Append `?demo=operational`, `?demo=degraded`, `?demo=partial`, `?demo=major`, or `?demo=maintenance`. Add `&widget=open` to start with the detailed panel open.

## Run

Double-click `OPEN_POC.cmd`, or run `OPEN_POC.ps1`. The launcher opens `http://127.0.0.1:8765/?demo=operational`.

A `status-poc-standalone.html` build is also included for direct inspection. When opened through `file://` without a query, it defaults to the operational POC dataset.

No production StreamSuites repository was modified.
