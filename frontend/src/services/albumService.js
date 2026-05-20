import { apiRequest } from "./api.js";

function getAlbums() {
    return apiRequest('/api/albums');
}

function createAlbum(albumData) {
return apiRequest('/api/albums', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify(albumData),
});
}

export { getAlbums, createAlbum };
