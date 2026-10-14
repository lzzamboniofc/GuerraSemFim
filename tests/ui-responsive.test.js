// Protege os elementos críticos do layout da versão 0.8.3 sem exigir navegador no CI.
'use strict';
const fs=require('fs'),assert=require('node:assert/strict'),path=require('path');
const root=path.resolve(__dirname,'..');
const file=name=>fs.readFileSync(path.join(root,name),'utf8');
const html=file('index.html'),app=file('js/app.js'),css=file('styles-responsive.css');
assert(html.includes('href="styles-responsive.css"'),'A folha responsiva deve ser carregada depois da folha clássica.');
for(const key of ['scene-scroll','map-scroll']) assert(app.includes(key),`Região rolável ausente: ${key}`);
for(const size of ['1599px','1279px','959px','719px','699px','419px']) assert(css.includes(size),`Breakpoint ausente: ${size}`);
assert(app.includes('const navOffset'),'A navegação horizontal deve manter posição após renderização');
assert(app.includes('scrollTo?.(0,0)'),'Navegar deve voltar ao início da página');
for(const feature of ['data-open-resource','data-plan-building','data-plan-field','data-hero-apply']) assert(app.includes(feature),`Ação preservada: ${feature}`);
assert(!css.includes('village-backdrop-v081'),'Não usar cenário experimental de aldeia');
console.log('✓ Layout responsivo, navegação, rolagens internas e visual clássico preservados');
