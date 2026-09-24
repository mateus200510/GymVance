import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { getUserProfile } from './storage';

const UserContext = createContext({
  nomeUsuario: 'Usuário',
  refreshUsuario: () => {},
});

export function UserProvider({ children }) {
  const [nomeUsuario, setNomeUsuario] = useState('Usuário');

  const refreshUsuario = useCallback(async () => {
    const perfil = await getUserProfile();
    if (perfil?.nome) {
      setNomeUsuario(perfil.nome);
    }
  }, []);

  useEffect(() => {
    refreshUsuario();
  }, [refreshUsuario]);

  return (
    <UserContext.Provider value={{ nomeUsuario, refreshUsuario }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUsuario() {
  return useContext(UserContext);
}