import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {defaultProject,normalizeProject,renderPage,themeCSS,buildSite,zipFiles,makePreviewDocument,ADAPTERS,PAGE_DEFS,PRESETS} from "../src/engine.js";
const sourceCSS=fs.readFileSync(new URL("../assets/foundry.css",import.meta.url),"utf8");
test("four pages and thirteen explicit Foundry component adapters",()=>{
 const p=defaultProject();
 assert.equal(p.pages.length,4);assert.equal(Object.keys(ADAPTERS).length,13);
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

import {CATEGORIES,TEMPLATES,PALETTES,composeRecipe,categoryExample} from "../src/recipes.js";
test("six industry recipes × three layout options produce four composed pages",()=>{
 assert.equal(Object.keys(CATEGORIES).length,6);
 assert.equal(Object.keys(TEMPLATES).length,3);
 for(const c of Object.keys(CATEGORIES))for(const t of Object.keys(TEMPLATES)){
  const pages=composeRecipe(c,t);
  assert.equal(pages.length,4);
  assert.equal(new Set(pages.map(x=>x.slug)).size,4);
  for(const page of pages){
   assert.ok(page.sections.length>=3);
   assert.ok(page.sections.every(entry=>Object.hasOwn(ADAPTERS,entry.componentId)),c+"/"+t+"/"+page.slug);
  }
 }
});
test("category-specific composition does not invent prices or bookings",()=>{
 const dental=composeRecipe("dental","classic").find(p=>p.slug==="contact");
 assert.ok(dental.sections.some(x=>x.componentId==="WDT-BOOK-002"));
 const restaurant=composeRecipe("restaurant","showcase").find(p=>p.slug==="index");
 assert.ok(restaurant.sections.some(x=>x.componentId==="WDT-PROD-001"));
 const p=defaultProject();p.recipe={category:"restaurant",template:"showcase"};p.pages=composeRecipe("restaurant","showcase");
 p.business.services=categoryExample("restaurant").services;p.business.industry=CATEGORIES.restaurant.industry;
 const html=renderPage(p,"index");
 assert.match(html,/Menu highlights/);
 assert.match(html,/No verified price/);
 const d=defaultProject();d.recipe={category:"dental",template:"classic"};d.pages=composeRecipe("dental","classic");
 assert.match(renderPage(d,"contact"),/not a reservation/);
});
test("recipe metadata and font/color palette survive normalization and export",()=>{
 const p=defaultProject();
 p.recipe={category:"education",template:"conversion"};
 p.design.palette="ocean";
 Object.assign(p.design,PALETTES.ocean);
 p.design.headingFont="display";
 p.pages=composeRecipe("education","conversion");
 p.business.name="Existing client name";
 const normalized=normalizeProject(p);
 assert.equal(normalized.recipe.category,"education");
 assert.equal(normalized.recipe.template,"conversion");
 assert.equal(normalized.business.name,"Existing client name");
 assert.equal(normalized.design.headingFont,"display");
 assert.match(themeCSS(normalized),/--wd-heading-font:Impact/);
 assert.match(themeCSS(normalized),/#8CCAF5/);
 assert.equal(JSON.parse(buildSite(normalized,sourceCSS)["project.json"]).recipe.category,"education");
});

test("all 18 recipes render four valid pages using industry examples",()=>{
 for(const category of Object.keys(CATEGORIES)){
  for(const template of Object.keys(TEMPLATES)){
   const p=defaultProject();
   p.recipe={category,template};p.pages=composeRecipe(category,template);
   Object.assign(p.business,categoryExample(category));
   p.business.industry=CATEGORIES[category].industry;
   for(const slug of PAGE_DEFS.map(x=>x.slug)){
    const html=renderPage(p,slug);
    assert.match(html,/<main id="main-content">/);
    assert.match(html,/<h1(?:\s|>)/);
    assert.doesNotMatch(html,/\bundefined\b/);
    assert.ok(html.includes(p.business.name.replaceAll("&","&amp;")),category+" "+template+" "+slug);
    if(category==="dental"&&slug==="contact")assert.match(html,/type="date" disabled/);
   }
  }
 }
});

test("portable photo preview and export sanitize image data URLs",()=>{
 const p=defaultProject();
 p.media={style:"photo",image:"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAAB",alt:"Sample client photograph"};
 const html=renderPage(p,"index");
 assert.match(html,/engine-visual--photo/);
 assert.match(html,/alt="Sample client photograph"/);
 const exported=buildSite(p,sourceCSS);
 assert.match(exported["index.html"],/data:image\/png;base64,/);
 const restored=JSON.parse(exported["project.json"]);
 assert.equal(restored.media.style,"photo");
 assert.equal(restored.media.image,p.media.image);
 p.media.image="data:image/svg+xml;base64,PHN2Zz4=";
 assert.equal(normalizeProject(p).media.image,"");
 p.media.alt="<svg onload=alert(1)>";
 assert.doesNotMatch(renderPage(p,"index"),/onload=alert/);
});
test("visual variants follow layout and category copy without remote images",()=>{
 const p=defaultProject();p.media={style:"blueprint",image:"",alt:"Illustration"};
 p.recipe={category:"dental",template:"showcase"};p.pages=composeRecipe("dental","showcase");
 Object.assign(p.business,categoryExample("dental"));p.business.industry=CATEGORIES.dental.industry;
 const html=renderPage(p,"index");
 assert.match(html,/data-wd-layout="showcase"/);
 assert.match(html,/engine-visual--blueprint/);
 assert.match(renderPage(p,"services"),/Care and consultations/);
 assert.match(themeCSS(p),/engine-visual--blueprint/);
});
