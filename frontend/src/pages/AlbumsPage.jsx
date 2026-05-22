import { useState, useEffect } from 'react';
import { getAlbums, createAlbum } from '../services/albumService.js';

function Albums() {
    const [albums, setAlbums] = useState([]);
    const [albumName, setAlbumName] = useState('');
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

async function handleCreateAlbumSubmit(event) {
    event.preventDefault();
    setErrorMessage('');

    if (albumName.trim() === '') {
        setErrorMessage('Album name cannot be empty');
        return;
    }

    try {
        setIsLoading(true);
        await createAlbum({ name: albumName });
        setAlbumName('');
        await loadAlbums();
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

            <form onSubmit={handleCreateAlbumSubmit}>
                <label htmlFor="albumName">Album Name:</label>
                <input type="text" id="albumName" value={albumName} onChange={(e) => setAlbumName(e.target.value)} />
                <button type="submit" disabled={isLoading}>Create Album</button>
            </form>

        </div>
    );
}

export default Albums;
