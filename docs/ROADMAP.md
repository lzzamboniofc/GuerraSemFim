# Roadmap — Guerra Sem Fim

## Entregue: v0.1 — Fundação

- Interface em português, totalmente offline, responsiva.
- Três tribos, edifícios, campos, recursos, filas de construção e unidades de combate.
- Mapa, acampamentos NPC, saque, retorno, herói, missões, mercado e colonização simplificada.
- Persistência e exportação/importação da campanha.

## Entregue: v0.2 — Visual e confiabilidade

- Cenários originais SVG e melhor hierarquia visual na aldeia e nos campos.
- Conselho do Reino com orientação contextual, medidores de capacidade e melhorias de acessibilidade.
- Validação de campanhas importadas e recuperação de backup local.
- Correção de envio de tropas e progressão de eventos offline em ordem cronológica.
- Regressões automatizadas para militares, construção, salvamento e retorno de tropas.

## Fase 2 — Economia e aldeias profundas

- Produção e limites de armazenamento mais próximos dos níveis de referência, com melhor balanceamento a longo prazo.
- Edifícios plenamente operacionais: ferreiro, academia, serraria/olaria/fundição, moinho, residência, muralha, esconderijo.
- Aldeias com distribuição variável de campos (incluindo celeiros de 9 e 15 cereais).
- Rotas de comércio entre aldeias próprias; unidades mercantes e viagem de carga.
- Consumo crítico de cereal, fome, recuperação e população mais detalhada.
- Colonizadores, pontos de cultura e residência/palácio com espaços de expansão.

## Entregue parcialmente: v0.3 — Mundo Vivo

- Três facções NPC com aldeias próprias e crescimento autônomo.
- Recursos, turnos, treinamento e expansão locais.
- Invasões, defesas, saque e conquista/liberação de vales inimigos.
- Tela de situação dos reinos e alertas de marchas.

## Fase 3 — Guerra tática e IA (continuação)

- Combate separado por tipo de defesa contra infantaria/cavalaria, muralha, moral, ferreiro e simulador.
- Espionagem, reforço, saques repetidos, combate de animais e domínio de oásis.
- Máquinas de cerco com aríetes e catapultas; dano em edifícios.
- IA NPC: melhorar escolhas de alvos, reação a cercos, diplomacia, dificuldade ajustável e coordenação de exércitos.
- Registro de combates detalhado, predileção de alvos e regras para vitória/derrota da campanha.

## Entregue: v0.4 — Era das Guerras

- Batedores e espionagem de reinos NPC; melhorias por unidade no Ferreiro.
- Reforços internos e simulação aproximada de combates.
- Aríetes, catapultas, muralhas, esconderijo e perfis diferenciados de defesa.
- Próximos aprimoramentos militares: alvos específicos para catapultas, pesquisa com tempo de espera, apoio a aliados e IA com unidades de cerco.

## Entregue: v0.5 — Impérios e Diplomacia

- Ataques inimigos opcionais com desligamento imediato das marchas pendentes e configuração gravada no save.
- Recursos do topo e construções/campos abrem modais dedicados, com indicadores de produção e custos.
- Tréguas de 12 turnos negociadas via Embaixada; os reinos continuam crescendo durante a paz.
- Caravanas entre aldeias próprias com tempo de viagem e estoque de destino.
- Três artefatos equipáveis do herói com bônus econômicos, obtidos por aventuras.

## Entregue: v0.6 — Reinos e Campanhas

- Diplomacia mais profunda: reputação, presentes, tratados, alianças permanentes e invasões canceladas para aliados.
- Herói: atributo ofensivo aplicável em batalhas e simulador; itens ampliados permanecem para versão futura.
- Pontos de cultura contabilizados e exibidos; colonizadores clássicos continuam planejados.
- Três capítulos, dois finais de campanha (militar e diplomático), três dificuldades; manutenção do controle de invasões da v0.5.

## Entregue: v0.7 — Expansão dos Impérios

- Fila extra de construção inicial e configuração de zero a oito vagas adicionais por aldeia; vantagem de construção romana preservada.
- Preparação e uso de colonizadores com cultura mínima e Residência nível 10; até cinco aldeias.
- Comércio NPC com facções sob trégua ou aliança, respeitando cooldown e limite de recursos.
- Eventos econômicos de mundo a cada oito turnos, com relatórios e histórico.
- Nova tela de Expansão; novos testes e compatibilidade com as partidas das versões anteriores.

## Entregue: v0.8 — Territórios e Gestão Imperial

- Escolha personalizada de produção do herói (um, dois, três ou quatro recursos ao mesmo tempo).
- Oásis conquistáveis e bônus de produção, limites por Mansão do Herói.
- Vales cerealistas de 9 e 15 campos, sem alterar as aldeias já existentes.
- Planejamento persistente de obras por aldeia, prioridades e execução automática limitada às filas configuráveis.
- Painel Imperial com projeções e situação de todas as aldeias.
- Novo mapa com terrenos legíveis, cenários originais e vinte desenhos de edifícios em SVG.

## Fase 4 — Herói, facções e profundidade estratégica

- Herói equipado, inventário, recompensas variadas, missões especiais e atributos completos.
- Novas tribos com unidades, bônus e mecânicas próprias.
- Artefatos, territórios especiais, ruínas, objetivos e maravilha do mundo offline.
- Diplomacia com facções NPC, reputação, tratados e alianças simuladas.
- Missões em capítulos, eventos do mundo, conquistas e balanceamento por dificuldade.

## Fase 5 — Qualidade e distribuição

- Suporte robusto a migrações de saves (versionamento), validação estrutural e backups alternados.
- Integração de sprites e paisagens SVG originais, animações de construção, efeitos e acessibilidade por teclado.
- Testes automatizados de UI, integração e regressão de motor; otimização mobile.
- Empacotamento como PWA instalável **depois** de instalar localmente (sem requisições remotas no uso normal) ou aplicativo desktop.

**Diretriz:** cada etapa deve preservar o modo solo, o funcionamento totalmente offline e a independência de ativos proprietários do Travian.
