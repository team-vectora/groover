'use client' // Necessário porque usamos hooks e contextos

import '../styles/global.css'
import { MidiProvider } from "../contexts/MidiContext";
import MidiPlayer from "../components/posts/MidiPlayer";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

export default function RootLayout({ children }) {
    const pathname = usePathname();
    const [showPlayer, setShowPlayer] = useState(false);

    useEffect(() => {
        const hidePlayerRoutes = [
            "/login",
            "/logon",
            "/signup",
            "/",
            "/controls",
            "/controls/view"
        ];

        const shouldHide = hidePlayerRoutes.includes(pathname) ||
            pathname.startsWith("/controls/") ||
            pathname.startsWith("/controls/view/");

        setShowPlayer(!shouldHide);
    }, [pathname]);

    useEffect(() => {
        const token = localStorage.getItem('token');

        if (token && (pathname === '/login' || pathname === '/signup')) {
            window.location.href = '/feed'; // Usamos window.location pois o router.push não está disponível no layout
        }
    }, [pathname]);

    return (
        <html lang="pt-BR">
        <body>
        <MidiProvider>
            {children}
            {showPlayer && <MidiPlayer />}
        </MidiProvider>
        </body>
        </html>
    );
}