import React from 'react';
import {
  SafeAreaView,
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from 'react-native';

// Tela de "Batimento Cardíaco" do Gymvance
// Mostra o BPM em destaque no círculo central e a queima diária logo abaixo
export default function Batimento({ navigation }) {
  // Dados de exemplo - troque pelos valores vindos do sensor (ESP32 + MAX30102)
  const nomeUsuario = 'Lucas Miyashiro';
  const bpmAtual = 70;
  const kcalQueimadas = 1365;
  const kcalMeta = 2500;
  const percentualMeta = Math.round((kcalQueimadas / kcalMeta) * 100);

  return (
    <SafeAreaView style={styles.container}>
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

      {/* Círculo de BPM */}
      <View style={styles.circuloWrapper}>
        <View style={styles.circulo}>
          <Text style={styles.bpmNumero}>{bpmAtual}</Text>
          <View style={styles.bpmLinha}>
            <Text style={styles.coracaoIcone}>♡</Text>
            <Text style={styles.bpmLabel}>BPM</Text>
          </View>
        </View>
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

      {/* Navegação inferior */}
      <View style={styles.navInferior}>
        <TouchableOpacity style={styles.navItem} activeOpacity={0.7}>
          <Image source={require('../../assets/anilha.jpeg')} style={styles.navIcone} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} activeOpacity={0.7}>
          <Image source={require('../../assets/alimentacao.jpeg')} style={styles.navIcone} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItemAtivo} activeOpacity={0.7}>
          <Image source={require('../../assets/relogio.jpeg')} style={styles.navIcone} />
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
    marginTop: 36,
    marginBottom: 28,
  },
  circulo: {
    width: 210,
    height: 210,
    borderRadius: 105,
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
  navInferior: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginTop: 'auto',
    marginBottom: 20,
    backgroundColor: CINZA_ESCURO,
    borderRadius: 40,
    paddingVertical: 10,
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