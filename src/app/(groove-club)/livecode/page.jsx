'use client';
import { useContext } from "react";
import { MidiContext } from "../../../contexts/MidiContext";
import { Post } from "../../../components";
import { useAuth, usePosts } from "../../../hooks/";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const FeedPage = () => {
  const { token, userId } = useAuth();
  const { posts, loading, error, refetch } = usePosts(token);
  const { setCurrentProject } = useContext(MidiContext);

  return (
    <div className="flex flex-col gap-10 w-full">
      {/* Seção de Livecode Song */}
      <section className="bg-zinc-900 text-white rounded-2xl shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-3">🎵 Livecode Song</h2>
        <p className="text-zinc-300 mb-6">
          Aqui você pode experimentar música **ao vivo** com código!
          O player abaixo usa o{" "}
          <a
            href="https://strudel.cc"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:underline"
          >
            Strudel
          </a>,
          uma ferramenta de livecoding para criar batidas, melodias e loops em tempo real.
        </p>

        <div className="flex justify-center">
          <iframe
            src="https://strudel.cc/?xwWRfuCE8TAR"
            width="600"
            height="300"
            className="rounded-xl border border-zinc-700 shadow-md"
          ></iframe>
        </div>
      </section>

      {/* Conteúdo principal do feed */}
      <div className="flex-1 w-full">
        {/* Aqui entrariam os posts */}
      </div>
    </div>
  );
};

export default FeedPage;
