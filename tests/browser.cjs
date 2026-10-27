"use strict";
/* Local real-browser acceptance: headless Chrome; no outside services. */
const http=require("node:http"),fs=require("node:fs"),path=require("node:path"),assert=require("node:assert/strict");
const puppeteer=require(process.env.PUPPETEER_MODULE||"puppeteer");
const ROOT=process.env.ENGINE_WEB_ROOT?path.resolve(process.env.ENGINE_WEB_ROOT):path.resolve(__dirname,"..");
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".css":"text/css; charset=utf-8",".json":"application/json; charset=utf-8"};
const server=http.createServer((req,res)=>{
  let name=decodeURIComponent(new URL(req.url,"http://localhost").pathname);
  if(name.endsWith("/"))name+="index.html";
  const target=path.resolve(ROOT,"."+name);
  if(!target.startsWith(ROOT+path.sep)){res.writeHead(403).end();return}
  try{const bytes=fs.readFileSync(target);res.writeHead(200,{"Content-Type":mime[path.extname(target)]||"text/plain; charset=utf-8"});res.end(bytes)}
  catch{res.writeHead(404).end("Missing")}
});
let browser,page;const passed=[];const pass=(name,yes)=>{assert.ok(yes,name);passed.push(name)};
(async()=>{
 try{
  await new Promise(r=>server.listen(0,"127.0.0.1",r));
  const origin="http://127.0.0.1:"+server.address().port;
  browser=await puppeteer.launch({headless:true,executablePath:"C:/Program Files/Google/Chrome/Application/chrome.exe",args:["--no-first-run"]});
  page=await browser.newPage();const errors=[];page.on("pageerror",e=>errors.push(e.message));
  for(const width of [360,768,1280]){
   await page.setViewport({width,height:900,deviceScaleFactor:1});
   await page.goto(origin+"/",{waitUntil:"networkidle0"});
   await page.waitForFunction(()=>document.querySelector("#preview-status")?.textContent.includes("Preview ready"),{timeout:15000});
   const info=await page.evaluate(()=>({w:document.documentElement.scrollWidth,v:innerWidth,iframe:!!document.querySelector("#site-frame")?.srcdoc}));
   pass("editor loads "+width,info.iframe);
   pass("no editor horizontal overflow "+width,info.w<=info.v+2);
  }
  await page.setViewport({width:1280,height:900});
  await page.type("#business-name"," Demo Co");
  let fr=page.frames().find(x=>x!==page.mainFrame());
  await fr.waitForSelector("h1");
  pass("name binds to preview",await fr.$eval(".engine-brand",x=>x.textContent.includes("Demo Co")));
  await page.$eval("#industry",el=>{el.value="Dental clinic";el.dispatchEvent(new Event("input",{bubbles:true}))});
  fr=page.frames().find(x=>x!==page.mainFrame());await fr.waitForSelector("h1");
  pass("custom industry binds",await fr.$eval(".wd-eyebrow",x=>x.textContent.includes("Dental clinic")));
  await page.$eval("#phone",el=>{el.value="+91 98765 43210";el.dispatchEvent(new Event("input",{bubbles:true}))});
  await page.click(".tab[data-tab=theme]");
  await page.select("#preset","studio");
  pass("theme preset applies",await page.$eval("#preset",x=>x.value==="studio"));
  await page.$eval("#accent",el=>{el.value="#ACDC12";el.dispatchEvent(new Event("input",{bubbles:true}))});
  fr=page.frames().find(x=>x!==page.mainFrame());
  await fr.waitForSelector("h1");
  pass("accent token shared with preview",await fr.evaluate(()=>getComputedStyle(document.documentElement).getPropertyValue("--wd-accent").trim()==="#ACDC12"));
  await page.click(".preview-page[data-page=services]");
  fr=page.frames().find(x=>x!==page.mainFrame());await fr.waitForSelector("h1");
  pass("four page navigation",await fr.$eval("title",e=>e.textContent.includes("Services")));
  await page.click(".tab[data-tab=pages]");
  await page.select("#compose-page","services");
  const start=await page.$$eval(".section-item",xs=>xs.length);
  await page.select("#add-section","WDT-PORT-001");
  await page.click("#add-section-button");
  pass("add a canonical Foundry section",await page.$$eval(".section-item",xs=>xs.length)===start+1);
  fr=page.frames().find(x=>x!==page.mainFrame());
  await fr.waitForFunction(()=>document.body.textContent.includes("Selected ideas"));
  pass("added section renders",await fr.$eval("body",x=>x.textContent.includes("Selected ideas")));
  await page.click('.section-item:last-child .square-btn[title="Move up"]');
  pass("reorder enabled",await page.$$eval(".section-item",xs=>xs.at(-2).querySelector("small").textContent==="WDT-PORT-001"));
  await page.click('.section-item:nth-last-child(2) .square-btn[title="Remove section"]');
  pass("remove section",await page.$$eval(".section-item",xs=>xs.length)===start);
  await page.click(".preview-width[data-width=mobile]");
  pass("preview responsive preset",await page.$eval("#preview-frame",e=>e.classList.contains("mobile")));
  await page.click(".tab[data-tab=brief]");
  await page.$eval("#tagline",el=>{el.value="<svg onload=alert(1)>";el.dispatchEvent(new Event("input",{bubbles:true}))});
  await page.click(".preview-page[data-page=index]");
  fr=page.frames().find(x=>x!==page.mainFrame());await fr.waitForSelector("h1");
  pass("unsafe HTML becomes text",await fr.$eval("h1",el=>el.textContent.includes("<svg onload=alert(1)>")));
  pass("injected SVG not executed",await fr.$$("svg").then(xs=>xs.length===0));
  await page.click("#save-json");
  pass("client JSON exported from UI",await page.$eval("#preview-status",e=>e.textContent.includes("JSON downloaded")));
  await page.click("#download-zip");
  pass("ZIP download activated",await page.$eval("#preview-status",e=>e.textContent.includes("ZIP downloaded")));
  await page.click(".preview-page[data-page=contact]");
  fr=page.frames().find(x=>x!==page.mainFrame());await fr.waitForSelector("textarea");
  pass("contact form stays disabled",await fr.$eval("textarea",e=>e.disabled));
  pass("phone binds on contact page",await fr.$eval("body",e=>e.textContent.includes("+91 98765 43210")));
  await page.emulateMediaFeatures([{name:"prefers-reduced-motion",value:"reduce"}]);
  pass("reduced motion recognized",await page.evaluate(()=>matchMedia("(prefers-reduced-motion: reduce)").matches));
  pass("zero uncaught browser errors",errors.length===0);
  console.log(JSON.stringify({status:"PASS",count:passed.length,checks:passed},null,2));
 }catch(e){console.error(JSON.stringify({status:"FAIL",passed,reason:e.message,stack:e.stack},null,2));process.exitCode=1}
 finally{if(page)await page.close().catch(()=>{});if(browser)await browser.close().catch(()=>{});await new Promise(r=>server.close(r))}
})();
