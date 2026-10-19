/* Guerra Sem Fim — atualização incremental do DOM ("morph").
 * Em vez de trocar o innerHTML da página inteira a cada ação, compara o HTML novo com a árvore atual
 * e altera somente atributos, textos e nós que mudaram. Assim:
 *  - animações (bandeiras, moinhos, fumaça) não reiniciam a cada clique;
 *  - o campo em que o jogador está digitando mantém foco, cursor e valor;
 *  - a rolagem de listas e painéis é preservada.
 * Sem DOM real (testes em Node), render() continua usando innerHTML.
 */
'use strict';
const GSF_DOM=(()=>{
 const supported=typeof document!=='undefined'&&typeof document.createElement==='function'&&'content' in (document.createElement('template')||{});
 const FORM=new Set(['INPUT','TEXTAREA','SELECT']);
 // Chave estável: permite reaproveitar o mesmo nó quando a lista muda de ordem ou de tamanho.
 function keyOf(n){if(n.nodeType!==1)return null;const d=n.dataset||{};
  if(n.id)return '#'+n.id;
  if(d.tileX!==undefined)return 't'+d.tileX+':'+d.tileY;
  if(d.slot!==undefined)return 's'+d.slot;if(d.field!==undefined&&n.tagName==='BUTTON')return 'f'+d.field;
  if(d.nav!==undefined)return 'n'+d.nav+(n.classList?.contains('dock-item')?':d':'');
  if(d.fold!==undefined)return 'fold'+d.fold;
  return null;}
 function syncAttrs(from,to){
  for(const a of [...from.attributes])if(!to.hasAttribute(a.name))from.removeAttribute(a.name);
  for(const a of [...to.attributes])if(from.getAttribute(a.name)!==a.value)from.setAttribute(a.name,a.value);
 }
 function syncForm(from,to){
  if(from===document.activeElement)return; // não atrapalha quem está digitando
  if(from.tagName==='SELECT'){if(from.value!==to.value)from.value=to.value;return;}
  if(from.type==='checkbox'||from.type==='radio'){if(from.checked!==to.checked)from.checked=to.checked;return;}
  if(from.value!==to.value)from.value=to.value;
 }
 function same(a,b){return a.nodeType===b.nodeType&&(a.nodeType!==1||(a.tagName===b.tagName&&keyOf(a)===keyOf(b)));}
 function morphNode(from,to){
  if(from.nodeType===3||from.nodeType===8){if(from.nodeValue!==to.nodeValue)from.nodeValue=to.nodeValue;return;}
  syncAttrs(from,to);
  if(FORM.has(from.tagName)){if(from.tagName==='SELECT')morphChildren(from,to);else if(from.tagName==='TEXTAREA'&&from!==document.activeElement)from.value=to.value;syncForm(from,to);return;}
  morphChildren(from,to);
 }
 function morphChildren(fromParent,toParent){
  const keyed=new Map();for(const c of fromParent.childNodes){const k=keyOf(c);if(k)keyed.set(k,c);}
  let cur=fromParent.firstChild;
  for(const next of [...toParent.childNodes]){
   const k=keyOf(next);let match=null;
   if(k&&keyed.has(k)){match=keyed.get(k);keyed.delete(k);if(match.tagName!==next.tagName)match=null;}
   else if(cur&&!keyOf(cur)&&same(cur,next))match=cur;
   if(match){if(match!==cur)fromParent.insertBefore(match,cur);else cur=cur.nextSibling;morphNode(match,next);}
   else fromParent.insertBefore(next,cur);
  }
  while(cur){const n=cur.nextSibling;fromParent.removeChild(cur);cur=n;}
  for(const stale of keyed.values())if(stale.parentNode===fromParent)fromParent.removeChild(stale);
 }
 function morph(root,html){
  if(!supported||!root.firstChild){root.innerHTML=html;return false;}
  const tpl=document.createElement('template');tpl.innerHTML=html;
  morphChildren(root,tpl.content);return true;
 }
 return {morph,supported};
})();
window.GSF_DOM=GSF_DOM;
