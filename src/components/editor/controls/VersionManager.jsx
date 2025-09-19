// src/components/editor/controls/VersionManager.jsx
"use client";
import { useTranslation } from "react-i18next";

const VersionManager = ({ versions, currentMusicId, handleVersionChange }) => {
    const { t } = useTranslation();

    const formatAPIDate = (dateString) => {
        if (!dateString) return t("invalid_date");
        try {
            const date = new Date(dateString);
            if (isNaN(date)) return t("invalid_date");
            return date.toLocaleString();
        } catch (error) {
            return t("invalid_date");
        }
    };

    // Ordena as versões da mais nova para a mais antiga
    const sortedVersions = versions.slice().sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
    const latestVersionId = sortedVersions.length > 0 ? sortedVersions[0].music_id : null;


    return (
        <div>
            <h3 className="text-sm font-bold uppercase text-accent mb-2">
                {t("versions")}
            </h3>
            <select
                name="versions"
                className="w-full p-2 bg-bg-secondary border border-primary rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                value={currentMusicId || ""}
                onChange={(e) => handleVersionChange(e.target.value)}
                disabled={!versions || versions.length === 0}
            >
                {sortedVersions.length > 0 ? (
                    sortedVersions.map((version) => (
                        <option key={version.music_id} value={version.music_id}>
                            {`${formatAPIDate(version.updated_at)} - ${version.update_by?.username || t("unknown_user")}`}
                            {latestVersionId === version.music_id ? ` (${t("current")})` : ""}
                        </option>
                    ))
                ) : (
                    <option value="" disabled>
                        {t("no_versions")}
                    </option>
                )}
            </select>
        </div>
    );
};

export default VersionManager;