import { useCallback, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';

import BottomNavBar from '../components/BottomNavBar';
import { useIdioma } from '../services/idioma';
import { useNomeUsuario } from '../services/useUserProfile';
import { getWorkoutHistory } from '../services/storage';

const ABAS = [
  { id: 'semanal', label: 'ranking.semanal' },
  { id: 'mensal', label: 'ranking.mensal' },
  { id: 'geral', label: 'ranking.todas' },
];

const MS_DIA = 24 * 60 * 60 * 1000;

function diaInicio(data) {
  return new Date(data.getFullYear(), data.getMonth(), data.getDate()).getTime();
}

function calcularStreak(historico) {
  const dias = new Set();

  for (const item of historico || []) {
    if (!item?.data) continue;
    const data = new Date(item.data);
    if (Number.isNaN(data.getTime())) continue;
    dias.add(diaInicio(data));
  }

  if (dias.size === 0) return 0;

  const hoje = diaInicio(new Date());
  let atual = dias.has(hoje) ? hoje : hoje - MS_DIA;
  let streak = 0;

  while (dias.has(atual)) {
    streak += 1;
    atual -= MS_DIA;
  }

  return streak;
}

function contarPeriodo(historico, periodo) {
  const agora = new Date();
  const hoje = diaInicio(agora);
  let treinos = 0;
  const dias = new Set();

  for (const item of historico || []) {
    if (!item?.data) continue;
    const data = new Date(item.data);
    if (Number.isNaN(data.getTime())) continue;

    if (periodo === 'semanal' && diaInicio(data) < hoje - 6 * MS_DIA) continue;
    if (periodo === 'mensal' && (data.getMonth() !== agora.getMonth() || data.getFullYear() !== agora.getFullYear())) continue;

    treinos += 1;
    dias.add(diaInicio(data));
  }

  return { treinos, dias: dias.size };
}

export default function Ranking({ navigation }) {
  const { t } = useIdioma();
  const nomeUsuario = useNomeUsuario();
  const [abaAtiva, setAbaAtiva] = useState('semanal');
  const [dadosRanking, setDadosRanking] = useState([]);
  const [streak, setStreak] = useState(0);

  useFocusEffect(
    useCallback(() => {
      let ativo = true;

      (async () => {
        const historico = await getWorkoutHistory();
        if (!ativo) return;
        setStreak(calcularStreak(historico));

        const periodo = abaAtiva;
        const { treinos, dias } = contarPeriodo(historico, periodo);
        const nome = nomeUsuario || t('ranking.voce');
        setDadosRanking([
          { posicao: 1, nome, voce: true, treinos, dias },
        ]);
      })();

      return () => {
        ativo = false;
      };
    }, [abaAtiva, nomeUsuario, t])
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.streak}>
            <MaterialCommunityIcons name="fire" size={22} color="#3DDC5C" />
            <Text style={styles.streakText}>{streak}</Text>
          </View>
          <Text style={styles.logo}>
            Gym<Text style={styles.logoAccent}>Vance</Text>
          </Text>
        </View>

        <Text style={styles.titulo}>{t('ranking.geral')}</Text>
        <Text style={styles.subtitulo}>{t('ranking.subtitulo')}</Text>

        <View style={styles.abasRow}>
          {ABAS.map((aba) => (
            <TouchableOpacity
              key={aba.id}
              style={[styles.aba, abaAtiva === aba.id && styles.abaAtiva]}
              onPress={() => setAbaAtiva(aba.id)}
            >
              <Text style={[styles.abaText, abaAtiva === aba.id && styles.abaTextAtiva]}>{t(aba.label)}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.lista}>
          {dadosRanking.length > 0 ? dadosRanking.map((item) => (
            <View key={item.posicao} style={[styles.linha, item.voce && styles.linhaVoce]}>
              <Text style={styles.linhaPosicao}>{item.posicao}</Text>
              <View style={styles.linhaAvatar}>
                <Ionicons name="person-outline" size={18} color="#555" />
              </View>
              <View style={styles.linhaInfo}>
                <View style={styles.linhaNomeRow}>
                  <Text style={styles.linhaNome}>{item.nome}</Text>
                  {item.voce && (
                    <View style={styles.voceBadge}>
                      <Text style={styles.voceBadgeText}>{t('ranking.voce')}</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.linhaTreinos}>{item.treinos} {t('ranking.treinos')}</Text>
              </View>
              <View style={styles.linhaDiasRow}>
                <MaterialCommunityIcons name="fire" size={14} color="#3DDC5C" />
                <Text style={styles.linhaDias}>{item.dias}</Text>
              </View>
            </View>
          )) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>{t('ranking.vazioTitulo')}</Text>
              <Text style={styles.emptyText}>{t('ranking.vazioTexto')}</Text>
            </View>
          )}
        </View>
      </ScrollView>

      <BottomNavBar activeTab="treino" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  scroll: { paddingHorizontal: 20, paddingBottom: 24 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  streak: { flexDirection: 'row', alignItems: 'center' },
  streakText: { color: '#3DDC5C', fontSize: 20, fontWeight: 'bold', marginLeft: 4 },
  logo: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  logoAccent: { color: '#3DDC5C' },
  titulo: { color: '#fff', fontSize: 24, fontWeight: 'bold', marginBottom: 4 },
  subtitulo: { color: '#999', fontSize: 13, marginBottom: 28 },
  podioRow: {},
  podioItem: {},
  podioItemDestaque: {},
  coroa: { marginBottom: 4 },
  podioAvatar: {},
  posicaoBadge: {},
  posicaoBadgeText: {},
  podioNome: {},
  podioDiasRow: {},
  podioDias: {},
  abasRow: {
    flexDirection: 'row',
    backgroundColor: '#1A1A1A',
    borderRadius: 10,
    padding: 4,
    marginBottom: 20,
  },
  aba: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  abaAtiva: { backgroundColor: '#3DDC5C' },
  abaText: { color: '#999', fontSize: 13, fontWeight: '600' },
  abaTextAtiva: { color: '#121212' },
  lista: { gap: 10 },
  linha: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#2A2A2A',
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  linhaVoce: {
    borderColor: '#3DDC5C',
    backgroundColor: '#1E2A1E',
  },
  linhaPosicao: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
    width: 24,
  },
  linhaAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2A2A2A',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  linhaInfo: { flex: 1 },
  linhaNomeRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' },
  linhaNome: { color: '#fff', fontSize: 14, fontWeight: '700' },
  voceBadge: {
    backgroundColor: '#3DDC5C',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 6,
  },
  voceBadgeText: { color: '#121212', fontSize: 8, fontWeight: '700' },
  linhaTreinos: { color: '#9A9A9A', fontSize: 11, marginTop: 2 },
  linhaDiasRow: { flexDirection: 'row', alignItems: 'center' },
  linhaDias: { color: '#fff', fontSize: 14, fontWeight: '700', marginLeft: 4 },
});
