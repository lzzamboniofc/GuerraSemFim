# Temporada offline, eventos e Maravilha do Mundo (v1.6)

Esta implementação é **uma adaptação solo** inspirada na progressão de mundos de Travian: Legends. Não usa código, dados, arte ou imagens do Travian e não pretende reproduzir seus prazos e batalhas com exatidão.

## O que muda na campanha

O contador de **turnos das facções de IA** organiza uma temporada offline. Cada turno ocorre a cada cerca de 15 minutos em velocidade 1×, dividido pela velocidade escolhida (mínimo técnico de 30 segundos).

| Turno | Acontecimento |
|---|---|
| 6 e depois a cada 6 | Evento sazonal: colheita, madeira, barro, ferro ou estiagem |
| 12 | Rumores sobre as fortalezas Natares |
| 24 | Liberação de expedições para conquistar uma relíquia |
| 40 | Liberação do reduto que abrigará a Maravilha do Mundo |
| 56 | Aparecimento dos planos de construção e começo da corrida contra os Natares |

**Eventos sazonais:** cada evento dura quatro turnos. Os bônus ou penalidades de produção são temporários, não adicionam recursos instantaneamente e passam a ser aplicados no cálculo do motor. O histórico de eventos apresenta as últimas dezesseis ocorrências. O contador de turnos e os relatórios funcionam sem internet e com o avanço offline já existente.

## Como obter uma Maravilha

1. Construa **Tesouraria nível 10** (Edifício Principal 8 e Embaixada 3 para erguer).
2. A partir do turno 24, uma expedição do herói com **750 de poder de ataque** e vida suficiente permite obter o Chifre da Terra, uma relíquia de **+8% de cereal** em todas as aldeias (não é obrigatória para a Maravilha).
3. A partir do turno 40, tenha **Residência ou Palácio nível 10**, **um administrador** e **2.000 de ataque** para assumir a Grande Obra. A conquista gasta o administrador e causa baixas.
4. No turno 56, capture o plano com herói, Tesouraria nível 10 e **1.000 de ataque**. O plano deve estar na aldeia responsável pela construção.
5. Construa do nível 1 até 49 com esse plano; do nível 50 até 100 é necessária uma **facção aliada ativa** que guarde o segundo plano. Romper a aliança ou perder a facção bloqueia novas construções acima do nível 49.
6. Cada nível exige recursos crescentes e usa uma fila própria, com contagem regressiva. O nível 100 vence a temporada.

Os Natares ganham um nível a cada quatro turnos a partir do turno 56. Se chegarem primeiro ao nível 100, vencem a temporada. A campanha permanece disponível para consulta mesmo após o resultado. Para recomeçar a corrida, inicie uma nova campanha.

## Diferenças importantes para Travian: Legends

- **Não há outros jogadores online.** O segundo plano pertence a uma facção NPC aliada, em vez de a um jogador de sua aliança.
- **A Grande Obra é vinculada a uma aldeia já existente**, sem criar uma aldeia Natar especial no mapa. Conquistas e tomadas de planos são expedições instantâneas com baixas, não ondas militares viajando pelas coordenadas.
- O Travian possui aldeias Natares reais, captura de artefatos com ataques e tesourarias, coordenadas próprias, durações específicas por servidor e exigências detalhadas para defesa e construção. Esses sistemas continuam sendo uma evolução futura.
- Em um mundo Travian 1×, os artefatos normalmente aparecem por volta do dia 90 e os planos por volta do dia 180; a nossa temporada foi deliberadamente comprimida para permitir jogar offline.

## Compatibilidade

Saves antigos **não são descartados**: ao carregar um jogo sem a seção worldEvents, ela é iniciada a partir do turno atual, sem retroagir eventos. Os novos campos são validados em exportação/importação. Os relógios de obra integram o mesmo processo cronológico da produção e dos movimentos.

## Fontes oficiais consultadas

- https://support.travian.com/en/articles/103-world-wonder
- https://support.travian.com/en/articles/104
- https://support.travian.com/en/articles/101-artefacts
- https://support.travian.com/en/articles/20-game-versions-and-speed
