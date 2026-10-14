/* Crônicas do Império v0.6 — testes de jornada, diplomacia, vitória e compatibilidade. */
const fs=require('fs'),vm=require('vm'),path=require('path'),assert=require('assert');
const dir=path.resolve(__dirname,'..'),data=new Map(),window={};
const ctx={window,Date,Math,JSON,console,localStorage:{getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,v),removeItem:k=>data.delete(k)}};
vm.createContext(ctx);for(const f of ['data','war','ai','campaign','engine'])vm.runInContext(fs.readFileSync(path.join(dir,'js',f+'.js'),'utf8'),ctx,{filename:f+'.js'});
const E=window.GSF,C=window.GSF_CAMPAIGN,AI=window.GSF_AI;
let count=0;function check(msg,fn){fn();count++;console.log('✓ '+msg);}
check('Nova campanha inicia os 3 capítulos e dificuldade padrão',()=>{
 const s=E.newGame();assert.equal(s.campaign.difficulty,'normal');assert.equal(C.chapters(s).length,3);assert(C.chapters(s)[0].unlocked);assert(!C.chapters(s)[1].unlocked);
 assert.equal(s.campaign.allies.length,0);assert(E.validateState(s));
});
check('Dificuldade escolhida é salva, inclusive quando invasões estão desligadas',()=>{
 const s=E.newGame({difficulty:'hard',enemyAttacks:false});assert.equal(s.campaign.difficulty,'hard');assert(!AI.attacksEnabled(s));
 assert(C.setDifficulty(s,'easy').ok);assert.equal(C.difficulty(s).recruit,.75);assert(!C.setDifficulty(s,'superhard').ok);
 assert(E.save(s));assert.equal(E.load().campaign.difficulty,'easy');assert(!AI.attacksEnabled(E.load()));
});
check('Capítulo de fundação exige melhorias e aventura e não pode ser resgatado em duplicidade',()=>{
 const s=E.newGame(),c=C.chapters(s)[0];assert(!c.done);assert(!C.claimChapter(s,c.id).ok);
 for(let i=0;i<3;i++)s.villages[0].fields[i].level=2;s.hero.adventures=1;
 assert(C.claimChapter(s,'fundacao').ok);assert(!C.claimChapter(s,'fundacao').ok);
 assert.equal(s.campaign.reputation.corvos,15);assert(C.chapters(s)[1].unlocked);
});
check('Presentes exigem embaixada, descontam recursos, geram reputação e respeitam cooldown',()=>{
 const s=E.newGame({enemyAttacks:false}),v=E.active(s);assert(!C.offer(s,'corvos').ok);v.buildings.embassy=1;
 assert(C.offer(s,'corvos').ok);assert.equal(s.campaign.reputation.corvos,20);assert(!C.offer(s,'corvos').ok);
 s.ai.turn+=3;v.resources={wood:1200,clay:1200,iron:1200,crop:1200};assert(C.offer(s,'corvos').ok);assert.equal(s.campaign.reputation.corvos,40);assert(E.validateState(s));
});
check('Trégua existente aumenta reputação e libera objetivo da fronteira',()=>{
 const s=E.newGame(),v=E.active(s);v.buildings.embassy=1;
 assert(AI.negotiate(s,'espinhos').ok);assert.equal(s.campaign.trucesSigned,1);assert.equal(s.campaign.reputation.espinhos,10);
});
check('Aliança exige embaixada nível 3 e reputação e impede novas invasões da facção',()=>{
 const s=E.newGame({speed:30}),v=E.active(s),f=s.ai.factions[0];v.buildings.embassy=1;s.campaign.reputation.corvos=45;
 assert(!C.ally(s,'corvos').ok);v.buildings.embassy=3;v.resources={wood:1200,clay:1200,iron:1200,crop:1200};
 const source=f.villages[0];s.ai.movements.push({id:'npc06',factionId:f.id,sourceId:source.id,targetVillageId:v.id,troops:11,phase:'outbound',startedAt:Date.now(),endsAt:Date.now()+1000,duration:1000,loot:null});
 assert(C.ally(s,'corvos').ok);assert(!s.ai.movements.length);assert(C.isAlly(s,'corvos'));
 assert(!E.send(s,v,source.x,source.y,{legionary:2},'attack').ok);
 assert(!C.ally(s,'corvos').ok);assert(E.validateState(s));
});
check('Capítulo 2 exige segunda aldeia e diplomacia; conclusão gera reputação',()=>{
 const s=E.newGame(),v=s.villages[0];v.fields[0].level=2;v.fields[1].level=2;v.fields[2].level=2;s.hero.adventures=1;
 assert(C.claimChapter(s,'fundacao').ok);s.campaign.trucesSigned=1;
 assert(!C.claimChapter(s,'fronteiras').ok);
 const b=JSON.parse(JSON.stringify(v));b.id='e240';b.x=1;b.y=1;b.name='Colônia';b.resources={wood:0,clay:0,iron:0,crop:0};s.villages.push(b);
 assert(C.claimChapter(s,'fronteiras').ok);assert.equal(s.campaign.reputation.aurora,25);assert(C.chapters(s)[2].unlocked);
});
check('Vitória diplomática permite finalizar com ataques desativados',()=>{
 const s=E.newGame({enemyAttacks:false});const v=s.villages[0];[0,1,2].forEach(i=>v.fields[i].level=2);s.hero.adventures=1;C.claimChapter(s,'fundacao');
 const b=JSON.parse(JSON.stringify(v));b.id='e240';b.x=1;b.y=1;b.name='Colônia';s.villages.push(b);s.campaign.trucesSigned=1;C.claimChapter(s,'fronteiras');
 s.campaign.allies.push('corvos','aurora','espinhos');assert(C.diplomaticWin(s));assert(C.claimChapter(s,'legado').ok);
 assert.equal(s.campaign.victory.type,'diplomatica');assert(E.validateState(s));assert(E.save(s));assert.equal(E.load().campaign.victory.type,'diplomatica');
});
check('Vitória militar exige derrotar os 3 rivais',()=>{
 const s=E.newGame();const v=s.villages[0];[0,1,2].forEach(i=>v.fields[i].level=2);s.hero.adventures=1;C.claimChapter(s,'fundacao');
 const b=JSON.parse(JSON.stringify(v));b.id='e250';b.x=1;b.y=1;s.villages.push(b);s.campaign.trucesSigned=1;C.claimChapter(s,'fronteiras');
 for(const f of s.ai.factions)f.defeated=true;
 assert(C.militaryWin(s));assert(C.claimChapter(s,'legado').ok);assert.equal(s.campaign.victory.type,'militar');
});
check('Importação de save v0.5 sem campaign recebe migração automática, mantendo preferências e modais',()=>{
 const s=E.newGame({enemyAttacks:false});delete s.campaign;assert(E.validateState(s));
 const text=E.exportSave(s),r=E.importSave(text);assert(r.ok);assert.equal(r.state.campaign.difficulty,'normal');assert.equal(r.state.preferences.enemyAttacks,false);
 const loaded=E.load();assert.equal(loaded.campaign.version,1);
});
check('Validação rejeita manipulação de reputação, duplicação de alianças e vitória falsa',()=>{
 const s=E.newGame();s.campaign.reputation.aurora=-1;assert(!E.validateState(s));s.campaign.reputation.aurora=100;
 s.campaign.allies=['corvos','corvos'];assert(!E.validateState(s));s.campaign.allies=[];
 s.campaign.victory={type:'diplomatica',at:Date.now()};assert(!E.validateState(s));
});
check('Herói com pontos de ataque melhora força ofensiva real',()=>{
 const s=E.newGame(),v=E.active(s);const enemy=s.ai.factions[0].villages[0];v.troops.legionary=100;
 const initial=E.simulate(s,v,enemy.x,enemy.y,{legionary:80});assert(initial.ok);s.hero.attack=24;
 const improved=E.simulate(s,v,enemy.x,enemy.y,{legionary:80});assert(improved.power>initial.power);
});
console.log(`\n${count} testes de campanha v0.6 aprovados.`);
