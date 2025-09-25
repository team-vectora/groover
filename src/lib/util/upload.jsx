import {API_BASE_URL} from "../../config";
import i18n from 'i18next';

export async function uploadToCloudinary(file) {
  const MAX_SIZE_MB = 2;
  const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

  if (file.size > MAX_SIZE_BYTES) {
    throw new Error(i18n.t('upload.imageTooLarge', { size: MAX_SIZE_MB }));
  }

  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_BASE_URL}/posts/upload-image`, {
    method: "POST",
    body: formData,
    credentials: "include",
  });

  if (!res.ok) {
    const error = await res.text();
    console.error("Err:", error);
    throw new Error(i18n.t('upload.error'));
  }

  const data = await res.json();
  return data.secure_url;
}
