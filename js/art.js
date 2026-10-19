/* Guerra Sem Fim — arte isométrica original gerada em SVG.
 * Cada edifício é desenhado a partir de primitivas (caixas, telhados, torres)
 * e evolui visualmente em 4 estágios conforme o nível:
 *   1–4  madeira e palha · 5–9  enxaimel e telhas · 10–14 pedra com ala extra · 15+ fortificado com torre e estandarte.
 * Sem imagens externas: tudo é vetorial, leve e funciona offline.
 */
(function(){
'use strict';

const OX=50,OY=74,K=0.866;
const iso=(x,y,z=0)=>[OX+(x-y)*K,OY+(x+y)*0.5-z];
const P=pts=>pts.map(p=>p.map(n=>n.toFixed(1)).join(',')).join(' ');
const poly=(pts,fill,extra='')=>`<polygon points="${P(pts)}" fill="${fill}" ${extra}/>`;

function shade(hex,amt){
 const n=parseInt(hex.slice(1),16);let r=n>>16,g=n>>8&255,b=n&255;
 const f=c=>Math.max(0,Math.min(255,Math.round(amt<0?c*(1+amt):c+(255-c)*amt)));
 return '#'+[f(r),f(g),f(b)].map(c=>c.toString(16).padStart(2,'0')).join('');
}

const TRIBE={
 romans:{roof:'#b0503a',banner:'#9f2f25',trim:'#e2b64c'},
 gauls:{roof:'#4d7a4f',banner:'#2f6b45',trim:'#d9c06a'},
 teutons:{roof:'#6e4a30',banner:'#3b3b52',trim:'#c7a059'}
};
const STAGE=[
 {wall:'#b4875a',roof:'#c9a34e',stone:false},   // madeira + palha
 {wall:'#e6d7b5',roof:null,stone:false},         // enxaimel + telha da tribo
 {wall:'#cfc8b8',roof:null,stone:true},          // pedra
 {wall:'#ddd6c6',roof:null,stone:true}           // pedra clara, fortificado
];
function stageOf(level){return level>=15?3:level>=10?2:level>=5?1:0;}

/* Caixa isométrica com telhado. Coordenadas do mundo em "unidades de célula". */
function box(x0,y0,w,d,h,wall,roof,type='gable',stone=false){
 const A=[x0,y0],B=[x0+w,y0],C=[x0+w,y0+d],D=[x0,y0+d];
 const g=(p,z)=>iso(p[0],p[1],z);
 let s='';
 const left=shade(wall,-.18),right=wall;
 s+=poly([g(D,0),g(C,0),g(C,h),g(D,h)],left);
 s+=poly([g(C,0),g(B,0),g(B,h),g(C,h)],right);
 if(stone){ // fiadas de pedra
  for(let z=h*0.33;z<h-1;z+=h*0.33){
   const a=g(D,z),b=g(C,z),c=g(B,z);
   s+=`<polyline points="${P([a,b,c])}" fill="none" stroke="${shade(wall,-.32)}" stroke-width=".5" opacity=".7"/>`;
  }
 }else{ // vigas de madeira / enxaimel
  const a=g(D,h),b=g(C,h),c=g(B,h);
  s+=`<polyline points="${P([a,b,c])}" fill="none" stroke="${shade(wall,-.45)}" stroke-width=".8"/>`;
  const m1=iso(x0+w/2,y0+d,0),m2=iso(x0+w/2,y0+d,h);
  s+=`<line x1="${m1[0]}" y1="${m1[1]}" x2="${m2[0]}" y2="${m2[1]}" stroke="${shade(wall,-.45)}" stroke-width=".7"/>`;
 }
 // porta na face frontal-esquerda
 const dw=Math.min(w*0.22,2.2),dx=x0+w*0.5-dw/2,dh=Math.min(h*0.55,4.2);
 s+=poly([iso(dx,y0+d,0),iso(dx+dw,y0+d,0),iso(dx+dw,y0+d,dh),iso(dx,y0+d,dh)],shade(wall,-.6));
 // janela na face direita
 if(d>=2.5&&h>=4){const wy=y0+d*0.4,wz=h*0.55;s+=poly([iso(x0+w,wy,wz),iso(x0+w,wy+1,wz),iso(x0+w,wy+1,wz+1.3),iso(x0+w,wy,wz+1.3)],'#3d3022',`opacity=".75"`);}
 if(type==='flat'){
  s+=poly([g(A,h),g(B,h),g(C,h),g(D,h)],shade(wall,.12));
  // ameias
  for(let i=0;i<w;i+=1.4){const p=[x0+i,y0+d];s+=poly([iso(p[0],p[1],h),iso(p[0]+.7,p[1],h),iso(p[0]+.7,p[1],h+1),iso(p[0],p[1],h+1)],left);}
  for(let i=0;i<d;i+=1.4){const p=[x0+w,y0+i];s+=poly([iso(p[0],p[1],h),iso(p[0],p[1]+.7,h),iso(p[0],p[1]+.7,h+1),iso(p[0],p[1],h+1)],right);}
  return s;
 }
 if(type==='pyramid'){
  const r=Math.max(w,d)*0.75,apex=iso(x0+w/2,y0+d/2,h+r);
  s+=poly([g(D,h),g(C,h),apex],shade(roof,-.12));
  s+=poly([g(C,h),g(B,h),apex],roof);
  return s;
 }
 // telhado de duas águas (cumeeira ao longo de x)
 const r=d*0.55,ym=y0+d/2;
 const R1=iso(x0,ym,h+r),R2=iso(x0+w,ym,h+r);
 s+=poly([g(A,h),g(B,h),R2,R1],shade(roof,-.25));
 s+=poly([g(B,h),g(C,h),R2],shade(wall,.06));
 s+=poly([g(D,h),g(C,h),R2,R1],roof);
 s+=`<line x1="${R1[0]}" y1="${R1[1]}" x2="${R2[0]}" y2="${R2[1]}" stroke="${shade(roof,-.4)}" stroke-width=".8"/>`;
 return s;
}
function cylinder(cx,cy,r,h,fill,roof){
 const b=iso(cx,cy,0),t=iso(cx,cy,h),rx=r*1.22,ry=r*0.62;
 let s=`<rect x="${b[0]-rx}" y="${t[1]}" width="${rx*2}" height="${b[1]-t[1]}" fill="${fill}"/>`;
 s+=`<ellipse cx="${b[0]}" cy="${b[1]}" rx="${rx}" ry="${ry}" fill="${fill}"/>`;
 s+=`<rect x="${b[0]-rx}" y="${t[1]}" width="${rx*.55}" height="${b[1]-t[1]}" fill="${shade(fill,-.2)}" opacity=".6"/>`;
 if(roof){const apex=[t[0],t[1]-r*1.6];s+=`<path d="M${t[0]-rx-1} ${t[1]} L${apex[0]} ${apex[1]} L${t[0]+rx+1} ${t[1]} Q${t[0]} ${t[1]+ry*1.6} ${t[0]-rx-1} ${t[1]}Z" fill="${roof}"/>`;}
 else s+=`<ellipse cx="${t[0]}" cy="${t[1]}" rx="${rx}" ry="${ry}" fill="${shade(fill,.15)}"/>`;
 return s;
}
function flag(x,y,z,color,height=9){
 const b=iso(x,y,z),t=[b[0],b[1]-height];
 return `<line x1="${b[0]}" y1="${b[1]}" x2="${t[0]}" y2="${t[1]}" stroke="#4a3a28" stroke-width=".9"/><path class="art-flag" d="M${t[0]} ${t[1]} q3 -1 6 0.6 q-3 1.6 -6 3.6z" fill="${color}" style="transform-origin:${t[0]}px ${t[1]}px"/>`;
}
function smoke(x,y,z){
 const p=iso(x,y,z);
 return `<g class="art-smoke"><circle cx="${p[0]}" cy="${p[1]-2}" r="1" fill="#e8e4dc"/><circle cx="${p[0]+.9}" cy="${p[1]-3.6}" r="1.3" fill="#e8e4dc"/><circle cx="${p[0]-.3}" cy="${p[1]-6.4}" r="1.6" fill="#e8e4dc"/></g>`;
}
function tree(x,y,s=1,c='#4f7d3f'){
 const p=iso(x,y,0);
 return `<rect x="${p[0]-.6*s}" y="${p[1]-3*s}" width="${1.2*s}" height="${3*s}" fill="#6b4a2c"/><circle cx="${p[0]}" cy="${p[1]-5*s}" r="${3.2*s}" fill="${c}"/><circle cx="${p[0]-1*s}" cy="${p[1]-6*s}" r="${1.6*s}" fill="${shade(c,.2)}"/>`;
}
function tower(x,y,size,h,wall,roof){return box(x,y,size,size,h,wall,roof,'pyramid',true);}
function crates(x,y){let s='';[[0,0],[1.3,0],[.6,1.2]].forEach(([a,b],i)=>{s+=box(x+a,y+b,1.1,1.1,1.1+(i===2?0:0),'#a8763f','#a8763f','flat');});return s;}

/* Desenhos por edifício. g = estágio 0..3, t = cores da tribo. */
const DRAW={
 main(g,t,w,r){let s='';if(g>=2)s+=box(-7,-2,3.5,4,6,w,r,'gable',true);
  s+=box(-4,-4,8,6,7+g*1.5,w,r,'gable',g>=2);
  if(g>=1)s+=flag(0,-1,7+g*1.5+3.3,t.banner,8);
  if(g>=3)s+=tower(4.2,-3.5,2.6,13,w,t.roof)+flag(5.5,-2.2,19,t.banner,7);
  return s;},
 warehouse(g,t,w,r){let s=box(-5,-3,9,5,4+g,w,r,'gable',g>=2);s+=crates(4.6,1);if(g>=2)s+=crates(-6.8,2.2);return s;},
 granary(g,t,w,r){let s=box(-5,-2,5,4,4+g,w,r,'gable',g>=2);s+=cylinder(2.5,0,2.2,6+g*1.5,g>=2?'#d8cdb4':'#c9a46a',r);if(g>=1)s+=cylinder(-1,3.2,1.6,4+g,g>=2?'#d8cdb4':'#c9a46a',r);return s;},
 rally(g,t){let s='';const ring=iso(0,0,0);s+=`<ellipse cx="${ring[0]}" cy="${ring[1]}" rx="9" ry="4.6" fill="#b79b6a" opacity=".8"/>`;
  s+=`<path d="M${ring[0]-8} ${ring[1]} L${ring[0]-4} ${ring[1]-7} L${ring[0]} ${ring[1]}Z" fill="#e7dcc0"/><path d="M${ring[0]-4} ${ring[1]-7} L${ring[0]} ${ring[1]} L${ring[0]-1.5} ${ring[1]}Z" fill="#cbbd9b"/>`;
  s+=`<circle cx="${ring[0]+4}" cy="${ring[1]+1}" r="1.6" fill="#e2672c"/><circle cx="${ring[0]+4}" cy="${ring[1]}" r=".8" fill="#ffd36a"/>`;
  s+=flag(1,-1,0,t.banner,16+g*2);if(g>=2)s+=flag(-3,2,0,t.banner,12);return s;},
 barracks(g,t,w,r){let s=box(-6,-3,10,5,4.5+g,w,r,'gable',g>=2);const p=iso(5,2,0);
  for(let i=0;i<3;i++)s+=`<line x1="${p[0]+i*1.6}" y1="${p[1]}" x2="${p[0]+i*1.6+1}" y2="${p[1]-8}" stroke="#5b4630" stroke-width=".7"/><path d="M${p[0]+i*1.6+1} ${p[1]-8} l-.7 1.6 h1.4z" fill="#9aa4ad"/>`;
  if(g>=2)s+=flag(-5,-2,6.5+g,t.banner,7);if(g>=3)s+=tower(-8.5,-1,2.4,10,w,t.roof);return s;},
 stable(g,t,w,r){let s=box(-6,-3,11,4.5,4+g*.8,w,r,'gable',g>=2);const a=iso(-6,3,0),b=iso(5,3,0);
  s+=`<path d="M${a[0]} ${a[1]+2} L${b[0]} ${b[1]+2}" stroke="#7a5532" stroke-width=".8"/><path d="M${a[0]} ${a[1]+.5} L${b[0]} ${b[1]+.5}" stroke="#7a5532" stroke-width=".8"/>`;
  const h=iso(3,4,0);s+=`<ellipse cx="${h[0]}" cy="${h[1]-2}" rx="2.4" ry="1.3" fill="#7b4f2e"/><rect x="${h[0]+1.6}" y="${h[1]-4.5}" width="1" height="2.5" fill="#7b4f2e"/>`;
  return s;},
 academy(g,t,w,r){let s=box(-5,-4,8,6,6+g,w,r,'gable',g>=1);s+=tower(3.2,-2,2.6,9+g*1.5,w,shade(r,-.1));if(g>=2)s+=flag(4.5,-.7,9+g*1.5+4,t.banner,6);return s;},
 hospital(g,t,w,r){let s=box(-5,-3,9,5,5+g,g>=2?'#efeadd':'#e3d6bb',r,'gable',g>=2);const c=iso(4,0,3+g/2);
  s+=`<rect x="${c[0]-.6}" y="${c[1]-2}" width="1.2" height="4" fill="#c0392b"/><rect x="${c[0]-2}" y="${c[1]-.6}" width="4" height="1.2" fill="#c0392b"/>`;return s;},
 smithy(g,t,w,r){let s=box(-5,-3,8,5,4.5+g,w,r,'gable',g>=2);s+=box(1.6,-2.6,1.2,1.2,9+g,'#7d756b','#7d756b','flat')+smoke(2.2,-2,11+g);
  const a=iso(5,2.5,0);s+=`<path d="M${a[0]-2} ${a[1]-1.5} h4 l-1 1.5 h-2z" fill="#4b4b52"/><circle cx="${a[0]+2.6}" cy="${a[1]-1}" r="1" fill="#ff8a3d" class="art-glow"/>`;return s;},
 wall(g,t,w){let s='';const c=g>=2?'#bdb5a3':'#a57d52';s+=box(-7,-1,14,2,4+g*1.5,c,c,'flat',g>=2);if(g>=1)s+=tower(-8.5,-1.5,3,7+g*1.5,c,t.roof);if(g>=1)s+=tower(6,-1.5,3,7+g*1.5,c,t.roof);return s;},
 marketplace(g,t){let s='';const cols=['#c0392b','#e0b23d','#3b7bbf','#5b9c55'];
  [[-5,-2],[0,-4],[1.5,1.5],[-3.5,3]].slice(0,2+Math.min(2,g)).forEach(([x,y],i)=>{s+=box(x,y,3,3,2.2,'#d2b48c',cols[i],'pyramid');});
  s+=crates(4.5,-1);return s;},
 cranny(g){const p=iso(0,0,0);return `<ellipse cx="${p[0]}" cy="${p[1]-1}" rx="${8+g}" ry="${4.4+g*.4}" fill="#7a8f55"/><ellipse cx="${p[0]}" cy="${p[1]-2.5}" rx="${6+g}" ry="${3.2+g*.3}" fill="#8ea463"/><path d="M${p[0]-2} ${p[1]} q2 -5 4 0z" fill="#3b2c1c"/>${g>=1?`<rect x="${p[0]-2.4}" y="${p[1]-.3}" width="4.8" height=".9" fill="#6f5534"/>`:''}`;},
 sawmill(g,t,w,r){let s=box(-5,-3,8,5,4.5+g,w,r,'gable',g>=2);const p=iso(4.5,2.5,0);
  for(let i=0;i<3;i++)s+=`<ellipse cx="${p[0]+i*.6}" cy="${p[1]-1-i*1.4}" rx="3" ry=".9" fill="#9a6a3a"/><circle cx="${p[0]+3+i*.6}" cy="${p[1]-1-i*1.4}" r=".9" fill="#d6a86b"/>`;
  const wh=iso(-5,1,2.5);s+=`<circle cx="${wh[0]}" cy="${wh[1]}" r="3" fill="none" stroke="#6b4a2c" stroke-width="1" class="art-spin" style="transform-origin:${wh[0]}px ${wh[1]}px"/><path d="M${wh[0]-3} ${wh[1]}h6M${wh[0]} ${wh[1]-3}v6" stroke="#6b4a2c" stroke-width=".7" class="art-spin" style="transform-origin:${wh[0]}px ${wh[1]}px"/>`;return s;},
 brickyard(g,t,w,r){let s=box(-5,-3,7,5,4+g,w,r,'gable',g>=2);const k=iso(4,0,0);
  s+=`<path d="M${k[0]-4} ${k[1]} q4 -10 8 0z" fill="#a4553a"/><path d="M${k[0]-1.2} ${k[1]} q1.2 -3 2.4 0z" fill="#ff8a3d" class="art-glow"/>`+smoke(4,0,8);
  s+=box(3,3,2.4,1.4,1.4,'#b5603f','#b5603f','flat');return s;},
 ironworks(g,t,w,r){let s=box(-5,-3,8,5,5+g,'#9a948a',r,'gable',true);s+=box(2,-2.5,1.5,1.5,11+g,'#6f6a62','#6f6a62','flat')+smoke(2.7,-1.8,13+g);
  const p=iso(3.5,3,0);s+=`<ellipse cx="${p[0]}" cy="${p[1]-1}" rx="2.6" ry="1.2" fill="#ff7b2e" class="art-glow"/>`;return s;},
 mill(g,t,w,r){let s=cylinder(0,0,2.8,9+g*1.5,g>=2?'#ddd4c2':'#c9a46a',r);const hub=iso(0,0,9+g*1.5-1.2);const hx=hub[0]+2.6,hy=hub[1]+1.4,L=8+g;
  s+=`<g class="art-spin" style="transform-origin:${hx}px ${hy}px">`;for(let i=0;i<4;i++)s+=`<path d="M${hx} ${hy} l${L} -.9 v1.8z" fill="#efe6cf" stroke="#6b4a2c" stroke-width=".4" transform="rotate(${i*90+20} ${hx} ${hy})"/>`;
  s+=`</g><circle cx="${hx}" cy="${hy}" r="1" fill="#5b3f26"/>`;return s;},
 embassy(g,t,w,r){let s=box(-5,-4,9,6,6+g,w,r,'gable',g>=1);s+=flag(-4,1.5,0,'#3b7bbf',13)+flag(3,1.5,0,t.banner,13);if(g>=2)s+=flag(5.5,-1,0,'#e0b23d',13);return s;},
 palace(g,t,w,r){let s='';s+=tower(-8,-3,3,10+g*2,w,t.roof);s+=box(-5,-5,10,7,8+g*1.5,w,r,'gable',true);s+=tower(5.5,-3,3,10+g*2,w,t.roof);
  s+=flag(0,-1.5,8+g*1.5+4,t.banner,9);const p=iso(0,2,0);s+=`<rect x="${p[0]-3}" y="${p[1]-1}" width="6" height="1" fill="${t.trim}"/>`;return s;},
 residence(g,t,w,r){let s=box(-5,-3,8,5,6+g,w,r,'gable',g>=2);s+=tower(3.5,-2,2.4,9+g*1.5,w,t.roof);if(g>=1)s+=flag(4.7,-.8,9+g*1.5+3.5,t.trim,6);return s;},
 heroMansion(g,t,w,r){let s=box(-6,-4,10,6,6+g,w,r,'gable',g>=2);s+=flag(4,2.5,0,t.banner,14);const p=iso(-6,3,0);s+=`<path d="M${p[0]} ${p[1]-8} q3 4 0 8" fill="none" stroke="#6b4a2c" stroke-width=".9"/><line x1="${p[0]}" y1="${p[1]-8}" x2="${p[0]}" y2="${p[1]}" stroke="#e7dcc0" stroke-width=".3"/>`;return s;},
 townhall(g,t,w,r){let s=box(-6,-4,12,6,7+g,w,r,'gable',true);for(let i=0;i<5;i++){const a=iso(-5+i*2.5,2,0),b=iso(-5+i*2.5,2,5+g/2);s+=`<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" stroke="#f3eee2" stroke-width="1.3"/>`;}
  if(g>=2)s+=flag(0,-1,7+g+4,t.banner,8);return s;},
 workshop(g,t,w,r){let s=box(-6,-4,8,5,5+g,w,r,'gable',g>=2);const p=iso(4,2,0);
  s+=`<rect x="${p[0]-3}" y="${p[1]-2}" width="6" height="1.4" fill="#7a5532"/><circle cx="${p[0]-2.2}" cy="${p[1]-.4}" r="1.1" fill="#4b3a26"/><circle cx="${p[0]+2.2}" cy="${p[1]-.4}" r="1.1" fill="#4b3a26"/><line x1="${p[0]-2}" y1="${p[1]-2}" x2="${p[0]+3}" y2="${p[1]-9}" stroke="#7a5532" stroke-width="1.1"/><circle cx="${p[0]+3}" cy="${p[1]-9.4}" r="1.2" fill="#8d8d8d"/>`;return s;},
 aqueduct(g,t){let s='';const n=3+Math.min(g,2),c='#d6cbb1';const a=iso(-7,0,0),b=iso(-7+n*3,0,0);
  s+=`<path d="M${a[0]} ${a[1]-8} L${b[0]} ${b[1]-8} L${b[0]} ${b[1]-10} L${a[0]} ${a[1]-10}Z" fill="${shade(c,-.1)}"/>`;
  for(let i=0;i<n;i++){const p=iso(-7+i*3,0,0),q=iso(-4+i*3,0,0);s+=`<path d="M${p[0]} ${p[1]} L${p[0]} ${p[1]-8} L${q[0]} ${q[1]-8} L${q[0]} ${q[1]} L${q[0]-.8} ${q[1]} Q${(p[0]+q[0])/2} ${(p[1]+q[1])/2-6} ${p[0]+.8} ${p[1]}Z" fill="${c}"/>`;}
  const w=iso(-7,0,10);s+=`<path d="M${w[0]} ${w[1]+.4} L${b[0]} ${b[1]-9.6}" stroke="#6fa8c9" stroke-width="1"/>`;return s;},
 grove(g){let s='';const p=iso(0,0,0);s+=`<ellipse cx="${p[0]}" cy="${p[1]}" rx="9" ry="4.6" fill="#7da35f"/>`;
  for(let i=0;i<6;i++){const a=i/6*Math.PI*2;const q=iso(Math.cos(a)*4,Math.sin(a)*4,0);s+=`<rect x="${q[0]-.7}" y="${q[1]-3}" width="1.4" height="3" fill="#a9a59a"/>`;}
  [[-5,-3],[4,-4],[-1,-6],[5,3]].slice(0,2+Math.min(2,g)).forEach(([x,y])=>s+=tree(x,y,1.2,'#3f6e3a'));return s;},
 forgeHall(g,t,w,r){let s=box(-6,-4,10,6,6+g,'#8f8678',r,'gable',true);const p=iso(5,2.5,0);
  s+=`<path d="M${p[0]-2} ${p[1]} q2 -7 4 0z" fill="#ff7b2e" class="art-glow"/><path d="M${p[0]-1} ${p[1]} q1 -4 2 0z" fill="#ffd36a"/>`+smoke(2,-2,9+g);return s;}
};

function scaffold(){const a=iso(-5,3,0),b=iso(4,3,0),c=iso(-5,3,9),d=iso(4,3,9);
 return `<g class="art-scaffold" stroke="#8a6234" stroke-width=".8" fill="none"><line x1="${a[0]}" y1="${a[1]}" x2="${c[0]}" y2="${c[1]}"/><line x1="${b[0]}" y1="${b[1]}" x2="${d[0]}" y2="${d[1]}"/><line x1="${(a[0]+c[0])/2}" y1="${(a[1]+c[1])/2}" x2="${(b[0]+d[0])/2}" y2="${(b[1]+d[1])/2}"/><line x1="${c[0]}" y1="${c[1]}" x2="${d[0]}" y2="${d[1]}"/><line x1="${a[0]}" y1="${a[1]}" x2="${d[0]}" y2="${d[1]}" opacity=".6"/></g>`;}

function building(key,level,tribe='romans',opts={}){
 const t=TRIBE[tribe]||TRIBE.romans,g=stageOf(level||1),st=STAGE[g];
 const roof=st.roof||t.roof,wall=st.wall;
 const draw=DRAW[key]||DRAW.main;
 const base=iso(0,0,0);
 let body=`<ellipse cx="${base[0]}" cy="${base[1]+.6}" rx="12.5" ry="5.6" fill="#1d3318" opacity=".22"/>`;
 body+=`<ellipse cx="${base[0]}" cy="${base[1]}" rx="11" ry="5" fill="${g>=2?'#cbbd98':'#bfa572'}" opacity=".85"/>`;
 body+=draw(g,t,wall,roof);
 if(opts.building)body+=scaffold();
 if(g>=3)body+=`<circle cx="${base[0]+9}" cy="${base[1]-20}" r=".7" fill="${t.trim}" class="art-sparkle"/>`;
 return `<svg class="art-building stage-${g}" viewBox="0 10 100 76" aria-hidden="true" focusable="false"><g transform="translate(${OX} ${OY}) scale(2.15) translate(${-OX} ${-OY})">${body}</g></svg>`;
}

function plot(){
 const p=iso(0,0,0);
 return `<svg class="art-plot" viewBox="0 10 100 76" aria-hidden="true" focusable="false"><ellipse cx="${p[0]}" cy="${p[1]}" rx="24" ry="11" fill="#c9b27e" opacity=".55"/><ellipse cx="${p[0]}" cy="${p[1]}" rx="24" ry="11" fill="none" stroke="#f6ecd0" stroke-width=".8" stroke-dasharray="2 2" opacity=".9"/><path d="M${p[0]-3} ${p[1]}h6M${p[0]} ${p[1]-3}v6" stroke="#f6ecd0" stroke-width="1.2" stroke-linecap="round" opacity=".95"/></svg>`;
}

/* Campos de recursos: lote isométrico cujo conteúdo cresce com o nível. */
function field(type,level){
 const p=iso(0,0,0),lv=Math.max(0,level||0),g=lv>=15?3:lv>=10?2:lv>=5?1:0;
 const ground={wood:'#6f9a4f',clay:'#c08a5c',iron:'#9a9a92',crop:'#c9b45a'}[type]||'#8aa86a';
 let s=`<ellipse cx="${p[0]}" cy="${p[1]+1}" rx="14" ry="6.4" fill="#1d3318" opacity=".2"/><ellipse cx="${p[0]}" cy="${p[1]}" rx="13" ry="5.8" fill="${ground}"/>`;
 if(type==='wood'){const n=2+Math.min(6,Math.ceil(lv/2));for(let i=0;i<n;i++){const a=i*2.4,r=3+(i%3);s+=tree(Math.cos(a)*r-1,Math.sin(a)*r,0.9+g*.12,i%2?'#3f6e3a':'#4f7d3f');}if(g>=1)s+=box(4,2,2.5,1.5,1.2,'#9a6a3a','#9a6a3a','flat');}
 if(type==='clay'){s+=`<ellipse cx="${p[0]}" cy="${p[1]-.5}" rx="${10+g*2}" ry="${4+g}" fill="#9c5f3c"/>`;for(let i=0;i<1+g;i++)s+=box(-6+i*3,2,2.2,1.2,1+(i%2),'#b5603f','#b5603f','flat');if(g>=2)s+=box(3,-4,4,3,3,'#d2b48c','#a4553a','gable');}
 if(type==='iron'){s+=`<path d="M${p[0]-14} ${p[1]+1} L${p[0]-5} ${p[1]-12-g*2} L${p[0]+2} ${p[1]-4} L${p[0]+8} ${p[1]-10-g} L${p[0]+15} ${p[1]+1}Z" fill="#7c7a74"/><path d="M${p[0]-5} ${p[1]-12-g*2} L${p[0]-2} ${p[1]-8} L${p[0]-7} ${p[1]-9}Z" fill="#eeeeea"/><path d="M${p[0]-3} ${p[1]+1} q3 -6 6 0z" fill="#2f2a24"/>`;if(g>=1)s+=`<rect x="${p[0]+4}" y="${p[1]-1}" width="4" height="2" fill="#6b4a2c"/><circle cx="${p[0]+4.6}" cy="${p[1]+1.2}" r=".7" fill="#333"/><circle cx="${p[0]+7.4}" cy="${p[1]+1.2}" r=".7" fill="#333"/>`;}
 if(type==='crop'){s+=`<clipPath id="gsfCropClip"><ellipse cx="${p[0]}" cy="${p[1]}" rx="11.5" ry="5"/></clipPath><g clip-path="url(#gsfCropClip)">`;for(let r=-7;r<=7;r++){const y=p[1]+r*1.3;s+=`<line x1="${p[0]-14}" y1="${y-3}" x2="${p[0]+14}" y2="${y+3}" stroke="${lv?'#e9cf6e':'#a99a55'}" stroke-width="${.5+Math.min(lv,10)*.05}" stroke-linecap="round"/>`;}s+='</g>';
  if(g>=1)s+=box(6,-6,3,2.5,2.5+g,'#b4875a','#c9a34e','gable');if(g>=2)s+=cylinder(-7,-5,1.4,4,'#c9a46a','#b0503a');}
 return `<svg class="art-field" viewBox="0 30 100 60" aria-hidden="true" focusable="false"><g transform="translate(${OX} ${OY}) scale(1.85) translate(${-OX} ${-OY})">${s}</g></svg>`;
}

/* Cenário de fundo da aldeia: praça, estradas, rio, árvores e muralha que cresce com o nível. */
function townGround(wallLevel=0,tribe='romans'){
 const t=TRIBE[tribe]||TRIBE.romans,wl=Math.max(0,wallLevel||0);
 let s=`<defs><radialGradient id="gsfGrass" cx="50%" cy="48%" r="65%"><stop offset="0" stop-color="#b9cf8f"/><stop offset=".6" stop-color="#93b674"/><stop offset="1" stop-color="#6f9658"/></radialGradient>
 <pattern id="gsfTuft" width="7" height="6" patternUnits="userSpaceOnUse"><path d="M1 5l1-2 1 2M4.5 3l.8-1.6.8 1.6" stroke="#6f9a55" stroke-width=".35" fill="none" opacity=".55"/></pattern></defs>`;
 s+=`<rect width="200" height="120" fill="url(#gsfGrass)"/><rect width="200" height="120" fill="url(#gsfTuft)"/>`;
 // rio
 s+=`<path d="M160 120 C170 96 186 92 200 70 L200 120Z" fill="#5f9bb5" opacity=".9"/><path d="M164 120 C173 99 187 95 200 76" stroke="#bfe0ea" stroke-width="1" fill="none" opacity=".7"/>`;
 // estradas
 s+=`<path d="M0 62 Q60 58 100 60 T200 52" stroke="#d6c08e" stroke-width="7" fill="none" opacity=".75" stroke-linecap="round"/><path d="M100 0 Q96 40 100 60 T104 120" stroke="#d6c08e" stroke-width="6" fill="none" opacity=".7" stroke-linecap="round"/>`;
 // praça central
 s+=`<ellipse cx="100" cy="60" rx="58" ry="30" fill="#ddd1a4" opacity=".55"/><ellipse cx="100" cy="60" rx="58" ry="30" fill="none" stroke="#c7b27c" stroke-width=".8" stroke-dasharray="3 2" opacity=".8"/>`;
 // árvores de borda
 [[8,10],[22,6],[182,8],[192,26],[6,100],[14,84],[30,112],[150,112],[186,40],[4,40],[60,4],[140,4]].forEach(([x,y],i)=>{s+=`<g transform="translate(${x} ${y})"><rect x="-.6" y="-1" width="1.2" height="3" fill="#5d4027"/><circle cy="-3" r="${3+(i%3)}" fill="${i%2?'#3f6e3a':'#4f7d3f'}"/><circle cx="-1" cy="-4" r="1.5" fill="#6f9a55"/></g>`;});
 // muralha
 if(wl>0){const stone=wl>=10,c=stone?'#b8b09d':'#9b744b',w=2.2+Math.min(wl,20)*.18;
  s+=`<ellipse cx="100" cy="61" rx="95" ry="56" fill="none" stroke="${shade(c,-.3)}" stroke-width="${w+1.4}" opacity=".85"/><ellipse cx="100" cy="60" rx="95" ry="56" fill="none" stroke="${c}" stroke-width="${w}" ${stone?'stroke-dasharray="3 1.2"':''}/>`;
  if(wl>=5)[[5,60],[195,60],[100,4],[100,116],[33,20],[167,20],[33,100],[167,100]].slice(0,wl>=15?8:4).forEach(([x,y])=>{s+=`<rect x="${x-3}" y="${y-5}" width="6" height="7" fill="${c}"/><path d="M${x-3.6} ${y-5} L${x} ${y-10} L${x+3.6} ${y-5}Z" fill="${t.roof}"/>`;});}
 return `<svg class="town-ground" viewBox="0 0 200 120" preserveAspectRatio="none" aria-hidden="true" focusable="false">${s}</svg>`;
}

function scenery(kind){if(kind==='tree')return `<svg class="art-tree" viewBox="-6 -11 12 13" aria-hidden="true"><rect x="-.7" y="-2" width="1.4" height="3.5" fill="#5d4027"/><circle cy="-5" r="4.4" fill="#3f6e3a"/><circle cx="-1.4" cy="-6.4" r="2" fill="#6f9a55"/></svg>`;return '';}

/* ---------- Tiles do mapa-múndi ----------
 * Terreno contínuo (a grama se encaixa entre tiles vizinhos) com decoração determinística por coordenada.
 */
function hash(x,y,k=0){let h=Math.imul(x*73856093^y*19349663^k*83492791,2654435761);h^=h>>>15;return (h>>>0)/4294967295;}
const GRASS='#93b674';
function tuftsAt(x,y){let s='';for(let i=0;i<4;i++){const a=hash(x,y,i)*36+2,b=hash(y,x,i+9)*36+2;s+=`<path d="M${a.toFixed(1)} ${b.toFixed(1)}l1 -2.2 1 2.2" stroke="#6f9a55" stroke-width=".6" fill="none" opacity=".7"/>`;}
 if(hash(x,y,21)>.7){const a=hash(x,y,22)*30+5,b=hash(x,y,23)*30+5;s+=`<circle cx="${a.toFixed(1)}" cy="${b.toFixed(1)}" r=".9" fill="${hash(x,y,24)>.5?'#f2e27a':'#f4f1e6'}"/>`;}
 return s;}
function mtree(x,y,s=1,c='#3f6e3a'){return `<g transform="translate(${x} ${y}) scale(${s})"><rect x="-.7" y="-1" width="1.4" height="3" fill="#5d4027"/><circle cy="-3.5" r="3.6" fill="${c}"/><circle cx="-1.2" cy="-4.6" r="1.6" fill="#6f9a55"/></g>`;}
function pine(x,y,s=1){return `<g transform="translate(${x} ${y}) scale(${s})"><rect x="-.5" y="-.5" width="1" height="2.5" fill="#5d4027"/><path d="M0 -9 L3.6 -1 L-3.6 -1Z" fill="#2f5d37"/><path d="M0 -9 L3.6 -1 L0 -1Z" fill="#3c7044"/></g>`;}
function hut(x,y,roof,s=1){return `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-4 0 V-3.5 L0 -5.6 L4 -3.5 V0Z" fill="#e3d4b0"/><path d="M-4 0 V-3.5 L0 -5.6 V0Z" fill="#cbbb94"/><path d="M-5 -3.2 L0 -7.4 L5 -3.2 L4 -3.5 L0 -6 L-4 -3.5Z" fill="${roof}"/><rect x="-.8" y="-2.2" width="1.6" height="2.2" fill="#4a3826"/></g>`;}
function mflag(x,y,c,h=10){return `<line x1="${x}" y1="${y}" x2="${x}" y2="${y-h}" stroke="#4a3a28" stroke-width=".8"/><path class="art-flag" d="M${x} ${y-h} q3 -.8 6 .6 q-3 1.4 -6 3.2z" fill="${c}" style="transform-origin:${x}px ${y-h}px"/>`;}
function tile(t,x,y,opts={}){
 const kind=t?.kind||'unmapped';let s=`<rect width="40" height="40" fill="${GRASS}"/>`;
 if(kind==='unmapped')return `<svg class="art-tile" viewBox="0 0 40 40" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><rect width="40" height="40" fill="#7d8f74"/><path d="M0 28 q10 -6 20 0 t20 0 V40 H0Z" fill="#8c9c83" opacity=".7"/></svg>`;
 s+=tuftsAt(x,y);
 const n=Math.abs(x*17+y*23)%11; // mesmo sorteio de antes: o terreno de cada coordenada não muda
 if(kind==='empty'){
  if(n===0)s+=`<path d="M4 33 L15 12 L21 22 L26 15 L37 33Z" fill="#8a877d"/><path d="M15 12 L18.5 18.5 L13 18Z" fill="#f2f0ea"/><path d="M15 12 L4 33 H13Z" fill="#76736a"/>`;
  else if(n===1){[[10,24],[19,18],[28,25],[16,31],[25,33]].forEach(([a,b],i)=>s+=pine(a,b,.9+hash(x,y,i)*.3));}
  else if(n===2){s+=`<path d="M6 30 L20 21 L34 30 L20 39Z" fill="#d9bf5c"/>`;for(let i=0;i<5;i++)s+=`<path d="M${9+i*2.8} ${28.5+i*1.8-1.8*0} l11 -7" stroke="#b99a3f" stroke-width=".6"/>`;}
  else if(n===3){[[12,22],[26,20],[19,30]].forEach(([a,b],i)=>s+=mtree(a,b,1+hash(x,y,i)*.25,i%2?'#3f6e3a':'#4f7d3f'));}
  else if(hash(x,y,5)>.82)s+=`<ellipse cx="${12+hash(x,y,6)*16}" cy="${14+hash(x,y,7)*14}" rx="2.2" ry="1.3" fill="#a9a59a"/>`;
  if(opts.profile==='crop15'||opts.profile==='crop9')s+=`<path d="M8 33 L20 26 L32 33 L20 40Z" fill="#e3c766" opacity=".85"/>`;
 }
 if(kind==='oasis'){
  s+=`<ellipse cx="20" cy="25" rx="13" ry="7.5" fill="#d8c48e"/><ellipse cx="20" cy="25" rx="10.5" ry="5.6" fill="#5f9bb5"/><path d="M13 24 q7 -2.5 14 0" stroke="#bfe0ea" stroke-width=".7" fill="none"/>`;
  [[9,22],[31,21]].forEach(([a,b])=>s+=`<path d="M${a} ${b} q1 -6 0 -11" stroke="#7a5532" stroke-width="1.2" fill="none"/><path d="M${a} ${b-11} q-5 -1 -7 3 M${a} ${b-11} q5 -1 7 3 M${a} ${b-11} q-3 -4 -6 -3 M${a} ${b-11} q3 -4 6 -3" stroke="#3f7a3a" stroke-width="1.6" fill="none" stroke-linecap="round"/>`);
  if(opts.owned)s+=mflag(20,21,opts.ownerColor||'#e2b64c',9);
 }
 if(kind==='enemy'){
  s+=`<ellipse cx="20" cy="27" rx="15" ry="8" fill="#b79b6a"/>`;
  for(let i=0;i<9;i++){const a=i/9*Math.PI*2,px=20+Math.cos(a)*14,py=27+Math.sin(a)*7.5;s+=`<rect x="${(px-.7).toFixed(1)}" y="${(py-4).toFixed(1)}" width="1.4" height="4.5" fill="#6b4a2c"/>`;}
  s+=`<path d="M11 30 L16 21 L21 30Z" fill="#8c7a5e"/><path d="M16 21 L21 30 H18Z" fill="#6e5f48"/><path d="M21 31 L26 23 L31 31Z" fill="#9b8869"/>`+mflag(17,24,'#2b2b2b',12);
  s+=`<circle cx="22" cy="31" r="1" fill="#e2672c"/>`;
 }
 if(kind==='player'){
  const roof=opts.roof||'#b0503a';s+=`<ellipse cx="20" cy="27" rx="16" ry="9" fill="#d6c08e"/>`;
  s+=hut(12,27,roof,.95)+hut(27,26,roof,.95)+hut(20,33,roof,1.05)+`<rect x="17" y="12" width="6" height="11" fill="#e8dcc0"/><rect x="17" y="12" width="2.4" height="11" fill="#cdbf9e"/><path d="M16 12 L20 6.5 L24 12Z" fill="${roof}"/>`+mflag(23,7,opts.banner||'#9f2f25',7);
 }
 if(kind==='rival'){
  const c=t.color||'#7a3433';s+=`<ellipse cx="20" cy="28" rx="16" ry="9" fill="#c2b08a"/>`;
  s+=`<path d="M7 31 V22 H33 V31Z" fill="#a9a091"/><path d="M7 22 h2v-2h2v2h2v-2h2v2h2v-2h2v2h2v-2h2v2h2v-2h2v2h2v-2h2v2" fill="#a9a091"/><rect x="16" y="14" width="8" height="17" fill="#bcb4a4"/><path d="M15 14 L20 7.5 L25 14Z" fill="${c}"/><rect x="18.5" y="25" width="3" height="6" fill="#3b2c1c"/>`+mflag(20,8,c,6);
  if((t.walls||0)>=3)s+=`<path d="M5 31 V24 L7 22 L9 24 V31Z M31 31 V24 L33 22 L35 24 V31Z" fill="#8f877a"/>`;
 }
 return `<svg class="art-tile" viewBox="0 0 40 40" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">${s}</svg>`;
}
const TRIBE_COLORS=TRIBE;

window.GSF_ART={tile,tribeColors:t=>TRIBE_COLORS[t]||TRIBE_COLORS.romans,scenery,building,plot,field,townGround,stageOf,STAGE_LABELS:['Madeira','Enxaimel','Pedra','Fortificado']};
})();
