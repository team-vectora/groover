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
<header className="bg-bg-darker flex flex-col md:flex-row items-center justify-between gap-3 md:gap-6 p-3 flex-shrink-0 w-full fixed z-20">
  {/* Lado Esquerdo: Logo + Home */}
  <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-start">
    <Link href="/feed" className="text-gray-400 hover:text-accent transition-colors" title="Voltar ao Feed">
      <FontAwesomeIcon icon={faHouse} className="h-5 w-5 mb-1" />
    </Link>
    <Image src="/img/groover_logo.png" alt="Logo" width={40} height={40} />
  </div>

  {/* Centro: Controles do Player */}
  <div className="flex flex-wrap justify-center md:justify-start gap-2 w-full md:w-auto">
    <button
      title="Tocar Música Inteira"
      className="flex items-center px-3 py-2 text-xs md:text-sm font-semibold rounded-md border-2 border-primary hover:bg-primary/30 transition"
      onClick={onPlaySong}
    >
      <FontAwesomeIcon icon={isPlaying ? faPause : faPlay} className="mr-1" />
      <span className="hidden sm:inline">{isPlaying ? 'PAUSAR' : 'TOCAR'}</span>
    </button>

    <button
      title="Parar"
      className="px-3 py-2 text-xs md:text-sm font-semibold rounded-md border-2 border-primary hover:bg-primary/30 transition"
      onClick={onStop}
    >
      <FontAwesomeIcon icon={faStop} />
    </button>

    <button
      title="Limpar Página"
      className="flex items-center px-3 py-2 text-xs md:text-sm font-semibold rounded-md border-2 border-yellow-500/50 text-yellow-500/80 hover:bg-yellow-500/20 transition"
      onClick={onClear}
    >
      <FontAwesomeIcon icon={faEraser} className="mr-1" />
      <span className="hidden sm:inline">LIMPAR</span>
    </button>

    <button
      className="flex items-center px-3 py-2 text-xs md:text-sm font-semibold rounded-md border-2 border-accent hover:bg-accent/30 transition"
      onClick={onExport}
      title="Exportar MIDI"
    >
      <FontAwesomeIcon icon={faDownload} className="mr-1" />
      <span className="hidden sm:inline">EXPORTAR</span>
    </button>

    <label
      className="flex items-center px-3 py-2 text-xs md:text-sm font-semibold rounded-md border-2 border-accent hover:bg-accent/30 transition cursor-pointer"
      title="Importar MIDI"
    >
      <FontAwesomeIcon icon={faUpload} className="mr-1" />
      <span className="hidden sm:inline">IMPORTAR</span>
      <input
        type="file"
        className="hidden"
        accept=".mid, .midi"
        onChange={(e) => e.target.files && onImport(e.target.files[0])}
      />
    </label>

    {isCurrentUserProject ? (
      <button
        className="flex items-center px-3 py-2 text-xs md:text-sm font-semibold rounded-md bg-primary hover:bg-primary-light transition"
        onClick={onSave}
        title="Salvar Projeto"
      >
        <FontAwesomeIcon icon={faFloppyDisk} className="mr-1" />
        <span className="hidden sm:inline">SALVAR</span>
      </button>
    ) : (
      <button
        className="flex items-center px-3 py-2 text-xs md:text-sm font-semibold rounded-md bg-accent hover:bg-accent-light transition"
        onClick={onFork}
        title="Copiar projeto para seu perfil"
      >
        <FontAwesomeIcon icon={faCodeFork} className="mr-1" />
        <span className="hidden sm:inline">FORK</span>
      </button>
    )}
  </div>

  {/* Lado Direito: Perfil */}
  <div className="flex items-center gap-2 w-full md:w-auto justify-center md:justify-end">
    <Link href={`/profile/${username}`} className="flex items-center gap-2 group">
      <h3 className="font-semibold text-sm group-hover:text-accent transition-colors">{username}</h3>
      <Image src={avatar} alt="Avatar" width={32} height={32} className="rounded-full border-2 border-primary group-hover:border-accent transition-colors" />
    </Link>
  </div>
</header>

    );
};

export default HeaderEditor;