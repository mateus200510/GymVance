import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  FlatList,
  Modal,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';

import BottomNavBar from '../components/BottomNavBar';
import { useIdioma, chaveTraducaoGrupoMuscular, chaveTraducaoEquipamento } from '../services/idioma';
import { getTodosExercicios, buscarExercicios, getExerciciosPorCategoria, CATEGORIAS_EXERCICIOS, GRUPOS_MUSCULARES, saveExercicioCustom, updateExercicioCustom, deleteExercicioCustom, nomeExercicio } from '../services/storage';

const VERDE = '#3DDC5C';

const CATEGORIA_ORDEM = [
  'Máquinas',
  'Cabos / Polias',
  'Pesos Livres',
  'Peso Corporal / Livres',
  'Personalizados',
];

const CATEGORIA_TRADUCAO_MAP = {
  'Máquinas': 'exercicios.categoria.maquinas',
  'Cabos / Polias': 'exercicios.categoria.cabos',
  'Pesos Livres': 'exercicios.categoria.pesosLivres',
  'Peso Corporal / Livres': 'exercicios.categoria.pesoCorporal',
  'Personalizados': 'exercicios.categoria.personalizados',
};

export default function CatalogoExercicios({ navigation, route }) {
  const { t, idioma } = useIdioma();
  const [exercicios, setExercicios] = useState([]);
  const [filtrados, setFiltrados] = useState([]);
  const [busca, setBusca] = useState('');
  const [categoriaExpandida, setCategoriaExpandida] = useState({});
  const [modalCustom, setModalCustom] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [customNome, setCustomNome] = useState('');
  const [customGrupo, setCustomGrupo] = useState('');
  const [customEquipamento, setCustomEquipamento] = useState('');
  const [carregando, setCarregando] = useState(true);

  const isSelecao = route?.params?.selecao === true;

  useEffect(() => {
    carregarExercicios();
  }, []);

  const carregarExercicios = useCallback(async () => {
    setCarregando(true);
    try {
      const todos = await getTodosExercicios();
      setExercicios(todos);
      setFiltrados(todos);
      const expandido = {};
      CATEGORIA_ORDEM.forEach((cat) => {
        expandido[cat] = true;
      });
      setCategoriaExpandida(expandido);
    } catch (error) {
      console.warn('Erro ao carregar exercícios:', error);
    } finally {
      setCarregando(false);
    }
  }, []);

  const filtrar = useCallback(async (termo) => {
    setBusca(termo);
    if (!termo || !termo.trim()) {
      setFiltrados(exercicios);
      return;
    }
    const resultados = await buscarExercicios(termo);
    setFiltrados(resultados);
  }, [exercicios]);

  const alternarCategoria = (categoria) => {
    setCategoriaExpandida((prev) => ({ ...prev, [categoria]: !prev[categoria] }));
  };

  const getExerciciosCategoria = useCallback((categoria) => {
    return filtrados.filter((ex) => ex.categoria === categoria);
  }, [filtrados]);

  const handleSelecionar = (exercicio) => {
    if (isSelecao) {
      navigation?.navigate('NovaSessao', { exercicioSelecionado: exercicio });
      return;
    }
    if (exercicio?.personalizado) {
      abrirModalEdicao(exercicio);
    }
  };

  const abrirModalCustom = () => {
    setEditandoId(null);
    setCustomNome('');
    setCustomGrupo('');
    setCustomEquipamento('');
    setModalCustom(true);
  };

  const abrirModalEdicao = (exercicio) => {
    setEditandoId(exercicio.id);
    setCustomNome(exercicio.nome || '');
    setCustomGrupo(exercicio.grupoMuscular || '');
    setCustomEquipamento(exercicio.equipamento === 'Personalizado' ? '' : (exercicio.equipamento || ''));
    setModalCustom(true);
  };

  const confirmarExclusao = (exercicio) => {
    Alert.alert(
      t('exercicios.excluirTitulo'),
      t('exercicios.excluirMsg'),
      [
        { text: t('comum.cancelar'), style: 'cancel' },
        {
          text: t('exercicios.excluir'),
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteExercicioCustom(exercicio.id);
              carregarExercicios();
            } catch (error) {
              console.warn('Erro ao excluir exercício personalizado:', error);
              Alert.alert(t('comum.erro'), t('comum.erroSalvarDados'));
            }
          },
        },
      ]
    );
  };

  const salvarCustom = async () => {
    if (!customNome.trim()) {
      Alert.alert(t('comum.erro'), t('editarPerfil.placeholderNome'));
      return;
    }
    if (!customGrupo) {
      Alert.alert(t('comum.erro'), t('exercicios.selecionarGrupo'));
      return;
    }
    try {
      if (editandoId) {
        await updateExercicioCustom(editandoId, {
          nome: customNome.trim(),
          grupoMuscular: customGrupo,
          equipamento: customEquipamento || 'Personalizado',
        });
        setModalCustom(false);
        carregarExercicios();
        return;
      }
      await saveExercicioCustom({
        nome: customNome.trim(),
        grupoMuscular: customGrupo,
        equipamento: customEquipamento || 'Personalizado',
      });
      setModalCustom(false);
      carregarExercicios();
    } catch (error) {
      console.warn('Erro ao salvar exercício personalizado:', error);
      Alert.alert(t('comum.erro'), t('comum.erroSalvarDados'));
    }
  };

  if (carregando) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={VERDE} />
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
          <Text style={styles.tituloHeader}>{t('exercicios.titulo')}</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.searchContainer}>
          <Feather name="search" size={18} color="#8E8E93" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder={t('exercicios.pesquisar')}
            placeholderTextColor="#6E6E73"
            value={busca}
            onChangeText={filtrar}
            autoCapitalize="none"
          />
          {busca && (
            <TouchableOpacity onPress={() => { setBusca(''); filtrar(''); }}>
              <Feather name="x" size={18} color="#8E8E93" />
            </TouchableOpacity>
          )}
        </View>

        {busca === '' ? (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
            {CATEGORIA_ORDEM.map((categoria) => {
              const exerciciosCat = getExerciciosCategoria(categoria);
              if (exerciciosCat.length === 0) return null;
              const expandida = categoriaExpandida[categoria] !== false;
              const categoriaTituloKey = CATEGORIA_TRADUCAO_MAP[categoria] || categoria;
              return (
                <View key={categoria} style={styles.categoriaSection}>
                  <TouchableOpacity style={styles.categoriaHeader} onPress={() => alternarCategoria(categoria)} activeOpacity={0.8}>
                    <Text style={styles.categoriaTitulo}>{t(categoriaTituloKey)}</Text>
                    <Feather name={expandida ? 'chevron-up' : 'chevron-down'} size={16} color="#8E8E93" />
                  </TouchableOpacity>
                  {expandida && (
                    <View style={styles.exerciciosList}>
                      {exerciciosCat.map((ex) => (
                        <TouchableOpacity
                          key={ex.id}
                          style={styles.exercicioItem}
                          onPress={() => handleSelecionar(ex)}
                          activeOpacity={0.7}
                        >
                          <View style={styles.exercicioInfo}>
                            <Text style={styles.exercicioNome}>{nomeExercicio(ex, idioma)}</Text>
                            <View style={styles.exercicioMeta}>
                              <Text style={styles.exercicioGrupo}>{t(chaveTraducaoGrupoMuscular(ex.grupoMuscular)) || ex.grupoMuscular}</Text>
                              <View style={styles.dot} />
                              <Text style={styles.exercicioEquipamento}>{t(chaveTraducaoEquipamento(ex.equipamento))}</Text>
                            </View>
                          </View>
                          <View style={styles.exercicioBadge}>
                            <Text style={[styles.badgeTexto, ex.personalizado ? styles.badgeCustom : styles.badgeOficial]}>
                              {ex.personalizado ? t('exercicios.personalizado') : t('exercicios.oficial')}
                            </Text>
                          </View>
                          {ex.personalizado && !isSelecao && (
                            <View style={styles.exercicioAcoes}>
                              <TouchableOpacity
                                style={styles.acaoBotao}
                                onPress={() => abrirModalEdicao(ex)}
                                accessibilityLabel={t('exercicios.editar')}
                              >
                                <Feather name="edit-2" size={15} color={VERDE} />
                              </TouchableOpacity>
                              <TouchableOpacity
                                style={styles.acaoBotao}
                                onPress={() => confirmarExclusao(ex)}
                                accessibilityLabel={t('exercicios.excluir')}
                              >
                                <Feather name="trash-2" size={15} color="#FF8A80" />
                              </TouchableOpacity>
                            </View>
                          )}
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
              );
            })}
            {filtrados.length === 0 && busca && (
              <View style={styles.emptyState}>
                <Feather name="search" size={32} color="#8E8E93" />
                <Text style={styles.emptyText}>{t('exercicios.semResultados')}</Text>
              </View>
            )}
          </ScrollView>
        ) : (
          <FlatList
            data={filtrados}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingBottom: 120 }}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.exercicioItem}
                onPress={() => handleSelecionar(item)}
                activeOpacity={0.7}
              >
                <View style={styles.exercicioInfo}>
                  <Text style={styles.exercicioNome}>{nomeExercicio(item, idioma)}</Text>
                  <View style={styles.exercicioMeta}>
                    <Text style={styles.exercicioGrupo}>{t(chaveTraducaoGrupoMuscular(item.grupoMuscular)) || item.grupoMuscular}</Text>
                    <View style={styles.dot} />
                    <Text style={styles.exercicioEquipamento}>{t(chaveTraducaoEquipamento(item.equipamento))}</Text>
                    <View style={styles.dot} />
                    <Text style={styles.exercicioCategoria}>{t(CATEGORIA_TRADUCAO_MAP[item.categoria] || item.categoria)}</Text>
                  </View>
                </View>
                <View style={styles.exercicioBadge}>
                  <Text style={[styles.badgeTexto, item.personalizado ? styles.badgeCustom : styles.badgeOficial]}>
                    {item.personalizado ? t('exercicios.personalizado') : t('exercicios.oficial')}
                  </Text>
                </View>
                {item.personalizado && !isSelecao && (
                  <View style={styles.exercicioAcoes}>
                    <TouchableOpacity
                      style={styles.acaoBotao}
                      onPress={() => abrirModalEdicao(item)}
                      accessibilityLabel={t('exercicios.editar')}
                    >
                      <Feather name="edit-2" size={15} color={VERDE} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.acaoBotao}
                      onPress={() => confirmarExclusao(item)}
                      accessibilityLabel={t('exercicios.excluir')}
                    >
                      <Feather name="trash-2" size={15} color="#FF8A80" />
                    </TouchableOpacity>
                  </View>
                )}
              </TouchableOpacity>
            )}
            ItemSeparatorComponent={() => <View style={styles.divisor} />}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Feather name="search" size={32} color="#8E8E93" />
                <Text style={styles.emptyText}>{t('exercicios.semResultados')}</Text>
              </View>
            }
          />
        )}

        {!busca && (
          <TouchableOpacity style={styles.botaoCustom} onPress={abrirModalCustom} activeOpacity={0.8}>
            <Feather name="plus" size={16} color={VERDE} />
            <Text style={styles.botaoCustomTexto}>{t('exercicios.criarPersonalizado')}</Text>
          </TouchableOpacity>
        )}
      </View>

      <BottomNavBar activeTab="treino" />

      <Modal visible={modalCustom} transparent animationType="fade" onRequestClose={() => setModalCustom(false)}>
        <View style={styles.modalFundo}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitulo}>
              {editandoId ? t('exercicios.editarTitulo') : t('exercicios.criarPersonalizado').replace('+ ', '')}
            </Text>
            <TextInput
              style={styles.modalInput}
              placeholder={t('editarPerfil.placeholderNome')}
              placeholderTextColor="#6E6E73"
              value={customNome}
              onChangeText={setCustomNome}
              autoCapitalize="words"
            />
            <Text style={styles.modalLabel}>{t('exercicios.grupoMuscular') || 'Grupo Muscular'}</Text>
            <Picker
              selectedValue={customGrupo}
              onValueChange={setCustomGrupo}
            >
              {GRUPOS_MUSCULARES.map((grupo) => (
                <Picker.Item key={grupo} label={t(chaveTraducaoGrupoMuscular(grupo)) || grupo} value={grupo} />
              ))}
            </Picker>
            <Text style={styles.modalLabel}>{t('exercicios.equipamento')}</Text>
            <TextInput
              style={styles.modalInput}
              placeholder={t('exercicios.equipamentoPlaceholder')}
              placeholderTextColor="#6E6E73"
              value={customEquipamento}
              onChangeText={setCustomEquipamento}
              autoCapitalize="words"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.botaoSecundarioModal} onPress={() => setModalCustom(false)}>
                <Text style={styles.botaoSecundarioModalTexto}>{t('comum.cancelar')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.botaoVerdeModal} onPress={salvarCustom}>
                <Text style={styles.botaoVerdeModalTexto}>{t('editarPerfil.salvar')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
  }

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#000' },
  container: { flex: 1, backgroundColor: '#000', paddingHorizontal: 16 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, marginBottom: 16 },
  tituloHeader: { color: '#fff', fontSize: 20, fontWeight: '700' },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1C1C1E', borderRadius: 12, paddingHorizontal: 12, marginBottom: 16, borderWidth: 1, borderColor: '#2C2C2E' },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, color: '#fff', fontSize: 14, paddingVertical: 12 },
  categoriaSection: { marginBottom: 16 },
  categoriaHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 },
  categoriaTitulo: { color: '#fff', fontSize: 16, fontWeight: '600' },
  exerciciosList: { backgroundColor: '#1C1C1E', borderRadius: 12, marginTop: 8 },
  exercicioItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#2C2C2E' },
  exercicioInfo: { flex: 1 },
  exercicioNome: { color: '#fff', fontSize: 14, fontWeight: '600' },
  exercicioMeta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  exercicioGrupo: { color: VERDE, fontSize: 12, fontWeight: '600' },
  exercicioEquipamento: { color: '#8E8E93', fontSize: 12 },
  exercicioCategoria: { color: '#8E8E93', fontSize: 11 },
  dot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: '#48484A' },
  exercicioBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  badgeTexto: { fontSize: 10, fontWeight: '700' },
  badgeOficial: { backgroundColor: '#1E3A5F', color: '#4DA3FF' },
  badgeCustom: { backgroundColor: '#3A1E3A', color: '#FF4DA3' },
  divisor: { height: StyleSheet.hairlineWidth, backgroundColor: '#2C2C2E', marginLeft: 16 },
  emptyState: { alignItems: 'center', paddingVertical: 40 },
  emptyText: { color: '#8E8E93', fontSize: 14, marginTop: 8 },
  botaoCustom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 16, marginTop: 16 },
  botaoCustomTexto: { color: VERDE, fontSize: 14, fontWeight: '600' },
  exercicioAcoes: { flexDirection: 'row', alignItems: 'center', gap: 4, marginLeft: 8 },
  acaoBotao: { width: 30, height: 30, borderRadius: 8, backgroundColor: '#26262A', alignItems: 'center', justifyContent: 'center' },
  modalFundo: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'center', paddingHorizontal: 20 },
  modalContent: { backgroundColor: '#1C1C1E', borderRadius: 20, padding: 20, maxHeight: '80%' },
  modalTitulo: { color: '#fff', fontSize: 18, fontWeight: '700', marginBottom: 16, textAlign: 'center' },
  modalLabel: { color: '#8E8E93', fontSize: 12, marginBottom: 6, marginTop: 12 },
  modalInput: { backgroundColor: '#000', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, color: '#fff', fontSize: 14, borderWidth: 1, borderColor: '#2C2C2E', marginBottom: 8 },
  modalButtons: { flexDirection: 'row', gap: 12, marginTop: 20 },
  botaoSecundarioModal: { flex: 1, alignItems: 'center', paddingVertical: 12, backgroundColor: '#2C2C2E', borderRadius: 12 },
  botaoSecundarioModalTexto: { color: '#fff', fontSize: 13, fontWeight: '600' },
  botaoVerdeModal: { flex: 1, alignItems: 'center', paddingVertical: 12, backgroundColor: VERDE, borderRadius: 12 },
  botaoVerdeModalTexto: { color: '#000', fontSize: 13, fontWeight: '700' },
});