import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { getUserProfile, saveUserProfile, formatarDataNascimento, normalizarDataNascimento } from '../services/storage';

const GENEROS = ['Homem', 'Mulher'];

function formatarDataInput(texto) {
  const apenasNumeros = texto.replace(/\D/g, '').slice(0, 8);
  if (apenasNumeros.length <= 2) {
    return apenasNumeros;
  }
  if (apenasNumeros.length <= 4) {
    return `${apenasNumeros.slice(0, 2)}/${apenasNumeros.slice(2)}`;
  }
  return `${apenasNumeros.slice(0, 2)}/${apenasNumeros.slice(2, 4)}/${apenasNumeros.slice(4, 8)}`;
}

function validarDataNascimento(value) {
  const iso = normalizarDataNascimento(value);
  if (!iso) {
    return null;
  }

  const [ano, mes, dia] = iso.split('-').map(Number);
  const data = new Date(ano, mes - 1, dia);

  if (
    data.getFullYear() !== ano ||
    data.getMonth() !== mes - 1 ||
    data.getDate() !== dia
  ) {
    return null;
  }

  return iso;
}

export default function Genero({ navigation }) {
  const [nome, setNome] = useState('');
  const [generoSelecionado, setGeneroSelecionado] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');

  useEffect(() => {
    const carregarPerfil = async () => {
      const perfil = await getUserProfile();
      if (perfil?.nome) setNome(perfil.nome);
      if (perfil?.genero) setGeneroSelecionado(perfil.genero);
      if (perfil?.dataNascimento) {
        setDataNascimento(formatarDataNascimento(perfil.dataNascimento));
      }
    };

    carregarPerfil();
  }, []);

  const handleAvancar = async () => {
    if (!nome.trim()) {
      Alert.alert('Nome obrigatório', 'Informe seu nome para continuar.');
      return;
    }

    const dataIso = validarDataNascimento(dataNascimento);
    if (!dataIso) {
      Alert.alert('Data inválida', 'Informe uma data de nascimento válida no formato DD/MM/AAAA.');
      return;
    }

    if (!generoSelecionado) {
      Alert.alert('Gênero obrigatório', 'Selecione seu gênero para continuar.');
      return;
    }

    await saveUserProfile({
      nome: nome.trim(),
      genero: generoSelecionado,
      dataNascimento: dataIso,
    });

    navigation?.reset({
      index: 0,
      routes: [{ name: 'TreinoHub' }],
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <TouchableOpacity style={styles.backButton} onPress={() => navigation?.goBack()}>
          <Ionicons name="arrow-back" size={22} color="#3DDC5C" />
        </TouchableOpacity>

        <View style={styles.formCard}>
          <Text style={styles.stepText}>Etapa 4 de 4</Text>
          <Text style={styles.title}>Crie seu perfil</Text>

          <Text style={styles.label}>Nome</Text>
          <TextInput
            style={styles.input}
            value={nome}
            onChangeText={setNome}
            placeholder="Digite seu nome"
            placeholderTextColor="#7A7A7A"
            autoCapitalize="words"
          />

          <Text style={styles.sectionLabel}>Gênero</Text>
          <Text style={styles.helper}>Usamos o gênero para adaptar o volume de treino, gasto calórico e dieta.</Text>

          <View style={styles.generoRow}>
            {GENEROS.map((item) => {
              const ativo = generoSelecionado === item;
              return (
                <TouchableOpacity
                  key={item}
                  style={[styles.generoOption, ativo && styles.generoOptionAtivo]}
                  onPress={() => setGeneroSelecionado(item)}
                >
                  <View style={[styles.radio, ativo && styles.radioAtivo]}>
                    {ativo && <View style={styles.radioInner} />}
                  </View>
                  <Text style={styles.generoTexto}>{item}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={styles.sectionLabel}>Data de nascimento</Text>
          <Text style={styles.helper}>Informe a data completa do seu nascimento para personalizar sua evolução.</Text>

          <TextInput
            style={styles.input}
            value={dataNascimento}
            onChangeText={(text) => setDataNascimento(formatarDataInput(text))}
            keyboardType="number-pad"
            maxLength={10}
            placeholder="DD/MM/AAAA"
            placeholderTextColor="#7A7A7A"
          />

          <TouchableOpacity style={styles.button} onPress={handleAvancar}>
            <Text style={styles.buttonText}>Avançar</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0D0D',
  },
  scroll: {
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 32,
  },
  backButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  formCard: {
    backgroundColor: '#111111',
    borderRadius: 18,
    padding: 14,
  },
  selectBox: {
    borderWidth: 1,
    borderColor: '#2C2C2C',
    backgroundColor: '#111111',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
  },
  label: {
    color: '#B7B7B7',
    fontSize: 12,
    marginBottom: 4,
  },
  value: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  gridMeses: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  mesItem: {
    width: '30%',
    borderRadius: 10,
    backgroundColor: '#181818',
    paddingVertical: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  mesItemAtivo: {
    backgroundColor: '#1E1E1E',
    borderColor: '#3DDC5C',
  },
  mesTexto: {
    color: '#E6E6E6',
    fontSize: 12,
  },
  mesTextoAtivo: {
    color: '#3DDC5C',
    fontWeight: '700',
  },
  stepText: {
    color: '#8E8E93',
    fontSize: 12,
    marginBottom: 8,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 14,
  },
  sectionLabel: {
    color: '#F1F1F1',
    fontSize: 15,
    fontWeight: '700',
    marginTop: 18,
    marginBottom: 6,
  },
  helper: {
    color: '#888',
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#3D3D3D',
    backgroundColor: '#111111',
    color: '#FFFFFF',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 10,
  },
  generoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  generoOption: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%',
    borderWidth: 1,
    borderColor: '#2D2D2D',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 10,
    backgroundColor: '#181818',
  },
  generoOptionAtivo: {
    borderColor: '#3DDC5C',
    backgroundColor: '#1B2A1E',
  },
  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#8F8F8F',
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioAtivo: {
    borderColor: '#3DDC5C',
  },
  radioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3DDC5C',
  },
  generoTexto: {
    color: '#FFFFFF',
    fontSize: 15,
  },
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  dataInput: {
    width: '30%',
    borderWidth: 1,
    borderColor: '#3D3D3D',
    backgroundColor: '#111111',
    color: '#FFFFFF',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 12,
    textAlign: 'center',
    fontSize: 14,
  },
  button: {
    backgroundColor: '#3DDC5C',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  buttonText: {
    color: '#000000',
    fontSize: 18,
    fontWeight: '700',
  },
});
