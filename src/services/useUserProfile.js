import { useState, useCallback } from 'react';

import { useFocusEffect } from '@react-navigation/native';
import { getUserProfile } from './storage';

export function useNomeUsuario() {
  const [nomeUsuario, setNomeUsuario] = useState('Usuário');

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