'use client';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from "react";
import Image from 'next/image';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import useLogin from '../hooks/useLogin';

const LoginPage = () => {
  const router = useRouter();
  const { login, error } = useLogin();

  const [username, setUsername] = useState('');
  const [senha, setSenha] = useState('');

  useEffect(() => {
    if (error) {
      toast.error(error, { theme: "colored", autoClose: 3000 });
    }
  }, [error]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const result = await login({ username, senha });

    if (result.success) {
      toast.success('Login realizado com sucesso!', { theme: "colored", autoClose: 3000 });
      router.push('/feed');
    }
  };

return (
  <div className="min-h-screen flex flex-col bg-background text-foreground p-4 sm:p-6 md:p-8">
    <ToastContainer
      position="top-center"
      limit={1}
      toastStyle={{ marginTop: '2vh', textAlign: 'center', fontSize: '1.2rem' }}
    />

    <header className="w-full max-w-6xl flex justify-between items-center mb-6 sm:mb-8 px-2 sm:px-0 mx-auto">
      <div className="flex items-center space-x-3">
        <Image src="/img/groover_logo.png" alt="Logo" width={90} height={70} />
        <span className="text-2xl sm:text-3xl font-bold">GrooveClub</span>
      </div>
      <nav className="space-x-4 text-sm sm:text-base">
        <a href="/login" className="text-primary hover:text-primary-light transition">Entrar</a>
        <a href="/logon" className="text-accent font-semibold hover:text-accent-light transition">Criar Conta</a>
      </nav>
    </header>

    <main className="flex-grow flex justify-center items-center w-full px-2 sm:px-0">
      <div className="w-full max-w-md sm:max-w-lg bg-bg-secondary rounded-3xl p-6 sm:p-8 shadow-lg">
        <h2 className="text-2xl font-semibold mb-6 text-center text-text-lighter">Entrar</h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* campos do formulário */}
          <div>
            <label htmlFor="username" className="block mb-1 font-medium text-text-lighter">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Yanke Doodle"
              className="w-full px-4 py-2 rounded-lg bg-bg-darker text-text-lighter border border-primary focus:outline-none focus:ring-2 focus:ring-accent"
              required
            />
          </div>

          <div>
            <label htmlFor="senha" className="block mb-1 font-medium text-text-lighter">Senha</label>
            <input
              type="password"
              id="senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="Digite sua senha"
              className="w-full px-4 py-2 rounded-lg bg-bg-darker text-text-lighter border border-primary focus:outline-none focus:ring-2 focus:ring-accent"
              required
            />
            <a href="#" className="text-accent hover:text-accent-light mt-1 block text-sm">Esqueci senha</a>
          </div>

          <button
            type="submit"
            className="w-full bg-primary hover:bg-primary-light text-text-lighter font-semibold py-3 rounded-lg transition"
          >
            Logar
          </button>
        </form>

        <div className="flex items-center my-6 text-accent text-sm">
          <div className="flex-grow border-t border-accent"></div>
          <span className="mx-4 whitespace-nowrap">ou entre com</span>
          <div className="flex-grow border-t border-accent"></div>
        </div>

        <div className="flex justify-center space-x-6 mb-6">
          {['google.png', 'facebook.png', 'apple.png'].map((src, idx) => (
            <button
              key={idx}
              className="p-3 rounded-full bg-bg-darker hover:bg-bg-secondary transition"
              aria-label={`Entrar com ${src.split('.')[0]}`}
            >
              <Image src={`/img/${src}`} alt={src.split('.')[0]} width={25} height={25} />
            </button>
          ))}
        </div>

        <p className="text-xs text-foreground text-center mb-6 px-2 sm:px-0">
          Ao prosseguir, você concorda com os{' '}
          <span className="underline cursor-pointer">Termos de uso</span> e a{' '}
          <span className="underline cursor-pointer">Política de privacidade</span> do GrooveClub.
        </p>

        <p className="text-center text-foreground">
          Não tem uma conta? <a href="/logon" className="text-accent font-semibold hover:underline">Crie</a>
        </p>
      </div>
    </main>
  </div>
);
}
export default LoginPage;
