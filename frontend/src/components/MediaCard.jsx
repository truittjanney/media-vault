function MediaCard({ media, onOpenMedia, onMoveMedia, onDeleteMedia }) {
  return (
    <div onClick={() => onOpenMedia(media.id)}>
      {media.type === "image" && (
        <img src={`http://localhost:5001${media.filePath}`} alt={media.name} />
      )}

      {media.type === "video" && (
        <video src={`http://localhost:5001${media.filePath}`} controls />
      )}

      <p>{media.name}</p>

      <button
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
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onDeleteMedia(media.id);
        }}
      >
        Delete
      </button>
    </div>
  );
}

export { MediaCard };
