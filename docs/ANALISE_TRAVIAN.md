# Análise de referência: Travian: Legends → Guerra Sem Fim

> Documento funcional baseado na documentação pública de **Travian: Legends** consultada em outubro de 2026. É uma referência de design, **não** uma extração do código-fonte, banco de dados, imagens ou fórmulas proprietárias do jogo. O objetivo é reproduzir padrões de experiência e mecânicas legítimas por implementação independente.

## 1. Anatomia do jogo de referência

O Travian: Legends é um jogo de estratégia de navegador estruturado em servidores ou mundos compartilhados. O fluxo básico é **fundar aldeia → aumentar produção → erguer construções → pesquisar/treinar exército → explorar mapa → atacar/defender → fundar/conquistar novas aldeias → cooperar em alianças → disputar objetivos de mundo**.

- **Economia:** quatro recursos (madeira, barro, ferro, cereal); 18 campos no primeiro tipo padrão de aldeia: 4/4/4/6. Campos geram recursos por hora e sobem de nível individualmente. Produção pode receber bônus de edifícios, oásis e herói. Cereal alimenta população e exércitos. Armazém guarda os três primeiros recursos e Celeiro guarda cereal.
- **Centro urbano:** terrenos e edifícios com custos, duração e requisitos próprios; administração da fila de obras; construções militares, econômicas, administrativas e defensivas. Romanos possuem exceção de construção simultânea por tipo.
- **Mapa:** coordenadas, aldeias de jogadores, espaços disponíveis, oásis, animais, acampamentos especiais e distâncias que influenciam viagem.
- **Tropas:** tribos com exércitos e características próprias; quartel, estábulo e oficina; ataque, defesa contra infantaria e cavalaria, velocidade, capacidade de carga e consumo de cereal.
- **Ações militares:** saques, ataques completos, reforços, espionagem, cerco, conquista, cálculo de perdas, relatórios, transporte e retorno de tropas.
- **Herói:** atributos, pontos por nível, aventuras, equipamento, inventário e participação em batalhas ou conquista de oásis.
- **Colonização:** residência/palácio, colonizadores, espaços de expansão e cultura necessários para novas aldeias.
- **Progressão social:** alianças, mensagens, rankings, mapa de outros jogadores, comércio, coordenação de guerra e objetivos mundiais.
- **Camadas avançadas:** artefatos, ruínas especiais, maravilhas do mundo, tribos adicionais, festivais, conquistas, tarefas, conta Plus, balanceamento por temporada e regras específicas de servidores.

## 2. Matriz de implementação

**Legenda:** ✅ funcional | 🟡 simplificado | ⬜ não implementado.

| Área | Travian: Legends (referência) | Guerra Sem Fim 0.1 |
|---|---|---|
| Recursos e produção | Madeira, barro, ferro, cereal; produção contínua | ✅ 4 recursos e produção com avanço temporal |
| Campos | 18 campos iniciais com distribuição 4/4/4/6 | ✅ 18 campos, até nível 20 |
| Armazém / Celeiro | Limites distintos | ✅ capacidades escalonadas |
| Cereal | Consumo pela população e unidades | ✅ produção líquida calculada; ⬜ morte por fome |
| Edifícios | Diversas categorias com pré-requisitos e limites | ✅ 20 espécies no catálogo; 🟡 efeitos parciais |
| Filas de obra | Regras por tribo e fila adicional Plus | 🟡 uma por categoria para Romanos; uma para outras tribos |
| Tribos | Romanos, Gauleses, Teutões e outras do jogo atual | 🟡 três tribos iniciais, quatro unidades cada |
| Pesquisa militar | Academia e árvores de desbloqueio | ⬜ academia existe como pré-requisito, sem pesquisa real |
| Armamento | Ferreiro com upgrades por unidade | ⬜ edifício decorativo nesta fase |
| Infantaria/cavalaria | Treinamento em filas específicas | ✅ quartel/estábulo e tropas distintas |
| Espionagem | Exploração contra forças adversárias | ⬜ unidade exploradora ainda trata combate comum |
| Viagem de tropas | Tempo por distância/velocidade | ✅ tempo de marcha e retorno |
| Saque | Batalha, capacidade de carga e pilhagem | 🟡 fórmula de combate aproximada, acampamentos NPC |
| Ataque total | Combate prolongado, cerco e conquista | 🟡 ataque separado, mas sem cerco/captura de aldeias inimigas |
| Reforços | Apoio entre aliados | ⬜ não implementado |
| Muralhas | Modificadores defensivos | ⬜ construção presente sem bônus operacional |
| Catapultas/aríetes | Destruição de muralhas/edifícios | ⬜ não implementado |
| Mapa | Grande mundo compartilhado, vários tipos de terreno | 🟡 tabuleiro determinístico 17×17 em tela 11×11 |
| Oásis | Bônus de produção após captura pelo herói | ⬜ visíveis, sem conquista operacional |
| Herói | Experiência, itens, inventário, aventuras, habilidades | 🟡 aventuras, vida, nível e 2 habilidades |
| Novas aldeias | Colonizadores, Pontos de Cultura, residência/palácio | 🟡 Residência nível 10 + recursos, até 5 aldeias |
| Mercado | Ofertas/transporte entre jogadores | 🟡 conversão local instantânea a 75% |
| Relatórios | Histórico de guerra, economia e exploração | ✅ registro de ataques, saques e missões |
| Missões | Tarefas de aprendizado/recompensas | ✅ 7 tarefas específicas |
| Alianças/chat/mensagens | Interações de jogadores reais | ⬜ não se aplicam ao modo solo nesta etapa |
| Objetivos finais | Maravilhas do mundo, artefatos e temporada | ⬜ planejar campanha offline com vitória contra IA |
| Persistência | Servidor online | ✅ save local, import/export JSON, sem internet |
| Interface | Aldeia circular, campos ao redor, barra de recursos e mapa | ✅ layout original que utiliza os mesmos padrões de navegação |

## 3. Parâmetros do protótipo

Estes números são **de design próprio**, para uma partida offline acelerada. Não são prometidos como valores oficiais do Travian:

- Velocidade padrão: 12×; modos de 1× a 60×.
- Produção por campo de nível `L`: aproximadamente `5 × 1,68^(L−1)` por hora, multiplicada pela velocidade da partida. Cada bônus econômico de edifício adiciona 5% por nível.
- Capacidade inicial de armazéns: 1.200; multiplicador de 1,52 por nível acima do primeiro.
- Custo de upgrade: base do edifício/campo × `1,32^(nível−1)`.
- Tempo de upgrade: duração-base × `1,23^(nível−1)` ÷ velocidade do mundo, com desconto progressivo pelo Edifício Principal.
- Combate NPC: ataque ofensivo total contra resistência NPC; taxas de perda aproximadas, possibilidade de derrota e capacidade de carga máxima por exército.
- Tempo de marcha: proporcional à distância euclidiana, limitado pela unidade mais lenta e velocidade do mundo.
- Colonização: Residência nível 10, quatro recursos em quantidade 1.600, terreno livre e limite de cinco aldeias.
- Mercado: troca local 100:75.

## 4. O que significa **offline** aqui

1. Um único navegador simula o estado do mundo; não há comunicação com servidores de jogo.
2. A IA local substitui jogadores adversários; acampamentos hostis não executam comandos estratégicos complexos.
3. O navegador computa a passagem do tempo a partir dos timestamps guardados no save.
4. Saves ficam **somente no dispositivo/origem do navegador**, até serem exportados e importados.
5. Não há proteção anticorrupção/anticheat do save porque trata-se de um jogo solo.

## 5. Diferenças jurídicas e de identidade

É aceitável desenvolver um jogo original inspirado nas **ideias e sistemas** de um gênero; entretanto, cópias de artes, código, arquivos, trilhas, nomes de marca, textos específicos ou interface distintiva ponto a ponto exigem avaliação de direitos. Esta implementação utiliza somente código escrito do zero, um título próprio, composição visual própria e emojis/arte SVG local próprios. Os nomes genéricos de unidades históricas são usados como elementos do tema; a referência ao Travian é apenas informativa.

## 6. Fontes públicas de referência

- [Travian: Legends — Resources Explained](https://support.travian.com/en/articles/214-guide-resources-explained)
- [Travian: Legends — First Steps](https://support.travian.com/en/articles/142-first-steps-in-the-game)
- [Travian: Legends — Buildings and Construction](https://support.travian.com/en/articles/221-quick-summary-buildings-and-construction)
- [Travian: Legends — Battle Mechanics](https://support.travian.com/en/articles/63-battle-mechanics)
- [Travian: Legends — Hero Overview](https://support.travian.com/en/articles/45-hero-overview)
- [Travian: Legends — Oasis](https://support.travian.com/en/articles/48-oasis)
- [Travian: Legends — Residence and Palace](https://support.travian.com/en/articles/216-guide-the-palace-residence-and-command-center)

## 7. Resumo de fidelidade

A versão 0.1 já permite completar a rotina **produzir → construir → treinar → atacar → saquear → melhorar → colonizar**, com salvamento permanente local. Ainda **não** reproduz a profundidade de guerra, diplomacia, IA e campanha dos mundos reais de Travian. A matriz acima é um guia verificável para evitar apresentar esta primeira versão como uma cópia completa.
