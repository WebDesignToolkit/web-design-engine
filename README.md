# WebDesignToolkit — Web Design Engine v0.2

A **local-first, dependency-free browser application** that turns one client brief into a themeable, four-page static website demo. This is an MVP for our agency, not a production website-builder service.

## Current capabilities

- Enter business name, industry, headline, business description, contact email, location, services, benefits and CTA.
- Create **Home**, **About**, **Services** and **Contact** pages from a single structured project.
- Choose **Hardline**, **Studio** or **Calm**; customize semantic colors, typography, corner radius, spacing density and tactile shadows.
- Preview every page instantly in a sandboxed iframe; switch desktop/mobile viewports.
- Add, reorder, replace or remove sections with **13 explicit data-bound adapters** referencing canonical Component Foundry IDs.
- Save and import `webdesign-brief.json`; export an **offline, self-contained ZIP** containing four HTML pages, CSS, project JSON and a README.
- No accounts, servers, external runtime dependencies, analytics, client data storage or API calls for generated content.

## Category-based layout recipes (v0.2)

Choose from six starter categories: Creative agency, Dental clinic, Restaurant and cafe, Real estate, Education and training, and Local services. Each has Classic Business, Visual Showcase and Lead-focused **layout approaches**, for 18 combinations derived from shared components, not 18 production-certified themes.

Selecting a category or template recomposes Home, About, Services and Contact while preserving entered business information (the category label changes the business industry). The independent **Fill fictional example** action replaces example business text after confirmation.

Theme style and palette are separate: Hardline, Studio and Calm styles can be combined with six curated palettes. Edit accent, background, surface and text colors individually, choose body font and heading font, adjust spacing density, radius and tactile shadows.

Restaurant recipes include price-free menu/offering cards; dental recipes have a disabled preferred-date enquiry layout. These are demonstrations, not operational bookings or verified client claims.

The v1 project schema adds `recipe`, `design.palette` and `design.headingFont`. Older project JSON without those fields is still supported by the runtime normalizer.

## Local quickstart

On your authorized workstation:

```powershell
cd C:\Users\Neo\WebDesignToolkit-Bootstrap\web-design-engine
python -m http.server 8000
```

Open `http://localhost:8000`. The engine requires an HTTP server for ES modules and the stylesheet. The exported HTML demo is static and can be opened from disk or deployed to an authorized static host.

## Reusable architecture

| Path | Role |
|---|---|
| `src/engine.js` | Pure project normalization, data-to-HTML adapters, generated stylesheet and ZIP exporter |
| `src/app.js` | Form state, page composer, theme controls, sandboxed preview and download interactions |
| `assets/foundry.css` | Frozen stylesheet snapshot from `WebDesignToolkit/design-system/library/styles/library.css` |
| `assets/editor.css` | The engine's own sharp/tactile editor appearance |
| `schemas/project.schema.json` | Portable website-project contract |
| `schemas/adapter-registry.json` | Canonical Foundry component IDs supported by this MVP |
| `tests/engine.test.mjs` | Node structural, security and export tests |
| `tests/browser.cjs` | Real Chrome UI and preview integration tests |
| `tools/export.mjs` | Offline ZIP generator for QA |
| `docs/QA-EVIDENCE.md` | Recorded local verification and limitations |

### Component contract

A page stores an **ordered list** of sections with stable `componentId` values, such as `WDT-HERO-002` and `WDT-SEC-002`. An engine adapter binds business information into the selected variant using HTML-escaping; the Foundry CSS and engine semantic tokens style it. The source gallery currently has 44 *draft* entries, but only **13 IDs have generation adapters**. Other entries cannot be claimed engine-compatible until explicitly adapted and tested.

### Data safety

The generated contact form is **disabled**. We never make false booking or submitted-message claims. Exported content and processes are illustrative; replace all claims and verify real business information before showing as an official site. The engine uses no remote scripts, no client analytics and no cloud processing.

## Verification

```powershell
node --test tests/engine.test.mjs
# Optional, requires locally installed Puppeteer and Chrome:
$env:PUPPETEER_MODULE="C:\Users\Neo\AppData\Local\npm-cache\_npx\4b4c857f6efdfb61\node_modules\puppeteer"
node tests/browser.cjs
node tools/export.mjs tests/sample-demo.zip
```

See `docs/QA-EVIDENCE.md`. No GitHub Actions are used. The browser test executable is a **local development dependency**, not a runtime dependency. The engine should be reviewed and accepted before enabling public hosting or marking it as production ready.

## Next phases

- Extend adapters for more of the 44 Foundry components and metadata-driven props.
- Full multi-page layout selection, repeatable industry recipes and content-brief templates.
- Editable client asset gallery, previews at 200% browser zoom and deeper accessibility checks.
- Explicit deploy/publish workflow, custom domains and delivery handoff after human approval.
- Optional AI-assisted content generation through user-controlled model settings; never silently send client details to external providers.

## Governance

The engine uses the organization-wide `AGENTS.md` guardrails. No GitHub Actions, background collection, forced pushes or automatic production deployments.


## Visual template gallery and image control (v0.3)

The template picker now uses three keyboard-accessible visual cards with original mini layouts, while preserving the existing selector as a fallback. Generate **Classic Business**, **Visual Showcase**, or **Lead-focused** page sets without changing client business information.

In the **Design** tab, choose **Bold Shapes**, **Editorial Frame**, **Structured Grid**, or **Client Photo**. These visual treatments are original local CSS, not stock images or externally hosted dependencies. The engine adapts service, process and sample showcase headings for the six categories without asserting real client projects or endorsements.

For a real business picture, upload an authorized **JPG, PNG, or WebP up to 900 KB**. The file remains in browser memory and is embedded into the generated static HTML and exported project JSON/ZIP. Explicitly enter descriptive alt text. There is no upload server or image processing API. Do not upload private, copyrighted-without-license, or confidential material; exported demo files will contain the photo data.

Image and template controls are demonstrations awaiting device and accessibility QA; the 44-item canonical Component Foundry still includes draft content.
