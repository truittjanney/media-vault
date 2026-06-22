function AlbumCard({
  album,
  onOpenAlbum,
  onRenameAlbum,
  onAddAlbumLock,
  onRemoveAlbumLock,
  onDeleteAlbum,
}) {
  const albumCoverMedia = album.albumCoverMedia;

  return (
    <article
      className={`mv-card album-card ${album.isLocked ? "album-card-locked" : ""}`}
      onClick={() => onOpenAlbum(album)}
    >
      <div className="album-card-cover">
        {albumCoverMedia?.type === "image" && (
          <img
            className="album-card-cover-media"
            src={`http://localhost:5001${albumCoverMedia.filePath}`}
            alt={`${album.name} album cover`}
          />
        )}

        {albumCoverMedia?.type === "video" && (
          <video
            className="album-card-cover-media"
            src={`http://localhost:5001${albumCoverMedia.filePath}`}
            muted
            playsInline
            preload="metadata"
          />
        )}

        {!albumCoverMedia && <span>No Album Cover</span>}
      </div>

      <div className="album-card-body">
        <div className="album-card-title-row">
          <h3 className="album-card-title">{album.name}</h3>

          {album.isLocked && <span className="album-lock-badge">🔒</span>}
        </div>

        <p className="album-card-meta">Total Files: {album.totalCount || 0}</p>

        <div className="album-card-actions">
          {!album.isLocked && (
            <button
              className="mv-btn mv-btn-secondary mv-btn-small"
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onAddAlbumLock(album.id);
              }}
            >
              Lock
            </button>
          )}

          <button
            className="mv-btn mv-btn-secondary mv-btn-small"
            type="button"
            disabled={album.isLocked}
            onClick={(event) => {
              event.stopPropagation();
              const newName = prompt("Enter new album name:", album.name);
              if (newName !== null) {
                onRenameAlbum(album.id, newName);
              }
            }}
          >
            Rename
          </button>

          <button
            className="mv-btn mv-btn-danger mv-btn-small"
            type="button"
            disabled={album.isLocked}
            onClick={(event) => {
              event.stopPropagation();
              onDeleteAlbum(album.id);
            }}
          >
            Delete
          </button>
        </div>
      </div>
    </article>
  );
}

export { AlbumCard };
