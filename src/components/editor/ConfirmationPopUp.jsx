"use client";
import Popup from "reactjs-popup";
import "reactjs-popup/dist/index.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from "react-i18next";

const ConfirmationPopUp = ({
    open,
    onClose,
    onConfirm,
    title,
    message,
}) => {
    const { t } = useTranslation();

    return (
        <Popup
            open={open}
            closeOnDocumentClick={false}
            contentStyle={{ background: "transparent", boxShadow: "none", border:"none" }}
        >
            <div className="modal p-6 rounded-lg shadow-lg bg-bg-secondary text-foreground max-w-sm mx-auto border border-yellow-500/50">
                <div className="text-center">
                    <FontAwesomeIcon icon={faExclamationTriangle} className="text-yellow-500 text-4xl mb-4" />

                    <h3 className="header text-xl font-semibold mb-2 text-text-lighter">
                        {title || t("confirmation.title")}
                    </h3>

                    <p className="text-gray-400 mb-6">
                        {message || t("confirmation.message")}
                    </p>

                    <div className="flex justify-center gap-4">
                        <button
                            onClick={onClose}
                            className="px-6 py-2 rounded-md bg-gray-600 hover:bg-gray-700 transition"
                        >
                            {t("confirmation.cancel")}
                        </button>
                        <button
                            onClick={() => {
                                onConfirm();
                                onClose(); // Fecha o popup após confirmar
                            }}
                            className="px-6 py-2 rounded-md bg-red-600 hover:bg-red-700 text-white font-semibold transition"
                        >
                            {t("confirmation.confirm")}
                        </button>
                    </div>
                </div>
            </div>
        </Popup>
    );
};

export default ConfirmationPopUp;
