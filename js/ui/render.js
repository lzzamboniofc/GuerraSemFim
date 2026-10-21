/* Guerra Sem Fim — Renderização: preserva rascunhos de formulários e atualiza só o que mudou no DOM.
 * Os módulos js/ui/*.js compartilham o escopo global de scripts (sem build, funciona em file://).
 * Ordem de carga: ver index.html. */
'use strict';
// Preserva formulários de jogo quando uma ação atualiza os painéis ou o relógio.
// Preferências permanentes não entram aqui: elas sempre refletem o estado salvo.
function draftScope(){if(!state||!['market','army','war','expansion','map'].includes(ui.page))return null;return `${ui.page}:${E.active(state).id}${ui.page==='map'?':'+ui.tileX+':'+ui.tileY:''}`;}
function storeInputs(scope){if(!scope)return;const root=$('#app');if(!root?.querySelectorAll)return;const values={};for(const el of root.querySelectorAll('#game-content input[id], #game-content select[id], #game-content textarea[id], .inspector input[id], .inspector select[id]')){if(el.id==='village-picker')continue;values[el.id]={value:el.value,checked:el.type==='checkbox'?el.checked:null};}formDrafts.set(scope,values);}
function restoreInputs(scope){if(!scope)return;const draft=formDrafts.get(scope);if(!draft)return;const root=$('#app');if(!root?.querySelectorAll)return;for(const el of root.querySelectorAll('#game-content input[id], #game-content select[id], #game-content textarea[id], .inspector input[id], .inspector select[id]')){const entry=draft[el.id];if(!entry)continue;if(el.tagName==='SELECT'&&!Array.from(el.options).some(opt=>opt.value===entry.value))continue;el.value=entry.value;if(entry.checked!==null&&el.type==='checkbox')el.checked=entry.checked;}}
function render(){const root=$('#app');if(!root)return;storeInputs(lastRenderedScope);const navOffset=root.querySelector?.('.nav-list')?.scrollLeft||0;const cls=state?'view-'+visualMode():'';if(root.className!==cls)root.className=cls;const html=state?shell():welcome();if(window.GSF_DOM&&lastRenderedKind===(state?'game':'welcome'))window.GSF_DOM.morph(root,html);else root.innerHTML=html;lastRenderedKind=state?'game':'welcome';const nav=root.querySelector?.('.nav-list');if(nav)nav.scrollLeft=navOffset;lastRenderedScope=draftScope();restoreInputs(lastRenderedScope);if(ui.page==='market'){tradePreview();updateMerchantPreview();}const modalKey=ui.modal?JSON.stringify(ui.modal):null;if(ui.modal&&modalKey!==lastModalKey)root.querySelector?.('.dialog-close')?.focus?.({preventScroll:true});lastModalKey=modalKey;}
// Tipo da última tela (jogo ou boas-vindas) e janela aberta: o foco vai para o modal só quando ele abre.
let lastRenderedKind=null,lastModalKey=null;
function actionAndRender(r,message){if(flagResult(r,message))render();}
function saveAndRender(){E.save(state);render();}
let mapViewportBand=()=>{const w=Number(window.innerWidth)||1280;return w<=500?0:w<=900?1:w<=1450?2:3;};
let lastMapViewportBand=mapViewportBand();
window.addEventListener?.('resize',()=>{if(window.innerWidth>=960&&ui.menuOpen){ui.menuOpen=false;render();}const current=mapViewportBand();if(current!==lastMapViewportBand){lastMapViewportBand=current;if(state&&ui.page==='map'&&!ui.modal)render();}});
