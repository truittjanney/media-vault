function AlbumCard({ album, onOpenAlbum, onDeleteAlbum }) {
    
    return (
        <div onClick={() => onOpenAlbum(album.id)}>
            <div>Album Cover</div>
            <h3>{album.name}</h3>
            <p># of files</p>

            <button onClick={(event) => {
                event.stopPropagation();
                onDeleteAlbum(album.id);
            }}>
                Delete Album</button>
        </div>
    );
}

export { AlbumCard };
