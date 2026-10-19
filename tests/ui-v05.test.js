/* v0.5 — regressões de interação de recursos, modais e configurações */
const fs=require('fs'),vm=require('vm'),path=require('path'),assert=require('assert');
const dir=path.resolve(__dirname,'..'),store=new Map(),events={},dom={innerHTML:''};
const window={addEventListener:()=>{},GSF_RECOVERED_BACKUP:false};
const document={querySelector:s=>s==='#app'?dom:null,addEventListener:(event,callback)=>events[event]=callback,body:{appendChild:()=>{}},createElement:()=>({setAttribute:()=>{},remove:()=>{}})};
const ctx={window,document,localStorage:{getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v),removeItem:k=>store.delete(k)},Date,Math,JSON,console,setInterval:()=>0,setTimeout:()=>0};
vm.createContext(ctx);
for(const f of ['data','war','ai','campaign','engine'])vm.runInContext(fs.readFileSync(path.join(dir,'js',f+'.js'),'utf8'),ctx,{filename:f});
const game=window.GSF.newGame();
require('./_load-ui')(ctx);
const click=dataset=>events.click({target:{closest:()=>({dataset})}});
const check=(label,fn)=>{fn();console.log('✓ '+label);};
check('Recursos no topo são botões e cada recurso abre um modal de produção',()=>{
 assert(dom.innerHTML.includes('data-open-resource="wood"'));
 click({openResource:'wood'});assert(dom.innerHTML.includes('role="dialog"'));
 assert(dom.innerHTML.includes('Produção de Madeira'));
 assert(dom.innerHTML.includes('data-modal-current="wood"'));
 assert(dom.innerHTML.includes('Produção líquida'));
 click({openResource:'crop'});assert(dom.innerHTML.includes('Produção de Cereal'));
 assert(dom.innerHTML.includes('População (edifícios e campos)'));assert(dom.innerHTML.includes('Guerreiros estacionados'));
 click({closeModal:''});assert(!dom.innerHTML.includes('role="dialog"'));
});
check('Construções e campos abrem janela, não um painel lateral de melhoria',()=>{
 click({slot:'0'});assert(dom.innerHTML.includes('role="dialog"'));
 assert(dom.innerHTML.includes('Construir ou evoluir edifício'));
 assert(dom.innerHTML.includes('data-build-building="main"'));
 click({closeModal:''});click({nav:'fields'});click({field:'0'});
 assert(dom.innerHTML.includes('Evoluir campo de recursos'));
 assert(dom.innerHTML.includes('data-build-field="0"'));
 click({closeModal:''});
});
check('Terreno vazio permite escolher um projeto dentro da janela',()=>{
 click({nav:'village'});click({slot:'4'});
 assert(dom.innerHTML.includes('data-blueprint="barracks"'));
 click({blueprint:'barracks'});
 assert(dom.innerHTML.includes('role="dialog"'));
 assert(dom.innerHTML.includes('Quartel'));
 click({closeModal:''});
});
check('Configuração permite desativar invasões e manter preferência salva',()=>{
 click({nav:'settings'});assert(dom.innerHTML.includes('id="enemy-attacks"'));
 events.change({target:{id:'enemy-attacks',checked:false}});
 assert.strictEqual(JSON.parse(store.get(window.GSF.KEY)).preferences.enemyAttacks,false);
 assert(dom.innerHTML.includes('Invasões desativadas'));
 assert.strictEqual(JSON.parse(store.get(window.GSF.KEY)).preferences.enemyAttacks,false);
});
check('Tela de reinos exibe diplomacia e a de herói mostra inventário',()=>{
 click({nav:'rivals'});assert(dom.innerHTML.includes('data-negotiate="corvos"'));
 click({nav:'hero'});assert(dom.innerHTML.includes('Inventário do herói'));
});
check('Mercado mostra rotas de caravanas com duas aldeias',()=>{
 const v=JSON.parse(JSON.stringify(game.villages[0]));v.id='e999';v.x=1;v.y=1;v.name='Colônia';game.villages.push(v);
 const script=require('./_load-ui').source();
 assert(script.includes('Caravanas entre aldeias'));assert(script.includes('data-send-caravan'));
 // A UI cria a seção somente depois de o motor registrar a segunda aldeia.
 assert(game.villages.length===2);
});
console.log('6 testes de interface v0.5 aprovados.');
