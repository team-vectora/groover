"use client";
import './piano.css';



const TittleCaption = () => {
    const userData = {
        name: "Carlos Alberto",
        role: "Produtor Musical",
        avatar: "" 
    };
  return (
    <header className="app-header">
      <div className="header-logo-container">
        <div className="logo-circle"></div>
           <h1 className="header-logo-text">GROOVER</h1>
        </div>
      <div className="header-user-profile">
        <div className="header-user-info">

            <span className="header-user-name">{userData.name}</span>
            <span className="header-user-role">{userData.role}</span>
        </div>
      {/*Nao ta carregando para nao dar bug*/}
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