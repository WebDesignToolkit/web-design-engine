# Engine architecture and boundary

## Purpose

Build agency website demos from structured briefs, not opaque AI-generated blobs. Every generated section records a known Foundry component ID and is deterministically produced by an explicit adapter.

## Data pipeline

1. Browser intake form updates an in-memory, normalized **project v1**.
2. Four page definitions store ordered section IDs and canonical Foundry `componentId` values.
3. The page composer uses the 11 supported adapter renderers in `src/engine.js`, escaping all business-origin strings.
4. Site-wide `data-wd-theme` and semantic CSS variables apply brand colors, typography, radius, density and pressed shadows across all pages.
5. The sandboxed iframe receives generated HTML with inline trusted local styles for immediate preview.
6. Explicit export generates a ZIP with four HTML pages, Foundry CSS, theme CSS, normalized project JSON, and README. No server involved.

## Foundation provenance

Source catalog of components: `WebDesignToolkit/design-system/library/registry.json`, 44 **draft** entries, not a production-certified design system.
Engine-ready subset: **11** matched component IDs, recorded in `schemas/adapter-registry.json`.

The Foundry stylesheet is intentionally copied as `assets/foundry.css`, not fetched from a runtime URL. Use `tools/sync-portal.mjs` only for the website preview snapshot after reviewing code. Future version pins should record exact source SHA.

## Boundaries

- Do **not** assume that any arbitrary Foundry raw HTML can safely be transformed into runtime bindings automatically.
- Do **not** accept scripts, HTML, CSS or URLs directly from form input.
- Do **not** connect real booking/contact submissions until a backend, privacy notices, storage rules and consent flows have been explicitly approved.
- Do **not** auto-deploy client sites or the engine, or use GitHub Actions.
- Do **not** label sample business copy, process, price, reviews or portfolio as verified customer facts.

## Future expansion

- Typed adapter props derived from explicit Foundry schemas, richer variants and per-section content binding.
- Page recipe library by industry and user-configurable page count.
- Client asset upload with validation and licensing provenance.
- Client-friendly one-click preview links and approved delivery/deployment workflow.
- Visual regression, browser zoom, accessibility and security acceptance beyond this MVP.
