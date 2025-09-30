'use client';

import { AuthGuard } from '../../components';

export default function PrivateLayout({ children }) {
    // Este layout aplica o guardião de autenticação a todas as rotas
    // filhas, como /feed, /profile, /editor, etc.
    return <AuthGuard>{children}</AuthGuard>;
}