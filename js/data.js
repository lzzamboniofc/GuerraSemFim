(function () {
'use strict';
const RES = ['wood', 'clay', 'iron', 'crop'];
const RESOURCE = {
 wood: {name:'Madeira', icon:'🪵', color:'#9d6b40'},
 clay: {name:'Barro', icon:'🧱', color:'#b56e4c'},
 iron: {name:'Ferro', icon:'⛏️', color:'#71818b'},
 crop: {name:'Cereal', icon:'🌾', color:'#b29a43'}
};
const TRIBES = {
 romans: {name:'Romanos', symbol:'🦅', style:'Equilibrados', desc:'Construção disciplinada e infantaria versátil.', perk:'Uma obra civil e um campo de recursos simultaneamente.', color:'#9f4938'},
 gauls: {name:'Gauleses', symbol:'🍃', style:'Defensivos', desc:'Guerreiros rápidos, excelentes para defender aldeias.', perk:'Tropas defensivas e movimento mais veloz.', color:'#387c56'},
 teutons: {name:'Teutões', symbol:'⚔️', style:'Ofensivos', desc:'Exércitos agressivos e saqueadores incansáveis.', perk:'Infantaria ofensiva econômica e grande capacidade de saque.', color:'#81633a'}
};
const BUILDINGS = {
 main: {name:'Edifício Principal', icon:'🏛️', type:'civil', base:[70,40,60,20], time:70, desc:'Reduz os tempos de construção em toda a aldeia.', max:20, req:{}, pop:2},
 warehouse: {name:'Armazém', icon:'🏚️', type:'civil', base:[130,160,90,40], time:80, desc:'Aumenta o limite de madeira, barro e ferro.', max:20, req:{main:1}, pop:1},
 granary: {name:'Celeiro', icon:'🌾', type:'civil', base:[80,100,70,20], time:75, desc:'Armazena o cereal da aldeia.', max:20, req:{main:1}, pop:1},
 rally: {name:'Ponto de Reunião', icon:'🚩', type:'military', base:[110,160,90,70], time:90, desc:'Permite enviar ataques e saques para o mapa.', max:20, req:{main:1}, pop:1},
 barracks: {name:'Quartel', icon:'⚔️', type:'military', base:[210,140,260,120], time:120, desc:'Treina unidades de infantaria.', max:20, req:{main:3,rally:1}, pop:2},
 stable: {name:'Estábulo', icon:'🐎', type:'military', base:[260,170,240,140], time:160, desc:'Treina a cavalaria de sua tribo.', max:20, req:{barracks:3,academy:5}, pop:3},
 academy: {name:'Academia', icon:'📜', type:'military', base:[220,160,120,100], time:140, desc:'Centro de pesquisa militar e tática.', max:20, req:{main:3,barracks:3}, pop:3},
 smithy: {name:'Ferreiro', icon:'🔨', type:'military', base:[180,250,180,130], time:140, desc:'Aprimora o potencial de combate das tropas.', max:20, req:{academy:1,main:3}, pop:2},
 wall: {name:'Muralha', icon:'🛡️', type:'military', base:[70,90,170,70], time:120, desc:'Reforça a defesa da aldeia contra invasores.', max:20, req:{main:1}, pop:0},
 marketplace: {name:'Mercado', icon:'⚖️', type:'economy', base:[80,70,120,70], time:105, desc:'Troca recursos diretamente na aldeia (offline).', max:20, req:{main:3,warehouse:1}, pop:2},
 cranny: {name:'Esconderijo', icon:'🕳️', type:'economy', base:[40,50,30,10], time:55, desc:'Protege parte dos recursos em caso de ataque.', max:10, req:{}, pop:0},
 sawmill: {name:'Serraria', icon:'🪚', type:'economy', base:[520,380,290,90], time:190, desc:'Aumenta a produção de madeira.', max:5, req:{main:5}, pop:3},
 brickyard: {name:'Olaria', icon:'🧱', type:'economy', base:[440,480,320,50], time:190, desc:'Aumenta a produção de barro.', max:5, req:{main:5}, pop:3},
 ironworks: {name:'Fundição', icon:'⚒️', type:'economy', base:[200,450,510,120], time:190, desc:'Aumenta a produção de ferro.', max:5, req:{main:5}, pop:3},
 mill: {name:'Moinho', icon:'🌬️', type:'economy', base:[500,440,380,120], time:190, desc:'Aumenta a produção de cereal.', max:5, req:{main:5}, pop:3},
 embassy: {name:'Embaixada', icon:'🏰', type:'civil', base:[180,130,150,80], time:110, desc:'Marco diplomático e prestígio da aldeia.', max:20, req:{main:1}, pop:2},
 residence: {name:'Residência', icon:'👑', type:'civil', base:[580,460,350,180], time:240, desc:'Protege a aldeia e abre a futura colonização.', max:20, req:{main:5}, pop:3},
 heroMansion: {name:'Mansão do Herói', icon:'🏹', type:'civil', base:[700,670,750,300], time:290, desc:'Preparação para dominar oásis próximos.', max:20, req:{main:5,rally:1}, pop:2},
 townhall: {name:'Prefeitura', icon:'🏟️', type:'civil', base:[1250,1110,1260,600], time:380, desc:'Celebrações e cultura da cidade.', max:20, req:{main:10,academy:10}, pop:4},
 workshop: {name:'Oficina', icon:'🎯', type:'military', base:[460,510,600,320], time:260, desc:'Preparação para unidades de cerco.', max:20, req:{academy:10,main:5}, pop:3}
};
const FIELDS = {
 wood: {name:'Bosque', icon:'🌲', base:[40,100,50,60], time:60, desc:'Extrai madeira por hora.'},
 clay: {name:'Poço de Barro', icon:'🪨', base:[80,40,80,50], time:60, desc:'Extrai barro por hora.'},
 iron: {name:'Mina de Ferro', icon:'⛰️', base:[100,80,30,60], time:60, desc:'Extrai ferro por hora.'},
 crop: {name:'Campo de Cereal', icon:'🌾', base:[70,90,70,20], time:55, desc:'Produz cereal para a população e o exército.'}
};
const TROOPS = {
 romans: [
  {id:'legionary',name:'Legionário',icon:'🗡️',building:'barracks',cost:[120,100,150,30],time:65,attack:40,defense:45,speed:6,carry:40,upkeep:1},
  {id:'praetorian',name:'Pretoriano',icon:'🛡️',building:'barracks',cost:[100,130,160,70],time:85,attack:30,defense:65,speed:5,carry:20,upkeep:1},
  {id:'imperian',name:'Imperiano',icon:'⚔️',building:'barracks',cost:[150,160,210,80],time:105,attack:70,defense:40,speed:7,carry:50,upkeep:1},
  {id:'equites',name:'Equites',icon:'🐎',building:'stable',cost:[340,280,360,80],time:175,attack:120,defense:65,speed:14,carry:100,upkeep:3}
 ],
 gauls: [
  {id:'phalanx',name:'Falange',icon:'🛡️',building:'barracks',cost:[100,130,55,30],time:65,attack:15,defense:45,speed:7,carry:35,upkeep:1},
  {id:'swordsman',name:'Espadachim',icon:'⚔️',building:'barracks',cost:[140,150,185,60],time:95,attack:65,defense:35,speed:6,carry:45,upkeep:1},
  {id:'pathfinder',name:'Explorador',icon:'🔎',building:'barracks',cost:[170,150,20,40],time:95,attack:20,defense:20,speed:10,carry:10,upkeep:1},
  {id:'haeduan',name:'Heduano',icon:'🐎',building:'stable',cost:[360,330,280,120],time:185,attack:140,defense:75,speed:13,carry:90,upkeep:3}
 ],
 teutons: [
  {id:'club',name:'Salteador',icon:'🪓',building:'barracks',cost:[95,75,40,40],time:55,attack:40,defense:20,speed:7,carry:60,upkeep:1},
  {id:'spear',name:'Lanceiro',icon:'🛡️',building:'barracks',cost:[145,70,85,40],time:70,attack:10,defense:55,speed:7,carry:40,upkeep:1},
  {id:'axe',name:'Guerreiro de Machado',icon:'⚔️',building:'barracks',cost:[130,120,170,70],time:95,attack:60,defense:30,speed:6,carry:50,upkeep:1},
  {id:'paladin',name:'Paladino',icon:'🐎',building:'stable',cost:[370,270,290,75],time:190,attack:55,defense:100,speed:12,carry:110,upkeep:2}
 ]
};
const FIELD_LAYOUT = [
 [14,17],[28,10],[42,15],[61,11],[78,17],[88,33],
 [78,51],[88,69],[72,83],[56,78],[42,88],[25,78],
 [13,66],[11,47],[29,33],[57,32],[43,58],[64,60]
];
const TOWN_LAYOUT = [
 [49,49],[36,36],[63,36],[26,50],[73,52],[39,62],[61,62],[50,24],
 [22,30],[78,30],[19,70],[81,70],[35,18],[65,18],[50,79],[24,83],[76,84],[10,49],[90,49],[51,93]
];
window.GSF_DATA = {RES,RESOURCE,TRIBES,BUILDINGS,FIELDS,TROOPS,FIELD_LAYOUT,TOWN_LAYOUT};
})();
