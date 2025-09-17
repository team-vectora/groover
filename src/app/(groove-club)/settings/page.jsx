// src/app/(groove-club)/settings/page.jsx
'use client';
import { useTheme } from '../../../contexts/ThemeContext';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload, faTrash } from '@fortawesome/free-solid-svg-icons';
import { useEffect, useState } from 'react';
import { useDeleteAccount } from '../../../hooks/settings/useDeleteAccount';

export default function SettingsPage() {
  const { t, i18n } = useTranslation();
  const { theme, setTheme, size, setSize } = useTheme();
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [token, setToken] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const { deleteAccount, loading: deleting, error: deleteError } = useDeleteAccount(token);

  useEffect(() => {
    const savedLang = localStorage.getItem('lang');
    if (savedLang && i18n.language !== savedLang) {
      i18n.changeLanguage(savedLang);
    }
  }, [i18n]);

  useEffect(() => {
    setToken(localStorage.getItem('token'));
  }, []);

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

  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('lang', lang);
  };

  const handleDeleteClick = () => {
    setShowConfirm(true);
  };

  const confirmDelete = () => {
    deleteAccount();
    setShowConfirm(false);
  };

  const cancelDelete = () => {
    setShowConfirm(false);
  };

  return (
<div className="max-w-2xl mx-auto p-6 bg-bg-secondary rounded-xl border-2 border-primary shadow-md space-y-6">
  <h1 className="text-3xl font-bold text-accent-light text-center">{t('settings.title')}</h1>

  {/* Tema */}
  <div className="space-y-2">
    <h2 className="font-semibold text-foreground">{t('settings.theme')}</h2>
    <select
      value={theme}
      onChange={(e) => setTheme(e.target.value)}
      className="w-full px-4 py-2 rounded-md bg-primary text-text-lighter cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent"
    >
      <option value="light">🌞 Light</option>
      <option value="dark">🌙 Dark</option>
      <option value="dracula">🤖 Dracula</option>
    </select>
  </div>

  <hr className="border-accent/30" />

  {/* Tamanho da Fonte */}
  <div className="space-y-2">
    <h2 className="font-semibold text-foreground">{t('settings.fontSize')}</h2>
    <div className="flex gap-2">
      {['small', 'medium', 'giga'].map((s) => (
        <button
          key={s}
          onClick={() => setSize(s)}
          className={`px-4 py-2 rounded-md text-sm transition ${
            size === s ? 'bg-accent text-white' : 'bg-primary hover:bg-primary-light'
          }`}
        >
          {t(`settings.${s}`)}
        </button>
      ))}
    </div>
  </div>

  <hr className="border-accent/30" />

  {/* Idioma */}
  <div className="space-y-2">
    <h2 className="font-semibold text-foreground">{t('settings.language')}</h2>
    <select
      value={i18n.language}
      onChange={(e) => changeLanguage(e.target.value)}
      className="w-full px-4 py-2 rounded-md bg-primary text-text-lighter cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent"
    >
      <option value="pt-BR">🇧🇷 Português</option>
      <option value="en">🇺🇸 English</option>
    </select>
  </div>

  <hr className="border-accent/30" />

  {/* PWA */}
  {deferredPrompt && (
    <div className="space-y-2">
      <h2 className="font-semibold text-foreground">{t('settings.app')}</h2>
      <button
        onClick={handleInstallPWA}
        className="flex items-center gap-3 px-4 py-2 rounded-md bg-primary hover:bg-primary-light transition-colors"
      >
        <FontAwesomeIcon icon={faDownload} />
        {t('settings.installApp')}
      </button>
    </div>
  )}

  {deferredPrompt && <hr className="border-accent/30" />}

  {/* Deletar Conta */}
  <div className="space-y-2">
    <h2 className="font-semibold text-foreground">{t('settings.deleteAccount')}</h2>
    {deleteError && <p className="text-red-500">{deleteError}</p>}
    <button
      onClick={handleDeleteClick}
      disabled={deleting}
      className="flex items-center gap-3 px-4 py-2 rounded-md bg-red-600 hover:bg-red-700 text-white transition-colors"
    >
      <FontAwesomeIcon icon={faTrash} />
      {deleting ? t('settings.deleting') : t('settings.deleteAccount')}
    </button>
  </div>

  {/* Popup de Confirmação */}
  {showConfirm && (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
      <div className="bg-bg-secondary p-6 rounded-lg max-w-sm w-full text-center space-y-4">
        <h2 className="text-lg font-semibold text-foreground">
          {t('settings.confirmDeleteTitle')}
        </h2>
        <p className="text-foreground">{t('settings.confirmDeleteMessage')}</p>
        <div className="flex justify-center gap-4 mt-4">
          <button
            onClick={confirmDelete}
            className="px-4 py-2 rounded-md bg-red-600 hover:bg-red-700 text-white transition-colors"
          >
            {t('settings.yesDelete')}
          </button>
          <button
            onClick={cancelDelete}
            className="px-4 py-2 rounded-md bg-gray-400 hover:bg-gray-500 text-white transition-colors"
          >
            {t('settings.cancel')}
          </button>
        </div>
      </div>
    </div>
  )}
</div>

  );
}