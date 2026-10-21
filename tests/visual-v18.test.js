/* Regressão v1.8: ilustrações estáticas por desenvolvimento e saves antigos. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const win={};vm.runInNewContext(fs.readFileSync(path.join(root,'js/art-stage.js'),'utf8'),{window:win});
const S=win.GSF_STAGE;
const cases=[[0,'outpost'],[79,'outpost'],[80,'hamlet'],[179,'hamlet'],[180,'small'],[349,'small'],[350,'medium'],[699,'medium'],[700,'town'],[1399,'town'],[1400,'large'],[100000,'large']];
for(const [score,id] of cases)assert.equal(S.at(score).id,id,score+' pontos');
for(const [i,s] of S.stages.entries()){
 const stage=S.at(s.min);
 assert.equal(stage.index,i);
 assert(stage.src.startsWith('assets/village-stages/'));
 const f=path.join(root,stage.src);assert(fs.existsSync(f),'Arte inexistente: '+f);
 const stat=fs.statSync(f);assert(stat.size>10000&&stat.size<300000,'Arquivo grande ou inválido: '+f+' '+stat.size);
 const signature=fs.readFileSync(f).subarray(0,4).toString();
 assert.equal(signature,'RIFF','Imagem não é WebP: '+f);
}
assert.equal(S.at(79).percent,99);
assert.equal(S.at(1400).percent,100);
for(const p of ['index.html','preview-local.html']){
 const c=fs.readFileSync(path.join(root,p),'utf8');
 assert(c.includes('js/art-stage.js')&&c.includes('styles-stage.css'));
 assert(!c.includes('js/art-life.js')&&!c.includes('styles-life.css'));
}
const art=fs.readFileSync(path.join(root,'js/ui/village.js'),'utf8');
assert(art.includes('stage-illustrated'));
assert(art.includes('data-slot="${i}"'),'Marcadores de construção preservados');
assert(art.includes('visualMode()===\'original\''));
assert(!art.includes('life-ground')&&!art.includes('scene-vitality'));
const css=fs.readFileSync(path.join(root,'styles-stage.css'),'utf8');
assert(css.includes('animation:none!important'));
console.log('✓ v1.8: 6 estágios, imagens WebP pequenas, controles e animações removidas');
