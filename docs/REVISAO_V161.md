# Auditoria da versão 1.6.1 — Guerra Sem Fim

## Escopo revisto

Foi revisada a estrutura de arquivos JavaScript/CSS, a integração da campanha e da temporada offline, o funcionamento dos painéis, os fluxos de botões, e a compatibilidade das regras com saves existentes.

Verificações automatizadas de regressão continuam percorrendo economia, construção e demolição, tropas, pesquisa, cerco, reforços, herói, oásis, diplomacia, expansões, colonização, eventos, filas, migração e validação de salvamentos.

A nova suíte de navegador percorre **16 páginas em 10 larguras**: 360, 390, 600, 900, 920, 959, 960, 1024, 1366 e 1680 pixels. Com Playwright Core e Google Chrome, verifica que o menu lateral e o conteúdo não se cruzam, que há uma barra inferior no modo móvel, que o menu "Mais" aparece acima do jogo, que Escape e a navegação fecham o menu, que os modais estão sobre a página, e que a interface não possui rolagem horizontal global. Também testa a troca de recursos e a preservação dos dados digitados, além do modal de construção.

Capturas geradas em CI em 390, 960 e 1366 px ficam disponíveis como artefato **capturas-de-layout**.

## Falhas encontradas e corrigidas

| Área | Causa | Correção |
|---|---|---|
| Navegação 901–959 px | Layout principal em coluna a 959 px, mas dock móvel só a 900 px | Unificar o breakpoint da navegação em 959 px |
| Menu lateral desktop | Conteúdo maior que a altura do monitor, difícil alcançar opções inferiores | Altura limitada pela viewport e rolagem vertical independente |
| Camadas e cartões | Possibilidade de títulos compridos ocuparem espaço de outras colunas | Texto quebrável, limites de largura e níveis de empilhamento explícitos |
| Menu "Mais" | Abertura sem foco de teclado e sem fechamento por Escape | Foco inicial, fechamento por Escape e restauração do foco no botão |
| Tela redimensionada | Dois ouvintes de redimensionamento dificultavam testes de atualização do mapa | Reunir o fechamento do menu e a atualização do mapa no mesmo ouvinte |
| Modais simples | Ajuda e confirmação sem semântica de diálogo e foco inicial | Adicionar role dialog, aria-modal, título e foco |
| Eventos da temporada | Bônus de quatro turnos ficava ativo também no turno final, totalizando cinco | Corrigir limite superior para exclusivo |
| Produção de recursos | Detalhamento não mostrava efeitos sazonais ou bônus tribais | Exibir efeitos e cálculos adicionais, inclusive arredondamento dos oásis |
| Versão e documentação | Cabeçalho e README indicavam versão antiga | Atualizar referências para v1.6.1 |

## Limitações ainda conhecidas

Esta é uma auditoria automatizada com cobertura de navegação e de partes centrais do gameplay, **não uma prova de ausência de todos os bugs**. Visualização em diferentes navegadores móveis, uso prolongado em campanhas muito antigas, saves extremamente grandes e comportamento de leitores de tela reais também devem ser testados manualmente. O modo offline continua sem PvP e a fase Natar/Maravilha permanece uma adaptação solo simplificada.

Se for observado um elemento específico sobreposto mesmo após a correção, registrar página, tamanho aproximado da tela, orientação e uma captura para reproduzir o problema.
