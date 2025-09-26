'use client';
import { useContext } from "react";
import { MidiContext } from "../../../contexts/MidiContext";
import { Post } from "../../../components";
import { useAuth, usePosts } from "../../../hooks/";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useTranslation } from "react-i18next";

const LivecodePage = () => {
  const { t } = useTranslation();
  const { token } = useAuth();
  const { posts, loading, error } = usePosts();
  const { setCurrentProject } = useContext(MidiContext);

  return (
    <div className="flex flex-col gap-10 w-full px-4 md:px-8 py-8 max-w-6xl mx-auto">
      {/* Seção de Livecode Song */}
      <section className="bg-zinc-900 text-white rounded-2xl shadow-lg p-6 md:p-8 animate-fade-in">
        <h2 className="text-2xl md:text-3xl font-bold mb-4">🎵 {t('livecode.title')}</h2>
        <p className="text-zinc-300 mb-6 md:text-lg">
          {t('livecode.description.part1')}{" "}
          <a
            href="https://strudel.cc"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:underline"
          >
            Strudel
          </a>
          {t('livecode.description.part2')}
        </p>

        <div className="flex justify-center">
          <iframe
            src="https://strudel.cc/?xwWRfuCE8TAR"
            width="100%"
            height="300"
            className="rounded-xl border border-zinc-700 shadow-md"
          ></iframe>
        </div>
      </section>



      <ToastContainer />
    </div>
  );
};

export default LivecodePage;
