# Targeted redesign — 9 November 2026

Preserves the buildless HTML/CSS/vanilla JavaScript architecture, warm palette, local fonts, successful public sections, and credit ledger. Adds one physical page: `pages/signup.html`.

## Delivered components

1. **Source-generated artwork:** replaced the dashed `solar-orbit.svg` with an actual warm-gradient export from [fffuel cccoil](https://www.fffuel.co/cccoil/). Actual cccircular and oooscillate generator outputs were also inspected before selection. Transparent background, preserved proportions, no invented psychedelic paths. Hero artwork is static; the photo has a .65-second entrance disabled by reduced motion. Play/pause markup, styles, and handlers are removed.
2. **Home 1:** retains the hero headline, photograph, and CTA structure. The practice list aligns with its selected photo; related details sit in a shared horizontal panel below both columns on desktop. Mobile stacks naturally. The tiny practice decoration and oversized blank area are removed.
3. **Photography:** replaced Maya's generic portrait with Pexels 3823039, an active studio stretch, and Arjun's with Pexels 6648534, seated studio meditation. Home 1 and the directory share the same files. Leela's original practice photo is retained. Native landscape ratios preserve the primary subjects' posture. Names remain editorial concepts; independent practitioners are not presented as verified Sola employees.
4. **Instructors:** a connected featured practice image and teaching approach lead into two complementary editorial profiles. Concise specialties and class links replace the repetitive portrait sections. The large introductory notice is removed; a discreet closing sentence provides necessary identity context.
5. **Footer:** Brand / Explore / Membership / Connect groups, ordered Home 1, Home 2, Classes, Instructors; Plans, Login, Dashboard; Contact. No Explore Demo link. Tablet/mobile reorganize the columns. Credits remain accessible, with room for the floating back-to-top control.
6. **Classes banner:** a substantial, contained cccoil composition replaces the tiny dotted spiral without distorting the source SVG.
7. **Weekly explorer:** seven Monday–Sunday date tabs select four matching session cards. The next complete week comes from the existing rolling 14-day IST catalog. Desktop uses two columns; mobile uses one. Click/touch, roving focus, Arrow keys, Home/End, and RTL navigation work. View/Book retain the selected session ID.
8. **Membership comparison:** heading, description, slider and frequency form the top region. Four plan cards below display validity, estimated visits, credit limits and approximate cost per attended class. Math remains `ceil(frequency × validity / 7)`, capped by finite credits, with `ceil(price / used visits)`. Calculation details are collapsed by default.
9. **Authentication:** centered standalone Login and separate Sign Up pages have no public navbar/footer or public return links. Inputs, password eye controls, Remember Me/Forgot Password row, full-width submit controls, actual Google/Apple marks, and reciprocal auth-page links are implemented. Native email/password validation and password confirmation work. Valid actions, recovery and social buttons accurately report their unconnected status; credentials are cleared without transmission or persistence. No fake success or authenticated session is created.
10. **Content and workspace:** redundant demo/sample labels and prominent notices are removed. Dashboard links and guest booking lead directly to the member workspace. The dashboard retains its own sidebar/topbar and exit control, with no public chrome. Contextual action feedback explains on-device planning, unsent enquiries, unconnected reservations and payment limitations. Old component styles and replaced portrait files are removed; no new build system or runtime dependencies.
11. **Typography and spacing:** readable schedule details, form labels, footer links, comparison cards and dashboard text; targeted component spacing rather than global padding reduction. Existing RTL drawer visibility and text isolation are preserved.

## Verification actually performed

Headless Brave/Chromium through Playwright; Python static HTTP preview. Tool dependencies live outside the repository.

| Check                     | Result                                                                                                                                                                                                         |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `qa-browser.cjs`          | 88 checks: 72 responsive configurations and 16 functional/state groups; no errors or failures                                                                                                                  |
| `qa-refinement.cjs`       | 126 configurations: all 9 pages at 320, 390, 768, 1024, 1280, 1440px in light/dark, plus dark RTL at 390/1024; no overflow, missing images, or undersized important text detected                              |
| Component screenshots     | 154 captures: 11 affected scenes × 6 widths × 2 themes, plus 22 representative RTL captures; reviewed actual browser proportions                                                                               |
| `qa-redesign.cjs`         | 6 targeted groups: all 7 dates/4 sessions, keyboard/RTL and session context, all 4 comparison plans at frequencies 1/3/7, both standalone auth forms, direct dashboard, removed controls/footer/reduced motion |
| `qa-edge.cjs`             | 6 groups: expiry, exhausted credits, 15-day history rollover, all 9 routes under a repository-style subpath, practice tabs/dropdown, static art/sticky header/back-to-top                                      |
| Focused dashboard layouts | 24 section/width checks at 320/768/1024/1440; short-laptop sidebar remains usable                                                                                                                              |
| RTL drawer regression     | Immediate direction switching and open/Escape/close at 320/390/768; desktop sidebar remains visible                                                                                                            |
| Static references/syntax  | 164 authored HTML/CSS local references resolve; all 9 production JS files pass `node --check`; `git diff --check` passes                                                                                       |

The first concurrently executed visual scan had an intermittent local image decode failure at 320px. The complete matrix was rerun after the final adjustments and passed with no broken images. Screenshots and successful interaction suites were reviewed rather than treating changed CSS as verification.

Booking regression covers initial six-credit balance, booking 6→5, duplicate rejection, cancellation 5→6 exactly once, persisted state, unlimited credits remaining `null`, renewal requests leaving the active plan/payment unchanged, reset, filtering and practice finder. Authentication checks verify no requests on form submission and no credential storage, including member-state preservation.

## Visual evidence

Component screenshots: [Hero](targeted-review/hero-1280-light.png), [Practice](targeted-review/practice-1280-light.png), [Weekly explorer](targeted-review/week-1280-light.png), [Instructors](targeted-review/teachers-1280-light.png), [Comparison](targeted-review/comparison-1280-light.png), [Login](targeted-review/login-390-light.png), [Sign Up](targeted-review/signup-390-light.png).

Reviewed sheets: [320](targeted-review/review-320-light.png), [390](targeted-review/review-390-light.png), [768](targeted-review/review-768-light.png), [1024](targeted-review/review-1024-light.png), [1280](targeted-review/review-1280-light.png), [1440](targeted-review/review-1440-light.png), [Dark mobile](targeted-review/review-390-dark.png), [RTL tablet](targeted-review/review-1024-rtl.png). Images are compact evidence sheets; individual component captures provide closer detail. Documentation and screenshots are excluded from the deployment artifact.

Machine-readable evidence: [redesign-results.json](redesign-results.json). Sources/license details: [ASSET-CREDITS.md](ASSET-CREDITS.md). Historical reports describe earlier interfaces and are marked accordingly.

## Published-site verification

The [GitHub Pages deployment](https://github.com/teknritsolutions-2/Yoga-Meditation-Studio/actions/runs/42599764237) for runtime commit `0b66b9c` succeeded. All nine live URLs returned HTTP 200; images decoded, mobile layouts had no document overflow, and no failed asset responses or browser JavaScript errors were observed. The six-group targeted interaction suite also passed against the deployed repository subpath, including selected-session transfer into the dashboard and accurate unconnected authentication feedback. The browser test waits for the class dialog after deferred dashboard initialization.

[Open the published site](https://teknritsolutions-2.github.io/Yoga-Meditation-Studio/).

## Reproduce and limits

Start the static server as described in README. Install Playwright outside this project, set `SOLA_PLAYWRIGHT` to its module path and optionally `SOLA_BROWSER` to a Chromium executable, then run the `documentation/qa-*.cjs` scripts. `SOLA_QA_OUTPUT` selects the output folder.

No Safari/Firefox, physical-device, full assistive-technology or WCAG certification audit was performed. Real authentication, OAuth, payments, reservations, email delivery, verified staff and contact details remain unconnected. No backend functionality is claimed. GitHub Pages publishes only `index.html`, `pages/`, and `assets/` using the existing workflow.
