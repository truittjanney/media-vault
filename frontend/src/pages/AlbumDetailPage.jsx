import { useState, useEffect } from 'react';
import { useParams } from "react-router-dom";
import { getAlbumMedia, uploadMedia } from '../services/mediaService.js';
import { MediaCard } from '../components/MediaCard.jsx';

function AlbumDetailPage() {
    const [media, setMedia] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null);
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

    function handleOpenMedia(mediaId) {
        console.log("Open media:", mediaId);
    }

    async function handleUploadMedia(event) {
        event.preventDefault();
        setErrorMessage('');

        if (!selectedFile) {
            setErrorMessage('Please select a file to upload.');
            return;
        }

        const formData = new FormData();
        formData.append('albumId', id);
        formData.append('media', selectedFile);

        try {
            setIsLoading(true);
            await uploadMedia(formData);
            setSelectedFile(null);
            await loadMedia();
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

<form onSubmit={handleUploadMedia}>
  <input
    type="file"
    onChange={(event) => setSelectedFile(event.target.files[0])}
  />

  <button type="submit" disabled={isLoading}>
    Upload
  </button>
</form>

        <div>
            {media.map((file) => (
                <MediaCard
                    key={file.id}
                    media={file}
                    onOpenMedia={handleOpenMedia}
                />
            ))}
        </div>

        {isLoading && <p>Loading media...</p>}

        {errorMessage && <p>{errorMessage}</p>}

        {!isLoading && !errorMessage && media.length === 0 && <p>No media content yet.</p>}

        </div>
    );
}

export { AlbumDetailPage };
