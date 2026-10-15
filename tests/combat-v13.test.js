/* Guerra Sem Fim v1.3 — diplomacia reversível, Hospital, defesas e estratégia NPC. */
'use strict';
const vm=require('node:vm'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),storage=new Map();
const ctx={window:{},console,Math,Date,JSON,localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,String(v)),removeItem:k=>storage.delete(k)}};
vm.createContext(ctx);
for(const name of ['data','war','ai','campaign','expansion','engine'])vm.runInContext(fs.readFileSync(path.join(root,'js',name+'.js'),'utf8'),ctx,{filename:name});
const E=ctx.window.GSF,C=ctx.window.GSF_CAMPAIGN,AI=ctx.window.GSF_AI;
const game=()=>{const st=E.newGame({enemyAttacks:true}),v=E.active(st);for(const k of ['wood','clay','iron','crop'])v.resources[k]=100000;st.ai.nextTurnAt=Date.now()+3600000;return {st,v};};
const test=(name,fn)=>{fn();console.log('✓ '+name)};

test('Rompimento desbloqueia hostilidade e preserva recompensas',()=>{
 const {st,v}=game(),enemy=st.ai.factions[0],city=enemy.villages[0];v.buildings.embassy=3;st.campaign.reputation.corvos=90;
 assert(C.ally(st,'corvos').ok);assert(!E.send(st,v,city.x,city.y,{legionary:2},'attack').ok);
 st.campaign.chaptersClaimed=['fundacao'];const rep=st.campaign.reputation.corvos;
 assert(C.breakAlliance(st,'corvos').ok);assert.equal(st.campaign.reputation.corvos,rep-25);assert(!C.isAlly(st,'corvos'));
 assert.deepEqual(st.campaign.chaptersClaimed,['fundacao']);assert(!C.breakAlliance(st,'corvos').ok);
 assert(!C.ally(st,'corvos').ok);assert.match(C.ally(st,'corvos').error,/turnos/);
 st.ai.turn+=3;assert(C.ally(st,'corvos').ok);assert(E.validateState(st));
});
test('Hospital exige construções e recupera tropas offline',()=>{
 const {st,v}=game();assert.equal(E.recordWounded(st,v,{legionary:50}),0);
 v.buildings.hospital=2;assert.equal(E.hospitalCapacity(v),60);
 assert.equal(E.recordWounded(st,v,{legionary:100}),35);
 assert.equal(E.woundedTotal(v),35);assert.equal(E.recordWounded(st,v,{legionary:200}),25);
 assert.equal(E.woundedTotal(v),60);
 const res=E.healWounded(st,v,'legionary',30);assert(res.ok);assert.equal(E.woundedTotal(v),30);
 assert(!E.healWounded(st,v,'legionary',10).ok);
 const before=v.troops.legionary||0;st.ai.nextTurnAt=res.seconds*1000+Date.now()+7200000;
 E.advance(st,v.hospitalQueue.endsAt+30);assert.equal(v.hospitalQueue,null);
 assert.equal(v.troops.legionary,before+30);assert(E.validateState(st));
});
test('Defesa por aldeia requer Ponto de Reunião e muralha',()=>{
 const {st,v}=game();assert.equal(E.defenseMode(v),'normal');assert(!E.setDefenseMode(st,v,'fortified').ok);
 assert(E.setDefenseMode(st,v,'watch').ok);assert.equal(E.DEFENSE_MODES[E.defenseMode(v)].bonus,1.18);
 v.buildings.wall=3;assert(E.setDefenseMode(st,v,'fortified').ok);assert.equal(E.defenseMode(v),'fortified');
 assert(!E.setDefenseMode(st,v,'invalid').ok);assert(E.validateState(st));
});
test('Baixas defensivas recebem leitos, ataques não causam duplicação',()=>{
 const {st,v}=game(),f=st.ai.factions[0],source=f.villages[0];v.buildings.hospital=4;
 v.troops.legionary=120;
 const at=Date.now(),duration=2000;
 st.ai.movements.push({id:'v13-raid',factionId:f.id,sourceId:source.id,targetVillageId:v.id,troops:125,phase:'outbound',startedAt:at,endsAt:at+duration,duration,loot:null});
 assert(AI.resolveDue(st,at+duration));assert(E.woundedTotal(v)>0);
 const affected=E.woundedTotal(v);assert.equal(st.ai.movements[0].phase,'returning');
 AI.resolveDue(st,at+duration+duration);assert.equal(E.woundedTotal(v),affected);assert(E.validateState(st));
});
test('Feridos de expedição entram no Hospital somente no retorno',()=>{
 const {st,v}=game();v.buildings.hospital=2;v.troops.legionary=300;
 const enemy=st.world.tiles.find(t=>t.kind==='enemy');assert(enemy);
 assert(E.send(st,v,enemy.x,enemy.y,{legionary:60},'attack').ok);
 const m=st.movements[0];E.advance(st,m.endsAt+10);
 assert(m.woundedLosses!==undefined);assert.equal(E.woundedTotal(v),0);
 E.advance(st,m.endsAt+10);assert(E.woundedTotal(v)>0);assert(E.validateState(st));
});
test('Saves anteriores carregam sem estruturas novas e rejeitam adulterações',()=>{
 const {st,v}=game();assert(E.validateState(st));
 assert(E.importSave(JSON.stringify(st)).ok);const restored=E.load();assert(restored);
 v.wounded={legionary:-2};assert(!E.validateState(st));v.wounded={};
 v.hospitalQueue={unitId:'legionary',qty:10,startedAt:300,endsAt:100};assert(!E.validateState(st));v.hospitalQueue=null;
 v.defenseMode='impossible';assert(!E.validateState(st));
});
console.log('✓ Guerra Sem Fim v1.3 — Combate avançado e diplomacia aprovados');
