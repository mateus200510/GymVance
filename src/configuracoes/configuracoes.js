import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';

import BottomNavBar from '../components/BottomNavBar';
import { getSelectedPlan, logout } from '../services/storage';
import { useIdioma } from '../services/idioma';

const VERDE = '#3DDC5C';

function LinhaOpcao({ icone, rotulo, valor, mostrarValor, aoPressionar }) {
  return (
    <TouchableOpacity style={styles.opcao} activeOpacity={0.7} onPress={aoPressionar}>
      {icone ? <Feather name={icone} size={16} color={VERDE} /> : <View style={{ width: 16, height: 16 }} />}
      <Text style={styles.opcaoRotulo}>{rotulo}</Text>
      {mostrarValor ? <Text style={styles.opcaoValor}>{valor}</Text> : null}
      <Feather name="chevron-right" size={16} color="#48484A" />
    </TouchableOpacity>
  );
}

export default function Configuracoes({ navigation }) {
  const { t } = useIdioma();
  const [plano, setPlano] = useState(null);

  useEffect(() => {
    (async () => {
      const salvo = await getSelectedPlan();
      setPlano(salvo);
    })();
  }, []);

  const nomePlano = () => {
    if (!plano) {
      return t('configuracoes.semPlano');
    }
    const chave = t(`mensal.${plano}`);
    if (chave && chave !== `mensal.${plano}`) {
      return chave;
    }
    return `mensal.${plano}`;
  };

  const sair = async () => {
    Alert.alert(t('configuracoes.sair'), t('configuracoes.sairMsg'), [
      { text: t('comum.cancelar'), style: 'cancel' },
      {
        text: t('configuracoes.confirmarSair'),
        style: 'destructive',
        onPress: async () => {
          await logout();
          navigation.reset({ index: 0, routes: [{ name: 'Cadastro' }] });
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerEsquerda}>
            <TouchableOpacity onPress={() => navigation?.goBack()} accessibilityLabel={t('perfil.voltar')}>
              <Feather name="arrow-left" size={20} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.logo}>GymVance</Text>
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
          <Text style={styles.titulo}>{t('configuracoes.titulo')}</Text>

          <Text style={styles.secaoTitulo}>{t('configuracoes.perfil')}</Text>
          <View style={styles.card}>
            <LinhaOpcao
              icone="user"
              rotulo={t('configuracoes.perfil')}
              aoPressionar={() => navigation?.navigate('Perfil')}
            />
          </View>

          <Text style={styles.secaoTitulo}>{t('configuracoes.conta')}</Text>
          <View style={styles.card}>
            <LinhaOpcao
              icone="credit-card"
              rotulo={t('configuracoes.plano')}
              valor={nomePlano()}
              mostrarValor
              aoPressionar={() => navigation?.navigate('Planos')}
            />
            <View style={styles.divisor} />
            <LinhaOpcao
              icone="user"
              rotulo={t('configuracoes.conta')}
              aoPressionar={() => navigation?.navigate('Conta')}
            />
          </View>

          <Text style={styles.secaoTitulo}>{t('configuracoes.idioma')}</Text>
          <View style={styles.card}>
            <LinhaOpcao
              icone="globe"
              rotulo={t('configuracoes.idioma')}
              aoPressionar={() => navigation?.navigate('Idioma')}
            />
          </View>

          <Text style={styles.secaoTitulo}>{t('configuracoes.unidade')}</Text>
          <View style={styles.card}>
            <LinhaOpcao
              icone="anchor"
              rotulo={t('configuracoes.unidade')}
              aoPressionar={() => navigation?.navigate('Unidade')}
            />
          </View>

          <Text style={styles.secaoTitulo}>{t('configuracoes.faq')}</Text>
          <View style={styles.card}>
            <LinhaOpcao
              icone="help-circle"
              rotulo={t('configuracoes.faq')}
              aoPressionar={() => navigation?.navigate('FAQ')}
            />
          </View>

          <Text style={styles.secaoTitulo}>{t('configuracoes.avaliar')}</Text>
          <View style={styles.card}>
            <LinhaOpcao
              icone="star"
              rotulo={t('configuracoes.avaliar')}
              aoPressionar={() => navigation?.navigate('AvaliarApp')}
            />
          </View>

          <Text style={styles.secaoTitulo}>{t('configuracoes.treinos')}</Text>
          <View style={styles.card}>
            <LinhaOpcao
              icone="activity"
              rotulo={t('configuracoes.treinos')}
              aoPressionar={() => navigation?.navigate('TreinoHub')}
            />
          </View>

          <Text style={styles.secaoTitulo}>{t('configuracoes.pro')}</Text>
          <View style={styles.card}>
            <LinhaOpcao
              icone="award"
              rotulo={t('configuracoes.pro')}
              aoPressionar={() => navigation?.navigate('Planos')}
            />
          </View>

          <TouchableOpacity style={styles.botaoSair} activeOpacity={0.7} onPress={sair}>
            <Feather name="log-out" size={16} color="#FF453A" />
            <Text style={styles.botaoSairTexto}>{t('configuracoes.sair')}</Text>
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
  headerEsquerda: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  logo: { color: VERDE, fontWeight: '700', fontSize: 15 },
  titulo: { color: '#fff', fontSize: 20, fontWeight: '700', marginBottom: 16 },
  secaoTitulo: { color: '#8E8E93', fontSize: 13, marginBottom: 8, marginTop: 4 },
  card: { backgroundColor: '#1C1C1E', borderRadius: 14, marginBottom: 20 },
  opcao: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, gap: 10 },
  opcaoRotulo: { color: '#fff', fontSize: 14, flex: 1 },
  opcaoValor: { color: '#8E8E93', fontSize: 13, marginLeft: 'auto', marginRight: 4 },
  divisor: { height: StyleSheet.hairlineWidth, backgroundColor: '#2C2C2E', marginLeft: 16 },
  botaoSair: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 24, paddingVertical: 12, borderWidth: 1, borderColor: '#FF453A' },
  botaoSairTexto: { color: '#FF453A', fontSize: 13, fontWeight: '700' },
});