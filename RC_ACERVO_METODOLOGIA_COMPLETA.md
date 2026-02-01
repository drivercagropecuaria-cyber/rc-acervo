# RC AGROPECUÁRIA - SISTEMA DE ACERVO MULTIMÍDIA
## Metodologia, Arquitetura e Plano de Execução Completo

**Versão:** 2.0  
**Data:** Fevereiro 2026  
**Status:** Especificação Técnica Completa

---

## 1. VISÃO GERAL DO SISTEMA

### 1.1 Propósito
O Sistema de Acervo RC Agropecuária é uma plataforma completa de gestão de ativos multimídia (fotos e vídeos) que funciona como uma "Casa de Memória Digital" - preservando, organizando e valorizando todo o conteúdo audiovisual da organização com base em uma taxonomia institucional rigorosa.

### 1.2 Fluxo Operacional Completo

```
ENTRADA (Bruto) → TRIAGEM → CATALOGADO → SELECIONADO → PRODUÇÃO → 
APROVAÇÃO → APROVADO → PUBLICADO → ARQUIVADO
```

### 1.3 Estrutura de Pastas no Storage

```
RC-ACERVO/
├── 00_ENTRADA/                    # Caixa de chegada (bruto)
│   └── ANO/MES/DIA/
├── 01_CATALOGADO/                 # Com metadados completos
│   └── ANO/MES/DIA/
├── 02_EM_PRODUCAO/               # Material em edição
├── 03_APROVADO/                  # Pronto para publicar
├── 04_PUBLICADO/                 # Com links de publicação
├── 05_ARQUIVADO/                 # Biblioteca permanente
├── 99_LIXEIRA/                   # Descartados (retenção 30 dias)
└── THUMBNAILS/                   # Cache de miniaturas
```

---

## 2. TAXONOMIA COMPLETA (530+ Elementos)

### 2.1 Áreas e Fazendas (13 unidades)

| Ordem | Área/Fazenda | Descrição |
|-------|--------------|-----------|
| 1 | Vila Canabrava | Unidade central e símbolo do sistema produtivo, cultura e legado |
| 2 | Olhos d'Água | Unidade de captação e produção com rotinas intensas de manejo |
| 3 | Santa Maria | Unidade vinculada a operações de cria, manejo e rotina de campo |
| 4 | Jequitaí | Unidade de produção e captações do ciclo anual |
| 5 | Terra Nova | Unidade de operações; integra manejo, infraestrutura e produtividade |
| 6 | União | Unidade estratégica de produção; forte uso em rotinas de reprodução |
| 7 | Retiro União | Núcleo de trabalho de campo (apartações, protocolos) |
| 8 | Belo Horizonte (Escritório) | Centro de gestão, planejamento, reuniões, estratégia |
| 9 | Rotas e Estradas | Registros de deslocamento, logística, bastidores |
| 10 | Locais Externos | Feiras, congressos, visitas técnicas, reuniões externas |
| 11 | Tatersal / Recinto de Leilão | Espaço de eventos de comercialização |
| 12 | Expominas (Belo Horizonte) | Marco de representatividade institucional |
| 13 | Curvelo (Marco Histórico) | Referência territorial e histórica do fundador |

### 2.2 Pontos de Captação (25 locais)

```javascript
const PONTOS = [
  "Curral de Manejo",      // Local de apartação, contenção, manejo sanitário
  "Balança",               // Ponto de pesagem e conferência
  "Maternidade",           // Partos, recém-nascidos, cuidado materno
  "Pasto",                 // Área de produção a pasto
  "Confinamento",          // Infraestrutura de dieta controlada
  "Silo",                  // Armazenamento de silagem
  "Lavoura",               // Área agrícola (milho para silagem)
  "Pivô Central de Irrigação",
  "Fábrica de Bioinsumos",
  "Curvas de Nível / Conservação do Solo",
  "Bebedouro",
  "Barragem / Represa",
  "Nascente / Vereda",
  "Área de Embarque e Desembarque",
  "Estradas Internas e Porteiras",
  "Oficina / Manutenção",
  "Almoxarifado / Estoque",
  "Garagem / Frota",
  "Alojamentos / Moradias (Vila)",
  "Refeitório / Cozinha",
  "Sede / Casa Principal",
  "Escritório (Fazenda)",
  "Sala de Reunião",
  "Igreja / Capela / Procissão",
  "Área de Visitas Técnicas"
];
```

### 2.3 Tipos de Projeto de Captação (15 tipos)

```javascript
const TIPOS_PROJETO = [
  { id: 1, nome: "Documentário (capítulo longo)", desc: "Narrativa longa com arco, capítulos e construção de legado" },
  { id: 2, nome: "Série (episódios curtos recorrentes)", desc: "Episódios contínuos, rotina e repetição estratégica de temas" },
  { id: 3, nome: "Rotina de Campo (dia a dia)", desc: "Registro operacional diário com valor de método e cultura" },
  { id: 4, nome: "Manifesto institucional (posicionamento)", desc: "Peça de visão, valores e defesa do propósito" },
  { id: 5, nome: "Marca e Institucional (branding)", desc: "Conteúdo de identidade, reputação e consistência pública" },
  { id: 6, nome: "Evento (cobertura)", desc: "Cobertura de marcos públicos, recepção e movimento de mercado" },
  { id: 7, nome: "Perfil e Personagem (pessoas e histórias)", desc: "Histórias de pessoas, funções, cultura e heróis do cotidiano" },
  { id: 8, nome: "Manual e Treinamento (procedimentos)", desc: "Padronização técnica e capacitação" },
  { id: 9, nome: "Acervo e Registro (memória e arquivo)", desc: "Registro canônico para Casa de Memória" },
  { id: 10, nome: "Ciência e Tecnologia (dados, genética, sistemas)", desc: "Conteúdo técnico, dados, inovação e método aplicado" },
  { id: 11, nome: "Comercial (chamada de venda)", desc: "Peças de oferta, convite, leilão e conversão" },
  { id: 12, nome: "Entrevista (depoimento guiado)", desc: "Depoimento com roteiro: visão, técnica, história e posicionamento" },
  { id: 13, nome: "Paisagem e Clima (chuva, seca, natureza)", desc: "Conteúdo simbólico do território, clima e ciclos" },
  { id: 14, nome: "Relato histórico (memória e marcos)", desc: "Marcos, cronologia, origem e construção de legado" },
  { id: 15, nome: "Bastidores (making of e processos)", desc: "Processo por trás da entrega: equipe, gravação, método e rotina" }
];
```

### 2.4 Núcleos da Pecuária com Subnúcleos (30 núcleos, 30+ subnúcleos)

```javascript
const NUCLEOS_PECUARIA = {
  "Cria": ["Nascimento e maternidade", "Desmama", "Formação de lote"],
  "Recria": ["Desenvolvimento a pasto"],
  "Engorda": ["Terminação"],
  "Reprodução": ["Inseminação artificial em tempo fixo", "Inseminação artificial", "Transferência de embriões", "Diagnóstico de gestação"],
  "Genética e Melhoramento": ["Seleção de reprodutores", "Guzerá puro de origem", "Nelore puro de origem", "Cruzamento Zebu x Zebu (Guzonel)", "Heterose e vigor híbrido"],
  "Sanidade": ["Vacinação", "Controle parasitário", "Bem-estar animal"],
  "Nutrição": ["Pasto e suplementação", "Silagem", "Ração proteica e balanceamento"],
  "Manejo": ["Apartação", "Pesagem e conferência", "Marcação e identificação", "Andrológico e avaliação de touros"],
  "Confinamento": ["Entrada e adaptação", "Rodada e saída"],
  "Logística Pecuária": ["Transporte e embarques"],
  "Qualidade Total (Controle)": ["Medir, anotar, avaliar e apartar", "Sistemas e dados de campo"],
  "Comercialização": ["Leilões e oferta pública"]
};
```

### 2.5 Núcleos do Agro (Terra e Água) com Subnúcleos (21 núcleos)

```javascript
const NUCLEOS_AGRO = {
  "Agricultura": ["Plantio", "Colheita", "Insumos e adubação", "Armazenamento"],
  "Solo": ["Conservação", "Curvas de nível", "Recuperação"],
  "Pastagens": ["Manejo rotacionado", "Adubação e correção"],
  "Água": ["Nascentes e veredas", "Barragens e represas", "Distribuição e bebedouros"],
  "Irrigação": ["Pivô central"],
  "Silagem": ["Lavoura de milho", "Produção e ensilagem"],
  "Bioinsumos": ["Fabricação", "Controle biológico"],
  "Meio Ambiente": ["Preservação de áreas", "Conformidade e boas práticas"],
  "Clima": ["Seca e transição", "Chegada das chuvas"]
};
```

### 2.6 Operações Internas com Suboperações (18 núcleos)

```javascript
const OPERACOES = {
  "Infraestrutura": ["Cercas e porteiras", "Estradas internas", "Instalações de curral", "Armazéns, silos e depósitos"],
  "Máquinas e Implementos": ["Manutenção e oficina", "Operação de campo"],
  "Frota": ["Logística interna"],
  "Logística": ["Combustível e abastecimento"],
  "Compras e Estoque": ["Almoxarifado"],
  "Segurança do Trabalho": ["Equipamentos e procedimentos"],
  "Pessoas e Treinamento": ["Capacitação", "Cultura e ambiente"],
  "Dados e Sistemas": ["Registro de campo", "Gestão zootécnica"],
  "Comunicação Interna": ["Alinhamento e rotinas"],
  "Manutenção Predial": ["Sede, casas e alojamentos"],
  "Energia e Recursos": ["Controle e eficiência"],
  "Qualidade e Conformidade": ["Rotinas e regras"]
};
```

### 2.7 Marca e Valorização com Submarcas (12 núcleos)

```javascript
const MARCA = {
  "Posicionamento": ["Manifesto e narrativa"],
  "Educação e Cultura": ["Conteúdo educativo"],
  "Produtos e Projetos": ["Qualidade Total"],
  "Mercado e Comercial": ["Relacionamento com clientes"],
  "Representatividade": ["Setor e classe"],
  "Genética como Marca": ["Guzonel e seleção"],
  "Casa de Memória e Futuro": ["Acervo e legado"],
  "Mídia e Conteúdo": ["Instagram, YouTube, documentários"],
  "Eventos e Institucional": ["Congressos e leilões"],
  "Sustentabilidade como Marca": ["Água, solo, boas práticas"],
  "Reputação e Confiança": ["Normas e condutas"],
  "Comunidade e Pessoas": ["Histórias e cultura interna"]
};
```

### 2.8 Temas Principais (50 temas)

```javascript
const TEMAS_PRINCIPAIS = [
  "Terra e Sertão", "Origem e Propósito", "Legado", "Fé e Espiritualidade",
  "Rotina do Campo", "O Vaqueiro", "O Cavalo", "Bem-estar Animal",
  "Cria", "Maternidade", "Desmama", "Manejo e Apartação",
  "Pesagem e Controle", "Sanidade", "Nutrição", "Silagem",
  "Confinamento", "Reprodução", "Inseminação em Tempo Fixo",
  "Diagnóstico de Gestação", "Andrológico de Touros", "Genética e Seleção",
  "Guzerá Puro de Origem", "Nelore Puro de Origem",
  "Cruzamento Zebu x Zebu (Guzonel)", "Heterose e Eficiência",
  "Qualidade Total", "Gestão e Planejamento", "Sistemas e Dados",
  "Água", "Veredas e Nascentes", "Barragens e Reservas", "Irrigação",
  "Solo e Conservação", "Curvas de Nível", "Pastagens",
  "Agricultura do Sistema", "Bioinsumos", "Sustentabilidade",
  "Logística e Embarques", "Leilão", "Clientes e Relacionamento",
  "Representatividade", "Congressos e Palestras", "Cultura Interna",
  "Treinamento e Disciplina", "Comunicação e Mídia",
  "Documentário e Filme", "Casa de Memória e Futuro", "Futuro do Agro"
];
```

### 2.9 Temas Secundários (100+ temas) - Mapeados por Tema Principal

Cada Tema Principal possui 2 temas secundários relacionados:

```javascript
const TEMAS_SECUNDARIOS = {
  "Terra e Sertão": ["Horizonte e paisagem", "Seca e resistência"],
  "Origem e Propósito": ["Decisão fundadora", "Visão de longo prazo"],
  "Legado": ["Tradição que continua", "Responsabilidade sobre o amanhã"],
  "Fé e Espiritualidade": ["Oração por chuvas", "Gratidão pelo trabalho"],
  "Rotina do Campo": ["Amanhecer na fazenda", "Toada do trabalho"],
  "O Vaqueiro": ["Honra do serviço", "Heróis silenciosos"],
  "O Cavalo": ["Respeito ao animal de serviço", "Rodízio e cuidado"],
  "Bem-estar Animal": ["Manejo calmo", "Infraestrutura adequada"],
  "Cria": ["Primeiros cuidados", "Organização de lotes"],
  "Maternidade": ["Habilidade materna", "Vida nascendo"],
  "Desmama": ["Transição com método", "Reorganização pós-desmama"],
  "Manejo e Apartação": ["Critério e destino", "Trabalho em equipe"],
  "Pesagem e Controle": ["Dados zootécnicos", "Disciplina de rotina"],
  "Sanidade": ["Calendário sanitário", "Controle parasitário"],
  "Nutrição": ["Suplementação estratégica", "Volumoso de qualidade"],
  "Silagem": ["Plantio para silagem", "Ensilagem e armazenamento"],
  "Confinamento": ["Adaptação de dieta", "Transição seca-águas"],
  "Reprodução": ["Eficiência reprodutiva", "Planejamento de estação"],
  "Inseminação em Tempo Fixo": ["Dia do protocolo", "Escala e padronização"],
  "Diagnóstico de Gestação": ["Controle de prenhez", "Ajuste de estratégia"],
  "Andrológico de Touros": ["Avaliação reprodutiva", "Seleção e descarte"],
  "Genética e Seleção": ["Acasalamento dirigido", "Registro de desempenho"],
  "Guzerá Puro de Origem": ["Rusticidade do sertão", "Habilidade materna"],
  "Nelore Puro de Origem": ["Precocidade", "Padrão de carcaça"],
  "Cruzamento Zebu x Zebu (Guzonel)": ["Vigor híbrido", "Simplicidade de manejo"],
  "Heterose e Eficiência": ["Ganho à desmama", "Consistência de desempenho"],
  "Qualidade Total": ["Medir", "Anotar", "Avaliar", "Apartar"],
  "Gestão e Planejamento": ["Rotina organizada", "Metas e indicadores"],
  "Sistemas e Dados": ["Registro de campo", "Decisão baseada em evidência"],
  "Água": ["Distribuição para o rebanho", "Qualidade e segurança hídrica"],
  "Veredas e Nascentes": ["Preservação e respeito", "Educação ambiental aplicada"],
  "Barragens e Reservas": ["Reserva estratégica", "Integração com irrigação"],
  "Irrigação": ["Pivô central como tecnologia", "Eficiência no uso da água"],
  "Solo e Conservação": ["Proteção contra erosão", "Melhoria contínua do solo"],
  "Curvas de Nível": ["Infiltração e retenção", "Pasto mais produtivo"],
  "Pastagens": ["Rotação de lotes", "Recuperação de áreas"],
  "Agricultura do Sistema": ["Milho como base nutricional", "Tecnologia agrícola"],
  "Bioinsumos": ["Controle natural", "Inovação interna"],
  "Sustentabilidade": ["Boas práticas e conformidade", "Responsabilidade socioambiental"],
  "Logística e Embarques": ["Estrada afora", "Organização de transporte"],
  "Leilão": ["Preparação de lotes", "Recepção e experiência do cliente"],
  "Clientes e Relacionamento": ["Confiança construída", "Pós-venda e proximidade"],
  "Representatividade": ["Voz do produtor", "Organização do setor"],
  "Congressos e Palestras": ["Conteúdo e influência", "Reputação institucional"],
  "Cultura Interna": ["Respeito e ambiente", "Reconhecimento de pessoas"],
  "Treinamento e Disciplina": ["Capacitação contínua", "Normas e condutas"],
  "Comunicação e Mídia": ["Conteúdo como registro", "Educar e posicionar"],
  "Documentário e Filme": ["Capítulos do legado", "Vozes e personagens"],
  "Casa de Memória e Futuro": ["Acervo canônico", "História oral"],
  "Futuro do Agro": ["Inovação com raízes", "Continuidade geracional"]
};
```

### 2.10 Eventos Principais (30 eventos)

```javascript
const EVENTOS = [
  { id: 1, nome: "Abertura do Ano e Planejamento", funcao: "Futuro" },
  { id: 2, nome: "Estação de Monta (Início)", funcao: "Técnica" },
  { id: 3, nome: "Protocolos de Inseminação em Tempo Fixo", funcao: "Técnica" },
  { id: 4, nome: "Diagnóstico de Gestação", funcao: "Processo produtivo" },
  { id: 5, nome: "Exame Andrológico de Touros", funcao: "Técnica" },
  { id: 6, nome: "Nascimentos na Maternidade", funcao: "Pessoas" },
  { id: 7, nome: "Rotina do Vaqueiro", funcao: "Rito e tradição" },
  { id: 8, nome: "Apartação Estratégica", funcao: "Processo produtivo" },
  { id: 9, nome: "Pesagem e Conferência", funcao: "Processo produtivo" },
  { id: 10, nome: "Marcação e Identificação", funcao: "Técnica" },
  { id: 11, nome: "Vacinação do Rebanho", funcao: "Sustentabilidade" },
  { id: 12, nome: "Controle Parasitário", funcao: "Sustentabilidade" },
  { id: 13, nome: "Manejo de Pastagens", funcao: "Sustentabilidade" },
  { id: 14, nome: "Conservação do Solo (Curvas de Nível)", funcao: "Sustentabilidade" },
  { id: 15, nome: "Gestão da Água (Nascentes e Veredas)", funcao: "Sustentabilidade" },
  { id: 16, nome: "Gestão da Água (Barragens e Represas)", funcao: "Sustentabilidade" },
  { id: 17, nome: "Irrigação (Pivô Central)", funcao: "Técnica" },
  { id: 18, nome: "Plantio de Milho para Silagem", funcao: "Processo produtivo" },
  { id: 19, nome: "Colheita e Produção de Silagem", funcao: "Processo produtivo" },
  { id: 20, nome: "Produção de Bioinsumos", funcao: "Futuro" },
  { id: 21, nome: "Transição Seca para Águas", funcao: "Sustentabilidade" },
  { id: 22, nome: "Entrada no Confinamento", funcao: "Processo produtivo" },
  { id: 23, nome: "Rodada e Saída do Confinamento", funcao: "Logística e mercado" },
  { id: 24, nome: "Embarques e Logística de Lotes", funcao: "Logística e mercado" },
  { id: 25, nome: "Seleção e Padronização de Lotes para Leilão", funcao: "Mercado" },
  { id: 26, nome: "Leilão Qualidade Total (Marco Anual)", funcao: "Mercado" },
  { id: 27, nome: "Visita Técnica e Consultorias", funcao: "Técnica" },
  { id: 28, nome: "Congresso e Palestras (Representatividade)", funcao: "Mercado" },
  { id: 29, nome: "Dia do Fazendeiro", funcao: "Origem e rito" },
  { id: 30, nome: "Lançamento e Atualizações da Casa de Memória", funcao: "Futuro" }
];
```

### 2.11 Funções Históricas (8 funções)

```javascript
const FUNCOES_HISTORICAS = [
  { id: 1, nome: "Origem e Fundação", desc: "Marcos de início, trajetória e propósito do fundador" },
  { id: 2, nome: "Rito e Tradição", desc: "Cultura viva: toadas, rotinas, símbolos, fé e pertencimento" },
  { id: 3, nome: "Técnica e Ciência", desc: "Métodos, protocolos, genética, dados e tecnologia aplicada" },
  { id: 4, nome: "Processo Produtivo", desc: "Cronologia real do trabalho: do nascimento ao resultado" },
  { id: 5, nome: "Pessoas e Cultura", desc: "Heróis do cotidiano: equipe, famílias, histórias orais" },
  { id: 6, nome: "Sustentabilidade e Território", desc: "Água, solo, clima, preservação e boas práticas" },
  { id: 7, nome: "Mercado e Representatividade", desc: "Leilões, eventos, fala pública, reputação e classe" },
  { id: 8, nome: "Futuro e Inovação", desc: "Projetos, visão, modernização, legado e continuidade" }
];
```

### 2.12 Status do Material (9 status)

```javascript
const STATUS = [
  { id: 1, nome: "Entrada (Bruto)", desc: "Material recém-chegado, ainda sem triagem e sem catalogação" },
  { id: 2, nome: "Em triagem", desc: "Seleção inicial: identificar o que presta e o que precisa de descarte" },
  { id: 3, nome: "Catalogado", desc: "ID criado, pasta canônica criada e linha registrada no Catálogo" },
  { id: 4, nome: "Selecionado para produção", desc: "Material confirmado para virar entrega (reels, episódio, filme, etc.)" },
  { id: 5, nome: "Em produção", desc: "Edição/roteiro/arte em andamento" },
  { id: 6, nome: "Em aprovação", desc: "Aguardando validação final (corte, revisão, ajustes)" },
  { id: 7, nome: "Aprovado", desc: "Autorizado para publicar" },
  { id: 8, nome: "Publicado", desc: "Publicado na plataforma definida, com link registrado" },
  { id: 9, nome: "Arquivado", desc: "Final guardado na biblioteca e com rastreabilidade completa" }
];
```

### 2.13 Capítulos do Filme (13 capítulos)

```javascript
const CAPITULOS = [
  { id: 1, nome: "A definir", desc: "Usar quando ainda não existe capítulo atribuído" },
  { id: 2, nome: "Capítulo 01", desc: "Origem e propósito" },
  { id: 3, nome: "Capítulo 02", desc: "Terra, sertão e território" },
  { id: 4, nome: "Capítulo 03", desc: "Rotina do campo e disciplina" },
  { id: 5, nome: "Capítulo 04", desc: "O vaqueiro e as pessoas" },
  { id: 6, nome: "Capítulo 05", desc: "Cria e nascimento" },
  { id: 7, nome: "Capítulo 06", desc: "Reprodução e método" },
  { id: 8, nome: "Capítulo 07", desc: "Genética e seleção" },
  { id: 9, nome: "Capítulo 08", desc: "Nutrição, silagem e eficiência" },
  { id: 10, nome: "Capítulo 09", desc: "Água, solo e sustentabilidade" },
  { id: 11, nome: "Capítulo 10", desc: "Mercado, leilão e representatividade" },
  { id: 12, nome: "Capítulo 11", desc: "Casa de Memória e legado" },
  { id: 13, nome: "Capítulo 12", desc: "Futuro e continuidade" }
];
```

---

## 3. ARQUITETURA TÉCNICA

### 3.1 Stack Tecnológico

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │  HTML5      │  │  Tailwind   │  │  Vanilla JS (ES6+)      │  │
│  │  Semantic   │  │  CSS v3.4   │  │  Fetch API, Drag&Drop   │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         BACKEND                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │  Node.js    │  │  Express    │  │  Multer (upload)        │  │
│  │  v18+ LTS   │  │  v4.18+     │  │  UUID, CORS, Helmet     │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      ARMAZENAMENTO                               │
│  ┌─────────────────────────┐  ┌─────────────────────────────┐   │
│  │  Backblaze B2           │  │  JSON File DB               │   │
│  │  (S3-Compatible)        │  │  (Metadata persistence)     │   │
│  │  - Presigned URLs       │  │  - catálogo.json            │   │
│  │  - Direct upload        │  │  - estatísticas.json        │   │
│  └─────────────────────────┘  └─────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 Estrutura de Dados do Item

```javascript
const ITEM_SCHEMA = {
  // Identificação
  id: "String (UUID v4)",
  identificador: "String (AUTO: AAAAMMDD_AREA_NUCLEO_TEMA_UUID)",
  
  // Informações Básicas
  titulo: "String (obrigatório, 3-100 chars)",
  dataCaptacao: "Date (ISO 8601)",
  responsavel: "String (nome do operador/cinegrafista)",
  observacoes: "String (opcional, 500 chars max)",
  
  // Classificação Geográfica
  areaFazenda: "Enum (13 opções)",
  ponto: "Enum (25 opções)",
  
  // Classificação de Projeto
  tipoProjeto: "Enum (15 opções)",
  
  // Núcleos (com subnúcleos condicionais)
  nucleoPecuaria: "Enum (30 opções, nullable)",
  subnucleoPecuaria: "Enum (dependente do núcleo, nullable)",
  nucleoAgro: "Enum (21 opções, nullable)",
  subnucleoAgro: "Enum (dependente do núcleo, nullable)",
  nucleoOperacoes: "Enum (18 opções, nullable)",
  subnucleoOperacoes: "Enum (dependente do núcleo, nullable)",
  nucleoMarca: "Enum (12 opções, nullable)",
  subnucleoMarca: "Enum (dependente do núcleo, nullable)",
  
  // Classificação Temática
  temaPrincipal: "Enum (50 opções)",
  temaSecundario: "Enum (2 opções por tema principal)",
  
  // Contexto Narrativo
  eventoPrincipal: "Enum (30 opções, nullable)",
  funcaoHistorica: "Enum (8 opções, nullable)",
  capituloFilme: "Enum (13 opções, default: 'A definir')",
  fraseMemoria: "String (1 linha, 150 chars max, nullable)",
  
  // Status e Workflow
  status: "Enum (9 opções, default: 'Entrada (Bruto)')",
  historicoStatus: "Array[{status, data, responsavel, observacao}]",
  
  // Arquivos
  arquivo: {
    nomeOriginal: "String",
    nomeSistema: "String (UUID.EXT)",
    nomeCanonico: "String (AAAAMMDD_AREA_NUCLEO_TEMA_UUID.EXT)",
    tipo: "Enum: ['imagem', 'video']",
    formato: "Enum: ['jpg', 'jpeg', 'png', 'mp4', 'mov', 'avi']",
    tamanhoBytes: "Number",
    tamanhoFormatado: "String (ex: '2.5 MB')",
    duracao: "Number (segundos, apenas vídeo)",
    duracaoFormatada: "String (ex: '02:35')",
    resolucao: "String (ex: '1920x1080')",
    url: "String (presigned URL B2)",
    urlThumbnail: "String (presigned URL thumbnail)",
    checksum: "String (SHA-256)",
    pastaStorage: "String (caminho no B2)"
  },
  
  // Links Externos
  links: {
    drive: "String (URL, nullable)",
    pastaProjeto: "String (URL, nullable)",
    frameio: "String (URL, nullable)",
    asana: "String (URL, nullable)",
    publicacao: "String (URL, nullable)"
  },
  
  // Metadados Técnicos
  metadadosTecnicos: {
    camera: "String (nullable)",
    lente: "String (nullable)",
    iso: "Number (nullable)",
    abertura: "String (nullable)",
    velocidade: "String (nullable)",
    gpsLatitude: "Number (nullable)",
    gpsLongitude: "Number (nullable)",
    exifCompleto: "Object (todos os metadados EXIF extraídos)"
  },
  
  // Controle
  createdAt: "Date (ISO 8601)",
  updatedAt: "Date (ISO 8601)",
  createdBy: "String (usuário)",
  updatedBy: "String (usuário)",
  versao: "Number (controle de versão do schema)"
};
```

### 3.3 Convenção de Nomenclatura de Arquivos

```
FORMATO: AAAAMMDD_AREA_NUCLEO_TEMA_STATUS_UUID.EXT

EXEMPLO: 20250215_VILACAN_CRIA_NASCIMENTO_CAT_a1b2c3d4.mp4

COMPONENTES:
├── AAAA    = Ano (4 dígitos)
├── MM      = Mês (2 dígitos)
├── DD      = Dia (2 dígitos)
├── _       = Separador
├── AREA    = Área/Fazenda (8 chars max, abreviado)
├── _       = Separador
├── NUCLEO  = Núcleo (8 chars max, abreviado)
├── _       = Separador
├── TEMA    = Tema Principal (10 chars max, abreviado)
├── _       = Separador
├── STATUS  = Status (3 chars: ENT, TRI, CAT, SEL, PRO, APR, APO, PUB, ARQ)
├── _       = Separador
├── UUID    = 8 primeiros chars do UUID
└── .EXT    = Extensão do arquivo

ABREVIAÇÕES DE ÁREA:
- VILACAN = Vila Canabrava
- OLHOSAG = Olhos d'Água
- SANTAMA = Santa Maria
- JEQUITA = Jequitaí
- TERRANO = Terra Nova
- UNIAOXX = União
- RETUNIA = Retiro União
- BHESCRI = Belo Horizonte (Escritório)
- ROTAEST = Rotas e Estradas
- LOCALEX = Locais Externos
- TATEREC = Tatersal / Recinto de Leilão
- EXPOMIN = Expominas
- CURVELO = Curvelo

ABREVIAÇÕES DE STATUS:
- ENT = Entrada (Bruto)
- TRI = Em triagem
- CAT = Catalogado
- SEL = Selecionado para produção
- PRO = Em produção
- APR = Em aprovação
- APO = Aprovado
- PUB = Publicado
- ARQ = Arquivado
```

---

## 4. API ENDPOINTS COMPLETOS

### 4.1 Health & Status

```
GET  /api/health              → Status do servidor e B2
GET  /api/config              → Configurações públicas do sistema
```

### 4.2 Taxonomia (Dados de Referência)

```
GET  /api/taxonomia/areas              → Lista 13 áreas/fazendas
GET  /api/taxonomia/pontos             → Lista 25 pontos
GET  /api/taxonomia/tipos-projeto      → Lista 15 tipos de projeto
GET  /api/taxonomia/nucleos-pecuaria   → Lista 30 núcleos + subnúcleos
GET  /api/taxonomia/nucleos-agro       → Lista 21 núcleos + subnúcleos
GET  /api/taxonomia/operacoes          → Lista 18 núcleos + subnúcleos
GET  /api/taxonomia/marca              → Lista 12 núcleos + subnúcleos
GET  /api/taxonomia/temas              → Lista 50 temas + 100 secundários
GET  /api/taxonomia/eventos            → Lista 30 eventos
GET  /api/taxonomia/funcoes-historicas → Lista 8 funções
GET  /api/taxonomia/status             → Lista 9 status
GET  /api/taxonomia/capitulos          → Lista 13 capítulos
GET  /api/taxonomia/completa           → Todas as taxonomias de uma vez
```

### 4.3 Upload

```
POST /api/upload/presigned     → Gera URL presigned para upload direto B2
POST /api/upload/complete      → Confirma upload e cria metadados
POST /api/upload/cancel        → Cancela upload e libera recursos
```

### 4.4 Catálogo (CRUD)

```
GET    /api/catalogo           → Lista todos os itens (com paginação/filtros)
GET    /api/catalogo/:id       → Detalhes de um item específico
POST   /api/catalogo           → Cria novo item (manual)
PUT    /api/catalogo/:id       → Atualiza item existente
DELETE /api/catalogo/:id       → Remove item (move para lixeira)
PATCH  /api/catalogo/:id/status → Atualiza apenas o status (workflow)
```

### 4.5 Busca Avançada

```
GET  /api/busca?q=termo&area=Vila+Canabrava&status=Catalogado
GET  /api/busca/avancada       → Busca com múltiplos filtros combinados
POST /api/busca/salva          → Salva consulta para reuso
```

### 4.6 Estatísticas e Dashboard

```
GET /api/estatisticas/geral           → Visão geral do acervo
GET /api/estatisticas/por-status      → Contagem por status
GET /api/estatisticas/por-area        → Contagem por área
GET /api/estatisticas/por-nucleo      → Contagem por núcleo
GET /api/estatisticas/por-mes         → Contagem por mês/ano
GET /api/estatisticas/por-tema        → Contagem por tema
GET /api/estatisticas/tendencias      → Tendências de crescimento
GET /api/estatisticas/espaco-usado    → Uso de storage
```

### 4.7 Administração

```
GET  /api/admin/backup        → Gera backup do catálogo
POST /api/admin/restore       → Restaura de backup
GET  /api/admin/logs          → Logs de atividade
POST /api/admin/limpar-lixeira → Esvazia lixeira (itens > 30 dias)
```

---

## 5. FLUXOS DE TRABALHO

### 5.1 Fluxo de Upload Completo

```
┌─────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   USUÁRIO   │────▶│  SELECIONA      │────▶│  PREENCHE       │
│             │     │  ARQUIVO(S)     │     │  METADADOS      │
└─────────────┘     └─────────────────┘     └─────────────────┘
                                                    │
                                                    ▼
┌─────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   CONFIRMA  │◀────│  UPLOAD DIRETO  │◀────│  SOLICITA URL   │
│   SUCESSO   │     │  PARA B2        │     │  PRESIGNED      │
└─────────────┘     └─────────────────┘     └─────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────┐
│  SERVIDOR CONFIRMA UPLOAD E CRIA METADADOS                  │
│  - Gera UUID                                                │
│  - Cria nome canônico                                       │
│  - Salva no catálogo.json                                   │
│  - Retorna confirmação com ID                               │
└─────────────────────────────────────────────────────────────┘
```

### 5.2 Fluxo de Mudança de Status

```
Entrada (Bruto)
      │
      │ Triagem inicial
      ▼
Em triagem ──────────────┐
      │                  │
      │ Selecionado      │ Descartado
      ▼                  ▼
Catalogado            Lixeira
      │                  │
      │ Selecionado      │ (auto-delete 30 dias)
      ▼
Selecionado para produção
      │
      │ Início da produção
      ▼
Em produção
      │
      │ Envio para aprovação
      ▼
Em aprovação ────────────┐
      │                  │
      │ Aprovado         │ Reprovado
      ▼                  ▼
Aprovado              Retorna para produção
      │
      │ Publicação
      ▼
Publicado
      │
      │ Arquivamento
      ▼
Arquivado (biblioteca permanente)
```

---

## 6. INTERFACE DO USUÁRIO

### 6.1 Estrutura de Telas

```
┌─────────────────────────────────────────────────────────────────┐
│  LOGO RC AGRO          DASHBOARD  CATÁLOGO  UPLOAD  ESTATÍSTICAS │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    ÁREA DE CONTEÚDO                      │   │
│  │                                                          │   │
│  │  [Dashboard] → Cards de estatísticas + Gráficos         │   │
│  │  [Catálogo]  → Grid de itens + Filtros laterais         │   │
│  │  [Upload]    → Drag & drop + Form de metadados          │   │
│  │  [Estatísticas] → Relatórios e análises                 │   │
│  │                                                          │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 6.2 Componentes do Formulário de Upload

```
┌─────────────────────────────────────────────────────────────────┐
│  UPLOAD DE ARQUIVOS                                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  [    ÁREA DE DRAG & DROP    ]                          │   │
│  │  Solte arquivos aqui ou clique para selecionar          │   │
│  │  Suporta: JPG, PNG, MP4, MOV (máx 2GB)                  │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  METADADOS OBRIGATÓRIOS                                         │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │ Título *        │  │ Data da Captação│  │ Responsável     │ │
│  │ [             ] │  │ [__/__/____   ] │  │ [             ] │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
│                                                                 │
│  CLASSIFICAÇÃO GEOGRÁFICA                                       │
│  ┌─────────────────────────┐  ┌─────────────────────────┐       │
│  │ Área / Fazenda *        │  │ Ponto *                 │       │
│  │ [▼ Vila Canabrava    ] │  │ [▼ Curral de Manejo  ] │       │
│  └─────────────────────────┘  └─────────────────────────┘       │
│                                                                 │
│  TIPO DE PROJETO                                                │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Tipo de Projeto *                                       │   │
│  │ [▼ Documentário (capítulo longo)                     ] │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  NÚCLEOS (selecione pelo menos um)                              │
│  ┌─────────────────────────┐  ┌─────────────────────────┐       │
│  │ Núcleo da Pecuária      │  │ Subnúcleo               │       │
│  │ [▼ Cria              ] │  │ [▼ Nascimento e mat...] │       │
│  └─────────────────────────┘  └─────────────────────────┘       │
│  ┌─────────────────────────┐  ┌─────────────────────────┐       │
│  │ Núcleo do Agro          │  │ Subnúcleo               │       │
│  │ [▼ Agricultura       ] │  │ [▼ Plantio           ] │       │
│  └─────────────────────────┘  └─────────────────────────┘       │
│  [ + Adicionar mais núcleos ]                                   │
│                                                                 │
│  CLASSIFICAÇÃO TEMÁTICA                                         │
│  ┌─────────────────────────┐  ┌─────────────────────────┐       │
│  │ Tema Principal *        │  │ Tema Secundário *       │       │
│  │ [▼ Cria              ] │  │ [▼ Primeiros cuidados] │       │
│  └─────────────────────────┘  └─────────────────────────┘       │
│                                                                 │
│  CONTEXTO NARRATIVO                                             │
│  ┌─────────────────────────┐  ┌─────────────────────────┐       │
│  │ Evento Principal        │  │ Função Histórica        │       │
│  │ [▼ Nascimentos na... ] │  │ [▼ Processo Produtivo] │       │
│  └─────────────────────────┘  └─────────────────────────┘       │
│  ┌─────────────────────────┐                                    │
│  │ Capítulo do Filme       │  ┌─────────────────────────┐       │
│  │ [▼ Capítulo 05       ] │  │ Frase-memória           │       │
│  └─────────────────────────┘  │ [                     ] │       │
│                               └─────────────────────────┘       │
│                                                                 │
│  STATUS E WORKFLOW                                              │
│  ┌─────────────────────────┐                                    │
│  │ Status *                │                                    │
│  │ [▼ Entrada (Bruto)   ] │                                    │
│  └─────────────────────────┘                                    │
│                                                                 │
│  LINKS EXTERNOS                                                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │ Link Drive      │  │ Link Frame.io   │  │ Link Asana      │ │
│  │ [             ] │  │ [             ] │  │ [             ] │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
│                                                                 │
│  OBSERVAÇÕES                                                    │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ [                                                      ]│   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│              [ CANCELAR ]        [ CATALOGAR ARQUIVO ]          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 6.3 Painel de Filtros do Catálogo

```
┌─────────────────────┐
│  FILTRAR CATÁLOGO   │
├─────────────────────┤
│                     │
│  Status             │
│  ☑ Entrada (Bruto)  │
│  ☑ Em triagem       │
│  ☑ Catalogado       │
│  ☐ Em produção      │
│  ...                │
│                     │
│  Área/Fazenda       │
│  ☑ Vila Canabrava   │
│  ☑ Olhos d'Água     │
│  ☐ Santa Maria      │
│  ...                │
│                     │
│  Núcleo da Pecuária │
│  ☑ Cria             │
│  ☑ Recria           │
│  ☐ Engorda          │
│  ...                │
│                     │
│  Tema Principal     │
│  ☑ Cria             │
│  ☑ Maternidade      │
│  ☐ Desmama          │
│  ...                │
│                     │
│  Período            │
│  De: [__/__/____]   │
│  Até: [__/__/____]  │
│                     │
│  [ LIMPAR ]         │
│  [ APLICAR ]        │
│                     │
└─────────────────────┘
```

---

## 7. PLANOS DE IMPLEMENTAÇÃO

### 7.1 Fase 1: Fundação (Semana 1-2)

**Objetivo:** Sistema funcional com taxonomia básica

```
Tarefas:
├── Backend
│   ├── [ ] Implementar todas as rotas de taxonomia
│   ├── [ ] Criar schema completo do item
│   ├── [ ] Atualizar endpoint de upload/complete
│   └── [ ] Implementar validação de metadados
├── Frontend
│   ├── [ ] Criar componente de dropdown hierárquico
│   ├── [ ] Implementar formulário com todos os campos
│   ├── [ ] Adicionar validação em tempo real
│   └── [ ] Criar preview de arquivo
└── Testes
    ├── [ ] Testar upload com metadados completos
    ├── [ ] Verificar persistência no JSON
    └── [ ] Validar nomenclatura de arquivos
```

### 7.2 Fase 2: Taxonomia Completa (Semana 3-4)

**Objetivo:** Todos os 530+ elementos da taxonomia implementados

```
Tarefas:
├── Backend
│   ├── [ ] Carregar todas as listas da taxonomia
│   ├── [ ] Implementar lógica de subnúcleos condicionais
│   ├── [ ] Criar endpoint /api/taxonomia/completa
│   └── [ ] Otimizar resposta para cache no frontend
├── Frontend
│   ├── [ ] Implementar dropdowns em cascata
│   ├── [ ] Adicionar busca em dropdowns grandes
│   ├── [ ] Criar interface para seleção múltipla de núcleos
│   └── [ ] Implementar preview de nome canônico
└── Testes
    ├── [ ] Testar todas as combinações de subnúcleos
    ├── [ ] Validar performance com listas grandes
    └── [ ] Verificar comportamento offline
```

### 7.3 Fase 3: Workflow e Status (Semana 5-6)

**Objetivo:** Sistema completo de workflow com histórico

```
Tarefas:
├── Backend
│   ├── [ ] Implementar histórico de status
│   ├── [ ] Criar endpoint PATCH /catalogo/:id/status
│   ├── [ ] Adicionar validações de transição de status
│   └── [ ] Implementar notificações (opcional)
├── Frontend
│   ├── [ ] Criar componente de timeline de status
│   ├── [ ] Implementar botões de ação rápida
│   ├── [ ] Adicionar confirmação para mudanças críticas
│   └── [ ] Criar visualização de histórico
└── Testes
    ├── [ ] Testar fluxo completo de status
    ├── [ ] Verificar histórico persistente
    └── [ ] Validar permissões de transição
```

### 7.4 Fase 4: Busca e Dashboard (Semana 7-8)

**Objetivo:** Sistema de busca avançada e dashboard completo

```
Tarefas:
├── Backend
│   ├── [ ] Implementar busca full-text
│   ├── [ ] Criar sistema de filtros combinados
│   ├── [ ] Adicionar paginação eficiente
│   └── [ ] Criar endpoints de estatísticas
├── Frontend
│   ├── [ ] Implementar busca com autocomplete
│   ├── [ ] Criar filtros laterais dinâmicos
│   ├── [ ] Desenvolver dashboard com gráficos
│   └── [ ] Adicionar exportação de relatórios
└── Testes
    ├── [ ] Testar performance de busca
    ├── [ ] Validar precisão dos filtros
    └── [ ] Verificar atualização em tempo real
```

### 7.5 Fase 5: Otimização e Deploy (Semana 9-10)

**Objetivo:** Sistema pronto para produção

```
Tarefas:
├── Performance
│   ├── [ ] Implementar cache de taxonomia
│   ├── [ ] Otimizar carregamento de imagens
│   ├── [ ] Adicionar lazy loading
│   └── [ ] Comprimir assets
├── Segurança
│   ├── [ ] Validar todas as entradas
│   ├── [ ] Implementar rate limiting
│   ├── [ ] Adicionar headers de segurança
│   └── [ ] Revisar permissões CORS
├── Deploy
│   ├── [ ] Configurar variáveis de ambiente
│   ├── [ ] Criar script de backup automático
│   ├── [ ] Documentar procedimentos
│   └── [ ] Treinar usuários
└── Testes Finais
    ├── [ ] Teste de carga
    ├── [ ] Teste de usabilidade
    └── [ ] Validação com usuários reais
```

---

## 8. CONSIDERAÇÕES TÉCNICAS IMPORTANTES

### 8.1 Limites e Restrições

```javascript
const LIMITES = {
  // Upload
  tamanhoMaximoArquivo: "2GB",
  tiposPermitidos: ["image/jpeg", "image/png", "image/jpg", "video/mp4", "video/mov", "video/avi"],
  uploadsSimultaneos: 5,
  
  // Metadados
  tituloMaxLength: 100,
  observacoesMaxLength: 2000,
  fraseMemoriaMaxLength: 150,
  
  // Catálogo
  itensPorPagina: 24,
  maxFiltrosCombinados: 10,
  
  // Storage
  presignedUrlExpiry: 3600, // 1 hora
  thumbnailMaxWidth: 400,
  
  // Banco de dados
  maxCatalogoSize: "100MB", // antes de arquivar
  backupRetencao: 30 // dias
};
```

### 8.2 Estratégia de Backup

```
DIÁRIO:
├── catálogo.json → Backup automático às 03:00
├── Estatísticas → Snapshot diário
└── Logs → Rotação semanal

SEMANAL:
├── Full backup → Domingo 02:00
├── Upload para B2 (pasta _backups/)
└── Retenção: 4 semanas

MENSAL:
├── Arquivamento de itens antigos
├── Limpeza de lixeira (> 30 dias)
└── Relatório de uso
```

---

## 9. MÉTRICAS DE SUCESSO

### 9.1 KPIs do Sistema

```
ADoção:
├── % de uploads com metadados completos: > 95%
├── Tempo médio de catalogação: < 5 min
└── Taxa de erro de upload: < 2%

Performance:
├── Tempo de resposta da API: < 500ms
├── Tempo de carregamento da página: < 3s
└── Disponibilidade: > 99.5%

Organização:
├── % de arquivos com nomenclatura correta: 100%
├── % de arquivos em pastas corretas: 100%
└── Taxa de recuperação de busca: > 90%
```

---

## 10. PRÓXIMOS PASSOS IMEDIATOS

### Implementação Prioritária (Próximas 48h)

1. **Backend - Taxonomia Completa**
   - [ ] Criar arquivo `taxonomia.js` com todas as 530+ entradas
   - [ ] Implementar endpoints `/api/taxonomia/*`
   - [ ] Atualizar schema do item no banco de dados

2. **Backend - Upload Aprimorado**
   - [ ] Modificar `/api/upload/complete` para aceitar todos os campos
   - [ ] Implementar geração de nome canônico
   - [ ] Adicionar validação de metadados obrigatórios

3. **Frontend - Formulário Completo**
   - [ ] Atualizar dropdowns com todas as opções
   - [ ] Implementar lógica de subnúcleos condicionais
   - [ ] Adicionar preview do nome do arquivo

4. **Testes**
   - [ ] Validar upload com metadados completos
   - [ ] Verificar persistência correta
   - [ ] Testar todas as combinações de subnúcleos

---

**Documento elaborado para RC Agropecuária**  
*Sistema de Acervo Multimídia - Casa de Memória Digital*
