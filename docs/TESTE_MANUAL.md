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

## Versão 0.5 — recursos, construção, paz e comércio

1. Crie uma campanha marcando e desmarcando **Permitir ataques inimigos** na tela inicial.
2. Abra **Configurações** e alterne **Ataques inimigos**; confirme que a mudança permanece após recarregar o navegador.
3. Com uma invasão em trânsito, desative os ataques. A marcha hostil deve ser cancelada, sem perdas ou saques; as facções devem continuar evoluindo.
4. Clique em cada recurso da barra superior. O modal deve mostrar produção líquida, campos, edifícios, bônus, capacidade e consumo de cereal quando aplicável.
5. Clique em um edifício ocupado e em um terreno vazio. As ações de melhoria ou seleção de projeto devem aparecer em modal, não no painel lateral; o botão de fechar e a tecla Esc devem funcionar.
6. Clique em um campo e inicie uma melhoria. O modal deve fechar e o cronômetro deve surgir na lista de obras.
7. Construa uma Embaixada e vá a **Reinos Rivais**. Negocie uma trégua, confirme a redução de recursos e o contador de 12 turnos.
8. Com duas aldeias e Mercado construído, envie uma caravana. Verifique a entrega e os limites do armazenamento da aldeia de destino.
9. Conclua aventuras até obter artefatos, equipe um item no menu do herói e confira o bônus refletido na produção do recurso correspondente.
10. Exporte/importa uma campanha antiga, faça um backup e confirme a compatibilidade offline.

## Versão 0.6 — Crônicas do Império

1. Inicie uma campanha em cada dificuldade (Explorador, Equilibrado, Conquistador). Em Configurações, altere a dificuldade e confira que a escolha permanece após fechar e abrir.
2. Abra **Campanha**. Confirme que o capítulo 1 está aberto e os capítulos 2 e 3 bloqueados até os anteriores serem resgatados.
3. Evolua três campos e conclua uma aventura. Resgate o primeiro capítulo: recursos e +15 de reputação em cada reino.
4. Em **Reinos Rivais**, construa uma Embaixada, envie um presente, aguarde três turnos para enviar outro e negocie uma trégua. Confirme que a reputação muda e os recursos são gastos.
5. Com Embaixada nível 3 e 40 pontos de reputação, firme uma aliança. Verifique que marchas inimigas da facção são canceladas e um ataque manual contra ela é bloqueado.
6. Tente o caminho diplomático com três alianças e duas aldeias e confira a vitória após reivindicar os três capítulos.
7. Tente um caminho militar, derrotando um reino na fase 2 e os três reinos na fase final, sem precisar assinar acordos de paz.
8. Desative ataques inimigos em Configurações e confirme que não surgem invasões e que o caminho diplomático continua acessível.
9. Clique em um recurso do topo e num edifício para conferir que ambos os modais da versão 0.5 continuam funcionais.
10. Importe um save v0.5 e confirme que a campanha aparece sem perder aldeias, tropas nem configuração dos ataques.

Testes automatizados adicionais: `node tests/campaign.test.js` e `node tests/ui-v06.test.js`.
