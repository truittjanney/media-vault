function MediaViewer({ media, onSetAlbumCover, onCloseMediaViewer }) {
  return (
    <div className="media-viewer-overlay">
      <article className="mv-card mv-card-padded media-viewer-card">
        <header className="media-viewer-header">
          <div>
            <h2 className="media-viewer-title">Media Viewer</h2>
            <p className="media-viewer-subtitle">
              {media.name || "Not available"}
            </p>
          </div>

          <div className="media-viewer-actions">
            <button
              className="mv-btn mv-btn-primary"
              type="button"
              onClick={() => onSetAlbumCover(media.id)}
            >
              Set as Album Cover
            </button>

            <button
              className="mv-btn mv-btn-secondary"
              type="button"
              onClick={onCloseMediaViewer}
            >
              Close
            </button>
          </div>
        </header>

        <div className="media-viewer-layout">
          <div className="media-viewer-stage">
            {media.type === "image" && (
              <img
                className="media-viewer-media"
                src={`http://localhost:5001${media.filePath}`}
                alt={media.name}
              />
            )}

            {media.type === "video" && (
              <video
                className="media-viewer-media"
                src={`http://localhost:5001${media.filePath}`}
                controls
              />
            )}
          </div>

          <aside className="media-info-panel">
            <h3 className="media-info-title">File Info</h3>

            <div className="media-info-list">
              <div className="media-info-row">
                <span className="media-info-label">Name</span>
                <span className="media-info-value">
                  {media.name || "Not available"}
                </span>
              </div>

              <div className="media-info-row">
                <span className="media-info-label">Type</span>
                <span className="media-info-value">
                  {media.type || "Not available"}
                </span>
              </div>

              <div className="media-info-row">
                <span className="media-info-label">Format</span>
                <span className="media-info-value">
                  {media.format || "Not available"}
                </span>
              </div>

              <div className="media-info-row">
                <span className="media-info-label">File size</span>
                <span className="media-info-value">
                  {media.fileSize ? `${media.fileSize} bytes` : "Not available"}
                </span>
              </div>

              <div className="media-info-row">
                <span className="media-info-label">Resolution</span>
                <span className="media-info-value">
                  {media.resolution || "Not available"}
                </span>
              </div>

              <div className="media-info-row">
                <span className="media-info-label">Imported</span>
                <span className="media-info-value">
                  {media.importedTime || "Not available"}
                </span>
              </div>

              <div className="media-info-row">
                <span className="media-info-label">Created</span>
                <span className="media-info-value">
                  {media.createdTime || "Not available"}
                </span>
              </div>
            </div>
          </aside>
        </div>
      </article>
    </div>
  );
}

export { MediaViewer };
