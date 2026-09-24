import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';

import BottomNavBar from '../components/BottomNavBar';
import { useIdioma } from '../services/idioma';
import { useUsuario } from '../services/UserContext';
import { getUserProfile, saveUserProfile, authenticateUser, getSession, getContas, saveAccount } from '../services/storage';

const VERDE = '#3DDC5C';

export default function Conta({ navigation }) {
  const { t } = useIdioma();
  const { refreshUsuario } = useUsuario();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarNovaSenha, setConfirmarNovaSenha] = useState('');
  const [mostrarSenhaAtual, setMostrarSenhaAtual] = useState(false);
  const [mostrarNovaSenha, setMostrarNovaSenha] = useState(false);
  const [mostrarConfirmarNovaSenha, setMostrarConfirmarNovaSenha] = useState(false);
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    (async () => {
      const perfil = await getUserProfile();
      if (perfil?.nome) setNome(perfil.nome);
      if (perfil?.email) setEmail(perfil.email);
    })();
  }, []);

  const salvarPerfil = async () => {
    if (!nome.trim()) {
      Alert.alert(t('comum.erro'), t('genero.erroNomeMsg'));
      return;
    }
    if (!email.includes('@') || !email.includes('.')) {
      Alert.alert(t('comum.erro'), t('cadastro.erroEmail'));
      return;
    }
    setCarregando(true);
    try {
      await saveUserProfile({ nome: nome.trim(), email: email.trim() });
      await refreshUsuario();
      Alert.alert(t('conta.sucesso'));
    } catch (error) {
      console.warn('Erro ao salvar perfil:', error);
      Alert.alert(t('comum.erro'), t('comum.erroSalvarDados'));
    } finally {
      setCarregando(false);
    }
  };

  const alterarSenha = async () => {
    if (!senhaAtual || !novaSenha || !confirmarNovaSenha) {
      Alert.alert(t('comum.erro'), t('conta.erroSenhaCurta'));
      return;
    }
    if (novaSenha.length < 6) {
      Alert.alert(t('comum.erro'), t('conta.erroSenhaCurta'));
      return;
    }
    if (novaSenha !== confirmarNovaSenha) {
      Alert.alert(t('comum.erro'), t('conta.erroSenhasDiferentes'));
      return;
    }

    const sessao = await getSession();
    if (!sessao?.email) {
      Alert.alert(t('comum.erro'), t('conta.erroSenhaAtual'));
      return;
    }

    const autenticado = await authenticateUser(sessao.email, senhaAtual);
    if (!autenticado) {
      Alert.alert(t('comum.erro'), t('conta.erroSenhaAtual'));
      return;
    }

    setCarregando(true);
    try {
      const contasObj = await getContas();
      contasObj[sessao.email] = { senha: novaSenha };
      await saveAccount({ email: sessao.email, senha: novaSenha });
      setSenhaAtual('');
      setNovaSenha('');
      setConfirmarNovaSenha('');
      Alert.alert(t('conta.sucesso'));
    } catch (error) {
      console.warn('Erro ao alterar senha:', error);
      Alert.alert(t('comum.erro'), t('comum.erroSalvarDados'));
    } finally {
      setCarregando(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation?.goBack()} accessibilityLabel={t('perfil.voltar')}>
            <Feather name="arrow-left" size={20} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.logo}>GymVance</Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }} keyboardShouldPersistTaps="handled">
          <Text style={styles.titulo}>{t('conta.titulo')}</Text>

          <View style={styles.card}>
            <Text style={styles.secaoTitulo}>{t('conta.nome')}</Text>
            <TextInput
              style={styles.input}
              placeholder={t('editarPerfil.placeholderNome')}
              placeholderTextColor="#6E6E73"
              value={nome}
              onChangeText={setNome}
              autoCapitalize="words"
            />
            <Text style={styles.secaoTitulo}>{t('conta.email')}</Text>
            <TextInput
              style={styles.input}
              placeholder={t('perfil.placeholderEmail')}
              placeholderTextColor="#6E6E73"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TouchableOpacity style={[styles.botaoVerde, carregando && styles.botaoVerdeOcupado]} onPress={salvarPerfil} disabled={carregando}>
              {carregando ? <Text style={styles.botaoVerdeTexto}>{t('comum.avancar')}</Text> : (
                <>
                  <Feather name="check" size={14} color="#000" />
                  <Text style={styles.botaoVerdeTexto}>{t('conta.salvar')}</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          <View style={[styles.card, { marginTop: 20 }]}>
            <Text style={styles.secaoTitulo}>{t('conta.alterarSenha')}</Text>
            <Text style={styles.helper}>{t('conta.senhaAtual')}</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder={t('conta.senhaAtual')}
                placeholderTextColor="#6E6E73"
                value={senhaAtual}
                onChangeText={setSenhaAtual}
                secureTextEntry={!mostrarSenhaAtual}
              />
              <TouchableOpacity onPress={() => setMostrarSenhaAtual(!mostrarSenhaAtual)}>
                <Feather name={mostrarSenhaAtual ? 'eye-off' : 'eye'} size={20} color="#8E8E93" />
              </TouchableOpacity>
            </View>
            <Text style={styles.helper}>{t('conta.novaSenha')}</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder={t('conta.novaSenha')}
                placeholderTextColor="#6E6E73"
                value={novaSenha}
                onChangeText={setNovaSenha}
                secureTextEntry={!mostrarNovaSenha}
              />
              <TouchableOpacity onPress={() => setMostrarNovaSenha(!mostrarNovaSenha)}>
                <Feather name={mostrarNovaSenha ? 'eye-off' : 'eye'} size={20} color="#8E8E93" />
              </TouchableOpacity>
            </View>
            <Text style={styles.helper}>{t('conta.confirmarSenha')}</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder={t('conta.confirmarSenha')}
                placeholderTextColor="#6E6E73"
                value={confirmarNovaSenha}
                onChangeText={setConfirmarNovaSenha}
                secureTextEntry={!mostrarConfirmarNovaSenha}
              />
              <TouchableOpacity onPress={() => setMostrarConfirmarNovaSenha(!mostrarConfirmarNovaSenha)}>
                <Feather name={mostrarConfirmarNovaSenha ? 'eye-off' : 'eye'} size={20} color="#8E8E93" />
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={[styles.botaoVerde, carregando && styles.botaoVerdeOcupado]} onPress={alterarSenha} disabled={carregando}>
              {carregando ? <Text style={styles.botaoVerdeTexto}>{t('comum.avancar')}</Text> : (
                <>
                  <Feather name="lock" size={14} color="#000" />
                  <Text style={styles.botaoVerdeTexto}>{t('conta.alterarSenha')}</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>

      <BottomNavBar activeTab="treino" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#000' },
  container: { flex: 1, backgroundColor: '#000', paddingHorizontal: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, marginBottom: 16 },
  logo: { color: VERDE, fontWeight: '700', fontSize: 15 },
  titulo: { color: '#fff', fontSize: 20, fontWeight: '700', marginBottom: 16 },
  card: { backgroundColor: '#1C1C1E', borderRadius: 14, padding: 16, marginBottom: 20 },
  secaoTitulo: { color: '#8E8E93', fontSize: 12, marginBottom: 6, marginTop: 16 },
  helper: { color: '#8E8E93', fontSize: 12, marginBottom: 6 },
  input: { backgroundColor: '#1C1C1E', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, color: '#fff', fontSize: 14, borderWidth: 1, borderColor: '#2C2C2E', marginBottom: 12 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1C1C1E', borderRadius: 10, borderWidth: 1, borderColor: '#2C2C2E', marginBottom: 12 },
  botaoVerde: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: VERDE, borderRadius: 24, paddingVertical: 12, marginTop: 8 },
  botaoVerdeOcupado: { opacity: 0.6 },
  botaoVerdeTexto: { color: '#000', fontSize: 13, fontWeight: '700', marginLeft: 6 },
});