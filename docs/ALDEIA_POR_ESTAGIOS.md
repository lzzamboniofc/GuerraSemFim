# Aldeias ilustradas — v1.8

## Referência e origem das imagens

O projeto [ReinosDeGuerra](https://github.com/LucasRZamboni/ReinosDeGuerra) usa seis pinturas de assentamentos, de Posto a Fortaleza, sobre as quais coloca marcadores de nível dos edifícios. Com base no repositório indicado para este jogo, as imagens `assets/village-*.png` foram convertidas localmente para `assets/village-stages/*.webp` a 960 px, qualidade 74, mantendo a direção artística e reduzindo o peso total. As imagens têm origem no projeto de referência; não são imagens da Travian Games. **Os direitos das ilustrações originais permanecem com seus autores.**

## Estágios automáticos

| Pontos de desenvolvimento | Estado | Arquivo |
|---|---|---|
| 0–79 | Posto | `outpost.webp` |
| 80–179 | Povoado | `hamlet.webp` |
| 180–349 | Aldeia | `small.webp` |
| 350–699 | Vila | `medium.webp` |
| 700–1399 | Cidade | `town.webp` |
| 1400+ | Fortaleza | `large.webp` |

A pontuação é a fornecida por `GSF.developmentPoints(v)`, calculada pelas construções e campos da aldeia. Não foi criada uma pontuação paralela nem uma mecânica que modifique saves. Evoluir ou demolir edifícios pode mudar o estágio mostrado.

## Jogabilidade e desempenho

O modo **Ilustração** usa somente uma imagem WebP local da fase da aldeia. Para distinguir suas construções reais da pintura, marcadores mostram os ícones e níveis dos prédios construídos, e marcadores discretos de + permitem construir em qualquer um dos 20 terrenos. Os controles e diálogos permanecem idênticos. A vista **Em grade** conserva a arte SVG de cada edifício para administração detalhada.

A interface não contém mais animação ambiental na aldeia nem nos campos. As demais telas e o mapa não foram modificados. Os 18 campos produtivos continuam funcionando e evoluindo por nível, e seus ícones não se movimentam. Nenhuma imagem exige internet após obter os arquivos do repositório.

**Verificação manual:** abrir a aldeia, confirmar imagem e barra, clicar num prédio e num terreno livre; evoluir um prédio até cruzar uma faixa e confirmar a troca de imagem; alternar Ilustração/Em grade; verificar celular e saves antigos.
