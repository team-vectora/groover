'use client'
import '../../styles/global.css'
import { Sidebar, PlayerWrapper, SimilarUsers } from "../../components";
import { useSimilarUsers, useAuth } from "../../hooks";

export default function RootLayout({ children }) {
  const { token, userId } = useAuth();
  const { similarUsers, loading: similarLoading } = useSimilarUsers(token);

  return (
    <div className="min-h-screen bg-[var(--color-background)] text-foreground">

      <div className="md:hidden flex flex-col">
        <div className="flex items-center justify-between p-2 w-full bg-transparent border-none">
          <Sidebar />
        </div>

        <main className="pt-16 px-2 py-4 flex justify-center">
          <div className="w-[95%]">{children}</div>
        </main>

        <div className="px-2 py-2 w-full">
          {similarLoading ? (
            <p className="text-center py-2">Carregando sugestões...</p>
          ) : (
            <SimilarUsers users={similarUsers} userId={userId} />
          )}
        </div>

        <div className="fixed bottom-0 left-0 w-full">
          <PlayerWrapper />
        </div>
      </div>

      <div className="hidden md:grid grid-cols-[1fr_250px_minmax(500px,850px)_400px_1fr] gap-5 min-h-screen">
        <div className="col-start-2 flex-shrink-0 sticky top-0 h-full bg-bg-secondary border-r border-primary-light/30 w-64">
          <Sidebar />
        </div>

        <main className="col-start-3 px-4 py-4 flex justify-center">
          <div className="w-full">{children}</div>
        </main>

        <PlayerWrapper />

        <div className="hidden xl:flex w-full flex-shrink-0 sticky top-24 h-fit">
          {similarLoading ? (
            <p className="text-center py-4">Carregando sugestões...</p>
          ) : (
            <SimilarUsers users={similarUsers} userId={userId} />
          )}
        </div>
      </div>
    </div>
  );
}
