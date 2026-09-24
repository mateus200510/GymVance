import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';

const DIRETORIO_FOTOS = FileSystem.documentDirectory ? `${FileSystem.documentDirectory}perfil/` : null;

// Copia a imagem escolhida para o diretório local do app (evita depender do cache).
// Se a uri já estiver no diretório (revisão da mesma foto), retorna-a sem copiar.
export async function salvarFotoPerfilLocal(uri) {
  if (!DIRETORIO_FOTOS) {
    return uri;
  }

  if (uri.startsWith(DIRETORIO_FOTOS)) {
    return uri;
  }

  await FileSystem.makeDirectoryAsync(DIRETORIO_FOTOS, { intermediates: true });

  let ext = 'jpg';
  const pedaco = uri.split('.').pop() || '';
  const semQuery = pedaco.split('?')[0].toLowerCase();
  if (semQuery && semQuery.length <= 5) {
    ext = semQuery;
  }

  const destino = `${DIRETORIO_FOTOS}perfil_${Date.now()}.${ext}`;
  await FileSystem.copyAsync({ from: uri, to: destino });
  return destino;
}

// Remove o arquivo local da foto de perfil (idempotente).
export async function removerFotoPerfilLocal(uri) {
  if (!uri || !uri.startsWith('file://')) {
    return;
  }

  try {
    const info = await FileSystem.getInfoAsync(uri);
    if (info.exists) {
      await FileSystem.deleteAsync(uri, { idempotent: true });
    }
  } catch (error) {
    console.warn('Erro ao excluir foto de perfil:', error);
  }
}

// Abre a galeria e retorna a foto salva localmente.
// Retorna { status, uri } com status: 'ok' | 'cancelada' | 'negada' | 'bloqueada' | 'erro'.
export async function selecionarFotoDaGaleria() {
  try {
    const permissao = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissao.granted) {
      return { status: permissao.canAskAgain === false ? 'bloqueada' : 'negada' };
    }

    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (resultado.canceled || !resultado.assets?.length) {
      return { status: 'cancelada' };
    }

    const uriLocal = await salvarFotoPerfilLocal(resultado.assets[0].uri);
    return { status: 'ok', uri: uriLocal };
  } catch (error) {
    console.warn('Erro ao selecionar foto:', error);
    return { status: 'erro' };
  }
}