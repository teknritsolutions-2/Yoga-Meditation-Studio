# Architecture and design notes

## Reference inspection

Inspected the root structure, `pages/dashboard.html`, `assets/js/dashboard.js`, and `assets/css/style.css` in:

https://github.com/teknritsolutions-2/travel-agency-holiday-packages

Retained the useful organization: physical HTML entry points, deferred shared scripts, feature data separated from presentation, and a sidebar/topbar/main member shell. The visual identity and site content are original to this project. No DriveLab repository or link was supplied, so no DriveLab-specific implementation is claimed.

## Loading and paths

Every public page contains authored semantic content. Shared navigation/footer and interactive regions mount via deferred scripts. The dashboard renders its sections inside its physical HTML shell. Scripts are classic vanilla JavaScript, with no framework, runtime fetch, bundler, routing rewrite, or production Node dependency.

`site-config.js` resolves the root and `pages/` directory relatively. CSS font URLs are relative to their stylesheet. Hosting works at `/` and at a project path such as `/studio/`. Dashboard section hashes survive refresh.

## Data consistency

Shared practice definitions connect sessions, instructors, filtering, detail dialogs, and bookings. The catalog always starts tomorrow in IST and spans 14 days. Booking snapshots preserve historical class data as the rolling catalog changes.

The ledger derives remaining credits from the plan's credit limit, attended history, and charged bookings that have not been cancelled. An upcoming cancellation changes status rather than adding another credit transaction, so repeated cancellation cannot inflate the balance. Elapsed bookings keep their charge and appear in history. Unlimited plans use `null` for credits instead of synthetic numeric limits.

Renewal requests are separate state records. They never alter a plan, expiry, or balance. The explicit sample-model loader replaces the whole sample dataset and is labelled as a demonstration action.

## Visual system

Cream/ivory canvas, cocoa typography, clay accents, and saffron decorative sections. Locally served Fraunces and Manrope. Rounded photographs, asymmetrical editorial groupings, a tabbed practice selector, horizontal session rows, and a clean member workspace supply different layout rhythms.

Four principal art treatments use four sourced fffuel SVG assets: the animated hero orbit; the static organic spiral beside the second homepage hero; reflective meditation rings; and sourced organic-ripple contours in class discovery and a clipped workshop editorial panel. The original generator geometry is preserved rather than introducing arbitrary hand-drawn paths.

Only the main hero orbit rotates, once per 65 seconds. A visible pause control and `prefers-reduced-motion` suppress motion. Decorative SVGs have transparent backgrounds; no checkerboard or white matte is embedded. Photographs are never mirrored in RTL.

## Accessibility and responsive behaviour

Semantic headings, explicit form labels, native details/select/dialog controls, focus-visible styling, polite status feedback, a skip link, and keyboard-operated tabs. The mobile dashboard uses an inert closed sidebar, focus containment when open, Escape dismissal, and focus restoration. Tables and timetables scroll inside their own regions on narrow screens.

Theme tokens apply to forms, cards, filters, dialogs, and the dashboard. Logical CSS properties handle directional positioning. RTL changes layout and directional controls; it is not a language translation.

## Deliberate integration boundaries

No authentication provider, payments, email delivery, studio inventory, map, or real-time availability is connected. No admin portal is included. Contact information and hours remain unconfigured, and all member actions are visibly local demonstrations.
