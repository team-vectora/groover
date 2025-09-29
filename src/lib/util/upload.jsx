// src/lib/util/upload.jsx

import { apiFetch } from "../../lib/util/apiFetch";
import i18n from 'i18next';
import { toast } from 'react-toastify';

/**
 * Função genérica e unificada para fazer upload de imagens.
 * Aponta para a rota de posts, que agora lida com todos os uploads.
 * @param {File} file - O arquivo de imagem a ser enviado.
 */
export async function uploadToCloudinary(file) {
  const MAX_SIZE_MB = 2;
  const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

  if (file.size > MAX_SIZE_BYTES) {
    toast.error(i18n.t('upload.imageTooLarge', { size: MAX_SIZE_MB }));
    return null;
  }

  const formData = new FormData();
  formData.append("file", file);

  const res = await apiFetch(`/posts/upload-image`, {
    method: "POST",
    body: formData,
    credentials: "include", // Envia o cookie httpOnly de autenticação
  });

  if (!res.ok) {
    const error = await res.text();
    console.error("Err:", error);
    toast.error(i18n.t('upload.error'));
    return null;
  }

  const data = await res.json();
  return data.secure_url;
}