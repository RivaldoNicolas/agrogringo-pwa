import Dexie from "dexie";

export const db = new Dexie("agrogringoDB");

db.version(7).stores({
  // Tabla para las recomendaciones
  recommendations: `
    ++localId,
    id,
    noHoja,
    fecha,
    [userId+fecha],
    dniAgricultor, 
    estado, 
    userId,
    syncStatus,
    timestampUltimaModificacion
  `,

  // Tabla para el catálogo de productos (se sincronizará desde Firebase)
  products: "++localId, id, &nombre, disponible",

  // Tabla para el catálogo de clientes (se sincronizará desde Firebase)
  clients: "++localId, id, &dni, nombre",
});

/**
 * Función para limpiar todas las tablas de la base de datos local.
 * Útil para cuando el usuario cierra sesión.
 */
export const clearLocalDatabase = async () => {
  await Promise.all(db.tables.map((table) => table.clear()));
};
