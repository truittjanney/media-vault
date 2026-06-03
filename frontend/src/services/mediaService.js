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

function moveMedia(mediaId, targetAlbumId) {
    return apiRequest(`/api/media/${mediaId}/move`, {
        method: "PATCH",
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ targetAlbumId }),
    });
}

function deleteMedia(mediaId) {
    return apiRequest(`/api/media/${mediaId}`, {
        method: 'DELETE',
    });
}

export { getAlbumMedia, uploadMedia, moveMedia, deleteMedia };
