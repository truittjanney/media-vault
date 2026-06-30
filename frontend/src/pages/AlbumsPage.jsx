import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getUserProfile, updateUserProfile } from "../services/userService.js";
import {
  getAlbums,
  verifyAlbumPin,
  createAlbum,
  updateAlbum,
  addAlbumLock,
  removeAlbumLock,
  deleteAlbum,
} from "../services/albumService.js";
import { AlbumCard } from "../components/AlbumCard.jsx";

function AlbumsPage() {
  // ####################################################
  // STATE
  // ####################################################
  const [albums, setAlbums] = useState([]);
  const [albumName, setAlbumName] = useState("");
  const [albumSortPreference, setAlbumSortPreference] = useState("name-asc");
  const [isCreateAlbumModalOpen, setIsCreateAlbumModalOpen] = useState(false);
  const [selectedAlbumForActions, setSelectedAlbumForActions] = useState(null);
  const [isAlbumPinModalOpen, setIsAlbumPinModalOpen] = useState(false);
  const [selectedAlbumForPin, setSelectedAlbumForPin] = useState(null);
  const [albumPinInput, setAlbumPinInput] = useState("");
  const [albumPinError, setAlbumPinError] = useState("");
  const [albumPinModalMode, setAlbumPinModalMode] = useState("open-album");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  // ####################################################
  // FUNCTIONS: DATA LOADING
  // ####################################################
  async function loadUserProfile() {
    setErrorMessage("");

    try {
      setIsLoading(true);
      const data = await getUserProfile();
      setAlbumSortPreference(data.user.albumSortPreference);
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  }

  async function loadAlbums() {
    setErrorMessage("");

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

  // ####################################################
  // FUNCTIONS: SYNC EVENT HANDLERS
  // ####################################################
  function handleOpenAlbum(album) {
    setErrorMessage("");

    if (album.isLocked) {
      handleOpenAlbumPinModal(album, "open-album");
      return;
    }

    navigate(`/albums/${album.id}`);
  }

  function handleOpenCreateAlbumModal() {
    setErrorMessage("");
    setAlbumName("");
    setIsCreateAlbumModalOpen(true);
  }

  function handleCloseCreateAlbumModal() {
    setAlbumName("");
    setIsCreateAlbumModalOpen(false);
  }

  function handleOpenAlbumActionsModal(album) {
    setErrorMessage("");
    setSelectedAlbumForActions(album);
  }

  function handleCloseAlbumActionsModal() {
    setErrorMessage("");
    setSelectedAlbumForActions(null);
  }

  function handleOpenAlbumPinModal(album, mode = "open-album") {
    setErrorMessage("");
    setAlbumPinError("");
    setAlbumPinInput("");
    setSelectedAlbumForPin(album);
    setAlbumPinModalMode(mode);
    setIsAlbumPinModalOpen(true);
  }

  function handleCloseAlbumPinModal() {
    setAlbumPinError("");
    setAlbumPinInput("");
    setSelectedAlbumForPin(null);
    setAlbumPinModalMode("open-album");
    setIsAlbumPinModalOpen(false);
  }

  function handleChangeAlbumPinInput(event) {
    const numbersOnly = event.target.value.replace(/\D/g, "");

    setAlbumPinInput(numbersOnly);
    setAlbumPinError("");
  }

  function logoutUser() {
    localStorage.removeItem("token");
    navigate("/login");
  }

  // ####################################################
  // FUNCTIONS: API EVENT HANDLERS
  // ####################################################
  async function handleAlbumSortOptions(event) {
    setErrorMessage("");

    const newSortPreference = event.target.value;

    setAlbumSortPreference(newSortPreference);

    try {
      await updateUserProfile({
        albumSortPreference: newSortPreference,
      });
    } catch (error) {
      setErrorMessage(error.message);
    }
  }

  async function handleCreateAlbumSubmit(event) {
    event.preventDefault();
    setErrorMessage("");

    const trimmedAlbumName = albumName.trim();

    if (trimmedAlbumName === "") {
      setErrorMessage("Album name cannot be empty");
      return;
    }

    try {
      setIsLoading(true);
      await createAlbum({ name: trimmedAlbumName });
      setAlbumName("");
      setIsCreateAlbumModalOpen(false);
      await loadAlbums();
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSubmitAlbumPin(event) {
    event.preventDefault();
    setAlbumPinError("");

    if (!albumPinInput.trim()) {
      setAlbumPinError("Please enter your PIN.");
      return;
    }

    if (!selectedAlbumForPin) {
      setAlbumPinError("No album selected.");
      return;
    }

    const albumId = selectedAlbumForPin.id;

    try {
      setIsLoading(true);

      if (albumPinModalMode === "open-album") {
        const data = await verifyAlbumPin(albumId, albumPinInput);

        if (!data.verified) {
          setAlbumPinError("Incorrect PIN.");
          return;
        }

        handleCloseAlbumPinModal();
        navigate(`/albums/${albumId}`);
        return;
      }

      if (albumPinModalMode === "add-lock") {
        await addAlbumLock(albumId, albumPinInput);
        handleCloseAlbumPinModal();
        await loadAlbums();
        return;
      }

      if (albumPinModalMode === "remove-lock") {
        await removeAlbumLock(albumId, albumPinInput);
        handleCloseAlbumPinModal();
        await loadAlbums();
        return;
      }
    } catch (error) {
      setAlbumPinError(error.message || "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleRenameAlbum(albumId, newName) {
    setErrorMessage("");

    const trimmedName = newName.trim();

    if (trimmedName === "") {
      setErrorMessage("Album name cannot be empty");
      return;
    }

    try {
      setIsLoading(true);
      await updateAlbum(albumId, { name: trimmedName });
      await loadAlbums();
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDeleteAlbum(albumId) {
    setErrorMessage("");

    if (!window.confirm("Delete this album?")) {
      return;
    }

    try {
      setIsLoading(true);
      await deleteAlbum(albumId);
      await loadAlbums();
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
    loadUserProfile();
    loadAlbums();
  }, []);

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
  const sortedAlbums = [...albums].sort((a, b) => {
    if (albumSortPreference === "name-asc") {
      return a.name.localeCompare(b.name);
    }

    if (albumSortPreference === "name-desc") {
      return b.name.localeCompare(a.name);
    }

    if (albumSortPreference === "created-desc") {
      return new Date(b.createdAt) - new Date(a.createdAt);
    }

    if (albumSortPreference === "updated-desc") {
      return new Date(b.updatedAt) - new Date(a.updatedAt);
    }

    return 0;
  });

  let albumPinModalDescription = "";

  if (selectedAlbumForPin) {
    if (albumPinModalMode === "open-album") {
      albumPinModalDescription = `Enter your PIN to open ${selectedAlbumForPin.name}.`;
    }

    if (albumPinModalMode === "add-lock") {
      albumPinModalDescription = `Enter your PIN to add a lock to ${selectedAlbumForPin.name}.`;
    }

    if (albumPinModalMode === "remove-lock") {
      albumPinModalDescription = `Enter your PIN to remove the lock from ${selectedAlbumForPin.name}.`;
    }
  }

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
      <header className="page-header albums-page-header">
        <div>
          <h1 className="page-title">Albums</h1>
          <p className="page-subtitle">
            Organize, protect, and manage your photos and videos.
          </p>
        </div>

        <div className="albums-header-actions">
          <div className="mv-field albums-header-sort-field">
            <label className="mv-label" htmlFor="albumSortPreference">
              Sort Albums
            </label>
            <select
              className="mv-select"
              id="albumSortPreference"
              value={albumSortPreference}
              onChange={handleAlbumSortOptions}
            >
              <option value="name-asc">A-Z</option>
              <option value="name-desc">Z-A</option>
              <option value="created-desc">Newest Created</option>
              <option value="updated-desc">Recently Updated</option>
            </select>
          </div>

          <button
            className="profile-icon-button"
            type="button"
            aria-label="Profile settings"
            title="Profile settings"
            onClick={() => navigate("/profile")}
          >
            👤
          </button>
        </div>
      </header>

      {errorMessage && !isCreateAlbumModalOpen && !selectedAlbumForActions && (
        <p className="mv-alert mv-alert-error">{errorMessage}</p>
      )}

      {/*
      ######################################
      UI: CREATE ALBUM BUTTON
      ######################################
      */}
      <section className="albums-create-section">
        <button
          className="mv-btn mv-btn-primary"
          type="button"
          onClick={handleOpenCreateAlbumModal}
        >
          + Create Album
        </button>
      </section>

      {isLoading && <p className="mv-status">Loading albums...</p>}

      {!isLoading && !errorMessage && sortedAlbums.length === 0 && (
        <div className="mv-card mv-empty-state">
          <p>No albums yet. Create your first album to get started.</p>
        </div>
      )}

      {/*
      ######################################
      UI: CREATE ALBUM MODAL
      ######################################
      */}
      {isCreateAlbumModalOpen && (
        <div className="mv-modal-overlay" onClick={handleCloseCreateAlbumModal}>
          <section
            className="mv-card mv-card-padded mv-modal-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="createAlbumTitle"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mv-modal-header">
              <h2 className="mv-modal-title" id="createAlbumTitle">
                Create Album
              </h2>
              <p className="mv-modal-subtitle">Name your new album.</p>
            </div>

            {errorMessage && (
              <p className="mv-alert mv-alert-error">{errorMessage}</p>
            )}

            <form className="mv-form" onSubmit={handleCreateAlbumSubmit}>
              <div className="mv-field">
                <label className="mv-label" htmlFor="albumName">
                  Album Name
                </label>
                <input
                  className="mv-input"
                  type="text"
                  id="albumName"
                  value={albumName}
                  onChange={(e) => setAlbumName(e.target.value)}
                />
              </div>

              <div className="mv-modal-actions">
                <button
                  className="mv-btn mv-btn-secondary"
                  type="button"
                  onClick={handleCloseCreateAlbumModal}
                >
                  Cancel
                </button>

                <button
                  className="mv-btn mv-btn-primary"
                  type="submit"
                  disabled={isLoading}
                >
                  Create Album
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {/*
      ######################################
      UI: ALBUM PIN MODAL
      ######################################
      */}
      {isAlbumPinModalOpen && selectedAlbumForPin && (
        <div className="mv-modal-overlay" onClick={handleCloseAlbumPinModal}>
          <section
            className="mv-card mv-card-padded mv-modal-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="albumPinTitle"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mv-modal-header">
              <h2 className="mv-modal-title" id="albumPinTitle">
                Enter Album PIN
              </h2>

              <p className="mv-modal-subtitle">{albumPinModalDescription}</p>
            </div>

            {albumPinError && (
              <p className="mv-alert mv-alert-error">{albumPinError}</p>
            )}

            <form className="mv-form" onSubmit={handleSubmitAlbumPin}>
              <div className="mv-field">
                <label className="mv-label" htmlFor="albumPinInput">
                  Album PIN
                </label>

                <input
                  className="mv-input"
                  type="password"
                  id="albumPinInput"
                  inputMode="numeric"
                  maxLength={4}
                  value={albumPinInput}
                  onChange={handleChangeAlbumPinInput}
                  autoFocus
                />
              </div>

              <div className="mv-modal-actions">
                <button
                  className="mv-btn mv-btn-secondary"
                  type="button"
                  onClick={handleCloseAlbumPinModal}
                >
                  Cancel
                </button>

                <button
                  className="mv-btn mv-btn-primary"
                  type="submit"
                  disabled={isLoading}
                >
                  OK
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {/*
      ######################################
      UI: ALBUM ACTIONS MODAL
      ######################################
      */}
      {selectedAlbumForActions && (
        <div
          className="mv-modal-overlay"
          onClick={handleCloseAlbumActionsModal}
        >
          <section
            className="mv-card mv-card-padded mv-modal-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="albumActionsTitle"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mv-modal-header">
              <h2 className="mv-modal-title" id="albumActionsTitle">
                Album Options
              </h2>

              <p className="mv-modal-subtitle">
                {selectedAlbumForActions.name}
              </p>
            </div>

            <div className="modal-actions-list">
              <div className="modal-action-row">
                <div className="modal-action-text">
                  <p className="modal-action-title">
                    {selectedAlbumForActions.isLocked
                      ? "Remove Lock"
                      : "Lock Album"}
                  </p>

                  <p className="modal-action-description">
                    {selectedAlbumForActions.isLocked
                      ? "Remove PIN protection from this album."
                      : "Require your PIN before opening this album."}
                  </p>
                </div>

                <button
                  className={`album-lock-toggle ${
                    selectedAlbumForActions.isLocked
                      ? "album-lock-toggle-on"
                      : ""
                  }`}
                  type="button"
                  aria-pressed={selectedAlbumForActions.isLocked}
                  onClick={() => {
                    const mode = selectedAlbumForActions.isLocked
                      ? "remove-lock"
                      : "add-lock";

                    handleCloseAlbumActionsModal();
                    handleOpenAlbumPinModal(selectedAlbumForActions, mode);
                  }}
                >
                  <span className="album-lock-toggle-track">
                    <span className="album-lock-toggle-thumb" />
                  </span>

                  <span className="album-lock-toggle-text">
                    {selectedAlbumForActions.isLocked ? "Locked" : "Unlocked"}
                  </span>
                </button>
              </div>

              <div className="modal-action-row">
                <div className="modal-action-text">
                  <p className="modal-action-title">Rename Album</p>
                  <p className="modal-action-description">
                    Change the display name for this album.
                  </p>
                </div>

                <button
                  className="mv-btn mv-btn-secondary"
                  type="button"
                  onClick={async () => {
                    const newName = prompt(
                      "Enter new album name:",
                      selectedAlbumForActions.name,
                    );

                    if (newName !== null) {
                      await handleRenameAlbum(
                        selectedAlbumForActions.id,
                        newName,
                      );
                      handleCloseAlbumActionsModal();
                    }
                  }}
                >
                  Rename
                </button>
              </div>

              <div className="modal-action-row">
                <div className="modal-action-text">
                  <p className="modal-action-title">Delete Album</p>
                  <p className="modal-action-description">
                    Permanently delete this album and its media records.
                  </p>
                </div>

                <button
                  className="mv-btn mv-btn-danger"
                  type="button"
                  onClick={async () => {
                    await handleDeleteAlbum(selectedAlbumForActions.id);
                    handleCloseAlbumActionsModal();
                  }}
                >
                  Delete
                </button>
              </div>
            </div>

            <div className="mv-modal-actions">
              <button
                className="mv-btn mv-btn-secondary"
                type="button"
                onClick={handleCloseAlbumActionsModal}
              >
                Close
              </button>
            </div>
          </section>
        </div>
      )}

      {/*
      ######################################
      UI: ALBUMS GRID
      ######################################
      */}
      {sortedAlbums.length > 0 && (
        <section className="albums-grid">
          {sortedAlbums.map((album) => (
            <AlbumCard
              key={album.id}
              album={album}
              onOpenAlbum={handleOpenAlbum}
              onOpenAlbumActions={handleOpenAlbumActionsModal}
            />
          ))}
        </section>
      )}
    </main>
  );
}

export { AlbumsPage };
