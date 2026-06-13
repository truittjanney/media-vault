import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getUserProfile, updateUserProfile } from "../services/userService.js";
import {
  getAlbums,
  createAlbum,
  updateAlbum,
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
  function handleOpenAlbum(albumId) {
    setErrorMessage("");
    navigate(`/albums/${albumId}`);
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

    if (albumName.trim() === "") {
      setErrorMessage("Album name cannot be empty");
      return;
    }

    try {
      setIsLoading(true);
      await createAlbum({ name: albumName });
      setAlbumName("");
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
    <div>
      <h1>Albums</h1>

      <button type="button" onClick={logoutUser}>
        Logout
      </button>

      <label htmlFor="albumSortPreference">Sort albums:</label>
      <select
        id="albumSortPreference"
        value={albumSortPreference}
        onChange={handleAlbumSortOptions}
      >
        <option value="name-asc">A-Z</option>
        <option value="name-desc">Z-A</option>
        <option value="created-desc">Newest Created</option>
        <option value="updated-desc">Recently Updated</option>
      </select>

      <div>
        {sortedAlbums.map((album) => (
          <AlbumCard
            key={album.id}
            album={album}
            onOpenAlbum={handleOpenAlbum}
            onRenameAlbum={handleRenameAlbum}
            onDeleteAlbum={handleDeleteAlbum}
          />
        ))}
      </div>

      {isLoading && <p>Loading albums...</p>}

      {errorMessage && <p>{errorMessage}</p>}

      {!isLoading && !errorMessage && sortedAlbums.length === 0 && (
        <p>No albums yet</p>
      )}

      <form onSubmit={handleCreateAlbumSubmit}>
        <label htmlFor="albumName">Album Name:</label>
        <input
          type="text"
          id="albumName"
          value={albumName}
          onChange={(e) => setAlbumName(e.target.value)}
        />
        <button type="submit" disabled={isLoading}>
          Create Album
        </button>
      </form>
    </div>
  );
}

export { AlbumsPage };
