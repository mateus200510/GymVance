// Camada de preparação para API/banco.
// As funções abaixo retornam null (ausência de dados) até o backend da Gymvance existir.
// Quando o backend da Gymvance existir, substitua apenas estas implementações.
import { getUserProfile } from './storage';

// TODO(api): substituir pela chamada real quando o backend existir.
export async function getKcalQueimadas() {
  return null;
}

// TODO(api): substituir pela chamada real quando o backend existir.
export async function getKcalMeta() {
  const perfil = await getUserProfile();
  const meta = Number(perfil?.kcalMeta);
  return Number.isFinite(meta) && meta > 0 ? meta : null;
}

// TODO(api): substituir pela leitura de BPM do dispositivo/API.
export async function getBpmAtual() {
  const perfil = await getUserProfile();
  const bpm = Number(perfil?.bpmBase);
  return Number.isFinite(bpm) && bpm > 0 ? bpm : null;
}