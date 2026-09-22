import { useState, useCallback } from 'react';

import { useFocusEffect } from '@react-navigation/native';
import { getUserProfile } from './storage';
import { useIdioma } from './idioma';

export function useNomeUsuario() {
  const { t } = useIdioma();
  const [nomeUsuario, setNomeUsuario] = useState(t('comum.usuario'));

  useFocusEffect(
    useCallback(() => {
      let ativo = true;

      getUserProfile().then((perfil) => {
        if (ativo && perfil?.nome) {
          setNomeUsuario(perfil.nome);
        }
      });

      return () => {
        ativo = false;
      };
    }, [])
  );

  return nomeUsuario;
}