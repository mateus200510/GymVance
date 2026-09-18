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

import BottomNavBar from '../components/BottomNavBar';
import { useNomeUsuario } from '../services/useUserProfile';
import { BPM_PADRAO, KCAL_META_PADRAO, getBpmAtual, getKcalMeta, getKcalQueimadas } from '../services/metricas';

// Tela de "Batimento Cardíaco" do Gymvance
// Mostra o BPM em destaque no círculo central e a queima diária logo abaixo
export default function Batimento({ navigation }) {
  const { width } = useWindowDimensions();
  const nomeUsuario = useNomeUsuario();
  const [bpmAtual, setBpmAtual] = useState(BPM_PADRAO);
  const [kcalQueimadas, setKcalQueimadas] = useState(0);
  const [kcalMeta, setKcalMeta] = useState(KCAL_META_PADRAO);
  const percentualMeta = Math.round((kcalQueimadas / kcalMeta) * 100);
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
          Alert.alert('Localização bloqueada', 'Abra as configurações do aparelho para permitir o uso do GPS.');
          Linking.openSettings();
        } else {
          setGpsError('Permissão de localização negada.');
        }
        return;
      }

      const providerStatus = await Location.getProviderStatusAsync();
      if (!providerStatus.locationServicesEnabled) {
        setGpsError('GPS desativado. Ative a localização para continuar.');
        return;
      }

      const posicao = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const precisao = posicao.coords.accuracy ?? 0;
      setLocation(posicao.coords);
      setPrecision(precisao);
    } catch (error) {
      setGpsError('Não foi possível obter a localização agora.');
    }
  };

  useEffect(() => {
    atualizarLocalizacao();
  }, []);

  useEffect(() => {
    let ativo = true;

    (async () => {
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

  const statusPrecisao =
    precision === null
      ? 'Aguardando...' 
      : precision < 10
        ? '🟢 Alta precisão'
        : precision <= 30
          ? '🟡 Média precisão'
          : '🔴 Baixa precisão';

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="light-content" backgroundColor="#0D0D0D" />

      {/* Cabeçalho */}
      <View style={styles.cabecalho}>
        <View style={styles.perfil}>
          <View style={styles.avatar}>
            <Text style={styles.avatarIcone}>👤</Text>
          </View>
          <View>
            <Text style={styles.evolucaoTexto}>Evolução diária</Text>
            <Text style={styles.nomeUsuario}>{nomeUsuario}</Text>
          </View>
        </View>
        <Text style={styles.logo}>
          Gym<Text style={styles.logoVerde}>vance</Text>
        </Text>
      </View>

      {/* Conteúdo rolável */}
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Círculo de BPM */}
        <View style={styles.circuloWrapper}>
          <TouchableOpacity
            activeOpacity={0.8}
            style={[styles.circulo, { width: circleSize, height: circleSize, borderRadius: circleSize / 2 }]}
            onPress={() => navigation?.navigate('Calorias')}
          >
            <Text style={[styles.bpmNumero, { fontSize: Math.min(circleSize * 0.28, 60) }]}>{bpmAtual}</Text>
            <View style={styles.bpmLinha}>
              <Text style={styles.coracaoIcone}>♡</Text>
              <Text style={styles.bpmLabel}>BPM</Text>
            </View>
          </TouchableOpacity>
        </View>

      {/* Queima diária */}
      <View style={styles.blocoQueima}>
        <View style={styles.queimaCabecalho}>
          <Text style={styles.queimaTitulo}>QUEIMA DIÁRIA</Text>
          <View style={styles.badgePercentual}>
            <Text style={styles.badgeTexto}>{percentualMeta}%</Text>
          </View>
        </View>
        <Text style={styles.queimaValor}>
          {kcalQueimadas.toLocaleString('pt-BR')}{' '}
          <Text style={styles.queimaMeta}>/ {kcalMeta.toLocaleString('pt-BR')} kcal</Text>
        </Text>
        <View style={styles.barraFundo}>
          <View style={[styles.barraPreenchida, { width: `${percentualMeta}%` }]} />
        </View>
      </View>

      <View style={styles.localizacaoBox}>
        <View style={styles.localizacaoHeader}>
          <Text style={styles.localizacaoTitulo}>LOCALIZAÇÃO</Text>
          <TouchableOpacity onPress={atualizarLocalizacao}>
            <Text style={styles.localizacaoAtualizar}>Atualizar</Text>
          </TouchableOpacity>
        </View>
        {gpsError ? (
          <Text style={styles.localizacaoErro}>{gpsError}</Text>
        ) : (
          <>
            <Text style={styles.localizacaoValor}>
              {location ? `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}` : 'Buscando...' }
            </Text>
            <Text style={styles.localizacaoPrecisao}>{statusPrecisao}</Text>
            <Text style={styles.localizacaoInfo}>
              {precision !== null ? `Precisão: ${precision.toFixed(0)} m` : 'Precisão em análise'}
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
  avatarIcone: {
    fontSize: 16,
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
});