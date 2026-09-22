import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { getUserProfile, saveUserProfile } from '../services/storage';
import { useIdioma } from '../services/idioma';

const KG_PARA_LBS = 2.20462;

export default function PesoScreen({ navigation }) {
  const { t } = useIdioma();
  const [peso, setPeso] = useState('');
  const [unidade, setUnidade] = useState('kg'); // 'kg' | 'lbs'

  useEffect(() => {
    const carregarPerfil = async () => {
      const perfil = await getUserProfile();
      if (perfil?.peso) {
        setPeso(String(perfil.peso));
      }
      if (perfil?.pesoUnidade) {
        setUnidade(perfil.pesoUnidade);
      }
    };

    carregarPerfil();
  }, []);

  function trocarUnidade() {
    const novaUnidade = unidade === 'kg' ? 'lbs' : 'kg';

    if (peso) {
      const valor = parseFloat(peso.replace(',', '.'));
      if (!isNaN(valor)) {
        const convertido =
          novaUnidade === 'lbs' ? valor * KG_PARA_LBS : valor / KG_PARA_LBS;
        setPeso(convertido.toFixed(1));
      }
    }
    setUnidade(novaUnidade);
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
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

      <Text style={styles.step}>{t('peso.etapa')}</Text>
      <Text style={styles.title}>{t('peso.titulo')}</Text>

      <Text style={styles.label}>{t('perfil.medida.peso')}</Text>
      <View style={styles.row}>
        <TextInput
          style={styles.input}
          placeholder="75"
          placeholderTextColor="#555"
          keyboardType="decimal-pad"
          value={peso}
          onChangeText={setPeso}
        />
        <TouchableOpacity style={styles.unitButton} onPress={trocarUnidade}>
          <Text style={styles.unitText}>
            {unidade === 'kg' ? 'Kg' : 'lbs'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={{ flex: 1 }} />

      <TouchableOpacity
        style={styles.advanceButton}
        onPress={async () => {
          const valor = Number.parseFloat(String(peso).replace(',', '.'));

          if (!peso || Number.isNaN(valor) || valor <= 0) {
            Alert.alert(t('peso.obrigatorio'), t('peso.erroValor'));
            return;
          }

          try {
            await saveUserProfile({ peso: valor, pesoUnidade: unidade });
          } catch (error) {
            console.warn('Erro ao salvar peso:', error);
            Alert.alert(t('comum.erro'), t('comum.erroSalvarDados'));
            return;
          }

          navigation.navigate('Altura');
        }}
      >
        <Text style={styles.advanceText}>{t('comum.avancar')}</Text>
      </TouchableOpacity>
      </KeyboardAvoidingView>
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