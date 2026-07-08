function AlbumCard({ album, onOpenAlbum, onOpenAlbumActions }) {
  const albumCoverMedia = album.albumCoverMedia;

  return (
    <article
      className={`mv-card album-card ${album.isLocked ? "album-card-locked" : ""}`}
      onClick={() => onOpenAlbum(album)}
    >
      <div className="album-card-cover">
        <button
          className="album-card-options-button"
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onOpenAlbumActions(album);
          }}
        >
          ⋯
        </button>

        {albumCoverMedia?.type === "image" && (
          <img
            className="album-card-cover-media"
            src={albumCoverMedia.url}
            alt={`${album.name} album cover`}
          />
        )}

        {albumCoverMedia?.type === "video" && (
          <video
            className="album-card-cover-media"
            src={albumCoverMedia.url}
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
      </div>
    </article>
  );
}

export { AlbumCard };
