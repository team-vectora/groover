"use client";
import { useRouter } from 'next/navigation';
import { useState } from "react";
import Image from 'next/image';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
const LoginPage = () => {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [username, setUsername] = useState('');

    const notifySuccess = (msg) => toast.success(msg, {theme: "colored", autoClose: 3000});
    const notifyError = (msg) => toast.error(msg, {theme: "colored",autoClose: 3000});

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch('http://localhost:5000/api/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: username,
                    email: email,
                    password: senha,
                }),
            });

            const data = await response.json();
            console.log(data);

            if (response.ok) {
                notifySuccess("Conta criada");
            } else {
                notifyError(data.error || 'Erro no cadastro');
            }
        } catch (error) {
            console.error('Erro:', error);
            alert('Erro ao conectar com a API');
        }
    };

    return (
        <div id='login_page'>
            <ToastContainer
                position="top-center"
                limit={1}
                toastStyle={{
                    marginTop: '2vh',
                    textAlign: 'center',
                    fontSize: '1.2rem'
                }}
            />
            <header>
                <div className="logo">
                    <Image src="/img/groover_logo.png" alt="Logo" width={90} height={200} />
                    <span className="logo-texto">GrooveClub</span>
                </div>
                <div className="botoes">
                    <a href="/login" className="entrar">Entrar</a>
                    <a href="/logon" className="criar-conta">Criar Conta</a>
                </div>
            </header>

            <div className="caixa-login">
                <h2>Criar Conta</h2>

                <form onSubmit={handleSubmit}>
                    <div className="container-input">
                        <label htmlFor="username">Username</label>
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Yankee Doodle"
                        />
                    </div>

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
                        <a href="#" className="esquecer-senha">Esqueci senha</a>
                    </div>

                    <input id='botao-enviar' type="submit" value="Criar" />
                </form>

                <div className="container-texto-divisor">
                    <div className="linha-divisoria"></div>
                    <span className="texto-divisor">ou entre com</span>
                    <div className="linha-divisoria"></div>
                </div>

                <div className="botoes-sociais">
                    <button className="botao-social">
                        <img src="../../public/img/google.png" alt="Google" width="25" height="25" />
                    </button>
                    <button className="botao-social">
                        <img src="../../public/img/facebook.png" alt="Facebook" width="25" height="25" />
                    </button>
                    <button className="botao-social">
                        <img src="../../public/img/apple.png" alt="Apple" width="25" height="25" />
                    </button>
                </div>

                <p className="texto-termos">
                    Ao prosseguir, você concorda com os{' '}
                    <span>Termos de uso</span> e a{' '}
                    <span>Política de privacidade</span> do GrooveClub.
                </p>

                <p className="texto-criar-conta">
                    Já tem uma conta? <a href='/login'>Entrar</a>
                </p>
            </div>
        </div>
    );
};

export default LoginPage;
