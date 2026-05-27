import { apiRequest } from "./api.js";

function getAlbumMedia(albumId) {
    return apiRequest(`/api/albums/${albumId}/media`);
}

function uploadMedia(formData) {
    return apiRequest('/api/media', {
        method: 'POST',
        body: formData,
    });
}

export { getAlbumMedia, uploadMedia };
