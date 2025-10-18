import { db } from "@/services/database/dexieConfig";

/**
 * Guarda o actualiza el perfil de un usuario.
 * @param {string} userId - El ID del usuario de Firebase.
 * @param {object} profileData - Los datos del perfil a guardar (ej. { signature: '...' }).
 */
export const updateUserProfile = async (userId, profileData) => {
  try {
    // Dexie's put() es un "upsert": actualiza si existe, inserta si no.
    // Usa userId como clave primaria.
    return await db.userProfiles.put({ userId, ...profileData });
  } catch (error) {
    console.error("Error al actualizar el perfil de usuario:", error);
    throw error;
  }
};
