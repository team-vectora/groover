'use client';
import { useTheme } from '../../../contexts/ThemeContext';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSun, faMoon, faRobot, faDownload } from '@fortawesome/free-solid-svg-icons';
import { useEffect, useState } from 'react';

export default function SettingsPage() {
  const { i18n } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallPWA = async () => {
    if (!deferredPrompt) return alert("O app já está instalado ou o navegador não suporta a instalação.");
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') console.log('Usuário aceitou a instalação do PWA');
    setDeferredPrompt(null);
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-accent-light">Configurações</h1>

      <div className="space-y-6">
        {/* Tema */}
        <div className="bg-bg-secondary p-4 rounded-lg">
          <h2 className="font-semibold mb-3 text-text-lighter">Tema</h2>
          <button
            onClick={toggleTheme}
            className="flex items-center gap-3 px-4 py-2 rounded-md bg-primary hover:bg-primary-light transition-colors cursor-pointer"
          >
            {theme === 'dark' && <FontAwesomeIcon icon={faSun} />}
            {theme === 'light' && <FontAwesomeIcon icon={faMoon} />}
            {theme === 'dracula' && <FontAwesomeIcon icon={faRobot} />}
            Mudar para tema: {theme}
          </button>
        </div>

        {/* Idioma */}
        <div className="bg-bg-secondary p-4 rounded-lg">
          <h2 className="font-semibold mb-3 text-text-lighter">Idioma</h2>
          <div className="flex gap-4">
            <button
              onClick={() => i18n.changeLanguage('pt-BR')}
              className={`px-4 py-2 rounded-md ${i18n.language === 'pt-BR' ? 'bg-accent' : 'bg-primary'}`}
            >
              Português
            </button>
            <button
              onClick={() => i18n.changeLanguage('en')}
              className={`px-4 py-2 rounded-md ${i18n.language === 'en' ? 'bg-accent' : 'bg-primary'}`}
            >
              English
            </button>
          </div>
        </div>

        {/* PWA */}
        {deferredPrompt && (
          <div className="bg-bg-secondary p-4 rounded-lg">
            <h2 className="font-semibold mb-3">Aplicativo</h2>
            <button
              onClick={handleInstallPWA}
              className="flex items-center gap-3 px-4 py-2 rounded-md bg-primary hover:bg-primary-light transition-colors"
            >
              <FontAwesomeIcon icon={faDownload} />
              Instalar App
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
