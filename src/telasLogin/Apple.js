import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
} from 'react-native';

// Tela: Apple.js
// Exibida quando o usuário escolhe entrar com a conta Apple.
// Aqui entraria a integração real (ex: expo-apple-authentication).

export default function Apple({ navigation }) {
  const [carregando, setCarregando] = useState(false);

  const handleEntrar = () => {
    setCarregando(true);
    // TODO: integrar com o SDK da Apple (expo-apple-authentication)
    setTimeout(() => {
      setCarregando(false);
      navigation.navigate('Home');
    }, 1500);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#121212" />

      <TouchableOpacity style={styles.voltar} onPress={() => navigation.goBack()}>
        <Text style={styles.voltarTexto}>‹ Voltar</Text>
      </TouchableOpacity>

      <View style={styles.conteudo}>
        <View style={styles.iconeCircle}>
          <Text style={styles.iconeTexto}></Text>
        </View>

        <Text style={styles.titulo}>Entrar com a Apple</Text>
        <Text style={styles.subtitulo}>
          Use seu Apple ID para entrar de forma rápida e segura no Gymvance.
        </Text>

        <TouchableOpacity
          style={styles.botao}
          activeOpacity={0.85}
          onPress={handleEntrar}
          disabled={carregando}
        >
          {carregando ? (
            <ActivityIndicator color="#000000" />
          ) : (
            <Text style={styles.botaoTexto}> Continuar com a Apple</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.aviso}>
          Ao continuar, você concorda com os Termos de Uso e a Política de Privacidade do Gymvance.
        </Text>
      </View>
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconeCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#000000',
    borderWidth: 1,
    borderColor: '#2A2A2A',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  iconeTexto: {
    fontSize: 36,
    color: '#FFFFFF',
  },
  titulo: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  subtitulo: {
    fontSize: 14,
    color: '#A0A0A0',
    textAlign: 'center',
    paddingHorizontal: 16,
    marginBottom: 32,
    lineHeight: 20,
  },
  botao: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 40,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  botaoTexto: {
    color: '#000000',
    fontSize: 15,
    fontWeight: '700',
  },
  aviso: {
    color: '#6B6B6B',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 20,
    paddingHorizontal: 20,
    lineHeight: 16,
  },
});