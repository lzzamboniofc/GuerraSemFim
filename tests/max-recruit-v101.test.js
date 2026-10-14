/* Recrutamento máximo v1.0.1 — cálculos, limites e saves. */
'use strict';
const vm=require('node:vm'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),store=new Map(),ctx={window:{},console,Date,JSON,Math,localStorage:{getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,String(v)),removeItem:k=>store.delete(k)}};
vm.createContext(ctx);
for(const f of ['data','war','ai','campaign','expansion','engine'])vm.runInContext(fs.readFileSync(path.join(root,'js',f+'.js'),'utf8'),ctx,{filename:f});
const E=ctx.window.GSF,mk=()=>{const st=E.newGame({tribe:'romans'}),v=E.active(st);v.buildings.barracks=3;return {st,v};};
const stock=(v,n)=>{for(const k of ['wood','clay','iron','crop'])v.resources[k]=n;};
const test=(n,fn)=>{fn();console.log('✓ '+n)};
test('Recursos limitantes e bloqueios',()=>{const {st,v}=mk();v.resources={wood:600,clay:1000,iron:1500,crop:70};assert.equal(E.maxTrainable(st,v,'legionary'),2);assert.equal(E.maxTrainable(st,v,'praetorian'),0);stock(v,0);assert.equal(E.maxTrainable(st,v,'legionary'),0);});
test('Redução após recrutar',()=>{const {st,v}=mk();stock(v,1000);const n=E.maxTrainable(st,v,'legionary');assert(E.train(st,v,'legionary',n).ok);assert(E.maxTrainable(st,v,'legionary')<n);assert(E.validateState(st));});
test('Mais que 500 unidades com save válido',()=>{const {st,v}=mk();stock(v,200000);const n=E.maxTrainable(st,v,'legionary');assert(n>500);assert(E.train(st,v,'legionary',n).ok);assert(E.validateState(st));assert(E.save(st));assert.equal(E.load().villages[0].trainingQueue.at(-1).qty,n);});
test('Teto de efetivo e fila',()=>{const {st,v}=mk();stock(v,1e8);v.troops.legionary=999990;assert.equal(E.maxTrainable(st,v,'legionary'),10);assert(E.train(st,v,'legionary',10).ok);assert.equal(E.maxTrainable(st,v,'legionary'),0);assert(!E.canTrain(st,v,'legionary',1).ok);});
test('Pesquisa e fila antiga',()=>{const {st,v}=mk();stock(v,1e6);assert.equal(E.maxTrainable(st,v,'praetorian'),0);v.research.unlocked.push('praetorian');assert(E.maxTrainable(st,v,'praetorian')>0);v.trainingQueue.push({id:'old',unitId:'legionary',building:'barracks',qty:500,endsAt:Date.now()+60000});assert(E.validateState(st));assert(E.importSave(JSON.stringify(st)).ok);});
console.log('✓ v1.0.1 — motor do recrutamento máximo');
