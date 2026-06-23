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
      <header className="page-header">
        <div>
          <h1 className="page-title">Albums</h1>
          <p className="page-subtitle">
            Organize, protect, and manage your private media.
          </p>
        </div>

        <button
          className="mv-btn mv-btn-secondary"
          type="button"
          onClick={logoutUser}
        >
          Logout
        </button>
      </header>

      {errorMessage && !isCreateAlbumModalOpen && (
        <p className="mv-alert mv-alert-error">{errorMessage}</p>
      )}

      <section className="mv-card mv-card-padded albums-controls-card">
        <div className="albums-controls-row">
          <div className="albums-controls-actions">
            <button
              className="mv-btn mv-btn-primary"
              type="button"
              onClick={handleOpenCreateAlbumModal}
            >
              Create Album
            </button>
          </div>

          <div className="mv-field albums-sort-field">
            <label className="mv-label" htmlFor="albumSortPreference">
              Sort albums
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
        </div>
      </section>

      {isLoading && <p className="mv-status">Loading albums...</p>}

      {!isLoading && !errorMessage && sortedAlbums.length === 0 && (
        <div className="mv-card mv-empty-state">
          <p>No albums yet. Create your first album to get started.</p>
        </div>
      )}

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
              <p className="mv-modal-subtitle">
                Name your new private media album.
              </p>
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

      {sortedAlbums.length > 0 && (
        <section className="albums-grid">
          {sortedAlbums.map((album) => (
            <AlbumCard
              key={album.id}
              album={album}
              onOpenAlbum={handleOpenAlbum}
              onAddAlbumLock={handleAddAlbumLock}
              onRemoveAlbumLock={handleRemoveAlbumLock}
              onRenameAlbum={handleRenameAlbum}
              onDeleteAlbum={handleDeleteAlbum}
            />
          ))}
        </section>
      )}
    </main>
  );
}

export { AlbumsPage };
