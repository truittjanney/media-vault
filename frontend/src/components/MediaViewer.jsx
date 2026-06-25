function MediaViewer({
  media,
  onSetAlbumCover,
  onShowPreviousMedia,
  onShowNextMedia,
  onOpenMediaOptionsModal,
  onCloseMediaViewer,
}) {
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
              className="media-viewer-options-button"
              type="button"
              aria-label="Media options"
              title="Media options"
              onClick={onOpenMediaOptionsModal}
            >
              ⋯
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
          <div className="media-viewer-navigation-row">
            <button
              className="media-viewer-nav-button"
              type="button"
              onClick={onShowPreviousMedia}
            >
              ←
            </button>

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

            <button
              className="media-viewer-nav-button"
              type="button"
              onClick={onShowNextMedia}
            >
              →
            </button>
          </div>
        </div>
      </article>
    </div>
  );
}

export { MediaViewer };
