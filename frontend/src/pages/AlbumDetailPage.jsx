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
  const [album, setAlbum] = useState(null);
  const [media, setMedia] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [selectedMediaIds, setSelectedMediaIds] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const { id } = useParams();
  const navigate = useNavigate();

  const MAX_UPLOAD_FILES = 50;

  // ####################################################
  // FUNCTIONS / EVENT HANDLERS
  // ####################################################

  // DATA LOADING
  async function loadMedia() {
    setErrorMessage("");

    try {
      setIsLoading(true);
      const data = await getAlbumMedia(id);
      setAlbum(data.album || null);
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

  function handleChooseMediaFiles(event) {
    const files = Array.from(event.target.files);
    addFilesToSelection(files);
  }

  function handleDragOver(event) {
    event.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave(event) {
    setIsDragging(false);
  }

  function handleFileDrop(event) {
    event.preventDefault();
    setIsDragging(false);

    const droppedFiles = Array.from(event.dataTransfer.files);
    addFilesToSelection(droppedFiles);
  }

  function addFilesToSelection(newFiles) {
    setErrorMessage("");

    if (selectedFiles.length + newFiles.length > MAX_UPLOAD_FILES) {
      setErrorMessage(
        `You can upload up to ${MAX_UPLOAD_FILES} files at a time.`,
      );
      return;
    }

    setSelectedFiles((previousFiles) => [...previousFiles, ...newFiles]);
  }

  function handleSelectAllMedia() {
    setSelectedMediaIds(media.map((file) => file.id));
  }

  function handleCancelMediaSelection() {
    setSelectedMediaIds([]);
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

    if (selectedFiles.length === 0) {
      setErrorMessage("Please select at least one file to upload.");
      return;
    }

    if (selectedFiles.length > MAX_UPLOAD_FILES) {
      setErrorMessage(
        `You can upload up to ${MAX_UPLOAD_FILES} files at a time.`,
      );
      return;
    }

    const formData = new FormData();
    formData.append("albumId", id);

    selectedFiles.forEach((file) => {
      formData.append("media", file);
    });

    try {
      setIsLoading(true);
      await uploadMedia(formData);
      setSelectedFiles([]);
      event.target.reset();
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

    const targetAlbumInput = prompt("Enter target album ID:");

    if (targetAlbumInput === null) {
      return;
    }

    const targetAlbumId = Number(targetAlbumInput);

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

  useEffect(() => {
    if (!errorMessage) {
      return;
    }

    const timer = setTimeout(() => {
      setErrorMessage("");
    }, 5000);

    return () => clearTimeout(timer);
  }, [errorMessage]);

  // ####################################################
  // DERIVED VALUES
  // ####################################################
  const imageCount = media.filter((file) => file.type === "image").length;
  const videoCount = media.filter((file) => file.type === "video").length;
  const isSelectionMode = selectedMediaIds.length > 0;

  // ####################################################
  // USER INTERFACE
  // ####################################################
  return (
    <main className="page-container">
      <header className="page-header">
        <div>
          <h1 className="page-title">{album?.name || "Album"}</h1>

          <p className="page-subtitle">
            Manage this album’s photos, videos, uploads, and selected media.
          </p>

          <div className="album-detail-summary">
            <span className="album-stat-pill">📸 Images: {imageCount}</span>
            <span className="album-stat-pill">🎥 Videos: {videoCount}</span>
          </div>
        </div>

        <button
          className="mv-btn mv-btn-secondary"
          type="button"
          onClick={handleBackToAlbums}
        >
          Back to Albums
        </button>
      </header>

      {errorMessage && (
        <p className="mv-alert mv-alert-error">{errorMessage}</p>
      )}

      {selectedMediaIds.length > 0 && (
        <section className="mv-card mv-card-padded selected-toolbar">
          <p className="selected-toolbar-text">
            {selectedMediaIds.length} item(s) selected
          </p>

          <div className="selected-toolbar-actions">
            <button
              className="mv-btn mv-btn-secondary"
              type="button"
              onClick={handleSelectAllMedia}
            >
              Select All
            </button>

            <button
              className="mv-btn mv-btn-secondary"
              type="button"
              onClick={handleMoveMultipleMedia}
            >
              ➡️ Move To
            </button>

            <button
              className="mv-btn mv-btn-secondary"
              type="button"
              onClick={handleDeleteMultipleMedia}
            >
              🗑️ Delete Selected
            </button>

            <button
              className="mv-btn mv-btn-secondary"
              type="button"
              onClick={handleCancelMediaSelection}
            >
              Cancel
            </button>
          </div>
        </section>
      )}

      <section className="mv-card mv-card-padded upload-card">
        <form className="mv-form" onSubmit={handleUploadMedia}>
          <div
            className={`upload-drop-zone ${
              isDragging ? "upload-drop-zone-active" : ""
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleFileDrop}
          >
            {isDragging ? (
              <p className="upload-drop-title">Drop files here</p>
            ) : (
              <>
                <p className="upload-drop-title">Drag and drop files here</p>
                <p className="upload-drop-subtitle">
                  Or choose photos/videos below. Up to {MAX_UPLOAD_FILES} files
                  at a time.
                </p>
              </>
            )}

            <input
              className="upload-file-input"
              type="file"
              accept="image/*,video/*"
              multiple
              onChange={handleChooseMediaFiles}
            />
          </div>

          <div className="upload-actions">
            <p className="upload-count">
              {selectedFiles.length} / {MAX_UPLOAD_FILES} file(s) selected
            </p>

            <button
              className="mv-btn mv-btn-primary"
              type="submit"
              disabled={isLoading}
            >
              Upload
            </button>
          </div>
        </form>
      </section>

      {isLoading && <p className="mv-status">Loading media...</p>}

      {!isLoading && !errorMessage && media.length === 0 && (
        <div className="mv-card mv-empty-state">
          <p>No media content yet. Upload your first photo or video.</p>
        </div>
      )}

      {media.length > 0 && (
        <section className="media-grid">
          {media.map((file) => (
            <MediaCard
              key={file.id}
              media={file}
              isSelected={selectedMediaIds.includes(file.id)}
              isSelectionMode={isSelectionMode}
              onToggleSelect={handleToggleSelectMedia}
              onToggleFavorite={handleToggleMediaFavorite}
              onOpenMedia={handleOpenMedia}
            />
          ))}
        </section>
      )}

      {selectedMedia && (
        <section className="media-viewer-section">
          <MediaViewer
            media={selectedMedia}
            onSetAlbumCover={handleSetAlbumCover}
            onCloseMediaViewer={handleCloseMediaViewer}
          />
        </section>
      )}
    </main>
  );
}

export { AlbumDetailPage };
