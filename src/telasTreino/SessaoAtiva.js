import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, SafeAreaView, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Accelerometer } from 'expo-sensors';

import { saveWorkoutHistory } from '../services/storage';

const COLORS = {
  bg: '#121212',
  card: '#1E1E1E',
  green: '#3DDC5C',
  red: '#E5484D',
  text: '#FFFFFF',
  muted: '#8A8A8A',
  inputBg: '#2A2A2A',
};

export default function SessaoAtiva({ navigation }) {
  const insets = useSafeAreaInsets();
  const [series, setSeries] = useState([
    { id: 1, kg: '80', reps: '8', concluido: true, falhou: false, nota: '2 séries reservas' },
    { id: 2, kg: '100', reps: '5', concluido: false, falhou: true, nota: '' },
  ]);
  const [tempo] = useState('00:15:42');
  const [instabilidade, setInstabilidade] = useState('');
  const [ultimaAceleracao, setUltimaAceleracao] = useState({ x: 0, y: 0, z: 0 });

  useEffect(() => {
    let subscription;

    try {
      subscription = Accelerometer.addListener((data) => {
        setUltimaAceleracao(data);
      });
    } catch (error) {
      console.warn('Acelerômetro indisponível:', error);
    }

    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, []);

  const toggleConcluido = (id) => {
    setSeries((prev) =>
      prev.map((s) => (s.id === id ? { ...s, concluido: !s.concluido, falhou: false } : s))
    );
  };

  const adicionarSerie = () => {
    setSeries((prev) => [
      ...prev,
      { id: prev.length + 1, kg: '', reps: '', concluido: false, falhou: false, nota: '' },
    ]);
  };

  const handleConcluir = async () => {
    const magnitude = Math.sqrt(
      ultimaAceleracao.x ** 2 +
      ultimaAceleracao.y ** 2 +
      ultimaAceleracao.z ** 2
    );

    if (Number.isFinite(magnitude) && magnitude > 2.0) {
      setInstabilidade('Instabilidade Física Detectada');
      Alert.alert('Instabilidade Física Detectada');
      return;
    }

    try {
      const treino = {
        treino: 'Sessão Ativa',
        data: new Date().toISOString(),
        duracao: tempo,
        exercicios: series,
      };

      await saveWorkoutHistory(treino);
      Alert.alert('Treino concluído', 'Seu treino foi salvo no histórico local.');
      navigation?.navigate('TreinoHub');
    } catch (error) {
      console.warn('Erro ao salvar treino:', error);
      Alert.alert('Erro', 'Não foi possível salvar o treino localmente.');
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { paddingBottom: 12 + insets.bottom }]}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation?.goBack()}>
          <Ionicons name="chevron-back" size={26} color={COLORS.text} />
        </TouchableOpacity>
        <View style={styles.timerPill}>
          <Text style={styles.timerText}>{tempo}</Text>
        </View>
        <TouchableOpacity style={styles.concluirBtn} onPress={handleConcluir}>
          <Text style={styles.concluirBtnText}>Concluir</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.sessaoAtivaTag}>
        <Text style={styles.sessaoAtivaTagText}>SESSÃO ATIVA</Text>
      </View>

      {instabilidade !== '' && (
        <Text style={styles.instabilidadeTexto}>{instabilidade}</Text>
      )}

      <Text style={styles.titulo}>Evolução Diária</Text>

      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.exercicioNome}>Supino Reto</Text>
            <Ionicons name="ellipsis-vertical" size={18} color={COLORS.muted} />
          </View>

          <View style={styles.tabelaHeader}>
            <Text style={[styles.colLabel, { flex: 0.6 }]}>Série</Text>
            <Text style={[styles.colLabel, { flex: 1 }]}>Kg</Text>
            <Text style={[styles.colLabel, { flex: 1 }]}>Reps</Text>
            <Text style={[styles.colLabel, { flex: 1 }]}>Notas</Text>
            <View style={{ width: 60 }} />
          </View>

          {series.map((s, idx) => (
            <View key={s.id}>
              <View style={styles.linhaSerie}>
                <View style={[styles.serieBadge, { flex: 0.6 }]}>
                  <Text style={styles.serieBadgeText}>{idx + 1}</Text>
                </View>
                <Text style={[styles.valorTexto, { flex: 1 }]}>{s.kg}</Text>
                <Text style={[styles.valorTexto, { flex: 1 }]}>{s.reps}</Text>
                <View style={{ flex: 1 }} />
                <View style={styles.acoesLinha}>
                  <TouchableOpacity
                    style={[styles.circulo, s.falhou && styles.circuloRed]}
                  >
                    <Ionicons name="close" size={14} color="#fff" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.circulo, s.concluido && styles.circuloGreen]}
                    onPress={() => toggleConcluido(s.id)}
                  >
                    <Ionicons name="checkmark" size={14} color="#fff" />
                  </TouchableOpacity>
                </View>
              </View>
              <TextInput
                placeholder="Adicionar notas..."
                placeholderTextColor={COLORS.muted}
                defaultValue={s.nota}
                style={styles.notaInput}
              />
            </View>
          ))}

          <View style={styles.botoesCard}>
            <TouchableOpacity style={styles.btnSerie} onPress={adicionarSerie}>
              <Ionicons name="add" size={16} color={COLORS.green} />
              <Text style={styles.btnSerieText}>Série</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnDescartar}>
              <Ionicons name="trash-outline" size={16} color={COLORS.muted} />
              <Text style={styles.btnDescartarText}>Descartar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <View style={styles.rodapeAcoes}>
        <TouchableOpacity style={styles.btnExercicio}>
          <Ionicons name="add" size={18} color="#000" />
          <Text style={styles.btnExercicioText}>Exercício</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btnDescartarTreino}>
          <Ionicons name="trash-outline" size={16} color={COLORS.muted} />
          <Text style={styles.btnDescartarText}>Descartar Treino</Text>
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
          <Ionicons
            name={it.icon}
            size={20}
            color={it.nome === active ? COLORS.green : COLORS.muted}
          />
          <Text style={[styles.navLabel, it.nome === active && { color: COLORS.green }]}>
            {it.nome}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg, paddingHorizontal: 16 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 },
  timerPill: { backgroundColor: COLORS.inputBg, paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20 },
  timerText: { color: COLORS.text, fontWeight: '600' },
  concluirBtn: { backgroundColor: COLORS.green, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  concluirBtnText: { color: '#000', fontWeight: '700' },
  sessaoAtivaTag: { marginTop: 16 },
  sessaoAtivaTagText: { color: COLORS.red, fontWeight: '700', fontSize: 12, letterSpacing: 1 },
  instabilidadeTexto: { color: COLORS.red, fontWeight: '700', fontSize: 12, marginTop: 8 },
  titulo: { color: COLORS.text, fontSize: 24, fontWeight: '700', marginTop: 4, marginBottom: 16 },
  card: { backgroundColor: COLORS.card, borderRadius: 16, padding: 14 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  exercicioNome: { color: COLORS.text, fontSize: 16, fontWeight: '600' },
  tabelaHeader: { flexDirection: 'row', marginBottom: 6 },
  colLabel: { color: COLORS.muted, fontSize: 12 },
  linhaSerie: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  serieBadge: { backgroundColor: COLORS.inputBg, borderRadius: 6, width: 26, height: 26, alignItems: 'center', justifyContent: 'center' },
  serieBadgeText: { color: COLORS.text, fontWeight: '700', fontSize: 12 },
  valorTexto: { color: COLORS.text, fontSize: 14 },
  acoesLinha: { flexDirection: 'row', gap: 6 },
  circulo: { width: 24, height: 24, borderRadius: 12, backgroundColor: COLORS.inputBg, alignItems: 'center', justifyContent: 'center', marginLeft: 4 },
  circuloGreen: { backgroundColor: COLORS.green },
  circuloRed: { backgroundColor: COLORS.red },
  notaInput: { backgroundColor: COLORS.inputBg, color: COLORS.text, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, fontSize: 12, marginBottom: 10 },
  botoesCard: { flexDirection: 'row', gap: 10, marginTop: 4 },
  btnSerie: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: COLORS.inputBg, paddingVertical: 10, borderRadius: 10, flex: 1, justifyContent: 'center' },
  btnSerieText: { color: COLORS.green, fontWeight: '600' },
  btnDescartar: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: COLORS.inputBg, paddingVertical: 10, borderRadius: 10, flex: 1, justifyContent: 'center' },
  btnDescartarText: { color: COLORS.muted, fontWeight: '600', fontSize: 13 },
  rodapeAcoes: { gap: 10, marginBottom: 8 },
  btnExercicio: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: COLORS.green, paddingVertical: 12, borderRadius: 12 },
  btnExercicioText: { color: '#000', fontWeight: '700' },
  btnDescartarTreino: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: COLORS.card, paddingVertical: 12, borderRadius: 12 },
  bottomNav: { flexDirection: 'row', justifyContent: 'space-around', borderTopWidth: 1, borderTopColor: '#242424', paddingTop: 10 },
  navItem: { alignItems: 'center', gap: 2 },
  navLabel: { color: COLORS.muted, fontSize: 11 },
});