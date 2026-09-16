import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { saveSelectedPlan } from '../services/storage';

export default function Mensal({ navigation }) {
  const [planoSelecionado, setPlanoSelecionado] = useState('mensal');

  const handleAssinar = async () => {
    try {
      await saveSelectedPlan(planoSelecionado);
      Alert.alert(
        'Plano PRO ativado',
        `Seu plano ${planoSelecionado} foi selecionado com sucesso.`,
        [{ text: 'OK', onPress: () => navigation.navigate('TreinoHub') }]
      );
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível ativar o plano no momento.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Ionicons name="barbell-outline" size={40} color="#111" />
          <Text style={styles.logoTexto}>GYMVANCE</Text>
          <View style={styles.proBadge}>
            <Text style={styles.proTexto}>PRO</Text>
          </View>
        </View>

        <View style={styles.divisor} />

        {/* Cards de planos */}
        <View style={styles.planosRow}>
          <PlanoCard
            titulo="Mensal"
            preco="R$ 13,50"
            legenda="Cobrado mensalmente"
            selecionado={planoSelecionado === 'mensal'}
            onPress={() => setPlanoSelecionado('mensal')}
          />
          <PlanoCard
            titulo="Anual"
            preco="R$ 58,32"
            precoAntigo="R$ 97,20"
            desconto="-40%"
            legenda="Cobrado Anualmente"
            selecionado={planoSelecionado === 'anual'}
            onPress={() => setPlanoSelecionado('anual')}
          />
          <PlanoCard
            titulo="Eterno"
            preco="R$ 279,90"
            legenda="Compra única"
            selecionado={planoSelecionado === 'eterno'}
            onPress={() => setPlanoSelecionado('eterno')}
          />
        </View>

        {/* Benefícios */}
        <View style={styles.beneficios}>
          <BeneficioItem
            icone="infinite-outline"
            titulo="Rotinas ilimitadas"
            descricao="Crie a rotina que quiser"
          />
          <BeneficioItem
            icone="sparkles-outline"
            titulo="10 tokens de IA todos os dias"
            descricao="Monte treinos com ajuda da inteligência artificial"
          />
          <BeneficioItem
            icone="stats-chart-outline"
            titulo="Estatísticas avançadas"
            descricao="Acompanhe sua evolução em detalhes"
          />
          <BeneficioItem
            icone="heart-outline"
            titulo="Apoie nossa equipe"
            descricao="Ajude o Gymvance a continuar evoluindo"
          />
        </View>

        {/* Botão Assinar */}
        <TouchableOpacity style={styles.botaoAssinar} onPress={handleAssinar}>
          <Text style={styles.botaoAssinarTexto}>Assinar</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.agoraNao}>Agora não</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function PlanoCard({ titulo, preco, precoAntigo, desconto, legenda, selecionado, onPress }) {
  return (
    <TouchableOpacity
      style={[styles.planoCard, selecionado && styles.planoCardSelecionado]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={styles.planoTitulo}>{titulo}</Text>

      {desconto && (
        <View style={styles.linhaDesconto}>
          <Text style={styles.precoAntigo}>{precoAntigo}</Text>
          <View style={styles.descontoBadge}>
            <Text style={styles.descontoTexto}>{desconto}</Text>
          </View>
        </View>
      )}

      <Text style={styles.planoPreco}>{preco}</Text>
      <Text style={styles.planoLegenda}>{legenda}</Text>
    </TouchableOpacity>
  );
}

function BeneficioItem({ icone, titulo, descricao }) {
  return (
    <View style={styles.beneficioItem}>
      <View style={styles.beneficioIconeWrapper}>
        <Ionicons name={icone} size={22} color="#111" />
      </View>
      <View style={styles.beneficioTextos}>
        <Text style={styles.beneficioTitulo}>{titulo}</Text>
        <Text style={styles.beneficioDescricao}>{descricao}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 16,
  },
  logoTexto: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111',
    letterSpacing: 1,
    marginTop: 6,
  },
  proBadge: {
    backgroundColor: '#3DDC5C',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 2,
    marginTop: 4,
  },
  proTexto: {
    color: '#0D0D0D',
    fontSize: 11,
    fontWeight: '800',
  },
  divisor: {
    height: 1,
    backgroundColor: '#DDD',
    marginBottom: 20,
  },
  planosRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 28,
  },
  planoCard: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: '#E2E2E2',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 8,
    minHeight: 130,
  },
  planoCardSelecionado: {
    borderColor: '#3DDC5C',
    shadowColor: '#3DDC5C',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  planoTitulo: {
    fontSize: 15,
    color: '#333',
    marginBottom: 8,
  },
  linhaDesconto: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  precoAntigo: {
    fontSize: 11,
    color: '#999',
    textDecorationLine: 'line-through',
  },
  descontoBadge: {
    backgroundColor: '#FFD84D',
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  descontoTexto: {
    fontSize: 10,
    fontWeight: '700',
    color: '#111',
  },
  planoPreco: {
    fontSize: 17,
    fontWeight: '800',
    color: '#111',
    marginBottom: 4,
  },
  planoLegenda: {
    fontSize: 10.5,
    color: '#888',
    lineHeight: 13,
  },
  beneficios: {
    gap: 18,
    marginBottom: 28,
  },
  beneficioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  beneficioIconeWrapper: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#EEE',
    backgroundColor: '#FAFAFA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  beneficioTextos: {
    flex: 1,
  },
  beneficioTitulo: {
    fontSize: 15.5,
    fontWeight: '700',
    color: '#111',
    marginBottom: 2,
  },
  beneficioDescricao: {
    fontSize: 12.5,
    color: '#888',
    lineHeight: 16,
  },
  botaoAssinar: {
    backgroundColor: '#111',
    borderRadius: 30,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  botaoAssinarTexto: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  agoraNao: {
    textAlign: 'center',
    color: '#999',
    fontSize: 13.5,
  },
});