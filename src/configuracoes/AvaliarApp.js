import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Linking,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';

import BottomNavBar from '../components/BottomNavBar';
import { useIdioma } from '../services/idioma';

const VERDE = '#3DDC5C';

export default function AvaliarApp({ navigation }) {
  const { t } = useIdioma();

  const abrirPlayStore = async () => {
    try {
      const packageName = 'com.gymvance.app';
      const url = `https://play.google.com/store/apps/details?id=${packageName}`;
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
        Alert.alert(t('avaliar.obrigado'));
      } else {
        Alert.alert(t('avaliar.erro'));
      }
    } catch (error) {
      console.warn('Erro ao abrir Play Store:', error);
      Alert.alert(t('avaliar.erro'));
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

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120, flexGrow: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={styles.titulo}>{t('avaliar.titulo')}</Text>
          <Text style={styles.subtitulo}>{t('avaliar.subtitulo')}</Text>

          <View style={styles.estrelaContainer}>
            <Feather name="star" size={64} color={VERDE} />
          </View>

          <TouchableOpacity style={styles.botaoAvaliar} activeOpacity={0.8} onPress={abrirPlayStore}>
            <Feather name="star" size={16} color="#000" />
            <Text style={styles.botaoAvaliarTexto}>{t('avaliar.botao')}</Text>
          </TouchableOpacity>
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
  titulo: { color: '#fff', fontSize: 20, fontWeight: '700', marginBottom: 8, textAlign: 'center' },
  subtitulo: { color: '#8E8E93', fontSize: 14, marginBottom: 32, textAlign: 'center' },
  estrelaContainer: { marginBottom: 32 },
  botaoAvaliar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: VERDE, borderRadius: 24, paddingVertical: 14, paddingHorizontal: 32, gap: 8 },
  botaoAvaliarTexto: { color: '#000', fontSize: 14, fontWeight: '700' },
});