"use client";
import './piano.css';

const TittleCaption = ({ onPlay, onExport, onImport, onSave }) => {
    const userData = {
        name: "Carlos Alberto",
        role: "Produtor Musical",
        avatar: "" 
    };
    
    return (
        <header className="app-header">
            <div className="header-logo-container">
                <h1 className="header-logo-text">GROOVER</h1>
            </div>
            <div className="header-user-profile">
              <div className="header-actions">
                <button className="header-button" onClick={onPlay}>▶ TOCAR </button>
                <button className="header-button" onClick={onExport}>↕ EXPORTAR </button>
                <button className="header-button import">
                    ↓ IMPORTAR
                    <input
                        type="file"
                        accept=".mid"
                        onChange={onImport}
                        style={{ display: 'none' }}
                    />
                </button>
                <button className="header-button">⎙ SALVAR </button>
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