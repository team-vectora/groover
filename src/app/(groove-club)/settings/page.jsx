'use client';
import { useTheme } from '../../../contexts/ThemeContext';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSun, faMoon, faRobot, faDownload } from '@fortawesome/free-solid-svg-icons';
import { useEffect, useState } from 'react';

export default function SettingsPage() {
  const { t, i18n } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    const savedLang = localStorage.getItem('lang');
    if (savedLang && i18n.language !== savedLang) {
      i18n.changeLanguage(savedLang);
    }
  }, [i18n]);

  // PWA
  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallPWA = async () => {
    if (!deferredPrompt) return alert(t('pwa.alreadyInstalled'));
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') console.log(t('pwa.accepted'));
    setDeferredPrompt(null);
  };

  // Trocar idioma e salvar no localStorage
  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('lang', lang);
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-accent-light">{t('settings.title')}</h1>

      <div className="space-y-6">
        {/* Tema */}
        <div className="bg-bg-secondary p-4 rounded-lg">
          <h2 className="font-semibold mb-3 text-text-lighter">{t('settings.theme')}</h2>
          <button
            onClick={toggleTheme}
            className="flex items-center gap-3 px-4 py-2 rounded-md bg-primary hover:bg-primary-light transition-colors cursor-pointer"
          >
            {theme === 'dark' && <FontAwesomeIcon icon={faSun} />}
            {theme === 'light' && <FontAwesomeIcon icon={faMoon} />}
            {theme === 'dracula' && <FontAwesomeIcon icon={faRobot} />}
            {t('settings.changeToTheme', { theme })}
          </button>
        </div>

        {/* Idioma */}
        <div className="bg-bg-secondary p-4 rounded-lg">
          <h2 className="font-semibold mb-3 text-text-lighter">{t('settings.language')}</h2>
          <div className="flex gap-4">
            <button
              onClick={() => changeLanguage('pt-BR')}
              className={`px-4 py-2 rounded-md ${i18n.language === 'pt-BR' ? 'bg-accent' : 'bg-primary'}`}
            >
              Português
            </button>
            <button
              onClick={() => changeLanguage('en')}
              className={`px-4 py-2 rounded-md ${i18n.language === 'en' ? 'bg-accent' : 'bg-primary'}`}
            >
              English
            </button>
          </div>
        </div>

        {/* PWA */}
        {deferredPrompt && (
          <div className="bg-bg-secondary p-4 rounded-lg">
            <h2 className="font-semibold mb-3">{t('settings.app')}</h2>
            <button
              onClick={handleInstallPWA}
              className="flex items-center gap-3 px-4 py-2 rounded-md bg-primary hover:bg-primary-light transition-colors"
            >
              <FontAwesomeIcon icon={faDownload} />
              {t('settings.installApp')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
