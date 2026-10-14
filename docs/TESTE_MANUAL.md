# Verificação manual da v0.2

Use o navegador com um servidor local (`python -m http.server 8000`) e abra `http://localhost:8000`.

- [ ] Iniciar uma campanha de cada tribo e trocar entre Aldeia, Recursos e Mapa.
- [ ] Verificar se os cenários vetoriais da aldeia e dos campos aparecem sem internet.
- [ ] Conferir Conselhos do Reino e abrir o atalho sugerido; concluir a primeira missão.
- [ ] Construir melhorias, fechar a aba por alguns minutos e conferir os níveis e recursos ao retornar.
- [ ] Treinar tropas e enviá-las para um acampamento; consultar o resultado e o retorno.
- [ ] Exportar a campanha JSON e importar novamente; verificar os dados.
- [ ] Reiniciar, confirmar que a campanha anterior não reaparece.
- [ ] Testar desktop e celular, navegação por teclado e `prefers-reduced-motion`.

Testes de motor (Node.js, opcionais):

```bash
node tests/smoke.test.js
node tests/regression.test.js
```
