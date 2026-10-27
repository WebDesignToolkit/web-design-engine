import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {ADAPTERS,PRESETS,VERSION} from "../src/engine.js";
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const manifest={
 schemaVersion:1,engineVersion:VERSION,
 canonicalFoundry:"https://github.com/WebDesignToolkit/design-system/tree/feat/agency-ui-library-v0-1/library",
 scope:"Engine adapters for currently supported Foundry IDs, not all 44.",
 adapterStatus:"draft-reviewed-in-local-tests-only",
 adapters:Object.entries(ADAPTERS).map(([componentId,meta])=>({
  componentId,source:"WebDesignToolkit/design-system",label:meta.label,family:meta.family,
  renderer:"src/engine.js#adapter",supported:true,
  boundFields:["business.name","business.tagline","business.summary","business.industry","business.location","business.services","business.benefits","business.email","business.cta"],
  propsContract:"The engine binds approved business fields, HTML-escapes content, and uses semantic theme CSS.",
  limitations:["Illustrative content","Human review required before client deployment"]
 })),
 themes:Object.keys(PRESETS)
};
fs.writeFileSync(path.join(root,"schemas/adapter-registry.json"),JSON.stringify(manifest,null,2)+"\n");
console.log("ADAPTER MANIFEST",manifest.adapters.length,"IDs");
