'use client';
import { useTranslation } from "react-i18next";

const LanguageSwitcher = () => {
    const { i18n } = useTranslation();

    const changeLanguage = (lang) => {
        i18n.changeLanguage(lang);
    };

    return (
        <div className="flex items-center gap-2">
            <button
                onClick={() => changeLanguage('pt-BR')}
                className={`px-2 py-1 rounded-md transition-opacity ${i18n.language === 'pt-BR' ? 'opacity-100' : 'opacity-50 hover:opacity-100'}`}
                title="Português"
            >
                🇧🇷
            </button>
            <button
                onClick={() => changeLanguage('en')}
                className={`px-2 py-1 rounded-md transition-opacity ${i18n.language === 'en' ? 'opacity-100' : 'opacity-50 hover:opacity-100'}`}
                title="English"
            >
                🇺🇸
            </button>
        </div>
    );
};

export default LanguageSwitcher;