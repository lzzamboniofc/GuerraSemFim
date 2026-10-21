## 🌿 Aldeias vivas — v1.7

O centro da aldeia e os campos agora têm **cenários SVG detalhados**, ruas sinuosas, água, ponte, horta, feira, carroça, poço, animais e aldeões animados. A paisagem cresce conforme a população aumenta; muralhas e edifícios continuam evoluindo pelos níveis. Os 20 terrenos e os 18 campos permanecem clicáveis. O modo **Em grade** continua disponível.

Arte vetorial criada no projeto, sem downloads ou bibliotecas, com opção de movimento reduzido respeitada pelo navegador. Inspirado na evolução gráfica por estágios do ReinosDeGuerra, sem copiar os PNGs.

# ⚔️ Guerra Sem Fim

## Temporada offline e Maravilha do Mundo (v1.6)

A campanha possui agora eventos sazonais temporários, chegada dos Natares, relíquia da Tesouraria, planos de construção e disputa da Maravilha até o nível 100 contra a IA. Acompanhe na nova página **Eventos & Maravilha**. A construção exige recursos e planos, e a fase final é uma **adaptação offline**, não uma reprodução literal dos servidores do Travian. Veja [regras e diferenças](docs/EVENTOS_E_MARAVILHA.md).


**Impérios & Conquistas — versão 1.6.1, arte isométrica, mapa arrastável, temporada Natar, Maravilha do Mundo e interface revisada. Tudo offline.**

Um jogo **independente**, inspirado nas mecânicas clássicas dos jogos de aldeias e impérios (como Travian). Não utiliza imagens, código, textos do jogo original, marcas ou APIs da Travian Games.

## 🧩 Estrutura do código

O jogo é estático e funciona offline, inclusive abrindo o `index.html` direto do disco. Não há etapa de build.

| Pasta / arquivo | Conteúdo |
|---|---|
| `js/data.js`, `js/engine.js` | Dados e regras do jogo (produção, construção, combate, saves) |
| `js/ai.js`, `js/war.js`, `js/campaign.js`, `js/expansion.js` | Reinos rivais, cálculo de batalha, campanha e expansão |
| `js/art.js` | Arte isométrica em SVG (edifícios, campos, cenário e mapa) |
| `js/ui/dom.js` | Atualização incremental do DOM ("morph") |
| `js/ui/core.js` | Estado da interface, utilitários, menu e moldura da página |
| `js/ui/village.js`, `map.js`, `military.js`, `progress.js`, `economy.js` | Uma tela ou grupo de telas por arquivo |
| `js/ui/panels.js`, `js/ui/render.js` | Inspetor, janelas modais e renderização |
| `js/app.js` | Inicialização, eventos globais e relógio de 1 s |

Os módulos de `js/ui/` compartilham o escopo global de scripts clássicos, e a ordem de carga está no `index.html`. Para rodar os testes, use `for t in tests/*.test.js; do node "$t"; done`.

## 🎨 v1.5 — Arte isométrica e mapa arrastável

- **Edifícios em SVG isométrico** que evoluem em 4 estágios (madeira → enxaimel → pedra → fortificado), com cores da tribo e animações leves. Obras mostram andaimes.
- **Muralha visível** ao redor da aldeia, crescendo com o nível; campos de recursos ilustrados que ficam mais ricos conforme evoluem.
- **Mapa**: arraste com mouse ou dedo, zoom por botões, roda, pinça ou +/−, setas do teclado e minimapa clicável.
- **Mapa ilustrado e territórios**: terreno contínuo em SVG e fronteiras coloridas do seu império e de cada reino rival.
- **Interface reorganizada**: menu em grupos (Economia, Militar, Império, Progresso), barra inferior no celular e seções recolhíveis na aldeia.
- **Cereal inicial positivo** (+16/h): os campos de cereal da primeira aldeia começam no nível 2.
- Saves anteriores e o modo *Em grade* continuam compatíveis.

## 🧱 v1.4.1 — Demolição, cereal e troca sem taxa

- **Demolição de edifícios** pelo modal da aldeia: exige Edifício Principal nível 10 e reduz **um nível por vez** após um tempo de trabalho. Sem devolução de recursos, com confirmação, opção de cancelar e liberação do terreno ao concluir o nível 1. Não afeta campos de recursos. A demolição e o progresso offline são preservados no save.
- **Cereal**: o jogo separa a alimentação dos habitantes (população de edifícios e campos), das tropas estacionadas e do herói vivo na aldeia inicial (1/h). A tela **Recursos → Cereal** e os **Campos** mostram as parcelas e o saldo líquido correto. Se o celeiro ficar vazio com saldo negativo, tropas ainda podem morrer de fome; edifícios e habitantes não morrem.
- **Troca interna gratuita**: trocar madeira, barro, ferro e cereal no Mercado ocorre em **proporção 1:1 e sem taxa**. O botão Máximo possível considera o saldo disponível e o espaço livre no depósito de destino. Mercadores entre aldeias e rotas comerciais continuam independentes.
- Campanhas anteriores permanecem compatíveis. Faça backup antes de atualizar. Inspiração: https://support.travian.com/pt/articles/39-demolir-edificios e https://support.travian.com/pt/articles/214-guia-recursos-explicados (mecânicas próprias, sem conteúdo premium).

## 📅 v1.4 — Missões Diárias, Eventos e Equilíbrio de Produção

- **10 objetivos diários**: construção, campos, recrutamento, pesquisas, aventura, missões, população, tropas, cereal e campos evoluídos. Cada objetivo vale 10 pontos. Prêmios aos **25/50/75/100** pontos; a cada 24 horas da fundação as metas reiniciam.
- **Eventos rotativos**: feira regional, festival da colheita, caravana de curandeiros e reserva de inverno. Cada um oferece um benefício diário original, inteiramente offline.
- **Exclusividades por tribo**: Romanos constroem Aqueduto Imperial (+4% cereal/nível); Gauleses, Bosque Sagrado (+4% madeira e barro/nível); Teutões, Forja dos Clãs (+5% ferro/nível), até nível 5.
- **Economia balanceada**: campo nível 10 entrega 200 recursos/h em 1×; a curva clássica de níveis 1–10 é 5, 9, 15, 22, 33, 50, 70, 100, 145 e 200. Bônus existentes e velocidade ainda se aplicam.
- **Pontuação**: população calculada por nível de edifícios e campos; indicador próprio de pontos de desenvolvimento valoriza edifícios avançados separadamente.
- **Velocidade**: novas campanhas começam em 1×, com opções de 3×, 5×, 12× e 30×. Campanhas antigas preservam a velocidade selecionada. Se a produção continuar alta, configure 1× ou 3×.
- **Compatibilidade**: saves anteriores sem propriedades diárias continuam aceitos; todos os sistemas da v1.3 e os visuais Original/Em grade são preservados.
- **Fontes de pesquisa, sem utilizar arquivos do jogo**: https://support.travian.com/pt/articles/16-tarefas-diarias e https://support.travian.com/pt/articles/33-estatisticas-de-edificios-e-campos-de-recursos.

## 🛡️ v1.3 — Guerras, Hospital e Alianças Reversíveis

- **Romper alianças:** abra **Diplomacia → Conselho diplomático → Romper aliança** ao lado do reino aliado. A ação pede confirmação, reduz sua reputação com esse reino em 25 pontos e bloqueia um novo pacto por três turnos. Depois disso, ambos os lados podem voltar a atacar. Capítulos e recompensas já conquistados continuam intactos.
- **Estratégias dos rivais:** o Clã dos Corvos prioriza aldeias com muitos recursos; a Ordem da Aurora busca alvos menos defensáveis e envia ataques mais cautelosos; a Liga dos Espinhos expande territórios com maior frequência. Reinos com duas aldeias podem organizar ofensivas em ondas contra o mesmo alvo; marchas coordenadas aparecem no painel de ameaças.
- **Postura defensiva da aldeia:** escolha em **Comando de Guerra → Postura defensiva** entre Normal (padrão), Vigilância (+18% defesa e -15% saque) e Fortificada (+32% defesa e -35% saque). A opção exige Ponto de Reunião; Fortificada exige também Muralha nível 3. Cada aldeia mantém sua preferência.
- **Hospital:** novo edifício militar disponível após Edifício Principal 5 e Academia 1. São **30 leitos por nível**; até 35% das baixas de combates defensivos ou de expedições retornadas podem virar feridos, que não lutam nem consomem cereal. Em **Exército & Quartel → Hospital e feridos**, escolha o tipo e a quantidade de soldados para tratar; custa 25% dos recursos originais e leva tempo, inclusive durante o avanço offline.
- **Sem ruptura de saves:** os campos de feridos, filas do Hospital e posturas são opcionais nos salvamentos anteriores. Os modos de visualização Original e Em grade, as pesquisas, o comércio e os recursos da v1.2 permanecem.

## v1.2 — Herói, aventuras e oásis selvagens

- **Inventário com espaços separados:** arma, armadura, montaria e amuleto. O machado, o chifre e a coroa das versões anteriores permanecem válidos como amuletos.
- **Aventuras com objetivos:** exploração, suprimentos e caçada; tempo, saúde e recompensas são diferentes conforme a escolha. A conclusão também funciona após retornar ao jogo offline.
- **Novos itens:** espadas, lanças, escudos, armaduras e cavalos, desbloqueados progressivamente. Armas aumentam a força contra os animais dos oásis; armaduras reduzem ferimentos, montarias aceleram aventuras.
- **Poções:** obtidas em aventuras e usadas para recuperar 35 pontos de saúde, até o limite de 99 no inventário.
- **Oásis selvagens:** agora exibem o número de animais e exigem força militar suficiente para a conquista. Soldados podem morrer e os ferimentos são registrados no relatório. O bônus de +25% do recurso do oásis permanece.
- **Salvamentos preservados:** campanhas anteriores são migradas para os quatro espaços de equipamentos sem perder os artefatos existentes. Os modos Original e Em grade permanecem disponíveis.


## 🚚 v1.1 — Comércio Avançado e Economia Viva

- **Trocas locais mais rápidas:** botões de 100, 500, 1.000, 5.000, 10.000, 50.000 ou **Máximo possível**, com prévia de quanto você receberá. O máximo leva em conta a reserva oferecida e a capacidade restante do depósito de destino. Não é preciso repetir o preenchimento após atualizar a interface.
- **Formulários que preservam os valores:** recrutamento, Mercado, Mapa e comandos militares mantêm campos já preenchidos quando obras, filas, chegada de tropas ou outros eventos exigem atualização. Trocar de tela e voltar também preserva as quantidades digitadas por aldeia durante a sessão.
- **Mercadores por tribo:** Romanos carregam 500 recursos por mercador, Gauleses 750 e Teutões 1.000. O Mercado nível 1 oferece 5 mercadores e cada nível seguinte adiciona 2 (até 80).
- **Carga mista e viagem de ida e volta:** envie simultaneamente madeira, barro, ferro e cereal. Mercadores ficam ocupados até regressar; cargas acima da capacidade da frota ou dos depósitos são recusadas. Caravanas simples antigas continuam compatíveis.
- **Rotas automáticas offline:** programe até 5 rotas por aldeia, com intervalos de 15 minutos a 24 horas. Cada envio respeita recursos disponíveis, mercadores livres e capacidade de armazenamento; rotas podem ser pausadas, retomadas ou excluídas.
- **Celebrar na Prefeitura:** Prefeitura nível 1 pode organizar uma celebração que rende 150 pontos de cultura ao terminar; a cultura adicional conta para fundação e conquista.
- **Fome:** se o cereal acabar e a produção ficar negativa, tropas podem morrer por falta de alimento durante a simulação offline. Os resultados entram no histórico.
- **Saves:** partidas antigas continuam válidas; novas propriedades são opcionais. Modos visuais Original e Em grade preservados.

## 🛡️ v1.0.1 — Treinar o máximo de tropas

- Em **Exército & Quartel**, cada unidade pesquisada e com edifício de treinamento disponível ganhou o botão **Máx.**; ele preenche a quantidade exata que pode ser paga **com os recursos que estão na aldeia naquele instante**.
- Clique em **Recrutar** para confirmar o pedido. O cálculo compara madeira, barro, ferro e cereal, e leva em conta tropas já presentes e na fila. Se não houver recursos ou o tipo de tropa estiver bloqueado, não será possível usar o botão.
- O limite técnico por pedido foi ampliado de 500 para até 1.000.000 unidades, respeitando o limite de efetivo por tipo e as filas de treinamento. O total é recalculado após cada pedido, mesmo quando várias unidades compartilham recursos.
- **Compatibilidade:** saves antigos continuam válidos, sem mudar o custo ou o tempo por unidade. O recurso funciona offline e nos dois modos visuais.

## 🎨 v0.8.6 — Dois modos de visualização (original como padrão)

- Em **Aldeia**, **Recursos** e **Mapa-múndi**, use o seletor **Visualização → Original / Em grade** para trocar instantaneamente entre os dois estilos.
- **Original (padrão)** recupera o cenário da aldeia e dos campos com as posições livres dos edifícios e a aparência clássica da primeira versão do projeto, mantendo o mapa simples de tiles. No celular, os nomes deixam de cobrir os ícones; toque em um edifício para ver seus detalhes.
- **Em grade** mantém os cartões organizados da versão 0.8.5. Ambos os modos mantêm todos os botões de construção, evolução, conquista de oásis e seleção do mapa.
- A opção também aparece em **Configurações → Visualização de aldeia, recursos e mapa** e é guardada no save de cada campanha. Saves antigos começam em **Original**, e o tipo de visual não interfere em produção, tropas nem cronômetros.
- A interface conserva as correções de espaçamento do menu, modais e barra de recursos de versões anteriores. No celular, o mapa mostra uma área menor e navegável pelas setas, preservando a aparência clássica sem arrastar horizontalmente.

## v0.8.5 — Visão adaptativa de aldeia, recursos e mapa

- **Edifícios e campos:** substituída a disposição absoluta que sobrepunha botões por uma grade de cartões clicáveis de 2 a 5 colunas, conforme o espaço disponível.
- **Mapa:** região local varia entre 5×5, 7×7, 9×9 e 11×11 casas, evitando arrastar horizontalmente para ver terrenos; as setas continuam navegando pelo mundo inteiro.
- **Recursos:** exibição em 2×2 no celular, com nome, quantidade, capacidade e produção por hora; clique continua abrindo o modal.
- **Navegação:** acessos rápidos a Aldeia, Recursos e Mapa; botão **Mais** abre as outras telas sem rolagem horizontal.
- **Base preservada:** nenhuma mudança em preços, evolução dos edifícios, salvamentos, IA, missões ou combate.

## 📜 Versão 0.8.4 — Visual original e novas missões

- **Aldeia, campos e mapa como na v0.1:** retomei a composição, os cenários geométricos e a grade simples da primeira versão. O restante da interface (menu, barra superior, telas, modais e configurações) continua com as melhorias responsivas da v0.8.3. Os marcadores 9c/15c e NPCs continuam disponíveis para preservar a jogabilidade atual.
- **157 missões na primeira aldeia:** além das sete missões antigas, agora existem trilhas de evolução por edifício, todos os campos, crescimento da população, exército, aventuras, oásis e colonização. Cada aldeia fundada recebe suas próprias trilhas de construção, recursos e população; tarefas gerais acompanham o império inteiro.
- **Missões progressivas:** em **Missões**, use as categorias e filtros **Próximas / Resgatáveis / Todas / Concluídas**. O filtro padrão mostra apenas a próxima etapa não resgatada de cada linha de tarefas.
- **Recompensas reais:** cada etapa cumprida pode conceder recursos em sua aldeia de origem (respeitando a capacidade de armazenamento) e experiência ao herói. Cada missão só pode ser resgatada uma única vez.
- **Compatibilidade:** as sete missões antigas mantêm exatamente seus IDs; saves anteriores à atualização não perdem resgates nem progresso. A quantidade de missões aumenta conforme o número de aldeias.
- **Referência para a progressão:** Centro de Ajuda oficial do Travian — [Sistema de Tarefas](https://support.travian.com/pt/articles/17-sistema-de-tarefas) e [Tarefas diárias](https://support.travian.com/pt/articles/16-tarefas-diarias). O jogo reproduz o princípio das tarefas em marcos de níveis, não os textos nem os valores exatos de recompensas do Travian. As tarefas diárias reiniciáveis do Travian ainda não foram implementadas aqui.

## 📐 Versão 0.8.3 — Ajustes de layout

- **Resolução intermediária:** menu lateral e área de jogo ocupam a largura disponível sem espremer o painel principal; a ajuda aparece abaixo.
- **Celular e tablet:** barra superior reorganizada, navegação lateral vira uma faixa horizontal deslizável e cartões se reorganizam conforme a tela.
- **Mapa e aldeia (na v0.8.3):** as cenas passaram temporariamente a usar rolagem horizontal; a v0.8.5 voltou ao dimensionamento da primeira versão.
- **Janelas, configurações e painéis:** campos e ações quebram linha para evitar elementos cortados.
- Nenhuma mudança nas regras da campanha ou formato do salvamento.

## 🎨 Versão 0.8.2 — Visual clássico restaurado

A aldeia, os edifícios e o mapa-múndi voltaram à apresentação anterior à reforma gráfica: ícones tradicionais e cenário vetorial leve. A mudança é **somente visual**: produção do herói, oásis, colonização, modais, configurações de ataques, planejador e filas continuam funcionando.

## 🏞️ Novidades da v0.8 — Territórios e Gestão Imperial

- **Herói com produção personalizada:** em **Herói → Especialização produtiva**, marque qualquer combinação entre madeira, barro, ferro e cereal. O total do bônus por ponto de habilidade é distribuído igualmente entre os recursos escolhidos. Apenas um recurso recebe o bônus total; todos os quatro recebem 25% cada. A produção adicional é aplicada à **aldeia inicial**, mantendo a regra dos artefatos.
- **Conquista de oásis:** selecione um oásis no Mapa-múndi e use **Conquistar oásis**. Requer Mansão do Herói, 20 soldados disponíveis na aldeia, herói com pelo menos 25 de vida, 250 unidades de cada recurso e distância máxima de 3 campos. A conquista custa 15 de saúde do herói; o oásis rende **+25% na produção de seu recurso**. Mansão níveis 1/10/20 permitem até 1/2/3 oásis por aldeia. É possível abandonar oásis.
- **Vales cerealistas:** vales livres possuem variantes de 6, 9 e 15 campos de cereal (marcadas 9c e 15c no mapa); a composição de campos é preservada ao colonizá-los. Aldeias antigas mantêm seu arranjo.
- **Planejador de obras:** o modal de campo/edifício tem **Planejar obra**. Até 40 planos por aldeia, reordenáveis ou removíveis. Uma obra só consome recursos e ocupa uma vaga quando pode começar. Obra planejada bloqueada por requisitos/recursos espera até haver condições; o planejamento não ultrapassa as filas configuráveis nas Configurações. Durante longas ausências, o início dos novos planos acontece ao retornar ao jogo.
- **Painel Imperial:** reservas, produção líquida, população militar, fila de construções, oásis e projeções de 1, 6 e 24 horas com limite de armazenamento por aldeia.
- **Reforma visual:** Visual clássico restaurado para aldeia, campos e edifícios; continuam disponíveis marcadores de 9c/15c e indicador de oásis conquistados no mapa.
- **Saves v0.1–v0.7:** continuam compatíveis sem ação manual. Exporte um backup antes de trocar de versão.

## 🚀 Como jogar

### Opção 1: sem instalações (mais simples)

1. Baixe o projeto e extraia o arquivo ZIP mantendo as pastas.
2. Abra `index.html` no Chrome, Edge ou Firefox.
3. Escolha seu comandante, uma tribo e a velocidade do mundo.
4. Clique em **Fundar meu Império**.

Tudo (HTML, CSS, JavaScript e ícones) é local; não há login, serviços remotos, banco de dados externo ou dependências para baixar.

> **Importante sobre o save:** o jogo utiliza `localStorage` do navegador. Em alguns navegadores, páginas `file://` podem ter política de armazenamento mais restrita. Se o save não persistir ao reabrir o arquivo, use a opção 2. Faça backups regularmente em **Configurações → Exportar JSON**.

### Opção 2: servidor local (também funciona sem internet)

Com Python 3 instalado, execute na pasta raiz:

```bash
python -m http.server 8000
```

Abra **http://localhost:8000**. Este é um servidor apenas na sua máquina, não exige internet. Para voltar ao jogo, use sempre a mesma origem/porta e navegador, pois o salvamento local é separado por origem.

## 🌍 Novidades da v0.7 — Expansão dos Impérios

- **Filas extras ajustáveis em Configurações:** a partida começa com uma vaga adicional de construção por aldeia. Romanos têm 3 obras em paralelo (2 tradicionais + 1 extra); Gauleses/Teutões têm 2 (1 tradicional + 1 extra). Escolha de 0 a 8 vagas extras. Reduzir as vagas não cancela construções já iniciadas.
- **Obras simultâneas reais:** uma fila adicional pode construir edifícios ou melhorar campos; a mesma construção/campo não pode ser melhorada duas vezes ao mesmo tempo. Fila e contador aparecem na interface.
- **Colonizadores:** prepare 3 colonizadores na Residência nível 10 (350 de cada recurso por unidade), acumule cultura suficiente e funda uma nova aldeia por 1.600 de cada recurso no Mapa-múndi. Colonizadores são consumidos na fundação.
- **Cultura para expansão:** a primeira colonização requer 40 pontos de cultura; cada aldeia adicional aumenta o requisito em 90 pontos (limite total de 5 aldeias).
- **Feira dos reinos NPC:** trocas comerciais com facções aliadas ou sob trégua, com Mercado e reposição a cada 2 turnos rivais.
- **Eventos periódicos:** a cada 8 turnos rivais, um evento econômico concede madeira, barro, ferro ou cereal, respeitando o estoque máximo. Os eventos são registrados em **Expansão** e **Relatórios**.
- **Saves antigos:** migração não destrutiva e validação de novas propriedades; ataques inimigos opcionais e modais anteriores foram preservados.

## 🏆 Novidades da v0.6 — Crônicas do Império

- **Campanha** no menu principal, com três capítulos em ordem, metas e recompensas.
- **Dois caminhos de vitória:** vencer os três reinos NPC militarmente ou aliar-se aos três reinos e possuir duas aldeias. Os ataques inimigos podem continuar desligados.
- **Conselho diplomático** em Reinos Rivais: envie presentes (Embaixada nível 1), negocie tréguas e formalize alianças permanentes (Embaixada nível 3, 40 reputação).
- **Dificuldade** Explorador, Equilibrado e Conquistador, configurável na criação ou durante a campanha.
- **Pontos de ataque do herói** agora ampliam o poder ofensivo; recursos clicáveis no topo e modais de obras permanecem.
- **Compatibilidade de saves:** arquivos v0.1–v0.5 continuam válidos e recebem a campanha automaticamente. Exporte o save antes de atualizar.

## 📜 Novidades da v0.9 — Academia e pesquisas militares

A **Academia agora pesquisa e libera novas unidades**. Primeiro, construa o Quartel e a Academia; para cavalaria, batedores montados e máquinas de cerco, também são necessários Estábulo e Oficina. Em **Comando de Guerra → Academia**, escolha uma unidade, pague os recursos e aguarde o tempo de pesquisa. Enquanto houver uma pesquisa em andamento, é preciso concluí-la para iniciar outra na mesma aldeia. Pesquisas avançam mesmo quando o navegador está fechado, junto das demais filas do jogo.

A primeira unidade de infantaria de cada tribo já vem desbloqueada. Outras exigem níveis progressivos da Academia (até o nível 10 para catapultas). O Ferreiro continua responsável pelos bônus de ataque e defesa, mas só aprimora unidades pesquisadas.

**Compatibilidade:** os saves antigos mantêm tropas, edifícios e melhorias. Ao carregar um save anterior, unidades anteriormente recrutáveis ficam pesquisadas naquela aldeia, sem custo adicional. A preferência **Original/Em grade** e as demais opções não mudaram. Recomenda-se exportar um backup em Configurações.

## 🎮 O que funciona na versão 0.8

| Sistema | Funcionalidade |
|---|---|
| Início | Escolha de Romanos, Gauleses ou Teutões, comandante, nome e velocidade |
| Economia | 4 recursos, 18 campos (4/4/4/6), produção por hora, bônus econômicos, armazém, celeiro e consumo de cereal |
| Aldeia | 20 espaços, edifícios com custos escalonados, pré-requisitos, níveis e tempos de construção |
| Filas | Romanos: 2 filas básicas; demais tribos: 1; +1 fila extra por padrão, configurável de 0 a 8 extras; cancelamento com devolução de 75% |
| Tropas | Infantaria, cavalaria, batedores e unidades de cerco por tribo, recrutamento e manutenção de cereal |
| Guerra v0.4 | Espionagem, reforços entre aldeias próprias, Ferreiro por unidade, muralhas operacionais, aríetes, catapultas e simulador aproximado |
| Mapa | Região 17×17, visualização 11×11 da versão original, oásis conquistáveis, vales 9c/15c e reinos rivais |
| Mundo Vivo | 3 facções NPC com recursos, desenvolvimento, recrutamento, expansão, ataques, saques e conquistas de território |
| Combates | Ataques e saques simulados, deslocamento, baixas, capacidade de carga, saque e retorno das tropas |
| Herói | Aventuras, experiência, três artefatos e escolha de 1 a 4 recursos para bônus produtivo |
| Missões | 157 etapas permanentes na primeira aldeia, metas por aldeia e globais, filtros, progresso, experiência do herói e recompensas de recursos |
| Mercado | Troca local, caravanas entre aldeias e comércio com reinos NPC aliados ou sob trégua |
| Colonização | Até cinco aldeias; vales com 6, 9 ou 15 campos de cereal; Residência, cultura, três colonizadores e recursos |
| Persistência | Autosave em `localStorage`, avanço de tempo quando a página é reaberta, importação/exportação JSON |
| Interface | Ícones clássicos da versão inicial para edifícios, modais de obras, barra de produção, painel imperial, planejador e responsividade para as demais telas |
| Diplomacia | Embaixada permite propor trégua de 12 turnos com reinos NPC mediante recursos |
| Paz opcional | Ataques inimigos podem ser desativados por campanha nas Configurações; reinos NPC continuam evoluindo |

## ✨ Funcionalidades preservadas das versões 0.5 e 0.6

- **Paz sob seu controle:** no início da campanha ou em **Configurações → Ataques inimigos**, ligue/desligue as invasões. Ao desligar, os ataques NPC que já estão a caminho são cancelados sem combate; os rivais continuam evoluindo e você ainda pode atacá-los.
- **Produção detalhada:** clique em **madeira, barro, ferro ou cereal na barra superior** para abrir o modal. Você verá a quantidade armazenada, capacidade, produção por campos, bônus de edifícios, itens e consumo de cereal.
- **Construção em janela:** clique em qualquer edifício, terreno vazio ou campo da aldeia para abrir o modal de construção ou melhoria. Os custos, pré-requisitos e tempo estimado ficam no próprio modal.
- **Embaixadas e tréguas:** em **Reinos Rivais**, construa uma Embaixada e negocie paz de 12 turnos pagando 250 madeira, 200 barro, 150 ferro e 250 cereal. A trégua suspende novos ataques daquela facção e cancela as marchas hostis em curso.
- **Caravanas:** com duas ou mais aldeias e Mercado na origem, envie um tipo de recurso por viagem. A entrega ocorre após um tempo proporcional à distância; recursos além da capacidade do destino não serão armazenados.
- **Artefatos do herói:** a 2ª, 4ª e 6ª aventuras rendem, respectivamente, Machado do Lenhador, Chifre da Colheita e Coroa do Reino. Equipe um de cada vez para melhorar a produção da aldeia inicial.

Os saves das versões **0.1 a 0.6** continuam aceitos sem conversão manual. Exporte o seu save antes de atualizar, por segurança.

## 🗺️ Primeiros passos

1. Abra **Missões** e resgate a recompensa de boas-vindas (ela ajuda quando houver espaço nos armazéns).
2. Em **Recursos**, melhore campos para elevar sua produção.
3. Na **Aldeia**, aumente Armazém, Celeiro e construa Quartel (Edifício Principal nível 3 e Ponto de Reunião nível 1 já vêm disponíveis).
4. Em **Exército**, recrute tropas. Você começa com 12 unidades básicas para explorar o jogo.
5. Em **Mapa-múndi**, clique em um acampamento com bandeira preta, informe tropas e envie um saque.
6. Consulte **Relatórios**; as tropas voltam depois do combate e entregam os recursos.
7. Execute aventuras do **Herói**, complete missões e, mais adiante, colonize novos vales.

## 🧩 Estrutura

```text
GuerraSemFim/
├── index.html                # Página inicial; abre diretamente no navegador
├── styles.css                # Interface e mapas estilizados
├── assets/
│   ├── favicon.svg           # Símbolo original do projeto
│   ├── aldeia-cenario.svg    # Cenário vetorial do centro da aldeia
│   └── campos-cenario.svg    # Cenário vetorial dos recursos
├── js/
│   ├── ai.js                 # Reinos rivais, economia, turnos e ataques NPC
│   ├── data.js               # Tribos, edifícios, tropas, custo, posições
│   ├── expansion.js          # Cultura, comércio NPC e eventos (v0.7)
│   ├── campaign.js           # Campanha e diplomacia (v0.6)
│   ├── war.js                # Cálculos militares compartilhados (v0.4)
│   ├── engine.js             # Estado, economia, tempo, filas, batalhas, save
│   └── app.js                # Interface, navegação e interações
├── docs/
│   ├── ERA_DAS_GUERRAS.md    # Mecânicas militares da versão 0.4
│   ├── ANALISE_TRAVIAN.md    # Inventário de mecânicas e diferenças
│   ├── ROADMAP.md            # Próximas etapas de desenvolvimento
│   └── PUBLICACAO_GITHUB.md # Como subir para o GitHub
└── tests/
    ├── smoke.test.js         # Testes básicos sem dependências
    └── regression.test.js    # Regressões e segurança do motor
```

O código utiliza apenas JavaScript nativo, HTML e CSS. **Nenhum `npm install` é necessário para jogar.**

## ✨ Novidades da versão 0.3

- Cenários originais SVG para **aldeias e campos**, destaque de edifícios por patamar e visual aprimorado para tela pequena.
- **Conselho do Reino** no Centro da Aldeia com objetivo atual, progresso das missões e atalho para a próxima ação.
- Barra de ocupação dos depósitos na área de recursos.
- Correção de envio militar: impede quantidade negativa, fracionária, acima do efetivo ou unidade inexistente.
- Avanço offline com eventos em ordem temporal (obras, treinamento, batalha, retorno e herói).
- **Backup automático local** com recuperação do save secundário se o principal ficar corrompido.
- Validação de campanhas importadas para impedir saves incompletos ou valores ilegais.
- Testes de regressão adicionais; a partida antiga da v0.1 continua compatível.

## 🧪 Testes

Se tiver Node.js instalado:

```bash
node tests/smoke.test.js
node tests/regression.test.js
node tests/world.test.js
node tests/war.test.js
node tests/empire.test.js
node tests/campaign.test.js
node tests/expansion.test.js
node tests/ui-v05.test.js
node tests/ui-v06.test.js
node tests/ui-v07.test.js
node tests/territories-v08.test.js
node tests/ui-v08.test.js
node tests/ui.test.js
```

Os testes cobrem criação de mundo, tribos, produção, filas, construção, exploração, batalha, herói, missões e salvamento. Validações manuais devem ser repetidas nos navegadores pretendidos para distribuição.

## ⚠️ Limites conhecidos

Esta versão mantém-se **independente e inteiramente offline**. Não inclui jogadores reais, servidores públicos, conquistas multiplayer, guerras entre alianças de jogadores ou uma reprodução integral de Travian. O comércio NPC usa ofertas simples; os colonizadores são preparados instantaneamente com custo de recursos (sem fila específica de treinamento), e os eventos do mundo usam uma sequência econômica local, não campanhas aleatórias complexas. Oásis podem ser anexados em um raio de 3 campos; não há batalhas de animais nem disputa de oásis entre reinos. A IA utiliza regras heurísticas. Os salvamentos permanecem locais ao navegador/origem.

Veja o [manual da Era das Guerras](docs/ERA_DAS_GUERRAS.md), o [inventário completo](docs/ANALISE_TRAVIAN.md), o [roteiro de expansão](docs/ROADMAP.md) e o [guia de publicação no GitHub](docs/PUBLICACAO_GITHUB.md).

## 📜 Licença

O código original deste repositório está sob a licença MIT (`LICENSE`). Travian e demais marcas de terceiros pertencem aos seus respectivos titulares. Este projeto não possui afiliação com a Travian Games.

## 🏯 v0.3 — Mundo Vivo

Três reinos rivais (Clã dos Corvos, Ordem da Aurora e Liga dos Espinhos) surgem em posições disponíveis do mapa. A cada turno da IA, suas cidades produzem, se desenvolvem e treinam soldados; os reinos podem fundar até três assentamentos e enviar ataques às aldeias do jogador após cinco turnos de trégua. As marchas aparecem na tela **Reinos Rivais**. Saques do jogador roubam recursos dos rivais; ataques completos com sucesso podem destruir um assentamento e liberar seu vale, mas a colonização pelo jogador ainda exige Residência e recursos.

O jogo processa as atividades rivais offline ao abrir a partida. Para não travar o dispositivo depois de longos períodos, o avanço da IA é limitado a até 240 turnos por atualização longa. O tempo e os conflitos usam simulação local e não exigem rede. Saves v0.1/v0.2 são migrados automaticamente (mantendo as aldeias e os recursos existentes). **Exporte seu backup antes de atualizar.**
