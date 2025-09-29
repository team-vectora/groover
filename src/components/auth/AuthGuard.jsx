// src/components/auth/AuthGuard.jsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../hooks';
import { LoadingDisc } from '../';

const AuthGuard = ({ children }) => {
    const auth = useAuth();
    const router = useRouter();

    useEffect(() => {
        // Se não estiver carregando e não houver token, redireciona para o login.
        if (!auth.loading && !auth.userId) {
            router.push('/login');
        }
    }, [auth.loading, auth.userId, router]);

    // Enquanto o hook de autenticação está carregando, exibe um loader.
    if (auth.loading) {
        return <LoadingDisc />;
    }

    // Se houver um token, renderiza a página solicitada.
    if (auth.userId) {
        return <>{children}</>;
    }

    // Se não houver token (e o redirecionamento estiver em andamento), não renderiza nada.
    return null;
};

export default AuthGuard;