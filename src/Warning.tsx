import styled from "@emotion/styled";
import { RiInformationLine } from "react-icons/ri";
import Card from "./Card";

export interface WarningProps {
    title: string;
    children: React.ReactNode;
}

const WarningCard = styled(Card)`
    background: rgb(94, 137, 197);
    color: rgb(250, 250, 250);
    padding: 0.6em;
    display: flex;
    align-items: center;
    line-height: 1.3;
    margin-bottom: 0.8em;

    .icon {
        font-size: 1.8em;
        margin-right: 0.3em;
    }

    h3 {
        margin: 0 0 0.1em 0;
    }
`;

export default function Warning(props: WarningProps) {
    return (
        <WarningCard>
            <RiInformationLine />
            <div>
                <h3>{props.title}</h3>
                {props.children}
            </div>
        </WarningCard>
    );
}