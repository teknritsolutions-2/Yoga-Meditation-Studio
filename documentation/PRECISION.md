# Precise visual and navigation fixes — 10 November 2026

This revision preserves the existing layouts, typography, palette, photography, weekly explorer and member ledger. It makes the seven requested corrections in the existing buildless HTML/CSS/JavaScript project.

1. **Restored spirals.** `solar-orbit.svg` is restored byte-for-byte from the original `43e01eb` commit, Git blob `89c0963954501d8850d8ae542de2e75deeb9987b`. Classes uses the unchanged `organic-spiral.svg` dotted design. The thick cccoil design is removed from runtime artwork. Both restored graphics keep their native proportions, sit behind/beside content, and have no continuous animation or playback control. A small brightness adjustment makes the dotted Classes artwork clearer in dark mode without changing its source geometry.
2. **Aligned navbar containers.** `.wrap` and `.nav-wrap` share one sizing rule: 1280px maximum, centered, 48px horizontal padding. They also share every responsive padding and the existing wide-screen maximum. The conflicting 1440px navbar maximum and 30/20/16px navbar-only padding are removed. Sticky behavior is preserved. Measurements verify the same horizontal guides for all six public pages and their footers, including RTL.
3. **Instructor precision.** Maya's feature uses a slightly more balanced 1.15/.85 image/text split with a 48px gap and centered vertical alignment. The lower profiles have equal image tops, dimensions, name positions, spacing and link baselines; the 64px stagger and obsolete mobile reset are removed. Arjun has a soft arch with 100px upper corners and restrained 8px lower corners. Leela keeps her existing asymmetric frame. All photographs remain unchanged at their native 3:2 proportions; mobile stacks without offsets.
4. **Select-arrow spacing.** Native accessible selects remain native controls. A single custom chevron replaces the browser arrow using `appearance: none`, with a 16px background-image inset, roughly 20px to the visible stroke, and 48px logical end padding. RTL moves the chevron to the left and reverses text padding. Light/dark chevrons, input height and existing focus states remain clear across filters, forms and dashboard selectors. Keyboard typeahead selection is verified.
5. **Permanent Member Login.** The public navbar always links to Login regardless of local workspace state. Mobile navigation retains its Login entry. The existing Membership footer group separately links to Member Dashboard, which remains directly accessible. No extra desktop navbar controls are added.
6. **Clickable auth logos.** Login and Sign Up use semantic `.brand.auth-brand` anchors to `../index.html`, with “Sola Studio — Home” accessible labels, the existing visible focus ring, and subtle hover opacity. The full symbol and wordmark are clickable and keyboard operable. Both pages remain standalone without public navbar/footer or a separate return button. Forms and truthful frontend-only feedback remain intact.
7. **Verification.** Actual Brave/Chromium screenshots, measured layout guides, keyboard interactions and functional regressions were run as detailed below. No production framework, routing, business-state or photography changes were introduced.

## Final rendered artwork widths

| Viewport | Home 1 concentric SVG | Classes dotted SVG |
| -------- | --------------------: | -----------------: |
| 320px    |                 285px |              280px |
| 390px    |                 340px |              280px |
| 768px    |                 350px |              279px |
| 1024px   |                 430px |              388px |
| 1280px   |                 500px |              420px |
| 1440px   |                 500px |              420px |

These are image element widths; the original transparent SVG margins are retained. Artwork dimensions were chosen after inspecting the composition, with no added artwork-only empty columns.

## Browser and interaction verification

| Suite                          | Actual result                                                                                                                                                                                                                                                           |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `qa-precision.cjs`             | 76 checks: 72 public-page/width/direction combinations measuring navbar/content/footer guides and permanent Login after dashboard access; native select keyboard typeahead; sticky/back-to-top; both auth logos navigating home by keyboard                             |
| Targeted component screenshots | 84 screenshots covering hero, Classes banner, Maya feature, lower instructor pair, Login and Sign Up at all six widths in light/dark, plus dark RTL at 390/1024; actual image proportions reviewed. Eight dark banner screenshots refreshed after brightness adjustment |
| `qa-refinement.cjs`            | 126 configurations across all nine pages; light/dark at 320/390/768/1024/1280/1440, plus representative dark RTL. No document overflow, broken images, undersized important text or JavaScript errors detected                                                          |
| `qa-browser.cjs`               | 88 responsive and interaction/state checks; no errors or failures. Includes booking, duplicate prevention, one-time credit restoration, renewal isolation, unlimited plans, persistence, reset, filters, finder, enquiry feedback and navigation                        |
| `qa-redesign.cjs`              | Six targeted groups passed: seven day tabs/matching sessions, keyboard/RTL/session context, all comparison calculations, standalone auth validation/password/provider/recovery feedback, direct dashboard, reduced motion/footer                                        |
| `qa-edge.cjs`                  | Six groups passed: expired/exhausted plans, date rollover/history, all nine pages under a repository subpath, practice tabs/dropdown, sticky header/back-to-top                                                                                                         |
| Static integrity               | 166 authored HTML/CSS local references resolve; all nine production JavaScript files pass `node --check`; `git diff --check` passes                                                                                                                                     |

Image tops, names, specialties and links of the lower instructor pair are measured to align within one pixel above the mobile stacking breakpoint. Select controls retain at least 48px height and 48px logical end padding. Auth-logo keyboard focus has a visible outline. Instructor photo files, booking, dashboard and weekly-explorer source files are unchanged.

The native-select keyboard test uses supported macOS browser typeahead; form regression tests also exercise option selection and resulting filters. No simulated backend authentication, email delivery, payment or studio reservation is claimed. Browser coverage is installed headless Brave/Chromium; Safari, Firefox, physical devices and a full accessibility audit were not performed.

## Evidence and reproduction

[Machine-readable results](precision-results.json). Selected screenshots and review sheets are in [precision-review](precision-review/). These are excluded from the GitHub Pages runtime artifact.

Run the static preview described in README. Set `SOLA_PLAYWRIGHT` to an externally installed Playwright module, optionally `SOLA_BROWSER` to a Chromium executable, then run the `documentation/qa-*.cjs` suites. The precision suite accepts `SOLA_SCREEN_BASE` for a deployed repository URL and `SOLA_QA_OUTPUT` for screenshot/result output. It only changes browser-local workspace data.

The existing GitHub Pages workflow publishes `index.html`, `pages/` and `assets/`; it does not install dependencies or introduce a build system.
