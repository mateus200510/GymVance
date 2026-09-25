import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useIdioma } from '../services/idioma';

const AMARELO = '#FFB020';

// Selo visual usado sempre que valores FICTÍCIOS de demonstração forem
// exibidos. Garante que nunca sejam confundidos com dados reais do usuário.
export default function DemoTag({ compact = false }) {
  const { t } = useIdioma();
  return (
    <View style={[styles.chip, compact && styles.chipCompact]}>
      <View style={styles.dot} />
      <Text style={[styles.text, compact && styles.textCompact]}>{t('demo.tag')}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    backgroundColor: 'rgba(255, 176, 32, 0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255, 176, 32, 0.5)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  chipCompact: {
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: AMARELO,
  },
  text: {
    color: AMARELO,
    fontSize: 12,
    fontWeight: '700',
  },
  textCompact: {
    fontSize: 11,
  },
});