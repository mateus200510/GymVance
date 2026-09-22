import React, { useState } from 'react';

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { useIdioma } from '../services/idioma';
import { authenticateUser, createSession } from '../services/storage';

const COLORS = {
  bg: '#121212',
  card: '#1E1E1E',
  green: '#3DDC5C',
  text: '#FFFFFF',
  muted: '#8A8A8A',
  border: '#333333',
  error: '#FF5252',
};

export default function Entrar({ navigation }) {
  const { t } = useIdioma();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  const [mostrarSenha, setMostrarSenha] = useState(false);

  const [erro, setErro] = useState('');

  const fazerLogin = async () => {
    if (!email.includes('@') || !email.includes('.')) {
      setErro(t('cadastro.erroEmail'));
      return;
    }

    if (senha.length < 6) {
      setErro(t('cadastro.erroSenhaCurta'));
      return;
    }

    // Autenticação local (sem backend).
    const autenticado = await authenticateUser(email, senha);
    if (!autenticado) {
      setErro(t('entrar.erroCredenciais'));
      return;
    }

    setErro('');

    await createSession(email);
    navigation.reset({
      index: 0,
      routes: [{ name: 'TreinoHub' }],
    });
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
        <Text style={styles.title}>
          {t('entrar.titulo')}
        </Text>

        <Text style={styles.subtitle}>
          {t('entrar.subtitulo')}
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
              name={
                mostrarSenha
                  ? 'eye-outline'
                  : 'eye-off-outline'
              }
              size={22}
              color={COLORS.muted}
            />
          </TouchableOpacity>
        </View>

        {/* ESQUECI A SENHA */}
        {/* Removido: não há backend para recuperação de senha. */}

        {/* ERRO */}
        {erro !== '' && (
          <Text style={styles.error}>
            {erro}
          </Text>
        )}

        {/* BOTÃO ENTRAR */}
        <TouchableOpacity
          style={styles.button}
          onPress={fazerLogin}
        >
          <Text style={styles.buttonText}>
            {t('comum.entrar')}
          </Text>
        </TouchableOpacity>

        {/* CADASTRO */}
        <View style={styles.registerContainer}>
          <Text style={styles.registerText}>
            {t('entrar.aindaNaoTemConta')}
          </Text>

          <TouchableOpacity
            onPress={() => navigation.navigate('Cadastro')}
          >
            <Text style={styles.registerLink}>
              {t('comum.criarConta')}
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
    textAlign: 'center',
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

  registerContainer: {
    flexDirection: 'row',
    marginTop: 15,
    marginBottom: 20,
  },

  registerText: {
    color: COLORS.muted,
    fontSize: 14,
  },

  registerLink: {
    color: COLORS.green,
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 5,
  },
});