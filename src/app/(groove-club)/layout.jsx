'use client'
import '../../styles/global.css'
import { usePathname } from "next/navigation";
import { Sidebar, PlayerWrapper, SimilarUsers } from "../../components";
import { useSimilarUsers, useAuth } from "../../hooks";

export default function RootLayout({ children }) {
  const { token, userId } = useAuth();
  const { similarUsers, loading: similarLoading } = useSimilarUsers(token);



  return (


        <div className="grid grid-cols-[1fr_250px_minmax(500px,850px)_400px_1fr] min-h-screen gap-5 bg-background text-foreground">
              {/* Sidebar */}
              <div className="col-start-2 flex-shrink-0 sticky top-0 h-full bg-bg-secondary border-r border-primary-light/30">
                  <Sidebar />
              </div>

              {/* Feed */}
              {/* Feed */}
              <main className="col-start-3 px-4 py-4 flex justify-center">
                  <div className="w-full">
                      {children}
                  </div>
              </main>

              {/* Player sempre fixo */}
              <PlayerWrapper />

              {/* Sugestões */}
              <div className="w-full flex-shrink-0 sticky top-24 h-fit">
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


  );
}