// src/app/logout/page.jsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LogoutPage() {
    const router = useRouter();

    useEffect(() => {
        const savedTheme = localStorage.getItem("theme");
        const savedLang = localStorage.getItem("lang");

        localStorage.clear();

        if (savedTheme) localStorage.setItem("theme", savedTheme);
        if (savedLang) localStorage.setItem("lang", savedLang);

        router.push("/login");
    }, [router]);

    return (
        <div className="flex items-center justify-center h-screen">
            <p>Fazendo logout...</p>
        </div>
    );
}
