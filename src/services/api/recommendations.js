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
  // Ordenamos por fecha descendente usando el índice 'fecha'.
  return await db.recommendations.orderBy("fecha").reverse().toArray();
};

/**
 * Obtiene la última recomendación registrada en la base de datos local.
 * @returns {Promise<object|undefined>} La última recomendación o undefined si no hay ninguna.
 */
export const getLastRecommendation = async () => {
  // .orderBy('fecha').last() es la forma más eficiente de obtener el último registro.
  // No necesitamos traer toda la colección a memoria.
  return await db.recommendations.orderBy("fecha").last();
};

/**
 * Limpia la tabla de recomendaciones.
 */
export const clearLocalDatabase = async () => {
  return await db.recommendations.clear();
};
