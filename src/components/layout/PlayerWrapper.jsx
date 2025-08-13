import { usePathname } from "next/navigation";
import MidiPlayer from "../posts/MidiPlayer";

const PlayerWrapper = () => {
    const pathname = usePathname();
    const hidePlayerRoutes = [
        "/login", "/signup", "/",
        "/controls", "/controls/view"
    ];

    const shouldHide = hidePlayerRoutes.includes(pathname) ||
        pathname?.startsWith("/controls/") ||
        pathname?.startsWith("/controls/view/");

    return !shouldHide && <MidiPlayer />;
};

export default PlayerWrapper;