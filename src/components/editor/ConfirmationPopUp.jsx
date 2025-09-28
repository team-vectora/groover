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
            contentStyle={{ background: "transparent", boxShadow: "none", border: "none" }}
        >
            <div className="modal p-4 sm:p-6 rounded-lg shadow-lg bg-bg-secondary text-foreground w-11/12 sm:max-w-sm mx-auto border border-yellow-500/50">
                <div className="text-center">
                    <FontAwesomeIcon
                        icon={faExclamationTriangle}
                        className="text-yellow-500 text-3xl sm:text-4xl mb-4"
                    />

                    <h3 className="header text-lg sm:text-xl font-semibold mb-2 text-text-lighter">
                        {title || t("confirmation.title")}
                    </h3>

                    <p className="text-gray-400 mb-6 text-sm sm:text-base">
                        {message || t("confirmation.message")}
                    </p>

                    <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
                        <button
                            onClick={onClose}
                            className="w-full sm:w-auto px-4 py-2 rounded-md bg-gray-600 hover:bg-gray-700 transition"
                        >
                            {t("confirmation.cancel")}
                        </button>
                        <button
                            onClick={() => {
                                onConfirm();
                                onClose();
                            }}
                            className="w-full sm:w-auto px-4 py-2 rounded-md bg-primary hover:bg-red-700 text-white font-semibold transition"
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
