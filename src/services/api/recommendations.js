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
      const clientData = { ...recommendationData.datosAgricultor };
      // Si hay una firma, la añadimos al perfil del cliente.
      if (recommendationData.firmaAgricultor) {
        clientData.signature = recommendationData.firmaAgricultor;
      }
      await putClient(clientData);
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
 * Implementa paginación para un rendimiento óptimo con grandes volúmenes de datos.
 * @param {string} userId - El ID del usuario.
 * @param {number} [page=1] - El número de página a obtener.
 * @param {number} [pageSize=15] - El número de elementos por página.
 * @param {object} [filters={}] - Objeto con filtros a aplicar.
 * @returns {Promise<{data: Array<object>, total: number}>} Un objeto con las recomendaciones y el conteo total.
 */
export const getAllRecommendations = async (
  userId,
  page = 1,
  pageSize = 15,
  filters = {}
) => {
  if (!userId || typeof userId !== "string") {
    return { data: [], total: 0 };
  }

  const offset = (page - 1) * pageSize;

  // Empezamos la consulta filtrando por usuario
  let query = db.recommendations.where({ userId: userId });

  // Aplicamos los filtros adicionales si existen
  if (filters.status) {
    query = query.and((rec) => rec.estado === filters.status);
  }
  if (filters.dateFrom) {
    query = query.and((rec) => rec.fecha >= new Date(filters.dateFrom));
  }
  if (filters.dateTo) {
    // Añadimos un día para incluir todo el día de la fecha "hasta"
    const dateTo = new Date(filters.dateTo);
    dateTo.setDate(dateTo.getDate() + 1);
    query = query.and((rec) => rec.fecha < dateTo);
  }
  if (filters.client) {
    const lowerCaseFilter = filters.client.toLowerCase();
    query = query.and(
      (rec) =>
        rec.datosAgricultor.nombre.toLowerCase().includes(lowerCaseFilter) ||
        rec.datosAgricultor.dni.includes(lowerCaseFilter)
    );
  }

  const total = await query.count();
  const data = await query.reverse().offset(offset).limit(pageSize).toArray();

  return { data, total };
};

/**
 * Obtiene la última recomendación registrada para un usuario específico.
 * Esta función está ahora altamente optimizada.
 * @param {string} userId - El ID del usuario.
 * @returns {Promise<object|undefined>} La última recomendación o undefined si no hay ninguna.
 */
export const getLastRecommendation = async (userId) => {
  // Usamos el índice [userId+fecha] y el método .last() de Dexie para obtener
  // el último registro de forma súper eficiente, sin cargar toda la tabla.
  return await db.recommendations.where({ userId: userId }).last();
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

    // Al actualizar, también actualizamos el perfil del cliente con la firma más reciente si existe
    if (updates.datosAgricultor?.dni) {
      const clientData = { ...updates.datosAgricultor };
      // Si hay una firma en la actualización, la guardamos en el perfil del cliente.
      if (updates.firmaAgricultor) {
        clientData.signature = updates.firmaAgricultor;
      }
      await putClient(clientData);
    }

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
