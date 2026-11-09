# Verification report

Completed 9 November 2026 using Playwright with the installed Brave/Chromium browser in headless mode, served through Python's static HTTP server. Test tools were installed in `/tmp`, outside the production project.

## Results

- **80 checks** in `qa-browser.cjs`: 64 page/viewport/mode combinations plus 16 interaction/state groups.
- **6 additional edge-case groups** in `qa-edge.cjs`.
- **150 static local references** checked; no missing targets.
- **7 production JavaScript files** passed `node --check`.
- No browser JavaScript errors, failed local asset responses, broken images, or document-level horizontal overflow in the tested combinations.

## Responsive and theme coverage

All eight physical pages were loaded at **320, 390, 768, 1024, 1280, and 1440px**, with fonts ready and images decoded. Each page was also checked in combined dark/RTL mode at **390 and 1280px**. Direct page loads and refreshes were exercised.

Screenshots were visually reviewed for the main desktop compositions, the two distinct homepage heroes, class discovery, instructor framing, membership comparison, enquiry page, split login, desktop dashboard, mobile dashboard sections, representative tablet layouts, and dark/RTL hero and meditation sections. Newly sourced ripple artwork was separately decoded, rendered, and visually inspected in the workshop panel.

Visual corrections included separating the solar motif from the headline, limiting the closing photograph's height, replacing unsuitable sample portrait photos, correcting theme-transition button contrast, increasing mobile utility touch targets, and strengthening small text and display accents on saffron. Shared palette foreground/background ratios were checked for these problem cases; this was not a full WCAG certification audit.

## Interaction coverage

1. Initial Ten-Class Pack: 10 total, 3 attended, 1 held booking, **6 remaining**.
2. Book eligible class: **6 → 5**; new session appears in My Sessions.
3. Duplicate booking rejected, balance unchanged.
4. Cancel eligible class: **5 → 6**; repeated cancellation rejected.
5. Booking state survives refresh.
6. Renewal preview saves a local request while preserving active plan, expiry, and credits.
7. Non-sensitive display preferences save correctly.
8. Unlimited sample model accepts bookings without generating numeric credits.
9. Reset restores Alex's original sample data, valid membership dates, and consistent history.
10. Class category/level filters, empty results, and reset work.
11. Practice finder produces matching goal/duration sessions.
12. Plan comparison derives visits and per-used-class estimates from actual sample data.
13. Enquiry validation opens an explicitly unsent preview.
14. Guest booking context survives the Login → explicit demo entry flow.
15. Show/hide password works; sign-in presentation clears the password and stores no credential.
16. Mobile public navigation and dashboard drawer open and close with Escape; theme/direction survive refresh.
17. Reduced-motion preference stops the decorative animation.
18. Expired memberships and exhausted single-session credits reject booking.
19. A simulated 15-day date advance preserves session snapshots and credit usage, moving the old booking to elapsed history.
20. All eight routes and their images work through a simulated **`/studio/` GitHub Pages repository subpath**.
21. Home dropdown, keyboard practice tabs, animation pause, sticky header, and floating back-to-top work.

## Reproduce

Production does not require Node. For development QA only, start the static server described in the README, then install Playwright outside the project:

```sh
npm install --prefix /tmp/sola-qa playwright
SOLA_PLAYWRIGHT=/tmp/sola-qa/node_modules/playwright node documentation/qa-browser.cjs
SOLA_PLAYWRIGHT=/tmp/sola-qa/node_modules/playwright node documentation/qa-edge.cjs
```

The scripts default to the installed macOS Brave executable. Set `SOLA_BROWSER` to another Chromium executable on your machine. They expect the site at `http://127.0.0.1:4173` and write results to `/tmp/sola-studio-qa` (override with `SOLA_QA_OUTPUT`). Each suite uses an isolated browser context and only its own demo storage.

## Verification limits

- No Safari or Firefox run, physical-device test, or comprehensive assistive-technology audit was performed.
- No authentication, payment, email, live seat inventory, map, or real member account integration exists or was claimed tested.
- The GitHub Pages workflow follows the current official GitHub static workflow pattern and packages only runtime files. It has **not** been run against a remote repository; none was supplied.
- The architecture reference repository was read only and remains unchanged.

## Finishing-pass verification

The subsequent refinement was verified on 9 November 2026. See [REFINEMENT.md](REFINEMENT.md) and `refinement-results.json` for 112 light/dark/RTL configurations, 24 focused dashboard layout checks, the rerun 80-check browser suite and 6-group edge suite, preserved SVG checks, and before/after evidence. The browser limitations above still apply. GitHub Pages has since been enabled; the initial deployment succeeded before this refinement, and the updated deployment is verified separately when published.
