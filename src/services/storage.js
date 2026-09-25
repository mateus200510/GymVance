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
const EXERCISES_CUSTOM_KEY = 'gymvance_exercicios_custom';
const ACTIVE_SESSION_KEY = 'gymvance_sessao_ativa';

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

// Constroi uma data civil válida a partir dos componentes ano/mês/dia.
// Usa `new Date(ano, mes - 1, dia)` (Date local, sem string/timezone), que
// nunca sofre deslocamento UTC ↔ local nem depende do parser do motor JS.
// A validação também protege contra o caso especial de anos 0–99 do JS.
function montarDataCivil(ano, mes, dia) {
  if (!Number.isInteger(ano) || !Number.isInteger(mes) || !Number.isInteger(dia)) {
    return null;
  }

  const data = new Date(ano, mes - 1, dia);
  if (
    data.getFullYear() !== ano ||
    data.getMonth() !== mes - 1 ||
    data.getDate() !== dia
  ) {
    return null;
  }

  return `${String(ano).padStart(4, '0')}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
}

// Normaliza a data de nascimento para o formato canônico YYYY-MM-DD.
// A ordem dos formatos é importante e idempotente:
// 1. formatos explícitos (ISO e DD/MM/YYYY) primeiro — nunca são reinterpretados;
// 2. somente depois o formato "puro" de 8 dígitos (legado DDMMYYYY).
// Antes, o bloco de 8 dígitos rodava primeiro sobre os dígitos de qualquer
// string, corrompendo datas ISO já válidas (ex.: "2010-05-20" → "0520-10-20").
export function normalizarDataNascimento(value) {
  if (!value || typeof value !== 'string') {
    return null;
  }

  const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (iso) {
    return montarDataCivil(
      Number(iso[1]),
      Number(iso[2]),
      Number(iso[3])
    );
  }

  const br = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value);
  if (br) {
    return montarDataCivil(
      Number(br[3]),
      Number(br[2]),
      Number(br[1])
    );
  }

  if (/^\d{8}$/.test(value)) {
    return montarDataCivil(
      Number(value.slice(4, 8)),
      Number(value.slice(2, 4)),
      Number(value.slice(0, 2))
    );
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

// ---------------------------------------------------------------------------
// Sessão de treino em andamento (autosave).
// Permite recuperar o treino quando o app é fechado/reaberto no meio de uma
// sessão. A sessão é limpa ao concluir ou descartar.
// ---------------------------------------------------------------------------
export async function saveActiveSession(sessao) {
  try {
    await AsyncStorage.setItem(ACTIVE_SESSION_KEY, JSON.stringify(sessao || {}));
  } catch (error) {
    console.warn('Erro ao salvar sessão em andamento:', error);
  }
}

export async function getActiveSession() {
  try {
    const raw = await AsyncStorage.getItem(ACTIVE_SESSION_KEY);
    const parsed = safeJsonParse(raw, null);
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch (error) {
    console.warn('Erro ao ler sessão em andamento:', error);
    return null;
  }
}

export async function clearActiveSession() {
  try {
    await AsyncStorage.removeItem(ACTIVE_SESSION_KEY);
  } catch (error) {
    console.warn('Erro ao remover sessão em andamento:', error);
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
// - Cria: sessão e flag de onboarding apenas se houver email real no perfil.
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

    const email = String(perfil?.email || '').trim();
    if (!email) {
      return { sessaoCriada: false, onboardingCriado: false, migrado: false, motivo: 'sem_email' };
    }

    await createSession(email);

    const onboardingCompleto = Boolean(
      perfil?.peso &&
      perfil?.altura &&
      perfil?.nome &&
      perfil?.genero &&
      perfil?.dataNascimento
    );

    if (onboardingCompleto) {
      await setOnboardingComplete(true);
      return { sessaoCriada: true, onboardingCriado: true, migrado: true };
    }

    return { sessaoCriada: true, onboardingCriado: false, migrado: true };
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

export async function deleteProgressPhoto(id) {
  try {
    const current = await getProgressPhotos();
    const removidas = current.filter((foto) => foto?.id === id);
    const next = current.filter((foto) => foto?.id !== id);
    await apagarArquivosFotos(removidas);
    await AsyncStorage.setItem(PROGRESS_PHOTOS_KEY, JSON.stringify(next));
    return next;
  } catch (error) {
    console.warn('Erro ao excluir foto de progresso:', error);
    throw error;
  }
}

// Tradução para o inglês dos exercícios oficiais.
// O `nome` em português é a base (usado como dado); o nome exibido respeita o idioma.
const NOMES_EXERCICIOS_EN = {
  'ex-001': 'Machine Chest Press',
  'ex-002': 'Incline Machine Chest Press',
  'ex-003': 'Pec Deck',
  'ex-004': 'Chest Press',
  'ex-005': 'Lat Pulldown Machine',
  'ex-006': 'Seated Row Machine',
  'ex-007': 'Lat Pulldown',
  'ex-008': 'Articulated Row Machine',
  'ex-009': 'Machine Shoulder Press',
  'ex-010': 'Machine Lateral Raise',
  'ex-011': '45° Leg Press',
  'ex-012': 'Horizontal Leg Press',
  'ex-013': 'Leg Extension',
  'ex-014': 'Prone Leg Curl',
  'ex-015': 'Seated Leg Curl',
  'ex-016': 'Hack Squat',
  'ex-017': 'Smith Machine Squat',
  'ex-018': 'Glute Drive Machine',
  'ex-019': 'Adductor Machine',
  'ex-020': 'Abductor Machine',
  'ex-021': 'Seated Calf Raise',
  'ex-022': 'Standing Calf Raise',
  'ex-023': 'Crossover',
  'ex-024': 'Cable Fly',
  'ex-025': 'Cable Chest Press',
  'ex-026': 'High Cable Crossover',
  'ex-027': 'Low Cable Crossover',
  'ex-028': 'Cable Lat Pulldown',
  'ex-029': 'Cable Front Pulldown',
  'ex-030': 'Low Cable Row',
  'ex-031': 'Single-Arm Cable Row',
  'ex-032': 'Cable Pullover',
  'ex-033': 'Face Pull',
  'ex-034': 'Cable Lateral Raise',
  'ex-035': 'Cable Front Raise',
  'ex-036': 'Triceps Rope Pushdown',
  'ex-037': 'Triceps Rope Extension',
  'ex-038': 'Single-Arm Cable Kickback',
  'ex-039': 'Cable Curl',
  'ex-040': 'Single-Arm Cable Curl',
  'ex-041': 'Cable Hammer Curl',
  'ex-042': 'Cable Triceps Kickback',
  'ex-043': 'Barbell Bench Press',
  'ex-044': 'Incline Barbell Bench Press',
  'ex-045': 'Decline Barbell Bench Press',
  'ex-046': 'Dumbbell Bench Press',
  'ex-047': 'Incline Dumbbell Press',
  'ex-048': 'Dumbbell Fly',
  'ex-049': 'Barbell Bent-Over Row',
  'ex-050': 'One-Arm Dumbbell Row',
  'ex-051': 'T-Bar Row',
  'ex-052': 'Dumbbell Pullover',
  'ex-053': 'Dumbbell Shrugs',
  'ex-054': 'Shoulder Press (Barbell)',
  'ex-055': 'Shoulder Press (Dumbbell)',
  'ex-056': 'Dumbbell Lateral Raise',
  'ex-057': 'Dumbbell Front Raise',
  'ex-058': 'Reverse Dumbbell Fly',
  'ex-059': 'Barbell Curl',
  'ex-060': 'Alternating Dumbbell Curl',
  'ex-061': 'Hammer Curl',
  'ex-062': 'Barbell Preacher Curl',
  'ex-063': 'Concentration Curl',
  'ex-064': 'Skull Crusher (Barbell)',
  'ex-065': 'Skull Crusher (Dumbbells)',
  'ex-066': 'Overhead Triceps Extension',
  'ex-067': 'Dumbbell Triceps Kickback',
  'ex-068': 'Close-Grip Bench Press',
  'ex-069': 'Barbell Back Squat',
  'ex-070': 'Front Squat',
  'ex-071': 'Dumbbell Sumo Squat',
  'ex-072': 'Deadlift',
  'ex-073': 'Romanian Deadlift',
  'ex-074': 'Stiff-Leg Deadlift (Dumbbell)',
  'ex-075': 'Dumbbell Lunge',
  'ex-076': 'Dumbbell Walking Lunge',
  'ex-077': 'Bulgarian Split Squat',
  'ex-078': 'Dumbbell Step-Up',
  'ex-079': 'Standing Dumbbell Calf Raise',
  'ex-080': 'Seated Dumbbell Calf Raise',
  'ex-081': 'Push-Up',
  'ex-082': 'Incline Push-Up',
  'ex-083': 'Diamond Push-Up',
  'ex-084': 'Decline Push-Up',
  'ex-085': 'Pull-Up',
  'ex-086': 'Supinated Pull-Up',
  'ex-087': 'Chin-Up',
  'ex-088': 'Dips',
  'ex-089': 'Bodyweight Squat',
  'ex-090': 'Bodyweight Lunge',
  'ex-091': 'Bodyweight Bulgarian Split Squat',
  'ex-092': 'Hip Thrust',
  'ex-093': 'Glute Bridge',
  'ex-094': 'Crunch',
  'ex-095': 'Reverse Crunch',
  'ex-096': 'Leg Raise',
  'ex-097': 'Plank',
  'ex-098': 'Side Plank',
  'ex-099': 'Mountain Climbers',
  'ex-100': 'Burpee',
};

// Retorna o nome do exercício respeitando o idioma selecionado.
// Exercícios personalizados não possuem tradução e mantêm o nome informado.
export function nomeExercicio(exercicio, idioma) {
  if (!exercicio) return '';
  if (idioma === 'en' && exercicio.id && NOMES_EXERCICIOS_EN[exercicio.id]) {
    return NOMES_EXERCICIOS_EN[exercicio.id];
  }
  return exercicio.nome || '';
}

// Catálogo de exercícios oficiais (100 exercícios iniciais)
const EXERCICIOS_OFICIAIS = [
  // CATEGORIA 1 — MÁQUINAS
  // Peito
  { id: 'ex-001', nome: 'Supino Máquina', categoria: 'Máquinas', grupoMuscular: 'Peito', equipamento: 'Máquina', personalizado: false },
  { id: 'ex-002', nome: 'Supino Inclinado Máquina', categoria: 'Máquinas', grupoMuscular: 'Peito', equipamento: 'Máquina', personalizado: false },
  { id: 'ex-003', nome: 'Peck Deck', categoria: 'Máquinas', grupoMuscular: 'Peito', equipamento: 'Máquina', personalizado: false },
  { id: 'ex-004', nome: 'Press de Peito na Máquina', categoria: 'Máquinas', grupoMuscular: 'Peito', equipamento: 'Máquina', personalizado: false },
  // Costas
  { id: 'ex-005', nome: 'Puxada Alta Máquina', categoria: 'Máquinas', grupoMuscular: 'Costas', equipamento: 'Máquina', personalizado: false },
  { id: 'ex-006', nome: 'Remada Máquina', categoria: 'Máquinas', grupoMuscular: 'Costas', equipamento: 'Máquina', personalizado: false },
  { id: 'ex-007', nome: 'Pulldown Máquina', categoria: 'Máquinas', grupoMuscular: 'Costas', equipamento: 'Máquina', personalizado: false },
  { id: 'ex-008', nome: 'Máquina de Remada Articulada', categoria: 'Máquinas', grupoMuscular: 'Costas', equipamento: 'Máquina', personalizado: false },
  // Ombros
  { id: 'ex-009', nome: 'Desenvolvimento de Ombros Máquina', categoria: 'Máquinas', grupoMuscular: 'Ombros', equipamento: 'Máquina', personalizado: false },
  { id: 'ex-010', nome: 'Elevação Lateral Máquina', categoria: 'Máquinas', grupoMuscular: 'Ombros', equipamento: 'Máquina', personalizado: false },
  // Pernas
  { id: 'ex-011', nome: 'Leg Press 45°', categoria: 'Máquinas', grupoMuscular: 'Pernas', equipamento: 'Máquina', personalizado: false },
  { id: 'ex-012', nome: 'Leg Press Horizontal', categoria: 'Máquinas', grupoMuscular: 'Pernas', equipamento: 'Máquina', personalizado: false },
  { id: 'ex-013', nome: 'Cadeira Extensora', categoria: 'Máquinas', grupoMuscular: 'Pernas', equipamento: 'Máquina', personalizado: false },
  { id: 'ex-014', nome: 'Mesa Flexora', categoria: 'Máquinas', grupoMuscular: 'Pernas', equipamento: 'Máquina', personalizado: false },
  { id: 'ex-015', nome: 'Cadeira Flexora', categoria: 'Máquinas', grupoMuscular: 'Pernas', equipamento: 'Máquina', personalizado: false },
  { id: 'ex-016', nome: 'Hack Squat', categoria: 'Máquinas', grupoMuscular: 'Pernas', equipamento: 'Máquina', personalizado: false },
  { id: 'ex-017', nome: 'Agachamento no Smith', categoria: 'Máquinas', grupoMuscular: 'Pernas', equipamento: 'Máquina', personalizado: false },
  { id: 'ex-018', nome: 'Elevação Pélvica na Máquina', categoria: 'Máquinas', grupoMuscular: 'Glúteos', equipamento: 'Máquina', personalizado: false },
  { id: 'ex-019', nome: 'Adutora Máquina', categoria: 'Máquinas', grupoMuscular: 'Pernas', equipamento: 'Máquina', personalizado: false },
  { id: 'ex-020', nome: 'Abdutora Máquina', categoria: 'Máquinas', grupoMuscular: 'Pernas', equipamento: 'Máquina', personalizado: false },
  // Panturrilhas
  { id: 'ex-021', nome: 'Panturrilha Sentado Máquina', categoria: 'Máquinas', grupoMuscular: 'Panturrilhas', equipamento: 'Máquina', personalizado: false },
  { id: 'ex-022', nome: 'Panturrilha em Pé Máquina', categoria: 'Máquinas', grupoMuscular: 'Panturrilhas', equipamento: 'Máquina', personalizado: false },

  // CATEGORIA 2 — CABOS / POLIAS
  { id: 'ex-023', nome: 'Crossover', categoria: 'Cabos / Polias', grupoMuscular: 'Peito', equipamento: 'Cabo', personalizado: false },
  { id: 'ex-024', nome: 'Crucifixo no Cabo', categoria: 'Cabos / Polias', grupoMuscular: 'Peito', equipamento: 'Cabo', personalizado: false },
  { id: 'ex-025', nome: 'Supino no Cabo', categoria: 'Cabos / Polias', grupoMuscular: 'Peito', equipamento: 'Cabo', personalizado: false },
  { id: 'ex-026', nome: 'Crossover Alto', categoria: 'Cabos / Polias', grupoMuscular: 'Peito', equipamento: 'Cabo', personalizado: false },
  { id: 'ex-027', nome: 'Crossover Baixo', categoria: 'Cabos / Polias', grupoMuscular: 'Peito', equipamento: 'Cabo', personalizado: false },
  { id: 'ex-028', nome: 'Puxada Alta no Cabo', categoria: 'Cabos / Polias', grupoMuscular: 'Costas', equipamento: 'Cabo', personalizado: false },
  { id: 'ex-029', nome: 'Puxada Frente no Cabo', categoria: 'Cabos / Polias', grupoMuscular: 'Costas', equipamento: 'Cabo', personalizado: false },
  { id: 'ex-030', nome: 'Remada Baixa no Cabo', categoria: 'Cabos / Polias', grupoMuscular: 'Costas', equipamento: 'Cabo', personalizado: false },
  { id: 'ex-031', nome: 'Remada Unilateral no Cabo', categoria: 'Cabos / Polias', grupoMuscular: 'Costas', equipamento: 'Cabo', personalizado: false },
  { id: 'ex-032', nome: 'Pullover no Cabo', categoria: 'Cabos / Polias', grupoMuscular: 'Costas', equipamento: 'Cabo', personalizado: false },
  { id: 'ex-033', nome: 'Puxada Facial no Cabo', categoria: 'Cabos / Polias', grupoMuscular: 'Ombros', equipamento: 'Cabo', personalizado: false },
  { id: 'ex-034', nome: 'Elevação Lateral no Cabo', categoria: 'Cabos / Polias', grupoMuscular: 'Ombros', equipamento: 'Cabo', personalizado: false },
  { id: 'ex-035', nome: 'Elevação Frontal no Cabo', categoria: 'Cabos / Polias', grupoMuscular: 'Ombros', equipamento: 'Cabo', personalizado: false },
  { id: 'ex-036', nome: 'Tríceps Pulley', categoria: 'Cabos / Polias', grupoMuscular: 'Tríceps', equipamento: 'Cabo', personalizado: false },
  { id: 'ex-037', nome: 'Tríceps Corda', categoria: 'Cabos / Polias', grupoMuscular: 'Tríceps', equipamento: 'Cabo', personalizado: false },
  { id: 'ex-038', nome: 'Tríceps Unilateral no Cabo', categoria: 'Cabos / Polias', grupoMuscular: 'Tríceps', equipamento: 'Cabo', personalizado: false },
  { id: 'ex-039', nome: 'Rosca Direta no Cabo', categoria: 'Cabos / Polias', grupoMuscular: 'Bíceps', equipamento: 'Cabo', personalizado: false },
  { id: 'ex-040', nome: 'Rosca Unilateral no Cabo', categoria: 'Cabos / Polias', grupoMuscular: 'Bíceps', equipamento: 'Cabo', personalizado: false },
  { id: 'ex-041', nome: 'Rosca Martelo no Cabo', categoria: 'Cabos / Polias', grupoMuscular: 'Bíceps', equipamento: 'Cabo', personalizado: false },
  { id: 'ex-042', nome: 'Coice de Tríceps no Cabo', categoria: 'Cabos / Polias', grupoMuscular: 'Tríceps', equipamento: 'Cabo', personalizado: false },

  // CATEGORIA 3 — PESOS LIVRES
  // Peito
  { id: 'ex-043', nome: 'Supino Reto com Barra', categoria: 'Pesos Livres', grupoMuscular: 'Peito', equipamento: 'Barra', personalizado: false },
  { id: 'ex-044', nome: 'Supino Inclinado com Barra', categoria: 'Pesos Livres', grupoMuscular: 'Peito', equipamento: 'Barra', personalizado: false },
  { id: 'ex-045', nome: 'Supino Declinado com Barra', categoria: 'Pesos Livres', grupoMuscular: 'Peito', equipamento: 'Barra', personalizado: false },
  { id: 'ex-046', nome: 'Supino Reto com Halteres', categoria: 'Pesos Livres', grupoMuscular: 'Peito', equipamento: 'Halteres', personalizado: false },
  { id: 'ex-047', nome: 'Supino Inclinado com Halteres', categoria: 'Pesos Livres', grupoMuscular: 'Peito', equipamento: 'Halteres', personalizado: false },
  { id: 'ex-048', nome: 'Crucifixo com Halteres', categoria: 'Pesos Livres', grupoMuscular: 'Peito', equipamento: 'Halteres', personalizado: false },
  // Costas
  { id: 'ex-049', nome: 'Remada Curvada com Barra', categoria: 'Pesos Livres', grupoMuscular: 'Costas', equipamento: 'Barra', personalizado: false },
  { id: 'ex-050', nome: 'Remada Unilateral com Halter', categoria: 'Pesos Livres', grupoMuscular: 'Costas', equipamento: 'Halter', personalizado: false },
  { id: 'ex-051', nome: 'Remada Cavalinho', categoria: 'Pesos Livres', grupoMuscular: 'Costas', equipamento: 'Barra', personalizado: false },
  { id: 'ex-052', nome: 'Pullover com Halter', categoria: 'Pesos Livres', grupoMuscular: 'Costas', equipamento: 'Halter', personalizado: false },
  { id: 'ex-053', nome: 'Encolhimento com Halteres', categoria: 'Pesos Livres', grupoMuscular: 'Costas', equipamento: 'Halteres', personalizado: false },
  // Ombros
  { id: 'ex-054', nome: 'Desenvolvimento com Barra', categoria: 'Pesos Livres', grupoMuscular: 'Ombros', equipamento: 'Barra', personalizado: false },
  { id: 'ex-055', nome: 'Desenvolvimento com Halteres', categoria: 'Pesos Livres', grupoMuscular: 'Ombros', equipamento: 'Halteres', personalizado: false },
  { id: 'ex-056', nome: 'Elevação Lateral com Halteres', categoria: 'Pesos Livres', grupoMuscular: 'Ombros', equipamento: 'Halteres', personalizado: false },
  { id: 'ex-057', nome: 'Elevação Frontal com Halteres', categoria: 'Pesos Livres', grupoMuscular: 'Ombros', equipamento: 'Halteres', personalizado: false },
  { id: 'ex-058', nome: 'Crucifixo Inverso com Halteres', categoria: 'Pesos Livres', grupoMuscular: 'Ombros', equipamento: 'Halteres', personalizado: false },
  // Bíceps
  { id: 'ex-059', nome: 'Rosca Direta com Barra', categoria: 'Pesos Livres', grupoMuscular: 'Bíceps', equipamento: 'Barra', personalizado: false },
  { id: 'ex-060', nome: 'Rosca Alternada com Halteres', categoria: 'Pesos Livres', grupoMuscular: 'Bíceps', equipamento: 'Halteres', personalizado: false },
  { id: 'ex-061', nome: 'Rosca Martelo', categoria: 'Pesos Livres', grupoMuscular: 'Bíceps', equipamento: 'Halteres', personalizado: false },
  { id: 'ex-062', nome: 'Rosca Scott com Barra', categoria: 'Pesos Livres', grupoMuscular: 'Bíceps', equipamento: 'Barra', personalizado: false },
  { id: 'ex-063', nome: 'Rosca Concentrada', categoria: 'Pesos Livres', grupoMuscular: 'Bíceps', equipamento: 'Halter', personalizado: false },
  // Tríceps
  { id: 'ex-064', nome: 'Tríceps Testa com Barra', categoria: 'Pesos Livres', grupoMuscular: 'Tríceps', equipamento: 'Barra', personalizado: false },
  { id: 'ex-065', nome: 'Tríceps Testa com Halteres', categoria: 'Pesos Livres', grupoMuscular: 'Tríceps', equipamento: 'Halteres', personalizado: false },
  { id: 'ex-066', nome: 'Tríceps Francês', categoria: 'Pesos Livres', grupoMuscular: 'Tríceps', equipamento: 'Halter', personalizado: false },
  { id: 'ex-067', nome: 'Tríceps Coice com Halter', categoria: 'Pesos Livres', grupoMuscular: 'Tríceps', equipamento: 'Halter', personalizado: false },
  { id: 'ex-068', nome: 'Supino Fechado', categoria: 'Pesos Livres', grupoMuscular: 'Tríceps', equipamento: 'Barra', personalizado: false },
  // Pernas
  { id: 'ex-069', nome: 'Agachamento Livre', categoria: 'Pesos Livres', grupoMuscular: 'Pernas', equipamento: 'Barra', personalizado: false },
  { id: 'ex-070', nome: 'Agachamento Frontal', categoria: 'Pesos Livres', grupoMuscular: 'Pernas', equipamento: 'Barra', personalizado: false },
  { id: 'ex-071', nome: 'Agachamento Sumô com Halter', categoria: 'Pesos Livres', grupoMuscular: 'Pernas', equipamento: 'Halter', personalizado: false },
  { id: 'ex-072', nome: 'Levantamento Terra', categoria: 'Pesos Livres', grupoMuscular: 'Pernas', equipamento: 'Barra', personalizado: false },
  { id: 'ex-073', nome: 'Levantamento Terra Romeno', categoria: 'Pesos Livres', grupoMuscular: 'Pernas', equipamento: 'Barra', personalizado: false },
  { id: 'ex-074', nome: 'Stiff com Halteres', categoria: 'Pesos Livres', grupoMuscular: 'Pernas', equipamento: 'Halteres', personalizado: false },
  { id: 'ex-075', nome: 'Afundo com Halteres', categoria: 'Pesos Livres', grupoMuscular: 'Pernas', equipamento: 'Halteres', personalizado: false },
  { id: 'ex-076', nome: 'Passada com Halteres', categoria: 'Pesos Livres', grupoMuscular: 'Pernas', equipamento: 'Halteres', personalizado: false },
  { id: 'ex-077', nome: 'Afundo Búlgaro com Halteres', categoria: 'Pesos Livres', grupoMuscular: 'Pernas', equipamento: 'Halteres', personalizado: false },
  { id: 'ex-078', nome: 'Step-Up com Halteres', categoria: 'Pesos Livres', grupoMuscular: 'Pernas', equipamento: 'Halteres', personalizado: false },
  // Panturrilhas
  { id: 'ex-079', nome: 'Panturrilha em Pé com Halteres', categoria: 'Pesos Livres', grupoMuscular: 'Panturrilhas', equipamento: 'Halteres', personalizado: false },
  { id: 'ex-080', nome: 'Panturrilha Sentado com Halter', categoria: 'Pesos Livres', grupoMuscular: 'Panturrilhas', equipamento: 'Halter', personalizado: false },

  // CATEGORIA 4 — PESO CORPORAL / LIVRES
  { id: 'ex-081', nome: 'Flexão de Braços', categoria: 'Peso Corporal / Livres', grupoMuscular: 'Peito', equipamento: 'Peso Corporal', personalizado: false },
  { id: 'ex-082', nome: 'Flexão Inclinada', categoria: 'Peso Corporal / Livres', grupoMuscular: 'Peito', equipamento: 'Peso Corporal', personalizado: false },
  { id: 'ex-083', nome: 'Flexão Diamante', categoria: 'Peso Corporal / Livres', grupoMuscular: 'Tríceps', equipamento: 'Peso Corporal', personalizado: false },
  { id: 'ex-084', nome: 'Flexão Declinada', categoria: 'Peso Corporal / Livres', grupoMuscular: 'Peito', equipamento: 'Peso Corporal', personalizado: false },
  { id: 'ex-085', nome: 'Barra Fixa', categoria: 'Peso Corporal / Livres', grupoMuscular: 'Costas', equipamento: 'Barra', personalizado: false },
  { id: 'ex-086', nome: 'Barra Fixa Supinada', categoria: 'Peso Corporal / Livres', grupoMuscular: 'Costas', equipamento: 'Barra', personalizado: false },
  { id: 'ex-087', nome: 'Chin-Up', categoria: 'Peso Corporal / Livres', grupoMuscular: 'Costas', equipamento: 'Barra', personalizado: false },
  { id: 'ex-088', nome: 'Paralelas', categoria: 'Peso Corporal / Livres', grupoMuscular: 'Tríceps', equipamento: 'Paralelas', personalizado: false },
  { id: 'ex-089', nome: 'Agachamento Livre sem Peso', categoria: 'Peso Corporal / Livres', grupoMuscular: 'Pernas', equipamento: 'Peso Corporal', personalizado: false },
  { id: 'ex-090', nome: 'Afundo sem Peso', categoria: 'Peso Corporal / Livres', grupoMuscular: 'Pernas', equipamento: 'Peso Corporal', personalizado: false },
  { id: 'ex-091', nome: 'Agachamento Búlgaro sem Peso', categoria: 'Peso Corporal / Livres', grupoMuscular: 'Pernas', equipamento: 'Peso Corporal', personalizado: false },
  { id: 'ex-092', nome: 'Elevação Pélvica', categoria: 'Peso Corporal / Livres', grupoMuscular: 'Glúteos', equipamento: 'Peso Corporal', personalizado: false },
  { id: 'ex-093', nome: 'Ponte de Glúteos', categoria: 'Peso Corporal / Livres', grupoMuscular: 'Glúteos', equipamento: 'Peso Corporal', personalizado: false },
  { id: 'ex-094', nome: 'Abdominal Crunch', categoria: 'Peso Corporal / Livres', grupoMuscular: 'Abdômen', equipamento: 'Peso Corporal', personalizado: false },
  { id: 'ex-095', nome: 'Abdominal Infra', categoria: 'Peso Corporal / Livres', grupoMuscular: 'Abdômen', equipamento: 'Peso Corporal', personalizado: false },
  { id: 'ex-096', nome: 'Elevação de Pernas', categoria: 'Peso Corporal / Livres', grupoMuscular: 'Abdômen', equipamento: 'Peso Corporal', personalizado: false },
  { id: 'ex-097', nome: 'Prancha', categoria: 'Peso Corporal / Livres', grupoMuscular: 'Abdômen', equipamento: 'Peso Corporal', personalizado: false },
  { id: 'ex-098', nome: 'Prancha Lateral', categoria: 'Peso Corporal / Livres', grupoMuscular: 'Abdômen', equipamento: 'Peso Corporal', personalizado: false },
  { id: 'ex-099', nome: 'Escalador', categoria: 'Peso Corporal / Livres', grupoMuscular: 'Abdômen', equipamento: 'Peso Corporal', personalizado: false },
  { id: 'ex-100', nome: 'Burpee', categoria: 'Peso Corporal / Livres', grupoMuscular: 'CorpoInteiro', equipamento: 'Peso Corporal', personalizado: false },
];

function removerAcentos(texto) {
  return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

export async function getExerciciosOficiais() {
  return EXERCICIOS_OFICIAIS;
}

export async function getExerciciosCustom() {
  try {
    const raw = await AsyncStorage.getItem(EXERCISES_CUSTOM_KEY);
    const parsed = safeJsonParse(raw, []);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn('Erro ao ler exercícios personalizados:', error);
    return [];
  }
}

export async function getTodosExercicios() {
  const oficiais = await getExerciciosOficiais();
  const custom = await getExerciciosCustom();
  return [...oficiais, ...custom];
}

export async function buscarExercicios(termo) {
  const todos = await getTodosExercicios();
  if (!termo || !termo.trim()) {
    return todos;
  }
  const busca = removerAcentos(termo.toLowerCase().trim());
  return todos.filter((ex) => {
    if (removerAcentos(ex.nome.toLowerCase()).includes(busca)) return true;
    const nomeEn = ex.id ? NOMES_EXERCICIOS_EN[ex.id] : null;
    return nomeEn ? removerAcentos(nomeEn.toLowerCase()).includes(busca) : false;
  });
}

export async function getExerciciosPorCategoria(categoria) {
  const todos = await getTodosExercicios();
  return todos.filter((ex) => ex.categoria === categoria);
}

export async function getExerciciosPorGrupoMuscular(grupo) {
  const todos = await getTodosExercicios();
  return todos.filter((ex) => ex.grupoMuscular === grupo);
}

export async function saveExercicioCustom(exercicio) {
  try {
    const custom = await getExerciciosCustom();
    const novo = {
      ...exercicio,
      id: `custom-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      personalizado: true,
      categoria: 'Personalizados',
    };
    const next = [novo, ...custom];
    await AsyncStorage.setItem(EXERCISES_CUSTOM_KEY, JSON.stringify(next));
    return novo;
  } catch (error) {
    console.warn('Erro ao salvar exercício personalizado:', error);
    throw error;
  }
}

export async function deleteExercicioCustom(id) {
  try {
    const custom = await getExerciciosCustom();
    const next = custom.filter((ex) => ex.id !== id);
    await AsyncStorage.setItem(EXERCISES_CUSTOM_KEY, JSON.stringify(next));
    return next;
  } catch (error) {
    console.warn('Erro ao excluir exercício personalizado:', error);
    throw error;
  }
}

export async function updateExercicioCustom(id, updates) {
  try {
    const custom = await getExerciciosCustom();
    const idx = custom.findIndex((ex) => ex.id === id);
    if (idx === -1) return null;
    const atualizado = { ...custom[idx], ...updates, personalizado: true };
    custom[idx] = atualizado;
    await AsyncStorage.setItem(EXERCISES_CUSTOM_KEY, JSON.stringify(custom));
    return atualizado;
  } catch (error) {
    console.warn('Erro ao atualizar exercício personalizado:', error);
    throw error;
  }
}

export const CATEGORIAS_EXERCICIOS = [
  'Máquinas',
  'Cabos / Polias',
  'Pesos Livres',
  'Peso Corporal / Livres',
  'Personalizados',
];

export const GRUPOS_MUSCULARES = [
  'Peito',
  'Costas',
  'Ombros',
  'Bíceps',
  'Tríceps',
  'Pernas',
  'Glúteos',
  'Panturrilhas',
  'Abdômen',
  'CorpoInteiro',
];

export async function getUnidadePeso() {
  try {
    const perfil = await getUserProfile();
    const unidade = perfil?.pesoUnidade || 'kg';
    return unidade === 'lbs' ? 'lb' : unidade;
  } catch {
    return 'kg';
  }
}

export async function setUnidadePeso(unidade) {
  return saveUserProfile({ pesoUnidade: unidade });
}

export async function getUnidadeAltura() {
  try {
    const perfil = await getUserProfile();
    return perfil?.alturaUnidade || 'cm';
  } catch {
    return 'cm';
  }
}

export async function setUnidadeAltura(unidade) {
  return saveUserProfile({ alturaUnidade: unidade });
}

export function converterPeso(valor, de, para) {
  const KG_PARA_LB = 2.20462262185;
  const normaliza = (u) => (u === 'lbs' ? 'lb' : u);
  de = normaliza(de);
  para = normaliza(para);
  if (de === para) return valor;
  if (de === 'kg' && para === 'lb') return valor * KG_PARA_LB;
  if (de === 'lb' && para === 'kg') return valor / KG_PARA_LB;
  return valor;
}

export function converterAltura(valor, de, para) {
  const CM_PARA_IN = 0.393701;
  if (de === para) return valor;
  if (de === 'cm' && para === 'in') return valor * CM_PARA_IN;
  if (de === 'in' && para === 'cm') return valor / CM_PARA_IN;
  return valor;
}

export function formatarPeso(valor, unidade) {
  if (valor === null || valor === undefined) return '—';
  const num = Number(valor);
  if (isNaN(num)) return '—';
  return `${num.toFixed(unidade === 'kg' ? 1 : 1)} ${unidade === 'kg' ? 'kg' : 'lb'}`;
}

export function formatarAltura(valor, unidade) {
  if (valor === null || valor === undefined) return '—';
  const num = Number(valor);
  if (isNaN(num)) return '—';
  if (unidade === 'cm') {
    return `${Math.round(num)} cm`;
  }
  const totalInches = num;
  const feet = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches % 12);
  return `${feet}'${inches}"`;
}

export function calcularIdade(dataNascimento) {
  const data = normalizarDataNascimento(dataNascimento);
  if (!data) {
    return null;
  }

  const [ano, mes, dia] = data.split('-').map(Number);
  const hoje = new Date();
  const anoAtual = hoje.getFullYear();
  const mesAtual = hoje.getMonth() + 1;
  const diaAtual = hoje.getDate();

  if (
    ano > anoAtual ||
    (ano === anoAtual && (mes > mesAtual || (mes === mesAtual && dia > diaAtual)))
  ) {
    return null;
  }

  let idade = anoAtual - ano;
  if (mesAtual < mes || (mesAtual === mes && diaAtual < dia)) {
    idade -= 1;
  }

  return idade;
}

export async function getEstatisticasTreino() {
  const historico = await getWorkoutHistory();
  const totalTreinos = historico.length;
  let totalExercicios = 0;
  let totalSeries = 0;
  let duracaoTotal = 0;

  for (const treino of historico) {
    if (treino.exercicios) {
      const nomesExercicios = treino.exercicios
        .map(e => e && (e.exercicioNome || e.nome))
        .filter(Boolean);
      totalExercicios += new Set(nomesExercicios).size;
      totalSeries += treino.exercicios.length;
    }
    if (treino.duracao) {
      const partes = treino.duracao.split(':').map(Number);
      if (partes.length === 3) {
        duracaoTotal += partes[0] * 3600 + partes[1] * 60 + partes[2];
      }
    }
  }

  const horas = Math.floor(duracaoTotal / 3600);
  const minutos = Math.floor((duracaoTotal % 3600) / 60);

  return {
    totalTreinos,
    totalExercicios,
    totalSeries,
    duracaoFormatada: `${horas}h ${minutos}min`,
  };
}
