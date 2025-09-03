"use client";

import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="modern-container">
      <div className="hero-section">
        {/* Animated background elements */}
        <div className="bg-accent-circle"></div>
        <div className="bg-primary-circle"></div>

        <div className="content-grid">
          {/* Image section with enhanced effects */}
          <div className="image-container">
            <div className="disco-container">
              <Image
                src="/img/disco-groove(1).png"
                alt="Disco"
                width={600}
                height={600}
                quality={100}
                className="disco-image"
              />
            </div>
            <div className="album-container">
              <Image
                src="/img/groove_capa(1).png"
                alt="Capa"
                width={500}
                height={500}
                quality={100}
                className="album-image"
              />
              <div className="album-glow"></div>
            </div>
          </div>


          <div className="text-content">

            <h1>
              <span className="gradient-text">Groover</span> revoluciona
              <br />a criação musical
            </h1>

            <p className="lead-text">
              A plataforma que <strong>democratiza</strong> a produção de música,
              oferecendo ferramentas <strong>profissionais</strong> em uma
              interface <strong>acessível</strong> para todos.
            </p>

            <div className="features-grid">
                <div className="feature-card">
                  <div className="feature-icon">🎼</div>
                  <h3>Editor MIDI Visual</h3>
                  <p>Edite notas, velocidades e instrumentos em uma interface intuitiva</p>
                </div>
              <div className="feature-card">
                <div className="feature-icon">🌎</div>
                <h3>Colaboração Global</h3>
                <p>Conecte-se com artistas worldwide</p>
              </div>
                <div className="feature-card">
                  <div className="feature-icon">🔗</div>
                  <h3>Compartilhamento Fácil</h3>
                  <p>Gere links para enviar seus projetos a colegas rapidamente</p>
                </div>

              <div className="feature-card">
                <div className="feature-icon">📱</div>
                <h3>Multiplataforma</h3>
                <p>Use em dispositvos moveis e PCs</p>
              </div>
            </div>

    <div className="flex justify-center items-center gap-4">
      <Link href="/login" className="cta-button">
        Login
        <span className="arrow">→</span>
      </Link>
      <Link href="/signup" className="cta-button">
        Logon
        <span className="arrow">→</span>
      </Link>
    </div>

          </div>
        </div>
      </div>

      <style jsx>{`
        :root {
          --background: #0a090d;
          --foreground: #e6e8e3;
          --bg-darker: #070608;
          --bg-secondary: #121113;
          --primary: #4c4e30;
          --primary-light: #61673e;
          --accent: #a97f52;
          --accent-light: #c1915d;
          --text-lighter: #ffffff;
        }

        .modern-container {
          width: 100%;
          min-height: 100vh;
          background-color: var(--background);
          color: var(--foreground);
          overflow: hidden;
          position: relative;
        }

        .hero-section {
          position: relative;
          max-width: 1400px;
          margin: 0 auto;
          padding: 4rem 2rem;
          z-index: 2;
        }

        .bg-accent-circle {
          position: absolute;
          top: -200px;
          right: -200px;
          width: 600px;
          height: 600px;
          border-radius: 50%;
          background: radial-gradient(circle, var(--accent) 0%, transparent 70%);
          opacity: 0.15;
          z-index: 1;
          animation: float 12s ease-in-out infinite;
        }

        .bg-primary-circle {
          position: absolute;
          bottom: -300px;
          left: -300px;
          width: 800px;
          height: 800px;
          border-radius: 50%;
          background: radial-gradient(circle, var(--primary-light) 0%, transparent 70%);
          opacity: 0.1;
          z-index: 1;
          animation: float 15s ease-in-out infinite reverse;
        }

        .content-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4rem;
          align-items: center;
          position: relative;
          z-index: 3;
        }

        .image-container {
          position: relative;
          height: 600px;
        }

        .disco-container {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(10%, -50%);
          z-index: 1;
          animation: spin 8s linear infinite;
          filter: drop-shadow(0 0 15px rgba(169, 127, 82, 0.3));
        }

        .album-container {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          z-index: 2;
        }

        .album-image {
          border-radius: 12px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
          border: 1px solid rgba(169, 127, 82, 0.3);
          transition: transform 0.3s ease;
        }

        .album-glow {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          border-radius: 12px;
          background: radial-gradient(circle at center, rgba(169, 127, 82, 0.2) 0%, transparent 70%);
          z-index: -1;
          animation: pulse 4s ease-in-out infinite;
        }

        .text-content {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .badge {
          background: linear-gradient(90deg, var(--accent), var(--accent-light));
          color: var(--bg-darker);
          padding: 0.5rem 1rem;
          border-radius: 50px;
          font-size: 0.8rem;
          font-weight: 700;
          width: fit-content;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        h1 {
          font-size: 3.5rem;
          font-weight: 800;
          line-height: 1.1;
          margin: 0;
          background: linear-gradient(to right, var(--foreground), var(--accent-light));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .gradient-text {
          background: linear-gradient(45deg, var(--accent), var(--accent-light));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .lead-text {
          font-size: 1.2rem;
          line-height: 1.6;
          color: rgba(230, 232, 227, 0.8);
        }

        .lead-text strong {
          color: var(--accent-light);
          font-weight: 600;
        }

        .features-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
          margin-top: 1rem;
        }

        .feature-card {
          background: rgba(18, 17, 19, 0.6);
          border: 1px solid rgba(76, 78, 48, 0.3);
          border-radius: 12px;
          padding: 1.5rem;
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
        }

        .feature-card:hover {
          transform: translateY(-5px);
          border-color: var(--accent);
          box-shadow: 0 10px 20px -10px rgba(169, 127, 82, 0.2);
        }

        .feature-icon {
          font-size: 1.8rem;
          margin-bottom: 0.8rem;
        }

        .feature-card h3 {
          font-size: 1.1rem;
          margin: 0 0 0.5rem 0;
          color: var(--accent-light);
        }

        .feature-card p {
          font-size: 0.9rem;
          margin: 0;
          color: rgba(230, 232, 227, 0.7);
        }

        a.cta-button {
          background: linear-gradient(45deg, var(--accent), var(--accent-light));
          color: var(--bg-darker);
          border: none;
          padding: 1rem 2rem;
          font-size: 1rem;
          font-weight: 600;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          width: 50%;
          transition: all 0.3s ease;
          margin: 0.1rem;
          margin-top: 1rem;
          text-decoration: none;
        }

        .cta-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px -10px var(--accent);
        }

        .arrow {
          transition: transform 0.3s ease;
        }

        .cta-button:hover .arrow {
          transform: translateX(3px);
        }

        @keyframes spin {
          0% { transform: translate(10%, -50%) rotate(0deg); }
          100% { transform: translate(10%, -50%) rotate(360deg); }
        }

        @keyframes float {
          0% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
          100% { transform: translateY(0); }
        }

        @keyframes pulse {
          0% { opacity: 0.3; }
          50% { opacity: 0.1; }
          100% { opacity: 0.3; }
        }

        @media (max-width: 1024px) {
          .content-grid {
            grid-template-columns: 1fr;
          }

          .image-container {
            height: 400px;
            margin-bottom: 3rem;
          }

          h1 {
            font-size: 2.5rem;
          }
        }

        @media (max-width: 768px) {
          .features-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}