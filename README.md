# RC Acervo v2.0

**Casa de Memória Digital - RC Agropecuária**

Sistema completo de gestão de biblioteca de fotos e vídeos com taxonomia institucional de 530+ elementos.

---

## 🚀 Deploy no Render.com

### Variáveis de Ambiente

Configure estas variáveis no painel do Render:

```
B2_ACCOUNT_ID=0052cfa9b6df80a0000000002
B2_APPLICATION_KEY=K005cHN3wWr7bS6c2yYyEhcm5SqzegM
B2_BUCKET_ID=429c7ffa392b167d9fc8001a
B2_BUCKET_NAME=rc-acervo-midia
NODE_ENV=production
```

### Configurações do Web Service

- **Build Command:** `npm install`
- **Start Command:** `node server.js`
- **Instance Type:** Free (ou Starter para produção)

---

## 📊 Taxonomia Implementada

| Categoria | Quantidade |
|-----------|------------|
| Áreas/Fazendas | 13 |
| Pontos de Captação | 25 |
| Tipos de Projeto | 15 |
| Núcleos Pecuária | 12 (+30 subnúcleos) |
| Núcleos Agro | 9 (+21 subnúcleos) |
| Temas Principais | 50 (+100 secundários) |
| Eventos | 30 |
| Funções Históricas | 8 |
| Status | 9 |
| Capítulos do Filme | 13 |

**Total: 530+ elementos classificatórios**

---

## 🔌 Endpoints da API

### Health & Status
- `GET /api/health` - Status do servidor

### Taxonomia
- `GET /api/taxonomia/completa` - Taxonomia completa
- `GET /api/taxonomia/areas` - 13 áreas/fazendas
- `GET /api/taxonomia/pontos` - 25 pontos
- `GET /api/taxonomia/tipos-projeto` - 15 tipos
- `GET /api/taxonomia/nucleos-pecuaria` - Núcleos pecuária
- `GET /api/taxonomia/nucleos-agro` - Núcleos agro
- `GET /api/taxonomia/temas` - Temas principais
- `GET /api/taxonomia/eventos` - 30 eventos
- `GET /api/taxonomia/status` - 9 status
- `GET /api/taxonomia/capitulos` - 13 capítulos

### Upload
- `POST /api/upload/presigned` - Gera URL para upload
- `POST /api/upload/complete` - Confirma upload
- `GET /api/upload/test` - Testa conexão B2

### Catálogo
- `GET /api/catalogo` - Lista itens
- `GET /api/catalogo/:id` - Detalhes do item
- `PUT /api/catalogo/:id` - Atualiza item
- `PATCH /api/catalogo/:id/status` - Atualiza status

### Estatísticas
- `GET /api/estatisticas/geral` - Estatísticas completas

---

## 📁 Estrutura de Pastas no B2

```
rc-acervo-midia/
├── 00_ENTRADA/           # Material bruto
├── 01_CATALOGADO/        # Com metadados
├── 02_EM_PRODUCAO/       # Em edição
├── 03_EM_APROVACAO/      # Aguardando aprovação
├── 04_APROVADO/          # Aprovado
├── 05_PUBLICADO/         # Publicado
└── 06_ARQUIVADO/         # Biblioteca permanente
```

---

## 🔄 Workflow de Status

```
Entrada (Bruto) → Em triagem → Catalogado → Selecionado → 
Em produção → Em aprovação → Aprovado → Publicado → Arquivado
```

---

## 🛠️ Tecnologias

- **Backend:** Node.js + Express
- **Storage:** Backblaze B2 (S3-compatible)
- **Frontend:** HTML5 + CSS3 + Vanilla JS
- **Database:** JSON file (persistido em /tmp no Render)

---

## 📄 Licença

Propriedade de RC Agropecuária
