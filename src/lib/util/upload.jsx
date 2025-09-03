export async function uploadToCloudinary(file) {
  const MAX_SIZE_MB = 2;
  const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

  if (file.size > MAX_SIZE_BYTES) {
    throw new Error(`Imagem muito grande (máximo ${MAX_SIZE_MB}MB)`);
  }

  const formData = new FormData();
  formData.append("file", file);

  // AQUI ESTÁ A CORREÇÃO: Adicionado '/posts' na URL
  const res = await fetch("http://localhost:5000/api/posts/upload-image", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: formData,
  });

  if (!res.ok) {
    const error = await res.text();
    console.error("Err:", error);
    throw new Error("Upload error");
  }

  const data = await res.json();
  return data.secure_url;
}