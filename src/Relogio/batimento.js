import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  StatusBar,
  Alert,
  Linking,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import { Feather } from '@expo/vector-icons';

import BottomNavBar from '../components/BottomNavBar';
import DemoTag from '../components/DemoTag';
import { useNomeUsuario } from '../services/useUserProfile';
import { useIdioma } from '../services/idioma';
import { getBpmAtual, getKcalMeta, getKcalQueimadas } from '../services/metricas';
import { MODO_DEMONSTRACAO, DEMO_BATIMENTOS } from '../services/demo';

// Tela de "Batimento Cardíaco" do GymVance
// Mostra o BPM em destaque no círculo central e a queima diária logo abaixo
export default function Batimento({ navigation }) {
  const { t, numero } = useIdioma();
  const { width } = useWindowDimensions();
  const nomeUsuario = useNomeUsuario();
  const [bpmAtual, setBpmAtual] = useState(null);
  const [kcalQueimadas, setKcalQueimadas] = useState(null);
  const [kcalMeta, setKcalMeta] = useState(null);
  const percentualMeta = kcalQueimadas !== null && kcalMeta
    ? Math.round((kcalQueimadas / kcalMeta) * 100)
    : null;
  const circleSize = Math.min(Math.max(width * 0.68, 200), 260);
  const [location, setLocation] = useState(null);
  const [precision, setPrecision] = useState(null);
  const [gpsError, setGpsError] = useState('');

  const atualizarLocalizacao = async () => {
    setGpsError('');

    try {
      const { status, canAskAgain } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        if (!canAskAgain) {
          Alert.alert(t('batimento.erroBloqueadoTitulo'), t('batimento.erroBloqueadoMsg'));
          Linking.openSettings();
        } else {
          setGpsError(t('batimento.erroPermissao'));
        }
        return;
      }

      const providerStatus = await Location.getProviderStatusAsync();
      if (!providerStatus.locationServicesEnabled) {
        setGpsError(t('batimento.erroGps'));
        return;
      }

      const posicao = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const precisao = posicao.coords.accuracy ?? 0;
      setLocation(posicao.coords);
      setPrecision(precisao);
    } catch (error) {
      setGpsError(t('batimento.erroObter'));
    }
  };

  useEffect(() => {
    atualizarLocalizacao();
  }, []);

  useEffect(() => {
    let ativo = true;

    (async () => {
      if (MODO_DEMONSTRACAO) {
        if (ativo) {
          setBpmAtual(DEMO_BATIMENTOS.atual);
          setKcalQueimadas(347);
          setKcalMeta(500);
        }
        return;
      }

      const [bpm, kcal, meta] = await Promise.all([
        getBpmAtual(),
        getKcalQueimadas(),
        getKcalMeta(),
      ]);

      if (!ativo) {
        return;
      }

      setBpmAtual(bpm);
      setKcalQueimadas(kcal);
      setKcalMeta(meta);
    })();

    return () => {
      ativo = false;
    };
  }, []);

  const demoSats = MODO_DEMONSTRACAO ? DEMO_BATIMENTOS : null;
  const maxHistorico = demoSats && demoSats.historico.length > 0 ? Math.max(...demoSats.historico) : 1;
  const minHistorico = demoSats && demoSats.historico.length > 0 ? Math.min(...demoSats.historico) : 1;

  const statusPrecisao =
    precision === null
      ? t('batimento.aguardando')
      : precision < 10
        ? t('batimento.altaPrecisao')
        : precision <= 30
          ? t('batimento.mediaPrecisao')
          : t('batimento.baixaPrecisao');

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

        {/* Círculo de BPM */}
        <View style={styles.circuloWrapper}>
          <TouchableOpacity
            activeOpacity={0.8}
            style={[styles.circulo, { width: circleSize, height: circleSize, borderRadius: circleSize / 2 }]}
            onPress={() => navigation?.navigate('Calorias')}
          >
            <Text style={[styles.bpmNumero, { fontSize: Math.min(circleSize * 0.28, 60) }]}>{bpmAtual === null ? '—' : bpmAtual}</Text>
            <View style={styles.bpmLinha}>
              <Feather name="heart" size={18} color={VERDE} style={styles.coracaoIcone} />
              <Text style={styles.bpmLabel}>BPM</Text>
            </View>
          </TouchableOpacity>
        </View>

      {/* Queima diária */}
      <View style={styles.blocoQueima}>
        <View style={styles.queimaCabecalho}>
          <Text style={styles.queimaTitulo}>{t('batimento.queimaDiaria')}</Text>
          <View style={styles.badgePercentual}>
            <Text style={styles.badgeTexto}>{percentualMeta === null ? '—' : `${percentualMeta}%`}</Text>
          </View>
        </View>
        <Text style={styles.queimaValor}>
          {kcalQueimadas === null ? '—' : numero(kcalQueimadas)}{' '}
          <Text style={styles.queimaMeta}>/ {kcalMeta === null ? '—' : numero(kcalMeta)} kcal</Text>
        </Text>
        <View style={styles.barraFundo}>
          <View style={[styles.barraPreenchida, { width: `${percentualMeta ?? 0}%` }]} />
        </View>
      </View>

      {demoSats && (
        <>
          <View style={styles.blocoEstatisticas}>
            <View style={styles.estatisticaItem}>
              <Text style={styles.estatisticaValor}>{bpmAtual ?? '—'}</Text>
              <Text style={styles.estatisticaLabel}>{t('batimento.media')}</Text>
            </View>
            <View style={styles.estatisticaItem}>
              <Text style={styles.estatisticaValor}>{demoSats.minimo}</Text>
              <Text style={styles.estatisticaLabel}>{t('batimento.minimo')}</Text>
            </View>
            <View style={styles.estatisticaItem}>
              <Text style={styles.estatisticaValor}>{demoSats.maximo}</Text>
              <Text style={styles.estatisticaLabel}>{t('batimento.maximo')}</Text>
            </View>
          </View>

          <View style={styles.blocoHistorico}>
            <Text style={styles.historicoTitulo}>{t('batimento.historico')}</Text>
            <View style={styles.barrasLinha}>
              {demoSats.historico.map((valor, index) => {
                const normalizado = (valor - minHistorico) / Math.max(1, maxHistorico - minHistorico);
                return (
                  <View key={`${index}-${valor}`} style={styles.barraColuna}>
                    <View style={styles.barraTrilho}>
                      <View
                        style={[
                          styles.barraPreenchidaHistorico,
                          { height: `${Math.max(12, normalizado * 100)}%` },
                        ]}
                      />
                    </View>
                    <Text style={styles.barraValor}>{valor}</Text>
                  </View>
                );
              })}
            </View>
            <Text style={styles.historicoLegenda}>
              {t('batimento.leituras').replace('{count}', String(demoSats.historico.length))}
            </Text>
          </View>
        </>
      )}

      <View style={styles.localizacaoBox}>
        <View style={styles.localizacaoHeader}>
          <Text style={styles.localizacaoTitulo}>{t('batimento.localizacao')}</Text>
          <TouchableOpacity onPress={atualizarLocalizacao}>
            <Text style={styles.localizacaoAtualizar}>{t('batimento.atualizar')}</Text>
          </TouchableOpacity>
        </View>
        {gpsError ? (
          <Text style={styles.localizacaoErro}>{gpsError}</Text>
        ) : (
          <>
            <Text style={styles.localizacaoValor}>
              {location ? `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}` : t('batimento.buscando')}
            </Text>
            <Text style={styles.localizacaoPrecisao}>{statusPrecisao}</Text>
            <Text style={styles.localizacaoInfo}>
              {precision !== null ? `${t('batimento.precisao')}: ${precision.toFixed(0)} m` : t('batimento.precisaoAnalise')}
            </Text>
          </>
        )}
      </View>
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
  bpmNumero: {
    color: VERDE,
    fontSize: 56,
    fontWeight: 'bold',
  },
  bpmLinha: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  coracaoIcone: {
    color: VERDE,
    fontSize: 18,
    marginRight: 6,
  },
  bpmLabel: {
    color: VERDE,
    fontSize: 16,
    fontWeight: 'bold',
  },
  blocoQueima: {
    backgroundColor: CINZA_ESCURO,
    borderRadius: 14,
    padding: 16,
  },
  localizacaoBox: {
    backgroundColor: CINZA_ESCURO,
    borderRadius: 14,
    marginTop: 18,
    padding: 16,
  },
  localizacaoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  localizacaoTitulo: {
    color: '#AAAAAA',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  localizacaoAtualizar: {
    color: VERDE,
    fontWeight: '700',
    fontSize: 12,
  },
  localizacaoValor: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  localizacaoPrecisao: {
    color: VERDE,
    fontWeight: '700',
    fontSize: 12,
    marginBottom: 2,
  },
  localizacaoInfo: {
    color: '#888888',
    fontSize: 11,
  },
  localizacaoErro: {
    color: '#FF8A80',
    fontSize: 12,
    fontWeight: '600',
  },
  queimaCabecalho: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  queimaTitulo: {
    color: '#AAAAAA',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  badgePercentual: {
    borderWidth: 1,
    borderColor: VERDE,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeTexto: {
    color: VERDE,
    fontSize: 11,
    fontWeight: 'bold',
  },
  queimaValor: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  queimaMeta: {
    color: '#888888',
    fontSize: 13,
    fontWeight: '400',
  },
  barraFundo: {
    width: '100%',
    height: 6,
    borderRadius: 3,
    backgroundColor: '#333333',
    overflow: 'hidden',
  },
  barraPreenchida: {
    height: '100%',
    backgroundColor: VERDE,
    borderRadius: 3,
  },
  demoArea: { alignItems: 'flex-start', marginTop: 18 },
  avisoDemo: { color: '#888888', fontSize: 11, marginTop: 6, lineHeight: 15 },
  blocoEstatisticas: {
    flexDirection: 'row',
    backgroundColor: CINZA_ESCURO,
    borderRadius: 14,
    marginTop: 18,
    paddingVertical: 14,
  },
  estatisticaItem: { flex: 1, alignItems: 'center' },
  estatisticaValor: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: 'bold',
  },
  estatisticaLabel: {
    color: '#888888',
    fontSize: 11,
    marginTop: 3,
    textTransform: 'uppercase',
  },
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
    gap: 5,
  },
  barraColuna: { flex: 1, alignItems: 'center' },
  barraTrilho: {
    width: '62%',
    height: 70,
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
  barraValor: { color: VERDE, fontSize: 9, fontWeight: '700', marginTop: 4 },
  historicoLegenda: { color: '#888888', fontSize: 11, marginTop: 10 },
});