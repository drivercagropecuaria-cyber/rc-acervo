/**
 * RC Acervo v2.0 - Servidor Completo com Taxonomia EMBUTIDA
 * Sistema de Biblioteca de Fotos e Vídeos - RC Agropecuária
 * VERSÃO CORRIGIDA - Taxonomia injetada no HTML (não depende de API)
 */

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const { TAXONOMIA } = require('./taxonomia');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

const B2_CONFIG = {
  accountId: process.env.B2_ACCOUNT_ID || '',
  applicationKey: process.env.B2_APPLICATION_KEY || '',
  bucketId: process.env.B2_BUCKET_ID || '',
  bucketName: process.env.B2_BUCKET_NAME || '',
  apiUrl: 'https://api005.backblazeb2.com',
  downloadUrl: 'https://f005.backblazeb2.com',
};

const FOLDER_STRUCTURE = {
  ENTRADA: '00_ENTRADA',
  CATALOGADO: '01_CATALOGADO',
  PRODUCAO: '02_EM_PRODUCAO',
  APROVACAO: '03_EM_APROVACAO',
  APROVADO: '04_APROVADO',
  PUBLICADO: '05_PUBLICADO',
  ARQUIVADO: '06_ARQUIVADO',
};

const STATUS_ABREV = {
  'Entrada (Bruto)': 'ENT',
  'Em triagem': 'TRI',
  'Catalogado': 'CAT',
  'Selecionado para produção': 'SEL',
  'Em produção': 'PRO',
  'Em aprovação': 'APR',
  'Aprovado': 'APO',
  'Publicado': 'PUB',
  'Arquivado': 'ARQ'
};

const DB_DIR = process.env.NODE_ENV === 'production' 
  ? '/tmp/rc-acervo-data'
  : path.join(__dirname, 'data');
const DB_FILE = path.join(DB_DIR, 'catalogo-v2.json');

let authCache = null;

app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '10mb' }));

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// ============================================
// BANCO DE DADOS
// ============================================

function ensureDir() {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }
}

function getAllCatalogo() {
  try {
    ensureDir();
    if (!fs.existsSync(DB_FILE)) return [];
    const data = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('[DB] Erro ao ler:', error);
    return [];
  }
}

function saveCatalogoItem(item) {
  try {
    ensureDir();
    const all = getAllCatalogo();
    const index = all.findIndex(m => m.id === item.id);
    if (index >= 0) {
      all[index] = { ...all[index], ...item, updatedAt: new Date().toISOString() };
    } else {
      all.push({ ...item, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(all, null, 2));
    return true;
  } catch (error) {
    console.error('[DB] Erro ao salvar:', error);
    return false;
  }
}

function getItemById(id) {
  return getAllCatalogo().find(m => m.id === id) || null;
}

// ============================================
// BACKBLAZE B2
// ============================================

async function authorizeB2() {
  if (authCache && authCache.expiresAt > Date.now()) {
    return authCache;
  }
  
  const authString = Buffer.from(`${B2_CONFIG.accountId}:${B2_CONFIG.applicationKey}`).toString('base64');
  const response = await axios.get(`${B2_CONFIG.apiUrl}/b2api/v2/b2_authorize_account`, {
    headers: { Authorization: `Basic ${authString}` },
  });
  
  authCache = {
    token: response.data.authorizationToken,
    apiUrl: response.data.apiUrl,
    downloadUrl: response.data.downloadUrl,
    expiresAt: Date.now() + (23 * 60 * 60 * 1000),
  };
  
  return authCache;
}

async function getUploadUrl() {
  const auth = await authorizeB2();
  const response = await axios.post(
    `${auth.apiUrl}/b2api/v2/b2_get_upload_url`,
    { bucketId: B2_CONFIG.bucketId },
    { headers: { Authorization: auth.token } }
  );
  return {
    uploadUrl: response.data.uploadUrl,
    authorizationToken: response.data.authorizationToken,
  };
}

// ============================================
// UTILITÁRIOS
// ============================================

function slugify(text, maxLength = 10) {
  if (!text) return 'GERAL';
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]/g, '')
    .toUpperCase()
    .substring(0, maxLength);
}

function gerarNomeCanonico(metadata, uuid) {
  const data = new Date(metadata.dataCaptacao || Date.now());
  const ano = data.getFullYear().toString();
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const dia = String(data.getDate()).padStart(2, '0');
  
  const areaObj = TAXONOMIA.areasFazendas.find(a => a.nome === metadata.areaFazenda);
  const areaAbrev = areaObj ? areaObj.id : slugify(metadata.areaFazenda, 8);
  
  const nucleo = metadata.nucleoPecuaria || metadata.nucleoAgro || metadata.nucleoOperacoes || metadata.nucleoMarca || 'GERAL';
  const nucleoAbrev = slugify(nucleo, 8);
  
  const temaAbrev = slugify(metadata.temaPrincipal, 10);
  const statusAbrev = STATUS_ABREV[metadata.status] || 'ENT';
  const uuidCurto = uuid.substring(0, 8);
  
  return `${ano}${mes}${dia}_${areaAbrev}_${nucleoAbrev}_${temaAbrev}_${statusAbrev}_${uuidCurto}`;
}

function getFolderByStatus(status) {
  switch (status) {
    case 'Entrada (Bruto)': return FOLDER_STRUCTURE.ENTRADA;
    case 'Em triagem': return FOLDER_STRUCTURE.ENTRADA;
    case 'Catalogado': return FOLDER_STRUCTURE.CATALOGADO;
    case 'Selecionado para produção': return FOLDER_STRUCTURE.CATALOGADO;
    case 'Em produção': return FOLDER_STRUCTURE.PRODUCAO;
    case 'Em aprovação': return FOLDER_STRUCTURE.APROVACAO;
    case 'Aprovado': return FOLDER_STRUCTURE.APROVADO;
    case 'Publicado': return FOLDER_STRUCTURE.PUBLICADO;
    case 'Arquivado': return FOLDER_STRUCTURE.ARQUIVADO;
    default: return FOLDER_STRUCTURE.ENTRADA;
  }
}

function detectarTipoArquivo(extensao) {
  const ext = extensao?.toLowerCase();
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'tiff'].includes(ext)) return 'imagem';
  if (['mp4', 'mov', 'avi', 'mkv', 'webm', 'flv', 'wmv'].includes(ext)) return 'video';
  return 'outro';
}

function formatarTamanho(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// ============================================
// ROTAS API - TAXONOMIA
// ============================================

app.get('/api/taxonomia/completa', (req, res) => {
  res.json({ success: true, data: TAXONOMIA });
});

app.get('/api/taxonomia/areas', (req, res) => {
  res.json({ success: true, data: TAXONOMIA.areasFazendas });
});

app.get('/api/taxonomia/pontos', (req, res) => {
  res.json({ success: true, data: TAXONOMIA.pontos });
});

app.get('/api/taxonomia/tipos-projeto', (req, res) => {
  res.json({ success: true, data: TAXONOMIA.tiposProjeto });
});

app.get('/api/taxonomia/nucleos-pecuaria', (req, res) => {
  res.json({ 
    success: true, 
    data: Object.keys(TAXONOMIA.nucleosPecuaria).map(nucleo => ({
      nome: nucleo,
      subnucleos: TAXONOMIA.nucleosPecuaria[nucleo]
    }))
  });
});

app.get('/api/taxonomia/subnucleos-pecuaria', (req, res) => {
  const { nucleo } = req.query;
  if (!nucleo) {
    return res.status(400).json({ success: false, error: 'Parâmetro nucleo é obrigatório' });
  }
  const subnucleos = TAXONOMIA.nucleosPecuaria[nucleo] || [];
  res.json({ success: true, data: subnucleos });
});

app.get('/api/taxonomia/nucleos-agro', (req, res) => {
  res.json({ 
    success: true, 
    data: Object.keys(TAXONOMIA.nucleosAgro).map(nucleo => ({
      nome: nucleo,
      subnucleos: TAXONOMIA.nucleosAgro[nucleo]
    }))
  });
});

app.get('/api/taxonomia/subnucleos-agro', (req, res) => {
  const { nucleo } = req.query;
  if (!nucleo) {
    return res.status(400).json({ success: false, error: 'Parâmetro nucleo é obrigatório' });
  }
  const subnucleos = TAXONOMIA.nucleosAgro[nucleo] || [];
  res.json({ success: true, data: subnucleos });
});

app.get('/api/taxonomia/operacoes', (req, res) => {
  res.json({ 
    success: true, 
    data: Object.keys(TAXONOMIA.operacoes).map(op => ({
      nome: op,
      suboperacoes: TAXONOMIA.operacoes[op]
    }))
  });
});

app.get('/api/taxonomia/suboperacoes', (req, res) => {
  const { operacao } = req.query;
  if (!operacao) {
    return res.status(400).json({ success: false, error: 'Parâmetro operacao é obrigatório' });
  }
  const suboperacoes = TAXONOMIA.operacoes[operacao] || [];
  res.json({ success: true, data: suboperacoes });
});

app.get('/api/taxonomia/marca', (req, res) => {
  res.json({ 
    success: true, 
    data: Object.keys(TAXONOMIA.marca).map(m => ({
      nome: m,
      submarcas: TAXONOMIA.marca[m]
    }))
  });
});

app.get('/api/taxonomia/submarcas', (req, res) => {
  const { marca } = req.query;
  if (!marca) {
    return res.status(400).json({ success: false, error: 'Parâmetro marca é obrigatório' });
  }
  const submarcas = TAXONOMIA.marca[marca] || [];
  res.json({ success: true, data: submarcas });
});

app.get('/api/taxonomia/temas', (req, res) => {
  res.json({ 
    success: true, 
    data: TAXONOMIA.temasPrincipais.map(tema => ({
      nome: tema,
      secundarios: TAXONOMIA.temasSecundarios[tema] || []
    }))
  });
});

app.get('/api/taxonomia/temas-secundarios', (req, res) => {
  const { tema } = req.query;
  if (!tema) {
    return res.status(400).json({ success: false, error: 'Parâmetro tema é obrigatório' });
  }
  const secundarios = TAXONOMIA.temasSecundarios[tema] || [];
  res.json({ success: true, data: secundarios });
});

app.get('/api/taxonomia/eventos', (req, res) => {
  res.json({ success: true, data: TAXONOMIA.eventos });
});

app.get('/api/taxonomia/funcoes-historicas', (req, res) => {
  res.json({ success: true, data: TAXONOMIA.funcoesHistoricas });
});

app.get('/api/taxonomia/status', (req, res) => {
  res.json({ success: true, data: TAXONOMIA.status });
});

app.get('/api/taxonomia/capitulos', (req, res) => {
  res.json({ success: true, data: TAXONOMIA.capitulos });
});

// ============================================
// ROTAS API - HEALTH
// ============================================

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '2.0.0',
    taxonomia: {
      areas: TAXONOMIA.areasFazendas.length,
      pontos: TAXONOMIA.pontos.length,
      tiposProjeto: TAXONOMIA.tiposProjeto.length,
      nucleosPecuaria: Object.keys(TAXONOMIA.nucleosPecuaria).length,
      nucleosAgro: Object.keys(TAXONOMIA.nucleosAgro).length,
      operacoes: Object.keys(TAXONOMIA.operacoes).length,
      marca: Object.keys(TAXONOMIA.marca).length,
      temasPrincipais: TAXONOMIA.temasPrincipais.length,
      temasSecundarios: Object.keys(TAXONOMIA.temasSecundarios).length,
      eventos: TAXONOMIA.eventos.length,
      funcoesHistoricas: TAXONOMIA.funcoesHistoricas.length,
      status: TAXONOMIA.status.length,
      capitulos: TAXONOMIA.capitulos.length
    },
    config: {
      b2AccountId: B2_CONFIG.accountId ? '✓ Configurado' : '✗ Não configurado',
      b2ApplicationKey: B2_CONFIG.applicationKey ? '✓ Configurado' : '✗ Não configurado',
      b2BucketName: B2_CONFIG.bucketName || 'Não configurado',
      b2BucketId: B2_CONFIG.bucketId ? '✓ Configurado' : '✗ Não configurado',
    }
  });
});

// ============================================
// ROTAS API - UPLOAD
// ============================================

app.post('/api/upload/presigned', async (req, res) => {
  try {
    const { filename, contentType, size, metadata } = req.body;
    
    if (!filename) {
      return res.status(400).json({ success: false, error: 'Nome do arquivo é obrigatório' });
    }
    
    if (!metadata || !metadata.areaFazenda || !metadata.temaPrincipal) {
      return res.status(400).json({ success: false, error: 'Metadados incompletos. Área e Tema são obrigatórios.' });
    }
    
    const uuid = uuidv4().replace(/-/g, '');
    const nomeCanonico = gerarNomeCanonico(metadata, uuid);
    const extensao = filename.split('.').pop()?.toLowerCase() || 'jpg';
    const fileName = `${nomeCanonico}.${extensao}`;
    
    const folderBase = getFolderByStatus(metadata.status || 'Entrada (Bruto)');
    const data = new Date(metadata.dataCaptacao || Date.now());
    const ano = data.getFullYear().toString();
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const dia = String(data.getDate()).padStart(2, '0');
    
    const folderPath = `${folderBase}/${ano}/${mes}/${dia}`;
    const fullPath = `${folderPath}/${fileName}`;
    
    const uploadData = await getUploadUrl();
    
    res.json({
      success: true,
      data: {
        presignedUrl: uploadData.uploadUrl,
        authorizationToken: uploadData.authorizationToken,
        fileName,
        filePath: fullPath,
        folderPath,
        uuid,
        nomeCanonico,
        headers: {
          'Authorization': uploadData.authorizationToken,
          'X-Bz-File-Name': encodeURIComponent(fullPath),
          'Content-Type': contentType || 'application/octet-stream',
          'X-Bz-Content-Sha1': 'do_not_verify',
        }
      }
    });
  } catch (error) {
    console.error('[Upload] Erro:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/upload/complete', async (req, res) => {
  try {
    const { filePath, metadata, uuid } = req.body;
    
    if (!filePath || !metadata) {
      return res.status(400).json({ success: false, error: 'Dados incompletos' });
    }
    
    const parts = filePath.split('/');
    const fileName = parts[parts.length - 1];
    const extensao = fileName.split('.').pop()?.toLowerCase() || '';
    
    const catalogoItem = {
      id: uuid || uuidv4(),
      identificador: fileName.replace(`.${extensao}`, ''),
      titulo: metadata.titulo || fileName,
      dataCaptacao: metadata.dataCaptacao || new Date().toISOString().split('T')[0],
      responsavel: metadata.responsavel || '',
      observacoes: metadata.observacoes || '',
      areaFazenda: metadata.areaFazenda || '',
      ponto: metadata.ponto || '',
      tipoProjeto: metadata.tipoProjeto || '',
      nucleoPecuaria: metadata.nucleoPecuaria || null,
      subnucleoPecuaria: metadata.subnucleoPecuaria || null,
      nucleoAgro: metadata.nucleoAgro || null,
      subnucleoAgro: metadata.subnucleoAgro || null,
      nucleoOperacoes: metadata.nucleoOperacoes || null,
      subnucleoOperacoes: metadata.subnucleoOperacoes || null,
      nucleoMarca: metadata.nucleoMarca || null,
      subnucleoMarca: metadata.subnucleoMarca || null,
      temaPrincipal: metadata.temaPrincipal || '',
      temaSecundario: metadata.temaSecundario || '',
      eventoPrincipal: metadata.eventoPrincipal || null,
      funcaoHistorica: metadata.funcaoHistorica || null,
      capituloFilme: metadata.capituloFilme || 'A definir',
      fraseMemoria: metadata.fraseMemoria || '',
      status: metadata.status || 'Entrada (Bruto)',
      historicoStatus: [{
        status: metadata.status || 'Entrada (Bruto)',
        data: new Date().toISOString(),
        responsavel: metadata.responsavel || 'sistema',
        observacao: 'Upload inicial'
      }],
      arquivo: {
        nomeOriginal: metadata.nomeOriginal || fileName,
        nomeSistema: fileName,
        nomeCanonico: fileName.replace(`.${extensao}`, ''),
        tipo: detectarTipoArquivo(extensao),
        formato: extensao,
        tamanhoBytes: metadata.tamanho || 0,
        tamanhoFormatado: formatarTamanho(metadata.tamanho || 0),
        duracao: metadata.duracao || null,
        duracaoFormatada: metadata.duracao ? `${Math.floor(metadata.duracao/60)}:${(metadata.duracao%60).toString().padStart(2,'0')}` : null,
        resolucao: metadata.resolucao || null,
        url: `https://f005.backblazeb2.com/file/${B2_CONFIG.bucketName}/${filePath}`,
        urlThumbnail: `https://f005.backblazeb2.com/file/${B2_CONFIG.bucketName}/${filePath}`,
        checksum: metadata.checksum || '',
        pastaStorage: filePath
      },
      links: {
        drive: metadata.linkDrive || '',
        pastaProjeto: metadata.linkPastaProjeto || '',
        frameio: metadata.linkFrameio || '',
        asana: metadata.linkAsana || '',
        publicacao: ''
      },
      metadadosTecnicos: metadata.exif || {},
      versao: 1
    };
    
    saveCatalogoItem(catalogoItem);
    
    res.json({ success: true, data: catalogoItem });
  } catch (error) {
    console.error('[Upload Complete] Erro:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// ROTAS API - CATÁLOGO
// ============================================

app.get('/api/catalogo', (req, res) => {
  try {
    const { area, nucleoPecuaria, tema, status, search, limit = 100 } = req.query;
    let itens = getAllCatalogo();
    
    if (area) itens = itens.filter(m => m.areaFazenda === area);
    if (nucleoPecuaria) itens = itens.filter(m => m.nucleoPecuaria === nucleoPecuaria);
    if (tema) itens = itens.filter(m => m.temaPrincipal === tema);
    if (status) itens = itens.filter(m => m.status === status);
    if (search) {
      const term = search.toLowerCase();
      itens = itens.filter(m => 
        (m.titulo && m.titulo.toLowerCase().includes(term)) ||
        (m.observacoes && m.observacoes.toLowerCase().includes(term)) ||
        (m.identificador && m.identificador.toLowerCase().includes(term))
      );
    }
    
    itens = itens.slice(0, parseInt(limit));
    
    res.json({ success: true, data: itens, total: itens.length });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/catalogo/:id', (req, res) => {
  try {
    const item = getItemById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, error: 'Item não encontrado' });
    }
    res.json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.patch('/api/catalogo/:id', (req, res) => {
  try {
    const item = getItemById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, error: 'Item não encontrado' });
    }
    
    const updates = req.body;
    delete updates.id;
    delete updates.createdAt;
    
    if (updates.status && updates.status !== item.status) {
      if (!item.historicoStatus) item.historicoStatus = [];
      item.historicoStatus.push({
        status: updates.status,
        data: new Date().toISOString(),
        responsavel: updates.responsavel || 'sistema',
        observacao: updates.observacaoStatus || 'Atualização de status'
      });
    }
    
    const updatedItem = { ...item, ...updates, updatedAt: new Date().toISOString() };
    saveCatalogoItem(updatedItem);
    
    res.json({ success: true, data: updatedItem });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.patch('/api/catalogo/:id/status', (req, res) => {
  try {
    const { status, responsavel, observacao } = req.body;
    const item = getItemById(req.params.id);
    
    if (!item) {
      return res.status(404).json({ success: false, error: 'Item não encontrado' });
    }
    
    if (!item.historicoStatus) item.historicoStatus = [];
    item.historicoStatus.push({
      status,
      data: new Date().toISOString(),
      responsavel: responsavel || 'sistema',
      observacao: observacao || 'Mudança de status'
    });
    
    item.status = status;
    item.updatedAt = new Date().toISOString();
    
    saveCatalogoItem(item);
    
    res.json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// ROTAS API - ESTATÍSTICAS
// ============================================

app.get('/api/estatisticas/geral', (req, res) => {
  try {
    const itens = getAllCatalogo();
    const stats = {
      totalItens: itens.length,
      totalImagens: 0,
      totalVideos: 0,
      porStatus: {},
      porArea: {},
      porTema: {},
      porNucleoPecuaria: {},
      porNucleoAgro: {},
      porTipoProjeto: {},
      porCapitulo: {}
    };
    
    let tamanhoTotal = 0;
    
    itens.forEach(item => {
      if (item.arquivo?.tipo === 'imagem') stats.totalImagens++;
      else if (item.arquivo?.tipo === 'video') stats.totalVideos++;
      
      stats.porStatus[item.status] = (stats.porStatus[item.status] || 0) + 1;
      
      if (item.areaFazenda) {
        stats.porArea[item.areaFazenda] = (stats.porArea[item.areaFazenda] || 0) + 1;
      }
      
      if (item.temaPrincipal) {
        stats.porTema[item.temaPrincipal] = (stats.porTema[item.temaPrincipal] || 0) + 1;
      }
      
      if (item.nucleoPecuaria) {
        stats.porNucleoPecuaria[item.nucleoPecuaria] = (stats.porNucleoPecuaria[item.nucleoPecuaria] || 0) + 1;
      }
      
      if (item.nucleoAgro) {
        stats.porNucleoAgro[item.nucleoAgro] = (stats.porNucleoAgro[item.nucleoAgro] || 0) + 1;
      }
      
      if (item.tipoProjeto) {
        stats.porTipoProjeto[item.tipoProjeto] = (stats.porTipoProjeto[item.tipoProjeto] || 0) + 1;
      }
      
      if (item.capituloFilme) {
        stats.porCapitulo[item.capituloFilme] = (stats.porCapitulo[item.capituloFilme] || 0) + 1;
      }
      
      if (item.arquivo?.tamanhoBytes) {
        tamanhoTotal += item.arquivo.tamanhoBytes;
      }
    });
    
    stats.tamanhoTotalBytes = tamanhoTotal;
    stats.tamanhoTotalFormatado = formatarTamanho(tamanhoTotal);
    
    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// FRONTEND - VERSÃO CORRIGIDA COM TAXONOMIA EMBUTIDA
// ============================================

// Função que gera o HTML com a taxonomia já embutida
function generateHTML() {
  const taxonomiaJSON = JSON.stringify(TAXONOMIA);
  
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>RC Acervo v2.0 - Casa de Memória Digital</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    :root { 
      --rc-dark: #0d2b1f; 
      --rc-green: #1a4d3a; 
      --rc-gold: #d4a574; 
      --rc-cream: #f5f0e6;
      --rc-success: #4ade80;
      --rc-warning: #fbbf24;
      --rc-danger: #ef4444;
    }
    body { 
      font-family: 'Inter', sans-serif; 
      background: var(--rc-dark); 
      color: var(--rc-cream); 
      min-height: 100vh; 
    }
    .container { max-width: 1600px; margin: 0 auto; padding: 20px; }
    
    header { 
      background: rgba(26, 77, 58, 0.5); 
      border-bottom: 1px solid rgba(212, 165, 116, 0.2); 
      padding: 20px 0; 
      margin-bottom: 30px; 
      position: sticky;
      top: 0;
      z-index: 100;
    }
    .header-content { 
      display: flex; 
      align-items: center; 
      justify-content: space-between; 
      max-width: 1600px;
      margin: 0 auto;
      padding: 0 20px;
    }
    .logo { display: flex; align-items: center; gap: 15px; }
    .logo-icon { 
      width: 50px; 
      height: 50px; 
      background: var(--rc-gold); 
      border-radius: 12px; 
      display: flex; 
      align-items: center; 
      justify-content: center; 
      font-size: 24px;
      color: var(--rc-dark);
      font-weight: bold;
    }
    .logo-text h1 { color: var(--rc-gold); font-size: 24px; font-weight: 700; }
    .logo-text p { color: rgba(245, 240, 230, 0.6); font-size: 14px; }
    .server-status { 
      display: flex; 
      align-items: center; 
      gap: 8px; 
      padding: 8px 16px; 
      background: rgba(0, 0, 0, 0.3); 
      border-radius: 20px; 
      font-size: 14px; 
    }
    .status-dot { width: 8px; height: 8px; border-radius: 50%; animation: pulse 2s infinite; }
    .status-online { background: var(--rc-success); }
    .status-offline { background: var(--rc-danger); }
    @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
    
    nav { 
      display: flex; 
      gap: 10px; 
      margin-bottom: 30px;
      flex-wrap: wrap;
    }
    .nav-btn { 
      padding: 12px 24px; 
      background: transparent; 
      border: 1px solid rgba(212, 165, 116, 0.3); 
      border-radius: 8px; 
      color: var(--rc-cream); 
      cursor: pointer; 
      transition: all 0.2s; 
      font-size: 14px; 
    }
    .nav-btn:hover { 
      background: rgba(212, 165, 116, 0.1); 
      border-color: rgba(212, 165, 116, 0.5); 
    }
    .nav-btn.active { 
      background: var(--rc-gold); 
      color: var(--rc-dark); 
      border-color: var(--rc-gold); 
      font-weight: 600; 
    }
    .upload-btn { 
      padding: 12px 24px; 
      background: var(--rc-gold); 
      color: var(--rc-dark); 
      border: none; 
      border-radius: 8px; 
      cursor: pointer; 
      font-weight: 600; 
      transition: all 0.2s; 
      display: flex; 
      align-items: center; 
      gap: 8px; 
    }
    .upload-btn:hover { background: #c49a6a; }
    
    .view { display: none; }
    .view.active { display: block; }
    
    .stats-grid { 
      display: grid; 
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); 
      gap: 20px; 
      margin-bottom: 30px; 
    }
    .stat-card { 
      background: rgba(26, 77, 58, 0.3); 
      border: 1px solid rgba(212, 165, 116, 0.2); 
      border-radius: 12px; 
      padding: 20px;
    }
    .stat-card h3 { font-size: 12px; color: rgba(245, 240, 230, 0.6); margin-bottom: 8px; text-transform: uppercase; }
    .stat-card .value { font-size: 32px; font-weight: 700; color: var(--rc-gold); }
    .stat-card .sublabel { font-size: 12px; color: rgba(245, 240, 230, 0.5); margin-top: 4px; }
    
    .filters { 
      display: flex; 
      flex-wrap: wrap; 
      gap: 15px; 
      margin-bottom: 20px; 
      padding: 20px; 
      background: rgba(26, 77, 58, 0.3); 
      border-radius: 12px; 
    }
    .filter-group { flex: 1; min-width: 200px; }
    .filter-group label { 
      display: block; 
      font-size: 12px; 
      color: rgba(245, 240, 230, 0.6); 
      margin-bottom: 5px; 
    }
    .filter-group select, .filter-group input { 
      width: 100%; 
      padding: 10px 15px; 
      background: var(--rc-dark); 
      border: 1px solid rgba(212, 165, 116, 0.3); 
      border-radius: 8px; 
      color: var(--rc-cream); 
      font-size: 14px; 
    }
    
    .media-grid { 
      display: grid; 
      grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); 
      gap: 20px; 
    }
    .media-card { 
      background: rgba(26, 77, 58, 0.3); 
      border: 1px solid rgba(212, 165, 116, 0.2); 
      border-radius: 12px; 
      overflow: hidden; 
      cursor: pointer; 
    }
    .media-preview { 
      aspect-ratio: 4/3; 
      background: rgba(0, 0, 0, 0.3); 
      display: flex; 
      align-items: center; 
      justify-content: center; 
      position: relative; 
    }
    .media-preview img { width: 100%; height: 100%; object-fit: cover; }
    .media-preview .icon { font-size: 48px; }
    .media-status { 
      position: absolute; 
      top: 10px; 
      left: 10px; 
      padding: 4px 10px; 
      border-radius: 20px; 
      font-size: 10px; 
      font-weight: 600; 
      text-transform: uppercase;
      background: rgba(251, 191, 36, 0.2); 
      color: #fbbf24; 
    }
    .media-info { padding: 15px; }
    .media-info h4 { font-size: 14px; margin-bottom: 5px; }
    .media-info p { font-size: 12px; color: rgba(245, 240, 230, 0.6); }
    
    .modal-overlay { 
      position: fixed; 
      inset: 0; 
      background: rgba(0, 0, 0, 0.85); 
      display: none; 
      align-items: center; 
      justify-content: center; 
      z-index: 1000; 
      padding: 20px;
    }
    .modal-overlay.active { display: flex; }
    .modal { 
      background: var(--rc-dark); 
      border: 1px solid rgba(212, 165, 116, 0.3); 
      border-radius: 16px; 
      width: 100%; 
      max-width: 900px; 
      max-height: 90vh; 
      overflow-y: auto; 
    }
    .modal-header { 
      padding: 20px; 
      border-bottom: 1px solid rgba(212, 165, 116, 0.2); 
      display: flex; 
      justify-content: space-between; 
      align-items: center; 
    }
    .modal-header h2 { color: var(--rc-gold); font-size: 20px; }
    .modal-close { 
      background: none; 
      border: none; 
      color: var(--rc-cream); 
      font-size: 24px; 
      cursor: pointer; 
    }
    .modal-body { padding: 20px; }
    
    .drop-zone { 
      border: 2px dashed rgba(212, 165, 116, 0.4); 
      border-radius: 12px; 
      padding: 40px; 
      text-align: center; 
      margin-bottom: 20px;
      transition: all 0.2s;
    }
    .drop-zone.dragover { 
      border-color: var(--rc-gold); 
      background: rgba(212, 165, 116, 0.1); 
    }
    .drop-zone .icon { font-size: 48px; margin-bottom: 10px; }
    .drop-zone p { color: rgba(245, 240, 230, 0.6); }
    .file-selected { 
      background: rgba(74, 222, 128, 0.1); 
      border-color: var(--rc-success); 
    }
    
    .form-section { 
      margin-bottom: 25px; 
      padding: 20px; 
      background: rgba(26, 77, 58, 0.2); 
      border-radius: 12px; 
    }
    .form-section h3 { 
      color: var(--rc-gold); 
      font-size: 14px; 
      margin-bottom: 15px; 
      text-transform: uppercase; 
    }
    .form-grid { 
      display: grid; 
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); 
      gap: 15px; 
    }
    .form-group { display: flex; flex-direction: column; }
    .form-group.full-width { grid-column: 1 / -1; }
    .form-group label { 
      font-size: 12px; 
      color: rgba(245, 240, 230, 0.6); 
      margin-bottom: 5px; 
    }
    .form-group input, .form-group select, .form-group textarea { 
      padding: 10px 15px; 
      background: var(--rc-dark); 
      border: 1px solid rgba(212, 165, 116, 0.3); 
      border-radius: 8px; 
      color: var(--rc-cream); 
      font-size: 14px; 
    }
    .form-group input:focus, .form-group select:focus, .form-group textarea:focus {
      outline: none;
      border-color: var(--rc-gold);
    }
    
    .form-actions { 
      display: flex; 
      gap: 10px; 
      justify-content: flex-end; 
      padding-top: 20px; 
      border-top: 1px solid rgba(212, 165, 116, 0.2); 
    }
    .btn { 
      padding: 12px 24px; 
      border-radius: 8px; 
      font-size: 14px; 
      font-weight: 600; 
      cursor: pointer; 
      transition: all 0.2s; 
    }
    .btn-primary { 
      background: var(--rc-gold); 
      color: var(--rc-dark); 
      border: none; 
    }
    .btn-primary:hover { background: #c49a6a; }
    .btn-secondary { 
      background: transparent; 
      color: var(--rc-cream); 
      border: 1px solid rgba(212, 165, 116, 0.3); 
    }
    .btn-secondary:hover { background: rgba(212, 165, 116, 0.1); }
    
    .toast { 
      position: fixed; 
      bottom: 20px; 
      right: 20px; 
      padding: 15px 25px; 
      border-radius: 8px; 
      color: white; 
      font-weight: 500; 
      z-index: 2000;
      animation: slideIn 0.3s ease;
    }
    .toast-success { background: var(--rc-success); color: var(--rc-dark); }
    .toast-error { background: var(--rc-danger); }
    @keyframes slideIn { 
      from { transform: translateX(100%); opacity: 0; } 
      to { transform: translateX(0); opacity: 1; } 
    }
    
    .empty-state {
      text-align: center;
      padding: 60px 20px;
      color: rgba(245, 240, 230, 0.5);
    }
    .empty-state .icon {
      font-size: 64px;
      margin-bottom: 20px;
      opacity: 0.5;
    }
  </style>
</head>
<body>
  <header>
    <div class="header-content">
      <div class="logo">
        <div class="logo-icon">RC</div>
        <div class="logo-text">
          <h1>RC Acervo v2.0</h1>
          <p>Casa de Memória Digital</p>
        </div>
      </div>
      <div class="server-status">
        <span class="status-dot" id="statusDot"></span>
        <span id="statusText">Verificando...</span>
      </div>
    </div>
  </header>

  <div class="container">
    <nav>
      <button class="nav-btn active" onclick="showView('dashboard')">Dashboard</button>
      <button class="nav-btn" onclick="showView('catalogo')">Catálogo</button>
      <button class="nav-btn" onclick="showView('estatisticas')">Estatísticas</button>
      <button class="upload-btn" onclick="openUploadModal()">
        <span>+</span> Novo Upload
      </button>
    </nav>

    <div id="dashboardView" class="view active">
      <div class="stats-grid" id="dashboardStats">
        <div class="stat-card">
          <h3>Total de Itens</h3>
          <div class="value">-</div>
        </div>
        <div class="stat-card">
          <h3>Espaço Utilizado</h3>
          <div class="value">-</div>
        </div>
        <div class="stat-card">
          <h3>Catalogados</h3>
          <div class="value">-</div>
        </div>
        <div class="stat-card">
          <h3>Em Produção</h3>
          <div class="value">-</div>
        </div>
      </div>
    </div>

    <div id="catalogoView" class="view">
      <div class="filters">
        <div class="filter-group">
          <label>Área/Fazenda</label>
          <select id="filterArea" onchange="applyFilters()">
            <option value="">Todas</option>
          </select>
        </div>
        <div class="filter-group">
          <label>Núcleo Pecuária</label>
          <select id="filterNucleoPecuaria" onchange="applyFilters()">
            <option value="">Todos</option>
          </select>
        </div>
        <div class="filter-group">
          <label>Tema</label>
          <select id="filterTema" onchange="applyFilters()">
            <option value="">Todos</option>
          </select>
        </div>
        <div class="filter-group">
          <label>Status</label>
          <select id="filterStatus" onchange="applyFilters()">
            <option value="">Todos</option>
          </select>
        </div>
        <div class="filter-group">
          <label>Buscar</label>
          <input type="text" id="filterSearch" placeholder="Título, ID..." oninput="applyFilters()">
        </div>
      </div>
      <div class="media-grid" id="catalogoGrid">
        <div class="empty-state">
          <div class="icon">📁</div>
          <p>Carregando catálogo...</p>
        </div>
      </div>
    </div>

    <div id="estatisticasView" class="view">
      <div class="stats-grid" id="estatisticasDetalhadas">
        <div class="stat-card">
          <h3>Carregando...</h3>
          <div class="value">-</div>
        </div>
      </div>
    </div>
  </div>

  <div class="modal-overlay" id="uploadModal" onclick="closeUploadModalOnOverlay(event)">
    <div class="modal">
      <div class="modal-header">
        <h2>Novo Upload</h2>
        <button class="modal-close" onclick="closeUploadModal()">&times;</button>
      </div>
      <div class="modal-body">
        <form id="uploadForm">
          <div class="drop-zone" id="dropZone">
            <div class="icon">📁</div>
            <p>Arraste arquivos aqui ou clique para selecionar</p>
            <input type="file" id="fileInput" accept="image/*,video/*" style="display:none">
          </div>
          
          <div class="form-section">
            <h3>Informações Básicas</h3>
            <div class="form-grid">
              <div class="form-group">
                <label>Título *</label>
                <input type="text" id="titulo" required placeholder="Nome do arquivo">
              </div>
              <div class="form-group">
                <label>Data de Captação *</label>
                <input type="date" id="dataCaptacao" required>
              </div>
              <div class="form-group">
                <label>Responsável</label>
                <input type="text" id="responsavel" placeholder="Nome do fotógrafo/filmaker">
              </div>
              <div class="form-group">
                <label>Área/Fazenda *</label>
                <select id="areaFazenda" required>
                  <option value="">Selecione...</option>
                </select>
              </div>
              <div class="form-group">
                <label>Ponto de Captação</label>
                <select id="ponto">
                  <option value="">Selecione...</option>
                </select>
              </div>
              <div class="form-group">
                <label>Tipo de Projeto</label>
                <select id="tipoProjeto">
                  <option value="">Selecione...</option>
                </select>
              </div>
            </div>
          </div>
          
          <div class="form-section">
            <h3>Classificação - Pecuária</h3>
            <div class="form-grid">
              <div class="form-group">
                <label>Núcleo Pecuária</label>
                <select id="nucleoPecuaria" onchange="updateSubnucleos('pecuaria')">
                  <option value="">Selecione...</option>
                </select>
              </div>
              <div class="form-group">
                <label>Subnúcleo Pecuária</label>
                <select id="subnucleoPecuaria">
                  <option value="">Selecione...</option>
                </select>
              </div>
            </div>
          </div>
          
          <div class="form-section">
            <h3>Classificação - Agro</h3>
            <div class="form-grid">
              <div class="form-group">
                <label>Núcleo Agro</label>
                <select id="nucleoAgro" onchange="updateSubnucleos('agro')">
                  <option value="">Selecione...</option>
                </select>
              </div>
              <div class="form-group">
                <label>Subnúcleo Agro</label>
                <select id="subnucleoAgro">
                  <option value="">Selecione...</option>
                </select>
              </div>
            </div>
          </div>
          
          <div class="form-section">
            <h3>Temas e Contexto</h3>
            <div class="form-grid">
              <div class="form-group">
                <label>Tema Principal *</label>
                <select id="temaPrincipal" required onchange="updateTemasSecundarios()">
                  <option value="">Selecione...</option>
                </select>
              </div>
              <div class="form-group">
                <label>Tema Secundário</label>
                <select id="temaSecundario">
                  <option value="">Selecione...</option>
                </select>
              </div>
              <div class="form-group">
                <label>Evento Principal</label>
                <select id="eventoPrincipal">
                  <option value="">Selecione...</option>
                </select>
              </div>
              <div class="form-group">
                <label>Função Histórica</label>
                <select id="funcaoHistorica">
                  <option value="">Selecione...</option>
                </select>
              </div>
              <div class="form-group">
                <label>Capítulo do Filme</label>
                <select id="capituloFilme">
                  <option value="A definir">A definir</option>
                </select>
              </div>
              <div class="form-group">
                <label>Status</label>
                <select id="status">
                  <option value="Entrada (Bruto)">Entrada (Bruto)</option>
                </select>
              </div>
            </div>
          </div>
          
          <div class="form-section">
            <h3>Links e Referências</h3>
            <div class="form-grid">
              <div class="form-group">
                <label>Link Drive</label>
                <input type="url" id="linkDrive" placeholder="https://drive.google.com/...">
              </div>
              <div class="form-group">
                <label>Link Frame.io</label>
                <input type="url" id="linkFrameio" placeholder="https://frame.io/...">
              </div>
              <div class="form-group">
                <label>Link Asana</label>
                <input type="url" id="linkAsana" placeholder="https://app.asana.com/...">
              </div>
            </div>
          </div>
          
          <div class="form-section">
            <h3>Observações</h3>
            <div class="form-grid">
              <div class="form-group full-width">
                <textarea id="observacoes" rows="3" placeholder="Informações adicionais sobre o material..."></textarea>
              </div>
            </div>
          </div>
          
          <div class="form-actions">
            <button type="button" class="btn btn-secondary" onclick="closeUploadModal()">Cancelar</button>
            <button type="submit" class="btn btn-primary" id="submitBtn">Catalogar Arquivo</button>
          </div>
        </form>
      </div>
    </div>
  </div>

  <script>
    // TAXONOMIA EMBUTIDA - Carregada imediatamente sem API
    const TAXONOMIA = ${taxonomiaJSON};
    
    let currentFile = null;
    let isUploading = false;
    
    // Inicialização imediata - não depende de API
    document.addEventListener('DOMContentLoaded', () => {
      // Mostrar status online imediatamente
      document.getElementById('statusDot').className = 'status-dot status-online';
      document.getElementById('statusText').textContent = 'Online';
      
      // Popular selects com taxonomia embutida
      populateFilters();
      populateFormSelects();
      
      // Carregar dados
      loadDashboardStats();
      loadCatalogo();
      
      // Setup eventos
      setupDragAndDrop();
      document.getElementById('uploadForm').addEventListener('submit', handleFormSubmit);
      document.getElementById('dataCaptacao').valueAsDate = new Date();
    });
    
    function populateFilters() {
      const areaSelect = document.getElementById('filterArea');
      TAXONOMIA.areasFazendas.forEach(area => {
        areaSelect.innerHTML += '<option value="' + area.nome + '">' + area.nome + '</option>';
      });
      
      const nucleoSelect = document.getElementById('filterNucleoPecuaria');
      Object.keys(TAXONOMIA.nucleosPecuaria).forEach(nucleo => {
        nucleoSelect.innerHTML += '<option value="' + nucleo + '">' + nucleo + '</option>';
      });
      
      const temaSelect = document.getElementById('filterTema');
      TAXONOMIA.temasPrincipais.forEach(tema => {
        temaSelect.innerHTML += '<option value="' + tema + '">' + tema + '</option>';
      });
      
      const statusSelect = document.getElementById('filterStatus');
      TAXONOMIA.status.forEach(status => {
        statusSelect.innerHTML += '<option value="' + status.nome + '">' + status.nome + '</option>';
      });
    }
    
    function populateFormSelects() {
      const areaSelect = document.getElementById('areaFazenda');
      TAXONOMIA.areasFazendas.forEach(area => {
        areaSelect.innerHTML += '<option value="' + area.nome + '">' + area.nome + '</option>';
      });
      
      const pontoSelect = document.getElementById('ponto');
      TAXONOMIA.pontos.forEach(ponto => {
        pontoSelect.innerHTML += '<option value="' + ponto.nome + '">' + ponto.nome + '</option>';
      });
      
      const tipoSelect = document.getElementById('tipoProjeto');
      TAXONOMIA.tiposProjeto.forEach(tipo => {
        tipoSelect.innerHTML += '<option value="' + tipo.nome + '">' + tipo.nome + '</option>';
      });
      
      const nucleoPecSelect = document.getElementById('nucleoPecuaria');
      Object.keys(TAXONOMIA.nucleosPecuaria).forEach(nucleo => {
        nucleoPecSelect.innerHTML += '<option value="' + nucleo + '">' + nucleo + '</option>';
      });
      
      const nucleoAgroSelect = document.getElementById('nucleoAgro');
      Object.keys(TAXONOMIA.nucleosAgro).forEach(nucleo => {
        nucleoAgroSelect.innerHTML += '<option value="' + nucleo + '">' + nucleo + '</option>';
      });
      
      const temaSelect = document.getElementById('temaPrincipal');
      TAXONOMIA.temasPrincipais.forEach(tema => {
        temaSelect.innerHTML += '<option value="' + tema + '">' + tema + '</option>';
      });
      
      const eventoSelect = document.getElementById('eventoPrincipal');
      TAXONOMIA.eventos.forEach(evento => {
        eventoSelect.innerHTML += '<option value="' + evento.nome + '">' + evento.nome + '</option>';
      });
      
      const funcaoSelect = document.getElementById('funcaoHistorica');
      TAXONOMIA.funcoesHistoricas.forEach(funcao => {
        funcaoSelect.innerHTML += '<option value="' + funcao.nome + '">' + funcao.nome + '</option>';
      });
      
      const capSelect = document.getElementById('capituloFilme');
      TAXONOMIA.capitulos.forEach(cap => {
        capSelect.innerHTML += '<option value="' + cap.nome + '">' + cap.nome + '</option>';
      });
    }
    
    function updateSubnucleos(tipo) {
      if (tipo === 'pecuaria') {
        const nucleo = document.getElementById('nucleoPecuaria').value;
        const subSelect = document.getElementById('subnucleoPecuaria');
        subSelect.innerHTML = '<option value="">Selecione...</option>';
        
        if (nucleo && TAXONOMIA.nucleosPecuaria[nucleo]) {
          TAXONOMIA.nucleosPecuaria[nucleo].forEach(sub => {
            subSelect.innerHTML += '<option value="' + sub + '">' + sub + '</option>';
          });
        }
      } else if (tipo === 'agro') {
        const nucleo = document.getElementById('nucleoAgro').value;
        const subSelect = document.getElementById('subnucleoAgro');
        subSelect.innerHTML = '<option value="">Selecione...</option>';
        
        if (nucleo && TAXONOMIA.nucleosAgro[nucleo]) {
          TAXONOMIA.nucleosAgro[nucleo].forEach(sub => {
            subSelect.innerHTML += '<option value="' + sub + '">' + sub + '</option>';
          });
        }
      }
    }
    
    function updateTemasSecundarios() {
      const tema = document.getElementById('temaPrincipal').value;
      const subSelect = document.getElementById('temaSecundario');
      subSelect.innerHTML = '<option value="">Selecione...</option>';
      
      if (tema && TAXONOMIA.temasSecundarios[tema]) {
        TAXONOMIA.temasSecundarios[tema].forEach(sub => {
          subSelect.innerHTML += '<option value="' + sub + '">' + sub + '</option>';
        });
      }
    }
    
    function showView(view) {
      document.querySelectorAll('.view').forEach(v => v.style.display = 'none');
      document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
      
      document.getElementById(view + 'View').style.display = 'block';
      event.target.classList.add('active');
      
      if (view === 'dashboard') loadDashboardStats();
      if (view === 'catalogo') loadCatalogo();
      if (view === 'estatisticas') loadEstatisticas();
    }
    
    async function loadDashboardStats() {
      try {
        const response = await fetch('/api/estatisticas/geral');
        const data = await response.json();
        
        if (data.success) {
          const stats = data.data;
          document.getElementById('dashboardStats').innerHTML = 
            '<div class="stat-card"><h3>Total de Itens</h3><div class="value">' + stats.totalItens + '</div><div class="sublabel">' + stats.totalImagens + ' imagens · ' + stats.totalVideos + ' vídeos</div></div>' +
            '<div class="stat-card"><h3>Espaço Utilizado</h3><div class="value">' + stats.tamanhoTotalFormatado + '</div></div>' +
            '<div class="stat-card"><h3>Catalogados</h3><div class="value">' + (stats.porStatus['Catalogado'] || 0) + '</div></div>' +
            '<div class="stat-card"><h3>Em Produção</h3><div class="value">' + (stats.porStatus['Em produção'] || 0) + '</div></div>';
        }
      } catch (error) {
        console.error('Erro ao carregar estatísticas:', error);
      }
    }
    
    async function loadCatalogo() {
      try {
        const response = await fetch('/api/catalogo');
        const data = await response.json();
        
        if (data.success) renderCatalogo(data.data);
      } catch (error) {
        console.error('Erro ao carregar catálogo:', error);
        document.getElementById('catalogoGrid').innerHTML = 
          '<div class="empty-state"><div class="icon">⚠️</div><p>Erro ao carregar catálogo</p></div>';
      }
    }
    
    function renderCatalogo(itens) {
      const grid = document.getElementById('catalogoGrid');
      
      if (itens.length === 0) {
        grid.innerHTML = '<div class="empty-state"><div class="icon">📁</div><p>Nenhum item no catálogo</p><p style="font-size: 12px; margin-top: 10px;">Clique em "Novo Upload" para adicionar</p></div>';
        return;
      }
      
      grid.innerHTML = itens.map(item => {
        const statusAbrev = { 'Entrada (Bruto)': 'ENT', 'Em triagem': 'TRI', 'Catalogado': 'CAT', 'Selecionado para produção': 'SEL', 'Em produção': 'PRO' }[item.status] || 'ENT';
        
        return '<div class="media-card" onclick="viewItem(\'' + item.id + '\')">' +
          '<div class="media-preview">' +
          (item.arquivo?.tipo === 'imagem' ? '<img src="' + item.arquivo.url + '" alt="' + item.titulo + '" loading="lazy">' : '<div class="icon">🎬</div>') +
          '<span class="media-status">' + statusAbrev + '</span>' +
          '</div>' +
          '<div class="media-info">' +
          '<h4>' + (item.titulo || 'Sem título') + '</h4>' +
          '<p>' + (item.areaFazenda || '-') + ' · ' + (item.temaPrincipal || '-') + '</p>' +
          '</div>' +
          '</div>';
      }).join('');
    }
    
    function applyFilters() {
      loadCatalogo();
    }
    
    function openUploadModal() {
      document.getElementById('uploadModal').classList.add('active');
      document.body.style.overflow = 'hidden';
    }
    
    function closeUploadModal() {
      document.getElementById('uploadModal').classList.remove('active');
      document.body.style.overflow = '';
      document.getElementById('uploadForm').reset();
      document.getElementById('dropZone').classList.remove('file-selected');
      document.getElementById('dropZone').innerHTML = '<div class="icon">📁</div><p>Arraste arquivos aqui ou clique para selecionar</p>';
      currentFile = null;
    }
    
    function closeUploadModalOnOverlay(event) {
      if (event.target === document.getElementById('uploadModal')) {
        closeUploadModal();
      }
    }
    
    function setupDragAndDrop() {
      const dropZone = document.getElementById('dropZone');
      const fileInput = document.getElementById('fileInput');
      
      dropZone.addEventListener('click', () => fileInput.click());
      
      fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
          handleFileSelect(e.target.files[0]);
        }
      });
      
      dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
      });
      
      dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('dragover');
      });
      
      dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        if (e.dataTransfer.files.length > 0) {
          handleFileSelect(e.dataTransfer.files[0]);
        }
      });
    }
    
    function handleFileSelect(file) {
      currentFile = file;
      const dropZone = document.getElementById('dropZone');
      dropZone.classList.add('file-selected');
      dropZone.innerHTML = '<div class="icon">✅</div><p><strong>' + file.name + '</strong></p><p>' + formatFileSize(file.size) + '</p>';
      
      // Preencher título automaticamente
      const tituloInput = document.getElementById('titulo');
      if (!tituloInput.value) {
        tituloInput.value = file.name.replace(/\.[^/.]+$/, '');
      }
    }
    
    function formatFileSize(bytes) {
      if (bytes === 0) return '0 B';
      const k = 1024;
      const sizes = ['B', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    async function handleFormSubmit(e) {
      e.preventDefault();
      
      if (!currentFile) {
        showToast('Selecione um arquivo primeiro', 'error');
        return;
      }
      
      const submitBtn = document.getElementById('submitBtn');
      submitBtn.disabled = true;
      submitBtn.innerHTML = 'Enviando...';
      isUploading = true;
      
      try {
        const metadata = {
          titulo: document.getElementById('titulo').value,
          dataCaptacao: document.getElementById('dataCaptacao').value,
          responsavel: document.getElementById('responsavel').value,
          areaFazenda: document.getElementById('areaFazenda').value,
          ponto: document.getElementById('ponto').value,
          tipoProjeto: document.getElementById('tipoProjeto').value,
          nucleoPecuaria: document.getElementById('nucleoPecuaria').value,
          subnucleoPecuaria: document.getElementById('subnucleoPecuaria').value,
          nucleoAgro: document.getElementById('nucleoAgro').value,
          subnucleoAgro: document.getElementById('subnucleoAgro').value,
          temaPrincipal: document.getElementById('temaPrincipal').value,
          temaSecundario: document.getElementById('temaSecundario').value,
          eventoPrincipal: document.getElementById('eventoPrincipal').value,
          funcaoHistorica: document.getElementById('funcaoHistorica').value,
          capituloFilme: document.getElementById('capituloFilme').value,
          status: document.getElementById('status').value,
          linkDrive: document.getElementById('linkDrive').value,
          linkFrameio: document.getElementById('linkFrameio').value,
          linkAsana: document.getElementById('linkAsana').value,
          observacoes: document.getElementById('observacoes').value,
          nomeOriginal: currentFile.name,
          tamanho: currentFile.size,
          tipo: currentFile.type
        };
        
        const presignedResponse = await fetch('/api/upload/presigned', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            filename: currentFile.name,
            contentType: currentFile.type,
            size: currentFile.size,
            metadata
          })
        });
        
        const presignedData = await presignedResponse.json();
        
        if (!presignedData.success) {
          throw new Error(presignedData.error || 'Erro ao gerar URL de upload');
        }
        
        const uploadResponse = await fetch(presignedData.data.presignedUrl, {
          method: 'POST',
          headers: presignedData.data.headers,
          body: currentFile
        });
        
        if (!uploadResponse.ok) {
          throw new Error('Erro no upload do arquivo');
        }
        
        const completeResponse = await fetch('/api/upload/complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            filePath: presignedData.data.filePath,
            uuid: presignedData.data.uuid,
            metadata
          })
        });
        
        const completeData = await completeResponse.json();
        
        if (completeData.success) {
          showToast('Arquivo catalogado com sucesso!', 'success');
          closeUploadModal();
          loadCatalogo();
          loadDashboardStats();
        } else {
          throw new Error(completeData.error || 'Erro ao confirmar upload');
        }
        
      } catch (error) {
        console.error('Erro no upload:', error);
        showToast('Erro: ' + error.message, 'error');
      } finally {
        isUploading = false;
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Catalogar Arquivo';
      }
    }
    
    function showToast(message, type) {
      const toast = document.createElement('div');
      toast.className = 'toast toast-' + type;
      toast.textContent = message;
      document.body.appendChild(toast);
      
      setTimeout(() => {
        toast.remove();
      }, 4000);
    }
    
    function viewItem(id) {
      console.log('View item:', id);
    }
    
    async function loadEstatisticas() {
      try {
        const response = await fetch('/api/estatisticas/geral');
        const data = await response.json();
        
        if (data.success) {
          const stats = data.data;
          let html = '';
          
          html += '<div class="stat-card"><h3>Total de Itens</h3><div class="value">' + stats.totalItens + '</div></div>';
          html += '<div class="stat-card"><h3>Imagens</h3><div class="value">' + stats.totalImagens + '</div></div>';
          html += '<div class="stat-card"><h3>Vídeos</h3><div class="value">' + stats.totalVideos + '</div></div>';
          html += '<div class="stat-card"><h3>Espaço Total</h3><div class="value">' + stats.tamanhoTotalFormatado + '</div></div>';
          
          document.getElementById('estatisticasDetalhadas').innerHTML = html;
        }
      } catch (error) {
        console.error('Erro ao carregar estatísticas:', error);
      }
    }
  </script>
</body>
</html>`;
}

// ============================================
// ROTA PRINCIPAL - SERVIR FRONTEND COM TAXONOMIA EMBUTIDA
// ============================================

app.get('/', (req, res) => {
  res.send(generateHTML());
});

// ============================================
// INICIAR SERVIDOR
// ============================================

app.listen(PORT, () => {
  console.log('='.repeat(60));
  console.log('  RC ACERVO v2.0 - Casa de Memória Digital');
  console.log('  RC Agropecuária');
  console.log('  VERSÃO CORRIGIDA - Taxonomia Embutida');
  console.log('='.repeat(60));
  console.log(`  Servidor rodando na porta ${PORT}`);
  console.log(`  Ambiente: ${process.env.NODE_ENV || 'development'}`);
  console.log('');
  console.log('  Taxonomia carregada:');
  console.log(`    - ${TAXONOMIA.areasFazendas.length} Áreas/Fazendas`);
  console.log(`    - ${TAXONOMIA.pontos.length} Pontos`);
  console.log(`    - ${TAXONOMIA.tiposProjeto.length} Tipos de Projeto`);
  console.log(`    - ${Object.keys(TAXONOMIA.nucleosPecuaria).length} Núcleos Pecuária`);
  console.log(`    - ${Object.keys(TAXONOMIA.nucleosAgro).length} Núcleos Agro`);
  console.log(`    - ${TAXONOMIA.temasPrincipais.length} Temas Principais`);
  console.log(`    - ${Object.keys(TAXONOMIA.temasSecundarios).length} Temas Secundários`);
  console.log(`    - ${TAXONOMIA.eventos.length} Eventos`);
  console.log(`    - ${TAXONOMIA.funcoesHistoricas.length} Funções Históricas`);
  console.log(`    - ${TAXONOMIA.status.length} Status`);
  console.log(`    - ${TAXONOMIA.capitulos.length} Capítulos`);
  console.log('='.repeat(60));
});
