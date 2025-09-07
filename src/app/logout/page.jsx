// src/app/logout/page.jsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LogoutPage() {
    const router = useRouter();

    useEffect(() => {
        // Salva o tema atual
        const savedTheme = localStorage.getItem("theme");

        // Limpa todos os dados do localStorage
        localStorage.clear();

        // Restaura o tema
        if (savedTheme) localStorage.setItem("theme", savedTheme);

        // Redireciona para login
        router.push("/login");
    }, [router]);

    return (
        <div className="flex items-center justify-center h-screen">
            <p>Fazendo logout...</p>
        </div>
    );
}
