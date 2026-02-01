# PLANO DE AÇÃO COMPLETO - RC Acervo v2.0
## Deploy do Servidor Node.js + Backblaze B2

**Data:** Fevereiro 2026  
**Versão:** 2.0 - Deploy Completo

---

## 📋 RESUMO EXECUTIVO

Este plano detalha todos os passos necessários para colocar o RC Acervo v2.0 em produção com servidor Node.js funcionando 100%, integrado ao Backblaze B2 para armazenamento de arquivos.

---

## 🎯 OBJETIVOS

1. ✅ Servidor Node.js rodando 24/7 no Render.com
2. ✅ Integração completa com Backblaze B2
3. ✅ Upload de arquivos funcionando perfeitamente
4. ✅ Catálogo persistindo dados corretamente
5. ✅ Sistema de backup automático
6. ✅ Monitoramento e alertas

---

## 📊 INFRAESTRUTURA ATUAL

### Backblaze B2 (Já Configurado)
```
✅ Bucket: rc-acervo-midia
✅ Account ID: 0052cfa9b6df80a0000000002
✅ Application Key: K005cHN3wWr7bS6c2yYyEhcm5SqzegM
⚠️  Bucket ID: [PENDENTE - verificar no painel B2]
```

### Render.com (Configuração Pendente)
```
⚠️  Serviço: rc-acervo
⚠️  Tipo: Web Service (Node.js)
⚠️  Branch: main
⚠️  Build Command: npm install
⚠️  Start Command: node server.js
```

### GitHub (Repositório)
```
⚠️  Repositório: [PENDENTE - criar/verificar]
⚠️  Branch: main
⚠️  Arquivos: server.js, taxonomia.js, package.json
```

---

## 🔧 PASSO 1: VERIFICAR BACKBLAZE B2

### 1.1 Acessar Painel Backblaze
```
URL: https://secure.backblaze.com/b2_buckets.htm
Login: [suas credenciais]
```

### 1.2 Verificar Bucket ID
1. Clique no bucket "rc-acervo-midia"
2. Anote o **Bucket ID** (formato: xxxxxxxxxx)
3. Este ID é necessário para as variáveis de ambiente

### 1.3 Verificar CORS (Cross-Origin)
1. No bucket, vá em **Bucket Settings**
2. Configure CORS:
```json
{
  "corsRules": [
    {
      "allowedOrigins": ["*"],
      "allowedOperations": ["s3_put"],
      "maxAgeSeconds": 3600
    }
  ]
}
```

**Resultado esperado:**
- Bucket ID anotado
- CORS configurado para uploads

---

## 📁 PASSO 2: PREPARAR REPOSITÓRIO GITHUB

### 2.1 Criar Repositório (se não existir)
```bash
# Acesse: https://github.com/new
# Nome: rc-acervo
# Visibilidade: Private (recomendado)
```

### 2.2 Inicializar Git Local
```bash
# No terminal, na pasta do projeto
cd /caminho/para/rc-acervo-deploy

# Inicializar git
git init

# Configurar usuário (se necessário)
git config user.name "Seu Nome"
git config user.email "seu@email.com"

# Adicionar remote
git remote add origin https://github.com/SEU-USUARIO/rc-acervo.git
```

### 2.3 Criar .gitignore
```bash
# Criar arquivo .gitignore
cat > .gitignore << 'EOF'
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Environment
.env
.env.local
.env.*.local

# Data
data/
*.json
!package.json
!package-lock.json

# Logs
logs/
*.log

# OS
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/
*.swp
*.swo
EOF
```

### 2.4 Commit Inicial
```bash
# Adicionar todos os arquivos
git add -A

# Commit
git commit -m "v2.0: Sistema completo RC Acervo

- Taxonomia completa (530+ elementos)
- API REST com Express
- Integração Backblaze B2
- Frontend com drag-and-drop
- Sistema de workflow de status
- Dashboard com estatísticas"

# Push para main
git branch -M main
git push -u origin main
```

**Resultado esperado:**
- Repositório no GitHub com todos os arquivos
- Branch main atualizada

---

## 🚀 PASSO 3: CONFIGURAR RENDER.COM

### 3.1 Criar Novo Web Service
```
1. Acesse: https://dashboard.render.com
2. Clique em "New +" → "Web Service"
3. Conecte seu repositório GitHub "rc-acervo"
4. Selecione branch: main
```

### 3.2 Configurar Build e Start
```
Name: rc-acervo
Region: Oregon (US West) - [escolha mais próxima]
Branch: main
Runtime: Node
Build Command: npm install
Start Command: node server.js
Instance Type: Free (ou Starter para produção)
```

### 3.3 Configurar Variáveis de Ambiente
Clique em "Advanced" → "Add Environment Variable"

```
B2_ACCOUNT_ID=0052cfa9b6df80a0000000002
B2_APPLICATION_KEY=K005cHN3wWr7bS6c2yYyEhcm5SqzegM
B2_BUCKET_ID=[COLOQUE_O_BUCKET_ID_AQUI]
B2_BUCKET_NAME=rc-acervo-midia
NODE_ENV=production
```

### 3.4 Deploy Inicial
```
Clique em "Create Web Service"
Aguarde o build e deploy (2-3 minutos)
```

**Resultado esperado:**
- Servidor online em: https://rc-acervo.onrender.com
- Logs mostrando "Servidor rodando na porta 10000"

---

## 🧪 PASSO 4: TESTAR SISTEMA

### 4.1 Testar Health Check
```bash
curl https://rc-acervo.onrender.com/api/health
```

**Resposta esperada:**
```json
{
  "success": true,
  "status": "ok",
  "version": "2.0.0",
  "taxonomia": {
    "areas": 13,
    "pontos": 25,
    ...
  }
}
```

### 4.2 Testar Taxonomia
```bash
curl https://rc-acervo.onrender.com/api/taxonomia/completa
```

**Resposta esperada:**
- JSON com toda a taxonomia (530+ elementos)

### 4.3 Testar Conexão B2
```bash
curl https://rc-acervo.onrender.com/api/upload/test
```

**Resposta esperada:**
```json
{
  "success": true,
  "message": "Conexão com Backblaze B2 OK",
  "data": {
    "bucket": "rc-acervo-midia"
  }
}
```

### 4.4 Testar Upload (via Frontend)
```
1. Acesse: https://rc-acervo.onrender.com
2. Clique em "Novo Upload"
3. Preencha:
   - Título: "Teste de Upload"
   - Data: [hoje]
   - Área: Vila Canabrava
   - Ponto: Maternidade
   - Tipo: Rotina de Campo
   - Núcleo: Cria → Nascimento e maternidade
   - Tema: Cria → Primeiros cuidados
   - Status: Entrada (Bruto)
4. Selecione um arquivo de imagem
5. Clique "Catalogar Arquivo"
```

**Resultado esperado:**
- Upload completa com sucesso
- Arquivo aparece no Backblaze B2
- Item aparece no catálogo

---

## 🔒 PASSO 5: CONFIGURAR BACKUP

### 5.1 Backup Manual do Catálogo
```bash
# Acesse o shell do Render (ou execute localmente)
curl https://rc-acervo.onrender.com/api/catalogo > backup-$(date +%Y%m%d).json
```

### 5.2 Backup Automático (Opcional)
Adicione ao server.js:
```javascript
// Backup diário do catálogo
setInterval(() => {
  const backup = getAllCatalogo();
  const filename = `backup-${new Date().toISOString().split('T')[0]}.json`;
  // Enviar para B2 ou serviço de backup
}, 24 * 60 * 60 * 1000); // 24 horas
```

---

## 📊 PASSO 6: MONITORAMENTO

### 6.1 Logs no Render
```
Dashboard → rc-acervo → Logs
```

### 6.2 Métricas Importantes
- Uptime do servidor
- Erros de upload
- Tamanho do catálogo
- Espaço usado no B2

### 6.3 Alertas (Opcional)
Configurar alertas para:
- Servidor offline
- Erros de autenticação B2
- Espaço no B2 acima de 80%

---

## 🛠️ PASSO 7: MANUTENÇÃO

### 7.1 Atualização do Sistema
```bash
# Local: fazer alterações
# Commit e push
git add -A
git commit -m "Descrição da alteração"
git push origin main

# Render faz deploy automático
```

### 7.2 Limpeza de Arquivos
```bash
# Remover arquivos da lixeira (mais de 30 dias)
# Implementar endpoint:
DELETE /api/admin/limpar-lixeira
```

### 7.3 Verificação Mensal
- [ ] Logs de erro
- [ ] Tamanho do catálogo
- [ ] Espaço no B2
- [ ] Backup do catálogo

---

## 🚨 TROUBLESHOOTING

### Erro 401 no Backblaze
```
Causa: Credenciais inválidas
Solução: Verificar B2_ACCOUNT_ID e B2_APPLICATION_KEY
```

### Erro 400 no Upload
```
Causa: Metadados incompletos
Solução: Verificar se área e tema estão preenchidos
```

### Servidor Offline
```
Causa: Build falhou ou crash
Solução: Verificar logs no Render Dashboard
```

### Arquivos Não Aparecem no Catálogo
```
Causa: Banco de dados não persistindo
Solução: Verificar pasta /tmp/rc-acervo-data no Render
```

---

## ✅ CHECKLIST FINAL

Antes de considerar o sistema pronto:

- [ ] Bucket ID do Backblaze anotado
- [ ] Repositório GitHub criado e atualizado
- [ ] Variáveis de ambiente configuradas no Render
- [ ] Deploy realizado com sucesso
- [ ] Health check respondendo OK
- [ ] Taxonomia carregando completamente
- [ ] Conexão B2 testada e funcionando
- [ ] Upload de arquivo testado com sucesso
- [ ] Arquivo aparece no Backblaze B2
- [ ] Item aparece no catálogo
- [ ] Filtros do catálogo funcionando
- [ ] Workflow de status funcionando

---

## 📞 SUPORTE

Em caso de problemas:
1. Verificar logs no Render Dashboard
2. Testar endpoints individualmente
3. Verificar variáveis de ambiente
4. Consultar documentação do plano

---

**Documento elaborado para:** RC Agropecuária  
**Sistema:** RC Acervo v2.0 - Casa de Memória Digital
