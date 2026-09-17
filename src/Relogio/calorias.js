import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  StatusBar,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

// Tela de "Calorias" do Gymvance
// Mesma identidade visual da tela de Batimento, mas com a queima diária em destaque
// e o BPM como informação secundária
export default function Calorias({ navigation }) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const nomeUsuario = 'Lucas Miyashiro';
  const kcalQueimadas = 1365;
  const kcalMeta = 2500;
  const percentualMeta = Math.round((kcalQueimadas / kcalMeta) * 100);
  const bpmAtual = 70;
  const circleSize = Math.min(Math.max(width * 0.68, 200), 260);

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom + 8 }]}>
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
        {/* Círculo de calorias */}
        <View style={styles.circuloWrapper}>
          <TouchableOpacity
            activeOpacity={0.8}
            style={[styles.circulo, { width: circleSize, height: circleSize, borderRadius: circleSize / 2 }]}
            onPress={() => navigation?.navigate('Batimento')}
          >
            <View style={styles.badgePercentualCirculo}>
              <Text style={styles.badgeTexto}>{percentualMeta}%</Text>
            </View>
            <Text style={[styles.kcalNumero, { fontSize: Math.min(circleSize * 0.19, 50) }]}>{kcalQueimadas.toLocaleString('pt-BR')}</Text>
            <View style={styles.kcalLinha}>
              <Text style={styles.chamaIcone}>🔥</Text>
              <Text style={styles.kcalLabel}>KCAL</Text>
            </View>
            <Text style={styles.kcalMetaTexto}>
              de {kcalMeta.toLocaleString('pt-BR')} kcal
            </Text>
          </TouchableOpacity>
        </View>

      {/* Batimento cardíaco */}
      <View style={styles.blocoBpm}>
        <View style={styles.bpmCabecalho}>
          <Text style={styles.bpmTitulo}>BATIMENTO CARDÍACO</Text>
          <View style={styles.badgeStatus}>
            <Text style={styles.badgeStatusTexto}>Normal</Text>
          </View>
        </View>
        <View style={styles.bpmLinhaValor}>
          <Text style={styles.coracaoIconeGrande}>♡</Text>
          <Text style={styles.bpmValor}>{bpmAtual}</Text>
          <Text style={styles.bpmUnidade}>BPM</Text>
        </View>
      </View>
      </ScrollView>

      {/* Navegação inferior */}
      <View style={[styles.navInferior, { paddingBottom: insets.bottom + 10 }]}>
        <TouchableOpacity
          style={styles.navItem}
          activeOpacity={0.7}
          onPress={() => navigation?.navigate('TreinoHub')}
        >
          <Image source={require('../../assets/anilha.png')} style={styles.navIcone} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          activeOpacity={0.7}
          onPress={() => navigation?.navigate('Alimentacao')}
        >
          <Image source={require('../../assets/alimentacao.png')} style={styles.navIcone} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItemAtivo}
          activeOpacity={0.7}
          onPress={() => navigation?.navigate('Batimento')}
        >
          <Image source={require('../../assets/relogio.png')} style={styles.navIcone} />
        </TouchableOpacity>
      </View>
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
  navInferior: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginTop: 'auto',
    backgroundColor: CINZA_ESCURO,
    borderRadius: 40,
    paddingHorizontal: 10,
    paddingTop: 10,
    paddingBottom: 10,
    marginBottom: 6,
  },
  navItem: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navItemAtivo: {
    width: 56,
    height: 48,
    borderRadius: 24,
    backgroundColor: VERDE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navIcone: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
});