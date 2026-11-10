# Compact navigation and tablet follow-up

10 November 2026, following the client's screenshot review of the responsive audit.

- **Public navigation, through 1190px:** the closed header contains Sola branding and the hamburger. The side panel contains the single existing theme button, direction button and Login CTA. Controls move back to their desktop locations above 1190px; duplicate controls were not added. The panel opens at the logical end, scrolls internally and retains backdrop/Escape dismissal, focus containment and background scroll locking.
- **Home 1 and Home 2 pricing:** removed the 620px cap from the stacked compact pricing grids. At tablet widths their outside edges now align with the section's actual side padding.
- **Tablet footer, 701–1190px:** the brand occupies the first row; Explore, Membership and Connect share three columns in the next row. Phone and desktop arrangements remain separate.
- **Classes filters, through 1190px:** replaced the platform's detached, tiny native popup with an anchored listbox for each of the three filters. Options use 16px type and at least 48px height. Menus use the field's width, open above when there is more space there, and scroll internally. Mouse/touch selection, arrows, Home/End, Enter/Space, type-ahead, Escape, Tab and outside dismissal are supported. The original select elements remain the form's source of truth; change/reset events and filtering continue to work. Desktop retains native selects, and native controls remain available if JavaScript does not enhance them.
- **Dashboard, through 1190px:** the topbar displays the Sola home link instead of the tagline. The hamburger sits at the end of the header after notifications/profile (right in LTR). Theme and direction controls move into the sidebar. The drawer breakpoint now includes landscape tablets, matching public compact navigation. Above 1190px the desktop sidebar/header arrangement remains.

## Verification

`qa-compact-navigation.cjs` passed **193 checks in Chromium and 193 in WebKit**, covering 320, 390, 700, 701, 768, 820, 960, 1024, 1180, 1190, 1191 and 1440px in all four theme/direction combinations. Assertions cover actual control location/visibility, real toggle interaction, panel bounds, footer row alignment, pricing edges, dropdown option size/anchoring, keyboard selection, empty results/reset, branding/hamburger position and moving the same controls during resize.

The full responsive matrices also pass: **1,380 Chromium and 300 WebKit configurations**, including all nine pages and all seven dashboard sections. `qa-browser.cjs` passes **88 checks**, including booking 6→5 credits, duplicate prevention, cancellation returning to 6, reset, renewal, forms and stored display preferences. The shared menu/drawer suite covers **478 checks per engine**, including top/middle/footer menu operation and the 1180×350 short viewport.

The existing QA utilities were updated for the new control locations and custom compact filter UI. Browser screenshots were reviewed for the phone/tablet panels, dropdowns, branded dashboard header, widened pricing cards and footer row. These are headless Chromium/WebKit checks, not physical-device certification. QA files are excluded from the runtime deployment artifact.

[Machine-readable verification summary](compact-results.json). All 168 authored HTML/CSS references resolve; all 10 production JavaScript files pass syntax checks; `git diff --check` passes.

Selected reviewed screenshots: [phone menu](compact-review/public-menu-390.png), [tablet menu](compact-review/public-menu-820.png), [tablet filter options](compact-review/class-options-820.png), [phone dashboard](compact-review/dashboard-header-390.png), [tablet dashboard drawer](compact-review/dashboard-drawer.png), [Home 1 pricing](compact-review/home-plans.png), [Home 2 pricing](compact-review/home2-plans.png), [tablet footer](compact-review/footer.png).

Run against a local HTTP preview:

```sh
SOLA_PLAYWRIGHT=/absolute/path/to/playwright node documentation/qa-compact-navigation.cjs
SOLA_PLAYWRIGHT=/absolute/path/to/playwright SOLA_AUDIT_ENGINE=webkit node documentation/qa-compact-navigation.cjs
```

`SOLA_SCREEN_BASE` and `SOLA_QA_OUTPUT` select another preview origin and capture directory.
