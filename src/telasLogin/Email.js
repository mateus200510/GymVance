import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

// Tela: Email.js
// Exibida quando o usuário escolhe entrar com e-mail e senha.

export default function Email({ navigation }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);

  const emailValido = /\S+@\S+\.\S+/.test(email);
  const podeEntrar = emailValido && senha.length >= 6;

  const handleEntrar = () => {
    if (!podeEntrar) return;
    // TODO: autenticar com o backend (ex: Firebase Auth, API própria)
    navigation.navigate('Home');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#121212" />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <TouchableOpacity style={styles.voltar} onPress={() => navigation.goBack()}>
          <Text style={styles.voltarTexto}>‹ Voltar</Text>
        </TouchableOpacity>

        <View style={styles.conteudo}>
          <View style={styles.iconeCircle}>
            <Text style={styles.iconeTexto}>✉️</Text>
          </View>

          <Text style={styles.titulo}>Entrar com e-mail</Text>
          <Text style={styles.subtitulo}>Acesse sua conta com seu e-mail e senha cadastrados.</Text>

          <Text style={styles.label}>E-mail</Text>
          <TextInput
            style={styles.input}
            placeholder="seuemail@exemplo.com"
            placeholderTextColor="#6B6B6B"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />

          <Text style={styles.label}>Senha</Text>
          <View style={styles.senhaRow}>
            <TextInput
              style={styles.inputSenha}
              placeholder="Sua senha"
              placeholderTextColor="#6B6B6B"
              secureTextEntry={!mostrarSenha}
              value={senha}
              onChangeText={setSenha}
            />
            <TouchableOpacity onPress={() => setMostrarSenha(!mostrarSenha)}>
              <Text style={styles.mostrarSenha}>{mostrarSenha ? 'Ocultar' : 'Mostrar'}</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.esqueciSenha}>
            <Text style={styles.esqueciSenhaTexto}>Esqueci minha senha</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.botao, !podeEntrar && styles.botaoDesabilitado]}
            activeOpacity={0.85}
            onPress={handleEntrar}
            disabled={!podeEntrar}
          >
            <Text style={styles.botaoTexto}>Entrar</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    paddingHorizontal: 24,
  },
  voltar: {
    marginTop: 16,
  },
  voltarTexto: {
    color: '#A0A0A0',
    fontSize: 15,
  },
  conteudo: {
    flex: 1,
    justifyContent: 'center',
  },
  iconeCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#1E1E1E',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 24,
  },
  iconeTexto: {
    fontSize: 30,
  },
  titulo: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitulo: {
    fontSize: 14,
    color: '#A0A0A0',
    textAlign: 'center',
    paddingHorizontal: 16,
    marginBottom: 28,
    lineHeight: 20,
  },
  label: {
    color: '#A0A0A0',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 4,
  },
  input: {
    height: 54,
    borderRadius: 12,
    backgroundColor: '#1E1E1E',
    borderWidth: 1,
    borderColor: '#2A2A2A',
    paddingHorizontal: 16,
    color: '#FFFFFF',
    fontSize: 15,
    marginBottom: 18,
  },
  senhaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 54,
    borderRadius: 12,
    backgroundColor: '#1E1E1E',
    borderWidth: 1,
    borderColor: '#2A2A2A',
    paddingHorizontal: 16,
  },
  inputSenha: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 15,
  },
  mostrarSenha: {
    color: '#3DDC5C',
    fontSize: 13,
    fontWeight: '600',
  },
  esqueciSenha: {
    alignSelf: 'flex-end',
    marginTop: 10,
    marginBottom: 28,
  },
  esqueciSenhaTexto: {
    color: '#3DDC5C',
    fontSize: 13,
    fontWeight: '600',
  },
  botao: {
    backgroundColor: '#3DDC5C',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  botaoDesabilitado: {
    backgroundColor: '#2A2A2A',
  },
  botaoTexto: {
    color: '#121212',
    fontSize: 15,
    fontWeight: '700',
  },
});