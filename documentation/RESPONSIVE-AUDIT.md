# Sola Studio responsive audit

Verified 10 November 2026. Baseline: `610d97c`. All nine physical pages and all seven dashboard sections were inspected, with full-page scrolling and actual screenshots before and after changes. The site remains buildless HTML/CSS/vanilla JavaScript.

## Coverage

Every page/section was checked in **light LTR, light RTL, dark LTR and dark RTL** at these 23 widths:

`320, 360, 390, 425, 430, 599, 600, 680, 681, 699, 700, 701, 768, 820, 959, 960, 961, 1024, 1180, 1190, 1191, 1280, 1440`.

Tablet presets include **768×1024, 820×1180 and 1024×768**. Other geometry scans use a 1000px viewport height. Navigation adds 320×568, 390×844 and the deliberately short **1180×350** case. This covers both sides of the actual 700, 960 and 1190px layout transitions as well as the requested 599/600 and 680/681px checks.

Chromium: **1,380 page/width/theme/direction configurations**. WebKit: **300 configurations**, all 15 page/section states at 320, 390, 820, 1024 and 1440px in all four modes. Both final matrices passed with no document overflow, broken images, clipped measured text, small measured form controls, container misalignment, console exceptions or failed asset responses. Explicit native-photo proportion checks supplement the geometry checks. Screenshots and visual review, rather than these assertions alone, informed the changes.

Full-page captures cover all 15 states at 320, 390, 768, 820, 1024 and 1440px in light LTR, plus 390/820px dark RTL. The Chromium set has 120 final full-page images; WebKit has 105. Public-page contact sheets were reviewed section by section at 390/820px; selected desktop compositions and changed components were also reviewed. The baseline scan contains 390 configurations and 120 full-page captures. Large temporary capture sets remain outside the published site; representative evidence is linked below.

## Page-by-page findings and corrections

The complete 23-width/four-mode Chromium matrix above applies to **every row**, with the five-width/four-mode WebKit matrix as a second-engine check.

| Page | Issues found and corrections made | Visual sections and functional checks |
| --- | --- | --- |
| **Home 1** | The 701–960px hero retained a narrow split photograph/story composition. It now presents the complete landscape photograph above a two-column story/action strip. Phone content-before-photo ordering remains. Compact footer links and support text received more comfortable dimensions. | Hero headline, soft waves, photograph, studio atmosphere, all six selected practices, weekly preview, meditation artwork, instructor preview, membership preview, closing CTA and footer. Both hero destinations, keyboard/RTL practice selection, preview date changes, booking destinations and back-to-top checked. |
| **Home 2** | Hero spiral covered the lower portion of the yoga pose. It now sits above the photograph on tablets and beside the CTA above the photograph on phones. The tablet/mobile photo uses its native ratio and a smaller corner radius so the extended foot stays visible. Comparison photos lost subjects to unsuitable cropping; native proportions restored. Three studio-day cards became narrow tablet columns: replaced by three full-width image/copy rows; phones place each photo above its copy. Comparison titles, descriptions and links share content rows on tablets. Intrinsic image dimensions reserve space before lazy images load; explicit responsive height rules preserve their proportions, including Leela's spotlight. | Hero, all finder fields and recommendation results, movement/stillness comparison, morning/afternoon/evening stories, workshop art, instructor spotlight, membership preview, closing CTA and footer. Finder matching, selector operation, booking links, workshop link and all selected-state geometry checked. Desktop composition retained; desktop spiral moved to the sky because the original obscured the pose there too. |
| **Classes** | Wrapped category-chip labels, uneven tablet filter widths and misaligned two-column weekly cards. Chips remain one line in their scrolling strip. Filters now use a balanced two-column tablet grid and a single phone column. Weekly titles, descriptions and actions align through content-sized shared rows. RTL times are isolated so `7:00 am` reads in the correct order. Modal headings reserve room for the close button. | Banner spiral, every filter, default and empty results, show-more, session rows, all seven weekly days, details/booking actions, first-visit FAQs and footer. Native selects/reset, 12→24 results, empty combinations, keyboard/RTL day changes and selected session identity through dashboard navigation checked. |
| **Instructors** | Existing photos and card compositions already reflowed correctly. A generic tablet section-padding rule overrode the intended spacing above the lower pair; its 24px top spacing is restored. Shared links now provide a 44px minimum height in compact layouts. | Maya's featured photo/content, Arjun's arched container, Leela's full pose, lower-card pair, biographies, disclaimers, CTA and footer. Guide anchors and class destinations checked. Existing desktop design, photos and mobile stacking preserved. |
| **Membership Plans** | Tablet plan descriptions, prices, feature lists and CTAs sat on inconsistent rows when titles wrapped. Two-column cards now share seven content-sized tracks, without fixed text heights. Comparison amounts use bidirectional isolation in RTL. | All four plan cards, featured badge, range control, four comparison results, calculation explanation, FAQs and footer. Frequencies 1/3/7 checked against capped-credit and unlimited calculations. Plan links, keyboard range operation, expanded FAQs and narrow-screen comparison grouping checked. |
| **Contact** | The name/email pair was squeezed into half of an already split tablet page. The form now uses one field per row through 960px; consent text is 15px. Long unbroken enquiry text could exceed modal bounds; dialog text now wraps inside the panel. | Introduction, atmosphere photo, visit information, complete form, consent, preview dialog and footer. Required fields/email/consent validation and local unsent enquiry preview checked; 200-character unbroken strings tested at 320×568, 390×844, 820×1180 and 1024×768 in all four modes. |
| **Login** | No new layout defect warranted a page-specific redesign. Existing standalone form and subtle static spiral retained. Shared dialog heading/wrapping improvements apply to password recovery. | Complete form at 320px and larger; clickable centered brand, Remember Me/Forgot Password row, password visibility, focus, social buttons, sign-up cross-link, native validation, accurate unconnected feedback and recovery dialog. No public navbar/footer or removed page heading was reintroduced. |
| **Sign Up** | Existing standalone stacked form already fitted 320px correctly; preserved. | All four fields, confirmation matching, both password toggles, Google/Apple controls, sign-in cross-link, home logo, keyboard focus, validation and light/dark/RTL feedback states checked. No credentials transmitted or stored. Spiral remains behind an opaque form. |
| **Dashboard** | A permitted 40-character unbroken name expanded the document to **1378px at a 390px viewport**; heading children now shrink and wrap, keeping document width at **390px**. Booking filters reflow into a two-column tablet grid with full-width reset and one phone column. Compact reset buttons retain readable labels. Clicking the already-active drawer item previously left the drawer open; every selected navigation link now closes it. RTL credit text and ledger arrow corrected. WebKit did not natively pan the focused ledger with arrows; explicit ArrowLeft/ArrowRight/Home/End handling now scrolls inside its container. | **Overview, Book a class, My sessions, Class pack usage, Membership & renewal, Notifications, Profile & settings** all opened and captured. Drawer control/current-link/Escape, sticky topbar, long names, table scrolling, forms, dialogs and all state transitions tested. Existing ≤960px drawer/desktop sidebar boundary retained. Booking 6→5 credits, duplicate prevention, cancellation 5→6, repeated cancellation prevention, refresh persistence, upcoming sessions, membership status, renewal preview, unlimited model, profile editing and reset checked. |

## Shared navigation and CSS

The existing sticky header already remained visible during scrolling, so it was retained. The compact menu extended below a short tablet viewport: at 1180×350 its bottom was 360px. Its height now derives from the actual header variable; the menu fits to 350px and scrolls internally. A backdrop, background inertness, scroll locking and keyboard focus containment make it usable over long pages. Dismissal restores focus without deliberately scrolling the page. Escape, hamburger, backdrop, link selection and resizing to desktop release the menu state.

Login appears once: inside the phone menu through 700px, and as the tablet/desktop header CTA above 700px. Dashboard remains immediately after Membership plans. Footer labels remain **Plans, Login, Dashboard**. Theme/direction controls are 44px in compact headers. Useful supporting schedule/ledger text is 15px. Photographs are never mirrored; the ledger's directional arrow is mirrored in RTL.

Changes were made in the existing component and breakpoint rules. Obsolete flex-basis declarations and superseded mobile studio-day/spiral overrides were removed. Shared grid tracks use `@supports` with the existing natural-height grid/flex layout as fallback. No new stylesheet of emergency overrides, framework, animation or business-state model was introduced. Photo, font and artwork binaries are unchanged; Home 1 keeps the client's later soft-wave design despite the older audit brief referring to a spiral there.

## Before/after evidence

These are real baseline/final browser captures. The Home 1, Classes, Memberships and Contact comparisons show the corresponding upper-page region at the same 820px width. Home 2 captures are full pages. The long-name pair uses the same 40-character profile at 390px.

| Comparison | Before | After |
| --- | --- | --- |
| Home 1 tablet hero | [Before](responsive-review/home-820-before.png) | [After](responsive-review/home-820-after.png) |
| Home 2 photos and studio-day layout | [Before](responsive-review/home2-820-before.png) | [After](responsive-review/home2-820-after.png) |
| Classes tablet filters | [Before](responsive-review/classes-820-before.png) | [After](responsive-review/classes-820-after.png) |
| Tablet plan rows | [Before](responsive-review/memberships-820-before.png) | [After](responsive-review/memberships-820-after.png) |
| Tablet contact fields | [Before](responsive-review/contact-820-before.png) | [After](responsive-review/contact-820-after.png) |
| Long dashboard name | [Before](responsive-review/long-name-390-before.png) | [After](responsive-review/long-name-390-after.png) |

Open/selected states: [tablet dark RTL menu](responsive-review/menu-820-dark-rtl.png), [selected Breathwork practice](responsive-review/practice-selected-820-rtl.png), [phone RTL renewal preview](responsive-review/renewal-preview-390-rtl.png). An additional 56 temporary captures exercise all six practices, another weekly day, empty class filters, seven-class comparison, auth feedback, expanded FAQs, renewal and long enquiry dialogs at 390/820px in light LTR and dark RTL.

## Lessons applied from previous projects

The actual eight commit diffs, resulting responsive CSS and relevant QA documentation were read before implementation. Neither reference repository was modified.

- **Repair shop [d920aa16](https://github.com/teknritsolutions-2/Mobile-Phone-Repair-Accessories-Shop/commit/d920aa16243b2e9fd1d5fb549abb08bc97837062):** complete product photos and comfortable image/copy separation informed Sola's native-ratio comparison photography and image-first phone studio-day stories. Here, complete yoga postures matter more than uniform cropped rectangles.
- **Repair shop [bf0d2cbe](https://github.com/teknritsolutions-2/Mobile-Phone-Repair-Accessories-Shop/commit/bf0d2cbe827e68d96f313fd034daa0878c5adfbb):** examined the background-photo solution, but did not copy it. Sola's hero needs an unobscured pose and already has a distinct wave/headline composition; a full landscape image is a better fit.
- **Repair shop [6c6c5722](https://github.com/teknritsolutions-2/Mobile-Phone-Repair-Accessories-Shop/commit/6c6c57228421d12027177546f1489b6f8017f4fb):** shared content-sized rows informed the tablet comparison, weekly class and plan grids. Wrapped titles determine row heights; descriptions and buttons align without truncation or hard-coded text heights.
- **Waylark [76e6c867](https://github.com/teknritsolutions-2/travel-agency-holiday-packages/commit/76e6c867bfe368cbcc10ccdf6292b39c1f7e54c4):** reflow cramped three-card collections deliberately. Applied to Home 2's studio-day rows. Sola's useful instructor and plan pairs remain multi-column where they fit.
- **Waylark [7dadfad3](https://github.com/teknritsolutions-2/travel-agency-holiday-packages/commit/7dadfad33fd150cc26bc378eb36932419aa77bc3):** test navigation at top, middle and footer and account for real header height. Sola's sticky header worked; no unnecessary fixed positioning/content offset was added. The actual short-viewport menu overflow was fixed.
- **Waylark [1be821b3](https://github.com/teknritsolutions-2/travel-agency-holiday-packages/commit/1be821b3943cdf1f607b63d749fde337d7ab236a):** image-first phone feature layouts and attention to cascade order informed the studio-day change and removal of later conflicting narrow-screen declarations.
- **Waylark [16fa2e97](https://github.com/teknritsolutions-2/travel-agency-holiday-packages/commit/16fa2e977c0f26719f1d0ecfd37f68e2f7b732f4):** social controls and compact navigation need real usable dimensions. Sola's existing branded Google/Apple controls already worked and were preserved; header controls and links gained appropriate compact touch dimensions.
- **Waylark [877112f3](https://github.com/teknritsolutions-2/travel-agency-holiday-packages/commit/877112f362af262a2642985793d8e032bfc8df59):** long names and enquiry values need deliberate wrapping; filters need tablet reflow; logical RTL placement and removal of obsolete CSS matter. Applied to the measured dashboard overflow, long enquiry dialogs, booking filters and bidi text. No unrelated prototype cleanup was invented.

Reference QA documents inspected: repair-shop `documentation/verification.md` and Waylark `documentation/sitewide-qa.md`.

## Reproducible verification

- `qa-responsive.cjs`: **1,380 Chromium / 300 WebKit configurations**, zero failures. Checks actual document/element geometry, useful text clipping, form font/height, container alignment, decoding, photo proportions and script/HTTP errors; captures full pages after scrolling through them.
- `qa-responsive-interactions.cjs`: **478 checks per engine**, zero exceptions. Includes 432 compact-menu combinations across six public pages, 12 viewport sizes, two theme/direction pairs and three scroll positions; plus theme switching while open, backdrop/resize release, real Home 2/Dashboard navigation, long names, active drawer links, keyboard ledger scrolling, long dialogs and shared card rows.
- The final **46-check focused interaction subset** was also rerun in both engines with additional ledger Home/End assertions; all passed.
- `qa-responsive-states.cjs`: **56 selected-state captures** and assertions at 390/820px in light LTR and dark RTL, including keyboard range endpoints, every password toggle, filter reset/show-more and actual home-logo navigation.
- `qa-browser.cjs`: **88 checks**, zero failures, including booking and credit accounting, cancellation, persisted state, renewal preview, unlimited access, reset, filters, finder, comparison, enquiry, drawer, navigation, theme/direction and reduced motion.
- `qa-redesign.cjs`: **6 groups**, all pass: seven-day timetable/session identity, comparator math, standalone auth validation/provider feedback and direct workspace access.
- `qa-edge.cjs`: **6 groups**, all pass: expired/exhausted plans, 15-day rollover, all nine pages under a repository subpath, keyboard practice tabs, sticky header and back-to-top.
- `qa-home-hero.cjs`: **24 configurations**, all pass, updated to verify the deliberate tablet photo-before-story composition separately from the phone story-before-photo layout.
- **167** authored HTML/CSS references resolve; all **9** production JavaScript files pass `node --check`; `git diff --check` passes.

Run from a local HTTP preview with Playwright available outside the buildless production project:

```sh
SOLA_PLAYWRIGHT=/absolute/path/to/playwright node documentation/qa-responsive.cjs
SOLA_PLAYWRIGHT=/absolute/path/to/playwright node documentation/qa-responsive-interactions.cjs
SOLA_PLAYWRIGHT=/absolute/path/to/playwright node documentation/qa-responsive-states.cjs
SOLA_PLAYWRIGHT=/absolute/path/to/playwright SOLA_AUDIT_ENGINE=webkit SOLA_AUDIT_WIDTHS=320,390,820,1024,1440 node documentation/qa-responsive.cjs
SOLA_PLAYWRIGHT=/absolute/path/to/playwright SOLA_AUDIT_ENGINE=webkit node documentation/qa-responsive-interactions.cjs
```

`SOLA_SCREEN_BASE`, `SOLA_BROWSER` and `SOLA_QA_OUTPUT` support another preview origin, Chromium executable and output directory. WebKit requires Playwright's installed WebKit runtime. [Machine-readable summary](responsive-results.json) records page/width coverage and regression outcomes.

These are browser-engine viewport tests using Brave/Chromium and Playwright WebKit, not a claim of physical iPhone/iPad or Safari certification. The site's existing frontend-only authentication/enquiry/renewal behavior remains truthful; no backend or payment integration was added. GitHub Pages publishes only `index.html`, `pages/` and `assets/`; QA utilities and evidence are excluded from the deployment artifact.
