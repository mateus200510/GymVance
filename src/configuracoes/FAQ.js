import React, { useState } from 'react';
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

const FAQ_DATA = [
  {
    categoria: 'faq.categoria.conta',
    itens: [
      { pergunta: 'faq.pergunta1', resposta: 'faq.resposta1' },
      { pergunta: 'faq.pergunta2', resposta: 'faq.resposta2' },
    ],
  },
  {
    categoria: 'faq.categoria.treinos',
    itens: [
      { pergunta: 'faq.pergunta3', resposta: 'faq.resposta3' },
    ],
  },
  {
    categoria: 'faq.categoria.pro',
    itens: [
      { pergunta: 'faq.pergunta4', resposta: 'faq.resposta4' },
    ],
  },
  {
    categoria: 'faq.categoria.idioma',
    itens: [
      { pergunta: 'faq.pergunta5', resposta: 'faq.resposta5' },
      { pergunta: 'faq.pergunta6', resposta: 'faq.resposta6' },
    ],
  },
  {
    categoria: 'faq.categoria.app',
    itens: [
      { pergunta: 'faq.pergunta7', resposta: 'faq.resposta7' },
      { pergunta: 'faq.pergunta8', resposta: 'faq.resposta8' },
    ],
  },
];

export default function FAQ({ navigation }) {
  const { t } = useIdioma();
  const [expanded, setExpanded] = useState(new Set());

  const toggle = (index) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
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
          <Text style={styles.titulo}>{t('faq.titulo')}</Text>

          {FAQ_DATA.map((cat, catIndex) => (
            <View key={catIndex} style={styles.categoria}>
              <Text style={styles.categoriaTitulo}>{t(cat.categoria)}</Text>
              <View style={styles.card}>
                {cat.itens.map((item, itemIndex) => {
                  const globalIndex = `${catIndex}-${itemIndex}`;
                  const isOpen = expanded.has(globalIndex);
                  return (
                    <View key={globalIndex}>
                      <TouchableOpacity
                        style={styles.perguntaContainer}
                        activeOpacity={0.8}
                        onPress={() => toggle(globalIndex)}
                      >
                        <Text style={styles.perguntaTexto}>{t(item.pergunta)}</Text>
                        <Feather
                          name={isOpen ? 'chevron-up' : 'chevron-down'}
                          size={16}
                          color="#8E8E93"
                        />
                      </TouchableOpacity>
                      {isOpen && (
                        <View style={styles.respostaContainer}>
                          <Text style={styles.respostaTexto}>{t(item.resposta)}</Text>
                        </View>
                      )}
                      {itemIndex < cat.itens.length - 1 && (
                        <View style={styles.divisor} />
                      )}
                    </View>
                  );
                })}
              </View>
            </View>
          ))}
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
  categoria: { marginBottom: 20 },
  categoriaTitulo: { color: '#8E8E93', fontSize: 13, marginBottom: 8, marginTop: 4 },
  card: { backgroundColor: '#1C1C1E', borderRadius: 14, overflow: 'hidden' },
  perguntaContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14 },
  perguntaTexto: { color: '#fff', fontSize: 14, flex: 1, marginRight: 8 },
  respostaContainer: { paddingHorizontal: 16, paddingBottom: 14, backgroundColor: '#252527', borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#2C2C2E' },
  respostaTexto: { color: '#8E8E93', fontSize: 13, lineHeight: 20 },
  divisor: { height: StyleSheet.hairlineWidth, backgroundColor: '#2C2C2E', marginLeft: 16 },
});