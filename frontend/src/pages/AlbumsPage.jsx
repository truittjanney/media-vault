import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  // ####################################################
  // FUNCTIONS / EVENT HANDLERS
  // ####################################################
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

  function handleOpenAlbum(albumId) {
    setErrorMessage("");
    navigate(`/albums/${albumId}`);
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

  function logoutUser() {
    localStorage.removeItem("token");
    navigate("/login");
  }

  // ####################################################
  // EFFECTS
  // ####################################################
  useEffect(() => {
    loadAlbums();
  }, []);

  // ####################################################
  // USER INTERFACE
  // ####################################################
  return (
    <div>
      <h1>Albums</h1>

      <button type="button" onClick={logoutUser}>
        Logout
      </button>

      <div>
        {albums.map((album) => (
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

      {!isLoading && !errorMessage && albums.length === 0 && (
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
