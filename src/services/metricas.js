// Camada de preparação para API/banco.
// As funções abaixo são o único ponto onde os dados "simulados" vivem.
// Quando o backend da Gymvance existir, substitua apenas estas implementações.
import { getWorkoutHistory, getUserProfile } from './storage';

export const KCAL_POR_SESSAO = 455;
export const KCAL_META_PADRAO = 2500;
export const BPM_PADRAO = 70;

async function getSessoesDeHoje() {
  const historico = await getWorkoutHistory();
  const hoje = new Date().toDateString();

  return (historico || []).filter((treino) => {
    if (!treino?.data) {
      return false;
    }

    const data = new Date(treino.data);
    return !Number.isNaN(data.getTime()) && data.toDateString() === hoje;
  });
}

// TODO(api): substituir pela chamada real quando o backend existir.
export async function getKcalQueimadas() {
  const sessoes = await getSessoesDeHoje();
  return sessoes.length * KCAL_POR_SESSAO;
}

// TODO(api): substituir pela chamada real quando o backend existir.
export async function getKcalMeta() {
  const perfil = await getUserProfile();
  return Number(perfil?.kcalMeta) || KCAL_META_PADRAO;
}

// TODO(api): substituir pela leitura de BPM do dispositivo/API.
export async function getBpmAtual() {
  const perfil = await getUserProfile();
  return Number(perfil?.bpmBase) || BPM_PADRAO;
}

// TODO(api): substituir pelo ranking real da academia.
export function getDadosRankingSimulado(nomeUsuario) {
  return [
    { posicao: 1, nome: 'Renata A.', treinos: 24, dias: 24, voce: false },
    { posicao: 2, nome: 'Gabriel S.', treinos: 18, dias: 18, voce: false },
    { posicao: 3, nome: 'Thiago M.', treinos: 15, dias: 15, voce: false },
    { posicao: 4, nome: 'Felipe Neto', treinos: 14, dias: 12, voce: false },
    { posicao: 5, nome: 'Beatriz Sou', treinos: 11, dias: 9, voce: false },
    { posicao: 6, nome: 'Carlos Ed', treinos: 10, dias: 7, voce: false },
    { posicao: 7, nome: nomeUsuario, treinos: 8, dias: 5, voce: true },
  ];
}