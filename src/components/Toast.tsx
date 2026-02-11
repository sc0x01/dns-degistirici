import { useEffect, useState } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';

export interface ToastMessage {
    message: string;
    type: 'success' | 'error';
}

interface ToastProps {
    toast: ToastMessage | null;
    onClose: () => void;
}

export const Toast = ({ toast, onClose }: ToastProps) => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (toast) {
            setVisible(true);
            const timer = setTimeout(() => {
                setVisible(false);
                setTimeout(onClose, 300); // Wait for fade out animation
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [toast, onClose]);

    if (!toast && !visible) return null;

    return (
        <div
            className={`
                fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg border transition-all duration-300 transform
                ${visible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}
                ${toast?.type === 'success'
                    ? 'bg-white border-green-200 text-green-700'
                    : 'bg-white border-red-200 text-red-700'
                }
            `}
        >
            {toast?.type === 'success' ? (
                <CheckCircle2 size={18} className="shrink-0 text-green-500" />
            ) : (
                <XCircle size={18} className="shrink-0 text-red-500" />
            )}
            <span className="text-xs font-semibold whitespace-nowrap">
                {toast?.message}
            </span>
        </div>
    );
};
