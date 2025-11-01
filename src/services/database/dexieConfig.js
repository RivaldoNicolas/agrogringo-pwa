import Dexie from "dexie";

export const db = new Dexie("agrogringoDB");

db.version(13).stores({
  recommendations:
    "id, noHoja, fecha, [userId+fecha], dniAgricultor, cultivo, estado, faseTratamiento, userId, syncStatus, timestampUltimaModificacion",
  products: "id, &nombre, cantidad, formaDeUso",
  clients:
    "&dni, nombre, celular, signature, timestampCreacion, timestampUltimaModificacion",
  userProfiles: "&userId, signature",
});

/**
 * Función para limpiar todas las tablas de la base de datos local.
 * Útil para cuando el usuario cierra sesión.
 */
export const clearLocalDatabase = async () => {
  await Promise.all(db.tables.map((table) => table.clear()));
};
