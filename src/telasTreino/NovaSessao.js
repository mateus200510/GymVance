import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Feather } from '@expo/vector-icons';

import BottomNavBar from '../components/BottomNavBar';
import MenuSerie from '../components/MenuSerie';
import { useDialogo } from '../components/Dialogo';
import { useNomeUsuario, useFotoPerfil } from '../services/useUserProfile';
import { TIPO_PADRAO, criarSerie, tipoDe, numeroNormalDaSerie, rotuloDaSerie, normalizarSeries } from '../services/series';
import { useIdioma, chaveTraducaoGrupoMuscular, chaveTraducaoEquipamento } from '../services/idioma';
import { nomeExercicio, updateWorkoutHistory, saveWorkoutHistory } from '../services/storage';

const COLORS = { bg: '#121212', card: '#1E1E1E', green: '#3DDC5C', text: '#FFFFFF', muted: '#8A8A8A', inputBg: '#2A2A2A', red: '#E5484D' };

export default function NovaSessao({ navigation, route }) {
  const { t, idioma } = useIdioma();
  const dialogo = useDialogo();
  const [titulo, setTitulo] = useState('');
  const [exerciciosSelecionados, setExerciciosSelecionados] = useState([]);
  const nomeUsuario = useNomeUsuario();
  const fotoUsuario = useFotoPerfil();
  const [serieEditando, setSerieEditando] = useState(null);
  const [editandoIndex, setEditandoIndex] = useState(null);
  const [menuAberto, setMenuAberto] = useState(false);
  const [criandoSessao, setCriandoSessao] = useState(false);

  // serieEditando agora armazena { exercicioId, serieId } em vez de { exIdx, serieId }
  // para evitar problemas com índices desatualizados após remoção de exercícios.

  const treinoParaEditar = route?.params?.treinoParaEditar;

  // Ref para rastrear o último exercício processado via parâmetro de navegação.
  // Evita processar o mesmo exercício múltiplas vezes se o efeito disparar mais de uma vez.
  const processedExerciseIdRef = useRef(null);
  // Ref para detectar mudança de treino em modo edição
  const treinoEditandoRef = useRef(null);

  useEffect(() => {
    if (treinoParaEditar) {
      const isNewTreino = treinoEditandoRef.current !== treinoParaEditar._historicoIndex;
      if (isNewTreino || editandoIndex === null) {
        treinoEditandoRef.current = treinoParaEditar._historicoIndex;
        setEditandoIndex(treinoParaEditar._historicoIndex);
        setTitulo(treinoParaEditar.treino || '');

        const exerciciosOriginais = treinoParaEditar.exercicios || [];
        const isFormatoAntigo = exerciciosOriginais.length > 0 && !exerciciosOriginais[0].series;

        let exerciciosNormalizados;
        if (isFormatoAntigo) {
          // Formato antigo: array flat de séries -> agrupa por exercicioIdx
          const exerciciosMap = new Map();
          for (const s of exerciciosOriginais) {
            const idx = s.exercicioIdx ?? 0;
            if (!exerciciosMap.has(idx)) {
              exerciciosMap.set(idx, {
                exercicioIdx: idx,
                nome: s.exercicioNome || '',
                series: [],
              });
            }
            exerciciosMap.get(idx).series.push({
              id: s.id,
              tipo: s.tipo,
              kg: s.kg,
              reps: s.reps,
              concluido: false,
              falhou: false,
              nota: s.nota,
            });
          }
          exerciciosNormalizados = Array.from(exerciciosMap.keys())
            .sort((a, b) => a - b)
            .map((idx) => {
              const ex = exerciciosMap.get(idx);
              return {
                ...ex,
                // Preserva ID existente se houver, senão gera novo
                id: ex.id || `ex-${Date.now()}-${idx}-${Math.random().toString(36).slice(2)}`,
                series: normalizarSeries(ex.series || []).map((s) => ({
                  ...s,
                  concluido: false,
                  falhou: false,
                })),
              };
            });
        } else {
          // Formato novo: exercícios com series aninhadas
          // Preserva ID existente do exercício se houver
          exerciciosNormalizados = exerciciosOriginais.map((ex, exIdx) => ({
            ...ex,
            id: ex.id || `ex-${Date.now()}-${exIdx}-${Math.random().toString(36).slice(2)}`,
            series: normalizarSeries(ex.series || []).map((s) => ({
              ...s,
              concluido: false,
              falhou: false,
            })),
          }));
        }

        setExerciciosSelecionados(exerciciosNormalizados);
        // Resetar o ref ao carregar um treino para edição
        processedExerciseIdRef.current = null;
      }
    }
  }, [treinoParaEditar, editandoIndex]);

  // Processa exercício selecionado no catálogo quando a tela ganha foco.
  // Usa ref para evitar duplicação se o efeito disparar múltiplas vezes.
  // Não usa useCallback para capturar o `route` atual a cada foco.
  useFocusEffect(() => {
    const exercicio = route?.params?.exercicioSelecionado;
    if (exercicio?.id && exercicio.id !== processedExerciseIdRef.current) {
      processedExerciseIdRef.current = exercicio.id;
      setExerciciosSelecionados((prev) => {
        if (prev.some((e) => e.id === exercicio.id)) {
          return prev;
        }
        return [...prev, { ...exercicio, series: [] }];
      });
      navigation?.setParams({ ...route.params, exercicioSelecionado: undefined });
    }
  });

  const removerExercicio = (id) => {
    setExerciciosSelecionados((prev) => prev.filter((e) => e.id !== id));
    // Limpar edição de série se o exercício removido era o que estava sendo editado
    setSerieEditando((prev) => (prev?.exercicioId === id ? null : prev));
  };

  const alternarMenu = () => {
    setMenuAberto((prev) => !prev);
  };

  const fecharMenu = () => setMenuAberto(false);

  const handleCriarSessao = async () => {
    if (criandoSessao) return;
    if (!titulo.trim()) {
      dialogo.erro({ titulo: t('comum.erro'), mensagem: t('novaSessao.erroSemTitulo') });
      return;
    }
    if (exerciciosSelecionados.length === 0) {
      dialogo.erro({ titulo: t('comum.erro'), mensagem: t('novaSessao.erroSemExercicios') });
      return;
    }

    const temSeries = exerciciosSelecionados.some(
      (ex) => Array.isArray(ex.series) && ex.series.length > 0
    );
    if (!temSeries) {
      dialogo.erro({ titulo: t('comum.erro'), mensagem: t('novaSessao.erroSemSeries') });
      return;
    }

    fecharMenu();
    setCriandoSessao(true);

    try {
      const treino = {
        treino: titulo,
        data: new Date().toISOString(),
        duracao: '00:00:00',
        exercicios: exerciciosSelecionados.map((ex, exIdx) => ({
          ...ex,
          exercicioIdx: exIdx,
          series: (ex.series || []).map((s) => ({
            ...s,
            concluido: false,
            falhou: false,
          })),
        })),
      };

      await saveWorkoutHistory(treino);
      dialogo.sucessoToast(t('novaSessao.sessaoCriadaSucesso'));
      navigation?.goBack();
    } catch (error) {
      console.warn('Erro ao criar sessão:', error);
      dialogo.erro({ titulo: t('comum.erro'), mensagem: t('novaSessao.erroCriarSessao') });
    } finally {
      setCriandoSessao(false);
    }
  };

  // Todo o CRUD de séries opera sobre `exerciciosSelecionados[exIdx].series`.
  // É o mesmo estado enviado para a SessaoAtiva, então o que se vê é o que persiste.
  const adicionarSerie = (exercicioId) => {
    setExerciciosSelecionados((prev) =>
      prev.map((ex) => (ex.id === exercicioId ? { ...ex, series: [...(ex.series || []), criarSerie()] } : ex))
    );
  };

  const atualizarSerie = (exercicioId, serieId, campo, valor) => {
    setExerciciosSelecionados((prev) =>
      prev.map((ex) =>
        ex.id === exercicioId
          ? { ...ex, series: (ex.series || []).map((s) => (s.id === serieId ? { ...s, [campo]: valor } : s)) }
          : ex
      )
    );
  };

  const alterarTipoSerie = (exercicioId, serieId, tipo) => {
    setExerciciosSelecionados((prev) =>
      prev.map((ex) =>
        ex.id === exercicioId
          ? { ...ex, series: (ex.series || []).map((s) => (s.id === serieId ? { ...s, tipo } : s)) }
          : ex
      )
    );
    setSerieEditando(null);
  };

  const removerSerie = (exercicioId, serieId) => {
    setExerciciosSelecionados((prev) =>
      prev.map((ex) => (ex.id === exercicioId ? { ...ex, series: (ex.series || []).filter((s) => s.id !== serieId) } : ex))
    );
    setSerieEditando(null);
  };

  const serieEmEdicao = serieEditando
    ? (exerciciosSelecionados.find((ex) => ex.id === serieEditando.exercicioId)?.series || []).find((s) => s.id === serieEditando.serieId) || null
    : null;

  const seriesDoExercicioEdicao = serieEditando
    ? exerciciosSelecionados.find((ex) => ex.id === serieEditando.exercicioId)?.series || []
    : [];

  const handleSalvarEdicao = async () => {
    if (!titulo.trim()) {
      dialogo.erro({ titulo: t('comum.erro'), mensagem: t('novaSessao.erroSemTitulo') });
      return;
    }
    if (exerciciosSelecionados.length === 0) {
      dialogo.erro({ titulo: t('comum.erro'), mensagem: t('novaSessao.erroSemExercicios') });
      return;
    }
    if (editandoIndex === null) return;

    fecharMenu();
    setCriandoSessao(true);

    try {
      const treinoAtualizado = {
        treino: titulo,
        exercicios: exerciciosSelecionados,
      };
      await updateWorkoutHistory(editandoIndex, treinoAtualizado);
      dialogo.sucessoToast(t('meusTreinos.editadoSucesso'));
      navigation?.goBack();
    } catch (error) {
      console.warn('Erro ao atualizar treino:', error);
      dialogo.erro({ titulo: t('comum.erro'), mensagem: t('meusTreinos.erroEditar') });
    } finally {
      setCriandoSessao(false);
    }
  };

  const handleIniciarTreino = () => {
    if (!titulo.trim()) {
      dialogo.erro({ titulo: t('comum.erro'), mensagem: t('novaSessao.erroSemTitulo') });
      return;
    }
    if (exerciciosSelecionados.length === 0) {
      dialogo.erro({ titulo: t('comum.erro'), mensagem: t('novaSessao.erroSemExercicios') });
      return;
    }

    const temSeries = exerciciosSelecionados.some(
      (ex) => Array.isArray(ex.series) && ex.series.length > 0
    );
    if (!temSeries) {
      dialogo.erro({ titulo: t('comum.erro'), mensagem: t('novaSessao.erroSemSeries') });
      return;
    }

    fecharMenu();
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
          <TouchableOpacity
            style={styles.menuButton}
            onPress={alternarMenu}
            accessibilityLabel={t('comum.menuOpcoes')}
          >
            <Feather name="more-vertical" size={22} color={COLORS.text} />
          </TouchableOpacity>
        </View>
      </View>

      {menuAberto && (
        <View style={styles.menuOverlay} onTouchStart={fecharMenu}>
          <View style={styles.menuDropdown}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={editandoIndex !== null ? handleSalvarEdicao : handleCriarSessao}
              activeOpacity={0.7}
              disabled={criandoSessao}
            >
              <Feather name="save" size={16} color={COLORS.green} style={styles.menuIcon} />
              <Text style={styles.menuItemText}>
                {criandoSessao
                  ? t('novaSessao.criando')
                  : editandoIndex !== null
                  ? t('editarPerfil.salvar')
                  : t('novaSessao.criarSessao')}
              </Text>
            </TouchableOpacity>
            <View style={styles.menuDivider} />
            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleIniciarTreino}
              activeOpacity={0.7}
              disabled={criandoSessao}
            >
              <Feather name="play" size={16} color={COLORS.green} style={styles.menuIcon} />
              <Text style={styles.menuItemText}>{t('novaSessao.iniciarTreino')}</Text>
            </TouchableOpacity>
            <View style={styles.menuDivider} />
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => { fecharMenu(); navigation?.goBack(); }}
              activeOpacity={0.7}
            >
              <Feather name="x" size={16} color={COLORS.red} style={styles.menuIcon} />
              <Text style={styles.menuItemTextDestructive}>{t('novaSessao.descartar')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

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
                        onPress={() => setSerieEditando({ exercicioId: ex.id, serieId: s.id })}
                        accessibilityLabel={t('sessaoAtiva.acessibilidadeBadge')}
                      >
                        <Text style={styles.serieBadgeText}>{rotuloDaSerie(ex.series, s)}</Text>
                      </TouchableOpacity>
                      <TextInput
                        style={styles.valorInput}
                        value={s.kg}
                        onChangeText={(texto) => atualizarSerie(ex.id, s.id, 'kg', texto)}
                        keyboardType="numeric"
                        placeholder={t('sessaoAtiva.colKg')}
                        placeholderTextColor={COLORS.muted}
                      />
                      <TextInput
                        style={styles.valorInput}
                        value={s.reps}
                        onChangeText={(texto) => atualizarSerie(ex.id, s.id, 'reps', texto)}
                        keyboardType="number-pad"
                        placeholder={t('sessaoAtiva.colReps')}
                        placeholderTextColor={COLORS.muted}
                      />
                      <TouchableOpacity
                        style={styles.btnRemoverSerie}
                        onPress={() => removerSerie(ex.id, s.id)}
                        accessibilityLabel={t('sessaoAtiva.removerSerie')}
                      >
                        <Ionicons name="trash-outline" size={16} color="#FF453A" />
                      </TouchableOpacity>
                    </View>
                  ))}

                  <TouchableOpacity style={styles.btnAdicionarSerie} onPress={() => adicionarSerie(ex.id)}>
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
          <Text style={styles.btnIniciarTreinoText}>
            {t('novaSessao.iniciarTreino')}
          </Text>
        </TouchableOpacity>

        <View style={{ flex: 1 }} />
      </ScrollView>

      <MenuSerie
        visible={serieEmEdicao !== null}
        titulo={
          serieEmEdicao
            ? (tipoDe(serieEmEdicao) === TIPO_PADRAO
                ? `${t('sessaoAtiva.serieLabel')} ${numeroNormalDaSerie(seriesDoExercicioEdicao, serieEmEdicao)}`
                : t(`tipo.${tipoDe(serieEmEdicao)}`))
            : ''
        }
        tipoAtual={serieEmEdicao ? tipoDe(serieEmEdicao) : TIPO_PADRAO}
        onClose={() => setSerieEditando(null)}
        onSelecionarTipo={(tipo) => serieEmEdicao && alterarTipoSerie(serieEditando.exercicioId, serieEmEdicao.id, tipo)}
        onRemover={() => serieEmEdicao && removerSerie(serieEditando.exercicioId, serieEmEdicao.id)}
      />

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
  menuButton: { padding: 8 },
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
  btnIniciarTreino: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: COLORS.green, paddingVertical: 14, borderRadius: 12, marginTop: 16 },
  btnIniciarTreinoText: { color: '#000', fontWeight: '700', fontSize: 14 },
  menuOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 100 },
  menuDropdown: { position: 'absolute', top: 56, right: 16, backgroundColor: COLORS.card, borderRadius: 10, borderWidth: 1, borderColor: '#333', overflow: 'hidden', minWidth: 180 },
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, paddingVertical: 12 },
  menuItemText: { color: COLORS.text, fontSize: 14, fontWeight: '500' },
  menuItemTextDestructive: { color: COLORS.red, fontSize: 14, fontWeight: '500' },
  menuIcon: { width: 20 },
  menuDivider: { height: StyleSheet.hairlineWidth, backgroundColor: '#333', marginHorizontal: 16 },
});