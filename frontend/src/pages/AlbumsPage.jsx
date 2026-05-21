import { useState, useEffect } from 'react';
import { getAlbums } from '../services/albumService.js';

function Albums() {
    const [albums, setAlbums] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

async function loadAlbums() {
    setErrorMessage('');

    try {
        setIsLoading(true);
        const data = await getAlbums();
        setAlbums(data.albums || []);

    } catch (error) {
        setErrorMessage(error.message);

    } finally {
        setIsLoading(false);
    }
}

    useEffect(() => {
        loadAlbums();
    }, []);

    return (
        <div>
            <h1>Albums</h1>

            <div>
  {albums.map((album) => (
    <div key={album.id}>{album.name}</div>
    ))}
            </div>

            {isLoading && <p>Loading albums...</p>}

            {errorMessage && <p>{errorMessage}</p>}

            {!isLoading && !errorMessage && albums.length === 0 && <p>No albums yet</p>}

        </div>
    );
}

export default Albums;
