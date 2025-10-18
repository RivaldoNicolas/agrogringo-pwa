import { db } from "@/services/database/dexieConfig";
import { v4 as uuidv4 } from "uuid";

/**
 * Añade un nuevo producto a la base de datos local.
 * @param {object} productData - Datos del producto (nombre, ingredienteActivo, tipo).
 * @returns {Promise<number>} El ID local del nuevo producto.
 */
export const addProduct = async (productData) => {
  try {
    const newProduct = {
      ...productData,
      id: uuidv4(), // ID universal para futura sincronización con Firebase
      disponible: true,
      syncStatus: "pending_creation",
    };
    return await db.products.add(newProduct);
  } catch (error) {
    console.error("Error al añadir producto localmente:", error);
    // Si el error es por nombre duplicado, puedes dar un mensaje más amigable.
    if (error.name === "ConstraintError") {
      throw new Error(
        `El producto con el nombre "${productData.nombre}" ya existe.`
      );
    }
    throw error;
  }
};

/**
 * Obtiene todos los productos de la base de datos local.
 */
export const getAllProducts = () =>
  db.products
    .filter((product) => product.syncStatus !== "pending_deletion")
    .sortBy("nombre");

/**
 * Elimina un producto de la base de datos local.
 * @param {number} localId - El ID local del producto a eliminar.
 * @returns {Promise<void>}
 */
export const deleteProduct = async (localId) => {
  try {
    const product = await db.products.get(localId);
    if (product) {
      // Si el producto nunca fue subido a la nube, lo podemos borrar directamente.
      if (product.syncStatus === "pending_creation") {
        return await db.products.delete(localId);
      } else {
        // Si ya estaba en la nube, lo marcamos para que el sincronizador lo borre.
        return await db.products.update(localId, {
          syncStatus: "pending_deletion",
        });
      }
    }
  } catch (error) {
    console.error("Error al eliminar el producto localmente:", error);
    throw error;
  }
};
