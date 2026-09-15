import React, { useState } from 'react';

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
  ScrollView,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';

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
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');

  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmarSenha, setMostrarConfirmarSenha] = useState(false);

  const [erro, setErro] = useState('');

  const validarCadastro = () => {
    if (!email.includes('@') || !email.includes('.')) {
      setErro('Insira um e-mail válido.');
      return;
    }

    if (senha.length < 6) {
      setErro('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    if (senha !== confirmarSenha) {
      setErro('As senhas não são iguais.');
      return;
    }

    setErro('');

    // Por enquanto não existe banco/API.
    // Depois podemos colocar o cadastro real aqui.

    navigation.navigate('TreinoHub');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* LOGO */}
        <Image
          source={require('../../assets/FundoPretoRestoBranco.jpeg')}
          style={styles.logo}
          resizeMode="contain"
        />

        {/* TÍTULO */}
        <Text style={styles.title}>Crie sua conta</Text>

        <Text style={styles.subtitle}>
          Comece sua jornada com o Gymvance
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
            placeholder="E-mail"
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
            placeholder="Senha"
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
            placeholder="Confirmar senha"
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
            Criar conta
          </Text>
        </TouchableOpacity>

        {/* DIVISOR */}
        <View style={styles.dividerContainer}>
          <View style={styles.divider} />

          <Text style={styles.dividerText}>
            ou
          </Text>

          <View style={styles.divider} />
        </View>

        {/* GOOGLE */}
        <TouchableOpacity style={styles.socialButton}>
          <Ionicons
            name="logo-google"
            size={22}
            color={COLORS.text}
          />

          <Text style={styles.socialText}>
            Continuar com Google
          </Text>
        </TouchableOpacity>

        {/* FACEBOOK */}
        <TouchableOpacity style={styles.socialButton}>
          <Ionicons
            name="logo-facebook"
            size={22}
            color={COLORS.text}
          />

          <Text style={styles.socialText}>
            Continuar com Facebook
          </Text>
        </TouchableOpacity>

        {/* APPLE */}
        <TouchableOpacity style={styles.socialButton}>
          <Ionicons
            name="logo-apple"
            size={22}
            color={COLORS.text}
          />

          <Text style={styles.socialText}>
            Continuar com Apple
          </Text>
        </TouchableOpacity>

        {/* TELEFONE */}
        <TouchableOpacity style={styles.socialButton}>
          <Ionicons
            name="call-outline"
            size={22}
            color={COLORS.text}
          />

          <Text style={styles.socialText}>
            Continuar com telefone
          </Text>
        </TouchableOpacity>

        {/* ENTRAR */}
        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>
            Já tem uma conta?
          </Text>

          <TouchableOpacity
            onPress={() => navigation.navigate('Entrar')}
          >
            <Text style={styles.loginLink}>
              Entrar
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

  dividerContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 25,
  },

  divider: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },

  dividerText: {
    color: COLORS.muted,
    marginHorizontal: 12,
    fontSize: 14,
  },

  socialButton: {
    width: '100%',
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.card,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },

  socialText: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 12,
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
});