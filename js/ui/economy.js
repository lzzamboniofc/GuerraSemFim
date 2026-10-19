/* Guerra Sem Fim — Mercado: trocas internas, mercadores e rotas comerciais.
 * Os módulos js/ui/*.js compartilham o escopo global de scripts (sem build, funciona em file://).
 * Ordem de carga: ver index.html. */
'use strict';
function exchangeOfferLimit(v,from,to){return E.maxExchangeOffer(v,from,to);}
function tradePreview(){
 const v=E.active(state),from=$('#trade-from')?.value,to=$('#trade-to')?.value,n=Number($('#trade-amount')?.value),limit=exchangeOfferLimit(v,from,to),out=$('#trade-preview');
 if(out){const enough=Number.isSafeInteger(n)&&n>=100&&n<=limit;out.textContent=!enough?`Máximo possível nesta troca: ${fmt(limit)}. Escolha dois recursos diferentes e uma quantia que caiba no destino.`:`Você receberá ${fmt(n)} ${D.RESOURCE[to].name} · Troca 1:1 sem taxa · Saldo disponível para oferecer: ${fmt(v.resources[from])}`;out.classList.toggle('trade-preview-invalid',!enough);}
}
function market(){
 const v=E.active(state),ready=E.buildLevel(v,'marketplace')>0,cap=E.merchantCapacity(state),free=E.merchantsFree(state,v),total=E.merchantsTotal(v);
 const to=state.villages.filter(t=>t.id!==v.id);
 const types=D.RES.map(k=>`<option value="${k}">${iconRes(k)} ${D.RESOURCE[k].name}</option>`).join('');
 return `${head('Mercado da Aldeia','Administre a economia, envie mercadorias e estabeleça rotas entre aldeias.',villageSelect())}
 <div class="panel market-panel"><div class="panel-title"><h3>⚖️ Troca imediata de recursos</h3><span class="section-note">Troca 1:1 · nenhuma taxa</span></div>${!ready?'<div class="warning">Construa um Mercado no centro da aldeia para liberar o comércio.</div>':''}
 <div class="form-grid"><label class="form-field"><span>Recurso que oferece</span><select id="trade-from">${types}</select></label><label class="form-field"><span>Recurso que deseja receber</span><select id="trade-to">${D.RES.map(k=>`<option value="${k}" ${k==='clay'?'selected':''}>${iconRes(k)} ${D.RESOURCE[k].name}</option>`).join('')}</select></label></div>
 <label class="form-field"><span>Quantidade que deseja oferecer</span><input id="trade-amount" class="form-input" type="number" min="100" step="1" value="200" inputmode="numeric"></label>
 <div class="market-presets" aria-label="Quantidades rápidas">${[100,500,1000,5000,10000,50000].map(n=>`<button class="btn secondary small" type="button" data-trade-preset="${n}">${fmt(n)}</button>`).join('')}<button class="btn small" type="button" data-trade-preset="max">Máximo possível</button></div>
 <p id="trade-preview" class="market-preview" role="status">Você receberá ${fmt(200)} ${D.RESOURCE.clay.name} · Sem taxa</p><button class="btn" data-trade ${!ready?'disabled':''}>Concluir troca</button><p class="section-note">Os valores preenchidos permanecem enquanto você constrói, treina ou navega. Não é necessário repetir a configuração.</p></div>
 <div class="panel"><div class="panel-title"><h3>🚚 Caravanas entre aldeias — mercadores e transporte</h3><span class="section-note">${free}/${total} mercadores livres · ${fmt(cap)} por mercador</span></div>
 ${to.length?`<p>Envie uma carga mista para outra aldeia. Os mercadores ficam ocupados na ida e na volta; o tempo da viagem depende da distância.</p>
 <label class="form-field"><span>Aldeia de destino</span><select id="merchant-target">${to.map(t=>`<option value="${esc(t.id)}">${esc(t.name)} (${t.x}|${t.y})</option>`).join('')}</select></label>
 <div class="merchant-cargo">${D.RES.map(k=>`<label class="form-field"><span>${iconRes(k)} ${D.RESOURCE[k].name}</span><input id="merchant-${k}" class="form-input" type="number" min="0" step="1" value="${k==='wood'?200:0}" inputmode="numeric"></label>`).join('')}</div>
 <div class="market-presets"><button class="btn secondary small" type="button" data-cargo-max>Usar carga máxima</button><button class="btn secondary small" type="button" data-cargo-clear>Limpar carga</button></div>
 <p id="merchant-preview" class="market-preview" role="status">Escolha quanto enviar de cada recurso.</p><div class="btn-row"><button class="btn" data-send-merchant ${!ready?'disabled':''}>🚚 Enviar mercadores</button></div>
 <div class="divider"></div><h3>🔁 Rotas automáticas</h3><p>Use o carregamento acima para criar uma rota recorrente. Ela tentará enviar a carga no intervalo escolhido, somente se houver recursos, mercadores e espaço no destino. Funciona offline.</p>
 <label class="form-field"><span>Intervalo de envio</span><select id="route-interval"><option value="15">A cada 15 minutos</option><option value="30">A cada 30 minutos</option><option value="60" selected>A cada 1 hora</option><option value="180">A cada 3 horas</option><option value="360">A cada 6 horas</option><option value="720">A cada 12 horas</option><option value="1440">A cada 24 horas</option></select></label>
 <button class="btn secondary" data-add-route ${!ready?'disabled':''}>+ Criar rota automática</button>
 <div class="route-list">${E.routes(v).length?E.routes(v).map(r=>{const dest=state.villages.find(t=>t.id===r.targetVillageId);return `<div class="route-item"><div><strong>${esc(dest?.name||'Outra aldeia')}</strong><small>${D.RES.filter(k=>r.cargo[k]>0).map(k=>`${iconRes(k)} ${fmt(r.cargo[k])}`).join(' · ')} · a cada ${r.interval} min · ${r.enabled?'ativa':'pausada'}</small></div><div class="btn-row"><button class="btn secondary small" data-toggle-route="${r.id}">${r.enabled?'Pausar':'Retomar'}</button><button class="btn danger small" data-remove-route="${r.id}">Excluir</button></div></div>`;}).join(''):'<p class="empty-state">Nenhuma rota automática criada.</p>'}</div>
 <details class="legacy-caravan"><summary>Caravana simples (modo antigo)</summary><div class="form-grid"><label class="form-field"><span>Destino</span><select id="caravan-target">${to.map(t=>`<option value="${esc(t.id)}">${esc(t.name)}</option>`).join('')}</select></label><label class="form-field"><span>Recurso</span><select id="caravan-resource">${types}</select></label></div><label class="form-field"><span>Quantidade</span><input id="caravan-amount" class="form-input" type="number" min="50" value="200"></label><button class="btn secondary" data-send-caravan>Enviar caravana simples</button></details>
 </div>`:'<p>Funde ou conquiste uma segunda aldeia para liberar transferências e rotas comerciais.</p>'}</div>
 <div class="panel"><div class="panel-title"><h3>🏛️ Celebrações na Prefeitura</h3><span class="section-note">Cultura para expandir seu império</span></div>
 <p>Celebrações geram <strong>150 pontos de cultura</strong> quando concluídas. Exigem Prefeitura nível 1 e custam 750 madeira, 800 barro, 600 ferro e 650 cereal.</p>
 <p>${v.festivalQueue?`⏳ Festa em andamento: <strong data-countdown="${v.festivalQueue.endsAt}">${duration((v.festivalQueue.endsAt-Date.now())/1000)}</strong>`:`Cultura gerada por celebrações em ${esc(v.name)}: <strong>${fmt(v.festivalPoints||0)}</strong> pontos.`}</p>
 <button class="btn" data-festival ${!E.canFestival(state,v).ok?'disabled':''}>🎉 Iniciar celebração</button></div>
 `;
}
function currentMerchantCargo(){return Object.fromEntries(D.RES.map(k=>[k,Number($(`#merchant-${k}`)?.value||0)]));}
function updateMerchantPreview(){const cargo=currentMerchantCargo(),n=D.RES.reduce((a,k)=>a+cargo[k],0),capacity=E.merchantCapacity(state),merchants=Math.ceil(n/capacity),el=$('#merchant-preview');if(el)el.textContent=`${fmt(Math.max(0,n))} recursos · ${Number.isFinite(merchants)?fmt(merchants):'?'} mercador(es) necessários · ${fmt(E.merchantsFree(state,E.active(state)))} livres`;}
