import { ReactNode, useState } from 'react';
import { TitleBar } from '../components/TitleBar';
import { AboutModal } from '../components/AboutModal';

interface LayoutProps {
    children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
    const [isAboutOpen, setIsAboutOpen] = useState(false);

    return (
        <div className="h-screen w-screen bg-background text-text flex flex-col overflow-hidden rounded-xl border border-border shadow-2xl relative select-none">
            <TitleBar onInfoClick={() => setIsAboutOpen(true)} />
            <main className="flex-1 overflow-auto custom-scrollbar relative">
                {children}
            </main>
            <AboutModal isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />
        </div>
    );
};
