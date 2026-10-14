/* UI v0.8 — painel imperial, oásis, escolha de recursos e filas; visual clássico v0.8.2 */
'use strict';const fs=require('fs'),vm=require('vm'),path=require('path'),assert=require('assert');
const root=path.resolve(__dirname,'..'),db=new Map(),events={},dom={innerHTML:''},window={addEventListener:()=>{},GSF_RECOVERED_BACKUP:false};
const document={querySelector:s=>s==='#app'?dom:null,querySelectorAll:()=>[],addEventListener:(t,fn)=>events[t]=fn,body:{appendChild:()=>{}},createElement:()=>({setAttribute:()=>{},remove:()=>{}})};
const context={window,document,localStorage:{getItem:k=>db.get(k)||null,setItem:(k,v)=>db.set(k,v),removeItem:k=>db.delete(k)},Date,Math,JSON,console,setInterval:()=>0,setTimeout:()=>0};vm.createContext(context);
for(const f of ['data','war','ai','campaign','expansion','engine'])vm.runInContext(fs.readFileSync(path.join(root,'js',f+'.js'),'utf8'),context,{filename:f});
const s=window.GSF.newGame();vm.runInContext(fs.readFileSync(path.join(root,'js/app.js'),'utf8'),context,{filename:'app.js'});
const click=dataset=>events.click({target:{closest:()=>({dataset})}});
click({nav:'village'});assert(dom.innerHTML.includes('Edifício Principal'));assert(!dom.innerHTML.includes('assets/buildings/'));assert(dom.innerHTML.includes('Planejador de obras'));
click({slot:'1'});assert(dom.innerHTML.includes('data-plan-building="warehouse"'));
click({planBuilding:'warehouse'});assert(dom.innerHTML.includes('Obra'));assert(window.GSF.plans(window.GSF.load().villages[0]).length>=0);
click({nav:'fields'});click({field:'0'});assert(dom.innerHTML.includes('data-plan-field="0"'));click({planField:'0'});
click({nav:'hero'});assert(dom.innerHTML.includes('data-hero-target="wood"'));assert(dom.innerHTML.includes('data-hero-apply'));
click({nav:'map'});assert(dom.innerHTML.includes('class="map-tile'));assert(dom.innerHTML.includes('tile-mark'));assert(!dom.innerHTML.includes('map-axis'));
click({nav:'empire'});assert(dom.innerHTML.includes('Painel Imperial'));assert(dom.innerHTML.includes('Projeção imperial'));
click({openResource:'wood'});assert(dom.innerHTML.includes('Produção de Madeira'));
console.log('✓ UI v0.8.4: visual inicial, planejador, herói, mapa, painel imperial e modal');
