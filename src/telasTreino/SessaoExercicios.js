import React from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const COLORS = { bg: '#121212', card: '#1E1E1E', green: '#3DDC5C', red: '#E5484D', text: '#FFFFFF', muted: '#8A8A8A', inputBg: '#2A2A2A' };

export default function SessaoExercicios({ navigation }) {
  const insets = useSafeAreaInsets();

return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 24 }}>
        <View style={styles.card}>
          <View style={styles.linhaReservas}>
            <Text style={styles.reservaTexto}>2 séries reservas</Text>
          </View>
          <LinhaSerie numero={2} kg="80" reps="8" concluido />
          <Text style={styles.notaTexto}>2 séries reservas</Text>
          <LinhaSerie numero={3} kg="80" reps="8" concluido />
          <Text style={styles.notaTexto}>2 séries reservas</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.exercicioNome}>Crossover</Text>
            <Ionicons name="ellipsis-vertical" size={18} color={COLORS.muted} />
          </View>
          <View style={styles.tabelaHeader}>
            <Text style={[styles.colLabel, { flex: 0.6 }]}>Série</Text>
            <Text style={[styles.colLabel, { flex: 1 }]}>Kg</Text>
            <Text style={[styles.colLabel, { flex: 1 }]}>Reps</Text>
            <Text style={[styles.colLabel, { flex: 1 }]}>Notas</Text>
          </View>
          <LinhaSerie numero={1} kg="80" reps="8" concluido />
          <Text style={styles.notaTexto}>2 séries reservas</Text>
          <LinhaSerie numero={2} kg="100" reps="5" falhou />
          <TextInput
            placeholder="Adicionar notas..."
            placeholderTextColor={COLORS.muted}
            style={styles.notaInput}
          />
        </View>
      </ScrollView>

      <BottomNav navigation={navigation} active="Treino" insets={insets} />
    </SafeAreaView>
  );
}

function LinhaSerie({ numero, kg, reps, concluido, falhou }) {
  return (
    <View style={styles.linhaSerie}>
      <View style={styles.serieBadge}>
        <Text style={styles.serieBadgeText}>{numero}</Text>
      </View>
      <Text style={styles.valorTexto}>{kg}</Text>
      <Text style={styles.valorTexto}>{reps}</Text>
      <View style={{ flex: 1 }} />
      <View style={styles.acoesLinha}>
        <View style={[styles.circulo, falhou && styles.circuloRed]}>
          <Ionicons name="close" size={14} color="#fff" />
        </View>
        <View style={[styles.circulo, concluido && styles.circuloGreen]}>
          <Ionicons name="checkmark" size={14} color="#fff" />
        </View>
      </View>
    </View>
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
  scrollContent: { paddingBottom: 24 },
  card: { backgroundColor: COLORS.card, borderRadius: 16, padding: 14, marginBottom: 14 },
  linhaReservas: { marginBottom: 6 },
  reservaTexto: { color: COLORS.muted, fontSize: 12 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  exercicioNome: { color: COLORS.text, fontSize: 16, fontWeight: '600' },
  tabelaHeader: { flexDirection: 'row', marginBottom: 6 },
  colLabel: { color: COLORS.muted, fontSize: 12 },
  linhaSerie: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 4 },
  serieBadge: { backgroundColor: COLORS.inputBg, borderRadius: 6, width: 26, height: 26, alignItems: 'center', justifyContent: 'center' },
  serieBadgeText: { color: COLORS.text, fontWeight: '700', fontSize: 12 },
  valorTexto: { color: COLORS.text, fontSize: 14, width: 40 },
  acoesLinha: { flexDirection: 'row', gap: 6 },
  circulo: { width: 24, height: 24, borderRadius: 12, backgroundColor: COLORS.inputBg, alignItems: 'center', justifyContent: 'center' },
  circuloGreen: { backgroundColor: COLORS.green },
  circuloRed: { backgroundColor: COLORS.red },
  notaTexto: { color: COLORS.muted, fontSize: 12, marginBottom: 8 },
  notaInput: { backgroundColor: COLORS.inputBg, color: COLORS.text, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, fontSize: 12, marginTop: 6 },
  bottomNav: { flexDirection: 'row', justifyContent: 'space-around', borderTopWidth: 1, borderTopColor: '#242424', paddingTop: 10 },
  navItem: { alignItems: 'center', gap: 2 },
  navLabel: { color: COLORS.muted, fontSize: 11 },
});