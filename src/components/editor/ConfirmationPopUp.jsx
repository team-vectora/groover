"use client";
import Popup from "reactjs-popup";
import "reactjs-popup/dist/index.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';

const ConfirmationPopUp = ({
                               open,
                               onClose,
                               onConfirm,
                               title,
                               message,
                           }) => {
    return (
        <Popup open={open} closeOnDocumentClick={false} contentStyle={{ background: "transparent", boxShadow: "none", border:"none"}}>
            <div className="modal p-6 rounded-lg shadow-lg bg-[#121113] text-[#e6e8e3] max-w-sm mx-auto border border-yellow-500/50">
                <div className="text-center">
                    <FontAwesomeIcon icon={faExclamationTriangle} className="text-yellow-500 text-4xl mb-4" />

                    <h3 className="header text-xl font-semibold mb-2 text-text-lighter">
                        {title || "Confirmar Ação"}
                    </h3>

                    <p className="text-gray-400 mb-6">
                        {message || "Você tem certeza que deseja continuar?"}
                    </p>

                    <div className="flex justify-center gap-4">
                        <button
                            onClick={onClose}
                            className="px-6 py-2 rounded-md bg-gray-600 hover:bg-gray-700 transition"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={() => {
                                onConfirm();
                                onClose(); // Fecha o popup após confirmar
                            }}
                            className="px-6 py-2 rounded-md bg-red-600 hover:bg-red-700 text-white font-semibold transition"
                        >
                            Confirmar
                        </button>
                    </div>
                </div>
            </div>
        </Popup>
    );
};

export default ConfirmationPopUp;