import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  StatusBar,
} from 'react-native';

// Tela de "Escolher Login" do Gymvance
// Fica em: src/telasLogin/escolherLogin.js
export default function EscolherLogin({ navigation }) {
  const [email, setEmail] = useState('');
  const [focado, setFocado] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0D0D0D" />

      {/* Logo */}
      <Image
        source={require('../../assets/FundoPretoRestoBranco.jpeg')}
        style={styles.logo}
        resizeMode="contain"
      />

      {/* Título */}
      <Text style={styles.titulo}>
        Inscreva-se no{'\n'}
        <Text style={styles.tituloVerde}>Gym</Text>
        Vance e cresça{' '}
        <Text style={styles.tituloVerde}>hoje</Text>
      </Text>

      {/* Campo de e-mail / usuário */}
      <Text style={styles.label}>E-mail ou nome de usuário</Text>
      <TextInput
        style={[styles.input, focado && styles.inputFocado]}
        placeholder="nome@gmail.com"
        placeholderTextColor="#777777"
        value={email}
        onChangeText={setEmail}
        onFocus={() => setFocado(true)}
        onBlur={() => setFocado(false)}
        keyboardType="default"
        autoCapitalize="none"
        autoCorrect={false}
      />

      {/* Botão avançar */}
      <TouchableOpacity
        style={styles.botaoAvancar}
        activeOpacity={0.85}
        onPress={() => navigation.navigate('Entrar')}
      >
        <Text style={styles.textoAvancar}>Avançar</Text>
      </TouchableOpacity>

      {/* Linha divisória */}
      <View style={styles.divisor} />

      {/* Botões de login social */}
      <TouchableOpacity
        style={styles.botaoSocial}
        activeOpacity={0.7}
        onPress={() => navigation.navigate('Google')}
      >
        <Image source={require('../../assets/google.png')} style={styles.iconeSocial} />
        <Text style={styles.textoSocial}>Inscrever-se com Google</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.botaoSocial}
        activeOpacity={0.7}
        onPress={() => navigation.navigate('Facebook')}
      >
        <Image source={require('../../assets/facebook.png')} style={styles.iconeSocial} />
        <Text style={styles.textoSocial}>Inscrever-se com Facebook</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.botaoSocial}
        activeOpacity={0.7}
        onPress={() => navigation.navigate('Apple')}
      >
        <Image source={require('../../assets/apple.png')} style={styles.iconeSocial} />
        <Text style={styles.textoSocial}>Inscrever-se com Apple</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.botaoSocial}
        activeOpacity={0.7}
        onPress={() => navigation.navigate('Telefone')}
      >
        <Text style={[styles.textoSocial, styles.textoTelefone]}>
          Inscrever-se com seu{'\n'}número de telefone
        </Text>
      </TouchableOpacity>

      {/* Rodapé */}
      <View style={styles.rodape}>
        <Text style={styles.textoRodape}>Já tem uma conta?</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Entrar')}>
          <Text style={styles.linkEntrar}>Entrar</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const VERDE = '#3DDC5C';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0D0D',
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  logo: {
    width: 90,
    height: 60,
    marginTop: 20,
    marginBottom: 12,
  },
  titulo: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 32,
    marginBottom: 28,
  },
  tituloVerde: {
    color: VERDE,
  },
  label: {
    alignSelf: 'flex-start',
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#3A3A3A',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#FFFFFF',
    fontSize: 15,
    marginBottom: 18,
  },
  inputFocado: {
    borderColor: VERDE,
  },
  botaoAvancar: {
    width: '100%',
    backgroundColor: VERDE,
    borderRadius: 30,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 24,
  },
  textoAvancar: {
    color: '#0D0D0D',
    fontSize: 16,
    fontWeight: 'bold',
  },
  divisor: {
    width: '100%',
    height: 1,
    backgroundColor: '#2A2A2A',
    marginBottom: 20,
  },
  botaoSocial: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#3A3A3A',
    borderRadius: 30,
    paddingVertical: 13,
    marginBottom: 12,
  },
  iconeSocial: {
    width: 20,
    height: 20,
    marginRight: 10,
    resizeMode: 'contain',
  },
  textoSocial: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  textoTelefone: {
    textAlign: 'center',
  },
  rodape: {
    marginTop: 'auto',
    marginBottom: 24,
    alignItems: 'center',
  },
  textoRodape: {
    color: '#AAAAAA',
    fontSize: 14,
    marginBottom: 4,
  },
  linkEntrar: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});