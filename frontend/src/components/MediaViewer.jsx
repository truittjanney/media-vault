function MediaViewer({ media, onCloseMediaViewer }) {
  return (
    <div>
      <button type="button" onClick={onCloseMediaViewer}>
        Back
      </button>

      {media.type === "image" && (
        <img src={`http://localhost:5001${media.filePath}`} alt={media.name} />
      )}

      {media.type === "video" && (
        <video src={`http://localhost:5001${media.filePath}`} controls />
      )}
    </div>
  );
}

export { MediaViewer };
