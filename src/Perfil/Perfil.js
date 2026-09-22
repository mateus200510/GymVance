import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';

import BottomNavBar from '../components/BottomNavBar';
import { getUserProfile, saveUserProfile, getWorkoutHistory, formatarDataNascimento } from '../services/storage';
import { useIdioma } from '../services/idioma';

const VERDE = '#3DDC5C';

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

export default function Perfil({ navigation }) {
  const { t } = useIdioma();
  const [perfil, setPerfil] = useState({});
  const [totalTreinos, setTotalTreinos] = useState(0);
  const [editando, setEditando] = useState(false);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    (async () => {
      const dados = await getUserProfile();
      setPerfil(dados);
      setNome(dados?.nome || '');
      setEmail(dados?.email || '');

      const historico = await getWorkoutHistory();
      setTotalTreinos(Array.isArray(historico) ? historico.length : 0);
    })();
  }, []);

  const salvarEdicao = async () => {
    try {
      const atualizado = await saveUserProfile({ nome, email });
      setPerfil(atualizado);
      setEditando(false);
    } catch (error) {
      console.warn('Erro ao salvar perfil:', error);
      Alert.alert(t('comum.erro'), t('perfil.erroSalvarPerfil'));
    }
  };

  const unidadePeso = perfil?.pesoUnidade || 'kg';
  const unidadeAltura = perfil?.alturaUnidade || 'cm';

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.perfilRow}>
            <View style={styles.avatarPequeno}>
              <Feather name="user" size={16} color="#8E8E93" />
            </View>
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

          <View style={styles.avatarGrande}>
            <Feather name="user" size={36} color="#8E8E93" />
          </View>
          <Text style={styles.nomeGrande}>{perfil?.nome || t('comum.usuario')}</Text>

          <View style={styles.card}>
            <LinhaInfo rotulo={t('cadastro.email')} valor={perfil?.email || '—'} />
            <LinhaInfo rotulo={t('genero.genero')} valor={rotuloGenero(t, perfil?.genero)} />
            <LinhaInfo rotulo={t('genero.dataNascimento')} valor={formatarDataNascimento(perfil?.dataNascimento) || '—'} />
            <LinhaInfo rotulo={t('perfil.medida.peso')} valor={perfil?.peso ? `${perfil.peso} ${unidadePeso}` : '—'} />
            <LinhaInfo rotulo={t('altura.nome')} valor={perfil?.altura ? `${perfil.altura} ${unidadeAltura}` : '—'} />
          </View>

          <View style={styles.cardStats}>
            <Text style={styles.statsNumero}>{totalTreinos}</Text>
            <Text style={styles.statsLabel}>{t('perfil.treinosConcluidos')}</Text>
          </View>

          {editando ? (
            <View style={styles.formEdit}>
              <Text style={styles.fieldLabel}>{t('perfil.nomeLabel')}</Text>
              <TextInput
                style={styles.campoInput}
                placeholder={t('perfil.placeholderNome')}
                placeholderTextColor="#6E6E73"
                value={nome}
                onChangeText={setNome}
              />
              <Text style={styles.fieldLabel}>{t('perfil.emailLabel')}</Text>
              <TextInput
                style={styles.campoInput}
                placeholder={t('perfil.placeholderEmail')}
                placeholderTextColor="#6E6E73"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
              <TouchableOpacity style={styles.botaoVerde} onPress={salvarEdicao}>
                <Feather name="check" size={14} color="#000" />
                <Text style={styles.botaoVerdeTexto}>{t('perfil.salvarAlteracoes')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.botaoSecundario} onPress={() => setEditando(false)}>
                <Text style={styles.botaoSecundarioTexto}>{t('comum.cancelar')}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.botaoVerde} onPress={() => setEditando(true)}>
              <Feather name="edit-2" size={14} color="#000" />
              <Text style={styles.botaoVerdeTexto}>{t('perfil.editarPerfil')}</Text>
            </TouchableOpacity>
          )}

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

      <BottomNavBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#000' },
  container: { flex: 1, backgroundColor: '#000', paddingHorizontal: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, marginBottom: 16 },
  perfilRow: { flexDirection: 'row', alignItems: 'center' },
  headerDireita: { flexDirection: 'row', alignItems: 'center' },
  avatarPequeno: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#1C1C1E', justifyContent: 'center', alignItems: 'center', marginRight: 8 },
  headerNome: { color: '#fff', fontSize: 13 },
  logo: { color: VERDE, fontWeight: '700', fontSize: 15 },
  titulo: { color: '#fff', fontSize: 20, fontWeight: '700', marginBottom: 16 },
  avatarGrande: { width: 84, height: 84, borderRadius: 42, backgroundColor: '#1C1C1E', justifyContent: 'center', alignItems: 'center', alignSelf: 'center', marginBottom: 10 },
  nomeGrande: { color: '#fff', fontSize: 18, fontWeight: '700', textAlign: 'center', marginBottom: 20 },
  card: { backgroundColor: '#1C1C1E', borderRadius: 14, padding: 16, marginBottom: 12 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#2C2C2E' },
  infoLabel: { color: '#8E8E93', fontSize: 13 },
  infoValor: { color: '#fff', fontSize: 13, fontWeight: '600' },
  cardStats: { backgroundColor: '#1C1C1E', borderRadius: 14, padding: 16, alignItems: 'center', marginBottom: 20 },
  statsNumero: { color: VERDE, fontSize: 28, fontWeight: '800' },
  statsLabel: { color: '#8E8E93', fontSize: 12, marginTop: 2 },
  botaoVerde: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: VERDE, borderRadius: 24, paddingVertical: 12, marginBottom: 12 },
  botaoVerdeTexto: { color: '#000', fontSize: 13, fontWeight: '700', marginLeft: 6 },
  botaoSecundario: { alignItems: 'center', paddingVertical: 10, marginBottom: 8 },
  botaoSecundarioTexto: { color: '#8E8E93', fontSize: 13, fontWeight: '600' },
  botaoEvolucao: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderWidth: 1, borderColor: VERDE, borderRadius: 24, paddingVertical: 12 },
  botaoEvolucaoTexto: { color: VERDE, fontSize: 13, fontWeight: '700' },
  botaoConfig: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12, marginTop: 8 },
  botaoConfigTexto: { color: '#8E8E93', fontSize: 13, fontWeight: '600' },
  formEdit: { marginBottom: 12 },
  fieldLabel: { color: '#8E8E93', fontSize: 12, marginBottom: 6 },
  campoInput: { backgroundColor: '#1C1C1E', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, color: '#fff', fontSize: 14, borderWidth: 1, borderColor: '#2C2C2E', marginBottom: 12 },
});