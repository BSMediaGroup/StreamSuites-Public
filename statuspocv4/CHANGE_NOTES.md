# Final POC revision

1. Fixed the footer-avoidance root cause by resolving `--status-widget-anchor-bottom` on the widget host, where the dynamic footer-floor variable is updated.
2. The widget now rises to exactly 12px above the visible footer top whenever the footer enters the viewport.
3. Preserved the compact idle signal and smooth hover/focus expansion behavior.
4. Replaced the clipped chevron with a dedicated 28px expand/collapse control inside the expanded summary chip.
5. Added the existing StreamSuites `assets/icons/ui/plus.svg` and `assets/icons/ui/cross.svg` assets and switch between them based on panel state.
6. Increased the hover-chip width only enough to reserve the right-side control without clipping the status summary.
7. Added the hero `See components ↓` anchor between Refresh and Atlassian actions.
8. Added sticky-header-aware component-section scroll margin.
9. Reduced the header height from 74px to 66px without otherwise changing the design.
10. The full expanded panel design and data presentation remain unchanged.

- Final refinement: clipped idle-state signal blur within the square indicator only and replaced the widget expand/collapse control with inline plus/cross SVG icons derived from the approved Public UI assets.
