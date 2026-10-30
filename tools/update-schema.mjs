import fs from "node:fs";
import {CATEGORIES,TEMPLATES,PALETTES} from "../src/recipes.js";
const file=new URL("../schemas/project.schema.json",import.meta.url);
const s=JSON.parse(fs.readFileSync(file,"utf8"));
s.properties.recipe={type:"object",additionalProperties:false,
 required:["category","template"],
 properties:{
  category:{enum:Object.keys(CATEGORIES)},
  template:{enum:Object.keys(TEMPLATES)}
 }};
s.required.push("recipe");
s.properties.design.properties.palette={enum:["custom",...Object.keys(PALETTES)]};
s.properties.design.properties.headingFont={enum:["system","serif","mono","humanist","display"]};
s.properties.design.required.push("palette","headingFont");
fs.writeFileSync(file,JSON.stringify(s,null,2)+"\n");
const pkg=new URL("../package.json",import.meta.url);
const p=JSON.parse(fs.readFileSync(pkg,"utf8").replace(/^\uFEFF/,""));p.version="0.2.0";
fs.writeFileSync(pkg,JSON.stringify(p,null,2)+"\n");
console.log("SCHEMA_UPDATED",Object.keys(CATEGORIES).length,Object.keys(TEMPLATES).length);
