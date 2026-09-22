import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  Modal,
  Alert,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';

import BottomNavBar from '../components/BottomNavBar';
import { getProgressPhotos, saveProgressPhoto, setProgressPhotos, getUserProfile } from '../services/storage';
import { useIdioma } from '../services/idioma';

// Medidas ficam vazias (sem valores/variações de exemplo) até o usuário registrar.
// `tipo` é o identificador interno estável; o nome exibido vem do idioma selecionado.
const MEDIDAS = [
  { tipo: 'peso', unidade: 'kg' },
  { tipo: 'cintura', unidade: 'cm' },
  { tipo: 'braco', unidade: 'cm' },
  { tipo: 'peito', unidade: 'cm' },
];

const DIRETORIO_FOTOS = FileSystem.documentDirectory ? `${FileSystem.documentDirectory}progresso/` : null;

async function salvarFotoLocal(uri) {
  if (!DIRETORIO_FOTOS) {
    return uri;
  }

  await FileSystem.makeDirectoryAsync(DIRETORIO_FOTOS, { intermediates: true });

  let ext = 'jpg';
  const pedaco = uri.split('.').pop() || '';
  const semQuery = pedaco.split('?')[0].toLowerCase();
  if (semQuery && semQuery.length <= 5) {
    ext = semQuery;
  }

  const destino = `${DIRETORIO_FOTOS}progresso_${Date.now()}.${ext}`;
  await FileSystem.copyAsync({ from: uri, to: destino });
  return destino;
}

function formatarData(iso) {
  if (!iso) {
    return '';
  }
  const data = new Date(iso);
  if (Number.isNaN(data.getTime())) {
    return '';
  }
  return `${String(data.getDate()).padStart(2, '0')}/${String(data.getMonth() + 1).padStart(2, '0')}/${data.getFullYear()}`;
}

function CardFoto({ label, foto, onVerFoto }) {
  return (
    <View style={styles.fotoCard}>
      {foto ? (
        <TouchableOpacity activeOpacity={0.8} onPress={() => onVerFoto(foto.uri)}>
          <Image source={{ uri: foto.uri }} style={styles.fotoPreenchida} resizeMode="cover" />
        </TouchableOpacity>
      ) : (
        <View style={styles.fotoVazia}>
          <Feather name="image" size={24} color="#3A3A3C" />
        </View>
      )}
      <Text style={styles.fotoLabel}>{label}</Text>
      {foto ? <Text style={styles.fotoData}>{formatarData(foto.data)}</Text> : null}
    </View>
  );
}

export default function Evolucao({ navigation }) {
  const { t } = useIdioma();
  const [fotos, setFotos] = useState([]);
  const [nomeUsuario, setNomeUsuario] = useState('');
  const [pesoPerfil, setPesoPerfil] = useState(null);
  const [fotoVisualizada, setFotoVisualizada] = useState(null);
  const [adicionando, setAdicionando] = useState(false);

  const carregarFotos = useCallback(async () => {
    const salvas = await getProgressPhotos();

    const resultados = await Promise.all(
      salvas.map(async (foto) => {
        try {
          if (foto.uri && foto.uri.startsWith('file://')) {
            const info = await FileSystem.getInfoAsync(foto.uri);
            if (info.exists) {
              return foto;
            }
          } else if (foto.uri) {
            return foto;
          }
        } catch (error) {
          return foto;
        }
        return null;
      })
    );

    const validas = resultados.filter(Boolean);

    setFotos(validas);
    if (validas.length !== salvas.length) {
      await setProgressPhotos(validas);
    }
  }, []);

  useEffect(() => {
    carregarFotos();
  }, [carregarFotos]);

  useEffect(() => {
    const carregarPerfil = async () => {
      const perfil = await getUserProfile();
      if (perfil?.nome) {
        setNomeUsuario(perfil.nome);
      }
      if (perfil?.peso) {
        setPesoPerfil(perfil.peso);
      }
    };
    carregarPerfil();
  }, []);

  useEffect(() => {
    if (!nomeUsuario) {
      setNomeUsuario(t('comum.usuario'));
    }
  }, [t, nomeUsuario]);

  const escolherFoto = async () => {
    try {
      const permissao = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissao.granted) {
        if (permissao.canAskAgain === false) {
          Alert.alert(
            t('perfil.galeriaBloqueada'),
            t('perfil.galeriaBloqueadaMsg'),
            [
              { text: t('comum.cancelar'), style: 'cancel' },
              { text: t('perfil.abrirConfiguracoes'), onPress: () => Linking.openSettings() },
            ]
          );
        } else {
          Alert.alert(t('perfil.permissaoNecessaria'), t('perfil.fotosPermissaoMsg'));
        }
        return;
      }

      const resultado = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.7,
      });

      if (resultado.canceled || !resultado.assets?.length) {
        return;
      }

      setAdicionando(true);
      const uriLocal = await salvarFotoLocal(resultado.assets[0].uri);
      await saveProgressPhoto(uriLocal);
      await carregarFotos();
    } catch (error) {
      console.warn('Erro ao adicionar foto:', error);
      Alert.alert(t('comum.erro'), t('perfil.erroAdicionarFoto'));
    } finally {
      setAdicionando(false);
    }
  };

  const antes = fotos.length > 0 ? fotos[fotos.length - 1] : null;
  const depois = fotos.length > 0 ? fotos[0] : null;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.perfilRow}>
            <View style={styles.avatarPequeno}>
              <Feather name="user" size={16} color="#8E8E93" />
            </View>
            <Text style={styles.headerNome}>{nomeUsuario}</Text>
          </View>
          <View style={styles.headerDireita}>
            <Text style={styles.logo}>GymVance</Text>
            <TouchableOpacity onPress={() => navigation?.goBack()} style={{ marginLeft: 12 }} accessibilityLabel={t('perfil.voltar')}>
              <Feather name="arrow-left" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={styles.titulo}>{t('perfil.minhaEvolucao')}</Text>
          <Text style={styles.subtitulo}>{t('perfil.subtitulo')}</Text>

          <View style={styles.fotosRow}>
            <CardFoto label={t('perfil.antes')} foto={antes} onVerFoto={setFotoVisualizada} />
            <CardFoto label={t('perfil.depois')} foto={depois} onVerFoto={setFotoVisualizada} />
          </View>

          <TouchableOpacity
            style={[styles.botaoVerde, adicionando && styles.botaoVerdeOcupado]}
            onPress={escolherFoto}
            disabled={adicionando}
          >
            {adicionando ? (
              <ActivityIndicator size="small" color="#000" />
            ) : (
              <Feather name="plus" size={14} color="#000" />
            )}
            <Text style={styles.botaoVerdeTexto}>{t('perfil.adicionarFoto')}</Text>
          </TouchableOpacity>

          <Text style={styles.secaoTitulo}>{t('perfil.medidasRecentes')}</Text>
          <View style={styles.medidasGrid}>
            {MEDIDAS.map((medida) => (
              <View key={medida.tipo} style={styles.medidaCard}>
                <Text style={styles.medidaLabel}>{t(`perfil.medida.${medida.tipo}`)}</Text>
                <Text style={styles.medidaValor}>
                  {medida.tipo === 'peso' && pesoPerfil ? pesoPerfil : '--'} {medida.unidade}
                </Text>
              </View>
            ))}
          </View>

          <Text style={styles.secaoTitulo}>{t('perfil.historico')}</Text>
          <Text style={styles.historicoMes}>
            {fotos.length === 0
              ? '—'
              : `${fotos.length} ${t(fotos.length === 1 ? 'perfil.foto' : 'perfil.fotos')} ${t(fotos.length === 1 ? 'perfil.registrada' : 'perfil.registradas')}`}
          </Text>
          <View style={styles.historicoGrid}>
            {fotos.map((foto) => (
              <TouchableOpacity
                key={foto.uri}
                style={styles.historicoMini}
                activeOpacity={0.8}
                onPress={() => setFotoVisualizada(foto.uri)}
              >
                <Image source={{ uri: foto.uri }} style={styles.historicoImagem} resizeMode="cover" />
              </TouchableOpacity>
            ))}
          </View>

          <View style={{ height: 120 }} />
        </ScrollView>
      </View>

      <BottomNavBar />

      <Modal
        visible={fotoVisualizada !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setFotoVisualizada(null)}
      >
        <View style={styles.modalFundo}>
          <TouchableOpacity style={styles.modalFechar} onPress={() => setFotoVisualizada(null)} accessibilityLabel={t('perfil.fecharFoto')}>
            <Feather name="x" size={26} color="#fff" />
          </TouchableOpacity>
          {fotoVisualizada ? (
            <Image source={{ uri: fotoVisualizada }} style={styles.modalImagem} resizeMode="contain" />
          ) : null}
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#000' },
  container: { flex: 1, backgroundColor: '#000', paddingHorizontal: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, marginBottom: 16 },
  perfilRow: { flexDirection: 'row', alignItems: 'center' },
  headerDireita: { flexDirection: 'row', alignItems: 'center' },
  avatarPequeno: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#1C1C1E', justifyContent: 'center', alignItems: 'center', marginRight: 8 },
  headerNome: { color: '#fff', fontSize: 13 },
  logo: { color: '#3DDC5C', fontWeight: '700', fontSize: 15 },
  titulo: { color: '#fff', fontSize: 20, fontWeight: '700', marginBottom: 4 },
  subtitulo: { color: '#8E8E93', fontSize: 13, marginBottom: 16 },
  fotosRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  fotoCard: { width: '48%' },
  fotoVazia: { width: '100%', aspectRatio: 0.85, backgroundColor: '#1C1C1E', borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#2C2C2E', borderStyle: 'dashed', marginBottom: 6 },
  fotoPreenchida: { width: '100%', aspectRatio: 0.85, backgroundColor: '#1C1C1E', borderRadius: 12, marginBottom: 6 },
  fotoLabel: { color: '#8E8E93', fontSize: 11, textAlign: 'center' },
  fotoData: { color: '#3DDC5C', fontSize: 10, textAlign: 'center', marginTop: 2 },
  botaoVerde: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#3DDC5C', borderRadius: 24, paddingVertical: 12, marginBottom: 20 },
  botaoVerdeOcupado: { opacity: 0.6 },
  botaoVerdeTexto: { color: '#000', fontSize: 13, fontWeight: '700', marginLeft: 6 },
  secaoTitulo: { color: '#fff', fontSize: 15, fontWeight: '600', marginBottom: 12 },
  medidasGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  medidaCard: { width: '48%', backgroundColor: '#1C1C1E', borderRadius: 12, padding: 14, marginBottom: 10 },
  medidaLabel: { color: '#8E8E93', fontSize: 12, marginBottom: 4 },
  medidaValor: { color: '#fff', fontSize: 16, fontWeight: '700' },
  historicoMes: { color: '#8E8E93', fontSize: 12, marginBottom: 8 },
  historicoGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  historicoMini: { width: '23%', aspectRatio: 1, margin: '1%', borderRadius: 8, overflow: 'hidden', backgroundColor: '#1C1C1E' },
  historicoImagem: { width: '100%', height: '100%' },
  modalFundo: { flex: 1, backgroundColor: 'rgba(0,0,0,0.95)', justifyContent: 'center', alignItems: 'center' },
  modalImagem: { width: '100%', height: '100%' },
  modalFechar: { position: 'absolute', top: 52, right: 20, zIndex: 10, backgroundColor: '#1C1C1E', borderRadius: 20, width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
});