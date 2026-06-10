import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getAlbumMedia,
  uploadMedia,
  moveMedia,
  moveMultipleMedia,
  toggleMediaFavorite,
  deleteMedia,
  deleteMultipleMedia,
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
  const [selectedMediaIds, setSelectedMediaIds] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const { id } = useParams();
  const navigate = useNavigate();

  // ####################################################
  // FUNCTIONS / EVENT HANDLERS
  // ####################################################

  // DATA LOADING
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

  // SYNC EVENT HANDLERS
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

  function handleToggleSelectMedia(mediaId) {
    if (selectedMediaIds.includes(mediaId)) {
      setSelectedMediaIds(selectedMediaIds.filter((id) => id !== mediaId));
    } else {
      setSelectedMediaIds([...selectedMediaIds, mediaId]);
    }
  }

  function handleBackToAlbums() {
    navigate("/albums");
  }

  // API EVENT HANDLERS
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

  async function handleMoveMultipleMedia() {
    setErrorMessage("");

    if (selectedMediaIds.length === 0) {
      setErrorMessage("No media selected to move.");
      return;
    }

    const targetAlbumId = Number(prompt("Enter target album ID:"));

    if (!Number.isInteger(targetAlbumId) || targetAlbumId <= 0) {
      setErrorMessage("Invalid target album id.");
      return;
    }

    try {
      setIsLoading(true);
      await moveMultipleMedia(selectedMediaIds, targetAlbumId);
      setSelectedMediaIds([]);
      await loadMedia();
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleToggleMediaFavorite(mediaId, currentFavoriteValue) {
    setErrorMessage("");

    try {
      setIsLoading(true);
      await toggleMediaFavorite(mediaId, !currentFavoriteValue);
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

  async function handleDeleteMultipleMedia() {
    setErrorMessage("");

    if (selectedMediaIds.length === 0) {
      setErrorMessage("No media selected for deletion.");
      return;
    }

    if (!window.confirm("Delete selected media?")) {
      return;
    }

    try {
      setIsLoading(true);
      await deleteMultipleMedia(selectedMediaIds);
      setSelectedMediaIds([]);
      await loadMedia();
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsLoading(false);
    }
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
      <button
        type="button"
        onClick={handleMoveMultipleMedia}
        disabled={selectedMediaIds.length === 0}
      >
        Move Selected ({selectedMediaIds.length})
      </button>

      <button
        type="button"
        onClick={handleDeleteMultipleMedia}
        disabled={selectedMediaIds.length === 0}
      >
        Delete Selected ({selectedMediaIds.length})
      </button>

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
            isSelected={selectedMediaIds.includes(file.id)}
            onToggleSelect={handleToggleSelectMedia}
            onToggleFavorite={handleToggleMediaFavorite}
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
