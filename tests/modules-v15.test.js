/* v1.5 — interface dividida em módulos e atualização incremental do DOM. */
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert');
const root=path.resolve(__dirname,'..'),{UI_SCRIPTS}=require('./_load-ui');
const scriptsOf=f=>[...fs.readFileSync(path.join(root,f),'utf8').matchAll(/<script src="([^"]+)"/g)].map(m=>m[1]);
let n=0;const check=(name,fn)=>{fn();n++;console.log('✓',name);};

check('index.html e preview-local.html carregam os mesmos módulos, com app.js por último',()=>{
 const a=scriptsOf('index.html'),b=scriptsOf('preview-local.html');
 const ui=s=>s.filter(x=>/^js\/(ui\/|app\.js)/.test(x));
 assert.deepStrictEqual(ui(a),ui(b));assert.strictEqual(a[a.length-1],'js/app.js');
 assert.strictEqual(UI_SCRIPTS[0],'js/ui/dom.js');assert(UI_SCRIPTS.indexOf('js/ui/core.js')<UI_SCRIPTS.indexOf('js/ui/render.js'));
 for(const f of a)assert(fs.existsSync(path.join(root,f)),f);
});

check('Cada módulo tem uma responsabilidade e nenhum passa de 30 KB',()=>{
 const expected={'js/ui/core.js':['shell','resBar','navGroups'],'js/ui/village.js':['townArt','overview'],'js/ui/map.js':['map','minimap','territoryMap'],
  'js/ui/military.js':['army','war','hero'],'js/ui/progress.js':['quests','settings'],'js/ui/economy.js':['market'],'js/ui/panels.js':['modal','inspector'],'js/ui/render.js':['render']};
 for(const [f,fns] of Object.entries(expected)){const src=fs.readFileSync(path.join(root,f),'utf8');
  for(const fn of fns)assert(new RegExp(`\\nfunction ${fn}\\(`).test(src),`${fn} em ${f}`);
  assert(src.length<30000,`${f} tem ${src.length} bytes`);}
});

check('Sem DOM real, o morph recua para innerHTML',()=>{
 const ctx={window:{},document:{}};vm.createContext(ctx);
 vm.runInContext(fs.readFileSync(path.join(root,'js/ui/dom.js'),'utf8'),ctx);
 const el={firstChild:{},innerHTML:''};assert.strictEqual(ctx.window.GSF_DOM.supported,false);
 assert.strictEqual(ctx.window.GSF_DOM.morph(el,'<b>ok</b>'),false);assert.strictEqual(el.innerHTML,'<b>ok</b>');
});
console.log(`✓ v1.5 módulos: ${n} verificações`);
