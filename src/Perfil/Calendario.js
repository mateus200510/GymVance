import React, { useCallback, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

import { useIdioma } from '../services/idioma';
import { getWorkoutHistory } from '../services/storage';

const VERDE = '#3DDC5C';
const BG = '#121212';

function diaInicio(data) {
  return new Date(data.getFullYear(), data.getMonth(), data.getDate()).getTime();
}

function formatarHora(data) {
  const h = String(data.getHours()).padStart(2, '0');
  const m = String(data.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}

export default function Calendario({ navigation }) {
  const { t } = useIdioma();
  const [mesAno, setMesAno] = useState(() => {
    const agora = new Date();
    return { mes: agora.getMonth(), ano: agora.getFullYear() };
  });
  const [diaSelecionado, setDiaSelecionado] = useState(null);
  const [treinosPorDia, setTreinosPorDia] = useState({});

  useFocusEffect(
    useCallback(() => {
      let ativo = true;

      (async () => {
        const historico = await getWorkoutHistory();
        const mapa = {};

        for (const item of historico || []) {
          if (!item?.data) continue;
          const data = new Date(item.data);
          if (Number.isNaN(data.getTime())) continue;
          const chave = diaInicio(data);
          mapa[chave] = mapa[chave] || [];
          mapa[chave].push(item);
        }

        if (ativo) {
          setTreinosPorDia(mapa);
          setDiaSelecionado((prev) => prev ?? diaInicio(new Date()));
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

  const treinosNoMes = Object.keys(treinosPorDia).filter((chave) => {
    const d = new Date(Number(chave));
    return d.getFullYear() === ano && d.getMonth() === mes;
  }).length;

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
    setDiaSelecionado(null);
  };

  const treinosDoDia = diaSelecionado ? (treinosPorDia[diaSelecionado] || []) : [];

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation?.goBack()} accessibilityLabel={t('perfil.voltar')}>
            <Feather name="arrow-left" size={20} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitulo}>{t('calendario.titulo')}</Text>
          <View style={{ width: 20 }} />
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

          <Text style={styles.resumoMes}>
            {treinosNoMes > 0
              ? t('calendario.treinosMes').replace('{treinos}', String(treinosNoMes))
              : t('calendario.semTreinosMes')}
          </Text>

          <View style={styles.semanaRow}>
            {Array.from({ length: 7 }, (_, i) => (
              <Text key={i} style={styles.semanaLetra}>{t(`calendario.diaSemana.${i}`)}</Text>
            ))}
          </View>

          <View style={styles.grade}>
            {celulas.map((dia, index) => {
              if (dia === null) {
                return <View key={`vazio-${index}`} style={styles.diaCelula} />;
              }
              const chave = new Date(ano, mes, dia).getTime();
              const marcado = Boolean(treinosPorDia[chave]);
              const selecionado = diaSelecionado === chave;
              return (
                <TouchableOpacity
                  key={`dia-${dia}`}
                  style={styles.diaCelula}
                  onPress={() => setDiaSelecionado(chave)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.diaCirculo, selecionado && styles.diaCirculoAtivo]}>
                    <Text style={[styles.diaNumero, selecionado && styles.diaNumeroAtivo]}>{dia}</Text>
                  </View>
                  <View style={[styles.marcador, marcado && styles.marcadorAtivo]} />
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.lista}>
            {treinosDoDia.length === 0 ? (
              <View style={styles.semTreinoBox}>
                <Text style={styles.semTreinoTexto}>{t('calendario.semTreinosDia')}</Text>
              </View>
            ) : (
              treinosDoDia.map((treino, index) => {
                const dataTreino = new Date(treino.data);
                const numExercicios = (treino.exercicios || []).length;
                return (
                  <View key={`${treino.data}-${index}`} style={styles.treinoItem}>
                    <View style={styles.treinoLeft}>
                      <Feather name="check-circle" size={18} color={VERDE} />
                      <View style={{ marginLeft: 10, flex: 1 }}>
                        <Text style={styles.treinoTitulo}>
                          {formatarHora(dataTreino)} · {t('calendario.exercicios').replace('{count}', String(numExercicios))}
                        </Text>
                        {treino.duracao ? <Text style={styles.treinoMeta}>{treino.duracao}</Text> : null}
                      </View>
                    </View>
                  </View>
                );
              })
            )}
          </View>
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
  scroll: { paddingHorizontal: 16, paddingBottom: 40 },
  mesNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    marginBottom: 4,
  },
  navBotao: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1A1A1A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mesTitulo: { color: '#fff', fontSize: 17, fontWeight: '700', textTransform: 'capitalize' },
  resumoMes: { color: '#8E8E93', fontSize: 13, textAlign: 'center', marginBottom: 16 },
  semanaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  semanaLetra: { color: '#8E8E93', fontSize: 12, fontWeight: '600', width: 34, textAlign: 'center' },
  grade: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    backgroundColor: '#1A1A1A',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  diaCelula: { width: 36, alignItems: 'center', marginBottom: 10 },
  diaCirculo: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  diaCirculoAtivo: { backgroundColor: VERDE },
  diaNumero: { color: '#fff', fontSize: 13, fontWeight: '600' },
  diaNumeroAtivo: { color: '#121212', fontWeight: '800' },
  marcador: { width: 5, height: 5, borderRadius: 3, marginTop: 2, backgroundColor: 'transparent' },
  marcadorAtivo: { backgroundColor: VERDE },
  lista: { marginTop: 20 },
  semTreinoBox: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    paddingVertical: 24,
    alignItems: 'center',
  },
  semTreinoTexto: { color: '#8E8E93', fontSize: 13 },
  treinoItem: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  treinoLeft: { flexDirection: 'row', alignItems: 'center' },
  treinoTitulo: { color: '#fff', fontSize: 14, fontWeight: '600' },
  treinoMeta: { color: '#8E8E93', fontSize: 12, marginTop: 2 },
});