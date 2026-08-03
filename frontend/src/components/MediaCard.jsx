function MediaCard({
  media,
  isSelected,
  isSelectionMode,
  onToggleSelect,
  onToggleFavorite,
  onOpenMedia,
  heartRedIcon,
  heartOutlineIcon,
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
          <img className="media-card-media" src={media.url} alt={media.name} />
        )}

        {media.type === "video" && (
          <video
            className="media-card-media"
            src={media.url}
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
            {media.isFavorite ? (
              <img src={heartRedIcon} alt="Favorite" className="mv-icon" />
            ) : (
              <img
                src={heartOutlineIcon}
                alt="Not Favorite"
                className="mv-icon"
              />
            )}
          </button>
        </div>
      </div>
    </article>
  );
}

export { MediaCard };
