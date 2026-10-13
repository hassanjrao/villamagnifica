# Villa Magnifica accessibility work

Technical accessibility improvements target [WCAG 2.2 A/AA](https://www.w3.org/WAI/standards-guidelines/wcag/). Automated results do not establish full WCAG conformance or ADA compliance. Caption and description review for the existing videos and manual assistive-technology testing remain outstanding.

## Source preservation and Git deployment

The production document root is `/home/dh_rdkjci/villamagnifica.com`. Its homepage redirects to `/temecula_wine_country/`. Root HTML pages and `/2/` also remain publicly reachable, so the changes cover all 87 HTML files and the root redirect.

The supplied repository `https://github.com/hassanjrao/villamagnifica.git` was empty. The project was downloaded from production, rather than reconstructed from another site. Before changes, all original tracked application files matched the server baseline `d87fbb3bea86187d8079bcdf0badb3eb2394ccd3`; only newly added Git metadata, audit tooling and dependency configuration were absent on the server.

Original source, images and the complete media library are preserved in the account's private `~/.villamagnifica-backup/` directory. The downloaded source archive SHA-256 is `3573cae0bd3e2696467d87a6fec7ce8863086b213b68ee798782e5cbdf8ae454`. The complete media archive SHA-256 is `73cfd9abab8987b969aa361823a9a00c8feb016cc638f59b84190df1b43a669a`; both match production. Hosting diagnostic symlinks remain server-managed.

Local checkout: `D:/laravel/villafab-laravel/storage/app/projects/villamagnifica`. Large videos remain in the local checkout and on the server but are ignored by Git to avoid GitHub file-size limits. Images and application source are tracked.

Server Git metadata resides outside the web root at `~/.villamagnifica-git` with mode 700. The original SMTP transport is retained privately at `~/.villamagnifica-contact.php` with mode 600. Neither SSH passwords nor SMTP credentials are committed. The obsolete public SMTP file is replaced with a 404 stub. Apache rules deny the Git pointer and audit, documentation and private directories.

Future code deployment follows the requested workflow:

```powershell
cd D:/laravel/villafab-laravel/storage/app/projects/villamagnifica
git add <changed-files>
git commit -m "Describe the change"
git push origin main
ssh dh_rdkjci@iad1-shared-b8-39.dreamhost.com
```

Then on the server:

```sh
cd ~/villamagnifica.com
umask 022
git status --short
git pull --ff-only origin main
```

Keep the private transport and media backups when moving the site to another server; Git alone does not contain those files. Do not use a hard reset to discard unreviewed production changes.

## Changes

- Added a skip link, main landmarks, one main heading per page, sequential section headings and unique navigation identifiers.
- Added image alternatives based on visible context and inspected galleries; decorative images no longer repeat adjacent link text. Floor plans now have readable room/bed summaries, and map images link to the winery addresses and directions list.
- Replaced automatic slideshows with keyboard-operable manual controls and slide announcements. Inactive slides are hidden from assistive technology.
- Added visible keyboard focus, native menu and dropdown buttons, Escape handling and correct expanded states. Grocery details have a keyboard-operable disclosure.
- Replaced legacy lightboxes with a named native dialog, keyboard navigation, focus containment and focus restoration. Videos have controls, names and no automatic playback.
- Corrected low-contrast blue text/backgrounds, photo title overlays, footer text and instruction cards. Enlarged small links in error summaries and winery lists. Added narrow-layout and reduced-motion styles.
- Labeled contact and legacy booking fields, enabled appropriate autocomplete and phone/date input types, and added visible field errors and focusable announced summaries. Failed delivery preserves entries; successful delivery announces confirmation. Server validation covers required fields, email, dates and guest counts; email body values are escaped.
- Restored the original four visible contact fields on the older root `index1.html` and `/2/index.html` homepages on October 13. Their server endpoints accept submissions without a phone number; the main homepage retains its original phone field. A comparison against the downloaded server baseline confirms that all 87 HTML files now retain their original visible form-field counts.
- Preserved current booking redirects and tested the older `/2/book-now.html` form where booking remains enabled. Corrected older root Home/booking links that pointed to a missing `index.html`.
- Replaced the old chat embeds with a visible contact-form link and removed unavailable third-party decorative arrow references. External booking destinations remain unchanged.

## Validation

Initial live scans of the homepage, rooms and booking redirect recorded contrast, image/link naming, form-label, landmark and JavaScript failures. Original homepage had nine h1 elements and an unconditional missing-datepicker error.

Local canonical scans passed on 29 requested URLs. Local scans across 88 requested URLs at 320 pixels passed with no axe violations or horizontal overflow. Local keyboard checks passed 14 behaviors plus six open-state audits, covering menus, errors, viewer focus, form responses, reduced motion and narrow reflow. Seven local PHP fixture groups passed, including delivery success/failure/exception handling and HTML escaping; no test email was sent.

Production deployment was completed with Git push/pull on October 11, 2026. Application revision `fc7416e6f9bb63f389c21d136c81cfd83c0cf2db` includes the final backyard arrow refinement. Initial comprehensive live scans ran against `f147a98`; the changed backyard controls received a targeted follow-up scan on all three copies at all three viewport sizes.

| Live verification | Coverage | Result |
| --- | --- | --- |
| Desktop, 1280 × 720 | 88 requested URLs across all public copies | HTTP 200; zero axe violations, JavaScript errors, failed requests or horizontal overflow |
| Mobile, 375 × 812 | 29 requested URLs in the main live directory | HTTP 200; zero axe violations, JavaScript errors, failed requests or horizontal overflow |
| Reflow, 320 × 800 | 29 requested URLs in the main live directory | HTTP 200; zero axe violations, JavaScript errors, failed requests or horizontal overflow |
| Keyboard and interactive states | 14 behavior checks and six open-state axe audits | Passed; zero open-state violations |
| Server-side validation | Empty submissions to all six form endpoints | HTTP 422 with named field errors; no email delivery attempted |
| Public path protection | Git pointer, test harness, documentation and old SMTP path | HTTP 403/404 |

Every scanned page had one main heading. Requested URL counts include existing redirects; they do not imply that every URL contains distinct content. The live booking tests exercise `/2/book-now.html`, where the booking form remains enabled. Form delivery success/failure is simulated in browser tests and covered by local PHP fixtures; actual production delivery was not exercised.

The final live reports contain no failed asset requests. Earlier local reports retain failed requests from the legacy chat embed before its removal. Axe still marks video captions and some image-overlay contrast checks as incomplete; these are retained for manual review and are not counted as automated passes. The image labels use white text on a black overlay with 85% opacity, which provides greater than 15:1 contrast even over a white image. This contrast calculation does not replace an overall manual accessibility review.

Raw live evidence: `.audit-artifacts/live-all-axe-report.json`, `live-axe-mobile-report.json`, `live-axe-reflow-report.json`, `live-keyboard-report.json`, `live-deployment-report.json`, and `live-backyard-*-report.json`.

The October 13 form reversal was deployed through Git push/pull at application revision `d2d8ba231f9b04ba3ce1788cae209404c8c8d330`. PHP syntax checks and all seven local delivery-fixture groups passed, including successful legacy submissions containing only their original four fields. Six live empty-submission validators and four public-path protections passed; no production message was sent. Both restored forms passed a local mobile axe scan.

The older root contact endpoint's HTML response now returns to the existing `index1.html#section10` form, rather than a missing `index.html`. That change was deployed at `7e4c3a1da7fe07b651697613b0385bc9f9824138`; local and live empty submissions confirmed the correct HTML return links for all three contact endpoints. This adds no form controls.

## Every-page score review, October 13, 2026

All 91 public requested URLs scored **100/100 in Lighthouse accessibility on desktop and mobile**, exceeding the requested minimum of 90. The list contains all 87 HTML files plus `/`, `/index.php`, `/2/` and `/temecula_wine_country/`; existing redirects are included as requested URLs and their final destinations are recorded. Submission endpoints and library internals are not public content pages.

| Live review | Requested URLs | States | Result |
| --- | --- | --- | --- |
| Lighthouse 13.5.0, desktop 1280 × 900 | 91 | 91 | Minimum 100/100; all final document responses HTTP 200; no failed accessibility audits |
| Lighthouse 13.5.0, mobile 375 × 812 | 91 | 91 | Minimum 100/100; all final document responses HTTP 200; no failed accessibility audits |
| Latest mobile axe results, 375 × 812 | 91 | 91 | No violations, JavaScript errors, failed requests or horizontal overflow; one main heading per page |

See [every-page scores](lighthouse-scores.csv) and the [complete URL inventory](lighthouse-routes.json). Scores come from actual Lighthouse runs, not an axe-derived estimate. The shared runner is `D:/laravel/villafab-laravel/tests/lighthouse-accessibility.cjs`, using Node 22 and Lighthouse installed in the ignored audit-tooling directory. It runs the complete accessibility category without excluded rules, stores each full Lighthouse report and records requested/final URLs, HTTP status, version, score, failures and warnings.

Lighthouse produced 183 raw states: 182 distinct URL/profile pairs plus one mobile instructions-page repeat. That repeat used a 120-second load budget after an initial slow-load warning and passed at 100 with no warning. The final aggregate retains the earlier report's path as provenance. Remaining Lighthouse warnings are solely notices about existing redirects; each redirect destination was also scanned directly.

The first mobile axe crawl encountered transient HTTP/2 protocol errors and connection resets on three older root pages, including failed stylesheet downloads on two of them. All three pages passed clean follow-up scans, alongside the restored forms and additional directory aliases. Original failed-download evidence remains unchanged, and the aggregate explicitly identifies the latest report used for each URL.

Raw evidence is retained in `.audit-artifacts/oct13-lighthouse-summary.json`, the `oct13-lighthouse-*` directories, `oct13-verified-axe-mobile-summary.json`, `live-oct13-live-all-axe-mobile-report.json` and `live-oct13-mobile-resource-repeat.json`. These automated scores do not verify video captions, media descriptions or full screen-reader task completion; the manual work below still applies. No AccessibilityChecker account scan or subscription purchase was performed.

Tests use axe-core 4.14.0 and Playwright 1.48.2 with installed Chrome. Rules include WCAG 2 A/AA, 2.1 A/AA, 2.2 AA and best practices. Raw ignored reports live in `.audit-artifacts/`; reports retain incomplete rules for manual review. Node 18 or newer is required by the pinned Playwright package. This machine ran the tests successfully on Node 16 despite an engine warning.

```sh
npm ci
php -S 127.0.0.1:8200 -t .
npm run test:a11y -- --all
npm run test:a11y -- --all --mobile
npm run test:a11y -- --all --reflow
npm run test:keyboard
```

For isolated delivery tests, start PHP on port 8201 with `VILLA_FORM_TEST_HANDLER` set to the absolute path of `tests/fixtures/mail.php`, then run `node tests/contact.cjs`. Never set this fixture variable on production.

Set `ACCESSIBILITY_BASE_URL=https://www.villamagnifica.com` to audit live pages. Live browser tests block actual form delivery; success/failure behavior uses simulated responses, while server validation is verified separately with invalid requests. Production mail delivery has not been tested by sending a message.

## Remaining manual work

All 34 unique existing videos contain audio streams. Captions, transcripts and any needed descriptions of visual instructions have not been authored or verified. Audio-stream presence alone does not determine whether captions are required; each video's speech, meaningful sound and visual content must be reviewed. Automated scans flag video-caption checks as incomplete. See the [video review inventory](media-review.md) for individual links and durations.

Review image descriptions against intended meaning, floor-plan details and any navigational information in maps. Test with NVDA or VoiceOver, browser zoom/text enlargement, high contrast, mobile assistive technology and native media controls during playback. External Airbnb, Vrbo, Instacart, maps and retailer destinations are outside this site's code and need their own reviews.

## AccessibilityChecker post-deployment scan

1. Sign in through the [provided AccessibilityChecker link](https://www.accessibilitychecker.org/sign-up/?sign_action=checkout&redirect_to=https%3A%2F%2Fwww.accessibilitychecker.org%2Fmembership-account%2Fdomains%2F%23show-buy-subscription-popup) using your own account. No subscription was purchased and no AccessibilityChecker account scan was performed during this work.
2. Add `https://www.villamagnifica.com/` as the domain and run a full crawl with WCAG 2.2 AA if available. Confirm the redirect to `/temecula_wine_country/` is followed.
3. Include all URLs in [the complete URL inventory](lighthouse-routes.json), including older root pages and `/2/` paths, plus contact error states, the enabled legacy booking form, menu/dropdown states, grocery disclosure and open video dialogs. A homepage scan alone does not cover these states.
4. Export the report and separately track automated findings and manual checks. Review captions, descriptions and screen-reader tasks even if the scanner reports no failures.
5. Apply any confirmed fixes, push to GitHub, pull on the server and repeat the scan. Keep the report and test date as evidence; a scanner score is not a legal compliance certification.
