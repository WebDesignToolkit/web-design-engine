# WebDesignToolkit — Web Design Engine v0.1

A **local-first, dependency-free browser application** that turns one client brief into a themeable, four-page static website demo. This is an MVP for our agency, not a production website-builder service.

## Current capabilities

- Enter business name, industry, headline, business description, contact email, location, services, benefits and CTA.
- Create **Home**, **About**, **Services** and **Contact** pages from a single structured project.
- Choose **Hardline**, **Studio** or **Calm**; customize semantic colors, typography, corner radius, spacing density and tactile shadows.
- Preview every page instantly in a sandboxed iframe; switch desktop/mobile viewports.
- Add, reorder, replace or remove sections with **11 explicit data-bound adapters** referencing canonical Component Foundry IDs.
- Save and import `webdesign-brief.json`; export an **offline, self-contained ZIP** containing four HTML pages, CSS, project JSON and a README.
- No accounts, servers, external runtime dependencies, analytics, client data storage or API calls for generated content.

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

A page stores an **ordered list** of sections with stable `componentId` values, such as `WDT-HERO-002` and `WDT-SEC-002`. An engine adapter binds business information into the selected variant using HTML-escaping; the Foundry CSS and engine semantic tokens style it. The source gallery currently has 44 *draft* entries, but only **11 IDs have generation adapters**. Other entries cannot be claimed engine-compatible until explicitly adapted and tested.

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
