# Home 1 layout and soft flowing waves

The client selected **soft flowing waves** and clarified that Home 1 needed a different banner layout as well as new decoration.

The new composition puts the headline and a light wave ribbon above a broad practice panel. The panel pairs the existing landscape yoga photograph with a warm introduction/action surface. At mobile widths the introduction and class/membership buttons come first, followed by the photograph at its original aspect ratio. The headline, palette, fonts, photograph, CTA destinations and sections below the hero remain intact.

The old concentric asset, tall arched frame, floating caption, entrance animation and obsolete responsive hero styles were removed. Classes retains its existing dotted spiral; other pages and dashboard logic are unchanged.

## Artwork

`assets/graphics/hero-waves.svg` was exported from the actual [fffuel oooscillate generator](https://www.fffuel.co/oooscillate/). It uses transparent background, saffron/clay gradient and softly fading, uninterrupted wave lines. Native 2400×800 proportions are preserved; no arbitrary paths or extra circles were drawn. There is no continuous animation or playback control. Full source/settings/license notes are in [ASSET-CREDITS.md](ASSET-CREDITS.md).

## Verification

- `qa-home-hero.cjs`: **24 configurations**, all 320/390/768/1024/1280/1440 widths in light/dark and LTR/RTL. Checked image decoding, no horizontal overflow, heading/panel separation, mobile content/photo order, static waves, both CTA destinations and absence of old spiral/caption/controls. Screenshots captured and reviewed, including fresh tablet photo rendering after browser paint.
- `qa-browser.cjs`: **88 checks**, no errors/failures, covering responsive pages, booking/credit/cancellation, plan comparison, filters, finder, enquiry, navigation and stored preferences.
- `qa-edge.cjs`: **6 groups**, including expiry/exhaustion, date rollover, all nine pages under a repository subpath, keyboard practice tabs, sticky navigation and back-to-top.
- `qa-refinement.cjs`: **126 configurations**, no errors/failures, covering the full page/theme/RTL matrix, recorded in the machine-readable results below.
- **166** authored HTML/CSS references resolve. All **9** production JavaScript files pass syntax checks. `git diff --check` passes.

[Machine-readable results](home-hero-results.json). Selected screenshots: [desktop](home-hero-review/home-1440-light-ltr.png), [mobile](home-hero-review/home-390-light-ltr.png), [tablet RTL](home-hero-review/home-768-light-rtl.png), [dark mobile RTL](home-hero-review/home-320-dark-rtl.png).

Browser verification uses installed headless Brave/Chromium through Playwright. No Safari, Firefox or physical-device audit is claimed. No authentication, payment or reservation integration was added.

The project remains buildless HTML/CSS/vanilla JavaScript. The existing GitHub Pages workflow publishes runtime files only; this report, QA scripts and screenshots are excluded from the deployed artifact.
