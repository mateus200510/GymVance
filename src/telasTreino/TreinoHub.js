import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import BottomNavBar from '../components/BottomNavBar';
import { useNomeUsuario } from '../services/useUserProfile';

const COLORS = { bg: '#121212', card: '#1E1E1E', green: '#3DDC5C', text: '#FFFFFF', muted: '#8A8A8A', laranja: '#FF7A1A' };

const SEMANA = [];

export default function TreinoHub({ navigation }) {
  const nomeUsuario = useNomeUsuario();

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
            <Text style={styles.streakTexto}>0</Text>
          </View>
          <TouchableOpacity style={styles.userBox} onPress={() => navigation?.navigate('Perfil')} activeOpacity={0.7}>
            <Text style={styles.tituloSecundario}>Evolução diária</Text>
            <View style={styles.userRow}>
              <View style={styles.avatar} />
              <Text style={styles.userNome} numberOfLines={1} ellipsizeMode="tail">{nomeUsuario}</Text>
            </View>
          </TouchableOpacity>
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

        {SEMANA.length > 0 && (
          <View style={styles.semanaRow}>
            {SEMANA.map((d) => (
              <View key={d.numero} style={styles.diaColuna}>
                <Text style={styles.diaLetra}>{d.letra}</Text>
                <Text style={styles.diaNumero}>{d.numero}</Text>
              </View>
            ))}
          </View>
        )}

        <Text style={styles.sessaoTitulo}>Sessão de Treino</Text>

        <TouchableOpacity style={styles.btnIniciar} onPress={() => navigation?.navigate('SessaoAtiva')}>
          <Text style={styles.btnIniciarText}>Iniciar treino</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.btnCriar} onPress={() => navigation?.navigate('NovaSessao')}>
          <Ionicons name="add" size={18} color="#000" />
          <Text style={styles.btnCriarText}>Criar sessão de treino</Text>
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
  semanaRow: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: COLORS.card, borderRadius: 14, padding: 12, marginTop: 20 },
  diaColuna: { alignItems: 'center', gap: 6 },
  diaLetra: { color: COLORS.muted, fontSize: 11 },
  diaNumero: { color: COLORS.text, fontWeight: '600', fontSize: 13 },
  sessaoTitulo: { color: COLORS.text, fontWeight: '700', fontSize: 15, marginTop: 24, marginBottom: 12 },
  btnIniciar: { backgroundColor: '#000', borderWidth: 1, borderColor: '#333', paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginBottom: 10 },
  btnIniciarText: { color: COLORS.text, fontWeight: '700' },
  btnCriar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: COLORS.green, paddingVertical: 14, borderRadius: 12 },
  btnCriarText: { color: '#000', fontWeight: '700' },
});