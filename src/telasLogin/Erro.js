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


export default function EscolherLogin({ navigation }) {
  const [email, setEmail] = useState('');
  const [focado, setFocado] = useState(false);
  const [erro, setErro] = useState(false);

  function validarNome(texto) {
    // Validação simples: precisa ter pelo menos 3 caracteres
    return texto.trim().length >= 3;
  }

  function aoClicarAvancar() {
    if (!validarNome(email)) {
      setErro(true);
      return;
    }
    setErro(false);
    // navigation.navigate('ProximaTela');
  }

  function aoDigitar(texto) {
    setEmail(texto);
    if (erro && validarNome(texto)) {
      setErro(false);
    }
  }

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
        vance e cresça{' '}
        <Text style={styles.tituloVerde}>hoje</Text>
      </Text>

      {/* Campo de e-mail / usuário */}
      <Text style={styles.label}>E-mail ou nome de usuário</Text>
      <TextInput
        style={[
          styles.input,
          focado && styles.inputFocado,
          erro && styles.inputErro,
        ]}
        placeholder="nome@gmail.com"
        placeholderTextColor="#777777"
        value={email}
        onChangeText={aoDigitar}
        onFocus={() => setFocado(true)}
        onBlur={() => setFocado(false)}
        keyboardType="default"
        autoCapitalize="none"
        autoCorrect={false}
      />

      {/* Mensagem de erro */}
      {erro && (
        <View style={styles.linhaErro}>
          <Text style={styles.iconeErro}>⚠</Text>
          <Text style={styles.textoErro}>Insira nome válido</Text>
        </View>
      )}

      {/* Botão avançar */}
      <TouchableOpacity
        style={styles.botaoAvancar}
        activeOpacity={0.85}
        onPress={aoClicarAvancar}
      >
        <Text style={styles.textoAvancar}>Avançar</Text>
      </TouchableOpacity>

      {/* Linha divisória */}
      <View style={styles.divisor} />

      {/* Botões de login social */}
      <TouchableOpacity style={styles.botaoSocial} activeOpacity={0.7}>
        <Image source={require('../../assets/google.png')} style={styles.iconeSocial} />
        <Text style={styles.textoSocial}>Inscrever-se com Google</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.botaoSocial} activeOpacity={0.7}>
        <Image source={require('../../assets/facebook.png')} style={styles.iconeSocial} />
        <Text style={styles.textoSocial}>Inscrever-se com Facebook</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.botaoSocial} activeOpacity={0.7}>
        <Image source={require('../../assets/apple.png')} style={styles.iconeSocial} />
        <Text style={styles.textoSocial}>Inscrever-se com Apple</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.botaoSocial} activeOpacity={0.7}>
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
const VERMELHO = '#E24C4C';

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
  },
  inputFocado: {
    borderColor: VERDE,
  },
  inputErro: {
    borderColor: VERMELHO,
  },
  linhaErro: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginTop: 6,
  },
  iconeErro: {
    color: VERMELHO,
    fontSize: 13,
    marginRight: 5,
  },
  textoErro: {
    color: VERMELHO,
    fontSize: 13,
    fontWeight: '500',
  },
  botaoAvancar: {
    width: '100%',
    backgroundColor: VERDE,
    borderRadius: 30,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 18,
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