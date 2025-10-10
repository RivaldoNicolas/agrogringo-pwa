import Dexie from "dexie";

export const db = new Dexie("agrogringoDB");

db.version(11).stores({
  recommendations:
    "++localId, id, noHoja, fecha, [userId+fecha], dniAgricultor, estado, userId, syncStatus, timestampUltimaModificacion",
  products: "++localId, id, &nombre, cantidad, formaDeUso",
  clients: "++localId, &dni, nombre, signature",
  userProfiles: "&userId, signature",
});

/**
 * Función para limpiar todas las tablas de la base de datos local.
 * Útil para cuando el usuario cierra sesión.
 */
export const clearLocalDatabase = async () => {
  await Promise.all(db.tables.map((table) => table.clear()));
};
