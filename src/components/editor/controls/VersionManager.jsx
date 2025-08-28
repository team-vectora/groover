"use client";

const VersionManager = ({
                            versions,
                            currentMusicId,
                            handleVersionChange,
                            t,
                            lastVersionId,
                        }) => {
    // Encapsulando a formatação de data dentro do componente
    const formatAPIDate = (dateString) => {
        if (!dateString) return "Data inválida";
        try {
            const date = new Date(dateString.replace("GMT", ""));
            if (isNaN(date)) return "Data inválida";

            const day = date.getDate().toString().padStart(2, '0');
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const hours = date.getHours().toString().padStart(2, '0');
            const minutes = date.getMinutes().toString().padStart(2, '0');

            return `${day}/${month} ${hours}:${minutes}`;
        } catch (error) {
            return "Data inválida";
        }
    };

    return (
        <div>
            <h3 className="text-sm font-bold uppercase text-accent mb-2">{t("versions")}</h3>
            <select
                name="versions"
                className="w-full p-2 bg-bg-secondary border border-primary rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                value={currentMusicId}
                onChange={(e) => handleVersionChange(e.target.value)}
                disabled={!versions || versions.length === 0}
            >
                {versions && versions.length > 0 ? (
                    versions.map((version) => (
                        <option key={version._id} value={version.music_id._id}>
                            {`${formatAPIDate(version.updated_at)} - ${version.update_by?.username || t("unknown_user")}`}
                            {lastVersionId === version.music_id._id ? " (Atual)" : ""}
                        </option>
                    ))
                ) : (
                    <option disabled>{t("no_versions")}</option>
                )}
            </select>
        </div>
    );
};

export default VersionManager;
