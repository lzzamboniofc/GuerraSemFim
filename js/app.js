/* Guerra Sem Fim — Inicialização: eventos globais, ciclo de 1 s e primeira renderização.
 * Os módulos js/ui/*.js compartilham o escopo global de scripts (sem build, funciona em file://).
 * Ordem de carga: ver index.html. */
'use strict';
document.addEventListener('toggle',e=>{const k=e.target?.dataset?.fold;if(k){ui.folds[k]=e.target.open;}},true);
document.addEventListener('click',e=>{if(e.target.matches?.('[data-backdrop-menu]')&&ui.menuOpen){ui.menuOpen=false;render();}});
document.addEventListener('submit',e=>{if(e.target.id!=='new-game')return;e.preventDefault();const player=$('#player-name').value,village=$('#village-name').value,speed=$('#start-speed').value;state=E.newGame({tribe:ui.tribe,player,village,speed,enemyAttacks:$('#start-enemy-attacks')?.checked!==false,difficulty:$('#start-difficulty')?.value||'normal'});ui.page='village';render();toast('Seu império foi fundado!');});
document.addEventListener('change',e=>{if(['trade-from','trade-to','merchant-target'].includes(e.target.id)){tradePreview();updateMerchantPreview();return;}if(e.target.id==='visual-mode'){const r=E.setViewMode(state,e.target.value);if(flagResult(r,'Visualização atualizada!'))saveAndRender();return;}if(e.target.id==='quest-category'){ui.questCategory=e.target.value;render();return;}if(e.target.id==='hero-production-focus'){const r=E.setHeroFocus(state,e.target.value);if(flagResult(r,'Produção do herói atualizada!'))saveAndRender();}else if(e.target.id==='extra-build-slots'){const result=E.setBuildSlots(state,e.target.value);if(flagResult(result,'Filas de construção atualizadas!'))saveAndRender();}else if(e.target.id==='village-picker'){state.activeVillageId=e.target.value;ui.selectedSlot=0;ui.selectedField=0;saveAndRender();}else if(e.target.id==='enemy-attacks'){const r=window.GSF_AI.setHostileAttacks(state,e.target.checked);if(flagResult(r,e.target.checked?'Invasões ativadas.':'Invasões desativadas.'))saveAndRender();}else if(e.target.id==='campaign-difficulty'){const r=window.GSF_CAMPAIGN.setDifficulty(state,e.target.value);if(flagResult(r,'Dificuldade atualizada.'))saveAndRender();}else if(e.target.id==='game-speed'){state.speed=Number(e.target.value);saveAndRender();toast('Velocidade do mundo atualizada.');}});
document.addEventListener('input',e=>{if(['trade-amount','merchant-wood','merchant-clay','merchant-iron','merchant-crop'].includes(e.target?.id)){tradePreview();updateMerchantPreview();}});
document.addEventListener('click',e=>{if(e.target.matches?.('[data-backdrop]')&&ui.modal){ui.modal=null;render();return;}const target=e.target.closest('button');if(!target)return;const d=target.dataset;if(d.tribe){ui.tribe=d.tribe;render();return;}if(!state)return;const v=E.active(state);
 if(d.visualMode){const r=E.setViewMode(state,d.visualMode);if(flagResult(r,'Visualização atualizada!'))saveAndRender();return;}if(d.dailyReward!==undefined){actionAndRender(E.claimDailyReward(state,d.dailyReward),'Recompensa diária recebida!');return;}
 if(d.dailyEvent!==undefined){actionAndRender(E.claimDailyEvent(state),'Evento diário concluído!');return;}
 if(d.captureRelic!==undefined||d.conquerWonder!==undefined||d.capturePlan!==undefined||d.allyPlan!==undefined||d.upgradeWonder!==undefined){
  const W=window.GSF_WORLD;
  const r=d.captureRelic!==undefined?W.captureRelic(state,v):d.conquerWonder!==undefined?W.conquerWonder(state,v):d.capturePlan!==undefined?W.capturePlan(state,v):d.allyPlan!==undefined?W.allyPlan(state):W.upgrade(state,v);
  if(r.ok)E.save(state);
  actionAndRender(r,'Ação da temporada concluída!');return;
 }
 if(d.questFilter){ui.questFilter=d.questFilter;render();return;}
 if(d.toggleMenu!==undefined){ui.menuOpen=!ui.menuOpen;render();if(ui.menuOpen)document.querySelector('.sidebar.nav-expanded .nav-item')?.focus?.({preventScroll:true});return;}if(d.nav){ui.page=d.nav;ui.modal=null;ui.menuOpen=false;render();window.scrollTo?.(0,0);return;}
 if(d.heroSelectAll!==undefined){document.querySelectorAll('[data-hero-target]').forEach(el=>el.checked=true);return;}
 if(d.heroApply!==undefined){const selected=[...document.querySelectorAll('[data-hero-target]:checked')].map(el=>el.dataset.heroTarget);const r=E.setHeroTargets(state,selected);if(flagResult(r,'Distribuição produtiva do herói atualizada!'))saveAndRender();return;}
 if(d.trainAdministrator!==undefined){actionAndRender(E.trainAdministrator(state,v),'Administrador em preparação!');return;}
 if(d.makeCapital!==undefined){actionAndRender(E.setCapital(state,v),'Capital transferida!');return;}
 if(d.conquer!==undefined){const army={};E.troopDefs(state).forEach(u=>army[u.id]=Number($(`#march-${u.id}`)?.value||0));actionAndRender(E.sendConquest(state,v,ui.tileX,ui.tileY,army),'Administrador enviado para conquista!');return;}
 if(d.claimOasis!==undefined){actionAndRender(E.captureOasis(state,v,ui.tileX,ui.tileY),'Oásis conquistado!');return;}
 if(d.releaseOasis!==undefined){actionAndRender(E.releaseOasis(state,v,ui.tileX,ui.tileY),'Oásis abandonado.');return;}
 if(d.planBuilding){const r=E.planBuild(state,v,'building',d.planBuilding,ui.selectedSlot);if(r.ok)ui.modal=null;actionAndRender(r,'Obra adicionada ao planejamento!');return;}
 if(d.planField!==undefined){const r=E.planBuild(state,v,'field',Number(d.planField));if(r.ok)ui.modal=null;actionAndRender(r,'Campo adicionado ao planejamento!');return;}
 if(d.removePlan){actionAndRender(E.removePlan(state,v,d.removePlan),'Obra retirada do planejamento.');return;}
 if(d.movePlan){actionAndRender(E.movePlan(state,v,d.movePlan,d.direction),'Prioridades reorganizadas.');return;}
 if(d.openResource){ui.resourceKey=d.openResource;ui.modal='resources';render();return;}
 if(d.claimChapter){const r=window.GSF_CAMPAIGN.claimChapter(state,d.claimChapter);if(r.ok)E.save(state);actionAndRender(r,'Capítulo concluído!');return;}
 if(d.envoy){const r=window.GSF_CAMPAIGN.offer(state,d.envoy);if(r.ok)E.save(state);actionAndRender(r,'Emissários retornaram com boas notícias.');return;}
 if(d.breakAlly){
  const faction=state.ai?.factions.find(f=>f.id===d.breakAlly);
  if(faction&&window.confirm?.(`Romper a aliança com ${faction.name}? A reputação cairá 25 pontos e os exércitos voltarão a poder se enfrentar.`)){
   const r=window.GSF_CAMPAIGN.breakAlliance(state,d.breakAlly);if(r.ok)E.save(state);actionAndRender(r,'Aliança rompida.');
  }return;
 }
 if(d.ally){const r=window.GSF_CAMPAIGN.ally(state,d.ally);if(r.ok)E.save(state);actionAndRender(r,'Aliança permanente firmada!');return;}
 if(d.negotiate){const r=window.GSF_AI.negotiate(state,d.negotiate);if(r.ok)E.save(state);actionAndRender(r,'Trégua negociada!');return;}
 if(d.trainSettlers!==undefined){actionAndRender(E.trainSettlers(state,v,$('#settlers-count')?.value),'Colonizadores preparados!');return;}
 if(d.npcTrade){actionAndRender(window.GSF_EXPANSION.npcTrade(state,d.npcTrade),'Troca concluída com o reino NPC!');return;}
 if(d.tradePreset!==undefined){const i=$('#trade-amount');if(i){i.value=d.tradePreset==='max'?String(E.maxExchangeOffer(v,$('#trade-from')?.value,$('#trade-to')?.value)):String(d.tradePreset);tradePreview();}return;}
 if(d.cargoClear!==undefined){D.RES.forEach(k=>{const el=$(`#merchant-${k}`);if(el)el.value='0';});updateMerchantPreview();return;}
 if(d.cargoMax!==undefined){let remaining=E.merchantCapacity(state)*E.merchantsFree(state,v);for(const k of D.RES){const el=$(`#merchant-${k}`);if(el){const amount=Math.min(remaining,Math.floor(v.resources[k]));el.value=String(Math.max(0,amount));remaining-=amount;}}updateMerchantPreview();return;}
 if(d.sendMerchant!==undefined){actionAndRender(E.sendMerchantCargo(state,v,$('#merchant-target')?.value,currentMerchantCargo()),'Mercadores enviados!');return;}
 if(d.addRoute!==undefined){actionAndRender(E.addTradeRoute(state,v,$('#merchant-target')?.value,currentMerchantCargo(),$('#route-interval')?.value),'Rota automática configurada!');return;}
 if(d.toggleRoute){actionAndRender(E.toggleTradeRoute(state,v,d.toggleRoute),'Situação da rota atualizada!');return;}
 if(d.removeRoute){actionAndRender(E.removeTradeRoute(state,v,d.removeRoute),'Rota removida!');return;}
 if(d.festival!==undefined){actionAndRender(E.startFestival(state,v),'Celebração iniciada!');return;}
 if(d.sendCaravan!==undefined){actionAndRender(E.sendCaravan(state,v,$('#caravan-target')?.value,$('#caravan-resource')?.value,$('#caravan-amount')?.value),'Caravana enviada!');return;}
 if(d.equip){actionAndRender(E.equipHero(state,d.equip),'Artefato equipado!');return;}
 if(d.unequip!==undefined){actionAndRender(E.equipHero(state,null),'Artefato retirado!');return;}
 if(d.unequipSlot){actionAndRender(E.unequipHero(state,d.unequipSlot),'Equipamento removido!');return;}
 if(d.heroPotion!==undefined){actionAndRender(E.useHeroPotion(state),'Poção utilizada!');return;}
 if(d.focusRival){const f=state.ai?.factions.find(f=>f.id===d.focusRival),c=f?.villages[0];if(c){ui.page='map';ui.mapX=c.x;ui.mapY=c.y;ui.tileX=c.x;ui.tileY=c.y;render();}return;}
 if(d.slot!==undefined){ui.selectedSlot=Number(d.slot);ui.blueprint=null;ui.modal='building';render();return;}
 if(d.field!==undefined){ui.selectedField=Number(d.field);ui.modal='field';render();return;}
 if(d.blueprint){ui.blueprint=d.blueprint;render();return;}
 if(d.clearBlueprint!==undefined){ui.blueprint=null;render();return;}
 if(d.buildBuilding){const r=E.startBuild(state,v,'building',d.buildBuilding,ui.selectedSlot);if(r.ok)ui.modal=null;actionAndRender(r,'Obra iniciada!');return;}
 if(d.buildField!==undefined){const r=E.startBuild(state,v,'field',Number(d.buildField));if(r.ok)ui.modal=null;actionAndRender(r,'Melhoria iniciada!');return;}
 if(d.cancelBuild){actionAndRender(E.cancelBuild(state,v,d.cancelBuild),'Obra cancelada.');return;}
 if(d.demolishBuilding){const c=E.canDemolish(state,v,d.demolishBuilding);if(!c.ok){toast(c.error,true);return;}if(window.confirm?.(`Demolir um nível de ${D.BUILDINGS[d.demolishBuilding].name} (nível ${c.level} → ${c.level-1})? Sem reembolso. A demolição levará ${duration(c.seconds)}.`)){actionAndRender(E.startDemolition(state,v,d.demolishBuilding),'Demolição iniciada!');}return;}
 if(d.cancelDemolition!==undefined){actionAndRender(E.cancelDemolition(state,v),'Demolição cancelada.');return;}
 if(d.simulate!==undefined){const target=$('#sim-target')?.value?.split(':').map(Number),troops={};E.troopDefs(state).forEach(u=>troops[u.id]=Number($(`#sim-${u.id}`)?.value||0));const result=target?.length===2?E.simulate(state,v,target[0],target[1],troops):{ok:false,error:'Escolha um alvo rival.'};if(result.ok){ui.simulation=result;render();}else toast(result.error,true);return;}
 if(d.defenseMode){actionAndRender(E.setDefenseMode(state,v,d.defenseMode),'Postura defensiva atualizada!');return;}
 if(d.healUnit){actionAndRender(E.healWounded(state,v,d.healUnit,$(`#heal-${d.healUnit}`)?.value),'Tratamento iniciado!');return;}
 if(d.researchUnit){actionAndRender(E.startResearch(state,v,d.researchUnit),'Pesquisa iniciada na Academia!');return;}
 if(d.upgradeMilitary){actionAndRender(E.upgradeMilitary(state,v,d.upgradeMilitary),'Pesquisa militar concluída!');return;}
 if(d.reinforce!==undefined){const troops={};E.troopDefs(state).forEach(u=>troops[u.id]=Number($(`#reinforce-${u.id}`)?.value||0));actionAndRender(E.reinforce(state,v,$('#reinforce-target')?.value,troops),'Reforços a caminho!');return;}
 if(d.maxTrain){const input=$(`#train-${d.maxTrain}`),max=E.maxTrainable(state,v,d.maxTrain);if(input&&max>0){input.value=String(max);input.focus();}else toast('Não há recursos ou requisitos para recrutar esta unidade.',true);return;}
 if(d.train){const count=$(`#train-${d.train}`)?.value;actionAndRender(E.train(state,v,d.train,count),'Recrutamento iniciado!');return;}
 if(d.tileX!==undefined){ui.tileX=Number(d.tileX);ui.tileY=Number(d.tileY);render();return;}
 if(d.pan){const diff={up:[0,-3],down:[0,3],left:[-3,0],right:[3,0]}[d.pan];ui.mapX=Math.max(-8,Math.min(8,ui.mapX+diff[0]));ui.mapY=Math.max(-8,Math.min(8,ui.mapY+diff[1]));render();return;}
 if(d.mapZoom){ui.mapZoom=Math.max(-3,Math.min(6,(ui.mapZoom||0)+(d.mapZoom==='in'?-1:1)));render();return;}
 if(d.minimap!==undefined){const r=target.getBoundingClientRect?.();if(r&&r.width){const gx=Math.floor((e.clientX-r.left)/r.width*17)-8,gy=Math.floor((e.clientY-r.top)/r.height*17)-8;ui.mapX=Math.max(-8,Math.min(8,gx));ui.mapY=Math.max(-8,Math.min(8,gy));}render();return;}
 if(d.centerHome!==undefined){ui.mapX=v.x;ui.mapY=v.y;ui.tileX=v.x;ui.tileY=v.y;render();return;}
 if(d.send){const army={};E.troopDefs(state).forEach(u=>army[u.id]=Number($(`#march-${u.id}`)?.value||0));actionAndRender(E.send(state,v,ui.tileX,ui.tileY,army,d.send),'Tropas em marcha!');return;}
 if(d.settle!==undefined){const name=$('#settle-name')?.value;const r=E.settle(state,v,ui.tileX,ui.tileY,name);if(r.ok){ui.page='village';ui.selectedSlot=0;}actionAndRender(r,'Nova aldeia fundada!');return;}
 if(d.switchCoords){const [x,y]=d.switchCoords.split(':').map(Number);const owned=state.villages.find(v=>v.x===x&&v.y===y);if(owned){state.activeVillageId=owned.id;ui.page='village';saveAndRender();}return;}
 if(d.adventure!==undefined){actionAndRender(E.startAdventure(state,$('#hero-adventure-kind')?.value||'explore'),'Herói em aventura!');return;}
 if(d.skill){actionAndRender(E.spendHero(state,d.skill),'Habilidade aprimorada!');return;}
 if(d.heal!==undefined){actionAndRender(E.healHero(state),'Saúde recuperada!');return;}
 if(d.claim){actionAndRender(E.claim(state,d.claim),'Missão concluída! Recompensa recebida.');return;}
 if(d.trade!==undefined){actionAndRender(E.trade(state,v,$('#trade-from')?.value,$('#trade-to')?.value,$('#trade-amount')?.value),'Troca realizada!');return;}
 if(d.clearReports!==undefined){state.reports=[];saveAndRender();return;}
 if(d.export!==undefined){const blob=new Blob([E.exportSave(state)],{type:'application/json'});const url=URL.createObjectURL(blob);const link=document.createElement('a');link.href=url;link.download=`guerra-sem-fim-${new Date().toISOString().slice(0,10)}.json`;document.body.appendChild(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),2000);toast('Backup exportado!');return;}
 if(d.import!==undefined){const input=document.createElement('input');input.type='file';input.accept='.json,application/json';input.onchange=async()=>{const file=input.files?.[0];if(!file)return;if(file.size>3000000){toast('Arquivo muito grande.',true);return;}const r=E.importSave(await file.text());if(r.ok){state=r.state;ui.page='village';render();toast('Partida importada com sucesso!');}else toast(r.error,true);};input.click();return;}
 if(d.help!==undefined){ui.modal='help';render();return;}
 if(d.reset!==undefined){ui.modal='reset';render();return;}
 if(d.closeModal!==undefined){ui.modal=null;render();return;}
 if(d.confirmReset!==undefined){E.clear();state=null;ui.modal=null;ui.page='village';render();return;}
});
document.addEventListener('keydown',e=>{if(e.key!=='Escape')return;if(ui.modal){ui.modal=null;render();return;}if(ui.menuOpen){ui.menuOpen=false;render();document.querySelector('[data-toggle-menu]')?.focus?.({preventScroll:true});}});
window.addEventListener('beforeunload',()=>{if(state)E.save(state);});
setInterval(()=>{if(!state)return;const n=Date.now(),before=state.events[0]?.id,queues=state.movements.length;E.advance(state,n);const v=E.active(state),prod=E.production(state,v);for(const k of D.RES){const val=$(`[data-resource="${k}"]`),p=$(`[data-prod="${k}"]`);if(val)val.textContent=fmt(v.resources[k]);if(p)p.textContent=(prod[k]>=0?'+':'')+fmt(prod[k]);const fill=$(`[data-fill="${k}"]`);if(fill)fill.style.width=Math.min(100,Math.max(0,100*v.resources[k]/E.capacity(v,k)))+'%';const m=$(`[data-modal-current="${k}"]`),mp=$(`[data-modal-prod="${k}"]`);if(m)m.textContent=fmt(v.resources[k]);if(mp)mp.textContent=(prod[k]>=0?'+':'')+fmt(prod[k])+'/h';}
 document.querySelectorAll('[data-countdown]').forEach(el=>{el.textContent=duration((Number(el.dataset.countdown)-n)/1000);});document.querySelectorAll('[data-progress]').forEach(el=>{el.style.width=percent(Number(el.dataset.start),Number(el.dataset.progress))+'%';});
 if(before!==state.events[0]?.id||queues!==state.movements.length)render();
 if(n%6000<1000)E.save(state);
},1000);
render();
if(window.GSF_RECOVERED_BACKUP)setTimeout(()=>toast('Sua partida foi recuperada do backup local.'),300);
