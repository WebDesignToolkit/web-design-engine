# Web Design Engine v0.1 — Local Verification

Date: 2026-10-27 (Asia/Kolkata)
Host: authorized Windows workstation Neo, Node.js 22, Python 3.13 and locally installed Google Chrome using cached Puppeteer; no GitHub Actions or cloud test runners.

## Code and data provenance

- New source repository: `WebDesignToolkit/web-design-engine`.
- Upstream component registry: `WebDesignToolkit/design-system/library/registry.json` on `feat/agency-ui-library-v0-1`, containing **44 draft patterns**.
- **11 engine-ready adapters** explicitly mapped to existing Foundry IDs. Each ID was cross-checked against the canonical registry: **11/11**.
- Foundry stylesheet copied byte-identically from `design-system/library/styles/library.css` into `web-design-engine/assets/foundry.css`.
- SHA-256 of both CSS files: `24FE84CF587D42F06C6D1B63F08EEFA50C29182F527145D7379E54F5F6363535`.

## Node unit tests

`node --test tests/engine.test.mjs`: **8/8 PASS**.

Evidence covers:
- Four-page structure and 11 supported stable IDs.
- HTML escaping of hostile client input; malicious CSS values rejected.
- Theme token normalization, radius and font constraints.
- Ordered section composition, section insertion/removal, blank-page handling and unknown ID filtering.
- Self-contained export manifest and preview inlined CSS.
- ZIP header/central-directory signatures, path traversal rejection.
- Disabled contact form and no remote runtime imports in generated pages.

## Real Chrome browser acceptance

`tests/browser.cjs`: **24/24 PASS**, zero uncaught page errors.

Coverage:
- Editor loads at 360, 768, 1280px without document horizontal overflow.
- Business name and free-form business industry immediately bind to generated preview; contact phone appears on the Contact page.
- Studio theme and custom accent render through the shared theme tokens.
- Page navigation produces a distinct Services preview.
- Added Foundry section renders; reorder and remove controls work.
- Mobile viewport preview toggles.
- HTML injection input displays as escaped text; no injected SVG executes.
- Client project JSON and ZIP download actions respond successfully.
- Generated contact inputs remain disabled.
- Reduced-motion support is recognized.

## Independent ZIP archive verification

Executed `node tools/export.mjs tests/sample-demo.zip` followed by Python standard-library `zipfile` verification:

**PASS**: ZIP contains exactly eight entries — `index.html`, `about.html`, `services.html`, `contact.html`, `assets/foundry.css`, `assets/site.css`, `project.json`, and `README.md`. No CRC errors. All four pages contain main and H1 elements, and project JSON parses.

## Remaining quality gates

This is an **MVP prototype**, not accepted production software. Manual visual review, WCAG/assistive technology audit, complete touch/mobile interaction study, exhaustive color contrast checks, performance measurements and broader industry content recipes are pending. Content and contact information in samples are illustrative. No real booking, email delivery, client database, deployment automation, or AI provider is connected.

## Publication boundary

Changes should stay in a draft PR until review. No implicit merge, GitHub Actions workflow, DNS changes or client deployment.

## Website review mirror verified

Ran `tools/sync-portal.mjs` against `WebDesignToolkit/website` branch `feat/agency-ui-library-portal-v0-1`, verifying the six mirrored application files (`index.html`, editor CSS, Foundry CSS, engine module and browser app module) by SHA-256 on disk (including new favicon), then added navigation links from the tool directory and Foundry gallery. Reran the Chrome browser suite with `ENGINE_WEB_ROOT=website/engine`: **24/24 PASS** and zero page errors. The website change remains review-only in PR #1, not merged to main or publicly deployed.
