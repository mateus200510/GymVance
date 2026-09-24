import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import BottomNavBar from '../components/BottomNavBar';
import { useNomeUsuario } from '../services/useUserProfile';
import { useIdioma, chaveTraducaoGrupoMuscular, chaveTraducaoEquipamento } from '../services/idioma';
import { nomeExercicio } from '../services/storage';

const COLORS = { bg: '#121212', card: '#1E1E1E', green: '#3DDC5C', text: '#FFFFFF', muted: '#8A8A8A', inputBg: '#2A2A2A' };

export default function NovaSessao({ navigation, route }) {
  const { t, idioma } = useIdioma();
  const [titulo, setTitulo] = useState('');
  const [exerciciosSelecionados, setExerciciosSelecionados] = useState([]);
  const nomeUsuario = useNomeUsuario();

  useFocusEffect(
    useCallback(() => {
      const exercicio = route?.params?.exercicioSelecionado;
      if (exercicio?.id) {
        setExerciciosSelecionados((prev) => {
          if (prev.some((e) => e.id === exercicio.id)) {
            return prev;
          }
          return [...prev, { ...exercicio, series: [{ tipo: 'NORMAL', kg: '', reps: '', concluido: false, falhou: false, nota: '' }] }];
        });
        navigation?.setParams({ ...route.params, exercicioSelecionado: undefined });
      }
    }, [route, navigation])
  );

  const removerExercicio = (id) => {
    setExerciciosSelecionados((prev) => prev.filter((e) => e.id !== id));
  };

  const handleIniciarTreino = () => {
    if (!titulo.trim()) {
      Alert.alert(t('comum.erro'), t('novaSessao.erroSemTitulo'));
      return;
    }
    if (exerciciosSelecionados.length === 0) {
      Alert.alert(t('comum.erro'), t('novaSessao.erroSemExercicios'));
      return;
    }
    navigation?.navigate('SessaoAtiva', { titulo, exercicios: exerciciosSelecionados });
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.tituloSecundario}>{t('comum.evolucaoDiaria')}</Text>
          <View style={styles.userRow}>
            <View style={styles.avatar} />
            <Text style={styles.userNome} numberOfLines={1} ellipsizeMode="tail">{nomeUsuario}</Text>
          </View>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.rankingButton}
            onPress={() => navigation?.navigate('Ranking')}
            accessibilityLabel={t('comum.abrirRanking')}
          >
            <Ionicons name="trophy-outline" size={16} color={COLORS.text} />
            <Text style={styles.rankingText}>{t('comum.ranking')}</Text>
          </TouchableOpacity>
          <Text style={styles.logo}>Gym<Text style={{ color: COLORS.green }}>Vance</Text></Text>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation?.goBack()}>
          <Ionicons name="chevron-back" size={22} color={COLORS.green} />
        </TouchableOpacity>

        <Text style={styles.label}>{t('novaSessao.titulo')}</Text>
        <TextInput
          placeholder={t('novaSessao.placeholderTitulo')}
          placeholderTextColor={COLORS.muted}
          value={titulo}
          onChangeText={setTitulo}
          style={styles.input}
        />

        {exerciciosSelecionados.length > 0 && (
          <View style={styles.exerciciosList}>
            <Text style={styles.secaoTitulo}>{t('novaSessao.exerciciosDaSessao')} ({exerciciosSelecionados.length})</Text>
            {exerciciosSelecionados.map((ex, idx) => (
              <View key={ex.id} style={styles.exercicioItemSelecionado}>
                <View style={styles.exercicioInfoSelecionado}>
                  <Text style={styles.exercicioNomeSelecionado}>{idx + 1}. {nomeExercicio(ex, idioma)}</Text>
                  <Text style={styles.exercicioGrupoSelecionado}>{t(chaveTraducaoGrupoMuscular(ex.grupoMuscular)) || ex.grupoMuscular} • {t(chaveTraducaoEquipamento(ex.equipamento)) || ex.equipamento}</Text>
                </View>
                <TouchableOpacity style={styles.btnRemoverExercicio} onPress={() => removerExercicio(ex.id)}>
                  <Ionicons name="trash-outline" size={18} color="#FF453A" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        <TouchableOpacity
          style={styles.btnAdicionarExercicio}
          onPress={() => navigation?.navigate('CatalogoExercicios', { selecao: true })}
        >
          <Ionicons name="add-circle-outline" size={18} color={COLORS.green} />
          <Text style={styles.btnAdicionarExercicioText}>{t('novaSessao.adicionarExercicio')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.btnIniciarTreino}
          onPress={handleIniciarTreino}
        >
          <Ionicons name="play" size={18} color="#000" />
          <Text style={styles.btnIniciarTreinoText}>{t('novaSessao.iniciarTreino')}</Text>
        </TouchableOpacity>

        <View style={{ flex: 1 }} />
      </ScrollView>

      <BottomNavBar activeTab="treino" />
    </SafeAreaView>
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
  label: { color: COLORS.text, fontWeight: '600', marginBottom: 8, marginTop: 8 },
  input: { backgroundColor: COLORS.inputBg, color: COLORS.text, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 16 },
  btnAdicionarExercicio: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: COLORS.inputBg, paddingVertical: 12, borderRadius: 12, marginTop: 12, borderWidth: 1, borderColor: '#333' },
  btnAdicionarExercicioText: { color: COLORS.green, fontWeight: '700' },
  exerciciosList: { marginTop: 16, marginBottom: 16 },
  secaoTitulo: { color: COLORS.muted, fontSize: 13, marginBottom: 12 },
  exercicioItemSelecionado: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: COLORS.card, borderRadius: 10, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: '#333' },
  exercicioInfoSelecionado: { flex: 1 },
  exercicioNomeSelecionado: { color: COLORS.text, fontSize: 14, fontWeight: '600' },
  exercicioGrupoSelecionado: { color: COLORS.muted, fontSize: 11, marginTop: 2 },
  btnRemoverExercicio: { padding: 4 },
  btnIniciarTreino: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: COLORS.green, paddingVertical: 14, borderRadius: 12, marginTop: 16 },
  btnIniciarTreinoText: { color: '#000', fontWeight: '700', fontSize: 14 },
});