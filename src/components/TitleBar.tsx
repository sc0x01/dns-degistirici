import logo from '../assets/logo.svg';
import { Minus, X, Info } from 'lucide-react';
import { getCurrentWindow } from '@tauri-apps/api/window';

interface TitleBarProps {
    onInfoClick?: () => void;
}

export const TitleBar = ({ onInfoClick }: TitleBarProps) => {
    const appWindow = getCurrentWindow();

    return (
        <div data-tauri-drag-region className="h-10 bg-surface flex items-center justify-between px-4 select-none border-b border-border z-50 shadow-sm relative">
            {/* Left Side: Drag Region + Title */}
            <div className="flex-1 flex items-center gap-3 h-full pointer-events-none data-[tauri-drag-region]:pointer-events-auto cursor-default">
                {/* Logo */}
                <img src={logo} className="w-6 h-6 object-contain pointer-events-none drop-shadow-sm p-0.5" alt="DNS Degistirici Logo" />
                <span className="text-xs font-bold text-muted/90 tracking-wide pointer-events-none drop-shadow-sm uppercase">
                    DNS DEGISTIRICI v1.0
                </span>
            </div>

            {/* Right Side: Window Controls */}
            <div className="flex items-center gap-1 shrink-0 h-full pl-2">
                <button
                    onClick={onInfoClick}
                    className="p-1.5 hover:bg-muted/10 rounded-md transition-colors text-muted hover:text-primary cursor-pointer mr-1"
                    title="Hakkında"
                >
                    <Info size={14} />
                </button>
                <button
                    onClick={() => appWindow.minimize()}
                    className="p-1.5 hover:bg-muted/10 rounded-md transition-colors text-muted hover:text-text cursor-pointer"
                >
                    <Minus size={14} />
                </button>
                <button
                    onClick={() => appWindow.close()}
                    className="p-1.5 hover:bg-red-500/10 hover:text-red-500 rounded-md transition-colors text-muted cursor-pointer"
                >
                    <X size={14} />
                </button>
            </div>
        </div>
    );
};
