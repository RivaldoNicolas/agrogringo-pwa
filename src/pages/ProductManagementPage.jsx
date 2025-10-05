import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { addProduct, getAllProducts } from '@/services/api/products';

export function ProductManagementPage() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isFormVisible, setIsFormVisible] = useState(false);

    const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const localProducts = await getAllProducts();
            setProducts(localProducts);
        } catch (err) {
            setError('No se pudieron cargar los productos.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const onSubmit = async (data) => {
        try {
            setError('');
            await addProduct(data);
            reset();
            setIsFormVisible(false);
            await fetchProducts(); // Recargar la lista de productos
        } catch (err) {
            setError(err.message);
            console.error(err);
        }
    };

    if (loading) return <p className="p-4 text-center">Cargando productos...</p>;

    return (
        <div className="max-w-4xl mx-auto p-4">
            <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">Gestión de Productos</h1>
                    <button
                        onClick={() => setIsFormVisible(!isFormVisible)}
                        className="bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700 transition"
                    >
                        + Añadir Producto
                    </button>
                </div>

                {isFormVisible && (
                    <form onSubmit={handleSubmit(onSubmit)} className="p-6 mb-6 bg-gray-50 rounded-lg border">
                        <h3 className="text-lg font-semibold mb-4">Nuevo Producto</h3>
                        {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">Nombre del Producto</label>
                                <input
                                    id="nombre"
                                    {...register('nombre', { required: 'El nombre es obligatorio' })}
                                    className="w-full p-2 mt-1 border-gray-300 rounded-md shadow-sm"
                                />
                                {errors.nombre && <p className="mt-1 text-sm text-red-600">{errors.nombre.message}</p>}
                            </div>
                            <div>
                                <label htmlFor="ingredienteActivo" className="block text-sm font-medium text-gray-700">Ingrediente Activo</label>
                                <input
                                    id="ingredienteActivo"
                                    {...register('ingredienteActivo')}
                                    className="w-full p-2 mt-1 border-gray-300 rounded-md shadow-sm"
                                />
                            </div>
                            <div>
                                <label htmlFor="tipo" className="block text-sm font-medium text-gray-700">Tipo</label>
                                <input
                                    id="tipo"
                                    {...register('tipo')}
                                    placeholder="Ej: Fungicida, Insecticida"
                                    className="w-full p-2 mt-1 border-gray-300 rounded-md shadow-sm"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 mt-4">
                            <button type="button" onClick={() => setIsFormVisible(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md">Cancelar</button>
                            <button type="submit" disabled={isSubmitting} className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md disabled:bg-gray-400">
                                {isSubmitting ? 'Guardando...' : 'Guardar Producto'}
                            </button>
                        </div>
                    </form>
                )}

                {/* Tabla de productos */}
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="p-3 text-left text-xs font-bold text-gray-600 uppercase">Nombre</th>
                                <th className="p-3 text-left text-xs font-bold text-gray-600 uppercase">Ingrediente Activo</th>
                                <th className="p-3 text-left text-xs font-bold text-gray-600 uppercase">Tipo</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.length > 0 ? (
                                products.map(product => (
                                    <tr key={product.localId} className="border-b hover:bg-gray-50">
                                        <td className="p-3 font-medium text-gray-800">{product.nombre}</td>
                                        <td className="p-3 text-gray-600">{product.ingredienteActivo}</td>
                                        <td className="p-3 text-gray-600">{product.tipo}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="3" className="text-center p-8 text-gray-500">No hay productos registrados.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}