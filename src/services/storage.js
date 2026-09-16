import AsyncStorage from '@react-native-async-storage/async-storage';

const HISTORY_KEY = 'gymvance_historico';
const PLAN_KEY = 'gymvance_plano_ativo';

export async function getWorkoutHistory() {
  try {
    const raw = await AsyncStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
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
