function MediaCard({ media, onOpenMedia, onDeleteMedia }) {
    
  return (
    <div onClick={() => onOpenMedia(media.id)}>
      {media.type === "image" && (
        <img
          src={`http://localhost:5001${media.filePath}`}
          alt={media.name}
        />
      )}

      {media.type === "video" && (
        <video
          src={`http://localhost:5001${media.filePath}`}
          controls
        />
      )}

      <p>{media.name}</p>

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
