function MediaCard({
  media,
  isSelected,
  isSelectionMode,
  onToggleSelect,
  onToggleFavorite,
  onOpenMedia,
}) {
  return (
    <article
      className={`mv-card media-card ${isSelected ? "media-card-selected" : ""}`}
      onClick={() => {
        if (isSelectionMode) {
          onToggleSelect(media.id);
        } else {
          onOpenMedia(media.id);
        }
      }}
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
      </div>
    </article>
  );
}

export { MediaCard };
