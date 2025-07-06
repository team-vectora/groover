export async function uploadToCloudinary(file) {
  const MAX_SIZE_MB = 4;
  const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

  if (file.size > MAX_SIZE_BYTES) {
    throw new Error(`Imagem muito grande (máximo ${MAX_SIZE_MB}MB)`);
  }

  const formData = new FormData();
  formData.append("image", file);

  const res = await fetch("http://localhost:5000/api/upload-image", {
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
