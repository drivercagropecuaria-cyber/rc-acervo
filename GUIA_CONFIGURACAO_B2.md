# GUIA DE CONFIGURAÇÃO - Backblaze B2

## Credenciais Necessárias

Para o sistema RC Acervo funcionar, você precisa de **3 informações** do Backblaze:

### 1. Account ID (Master Application Key ID)
```
Local: Painel Backblaze → App Keys → topo da página
Formato: 0052cfa9b6df80a0000000002
Status: ✅ Já temos
```

### 2. Application Key
```
Local: Painel Backblaze → App Keys → gerar nova chave
Formato: K005cHN3wWr7bS6c2yYyEhcm5SqzegM
Status: ✅ Já temos
```

### 3. Bucket ID
```
Local: Painel Backblaze → Buckets → clicar no bucket
Formato: 4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d
Status: ⚠️ PRECISAMOS OBTER
```

---

## Como Obter o Bucket ID

### Passo 1: Acesse o Painel Backblaze
```
URL: https://secure.backblaze.com/b2_buckets.htm
```

### Passo 2: Encontre seu Bucket
- Localize o bucket "rc-acervo-midia" na lista
- Clique no nome do bucket

### Passo 3: Anote o Bucket ID
- O Bucket ID aparece nas informações do bucket
- É uma string longa (ex: 4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d)

---

## Configuração das Variáveis no Render

Após obter o Bucket ID, configure no Render:

```
B2_ACCOUNT_ID=0052cfa9b6df80a0000000002
B2_APPLICATION_KEY=K005cHN3wWr7bS6c2yYyEhcm5SqzegM
B2_BUCKET_ID=[COLOQUE_O_BUCKET_ID_AQUI]
B2_BUCKET_NAME=rc-acervo-midia
```

---

## Teste de Conexão

Após configurar, teste com:
```bash
curl https://SEU-SERVIDOR.onrender.com/api/upload/test
```

Resposta esperada:
```json
{
  "success": true,
  "message": "Conexão com Backblaze B2 OK"
}
```
