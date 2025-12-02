/**
 * Sube un archivo a Cloudinary usando un preajuste de subida sin firmar.
 * @param {File} file - El archivo a subir.
 * @returns {Promise<string>} Una promesa que se resuelve con la URL segura de la imagen subida.
 */
export const uploadToCloudinary = async (file) => {
  // ¡IMPORTANTE! Reemplaza estos valores con los de tu cuenta de Cloudinary.
  const CLOUD_NAME = "tu_cloud_name"; // Encuéntralo en tu dashboard de Cloudinary
  const UPLOAD_PRESET = "tu_upload_preset"; // Créalo en Settings > Upload > Upload Presets

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);

  const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

  try {
    const response = await fetch(url, {
      method: "POST",
      body: formData,
    });

    const data = await response.json();
    return data.secure_url; // Esta es la URL que guardarás en Firestore
  } catch (error) {
    console.error("Error al subir la imagen a Cloudinary:", error);
    throw new Error("La subida de la imagen falló.");
  }
};
