"use client";

const VersionsManager = ({
                             versions,
                             currentMusicId,
                             handleVersionChange,
                             t,
                             lastVersionId,
                             formatAPIDate
                         }) => {
    return (
        <div className="control-group">
            <h3>{t("versions")}</h3>
            <div className="control-item">
                <select
                    name="versions"
                    className="control-select"
                    value={currentMusicId}
                    onChange={(e) => handleVersionChange(e.target.value)}
                >
                    {versions.length > 0 ? (
                        versions.map((version) => (
                            <option key={version._id} value={version.music_id._id}>
                                {`${formatAPIDate(version.updated_at)} - ${
                                    version.update_by?.username || t("unknown_user")
                                }${
                                    lastVersionId === version.music_id._id ? " (Current)" : ""
                                }`}
                            </option>
                        ))
                    ) : (
                        <option disabled>{t("no_versions")}</option>
                    )}
                </select>
            </div>
        </div>
    );
};

export default VersionsManager;
