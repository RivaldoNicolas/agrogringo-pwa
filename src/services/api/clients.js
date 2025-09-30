import { db } from "@/services/database/dexieConfig";

/**
 * Guarda o actualiza un cliente en la base de datos local.
 * Dexie's put() se encarga de la lógica "upsert" (update or insert).
 * Usa el DNI como clave única.
 * @param {object} clientData - Los datos del cliente (ej. datosAgricultor).
 * @returns {Promise<number>} El ID local del registro.
 */
export const putClient = async (clientData) => {
  // Aseguramos que el objeto tenga los campos esperados por la tabla 'clients'
  const clientRecord = {
    dni: clientData.dni,
    nombre: clientData.nombre,
    ...clientData, // Guarda el resto de datos por si son útiles
  };
  return await db.clients.put(clientRecord);
};

/**
 * Busca clientes en la base de datos local por nombre o DNI.
 * @param {string} query - El término de búsqueda.
 * @returns {Promise<Array<object>>} Un array con los clientes que coinciden.
 */
export const searchClients = async (query) => {
  if (!query) return [];
  // Busca si el DNI o el nombre comienzan con el término de búsqueda (insensible a mayúsculas)
  return await db.clients
    .where("dni")
    .startsWithIgnoreCase(query)
    .or("nombre")
    .startsWithIgnoreCase(query)
    .limit(10) // Limita los resultados para mejor rendimiento
    .toArray();
};
