import { useEffect, useRef, useState } from "react";
import "./Modal.css";

export interface ModalProps extends ModalContents {
    onClose: () => any;
}

export interface ModalContents {
    content: JSX.Element;
    title: string;
}

export default function Modal(props: ModalProps) {

    const modalRef = useRef<HTMLDialogElement>(null);
    const closeButtonRef = useRef<HTMLButtonElement>(null);
    const [closing, setClosing] = useState(false);

    const close = () => {
        setClosing(true);

        setTimeout(() => {
            props.onClose();
        }, 150);
    }

    useEffect(() => {
        const dialog = modalRef.current;
        dialog?.showModal();

        const closeButton = closeButtonRef.current;
        closeButton?.focus();

        return () => dialog?.close();
    });

    if (!props.content) {
        return null;
    }

    return (
        <dialog ref={modalRef} className={"modal " + (closing ? "modal-closing" : "")}>
            <div className="modal-title">
                {props.title}
            </div>
            <div className="modal-contents">
                {props.content}
            </div>
            <div className="modal-buttons">
                <button ref={closeButtonRef} onClick={close}>Close</button>
            </div>
        </dialog>
    )
}