'use client';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Image from 'next/image';
import { MusicNotesDetail } from '../../components';
import LanguageSwitcher from '../../components/layout/LanguageSwitcher';
import { useTranslation } from 'react-i18next';

export default function AuthLayout({ children }) {
    const { t } = useTranslation();

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
                <div className="w-full max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center py-4 px-2 sm:px-0 gap-4 md:gap-0">
                    <div className="flex items-center justify-center md:justify-start space-x-3">
                        <Image src="/img/groover_logo.png" alt="Logo" width={90} height={70} />
                        <span className="text-2xl sm:text-3xl font-bold">Groover</span>
                    </div>
                    <nav className="w-full flex flex-col md:flex-row items-center md:items-center justify-center md:justify-end gap-2 md:gap-4">
                      <div className="flex w-full md:w-auto gap-2">
                        <a
                          href="/login"
                          className="flex-1 md:flex-none px-3 py-2 bg-primary/20 hover:bg-primary/40 text-primary rounded-lg font-medium text-center transition"
                        >
                          {t('authLayout.login')}
                        </a>
                        <a
                          href="/signup"
                          className="flex-1 md:flex-none px-3 py-2 bg-accent/20 hover:bg-accent/40 text-accent font-semibold rounded-lg text-center transition"
                        >
                          {t('authLayout.signup')}
                        </a>
                      </div>

                      {/* LanguageSwitcher abaixo no mobile, inline no desktop */}
                      <div className="mt-2 md:mt-0">
                        <LanguageSwitcher />
                      </div>
                    </nav>

                </div>
            </header>

            <main className="w-full flex flex-col items-center justify-center pt-28 md:pt-20 relative z-20">
                {children}
                <MusicNotesDetail />
            </main>
        </div>
    );
}
