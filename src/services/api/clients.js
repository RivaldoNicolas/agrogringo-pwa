import { db } from "@/services/database/dexieConfig";

/**
 * Guarda o actualiza un cliente en la base de datos local.
 * Dexie's put() se encarga de la lógica "upsert" (update or insert).
 * Usa el DNI como clave única.
 * @param {object} clientData - Los datos del cliente (ej. datosAgricultor).
 * @returns {Promise<number>} El ID local del registro.
 */
export const putClient = async (clientData) => {
  if (!clientData || !clientData.dni) {
    // No hacer nada si no hay DNI, para evitar errores.
    return;
  }

  // Prepara el objeto para guardar, asegurando el timestamp de modificación.
  const clientToSave = {
    ...clientData,
    timestampUltimaModificacion: new Date(),
  };

  // Para mantener el timestamp de creación, primero verificamos si el cliente existe.
  const existingClient = await db.clients.get(clientData.dni);
  if (!existingClient) {
    clientToSave.timestampCreacion = new Date();
  }

  // Dexie.put() se encarga de la lógica "update or insert" (upsert)
  // usando el DNI como clave primaria.
  return await db.clients.put(clientToSave);
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
