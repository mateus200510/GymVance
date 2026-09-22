import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert, AppState, Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/native';

import BottomNavBar from '../components/BottomNavBar';
import { saveWorkoutHistory } from '../services/storage';
import { useIdioma } from '../services/idioma';

const COLORS = {
  bg: '#121212',
  card: '#1E1E1E',
  green: '#3DDC5C',
  red: '#E5484D',
  text: '#FFFFFF',
  muted: '#8A8A8A',
  inputBg: '#2A2A2A',
};

// Tipos de série: o identificador interno é o `tipo`; o rótulo/idioma só afeta a apresentação.
const TIPOS = [
  { tipo: 'NORMAL', sigla: '#' },
  { tipo: 'AQUECIMENTO', sigla: 'A' },
  { tipo: 'PREPARATORIA', sigla: 'P' },
  { tipo: 'RECONHECIMENTO', sigla: 'R' },
  { tipo: 'BACK_OFF', sigla: 'B' },
  { tipo: 'DROPSET', sigla: 'D' },
  { tipo: 'FALHA', sigla: 'F' },
];

function tipoDe(serie) {
  return serie?.tipo || 'NORMAL';
}

function infoTipo(tipo) {
  return TIPOS.find((t) => t.tipo === tipo) || TIPOS[0];
}

// Número visual: somente as séries NORMAL contam, na ordem em que aparecem no exercício.
function numeroNormalDaSerie(series, serie) {
  let count = 0;
  for (const s of series) {
    if (s.id === serie.id) {
      return count + 1;
    }
    if (tipoDe(s) === 'NORMAL') {
      count += 1;
    }
  }
  return count + 1;
}

function rotuloDaSerie(series, serie) {
  if (tipoDe(serie) === 'NORMAL') {
    return String(numeroNormalDaSerie(series, serie));
  }
  return infoTipo(tipoDe(serie)).sigla;
}

export default function SessaoAtiva({ navigation, route }) {
  const { t } = useIdioma();
  const [series, setSeries] = useState([]);
  const [tempo, setTempo] = useState('00:00:00');
  const [serieEditandoId, setSerieEditandoId] = useState(null);
  const isFocused = useIsFocused();
  const tituloSessao = (route?.params?.titulo || '').trim();
  const acumuladoMs = useRef(0);
  const inicioPeriodo = useRef(null);
  const proximoId = useRef(1);

  const serieEditando = series.find((s) => s.id === serieEditandoId) || null;

  useEffect(() => {
    let timer = null;

    const atualizar = () => {
      const total = acumuladoMs.current + (inicioPeriodo.current ? Date.now() - inicioPeriodo.current : 0);
      const segundos = Math.floor(total / 1000);
      const horas = String(Math.floor(segundos / 3600)).padStart(2, '0');
      const minutos = String(Math.floor((segundos % 3600) / 60)).padStart(2, '0');
      const secs = String(segundos % 60).padStart(2, '0');
      setTempo(`${horas}:${minutos}:${secs}`);
    };

    const parar = () => {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
      if (inicioPeriodo.current) {
        acumuladoMs.current += Date.now() - inicioPeriodo.current;
        inicioPeriodo.current = null;
      }
      atualizar();
    };

    const iniciar = () => {
      inicioPeriodo.current = Date.now();
      atualizar();
      timer = setInterval(atualizar, 1000);
    };

    const sub = AppState.addEventListener('change', (estado) => {
      if (estado !== 'active') {
        parar();
      } else if (isFocused) {
        iniciar();
      }
    });

    if (isFocused) {
      iniciar();
    }

    return () => {
      sub.remove();
      parar();
    };
  }, [isFocused]);

  const toggleConcluido = (id) => {
    setSeries((prev) =>
      prev.map((s) => (s.id === id ? { ...s, concluido: !s.concluido, falhou: false } : s))
    );
  };

  const toggleFalhou = (id) => {
    setSeries((prev) =>
      prev.map((s) => (s.id === id ? { ...s, falhou: !s.falhou, concluido: false } : s))
    );
  };

  const adicionarSerie = () => {
    setSeries((prev) => [
      ...prev,
      { id: proximoId.current++, tipo: 'NORMAL', kg: '', reps: '', concluido: false, falhou: false, nota: '' },
    ]);
  };

  const alterarTipoSerie = (id, tipo) => {
    setSeries((prev) => prev.map((s) => (s.id === id ? { ...s, tipo } : s)));
    setSerieEditandoId(null);
  };

  const removerSerie = (id) => {
    setSeries((prev) => prev.filter((s) => s.id !== id));
    setSerieEditandoId(null);
  };

  const atualizarNota = (id, nota) => {
    setSeries((prev) =>
      prev.map((s) => (s.id === id ? { ...s, nota } : s))
    );
  };

  const atualizarSerie = (id, campo, valor) => {
    setSeries((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [campo]: valor } : s))
    );
  };

  const handleConcluir = async () => {
    if (series.length === 0) {
      Alert.alert(t('sessaoAtiva.treinoVazio'), t('sessaoAtiva.treinoVazioMsg'));
      return;
    }

    try {
      const treino = {
        treino: tituloSessao || t('sessaoAtiva.semTitulo'),
        data: new Date().toISOString(),
        duracao: tempo,
        exercicios: series,
      };

      await saveWorkoutHistory(treino);
      Alert.alert(t('sessaoAtiva.treinoConcluido'), t('sessaoAtiva.salvoHistorico'));
      navigation?.replace('TreinoHub');
    } catch (error) {
      console.warn('Erro ao salvar treino:', error);
      Alert.alert(t('comum.erro'), t('sessaoAtiva.erroSalvar'));
    }
  };

const handleDescartarTreino = () => {
    Alert.alert(
      t('sessaoAtiva.descartarTreino'),
      t('sessaoAtiva.confirmarDescartar'),
      [
        { text: t('sessaoAtiva.cancelar'), style: 'cancel' },
        { text: t('comum.descartar'), style: 'destructive', onPress: () => navigation?.goBack() },
      ]
    );
  };

  const handleVoltar = () => {
    if (series.length === 0) {
      navigation?.goBack();
      return;
    }

    handleDescartarTreino();
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={handleVoltar}>
          <Ionicons name="chevron-back" size={26} color={COLORS.text} />
        </TouchableOpacity>
        <View style={styles.timerPill}>
          <Text style={styles.timerText}>{tempo}</Text>
        </View>
        <View style={styles.topBarActions}>
          <TouchableOpacity
            style={styles.rankingButton}
            onPress={() => navigation?.navigate('Ranking')}
            accessibilityLabel={t('comum.abrirRanking')}
          >
            <Ionicons name="trophy-outline" size={16} color={COLORS.text} />
            <Text style={styles.rankingText}>{t('comum.ranking')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.concluirBtn} onPress={handleConcluir}>
            <Text style={styles.concluirBtnText}>{t('sessaoAtiva.concluir')}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.sessaoAtivaTag}>
        <Text style={styles.sessaoAtivaTagText}>{t('sessaoAtiva.tag')}</Text>
      </View>

      <Text style={styles.titulo}>{t('comum.evolucaoDiaria')}</Text>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 24 }} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.exercicioNome}>{tituloSessao || t('sessaoAtiva.semTitulo')}</Text>
          </View>

          <View style={styles.tabelaHeader}>
            <Text style={[styles.colLabel, { flex: 0.6 }]}>{t('sessaoAtiva.colSerie')}</Text>
            <Text style={[styles.colLabel, { flex: 1 }]}>Kg</Text>
            <Text style={[styles.colLabel, { flex: 1 }]}>Reps</Text>
            <Text style={[styles.colLabel, { flex: 1 }]}>{t('sessaoAtiva.colNotas')}</Text>
            <View style={{ width: 60 }} />
          </View>

          {series.map((s) => (
            <View key={s.id}>
              <View style={styles.linhaSerie}>
                <TouchableOpacity
              style={[styles.serieBadge, { flex: 0.6 }]}
              onPress={() => setSerieEditandoId(s.id)}
              accessibilityLabel={t('sessaoAtiva.acessibilidadeBadge')}
            >
              <Text style={styles.serieBadgeText}>{rotuloDaSerie(series, s)}</Text>
            </TouchableOpacity>
                <TextInput
                  style={[styles.valorInput, { flex: 1 }]}
                  value={s.kg}
                  onChangeText={(text) => atualizarSerie(s.id, 'kg', text)}
                  keyboardType="numeric"
                  placeholder=""
                  placeholderTextColor={COLORS.muted}
                />
                <TextInput
                  style={[styles.valorInput, { flex: 1 }]}
                  value={s.reps}
                  onChangeText={(text) => atualizarSerie(s.id, 'reps', text)}
                  keyboardType="number-pad"
                  placeholder=""
                  placeholderTextColor={COLORS.muted}
                />
                <View style={{ flex: 1 }} />
                <View style={styles.acoesLinha}>
                  <TouchableOpacity
                    style={[styles.circulo, s.falhou && styles.circuloRed]}
                    onPress={() => toggleFalhou(s.id)}
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
                placeholder={t('sessaoAtiva.notaPlaceholder')}
                placeholderTextColor={COLORS.muted}
                value={s.nota}
                onChangeText={(text) => atualizarNota(s.id, text)}
                style={styles.notaInput}
              />
            </View>
          ))}

          <View style={styles.botoesCard}>
            <TouchableOpacity style={styles.btnSerie} onPress={adicionarSerie}>
              <Ionicons name="add" size={16} color={COLORS.green} />
              <Text style={styles.btnSerieText}>{t('sessaoAtiva.adicionarSerie')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <View style={styles.rodapeAcoes}>
        <TouchableOpacity style={styles.btnDescartarTreino} onPress={handleDescartarTreino}>
          <Ionicons name="trash-outline" size={16} color={COLORS.muted} />
          <Text style={styles.btnDescartarText}>{t('sessaoAtiva.descartarTreino')}</Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={serieEditando !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setSerieEditandoId(null)}
      >
        <TouchableOpacity
          style={styles.modalFundo}
          activeOpacity={1}
          onPress={() => setSerieEditandoId(null)}
        >
          <View style={styles.menuSerie}>
            <Text style={styles.menuTitulo}>
              {serieEditando
                ? (tipoDe(serieEditando) === 'NORMAL'
                    ? `${t('sessaoAtiva.serieLabel')} ${numeroNormalDaSerie(series, serieEditando)}`
                    : t(`tipo.${tipoDe(serieEditando)}`))
                : ''}
            </Text>
            <Text style={styles.menuSubtitulo}>{t('sessaoAtiva.menuSubtitulo')}</Text>

            {TIPOS.map((item) => {
              const ativo = serieEditando && tipoDe(serieEditando) === item.tipo;
              return (
                <TouchableOpacity
                  key={item.tipo}
                  style={[styles.menuItem, ativo && styles.menuItemAtivo]}
                  onPress={() => serieEditando && alterarTipoSerie(serieEditando.id, item.tipo)}
                >
                  <View style={[styles.menuSigla, item.tipo === 'NORMAL' && styles.menuSiglaNormal]}>
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
              onPress={() => serieEditando && removerSerie(serieEditando.id)}
            >
              <Ionicons name="trash-outline" size={16} color={COLORS.red} />
              <Text style={styles.menuRemoverText}>{t('sessaoAtiva.removerSerie')}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuCancelar} onPress={() => setSerieEditandoId(null)}>
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
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 },
  timerPill: { backgroundColor: COLORS.inputBg, paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20 },
  timerText: { color: COLORS.text, fontWeight: '600' },
  topBarActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  rankingButton: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#1E1E1E', borderRadius: 10, borderWidth: 1, borderColor: '#333', paddingHorizontal: 8, paddingVertical: 6 },
  rankingText: { color: COLORS.text, fontSize: 11, fontWeight: '700' },
  concluirBtn: { backgroundColor: COLORS.green, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  concluirBtnText: { color: '#000', fontWeight: '700' },
  sessaoAtivaTag: { marginTop: 16 },
  sessaoAtivaTagText: { color: COLORS.red, fontWeight: '700', fontSize: 12, letterSpacing: 1 },
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
  valorInput: { backgroundColor: COLORS.inputBg, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 4, marginHorizontal: 2, color: COLORS.text, fontSize: 14, textAlign: 'center' },
  acoesLinha: { flexDirection: 'row', gap: 6 },
  circulo: { width: 24, height: 24, borderRadius: 12, backgroundColor: COLORS.inputBg, alignItems: 'center', justifyContent: 'center', marginLeft: 4 },
  circuloGreen: { backgroundColor: COLORS.green },
  circuloRed: { backgroundColor: COLORS.red },
  notaInput: { backgroundColor: COLORS.inputBg, color: COLORS.text, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, fontSize: 12, marginBottom: 10 },
  botoesCard: { flexDirection: 'row', gap: 10, marginTop: 4 },
  btnSerie: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: COLORS.inputBg, paddingVertical: 10, borderRadius: 10, flex: 1, justifyContent: 'center' },
  btnSerieText: { color: COLORS.green, fontWeight: '600' },
  btnDescartarText: { color: COLORS.muted, fontWeight: '600', fontSize: 13 },
  rodapeAcoes: { gap: 10, marginBottom: 8 },
  btnDescartarTreino: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: COLORS.card, paddingVertical: 12, borderRadius: 12 },
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
  menuRemoverText: { color: COLORS.red, fontSize: 14, fontWeight: '700' },
  menuCancelar: { marginTop: 6, backgroundColor: COLORS.card, borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  menuCancelarText: { color: COLORS.text, fontWeight: '700' },
});