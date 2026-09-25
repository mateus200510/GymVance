// Fonte única de dados demonstrativos do GymVance.
//
// REGRA FUNDAMENTAL: estes valores são FICTÍCIOS e existem apenas para a
// interface não parecer vazia durante desenvolvimento/apresentação.
// - Nunca são gravados no AsyncStorage (nenhuma chave real é alterada).
// - Nunca são apresentados como medição real, refeição registrada, histórico
//   real, peso real ou dado médico.
// - As telas que os usam DEVEM exibi-los junto de um selo identificável
//   ("Dados de demonstração" / "Demo data").
//
// MODO_DEMONSTRACAO liga/desliga a visualização demonstrativa globalmente.
// Valores 100% constantes (sem Math.random): a mesma sessão sempre mostra o
// mesmo conteúdo demonstrativo.

export const MODO_DEMONSTRACAO = true;

// ---------------------------------------------------------------------------
// Alimentação (demonstração)
// ---------------------------------------------------------------------------

// Meta diária demonstrativa usada quando o perfil ainda não tem kcalMeta.
export const DEMO_META_KCAL = 2500;

// Nomes dos alimentos em PT/EN. Os nomes das refeições usam chaves de i18n
// (alimentacao.meal.*) para respeitar o idioma selecionado.
const ALIMENTOS_DEMO = {
  ovos: { pt: 'Ovos mexidos', en: 'Scrambled eggs' },
  pao: { pt: 'Pão integral', en: 'Whole wheat bread' },
  banana: { pt: 'Banana', en: 'Banana' },
  cafe: { pt: 'Café preto', en: 'Black coffee' },
  arroz: { pt: 'Arroz', en: 'White rice' },
  feijao: { pt: 'Feijão', en: 'Beans' },
  frango: { pt: 'Frango grelhado', en: 'Grilled chicken' },
  salada: { pt: 'Salada verde', en: 'Green salad' },
  iogurte: { pt: 'Iogurte natural', en: 'Plain yogurt' },
  castanhas: { pt: 'Castanhas', en: 'Nuts' },
  arrozIntegral: { pt: 'Arroz integral', en: 'Brown rice' },
  carne: { pt: 'Carne magra', en: 'Lean meat' },
  legumes: { pt: 'Legumes no vapor', en: 'Steamed vegetables' },
  omelete: { pt: 'Omelete de claras', en: 'Egg-white omelet' },
  whey: { pt: 'Whey protein', en: 'Whey protein' },
};

const REFEICOES_DEMO = [
  {
    id: 'demo-cafe-manha',
    nomeKey: 'alimentacao.meal.cafeDaManha',
    itens: ['ovos', 'pao', 'banana', 'cafe'],
    kcal: 450,
    macros: { proteinas: 30, carboidratos: 50, gorduras: 14 },
  },
  {
    id: 'demo-almoco',
    nomeKey: 'alimentacao.meal.almoco',
    itens: ['arroz', 'feijao', 'frango', 'salada'],
    kcal: 750,
    macros: { proteinas: 48, carboidratos: 90, gorduras: 22 },
  },
  {
    id: 'demo-lanche',
    nomeKey: 'alimentacao.meal.lanche',
    itens: ['iogurte', 'castanhas', 'banana'],
    kcal: 300,
    macros: { proteinas: 18, carboidratos: 30, gorduras: 12 },
  },
  {
    id: 'demo-jantar',
    nomeKey: 'alimentacao.meal.jantar',
    itens: ['arrozIntegral', 'carne', 'legumes'],
    kcal: 650,
    macros: { proteinas: 48, carboidratos: 70, gorduras: 18 },
  },
  {
    id: 'demo-ceia',
    nomeKey: 'alimentacao.meal.ceia',
    itens: ['omelete', 'whey'],
    kcal: 200,
    macros: { proteinas: 22, carboidratos: 12, gorduras: 8 },
  },
];

// Retorna as refeições demonstrativas com o idioma aplicado aos alimentos.
// O `nomeKey` deve ser traduzido pela tela via t(nomeKey).
export function getDemoRefeicoes(idioma) {
  const lang = idioma === 'en' ? 'en' : 'pt';
  return REFEICOES_DEMO.map((refeicao) => ({
    id: refeicao.id,
    nomeKey: refeicao.nomeKey,
    descricao: refeicao.itens.map((item) => ALIMENTOS_DEMO[item]?.[lang] || item).join(', '),
    kcal: refeicao.kcal,
    macros: { ...refeicao.macros },
  }));
}

// Totais diários demonstrativos (soma coerente das refeições acima).
export function getDemoTotais(idioma) {
  const refeicoes = getDemoRefeicoes(idioma);
  const totais = { kcal: 0, proteinas: 0, carboidratos: 0, gorduras: 0 };
  for (const refeicao of refeicoes) {
    totais.kcal += refeicao.kcal;
    totais.proteinas += refeicao.macros.proteinas;
    totais.carboidratos += refeicao.macros.carboidratos;
    totais.gorduras += refeicao.macros.gorduras;
  }
  return totais;
}

// ---------------------------------------------------------------------------
// Relógio — Calorias (demonstração)
// ---------------------------------------------------------------------------
export const DEMO_CALORIAS = {
  queimadas: 347,
  meta: 500,
  bpmAtual: 78,
  // Últimos 7 dias (do mais antigo para hoje).
  historico: [420, 380, 510, 290, 460, 347, 300],
};

// ---------------------------------------------------------------------------
// Relógio — Batimentos (demonstração)
// ---------------------------------------------------------------------------
export const DEMO_BATIMENTOS = {
  atual: 78,
  minimo: 62,
  maximo: 142,
  media: 86,
  // Leituras demonstrativas recentes (do mais antigo para o mais recente).
  historico: [72, 74, 78, 76, 80, 77, 75, 79, 82, 78, 80, 76],
};