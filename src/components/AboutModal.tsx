import { X, Globe, Github } from 'lucide-react';
import { open } from '@tauri-apps/plugin-shell';
import logo from '../assets/logo.svg';

interface AboutModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const AboutModal = ({ isOpen, onClose }: AboutModalProps) => {
    if (!isOpen) return null;

    const handleLink = async (url: string) => {
        if (!url) return;
        try {
            await open(url);
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px] animate-in fade-in duration-200">
            <div className="bg-white w-[85%] max-w-sm rounded-2xl shadow-2xl border border-border p-6 relative overflow-hidden">

                {/* Decorative Background Glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-primary/5 rounded-full blur-3xl -z-10 pointer-events-none"></div>

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-gray-100 text-muted transition-colors"
                >
                    <X size={16} />
                </button>

                {/* Content */}
                <div className="flex flex-col items-center text-center space-y-4">

                    {/* Logo & Branding */}
                    <div className="relative group cursor-default">
                        <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <img
                            src={logo}
                            alt="Logo"
                            className="w-20 h-20 object-contain drop-shadow-md relative z-10 hover:scale-105 transition-transform duration-300"
                        />
                    </div>

                    <div>
                        <h2 className="text-xl font-bold text-text tracking-tight">DNS Degistirici</h2>
                        <span className="text-xs font-mono text-primary bg-primary/10 px-2 py-0.5 rounded-full mt-1 inline-block">
                            v1.0.0 (Release)
                        </span>
                        <p className="text-xs text-muted mt-2 max-w-[200px] mx-auto leading-relaxed">
                            İnternet hızınızı ve güvenliğinizi tek tıkla optimize edin. Basit, hızlı ve güvenli.
                        </p>
                    </div>

                    {/* Developer Info */}
                    <div className="w-full pt-4 border-t border-dashed border-gray-200">
                        <p className="text-[10px] text-muted uppercase tracking-widest font-semibold mb-3">Developed by</p>
                        <div className="bg-gray-50 rounded-lg p-2 border border-gray-100 flex items-center justify-center gap-2">
                            <span className="font-bold text-sm text-text">sc0x01</span>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 w-full pt-2">
                        <button
                            onClick={() => handleLink('https://sc0x01.com')}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-text text-white rounded-lg text-xs font-medium hover:bg-gray-800 transition-all hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
                        >
                            <Globe size={14} />
                            Website
                        </button>

                        {/* Github Button */}
                        <button
                            onClick={() => handleLink('https://github.com/sc0x01/dns-degistirici')}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-gray-100 text-text rounded-lg text-xs font-medium hover:bg-gray-200 transition-all hover:shadow-sm hover:-translate-y-0.5 active:translate-y-0 border border-transparent"
                        >
                            <Github size={14} />
                            Github
                        </button>
                    </div>

                    {/* Copyright */}
                    <p className="text-[9px] text-muted/30 pt-2">
                        © 2026 sc0x01. All rights reserved.
                    </p>
                </div>
            </div>
        </div>
    );
};
