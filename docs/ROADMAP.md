# Roadmap — Guerra Sem Fim

## Entregue: v0.1 — Fundação

- Interface em português, totalmente offline, responsiva.
- Três tribos, edifícios, campos, recursos, filas de construção e unidades de combate.
- Mapa, acampamentos NPC, saque, retorno, herói, missões, mercado e colonização simplificada.
- Persistência e exportação/importação da campanha.

## Fase 2 — Economia e aldeias profundas

- Produção e limites de armazenamento mais próximos dos níveis de referência, com melhor balanceamento a longo prazo.
- Edifícios plenamente operacionais: ferreiro, academia, serraria/olaria/fundição, moinho, residência, muralha, esconderijo.
- Aldeias com distribuição variável de campos (incluindo celeiros de 9 e 15 cereais).
- Rotas de comércio entre aldeias próprias; unidades mercantes e viagem de carga.
- Consumo crítico de cereal, fome, recuperação e população mais detalhada.
- Colonizadores, pontos de cultura e residência/palácio com espaços de expansão.

## Fase 3 — Guerra tática e IA

- Combate separado por tipo de defesa contra infantaria/cavalaria, muralha, moral, ferreiro e simulador.
- Espionagem, reforço, saques repetidos, combate de animais e domínio de oásis.
- Máquinas de cerco com aríetes e catapultas; dano em edifícios.
- Vários chefes NPC com aldeias, economia, treinamento, ataques proativos, reação à guerra e expansão rival.
- Registro de combates detalhado, predileção de alvos e regras para vitória/derrota da campanha.

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
