import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';

const HISTORY_KEY = 'gymvance_historico';
const PLAN_KEY = 'gymvance_plano_ativo';
const USER_PROFILE_KEY = 'gymvance_usuario';
const PROGRESS_PHOTOS_KEY = 'gymvance_fotos_progresso';

function safeJsonParse(raw, fallback) {
  if (!raw) {
    return fallback;
  }

  try {
    return JSON.parse(raw);
  } catch (error) {
    console.warn('Erro ao ler JSON do armazenamento local:', error);
    return fallback;
  }
}

export function normalizarDataNascimento(value) {
  if (!value) {
    return null;
  }

  if (typeof value === 'string') {
    const soDigitos = value.replace(/\D/g, '');

    if (/^\d{8}$/.test(soDigitos)) {
      const dia = soDigitos.slice(0, 2);
      const mes = soDigitos.slice(2, 4);
      const ano = soDigitos.slice(4, 8);
      return `${ano}-${mes}-${dia}`;
    }

    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      return value;
    }

    if (/^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
      const [dia, mes, ano] = value.split('/');
      return `${ano}-${mes}-${dia}`;
    }
  }

  return null;
}

export function formatarDataNascimento(value) {
  const iso = normalizarDataNascimento(value);
  if (!iso) {
    return '';
  }

  const [ano, mes, dia] = iso.split('-');
  if (!ano || !mes || !dia) {
    return '';
  }

  return `${dia}/${mes}/${ano}`;
}

export function getNomeUsuarioPadrao(perfil = {}) {
  const nome = String(perfil?.nome || '').trim();
  return nome || 'Usuário';
}

async function ensureFileSystemUri(uri) {
  if (!uri) {
    return uri;
  }

  if (uri.startsWith('file://')) {
    const info = await FileSystem.getInfoAsync(uri);
    if (info.exists) {
      return uri;
    }
  }

  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`;
  const destinationUri = `${FileSystem.documentDirectory}${fileName}`;

  try {
    await FileSystem.copyAsync({
      from: uri,
      to: destinationUri,
    });
    return destinationUri;
  } catch (error) {
    console.warn('Erro ao persistir imagem no armazenamento do app:', error);
    return uri;
  }
}

export async function getWorkoutHistory() {
  try {
    const raw = await AsyncStorage.getItem(HISTORY_KEY);
    return safeJsonParse(raw, []);
  } catch (error) {
    console.warn('Erro ao recuperar histórico:', error);
    return [];
  }
}

export async function saveWorkoutHistory(workout) {
  try {
    const current = await getWorkoutHistory();
    const next = [workout, ...current].slice(0, 20);
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(next));
    return next;
  } catch (error) {
    console.warn('Erro ao salvar histórico:', error);
    return [];
  }
}

export async function saveSelectedPlan(planName) {
  try {
    await AsyncStorage.setItem(PLAN_KEY, planName);
  } catch (error) {
    console.warn('Erro ao salvar plano:', error);
  }
}

export async function getSelectedPlan() {
  try {
    return await AsyncStorage.getItem(PLAN_KEY);
  } catch (error) {
    console.warn('Erro ao ler plano:', error);
    return null;
  }
}

export async function saveUserProfile(profile) {
  try {
    const current = await getUserProfile();
    const next = { ...current, ...profile };

    if (profile?.dataNascimento || current?.dataNascimento) {
      const dataIso = normalizarDataNascimento(profile?.dataNascimento ?? current?.dataNascimento);
      if (dataIso) {
        next.dataNascimento = dataIso;
      }
    }

    if (profile?.nome !== undefined) {
      next.nome = String(profile.nome).trim();
    }

    if (profile?.email !== undefined) {
      next.email = String(profile.email).trim();
    }

    await AsyncStorage.setItem(USER_PROFILE_KEY, JSON.stringify(next));
    return next;
  } catch (error) {
    console.warn('Erro ao salvar perfil do usuário:', error);
    return null;
  }
}

export async function getUserProfile() {
  try {
    const raw = await AsyncStorage.getItem(USER_PROFILE_KEY);
    const perfil = safeJsonParse(raw, {});

    if (!perfil || typeof perfil !== 'object') {
      return {};
    }

    const dataNascimento = normalizarDataNascimento(perfil.dataNascimento || perfil.data || null);
    if (dataNascimento) {
      perfil.dataNascimento = dataNascimento;
    }

    return perfil;
  } catch (error) {
    console.warn('Erro ao ler perfil do usuário:', error);
    return {};
  }
}

export async function getProgressPhotos() {
  try {
    const raw = await AsyncStorage.getItem(PROGRESS_PHOTOS_KEY);
    return safeJsonParse(raw, []);
  } catch (error) {
    console.warn('Erro ao recuperar fotos de progresso:', error);
    return [];
  }
}

export async function saveProgressPhoto(uri, metadata = {}) {
  try {
    const normalizedUri = await ensureFileSystemUri(uri);
    const current = await getProgressPhotos();
    const next = [{
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      uri: normalizedUri,
      data: new Date().toISOString(),
      ...metadata,
    }, ...current].slice(0, 30);

    await AsyncStorage.setItem(PROGRESS_PHOTOS_KEY, JSON.stringify(next));
    return next;
  } catch (error) {
    console.warn('Erro ao salvar foto de progresso:', error);
    return [];
  }
}

export async function addProgressPhoto(photo) {
  try {
    const current = await getProgressPhotos();
    const next = [{
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      data: new Date().toISOString(),
      ...photo,
    }, ...current].slice(0, 30);

    await AsyncStorage.setItem(PROGRESS_PHOTOS_KEY, JSON.stringify(next));
    return next;
  } catch (error) {
    console.warn('Erro ao salvar foto de progresso:', error);
    return [];
  }
}

export async function setProgressPhotos(photos) {
  try {
    const lista = photos || [];
    await AsyncStorage.setItem(PROGRESS_PHOTOS_KEY, JSON.stringify(lista));
    return lista;
  } catch (error) {
    console.warn('Erro ao atualizar fotos de progresso:', error);
    return [];
  }
}

export async function clearProgressPhotos() {
  try {
    await AsyncStorage.removeItem(PROGRESS_PHOTOS_KEY);
    return [];
  } catch (error) {
    console.warn('Erro ao limpar fotos de progresso:', error);
    return [];
  }
}
