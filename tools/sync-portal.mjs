import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";
import crypto from "node:crypto";
import child from "node:child_process";
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const site=path.resolve(root,"../website");
const portal=path.join(site,"engine");
if(!fs.existsSync(path.join(site,"library/index.html")))throw Error("Website Foundry review branch not checked out");
const branch=child.execFileSync("git",["-C",site,"branch","--show-current"],{encoding:"utf8"}).trim();
if(branch!=="feat/agency-ui-library-portal-v0-1")throw Error("Unexpected website branch: "+branch);
const paths=["index.html","assets/editor.css","assets/foundry.css","assets/favicon.svg","src/engine.js","src/app.js"];
for(const rel of paths){
 const src=path.join(root,rel),dest=path.join(portal,rel);
 fs.mkdirSync(path.dirname(dest),{recursive:true});
 fs.copyFileSync(src,dest);
 const srcHash=crypto.createHash("sha256").update(fs.readFileSync(src)).digest("hex");
 const destHash=crypto.createHash("sha256").update(fs.readFileSync(dest)).digest("hex");
 if(srcHash!==destHash)throw Error("Copy mismatch: "+rel);
}
fs.writeFileSync(path.join(portal,"README.md"),"# WebDesignToolkit Web Design Engine preview snapshot\n\nThese files are a **review-only mirror** of the canonical WebDesignToolkit/web-design-engine feature branch feat/engine-v0-1. The engine source repo owns all implementation and tests; edit and review there, then run tools/sync-portal.mjs from the engine repo to refresh this snapshot. Do not use GitHub Actions, remote CDNs or autonomous publishing.\n\nStatic preview: /engine/. Source: https://github.com/WebDesignToolkit/web-design-engine\n\nData entered in the engine remains in the user's browser; the optional exported ZIP stays local unless explicitly downloaded. No server-side client storage, bookings or emails.\n");
const indexPath=path.join(site,"index.html");
let index=fs.readFileSync(indexPath,"utf8");
if(!index.includes('href="./engine/"')){
 const key='<a href="./library/">UI Library</a>';
 if(!index.includes(key))throw Error("Existing UI Library link not found");
 index=index.replace(key,key+'<a href="./engine/">Design Engine</a>');
 fs.writeFileSync(indexPath,index);
}
const galleryPath=path.join(site,"library/index.html");
let gallery=fs.readFileSync(galleryPath,"utf8");
const old='<a href="../">Tools</a>';
if(!gallery.includes('href="../engine/"')){
 if(!gallery.includes(old))throw Error("Foundry navigation anchor missing");
 gallery=gallery.replace(old,old+'<a href="../engine/">Design Engine</a>');
 fs.writeFileSync(galleryPath,gallery);
}
console.log(JSON.stringify({mirrored:paths.length,portal,websiteBranch:branch,navigation:true},null,2));
