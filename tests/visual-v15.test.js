/* v1.5 — arte isométrica, cereal inicial positivo e mapa com zoom. */
const fs=require('fs'),vm=require('vm'),path=require('path'),assert=require('assert');
const root=path.resolve(__dirname,'..');
function boot(withArt=true){
 const memory=new Map(),callbacks={},dom={innerHTML:''};
 const window={addEventListener:()=>{},innerWidth:1280,GSF_RECOVERED_BACKUP:false};
 const document={querySelector:s=>s==='#app'?dom:null,addEventListener:(ev,fn)=>{callbacks[ev]=fn;},body:{appendChild:()=>{}}};
 const context={window,document,localStorage:{getItem:k=>memory.get(k)||null,setItem:(k,v)=>memory.set(k,v),removeItem:k=>memory.delete(k)},Date,Math,JSON,console,setInterval:()=>0,setTimeout:()=>0};
 vm.createContext(context);
 const files=['data',...(withArt?['art']:[]),'war','ai','campaign','engine'];
 for(const f of files)vm.runInContext(fs.readFileSync(path.join(root,'js',f+'.js'),'utf8'),context,{filename:f});
 return {context,dom,callbacks};
}
let n=0;const check=(name,fn)=>{fn();n++;console.log('✓',name);};

check('Aldeia inicial começa com saldo positivo de cereal em todas as tribos',()=>{
 for(const tribe of ['romans','gauls','teutons']){const {context}=boot();const st=context.window.GSF.newGame({tribe});const p=context.window.GSF.production(st,st.villages[0]);assert(p.crop>0,`${tribe}: cereal ${p.crop}/h`);}
});

check('Todo edifício gera SVG nos 4 estágios, e os estágios são diferentes',()=>{
 const {context}=boot();const A=context.window.GSF_ART,D=context.window.GSF_DATA;
 for(const key of Object.keys(D.BUILDINGS)){
  const svgs=[1,5,10,15].map(lv=>A.building(key,lv,'romans'));
  svgs.forEach((s,i)=>{assert(s.startsWith('<svg'),key);assert(s.includes(`stage-${i}`),key);assert(!/NaN|undefined/.test(s),`${key} contém NaN/undefined`);});
  assert.notStrictEqual(svgs[0],svgs[3],`${key} não evolui visualmente`);
 }
 assert.strictEqual(A.stageOf(4),0);assert.strictEqual(A.stageOf(5),1);assert.strictEqual(A.stageOf(10),2);assert.strictEqual(A.stageOf(20),3);
});

check('Campos, terreno vazio e cenário com muralha geram SVG válido',()=>{
 const {context}=boot();const A=context.window.GSF_ART;
 for(const t of ['wood','clay','iron','crop'])for(const lv of [0,5,10,20]){const s=A.field(t,lv);assert(s.startsWith('<svg')&&!/NaN|undefined/.test(s),`${t} ${lv}`);}
 assert(A.plot().startsWith('<svg'));
 assert(!A.townGround(0).includes('stroke-dasharray="3 1.2"'));
 assert(A.townGround(12).includes('stroke-dasharray="3 1.2"'),'muralha de pedra a partir do nível 10');
});

check('Interface usa a arte quando disponível e mantém emojis sem ela',()=>{
 for(const withArt of [true,false]){
  const {context,dom}=boot(withArt);context.window.GSF.newGame({speed:1});
  vm.runInContext(fs.readFileSync(path.join(root,'js/app.js'),'utf8'),context,{filename:'app'});
  assert.strictEqual(dom.innerHTML.includes('art-building'),withArt);
  assert.strictEqual(dom.innerHTML.includes('town-ground'),withArt);
  assert(dom.innerHTML.includes('data-slot="0"'));
 }
});

check('Mapa: zoom altera a região visível e o minimapa é renderizado',()=>{
 const {context,dom,callbacks}=boot();context.window.GSF.newGame({speed:1});
 vm.runInContext(fs.readFileSync(path.join(root,'js/app.js'),'utf8'),context,{filename:'app'});
 const click=dataset=>callbacks.click({target:{closest:()=>({dataset})}});
 click({nav:'map'});const cols=()=>Number(/data-map-columns="(\d+)"/.exec(dom.innerHTML)[1]);
 const before=cols();assert(dom.innerHTML.includes('data-minimap'));assert(dom.innerHTML.includes('data-map-viewport'));
 click({mapZoom:'out'});assert.strictEqual(cols(),before+2);
 click({mapZoom:'in'});click({mapZoom:'in'});assert.strictEqual(cols(),before-2);
 for(let i=0;i<10;i++)click({mapZoom:'out'});assert.strictEqual(cols(),17,'zoom máximo mostra o mundo inteiro (17×17)');
});
console.log(`✓ v1.5 visual: ${n} verificações`);
