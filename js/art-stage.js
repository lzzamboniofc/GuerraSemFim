/* Aldeia ilustrada v1.8 — evolução visual inspirada no ReinosDeGuerra.
 * Estágios pela pontuação de desenvolvimento, sem animação e sem alterar saves.
 * Uma única imagem WebP renderizada por aldeia; marcadores HTML mantêm cliques.
 */
(function(){
'use strict';
const stages=[
 {id:'outpost',label:'Posto',min:0},
 {id:'hamlet',label:'Povoado',min:80},
 {id:'small',label:'Aldeia',min:180},
 {id:'medium',label:'Vila',min:350},
 {id:'town',label:'Cidade',min:700},
 {id:'large',label:'Fortaleza',min:1400}
];
function at(points){
 const p=Math.max(0,Number(points)||0);
 let index=stages.length-1;
 for(let i=0;i<stages.length-1;i++){if(p<stages[i+1].min){index=i;break;}}
 const current=stages[index],next=stages[index+1]||null;
 const percent=next?Math.max(0,Math.min(100,Math.round((p-current.min)/(next.min-current.min)*100))):100;
 return {id:current.id,label:current.label,index,points:p,next:next?.label||null,target:next?.min||null,percent,src:'assets/village-stages/'+current.id+'.webp'};
}
window.GSF_STAGE={stages,at};
})();