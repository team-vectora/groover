import { toast } from "react-toastify";
import { API_BASE_URL } from "../../config"; // 1. Importa a URL base

// Função centralizada para deslogar o usuário
const handleLogout = () => {
    toast.error("Sua sessão expirou. Por favor, faça login novamente.");
    const savedTheme = localStorage.getItem("theme");
    const savedLang = localStorage.getItem("lang");
    localStorage.clear();
    sessionStorage.clear();
    if (savedTheme) localStorage.setItem("theme", savedTheme);
    if (savedLang) localStorage.setItem("lang", savedLang);
    window.location.href = '/login';
};

/**
 * Wrapper para a função fetch que lida centralmente com a URL base e erros de autenticação (401).
 * @param {string} endpoint - O endpoint da API a ser chamado (ex: '/users/profile').
 * @param {object} options - As opções da requisição fetch.
 * @returns {Promise<Response>} - A resposta da requisição.
 */
export const apiFetch = async (endpoint, options = {}) => {
    // 2. Constrói a URL completa e garante que as credenciais sejam incluídas
    const url = `${API_BASE_URL}${endpoint}`;
    const fetchOptions = {
        ...options,
        credentials: 'include',
    };

    const response = await fetch(url, fetchOptions);

    if (response.status === 422) {
        handleLogout();
        throw new Error("Unauthorized");
    }

    return response;
    

};