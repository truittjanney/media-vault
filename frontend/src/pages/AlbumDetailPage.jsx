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
import { getAlbums, updateAlbum } from "../services/albumService.js";
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
  const [isMediaOptionsModalOpen, setIsMediaOptionsModalOpen] = useState(false);
  const [isMoveMediaModalOpen, setIsMoveMediaModalOpen] = useState(false);
  const [mediaIdsToMove, setMediaIdsToMove] = useState([]);
  const [availableAlbums, setAvailableAlbums] = useState([]);
  const [isDeleteSelectedModalOpen, setIsDeleteSelectedModalOpen] =
    useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const { id } = useParams();
  const navigate = useNavigate();

  const MAX_UPLOAD_FILES = 50;

  // ####################################################
  // FUNCTIONS: DATA LOADING
  // ####################################################
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

  async function loadAvailableAlbums() {
    setErrorMessage("");

    try {
      const data = await getAlbums();
      setAvailableAlbums(data.albums || []);
    } catch (error) {
      setErrorMessage(error.message);
    }
  }

  // ####################################################
  // FUNCTIONS: SYNC EVENT HANDLERS
  // ####################################################
  function handleOpenMedia(mediaId) {
    const clickedMedia = media.find((file) => file.id === mediaId);

    if (!clickedMedia) {
      return;
    }

    setSelectedMedia(clickedMedia);
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

  function handleShowPreviousMedia() {
    if (!selectedMedia || media.length === 0) {
      return;
    }

    const currentIndex = media.findIndex(
      (file) => file.id === selectedMedia.id,
    );

    if (currentIndex === -1) {
      return;
    }

    const previousIndex =
      currentIndex === 0 ? media.length - 1 : currentIndex - 1;

    setSelectedMedia(media[previousIndex]);
  }

  function handleShowNextMedia() {
    if (!selectedMedia || media.length === 0) {
      return;
    }

    const currentIndex = media.findIndex(
      (file) => file.id === selectedMedia.id,
    );

    if (currentIndex === -1) {
      return;
    }

    const nextIndex = currentIndex === media.length - 1 ? 0 : currentIndex + 1;

    setSelectedMedia(media[nextIndex]);
  }

  function handleOpenMediaOptionsModal() {
    setErrorMessage("");
    setIsMediaOptionsModalOpen(true);
  }

  function handleCloseMediaOptionsModal() {
    setErrorMessage("");
    setIsMediaOptionsModalOpen(false);
  }

  function handleOpenMoveMediaModal(mediaIds) {
    setErrorMessage("");
    setMediaIdsToMove(mediaIds);
    setIsMoveMediaModalOpen(true);
  }

  function handleCloseMoveMediaModal() {
    setErrorMessage("");
    setMediaIdsToMove([]);
    setIsMoveMediaModalOpen(false);
  }

  function handleOpenDeleteSelectedModal() {
    setErrorMessage("");

    if (selectedMediaIds.length === 0) {
      setErrorMessage("No media selected for deletion.");
      return;
    }

    setIsDeleteSelectedModalOpen(true);
  }

  function handleCloseDeleteSelectedModal() {
    setErrorMessage("");
    setIsDeleteSelectedModalOpen(false);
  }

  function handleCloseMediaViewer() {
    setSelectedMedia(null);
    setIsMediaOptionsModalOpen(false);
    setIsMoveMediaModalOpen(false);
    setMediaIdsToMove([]);
  }

  // ####################################################
  // FUNCTIONS: API EVENT HANDLERS
  // ####################################################
  async function handleSetAlbumCover(mediaId) {
    setErrorMessage("");
    setSuccessMessage("");

    try {
      setIsLoading(true);
      await updateAlbum(id, { albumCoverMediaId: mediaId });
      setSuccessMessage("Album cover updated successfully.");
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

  async function handleConfirmMoveMedia(targetAlbumId) {
    setErrorMessage("");

    if (mediaIdsToMove.length === 0) {
      setErrorMessage("No media selected to move.");
      return;
    }

    if (!Number.isInteger(targetAlbumId) || targetAlbumId <= 0) {
      setErrorMessage("Invalid target album id.");
      return;
    }

    try {
      setIsLoading(true);

      if (mediaIdsToMove.length === 1) {
        await moveMedia(mediaIdsToMove[0], targetAlbumId);
      } else {
        await moveMultipleMedia(mediaIdsToMove, targetAlbumId);
      }

      setSelectedMediaIds([]);
      setSelectedMedia(null);
      handleCloseMoveMediaModal();
      await loadMedia();
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleToggleMediaFavorite(mediaId, currentFavoriteValue) {
    setErrorMessage("");

    const nextFavoriteValue = !currentFavoriteValue;

    try {
      setIsLoading(true);

      await toggleMediaFavorite(mediaId, nextFavoriteValue);

      setSelectedMedia((previousSelectedMedia) => {
        if (!previousSelectedMedia || previousSelectedMedia.id !== mediaId) {
          return previousSelectedMedia;
        }

        return {
          ...previousSelectedMedia,
          isFavorite: nextFavoriteValue,
        };
      });

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

    try {
      setIsLoading(true);
      await deleteMultipleMedia(selectedMediaIds);
      setSelectedMediaIds([]);
      handleCloseDeleteSelectedModal();
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
    if (!isMoveMediaModalOpen) {
      return;
    }

    loadAvailableAlbums();
  }, [isMoveMediaModalOpen]);

  useEffect(() => {
    if (!errorMessage) {
      return;
    }

    const timer = setTimeout(() => {
      setErrorMessage("");
    }, 5000);

    return () => clearTimeout(timer);
  }, [errorMessage]);

  useEffect(() => {
    if (!successMessage) {
      return;
    }

    const timer = setTimeout(() => {
      setSuccessMessage("");
    }, 5000);

    return () => clearTimeout(timer);
  }, [successMessage]);

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
      {/*
      ######################################
      UI: PAGE HEADER & SUBHEADER
      ######################################
      */}
      <header className="page-header">
        <div>
          <h1 className="page-title">{album?.name || "Album"}</h1>

          <p className="page-subtitle">
            Manage this album’s photos, videos, and uploads.
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

      {successMessage && (
        <p className="mv-alert mv-alert-success">{successMessage}</p>
      )}

      {/*
      ######################################
      UI: SELECTED TOOLBAR ACTIONS
      ######################################
      */}
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
              onClick={() => handleOpenMoveMediaModal(selectedMediaIds)}
            >
              ➡️ Move To
            </button>

            <button
              className="mv-btn mv-btn-secondary"
              type="button"
              onClick={handleOpenDeleteSelectedModal}
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

      {/*
      ######################################
      UI: UPLOAD DROP ZONE
      ######################################
      */}
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

          {selectedFiles.length > 0 && (
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
          )}
        </form>
      </section>

      {isLoading && <p className="mv-status">Loading media...</p>}

      {!isLoading && !errorMessage && media.length === 0 && (
        <div className="mv-card mv-empty-state">
          <p>No media content yet. Upload your first photo or video.</p>
        </div>
      )}

      {/*
      ######################################
      UI: MEDIA OPTIONS MODAL
      ######################################
      */}
      {selectedMedia && isMediaOptionsModalOpen && (
        <div
          className="mv-modal-overlay"
          onClick={handleCloseMediaOptionsModal}
        >
          <section
            className="mv-card mv-card-padded mv-modal-card mv-modal-card-wide"
            role="dialog"
            aria-modal="true"
            aria-labelledby="mediaOptionsTitle"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mv-modal-header">
              <h2 className="mv-modal-title" id="mediaOptionsTitle">
                Media Options
              </h2>

              {successMessage && (
                <p className="mv-alert mv-alert-success">{successMessage}</p>
              )}

              {errorMessage && (
                <p className="mv-alert mv-alert-error">{errorMessage}</p>
              )}

              <p className="mv-modal-subtitle">
                {selectedMedia.name || "Not available"}
              </p>
            </div>

            <div className="modal-actions-list">
              <div className="modal-action-row">
                <div className="modal-action-text">
                  <p className="modal-action-title">Set as Album Cover</p>
                  <p className="modal-action-description">
                    Use this media item as the album cover.
                  </p>
                </div>

                <button
                  className="mv-btn mv-btn-secondary modal-action-button"
                  type="button"
                  onClick={async () => {
                    await handleSetAlbumCover(selectedMedia.id);
                  }}
                >
                  Set Cover
                </button>
              </div>

              <div className="modal-action-row">
                <div className="modal-action-text">
                  <p className="modal-action-title">
                    {selectedMedia.isFavorite ? "Remove Favorite" : "Favorite"}
                  </p>
                  <p className="modal-action-description">
                    {selectedMedia.isFavorite
                      ? "Remove this media item from your favorites."
                      : "Mark this media item as a favorite."}
                  </p>
                </div>

                <button
                  className={`mv-btn mv-btn-secondary modal-action-button ${selectedMedia.isFavorite ? "modal-action-button-active" : ""}`}
                  type="button"
                  aria-label={
                    selectedMedia.isFavorite ? "Remove favorite" : "Favorite"
                  }
                  title={
                    selectedMedia.isFavorite ? "Remove favorite" : "Favorite"
                  }
                  aria-pressed={selectedMedia.isFavorite}
                  disabled={isLoading}
                  onClick={async () => {
                    await handleToggleMediaFavorite(
                      selectedMedia.id,
                      selectedMedia.isFavorite,
                    );
                  }}
                >
                  {selectedMedia.isFavorite ? "❤️" : "♡"}
                </button>
              </div>

              <div className="modal-action-row">
                <div className="modal-action-text">
                  <p className="modal-action-title">Move To</p>
                  <p className="modal-action-description">
                    Move this media item to another album.
                  </p>
                </div>

                <button
                  className="mv-btn mv-btn-secondary modal-action-button"
                  type="button"
                  onClick={() => {
                    handleCloseMediaOptionsModal();
                    handleOpenMoveMediaModal([selectedMedia.id]);
                  }}
                >
                  Move To
                </button>
              </div>

              <div className="modal-action-row">
                <div className="modal-action-text">
                  <p className="modal-action-title">Delete</p>
                  <p className="modal-action-description">
                    Permanently remove this media item from the album.
                  </p>
                </div>

                <button
                  className="mv-btn mv-btn-danger modal-action-button"
                  type="button"
                  onClick={async () => {
                    await handleDeleteMedia(selectedMedia.id);
                    handleCloseMediaOptionsModal();
                  }}
                >
                  Delete
                </button>
              </div>
            </div>

            {/*
      ######################################
      UI: MEDIA OPTIONS MODAL (FILE INFO)
      ######################################
      */}
            <details className="media-info-details">
              <summary className="media-info-summary">File Info</summary>

              <div className="media-info-panel">
                <h3 className="media-info-title">File Info</h3>

                <div className="media-info-list">
                  <div className="media-info-row">
                    <span className="media-info-label">Name</span>
                    <span className="media-info-value">
                      {selectedMedia.name || "Not available"}
                    </span>
                  </div>

                  <div className="media-info-row">
                    <span className="media-info-label">Type</span>
                    <span className="media-info-value">
                      {selectedMedia.type || "Not available"}
                    </span>
                  </div>

                  <div className="media-info-row">
                    <span className="media-info-label">Format</span>
                    <span className="media-info-value">
                      {selectedMedia.format || "Not available"}
                    </span>
                  </div>

                  <div className="media-info-row">
                    <span className="media-info-label">File size</span>
                    <span className="media-info-value">
                      {selectedMedia.fileSize
                        ? `${selectedMedia.fileSize} bytes`
                        : "Not available"}
                    </span>
                  </div>

                  <div className="media-info-row">
                    <span className="media-info-label">Resolution</span>
                    <span className="media-info-value">
                      {selectedMedia.resolution || "Not available"}
                    </span>
                  </div>

                  <div className="media-info-row">
                    <span className="media-info-label">Imported</span>
                    <span className="media-info-value">
                      {selectedMedia.importedTime || "Not available"}
                    </span>
                  </div>

                  <div className="media-info-row">
                    <span className="media-info-label">Created</span>
                    <span className="media-info-value">
                      {selectedMedia.createdTime || "Not available"}
                    </span>
                  </div>
                </div>
              </div>
            </details>

            <div className="mv-modal-actions">
              <button
                className="mv-btn mv-btn-secondary"
                type="button"
                onClick={handleCloseMediaOptionsModal}
              >
                Close
              </button>
            </div>
          </section>
        </div>
      )}

      {/*
      ######################################
      UI: MOVE MEDIA MODAL
      ######################################
      */}
      {isMoveMediaModalOpen && (
        <div className="mv-modal-overlay" onClick={handleCloseMoveMediaModal}>
          <section
            className="mv-card mv-card-padded mv-modal-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="moveMediaTitle"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mv-modal-header">
              <h2 className="mv-modal-title" id="moveMediaTitle">
                Move To Album
              </h2>

              <p className="mv-modal-subtitle">
                Choose where to move {mediaIdsToMove.length} item(s).
              </p>
            </div>

            <div className="modal-actions-list">
              {availableAlbums.map((targetAlbum) => {
                const isCurrentAlbum = targetAlbum.id === Number(id);

                return (
                  <div
                    className={`modal-action-row ${
                      isCurrentAlbum ? "modal-action-row-disabled" : ""
                    }`}
                    key={targetAlbum.id}
                  >
                    <div className="modal-action-text">
                      <p className="modal-action-title">
                        {targetAlbum.name} {targetAlbum.isLocked && "🔒"}
                      </p>

                      <p className="modal-action-description">
                        {isCurrentAlbum
                          ? "Current album"
                          : `${targetAlbum.totalCount || 0} file(s)`}
                      </p>
                    </div>

                    <button
                      className="mv-btn mv-btn-secondary"
                      type="button"
                      disabled={isCurrentAlbum || isLoading}
                      onClick={() => handleConfirmMoveMedia(targetAlbum.id)}
                    >
                      {isCurrentAlbum ? "Current" : "Move Here"}
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="mv-modal-actions">
              <button
                className="mv-btn mv-btn-secondary"
                type="button"
                onClick={handleCloseMoveMediaModal}
              >
                Cancel
              </button>
            </div>
          </section>
        </div>
      )}

      {/*
      ######################################
      UI: DELETE SELECTED MEDIA MODAL
      ######################################
      */}
      {isDeleteSelectedModalOpen && (
        <div
          className="mv-modal-overlay"
          onClick={handleCloseDeleteSelectedModal}
        >
          <section
            className="mv-card mv-card-padded mv-modal-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="deleteSelectedTitle"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mv-modal-header">
              <h2 className="mv-modal-title" id="deleteSelectedTitle">
                Delete Selected Media
              </h2>

              <p className="mv-modal-subtitle">
                Are you sure you want to delete {selectedMediaIds.length}{" "}
                selected item(s)?
              </p>
            </div>

            <p className="modal-warning-text">
              This will permanently remove the selected media from this album.
            </p>

            <div className="mv-modal-actions">
              <button
                className="mv-btn mv-btn-secondary"
                type="button"
                onClick={handleCloseDeleteSelectedModal}
              >
                Cancel
              </button>

              <button
                className="mv-btn mv-btn-danger"
                type="button"
                disabled={isLoading}
                onClick={handleDeleteMultipleMedia}
              >
                Delete
              </button>
            </div>
          </section>
        </div>
      )}

      {/*
      ######################################
      UI: MEDIA GRID
      ######################################
      */}
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
            onShowPreviousMedia={handleShowPreviousMedia}
            onShowNextMedia={handleShowNextMedia}
            onOpenMediaOptionsModal={handleOpenMediaOptionsModal}
            onCloseMediaViewer={handleCloseMediaViewer}
          />
        </section>
      )}
    </main>
  );
}

export { AlbumDetailPage };
