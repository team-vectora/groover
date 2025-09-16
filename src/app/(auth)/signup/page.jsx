'use client';
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { useSignUp } from "../../../hooks";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import Image from 'next/image';
import { useTranslation } from "react-i18next";

const SignupPage = () => {
    const router = useRouter();
    const { signUp, errors, loading } = useSignUp();
    const { t } = useTranslation();

    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const [confirmSenha, setConfirmSenha] = useState("");
    const [passwordStrength, setPasswordStrength] = useState(0);
    const [passwordMatch, setPasswordMatch] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    useEffect(() => {
        let strength = 0;
        if (senha.length > 0) strength += 1;
        if (senha.length >= 8) strength += 1;
        if (/[A-Z]/.test(senha)) strength += 1;
        if (/[0-9]/.test(senha)) strength += 1;
        if (/[^A-Za-z0-9]/.test(senha)) strength += 1;
        setPasswordStrength(Math.min(strength, 5));
        setPasswordMatch(senha === confirmSenha || confirmSenha === "");
    }, [senha, confirmSenha]);

    useEffect(() => {
        if (errors.general) {
            toast.error(errors.general);
        }
    }, [errors]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (/\s/.test(username)) {
            toast.error(t('validation.username_no_spaces'));
            return;
        }
        if (/\s/.test(senha)) {
            toast.error(t('validation.password_no_spaces'));
            return;
        }
        if (!passwordMatch) {
            toast.error(t('validation.passwords_no_match'));
            return;
        }
        if (passwordStrength < 3) {
            toast.error(t('validation.password_too_weak'));
            return;
        }
        await signUp({ username, email, senha });
    };

    const getPasswordStrengthColor = () => {
        switch(passwordStrength) {
            case 0: return 'bg-gray-300';
            case 1: return 'bg-red-500';
            case 2: return 'bg-yellow-500';
            case 3: return 'bg-blue-500';
            case 4: return 'bg-green-500';
            case 5: return 'bg-emerald-600';
            default: return 'bg-gray-300';
        }
    };

    const getPasswordStrengthText = () => {
        const levels = [
            'strength_levels.very_weak', 'strength_levels.weak', 'strength_levels.moderate',
            'strength_levels.good', 'strength_levels.strong', 'strength_levels.very_strong'
        ];
        return t(`signup.${levels[passwordStrength]}`);
    };

    return (
        <div className="w-full max-w-md sm:max-w-lg bg-bg-secondary rounded-3xl p-6 sm:p-8 shadow-lg">
            <h2 className="text-2xl font-semibold mb-6 text-center text-text-lighter">{t('signup.title')}</h2>

            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <label htmlFor="username" className="block mb-1 font-medium text-text-lighter">{t('signup.username')}</label>
                    <input
                        type="text"
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder={t('signup.username_placeholder')}
                        className={`w-full px-4 py-2 rounded-lg bg-bg-darker text-text-lighter border ${
                            errors.username ? 'border-red-500' : 'border-primary'
                        } focus:outline-none focus:ring-2 focus:ring-accent`}
                        required
                    />
                    {errors.username && (
                        <p className="text-red-500 text-sm mt-1">{errors.username}</p>
                    )}
                </div>

                <div>
                    <label htmlFor="email" className="block mb-1 font-medium text-text-lighter">{t('signup.email')}</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={t('signup.email_placeholder')}
                        className={`w-full px-4 py-2 rounded-lg bg-bg-darker text-text-lighter border ${
                            errors.email ? 'border-red-500' : 'border-primary'
                        } focus:outline-none focus:ring-2 focus:ring-accent`}
                        required
                    />
                    {errors.email && (
                        <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                    )}
                </div>

                <div>
                    <label htmlFor="senha" className="block mb-1 font-medium text-text-lighter">{t('signup.password')}</label>
                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            id="senha"
                            value={senha}
                            onChange={(e) => setSenha(e.target.value)}
                            placeholder={t('signup.password_placeholder')}
                            className={`w-full px-4 py-2 rounded-lg bg-bg-darker text-text-lighter border ${
                                errors.senha ? 'border-red-500' : 'border-primary'
                            } focus:outline-none focus:ring-2 focus:ring-accent pr-10`}
                            required
                        />
                        <button
                            type="button"
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
                            onClick={() => setShowPassword(!showPassword)}
                            aria-label={showPassword ? t('signup.hide_password') : t('signup.show_password')}
                        >
                            <FontAwesomeIcon
                                icon={showPassword ? faEyeSlash : faEye}
                                className="h-5 w-5 text-text-lighter hover:text-accent transition"
                            />
                        </button>
                    </div>

                    <div className="mt-2">
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div
                                className={`h-2.5 rounded-full ${getPasswordStrengthColor()}`}
                                style={{ width: `${passwordStrength * 20}%` }}
                            ></div>
                        </div>
                        <p className="text-xs mt-1 text-text-lighter">
                            {t('signup.password_strength')}: <span className="font-medium">{getPasswordStrengthText()}</span>
                        </p>
                        <ul className="text-xs text-text-lighter mt-1 list-disc list-inside">
                            <li className={senha.length >= 8 ? 'text-green-500' : ''}>{t('signup.password_requirements.min_length')}</li>
                            <li className={/[A-Z]/.test(senha) ? 'text-green-500' : ''}>{t('signup.password_requirements.uppercase')}</li>
                            <li className={/[0-9]/.test(senha) ? 'text-green-500' : ''}>{t('signup.password_requirements.number')}</li>
                            <li className={/[^A-Za-z0-9]/.test(senha) ? 'text-green-500' : ''}>{t('signup.password_requirements.special_char')}</li>
                        </ul>
                    </div>
                    {errors.senha && (
                        <p className="text-red-500 text-sm mt-1">{errors.senha}</p>
                    )}
                </div>

                <div>
                    <label htmlFor="confirmSenha" className="block mb-1 font-medium text-text-lighter">{t('signup.confirm_password')}</label>
                    <div className="relative">
                        <input
                            type={showConfirmPassword ? "text" : "password"}
                            id="confirmSenha"
                            value={confirmSenha}
                            onChange={(e) => setConfirmSenha(e.target.value)}
                            placeholder={t('signup.confirm_password_placeholder')}
                            className={`w-full px-4 py-2 rounded-lg bg-bg-darker text-text-lighter border ${
                                !passwordMatch && confirmSenha !== "" ? 'border-red-500' : errors.senha ? 'border-red-500' : 'border-primary'
                            } focus:outline-none focus:ring-2 focus:ring-accent pr-10`}
                            required
                        />
                        <button
                            type="button"
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            aria-label={showConfirmPassword ? t('signup.hide_password') : t('signup.show_password')}
                        >
                            <FontAwesomeIcon
                                icon={showConfirmPassword ? faEyeSlash : faEye}
                                className="h-5 w-5 text-text-lighter hover:text-accent transition"
                            />
                        </button>
                    </div>
                    {!passwordMatch && confirmSenha !== "" && (
                        <p className="text-red-500 text-sm mt-1">{t('signup.passwords_no_match')}</p>
                    )}
                </div>

                <button
                    type="submit"
                    className="w-full bg-primary hover:bg-primary-light text-text-lighter font-semibold py-3 rounded-lg transition disabled:opacity-50"
                    disabled={loading || !passwordMatch}
                >
                    {loading ? t('signup.creating_button') : t('signup.create_button')}
                </button>
            </form>

            <div className="flex items-center my-6 text-accent text-sm">
                <div className="flex-grow border-t border-accent"></div>
            </div>

            <p className="text-xs text-foreground text-center mb-6 px-2 sm:px-0">
                {t('signup.terms_agreement')}{' '}
                <span className="underline cursor-pointer">{t('signup.terms_of_use')}</span> e a{' '}
                <span className="underline cursor-pointer">{t('signup.privacy_policy')}</span> do GrooveClub.
            </p>

            <p className="text-center text-foreground">
                {t('signup.already_have_account')}{' '}
                <a href="/login" className="text-accent font-semibold hover:underline">
                    {t('signup.login_link')}
                </a>
            </p>
        </div>
    );
};

export default SignupPage;