/* Testes de integração dos reinos NPC: node tests/world.test.js */
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert');
const root=path.resolve(__dirname,'..');const memory=new Map();
const ctx={window:{},Date,Math,JSON,console,localStorage:{getItem:k=>memory.get(k)||null,setItem:(k,v)=>memory.set(k,v),removeItem:k=>memory.delete(k)}};
vm.createContext(ctx);for(const file of ['data','ai','engine'])vm.runInContext(fs.readFileSync(path.join(root,'js',file+'.js'),'utf8'),ctx,{filename:file});
const E=ctx.window.GSF,AI=ctx.window.GSF_AI;
function test(name,fn){fn();console.log('✓ '+name);}
let s,v,city;
test('Três facções rivais aparecem no mapa e não substituem aldeias do jogador',()=>{
 s=E.newGame({tribe:'romans',speed:12});v=E.active(s);
 assert.equal(s.ai.factions.length,3);assert(s.ai.factions.every(f=>f.villages.length===1));
 assert(s.ai.factions.every(f=>E.tileAt(s,f.villages[0].x,f.villages[0].y).kind==='rival'));
 assert.equal(E.tileAt(s,0,0).kind,'player');assert(E.validateState(s));
});
test('Partidas antigas ganham reinos, mantendo as mesmas aldeias e recursos',()=>{
 const old=JSON.parse(E.exportSave(s));delete old.ai;
 assert(E.validateState(old));memory.set(E.KEY,JSON.stringify(old));const migrated=E.load();
 assert.equal(migrated.ai.factions.length,3);assert.equal(migrated.villages.length,old.villages.length);
 assert.equal(migrated.villages[0].name,old.villages[0].name);
 assert.equal(migrated.villages[0].troops.legionary,old.villages[0].troops.legionary);
 assert(Math.abs(migrated.villages[0].resources.wood-old.villages[0].resources.wood)<1);
 assert(E.validateState(migrated));
});
test('Fases offline: rivais recrutam, constroem, expandem e disparam ataques',()=>{
 const start=s.lastTick;const tick=AI.interval(s);E.advance(s,start+tick*48+100);
 assert(s.ai.turn>=40);assert(s.ai.factions.some(f=>f.villages.some(c=>c.level>1)));
 assert(s.ai.factions.some(f=>f.villages.length>1));
 assert(s.reports.some(r=>r.title.includes('Ataque inimigo')||r.title.includes('Defesa vitoriosa')));
 assert(E.validateState(s));assert(E.save(s));
});
test('Tropas do jogador podem atacar um assentamento rival e retornar',()=>{
 s=E.newGame({tribe:'romans',speed:12});v=E.active(s);city=s.ai.factions[0].villages[0];
 v.troops.legionary=250;
 let before=v.troops.legionary;
 const attack=E.send(s,v,city.x,city.y,{legionary:160},'raid');assert(attack.ok);
 assert.equal(v.troops.legionary,before-160);
 const m=s.movements[0];assert(m.targetId.startsWith('rival:'));
 const at=Date.now();m.endsAt=at+1000;m.startedAt=at-10000;s.lastTick=at;
 E.advance(s,at+1000);assert(s.reports.some(r=>r.title.includes('contra Clã dos Corvos')));
 assert.equal(m.phase,'returning');
 E.advance(s,m.endsAt+2);assert.equal(s.movements.length,0);
 assert(E.validateState(s));
});
test('Ataque completo pode liberar território, sem colonização automática',()=>{
 s=E.newGame({speed:12});v=E.active(s);city=s.ai.factions[0].villages[0];
 v.troops.legionary=700;E.send(s,v,city.x,city.y,{legionary:600},'attack');
 let m=s.movements[0],at=Date.now();m.endsAt=at+1000;m.startedAt=at-10000;s.lastTick=at;
 E.advance(s,at+1000);assert.equal(E.tileAt(s,city.x,city.y).kind,'empty');
 assert.equal(s.villages.length,1);assert(s.ai.factions[0].defeated);assert(E.validateState(s));
});
test('Invasão inimiga causa baixas e pode saquear, gerando relatório',()=>{
 s=E.newGame({speed:12});v=E.active(s);v.troops.legionary=0;
 const f=s.ai.factions[0],c=f.villages[0],at=Date.now();
 s.ai.movements.push({id:'n-extra',factionId:f.id,sourceId:c.id,targetVillageId:v.id,troops:100,phase:'outbound',startedAt:at-1000,endsAt:at+1,duration:5000,loot:null});
 s.lastTick=at;const before=v.resources.wood;
 E.advance(s,at+1);assert(v.resources.wood<before);
 assert(s.reports.some(r=>r.title.includes('Ataque inimigo')));
 assert(E.validateState(s));
 E.advance(s,at+5001);assert(s.ai.movements.every(m=>m.id!=='n-extra'));
});
test('Saves com facções corruptas são rejeitados sem modificar o armazenamento',()=>{
 s=E.newGame({speed:12});const raw=E.exportSave(s);const bad=JSON.parse(raw);
 bad.ai.factions[0].villages[0].troops=-5;
 assert(!E.importSave(JSON.stringify(bad)).ok);
 assert(E.importSave(raw).ok);assert(E.load()?.ai.factions.length===3);
});
test('Atualização offline longa é limitada para não travar navegador',()=>{
 s=E.newGame({speed:12});let t=s.lastTick+86400000*5;
 E.advance(s,t);assert(s.ai.turn<=242);
 assert(E.validateState(s));
});
console.log('8 testes de Mundo Vivo aprovados.');
