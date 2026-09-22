import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';

const HISTORY_KEY = 'gymvance_historico';
const PLAN_KEY = 'gymvance_plano_ativo';
const USER_PROFILE_KEY = 'gymvance_usuario';
const PROGRESS_PHOTOS_KEY = 'gymvance_fotos_progresso';
const LANGUAGE_KEY = 'gymvance_idioma';
const SESSION_KEY = 'gymvance_sessao';
const ONBOARDING_KEY = 'gymvance_onboarding';
const CONTAS_KEY = 'gymvance_contas';

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
  if (!uri || !FileSystem.documentDirectory) {
    return uri;
  }

  if (uri.startsWith(FileSystem.documentDirectory)) {
    return uri;
  }

  const diretorio = `${FileSystem.documentDirectory}progresso/`;
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`;

  try {
    await FileSystem.makeDirectoryAsync(diretorio, { intermediates: true });
    const destinationUri = `${diretorio}${fileName}`;
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
    const parsed = safeJsonParse(raw, []);
    return Array.isArray(parsed) ? parsed : [];
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
    throw error;
  }
}

export async function saveSelectedPlan(planName) {
  try {
    await AsyncStorage.setItem(PLAN_KEY, planName);
  } catch (error) {
    console.warn('Erro ao salvar plano:', error);
    throw error;
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

export async function getLanguage() {
  try {
    const valor = await AsyncStorage.getItem(LANGUAGE_KEY);
    return valor === 'en' ? 'en' : 'pt';
  } catch (error) {
    console.warn('Erro ao ler idioma:', error);
    return 'pt';
  }
}

export async function setLanguage(idioma) {
  try {
    await AsyncStorage.setItem(LANGUAGE_KEY, idioma === 'en' ? 'en' : 'pt');
  } catch (error) {
    console.warn('Erro ao salvar idioma:', error);
  }
}

// ---------------------------------------------------------------------------
// Autenticação local (sem backend).
// A separação é proposital: sessão, onboarding e perfil são estados distintos.
// ---------------------------------------------------------------------------

function normalizarEmail(email) {
  return String(email || '').trim().toLowerCase();
}

export async function saveAccount({ email, senha }) {
  const chave = normalizarEmail(email);
  if (!chave || !senha) {
    throw new Error('E-mail e senha são obrigatórios.');
  }

  const contas = await getContas();
  contas[chave] = { senha };
  await AsyncStorage.setItem(CONTAS_KEY, JSON.stringify(contas));
  return contas;
}

export async function getContas() {
  try {
    const raw = await AsyncStorage.getItem(CONTAS_KEY);
    const parsed = safeJsonParse(raw, {});
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch (error) {
    console.warn('Erro ao ler contas locais:', error);
    return {};
  }
}

export async function accountExists(email) {
  const contas = await getContas();
  return Boolean(contas[normalizarEmail(email)]);
}

export async function authenticateUser(email, senha) {
  const contas = await getContas();
  const conta = contas[normalizarEmail(email)];
  return Boolean(conta && conta.senha === senha);
}

export async function createSession(email) {
  const sessao = {
    email: String(email || '').trim(),
    criadaEm: new Date().toISOString(),
  };
  await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(sessao));
  return sessao;
}

export async function getSession() {
  try {
    const raw = await AsyncStorage.getItem(SESSION_KEY);
    const parsed = safeJsonParse(raw, null);
    return parsed && typeof parsed === 'object' && typeof parsed.email === 'string' ? parsed : null;
  } catch (error) {
    console.warn('Erro ao ler sessão:', error);
    return null;
  }
}

export async function removeSession() {
  try {
    await AsyncStorage.removeItem(SESSION_KEY);
  } catch (error) {
    console.warn('Erro ao remover sessão:', error);
  }
}

// Logout preserva perfil e dados do usuário; remove apenas a autenticação.
export async function logout() {
  await removeSession();
}

export async function setOnboardingComplete(valor) {
  try {
    await AsyncStorage.setItem(ONBOARDING_KEY, JSON.stringify(Boolean(valor)));
  } catch (error) {
    console.warn('Erro ao salvar onboarding:', error);
  }
}

export async function getOnboardingComplete() {
  try {
    const raw = await AsyncStorage.getItem(ONBOARDING_KEY);
    return safeJsonParse(raw, false) === true;
  } catch (error) {
    console.warn('Erro ao ler onboarding:', error);
    return false;
  }
}

// Migração conservadora para usuários anteriores às chaves de sessão/onboarding.
// - Detecta: gymvance_usuario com nome, sem gymvance_sessao e sem gymvance_onboarding.
// - Preserva: perfil, histórico, plano, fotos e idioma (nada é apagado).
// - Cria: sessão e flag de onboarding, para que o usuário legado continue com acesso.
export async function migrarUsuarioLegado() {
  try {
    const sessao = await getSession();
    if (sessao) {
      return { sessaoCriada: false, onboardingCriado: false, migrado: false };
    }

    const perfil = await getUserProfile();
    const nome = String(perfil?.nome || '').trim();
    if (!nome) {
      return { sessaoCriada: false, onboardingCriado: false, migrado: false };
    }

    const email = String(perfil?.email || '').trim()
      || `legado.${nome.replace(/\s+/g, '.').toLowerCase()}`;

    await createSession(email);
    await setOnboardingComplete(true);

    return { sessaoCriada: true, onboardingCriado: true, migrado: true };
  } catch (error) {
    console.warn('Erro ao migrar usuário legado:', error);
    return { sessaoCriada: false, onboardingCriado: false, migrado: false };
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
    throw error;
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

async function apagarArquivosFotos(fotos) {
  if (!FileSystem.documentDirectory || !Array.isArray(fotos)) {
    return;
  }

  for (const foto of fotos) {
    const uri = foto?.uri;
    if (!uri || !uri.startsWith('file://')) {
      continue;
    }

    try {
      const info = await FileSystem.getInfoAsync(uri);
      if (info.exists) {
        await FileSystem.deleteAsync(uri, { idempotent: true });
      }
    } catch (error) {
      console.warn('Erro ao excluir foto de progresso:', error);
    }
  }
}

export async function getProgressPhotos() {
  try {
    const raw = await AsyncStorage.getItem(PROGRESS_PHOTOS_KEY);
    const parsed = safeJsonParse(raw, []);
    return Array.isArray(parsed) ? parsed : [];
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

    await apagarArquivosFotos(current.filter((f) => !next.some((n) => n.uri === f.uri)));
    await AsyncStorage.setItem(PROGRESS_PHOTOS_KEY, JSON.stringify(next));
    return next;
  } catch (error) {
    console.warn('Erro ao salvar foto de progresso:', error);
    throw error;
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
