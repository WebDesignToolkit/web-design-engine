import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {defaultProject,normalizeProject,renderPage,themeCSS,buildSite,zipFiles,makePreviewDocument,ADAPTERS,PAGE_DEFS,PRESETS} from "../src/engine.js";
const sourceCSS=fs.readFileSync(new URL("../assets/foundry.css",import.meta.url),"utf8");
test("four pages and eleven explicit Foundry component adapters",()=>{
 const p=defaultProject();
 assert.equal(p.pages.length,4);assert.equal(Object.keys(ADAPTERS).length,11);
 assert.deepEqual(PAGE_DEFS.map(x=>x.slug),["index","about","services","contact"]);
 for(const def of PAGE_DEFS){
  const html=renderPage(p,def.slug);
  assert.match(html,/<main id="main-content">/);
  assert.match(html,/<h1/);
  assert.match(html,/lang="en"/);
  assert.match(html,/href="index.html"/);
 }
});
test("brand data binds across pages, with escaping and safe email fallback",()=>{
 const project=defaultProject();
 project.business.name='<script>alert("x")</script>';
 project.business.tagline="<img src=x onerror=alert(1)>";
 project.business.summary="Demos & clients";
 project.business.email="invalid@";
 project.design.accent="red;background:url(javascript:alert(1))";
 const p=normalizeProject(project);
 assert.equal(p.business.email,"");
 assert.equal(p.design.accent,PRESETS.hardline.accent);
 for(const pg of PAGE_DEFS){
  const html=renderPage(p,pg.slug);
  assert.doesNotMatch(html,/<script>|<img src=x/i);
  assert.match(html,/&lt;script&gt;/);
  assert.match(html,/contact.html/);
 }
 const css=themeCSS(p);assert.doesNotMatch(css,/javascript:/);
});
test("theme settings are normalized, bounded and reflected in exported CSS",()=>{
 const p=defaultProject();
 p.design={preset:"calm",accent:"#ABCDEF",bg:"#FAFAFA",surface:"#FFFFFF",ink:"#010101",radius:250,font:"serif",density:"spacious",shadow:false};
 const normalized=normalizeProject(p);
 assert.equal(normalized.design.radius,24);
 const css=themeCSS(normalized);
 assert.match(css,/#ABCDEF/);assert.match(css,/Georgia/);assert.match(css,/--wd-density:1.2/);
 assert.match(css,/--wd-radius:24px/);
});
test("reorder, remove and insert Foundry sections preserves layout",()=>{
 const p=defaultProject();
 const original=p.pages[0].sections;
 p.pages[0].sections=[original[1],original[0],{id:"new",componentId:"WDT-PORT-001"},original[2]];
 let html=renderPage(p,"index");
 assert.ok(html.indexOf("What we do")<html.indexOf("Better websites"));
 assert.match(html,/Selected ideas/);
 const p2=normalizeProject({...p,pages:p.pages.map(x=>x.slug==="about"?{...x,sections:[]}:x)});
 assert.equal(p2.pages.find(x=>x.slug==="about").sections.length,0);
 assert.match(renderPage(p2,"about"),/<h1 class="engine-page-title">About/);
});
test("unknown component IDs are ignored, duplicate section IDs corrected",()=>{
 const p=defaultProject();
 p.pages[0].sections=[{id:"same",componentId:"WDT-HERO-001"},{id:"same",componentId:"WDT-SEC-002"},{id:"evil",componentId:"NOPE"}];
 const out=normalizeProject(p).pages[0].sections;
 assert.equal(out.length,2);assert.notEqual(out[0].id,out[1].id);
});
test("export contains self-contained HTML, CSS and project source",()=>{
 const files=buildSite(defaultProject(),sourceCSS);
 assert.deepEqual(Object.keys(files).sort(),["README.md","about.html","assets/foundry.css","assets/site.css","contact.html","index.html","project.json","services.html"].sort());
 assert.equal(files["assets/foundry.css"],sourceCSS);
 assert.ok(files["project.json"].includes('"componentId": "WDT-HERO-002"'));
 const inline=makePreviewDocument(defaultProject(),"index",sourceCSS);
 assert.match(inline,/<style>[\s\S]+<\/style>/);
 assert.doesNotMatch(inline,/<link rel="stylesheet"/);
});
test("ZIP writer produces correctly structured binary signature",async()=>{
 const files=buildSite(defaultProject(),sourceCSS);
 const zip=zipFiles(files);
 const b=Buffer.from(await zip.arrayBuffer());
 assert.equal(b.readUInt32LE(0),0x04034b50);
 assert.equal(b.readUInt32LE(b.length-22),0x06054b50);
 assert.equal(b.readUInt16LE(b.length-12),8);
 assert.throws(()=>zipFiles({"../evil.txt":"bad"}),/Unsafe ZIP file/);
});
test("no simulated booking submission and no external runtime sources",()=>{
 const html=renderPage(defaultProject(),"contact");
 assert.match(html,/No booking or message is sent/);
 assert.match(html,/disabled/);
 assert.doesNotMatch(html,/<script|https?:\/\/|<iframe/i);
});
