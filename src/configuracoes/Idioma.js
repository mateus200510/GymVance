import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';

import BottomNavBar from '../components/BottomNavBar';
import { useIdioma } from '../services/idioma';

const VERDE = '#3DDC5C';

export default function Idioma({ navigation }) {
  const { t, idioma, definirIdioma } = useIdioma();

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
          <Text style={styles.titulo}>{t('configuracoes.idioma')}</Text>

          <View style={styles.card}>
            <TouchableOpacity
              style={styles.opcao}
              activeOpacity={0.7}
              onPress={() => definirIdioma('pt')}
            >
              <Text style={styles.opcaoRotulo}>{t('perfil.portugues')}</Text>
              {idioma === 'pt' ? <Feather name="check" size={16} color={VERDE} /> : null}
            </TouchableOpacity>
            <View style={styles.divisor} />
            <TouchableOpacity
              style={styles.opcao}
              activeOpacity={0.7}
              onPress={() => definirIdioma('en')}
            >
              <Text style={styles.opcaoRotulo}>{t('perfil.ingles')}</Text>
              {idioma === 'en' ? <Feather name="check" size={16} color={VERDE} /> : null}
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
  card: { backgroundColor: '#1C1C1E', borderRadius: 14, marginBottom: 20 },
  opcao: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, gap: 10 },
  opcaoRotulo: { color: '#fff', fontSize: 14, flex: 1 },
  divisor: { height: StyleSheet.hairlineWidth, backgroundColor: '#2C2C2E', marginLeft: 16 },
});