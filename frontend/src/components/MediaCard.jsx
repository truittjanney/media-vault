function MediaCard({ media, onOpenMedia, onDeleteMedia }) {

return (
        <div onClick={() => onOpenMedia(media.id)}>
            <img
                src={`http://localhost:5001${media.filePath}`}
                alt={media.name}
                />
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
