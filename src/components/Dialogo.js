import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';

import { useIdioma } from '../services/idioma';

// Sistema visual único de diálogo do GymVance.
// Usa apenas a paleta e a tipografia já existentes no aplicativo:
// fundo #121212, card #1E1E1E, verde #3DDC5C, vermelho #E5484D,
// apoio #FFD84D (aviso) e #4DA3FF (informação, já presente no catálogo).
const CORES = {
  fundo: '#121212',
  card: '#1E1E1E',
  cardInterno: '#2A2A2A',
  borda: '#2C2C2E',
  texto: '#FFFFFF',
  textoSuave: '#8E8E93',
  verde: '#3DDC5C',
  vermelho: '#E5484D',
  aviso: '#FFD84D',
  info: '#4DA3FF',
  preto: '#000000',
};

const DURACAO_PADRAO_TOAST = 3200;

const TIPOS = {
  confirmacao: { cor: CORES.verde, icone: 'help-circle', corIcone: CORES.preto },
  sucesso: { cor: CORES.verde, icone: 'check-circle', corIcone: CORES.preto },
  erro: { cor: CORES.vermelho, icone: 'alert-circle', corIcone: '#FFFFFF' },
  aviso: { cor: CORES.aviso, icone: 'alert-triangle', corIcone: CORES.preto },
  informacao: { cor: CORES.info, icone: 'info', corIcone: '#FFFFFF' },
  destrutivo: { cor: CORES.vermelho, icone: 'trash-2', corIcone: '#FFFFFF' },
  sair: { cor: CORES.vermelho, icone: 'log-out', corIcone: '#FFFFFF' },
};

const ICONES_TOAST = {
  confirmacao: 'help-circle',
  sucesso: 'check-circle',
  erro: 'alert-circle',
  aviso: 'alert-triangle',
  informacao: 'info',
  destrutivo: 'trash-2',
  sair: 'log-out',
};

function comAlfa(hex, alfa) {
  const limpo = String(hex).replace('#', '');
  const r = parseInt(limpo.slice(0, 2), 16);
  const g = parseInt(limpo.slice(2, 4), 16);
  const b = parseInt(limpo.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alfa})`;
}

const DialogoContexto = createContext(null);

export function useDialogo() {
  const contexto = useContext(DialogoContexto);
  if (!contexto) {
    throw new Error('useDialogo precisa estar dentro de <DialogoProvider>.');
  }
  return contexto;
}

export function DialogoProvider({ children }) {
  const { t } = useIdioma();
  const insets = useSafeAreaInsets();

  const [dialogo, setDialogo] = useState(null);
  const [modalAberto, setModalAberto] = useState(false);
  const [toast, setToast] = useState(null);

  const progresso = useRef(new Animated.Value(0)).current;
  const progressoToast = useRef(new Animated.Value(0)).current;
  const timerToast = useRef(null);
  const timerFechar = useRef(null);

  const limparTimers = useCallback(() => {
    if (timerToast.current) {
      clearTimeout(timerToast.current);
      timerToast.current = null;
    }
    if (timerFechar.current) {
      clearTimeout(timerFechar.current);
      timerFechar.current = null;
    }
  }, []);

  useEffect(() => limparTimers, [limparTimers]);

  // Entrada e saída do diálogo (fade + leve escala), sem travar a interface.
  useEffect(() => {
    if (dialogo) {
      setModalAberto(true);
      progresso.setValue(0);
      Animated.timing(progresso, {
        toValue: 1,
        duration: 190,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
      return;
    }

    if (!modalAberto) {
      return;
    }

    Animated.timing(progresso, {
      toValue: 0,
      duration: 140,
      easing: Easing.in(Easing.cubic),
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) {
        setModalAberto(false);
      }
    });
  }, [dialogo, modalAberto, progresso]);

  const fecharDialogo = useCallback(() => {
    setDialogo(null);
  }, []);

  const confirmar = useCallback((opcoes = {}) => {
    setDialogo({
      tipo: 'confirmacao',
      rotuloConfirmar: t('comum.confirmar'),
      rotuloCancelar: t('comum.cancelar'),
      mostrarCancelar: true,
      destrutivo: false,
      cancelavel: true,
      fecharAoTocarFora: true,
      empilhar: false,
      ...opcoes,
    });
  }, [t]);

  // Diálogos de mensagem têm um único botão; `confirmar` é o único que oferece
  // a escolha entre dois botões.
  const mensagemPadrao = useCallback(
    (tipo) => (opcoes = {}) => {
      setDialogo({
        tipo,
        rotuloConfirmar: t('comum.entendi'),
        mostrarCancelar: false,
        cancelavel: true,
        fecharAoTocarFora: true,
        ...opcoes,
      });
    },
    [t]
  );

  const sucesso = useCallback(mensagemPadrao('sucesso'), [mensagemPadrao]);
  const erro = useCallback(mensagemPadrao('erro'), [mensagemPadrao]);
  const aviso = useCallback(mensagemPadrao('aviso'), [mensagemPadrao]);
  const informacao = useCallback(mensagemPadrao('informacao'), [mensagemPadrao]);

  const mostrarToast = useCallback((opcoes = {}) => {
    setToast({ tipo: 'informacao', duracao: DURACAO_PADRAO_TOAST, ...opcoes });
  }, []);

  const sucessoToast = useCallback((mensagem, duracao) => {
    mostrarToast({ tipo: 'sucesso', mensagem, duracao });
  }, [mostrarToast]);

  const erroToast = useCallback((mensagem, duracao) => {
    mostrarToast({ tipo: 'erro', mensagem, duracao });
  }, [mostrarToast]);

  const avisoToast = useCallback((mensagem, duracao) => {
    mostrarToast({ tipo: 'aviso', mensagem, duracao });
  }, [mostrarToast]);

  // Entrada/saída e auto-dispensar do feedback discreto (toast).
  useEffect(() => {
    if (!toast) {
      return undefined;
    }

    progressoToast.setValue(0);
    Animated.timing(progressoToast, {
      toValue: 1,
      duration: 200,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();

    timerToast.current = setTimeout(() => {
      Animated.timing(progressoToast, {
        toValue: 0,
        duration: 180,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) {
          setToast(null);
        }
      });
    }, toast.duracao || DURACAO_PADRAO_TOAST);

    return () => {
      if (timerToast.current) {
        clearTimeout(timerToast.current);
        timerToast.current = null;
      }
    };
  }, [toast, progressoToast]);

  const fecharToast = useCallback(() => {
    if (timerToast.current) {
      clearTimeout(timerToast.current);
      timerToast.current = null;
    }
    Animated.timing(progressoToast, {
      toValue: 0,
      duration: 160,
      easing: Easing.in(Easing.cubic),
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) {
        setToast(null);
      }
    });
  }, [progressoToast]);

  const executar = useCallback((acao) => {
    fecharDialogo();
    if (typeof acao === 'function') {
      acao();
    }
  }, [fecharDialogo]);

  const estiloDialogo = useMemo(() => ({
    confirmar: confirmar,
    sucesso: sucesso,
    erro: erro,
    aviso: aviso,
    informacao: informacao,
    toast: mostrarToast,
    sucessoToast: sucessoToast,
    erroToast: erroToast,
    avisoToast: avisoToast,
    fechar: fecharDialogo,
    fecharToast: fecharToast,
  }), [
    confirmar,
    sucesso,
    erro,
    aviso,
    informacao,
    mostrarToast,
    sucessoToast,
    erroToast,
    avisoToast,
    fecharDialogo,
    fecharToast,
  ]);

  const tema = dialogo ? TIPOS[dialogo.tipo] || TIPOS.informacao : TIPOS.informacao;
  const corBotaoPrimario = dialogo?.destrutivo ? CORES.vermelho : tema.cor;
  const corTextoPrimario = corBotaoPrimario === CORES.verde || corBotaoPrimario === CORES.aviso
    ? CORES.preto
    : '#FFFFFF';

  const acaoSecundaria = dialogo?.mostrarCancelar === false
    ? null
    : { rotulo: dialogo?.rotuloCancelar, onPress: dialogo?.onCancelar };

  const acaoPrincipal = dialogo
    ? {
      rotulo: dialogo.rotuloConfirmar || dialogo.rotuloEntendi || t('comum.entendi'),
      onPress: dialogo.onConfirmar || dialogo.acao?.onPress,
    }
    : null;

  const podeFecharFora = dialogo ? dialogo.fecharAoTocarFora !== false : false;

  return (
    <DialogoContexto.Provider value={estiloDialogo}>
      {children}

      {modalAberto && dialogo ? (
        <Modal
          transparent
          visible
          statusBarTranslucent
          navigationBarTranslucent
          animationType="fade"
          onRequestClose={() => {
            if (dialogo.cancelavel !== false) {
              executar(dialogo.onCancelar);
            }
          }}
        >
          <Animated.View
            style={[styles.fundo, { opacity: progresso }]}
            pointerEvents="box-none"
          >
            <Pressable
              style={StyleSheet.absoluteFill}
              onPress={() => {
                if (podeFecharFora) {
                  executar(dialogo.onCancelar);
                }
              }}
            />

            <View style={styles.area} pointerEvents="box-none">
              <Animated.View
                style={[
                  styles.card,
                  {
                    opacity: progresso,
                    transform: [
                      { scale: progresso.interpolate({ inputRange: [0, 1], outputRange: [0.94, 1] }) },
                    ],
                  },
                ]}
              >
                <View style={[styles.balaoIcone, { backgroundColor: comAlfa(tema.cor, 0.16) }]}>
                  <Feather name={dialogo.icone || tema.icone} size={26} color={tema.cor} />
                </View>

                {dialogo.titulo ? (
                  <Text style={styles.titulo}>{dialogo.titulo}</Text>
                ) : null}

                {dialogo.mensagem ? (
                  <Text style={styles.mensagem}>{dialogo.mensagem}</Text>
                ) : null}

                <View
                  style={[
                    styles.acoes,
                    dialogo.empilhar ? styles.acoesColuna : styles.acoesLinha,
                  ]}
                >
                  {dialogo.empilhar ? (
                    <>
                      {acaoPrincipal ? (
                        <Pressable
                          style={[styles.botao, { backgroundColor: corBotaoPrimario }]}
                          onPress={() => executar(acaoPrincipal.onPress)}
                          accessibilityRole="button"
                        >
                          <Text style={[styles.botaoTexto, { color: corTextoPrimario }]}>
                            {acaoPrincipal.rotulo}
                          </Text>
                        </Pressable>
                      ) : null}
                      {acaoSecundaria ? (
                        <Pressable
                          style={[styles.botao, styles.botaoSecundario]}
                          onPress={() => executar(acaoSecundaria.onPress)}
                          accessibilityRole="button"
                        >
                          <Text style={styles.botaoTextoSecundario}>{acaoSecundaria.rotulo}</Text>
                        </Pressable>
                      ) : null}
                    </>
                  ) : (
                    <>
                      {acaoSecundaria ? (
                        <Pressable
                          style={[styles.botao, styles.botaoSecundario, styles.botaoFlex]}
                          onPress={() => executar(acaoSecundaria.onPress)}
                          accessibilityRole="button"
                        >
                          <Text style={styles.botaoTextoSecundario}>
                            {acaoSecundaria.rotulo}
                          </Text>
                        </Pressable>
                      ) : null}

                      {acaoPrincipal ? (
                        <Pressable
                          style={[styles.botao, { backgroundColor: corBotaoPrimario }, styles.botaoFlex]}
                          onPress={() => executar(acaoPrincipal.onPress)}
                          accessibilityRole="button"
                        >
                          <Text style={[styles.botaoTextoPrimario, { color: corTextoPrimario }]}>
                            {acaoPrincipal.rotulo}
                          </Text>
                        </Pressable>
                      ) : null}
                    </>
                  )}
                </View>
              </Animated.View>
            </View>
          </Animated.View>
        </Modal>
      ) : null}

      {toast ? (
        <Animated.View
          pointerEvents="box-none"
          style={[
            styles.toastArea,
            {
              bottom: (insets?.bottom ?? 0) + 18,
              opacity: progressoToast,
              transform: [
                { translateY: progressoToast.interpolate({ inputRange: [0, 1], outputRange: [24, 0] }) },
              ],
            },
          ]}
        >
          <Pressable
            onPress={fecharToast}
            style={[styles.toast, { borderColor: comAlfa(TIPOS[toast.tipo]?.cor || CORES.info, 0.55) }]}
            accessibilityRole="alert"
          >
            <View
              style={[
                styles.toastIcone,
                { backgroundColor: comAlfa(TIPOS[toast.tipo]?.cor || CORES.info, 0.16) },
              ]}
            >
              <Feather
                name={toast.icone || ICONES_TOAST[toast.tipo] || 'info'}
                size={16}
                color={TIPOS[toast.tipo]?.cor || CORES.info}
              />
            </View>
            <View style={styles.toastTextos}>
              {toast.titulo ? <Text style={styles.toastTitulo}>{toast.titulo}</Text> : null}
              <Text style={styles.toastMensagem}>{toast.mensagem}</Text>
            </View>
          </Pressable>
        </Animated.View>
      ) : null}
    </DialogoContexto.Provider>
  );
}

const styles = StyleSheet.create({
  fundo: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.78)',
  },
  area: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: CORES.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: CORES.borda,
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 18,
  },
  balaoIcone: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  titulo: {
    color: CORES.texto,
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 6,
  },
  mensagem: {
    color: CORES.textoSuave,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  // Layout padrão: ações lado a lado (linha). Sem `flexDirection: 'row'`, os
  // botões com `flex: 1` herdariam o eixo vertical e colapsariam dentro de um
  // contêiner de altura automática.
  acoes: {
    marginTop: 20,
  },
  acoesLinha: {
    flexDirection: 'row',
    gap: 10,
  },
  acoesColuna: {
    gap: 10,
  },
  botao: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    paddingVertical: 13,
    paddingHorizontal: 14,
    minHeight: 48,
  },
  botaoFlex: {
    flex: 1,
  },
  botaoSecundario: {
    backgroundColor: CORES.cardInterno,
    borderWidth: 1,
    borderColor: CORES.borda,
  },
  botaoTexto: {
    color: CORES.texto,
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
  botaoTextoPrimario: {
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
  botaoTextoSecundario: {
    color: CORES.texto,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  toastArea: {
    position: 'absolute',
    left: 16,
    right: 16,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: CORES.card,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  toastIcone: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toastTextos: {
    flex: 1,
  },
  toastTitulo: {
    color: CORES.texto,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2,
  },
  toastMensagem: {
    color: CORES.textoSuave,
    fontSize: 13,
    lineHeight: 18,
  },
});
