import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth } from "@/firebase/config";

/**
 * Inicia sesión de un usuario con email y contraseña.
 * @param {string} email - El correo del usuario.
 * @param {string} password - La contraseña del usuario.
 * @returns {Promise<UserCredential>} La credencial del usuario.
 */
export const login = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    return userCredential;
  } catch (error) {
    // Puedes manejar errores específicos aquí (ej. 'auth/wrong-password')
    console.error("Error al iniciar sesión:", error.code, error.message);
    throw error; // Relanzar el error para que el componente lo maneje
  }
};

/**
 * Cierra la sesión del usuario actual.
 */
export const logout = () => signOut(auth);
