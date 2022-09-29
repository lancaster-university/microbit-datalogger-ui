import "./DropDownMenu.css";

export interface DropDownMenuProps {
    items: JSX.Element[];
    onSelected?: (index: number) => any;
}

export default function DropDownMenu(props: DropDownMenuProps) {
    return (
        <div className="dropdown-menu">
        {props.items.map((item, index) => <div onClick={() => props.onSelected && props.onSelected(index)} key={index}>{item}</div>)}
        </div>
    )
}