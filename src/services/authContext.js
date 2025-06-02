import React, { createContext, useContext, useState, useEffect } from 'react';
import { checkSession } from './authService';

// Criação do contexto de autenticação
const AuthContext = createContext();

// Provedor de autenticação
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [perfil, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Verificação de sessão
  useEffect(() => {
    const verifySession = async () => {
      try {
        const session = await checkSession(); // Função que verifica a sessão no backend
        console.log(session);
        setUser(session.user); // Define o usuário no contexto
        setProfile(session.perfil); // Se a sessão existir, define o usuário
      } catch (err) {
        setUser(null);
        setProfile(null);
      } finally {
        setLoading(false);  // Finaliza o carregamento
      }
    };
    verifySession();
  }, []);

  // Se estiver carregando, não renderiza nada ainda
  if (loading) {
    return <div>Carregando...</div>;
  }

  return (
    <AuthContext.Provider value={{ user, setUser, perfil, setProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook para usar o contexto de autenticação em qualquer componente
export const useAuth = () => useContext(AuthContext);
