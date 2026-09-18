import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
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
import { getProgressPhotos, addProgressPhoto, setProgressPhotos, getUserProfile, saveUserProfile } from '../services/storage';

// Medidas ficam vazias (sem valores/variações de exemplo) até o usuário registrar.
const MEDIDAS = [
  { label: 'Peso', unidade: 'kg' },
  { label: 'Cintura', unidade: 'cm' },
  { label: 'Braço', unidade: 'cm' },
  { label: 'Peito', unidade: 'cm' },
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

function TelaEvolucao({ nomeUsuario, fotos, adicionando, onEditar, onAdicionarFoto, onVoltar, onVerFoto }) {
  const antes = fotos.length > 0 ? fotos[fotos.length - 1] : null;
  const depois = fotos.length > 0 ? fotos[0] : null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.perfilRow}>
          <View style={styles.avatarPequeno}>
            <Feather name="user" size={16} color="#8E8E93" />
          </View>
          <Text style={styles.headerNome}>{nomeUsuario}</Text>
        </View>
        <View style={styles.headerDireita}>
          <Text style={styles.logo}>Gymvance</Text>
          <TouchableOpacity onPress={onVoltar} style={{ marginLeft: 12 }} accessibilityLabel="Voltar">
            <Feather name="arrow-left" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.titulo}>Minha Evolução</Text>
        <Text style={styles.subtitulo}>Acompanhe suas fotos e evolução corporal</Text>

        <View style={styles.fotosRow}>
          <CardFoto label="ANTES" foto={antes} onVerFoto={onVerFoto} />
          <CardFoto label="DEPOIS" foto={depois} onVerFoto={onVerFoto} />
        </View>

        <TouchableOpacity
          style={[styles.botaoVerde, adicionando && styles.botaoVerdeOcupado]}
          onPress={onAdicionarFoto}
          disabled={adicionando}
        >
          {adicionando ? (
            <ActivityIndicator size="small" color="#000" />
          ) : (
            <Feather name="plus" size={14} color="#000" />
          )}
          <Text style={styles.botaoVerdeTexto}>Adicionar Foto</Text>
        </TouchableOpacity>

        <Text style={styles.secaoTitulo}>Medidas Recentes</Text>
        <View style={styles.medidasGrid}>
          {MEDIDAS.map((medida) => (
            <View key={medida.label} style={styles.medidaCard}>
              <Text style={styles.medidaLabel}>{medida.label}</Text>
              <Text style={styles.medidaValor}>-- {medida.unidade}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.botaoVerde} onPress={onEditar}>
          <Feather name="plus" size={14} color="#000" />
          <Text style={styles.botaoVerdeTexto}>Adicionar Medidas</Text>
        </TouchableOpacity>

        <Text style={styles.secaoTitulo}>Histórico</Text>
        <Text style={styles.historicoMes}>
          {fotos.length === 0
            ? '—'
            : `${fotos.length} foto${fotos.length === 1 ? '' : 's'} registrada${fotos.length === 1 ? '' : 's'}`}
        </Text>
        <View style={styles.historicoGrid}>
          {fotos.map((foto) => (
            <TouchableOpacity
              key={foto.uri}
              style={styles.historicoMini}
              activeOpacity={0.8}
              onPress={() => onVerFoto(foto.uri)}
            >
              <Image source={{ uri: foto.uri }} style={styles.historicoImagem} resizeMode="cover" />
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  );
}

function TelaEditarPerfil({ onSalvar }) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [modoAtivo, setModoAtivo] = useState(false);

  useEffect(() => {
    const carregarPerfil = async () => {
      const perfil = await getUserProfile();
      setNome(perfil?.nome || '');
      setEmail(perfil?.email || '');
    };

    carregarPerfil();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onSalvar}>
          <Feather name="arrow-left" size={20} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.logo}>Gymvance</Text>
      </View>

      <ScrollView contentContainerStyle={{ alignItems: 'center', paddingTop: 20 }}>
        <View style={styles.avatarGrande}>
          <Feather name="user" size={36} color="#8E8E93" />
        </View>
        <Text style={styles.alterarFotoLabel}>Alterar Foto</Text>

        <View style={styles.modoBox}>
          <Text style={styles.modoTexto}>Evolução diária</Text>
          <TouchableOpacity
            style={[styles.modoBadge, modoAtivo && styles.modoBadgeAtivo]}
            onPress={() => setModoAtivo(!modoAtivo)}
          >
            <Text style={styles.modoBadgeTexto}>
              {modoAtivo ? 'Ativado' : 'Ativar Modo'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.campoBox}>
          <Text style={styles.campoLabel}>Nome</Text>
          <TextInput
            style={styles.campoInput}
            placeholder="Digite seu nome"
            placeholderTextColor="#6E6E73"
            value={nome}
            onChangeText={setNome}
          />
        </View>

        <View style={styles.campoBox}>
          <Text style={styles.campoLabel}>Email</Text>
          <TextInput
            style={styles.campoInput}
            placeholder="Digite seu email"
            placeholderTextColor="#6E6E73"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        <TouchableOpacity
          style={[styles.botaoVerde, { alignSelf: 'stretch', justifyContent: 'center' }]}
          onPress={async () => {
            try {
              const atualizado = await saveUserProfile({ nome, email });
              onSalvar(atualizado);
            } catch (error) {
              console.warn('Erro ao salvar perfil:', error);
              Alert.alert('Erro', 'Não foi possível salvar suas alterações.');
            }
          }}
        >
          <Text style={styles.botaoVerdeTexto}>Salvar Evolução</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

export default function Perfil({ navigation }) {
  const [tela, setTela] = useState('evolucao'); // 'evolucao' | 'editar'
  const [fotos, setFotos] = useState([]);
  const [nomeUsuario, setNomeUsuario] = useState('Usuário');
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
    };
    carregarPerfil();
  }, []);

  const escolherFoto = async () => {
    try {
      const permissao = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissao.granted) {
        if (permissao.canAskAgain === false) {
          Alert.alert(
            'Galeria bloqueada',
            'Permita o acesso às fotos nas configurações para registrar seu progresso.',
            [
              { text: 'Cancelar', style: 'cancel' },
              { text: 'Abrir configurações', onPress: () => Linking.openSettings() },
            ]
          );
        } else {
          Alert.alert('Permissão necessária', 'Precisamos acessar suas fotos para registrar seu progresso.');
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
      await addProgressPhoto({ uri: uriLocal });
      await carregarFotos();
    } catch (error) {
      console.warn('Erro ao adicionar foto:', error);
      Alert.alert('Erro', 'Não foi possível adicionar a foto.');
    } finally {
      setAdicionando(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {tela === 'evolucao' ? (
        <TelaEvolucao
          nomeUsuario={nomeUsuario}
          fotos={fotos}
          adicionando={adicionando}
          onEditar={() => setTela('editar')}
          onAdicionarFoto={escolherFoto}
          onVoltar={() => navigation?.goBack()}
          onVerFoto={setFotoVisualizada}
        />
      ) : (
        <TelaEditarPerfil
          onSalvar={(perfil) => {
            if (perfil?.nome) {
              setNomeUsuario(perfil.nome);
            }
            setTela('evolucao');
          }}
        />
      )}

      <BottomNavBar activeTab="treino" />

      <Modal
        visible={fotoVisualizada !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setFotoVisualizada(null)}
      >
        <View style={styles.modalFundo}>
          <TouchableOpacity style={styles.modalFechar} onPress={() => setFotoVisualizada(null)} accessibilityLabel="Fechar foto">
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
  avatarGrande: { width: 84, height: 84, borderRadius: 42, backgroundColor: '#1C1C1E', justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  alterarFotoLabel: { color: '#fff', fontSize: 15, fontWeight: '600', marginBottom: 16 },
  modoBox: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  modoTexto: { color: '#D1D1D6', fontSize: 13, marginRight: 10 },
  modoBadge: { borderWidth: 1, borderColor: '#3DDC5C', borderRadius: 14, paddingHorizontal: 12, paddingVertical: 4 },
  modoBadgeAtivo: { backgroundColor: '#3DDC5C' },
  modoBadgeTexto: { color: '#3DDC5C', fontSize: 11, fontWeight: '600' },
  campoBox: { alignSelf: 'stretch', marginBottom: 14 },
  campoLabel: { color: '#8E8E93', fontSize: 12, marginBottom: 6 },
  campoInput: { backgroundColor: '#1C1C1E', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, color: '#fff', fontSize: 14, borderWidth: 1, borderColor: '#2C2C2E' },
  modalFundo: { flex: 1, backgroundColor: 'rgba(0,0,0,0.95)', justifyContent: 'center', alignItems: 'center' },
  modalImagem: { width: '100%', height: '100%' },
  modalFechar: { position: 'absolute', top: 52, right: 20, zIndex: 10, backgroundColor: '#1C1C1E', borderRadius: 20, width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
});