import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { getUserProfile } from './storage';

const UserContext = createContext({
  nomeUsuario: null,
  refreshUsuario: () => {},
});

export function UserProvider({ children }) {
  const [nomeUsuario, setNomeUsuario] = useState(null);

  const refreshUsuario = useCallback(async () => {
    const perfil = await getUserProfile();
    if (perfil?.nome) {
      setNomeUsuario(perfil.nome);
    } else {
      setNomeUsuario(null);
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