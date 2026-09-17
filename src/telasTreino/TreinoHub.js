import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const COLORS = { bg: '#121212', card: '#1E1E1E', green: '#3DDC5C', text: '#FFFFFF', muted: '#8A8A8A', laranja: '#FF7A1A' };

const SEMANA = [
  { letra: 'Seg', numero: 18 },
  { letra: 'Ter', numero: 19 },
  { letra: 'Qua', numero: 20 },
  { letra: 'Qui', numero: 21 },
  { letra: 'Sex', numero: 22 },
  { letra: 'Sab', numero: 23 },
  { letra: 'Dom', numero: 24 },
];

export default function TreinoHub({ navigation }) {
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView style={[styles.safe, { paddingBottom: 12 + insets.bottom }]}>
      <View style={styles.header}>
        <View style={styles.streak}>
          <Ionicons name="flame" size={18} color={COLORS.laranja} />
          <Text style={styles.streakTexto}>0</Text>
        </View>
        <View style={styles.userBox}>
          <Text style={styles.tituloSecundario}>Evolução diária</Text>
          <View style={styles.userRow}>
            <View style={styles.avatar} />
            <Text style={styles.userNome}>Lucas Miyashiro</Text>
          </View>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.rankingButton}
            onPress={() => navigation?.navigate('Ranking')}
            accessibilityLabel="Abrir ranking"
          >
            <Ionicons name="trophy-outline" size={18} color={COLORS.text} />
            <Text style={styles.rankingText}>Ranking</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.proChip}
            onPress={() => navigation?.navigate('Planos')}
          >
            <Text style={styles.proChipText}>PRO</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.semanaRow}>
        {SEMANA.map((d) => (
          <View key={d.numero} style={styles.diaColuna}>
            <Text style={styles.diaLetra}>{d.letra}</Text>
            <Text style={styles.diaNumero}>{d.numero}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.sessaoTitulo}>Sessão de Treino</Text>

      <TouchableOpacity style={styles.btnIniciar} onPress={() => navigation?.navigate('SessaoAtiva')}>
        <Text style={styles.btnIniciarText}>Iniciar treino</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.btnCriar} onPress={() => navigation?.navigate('NovaSessao')}>
        <Ionicons name="add" size={18} color="#000" />
        <Text style={styles.btnCriarText}>Criar sessão de treino</Text>
      </TouchableOpacity>

      <BottomNav navigation={navigation} active="Treino" insets={insets} />
    </SafeAreaView>
  );
}

function BottomNav({ active, navigation, insets }) {
  const itens = [
    { nome: 'Treino', icon: 'barbell-outline', screen: 'TreinoHub' },
    { nome: 'Alimentação', icon: 'heart-outline', screen: 'Alimentacao' },
    { nome: 'Relógio', icon: 'watch-outline', screen: 'Batimento' },
  ];
  return (
    <View style={[styles.bottomNav, { paddingBottom: (insets?.bottom ?? 0) + 10 }]}>
      {itens.map((it) => (
        <TouchableOpacity
          key={it.nome}
          style={styles.navItem}
          onPress={() => navigation?.navigate(it.screen)}
        >
          <Ionicons name={it.icon} size={20} color={it.nome === active ? COLORS.green : COLORS.muted} />
          <Text style={[styles.navLabel, it.nome === active && { color: COLORS.green }]}>{it.nome}</Text>
        </TouchableOpacity>
      ))}
    </View>
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
  semanaRow: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: COLORS.card, borderRadius: 14, padding: 12, marginTop: 20 },
  diaColuna: { alignItems: 'center', gap: 6 },
  diaLetra: { color: COLORS.muted, fontSize: 11 },
  diaNumero: { color: COLORS.text, fontWeight: '600', fontSize: 13 },
  sessaoTitulo: { color: COLORS.text, fontWeight: '700', fontSize: 15, marginTop: 24, marginBottom: 12 },
  btnIniciar: { backgroundColor: '#000', borderWidth: 1, borderColor: '#333', paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginBottom: 10 },
  btnIniciarText: { color: COLORS.text, fontWeight: '700' },
  btnCriar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: COLORS.green, paddingVertical: 14, borderRadius: 12 },
  btnCriarText: { color: '#000', fontWeight: '700' },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#242424',
    paddingTop: 10,
    backgroundColor: COLORS.bg,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  navItem: { alignItems: 'center', gap: 2 },
  navLabel: { color: COLORS.muted, fontSize: 11 },
});