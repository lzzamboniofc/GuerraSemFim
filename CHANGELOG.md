# Histórico de versões

## v0.2 — Visual & Confiabilidade (2026-10-14)

### Adicionado
- Cenários originais em SVG para centro da aldeia e campos de recursos, totalmente offline.
- Distinção visual entre construções simples, desenvolvidas e avançadas.
- Conselho do Reino: próxima missão, progresso e atalho contextual.
- Medidores discretos de capacidade dos armazéns na barra de recursos.
- Salvamento reserva em `localStorage` com recuperação do backup local em caso de corrupção do principal.
- Validação dos dados importados, com rejeição de valores fora de faixa e estruturas inválidas.
- Testes de regressão para envio de tropas, tempo offline, combate/retorno e saves.

### Corrigido
- Envio de tropas acima da quantidade disponível não pode mais criar saldo negativo.
- Envio com unidade inexistente, quantidade negativa/fracionária ou ordem inválida é rejeitado.
- Eventos antigos são processados na sequência cronológica ao carregar uma partida.
- Batalha e retorno podem se resolver na mesma retomada offline quando ambos já venceram.

### Compatibilidade
- Campanhas salvas no formato da v0.1 permanecem compatíveis.
- O jogo continua sem bibliotecas, serviços ou assets externos.
- Para melhor persistência, sirva os arquivos via `python -m http.server 8000` e use sempre a mesma origem.

### Limitações
- Esta atualização não adiciona reinos de IA, novas tropas nem combate avançado; esses recursos fazem parte das próximas fases.
- A recuperação usa a cópia local anterior; exportar um arquivo JSON periodicamente continua recomendado.
