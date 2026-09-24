import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';

import BottomNavBar from '../components/BottomNavBar';
import { useIdioma } from '../services/idioma';
import { getUnidadePeso, setUnidadePeso, getUnidadeAltura, setUnidadeAltura, getUserProfile, saveUserProfile, converterPeso, converterAltura } from '../services/storage';

const VERDE = '#3DDC5C';

export default function Unidade({ navigation }) {
  const { t } = useIdioma();
  const [unidadePeso, setUnidadePesoState] = useState('kg');
  const [unidadeAltura, setUnidadeAlturaState] = useState('cm');

  useEffect(() => {
    (async () => {
      const peso = await getUnidadePeso();
      const altura = await getUnidadeAltura();
      setUnidadePesoState(peso);
      setUnidadeAlturaState(altura);
    })();
  }, []);

  const alternarPeso = async () => {
    const nova = unidadePeso === 'kg' ? 'lb' : 'kg';
    try {
      const perfil = await getUserProfile();
      if (perfil?.peso) {
        const valorConvertido = converterPeso(perfil.peso, unidadePeso, nova);
        await saveUserProfile({ peso: valorConvertido, pesoUnidade: nova });
      } else {
        await setUnidadePeso(nova);
      }
      setUnidadePesoState(nova);
    } catch (error) {
      console.warn('Erro ao converter peso:', error);
      Alert.alert(t('comum.erro'), t('comum.erroSalvarDados'));
    }
  };

  const alternarAltura = async () => {
    const nova = unidadeAltura === 'cm' ? 'in' : 'cm';
    try {
      const perfil = await getUserProfile();
      if (perfil?.altura) {
        const valorConvertido = converterAltura(perfil.altura, unidadeAltura, nova);
        await saveUserProfile({ altura: valorConvertido, alturaUnidade: nova });
      } else {
        await setUnidadeAltura(nova);
      }
      setUnidadeAlturaState(nova);
    } catch (error) {
      console.warn('Erro ao converter altura:', error);
      Alert.alert(t('comum.erro'), t('comum.erroSalvarDados'));
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation?.goBack()} accessibilityLabel={t('perfil.voltar')}>
            <Feather name="arrow-left" size={20} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.logo}>GymVance</Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
          <Text style={styles.titulo}>{t('unidade.titulo')}</Text>

          <Text style={styles.secaoTitulo}>{t('unidade.peso')}</Text>
          <View style={styles.card}>
            <TouchableOpacity
              style={[styles.opcao, unidadePeso === 'kg' && styles.opcaoAtiva]}
              activeOpacity={0.7}
              onPress={alternarPeso}
            >
              <Text style={[styles.opcaoRotulo, unidadePeso === 'kg' && styles.opcaoRotuloAtiva]}>{t('unidade.kg')}</Text>
              {unidadePeso === 'kg' && <Feather name="check" size={16} color={VERDE} />}
            </TouchableOpacity>
            <View style={styles.divisor} />
            <TouchableOpacity
              style={[styles.opcao, unidadePeso === 'lb' && styles.opcaoAtiva]}
              activeOpacity={0.7}
              onPress={alternarPeso}
            >
              <Text style={[styles.opcaoRotulo, unidadePeso === 'lb' && styles.opcaoRotuloAtiva]}>{t('unidade.lb')}</Text>
              {unidadePeso === 'lb' && <Feather name="check" size={16} color={VERDE} />}
            </TouchableOpacity>
          </View>

          <Text style={styles.secaoTitulo}>{t('unidade.altura')}</Text>
          <View style={styles.card}>
            <TouchableOpacity
              style={[styles.opcao, unidadeAltura === 'cm' && styles.opcaoAtiva]}
              activeOpacity={0.7}
              onPress={alternarAltura}
            >
              <Text style={[styles.opcaoRotulo, unidadeAltura === 'cm' && styles.opcaoRotuloAtiva]}>{t('unidade.cm')}</Text>
              {unidadeAltura === 'cm' && <Feather name="check" size={16} color={VERDE} />}
            </TouchableOpacity>
            <View style={styles.divisor} />
            <TouchableOpacity
              style={[styles.opcao, unidadeAltura === 'in' && styles.opcaoAtiva]}
              activeOpacity={0.7}
              onPress={alternarAltura}
            >
              <Text style={[styles.opcaoRotulo, unidadeAltura === 'in' && styles.opcaoRotuloAtiva]}>{t('unidade.ft')}</Text>
              {unidadeAltura === 'in' && <Feather name="check" size={16} color={VERDE} />}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>

      <BottomNavBar activeTab="treino" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#000' },
  container: { flex: 1, backgroundColor: '#000', paddingHorizontal: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, marginBottom: 16 },
  logo: { color: VERDE, fontWeight: '700', fontSize: 15 },
  titulo: { color: '#fff', fontSize: 20, fontWeight: '700', marginBottom: 16 },
  secaoTitulo: { color: '#8E8E93', fontSize: 13, marginBottom: 8, marginTop: 4 },
  card: { backgroundColor: '#1C1C1E', borderRadius: 14, marginBottom: 20 },
  opcao: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, gap: 10 },
  opcaoAtiva: { backgroundColor: '#1B2A1E' },
  opcaoRotulo: { color: '#fff', fontSize: 14, flex: 1 },
  opcaoRotuloAtiva: { color: VERDE, fontWeight: '600' },
  divisor: { height: StyleSheet.hairlineWidth, backgroundColor: '#2C2C2E', marginLeft: 16 },
});