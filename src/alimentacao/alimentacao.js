import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Linking,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { getProgressPhotos, saveProgressPhoto, deleteProgressPhoto } from '../services/storage';

import BottomNavBar from '../components/BottomNavBar';
import DemoTag from '../components/DemoTag';
import { useNomeUsuario } from '../services/useUserProfile';
import { useIdioma } from '../services/idioma';
import { getKcalMeta, getKcalQueimadas } from '../services/metricas';
import {
  MODO_DEMONSTRACAO,
  DEMO_META_KCAL,
  getDemoRefeicoes,
  getDemoTotais,
} from '../services/demo';

function BarraProgresso({ percentual, cor = '#3DDC5C' }) {
  return (
    <View style={styles.barraFundo}>
      <View style={[styles.barraPreenchida, { width: `${percentual ?? 0}%`, backgroundColor: cor }]} />
    </View>
  );
}

function TelaDashboard({ onAbrirGaleria, onAbrirCamera, onAbrirIA, fotoCapturada, nomeUsuario, kcalAtual, kcalMeta, refeicoes = [], macros = null, modoDemo = false }) {
  const { t } = useIdioma();
  const percentualKcal = kcalAtual !== null && kcalMeta
    ? Math.min(100, Math.round((kcalAtual / kcalMeta) * 100))
    : null;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.perfilIcone}>
          <Feather name="user" size={20} color="#8E8E93" />
        </View>
        <Text style={styles.headerNome}>{nomeUsuario}</Text>
        <View style={styles.headerDireita}>
          <Text style={styles.logo}>GymVance</Text>
          <TouchableOpacity onPress={onAbrirCamera} style={{ marginLeft: 12 }}>
            <Feather name="camera" size={20} color="#8E8E93" />
          </TouchableOpacity>
          <TouchableOpacity onPress={onAbrirGaleria} style={{ marginLeft: 12 }}>
            <Feather name="image" size={20} color="#8E8E93" />
          </TouchableOpacity>
        </View>
      </View>

      {fotoCapturada ? (
        <View style={styles.fotoCapturadaWrapper}>
          <Image source={{ uri: fotoCapturada }} style={styles.fotoCapturada} />
        </View>
      ) : null}

      {modoDemo && (
        <View style={styles.demoArea}>
          <DemoTag />
          <Text style={styles.avisoDemo}>{t('demo.aviso')}</Text>
        </View>
      )}

      {/* Consumo diário */}
      <View style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.cardTitulo}>{t('alimentacao.consumoDiario')}</Text>
          <Text style={styles.cardPercentual}>{percentualKcal === null ? '—' : `${percentualKcal}%`}</Text>
        </View>
        <Text style={styles.kcalTexto}>
          {kcalAtual ?? '—'} <Text style={styles.kcalMeta}>/ {kcalMeta ?? '—'} kcal</Text>
        </Text>
        <BarraProgresso percentual={percentualKcal} />
      </View>

      <TouchableOpacity style={styles.btnIA} onPress={onAbrirIA} activeOpacity={0.8}>
        <Feather name="message-circle" size={17} color="#3DDC5C" />
        <Text style={styles.btnIAText}>{t('alimentacao.conversarComIA')}</Text>
      </TouchableOpacity>

      {modoDemo && macros && (
        <View style={styles.card}>
          <Text style={styles.cardTitulo}>{t('alimentacao.macros')}</Text>
          <View style={styles.macrosRow}>
            <View style={styles.macroItem}>
              <Text style={styles.macroLabel}>{t('alimentacao.proteinas')}</Text>
              <Text style={styles.macroValor}>{macros.proteinas}g</Text>
            </View>
            <View style={styles.macroItem}>
              <Text style={styles.macroLabel}>{t('alimentacao.carboidratos')}</Text>
              <Text style={styles.macroValor}>{macros.carboidratos}g</Text>
            </View>
            <View style={[styles.macroItem, { marginRight: 0 }]}>
              <Text style={styles.macroLabel}>{t('alimentacao.gorduras')}</Text>
              <Text style={styles.macroValor}>{macros.gorduras}g</Text>
            </View>
          </View>
        </View>
      )}

      {/* Refeições de hoje (apenas quando houver registros; não há cadastro de
          refeições neste build) */}
      {refeicoes.length > 0 && (
        <>
          <View style={styles.secaoHeaderRow}>
            <Text style={styles.secaoTitulo}>{t('alimentacao.refeicoesHoje')}</Text>
          </View>

          {refeicoes.map((refeicao) => (
            <View key={refeicao.id} style={styles.refeicaoItem}>
              <View style={{ flex: 1 }}>
                <Text style={styles.refeicaoNome}>{refeicao.nome}</Text>
                <Text style={styles.refeicaoDescricao}>{refeicao.descricao}</Text>
              </View>
              <Text style={styles.refeicaoKcal}>{refeicao.kcal} kcal</Text>
            </View>
          ))}
        </>
      )}

      <View style={{ height: 90 }} />
    </ScrollView>
  );
}

function TelaGaleria({ onVoltar, fotos = [], onExcluirFoto }) {
  const { t } = useIdioma();
  return (
    <View style={styles.container}>
      <View style={styles.galeriaHeader}>
        <TouchableOpacity onPress={onVoltar}>
          <Feather name="arrow-left" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.galeriaTitulo}>{t('alimentacao.minhasFotos')}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.galeriaScrollContent}>
        {fotos.length === 0 ? (
          <View style={styles.galeriaVazia}>
            <Feather name="image" size={28} color="#3A3A3C" />
            <Text style={styles.galeriaVaziaTexto}>{t('alimentacao.semFotos')}</Text>
          </View>
        ) : (
          <View style={styles.galeriaGrid}>
            {fotos.map((foto) => (
              <View key={foto.id} style={styles.galeriaFotoWrapper}>
                <Image source={{ uri: foto.uri }} style={styles.galeriaFotoReal} resizeMode="cover" />
                <TouchableOpacity
                  style={styles.galeriaFotoExcluir}
                  onPress={() => onExcluirFoto(foto)}
                  accessibilityLabel={t('exercicios.excluir')}
                >
                  <Feather name="x" size={12} color="#fff" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

export default function Alimentacao({ navigation }) {
  const { t, idioma } = useIdioma();
  const nomeUsuario = useNomeUsuario();
  const [tela, setTela] = useState('dashboard');
  const [cameraPermission, requestPermission] = useCameraPermissions();
  const [fotoCapturada, setFotoCapturada] = useState(null);
  const [fotosGaleria, setFotosGaleria] = useState([]);
  const [kcalAtual, setKcalAtual] = useState(null);
  const [kcalMeta, setKcalMeta] = useState(null);
  const cameraRef = useRef(null);

  const refeicoesDemo = MODO_DEMONSTRACAO
    ? getDemoRefeicoes(idioma).map((r) => ({ ...r, nome: t(r.nomeKey) }))
    : [];

  const macrosDemo = MODO_DEMONSTRACAO ? getDemoTotais(idioma) : null;

  const carregarGaleria = async () => {
    const fotos = await getProgressPhotos();
    setFotosGaleria(fotos);
    if (fotos.length > 0) {
      setFotoCapturada(fotos[0].uri);
    }
  };

  useEffect(() => {
    carregarGaleria();
  }, []);

  useEffect(() => {
    let ativo = true;

    (async () => {
      if (MODO_DEMONSTRACAO) {
        const totais = getDemoTotais(idioma);
        if (ativo) {
          setKcalAtual(totais.kcal);
          setKcalMeta(DEMO_META_KCAL);
        }
        return;
      }

      const [atual, meta] = await Promise.all([
        getKcalQueimadas(),
        getKcalMeta(),
      ]);
      if (ativo) {
        setKcalAtual(atual);
        setKcalMeta(meta);
      }
    })();

    return () => {
      ativo = false;
    };
  }, [idioma]);

  const excluirFoto = async (foto) => {
    try {
      const restantes = await deleteProgressPhoto(foto.id);
      setFotosGaleria(restantes);
      setFotoCapturada(restantes[0]?.uri ?? null);
    } catch (error) {
      console.warn('Erro ao excluir foto:', error);
      Alert.alert(t('comum.erro'), t('alimentacao.erroSalvarFoto'));
    }
  };

  const abrirGaleria = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(t('alimentacao.permissaoTitulo'), t('alimentacao.permissaoMsg'));
      if (!permission.canAskAgain) {
        Linking.openSettings();
      }
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.85,
    });

    if (result.canceled || !result.assets?.[0]?.uri) {
      return;
    }

    let salvas;

    try {
      salvas = await saveProgressPhoto(result.assets[0].uri, { origem: 'galeria' });
    } catch (error) {
      console.warn('Erro ao salvar foto:', error);
      Alert.alert(t('comum.erro'), t('alimentacao.erroSalvarFoto'));
      return;
    }

    setFotosGaleria(salvas);
    setFotoCapturada(salvas[0]?.uri ?? result.assets[0].uri);
    setTela('galeria');
  };

  const abrirCamera = async () => {
    if (!cameraPermission?.granted) {
      const permissao = await requestPermission();

      if (!permissao.granted) {
        if (permissao.canAskAgain === false) {
          Alert.alert(t('alimentacao.cameraIndisponivel'), t('alimentacao.cameraMsg'));
          Linking.openSettings();
          return;
        }
        Alert.alert(t('alimentacao.permissaoTitulo'), t('alimentacao.cameraPermMsg'));
        return;
      }
    }

    setTela('camera');
  };

  const tirarFoto = async () => {
    if (!cameraRef.current) {
      return;
    }

    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.8, exif: false });
      if (photo?.uri) {
        const salvas = await saveProgressPhoto(photo.uri, { origem: 'camera' });
        setFotosGaleria(salvas);
        setFotoCapturada(salvas[0]?.uri ?? photo.uri);
      }
      setTela('dashboard');
    } catch (error) {
      Alert.alert(t('comum.erro'), t('alimentacao.erroCapturar'));
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {tela === 'dashboard' ? (
        <TelaDashboard
          onAbrirGaleria={abrirGaleria}
          onAbrirCamera={abrirCamera}
          onAbrirIA={() => navigation?.navigate('ChatIA')}
          fotoCapturada={fotoCapturada}
          nomeUsuario={nomeUsuario}
          kcalAtual={kcalAtual}
          kcalMeta={kcalMeta}
          refeicoes={refeicoesDemo}
          macros={macrosDemo}
          modoDemo={MODO_DEMONSTRACAO}
        />
      ) : tela === 'galeria' ? (
        <TelaGaleria fotos={fotosGaleria} onVoltar={() => setTela('dashboard')} onExcluirFoto={excluirFoto} />
      ) : (
        <View style={styles.cameraContainer}>
          <CameraView ref={cameraRef} style={styles.cameraView} facing="back" />
          <View style={styles.cameraActions}>
            <TouchableOpacity style={styles.cameraButton} onPress={tirarFoto}>
              <Feather name="camera" size={20} color="#000" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.cameraClose} onPress={() => setTela('dashboard')}>
              <Feather name="x" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {tela === 'dashboard' && <BottomNavBar activeTab="alimentacao" />}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#000' },
  container: { flex: 1, backgroundColor: '#000', paddingHorizontal: 16 },
  fotoCapturadaWrapper: { marginBottom: 16 },
  fotoCapturada: { width: '100%', height: 160, borderRadius: 16 },
  cameraContainer: { flex: 1, backgroundColor: '#000' },
  cameraView: { flex: 1 },
  cameraActions: { position: 'absolute', bottom: 24, left: 0, right: 0, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 18 },
  cameraButton: { width: 70, height: 70, borderRadius: 35, backgroundColor: '#3DDC5C', alignItems: 'center', justifyContent: 'center' },
  cameraClose: { width: 46, height: 46, borderRadius: 23, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', paddingTop: 12, marginBottom: 16 },
  perfilIcone: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#1C1C1E', justifyContent: 'center', alignItems: 'center', marginRight: 8 },
  headerNome: { color: '#fff', fontSize: 14, flex: 1 },
  headerDireita: { flexDirection: 'row', alignItems: 'center' },
  logo: { color: '#3DDC5C', fontWeight: '700', fontSize: 15 },
  diaItem: { alignItems: 'center' },
  diaLabel: { color: '#8E8E93', fontSize: 11, marginBottom: 6 },
  diaCirculo: { width: 30, height: 30, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  diaCirculoAtivo: { backgroundColor: '#3DDC5C' },
  diaNumero: { color: '#8E8E93', fontSize: 13 },
  diaNumeroAtivo: { color: '#000', fontWeight: '700' },
  card: { backgroundColor: '#1C1C1E', borderRadius: 16, padding: 16, marginBottom: 20 },
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  cardTitulo: { color: '#fff', fontSize: 14, fontWeight: '600' },
  cardPercentual: { color: '#3DDC5C', fontSize: 13, fontWeight: '600' },
  demoArea: { marginBottom: 16, alignItems: 'flex-start' },
  avisoDemo: { color: '#8E8E93', fontSize: 11, marginTop: 6, lineHeight: 15 },
  btnIA: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(61, 220, 92, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(61, 220, 92, 0.6)',
    borderRadius: 12,
    paddingVertical: 13,
    marginBottom: 20,
  },
  btnIAText: { color: '#3DDC5C', fontWeight: '700', fontSize: 14 },
  macrosRow: { flexDirection: 'row', marginTop: 12 },
  kcalTexto: { color: '#fff', fontSize: 28, fontWeight: '700', marginBottom: 8 },
  kcalMeta: { color: '#8E8E93', fontSize: 14, fontWeight: '400' },
  barraFundo: { height: 6, backgroundColor: '#2C2C2E', borderRadius: 3, overflow: 'hidden' },
  barraPreenchida: { height: 6, borderRadius: 3 },
  macroItem: { flex: 1, marginRight: 8 },
  macroLabel: { color: '#8E8E93', fontSize: 10, marginBottom: 4 },
  macroValor: { color: '#fff', fontSize: 13, fontWeight: '600', marginBottom: 6 },
  macroMeta: { color: '#8E8E93', fontWeight: '400' },
  secaoHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  secaoTitulo: { color: '#fff', fontSize: 15, fontWeight: '600' },
  refeicaoItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#1C1C1E', borderRadius: 12, padding: 14, marginBottom: 10 },
  refeicaoNome: { color: '#fff', fontSize: 14, fontWeight: '600' },
  refeicaoDescricao: { color: '#8E8E93', fontSize: 12, marginTop: 2 },
  refeicaoKcal: { color: '#3DDC5C', fontSize: 13, fontWeight: '600' },
  galeriaHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 12, marginBottom: 16 },
  galeriaTitulo: { color: '#fff', fontSize: 17, fontWeight: '700' },
  galeriaHeaderIcones: { flexDirection: 'row' },
  galeriaData: { color: '#8E8E93', fontSize: 13, marginBottom: 8, paddingHorizontal: 16 },
  galeriaGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', paddingHorizontal: 14 },
  galeriaFotoWrapper: { position: 'relative', width: '48%', aspectRatio: 0.9, marginBottom: 10, borderRadius: 10, overflow: 'hidden', backgroundColor: '#1C1C1E' },
  galeriaFotoReal: { width: '100%', height: '100%' },
  galeriaFotoExcluir: { position: 'absolute', top: 6, right: 6, width: 22, height: 22, borderRadius: 11, backgroundColor: 'rgba(0,0,0,0.65)', alignItems: 'center', justifyContent: 'center' },
  galeriaFotoVazia: { width: '23%', aspectRatio: 1, margin: '1%', backgroundColor: '#1C1C1E', borderRadius: 6, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#2C2C2E', borderStyle: 'dashed' },
});