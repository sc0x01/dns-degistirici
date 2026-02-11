import { useState } from 'react';
import { Loader2, Save } from 'lucide-react';

interface CustomDnsInputProps {
    onApply: (primary: string, secondary: string) => void;
    isLoading: boolean;
}

export const CustomDnsInput = ({ onApply, isLoading }: CustomDnsInputProps) => {
    const [primary, setPrimary] = useState('');
    const [secondary, setSecondary] = useState('');
    const [error, setError] = useState<string | null>(null);

    const validateIp = (ip: string) => {
        if (!ip) return true; // Empty is valid for initial state (neutral)
        const ipPattern = /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
        return ipPattern.test(ip);
    };

    // Helper for input border color
    const getInputStatusConfig = (val: string) => {
        if (!val) return 'border-border focus:border-primary focus:ring-primary/20';
        return validateIp(val)
            ? 'border-green-500 focus:border-green-500 focus:ring-green-500/20 ring-1 ring-green-500/10'
            : 'border-red-400 focus:border-red-400 focus:ring-red-400/20 ring-1 ring-red-400/10';
    };

    const handleApply = () => {
        if (!primary || !validateIp(primary)) {
            setError('Geçerli bir IP girin (örn: 8.8.8.8)');
            return;
        }
        if (secondary && !validateIp(secondary)) {
            setError('İkincil DNS adresi geçersiz');
            return;
        }

        setError(null);
        onApply(primary, secondary);
    };

    return (
        <div className="group">
            <h3 className="text-[10px] font-bold text-muted uppercase tracking-widest mb-2 flex items-center gap-1.5 opacity-70">
                <span className="w-1 h-1 rounded-full bg-primary/40 block"></span>
                ÖZEL DNS TANIMLA
            </h3>

            <div className="flex gap-2 mb-2">
                <input
                    type="text"
                    placeholder="Birincil (1.1.1.1)"
                    value={primary}
                    onChange={(e) => setPrimary(e.target.value)}
                    className={`flex-1 min-w-0 bg-gray-50 border rounded-md px-3 py-2 text-xs focus:outline-none transition-all font-mono placeholder:text-muted/70 ${getInputStatusConfig(primary)}`}
                    disabled={isLoading}
                />
                <input
                    type="text"
                    placeholder="İkincil"
                    value={secondary}
                    onChange={(e) => setSecondary(e.target.value)}
                    className={`flex-1 min-w-0 bg-gray-50 border rounded-md px-3 py-2 text-xs focus:outline-none transition-all font-mono placeholder:text-muted/70 ${getInputStatusConfig(secondary)}`}
                    disabled={isLoading}
                />
            </div>

            {error && (
                <div className="text-red-500 text-[10px] mb-2 animate-in fade-in slide-in-from-top-1 font-medium flex items-center gap-1">
                    <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                    {error}
                </div>
            )}

            <button
                onClick={handleApply}
                disabled={isLoading || !primary || !validateIp(primary)}
                className="w-full flex items-center justify-center gap-2 bg-text hover:bg-black text-white py-2 rounded-md text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed group-hover:bg-primary group-hover:hover:bg-primary-hover shadow-sm"
            >
                {isLoading ? (
                    <>
                        <Loader2 size={12} className="animate-spin" />
                        Uygulanıyor
                    </>
                ) : (
                    <>
                        <Save size={12} />
                        Özel DNS'i Uygula
                    </>
                )}
            </button>
        </div>
    );
};
