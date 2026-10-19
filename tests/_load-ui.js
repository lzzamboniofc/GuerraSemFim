/* Carrega os módulos da interface na mesma ordem do index.html (fonte única da ordem de carga). */
const fs=require('fs'),path=require('path'),vm=require('vm');
const root=path.resolve(__dirname,'..');
const UI_SCRIPTS=[...fs.readFileSync(path.join(root,'index.html'),'utf8').matchAll(/<script src="(js\/(?:ui\/[^"]+|app)\.js)"/g)].map(m=>m[1]);
module.exports=function loadUI(context){for(const f of UI_SCRIPTS)vm.runInContext(fs.readFileSync(path.join(root,f),'utf8'),context,{filename:f});};
module.exports.UI_SCRIPTS=UI_SCRIPTS;
/* Código-fonte de toda a interface concatenado, para verificações estáticas. */
module.exports.source=()=>UI_SCRIPTS.map(f=>fs.readFileSync(path.join(root,f),'utf8')).join('\n');
