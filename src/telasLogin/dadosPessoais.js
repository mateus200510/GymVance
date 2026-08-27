import React, { useState, useRef } from 'react';
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

export default function DadosPessoais({ navigation, route }) {
  const [nome, setNome] = useState('');
  const [genero, setGenero] = useState(null); // 'Homem' | 'Mulher'
  const [dia, setDia] = useState('');
  const [mes, setMes] = useState('');
  const [ano, setAno] = useState('');

  const mesRef = useRef(null);
  const anoRef = useRef(null);

  const formValido =
    nome.trim().length > 0 &&
    genero &&
    dia.length > 0 &&
    mes.length > 0 &&
    ano.length === 4;

  const handleAvancar = () => {
    if (formValido) {
      navigation.navigate('ProximaEtapa', {
        ...route.params,
        nome,
        genero,
        dataNascimento: `${dia}/${mes}/${ano}`,
      });
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
          <Text style={styles.etapaText}>Etapa 2 de 4</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '50%' }]} />
          </View>
        </View>

        <Text style={styles.titulo}>Crie uma senha</Text>

        {/* Nome */}
        <View style={styles.form}>
          <Text style={styles.label}>Nome</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Digite seu nome"
              placeholderTextColor="#666"
              value={nome}
              onChangeText={setNome}
            />
          </View>

          {/* Gênero */}
          <Text style={[styles.label, { marginTop: 20 }]}>Gênero</Text>
          <Text style={styles.subLabel}>
            Usamos o gênero para adaptar o volume de treinamento, gasto calórico e dieta.
          </Text>

          <TouchableOpacity style={styles.radioRow} onPress={() => setGenero('Homem')}>
            <View style={styles.radioOuter}>
              {genero === 'Homem' && <View style={styles.radioInner} />}
            </View>
            <Text style={styles.radioLabel}>Homem</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.radioRow} onPress={() => setGenero('Mulher')}>
            <View style={styles.radioOuter}>
              {genero === 'Mulher' && <View style={styles.radioInner} />}
            </View>
            <Text style={styles.radioLabel}>Mulher</Text>
          </TouchableOpacity>

          {/* Data de nascimento */}
          <Text style={[styles.label, { marginTop: 20 }]}>Data de nascimento</Text>
          <Text style={styles.subLabel}>
            Usamos sua idade para adaptar o volume de treinamento, gasto calórico e dieta.
          </Text>

          <View style={styles.dataRow}>
            <View style={[styles.inputWrapper, styles.dataInput]}>
              <TextInput
                style={styles.input}
                placeholder="dd"
                placeholderTextColor="#666"
                keyboardType="number-pad"
                maxLength={2}
                value={dia}
                onChangeText={(t) => {
                  setDia(t);
                  if (t.length === 2) mesRef.current?.focus();
                }}
              />
            </View>
            <View style={[styles.inputWrapper, styles.dataInput]}>
              <TextInput
                ref={mesRef}
                style={styles.input}
                placeholder="Mês"
                placeholderTextColor="#666"
                keyboardType="number-pad"
                maxLength={2}
                value={mes}
                onChangeText={(t) => {
                  setMes(t);
                  if (t.length === 2) anoRef.current?.focus();
                }}
              />
            </View>
            <View style={[styles.inputWrapper, styles.dataInput]}>
              <TextInput
                ref={anoRef}
                style={styles.input}
                placeholder="ano"
                placeholderTextColor="#666"
                keyboardType="number-pad"
                maxLength={4}
                value={ano}
                onChangeText={setAno}
              />
            </View>
          </View>

          {/* Botão Avançar */}
          <TouchableOpacity
            style={[styles.botao, !formValido && styles.botaoDesabilitado]}
            onPress={handleAvancar}
            disabled={!formValido}
          >
            <Text style={styles.botaoTexto}>Avançar</Text>
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
    marginBottom: 20,
  },
  form: {
    flex: 1,
  },
  label: {
    color: '#CCCCCC',
    fontSize: 14,
    marginBottom: 4,
  },
  subLabel: {
    color: '#777',
    fontSize: 12,
    marginBottom: 12,
    lineHeight: 16,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  input: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
    paddingVertical: 12,
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 10,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#3DDC5C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#3DDC5C',
  },
  radioLabel: {
    color: '#FFFFFF',
    fontSize: 15,
  },
  dataRow: {
    flexDirection: 'row',
    gap: 10,
  },
  dataInput: {
    flex: 1,
  },
  botao: {
    backgroundColor: '#3DDC5C',
    borderRadius: 30,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 28,
  },
  botaoDesabilitado: {
    backgroundColor: '#2A4A32',
  },
  botaoTexto: {
    color: '#0D0D0D',
    fontSize: 16,
    fontWeight: '700',
  },
});