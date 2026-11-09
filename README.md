# Sola Studio

A complete, buildless Yoga & Meditation Studio website: HTML5, CSS3, and vanilla JavaScript. No framework, package install, generated `dist/`, or application server is required for production.

## Open locally

From this directory:

```sh
python3 -m http.server 4173 --bind 127.0.0.1
```

Open `http://127.0.0.1:4173`. Use HTTP preview for consistent local demo storage across pages. The server is a development convenience only.

## Pages

| File                     | Experience                                                         |
| ------------------------ | ------------------------------------------------------------------ |
| `index.html`             | Home 1 — studio atmosphere, interactive practices, weekly preview  |
| `pages/home2.html`       | Home 2 — personal practice finder, studio day, workshop concept    |
| `pages/classes.html`     | Class filters, two-week sample schedule, timetable, detail dialogs |
| `pages/instructors.html` | Editorial sample guide directory                                   |
| `pages/memberships.html` | Four sample plans and usage-based comparison                       |
| `pages/contact.html`     | Visit information and local enquiry preview                        |
| `pages/login.html`       | Sign-in presentation and explicit demo access                      |
| `pages/dashboard.html`   | Member workspace with seven functional sections                    |

## Demo behaviour

Choose **Explore demo member dashboard**; credentials are unnecessary. The initial member has a Ten-Class Pack: 10 credits, 3 attended sample classes, 1 upcoming booking, and 6 available credits.

- Booking holds one credit. Duplicate, overlapping, past, out-of-validity, and exhausted-credit bookings are blocked.
- Cancelling an upcoming demo session restores its credit once. This is an illustrative cancellation policy.
- Unlimited sample plans have access without a fabricated credit balance.
- Past bookings retain session snapshots and move to elapsed history as dates advance.
- Renewal previews create local requests. They do not charge, renew, or change an active plan.
- Settings can load fresh sample plan models or reset the dataset. Loading a sample is explicitly separate from purchasing or renewing a membership.
- Non-sensitive demo state is kept under `sola-*` localStorage keys. Demo access uses sessionStorage unless remembered. Theme and direction persist separately.
- If storage is unavailable, the dashboard offers an in-memory fallback and explains the persistence limit.
- The sign-in presentation never authenticates, sends, or stores credentials. The enquiry form only previews its contents and does not retain or send them.

The schedule is generated for the next 14 days in **Asia/Kolkata**, with four sessions a day. All visible times are IST. Capacity figures, people, workshop concepts, and prices are illustrative. No real seats are reserved.

## Edit content

- `assets/js/class-data.js`: practice styles, teaching profiles, sample schedule.
- `assets/js/membership-data.js`: INR example prices, credits, validity, inclusions.
- `assets/js/site-config.js`: site identity, URL helpers, contact configuration placeholders.
- `assets/js/booking.js`: local state, eligibility, credit accounting, cancellation.
- `assets/js/dashboard.js`: member workspace sections.
- `assets/js/public.js`: public-page interactions.
- `assets/js/main.js`: shared navigation, footer, theme, direction, motion, dialogs.
- Physical HTML files: public editorial content.
- `assets/css/style.css`: shared components, public compositions, dashboard, responsive rules.

Location, contact details, hours, real instructors, studio photography, prices, and business terms must be supplied before commercial launch. Update both configuration and the contact page when details are approved. Sola Studio is a working brand; trademark clearance is not claimed.

## Publish to GitHub Pages

A ready-to-use workflow is included at `.github/workflows/pages.yml`. Push this project to the intended repository's `main` branch and select **Settings → Pages → Source → GitHub Actions**. The workflow copies only `index.html`, `pages/`, and `assets/` into the deployment artifact. Documentation, QA utilities, and repository files stay out of the published site. No build step or dependency installation runs.

URLs and local font/image paths work under a repository subpath as well as a domain root. Do not change page links to root-relative `/assets` or `/pages` paths.

**Repository:** https://github.com/teknritsolutions-2/Yoga-Meditation-Studio. The included workflow publishes when GitHub Pages is configured to use GitHub Actions. The architecture reference repository was inspected only as a reference and was not modified.

## Verification and asset records

See `documentation/QA.md`, `documentation/ARCHITECTURE.md`, and `documentation/ASSET-CREDITS.md`. Open-font license notices are included in `assets/fonts/`.
