"use client";

import { useTranslation } from "react-i18next";

const VersionManager = ({
    versions,
    currentMusicId,
    handleVersionChange,
    lastVersionId,
}) => {
    const { t } = useTranslation();

    // Função para formatar datas vindas da API
    const formatAPIDate = (dateString) => {
        if (!dateString) return t("invalid_date");
        try {
            const date = new Date(dateString.replace("GMT", ""));
            if (isNaN(date)) return t("invalid_date");

            const day = date.getDate().toString().padStart(2, "0");
            const month = (date.getMonth() + 1).toString().padStart(2, "0");
            const hours = date.getHours().toString().padStart(2, "0");
            const minutes = date.getMinutes().toString().padStart(2, "0");

            return `${day}/${month} ${hours}:${minutes}`;
        } catch (error) {
            return t("invalid_date");
        }
    };

    return (
        <div>
            <h3 className="text-sm font-bold uppercase text-accent mb-2">
                {t("versions")}
            </h3>
            <select
                name="versions"
                className="w-full p-2 bg-bg-secondary border border-primary rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                value={currentMusicId}
                onChange={(e) => handleVersionChange(e.target.value)}
                disabled={!versions || versions.length === 0}
            >
                {versions && versions.length > 0 ? (
                    versions.map((version, index) => (
                        <option
                            key={`${version._id ?? index}-${version.music_id?._id ?? index}`}
                            value={version.music_id?._id ?? ""}
                        >
                            {`${formatAPIDate(version.updated_at)} - ${
                                version.update_by?.username || t("unknown_user")
                            }`}
                            {lastVersionId === version.music_id?._id ? ` (${t("current")})` : ""}
                        </option>
                    ))
                ) : (
                    <option key="no-versions" disabled>
                        {t("no_versions")}
                    </option>
                )}
            </select>
        </div>
    );
};

export default VersionManager;
