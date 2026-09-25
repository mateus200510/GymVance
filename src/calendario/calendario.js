import React, { useCallback, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';

import { useIdioma } from '../services/idioma';
import { getWorkoutHistory } from '../services/storage';

const VERDE = '#3DDC5C';
const BG = '#121212';
const CARD = '#1A1A1A';
const MUTED = '#8E8E93';
const MS_DIA = 24 * 60 * 60 * 1000;

// Semana começa no domingo (padrão usado pelo projeto: mesmo início do resumo
// semanal do TreinoHub e do calendário existente do Perfil).
const DIAS_SEMANA = 7;

// Data civil no fuso local, ignorando hora/minuto (evita deslocamentos de
// timezone/UTC e o bug de datas já corrigido no projeto).
function diaInicio(data) {
  return new Date(data.getFullYear(), data.getMonth(), data.getDate()).getTime();
}

export default function CalendarioCompleto({ navigation }) {
  const { t, numero } = useIdioma();
  const { width } = useWindowDimensions();

  const [mesAno, setMesAno] = useState(() => {
    const agora = new Date();
    return { mes: agora.getMonth(), ano: agora.getFullYear() };
  });
  const [diaSelecionado, setDiaSelecionado] = useState(() => diaInicio(new Date()));
  const [treinosPorDia, setTreinosPorDia] = useState({});

  // Sempre que a tela ganha foco, relê o histórico real do dispositivo.
  useFocusEffect(
    useCallback(() => {
      let ativo = true;

      (async () => {
        const historico = await getWorkoutHistory();
        const mapa = {};

        for (const item of historico || []) {
          if (!item?.data) {
            continue;
          }
          const data = new Date(item.data);
          if (Number.isNaN(data.getTime())) {
            continue;
          }
          const chave = diaInicio(data);
          mapa[chave] = mapa[chave] || [];
          mapa[chave].push(item);
        }

        if (ativo) {
          setTreinosPorDia(mapa);
        }
      })();

      return () => {
        ativo = false;
      };
    }, [])
  );

  const { mes, ano } = mesAno;
  const primeiroDia = new Date(ano, mes, 1);
  const offset = primeiroDia.getDay();
  const diasNoMes = new Date(ano, mes + 1, 0).getDate();
  const nomeMes = t(`calendario.mes.${mes}`);
  const hoje = diaInicio(new Date());

  // Treinos reais do mês exibido (sem inventar datas).
  const chavesDoMes = {};
  for (const chaveStr of Object.keys(treinosPorDia)) {
    const chave = Number(chaveStr);
    const data = new Date(chave);
    if (data.getFullYear() === ano && data.getMonth() === mes) {
      chavesDoMes[chave] = treinosPorDia[chave];
    }
  }

  const treinosNoMes = Object.values(chavesDoMes).reduce((soma, lista) => soma + lista.length, 0);
  const diasTreinados = Object.keys(chavesDoMes).length;

  // Melhor sequência de dias consecutivos com treino dentro do mês exibido.
  let melhorSequencia = 0;
  let sequenciaAtual = 0;
  let anterior = null;
  Object.keys(chavesDoMes)
    .map(Number)
    .sort((a, b) => a - b)
    .forEach((chave) => {
      if (anterior !== null && chave - anterior === MS_DIA) {
        sequenciaAtual += 1;
      } else {
        sequenciaAtual = 1;
      }
      if (sequenciaAtual > melhorSequencia) {
        melhorSequencia = sequenciaAtual;
      }
      anterior = chave;
    });

  const celulas = [];
  for (let i = 0; i < offset; i++) {
    celulas.push(null);
  }
  for (let dia = 1; dia <= diasNoMes; dia++) {
    celulas.push(dia);
  }

  const trocarMes = (delta) => {
    const novo = new Date(ano, mes + delta, 1);
    setMesAno({ mes: novo.getMonth(), ano: novo.getFullYear() });
    setDiaSelecionado(diaInicio(new Date(novo.getFullYear(), novo.getMonth(), 1)));
  };

  const voltarAoMesAtual = () => {
    const agora = new Date();
    setMesAno({ mes: agora.getMonth(), ano: agora.getFullYear() });
    setDiaSelecionado(diaInicio(agora));
  };

  const treinosDoDia = diaSelecionado ? (treinosPorDia[diaSelecionado] || []) : [];
  const ehFuturo = diaSelecionado !== null && diaSelecionado > hoje;

  const cellWidth = Math.floor((width - 32 - 16 - 24) / DIAS_SEMANA);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation?.goBack()} accessibilityLabel={t('perfil.voltar')}>
            <Feather name="arrow-left" size={22} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitulo}>{t('calendario.titulo')}</Text>
          <TouchableOpacity onPress={voltarAoMesAtual} accessibilityLabel={t('calendario.mesAtual')}>
            <Text style={styles.hojeBotao}>{t('calendario.hoje')}</Text>
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          <View style={styles.mesNav}>
            <TouchableOpacity style={styles.navBotao} onPress={() => trocarMes(-1)} accessibilityLabel={t('calendario.mesAnterior')}>
              <Feather name="chevron-left" size={22} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.mesTitulo}>
              {nomeMes} {ano}
            </Text>
            <TouchableOpacity style={styles.navBotao} onPress={() => trocarMes(1)} accessibilityLabel={t('calendario.proximoMes')}>
              <Feather name="chevron-right" size={22} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Resumo do mês */}
          <View style={styles.chips}>
            <View style={styles.chip}>
              <Text style={styles.chipValor}>{treinosNoMes}</Text>
              <Text style={styles.chipLabel}>{t('calendario.treinosMes').replace('{treinos}', String(treinosNoMes))}</Text>
            </View>
            <View style={styles.chip}>
              <Text style={styles.chipValor}>{diasTreinados}</Text>
              <Text style={styles.chipLabel}>{t('calendario.diasTreinados').replace('{count}', String(diasTreinados))}</Text>
            </View>
            <View style={styles.chip}>
              <Text style={styles.chipValor}>{melhorSequencia}</Text>
              <Text style={styles.chipLabel}>{t('calendario.melhorSequencia').replace('{count}', String(melhorSequencia))}</Text>
            </View>
          </View>

          {/* Cabeçalho dos dias da semana */}
          <View style={styles.semanaRow}>
            {Array.from({ length: DIAS_SEMANA }, (_, i) => (
              <Text key={i} style={[styles.semanaLetra, { width: cellWidth }]}>{t(`calendario.diaSemana.${i}`)}</Text>
            ))}
          </View>

          {/* Grade do mês */}
          <View style={styles.grade}>
            {celulas.map((dia, index) => {
              if (dia === null) {
                return <View key={`vazio-${index}`} style={[styles.diaCelula, { width: cellWidth }]} />;
              }
              const chave = new Date(ano, mes, dia).getTime();
              const marcado = Boolean(treinosPorDia[chave]);
              const selecionado = diaSelecionado === chave;
              const ehHoje = chave === hoje;
              const ehFuturoDia = chave > hoje;
              return (
                <TouchableOpacity
                  key={`dia-${dia}`}
                  style={[styles.diaCelula, { width: cellWidth }]}
                  onPress={() => setDiaSelecionado(chave)}
                  activeOpacity={0.7}
                  accessibilityLabel={`${dia} ${nomeMes}`}
                >
                  <View
                    style={[
                      styles.diaCirculo,
                      selecionado && styles.diaCirculoAtivo,
                      ehHoje && !selecionado && styles.diaCirculoHoje,
                    ]}
                  >
                    <Text
                      style={[
                        styles.diaNumero,
                        selecionado && styles.diaNumeroAtivo,
                        ehFuturoDia && !selecionado && styles.diaNumeroFuturo,
                      ]}
                    >
                      {dia}
                    </Text>
                  </View>
                  <View style={[styles.marcador, marcado && styles.marcadorAtivo]} />
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Detalhe do dia selecionado */}
          <View style={styles.detalheCabecalho}>
            <Text style={styles.detalheData}>
              {diaSelecionado !== null
                ? `${new Date(diaSelecionado).getDate()} ${nomeMes} ${ano}`
                : ''}
            </Text>
            {diaSelecionado === hoje && <Text style={styles.detalheHoje}>{t('calendario.hoje')}</Text>}
          </View>

          {treinosDoDia.length === 0 ? (
            <View style={styles.semTreinoBox}>
              <Feather name="calendar" size={22} color={MUTED} />
              <Text style={styles.semTreinoTexto}>
                {ehFuturo ? t('calendario.futuro') : t('calendario.semTreinosDia')}
              </Text>
            </View>
          ) : (
            treinosDoDia.map((treino, index) => {
              const exercicios = (treino.exercicios || []);
              const numExercicios = new Set(
                exercicios
                  .map((e) => e && (e.exercicioNome || e.nome))
                  .filter(Boolean)
              ).size;
              const titulo = treino.treino || t('sessaoAtiva.semTitulo');
              const duracao = treino.duracao || null;
              return (
                <View key={`${treino.data}-${index}`} style={styles.treinoItem}>
                  <Feather name="check-circle" size={18} color={VERDE} />
                  <View style={styles.treinoInfo}>
                    <Text style={styles.treinoTitulo}>
                      {t('calendario.treino')} · {titulo}
                    </Text>
                    <Text style={styles.treinoMeta}>
                      {t('calendario.exercicios').replace('{count}', numero(numExercicios))}
                      {duracao ? ` · ${duracao}` : ''}
                    </Text>
                  </View>
                </View>
              );
            })
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  headerTitulo: { color: '#fff', fontSize: 16, fontWeight: '700' },
  hojeBotao: { color: VERDE, fontWeight: '700', fontSize: 13 },
  scroll: { paddingHorizontal: 16, paddingBottom: 40 },
  mesNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    marginBottom: 12,
  },
  navBotao: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: CARD,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mesTitulo: { color: '#fff', fontSize: 17, fontWeight: '700', textTransform: 'capitalize' },
  chips: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  chip: {
    flex: 1,
    backgroundColor: CARD,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 6,
    alignItems: 'center',
  },
  chipValor: { color: VERDE, fontSize: 16, fontWeight: '800' },
  chipLabel: { color: MUTED, fontSize: 9.5, textAlign: 'center', marginTop: 2 },
  semanaRow: { flexDirection: 'row', marginBottom: 8 },
  semanaLetra: { color: MUTED, fontSize: 12, fontWeight: '600', textAlign: 'center' },
  grade: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: CARD,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  diaCelula: { alignItems: 'center', marginBottom: 10 },
  diaCirculo: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  diaCirculoAtivo: { backgroundColor: VERDE },
  diaCirculoHoje: { borderWidth: 1.5, borderColor: VERDE },
  diaNumero: { color: '#fff', fontSize: 13, fontWeight: '600' },
  diaNumeroAtivo: { color: '#121212', fontWeight: '800' },
  diaNumeroFuturo: { color: '#555' },
  marcador: { width: 5, height: 5, borderRadius: 3, marginTop: 2, backgroundColor: 'transparent' },
  marcadorAtivo: { backgroundColor: VERDE },
  detalheCabecalho: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 10,
  },
  detalheData: { color: '#fff', fontSize: 16, fontWeight: '700' },
  detalheHoje: { color: VERDE, fontSize: 12, fontWeight: '700' },
  semTreinoBox: {
    backgroundColor: CARD,
    borderRadius: 12,
    paddingVertical: 26,
    alignItems: 'center',
    gap: 8,
  },
  semTreinoTexto: { color: MUTED, fontSize: 13, textAlign: 'center', paddingHorizontal: 12 },
  treinoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CARD,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  treinoInfo: { marginLeft: 10, flex: 1 },
  treinoTitulo: { color: '#fff', fontSize: 14, fontWeight: '600' },
  treinoMeta: { color: MUTED, fontSize: 12, marginTop: 2 },
});