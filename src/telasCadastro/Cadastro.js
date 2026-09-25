import React, { useState } from 'react';

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  Alert,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { useIdioma } from '../services/idioma';
import { saveAccount, createSession } from '../services/storage';

const COLORS = {
  bg: '#121212',
  card: '#1E1E1E',
  green: '#3DDC5C',
  text: '#FFFFFF',
  muted: '#8A8A8A',
  border: '#333333',
  error: '#FF5252',
};

export default function Cadastro({ navigation }) {
  const { t } = useIdioma();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');

  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmarSenha, setMostrarConfirmarSenha] = useState(false);

  const [erro, setErro] = useState('');

  const validarCadastro = async () => {
    if (!email.includes('@') || !email.includes('.')) {
      setErro(t('cadastro.erroEmail'));
      return;
    }

    if (senha.length < 6) {
      setErro(t('cadastro.erroSenhaCurta'));
      return;
    }

    if (senha !== confirmarSenha) {
      setErro(t('cadastro.erroSenhasDiferentes'));
      return;
    }

    setErro('');

    try {
      // Conta local persistida para permitir login posterior.
      await saveAccount({ email, senha });
      // Novo cadastro já inicia a sessão local; próximas entradas usam o Login.
      await createSession(email);
    } catch (error) {
      console.warn('Erro ao salvar conta:', error);
      setErro(t('comum.erroSalvarDados'));
      return;
    }

    // navigate (e não replace) mantém o Cadastro na pilha para o back natural do onboarding.
    navigation.replace('Peso');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* LOGO */}
        <Image
          source={require('../../assets/FundoPretoRestoBranco-removebg-preview.png')}
          style={styles.logo}
          resizeMode="contain"
        />

        {/* TÍTULO */}
        <Text style={styles.title}>{t('cadastro.titulo')}</Text>

        <Text style={styles.subtitle}>
          {t('cadastro.subtitulo')}
        </Text>

        {/* E-MAIL */}
        <View style={styles.inputContainer}>
          <Ionicons
            name="mail-outline"
            size={22}
            color={COLORS.muted}
            style={styles.inputIcon}
          />

          <TextInput
            style={styles.input}
            placeholder={t('cadastro.email')}
            placeholderTextColor={COLORS.muted}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        {/* SENHA */}
        <View style={styles.inputContainer}>
          <Ionicons
            name="lock-closed-outline"
            size={22}
            color={COLORS.muted}
            style={styles.inputIcon}
          />

          <TextInput
            style={styles.input}
            placeholder={t('cadastro.senha')}
            placeholderTextColor={COLORS.muted}
            value={senha}
            onChangeText={setSenha}
            secureTextEntry={!mostrarSenha}
            autoCapitalize="none"
          />

          <TouchableOpacity
            onPress={() => setMostrarSenha(!mostrarSenha)}
          >
            <Ionicons
              name={mostrarSenha ? 'eye-outline' : 'eye-off-outline'}
              size={22}
              color={COLORS.muted}
            />
          </TouchableOpacity>
        </View>

        {/* CONFIRMAR SENHA */}
        <View style={styles.inputContainer}>
          <Ionicons
            name="lock-closed-outline"
            size={22}
            color={COLORS.muted}
            style={styles.inputIcon}
          />

          <TextInput
            style={styles.input}
            placeholder={t('cadastro.confirmarSenha')}
            placeholderTextColor={COLORS.muted}
            value={confirmarSenha}
            onChangeText={setConfirmarSenha}
            secureTextEntry={!mostrarConfirmarSenha}
            autoCapitalize="none"
          />

          <TouchableOpacity
            onPress={() =>
              setMostrarConfirmarSenha(!mostrarConfirmarSenha)
            }
          >
            <Ionicons
              name={
                mostrarConfirmarSenha
                  ? 'eye-outline'
                  : 'eye-off-outline'
              }
              size={22}
              color={COLORS.muted}
            />
          </TouchableOpacity>
        </View>

        {/* ERRO */}
        {erro !== '' && (
          <Text style={styles.error}>
            {erro}
          </Text>
        )}

        {/* BOTÃO CRIAR CONTA */}
        <TouchableOpacity
          style={styles.button}
          onPress={validarCadastro}
        >
          <Text style={styles.buttonText}>
            {t('comum.criarConta')}
          </Text>
        </TouchableOpacity>

        {/* ENTRAR — acesso à tela existente para quem já possui conta */}
        <TouchableOpacity
          style={styles.buttonSecondary}
          onPress={() => navigation.replace('Entrar')}
          accessibilityRole="button"
          accessibilityLabel={t('comum.entrar')}
        >
          <Text style={styles.buttonSecondaryText}>
            {t('comum.entrar')}
          </Text>
        </TouchableOpacity>

        {/* DIVISOR */}
        <View style={styles.dividerContainer}>
          <View style={styles.divider} />
          <Text style={styles.dividerText}>
            {t('auth.ouContinueCom')}
          </Text>
          <View style={styles.divider} />
        </View>

        {/* PROVEDORES DE LOGIN */}
        <View style={styles.providersRow}>
          {/* Google */}
          <TouchableOpacity
            style={styles.providerButton}
            onPress={() =>
              Alert.alert(
                t('auth.googleIndisponivel'),
                t('auth.googleMsg')
              )
            }
            accessibilityRole="button"
            accessibilityLabel={t('auth.google')}
          >
            <Image
              source={require('../../assets/Google.png')}
              style={styles.providerIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>

          {/* Facebook */}
          <TouchableOpacity
            style={styles.providerButton}
            onPress={() =>
              Alert.alert(
                t('auth.facebookIndisponivel'),
                t('auth.facebookMsg')
              )
            }
            accessibilityRole="button"
            accessibilityLabel={t('auth.facebook')}
          >
            <Image
              source={require('../../assets/Facebook.png')}
              style={styles.providerIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>

          {/* Apple */}
          <TouchableOpacity
            style={styles.providerButton}
            onPress={() =>
              Alert.alert(
                t('auth.appleIndisponivel'),
                t('auth.appleMsg')
              )
            }
            accessibilityRole="button"
            accessibilityLabel={t('auth.apple')}
          >
            <Image
              source={require('../../assets/Apple.png')}
              style={styles.providerIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>

        {/* E-MAIL (real) / TELÉFONE (não configurado) */}
        <View style={styles.providersRow}>
          {/* E-mail: forma local real desta tela. */}
          <TouchableOpacity
            style={styles.providerButton}
            onPress={() =>
              Alert.alert(
                t('auth.email'),
                t('auth.emailMsg')
              )
            }
            accessibilityRole="button"
            accessibilityLabel={t('auth.email')}
          >
            <Ionicons
              name="mail-outline"
              size={26}
              color={COLORS.text}
            />
          </TouchableOpacity>

          {/* Telefone: honesto, sem OTP/backend. */}
          <TouchableOpacity
            style={styles.providerButton}
            onPress={() =>
              Alert.alert(
                t('auth.telefoneIndisponivel'),
                t('auth.telefoneMsg')
              )
            }
            accessibilityRole="button"
            accessibilityLabel={t('auth.telefone')}
          >
            <Ionicons
              name="call-outline"
              size={26}
              color={COLORS.text}
            />
          </TouchableOpacity>
        </View>

        {/* LEGENDA DE TRANSPARÊNCIA */}
        <Text style={styles.providerNote}>
          {t('auth.notaProvedores')}
        </Text>

        {/* ENTRAR */}
        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>
            {t('cadastro.jaTemConta')}
          </Text>

          <TouchableOpacity
            onPress={() => navigation.replace('Entrar')}
          >
            <Text style={styles.loginLink}>
              {t('comum.entrar')}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },

  scroll: {
    flexGrow: 1,
    paddingHorizontal: 25,
    paddingVertical: 30,
    alignItems: 'center',
  },

  logo: {
    width: 150,
    height: 90,
    marginBottom: 15,
  },

  title: {
    color: COLORS.text,
    fontSize: 28,
    fontWeight: '700',
    marginTop: 5,
  },

  subtitle: {
    color: COLORS.muted,
    fontSize: 14,
    marginTop: 8,
    marginBottom: 25,
    textAlign: 'center',
  },

  inputContainer: {
    width: '100%',
    height: 55,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  inputIcon: {
    marginRight: 10,
  },

  input: {
    flex: 1,
    color: COLORS.text,
    fontSize: 16,
  },

  error: {
    width: '100%',
    color: COLORS.error,
    fontSize: 14,
    marginBottom: 15,
    textAlign: 'left',
  },

  button: {
    width: '100%',
    height: 55,
    backgroundColor: COLORS.green,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 5,
  },

  buttonText: {
    color: '#121212',
    fontSize: 17,
    fontWeight: '700',
  },

  buttonSecondary: {
    width: '100%',
    height: 55,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    borderWidth: 1,
    borderColor: COLORS.green,
  },

  buttonSecondaryText: {
    color: COLORS.green,
    fontSize: 17,
    fontWeight: '700',
  },

  loginContainer: {
    flexDirection: 'row',
    marginTop: 15,
    marginBottom: 20,
  },

  loginText: {
    color: COLORS.muted,
    fontSize: 14,
  },

  loginLink: {
    color: COLORS.green,
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 5,
  },

  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
    width: '100%',
  },

  divider: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: COLORS.border,
  },

  dividerText: {
    color: COLORS.muted,
    fontSize: 12,
    marginHorizontal: 10,
  },

  providersRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 18,
    marginBottom: 14,
  },

  providerButton: {
    width: 58,
    height: 58,
    borderRadius: 14,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },

  providerIcon: {
    width: 28,
    height: 28,
  },

  providerNote: {
    color: COLORS.muted,
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 16,
    marginTop: 8,
    paddingHorizontal: 6,
  },
});