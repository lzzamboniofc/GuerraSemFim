/* Interface v1.3 — aliança reversível, postura, Hospital e comandos por aldeia. */
'use strict';
const {strict:assert}=require('node:assert'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
const root=path.join(__dirname,'..'),store=new Map(),events={},dom={innerHTML:'',querySelector:()=>null};
const win={innerWidth:390,addEventListener:()=>{},scrollTo:()=>{},confirm:()=>true};
const doc={querySelector:s=>s==='#app'?dom:null,querySelectorAll:()=>[],addEventListener:(e,fn)=>events[e]=fn,body:{appendChild:()=>{}},createElement:()=>({setAttribute:()=>{},remove:()=>{}})};
const ctx={window:win,document:doc,Date,Math,JSON,console,setInterval:()=>{},setTimeout:()=>{},localStorage:{getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,String(v)),removeItem:k=>store.delete(k)}};vm.createContext(ctx);
for(const f of ['data','war','ai','campaign','expansion','engine'])vm.runInContext(fs.readFileSync(path.join(root,'js',`${f}.js`),'utf8'),ctx,{filename:f});
const E=win.GSF,C=win.GSF_CAMPAIGN,st=E.newGame({enemyAttacks:false}),v=E.active(st);v.buildings.embassy=3;v.buildings.wall=3;v.buildings.hospital=1;st.campaign.reputation.corvos=100;for(const k of ['wood','clay','iron','crop'])v.resources[k]=5000;assert(C.ally(st,'corvos').ok);E.recordWounded(st,v,{legionary:20});E.save(st);
vm.runInContext(fs.readFileSync(path.join(root,'js/app.js'),'utf8'),ctx,{filename:'app'});
const click=d=>events.click({target:{closest:()=>({dataset:d}),matches:()=>false}});
click({nav:'rivals'});assert(dom.innerHTML.includes('data-break-ally="corvos"'));click({breakAlly:'corvos'});assert(!C.isAlly(E.load(),'corvos'));
click({nav:'army'});assert(dom.innerHTML.includes('Hospital e feridos'));assert(dom.innerHTML.includes('data-heal-unit="legionary"'));
click({nav:'war'});assert(dom.innerHTML.includes('Postura defensiva'));assert(dom.innerHTML.includes('data-defense-mode="fortified"'));
click({defenseMode:'fortified'});assert.equal(E.defenseMode(E.active(E.load())),'fortified');
console.log('✓ UI v1.3 — romper aliança, Hospital e defesa');
