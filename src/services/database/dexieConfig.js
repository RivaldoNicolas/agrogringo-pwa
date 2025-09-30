import Dexie from "dexie";

export const db = new Dexie("agrogringoDB");

db.version(6).stores({
  // Tabla para las recomendaciones
  // Restauramos los índices con la sintaxis correcta.
  recommendations: `
    ++localId,
    id,
    noHoja,
    fecha,
    dniAgricultor,
    estado,
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
