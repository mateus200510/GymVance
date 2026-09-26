// demo.js - REMOVIDO: Dados de demonstração/fictícios
// 
// Este arquivo existia para fornecer dados fictícios (mock) durante desenvolvimento.
// Conforme a auditoria do GymVance, TODOS os dados fictícios foram removidos.
// 
// O aplicativo agora exibe apenas dados reais do usuário ou estados vazios apropriados.

export const MODO_DEMONSTRACAO = false;

export const DEMO_META_KCAL = null;

export function getDemoRefeicoes() {
  return [];
}

export function getDemoTotais() {
  return { kcal: 0, proteinas: 0, carboidratos: 0, gorduras: 0 };
}

export const DEMO_CALORIAS = {
  queimadas: null,
  meta: null,
  bpmAtual: null,
  historico: [],
};

export const DEMO_BATIMENTOS = {
  atual: null,
  minimo: null,
  maximo: null,
  media: null,
  historico: [],
};