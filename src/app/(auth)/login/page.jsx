'use client';
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { useLogin } from "../../../hooks";
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

const LoginPage = () => {
    const router = useRouter();
    const { login, errors, loading } = useLogin();

    const [username, setUsername] = useState('');
    const [senha, setSenha] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        if (errors.general) {
            toast.error(errors.general, { theme: "colored", autoClose: 3000 });
        }
    }, [errors.general]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const result = await login({ username, senha });

        if (result.success) {
            toast.success('Login realizado com sucesso!', { theme: "colored", autoClose: 3000 });
            router.push('/feed');
        }
    };

    return (
        <div className="w-full max-w-md sm:max-w-lg bg-bg-secondary rounded-3xl p-6 sm:p-8 shadow-lg">
            <h2 className="text-2xl font-semibold mb-6 text-center text-text-lighter">Entrar</h2>

            {errors.general && !toast.isActive('error') && (
                <div className="mb-4 p-3 bg-red-100 border-l-4 border-red-500 text-red-700">
                    <p>{errors.general}</p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5 z-20 relative">
                <div>
                    <label htmlFor="username" className="block mb-1 font-medium text-text-lighter">Username</label>
                    <input
                        type="text"
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Yanke Doodle"
                        className={`w-full px-4 py-2 rounded-lg bg-bg-darker text-text-lighter border ${
                            errors.username ? 'border-red-500' : 'border-primary'
                        } focus:outline-none focus:ring-2 focus:ring-accent`}
                        required
                    />
                </div>

                <div>
                    <label htmlFor="senha" className="block mb-1 font-medium text-text-lighter">Senha</label>
                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            id="senha"
                            value={senha}
                            onChange={(e) => setSenha(e.target.value)}
                            placeholder="Digite sua senha"
                            className={`w-full px-4 py-2 rounded-lg bg-bg-darker text-text-lighter border ${
                                errors.senha ? 'border-red-500' : 'border-primary'
                            } focus:outline-none focus:ring-2 focus:ring-accent pr-10`}
                            required
                        />
                        <button
                            type="button"
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
                            onClick={() => setShowPassword(!showPassword)}
                            aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                        >
                            <FontAwesomeIcon
                                icon={showPassword ? faEyeSlash : faEye}
                                className="h-5 w-5 text-text-lighter hover:text-accent transition"
                            />
                        </button>
                    </div>
                    <a href="#" className="text-accent hover:text-accent-light mt-1 block text-sm">Esqueci senha</a>
                </div>

                <button
                    type="submit"
                    className="w-full bg-primary hover:bg-primary-light text-text-lighter font-semibold py-3 rounded-lg transition disabled:opacity-50"
                    disabled={loading}
                >
                    {loading ? 'Entrando...' : 'Logar'}
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
                Não tem uma conta? <a href="/signup" className="text-accent font-semibold hover:underline">Crie</a>
            </p>
        </div>
    );
};

export default LoginPage;