function AlbumCard({ album, onOpenAlbum }) {
    
    return (
        <div onClick={() => onOpenAlbum(album.id)}>
            <div>Album Cover</div>
            <h3>{album.name}</h3>
            <p># of files</p>
        </div>
    );
}

export { AlbumCard };
