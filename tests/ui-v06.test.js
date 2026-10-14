/* UI campanha: navegação, escolha de dificuldade e preservação dos modais v0.5 */
const fs=require('fs'),vm=require('vm'),path=require('path'),assert=require('assert');
const root=path.resolve(__dirname,'..'),store=new Map(),callbacks={},dom={innerHTML:''};
const window={addEventListener:()=>{},GSF_RECOVERED_BACKUP:false};
const document={querySelector:s=>s==='#app'?dom:null,addEventListener:(type,fn)=>callbacks[type]=fn,body:{appendChild:()=>{}},createElement:()=>({setAttribute:()=>{},remove:()=>{}})};
const ctx={window,document,localStorage:{getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v),removeItem:k=>store.delete(k)},Date,Math,JSON,console,setInterval:()=>0,setTimeout:()=>0};
vm.createContext(ctx);
for(const f of ['data','war','ai','campaign','engine'])vm.runInContext(fs.readFileSync(path.join(root,'js',f+'.js'),'utf8'),ctx,{filename:f});
window.GSF.newGame({enemyAttacks:false});vm.runInContext(fs.readFileSync(path.join(root,'js/app.js'),'utf8'),ctx,{filename:'app'});
const click=dataset=>callbacks.click({target:{closest:()=>({dataset})}});
click({nav:'campaign'});assert(dom.innerHTML.includes('Crônicas do Império'));assert(dom.innerHTML.includes('data-claim-chapter="fundacao"'));assert(dom.innerHTML.includes('Vitória diplomática'));assert(dom.innerHTML.includes('Vitória militar'));
click({nav:'rivals'});assert(dom.innerHTML.includes('data-envoy="corvos"'));assert(dom.innerHTML.includes('data-ally="aurora"'));
click({nav:'settings'});assert(dom.innerHTML.includes('id="campaign-difficulty"'));assert(dom.innerHTML.includes('id="enemy-attacks"'));
callbacks.change({target:{id:'campaign-difficulty',value:'hard'}});assert.equal(JSON.parse(store.get(window.GSF.KEY)).campaign.difficulty,'hard');
click({openResource:'wood'});assert(dom.innerHTML.includes('Produção de Madeira'));assert(dom.innerHTML.includes('role="dialog"'));
click({closeModal:''});click({nav:'village'});click({slot:'0'});assert(dom.innerHTML.includes('Construir ou evoluir edifício'));assert(dom.innerHTML.includes('role="dialog"'));
console.log('✓ UI v0.6: campanha, diplomacia, dificuldade e modais antigos aprovados');
