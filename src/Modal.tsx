import { css, keyframes } from "@emotion/react";
import styled from "@emotion/styled";
import { useEffect, useRef, useState } from "react";

export interface ModalProps extends ModalContents {
    onClose?: () => any;
}

export interface ModalContents {
    children: React.ReactNode;
    title: string;
    hideCloseButton?: boolean;
}

const zoomInKeyframes = keyframes`
    0% {
        opacity: 0;
        transform: scale(0.95);
    }

    100% {
        opacity: 1;
        transform: scale(1);
    }
`;

const fadeInKeyframes = keyframes`
    0% {
        opacity: 0;
    }

    100% {
        opacity: 1;
    }
`;


const ModalRoot = styled.dialog<{ closing: boolean }>`
    border: none;
    border-radius: 8px;
    max-width: 750px;
    animation: ${props => css`${zoomInKeyframes} 0.15s ease-out ${props.closing ? "reverse forwards" : ""}`};

    > * {
        padding: 0.3em;
    }

    ::backdrop {
        background-color: rgba(0, 0, 0, 0.48);
        animation: ${props => css`${fadeInKeyframes} 0.15s ease-out ${props.closing ? "reverse forwards" : ""}`};
    }
`;

const ModalTitle = styled.div`
    font-weight: 600;
    font-size: large;
`;

const ModalFooter = styled.div`
    display: flex;
    justify-content: flex-end;
`;

export default function Modal(props: ModalProps) {

    const modalRef = useRef<HTMLDialogElement>(null);
    const closeButtonRef = useRef<HTMLButtonElement>(null);
    const [closing, setClosing] = useState(false);

    const close = () => {
        setClosing(true);

        setTimeout(() => {
            props.onClose && props.onClose();
        }, 150);
    }

    useEffect(() => {
        const dialog = modalRef.current;
        dialog?.showModal();

        const closeButton = closeButtonRef.current;
        closeButton?.focus();

        return () => dialog?.close();
    });

    if (!props.children) {
        return null;
    }

    return (
        <ModalRoot ref={modalRef} closing={closing}>
            <ModalTitle>
                {props.title}
            </ModalTitle>
            <div>
                {props.children}
            </div>
            <ModalFooter>
                {!props.hideCloseButton && <button ref={closeButtonRef} onClick={close}>Close</button>}
            </ModalFooter>
        </ModalRoot>
    )
}