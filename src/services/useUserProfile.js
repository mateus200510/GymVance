import { useState, useCallback } from 'react';

import { useFocusEffect } from '@react-navigation/native';
import { getUserProfile } from './storage';
import { useIdioma } from './idioma';
import { useUsuario } from './UserContext';

export function useFotoPerfil() {
  const [foto, setFoto] = useState(null);

  useFocusEffect(
    useCallback(() => {
      let ativo = true;

      getUserProfile().then((perfil) => {
        if (ativo) {
          setFoto(perfil?.foto ?? null);
        }
      });

      return () => {
        ativo = false;
      };
    }, [])
  );

  return foto;
}

export function useNomeUsuario() {
  const { t } = useIdioma();
  const { nomeUsuario } = useUsuario();
  const [nomeLocal, setNomeLocal] = useState(nomeUsuario);

  useFocusEffect(
    useCallback(() => {
      let ativo = true;

      getUserProfile().then((perfil) => {
        if (ativo && perfil?.nome) {
          setNomeLocal(perfil.nome);
        } else if (ativo) {
          setNomeLocal(null);
        }
      });

      return () => {
        ativo = false;
      };
    }, [])
  );

  return nomeLocal;
}