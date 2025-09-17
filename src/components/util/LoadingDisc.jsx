'use client';
import Image from "next/image";
import { useTranslation } from "react-i18next";

const LoadingDisc = () => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center py-10">
      <div className="relative w-28 h-28">
        <div className="w-28 h-28 rounded-full overflow-hidden shadow-2xl animate-spin
                        border-4 border-[var(--color-accent-light)] border-t-[var(--color-foreground)]">
          <Image
            src="/img/disco-groove(1).png"
            alt="Disco girando"
            width={112}
            height={112}
            className="rounded-full"
          />
        </div>

        <div className="absolute top-0 left-0 w-full h-full rounded-full bg-[var(--color-foreground)] opacity-10 animate-pulse"></div>
      </div>

      <span
        className="mt-4 text-3xl font-bold text-transparent bg-clip-text inline-block"
        style={{
          backgroundImage: `linear-gradient(90deg, var(--color-accent), var(--color-accent-light), var(--color-primary-light), var(--color-accent))`,
          backgroundSize: "300% 100%",
          animation: "gradient 2s linear infinite",
        }}
      >
        {t('feed.loading')}
      </span>
    </div>
  );
};

export default LoadingDisc;
