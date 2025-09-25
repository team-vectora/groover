'use client';
import { useState } from "react";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

const ForgotPasswordPopup = ({ isOpen, onClose, onSendEmail }) => {
    const { t } = useTranslation();
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const success = await onSendEmail(email);
            if (success) {
                toast.success(t("forgotPassword.email_sent"), { theme: "colored", autoClose: 3000 });
                onClose();
            } else {
                toast.error(t("forgotPassword.email_error"), { theme: "colored", autoClose: 3000 });
            }
        } catch (err) {
            toast.error(t("forgotPassword.email_error"), { theme: "colored", autoClose: 3000 });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-bg-secondary rounded-2xl p-6 sm:p-8 shadow-lg w-full max-w-md relative">
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-text-lighter font-bold text-xl hover:text-accent"
                >
                    ×
                </button>

                <h2 className="text-2xl font-semibold mb-4 text-text-lighter text-center">
                    {t("forgotPassword.title")}
                </h2>
                <p className="text-sm text-text-lighter mb-6 text-center">
                    {t("forgotPassword.description")}
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="email" className="block mb-1 text-text-lighter font-medium">
                            {t("forgotPassword.email_label")}
                        </label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder={t("forgotPassword.email_placeholder")}
                            className="w-full px-4 py-2 rounded-lg bg-bg-darker text-text-lighter border border-primary focus:outline-none focus:ring-2 focus:ring-accent"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-primary hover:bg-primary-light text-text-lighter font-semibold py-3 rounded-lg transition disabled:opacity-50"
                        disabled={loading}
                    >
                        {loading ? t("forgotPassword.sending") : t("forgotPassword.send_email")}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ForgotPasswordPopup;