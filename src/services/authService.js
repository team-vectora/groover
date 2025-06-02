import axios from "axios";
import { jwtDecode } from "jwt-decode";

const api = axios.create({
    baseURL: 'http://127.0.0.1:5000',
    withCredentials: true, // Garante o envio de cookies e credenciais
    headers: {
        'Content-Type': 'application/json',
    },
});
export const checkSession = async () => {
    try {
    const token = localStorage.getItem('token');  // Recupera o token armazenado no localStorage
    if (!token) {
      throw new Error('Token não encontrado');
    }

    const decodedToken = jwtDecode(token);

    return decodedToken;   // Retorna os dados do usuário
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }

};

export default api;