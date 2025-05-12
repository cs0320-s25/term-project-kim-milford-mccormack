import {styled} from "@mui/system";

type PlacesType = {
    name: string;
    address: string;
    location: {lat: number, lng: number};
    rating: number;
    open_now: boolean;
    description: string;
}

type ResType = {
    results: PlacesType[];
}

type PopupContentProps = {
    places: ResType | undefined;
}

const PopupContent = ({places} : PopupContentProps) => {
    return (
        <div>
        
        </div>
    )
}

export default PopupContent;