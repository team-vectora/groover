'use client'
import '../../styles/global.css'
import { MidiProvider } from "../../contexts/MidiContext";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import Sidebar from "../../components/layout/Sidebar";
import PlayerWrapper from "../../components/layout/PlayerWrapper";

export default function RootLayout({ children }) {
  const pathname = usePathname();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && (pathname === '/login' || pathname === '/signup')) {
      window.location.href = '/feed';
    }
  }, [pathname]);

  return (
      <html lang="pt-BR">
      <body className="flex min-h-screen bg-[#0a090d] text-[#e6e8e3]">
      <MidiProvider>
        <Sidebar />
        <main className="flex-1 ml-64 p-4">
          {children}
        </main>
        <PlayerWrapper />
      </MidiProvider>
      </body>
      </html>
  );
}