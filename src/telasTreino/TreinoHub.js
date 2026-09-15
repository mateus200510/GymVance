import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

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
  return (
    <SafeAreaView style={styles.safe}>
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

      <TouchableOpacity style={styles.btnIniciar}>
        <Text style={styles.btnIniciarText}>Iniciar treino</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.btnCriar} onPress={() => navigation?.navigate('NovaSessao')}>
        <Ionicons name="add" size={18} color="#000" />
        <Text style={styles.btnCriarText}>Criar sessão de treino</Text>
      </TouchableOpacity>

      <BottomNav active="Treino" />
    </SafeAreaView>
  );
}

function BottomNav({ active }) {
  const itens = [
    { nome: 'Treino', icon: 'barbell-outline' },
    { nome: 'Alimentação', icon: 'heart-outline' },
    { nome: 'Relógio', icon: 'watch-outline' },
  ];
  return (
    <View style={styles.bottomNav}>
      {itens.map((it) => (
        <View key={it.nome} style={styles.navItem}>
          <Ionicons name={it.icon} size={20} color={it.nome === active ? COLORS.green : COLORS.muted} />
          <Text style={[styles.navLabel, it.nome === active && { color: COLORS.green }]}>{it.nome}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg, paddingHorizontal: 16 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 8 },
  streak: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  streakTexto: { color: COLORS.text, fontWeight: '700' },
  userBox: { marginLeft: 8 },
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
  bottomNav: { flexDirection: 'row', justifyContent: 'space-around', borderTopWidth: 1, borderTopColor: '#242424', paddingVertical: 10, position: 'absolute', bottom: 0, left: 0, right: 0 },
  navItem: { alignItems: 'center', gap: 2 },
  navLabel: { color: COLORS.muted, fontSize: 11 },
});