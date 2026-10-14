# Como publicar este projeto no GitHub

Destino atual: https://github.com/lzzamboniofc/GuerraSemFim

Este projeto foi publicado com a integração do GitHub para o repositório `lzzamboniofc/GuerraSemFim`.

## Método rápido — Git no seu computador

1. Descompacte o arquivo de entrega `GuerraSemFim-offline-v0.1.zip`.
2. Abra um terminal **dentro da pasta que contém o arquivo `index.html`**.
3. Execute:

```bash
git init -b main
git remote add origin https://github.com/lzzamboniofc/GuerraSemFim.git
git add .
git commit -m "feat: primeira versao offline de Guerra Sem Fim"
git push -u origin main
```

> Se o Git informar que a pasta já é um repositório, pule o `git init`. Se a origem `origin` já existir, use `git remote set-url origin https://github.com/lzzamboniofc/GuerraSemFim.git`. O GitHub pode exigir autenticação pelo navegador ou token; use **somente sua própria conta com permissão de escrita**. Não envie credenciais nem tokens por mensagens.

## Método visual — interface do GitHub

1. Abra o repositório no GitHub autenticado com uma conta que tenha acesso de escrita.
2. Utilize **Add file → Upload files** (disponibilidade depende da permissão e da interface).
3. Envie **os arquivos e as pastas descompactados**, não apenas o ZIP.
4. Crie o commit inicial na branch `main`.

Não é necessário fazer deploy ou hospedar site para **jogar offline**; o GitHub é somente o repositório do código.
