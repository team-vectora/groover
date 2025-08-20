'use client'
import '../../styles/global.css'
import { MidiProvider } from "../../contexts/MidiContext";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { Sidebar, PlayerWrapper, SimilarUsers } from "../../components";
import { useSimilarUsers, useAuth } from "../../hooks";

export default function RootLayout({ children }) {
  const pathname = usePathname();
  const { token, userId } = useAuth();
  const { similarUsers, loading: similarLoading } = useSimilarUsers(token);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && (pathname === '/login' || pathname === '/signup')) {
      window.location.href = '/feed';
    }
  }, [pathname]);

  return (
      <html lang="pt-BR">
      <body className="bg-[#0a090d] text-[#e6e8e3] min-h-screen">
      <MidiProvider>
          <div className="grid grid-cols-[1fr_250px_minmax(500px,1000px)_300px_1fr] min-h-screen gap-5">
              {/* Sidebar */}
              <div className="col-start-2 flex-shrink-0 sticky top-0 h-full bg-[#121113] border-r border-[#4c4e30]">
                  <Sidebar />
              </div>

              {/* Feed */}
              {/* Feed */}
              <main className="col-start-3 px-4 py-4 flex justify-center">
                  <div className="max-w-4xl">
                      {children}
                  </div>
              </main>

              {/* Player sempre fixo */}
              <PlayerWrapper />

              {/* Sugestões */}
              <div className="w-80 flex-shrink-0 sticky top-24 h-fit">
                  {similarLoading ? (
                      <p className="text-center py-4">Carregando sugestões...</p>
                  ) : (
                      <SimilarUsers
                          users={similarUsers}
                          userId={userId}
                      />
                  )}
              </div>
          </div>
      </MidiProvider>
      </body>
      </html>
  );
}