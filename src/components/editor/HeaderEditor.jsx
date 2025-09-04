// src/components/editor/HeaderEditor.jsx
'use client';
import Image from 'next/image';
import { useEffect, useState } from "react";
import Link from 'next/link';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faPlay, faPause, faStop, faDownload, faUpload, faFloppyDisk,
    faUser, faMusic, faCodeFork, faHouse, faEraser, faArrowTurnDown
} from "@fortawesome/free-solid-svg-icons";
import { useAuth } from '../../hooks';

const HeaderEditor = ({
                          onPlaySong, onClear, onStop, isPlaying, onExport,
                          onImport, onSave, onFork, isCurrentUserProject, title
                      }) => {
    const { username, avatar } = useAuth();

    return (
        <header className="bg-bg-darker flex items-center justify-between p-3 flex-shrink-0 w-full fixed z-2">
            {/* Lado Esquerdo: Logo, Navegação e Título */}
            <div className="flex items-center gap-6">
                <Link href="/feed" className="text-gray-400 hover:text-accent transition-colors" title="Voltar ao Feed">
                    <FontAwesomeIcon icon={faHouse} className="h-5 w-5 mb-1" />
                </Link>
                <Image src="/img/groover_logo.png" alt="Logo" width={50} height={50} />
                <h1 className="text-lg font-bold text-text-lighter">GROOVER</h1>

            </div>

            {/* Centro: Controles do Player e Ações */}
            <div className="flex items-center gap-2">
                <button title="Tocar Música Inteira" className="px-3 py-2 text-sm font-semibold rounded-md border-2 border-primary hover:bg-primary/30 transition" onClick={onPlaySong}>
                    <FontAwesomeIcon icon={isPlaying ? faPause : faPlay} className="mr-2" /> {isPlaying ? 'PAUSAR' : 'TOCAR MÚSICA'}
                </button>
                <button title="Parar" className="px-3 py-2 text-sm font-semibold rounded-md border-2 border-primary hover:bg-primary/30 transition" onClick={onStop}>
                    <FontAwesomeIcon icon={faStop} />
                </button>
                <button title="Limpar Página" className="px-3 py-2 text-sm font-semibold rounded-md border-2 border-primary text-yellow-500/80 border-yellow-500/50 hover:bg-yellow-500/20 transition" onClick={onClear}>
                    <FontAwesomeIcon icon={faEraser} className="mr-2" /> LIMPAR
                </button>
                <button className="px-3 py-2 text-sm font-semibold rounded-md border-2 border-accent hover:bg-accent/30 transition" onClick={onExport} title="Exportar MIDI">
                    <FontAwesomeIcon icon={faDownload} className="mr-2" /> EXPORTAR
                </button>
                <label className="px-3 py-2 text-sm font-semibold rounded-md border-2 border-accent hover:bg-accent/30 transition cursor-pointer" title="Importar MIDI">
                    <FontAwesomeIcon icon={faUpload} className="mr-2" /> IMPORTAR
                    <input type="file" className="hidden" accept=".mid, .midi" onChange={(e) => e.target.files && onImport(e.target.files[0])} />
                </label>

                {isCurrentUserProject ? (
                    <button className="px-3 py-2 text-sm font-semibold rounded-md bg-primary hover:bg-primary-light transition" onClick={onSave} title="Salvar Projeto">
                        <FontAwesomeIcon icon={faFloppyDisk} className="mr-2" /> SALVAR
                    </button>
                ) : (
                    <button className="px-3 py-2 text-sm font-semibold rounded-md bg-accent hover:bg-accent-light transition" onClick={onFork} title="Copiar projeto para seu perfil">
                        <FontAwesomeIcon icon={faCodeFork} className="mr-2" /> FORK
                    </button>
                )}
            </div>

            {/* Lado Direito: Perfil do Usuário */}
            <div className="flex items-center gap-3 text-right">
                <Link href={`/profile/${username}`} className="flex items-center gap-3 group">
                    <div>
                        <h3 className="font-semibold text-sm group-hover:text-accent transition-colors">{username}</h3>
                    </div>
                    <Image src={avatar} alt="Avatar" width={40} height={40} className="rounded-full border-2 border-primary group-hover:border-accent transition-colors" />
                </Link>
            </div>
        </header>
    );
};

export default HeaderEditor;