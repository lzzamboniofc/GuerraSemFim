# Era das Guerras — Manual da versão 0.4

A versão 0.4 adiciona estratégia militar **sem conexão de rede**. Os valores não pretendem reproduzir integralmente as regras de Travian; são regras próprias, simplificadas e passíveis de rebalanceamento.

## 1. Comando de Guerra

O menu **🛡️ Comando de Guerra** apresenta os valores aproximados de ataque e defesa, melhorias do Ferreiro, reforços, um simulador e orientações de cerco. As mudanças não exigem criar uma partida nova; saves v0.1–v0.3 continuam com suporte.

## 2. Batedores e espionagem

- Romanos: **Batedor**; Gauleses: **Explorador**; Teutões: **Vigia**.
- Batedores exigem **Estábulo** (Explorador gaulês, Quartel).
- No **Mapa-múndi**, escolha um acampamento ou cidade rival, preencha **somente batedores** e clique em **Espionar**.
- A missão pode ser interceptada. Relatórios bem-sucedidos revelam guarnição, muralha, nível e recursos estimados.
- Batedores não transportam saque. Se a espionagem for detectada, aproximadamente metade deles se perde.

## 3. Aríetes e catapultas

- Construa uma **Oficina** (Edifício Principal nível 5 e Academia nível 10).
- Treine **Aríetes** e **Catapultas** no menu Exército.
- Em um **ataque completo vitorioso contra cidade rival**, cada 3 aríetes sobreviventes reduzem até 1 nível de muralha, e cada 3 catapultas sobreviventes reduzem até 1 nível de desenvolvimento. O nível de desenvolvimento da fortificação não fica abaixo de 1.
- Ataques de **saque** não causam dano estrutural, mesmo que transportem unidades de cerco.
- Catapultas não selecionam um edifício individual nesta versão; danificam o nível global da cidade NPC. Cerco a campos ou prédios do jogador ainda não é implementado.

## 4. Ferreiro

- Construa o **Ferreiro**, que depende de Academia nível 1 e Edifício Principal nível 3.
- Pesquise bônus de cada tipo de unidade no Comando de Guerra. Cada nível acrescenta **6% ao ataque e à defesa** daquela unidade.
- Pesquisa máxima: 10; também não pode ultrapassar o nível do Ferreiro.
- As pesquisas consomem recursos, são imediatas e permanecem vinculadas **à aldeia de origem**.

## 5. Muralhas e Esconderijo

- Cada nível de **Muralha** aumenta a defesa contra incursões NPC em **7,5%**.
- Cada nível de **Esconderijo** reserva aproximadamente **150 de cada recurso** contra saques NPC, antes de aplicar o limite da pilhagem.
- Romanos, Gauleses e Teutões agora incluem perfis diferenciados de defesa contra infantaria e cavalaria para determinadas unidades.

## 6. Reforços internos

- Funde pelo menos duas aldeias.
- Em **Comando de Guerra**, selecione um destino próprio e informe quantos soldados transferir.
- No momento do envio, as unidades são descontadas da origem; ao final da marcha, passam a integrar a guarnição da aldeia de destino.
- Esta primeira fase é uma **transferência definitiva entre suas aldeias**, não um apoio temporário a aliados. Para recolher soldados, envie-os de volta pela mesma interface após selecionar a outra aldeia.

## 7. Simulador de combate

- Selecione uma cidade NPC e a quantidade de soldados disponíveis.
- A previsão apresenta força aproximada, resistência da cidade e baixas estimadas.
- A simulação não desconta tropas ou recursos e não emite marchas.
- **A previsão é aproximada**, não considera todos os detalhes de combate e não substitui os relatórios reais.

## 8. Limitações atuais

- Não há espionagem entre jogadores reais, pois o jogo é totalmente offline.
- A IA ainda utiliza um contingente agregado de soldados, sem tecnologia de cerco própria.
- Reforços só funcionam entre aldeias do jogador.
- Cerco e mudanças em cidades NPC são representados por nível global de muralha/desenvolvimento.
- Não existe diplomacia/alianças entre facções ou campanha final nesta versão.

## 9. Testes

Execute no diretório raiz, com Node.js instalado:

```bash
node tests/smoke.test.js
node tests/regression.test.js
node tests/world.test.js
node tests/war.test.js
node tests/ui.test.js
```

A versão usa apenas HTML, CSS e JavaScript local. Não necessita de `npm install` ou de serviços externos.
