# ⚔️ Guerra Sem Fim

**Impérios & Conquistas — jogo de estratégia medieval para navegador, com execução offline.**

Um jogo **independente**, inspirado nas mecânicas clássicas dos jogos de aldeias e impérios (como Travian). Não utiliza imagens, código, textos do jogo original, marcas ou APIs da Travian Games.

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

## 🎮 O que funciona na versão 0.1

| Sistema | Funcionalidade |
|---|---|
| Início | Escolha de Romanos, Gauleses ou Teutões, comandante, nome e velocidade |
| Economia | 4 recursos, 18 campos (4/4/4/6), produção por hora, bônus econômicos, armazém, celeiro e consumo de cereal |
| Aldeia | 20 espaços, edifícios com custos escalonados, pré-requisitos, níveis e tempos de construção |
| Filas | Uma construção de cada categoria para Romanos; uma por vez para outras tribos; cancelamento com devolução de 75% |
| Tropas | Quatro tipos por tribo, recrutamento e manutenção de cereal |
| Mapa | Região 17×17 com visualização 11×11, aldeias, vales, oásis e acampamentos hostis |
| Combates | Ataques e saques simulados, deslocamento, baixas, capacidade de carga, saque e retorno das tropas |
| Herói | Aventuras, vida, experiência, níveis, evolução de atributos e produção bônus |
| Missões | Sete objetivos com recompensas em recursos |
| Mercado | Troca local de recursos com taxa de conversão, após construir o edifício |
| Colonização | Até cinco aldeias: Residência nível 10, custo de fundação e seleção de vale livre |
| Persistência | Autosave em `localStorage`, avanço de tempo quando a página é reaberta, importação/exportação JSON |
| Interface | Português brasileiro, responsiva para desktop e celular, sem assets externos |

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
│   └── favicon.svg           # Símbolo original do projeto
├── js/
│   ├── data.js               # Tribos, edifícios, tropas, custo, posições
│   ├── engine.js             # Estado, economia, tempo, filas, batalhas, save
│   └── app.js                # Interface, navegação e interações
├── docs/
│   ├── ANALISE_TRAVIAN.md    # Inventário de mecânicas e diferenças
│   ├── ROADMAP.md            # Próximas etapas de desenvolvimento
│   └── PUBLICACAO_GITHUB.md # Como subir para o GitHub
└── tests/
    └── smoke.test.js         # Testes básicos sem dependências
```

O código utiliza apenas JavaScript nativo, HTML e CSS. **Nenhum `npm install` é necessário para jogar.**

## 🧪 Testes

Se tiver Node.js instalado:

```bash
node tests/smoke.test.js
```

Os testes cobrem criação de mundo, tribos, produção, filas, construção, exploração, batalha, herói, missões e salvamento. Validações manuais devem ser repetidas nos navegadores pretendidos para distribuição.

## ⚠️ Limites conhecidos

Esta é uma primeira versão funcional — **não é uma reprodução integral do Travian**. A fórmula de combate é simplificada; não há jogadores reais, alianças, mercado entre jogadores, modo multijogador, Natares, maravilhas do mundo, eventos de servidor, herói equipado, cerco operacional, rotas comerciais, colonizadores nem pontos de cultura. As tropas de exploração ainda não executam espionagem especial; os confrontos são contra acampamentos controlados localmente. Oásis aparecem no mapa, mas sua anexação ainda não foi implementada.

Veja o [inventário completo](docs/ANALISE_TRAVIAN.md), o [roteiro de expansão](docs/ROADMAP.md) e o [guia de publicação no GitHub](docs/PUBLICACAO_GITHUB.md).

## 📜 Licença

O código original deste repositório está sob a licença MIT (`LICENSE`). Travian e demais marcas de terceiros pertencem aos seus respectivos titulares. Este projeto não possui afiliação com a Travian Games.
