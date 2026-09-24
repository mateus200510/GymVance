// Camada de métricas 100% local (sem API/backend/banco).
// As funções leem apenas dados salvos no próprio dispositivo (perfil do usuário).
import { getUserProfile } from './storage';

// Métrica sem fonte local configurada; retorna null (ausência de dados).
export async function getKcalQueimadas() {
  return null;
}

// Meta diária de calorias configurada no perfil (salva localmente).
export async function getKcalMeta() {
  const perfil = await getUserProfile();
  const meta = Number(perfil?.kcalMeta);
  return Number.isFinite(meta) && meta > 0 ? meta : null;
}

// BPM base do perfil (salvo localmente). Não há leitura de sensor/API.
export async function getBpmAtual() {
  const perfil = await getUserProfile();
  const bpm = Number(perfil?.bpmBase);
  return Number.isFinite(bpm) && bpm > 0 ? bpm : null;
}