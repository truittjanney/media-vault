import { useState, useEffect } from 'react';
import { useParams } from "react-router-dom";
import { getAlbumMedia } from '../services/mediaService.js';

function AlbumDetailPage() {
    const [media, setMedia] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const { id } = useParams();

    async function loadMedia() {
        setErrorMessage('');

        try {
            setIsLoading(true);
            const data = await getAlbumMedia(id);
            setMedia(data.media || []);
        } catch (error) {
            setErrorMessage(error.message);
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        loadMedia();
    }, [id]);

    return (
        <div>
            <h1>Album Media</h1>
            <p>Album ID: {id}</p>

        <div>
            {media.map((file) => (
<div key={file.id}>
    <img
    src={`http://localhost:5001${file.filePath}`}
    alt={file.name}
    />
</div>
            ))}
        </div>

        {isLoading && <p>Loading media...</p>}

        {errorMessage && <p>{errorMessage}</p>}

        {!isLoading && !errorMessage && media.length === 0 && <p>No media content yet.</p>}

        </div>
    );
}

export { AlbumDetailPage };
