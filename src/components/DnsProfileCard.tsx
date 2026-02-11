import { Check, Loader2 } from 'lucide-react';
import { DnsProvider } from '../types';

interface DnsProfileCardProps {
    provider: DnsProvider;
    isActive: boolean;
    isLoading: boolean;
    onSelect: (provider: DnsProvider) => void;
}

export const DnsProfileCard = ({ provider, isActive, isLoading, onSelect }: DnsProfileCardProps) => {
    return (
        <button
            onClick={() => onSelect(provider)}
            disabled={isLoading || isActive}
            className={`
                group relative w-full text-left p-2.5 rounded-lg border transition-all duration-200
                ${isActive
                    ? 'bg-primary/5 border-primary shadow-sm ring-1 ring-primary/20'
                    : 'bg-white border-border hover:border-primary/40 hover:shadow-sm'
                }
                ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}
            `}
        >
            <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                    <h3 className={`font-bold text-xs leading-tight truncate ${isActive ? 'text-primary' : 'text-text'}`}>
                        {provider.name}
                    </h3>

                    {/* Description - New Feature */}
                    <p className="text-[9px] text-muted/60 mt-0.5 truncate pr-2">
                        {provider.description}
                    </p>

                    <div className="flex flex-col gap-0.5 mt-2 text-[10px] font-mono text-muted/80">
                        {provider.primary && (
                            <div className="flex items-center gap-1">
                                <span className={`w-1 h-1 rounded-full ${isActive ? 'bg-primary' : 'bg-muted/40'}`}></span>
                                {provider.primary}
                            </div>
                        )}
                        {/* Secondary IP - New Feature */}
                        {provider.secondary && (
                            <div className="flex items-center gap-1 opacity-70">
                                <span className="w-1 h-1 rounded-full bg-transparent"></span>
                                {provider.secondary}
                            </div>
                        )}
                        {provider.isAutomatic && (
                            <div className="italic text-muted">Otomatik</div>
                        )}
                    </div>
                </div>

                <div className={`
                    w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 mt-0.5 border
                    ${isActive
                        ? 'bg-primary border-primary text-white scale-100'
                        : 'bg-transparent border-muted/30 text-transparent group-hover:border-primary/50 group-hover:bg-primary/5'
                    }
                `}>
                    {isLoading && isActive ? (
                        <Loader2 size={12} className="animate-spin text-white" />
                    ) : isActive ? (
                        <Check size={12} strokeWidth={3} />
                    ) : (
                        <div className="w-full h-full rounded-full"></div>
                    )}
                </div>
            </div>
        </button>
    );
};
