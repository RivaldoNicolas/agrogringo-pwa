/**
 * Convierte un objeto File o Blob a una cadena de texto en formato base64.
 * @param {File|Blob} file - El archivo o blob a convertir.
 * @returns {Promise<string>} Una promesa que se resuelve con la cadena base64.
 */
export const fileToBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
