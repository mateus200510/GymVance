import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Image,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import BottomNavBar from '../components/BottomNavBar';
import { useNomeUsuario, useFotoPerfil } from '../services/useUserProfile';
import { TIPOS_SERIE, TIPO_PADRAO, criarSerie, tipoDe, numeroNormalDaSerie, rotuloDaSerie } from '../services/series';
import { useIdioma, chaveTraducaoGrupoMuscular, chaveTraducaoEquipamento } from '../services/idioma';
import { nomeExercicio } from '../services/storage';

const COLORS = { bg: '#121212', card: '#1E1E1E', green: '#3DDC5C', text: '#FFFFFF', muted: '#8A8A8A', inputBg: '#2A2A2A' };

export default function NovaSessao({ navigation, route }) {
  const { t, idioma } = useIdioma();
  const [titulo, setTitulo] = useState('');
  const [exerciciosSelecionados, setExerciciosSelecionados] = useState([]);
  const nomeUsuario = useNomeUsuario();
  const fotoUsuario = useFotoPerfil();
  const [serieEditando, setSerieEditando] = useState(null);

  useFocusEffect(
    useCallback(() => {
      const exercicio = route?.params?.exercicioSelecionado;
      if (exercicio?.id) {
        setExerciciosSelecionados((prev) => {
          if (prev.some((e) => e.id === exercicio.id)) {
            return prev;
          }
          return [...prev, { ...exercicio, series: [] }];
        });
        navigation?.setParams({ ...route.params, exercicioSelecionado: undefined });
      }
    }, [route, navigation])
  );

  const removerExercicio = (id) => {
    setExerciciosSelecionados((prev) => prev.filter((e) => e.id !== id));
  };

  // Todo o CRUD de séries opera sobre `exerciciosSelecionados[exIdx].series`.
  // É o mesmo estado enviado para a SessaoAtiva, então o que se vê é o que persiste.
  const adicionarSerie = (exIdx) => {
    setExerciciosSelecionados((prev) =>
      prev.map((ex, i) => (i === exIdx ? { ...ex, series: [...(ex.series || []), criarSerie()] } : ex))
    );
  };

  const atualizarSerie = (exIdx, serieId, campo, valor) => {
    setExerciciosSelecionados((prev) =>
      prev.map((ex, i) =>
        i === exIdx
          ? { ...ex, series: (ex.series || []).map((s) => (s.id === serieId ? { ...s, [campo]: valor } : s)) }
          : ex
      )
    );
  };

  const alterarTipoSerie = (exIdx, serieId, tipo) => {
    setExerciciosSelecionados((prev) =>
      prev.map((ex, i) =>
        i === exIdx
          ? { ...ex, series: (ex.series || []).map((s) => (s.id === serieId ? { ...s, tipo } : s)) }
          : ex
      )
    );
    setSerieEditando(null);
  };

  const removerSerie = (exIdx, serieId) => {
    setExerciciosSelecionados((prev) =>
      prev.map((ex, i) => (i === exIdx ? { ...ex, series: (ex.series || []).filter((s) => s.id !== serieId) } : ex))
    );
    setSerieEditando(null);
  };

  const serieEmEdicao = serieEditando
    ? (exerciciosSelecionados[serieEditando.exIdx]?.series || []).find((s) => s.id === serieEditando.serieId) || null
    : null;

  const seriesDoExercicioEdicao = serieEditando
    ? exerciciosSelecionados[serieEditando.exIdx]?.series || []
    : [];

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
            <View style={styles.avatar}>
              {fotoUsuario ? <Image source={{ uri: fotoUsuario }} style={styles.avatarImage} /> : null}
            </View>
            <Text style={styles.userNome} numberOfLines={1} ellipsizeMode="tail">{nomeUsuario || '—'}</Text>
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
            {exerciciosSelecionados.map((ex, exIdx) => (
              <View key={ex.id} style={styles.exercicioItemSelecionado}>
                <View style={styles.exercicioInfoSelecionado}>
                  <Text style={styles.exercicioNomeSelecionado}>{exIdx + 1}. {nomeExercicio(ex, idioma)}</Text>
                  <Text style={styles.exercicioGrupoSelecionado}>{t(chaveTraducaoGrupoMuscular(ex.grupoMuscular)) || ex.grupoMuscular} • {t(chaveTraducaoEquipamento(ex.equipamento)) || ex.equipamento}</Text>

                  {(ex.series || []).map((s) => (
                    <View key={s.id} style={styles.linhaSerie}>
                      <TouchableOpacity
                        style={styles.serieBadge}
                        onPress={() => setSerieEditando({ exIdx, serieId: s.id })}
                        accessibilityLabel={t('sessaoAtiva.acessibilidadeBadge')}
                      >
                        <Text style={styles.serieBadgeText}>{rotuloDaSerie(ex.series, s)}</Text>
                      </TouchableOpacity>
                      <TextInput
                        style={styles.valorInput}
                        value={s.kg}
                        onChangeText={(texto) => atualizarSerie(exIdx, s.id, 'kg', texto)}
                        keyboardType="numeric"
                        placeholder={t('sessaoAtiva.colKg')}
                        placeholderTextColor={COLORS.muted}
                      />
                      <TextInput
                        style={styles.valorInput}
                        value={s.reps}
                        onChangeText={(texto) => atualizarSerie(exIdx, s.id, 'reps', texto)}
                        keyboardType="number-pad"
                        placeholder={t('sessaoAtiva.colReps')}
                        placeholderTextColor={COLORS.muted}
                      />
                      <TouchableOpacity
                        style={styles.btnRemoverSerie}
                        onPress={() => removerSerie(exIdx, s.id)}
                        accessibilityLabel={t('sessaoAtiva.removerSerie')}
                      >
                        <Ionicons name="trash-outline" size={16} color="#FF453A" />
                      </TouchableOpacity>
                    </View>
                  ))}

                  <TouchableOpacity style={styles.btnAdicionarSerie} onPress={() => adicionarSerie(exIdx)}>
                    <Ionicons name="add" size={14} color={COLORS.green} />
                    <Text style={styles.btnAdicionarSerieText}>{t('novaSessao.adicionarSerie')}</Text>
                  </TouchableOpacity>
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

      <Modal
        visible={serieEmEdicao !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setSerieEditando(null)}
      >
        <TouchableOpacity
          style={styles.modalFundo}
          activeOpacity={1}
          onPress={() => setSerieEditando(null)}
        >
          <View style={styles.menuSerie}>
            <Text style={styles.menuTitulo}>
              {serieEmEdicao
                ? (tipoDe(serieEmEdicao) === TIPO_PADRAO
                    ? `${t('sessaoAtiva.serieLabel')} ${numeroNormalDaSerie(seriesDoExercicioEdicao, serieEmEdicao)}`
                    : t(`tipo.${tipoDe(serieEmEdicao)}`))
                : ''}
            </Text>
            <Text style={styles.menuSubtitulo}>{t('sessaoAtiva.menuSubtitulo')}</Text>

            {TIPOS_SERIE.map((item) => {
              const ativo = serieEmEdicao && tipoDe(serieEmEdicao) === item.tipo;
              return (
                <TouchableOpacity
                  key={item.tipo}
                  style={[styles.menuItem, ativo && styles.menuItemAtivo]}
                  onPress={() => serieEmEdicao && alterarTipoSerie(serieEditando.exIdx, serieEmEdicao.id, item.tipo)}
                >
                  <View style={[styles.menuSigla, item.tipo === TIPO_PADRAO && styles.menuSiglaNormal]}>
                    <Text style={styles.menuSiglaText}>{item.sigla}</Text>
                  </View>
                  <Text style={[styles.menuItemLabel, ativo && styles.menuItemLabelAtivo]}>{t(`tipo.${item.tipo}`)}</Text>
                  {ativo && <Ionicons name="checkmark" size={16} color={COLORS.green} />}
                </TouchableOpacity>
              );
            })}

            <View style={styles.menuDivisor} />

            <TouchableOpacity
              style={styles.menuRemover}
              onPress={() => serieEmEdicao && removerSerie(serieEditando.exIdx, serieEmEdicao.id)}
            >
              <Ionicons name="trash-outline" size={16} color="#E5484D" />
              <Text style={styles.menuRemoverText}>{t('sessaoAtiva.removerSerie')}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuCancelar} onPress={() => setSerieEditando(null)}>
              <Text style={styles.menuCancelarText}>{t('sessaoAtiva.cancelar')}</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

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
  avatarImage: { width: 22, height: 22, borderRadius: 11 },
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
  linhaSerie: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 },
  serieBadge: { backgroundColor: COLORS.inputBg, borderRadius: 6, width: 26, height: 26, alignItems: 'center', justifyContent: 'center' },
  serieBadgeText: { color: COLORS.text, fontWeight: '700', fontSize: 12 },
  valorInput: { flex: 1, backgroundColor: COLORS.inputBg, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 4, color: COLORS.text, fontSize: 13, textAlign: 'center' },
  btnRemoverSerie: { padding: 4 },
  btnAdicionarSerie: { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start', backgroundColor: COLORS.inputBg, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, marginTop: 8 },
  btnAdicionarSerieText: { color: COLORS.green, fontSize: 12, fontWeight: '600' },
  modalFundo: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'flex-end' },
  menuSerie: { backgroundColor: '#1A1A1A', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 16, paddingBottom: 28 },
  menuTitulo: { color: COLORS.text, fontSize: 18, fontWeight: '700' },
  menuSubtitulo: { color: COLORS.muted, fontSize: 12, marginTop: 2, marginBottom: 12 },
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, paddingHorizontal: 8, borderRadius: 10 },
  menuItemAtivo: { backgroundColor: COLORS.inputBg },
  menuItemLabel: { color: COLORS.text, fontSize: 14, flex: 1 },
  menuItemLabelAtivo: { fontWeight: '700' },
  menuSigla: { width: 24, height: 24, borderRadius: 6, backgroundColor: COLORS.inputBg, alignItems: 'center', justifyContent: 'center' },
  menuSiglaNormal: { backgroundColor: COLORS.card },
  menuSiglaText: { color: COLORS.text, fontWeight: '700', fontSize: 12 },
  menuDivisor: { height: StyleSheet.hairlineWidth, backgroundColor: '#333', marginVertical: 8 },
  menuRemover: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 12, paddingHorizontal: 8 },
  menuRemoverText: { color: '#E5484D', fontSize: 14, fontWeight: '700' },
  menuCancelar: { marginTop: 6, backgroundColor: COLORS.card, borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  menuCancelarText: { color: COLORS.text, fontWeight: '700' },
  btnIniciarTreino: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: COLORS.green, paddingVertical: 14, borderRadius: 12, marginTop: 16 },
  btnIniciarTreinoText: { color: '#000', fontWeight: '700', fontSize: 14 },
});