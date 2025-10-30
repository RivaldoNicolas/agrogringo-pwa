import Dexie from "dexie";

export const db = new Dexie("agrogringoDB");

db.version(12).stores({
  recommendations:
    "++localId, id, noHoja, fecha, [userId+fecha], dniAgricultor, cultivo, estado, faseTratamiento, userId, syncStatus, timestampUltimaModificacion",
  products: "++localId, id, &nombre, cantidad, formaDeUso", // No changes needed here
  clients: "++localId, &dni, nombre, celular, signature",
  userProfiles: "&userId, signature",
});

/**
 * Función para limpiar todas las tablas de la base de datos local.
 * Útil para cuando el usuario cierra sesión.
 */
export const clearLocalDatabase = async () => {
  await Promise.all(db.tables.map((table) => table.clear()));
};
