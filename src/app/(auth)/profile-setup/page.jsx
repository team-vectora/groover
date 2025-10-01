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
        console.log('Cookies', Cookies)

        const userId = Cookies.get('user_id');
        const userFromCookie = Cookies.get('username');
        console.log("userFrom cookie", userFromCookie);
        if (userId) {
            setUsername(userFromCookie);

            localStorage.setItem('username', userFromCookie);
            localStorage.setItem('id', userId);
        } else {
            router.push('/login');
        }
        setIsClient(true);
    }, [router]);

    const handleSuccessOrSkip = () => {
        Cookies.remove('username');
        Cookies.remove('user_id');
        router.push('/feed');
    }

    if (!isClient || !username) {
        return <LoadingDisc />;
    }

    return (
        <div className="w-full flex flex-col items-center justify-center text-center">
            <h1 className="text-3xl font-bold text-accent-light mb-2">{t('profileSetup.title')}</h1>
            <p className="text-foreground mb-6">{t('profileSetup.subtitle')}</p>
            <ConfigUserPopUp
                open={true}
                onClose={() => {}}
                username={username}
                onSuccess={handleSuccessOrSkip}
                isOnboarding={true}
                onSkip={handleSuccessOrSkip}
            />
        </div>
    );
}