import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
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
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  // ####################################################
  // FUNCTIONS / EVENT HANDLERS
  // ####################################################

  // DATA LOADING
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

  // SYNC EVENT HANDLERS
  async function handleOpenAlbum(album) {
    setErrorMessage("");

    if (!album.isLocked) {
      navigate(`/albums/${album.id}`);
      return;
    }

    const pin = prompt("Enter album PIN:");

    if (!pin) {
      return;
    }

    try {
      const data = await verifyAlbumPin(album.id, pin);

      if (data.verified) {
        navigate(`/albums/${album.id}`);
      }
    } catch (error) {
      setErrorMessage(error.message);
    }
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

  function logoutUser() {
    localStorage.removeItem("token");
    navigate("/login");
  }

  // API EVENT HANDLERS
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

  async function handleAddAlbumLock(albumId) {
    setErrorMessage("");

    const pin = prompt("Enter a 4-digit album PIN:");

    if (!pin) {
      return;
    }

    try {
      setIsLoading(true);
      await addAlbumLock(albumId, pin);
      await loadAlbums();
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleRemoveAlbumLock(albumId) {
    setErrorMessage("");

    const pin = prompt("Enter your album PIN:");

    if (!pin) {
      return;
    }

    try {
      setIsLoading(true);
      await removeAlbumLock(albumId, pin);
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

  // ####################################################
  // USER INTERFACE
  // ####################################################
  return (
    <main className="page-container">
      {/* Page Header & Subheader */}
      <header className="page-header albums-page-header">
        <div>
          <h1 className="page-title">Albums</h1>
          <p className="page-subtitle">
            Organize, protect, and manage your private media.
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

          {/* Profile Settings Button */}
          <button
            className="mv-btn mv-btn-secondary"
            type="button"
            onClick={() => navigate("/profile")}
          >
            👤 Profile
          </button>
        </div>
      </header>

      {errorMessage && !isCreateAlbumModalOpen && !selectedAlbumForActions && (
        <p className="mv-alert mv-alert-error">{errorMessage}</p>
      )}

      {/* Create Album Button */}
      <section className="mv-card mv-card-padded albums-create-card">
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

      {/* Create Album Modal */}
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

      {/* Album Actions Modal */}
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

            <div className="album-actions-list">
              <div className="album-action-row">
                <div className="album-action-text">
                  <p className="album-action-title">Album Status</p>
                  <p className="album-action-description">
                    {selectedAlbumForActions.isLocked ? "Locked" : "Unlocked"}
                  </p>
                </div>
              </div>

              <div className="album-action-row">
                <div className="album-action-text">
                  <p className="album-action-title">
                    {selectedAlbumForActions.isLocked
                      ? "Remove Lock"
                      : "Lock Album"}
                  </p>

                  <p className="album-action-description">
                    {selectedAlbumForActions.isLocked
                      ? "Remove PIN protection from this album."
                      : "Require your PIN before opening this album."}
                  </p>
                </div>

                <button
                  className="mv-btn mv-btn-secondary"
                  type="button"
                  onClick={async () => {
                    if (selectedAlbumForActions.isLocked) {
                      await handleRemoveAlbumLock(selectedAlbumForActions.id);
                    } else {
                      await handleAddAlbumLock(selectedAlbumForActions.id);
                    }

                    handleCloseAlbumActionsModal();
                  }}
                >
                  {selectedAlbumForActions.isLocked ? "Remove Lock" : "Lock"}
                </button>
              </div>

              <div className="album-action-row">
                <div className="album-action-text">
                  <p className="album-action-title">Rename Album</p>
                  <p className="album-action-description">
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

              <div className="album-action-row">
                <div className="album-action-text">
                  <p className="album-action-title">Delete Album</p>
                  <p className="album-action-description">
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

      {/* Albums Grid */}
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
