"use client";

import Image from "next/image";

export default function Home() {
  return (
    <div
      style={{
        position: "relative",
        width: "500px",
        height: "500px",
        margin: "auto",
        marginTop: "10vh",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(10%, -50%)",
          zIndex: 1,
          animation: "spin 4s linear infinite",
        }}
      >
        <Image
          src="/img/disco-groove(1).png"
          alt="Disco"
          width={550}
          height={550}
          quality={100}
        />
      </div>

      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 2,
        }}
      >
        <Image
          src="/img/groove_capa(1).png"
          alt="Capa"
          width={500}
          height={500}
          quality={100}
          style={{
            boxShadow: "0 10px 25px rgba(0, 0, 0, 0.4)",
            borderRadius: "8px",
          }}
        />
        
      </div>
      <div>
        

      **Groover** é uma plataforma digital que **democratiza a criação musical**, tornando-a acessível para qualquer usuário, desde iniciantes até profissionais.

Com uma interface intuitiva e recursos poderosos, permite:
      </div>

      <style jsx>{`
        @keyframes spin {
          0% {
            transform: translate(10%, -50%) rotate(0deg);
          }
          100% {
            transform: translate(10%, -50%) rotate(360deg);
          }
        }
      `}</style>
    </div>
    
  );
}
