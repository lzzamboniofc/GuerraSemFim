/* Smoke do HTML renderizado no DOM simulado, sem dependências. */
const fs=require('fs'),vm=require('vm'),path=require('path'),assert=require('assert');
const root=path.resolve(__dirname,'..'),memory=new Map(),callbacks={},dom={innerHTML:''};
const window={addEventListener:()=>{},GSF_RECOVERED_BACKUP:false};
const document={querySelector:s=>s==='#app'?dom:null,addEventListener:(ev,fn)=>{callbacks[ev]=fn},body:{appendChild:()=>{}}};
const context={window,document,localStorage:{getItem:k=>memory.get(k)||null,setItem:(k,v)=>memory.set(k,v),removeItem:k=>memory.delete(k)},Date,Math,JSON,console,setInterval:()=>0,setTimeout:()=>0};
vm.createContext(context);
for(const f of ['data','war','ai','engine'])vm.runInContext(fs.readFileSync(path.join(root,'js',f+'.js'),'utf8'),context,{filename:f});
context.window.GSF.newGame({speed:12});vm.runInContext(fs.readFileSync(path.join(root,'js/app.js'),'utf8'),context,{filename:'app'});
assert(dom.innerHTML.includes('Comando de Guerra'));
const click=dataset=>callbacks.click({target:{closest:()=>({dataset})}});
click({nav:'war'});assert(dom.innerHTML.includes('Simulador de batalha'));
assert(dom.innerHTML.includes('Ferreiro'));
assert(dom.innerHTML.includes('data-reinforce'));
assert(dom.innerHTML.includes('data-upgrade-military'));
click({nav:'map'});click({tileX:'2',tileY:'0'});assert(dom.innerHTML.includes('data-send="scout"'));
console.log('✓ UI: menu de guerra, ferreiro, reforços, simulador e espionagem renderizados');
