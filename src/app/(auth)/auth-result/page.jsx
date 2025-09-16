'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import { Suspense } from 'react';

function AuthResultContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { t } = useTranslation();
    const status = searchParams.get('status');

    let title, message, icon;

    switch (status) {
        case 'success':
            title = t('authResult.success.title');
            message = t('authResult.success.message');
            icon = '✅';
            break;
        case 'expired':
            title = t('authResult.expired.title');
            message = t('authResult.expired.message');
            icon = '⌛️';
            break;
        default:
            title = t('authResult.error.title');
            message = t('authResult.error.message');
            icon = '❌';
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4 text-center">
            <div className="w-full max-w-md bg-bg-secondary rounded-3xl p-8 shadow-lg">
                <div className="text-6xl mb-6">{icon}</div>
                <h1 className="text-3xl font-bold text-accent-light mb-4">{title}</h1>
                <p className="text-foreground mb-8">{message}</p>
                <Link href="/login" className="px-6 py-3 bg-primary hover:bg-primary-light text-white font-semibold rounded-lg transition">
                    {t('authResult.loginButton')}
                </Link>
            </div>
        </div>
    );
}

export default function AuthResultPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <AuthResultContent />
        </Suspense>
    );
}