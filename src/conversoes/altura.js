import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const CM_PARA_IN = 0.393701;

export default function AlturaScreen({ navigation }) {
  const [altura, setAltura] = useState('');
  const [unidade, setUnidade] = useState('cm'); // 'cm' | 'in'

  function trocarUnidade() {
    const novaUnidade = unidade === 'cm' ? 'in' : 'cm';

    if (altura) {
      const valor = parseFloat(altura.replace(',', '.'));
      if (!isNaN(valor)) {
        const convertido =
          novaUnidade === 'in' ? valor * CM_PARA_IN : valor / CM_PARA_IN;
        setAltura(convertido.toFixed(1));
      }
    }
    setUnidade(novaUnidade);
  }

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={22} color="#fff" />
      </TouchableOpacity>

      <View style={styles.logoContainer}>
        <Text style={styles.logo}>||G||</Text>
      </View>

      <View style={styles.progressBar} />

      <Text style={styles.step}>Etapa 4 de 4</Text>
      <Text style={styles.title}>Qual sua altura?</Text>

      <Text style={styles.label}>Altura</Text>
      <View style={styles.row}>
        <TextInput
          style={styles.input}
          placeholder="175"
          placeholderTextColor="#555"
          keyboardType="numeric"
          value={altura}
          onChangeText={setAltura}
        />
        <TouchableOpacity style={styles.unitButton} onPress={trocarUnidade}>
          <Text style={styles.unitText}>
            {unidade === 'cm' ? 'cm' : 'in'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={{ flex: 1 }} />

      <TouchableOpacity
        style={styles.advanceButton}
        onPress={() => navigation.navigate('ProximaEtapa')}
      >
        <Text style={styles.advanceText}>Avançar</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    paddingHorizontal: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  logoContainer: {
    alignItems: 'center',
    marginVertical: 24,
  },
  logo: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  progressBar: {
    height: 2,
    backgroundColor: '#4CAF50',
    marginBottom: 24,
  },
  step: {
    color: '#888',
    fontSize: 13,
    marginBottom: 4,
  },
  title: {
    color: '#fff',
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  label: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: '#111',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: '#fff',
    fontSize: 16,
  },
  unitButton: {
    width: 70,
    backgroundColor: '#111',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unitText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  advanceButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 30,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 30,
  },
  advanceText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
});