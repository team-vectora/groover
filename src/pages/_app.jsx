import '../global.css';
import './editor.css';
import './login.css';
import '../components/piano.css';
import './profile.css';
import './feed.css';
import { MidiProvider } from "../contexts/MidiContext";
import MidiPlayer from "../components/MidiPlayer";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";

export default function MyApp({ Component, pageProps }) {
  const router = useRouter();
  const [showPlayer, setShowPlayer] = useState(false);

  useEffect(() => {
    const hidePlayerRoutes = ["/login", "/logon", "/editor"];
    setShowPlayer(!hidePlayerRoutes.includes(router.pathname));
  }, [router.pathname]);

  return (
    <MidiProvider>
      <Component {...pageProps} />
      {showPlayer && <MidiPlayer />}
    </MidiProvider>
  );
}
