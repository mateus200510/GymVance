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
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

import { saveSelectedPlan, getSelectedPlan } from '../services/storage';
import { useIdioma } from '../services/idioma';

// Preços fixos (identidade do produto). A formatação segue o idioma selecionado.
const VALORES = {
  mensal: 13.5,
  anual: 58.32,
  anualAntigo: 97.2,
  eterno: 279.9,
};

function formatarMoeda(valor, idioma) {
  const fixado = Number(valor).toFixed(2);
  const comSeparador = idioma === 'pt' ? fixado.replace('.', ',') : fixado;
  return `R$ ${comSeparador}`;
}

export default function Mensal({ navigation }) {
  const { t, idioma } = useIdioma();
  const [planoSelecionado, setPlanoSelecionado] = useState('mensal');

  useEffect(() => {
    let ativo = true;

    const carregarPlano = async () => {
      const plano = await getSelectedPlan();
      if (ativo && plano) {
        setPlanoSelecionado(plano);
      }
    };

    carregarPlano();

    return () => {
      ativo = false;
    };
  }, []);

  const handleAssinar = async () => {
    try {
      await saveSelectedPlan(planoSelecionado);
      Alert.alert(
        t('mensal.ativadoTitulo'),
        t('mensal.ativadoMsg', { plano: t(`mensal.${planoSelecionado}`) }),
        [{ text: 'OK', onPress: () => navigation.reset({ index: 0, routes: [{ name: 'TreinoHub' }] }) }]
      );
    } catch (error) {
      Alert.alert(t('comum.erro'), t('mensal.erroAtivar'));
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Ionicons name="barbell-outline" size={40} color="#111" />
          <Text style={styles.logoTexto}>GymVance</Text>
          <View style={styles.proBadge}>
            <Text style={styles.proTexto}>PRO</Text>
          </View>
        </View>

        <View style={styles.divisor} />

        {/* Cards de planos */}
        <View style={styles.planosRow}>
          <PlanoCard
            titulo={t('mensal.mensal')}
            preco={formatarMoeda(VALORES.mensal, idioma)}
            legenda={t('mensal.cobradoMensalmente')}
            selecionado={planoSelecionado === 'mensal'}
            onPress={() => setPlanoSelecionado('mensal')}
          />
          <PlanoCard
            titulo={t('mensal.anual')}
            preco={formatarMoeda(VALORES.anual, idioma)}
            precoAntigo={formatarMoeda(VALORES.anualAntigo, idioma)}
            desconto="-40%"
            legenda={t('mensal.cobradoAnualmente')}
            selecionado={planoSelecionado === 'anual'}
            onPress={() => setPlanoSelecionado('anual')}
          />
          <PlanoCard
            titulo={t('mensal.eterno')}
            preco={formatarMoeda(VALORES.eterno, idioma)}
            legenda={t('mensal.compraUnica')}
            selecionado={planoSelecionado === 'eterno'}
            onPress={() => setPlanoSelecionado('eterno')}
          />
        </View>

        {/* Benefícios */}
        <View style={styles.beneficios}>
          <BeneficioItem
            icone="infinite-outline"
            titulo={t('mensal.benef1Titulo')}
            descricao={t('mensal.benef1Desc')}
          />
          <BeneficioItem
            icone="sparkles-outline"
            titulo={t('mensal.benef2Titulo')}
            descricao={t('mensal.benef2Desc')}
          />
          <BeneficioItem
            icone="stats-chart-outline"
            titulo={t('mensal.benef3Titulo')}
            descricao={t('mensal.benef3Desc')}
          />
          <BeneficioItem
            icone="heart-outline"
            titulo={t('mensal.benef4Titulo')}
            descricao={t('mensal.benef4Desc')}
          />
        </View>

        {/* Botão Assinar */}
        <TouchableOpacity style={styles.botaoAssinar} onPress={handleAssinar}>
          <Text style={styles.botaoAssinarTexto}>{t('mensal.assinar')}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.agoraNao}>{t('mensal.agoraNao')}</Text>
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
    paddingHorizontal: 16,
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
    gap: 6,
    marginBottom: 28,
  },
  planoCard: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: '#E2E2E2',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 6,
    minHeight: 130,
  },
  planoCardSelecionado: {
    borderColor: '#3DDC5C',
    boxShadow: '0 2px 6px rgba(61, 220, 92, 0.15)',
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