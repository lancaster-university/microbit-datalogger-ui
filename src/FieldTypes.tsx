import { RiCompassLine, RiTimeLine } from "react-icons/ri";

export interface FieldType {

    icon: React.ReactNode;
    validator: RegExp;
    name: string;
}

// todo how to localise?

export const LATITUDE: FieldType = {
    icon: <RiCompassLine/>,
    validator: /latitude/i,
    name: "Latitude"
};

export const LONGITUDE: FieldType = {
    icon: <RiCompassLine/>,
    validator: /longitude/i,
    name: "Longitude"
};

export const TIME: FieldType = {
    icon: <RiTimeLine/>,
    validator: /time \(.+\)/i,
    name: "Timestamp"
};

export const RTC_TIME: FieldType = {
    icon: <RiTimeLine/>,
    validator: /date/i,
    name: "Date and Time"
};

const FIELDS = [LATITUDE, LONGITUDE, TIME, RTC_TIME];

export function detect(header: string): FieldType | null {
    return FIELDS.find(field => field.validator.test(header)) || null;
}