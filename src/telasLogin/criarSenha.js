import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function CriarSenha({ navigation }) {
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);

  const temMinimo8 = senha.length >= 8;
  const temEspecial = /[#?!,%]/.test(senha);
  const temLetra = /[a-zA-Z]/.test(senha);
  const senhaValida = temMinimo8 && temEspecial && temLetra;

  const handleAvancar = () => {
    if (senhaValida) {
      navigation.navigate('DadosPessoais', { senha });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={28} color="#3DDC5C" />
        </TouchableOpacity>

        {/* Logo */}
        <View style={styles.logoContainer}>
          <Ionicons name="barbell-outline" size={48} color="#FFFFFF" />
        </View>

        {/* Progresso */}
        <View style={styles.progressWrapper}>
          <Text style={styles.etapaText}>Etapa 1 de 4</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '25%' }]} />
          </View>
        </View>

        <Text style={styles.titulo}>Crie uma senha</Text>

        {/* Campo senha */}
        <View style={styles.form}>
          <Text style={styles.label}>Senha</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="••••••••••••"
              placeholderTextColor="#666"
              secureTextEntry={!mostrarSenha}
              value={senha}
              onChangeText={setSenha}
              autoCapitalize="none"
            />
            <TouchableOpacity onPress={() => setMostrarSenha(!mostrarSenha)}>
              <Ionicons
                name={mostrarSenha ? 'eye-off-outline' : 'eye-outline'}
                size={22}
                color="#888"
              />
            </TouchableOpacity>
          </View>

          {/* Botão Avançar */}
          <TouchableOpacity
            style={[styles.botao, !senhaValida && styles.botaoDesabilitado]}
            onPress={handleAvancar}
            disabled={!senhaValida}
          >
            <Text style={styles.botaoTexto}>Avançar</Text>
          </TouchableOpacity>

          {/* Requisitos */}
          <View style={styles.requisitos}>
            <RequisitoItem texto="mínimo 8 caracteres" atendido={temMinimo8} />
            <RequisitoItem texto="mínimo 1 caractere especial (#, ?, !, %)" atendido={temEspecial} />
            <RequisitoItem texto="mínimo 1 letra" atendido={temLetra} />
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function RequisitoItem({ texto, atendido }) {
  return (
    <View style={styles.requisitoItem}>
      <Ionicons
        name={atendido ? 'checkmark-circle' : 'ellipse-outline'}
        size={16}
        color={atendido ? '#3DDC5C' : '#666'}
      />
      <Text style={[styles.requisitoTexto, atendido && styles.requisitoTextoAtivo]}>
        {texto}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    paddingHorizontal: 24,
  },
  backButton: {
    marginTop: 10,
    width: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 24,
  },
  progressWrapper: {
    marginBottom: 20,
  },
  etapaText: {
    color: '#999',
    fontSize: 13,
    marginBottom: 8,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#2A2A2A',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3DDC5C',
    borderRadius: 2,
  },
  titulo: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 24,
  },
  form: {
    flex: 1,
  },
  label: {
    color: '#CCCCCC',
    fontSize: 14,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  input: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
    paddingVertical: 12,
  },
  botao: {
    backgroundColor: '#3DDC5C',
    borderRadius: 30,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  botaoDesabilitado: {
    backgroundColor: '#2A4A32',
  },
  botaoTexto: {
    color: '#0D0D0D',
    fontSize: 16,
    fontWeight: '700',
  },
  requisitos: {
    marginTop: 24,
    gap: 12,
  },
  requisitoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  requisitoTexto: {
    color: '#777',
    fontSize: 13,
  },
  requisitoTextoAtivo: {
    color: '#CCCCCC',
  },
});