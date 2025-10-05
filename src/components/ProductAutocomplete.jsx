import { useState, useEffect } from 'react';

/**
 * Componente de autocompletado para productos.
 * @param {object} props
 * @param {Array} props.products - La lista completa de productos disponibles.
 * @param {string} props.value - El valor actual del input.
 * @param {function} props.onChange - Función que se llama cuando el valor cambia o se selecciona una sugerencia.
 */
export function ProductAutocomplete({ products, value, onChange }) {
    const [inputValue, setInputValue] = useState(value || '');
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    useEffect(() => {
        setInputValue(value || '');
    }, [value]);

    const handleInputChange = (e) => {
        const query = e.target.value;
        setInputValue(query);
        onChange(query); // Actualiza el valor en react-hook-form

        if (query.length > 1) {
            // Búsqueda más precisa: prioriza los que empiezan con la consulta
            const filteredSuggestions = products.filter(product =>
                product.nombre.toLowerCase().includes(query.toLowerCase())
            ).sort((a, b) =>
                a.nombre.toLowerCase().startsWith(query.toLowerCase()) ? -1 :
                    b.nombre.toLowerCase().startsWith(query.toLowerCase()) ? 1 : 0
            );
            setSuggestions(filteredSuggestions);
            setShowSuggestions(true);
        } else {
            setSuggestions([]);
            setShowSuggestions(false);
        }
    };

    const handleSelectSuggestion = (productName) => {
        setInputValue(productName);
        onChange(productName); // Actualiza el valor en react-hook-form
        setSuggestions([]);
        setShowSuggestions(false);
    };

    return (
        <div className="relative">
            <input
                value={inputValue}
                onChange={handleInputChange}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 150)} // Pequeño delay para permitir el click
                onFocus={handleInputChange} // Vuelve a mostrar sugerencias si hay texto
                className="w-full p-2 border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                placeholder="Buscar producto..."
                autoComplete="off"
            />
            {showSuggestions && (
                <ul className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-40 overflow-auto">
                    {suggestions.length > 0 ? (
                        suggestions.map((product) => (
                            <li
                                key={product.localId}
                                onMouseDown={() => handleSelectSuggestion(product.nombre)} // Usamos onMouseDown para que se dispare antes del onBlur del input
                                className="px-4 py-2 cursor-pointer hover:bg-green-50"
                            >{product.nombre}</li>
                        ))
                    ) : (
                        <li className="px-4 py-2 text-sm text-gray-500">
                            {inputValue.length > 1 ? "No se encontraron productos" : "Escribe para buscar..."}
                        </li>
                    )}
                </ul>
            )}
        </div>
    );
}