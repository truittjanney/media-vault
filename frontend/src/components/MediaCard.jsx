function MediaCard({
  media,
  isSelected,
  onToggleSelect,
  onToggleFavorite,
  onOpenMedia,
  onMoveMedia,
  onDeleteMedia,
}) {
  return (
    <article
      className={`mv-card media-card ${isSelected ? "media-card-selected" : ""}`}
      onClick={() => onOpenMedia(media.id)}
    >
      <div className="media-card-preview">
        {media.type === "image" && (
          <img
            className="media-card-media"
            src={`http://localhost:5001${media.filePath}`}
            alt={media.name}
          />
        )}

        {media.type === "video" && (
          <video
            className="media-card-media"
            src={`http://localhost:5001${media.filePath}`}
            muted
            playsInline
            preload="metadata"
          />
        )}

        <div className="media-card-overlay">
          <label
            className="media-card-select"
            onClick={(event) => event.stopPropagation()}
          >
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => onToggleSelect(media.id)}
            />
            Select
          </label>

          <button
            className={`media-card-favorite ${
              media.isFavorite ? "media-card-favorite-active" : ""
            }`}
            type="button"
            title={
              media.isFavorite ? "Remove from favorites" : "Add to favorites"
            }
            onClick={(event) => {
              event.stopPropagation();
              onToggleFavorite(media.id, media.isFavorite);
            }}
          >
            {media.isFavorite ? "❤️" : "🤍"}
          </button>
        </div>
      </div>

      <div className="media-card-body">
        <p className="media-card-name" title={media.name}>
          {media.name}
        </p>

        <div className="media-card-actions">
          <button
            className="mv-btn mv-btn-secondary mv-btn-small"
            type="button"
            onClick={(event) => {
              event.stopPropagation();

              const targetAlbumId = Number(prompt("Enter target album ID:"));

              if (!Number.isInteger(targetAlbumId) || targetAlbumId <= 0) {
                return;
              }

              onMoveMedia(media.id, targetAlbumId);
            }}
          >
            Move
          </button>

          <button
            className="mv-btn mv-btn-danger mv-btn-small"
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onDeleteMedia(media.id);
            }}
          >
            Delete
          </button>
        </div>
      </div>
    </article>
  );
}

export { MediaCard };
