import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import BottomNavBar from '../components/BottomNavBar';
import { useNomeUsuario } from '../services/useUserProfile';
import { getWorkoutHistory } from '../services/storage';
import { useIdioma } from '../services/idioma';

const COLORS = { bg: '#121212', card: '#1E1E1E', green: '#3DDC5C', text: '#FFFFFF', muted: '#8A8A8A', laranja: '#FF7A1A' };

function calcularStreak(historico) {
  const dias = new Set();

  for (const item of historico || []) {
    if (!item?.data) {
      continue;
    }
    const data = new Date(item.data);
    if (Number.isNaN(data.getTime())) {
      continue;
    }
    const dia = new Date(data.getFullYear(), data.getMonth(), data.getDate()).getTime();
    dias.add(dia);
  }

  if (dias.size === 0) {
    return 0;
  }

  const hoje = new Date();
  const diaHoje = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate()).getTime();
  const msDia = 24 * 60 * 60 * 1000;
  let atual = dias.has(diaHoje) ? diaHoje : diaHoje - msDia;
  let streak = 0;

  while (dias.has(atual)) {
    streak += 1;
    atual -= msDia;
  }

  return streak;
}

function getSemanaAtual() {
  const hoje = new Date();
  const inicioSemana = new Date(hoje);
  inicioSemana.setDate(hoje.getDate() - hoje.getDay());
  const dias = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
  const semana = [];
  for (let i = 0; i < 7; i++) {
    const data = new Date(inicioSemana);
    data.setDate(inicioSemana.getDate() + i);
    semana.push({ letra: dias[i], numero: data.getDate() });
  }
  return semana;
}

export default function TreinoHub({ navigation }) {
  const { t } = useIdioma();
  const nomeUsuario = useNomeUsuario();
  const [streak, setStreak] = useState(0);
  const semana = useMemo(() => getSemanaAtual(), []);

  useEffect(() => {
    let ativo = true;

    (async () => {
      const historico = await getWorkoutHistory();
      if (ativo) {
        setStreak(calcularStreak(historico));
      }
    })();

    return () => {
      ativo = false;
    };
  }, []);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.streak}>
            <Ionicons name="flame" size={18} color={COLORS.laranja} />
            <Text style={styles.streakTexto}>{streak}</Text>
          </View>
          <TouchableOpacity style={styles.userBox} onPress={() => navigation?.navigate('Perfil')} activeOpacity={0.7}>
            <Text style={styles.tituloSecundario}>{t('comum.evolucaoDiaria')}</Text>
            <View style={styles.userRow}>
              <View style={styles.avatar} />
              <Text style={styles.userNome} numberOfLines={1} ellipsizeMode="tail">{nomeUsuario}</Text>
            </View>
          </TouchableOpacity>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.rankingButton}
              onPress={() => navigation?.navigate('Ranking')}
              accessibilityLabel={t('comum.abrirRanking')}
            >
              <Ionicons name="trophy-outline" size={18} color={COLORS.text} />
              <Text style={styles.rankingText}>{t('comum.ranking')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.proChip}
              onPress={() => navigation?.navigate('Planos')}
            >
              <Text style={styles.proChipText}>PRO</Text>
            </TouchableOpacity>
          </View>
        </View>

        {semana.length > 0 && (
          <TouchableOpacity
            style={styles.semanaCard}
            onPress={() => navigation?.navigate('CalendarioCompleto')}
            activeOpacity={0.85}
          >
            <View style={styles.semanaRow}>
              {semana.map((d) => (
                <View key={d.numero} style={styles.diaColuna}>
                  <Text style={styles.diaLetra}>{d.letra}</Text>
                  <Text style={styles.diaNumero}>{d.numero}</Text>
                </View>
              ))}
            </View>
            <View style={styles.verCalendarioRow}>
              <Ionicons name="calendar-outline" size={13} color={COLORS.green} />
              <Text style={styles.verCalendarioText}>{t('calendario.verCalendario')}</Text>
            </View>
          </TouchableOpacity>
        )}

        <Text style={styles.sessaoTitulo}>{t('treinoHub.sessaoTreino')}</Text>

        <TouchableOpacity style={styles.btnIniciar} onPress={() => navigation?.navigate('SessaoAtiva')}>
          <Text style={styles.btnIniciarText}>{t('treinoHub.iniciar')}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.btnCriar} onPress={() => navigation?.navigate('NovaSessao')}>
          <Ionicons name="add" size={18} color="#000" />
          <Text style={styles.btnCriarText}>{t('treinoHub.criar')}</Text>
        </TouchableOpacity>
      </ScrollView>

      <BottomNavBar activeTab="treino" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg, paddingHorizontal: 16 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 8 },
  streak: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  streakTexto: { color: COLORS.text, fontWeight: '700' },
  userBox: { marginLeft: 8, flex: 1 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  rankingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#202020',
    borderWidth: 1,
    borderColor: '#333333',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  rankingText: { color: COLORS.text, fontSize: 12, fontWeight: '700' },
  proChip: { backgroundColor: COLORS.green, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 6 },
  proChipText: { color: '#000', fontWeight: '800', fontSize: 11 },
  tituloSecundario: { color: COLORS.muted, fontSize: 11 },
  userRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  avatar: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#333' },
  userNome: { color: COLORS.text, fontWeight: '600', fontSize: 13 },
  semanaRow: { flexDirection: 'row', justifyContent: 'space-between' },
  semanaCard: { backgroundColor: COLORS.card, borderRadius: 14, padding: 12, marginTop: 20 },
  verCalendarioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#2A2A2A',
  },
  verCalendarioText: { color: COLORS.green, fontSize: 12, fontWeight: '700' },
  diaColuna: { alignItems: 'center', gap: 6 },
  diaLetra: { color: COLORS.muted, fontSize: 11 },
  diaNumero: { color: COLORS.text, fontWeight: '600', fontSize: 13 },
  sessaoTitulo: { color: COLORS.text, fontWeight: '700', fontSize: 15, marginTop: 24, marginBottom: 12 },
  btnIniciar: { backgroundColor: '#000', borderWidth: 1, borderColor: '#333', paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginBottom: 10 },
  btnIniciarText: { color: COLORS.text, fontWeight: '700' },
  btnCriar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: COLORS.green, paddingVertical: 14, borderRadius: 12 },
  btnCriarText: { color: '#000', fontWeight: '700' },
});