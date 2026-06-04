import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getAlbumMedia,
  uploadMedia,
  moveMedia,
  deleteMedia,
} from "../services/mediaService.js";
import { updateAlbum } from "../services/albumService.js";
import { MediaCard } from "../components/MediaCard.jsx";
import { MediaViewer } from "../components/MediaViewer.jsx";

function AlbumDetailPage() {
  // ####################################################
  // STATE
  // ####################################################
  const [media, setMedia] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const { id } = useParams();
  const navigate = useNavigate();

  // ####################################################
  // FUNCTIONS / EVENT HANDLERS
  // ####################################################
  async function loadMedia() {
    setErrorMessage("");

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

  async function handleSetAlbumCover(mediaId) {
    setErrorMessage("");

    try {
      setIsLoading(true);
      await updateAlbum(id, { albumCoverMediaId: mediaId });
      alert("Album cover updated successfully");
      await loadMedia();
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  }

  function handleOpenMedia(mediaId) {
    const clickedMedia = media.find((file) => file.id === mediaId);

    if (!clickedMedia) {
      return;
    }

    setSelectedMedia(clickedMedia);
  }

  function handleCloseMediaViewer() {
    setSelectedMedia(null);
  }

  async function handleUploadMedia(event) {
    event.preventDefault();
    setErrorMessage("");

    if (!selectedFile) {
      setErrorMessage("Please select a file to upload.");
      return;
    }

    const formData = new FormData();
    formData.append("albumId", id);
    formData.append("media", selectedFile);

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

  async function handleMoveMedia(mediaId, targetAlbumId) {
    setErrorMessage("");

    if (!Number.isInteger(targetAlbumId) || targetAlbumId <= 0) {
      setErrorMessage("Invalid target album id.");
      return;
    }

    try {
      setIsLoading(true);
      await moveMedia(mediaId, targetAlbumId);
      setSelectedMedia(null);
      await loadMedia();
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDeleteMedia(mediaId) {
    setErrorMessage("");

    try {
      setIsLoading(true);
      await deleteMedia(mediaId);
      setSelectedMedia(null);
      await loadMedia();
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  }

  function handleBackToAlbums() {
    navigate("/albums");
  }

  // ####################################################
  // EFFECTS
  // ####################################################
  useEffect(() => {
    loadMedia();
  }, [id]);

  // ####################################################
  // DERIVED VALUES
  // ####################################################
  const imageCount = media.filter((file) => file.type === "image").length;
  const videoCount = media.filter((file) => file.type === "video").length;

  // ####################################################
  // USER INTERFACE
  // ####################################################
  return (
    <div>
      <h1>Album Media</h1>
      <p>Album ID: {id}</p>
      <p>Images: {imageCount}</p>
      <p>Videos: {videoCount}</p>

      <button type="button" onClick={handleBackToAlbums}>
        Back
      </button>

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
            onMoveMedia={handleMoveMedia}
            onDeleteMedia={handleDeleteMedia}
          />
        ))}
      </div>

      <div>
        {selectedMedia && (
          <MediaViewer
            media={selectedMedia}
            onSetAlbumCover={handleSetAlbumCover}
            onCloseMediaViewer={handleCloseMediaViewer}
          />
        )}
      </div>

      {isLoading && <p>Loading media...</p>}

      {errorMessage && <p>{errorMessage}</p>}

      {!isLoading && !errorMessage && media.length === 0 && (
        <p>No media content yet.</p>
      )}
    </div>
  );
}

export { AlbumDetailPage };
