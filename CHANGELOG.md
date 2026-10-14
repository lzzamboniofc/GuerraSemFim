# Changelog

## [0.9.0] — Academia e Pesquisas Militares · 14/10/2026

- Academia funcional: pesquisas por unidade, com custos, duração e requisitos crescentes por nível.
- Uma pesquisa ativa por aldeia; desbloqueios independentes e conclusão durante o avanço offline.
- Recrutamento de unidades avançadas e Ferreiro exigem pesquisas concluídas.
- Saves anteriores mantêm tropas, edifícios e desbloqueios disponíveis, sem gastos de migração.
- Interface da Academia no Comando de Guerra, indicador de bloqueio no Exército e fila de pesquisa.
- Os modos visuais Original/Em grade e outras configurações continuam preservados.

## [0.8.6] — Visual original por padrão e grade opcional · 14/10/2026

- Cenário clássico de aldeia, campos e mapa restaurado como padrão.
- Grade de cartões da versão anterior preservada como visual alternativo.
- Seletor nas três telas e em Configurações, com preferência persistente e compatibilidade dos saves antigos.
- Ícones e mapa clássico adaptados para telas pequenas, sem arrasto horizontal, mantendo demais melhorias da interface.
- Testes para modos, preferências e regressões de jogabilidade.

## [0.8.5] — Telas adaptativas sem sobreposição · 14/10/2026

- Grade fluida de edifícios e campos com seleção e melhorias nos mesmos modais.
- Mapa responsivo por quantidade de casas visíveis, mantendo exploração por coordenadas.
- Cabeçalho de recursos em cartões legíveis no celular e menu compacto com acessos rápidos e botão **Mais**, sem deslocamento lateral.
- Testes de layout e compatibilidade da lógica de aldeias, recursos e mundo.

## [0.8.4] — Missões e retorno visual à versão inicial · 14/10/2026

- Aldeia, campos e mapa restaurados especificamente ao layout da v0.1, com grades e ícones clássicos e sem rolagem horizontal interna obrigatória. O restante do layout responsivo da v0.8.3 permanece.
- 157 missões permanentes na aldeia inicial; linhas progressivas de edifícios, campos, exército, herói, população, oásis e expansão. Novas aldeias passam a ter missões próprias.
- Interface de missões com filtros por situação e categoria, medidores de progresso e exibição de recompensas de recursos e XP.
- Novas missões preservam os 7 identificadores históricos; recompensas são únicas e persistem nos saves existentes.
- Validação de saves ampliada para acomodar os resgates adicionais e impedir IDs duplicados.
- Referência de progressão: https://support.travian.com/pt/articles/17-sistema-de-tarefas; sem copiar textos, arte ou recompensas.
- Novos testes de missão, compatibilidade de saves, filtros e restauração visual.

## [0.8.3] — Layout adaptativo e correções de espaço · 14/10/2026

- Menu lateral e conteúdo deixam de competir por espaço em telas intermediárias; o conselheiro passa para baixo do conteúdo quando necessário.
- Barra superior com recursos em linha própria quando a largura não comporta todos os elementos.
- Navegação horizontal em tablets e celulares, preservando a posição ao mudar de tela.
- Aldeia, campos e mapa ganham rolagem horizontal **dentro do painel** em telas estreitas, evitando botões e edifícios espremidos.
- Cartões, configurações, tropas, formulários, modais e painéis financeiros mais responsivos.
- Sem mudanças nas mecânicas, salvamentos e aparência clássica do mapa e dos edifícios.

## [0.8.2] — Restauração do design clássico · 14/10/2026

- Retorno da aldeia, dos campos, dos edifícios e do mapa ao design anterior às reformas gráficas.
- Mantidos os recursos da v0.8, inclusive herói multirrecursos, oásis, planejador e configurações anteriores.
- Remoção dos assets experimentais de fundo e das ilustrações descartadas, com manutenção dos marcadores 9c/15c.

## [0.8.1] — Refino Visual da Aldeia e do Mapa · 14/10/2026

- Redesign visual da tela de **Aldeia** com atmosfera mais próxima dos clássicos de estratégia: cenário muralhado, base artística mais rica, rótulos em estilo pergaminho e integração mais orgânica dos edifícios.
- Redesign do **Mapa-múndi** com régua de coordenadas nas bordas, moldura aprimorada, grade mais legível, terrenos com texturas próprias e navegação regional mais clara.
- Novos assets gráficos auxiliares para ambientação da aldeia e do mapa, mantendo o jogo totalmente offline.
- Ajustes responsivos para preservar a legibilidade do novo visual em telas menores.

## [0.8.0] — Territórios e Gestão Imperial · 14/10/2026

- Herói com seleção livre de 1 a 4 recursos para distribuição do bônus de produção; escolha salva na campanha e refletida nos modais do topo.
- Oásis conquistáveis pelo herói: raio máximo 3, custo, requisito da Mansão do Herói, limites por nível e bônus de produção de +25%.
- Vales de 6, 9 e 15 campos de cereal, sinalizados no mapa e aplicados a novas aldeias.
- Planejador persistente de até 40 obras por aldeia, com fila, prioridades, cancelamento e execução quando possível.
- Novo Painel Imperial com reservas, produção agregada, comparativo entre aldeias e projeções limitadas pelo armazenamento.
- Redesign do mapa-múndi, cenários de campos e aldeia e 20 ícones arquitetônicos originais SVG.
- Testes de economia, saves, filas, oásis, colonização e interface; compatibilidade com saves de versões anteriores.

## [0.7.0] — Expansão dos Impérios · 14/10/2026

- Uma **vaga extra de construção** por padrão, configurável de 0 a 8 vagas adicionais (por aldeia); Romanos preservam paralelismo básico, filas extras são flexíveis.
- Configuração persistente em Configurações, contagem de vagas no painel da aldeia, prevenção de melhorias duplicadas. Reduzir o limite não cancela as obras existentes.
- Colonizadores preparáveis na Residência nível 10; cultura necessária para fundar novas aldeias, consumo dos três colonizadores na fundação.
- Feira comercial entre o jogador e facções NPC amigas ou sob trégua, com cooldown de dois turnos rivais, custo e limite de armazenamento.
- Eventos econômicos locais a cada oito turnos rivais, registrados no histórico e em relatórios.
- Aba Expansão com painel de colonização, comércio e eventos; compatibilidade preservada com saves 0.1–0.6.
- Novos testes do motor e de interface, mais toda a bateria de regressões anteriores.

## [0.6.0] — Crônicas do Império · 14/10/2026

- **Campanha por capítulos:** Fundação, Fronteiras e Legado. Recompensas resgatáveis em ordem e objetivos exibidos na nova tela **Campanha**.
- **Dois finais:** vitória militar ao derrotar os três reinos ou vitória diplomática com três alianças e pelo menos duas aldeias. A campanha continua jogável após a vitória.
- **Diplomacia ampliada:** emissários com presentes (+20 reputação, espera de três turnos), reputação 0–100, alianças permanentes com Embaixada nível 3. Tréguas agora concedem +10 reputação.
- **Acordos reais:** aliados não enviam invasões nem podem ser atacados; marchas hostis em andamento são canceladas sem prejuízo ao jogador.
- **Dificuldade:** Explorador, Equilibrado e Conquistador regulam agressividade/recrutamento da IA; escolha no início ou modifique nas Configurações.
- **Herói:** pontos de ataque acima do nível inicial agora concedem bônus ofensivo (1,5% por ponto) em combate e simulador.
- **Compatibilidade:** saves anteriores ganham campanha padrão sem perder progresso; controle de ataques inimigos e modais de produção/construção preservados.
- **Testes:** 12 novos testes de campanha, um teste de integração da interface e manutenção das suítes anteriores.

# Histórico de versões — Guerra Sem Fim

## v0.5 — Impérios e Diplomacia (14/10/2026)

- Preferência persistente para ativar/desativar invasões inimigas, acessível nas Configurações e no início de uma campanha; ataques em trânsito são cancelados sem saques ao desativar.
- Detalhamento da produção em modal ao clicar nas quatro categorias de recursos do topo: campos, bônus, capacidade e consumo de cereal.
- Construção e evolução de edifícios e campos em modais com custos, requisitos, filas e cancelamento.
- Tréguas diplomáticas com reinos NPC via Embaixada, com custo e duração de 12 turnos.
- Caravanas de transporte entre aldeias próprias, com tempo de viagem e respeito à capacidade de armazenamento do destino.
- Artefatos colecionáveis por aventuras do herói, equipáveis e com bônus econômicos.
- Migração transparente dos saves anteriores, novos testes de IA, economia, interface e compatibilidade; validação visual automatizada no Chromium com código offline embutido.

## v0.4 — Era das Guerras (14/10/2026)

- Novo menu Comando de Guerra: tecnologias, transferências de reforços, simulador e orientação tática.
- Batedores de cada tribo, espionagem de acampamentos e cidades rivais com relatórios e interceptações.
- Ferreiro funcional: pesquisas por unidade até nível 10, com bônus de 6% por nível no ataque e na defesa.
- Oficina e duas unidades de cerco por tribo: aríetes para muralhas e catapultas para fortificações rivais.
- Diferenciação de defesa contra infantaria e cavalaria, muralhas com bônus de 7,5% por nível e esconderijos que dificultam saques NPC.
- Envio seguro de tropas entre aldeias próprias, com viagem e transferência sem duplicação.
- Simulador de combate aproximado, sem movimentação ou custo de recursos.
- Conservados saves v0.1–v0.3; 13 testes militares e smoke de interface adicionados.



## v0.3 — Mundo Vivo (14/10/2026)

- Três reinos rivais com capital, bandeira, nível de desenvolvimento, muralhas, guarnição e economia locais.
- Turnos da IA com geração de recursos, evolução de cidades, recrutamento e fundação de novos postos.
- Marchas NPC com aviso prévio, batalhas defensivas, perdas, saques e retorno dos sobreviventes.
- Aldeias rivais visíveis no mapa e acessíveis por saque ou ataque completo.
- Ataques completos podem libertar um território (sem colonizá-lo automaticamente).
- Tela Reinos Rivais com visão por facção, tropas, assentamentos e marchas iminentes.
- Migração automática de salvamentos v0.1/v0.2; a estrutura de save continua compatível com as regras da versão 1.
- Processamento offline determinístico integrado à linha do tempo do motor, limitado a 240 turnos recentes em períodos longos para manter desempenho.
- Oito novos testes de IA, migração, combate e salvamento.

## v0.2 — Alicerce e apresentação

- Cenários SVG para aldeia e campos, melhorias de interface e painel de missões.
- Correção do envio de tropas inválidas, da ordem cronológica dos eventos offline e validação de saves.
- Backup local automático e testes de regressão.

## v0.1 — Fundação

- Aldeias, recursos, construções, tropas, missões, aventura de herói, mapa, batalhas, mercado e salvamentos offline.
