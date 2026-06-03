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

      <div>
        <h2>File Info</h2>

        <p>
          <strong>Name:</strong> {media.name || "Not available"}
        </p>

        <p>
          <strong>Type:</strong> {media.type || "Not available"}
        </p>

        <p>
          <strong>Format:</strong> {media.format || "Not available"}
        </p>

        <p>
          <strong>File size:</strong>{" "}
          {media.fileSize ? `${media.fileSize} bytes` : "Not available"}
        </p>

        <p>
          <strong>Resolution:</strong> {media.resolution || "Not available"}
        </p>

        <p>
          <strong>Imported:</strong> {media.importedTime || "Not available"}
        </p>

        <p>
          <strong>Created:</strong> {media.createdTime || "Not available"}
        </p>
      </div>
    </div>
  );
}

export { MediaViewer };
