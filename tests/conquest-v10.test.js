/* Guerra Sem Fim v1.0 — Palácio, capital, administradores e conquista de assentamentos. */
'use strict';
const vm=require('node:vm'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),storage=new Map();
const localStorage={getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,String(v)),removeItem:k=>storage.delete(k)};
const ctx={window:{},console,Math,Date,JSON,localStorage};vm.createContext(ctx);
for(const name of ['data','war','ai','campaign','expansion','engine'])vm.runInContext(fs.readFileSync(path.join(root,'js',name+'.js'),'utf8'),ctx,{filename:name+'.js'});
const E=ctx.window.GSF, RES=['wood','clay','iron','crop'];
const test=(name,fn)=>{fn();console.log('✓ '+name)};
const game=()=>{const st=E.newGame({speed:12,enemyAttacks:false}),v=E.active(st);v.buildings.main=20;st.ai.nextTurnAt=Date.now()+3600000;return {st,v}};
const stock=(v,n=150000)=>RES.forEach(k=>v.resources[k]=n);
function addVillage(st){const home=st.villages[0],v=structuredClone(home);v.id='e800000';v.name='Nova Província';v.x=1;v.y=0;v.administrators=0;v.administratorQueue=null;v.buildQueue=[];v.trainingQueue=[];v.planQueue=[];v.troops={};v.buildings={main:10,warehouse:5,granary:5,rally:1};v.buildingSlots={0:'main',1:'warehouse',2:'granary',3:'rally'};st.villages.push(v);return v;}

test('Capital inicial, Palácio e limite de uma sede real',()=>{
 const {st,v}=game(),other=addVillage(st);stock(other);
 assert(E.isCapital(st,v));assert(!E.isCapital(st,other));assert.equal(E.fieldMax(st,v),25);assert.equal(E.fieldMax(st,other),20);
 assert.match(E.setCapital(st,other).error,/Palácio/);
 const result=E.canBuild(st,other,'building','palace',4);assert(result.ok);
 other.buildings.palace=1;other.buildingSlots[4]='palace';
 assert(E.setCapital(st,other).ok);assert(E.isCapital(st,other));assert.equal(st.capitalVillageId,other.id);
 stock(v);v.buildings.main=10;
 assert.match(E.canBuild(st,v,'building','palace',4).error,/um Palácio/);
 assert(E.validateState(st));
});

test('Campos da capital acima do nível 20 e provincial limitado a 20',()=>{
 const {st,v}=game();const other=addVillage(st);stock(v);stock(other);
 v.fields[0].level=20;other.fields[0].level=20;
 assert(E.canBuild(st,v,'field',0).ok);assert.match(E.canBuild(st,other,'field',0).error,/máximo/);
 v.fields[0].level=25;assert(E.validateState(st));assert.match(E.canBuild(st,v,'field',0).error,/máximo/);
 other.fields[0].level=21;assert(!E.validateState(st));
});

test('Administradores exigem residência ou Palácio, recursos e fila exclusiva',()=>{
 const {st,v}=game();stock(v);assert.match(E.canTrainAdministrator(st,v).error,/Residência/);
 v.buildings.residence=10;const previous={...v.resources};
 const r=E.trainAdministrator(st,v);assert(r.ok);assert(v.administratorQueue);
 assert.match(E.trainAdministrator(st,v).error,/preparado/);
 assert.equal(previous.wood-v.resources.wood,850);assert.equal(previous.crop-v.resources.crop,700);
 assert(E.save(st));
 st.lastTick=v.administratorQueue.startedAt;E.advance(st,v.administratorQueue.endsAt+10);
 assert.equal(v.administratorQueue,null);assert.equal(v.administrators,1);assert(E.validateState(st));
});

test('A conquista exige um administrador, escolta, cultura e alvo rival',()=>{
 const {st,v}=game();const target=st.ai.factions[0].villages[0];
 assert.match(E.sendConquest(st,v,target.x,target.y,{legionary:5}).error,/Prepare um/);
 v.administrators=1;assert.match(E.sendConquest(st,v,target.x,target.y,{legionary:0}).error,/soldados/);
 assert.match(E.sendConquest(st,v,1,1,{legionary:5}).error,/reino rival/);
 assert.equal(v.administrators,1);assert(E.validateState(st));
});

test('Expedição vitoriosa reduz lealdade sem destruir o assentamento',()=>{
 const {st,v}=game();const f=st.ai.factions[0],city=f.villages[0];
 v.troops.legionary=200;v.administrators=1;city.troops=0;city.loyalty=100;
 const r=E.sendConquest(st,v,city.x,city.y,{legionary:100});assert(r.ok);
 assert.equal(v.administrators,0);
 const m=st.movements.at(-1);assert.equal(m.mode,'conquer');assert.equal(m.administrators,1);
 E.advance(st,m.endsAt+20);assert.equal(city.loyalty,70);assert(f.villages.includes(city));
 assert(st.reports.some(r=>r.title==='Lealdade reduzida'));
 E.advance(st,m.endsAt+20);assert.equal(v.administrators,1);assert(E.validateState(st));
});

test('Lealdade zero transfere aldeia preservando campos, muralhas e recursos',()=>{
 const {st,v}=game();const f=st.ai.factions[0],city=f.villages[0];
 v.troops.legionary=200;v.administrators=1;city.troops=0;city.loyalty=20;city.level=8;city.walls=4;
 city.stock={wood:900,clay:950,iron:1000,crop:1050};
 assert(E.sendConquest(st,v,city.x,city.y,{legionary:100}).ok);
 const m=st.movements.at(-1);E.advance(st,m.endsAt+20);
 const taken=st.villages.find(t=>t.x===city.x&&t.y===city.y);
 assert(taken);assert.equal(taken.name,city.name);assert.equal(taken.buildings.main,8);
 assert.equal(taken.buildings.wall,4);assert(taken.fields.some(field=>field.level>=3));
 assert(Math.abs(taken.resources.wood-900)<1);assert(!f.villages.includes(city));
 assert.equal(m.administrators,0);assert.equal(E.tileAt(st,city.x,city.y).kind,'player');
 assert(st.reports.some(r=>r.title==='Aldeia conquistada'));assert(E.validateState(st));
 E.advance(st,m.endsAt+20);assert.equal(v.administrators,0);
});

test('Falha militar perde administrador sem conquistar cidade',()=>{
 const {st,v}=game();const city=st.ai.factions[0].villages[0];
 v.administrators=1;v.troops.legionary=100;city.troops=300;city.walls=8;
 assert(E.sendConquest(st,v,city.x,city.y,{legionary:1}).ok);
 const m=st.movements.at(-1);E.advance(st,m.endsAt+20);
 assert.equal(m.administrators,0);assert.equal(city.loyalty,100);
 assert.equal(st.villages.length,1);
});

test('Campanha importada preserva capital e aceita saves antigos sem governadores',()=>{
 const {st,v}=game();delete st.capitalVillageId;delete v.administrators;delete v.administratorQueue;
 const raw=JSON.stringify(st);
 assert(E.validateState(st));assert(E.importSave(raw).ok);
 const loaded=E.load();assert(loaded);assert.equal(loaded.capitalVillageId,loaded.villages[0].id);
 assert(E.isCapital(loaded,E.active(loaded)));assert(E.validateState(loaded));
});

test('Validação rejeita lealdade adulterada, capitais inválidas e administradores falsos',()=>{
 const {st,v}=game();st.capitalVillageId='falso';assert(!E.validateState(st));st.capitalVillageId=v.id;
 v.administrators=-3;assert(!E.validateState(st));v.administrators=0;
 v.administratorQueue={startedAt:200,endsAt:100};assert(!E.validateState(st));v.administratorQueue=null;
 const city=st.ai.factions[0].villages[0];city.loyalty=101;assert(!E.validateState(st));
 city.loyalty=100;assert(E.validateState(st));
});
console.log('✓ Conquista e capital v1.0: nove grupos aprovados');
