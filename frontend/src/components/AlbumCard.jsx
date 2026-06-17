function AlbumCard({
  album,
  onOpenAlbum,
  onRenameAlbum,
  onAddAlbumLock,
  onRemoveAlbumLock,
  onDeleteAlbum,
}) {
  return (
    <div onClick={() => onOpenAlbum(album)}>
      <div>Album Cover</div>
      <h3>
        {album.name} {album.isLocked && "🔒"}
      </h3>
      <p>Total Files: {album.totalCount || 0}</p>

      {!album.isLocked && (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onAddAlbumLock(album.id);
          }}
        >
          Lock
        </button>
      )}

      <button
        type="button"
        disabled={album.isLocked}
        onClick={(event) => {
          event.stopPropagation();
          const newName = prompt("Enter new album name:", album.name);
          if (newName !== null) {
            onRenameAlbum(album.id, newName);
          }
        }}
      >
        Rename Album
      </button>

      <button
        type="button"
        disabled={album.isLocked}
        onClick={(event) => {
          event.stopPropagation();
          onDeleteAlbum(album.id);
        }}
      >
        Delete Album
      </button>
    </div>
  );
}

export { AlbumCard };
