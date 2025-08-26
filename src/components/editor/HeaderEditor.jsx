'use client';
import Image from 'next/image';
import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCodeFork } from "@fortawesome/free-solid-svg-icons";
import translations from "../../locales/language";

const HeaderEditor = ({
                          mode = 'editor', onPlaySong, onPlayActivePage, onExport,
                          onImport, onSave, onFork, setLang, lang, title
                      }) => {
    const [username, setUsername] = useState('');

    useEffect(() => {
        const storedUsername = localStorage.getItem('username');
        if (storedUsername) {
            setUsername(storedUsername);
        }
    }, []);

    const t = (key, params) => {
        let text = translations[lang]?.[key] || key;
        if (params) {
            Object.entries(params).forEach(([k, v]) => {
                text = text.replace(`{${k}}`, v);
            });
        }
        return text;
    };

    return (
        <header className="bg-bg-darker flex items-center justify-between p-3 border-b border-primary flex-shrink-0">
            {/* Lado Esquerdo: Logo e Título */}
            <div className="flex items-center gap-4">
                <Image src="/img/groover_logo.png" alt="Logo" width={50} height={50} />
                <div>
                    <h1 className="text-lg font-bold text-text-lighter">GROOVER</h1>
                    <h2 className="text-sm text-gray-400">{title || 'Novo Projeto'}</h2>
                </div>
            </div>

            {/* Lado Direito: Ações e Perfil */}
            <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                    {/* Botões de Ação */}
                    <button className="px-3 py-2 text-sm font-semibold rounded-md border-2 border-primary hover:bg-primary/30 transition" onClick={onPlaySong}>
                        ▶ {t("playSong")}
                    </button>
                    <button className="px-3 py-2 text-sm font-semibold rounded-md border-2 border-primary hover:bg-primary/30 transition" onClick={onPlayActivePage}>
                        ▶ {t("playPage")}
                    </button>

                    {mode === 'editor' && (
                        <>
                            <button className="px-3 py-2 text-sm font-semibold rounded-md border-2 border-primary hover:bg-primary/30 transition" onClick={onExport}>
                                ↕ {t("export")}
                            </button>
                            <label className="px-3 py-2 text-sm font-semibold rounded-md border-2 border-accent hover:bg-accent/30 transition cursor-pointer">
                                ↓ {t("import")}
                                <input type="file" className="hidden" accept=".mid, .midi" onChange={(e) => e.target.files && onImport(e.target.files[0])} />
                            </label>
                            <button className="px-3 py-2 text-sm font-semibold rounded-md bg-primary hover:bg-primary-light transition" onClick={onSave}>
                                ⎙ {t("save")}
                            </button>
                        </>
                    )}
                    {mode === 'view' && (
                        <button className="px-3 py-2 text-sm font-semibold rounded-md border-2 border-accent hover:bg-accent/30 transition" onClick={onFork}>
                            <FontAwesomeIcon icon={faCodeFork} className="mr-2" /> {t("Fork")}
                        </button>
                    )}
                </div>

                {/* Seletor de Idioma */}
                <button
                    className="text-2xl"
                    onClick={() => setLang(lang === "pt" ? "en" : "pt")}
                    title={lang === "pt" ? "Switch to English" : "Mudar para Português"}
                >
                    {lang === "pt" ? "🇧🇷" : "🇺🇸"}
                </button>

                {/* Perfil do Usuário */}
                <div className="flex items-center gap-3 text-right">
                    <div>
                        <h3 className="font-semibold text-sm">{username}</h3>
                        <p className="text-xs text-gray-400">Produtor Musical</p>
                    </div>
                    {/* <Image src="/img/default_avatar.png" alt="Avatar" width={40} height={40} className="rounded-full border-2 border-primary" /> */}
                </div>
            </div>
        </header>
    );
};

export default HeaderEditor;