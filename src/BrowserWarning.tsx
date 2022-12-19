import styled from "@emotion/styled";

//@ts-ignore
const isIE = Boolean(document.documentMode);

const WarningWrapper = styled.div`
    background: #e41f1f;
    color: white;
    padding: 1em;
    font-weight: 600;
`;

export default function BrowserWarning() {

    if (isIE) {
        return (
            <WarningWrapper>
                Internet Explorer (IE) is not supported. Please use Google Chrome, Microsoft Edge, Mozilla Firefox or Safari.
            </WarningWrapper>
        );
    }

    return <></>;
} 