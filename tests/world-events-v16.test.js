/* Temporada v1.6: marcos Natares, artefatos, aliados, evolução e saves. */
'use strict';
const fs=require('fs'),vm=require('vm'),path=require('path'),assert=require('assert');
const mem=new Map(),window={},ctx={window,Date,Math,JSON,console,localStorage:{getItem:k=>mem.get(k)||null,setItem:(k,v)=>mem.set(k,v),removeItem:k=>mem.delete(k)}};
vm.createContext(ctx);
for(const file of ['data','war','ai','campaign','expansion','world-events','engine'])
 vm.runInContext(fs.readFileSync(path.join(__dirname,'..','js',file+'.js'),'utf8'),ctx,{filename:file});
const E=window.GSF,W=window.GSF_WORLD,AI=window.GSF_AI;
const st=E.newGame({enemyAttacks:false}),v=E.active(st),w=W.init(st);
assert(E.validateState(st));assert.strictEqual(w.level,0);assert.strictEqual(W.phase(st),'Fundação');
assert(!W.captureRelic(st,v).ok);assert(!W.conquerWonder(st,v).ok);
for(let t=1;t<=6;t++){st.ai.turn=t;W.onTurn(st,t,Date.now());}
assert.strictEqual(w.history.length,1);assert(W.modifier(st,'crop')>1);
st.ai.turn=9;assert(W.modifier(st,'crop')>1,'o bônus sazonal deve durar quatro turnos');
st.ai.turn=10;assert.strictEqual(W.modifier(st,'crop'),1,'o bônus sazonal não pode permanecer no quinto turno');
st.ai.turn=11;st.ai.nextTurnAt=Date.now()-1;AI.resolveDue(st,st.ai.nextTurnAt);
assert.strictEqual(st.ai.turn,12);assert.strictEqual(w.lastTurn,12);assert(st.reports.some(r=>r.title.includes('rumores')));
st.ai.turn=56;W.onTurn(st,56,Date.now());
assert.strictEqual(w.natarLevel,1);assert.strictEqual(W.phase(st),'Planos e Maravilha');
v.buildings.treasury=10;v.buildings.residence=10;v.administrators=1;
v.resources={wood:500000,clay:500000,iron:500000,crop:500000};
v.troops.legionary=100;
assert(W.captureRelic(st,v).ok);assert(W.modifier(st,'crop')>1);assert(!W.captureRelic(st,v).ok);
assert(W.conquerWonder(st,v).ok);assert.strictEqual(w.wonderVillageId,v.id);assert.strictEqual(v.administrators,0);
assert(W.capturePlan(st,v).ok);assert.strictEqual(w.planVillageId,v.id);
assert(!W.allyPlan(st).ok);
assert(W.upgrade(st,v).ok);assert(!W.upgrade(st,v).ok);
assert(E.save(st));const q=w.queue;st.lastTick=q.startedAt;E.advance(st,q.endsAt+1);
assert.strictEqual(w.level,1);assert.strictEqual(w.queue,null);
// A produção respeita a capacidade; restabelecer os recursos para testar os níveis altos.
v.resources={wood:500000,clay:500000,iron:500000,crop:500000};
w.level=49;
assert(!W.canUpgrade(st,v).ok);
st.campaign.allies.push('corvos');assert(W.allyPlan(st).ok);assert(W.hasCoalition(st));
assert(W.canUpgrade(st,v).ok);
st.campaign.allies=[];assert(!W.canUpgrade(st,v).ok);
st.campaign.allies.push('corvos');w.level=99;
w.queue={level:100,startedAt:1000,endsAt:2000};assert(W.resolveDue(st,2000));
assert.strictEqual(w.winner,'player');assert.strictEqual(w.level,100);assert(!W.canUpgrade(st,v).ok);
assert(E.validateState(st));assert(E.save(st));assert.strictEqual(E.load().worldEvents.winner,'player');
const invalid=JSON.parse(JSON.stringify(st));invalid.worldEvents.level=101;assert(!E.validateState(invalid));
const legacy=JSON.parse(JSON.stringify(st));delete legacy.worldEvents;
assert(E.validateState(legacy));assert(E.save(legacy));assert(E.load().worldEvents);
console.log('✓ v1.6: temporada, relíquia, planos, Maravilha, vitória e migração');