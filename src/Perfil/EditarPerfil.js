import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
  Modal,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';

import BottomNavBar from '../components/BottomNavBar';
import { getUserProfile, saveUserProfile, formatarDataNascimento, normalizarDataNascimento, calcularIdade } from '../services/storage';
import { useIdioma } from '../services/idioma';
import { useUsuario } from '../services/UserContext';
import { selecionarFotoDaGaleria, removerFotoPerfilLocal } from '../services/fotoPerfil';

const VERDE = '#3DDC5C';

const GENEROS = [
  { valor: 'Homem', chave: 'genero.homem' },
  { valor: 'Mulher', chave: 'genero.mulher' },
];

function formatarDataInput(texto) {
  const apenasNumeros = texto.replace(/\D/g, '').slice(0, 8);
  if (apenasNumeros.length <= 2) {
    return apenasNumeros;
  }
  if (apenasNumeros.length <= 4) {
    return `${apenasNumeros.slice(0, 2)}/${apenasNumeros.slice(2)}`;
  }
  return `${apenasNumeros.slice(0, 2)}/${apenasNumeros.slice(2, 4)}/${apenasNumeros.slice(4, 8)}`;
}

function validarDataNascimento(value) {
  const iso = normalizarDataNascimento(value);
  if (!iso) {
    return null;
  }

  const [ano, mes, dia] = iso.split('-').map(Number);
  const data = new Date(ano, mes - 1, dia);

  if (
    data.getFullYear() !== ano ||
    data.getMonth() !== mes - 1 ||
    data.getDate() !== dia
  ) {
    return null;
  }

  return iso;
}

export default function EditarPerfil({ navigation }) {
  const { t } = useIdioma();
  const { refreshUsuario } = useUsuario();
  const [nome, setNome] = useState('');
  const [bio, setBio] = useState('');
  const [genero, setGenero] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [cintura, setCintura] = useState('');
  const [braco, setBraco] = useState('');
  const [peito, setPeito] = useState('');
  const [foto, setFoto] = useState(null);
  const [idade, setIdade] = useState(null);
  const [carregando, setCarregando] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [fotoVisualizada, setFotoVisualizada] = useState(null);

  useEffect(() => {
    (async () => {
      const perfil = await getUserProfile();
      if (perfil?.nome) setNome(perfil.nome);
      if (perfil?.bio) setBio(perfil.bio);
      if (perfil?.genero) setGenero(perfil.genero);
      if (perfil?.dataNascimento) {
        const formatada = formatarDataNascimento(perfil.dataNascimento);
        setDataNascimento(formatada);
        setIdade(calcularIdade(perfil.dataNascimento));
      }
      if (perfil?.foto) setFoto(perfil.foto);
      if (perfil?.cintura !== undefined && perfil?.cintura !== null) setCintura(String(perfil.cintura));
      if (perfil?.braco !== undefined && perfil?.braco !== null) setBraco(String(perfil.braco));
      if (perfil?.peito !== undefined && perfil?.peito !== null) setPeito(String(perfil.peito));
    })();
  }, []);

  useEffect(() => {
    if (dataNascimento) {
      const iso = validarDataNascimento(dataNascimento);
      if (iso) {
        setIdade(calcularIdade(iso));
      }
    }
  }, [dataNascimento]);

  const escolherFoto = async () => {
    setCarregando(true);
    try {
      const resultado = await selecionarFotoDaGaleria();

      if (resultado.status === 'ok' && resultado.uri) {
        setFoto(resultado.uri);
        return;
      }

      if (resultado.status === 'bloqueada') {
        Alert.alert(
          t('perfil.galeriaBloqueada'),
          t('perfil.galeriaBloqueadaMsg'),
          [
            { text: t('comum.cancelar'), style: 'cancel' },
            { text: t('perfil.abrirConfiguracoes'), onPress: () => Linking.openSettings() },
          ]
        );
        return;
      }

      if (resultado.status === 'negada') {
        Alert.alert(t('perfil.permissaoNecessaria'), t('perfil.fotosPermissaoMsg'));
      }
    } catch (error) {
      console.warn('Erro ao adicionar foto:', error);
      Alert.alert(t('comum.erro'), t('perfil.erroAdicionarFoto'));
    } finally {
      setCarregando(false);
    }
  };

  const removerFoto = async () => {
    await removerFotoPerfilLocal(foto);
    setFoto(null);
  };

  const parseMedida = (valor) => {
    if (!valor) {
      return undefined;
    }
    const numero = parseFloat(String(valor).replace(',', '.'));
    return Number.isFinite(numero) && numero > 0 ? numero : undefined;
  };

  const salvar = async () => {
    if (!nome.trim()) {
      Alert.alert(t('comum.erro'), t('genero.erroNomeMsg'));
      return;
    }

    const dataIso = validarDataNascimento(dataNascimento);
    if (!dataIso && dataNascimento) {
      Alert.alert(t('comum.erro'), t('genero.erroDataMsg'));
      return;
    }

    setSalvando(true);
    try {
      const perfilAtualizado = await saveUserProfile({
        nome: nome.trim(),
        bio: bio.trim(),
        genero,
        dataNascimento: dataIso,
        foto,
        cintura: parseMedida(cintura),
        braco: parseMedida(braco),
        peito: parseMedida(peito),
      });
      await refreshUsuario();
      Alert.alert(t('editarPerfil.salvar'));
      navigation?.goBack();
    } catch (error) {
      console.warn('Erro ao salvar perfil:', error);
      Alert.alert(t('comum.erro'), t('perfil.erroSalvarPerfil'));
    } finally {
      setSalvando(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation?.goBack()} accessibilityLabel={t('perfil.voltar')}>
            <Feather name="arrow-left" size={20} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.tituloHeader}>{t('editarPerfil.titulo')}</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }} keyboardShouldPersistTaps="handled">
          <View style={styles.fotoSection}>
            <TouchableOpacity style={styles.fotoContainer} onPress={escolherFoto} activeOpacity={0.8} disabled={carregando}>
              {foto ? (
                <Image source={{ uri: foto }} style={styles.fotoImage} />
              ) : (
                <View style={styles.fotoVazio}>
                  <Feather name="camera" size={24} color="#8E8E93" />
                </View>
              )}
              {carregando && <ActivityIndicator size="small" color={VERDE} style={{ position: 'absolute' }} />}
            </TouchableOpacity>
            {foto && (
              <TouchableOpacity style={styles.botaoRemoverFoto} onPress={removerFoto}>
                <Feather name="trash-2" size={14} color="#FF453A" />
                <Text style={styles.botaoRemoverFotoTexto}>{t('editarPerfil.removerFoto')}</Text>
              </TouchableOpacity>
            )}
            <Text style={styles.fotoHint}>{t('editarPerfil.alterarFoto')}</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.fieldLabel}>{t('editarPerfil.nome')}</Text>
            <TextInput
              style={styles.campoInput}
              placeholder={t('editarPerfil.placeholderNome')}
              placeholderTextColor="#6E6E73"
              value={nome}
              onChangeText={setNome}
              autoCapitalize="words"
            />

            <Text style={styles.fieldLabel}>{t('editarPerfil.bio')}</Text>
            <TextInput
              style={[styles.campoInput, styles.campoInputMultiline]}
              placeholder={t('editarPerfil.placeholderBio')}
              placeholderTextColor="#6E6E73"
              value={bio}
              onChangeText={setBio}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />

            <Text style={styles.fieldLabel}>{t('editarPerfil.genero')}</Text>
            <View style={styles.generoRow}>
              {GENEROS.map((item) => {
                const ativo = genero === item.valor;
                return (
                  <TouchableOpacity
                    key={item.valor}
                    style={[styles.generoOption, ativo && styles.generoOptionAtivo]}
                    onPress={() => setGenero(item.valor)}
                  >
                    <View style={[styles.radio, ativo && styles.radioAtivo]}>
                      {ativo && <View style={styles.radioInner} />}
                    </View>
                    <Text style={styles.generoTexto}>{t(item.chave)}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={styles.fieldLabel}>{t('editarPerfil.idade')}</Text>
            <View style={styles.idadeRow}>
              <TextInput
                style={styles.campoInput}
                placeholder={t('genero.placeholderData')}
                placeholderTextColor="#6E6E73"
                value={dataNascimento}
                onChangeText={(text) => setDataNascimento(formatarDataInput(text))}
                keyboardType="number-pad"
                maxLength={10}
              />
              {idade !== null && (
                <Text style={styles.idadeCalculada}>
                  {idade} {t('comum.anos') || 'anos'}
                </Text>
              )}
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.fieldLabel}>{t('perfil.medidas')}</Text>
            <View style={styles.medidasRow}>
              <View style={styles.medidaCampo}>
                <Text style={styles.medidaCampoLabel}>{t('perfil.medida.cintura')}</Text>
                <TextInput
                  style={styles.medidaInput}
                  placeholder="cm"
                  placeholderTextColor="#6E6E73"
                  value={cintura}
                  onChangeText={setCintura}
                  keyboardType="decimal-pad"
                />
              </View>
              <View style={styles.medidaCampo}>
                <Text style={styles.medidaCampoLabel}>{t('perfil.medida.braco')}</Text>
                <TextInput
                  style={styles.medidaInput}
                  placeholder="cm"
                  placeholderTextColor="#6E6E73"
                  value={braco}
                  onChangeText={setBraco}
                  keyboardType="decimal-pad"
                />
              </View>
              <View style={styles.medidaCampo}>
                <Text style={styles.medidaCampoLabel}>{t('perfil.medida.peito')}</Text>
                <TextInput
                  style={styles.medidaInput}
                  placeholder="cm"
                  placeholderTextColor="#6E6E73"
                  value={peito}
                  onChangeText={setPeito}
                  keyboardType="decimal-pad"
                />
              </View>
            </View>
          </View>

          <TouchableOpacity style={[styles.botaoVerde, salvando && styles.botaoVerdeOcupado]} onPress={salvar} disabled={salvando}>
            {salvando ? (
              <ActivityIndicator size="small" color="#000" />
            ) : (
              <>
                <Feather name="check" size={14} color="#000" />
                <Text style={styles.botaoVerdeTexto}>{t('editarPerfil.salvar')}</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.botaoSecundario} onPress={() => navigation?.goBack()}>
            <Text style={styles.botaoSecundarioTexto}>{t('comum.cancelar')}</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      <BottomNavBar activeTab="treino" />

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
  tituloHeader: { color: '#fff', fontSize: 20, fontWeight: '700' },
  fotoSection: { alignItems: 'center', marginBottom: 24 },
  fotoContainer: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#1C1C1E', justifyContent: 'center', alignItems: 'center', overflow: 'hidden', borderWidth: 2, borderColor: '#2C2C2E' },
  fotoImage: { width: '100%', height: '100%', borderRadius: 50 },
  fotoVazio: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' },
  botaoRemoverFoto: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8, paddingHorizontal: 8, paddingVertical: 4, backgroundColor: '#1C1C1E', borderRadius: 12, borderWidth: 1, borderColor: '#FF453A' },
  botaoRemoverFotoTexto: { color: '#FF453A', fontSize: 11, fontWeight: '600' },
  fotoHint: { color: '#8E8E93', fontSize: 12, marginTop: 8 },
  card: { backgroundColor: '#1C1C1E', borderRadius: 14, padding: 16, marginBottom: 20 },
  fieldLabel: { color: '#8E8E93', fontSize: 12, marginBottom: 6 },
  campoInput: { backgroundColor: '#1C1C1E', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, color: '#fff', fontSize: 14, borderWidth: 1, borderColor: '#2C2C2E', marginBottom: 16 },
  campoInputMultiline: { minHeight: 80, paddingTop: 12 },
  generoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  generoOption: { flexDirection: 'row', alignItems: 'center', width: '48%', borderWidth: 1, borderColor: '#2D2D2D', borderRadius: 10, paddingVertical: 12, paddingHorizontal: 10, backgroundColor: '#181818' },
  generoOptionAtivo: { borderColor: VERDE, backgroundColor: '#1B2A1E' },
  radio: { width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: '#8F8F8F', marginRight: 10, alignItems: 'center', justifyContent: 'center' },
  radioAtivo: { borderColor: VERDE },
  radioInner: { width: 8, height: 8, borderRadius: 4, backgroundColor: VERDE },
  generoTexto: { color: '#fff', fontSize: 15 },
  idadeRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  idadeCalculada: { color: VERDE, fontSize: 14, fontWeight: '600' },
  medidasRow: { flexDirection: 'row', justifyContent: 'space-between' },
  medidaCampo: { width: '31%' },
  medidaCampoLabel: { color: '#8E8E93', fontSize: 12, marginBottom: 6 },
  medidaInput: { backgroundColor: '#1C1C1E', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, color: '#fff', fontSize: 14, borderWidth: 1, borderColor: '#2C2C2E', textAlign: 'center' },
  botaoVerde: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: VERDE, borderRadius: 24, paddingVertical: 12, marginBottom: 12 },
  botaoVerdeOcupado: { opacity: 0.6 },
  botaoVerdeTexto: { color: '#000', fontSize: 13, fontWeight: '700', marginLeft: 6 },
  botaoSecundario: { alignItems: 'center', paddingVertical: 10 },
  botaoSecundarioTexto: { color: '#8E8E93', fontSize: 13, fontWeight: '600' },
  modalFundo: { flex: 1, backgroundColor: 'rgba(0,0,0,0.95)', justifyContent: 'center', alignItems: 'center' },
  modalImagem: { width: '100%', height: '100%' },
  modalFechar: { position: 'absolute', top: 52, right: 20, zIndex: 10, backgroundColor: '#1C1C1E', borderRadius: 20, width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
});