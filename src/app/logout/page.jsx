// src/app/logout/page.jsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LogoutPage() {
    const router = useRouter();

    useEffect(() => {
        // Limpa os dados do localStorage
        localStorage.clear();

        // Redireciona para a página de login após limpar os dados
        router.push("/login");
    }, [router]);

    return (
        <div className="flex items-center justify-center h-screen">
            <p>Fazendo logout...</p>
        </div>
    );
}