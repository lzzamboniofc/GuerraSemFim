/* Recrutamento máximo v1.0.1 — interface por tropa e cliques. */
'use strict';
const vm=require('node:vm'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),saved=new Map(),callbacks={},dom={innerHTML:''},input={value:'5',focus(){}};
const win={innerWidth:390,addEventListener:()=>{},scrollTo:()=>{}},doc={querySelector:s=>s==='#app'?dom:s==='#train-legionary'?input:null,querySelectorAll:()=>[],addEventListener:(e,f)=>callbacks[e]=f,body:{appendChild:()=>{}},createElement:()=>({setAttribute:()=>{},remove:()=>{}})};
const ctx={window:win,document:doc,localStorage:{getItem:k=>saved.get(k)||null,setItem:(k,v)=>saved.set(k,String(v)),removeItem:k=>saved.delete(k)},console,Date,JSON,Math,setTimeout:()=>0,setInterval:()=>0};
vm.createContext(ctx);for(const f of ['data','war','ai','campaign','expansion','engine'])vm.runInContext(fs.readFileSync(path.join(root,'js',f+'.js'),'utf8'),ctx,{filename:f});
const E=win.GSF,st=E.newGame(),v=E.active(st);v.buildings.barracks=3;for(const k of ['wood','clay','iron','crop'])v.resources[k]=5000;E.save(st);
require('./_load-ui')(ctx);
const click=d=>callbacks.click({target:{closest:()=>({dataset:d})}});
click({nav:'army'});assert(dom.innerHTML.includes('data-max-train="legionary"'));assert(dom.innerHTML.includes('data-max-train="praetorian"'));assert(dom.innerHTML.includes('Máximo agora:'));assert.match(dom.innerHTML,/data-max-train="praetorian" disabled/);
const stored=E.load(),max=E.maxTrainable(stored,E.active(stored),'legionary');click({maxTrain:'legionary'});assert.equal(input.value,String(max));click({train:'legionary'});assert.equal(E.load().villages[0].trainingQueue.at(-1).qty,max);
console.log('✓ v1.0.1 — botão Máx. e recrutamento');
