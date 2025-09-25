// src/app/(auth)/profile-setup/page.jsx
'use client';
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ConfigUserPopUp, LoadingDisc } from "../../../components";
import { useTranslation } from "react-i18next";
import Cookies from 'js-cookie';

export default function ProfileSetupPage() {
    const router = useRouter();
    const { t } = useTranslation();
    const [isClient, setIsClient] = useState(false);
    const [username, setUsername] = useState(null);

    useEffect(() => {
        // Lemos o username do cookie definido pelo backend após a confirmação de e-mail
        const userFromCookie = Cookies.get('username');
        if (userFromCookie) {
            setUsername(userFromCookie);
            // Sincroniza com localStorage para consistência com o resto da aplicação
            localStorage.setItem('username', userFromCookie);
            localStorage.setItem('id', Cookies.get('id'));
            localStorage.setItem('avatar', Cookies.get('avatar'));
        } else {
            // Se não houver cookie, talvez o usuário tenha chegado aqui por engano
            router.push('/login');
        }
        setIsClient(true);
    }, [router]);

    const handleSuccessOrSkip = () => {
        // Limpa os cookies de informação, pois o localStorage já foi atualizado
        Cookies.remove('username');
        Cookies.remove('id');
        Cookies.remove('avatar');
        router.push('/feed');
    };

    if (!isClient || !username) {
        return <LoadingDisc />;
    }

    return (
        <div className="w-full flex flex-col items-center justify-center text-center">
            <h1 className="text-3xl font-bold text-accent-light mb-2">{t('profileSetup.title')}</h1>
            <p className="text-foreground mb-6">{t('profileSetup.subtitle')}</p>
            <ConfigUserPopUp
                open={true}
                onClose={() => {}} // Não permitir fechar
                username={username}
                onSuccess={handleSuccessOrSkip}
                isOnboarding={true}
                onSkip={handleSuccessOrSkip}
            />
        </div>
    );
}