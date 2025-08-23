"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import MidiPlayer from "./posts/MidiPlayer";

export default function MidiPlayerWrapper({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [showPlayer, setShowPlayer] = useState(false);

  useEffect(() => {
    const hidePlayerRoutes = [
      "/login",
      "/logon",
      "/signup",
      "/feed",
      "/",
      "/controls",
      "/controls/view",
    ];

    const shouldHide =
      hidePlayerRoutes.includes(pathname) ||
      pathname.startsWith("/controls/") ||
      pathname.startsWith("/controls/view/");

    setShowPlayer(!shouldHide);
  }, [pathname]);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token && (pathname === "/login" || pathname === "/signup")) {
      router.push("/feed");
    }

    const publicRoutes = ["/login", "/signup", "/"];
    if (!token && !publicRoutes.includes(pathname)) {
      router.push("/login");
    }
  }, [pathname, router]);

  return (
    <>
      {children}
      {showPlayer && <MidiPlayer />}
    </>
  );
}
