import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { TIPOS_SERIE, TIPO_PADRAO } from '../services/series';
import { useIdioma } from '../services/idioma';

const COLORS = {
  card: '#1E1E1E',
  inputBg: '#2A2A2A',
  text: '#FFFFFF',
  muted: '#8A8A8A',
  green: '#3DDC5C',
  red: '#E5484D',
  borda: '#333333',
};

// Menu de tipo de série compartilhado entre "Sessão Ativa" e "Criar Sessão".
// Antes existia uma cópia quase idêntica em cada tela.
export default function MenuSerie({ visible, titulo, tipoAtual, onClose, onSelecionarTipo, onRemover }) {
  const { t } = useIdioma();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.fundo}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.menu}>
          <Text style={styles.titulo}>{titulo}</Text>
          <Text style={styles.subtitulo}>{t('sessaoAtiva.menuSubtitulo')}</Text>

          {TIPOS_SERIE.map((item) => {
            const ativo = item.tipo === tipoAtual;
            return (
              <TouchableOpacity
                key={item.tipo}
                style={[styles.item, ativo && styles.itemAtivo]}
                onPress={() => onSelecionarTipo(item.tipo)}
                accessibilityRole="button"
              >
                <View style={[styles.sigla, item.tipo === TIPO_PADRAO && styles.siglaNormal]}>
                  <Text style={styles.siglaTexto}>{item.sigla}</Text>
                </View>
                <Text style={[styles.itemRotulo, ativo && styles.itemRotuloAtivo]}>
                  {t(`tipo.${item.tipo}`)}
                </Text>
                {ativo ? <Ionicons name="checkmark" size={16} color={COLORS.green} /> : null}
              </TouchableOpacity>
            );
          })}

          <View style={styles.divisor} />

          <TouchableOpacity style={styles.remover} onPress={onRemover} accessibilityRole="button">
            <Ionicons name="trash-outline" size={16} color={COLORS.red} />
            <Text style={styles.removerTexto}>{t('sessaoAtiva.removerSerie')}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.cancelar} onPress={onClose} accessibilityRole="button">
            <Text style={styles.cancelarTexto}>{t('sessaoAtiva.cancelar')}</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fundo: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'flex-end' },
  menu: { backgroundColor: '#1A1A1A', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 16, paddingBottom: 28 },
  titulo: { color: COLORS.text, fontSize: 18, fontWeight: '700' },
  subtitulo: { color: COLORS.muted, fontSize: 12, marginTop: 2, marginBottom: 12 },
  item: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, paddingHorizontal: 8, borderRadius: 10 },
  itemAtivo: { backgroundColor: COLORS.inputBg },
  itemRotulo: { color: COLORS.text, fontSize: 14, flex: 1 },
  itemRotuloAtivo: { fontWeight: '700' },
  sigla: { width: 24, height: 24, borderRadius: 6, backgroundColor: COLORS.inputBg, alignItems: 'center', justifyContent: 'center' },
  siglaNormal: { backgroundColor: COLORS.card },
  siglaTexto: { color: COLORS.text, fontWeight: '700', fontSize: 12 },
  divisor: { height: StyleSheet.hairlineWidth, backgroundColor: COLORS.borda, marginVertical: 8 },
  remover: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 12, paddingHorizontal: 8 },
  removerTexto: { color: COLORS.red, fontSize: 14, fontWeight: '700' },
  cancelar: { marginTop: 6, backgroundColor: COLORS.card, borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  cancelarTexto: { color: COLORS.text, fontWeight: '700' },
});
