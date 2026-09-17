import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const COLORS = { bg: '#121212', card: '#1E1E1E', green: '#3DDC5C', text: '#FFFFFF', muted: '#8A8A8A' };

const DIAS_SEMANA = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

// cada linha: números do mês (dias fora do mês em cinza), diasComTreino = concluído (verde)
const SEMANAS = [
  [27, 28, 29, 30, 1, 2, 3],
  [4, 5, 6, 7, 8, 9, 10],
  [11, 12, 13, 14, 15, 16, 17],
  [18, 19, 20, 21, 22, 23, 24],
  [25, 26, 27, 28, 29, 30, 31],
];

const DIAS_TREINO = [1, 3, 6, 8, 9, 14, 15, 16, 20, 21, 22, 23];
const FORA_DO_MES = [27, 28, 29, 30];

export default function CalendarioMensal({ navigation }) {
  const insets = useSafeAreaInsets();

return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <View style={styles.topRow}>
        <TouchableOpacity onPress={() => navigation?.goBack()}>
          <Ionicons name="chevron-back" size={22} color={COLORS.green} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.rankingButton}
          onPress={() => navigation?.navigate('Ranking')}
          accessibilityLabel="Abrir ranking"
        >
          <Ionicons name="trophy-outline" size={16} color={COLORS.text} />
          <Text style={styles.rankingText}>Ranking</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.mes}>Outubro</Text>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.diasSemanaRow}>
          {DIAS_SEMANA.map((d, i) => (
            <Text key={i} style={styles.diaSemanaLetra}>{d}</Text>
          ))}
        </View>

        {SEMANAS.map((semana, i) => (
          <View key={i} style={styles.semanaRow}>
            {semana.map((num, j) => {
              const foraDoMes = i === 0 && FORA_DO_MES.includes(num);
              const temTreino = DIAS_TREINO.includes(num) && !foraDoMes;
              return (
                <View key={j} style={styles.diaCelula}>
                  <View style={[styles.diaCirculo, temTreino && styles.diaCirculoAtivo]}>
                    <Text style={[styles.diaNumero, foraDoMes && { color: '#444' }]}>{num}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        ))}

        <View style={{ flex: 1 }} />

        <TouchableOpacity style={styles.btnCriarSemana}>
          <Ionicons name="add" size={18} color="#000" />
          <Text style={styles.btnCriarSemanaText}>Criar semana de treino</Text>
        </TouchableOpacity>
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
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 },
  rankingButton: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#1E1E1E', borderRadius: 10, borderWidth: 1, borderColor: '#333', paddingHorizontal: 8, paddingVertical: 6 },
  rankingText: { color: COLORS.text, fontSize: 11, fontWeight: '700' },
  mes: { color: COLORS.green, fontWeight: '700', fontSize: 18, marginVertical: 14 },
  diasSemanaRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  diaSemanaLetra: { color: COLORS.muted, width: 34, textAlign: 'center', fontSize: 12 },
  semanaRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  diaCelula: { width: 34, alignItems: 'center' },
  diaCirculo: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  diaCirculoAtivo: { backgroundColor: COLORS.green },
  diaNumero: { color: COLORS.text, fontSize: 12, fontWeight: '600' },
  btnCriarSemana: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: COLORS.green, paddingVertical: 14, borderRadius: 12, marginBottom: 12 },
  btnCriarSemanaText: { color: '#000', fontWeight: '700' },
  bottomNav: { flexDirection: 'row', justifyContent: 'space-around', borderTopWidth: 1, borderTopColor: '#242424', paddingTop: 10 },
  navItem: { alignItems: 'center', gap: 2 },
  navLabel: { color: COLORS.muted, fontSize: 11 },
});