# Sola Studio finishing pass

9 November 2026. This is a refinement of the existing website, preserving the palette, Fraunces/Manrope pairing, section sequence, four sourced SVG artworks, restrained motion, and static architecture.

## Typography

Introduced explicit body, action, supporting, metadata, and decorative-label sizes. Body copy remains 16px, actions and form labels are 15px, functional supporting information is generally 14–15px, and metadata is 13–14px. Decorative eyebrows remain 12px; the small wordmark lettering is intentionally unchanged.

Removed mobile/tablet reductions that previously made functional text 9–11px. Schedule instructors, dates, levels, timetable entries, plan terms, consent labels, dashboard navigation, statistics, history, notifications, and ledger contents now inherit readable sizes. Main editorial headline proportions remain intact.

## Layout and spacing

Shared recurring spacing values across components and consolidated superseded CSS declarations within breakpoints. Related sections on the same background share intentional gaps instead of accumulating two full section paddings. Filters, finder controls, plan interiors, and modal details have more consistent spacing.

Memberships use two columns at intermediate desktop widths and one column on phones; wide desktop retains the four-plan comparison. Mobile session rows place date/time, class information, and booking actions on distinct lines. Timetables and ledgers have explicit horizontal-scroll guidance and usable text instead of compressed labels.

## Photography

Added three locally stored, inspected Pexels photographs with credit records. The closing panel no longer repeats Home 1’s studio-atmosphere detail. Guided Meditation and Restorative now use distinct landscape scenes instead of repeatedly cropping the login portrait.

Reframed the hero on smaller screens, retained complete yoga postures in wide instructor images, improved portrait alignment, and changed the tablet guide preview to two portraits plus a wider practice image. The closing panel stacks at tablet widths to preserve its foreground posture rather than clipping faces or hands.

## Psychedelic artwork

All four SVG files are unchanged. Moved the solar orbit away from the headline, retained its 65-second rotation and pause/reduced-motion support, increased the spiral’s tablet display size, and reduced the workshop ripple zoom from 1.2 to 1.08. Checked the meditation rings and artwork in dark/RTL layouts.

## Dashboard

Navigation is 15px; labels, notes, tables, statuses, and timestamps no longer shrink to 10–11px. Phone statistics use compact full-width rows with clear values. Panels, filter forms, cancellation actions, renewal previews, and settings reflow while preserving the original workspace structure.

The sidebar was reviewed at a 720px laptop height and fits without its own scroll. A concise demo banner retains the reservation/payment limitation. Existing booking, duplicate prevention, credit accounting, cancellation, renewal previews, preferences, and reset behaviour are preserved.

## Public content

Removed repeated development-oriented phrases from marketing copy and the global footer. Each contextual journey retains the appropriate disclosure: illustrative instructor profiles, indicative prices, preview availability, demo access, and unsent enquiries. Confirmations still explicitly distinguish local bookings and renewal requests from real reservations or payments.

Added page-specific meta descriptions and a visible current-home navigation marker. No business address, operating hours, teacher qualification, benefit, fee, or integration was invented.

## Verification

The final verification results are recorded in `refinement-results.json` and `QA.md`. Browser coverage includes all eight pages at 320, 390, 768, 1024, 1280, and 1440px in light and dark themes, with additional RTL views. Before/after screenshots were inspected alongside focused photography, artwork, timetable, and dashboard-section captures.

Repeat the existing suites using the README’s external Playwright setup. The additional visual/readability matrix is reproducible with:

```sh
SOLA_PLAYWRIGHT=/tmp/sola-qa/node_modules/playwright node documentation/qa-refinement.cjs
```

Set `SOLA_BROWSER` for another Chromium executable, `SOLA_QA_OUTPUT` for an output directory, or `SOLA_SCREEN_BASE` to verify a deployed site. No QA tooling is needed or installed in the production website.

## Commercial launch requirements

This remains a polished frontend with local demonstrations. A fully operational launch still needs:

- Real authentication and secure member accounts.
- A server-side booking service, studio inventory, cancellation policy, and member ledger.
- Payment processing and confirmed renewal events.
- Enquiry delivery and an approved contact/privacy process.
- Approved studio address, hours, contact details, instructor identities, photography, qualifications, prices, and business terms.
- Business approval of the working brand and any required trademark checks.

No real purchase, authentication, reservation, message delivery, or verified teacher employment is claimed.

## Selected visual evidence

| Before                                                       | After                                                                                       |
| ------------------------------------------------------------ | ------------------------------------------------------------------------------------------- |
| [Phone dashboard](visual-review/before-dashboard-mobile.png) | [Readable phone statistics](visual-review/after-dashboard-mobile.png)                       |
| [Phone schedule](visual-review/before-schedule-mobile.png)   | [Readable dates, instructors, and booking actions](visual-review/after-schedule-mobile.png) |

Additional reviewed sections: [tablet closing panel](visual-review/after-closing-tablet.png), [tablet guides](visual-review/after-guides-tablet.png), and [workshop artwork](visual-review/after-workshop-tablet.png).

### Final check results

- 112 page/viewport/theme configurations passed: 96 light/dark views and 16 RTL views.
- The existing browser suite passed all 80 checks; the edge suite passed all 6 groups.
- All 24 focused dashboard section/width checks passed.
- The sidebar fits a 720px-high laptop viewport without its own scroll.
- 150 local references and all 7 production JavaScript files verified.
- All 5 SVG files, including the logo, are byte-for-byte identical to the original commit.
- No JavaScript errors, broken images, document overflow, or visible functional text below 13px in the visual matrix. Decorative eyebrows and the wordmark are deliberately excluded from that size threshold.

A transient localhost font-request reset interrupted one edge-suite attempt. The QA helper now waits for fonts between subpath navigations and retries transport resets; the subsequent complete suite passed. No website asset or booking-logic change was needed for that test harness issue.
