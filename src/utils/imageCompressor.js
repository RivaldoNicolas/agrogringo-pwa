/**
 * Comprime un archivo de imagen.
 * @param {File} file - El archivo de imagen a comprimir.
 * @param {number} maxWidth - El ancho máximo de la imagen resultante.
 * @param {number} quality - La calidad de la compresión (0 a 1).
 * @returns {Promise<Blob>} Una promesa que se resuelve con el Blob de la imagen comprimida.
 */
export function compressImage(file, maxWidth = 800, quality = 0.7) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const scale = Math.min(maxWidth / img.width, 1);
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error("La compresión del canvas falló."));
        },
        "image/jpeg", // Forzamos a JPEG para mejor compresión
        quality
      );
    };
    img.onerror = (error) => reject(error);
  });
}
