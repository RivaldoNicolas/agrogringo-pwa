import { db } from "@/services/database/dexieConfig";
import Dexie from "dexie";
import { v4 as uuidv4 } from "uuid"; // Necesitarás instalar uuid: npm install uuid
import { putClient } from "./clients";

/**
 * Crea una nueva recomendación.
 * Por ahora, implementa la lógica offline-first: siempre guarda en Dexie.
 * @param {object} recommendationData - Los datos del formulario.
 * @returns {Promise<number>} El ID local del nuevo registro en Dexie.
 */
export const createRecommendation = async (recommendationData, userId) => {
  try {
    const newRecommendation = {
      ...recommendationData, // Datos del formulario
      id: uuidv4(), // Genera un ID único universal
      dniAgricultor: recommendationData.datosAgricultor?.dni || "",
      userId: userId,
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
 * @param {string} userId - El ID del usuario.
 * @returns {Promise<Array<object>>} Un array con las recomendaciones.
 */
export const getAllRecommendations = async (userId) => {
  if (!userId || typeof userId !== "string") {
    return [];
  }

  // 1. Obtenemos TODAS las recomendaciones de la base de datos.
  const allRecsFromDB = await db.recommendations.toArray();

  // 2. Filtramos en memoria: nos quedamos con las que son del usuario o las que no tienen userId (antiguas).
  const allRecs = allRecsFromDB.filter(
    (rec) => rec.userId === userId || rec.userId === undefined
  );

  // 3. Las ordenamos por fecha en memoria (de más reciente a más antigua).
  return allRecs.sort((a, b) => b.fecha - a.fecha);
};

/**
 * Obtiene la última recomendación registrada para un usuario específico.
 * @param {string} userId - El ID del usuario.
 * @returns {Promise<object|undefined>} La última recomendación o undefined si no hay ninguna.
 */
export const getLastRecommendation = async (userId) => {
  // Obtenemos todas las recomendaciones (del usuario y antiguas) y encontramos la última.
  const allRecs = await getAllRecommendations(userId);
  return allRecs.length > 0 ? allRecs[0] : undefined;
};

/**
 * Obtiene una recomendación específica por su ID local.
 * @param {number} localId - El ID local del registro en Dexie.
 * @returns {Promise<object|undefined>} La recomendación o undefined si no se encuentra.
 */
export const getRecommendationById = async (localId) => {
  // Dexie's get() es la forma más eficiente de obtener un registro por su clave primaria.
  return await db.recommendations.get(localId);
};

/**
 * Actualiza una recomendación existente en la base de datos local.
 * @param {number} localId - El ID local del registro en Dexie.
 * @param {object} updates - Un objeto con los campos a actualizar.
 * @returns {Promise<number>} El número de registros actualizados (debería ser 1).
 */
export const updateRecommendation = async (localId, updates) => {
  try {
    const recommendation = await db.recommendations.get(localId);
    if (!recommendation) {
      throw new Error("Recomendación no encontrada");
    }

    // Prepara los datos para la actualización
    const dataToUpdate = {
      ...updates,
      timestampUltimaModificacion: new Date(),
      // Si ya estaba sincronizado, lo marcamos para actualizar. Si no, sigue pendiente de creación.
      syncStatus:
        recommendation.syncStatus === "synced"
          ? "pending_update"
          : recommendation.syncStatus,
    };

    return await db.recommendations.update(localId, dataToUpdate);
  } catch (error) {
    console.error("Error al actualizar la recomendación localmente:", error);
    throw error;
  }
};

/**
 * Elimina una recomendación de la base de datos local.
 * @param {number} localId - El ID local del registro en Dexie.
 * @returns {Promise<void>}
 */
export const deleteRecommendation = async (localId) => {
  return await db.recommendations.delete(localId);
};

/**
 * Limpia la tabla de recomendaciones.
 */
export const clearLocalDatabase = async () => {
  return await db.recommendations.clear();
};
