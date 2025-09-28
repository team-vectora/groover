'use client';
import Image from 'next/image';
import { useEffect, useState} from "react";
import Link from 'next/link';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faPlay, faPause, faStop, faDownload, faUpload, faFloppyDisk,
    faUser, faMusic, faCodeFork, faHouse, faEraser, faSliders
} from "@fortawesome/free-solid-svg-icons";
import { useAuth } from '../../hooks';
import { useTranslation } from 'react-i18next';

const HeaderEditor = ({
    onPlaySong, onClear, onStop, isPlaying, onExport,
    onImport, onSave, onFork, isCurrentUserProject, title, setIsControlPanelOpen, isControlPanelOpen, setIsSequencerOpen, isSequencerOpen
}) => {
    const { username, avatar } = useAuth();
    const { t } = useTranslation();
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return (
<header className="bg-bg-darker flex flex-col md:flex-row items-center justify-between gap-3 md:gap-6 p-3 flex-shrink-0 w-full fixed z-20">

  <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-start">
    <Link href="/feed" className="text-gray-400 hover:text-accent transition-colors" title={t("header.backToFeed")}>
      <FontAwesomeIcon icon={faHouse} className="h-5 w-5 mb-1" />
    </Link>
    <Image src="/img/groover_logo.png" alt="Logo" width={40} height={40} />
  </div>

  {/* Center: Player Controls */}
  <div className="flex flex-wrap justify-center md:justify-start gap-2 w-full md:w-auto">
    {isMobile && (
      <>
        <button
          className="flex items-center px-3 py-2 text-xs md:text-sm font-semibold rounded-md border-2 border-primary hover:bg-primary/30 transition"
          onClick={() => setIsControlPanelOpen(true)}
          title="Abrir painel"
        >
          <FontAwesomeIcon icon={faSliders} className="mr-1" />
          <span className="hidden sm:inline">Painel</span>
        </button>

        <button
          className="flex items-center px-3 py-2 text-xs md:text-sm font-semibold rounded-md border-2 border-primary hover:bg-primary/30 transition"
          onClick={() => setIsSequencerOpen(true)}
          title="Abrir sequenciador"
        >
          <FontAwesomeIcon icon={faSliders} className="mr-1" />
          <span className="hidden sm:inline">{t("editor.sequencer.title")}</span>
        </button>
      </>
    )}
    <button
      title={t("header.playSong")}
      className="flex items-center px-3 py-2 text-xs md:text-sm font-semibold rounded-md border-2 border-primary hover:bg-primary/30 transition"
      onClick={onPlaySong}
    >
      <FontAwesomeIcon icon={isPlaying ? faPause : faPlay} className="mr-1" />
      <span className="hidden sm:inline">{isPlaying ? t("header.pause") : t("header.play")}</span>
    </button>

    <button
      title={t("header.stop")}
      className="px-3 py-2 text-xs md:text-sm font-semibold rounded-md border-2 border-primary hover:bg-primary/30 transition"
      onClick={onStop}
    >
      <FontAwesomeIcon icon={faStop} />
    </button>

    <button
      title={t("header.clearPage")}
      className="flex items-center px-3 py-2 text-xs md:text-sm font-semibold rounded-md border-2 border-yellow-500/50 text-yellow-500/80 hover:bg-yellow-500/20 transition"
      onClick={onClear}
    >
      <FontAwesomeIcon icon={faEraser} className="mr-1" />
      <span className="hidden sm:inline">{t("header.clear")}</span>
    </button>

    <button
      className="flex items-center px-3 py-2 text-xs md:text-sm font-semibold rounded-md border-2 border-accent hover:bg-accent/30 transition"
      onClick={onExport}
      title={t("header.exportMidi")}
    >
      <FontAwesomeIcon icon={faUpload} className="mr-1" />
      <span className="hidden sm:inline">{t("header.export")}</span>
    </button>

    <label
      className="flex items-center px-3 py-2 text-xs md:text-sm font-semibold rounded-md border-2 border-accent hover:bg-accent/30 transition cursor-pointer"
      title={t("header.importMidi")}
    >
      <FontAwesomeIcon icon={faDownload } className="mr-1" />
      <span className="hidden sm:inline">{t("header.import")}</span>
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
        title={t("header.saveProject")}
      >
        <FontAwesomeIcon icon={faFloppyDisk} className="mr-1" />
        <span className="hidden sm:inline">{t("header.save")}</span>
      </button>
    ) : (
      <button
        className="flex items-center px-3 py-2 text-xs md:text-sm font-semibold rounded-md bg-accent hover:bg-accent-light transition"
        onClick={onFork}
        title={t("header.forkProject")}
      >
        <FontAwesomeIcon icon={faCodeFork} className="mr-1" />
        <span className="hidden sm:inline">{t("header.fork")}</span>
      </button>
    )}
  </div>
  <div className="flex items-center gap-2 w-full md:w-auto justify-center md:justify-end">
    <Link href={`/profile/${username}`} className="flex items-center gap-2 group">
      <h3 className="font-semibold text-sm group-hover:text-accent transition-colors">{username}</h3>
        <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary group-hover:border-accent transition-colors">
          <Image
            src={avatar}
            alt="Avatar"
            width={160}   // coloque maior que o tamanho final
            height={160}  // idem
            className="object-cover w-full h-full"
          />
        </div>


    </Link>
  </div>


</header>
    );
};

export default HeaderEditor;
