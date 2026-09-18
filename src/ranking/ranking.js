import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

import BottomNavBar from '../components/BottomNavBar';
import { useNomeUsuario } from '../services/useUserProfile';
import { getDadosRankingSimulado } from '../services/metricas';

const PODIO = [
  { posicao: 2, nome: 'Gabriel S.', dias: 18, cor: '#B0B0B0' },
  { posicao: 1, nome: 'Renata A.', dias: 24, cor: '#F4C430' },
  { posicao: 3, nome: 'Thiago M.', dias: 15, cor: '#CD7F32' },
];

const ABAS = ['Semanal', 'Mensal', 'Geral'];

export default function Ranking({ navigation }) {
  const nomeUsuario = useNomeUsuario();
  const [abaAtiva, setAbaAtiva] = useState('Semanal');
  const [dadosRanking, setDadosRanking] = useState([]);

  React.useEffect(() => {
    setDadosRanking(getDadosRankingSimulado(nomeUsuario));
  }, [nomeUsuario]);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.streak}>
            <MaterialCommunityIcons name="fire" size={22} color="#3DDC5C" />
            <Text style={styles.streakText}>5</Text>
          </View>
          <Text style={styles.logo}>
            Gym<Text style={styles.logoAccent}>vance</Text>
          </Text>
        </View>

        <Text style={styles.titulo}>Ranking Geral</Text>
        <Text style={styles.subtitulo}>Supere seus limites e conquiste o topo!</Text>

        <View style={styles.podioRow}>
          {PODIO.map((item) => (
            <View
              key={item.posicao}
              style={[styles.podioItem, item.posicao === 1 && styles.podioItemDestaque]}
            >
              {item.posicao === 1 && (
                <FontAwesome5 name="crown" size={18} color="#F4C430" style={styles.coroa} />
              )}
              <View
                style={[
                  styles.podioAvatar,
                  {
                    borderColor: item.cor,
                    width: item.posicao === 1 ? 76 : 62,
                    height: item.posicao === 1 ? 76 : 62,
                    borderRadius: item.posicao === 1 ? 38 : 31,
                  },
                ]}
              >
                <Ionicons name="person-outline" size={item.posicao === 1 ? 30 : 24} color="#555" />
              </View>
              <View style={[styles.posicaoBadge, { backgroundColor: item.cor }]}>
                <Text style={styles.posicaoBadgeText}>{item.posicao}º</Text>
              </View>
              <Text style={styles.podioNome}>{item.nome}</Text>
              <View style={styles.podioDiasRow}>
                <MaterialCommunityIcons name="fire" size={13} color="#3DDC5C" />
                <Text style={styles.podioDias}>{item.dias} dias</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.abasRow}>
          {ABAS.map((aba) => (
            <TouchableOpacity
              key={aba}
              style={[styles.aba, abaAtiva === aba && styles.abaAtiva]}
              onPress={() => setAbaAtiva(aba)}
            >
              <Text style={[styles.abaText, abaAtiva === aba && styles.abaTextAtiva]}>{aba}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.lista}>
          {dadosRanking.length > 0 ? dadosRanking.map((item) => (
            <View key={item.posicao} style={[styles.linha, item.voce && styles.linhaVoce]}>
              <Text style={styles.linhaPosicao}>{item.posicao}</Text>
              <View style={styles.linhaAvatar}>
                <Ionicons name="person-outline" size={18} color="#555" />
              </View>
              <View style={styles.linhaInfo}>
                <View style={styles.linhaNomeRow}>
                  <Text style={styles.linhaNome}>{item.nome}</Text>
                  {item.voce && (
                    <View style={styles.voceBadge}>
                      <Text style={styles.voceBadgeText}>VOCÊ</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.linhaTreinos}>{item.treinos} treinos concluídos</Text>
              </View>
              <View style={styles.linhaDiasRow}>
                <MaterialCommunityIcons name="fire" size={14} color="#3DDC5C" />
                <Text style={styles.linhaDias}>{item.dias}</Text>
              </View>
            </View>
          )) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>Ranking ainda não está disponível</Text>
              <Text style={styles.emptyText}>Volte mais tarde para acompanhar sua posição.</Text>
            </View>
          )}
        </View>
      </ScrollView>

      <BottomNavBar activeTab="treino" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  scroll: { paddingHorizontal: 20, paddingBottom: 24 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  streak: { flexDirection: 'row', alignItems: 'center' },
  streakText: { color: '#3DDC5C', fontSize: 20, fontWeight: 'bold', marginLeft: 4 },
  logo: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  logoAccent: { color: '#3DDC5C' },
  titulo: { color: '#fff', fontSize: 24, fontWeight: 'bold', marginBottom: 4 },
  subtitulo: { color: '#999', fontSize: 13, marginBottom: 28 },
  podioRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    marginBottom: 28,
  },
  podioItem: { alignItems: 'center', width: 90 },
  podioItemDestaque: { marginBottom: 10 },
  coroa: { marginBottom: 4 },
  podioAvatar: {
    borderWidth: 2,
    backgroundColor: '#1E1E1E',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: -10,
  },
  posicaoBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#121212',
    zIndex: 2,
  },
  posicaoBadgeText: { color: '#121212', fontWeight: 'bold', fontSize: 11 },
  podioNome: { color: '#fff', fontWeight: 'bold', fontSize: 13, marginTop: 8 },
  podioDiasRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  podioDias: { color: '#999', fontSize: 11, marginLeft: 3 },
  abasRow: {
    flexDirection: 'row',
    backgroundColor: '#1A1A1A',
    borderRadius: 10,
    padding: 4,
    marginBottom: 20,
  },
  aba: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  abaAtiva: { backgroundColor: '#3DDC5C' },
  abaText: { color: '#999', fontSize: 13, fontWeight: '600' },
  abaTextAtiva: { color: '#121212' },
  lista: { gap: 10 },
  linha: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#2A2A2A',
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  linhaVoce: {
    borderColor: '#3DDC5C',
    backgroundColor: '#1E2A1E',
  },
  linhaPosicao: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
    width: 24,
  },
  linhaAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2A2A2A',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  linhaInfo: { flex: 1 },
  linhaNomeRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' },
  linhaNome: { color: '#fff', fontSize: 14, fontWeight: '700' },
  voceBadge: {
    backgroundColor: '#3DDC5C',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 6,
  },
  voceBadgeText: { color: '#121212', fontSize: 8, fontWeight: '700' },
  linhaTreinos: { color: '#9A9A9A', fontSize: 11, marginTop: 2 },
  linhaDiasRow: { flexDirection: 'row', alignItems: 'center' },
  linhaDias: { color: '#fff', fontSize: 14, fontWeight: '700', marginLeft: 4 },
});
