import { apiRequest } from "./api.js";

function getAlbumMedia(albumId) {
    return apiRequest(`/api/album/${albumId}/media`);
}

export { getAlbumMedia };
