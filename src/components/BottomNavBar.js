import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const COR_ATIVO = '#3DDC5C';
const COR_INATIVO = '#8A8A8A';
const COR_FUNDO = '#121212';
const COR_BORDA = '#242424';

const ABAS = [
  { id: 'treino', label: 'Treino', icon: 'dumbbell', tela: 'TreinoHub' },
  { id: 'alimentacao', label: 'Alimentação', icon: 'heart-outline', tela: 'Alimentacao' },
  { id: 'relogio', label: 'Relógio', icon: 'clock-outline', tela: 'Batimento' },
];

export default function BottomNavBar({ activeTab }) {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.barra, { paddingBottom: (insets?.bottom ?? 0) + 10 }]}>
      {ABAS.map((aba) => {
        const ativa = aba.id === activeTab;
        const cor = ativa ? COR_ATIVO : COR_INATIVO;

        return (
          <TouchableOpacity
            key={aba.id}
            style={styles.item}
            activeOpacity={0.7}
            onPress={() => navigation?.navigate(aba.tela)}
          >
            <MaterialCommunityIcons name={aba.icon} size={22} color={cor} />
            <Text style={[styles.label, { color: cor }]}>{aba.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  barra: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COR_BORDA,
    backgroundColor: COR_FUNDO,
  },
  item: {
    alignItems: 'center',
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
  },
});