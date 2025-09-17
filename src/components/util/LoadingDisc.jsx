'use client';
import Image from "next/image";
import { useTranslation } from "react-i18next";

const LoadingDisc = () => {
    const { t } = useTranslation();

    return (
        <div className="flex flex-col items-center py-10">
            <div className="relative w-28 h-28">
                <div className="w-28 h-28 rounded-full overflow-hidden shadow-2xl animate-spin
                                border-4 border-accent-light border-t-foreground">
                    <Image
                        src="/img/disco-groove(1).png"
                        alt="Disco girando"
                        width={112}
                        height={112}
                        className="rounded-full"
                    />
                </div>

                <div className="absolute top-0 left-0 w-full h-full rounded-full bg-foreground opacity-10 animate-pulse"></div>
            </div>

            <p className="mt-4 text-foreground font-medium">{t('feed.loading')}</p>
        </div>
    );
};

export default LoadingDisc;
