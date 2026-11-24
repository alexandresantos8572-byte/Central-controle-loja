# CANTRAL CONTROLE — LOJA

Frontend inicial de gestão de notas de venda. Interface demo responsiva com armazenamento local do navegador, pesquisa, detalhes, ação de envio simulada, cancelamento com motivo e proteção contra notas duplicadas. **Ainda não está ligado ao software de emissão de notas da loja nem ao app do depósito.**

## Começar no GitHub + Render
1. Crie um repositório GitHub chamado `cantral-controle-loja`.
2. Envie todos os arquivos deste pacote para a raiz do repositório (incluindo `src/`).
3. No Render, escolha New → Web Service → conectar esse repositório.
4. Render deve ler `render.yaml`; confirme build `npm install && npm run build` e start `npm start`.
5. Após deploy, abra a URL. A interface usa notas de demonstração; a entrada manual é somente para testar telas.

## Webhook (ponto de integração preparado)
Endpoint:
`POST https://SUA-URL.onrender.com/api/webhook/notes`

Headers:
`Content-Type: application/json`
`x-cantral-token: valor configurado em WEBHOOK_TOKEN` (se a variável estiver configurada)

Payload exemplo:
```json
{
  "noteNumber": "10582",
  "customer": "João da Silva",
  "issuedAt": "2026-11-24T12:30:00-03:00",
  "pickupPerson": "Maria Silva",
  "items": [
    { "name": "Ração bovina 30kg", "quantity": 4 },
    { "name": "Sal mineral 25kg", "quantity": 2 }
  ]
}
```

Resposta: HTTP 201 e `received: true`. Nota repetida retorna 409. O endpoint guarda as notas recebidas no arquivo `incoming-notes.json` no servidor. Para persistência durável no Render, configure armazenamento persistente ou migre para Supabase/PostgreSQL antes de usar com vendas reais.

## Integração de verdade
Webhook já existe, mas a conexão com o sistema que emite a notinha depende de descobrir se ele oferece API, webhook, exportação, acesso autorizado ao banco ou uma ponte local. Não configure captura de tela/imagem como método. Não use com dados reais antes de implementar autenticação, autorização, banco persistente, trilha de auditoria e sincronização da tela com os registros recebidos.
