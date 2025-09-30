import { db } from "@/services/database/dexieConfig";
import { v4 as uuidv4 } from "uuid"; // Necesitarás instalar uuid: npm install uuid
import { putClient } from "./clients";

/**
 * Crea una nueva recomendación.
 * Por ahora, implementa la lógica offline-first: siempre guarda en Dexie.
 * @param {object} recommendationData - Los datos del formulario.
 * @returns {Promise<number>} El ID local del nuevo registro en Dexie.
 */
export const createRecommendation = async (recommendationData) => {
  try {
    const newRecommendation = {
      ...recommendationData, // Datos del formulario
      id: uuidv4(), // Genera un ID único universal
      dniAgricultor: recommendationData.datosAgricultor?.dni || "",
      emailTecnico: recommendationData.datosTecnico?.email || "",
      fecha: new Date(), // Sello de tiempo de creación
      syncStatus: "pending_creation", // Marca para sincronización
      timestampUltimaModificacion: new Date(),
    };

    // Guardar en la base de datos local
    const localId = await db.recommendations.add(newRecommendation);

    // Guardar/Actualizar el cliente en su propia tabla para futuras búsquedas
    if (recommendationData.datosAgricultor?.dni) {
      await putClient(recommendationData.datosAgricultor);
    }

    console.log("Recomendación guardada localmente con ID:", localId);
    return localId;
  } catch (error) {
    console.error("Error al guardar la recomendación localmente:", error);
    throw error;
  }
};

/**
 * Obtiene todas las recomendaciones de la base de datos local.
 * @returns {Promise<Array<object>>} Un array con las recomendaciones.
 */
export const getAllRecommendations = async () => {
  // Restauramos el ordenamiento ahora que los índices están corregidos.
  // toArray() es un método de Dexie para obtener todos los registros
  return await db.recommendations
    .reverse()
    .sortBy("timestampUltimaModificacion");
};

/**
 * Limpia la tabla de recomendaciones.
 */
export const clearLocalDatabase = async () => {
  return await db.recommendations.clear();
};
