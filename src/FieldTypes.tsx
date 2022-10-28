import { RiCompassLine, RiTimeLine } from "react-icons/ri";

export interface FieldType {

    icon: JSX.Element;
    validator: RegExp;
}

// todo how to localise?

export const LATITUDE: FieldType = {
    icon: <RiCompassLine/>,
    validator: /latitude/i
};

export const LONGITUDE: FieldType = {
    icon: <RiCompassLine/>,
    validator: /longitude/i
};

export const TIME: FieldType = {
    icon: <RiTimeLine/>,
    validator: /time \(.+\)/i
};