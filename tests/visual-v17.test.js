/* v1.7: cenário vivo, crescimento por população e compatibilidade da arte. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),window={};
const ctx=vm.createContext({window,Math,Number,Object,Array});
for(const p of ['js/data.js','js/art.js','js/art-life.js'])vm.runInContext(fs.readFileSync(path.join(root,p),'utf8'),ctx,{filename:p});
const art=window.GSF_ART,data=window.GSF_DATA;
assert.equal(art.LIFE_VERSION,'1.7');
const base=art.townGround(0,'romans',10),grown=art.townGround(12,'romans',150),gauls=art.townGround(3,'gauls',50);
assert(base.startsWith('<svg class="town-ground"'));
for(const name of ['life-walker','life-cart','life-birds','life-livestock','life-smoke','life-ripple','life-lantern'])assert(base.includes(name),name);
assert(!base.includes('stroke-dasharray="3 1.2"'));
assert(grown.includes('stroke-dasharray="3 1.2"'));
assert((grown.match(/class="life-walker"/g)||[]).length>(base.match(/class="life-walker"/g)||[]).length);
assert((grown.match(/class="life-smoke"/g)||[]).length>(base.match(/class="life-smoke"/g)||[]).length);
assert(gauls.includes('#356d4b'),'Cores da tribo presentes no cenário');
assert(!/NaN|undefined|https?:\/\//.test(base+grown+gauls));
const fields=art.fieldGround();assert(fields.startsWith('<svg')&&fields.includes('field-ground')&&fields.includes('life-ripple'));
assert(!/NaN|undefined|https?:\/\//.test(fields));
for(const key of Object.keys(data.BUILDINGS)){
 for(const lvl of [1,5,10,15]){
  const svg=art.building(key,lvl,'romans');
  assert(svg.startsWith('<svg'),key);assert(svg.includes('art-building'),key);
 }
}
for(const type of ['wood','clay','iron','crop'])assert(art.field(type,10).startsWith('<svg'));
for(const fn of ['index.html','preview-local.html']){
 const html=fs.readFileSync(path.join(root,fn),'utf8');
 assert(html.includes('js/art-life.js'),fn);
 assert(html.includes('styles-life.css'),fn);
 assert(html.indexOf('js/art.js')<html.indexOf('js/art-life.js'),fn);
}
const ui=fs.readFileSync(path.join(root,'js/ui/village.js'),'utf8');
assert(ui.includes('ART?.fieldGround?.()'),'Campos não possuem cenário próprio');
assert(ui.includes('ART.townGround(E.buildLevel(v,\\'wall\\'),state.tribe,E.population(v))'),'Aldeia não usa população real');
const css=fs.readFileSync(path.join(root,'styles-life.css'),'utf8');
assert(css.includes('prefers-reduced-motion:reduce'));
console.log('✓ v1.7: aldeia viva, crescimento, campos, compatibilidade e movimento reduzido');
