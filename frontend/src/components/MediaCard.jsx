function MediaCard({ media, onOpenMedia }) {

return (
        <div onClick={() => onOpenMedia(media.id)}>
            <img
                src={`http://localhost:5001${media.filePath}`}
                alt={media.name}
                />
                <p>{media.name}</p>
        </div>
);
}

export { MediaCard };
