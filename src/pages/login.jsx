'use client';
import { useRouter } from 'next/navigation';
import { useState } from "react";
import Image from 'next/image';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const LoginPage = () => {
    const router = useRouter();

    const [username, setUsername] = useState('');
    const [senha, setSenha] = useState('');

    const notifyError = (msg) => toast.error(msg, {theme: "colored",autoClose: 3000});

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:5000/api/signin', {
                method: 'POST',
                headers: {
                'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                username: username,
                password: senha,
                }),
            });

            const data = await response.json();
            console.log(data);

            if (response.ok) {
                localStorage.setItem('token', data.access_token);
                localStorage.setItem('username', data.username);
                localStorage.setItem('id', data.user_id);
                router.push('/feed');
            } else {
                 notifyError(data.error || 'Erro no login');
            }
        } catch (error) {
            console.error('Erro:', error);
            alert('Erro ao conectar com a API');
        }
    };

    return (
        <div id='login_page'>
            <header>
                <div className="logo">
                    <Image src="/img/groover_logo.png" alt="Logo" width={90} height={200} />
                    <span className="logo-texto">GrooveClub</span>
                </div>
                <div className="botoes">
                    <a href="/login" className="entrar">
                        Entrar
                    </a>
                    <a href="/logon" className="criar-conta">
                        Criar Conta
                    </a>
                </div>
            </header>
            <ToastContainer
                position="top-center"
                limit={1}
                toastStyle={{
                    marginTop: '10vh',
                    textAlign: 'center',
                    fontSize: '1.2rem'
                }}
            />

            <div className="caixa-login">
                <h2>Entrar</h2>

                <form onSubmit={handleSubmit}>
                    <div className="container-input">
                        <label htmlFor="username">Username</label>
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Yanke Doodle"
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
                            Esqueci senha
                        </a>

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
                    Não tem uma conta? <a href='/logon'>Crie</a>
                </p>
            </div>
        </div>
    );
}

export default LoginPage;