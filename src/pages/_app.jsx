import '../global.css';

import { MidiProvider } from "../contexts/MidiContext";
import MidiPlayer from "../components/MidiPlayer";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";

export default function MyApp({ Component, pageProps }) {
  const router = useRouter();
  const [showPlayer, setShowPlayer] = useState(false);

  useEffect(() => {
    const hidePlayerRoutes = ["/login", "/logon", "/", "/editor", "/editor/view"];

    const shouldHide = hidePlayerRoutes.includes(router.pathname) ||
      router.pathname.startsWith("/editor/") ||
      router.pathname.startsWith("/editor/view/");

    setShowPlayer(!shouldHide);
  }, [router.pathname]);

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (token && (router.pathname === '/login' || router.pathname === '/logon')) {
      router.replace('/feed');
    }
  }, [router.pathname]);

  return (
    <MidiProvider>
      <Component {...pageProps} />
      {showPlayer && <MidiPlayer />}
    </MidiProvider>
  );
}
