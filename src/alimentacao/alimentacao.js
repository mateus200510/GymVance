import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  Linking,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { getProgressPhotos, saveProgressPhoto } from '../services/storage';

import BottomNavBar from '../components/BottomNavBar';
import { useNomeUsuario } from '../services/useUserProfile';

const DIAS_SEMANA = [];

const REFEICOES = [];

const MACROS = [];

const KCAL_ATUAL = null;
const KCAL_META = null;

function BarraProgresso({ percentual, cor = '#3DDC5C' }) {
  return (
    <View style={styles.barraFundo}>
      <View style={[styles.barraPreenchida, { width: `${percentual ?? 0}%`, backgroundColor: cor }]} />
    </View>
  );
}

function TelaDashboard({ onAbrirGaleria, onAbrirCamera, fotoCapturada, nomeUsuario }) {
  const percentualKcal = KCAL_META ? Math.min(100, Math.round((KCAL_ATUAL / KCAL_META) * 100)) : null;
  const [pergunta, setPergunta] = useState('');

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
          <Text style={styles.logo}>Gymvance</Text>
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

      {/* Seletor de dias */}
      {DIAS_SEMANA.length > 0 && (
        <View style={styles.diasRow}>
          {DIAS_SEMANA.map((dia) => (
            <View key={dia.label} style={styles.diaItem}>
              <Text style={styles.diaLabel}>{dia.label}</Text>
              <View style={styles.diaCirculo}>
                <Text style={styles.diaNumero}>{dia.data}</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Consumo diário */}
      <View style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.cardTitulo}>Consumo Diário</Text>
          <Text style={styles.cardPercentual}>{percentualKcal === null ? '—' : `${percentualKcal}%`}</Text>
        </View>
        <Text style={styles.kcalTexto}>
          {KCAL_ATUAL ?? '—'} <Text style={styles.kcalMeta}>/ {KCAL_META ?? '—'} kcal</Text>
        </Text>
        <BarraProgresso percentual={percentualKcal} />

        {MACROS.length > 0 && (
          <View style={styles.macrosRow}>
            {MACROS.map((macro) => (
              <View key={macro.label} style={styles.macroItem}>
                <Text style={styles.macroLabel}>{macro.label}</Text>
                <Text style={styles.macroValor}>
                  {macro.atual}
                  {macro.unidade}
                  <Text style={styles.macroMeta}> /{macro.meta}{macro.unidade}</Text>
                </Text>
                <BarraProgresso percentual={(macro.atual / macro.meta) * 100} />
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Refeições de hoje */}
      <View style={styles.secaoHeaderRow}>
        <Text style={styles.secaoTitulo}>Refeições de hoje</Text>
        <TouchableOpacity style={styles.botaoAdicionar}>
          <Feather name="plus" size={14} color="#000" />
          <Text style={styles.botaoAdicionarTexto}>Adicionar</Text>
        </TouchableOpacity>
      </View>

      {REFEICOES.map((refeicao) => (
        <View key={refeicao.id} style={styles.refeicaoItem}>
          <View style={{ flex: 1 }}>
            <Text style={styles.refeicaoNome}>{refeicao.nome}</Text>
            <Text style={styles.refeicaoDescricao}>{refeicao.descricao}</Text>
          </View>
          <Text style={styles.refeicaoKcal}>{refeicao.kcal} kcal</Text>
        </View>
      ))}

      {/* Assistente */}
      <View style={styles.assistenteBox}>
        <View style={styles.assistenteHeader}>
          <View style={styles.assistenteIcone}>
            <Feather name="cpu" size={16} color="#000" />
          </View>
          <Text style={styles.assistenteTexto}>
            Oi! Sou o assistente do Gymvance. Como posso te ajudar com sua alimentação hoje?
          </Text>
        </View>
        <View style={styles.assistenteInputRow}>
          <TextInput
            style={styles.assistenteInput}
            placeholder="Digite sua pergunta..."
            placeholderTextColor="#6E6E73"
            value={pergunta}
            onChangeText={setPergunta}
          />
          <TouchableOpacity style={styles.assistenteEnviar}>
            <Feather name="arrow-right" size={16} color="#000" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={{ height: 90 }} />
    </ScrollView>
  );
}

function TelaGaleria({ onVoltar, fotos = [] }) {
  return (
    <View style={styles.container}>
      <View style={styles.galeriaHeader}>
        <TouchableOpacity onPress={onVoltar}>
          <Feather name="arrow-left" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.galeriaTitulo}>Minhas fotos</Text>
        <View style={styles.galeriaHeaderIcones}>
          <Feather name="search" size={20} color="#fff" style={{ marginRight: 16 }} />
          <Feather name="more-vertical" size={20} color="#fff" />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.galeriaScrollContent}>
        {fotos.length === 0 ? (
          <View style={styles.galeriaVazia}>
            <Feather name="image" size={28} color="#3A3A3C" />
            <Text style={styles.galeriaVaziaTexto}>Nenhuma foto salva ainda.</Text>
          </View>
        ) : (
          <View style={styles.galeriaGrid}>
            {fotos.map((foto) => (
              <View key={foto.id} style={styles.galeriaFotoWrapper}>
                <Image source={{ uri: foto.uri }} style={styles.galeriaFotoReal} resizeMode="cover" />
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      <View style={styles.navBar}>
        <View style={styles.navItem}>
          <Feather name="camera" size={20} color="#3DDC5C" />
          <Text style={[styles.navLabel, { color: '#3DDC5C' }]}>Fotos</Text>
        </View>
        <View style={styles.navItem}>
          <Feather name="folder" size={20} color="#8E8E93" />
          <Text style={styles.navLabel}>Álbuns</Text>
        </View>
        <View style={styles.navItem}>
          <Feather name="clock" size={20} color="#8E8E93" />
          <Text style={styles.navLabel}>Histórias</Text>
        </View>
        <View style={styles.navItem}>
          <Feather name="more-horizontal" size={20} color="#8E8E93" />
          <Text style={styles.navLabel}>Mais</Text>
        </View>
      </View>
    </View>
  );
}

export default function Alimentacao({ navigation }) {
  const nomeUsuario = useNomeUsuario();
  const [tela, setTela] = useState('dashboard');
  const [cameraPermission, requestPermission] = useCameraPermissions();
  const [fotoCapturada, setFotoCapturada] = useState(null);
  const [fotosGaleria, setFotosGaleria] = useState([]);
  const cameraRef = useRef(null);

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

  const abrirGaleria = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permissão necessária', 'Precisamos acessar suas fotos para salvar seu progresso.');
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
      Alert.alert('Erro', 'Não foi possível salvar a foto.');
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
          Alert.alert('Câmera indisponível', 'Abra as configurações do dispositivo para permitir o acesso à câmera.');
          Linking.openSettings();
          return;
        }
        Alert.alert('Permissão necessária', 'Precisamos da câmera para registrar sua refeição.');
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
      Alert.alert('Erro', 'Não foi possível capturar a imagem.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {tela === 'dashboard' ? (
        <TelaDashboard
          onAbrirGaleria={abrirGaleria}
          onAbrirCamera={abrirCamera}
          fotoCapturada={fotoCapturada}
          nomeUsuario={nomeUsuario}
        />
      ) : tela === 'galeria' ? (
        <TelaGaleria fotos={fotosGaleria} onVoltar={() => setTela('dashboard')} />
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
  diasRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
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
  kcalTexto: { color: '#fff', fontSize: 28, fontWeight: '700', marginBottom: 8 },
  kcalMeta: { color: '#8E8E93', fontSize: 14, fontWeight: '400' },
  barraFundo: { height: 6, backgroundColor: '#2C2C2E', borderRadius: 3, overflow: 'hidden' },
  barraPreenchida: { height: 6, borderRadius: 3 },
  macrosRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 },
  macroItem: { flex: 1, marginRight: 8 },
  macroLabel: { color: '#8E8E93', fontSize: 10, marginBottom: 4 },
  macroValor: { color: '#fff', fontSize: 13, fontWeight: '600', marginBottom: 6 },
  macroMeta: { color: '#8E8E93', fontWeight: '400' },
  secaoHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  secaoTitulo: { color: '#fff', fontSize: 15, fontWeight: '600' },
  botaoAdicionar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#3DDC5C', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5 },
  botaoAdicionarTexto: { color: '#000', fontSize: 12, fontWeight: '600', marginLeft: 4 },
  refeicaoItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#1C1C1E', borderRadius: 12, padding: 14, marginBottom: 10 },
  refeicaoNome: { color: '#fff', fontSize: 14, fontWeight: '600' },
  refeicaoDescricao: { color: '#8E8E93', fontSize: 12, marginTop: 2 },
  refeicaoKcal: { color: '#3DDC5C', fontSize: 13, fontWeight: '600' },
  assistenteBox: { backgroundColor: '#1C1C1E', borderRadius: 16, padding: 12, marginTop: 8 },
  assistenteHeader: { flexDirection: 'row', alignItems: 'flex-start' },
  assistenteIcone: { width: 26, height: 26, borderRadius: 13, backgroundColor: '#3DDC5C', justifyContent: 'center', alignItems: 'center', marginRight: 8 },
  assistenteTexto: { color: '#D1D1D6', fontSize: 12, flex: 1, lineHeight: 17 },
  assistenteInputRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  assistenteInput: { flex: 1, backgroundColor: '#2C2C2E', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, color: '#fff', fontSize: 13 },
  assistenteEnviar: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#3DDC5C', justifyContent: 'center', alignItems: 'center', marginLeft: 8 },
  galeriaHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 12, marginBottom: 16 },
  galeriaTitulo: { color: '#fff', fontSize: 17, fontWeight: '700' },
  galeriaHeaderIcones: { flexDirection: 'row' },
  galeriaData: { color: '#8E8E93', fontSize: 13, marginBottom: 8, paddingHorizontal: 16 },
  galeriaGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 14 },
  galeriaFotoVazia: { width: '23%', aspectRatio: 1, margin: '1%', backgroundColor: '#1C1C1E', borderRadius: 6, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#2C2C2E', borderStyle: 'dashed' },
  navBar: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', paddingVertical: 10, borderTopWidth: 1, borderTopColor: '#1C1C1E', backgroundColor: '#000' },
  navItem: { alignItems: 'center' },
  navLabel: { color: '#8E8E93', fontSize: 10, marginTop: 2 },
});