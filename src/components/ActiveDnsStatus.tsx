import { RefreshCw } from 'lucide-react';

interface ActiveDnsStatusProps {
    interfaceName: string;
    servers: string[];
    isAutomatic: boolean;
    isLoading: boolean;
    onRefresh: () => void;
}

export const ActiveDnsStatus = ({ interfaceName, servers, isAutomatic, isLoading, onRefresh }: ActiveDnsStatusProps) => {
    return (
        <div className="bg-white rounded-lg border border-border shadow-sm overflow-hidden relative group">
            <div className="flex items-center justify-between p-3">
                <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${isAutomatic ? 'bg-blue-500' : 'bg-primary'} animate-pulse ring-2 ring-offset-1 ${isAutomatic ? 'ring-blue-100' : 'ring-primary/20'}`}></div>

                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-muted uppercase tracking-widest leading-none mb-0.5">
                            {interfaceName}
                        </span>
                        <div className="flex items-center gap-2">
                            <span className={`text-xs font-bold leading-none ${isAutomatic ? 'text-blue-600' : 'text-primary'}`}>
                                {isAutomatic ? 'OTOMATİK (DHCP)' : servers.join(' / ')}
                            </span>
                        </div>
                    </div>
                </div>

                <button
                    onClick={onRefresh}
                    disabled={isLoading}
                    className={`p-1.5 rounded-md hover:bg-muted/10 text-muted transition-colors ${isLoading ? 'animate-spin' : ''}`}
                    title="Yenile"
                >
                    <RefreshCw size={14} />
                </button>
            </div>

            {/* Status Line */}
            <div className={`h-0.5 w-full ${isAutomatic ? 'bg-blue-500/50' : 'bg-primary'} transition-colors duration-500`}></div>
        </div>
    );
};
