import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  StatusBar,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';

import BottomNavBar from '../components/BottomNavBar';
import DemoTag from '../components/DemoTag';
import { useNomeUsuario } from '../services/useUserProfile';
import { useIdioma } from '../services/idioma';
import { getBpmAtual, getKcalMeta, getKcalQueimadas } from '../services/metricas';
import { MODO_DEMONSTRACAO, DEMO_CALORIAS } from '../services/demo';

// Tela de "Calorias" do GymVance
// Mesma identidade visual da tela de Batimento, mas com a queima diária em destaque
// e o BPM como informação secundária
export default function Calorias({ navigation }) {
  const { t, numero } = useIdioma();
  const { width } = useWindowDimensions();
  const nomeUsuario = useNomeUsuario();
  const [kcalQueimadas, setKcalQueimadas] = useState(null);
  const [kcalMeta, setKcalMeta] = useState(null);
  const percentualMeta = kcalQueimadas !== null && kcalMeta
    ? Math.round((kcalQueimadas / kcalMeta) * 100)
    : null;
  const [bpmAtual, setBpmAtual] = useState(null);
  const circleSize = Math.min(Math.max(width * 0.68, 200), 260);

  useEffect(() => {
    let ativo = true;

    (async () => {
      if (MODO_DEMONSTRACAO) {
        if (ativo) {
          setKcalQueimadas(DEMO_CALORIAS.queimadas);
          setKcalMeta(DEMO_CALORIAS.meta);
          setBpmAtual(DEMO_CALORIAS.bpmAtual);
        }
        return;
      }

      const [kcal, meta, bpm] = await Promise.all([
        getKcalQueimadas(),
        getKcalMeta(),
        getBpmAtual(),
      ]);

      if (!ativo) {
        return;
      }

      setKcalQueimadas(kcal);
      setKcalMeta(meta);
      setBpmAtual(bpm);
    })();

    return () => {
      ativo = false;
    };
  }, []);

  const historico = MODO_DEMONSTRACAO ? DEMO_CALORIAS.historico : [];
  const maxHistorico = historico.length > 0 ? Math.max(...historico) : 1;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="light-content" backgroundColor="#0D0D0D" />

      {/* Cabeçalho */}
      <View style={styles.cabecalho}>
        <View style={styles.perfil}>
          <View style={styles.avatar}>
            <Feather name="user" size={20} color="#fff" />
          </View>
          <View>
            <Text style={styles.evolucaoTexto}>{t('comum.evolucaoDiaria')}</Text>
            <Text style={styles.nomeUsuario}>{nomeUsuario}</Text>
          </View>
        </View>
        <Text style={styles.logo}>
          Gym<Text style={styles.logoVerde}>Vance</Text>
        </Text>
      </View>

      {/* Conteúdo rolável */}
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {MODO_DEMONSTRACAO && (
          <View style={styles.demoArea}>
            <DemoTag />
            <Text style={styles.avisoDemo}>{t('demo.aviso')}</Text>
          </View>
        )}

        {/* Círculo de calorias */}
        <View style={styles.circuloWrapper}>
          <TouchableOpacity
            activeOpacity={0.8}
            style={[styles.circulo, { width: circleSize, height: circleSize, borderRadius: circleSize / 2 }]}
            onPress={() => navigation?.navigate('Batimento')}
          >
            <View style={styles.badgePercentualCirculo}>
              <Text style={styles.badgeTexto}>{percentualMeta === null ? '—' : `${percentualMeta}%`}</Text>
            </View>
            <Text style={[styles.kcalNumero, { fontSize: Math.min(circleSize * 0.19, 50) }]}>{kcalQueimadas === null ? '—' : numero(kcalQueimadas)}</Text>
            <View style={styles.kcalLinha}>
              <Feather name="zap" size={15} color={VERDE} style={styles.chamaIcone} />
              <Text style={styles.kcalLabel}>KCAL</Text>
            </View>
            <Text style={styles.kcalMetaTexto}>
              {t('calorias.de')} {kcalMeta === null ? '—' : numero(kcalMeta)} kcal
            </Text>
          </TouchableOpacity>
        </View>

      {/* Batimento cardíaco */}
      <View style={styles.blocoBpm}>
        <View style={styles.bpmCabecalho}>
          <Text style={styles.bpmTitulo}>{t('calorias.batimentoCardiaco')}</Text>
          {bpmAtual !== null && (
            <View style={styles.badgeStatus}>
              <Text style={styles.badgeStatusTexto}>{t('calorias.normal')}</Text>
            </View>
          )}
        </View>
        <View style={styles.bpmLinhaValor}>
          <Feather name="heart" size={22} color={VERDE} style={styles.coracaoIconeGrande} />
          <Text style={styles.bpmValor}>{bpmAtual === null ? '—' : bpmAtual}</Text>
          <Text style={styles.bpmUnidade}>BPM</Text>
        </View>
      </View>

      {historico.length > 0 && (
        <View style={styles.blocoHistorico}>
          <Text style={styles.historicoTitulo}>{t('calorias.historico')}</Text>
          <View style={styles.barrasLinha}>
            {historico.map((valor, index) => {
              const data = new Date();
              data.setDate(data.getDate() - (historico.length - 1 - index));
              return (
                <View key={`${index}-${valor}`} style={styles.barraColuna}>
                  <Text style={styles.barraValor}>{valor}</Text>
                  <View style={styles.barraTrilho}>
                    <View
                      style={[
                        styles.barraPreenchidaHistorico,
                        { height: `${Math.max(15, (valor / maxHistorico) * 100)}%` },
                      ]}
                    />
                  </View>
                  <Text style={styles.barraDia}>{t(`calendario.diaSemana.${data.getDay()}`)}</Text>
                </View>
              );
            })}
          </View>
        </View>
      )}
      </ScrollView>

      <BottomNavBar activeTab="relogio" />
    </SafeAreaView>
  );
}

const VERDE = '#3DDC5C';
const CINZA_ESCURO = '#1A1A1A';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0D0D',
    paddingHorizontal: 20,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  cabecalho: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
  },
  perfil: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: '#555555',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  evolucaoTexto: {
    color: '#999999',
    fontSize: 11,
  },
  nomeUsuario: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold',
  },
  logo: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  logoVerde: {
    color: VERDE,
  },
  circuloWrapper: {
    alignItems: 'center',
    marginTop: 28,
    marginBottom: 26,
  },
  circulo: {
    borderWidth: 1.5,
    borderColor: '#3A3A3A',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#111111',
  },
  badgePercentualCirculo: {
    position: 'absolute',
    top: 22,
    borderWidth: 1,
    borderColor: VERDE,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  kcalNumero: {
    color: VERDE,
    fontSize: 44,
    fontWeight: 'bold',
    marginTop: 14,
  },
  kcalLinha: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  chamaIcone: {
    fontSize: 15,
    marginRight: 6,
  },
  kcalLabel: {
    color: VERDE,
    fontSize: 15,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  kcalMetaTexto: {
    color: '#888888',
    fontSize: 12,
    marginTop: 6,
  },
  blocoBpm: {
    backgroundColor: CINZA_ESCURO,
    borderRadius: 14,
    padding: 16,
  },
  demoArea: { alignItems: 'flex-start', marginTop: 18 },
  avisoDemo: { color: '#888888', fontSize: 11, marginTop: 6, lineHeight: 15 },
  blocoHistorico: {
    backgroundColor: CINZA_ESCURO,
    borderRadius: 14,
    marginTop: 18,
    padding: 16,
  },
  historicoTitulo: {
    color: '#AAAAAA',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 14,
  },
  barrasLinha: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 6,
  },
  barraColuna: { flex: 1, alignItems: 'center' },
  barraValor: { color: VERDE, fontSize: 9, fontWeight: '700', marginBottom: 4 },
  barraTrilho: {
    width: '60%',
    height: 80,
    borderRadius: 6,
    backgroundColor: '#2A2A2A',
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  barraPreenchidaHistorico: {
    width: '100%',
    borderRadius: 6,
    backgroundColor: VERDE,
  },
  barraDia: { color: '#888888', fontSize: 10, marginTop: 5 },
  bpmCabecalho: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  bpmTitulo: {
    color: '#AAAAAA',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  badgeStatus: {
    backgroundColor: 'rgba(61, 220, 92, 0.15)',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  badgeStatusTexto: {
    color: VERDE,
    fontSize: 11,
    fontWeight: 'bold',
  },
  badgeTexto: {
    color: VERDE,
    fontSize: 11,
    fontWeight: 'bold',
  },
  bpmLinhaValor: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  coracaoIconeGrande: {
    color: VERDE,
    fontSize: 22,
    marginRight: 8,
    marginBottom: 4,
  },
  bpmValor: {
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: 'bold',
    marginRight: 6,
  },
  bpmUnidade: {
    color: '#888888',
    fontSize: 14,
    marginBottom: 5,
  },
});