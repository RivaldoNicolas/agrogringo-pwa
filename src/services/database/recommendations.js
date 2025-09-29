import { db } from "@/services/database/dexieConfig";
import { v4 as uuidv4 } from "uuid"; // Necesitarás instalar uuid: npm install uuid

/**
 * Crea una nueva recomendación.
 * Por ahora, implementa la lógica offline-first: siempre guarda en Dexie.
 * @param {object} recommendationData - Los datos del formulario.
 * @returns {Promise<number>} El ID local del nuevo registro en Dexie.
 */
export const createRecommendation = async (recommendationData) => {
  try {
    const newRecommendation = {
      ...recommendationData,
      id: uuidv4(), // Genera un ID único universal
      syncStatus: "pending_creation", // Marca para sincronización
      timestampUltimaModificacion: new Date(),
    };

    // Guardar en la base de datos local
    const localId = await db.recommendations.add(newRecommendation);
    console.log("Recomendación guardada localmente con ID:", localId);
    return localId;
  } catch (error) {
    console.error("Error al guardar la recomendación localmente:", error);
    throw error;
  }
};
