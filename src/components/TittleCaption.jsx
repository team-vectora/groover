"use client";
import Image from 'next/image';

const TittleCaption = ({ onPlaySong, onPlayActivePage, onExport, onImport, onSave, t, setLang, lang }) => {
  const userData = {
    name: "Carlos Alberto",
    role: "Produtor Musical",
    avatar: "" 
  };
  
  return (
    <header className="app-header">
      <div className="header-logo-container">
        <Image src="/img/groover_logo.png" alt="Logo" width={100} height={200} />
        <h1 className="header-logo-text">GROOVER</h1>
      </div>
      <div className="header-user-profile">
        <div className="header-actions">
          <button className="header-button" onClick={onPlaySong}>
            ▶ {t("playSong") /* exemplo: "TOCAR MÚSICA" */}
          </button>
          <button className="header-button" onClick={onPlayActivePage}>
            ▶ {t("playPage") /* exemplo: "TOCAR PÁGINA" */}
          </button>
          <button className="header-button" onClick={onExport}>
            ↕ {t("export")}
          </button>
          <label className="header-button import">
            ↓ {t("import")}
            <input
              type="file"
              accept=".mid"
              onChange={onImport}
              style={{ display: 'none' }}
            />
          </label>
          <button className="header-button" onClick={onSave}>
            ⎙ {t("save")}
          </button>
        </div>
        <div className="language-switcher">
          <button
              className="header-button"
              onClick={() => setLang(lang === "pt" ? "en" : "pt")}
              aria-label="Switch Language"
              title={lang === "pt" ? "Switch to English" : "Mudar para Português"}
          >
            {lang === "pt" ? "🇧🇷" : "🇺🇸"}
          </button>
        </div>
        <div className="header-user-info">
          <span className="header-user-name">{userData.name}</span>
          <span className="header-user-role">{userData.role}</span>
        </div>
        {userData.avatar && (
          <img 
            src={userData.avatar} 
            alt="Avatar"
            className="header-user-avatar"
          />
        )}
      </div>
    </header>
  );
};

export default TittleCaption;
