/* Proteção do design clássico sem sacrificar funcionalidades da v0.8. */
'use strict';
const fs=require('fs'),path=require('path'),assert=require('assert');
const root=path.resolve(__dirname,'..');
const app=require('./_load-ui').source();
const css=fs.readFileSync(path.join(root,'styles.css'),'utf8');
assert(!app.includes('assets/buildings/'),'A aldeia deve usar ícones clássicos, não sprites ilustrados');
assert(!app.includes('map-axis'),'O mapa deve manter o enquadramento original sem réguas');
assert(!css.includes('village-backdrop-v081'),'Remover cenário ilustrado experimental');
assert(!css.includes('aldeia-v08.svg'),'Restaurar cenário da aldeia clássico');
assert(!css.includes('map-backdrop-v081'),'Remover mapa ilustrado experimental');
assert(app.includes('data-plan-building'),'Planejador de obras preservado');
assert(app.includes('data-claim-oasis'),'Conquista de oásis preservada');
assert(app.includes('data-hero-apply'),'Herói multirrecursos preservado');
assert(app.includes('data-open-resource'),'Modal de produção preservado');
assert(app.includes('data-plan-field'),'Planejamento de campos preservado');
assert(css.includes('.hero-resource-choices'),'Interface do herói preservada');
console.log('✓ Design clássico restaurado, sem perda das funções da v0.8');
