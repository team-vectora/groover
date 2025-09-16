"use client";

import Image from "next/image";
import Link from "next/link";
import LanguageSwitcher from "../components/layout/LanguageSwitcher"; // Importe o componente
import { useTranslation } from "react-i18next";

export default function Home() {
  const { t } = useTranslation();
  return (
      <div className="w-full min-h-screen bg-background text-foreground relative overflow-x-hidden lg:max-h-screen">
        <div className="absolute top-4 right-4 z-30" style={{zIndex: 30}}>
          <LanguageSwitcher />
        </div>
        {/* Círculos de fundo mantidos, mas com tamanho reduzido para não interferir no layout */}
        <div className="absolute lg:w-0 bottom-[-300px] left-[-200px] w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,var(--primary-light)_0%,transparent_70%)] opacity-10 z-10 animate-float-reverse"></div>

        <main className="relative px-4 py-16 sm:px-8 lg:max-h-screen">
          <div className="flex flex-col lg:grid lg:grid-cols-2 gap-16 items-center w-full max-w-7xl mx-auto">

            {/* Seção da Imagem */}
            <div className="relative flex h-[400px] w-full max-w-lg items-center justify-center lg:h-[600px] lg:max-w-none">
              <div className="z-10 -mr-24 animate-spin-slow drop-shadow-[0_0_15px_rgba(169,127,82,0.3)] lg:absolute lg:left-1/2 lg:top-1/2 lg:-translate-x-[-10%] lg:-translate-y-1/2 lg:mr-0">
                <Image
                    src="/img/disco-groove(1).png"
                    alt="Disco"
                    width={600}
                    height={600}
                    quality={100}
                    className="w-[300px] lg:w-[600px]"
                />
              </div>
              <div className="z-20 lg:absolute lg:left-1/2 lg:top-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2">
                <Image
                    src="/img/groove_capa(1).png"
                    alt="Capa"
                    width={500}
                    height={500}
                    quality={100}
                    className="w-[250px] rounded-xl border border-[rgba(169,127,82,0.3)] shadow-2xl lg:w-[500px]"
                />
                <div className="absolute top-0 left-0 -z-10 h-full w-full rounded-xl bg-[radial-gradient(circle_at_center,rgba(169,127,82,0.2)_0%,transparent_70%)] animate-pulse-slow"></div>
              </div>
            </div>

            {/* Seção de Texto */}
            <div className="flex flex-col gap-8 items-center lg:items-start">
              <p className="text-lg text-[rgba(230,232,227,0.8)] leading-relaxed text-center lg:text-left">
                {t('home.description')}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4 w-full">
                <div className="bg-[rgba(18,17,19,0.6)] border border-[rgba(76,78,48,0.3)] rounded-xl p-6 transition-all duration-300 backdrop-blur-lg hover:-translate-y-1.5 hover:border-accent hover:shadow-[0_10px_20px_-10px_rgba(169,127,82,0.2)]">
                  <div className="text-3xl mb-3">🎼</div>
                  <h3 className="text-lg font-bold text-accent-light mb-2">{t('home.features.midi.title')}</h3>
                  <p className="text-sm text-[rgba(230,232,227,0.7)]">{t('home.features.midi.description')}</p>
                </div>
                <div className="bg-[rgba(18,17,19,0.6)] border border-[rgba(76,78,48,0.3)] rounded-xl p-6 transition-all duration-300 backdrop-blur-lg hover:-translate-y-1.5 hover:border-accent hover:shadow-[0_10px_20px_-10px_rgba(169,127,82,0.2)]">
                  <div className="text-3xl mb-3">🌎</div>
                  <h3 className="text-lg font-bold text-accent-light mb-2">{t('home.features.collaboration.title')}</h3>
                  <p className="text-sm text-[rgba(230,232,227,0.7)]">{t('home.features.collaboration.description')}</p>
                </div>
                <div className="bg-[rgba(18,17,19,0.6)] border border-[rgba(76,78,48,0.3)] rounded-xl p-6 transition-all duration-300 backdrop-blur-lg hover:-translate-y-1.5 hover:border-accent hover:shadow-[0_10px_20px_-10px_rgba(169,127,82,0.2)]">
                  <div className="text-3xl mb-3">🔗</div>
                  <h3 className="text-lg font-bold text-accent-light mb-2">{t('home.features.sharing.title')}</h3>
                  <p className="text-sm text-[rgba(230,232,227,0.7)]">{t('home.features.sharing.description')}</p>
                </div>
                <div className="bg-[rgba(18,17,19,0.6)] border border-[rgba(76,78,48,0.3)] rounded-xl p-6 transition-all duration-300 backdrop-blur-lg hover:-translate-y-1.5 hover:border-accent hover:shadow-[0_10px_20px_-10px_rgba(169,127,82,0.2)]">
                  <div className="text-3xl mb-3">📱</div>
                  <h3 className="text-lg font-bold text-accent-light mb-2">{t('home.features.multiplatform.title')}</h3>
                  <p className="text-sm text-[rgba(230,232,227,0.7)]">{t('home.features.multiplatform.description')}</p>
                </div>
              </div>
              <div className="flex w-full justify-center items-center gap-4 mt-4">
                <Link href="/login" className="cta-button w-full sm:w-auto text-center group">
                  {t('home.login')}
                  <span className="arrow transition-transform duration-300 group-hover:translate-x-1">→</span>
                </Link>
                <Link href="/signup" className="cta-button w-full sm:w-auto text-center group">
                  {t('home.signup')}
                  <span className="arrow transition-transform duration-300 group-hover:translate-x-1">→</span>
                </Link>
              </div>
            </div>

          </div>
        </main>
      </div>
  );
}