import {API_BASE_URL} from "../../config";
import i18n from 'i18next';

export async function uploadToCloudinary(file, type = 'post') {
  const MAX_SIZE_MB = 2;
  const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

  if (file.size > MAX_SIZE_BYTES) {
    throw new Error(i18n.t('upload.imageTooLarge', { size: MAX_SIZE_MB }));
  }

  const formData = new FormData();
  formData.append("file", file);

  let endpoint = '/posts/upload-image'; // Padrão para posts
  if (type === 'avatar') {
    endpoint = '/users/upload-avatar';
  } else if (type === 'project_cover') {
    endpoint = '/projects/upload-image';
  }

  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: "POST",
    body: formData,
    credentials: "include",
  });

  if (!res.ok) {
    const error = await res.json();
    console.error("Cloudinary Upload Error:", error);
    throw new Error(error.msg || i18n.t('upload.error'));
  }

  const data = await res.json();
  return data.secure_url;
}