import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Image,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

import BottomNavBar from '../components/BottomNavBar';
import { useDialogo } from '../components/Dialogo';
import {
  getWorkoutHistory,
  updateWorkoutHistory,
  deleteWorkoutHistory,
  saveWorkoutHistory,
  nomeExercicio,
} from '../services/storage';
import { useIdioma } from '../services/idioma';

const VERDE = '#3DDC5C';
const VERMELHO = '#E5484D';

export default function MeusTreinos({ navigation }) {
  const { t, idioma } = useIdioma();
  const dialogo = useDialogo();
  const [treinos, setTreinos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [menuAbertoIndex, setMenuAbertoIndex] = useState(null);
  const [treinoParaExcluir, setTreinoParaExcluir] = useState(null);

  const carregarTreinos = useCallback(async () => {
    setCarregando(true);
    try {
      const historico = await getWorkoutHistory();
      setTreinos(historico || []);
    } catch (error) {
      console.warn('Erro ao carregar treinos:', error);
      dialogo.erro({ titulo: t('comum.erro'), mensagem: t('meusTreinos.erroEditar') });
    } finally {
      setCarregando(false);
    }
  }, [dialogo, t]);

  useFocusEffect(
    useCallback(() => {
      let ativo = true;
      carregarTreinos().then(() => {
        if (!ativo) return;
      });
      return () => {
        ativo = false;
      };
    }, [carregarTreinos])
  );

  const alternarMenu = (index) => {
    setMenuAbertoIndex(menuAbertoIndex === index ? null : index);
  };

  const fecharMenus = () => setMenuAbertoIndex(null);

  const handleEditar = async (index, treino) => {
    fecharMenus();
    try {
      // Usa ID do treino se disponível, senão fallback para índice
      const identificador = treino.id ?? index;
      navigation?.navigate('NovaSessao', {
        treinoParaEditar: { ...treino, _historicoIndex: identificador },
      });
    } catch (error) {
      console.warn('Erro ao abrir treino para edição:', error);
      dialogo.erro({ titulo: t('comum.erro'), mensagem: t('meusTreinos.erroEditar') });
    }
  };

  const handleDuplicar = async (index, treino) => {
    fecharMenus();
    try {
      const exerciciosOriginais = treino.exercicios || [];
      const isFormatoAntigo = exerciciosOriginais.length > 0 && !exerciciosOriginais[0].series;

      let exerciciosParaDuplicar;
      if (isFormatoAntigo) {
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
            id: `serie-${Date.now()}-${Math.random().toString(36).slice(2)}`,
            tipo: s.tipo,
            kg: s.kg,
            reps: s.reps,
            concluido: false,
            falhou: false,
            nota: s.nota,
          });
        }
        exerciciosParaDuplicar = Array.from(exerciciosMap.keys())
          .sort((a, b) => a - b)
          .map((idx) => ({
            ...exerciciosMap.get(idx),
            id: `ex-${Date.now()}-${Math.random().toString(36).slice(2)}`,
            series: exerciciosMap.get(idx).series.map((s) => ({
              ...s,
              id: `serie-${Date.now()}-${Math.random().toString(36).slice(2)}`,
            })),
          }));
      } else {
        exerciciosParaDuplicar = exerciciosOriginais.map((ex) => ({
          ...ex,
          id: `ex-${Date.now()}-${Math.random().toString(36).slice(2)}`,
          series: (ex.series || []).map((s) => ({
            ...s,
            id: `serie-${Date.now()}-${Math.random().toString(36).slice(2)}`,
            concluido: false,
            falhou: false,
          })),
        }));
      }

      const novoTreino = {
        ...treino,
        treino: `${treino.treino} (Cópia)`,
        data: new Date().toISOString(),
        duracao: '00:00:00',
        exercicios: exerciciosParaDuplicar,
      };
      await saveWorkoutHistory(novoTreino);
      await carregarTreinos();
      dialogo.sucessoToast(t('meusTreinos.duplicadoSucesso'));
    } catch (error) {
      console.warn('Erro ao duplicar treino:', error);
      dialogo.erro({ titulo: t('comum.erro'), mensagem: t('meusTreinos.erroDuplicar') });
    }
  };

  const confirmarExcluir = (index, treino) => {
    fecharMenus();
    // Usa ID do treino se disponível, senão fallback para índice
    const identificador = treino.id ?? index;
    setTreinoParaExcluir(identificador);
  };

  const executarExclusao = async () => {
    if (treinoParaExcluir === null) return;
    try {
      await deleteWorkoutHistory(treinoParaExcluir);
      await carregarTreinos();
      dialogo.sucessoToast(t('meusTreinos.excluidoSucesso'));
    } catch (error) {
      console.warn('Erro ao excluir treino:', error);
      dialogo.erro({ titulo: t('comum.erro'), mensagem: t('meusTreinos.erroExcluir') });
    } finally {
      setTreinoParaExcluir(null);
    }
  };

  const handleIniciarTreino = (treino) => {
    fecharMenus();
    const exerciciosOriginais = treino.exercicios || [];

    // Detecta se o treino usa formato antigo (array flat de séries) ou novo (exercícios com series aninhadas)
    const isFormatoAntigo = exerciciosOriginais.length > 0 && !exerciciosOriginais[0].series;

    let exerciciosParaSessao;
    if (isFormatoAntigo) {
      // Formato antigo: exerciciosOriginais é array flat de séries -> agrupa por exercicioIdx
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
      exerciciosParaSessao = Array.from(exerciciosMap.keys())
        .sort((a, b) => a - b)
        .map((idx) => exerciciosMap.get(idx));
    } else {
      // Formato novo: exercícios com series aninhadas
      // Preserva todos os metadados do exercício (id, grupoMuscular, equipamento, etc.)
      exerciciosParaSessao = exerciciosOriginais.map((ex, exIdx) => ({
        ...ex,
        // Preserva id, grupoMuscular, equipamento, nome originais
        exercicioIdx: exIdx,
        series: (ex.series || []).map((s) => ({
          ...s,
          concluido: false,
          falhou: false,
        })),
      }));
    }

    navigation?.navigate('SessaoAtiva', {
      titulo: treino.treino,
      exercicios: exerciciosParaSessao,
    });
  };

  const formatarData = (iso) => {
    if (!iso) return '';
    const data = new Date(iso);
    if (Number.isNaN(data.getTime())) return '';
    return `${String(data.getDate()).padStart(2, '0')}/${String(data.getMonth() + 1).padStart(2, '0')}/${data.getFullYear()}`;
  };

  const contarExerciciosUnicos = (exercicios) => {
    const nomes = new Set(
      (exercicios || [])
        .map((e) => e && (e.exercicioNome || e.nome))
        .filter(Boolean)
    );
    return nomes.size;
  };

  if (carregando) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>{t('comum.avancar')}...</Text>
        </View>
        <BottomNavBar activeTab="treino" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation?.goBack()} accessibilityLabel={t('perfil.voltar')}>
            <Feather name="arrow-left" size={20} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.tituloHeader}>{t('meusTreinos.titulo')}</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
          {treinos.length === 0 ? (
            <View style={styles.emptyState}>
              <Feather name="clipboard" size={48} color="#3A3A3C" />
              <Text style={styles.emptyTitle}>{t('meusTreinos.vazio')}</Text>
              <Text style={styles.emptyMessage}>{t('meusTreinos.vazioMsg')}</Text>
            </View>
          ) : (
            treinos.map((treino, index) => (
              <View key={treino.data + '-' + index} style={styles.treinoCard}>
                <View style={styles.treinoHeader}>
                  <View style={styles.treinoInfo}>
                    <Text style={styles.treinoNome}>{treino.treino || t('sessaoAtiva.semTitulo')}</Text>
                    <View style={styles.treinoMeta}>
                      <Text style={styles.treinoData}>
                        {formatarData(treino.data)} · {t('meusTreinos.exercicios').replace('{count}', String(contarExerciciosUnicos(treino.exercicios)))}
                      </Text>
                      {treino.duracao && <Text style={styles.treinoDuracao}>{treino.duracao}</Text>}
                    </View>
                  </View>
                  <TouchableOpacity
                    style={styles.menuButton}
                    onPress={() => alternarMenu(index)}
                    accessibilityLabel={t('comum.entrar')}
                  >
                    <Feather name="more-vertical" size={20} color="#8E8E93" />
                  </TouchableOpacity>
                </View>

                {menuAbertoIndex === index && (
                  <View style={styles.menuDropdown}>
                    <TouchableOpacity
                      style={styles.menuItem}
                      onPress={() => handleEditar(index, treino)}
                      activeOpacity={0.7}
                    >
                      <Feather name="edit-2" size={16} color={VERDE} style={styles.menuIcon} />
                      <Text style={styles.menuItemText}>{t('meusTreinos.editar')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.menuItem}
                      onPress={() => handleDuplicar(index, treino)}
                      activeOpacity={0.7}
                    >
                      <Feather name="copy" size={16} color="#4DA3FF" style={styles.menuIcon} />
                      <Text style={styles.menuItemText}>{t('meusTreinos.duplicar')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.menuItem}
                      onPress={() => handleIniciarTreino(treino)}
                      activeOpacity={0.7}
                    >
                      <Feather name="play" size={16} color={VERDE} style={styles.menuIcon} />
                      <Text style={styles.menuItemText}>{t('meusTreinos.iniciar')}</Text>
                    </TouchableOpacity>
                    <View style={styles.menuDivider} />
                    <TouchableOpacity
                      style={styles.menuItemDestructive}
                      onPress={() => confirmarExcluir(index, treino)}
                      activeOpacity={0.7}
                    >
                      <Feather name="trash-2" size={16} color={VERMELHO} style={styles.menuIcon} />
                      <Text style={styles.menuItemTextDestructive}>{t('meusTreinos.excluir')}</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))
          )}
        </ScrollView>
      </View>

      <BottomNavBar activeTab="treino" />

      {treinoParaExcluir !== null && (
        <Modal visible animationType="fade" transparent onRequestClose={() => setTreinoParaExcluir(null)}>
          <View style={styles.modalOverlay} onTouchStart={() => setTreinoParaExcluir(null)}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>{t('meusTreinos.excluirTitulo')}</Text>
              <Text style={styles.modalMessage}>{t('meusTreinos.excluirMsg')}</Text>
              <View style={styles.modalButtons}>
                <TouchableOpacity style={styles.modalButtonCancel} onPress={() => setTreinoParaExcluir(null)}>
                  <Text style={styles.modalButtonCancelText}>{t('comum.cancelar')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalButtonConfirm} onPress={executarExclusao}>
                  <Text style={styles.modalButtonConfirmText}>{t('meusTreinos.excluir')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#121212' },
  container: { flex: 1, backgroundColor: '#121212', paddingHorizontal: 16 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: '#8E8E93', fontSize: 14 },
  header: { flexDirection: 'row', alignItems: 'center', paddingTop: 12, marginBottom: 16 },
  tituloHeader: { color: '#fff', fontSize: 20, fontWeight: '700', flex: 1, textAlign: 'center' },
  emptyState: { alignItems: 'center', paddingVertical: 60, paddingHorizontal: 20 },
  emptyTitle: { color: '#fff', fontSize: 18, fontWeight: '600', marginTop: 16, marginBottom: 8 },
  emptyMessage: { color: '#8E8E93', fontSize: 14, textAlign: 'center', lineHeight: 20 },
  treinoCard: { backgroundColor: '#1E1E1E', borderRadius: 14, marginBottom: 12, overflow: 'hidden' },
  treinoHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', padding: 16 },
  treinoInfo: { flex: 1, marginRight: 12 },
  treinoNome: { color: '#fff', fontSize: 16, fontWeight: '600' },
  treinoMeta: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 6 },
  treinoData: { color: '#8E8E93', fontSize: 12 },
  treinoDuracao: { color: VERDE, fontSize: 12, fontWeight: '600' },
  menuButton: { padding: 8 },
  menuDropdown: {
    backgroundColor: '#1E1E1E',
    borderRadius: 10,
    marginHorizontal: 16,
    marginBottom: 16,
    marginTop: -8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#333',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
  },
  menuItemDestructive: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#333',
  },
  menuIcon: { width: 20 },
  menuItemText: { color: '#fff', fontSize: 14, fontWeight: '500' },
  menuItemTextDestructive: { color: VERMELHO, fontSize: 14, fontWeight: '500' },
  menuDivider: { height: StyleSheet.hairlineWidth, backgroundColor: '#333', marginHorizontal: 16 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'center', paddingHorizontal: 20 },
  modalContent: { backgroundColor: '#1E1E1E', borderRadius: 20, padding: 20 },
  modalTitle: { color: '#fff', fontSize: 18, fontWeight: '700', textAlign: 'center', marginBottom: 8 },
  modalMessage: { color: '#8E8E93', fontSize: 14, textAlign: 'center', lineHeight: 20, marginBottom: 20 },
  modalButtons: { flexDirection: 'row', gap: 10 },
  modalButtonCancel: { flex: 1, backgroundColor: '#2C2C2E', borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  modalButtonCancelText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  modalButtonConfirm: { flex: 1, backgroundColor: VERMELHO, borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  modalButtonConfirmText: { color: '#fff', fontSize: 14, fontWeight: '700' },
});