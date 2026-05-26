import { apiRequest } from "./api.js";

function getAlbumMedia(albumId) {
    return apiRequest(`/api/albums/${albumId}/media`);
}

export { getAlbumMedia };
