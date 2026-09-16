import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const COLORS = { bg: '#121212', card: '#1E1E1E', green: '#3DDC5C', text: '#FFFFFF', muted: '#8A8A8A' };

const DIAS = [
  { nome: 'DOMINGO', tipo: 'DESCANSO', icone: 'moon-outline', ativo: false },
  { nome: 'SEGUNDA', tipo: 'PUSH', ativo: false },
  { nome: 'TERÇA', tipo: 'PULL', ativo: false },
  { nome: 'QUARTA', tipo: 'DESCANSO', ativo: false },
  { nome: 'QUINTA', tipo: 'LEGS', ativo: false },
  { nome: 'SEXTA', tipo: 'CARDIO', ativo: true },
  { nome: 'SÁBADO', tipo: 'LEGS', ativo: false },
];

export default function PlanoSemanal({ navigation }) {
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView style={[styles.safe, { paddingBottom: 12 + insets.bottom }]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.tituloSecundario}>Evolução diária</Text>
          <View style={styles.userRow}>
            <View style={styles.avatar} />
            <Text style={styles.userNome}>Lucas Miyashiro</Text>
          </View>
        </View>
        <Text style={styles.logo}>Gym<Text style={{ color: COLORS.green }}>vance</Text></Text>
      </View>

      <TouchableOpacity style={styles.backBtn} onPress={() => navigation?.goBack()}>
        <Ionicons name="chevron-back" size={22} color={COLORS.green} />
      </TouchableOpacity>

      <ScrollView contentContainerStyle={{ paddingBottom: 24, gap: 10 }}>
        {DIAS.map((dia) => (
          <TouchableOpacity
            key={dia.nome}
            style={[styles.diaCard, dia.ativo && styles.diaCardAtivo]}
          >
            <Text style={[styles.diaTexto, dia.ativo && { color: COLORS.green }]}>
              {dia.nome} : {dia.tipo}
            </Text>
            {dia.icone && <Ionicons name={dia.icone} size={16} color={COLORS.muted} />}
          </TouchableOpacity>
        ))}
      </ScrollView>

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
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: 8 },
  tituloSecundario: { color: COLORS.muted, fontSize: 11 },
  userRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  avatar: { width: 22, height: 22, borderRadius: 11, backgroundColor: '#333' },
  userNome: { color: COLORS.text, fontWeight: '600', fontSize: 13 },
  logo: { color: COLORS.text, fontWeight: '800', fontSize: 16 },
  backBtn: { marginTop: 14, marginBottom: 10 },
  diaCard: { backgroundColor: COLORS.card, borderRadius: 12, paddingVertical: 16, paddingHorizontal: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  diaCardAtivo: { borderWidth: 1, borderColor: COLORS.green },
  diaTexto: { color: COLORS.text, fontWeight: '600', fontSize: 13, letterSpacing: 0.5 },
  bottomNav: { flexDirection: 'row', justifyContent: 'space-around', borderTopWidth: 1, borderTopColor: '#242424', paddingTop: 10 },
  navItem: { alignItems: 'center', gap: 2 },
  navLabel: { color: COLORS.muted, fontSize: 11 },
});