import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const COLORS = { bg: '#121212', card: '#1E1E1E', green: '#3DDC5C', text: '#FFFFFF', muted: '#8A8A8A', inputBg: '#2A2A2A', azul: '#4DA3FF' };

export default function NovaSessaoComExercicio({ navigation }) {
  const [titulo, setTitulo] = useState('');
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
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.rankingButton}
            onPress={() => navigation?.navigate('Ranking')}
            accessibilityLabel="Abrir ranking"
          >
            <Ionicons name="trophy-outline" size={16} color={COLORS.text} />
            <Text style={styles.rankingText}>Ranking</Text>
          </TouchableOpacity>
          <Text style={styles.logo}>Gym<Text style={{ color: COLORS.green }}>vance</Text></Text>
        </View>
      </View>

      <TouchableOpacity style={styles.backBtn} onPress={() => navigation?.goBack()}>
        <Ionicons name="chevron-back" size={22} color={COLORS.green} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.btnUsarSessao}>
        <Ionicons name="add" size={18} color="#000" />
        <Text style={styles.btnUsarSessaoText}>Usar sessão criada</Text>
      </TouchableOpacity>

      <Text style={styles.label}>Título da sessão</Text>
      <TextInput
        placeholder="Adicionar título..."
        placeholderTextColor={COLORS.muted}
        value={titulo}
        onChangeText={setTitulo}
        style={styles.input}
      />

      <View style={{ flex: 1 }} />

      <View style={styles.rodape}>
        <TouchableOpacity style={styles.btnExercicio}>
          <Ionicons name="add" size={16} color={COLORS.green} />
          <Text style={styles.btnExercicioText}>Exercício</Text>
        </TouchableOpacity>
        <TouchableOpacity>
          <Text style={styles.linkDescartar}>Descartar Sessão</Text>
        </TouchableOpacity>
      </View>

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
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  rankingButton: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#1E1E1E', borderRadius: 10, borderWidth: 1, borderColor: '#333', paddingHorizontal: 8, paddingVertical: 6 },
  rankingText: { color: COLORS.text, fontSize: 11, fontWeight: '700' },
  logo: { color: COLORS.text, fontWeight: '800', fontSize: 16 },
  backBtn: { marginTop: 14, marginBottom: 14 },
  btnUsarSessao: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: COLORS.green, paddingVertical: 12, borderRadius: 12, marginBottom: 18 },
  btnUsarSessaoText: { color: '#000', fontWeight: '700' },
  label: { color: COLORS.text, fontWeight: '600', marginBottom: 8 },
  input: { backgroundColor: COLORS.inputBg, color: COLORS.text, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12 },
  rodape: { gap: 14, marginBottom: 8, alignItems: 'stretch' },
  btnExercicio: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderWidth: 1, borderColor: COLORS.green, paddingVertical: 12, borderRadius: 12 },
  btnExercicioText: { color: COLORS.green, fontWeight: '700' },
  linkDescartar: { color: COLORS.azul, textAlign: 'center', fontWeight: '600', textDecorationLine: 'underline' },
  bottomNav: { flexDirection: 'row', justifyContent: 'space-around', borderTopWidth: 1, borderTopColor: '#242424', paddingTop: 10 },
  navItem: { alignItems: 'center', gap: 2 },
  navLabel: { color: COLORS.muted, fontSize: 11 },
});