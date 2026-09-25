import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  Image,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

import BottomNavBar from '../components/BottomNavBar';
import { getUserProfile, saveUserProfile, getWorkoutHistory, formatarDataNascimento, getEstatisticasTreino, calcularIdade, formatarPeso, formatarAltura } from '../services/storage';
import { useIdioma } from '../services/idioma';
import { useUsuario } from '../services/UserContext';
import { selecionarFotoDaGaleria } from '../services/fotoPerfil';

const VERDE = '#3DDC5C';

const MS_DIA = 24 * 60 * 60 * 1000;

function diaInicio(data) {
  return new Date(data.getFullYear(), data.getMonth(), data.getDate()).getTime();
}

function calcularStreak(historico) {
  const dias = new Set();

  for (const item of historico || []) {
    if (!item?.data) continue;
    const data = new Date(item.data);
    if (Number.isNaN(data.getTime())) continue;
    dias.add(diaInicio(data));
  }

  if (dias.size === 0) return 0;

  const hoje = diaInicio(new Date());
  let atual = dias.has(hoje) ? hoje : hoje - MS_DIA;
  let streak = 0;

  while (dias.has(atual)) {
    streak += 1;
    atual -= MS_DIA;
  }

  return streak;
}

function rotuloGenero(t, valor) {
  if (valor === 'Homem') {
    return t('genero.homem');
  }
  if (valor === 'Mulher') {
    return t('genero.mulher');
  }
  return valor || '—';
}

function LinhaInfo({ rotulo, valor }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{rotulo}</Text>
      <Text style={styles.infoValor}>{valor}</Text>
    </View>
  );
}

function StatCard({ label, valor, icone }) {
  return (
    <View style={styles.statCard}>
      <Feather name={icone} size={20} color={VERDE} />
      <Text style={styles.statValor}>{valor}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export default function Perfil({ navigation }) {
  const { t } = useIdioma();
  const { refreshUsuario } = useUsuario();
  const [perfil, setPerfil] = useState({});
  const [totalTreinos, setTotalTreinos] = useState(0);
  const [streak, setStreak] = useState(0);
  const [estatisticas, setEstatisticas] = useState({ totalExercicios: 0, totalSeries: 0, duracaoFormatada: '0h 0min' });
  const [fotoVisualizada, setFotoVisualizada] = useState(null);

  const carregarDados = useCallback(async () => {
    const dados = await getUserProfile();
    setPerfil(dados);
    if (dados?.nome) {
      await refreshUsuario();
    }

    const historico = await getWorkoutHistory();
    setTotalTreinos(Array.isArray(historico) ? historico.length : 0);
    setStreak(calcularStreak(historico));

    const stats = await getEstatisticasTreino();
    setEstatisticas(stats);
  }, [refreshUsuario]);

  useFocusEffect(
    useCallback(() => {
      let ativo = true;
      carregarDados().then(() => {
        if (!ativo) return;
      });
      return () => {
        ativo = false;
      };
    }, [carregarDados])
  );

  const unidadePeso = perfil?.pesoUnidade || 'kg';
  const unidadeAltura = perfil?.alturaUnidade || 'cm';
  const idade = perfil?.dataNascimento ? calcularIdade(perfil.dataNascimento) : null;

  const escolherFoto = async () => {
    try {
      const resultado = await selecionarFotoDaGaleria();

      if (resultado.status === 'ok' && resultado.uri) {
        await saveUserProfile({ foto: resultado.uri });
        setPerfil((prev) => ({ ...prev, foto: resultado.uri }));
        await refreshUsuario();
        return;
      }

      if (resultado.status === 'bloqueada') {
        Alert.alert(
          t('perfil.galeriaBloqueada'),
          t('perfil.galeriaBloqueadaMsg'),
          [
            { text: t('comum.cancelar'), style: 'cancel' },
            { text: t('perfil.abrirConfiguracoes'), onPress: () => require('react-native').Linking.openSettings() },
          ]
        );
        return;
      }

      if (resultado.status === 'negada') {
        Alert.alert(t('perfil.permissaoNecessaria'), t('perfil.fotosPermissaoMsg'));
      }
    } catch (error) {
      console.warn('Erro ao adicionar foto:', error);
      Alert.alert(t('comum.erro'), t('perfil.erroAdicionarFoto'));
    }
  };

  const abrirEditarPerfil = () => {
    navigation?.navigate('EditarPerfil');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.perfilRow}>
            <TouchableOpacity style={styles.avatarPequeno} onPress={abrirEditarPerfil} activeOpacity={0.8}>
              {perfil?.foto ? (
                <Image source={{ uri: perfil.foto }} style={styles.avatarImage} />
              ) : (
                <Feather name="user" size={16} color="#8E8E93" />
              )}
            </TouchableOpacity>
            <Text style={styles.headerNome}>{perfil?.nome || t('comum.usuario')}</Text>
          </View>
          <View style={styles.headerDireita}>
            <Text style={styles.logo}>GymVance</Text>
            <TouchableOpacity onPress={() => navigation?.goBack()} style={{ marginLeft: 12 }} accessibilityLabel={t('perfil.voltar')}>
              <Feather name="arrow-left" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
          <Text style={styles.titulo}>{t('perfil.meuPerfil')}</Text>

          <TouchableOpacity style={styles.avatarGrande} onPress={() => (perfil?.foto ? setFotoVisualizada(perfil.foto) : escolherFoto())} activeOpacity={0.8}>
            {perfil?.foto ? (
              <Image source={{ uri: perfil.foto }} style={styles.avatarImageGrande} />
            ) : (
              <Feather name="user" size={36} color="#8E8E93" />
            )}
          </TouchableOpacity>
          <Text style={styles.nomeGrande}>{perfil?.nome || t('comum.usuario')}</Text>

          <View style={styles.statsRow}>
            <StatCard label={t('perfil.ofensiva')} valor={String(streak)} icone="zap" />
            <StatCard label={t('perfil.treinosConcluidos')} valor={String(totalTreinos)} icone="activity" />
            <StatCard label={t('perfil.exercicios')} valor={String(estatisticas.totalExercicios)} icone="repeat" />
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitulo}>{t('perfil.estatisticas')}</Text>
            <View style={styles.statsGrid}>
              <LinhaInfo rotulo={t('perfil.treinosConcluidos')} valor={String(estatisticas.totalTreinos || totalTreinos)} />
              <LinhaInfo rotulo={t('perfil.exercicios')} valor={String(estatisticas.totalExercicios)} />
              <LinhaInfo rotulo={t('perfil.series')} valor={String(estatisticas.totalSeries)} />
              <LinhaInfo rotulo={t('perfil.tempoTotal')} valor={estatisticas.duracaoFormatada} />
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitulo}>{t('perfil.medidas')}</Text>
            <LinhaInfo rotulo={t('perfil.medida.peso')} valor={formatarPeso(perfil?.peso, unidadePeso)} />
            <LinhaInfo rotulo={t('altura.nome')} valor={formatarAltura(perfil?.altura, unidadeAltura)} />
            <LinhaInfo rotulo={t('perfil.idade')} valor={idade ? `${idade} ${t('comum.anos') || 'anos'}` : '—'} />
            <LinhaInfo rotulo={t('genero.genero')} valor={rotuloGenero(t, perfil?.genero)} />
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitulo}>{t('perfil.exercicios')}</Text>
            <Text style={styles.cardSubtitulo}>{t('perfil.exerciciosUnicos') || 'Exercícios únicos realizados'}</Text>
            <Text style={styles.exerciciosCount}>{estatisticas.totalExercicios}</Text>
          </View>

          <TouchableOpacity style={styles.card} onPress={() => navigation?.navigate('Calendario')} activeOpacity={0.8}>
            <View style={styles.calendarioRow}>
              <Feather name="calendar" size={16} color={VERDE} />
              <Text style={styles.calendarioCardTitulo}>{t('calendario.titulo')}</Text>
              <Feather name="chevron-right" size={16} color="#8E8E93" />
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.botaoEvolucao} onPress={() => navigation?.navigate('Evolucao')}>
            <Feather name="trending-up" size={16} color={VERDE} />
            <Text style={styles.botaoEvolucaoTexto}>{t('perfil.minhaEvolucao')}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.botaoConfig} onPress={() => navigation?.navigate('Configuracoes')}>
            <Feather name="settings" size={16} color={VERDE} />
            <Text style={styles.botaoConfigTexto}>{t('configuracoes.titulo')}</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      <BottomNavBar activeTab="treino" />

      <Modal
        visible={fotoVisualizada !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setFotoVisualizada(null)}
      >
        <View style={styles.modalFundo}>
          <TouchableOpacity style={styles.modalFechar} onPress={() => setFotoVisualizada(null)} accessibilityLabel={t('perfil.fecharFoto')}>
            <Feather name="x" size={26} color="#fff" />
          </TouchableOpacity>
          {fotoVisualizada ? (
            <Image source={{ uri: fotoVisualizada }} style={styles.modalImagem} resizeMode="contain" />
          ) : null}
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#000' },
  container: { flex: 1, backgroundColor: '#000', paddingHorizontal: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, marginBottom: 16 },
  perfilRow: { flexDirection: 'row', alignItems: 'center' },
  headerDireita: { flexDirection: 'row', alignItems: 'center' },
  avatarPequeno: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#1C1C1E', justifyContent: 'center', alignItems: 'center', marginRight: 8, overflow: 'hidden' },
  avatarImage: { width: '100%', height: '100%' },
  headerNome: { color: '#fff', fontSize: 13 },
  logo: { color: VERDE, fontWeight: '700', fontSize: 15 },
  titulo: { color: '#fff', fontSize: 20, fontWeight: '700', marginBottom: 16 },
  avatarGrande: { width: 84, height: 84, borderRadius: 42, backgroundColor: '#1C1C1E', justifyContent: 'center', alignItems: 'center', alignSelf: 'center', marginBottom: 10, overflow: 'hidden' },
  avatarImageGrande: { width: '100%', height: '100%', borderRadius: 42 },
  nomeGrande: { color: '#fff', fontSize: 18, fontWeight: '700', textAlign: 'center', marginBottom: 20 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  statCard: { flex: 1, alignItems: 'center', backgroundColor: '#1C1C1E', borderRadius: 14, padding: 16, marginHorizontal: 4, gap: 6 },
  statValor: { color: VERDE, fontSize: 20, fontWeight: '800' },
  statLabel: { color: '#8E8E93', fontSize: 11, textAlign: 'center' },
  card: { backgroundColor: '#1C1C1E', borderRadius: 14, padding: 16, marginBottom: 12 },
  cardTitulo: { color: '#fff', fontSize: 15, fontWeight: '600', marginBottom: 12 },
  cardSubtitulo: { color: '#8E8E93', fontSize: 12, marginBottom: 4 },
  exerciciosCount: { color: VERDE, fontSize: 28, fontWeight: '800', textAlign: 'center' },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#2C2C2E' },
  infoLabel: { color: '#8E8E93', fontSize: 13 },
  infoValor: { color: '#fff', fontSize: 13, fontWeight: '600' },
  statsGrid: { gap: 8 },
  calendarioRow: { flexDirection: 'row', alignItems: 'center' },
  calendarioCardTitulo: { color: '#fff', fontSize: 15, fontWeight: '600', marginLeft: 8, flex: 1 },
  botaoEvolucao: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderWidth: 1, borderColor: VERDE, borderRadius: 24, paddingVertical: 12 },
  botaoEvolucaoTexto: { color: VERDE, fontSize: 13, fontWeight: '700' },
  botaoConfig: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12, marginTop: 8 },
  botaoConfigTexto: { color: '#8E8E93', fontSize: 13, fontWeight: '600' },
  modalFundo: { flex: 1, backgroundColor: 'rgba(0,0,0,0.95)', justifyContent: 'center', alignItems: 'center' },
  modalImagem: { width: '100%', height: '100%' },
  modalFechar: { position: 'absolute', top: 52, right: 20, zIndex: 10, backgroundColor: '#1C1C1E', borderRadius: 20, width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
});