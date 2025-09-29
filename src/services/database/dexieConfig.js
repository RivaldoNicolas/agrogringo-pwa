import Dexie from "dexie";

export const db = new Dexie("agrogringoDB");

db.version(1).stores({
  // Tabla para las recomendaciones
  // Se añaden índices para los campos que se usarán en filtros y búsquedas
  recommendations: `
    ++localId,
    id,
    noHoja,
    fecha,
    'datosAgricultor.dni',
    'datosTecnico.email',
    estado,
    *detallesProductos.producto,
    syncStatus,
    timestampUltimaModificacion
  `,

  // Tabla para el catálogo de productos (se sincronizará desde Firebase)
  products: `
    ++localId,
    id,
    &nombre,                    // Nombre único para búsquedas y autocompletado
    disponible
  `,

  // Tabla para el catálogo de clientes (se sincronizará desde Firebase)
  clients: `
    ++localId,
    id,
    &dni,                       // DNI único, clave principal de búsqueda
    nombre
  `,
});

/**
 * Función para limpiar todas las tablas de la base de datos local.
 * Útil para cuando el usuario cierra sesión.
 */
export const clearLocalDatabase = async () => {
  await Promise.all(db.tables.map((table) => table.clear()));
};
