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

// Tela: Telefone.js
// Exibida quando o usuário escolhe entrar com número de telefone.
// Envia um código de verificação por SMS (fluxo a integrar com o backend).

export default function Telefone({ navigation }) {
  const [ddi] = useState('+55');
  const [numero, setNumero] = useState('');

  const numeroValido = numero.replace(/\D/g, '').length >= 10;

  const handleContinuar = () => {
    if (!numeroValido) return;
    // TODO: disparar envio do código SMS via backend
    navigation.navigate('CodigoSMS', { telefone: `${ddi}${numero}` });
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
            <Text style={styles.iconeTexto}>📱</Text>
          </View>

          <Text style={styles.titulo}>Entrar com telefone</Text>
          <Text style={styles.subtitulo}>
            Enviaremos um código de verificação por SMS para confirmar seu número.
          </Text>

          <View style={styles.inputRow}>
            <View style={styles.ddiBox}>
              <Text style={styles.ddiTexto}>{ddi}</Text>
            </View>
            <TextInput
              style={styles.input}
              placeholder="Número de telefone"
              placeholderTextColor="#6B6B6B"
              keyboardType="phone-pad"
              value={numero}
              onChangeText={setNumero}
              maxLength={15}
            />
          </View>

          <TouchableOpacity
            style={[styles.botao, !numeroValido && styles.botaoDesabilitado]}
            activeOpacity={0.85}
            onPress={handleContinuar}
            disabled={!numeroValido}
          >
            <Text style={styles.botaoTexto}>Enviar código</Text>
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
    marginBottom: 32,
    lineHeight: 20,
  },
  inputRow: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  ddiBox: {
    width: 64,
    height: 54,
    borderRadius: 12,
    backgroundColor: '#1E1E1E',
    borderWidth: 1,
    borderColor: '#2A2A2A',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  ddiTexto: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  input: {
    flex: 1,
    height: 54,
    borderRadius: 12,
    backgroundColor: '#1E1E1E',
    borderWidth: 1,
    borderColor: '#2A2A2A',
    paddingHorizontal: 16,
    color: '#FFFFFF',
    fontSize: 15,
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