import { useState, useCallback } from 'react';

import { useFocusEffect } from '@react-navigation/native';
import { getUserProfile } from './storage';
import { useIdioma } from './idioma';
import { useUsuario } from './UserContext';

export function useNomeUsuario() {
  const { t } = useIdioma();
  const { nomeUsuario } = useUsuario();
  const [nomeLocal, setNomeLocal] = useState(nomeUsuario || t('comum.usuario'));

  useFocusEffect(
    useCallback(() => {
      let ativo = true;

      getUserProfile().then((perfil) => {
        if (ativo && perfil?.nome) {
          setNomeLocal(perfil.nome);
        }
      });

      return () => {
        ativo = false;
      };
    }, [])
  );

  return nomeLocal;
}