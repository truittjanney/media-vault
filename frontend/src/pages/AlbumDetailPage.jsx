import { useParams } from "react-router-dom";

function AlbumDetail() {
    const { id } = useParams();

    return (
        <div>
            <h1>Album Detail</h1>
            <p>Album ID: {id}</p>
        </div>
    );
}

export { AlbumDetail };
