# ⚔️ Guerra Sem Fim

**Impérios & Conquistas — versão 0.8.3, layout responsivo com visual clássico da aldeia e mapa: estratégia medieval totalmente offline.**

Um jogo **independente**, inspirado nas mecânicas clássicas dos jogos de aldeias e impérios (como Travian). Não utiliza imagens, código, textos do jogo original, marcas ou APIs da Travian Games.

## 📐 Versão 0.8.3 — Ajustes de layout

- **Resolução intermediária:** menu lateral e área de jogo ocupam a largura disponível sem espremer o painel principal; a ajuda aparece abaixo.
- **Celular e tablet:** barra superior reorganizada, navegação lateral vira uma faixa horizontal deslizável e cartões se reorganizam conforme a tela.
- **Mapa e aldeia:** a cena é preservada em tamanho legível; quando necessário, arraste horizontalmente **dentro da cena** para explorar todos os terrenos.
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

## 🎮 O que funciona na versão 0.8

| Sistema | Funcionalidade |
|---|---|
| Início | Escolha de Romanos, Gauleses ou Teutões, comandante, nome e velocidade |
| Economia | 4 recursos, 18 campos (4/4/4/6), produção por hora, bônus econômicos, armazém, celeiro e consumo de cereal |
| Aldeia | 20 espaços, edifícios com custos escalonados, pré-requisitos, níveis e tempos de construção |
| Filas | Romanos: 2 filas básicas; demais tribos: 1; +1 fila extra por padrão, configurável de 0 a 8 extras; cancelamento com devolução de 75% |
| Tropas | Infantaria, cavalaria, batedores e unidades de cerco por tribo, recrutamento e manutenção de cereal |
| Guerra v0.4 | Espionagem, reforços entre aldeias próprias, Ferreiro por unidade, muralhas operacionais, aríetes, catapultas e simulador aproximado |
| Mapa | Região 17×17 com visualização 11×11, terrenos ilustrados, oásis conquistáveis, vales 9c/15c e reinos rivais |
| Mundo Vivo | 3 facções NPC com recursos, desenvolvimento, recrutamento, expansão, ataques, saques e conquistas de território |
| Combates | Ataques e saques simulados, deslocamento, baixas, capacidade de carga, saque e retorno das tropas |
| Herói | Aventuras, experiência, três artefatos e escolha de 1 a 4 recursos para bônus produtivo |
| Missões | Sete objetivos com recompensas em recursos |
| Mercado | Troca local, caravanas entre aldeias e comércio com reinos NPC aliados ou sob trégua |
| Colonização | Até cinco aldeias; vales com 6, 9 ou 15 campos de cereal; Residência, cultura, três colonizadores e recursos |
| Persistência | Autosave em `localStorage`, avanço de tempo quando a página é reaberta, importação/exportação JSON |
| Interface | Edifícios originais em SVG, modais de obras, barra de produção, painel imperial, planejador de obras e modo responsivo |
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
