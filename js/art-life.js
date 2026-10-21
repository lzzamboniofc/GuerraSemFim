/* Guerra Sem Fim v1.7 — aldeias vivas.
 * Ilustrações procedurais, locais, sem download, canvas ou dependências.
 * Complementa js/art.js sem mudar as regras ou os identificadores dos terrenos.
 */
(function(){
'use strict';
const A=window.GSF_ART;
if(!A)return;
const originalTown=A.townGround;
const colors={
 romans:{banner:'#ad4838',roof:'#ba5945',cloth:'#e0c17c'},
 gauls:{banner:'#356d4b',roof:'#4d865c',cloth:'#d9b87e'},
 teutons:{banner:'#514965',roof:'#806343',cloth:'#ddd0b2'}
};
const f=n=>Number(n).toFixed(1);
const rand=(n,s=0)=>{let k=Math.imul((n+13)*73856093,(s+37)*19349663);k^=k>>>13;k=Math.imul(k,1274126177);return ((k^(k>>>16))>>>0)/4294967295;};
const road=(d,width)=>'<path d="'+d+'" fill="none" stroke="#6d5c39" stroke-width="'+(width+1.5)+'" opacity=".25" stroke-linecap="round"/><path d="'+d+'" fill="none" stroke="#d3bd88" stroke-width="'+width+'" stroke-linecap="round"/><path d="'+d+'" fill="none" stroke="#f0ddb1" stroke-width=".55" opacity=".6" stroke-dasharray="1.1 3.2"/>';
const shrub=(x,y,s=1)=>'<g transform="translate('+f(x)+' '+f(y)+') scale('+f(s)+')" opacity=".95"><ellipse cx="0" cy=".5" rx="2.8" ry="1.1" fill="#385a35" opacity=".3"/><circle cx="-1.5" cy="-1.5" r="2.3" fill="#416e38"/><circle cx="1" cy="-2.2" r="2.5" fill="#5a8741"/><circle cx="-.1" cy="-3.1" r="1.5" fill="#74a253"/></g>';
const flowers=(x,y,c='#e7d685')=>'<g transform="translate('+f(x)+' '+f(y)+')"><path d="M0 0v-2M2 1v-2M-2 .6v-1.7" stroke="#47743d" stroke-width=".6"/><circle cy="-2.4" r=".8" fill="'+c+'"/><circle cx="2" cy="-1.2" r=".6" fill="#fff4ce"/><circle cx="-2" cy="-1.3" r=".6" fill="#e4b89f"/></g>';
function pine(x,y,s=1){
 return '<g transform="translate('+f(x)+' '+f(y)+') scale('+f(s)+')"><ellipse cy=".7" rx="3" ry="1.2" fill="#274b2f" opacity=".25"/><rect x="-.6" y="-4" width="1.2" height="5" fill="#735735"/><path d="M0 -15 L-5 -4 H5Z" fill="#315c3e"/><path d="M0 -12 L-4.4 -2 H4.4Z" fill="#40784a"/><path d="M0 -12L4.4 -2H0Z" fill="#55965b"/></g>';
}
function hut(x,y,s,roof){
 return '<g transform="translate('+f(x)+' '+f(y)+') scale('+f(s)+')"><ellipse cy="1.3" rx="9" ry="3.6" fill="#243c29" opacity=".3"/><path d="M-7 -1L0 2L8-1L8-9L0-12L-7-9Z" fill="#c6ac7d"/><path d="M0 2V-12L8-9V-1Z" fill="#e3c89b"/><path d="M-9 -9L-1 -17L3 -14L10 -9L1 -11Z" fill="'+roof+'"/><path d="M-9 -9L-1 -17L1 -11L-7 -6Z" fill="#7e4f3e"/><path d="M-1 -11L1 -11L10 -9L8 -6Z" fill="#d08c5a"/><rect x="2.5" y="-7.4" width="2.5" height="4" fill="#53422c"/><path d="M3 -7L4.4 -7" stroke="#efc967" stroke-width=".6"/><rect x="-4" y="-7" width="2.5" height="5" fill="#775338"/><rect x="-1" y="-15" width="1.9" height="4" fill="#bd9b77"/><g class="life-smoke"><circle cx="-.3" cy="-18" r="1.4" fill="#efe6d3"/><circle cx=".2" cy="-20" r="1.7" fill="#efe6d3"/></g></g>';
}
function stall(x,y,c){
 return '<g transform="translate('+f(x)+' '+f(y)+')"><ellipse cy="1" rx="6" ry="2.3" fill="#6d5838" opacity=".25"/><path d="M-5 0V-5M5 0V-5" stroke="#75553b" stroke-width=".9"/><path d="M-7 -5L-4 -9H4L7 -5Z" fill="'+c+'"/><path d="M-3.5 -9L-1 -5H2L.1 -9Z" fill="#f5dfac" opacity=".9"/><path d="M-5 -2H5V0H-5Z" fill="#a46e45"/><rect x="-3.5" y="-3.7" width="2" height="1.7" rx=".2" fill="#cead54"/><rect x="0" y="-3.5" width="2.4" height="1.5" fill="#77984f"/></g>';
}
function fence(x,y,w){
 let s='<path d="M'+f(x)+' '+f(y)+'h'+f(w)+'" stroke="#705638" stroke-width=".7"/><path d="M'+f(x)+' '+f(y-2.4)+'h'+f(w)+'" stroke="#876645" stroke-width=".7"/>';
 for(let a=x;a<=x+w;a+=4)s+='<path d="M'+f(a)+' '+f(y+1.5)+'v-5" stroke="#80613d" stroke-width="1.05" stroke-linecap="round"/>';
 return s;
}
function cow(x,y,n=0){
 return '<g transform="translate('+f(x)+' '+f(y)+') scale('+f(.8+n*.09)+')" class="life-livestock"><ellipse cx="0" cy=".7" rx="4" ry="1.1" fill="#456039" opacity=".25"/><ellipse cy="-3.1" rx="3.8" ry="2" fill="#e1d5b8"/><path d="M-3 -2L-3 0M2 -2V0" stroke="#8a795f" stroke-width=".9"/><path d="M3 -5L6 -5L7 -3L5 -2L3 -3Z" fill="#e2d4bc"/><path d="M5 -5L4 -6L6 -5" stroke="#80654c" stroke-width=".7"/><path d="M-1.4 -4.9q1 -1.3 2.5 .3l.7 1.5h-2.5z" fill="#6e6558"/></g>';
}
function resident(x,y,i,c){
 const coat=['#a45c3d','#d0ac60','#617e57','#52707b',c][i%5];
 const direction=(i%2)?-1:1;
 return '<g transform="translate('+f(x)+' '+f(y)+')"><g class="life-walker" style="--walk-x:'+f(direction*(5+rand(i,4)*11))+'px;animation-delay:-'+f(rand(i,6)*14)+'s;animation-duration:'+f(11+rand(i,5)*9)+'s"><ellipse cy="1.2" rx="1.5" ry=".7" fill="#253726" opacity=".23"/><path d="M-.7-1L-.8 1M.6-1L.8 1" stroke="#55422f" stroke-width=".7"/><path d="M-1-5H1L1.4-1H-1.4Z" fill="'+coat+'"/><circle cx="0" cy="-6.4" r="1.5" fill="#e3be92"/><path d="M-1.4-6.8q.4-2 2.7-.1" stroke="#624b32" stroke-width="1.1" fill="none"/></g></g>';
}
function marketCart(x,y){
 return '<g transform="translate('+x+' '+y+')"><g class="life-cart" style="animation-delay:-2s"><ellipse cy=".7" rx="9" ry="2.5" fill="#253623" opacity=".32"/><path d="M-7 -5L2 -5L5 -1L-5 -1Z" fill="#8b603d" stroke="#583e2c" stroke-width=".6"/><rect x="-5" y="-7.2" width="6" height="2" rx=".4" fill="#b18a54"/><circle cx="-4.5" cy="0" r="2.1" fill="#493729" stroke="#d1b77d" stroke-width=".65"/><circle cx="3" cy="0" r="2.1" fill="#493729" stroke="#d1b77d" stroke-width=".65"/><path d="M5-2l5-2" stroke="#745438" stroke-width=".85"/><path d="M11-4q2 -2 3 0" stroke="#d3bb95" stroke-width="1.1" fill="none"/></g></g>';
}
function well(x,y){
 return '<g transform="translate('+x+' '+y+')"><ellipse cy="1.5" rx="7" ry="3.5" fill="#695b43" opacity=".28"/><ellipse cy="0" rx="5" ry="2.4" fill="#d8cab0" stroke="#9e917a" stroke-width=".9"/><ellipse cy="-.4" rx="3.3" ry="1.2" fill="#558ea0"/><path d="M-4 -1v-7M4 -1v-7" stroke="#715338" stroke-width=".8"/><path d="M-6 -8L0 -12L6 -8Z" fill="#a3583d"/><path d="M-2 -8h4" stroke="#5b402b" stroke-width=".8"/><path d="M0 -8v4" stroke="#6f5740" stroke-width=".6"/></g>';
}
function fieldPlot(x,y,w,h,c){
 const p='M'+f(x)+' '+f(y)+' l'+f(w)+' -'+f(h*.27)+' l'+f(w*.15)+' '+f(h)+' l-'+f(w)+' '+f(h*.28)+' Z';
 let s='<path d="'+p+'" fill="'+c+'" stroke="#9f9365" stroke-width=".65" opacity=".93"/>';
 for(let k=1;k<=5;k++){const yy=y-h*.25+k*h/6;s+='<path d="M'+f(x+2)+' '+f(yy)+' l'+f(w*.95)+' -'+f(h*.24)+'" stroke="#f6e4ae" stroke-width=".65" opacity=".7"/>';}
 return s;
}
function birds(x,y){
 return '<g transform="translate('+x+' '+y+')" class="life-birds"><path d="M0 0q2.2 -2 4 0q2-2 4 0M12 4q2 -2 4 0q2-2 4 0" fill="none" stroke="#405f57" stroke-width=".7" stroke-linecap="round"/></g>';
}
function streetLamps(){
 return [[39,46],[65,42],[133,53],[160,64],[58,96],[144,100]].map(([x,y],i)=>'<g transform="translate('+x+' '+y+')"><path d="M0 0v-7" stroke="#634b35" stroke-width=".9"/><path d="M-1.8-7h3.6l-.8 2.4h-2z" fill="#ecc768" stroke="#967046" stroke-width=".5"/><circle class="life-lantern" cx="0" cy="-6.1" r="1.15" fill="#ffe4a0" style="animation-delay:-'+i*.4+'s"/></g>').join('');
}
function townGround(level=0,tribe='romans',population=0){
 const t=colors[tribe]||colors.romans,wall=Math.max(0,Number(level)||0),pop=Math.max(0,Number(population)||0);
 const base=originalTown(level,tribe);
 let s='<g class="life-ground" aria-hidden="true">';
 // Encostas, cultivos e vielas tornam o cenário menos plano, sem cobrir os edifícios clicáveis.
 s+='<path d="M0 0H200V22Q158 15 132 18Q84 3 42 24L0 33Z" fill="#b4c27d" opacity=".42"/>';
 s+='<path d="M0 96Q28 89 65 106Q113 109 153 104Q184 100 200 88V120H0Z" fill="#486d47" opacity=".20"/>';
 s+=fieldPlot(11,35,28,14,'#b69c58')+fieldPlot(149,32,28,12,'#c0a865')+fieldPlot(22,103,31,12,'#b1a15c');
 // Malha de trilhas, diferente do cruzamento perfeito da aldeia inicial.
 s+=road('M-8 70Q35 61 64 68T129 62T207 77',3.6);
 s+=road('M24 120Q43 91 71 81T109 61T144 27T191 0',3.2);
 s+=road('M20 4Q42 25 70 39T117 73T161 116',2.7);
 s+=road('M2 16Q26 36 61 46T114 40T200 28',1.8);
 // Pedras nas ruas, sempre nos mesmos locais após atualizar a tela.
 for(let i=0;i<145;i++){const x=7+rand(i,2)*185,y=17+rand(i,8)*90,rx=.22+rand(i,9)*.55,ry=.15+rand(i,11)*.32;
  if(rand(i,13)>.6)s+='<ellipse cx="'+f(x)+'" cy="'+f(y)+'" rx="'+f(rx)+'" ry="'+f(ry)+'" fill="#f1deb1" opacity="'+f(.15+rand(i,18)*.4)+'"/>';}
 // Pomar, jardim, cercas, pilhas de lenha, aves e bicho.
 [[17,17,.8],[29,12,1.1],[183,16,1.1],[191,35,.9],[16,83,.75],[24,111,1],[179,108,1],[164,110,1.1],[149,8,.9],[9,59,.6],[90,7,.7]].forEach(([x,y,z])=>s+=pine(x,y,z));
 for(let i=0;i<33;i++){const x=5+rand(i,30)*191,y=8+rand(i,31)*106;if(rand(i,32)>.42)s+=shrub(x,y,.4+rand(i,33)*.45);}
 for(let i=0;i<43;i++){const x=11+rand(i,38)*180,y=7+rand(i,39)*106;if(rand(i,40)>.3)s+=flowers(x,y,i%3?'#f3e5a4':'#dfa9a1');}
 s+=fence(12,106,30)+fence(147,42,24)+fence(7,41,17);
 [[35,105],[41,106],[177,49]].forEach(([x,y],i)=>s+=cow(x,y,i));
 // Bairro residencial fora das casas construíveis: cresce com a população.
 s+=hut(12,53,.61,t.roof)+hut(188,59,.7,t.roof);
 if(pop>=25)s+=hut(181,96,.63,t.roof);
 if(pop>=65)s+=hut(37,8,.64,t.roof)+hut(154,12,.59,t.roof);
 if(pop>=130)s+=hut(12,97,.6,t.roof)+hut(188,106,.58,t.roof);
 s+=stall(88,74,t.banner)+stall(113,82,t.cloth)+well(117,52);
 s+=marketCart(63,69)+streetLamps()+birds(151,14);
 // Riacho, reflexos e ponte de madeira sobre o rio da ilustração de base.
 s+='<g class="life-water"><path d="M163 111q12-10 24-8 M168 105q10-8 19-6 M184 88q8-3 12-8" stroke="#d2edf1" stroke-width=".65" fill="none" opacity=".75"/><ellipse cx="183" cy="108" rx="7" ry="1.1" fill="none" stroke="#c7edf0" stroke-width=".55" class="life-ripple"/><ellipse cx="187" cy="92" rx="4" ry=".8" fill="none" stroke="#c7edf0" stroke-width=".5" class="life-ripple"/></g>';
 s+='<g transform="translate(161 99)"><path d="M-5 3L9-8L13-7L-1 5Z" fill="#8d6747" stroke="#624936" stroke-width=".65"/><path d="M-3 0L10-8M0 3L13-6" stroke="#d9b07a" stroke-width=".7"/><path d="M-4 1L-3-4M11-7L10-11" stroke="#765437" stroke-width=".7"/></g>';
 // 3–12 moradores desenhados em SVG; velocidade baixa e diversidade de posição.
 const count=Math.min(12,3+Math.floor(pop/15));
 for(let i=0;i<count;i++){const x=48+rand(i,54)*105,y=42+rand(i,55)*59;s+=resident(x,y,i,t.banner);}
 if(wall>=1)s+='<g class="life-gate"><path d="M93 109q7 -9 14 0v8H93Z" fill="#554b39" opacity=".54"/><path d="M91 111q9 -12 18 0" fill="none" stroke="#a08e6e" stroke-width="3"/><path d="M96 112h9" stroke="#b7a18c" stroke-width=".8" stroke-dasharray="2 1"/></g>';
 if(wall>=10)s+='<path d="M15 56Q14 33 29 21M171 18Q190 32 191 56" stroke="#e6d6ad" stroke-width=".65" stroke-dasharray="3 2" fill="none" opacity=".6"/>';
 s+='</g>';
 return base.replace('</svg>',s+'</svg>');
}
function fieldGround(){
 let s='<svg class="town-ground field-ground" viewBox="0 0 200 120" preserveAspectRatio="none" aria-hidden="true" focusable="false">';
 s+='<defs><radialGradient id="lifeFieldGrass"><stop offset="0" stop-color="#b6ca87"/><stop offset=".7" stop-color="#83a96d"/><stop offset="1" stop-color="#4c7751"/></radialGradient><pattern id="lifeFieldTufts" width="12" height="9" patternUnits="userSpaceOnUse"><path d="M1 8l1-2 1 2m6-3l1-2 1 2" fill="none" stroke="#e0daa5" stroke-width=".35" opacity=".4"/></pattern></defs>';
 s+='<rect width="200" height="120" fill="url(#lifeFieldGrass)"/><rect width="200" height="120" fill="url(#lifeFieldTufts)"/>';
 // A gleba central une os 18 recursos ao pequeno povoado.
 s+='<path d="M0 115L24 90L42 72Q71 54 96 60Q132 76 153 51L200 13V120Z" fill="#a6b679" opacity=".42"/>';
 s+=fieldPlot(7,33,36,25,'#beac66')+fieldPlot(67,22,36,18,'#b0a263')+fieldPlot(149,99,38,23,'#cfb968');
 s+=road('M0 73Q48 74 78 58T120 60T200 42',4.2);
 s+=road('M86 0Q87 28 91 54T100 120',3.7);
 s+=road('M0 20Q37 43 61 49T127 83T199 117',2.8);
 s+='<path d="M0 111C36 97 60 117 98 103S160 98 200 79V120H0Z" fill="#4a8e9d" opacity=".83"/>';
 s+='<path class="life-ripple" d="M7 112q17-5 34-2M117 113q16-4 30-7" stroke="#d2eff1" fill="none" opacity=".9" stroke-width=".7"/>';
 s+=fence(7,52,34)+fence(153,24,29);
 [[11,12,1.1],[36,11,.9],[64,6,.7],[177,15,1.1],[190,42,.7],[18,106,1],[174,112,1.1],[138,6,.9]].forEach(([x,y,z])=>s+=pine(x,y,z));
 for(let i=0;i<30;i++){const x=3+rand(i,67)*194,y=5+rand(i,68)*108;if(rand(i,69)>.4)s+=shrub(x,y,.5+rand(i,70)*.4);}
 for(let i=0;i<24;i++){const x=6+rand(i,71)*188,y=6+rand(i,72)*108;s+=flowers(x,y);}
 s+=well(101,66)+cow(39,98)+cow(32,102,2)+birds(144,12);
 s+=resident(78,64,7,'#597654')+resident(123,66,3,'#c08c53');
 s+='</svg>';return s;
}
A.townGround=townGround;
A.fieldGround=fieldGround;
A.LIFE_VERSION='1.7';
})();