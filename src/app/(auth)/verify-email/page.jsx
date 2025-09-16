'use client';

import { useTranslation } from "react-i18next";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope } from '@fortawesome/free-solid-svg-icons';

const VerifyEmailPage = () => {
    const { t } = useTranslation();

    return (
        <div className="w-full max-w-md sm:max-w-lg bg-bg-secondary rounded-3xl p-6 sm:p-8 shadow-lg text-center">
            <FontAwesomeIcon icon={faEnvelope} className="text-5xl text-accent mb-6" />
            <h2 className="text-2xl font-semibold mb-4 text-text-lighter">{t('verifyEmail.title')}</h2>
            <p className="text-foreground">
                {t('verifyEmail.message')}
            </p>
        </div>
    );
};

export default VerifyEmailPage;