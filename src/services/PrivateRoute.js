import { Navigate } from 'react-router-dom';
import { useAuth } from './authContext';

// Componente para proteger rotas que exigem autenticação
const PrivateRoute = ({ element }) => {
  const { user } = useAuth();  // Pega o usuário do contexto
  const isLoginOrRegisterPage = element.type.name === 'LoginPage' || element.type.name === 'RegisterPage';  // Verifica se é login ou cadastro

  // Se o usuário não estiver autenticado, redireciona para o login
  if (user && isLoginOrRegisterPage) {
    return <Navigate to="/feed" replace />;
  }

  if (!user && !isLoginOrRegisterPage) {
    return <Navigate to="/login" replace />
  }

  return element;
};

export default PrivateRoute;
