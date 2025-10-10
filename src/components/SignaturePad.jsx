import { useRef, useState, useEffect } from 'react';
import SignatureCanvas from 'react-signature-canvas';

/**
 * Componente para capturar una firma digital.
 * @param {object} props
 * @param {string} props.title - Título para el pad de firma (e.g., "Firma del Agricultor").
 * @param {string} [props.initialDataURL] - Una firma en formato base64 para cargarla inicialmente.
 * @param {function} props.onEnd - Callback que se ejecuta cuando se termina de firmar, pasando la firma en formato base64.
 */
export function SignaturePad({ title, initialDataURL, onEnd }) {
    const sigCanvas = useRef({});
    const [isSigned, setIsSigned] = useState(false);

    useEffect(() => {
        // Si recibimos una firma inicial y el canvas está listo, la dibujamos.
        if (initialDataURL && sigCanvas.current) {
            sigCanvas.current.fromDataURL(initialDataURL);
            setIsSigned(true);
        }
    }, [initialDataURL]);

    const clear = () => {
        sigCanvas.current.clear();
        setIsSigned(false);
        onEnd(null); // Notificar que se ha limpiado
    };

    return (
        <div className="p-4 text-center border-2 border-dashed rounded-lg bg-white">
            <p className="text-sm font-medium text-gray-700 mb-2">{title}</p>
            <div className="bg-gray-100 border rounded-md">
                <SignatureCanvas
                    ref={sigCanvas}
                    penColor='black'
                    canvasProps={{ className: 'w-full h-32 rounded-md' }}
                    // Cambiamos getTrimmedCanvas().toDataURL() por solo toDataURL()
                    // para evitar el error de la librería interna.
                    onEnd={() => {
                        const dataUrl = sigCanvas.current.toDataURL('image/png');
                        onEnd(dataUrl);
                        setIsSigned(true);
                    }}
                />
            </div>
            <div className="flex justify-center gap-2 mt-2">
                <button type="button" onClick={clear} className="text-xs bg-gray-200 hover:bg-gray-300 text-gray-700 py-1 px-3 rounded">
                    Limpiar
                </button>
                {/* El guardado puede ser implícito con onEnd, o explícito con un botón */}
                {/* <button type="button" onClick={save} className="text-xs bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded">
                    Guardar Firma
                </button> */}
            </div>
        </div>
    );
}