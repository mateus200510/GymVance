// Modelo de séries do GymVance.
//
// Fonte única da verdade sobre séries: usada pela criação de sessão (NovaSessao),
// pela execução do treino (SessaoAtiva) e pelo histórico. Não duplicar em telas.
//
// O identificador persistido da série é `tipo`; o rótulo e o idioma só afetam a apresentação.
// A identidade estável de cada série é `id`, nunca o índice do array, para que
// editar/remover/reordenar não afete as séries vizinhas.

export const TIPO_PADRAO = 'NORMAL';

export const TIPOS_SERIE = [
  { tipo: 'NORMAL', sigla: '#' },
  { tipo: 'AQUECIMENTO', sigla: 'A' },
  { tipo: 'PREPARATORIA', sigla: 'P' },
  { tipo: 'RECONHECIMENTO', sigla: 'R' },
  { tipo: 'BACK_OFF', sigla: 'B' },
  { tipo: 'DROPSET', sigla: 'D' },
  { tipo: 'FALHA', sigla: 'F' },
];

// Mesmo padrão de id já usado em storage.js para fotos e exercícios personalizados.
export function gerarIdSerie() {
  return `serie-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function tipoDe(serie) {
  return serie?.tipo || TIPO_PADRAO;
}

export function infoTipo(tipo) {
  return TIPOS_SERIE.find((t) => t.tipo === tipo) || TIPOS_SERIE[0];
}

// Cria uma série vazia. `id` é opcional para quem já gerencia ids próprios.
export function criarSerie(tipo = TIPO_PADRAO, id = gerarIdSerie()) {
  return {
    id,
    tipo,
    kg: '',
    reps: '',
    concluido: false,
    falhou: false,
    nota: '',
  };
}

// Número visual: somente as séries NORMAL contam, na ordem em que aparecem no exercício.
export function numeroNormalDaSerie(series, serie) {
  let count = 0;
  for (const s of series || []) {
    if (s?.id === serie?.id) {
      return count + 1;
    }
    if (tipoDe(s) === TIPO_PADRAO) {
      count += 1;
    }
  }
  return count + 1;
}

export function rotuloDaSerie(series, serie) {
  if (tipoDe(serie) === TIPO_PADRAO) {
    return String(numeroNormalDaSerie(series, serie));
  }
  return infoTipo(tipoDe(serie)).sigla;
}

// Compatibilidade com sessões/exercícios antigos: garante `series` como array,
// ids estáveis e tipo válido, sem apagar nem reinventar os dados já persistidos.
export function normalizarSeries(series) {
  if (!Array.isArray(series)) {
    return [];
  }

  return series.map((s) => {
    const base = s && typeof s === 'object' ? s : {};
    return {
      ...criarSerie(),
      ...base,
      id: base.id ?? gerarIdSerie(),
      tipo: tipoDe(base),
    };
  });
}
