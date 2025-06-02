import React, { useState } from 'react';
import "./styles.css";

function LoginPage() {
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');

    const handleSubmit = async (e) => {
    };

    return (
        <div id='login_page'>
            <header>
                <div className="logo">
                    <img src="logo.png" alt="Logo" />
                    <span className="logo-texto">GrooveClub</span>
                </div>
                <div className="botoes">
                    <a href="/login" className="entrar">
                        Entrar
                    </a>
                    <a href="/cadastro" className="criar-conta">
                        Criar Conta
                    </a>
                </div>
            </header>

            <div className="caixa-login">
                <h2>Entrar</h2>

                <form onSubmit={handleSubmit}>
                    <div className="container-input">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="exemplo@e-mail.com"
                        />
                    </div>

                    <div className="container-input">
                        <label htmlFor="senha">Senha</label>
                        <input
                            type="password"
                            id="senha"
                            value={senha}
                            onChange={(e) => setSenha(e.target.value)}
                            placeholder="Digite sua senha"
                        />
                        <a href="#" className="esquecer-senha">
                            Esquecer senha
                        </a>

                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '24px', margin: '10px 0' }}>
                            {erro && <p style={{ color: 'red', margin: 0 }}>{erro}</p>}
                        </div>
                        <input id='botao-enviar' type="submit" value="Logar" />
                </form>



                <div className="container-texto-divisor">
                    <div className="linha-divisoria"></div>
                    <span className="texto-divisor">ou entre com</span>
                    <div className="linha-divisoria"></div>
                </div>

                <div className="botoes-sociais">
                    <button className="botao-social">
                        <img
                            src="google.png"
                            alt="Google"
                            width="25"
                            height="25"
                        />
                    </button>
                    <button className="botao-social">
                        <img
                            src="facebook.png"
                            alt="Facebook"
                            width="25"
                            height="25"
                        />
                    </button>
                    <button className="botao-social">
                        <img src="apple.png" alt="Apple" width="25" height="25" />
                    </button>
                </div>

                <p className="texto-termos">
                    Ao prosseguir, você concorda com os{' '}
                    <span>Termos de uso</span> e a{' '}
                    <span>Política de privacidade</span> do GrooveClub.
                </p>

                <p className="texto-criar-conta">
                    Não tem uma conta? <a href='/cadastro'>Crie</a>
                </p>
            </div>
        </div>
    );
}

export default LoginPage;