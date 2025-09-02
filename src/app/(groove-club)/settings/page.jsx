// src/app/(groove-club)/settings/page.jsx
'use client';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSun, faMoon, faDownload } from '@fortawesome/free-solid-svg-icons';

export default function SettingsPage() {
    const { i18n } = useTranslation();
    const [theme, setTheme] = useState('dark');
    const [deferredPrompt, setDeferredPrompt] = useState(null);

    useEffect(() => {
        // Lógica do Tema
        const savedTheme = localStorage.getItem('theme') || 'dark';
        setTheme(savedTheme);
        document.documentElement.classList.toggle('dark', savedTheme === 'dark');

        // Lógica do PWA
        const handleBeforeInstallPrompt = (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
        };
        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    }, []);

    const toggleTheme = () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
        document.documentElement.classList.toggle('dark', newTheme === 'dark');
    };

    const handleInstallPWA = async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === 'accepted') {
                console.log('Usuário aceitou a instalação do PWA');
            }
            setDeferredPrompt(null);
        } else {
            alert("O app já está instalado ou o navegador não suporta a instalação.");
        }
    };

    return (
        <div className="p-8 max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold mb-8 text-accent-light">Configurações</h1>
            <div className="space-y-6">
                {/* Seção de Tema */}
                <div className="bg-bg-secondary p-4 rounded-lg">
                    <h2 className="font-semibold mb-3">Tema</h2>
                    <button onClick={toggleTheme} className="flex items-center gap-3 px-4 py-2 rounded-md bg-primary hover:bg-primary-light transition-colors">
                        <FontAwesomeIcon icon={theme === 'dark' ? faSun : faMoon} />
                        Mudar para tema {theme === 'dark' ? 'Claro' : 'Escuro'}
                    </button>
                </div>

                {/* Seção de Idioma */}
                <div className="bg-bg-secondary p-4 rounded-lg">
                    <h2 className="font-semibold mb-3">Idioma</h2>
                    <div className="flex gap-4">
                        <button onClick={() => i18n.changeLanguage('pt-BR')} className={`px-4 py-2 rounded-md ${i18n.language === 'pt-BR' ? 'bg-accent' : 'bg-primary'}`}>Português</button>
                        <button onClick={() => i18n.changeLanguage('en')} className={`px-4 py-2 rounded-md ${i18n.language === 'en' ? 'bg-accent' : 'bg-primary'}`}>English</button>
                    </div>
                </div>

                {/* Seção PWA */}
                {deferredPrompt && (
                    <div className="bg-bg-secondary p-4 rounded-lg">
                        <h2 className="font-semibold mb-3">Aplicativo</h2>
                        <button onClick={handleInstallPWA} className="flex items-center gap-3 px-4 py-2 rounded-md bg-primary hover:bg-primary-light transition-colors">
                            <FontAwesomeIcon icon={faDownload} />
                            Instalar App
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}