import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';

import { useIdioma, removerAcentos } from '../services/idioma';

// Chat de demonstração OFFLINE do GymVance.
// Não existe backend, API ou modelo de IA: as respostas são pré-programadas e
// reconhecidas por palavras-chave. A interface deixa isso claro para o usuário.
const COR = {
  bg: '#0D0D0D',
  card: '#1E1E1E',
  cardAlt: '#1A1A1A',
  green: '#3DDC5C',
  text: '#FFFFFF',
  muted: '#8E8E93',
  input: '#1C1C1E',
};

function responder(texto, t) {
  const n = removerAcentos(String(texto || '').toLowerCase());

  if (/(cafe da manha|manha|breakfast|morning)/.test(n)) {
    return t('ia.resposta.cafe');
  }
  if (/(proteina|protein)/.test(n)) {
    return t('ia.resposta.proteina');
  }
  if (/(pre ?treino|antes do treino|pre ?workout|before)/.test(n)) {
    return t('ia.resposta.preTreino');
  }
  if (/(organizar|planej|refeic|rotina|organize|plan|schedule)/.test(n)) {
    return t('ia.resposta.organizar');
  }
  return t('ia.resposta.generico');
}

export default function ChatIA({ navigation }) {
  const { t } = useIdioma();
  const [mensagens, setMensagens] = useState(() => [
    { id: 'boas-vindas', autor: 'assistente', texto: t('ia.boasVindas') },
  ]);
  const [mensagem, setMensagem] = useState('');
  const [digitando, setDigitando] = useState(false);
  const scrollRef = useRef(null);
  const proximoId = useRef(1);
  const timeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    });
  }, [mensagens, digitando]);

  const enviarTexto = (texto) => {
    const limpo = String(texto || '').trim();
    if (!limpo || digitando) {
      return;
    }

    setMensagens((prev) => [
      ...prev,
      { id: `usuario-${proximoId.current++}`, autor: 'usuario', texto: limpo },
    ]);
    setMensagem('');
    setDigitando(true);

    timeoutRef.current = setTimeout(() => {
      setMensagens((prev) => [
        ...prev,
        { id: `assistente-${proximoId.current++}`, autor: 'assistente', texto: responder(limpo, t) },
      ]);
      setDigitando(false);
    }, 650);
  };

  const dicas = [
    t('ia.dicaCafe'),
    t('ia.dicaProteina'),
    t('ia.dicaPreTreino'),
    t('ia.dicaOrganizar'),
  ];

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation?.goBack()} accessibilityLabel={t('perfil.voltar')}>
            <Feather name="arrow-left" size={22} color={COR.text} />
          </TouchableOpacity>
          <View style={styles.headerCentro}>
            <Text style={styles.headerTitulo}>{t('ia.assistente')}</Text>
            <View style={styles.badgeOffline}>
              <View style={styles.badgeDot} />
              <Text style={styles.badgeOfflineTexto}>{t('ia.demonstracaoOffline')}</Text>
            </View>
          </View>
          <View style={{ width: 22 }} />
        </View>

        <Text style={styles.aviso}>{t('ia.aviso')}</Text>

        <ScrollView
          ref={scrollRef}
          style={{ flex: 1 }}
          contentContainerStyle={styles.mensagensContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {mensagens.map((msg) => (
            <View
              key={msg.id}
              style={[styles.bolha, msg.autor === 'usuario' ? styles.bolhaUsuario : styles.bolhaAssistente]}
            >
              {msg.autor === 'assistente' && <Text style={styles.bolhaAutor}>GymVance</Text>}
              <Text style={msg.autor === 'usuario' ? styles.bolhaTextoUsuario : styles.bolhaTextoAssistente}>
                {msg.texto}
              </Text>
            </View>
          ))}

          {digitando && (
            <View style={[styles.bolha, styles.bolhaAssistente]}>
              <Text style={styles.bolhaAutor}>GymVance</Text>
              <Text style={styles.bolhaTextoAssistente}>{t('ia.pensando')}</Text>
            </View>
          )}

          <View style={styles.dicasArea}>
            {dicas.map((dica) => (
              <TouchableOpacity
                key={dica}
                style={styles.dicaChip}
                onPress={() => enviarTexto(dica)}
                disabled={digitando}
                activeOpacity={0.7}
              >
                <Text style={styles.dicaTexto}>{dica}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        <View style={styles.inputArea}>
          <TextInput
            style={styles.input}
            value={mensagem}
            onChangeText={setMensagem}
            placeholder={t('ia.placeholder')}
            placeholderTextColor={COR.muted}
            multiline
            onSubmitEditing={() => enviarTexto(mensagem)}
            returnKeyType="send"
          />
          <TouchableOpacity
            style={[styles.btnEnviar, digitando && styles.btnEnviarDesabilitado]}
            onPress={() => enviarTexto(mensagem)}
            disabled={digitando}
            activeOpacity={0.8}
          >
            <Feather name="send" size={16} color="#000" />
            <Text style={styles.btnEnviarTexto}>{t('ia.enviar')}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COR.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 8,
  },
  headerCentro: { alignItems: 'center' },
  headerTitulo: { color: COR.text, fontSize: 16, fontWeight: '700' },
  badgeOffline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 3,
    backgroundColor: 'rgba(255, 176, 32, 0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255, 176, 32, 0.5)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: '#FFB020' },
  badgeOfflineTexto: { color: '#FFB020', fontSize: 10, fontWeight: '700' },
  aviso: {
    color: COR.muted,
    fontSize: 11,
    lineHeight: 15,
    paddingHorizontal: 16,
    marginBottom: 6,
  },
  mensagensContent: { paddingHorizontal: 16, paddingVertical: 8, flexGrow: 1 },
  bolha: {
    maxWidth: '86%',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
  },
  bolhaAssistente: {
    alignSelf: 'flex-start',
    backgroundColor: COR.card,
    borderBottomLeftRadius: 4,
  },
  bolhaUsuario: {
    alignSelf: 'flex-end',
    backgroundColor: COR.green,
    borderBottomRightRadius: 4,
  },
  bolhaAutor: { color: COR.green, fontSize: 10, fontWeight: '700', marginBottom: 2 },
  bolhaTextoAssistente: { color: COR.text, fontSize: 14, lineHeight: 20 },
  bolhaTextoUsuario: { color: '#000', fontSize: 14, lineHeight: 20, fontWeight: '500' },
  dicasArea: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8, paddingBottom: 8 },
  dicaChip: {
    backgroundColor: COR.cardAlt,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  dicaTexto: { color: COR.green, fontSize: 12, fontWeight: '600' },
  inputArea: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 12,
    borderTopWidth: 1,
    borderTopColor: '#1F1F1F',
  },
  input: {
    flex: 1,
    backgroundColor: COR.input,
    color: COR.text,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    maxHeight: 110,
  },
  btnEnviar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COR.green,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  btnEnviarDesabilitado: { opacity: 0.4 },
  btnEnviarTexto: { color: '#000', fontWeight: '700', fontSize: 13 },
});