function AlbumCard({ album, onOpenAlbum, onRenameAlbum,onDeleteAlbum }) {
    
    return (
        <div onClick={() => onOpenAlbum(album.id)}>
            <div>Album Cover</div>
            <h3>{album.name}</h3>
            <p># of files</p>

            <button onClick={(event) => {
                event.stopPropagation();
                const newName = prompt('Enter new album name:', album.name);
                if (newName !== null) {
                    onRenameAlbum(album.id, newName);
                }
            }}>
                Rename Album
            </button>

            <button onClick={(event) => {
                event.stopPropagation();
                onDeleteAlbum(album.id);
            }}>
                Delete Album
                </button>
        </div>
    );
}

export { AlbumCard };
