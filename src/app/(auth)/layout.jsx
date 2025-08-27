'use client';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Image from 'next/image';
import { MusicNotesDetail } from '../../components'; // caminho relativo correto

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 sm:p-6 md:p-8">
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />

      <header className="fixed top-0 left-0 w-full bg-background shadow-md z-50">
        <div className="w-full max-w-6xl flex justify-between items-center mx-auto py-4 px-2 sm:px-0">
          <div className="flex items-center space-x-3">
            <Image src="/img/groover_logo.png" alt="Logo" width={90} height={70} />
            <span className="text-2xl sm:text-3xl font-bold">GrooveClub</span>
          </div>
          <nav className="space-x-4 text-sm sm:text-base">
            <a href="/login" className="text-primary hover:text-primary-light transition">Entrar</a>
            <a href="/signup" className="text-accent font-semibold hover:text-accent-light transition">Criar Conta</a>
          </nav>
        </div>
      </header>

        <main className="w-full flex justify-center pt-20 relative z-20">
        {children}
        <MusicNotesDetail />
      </main>
    </div>
  );
}
