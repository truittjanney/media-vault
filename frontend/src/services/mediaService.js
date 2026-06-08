import { apiRequest } from "./api.js";

function getAlbumMedia(albumId) {
  return apiRequest(`/api/albums/${albumId}/media`);
}

function uploadMedia(formData) {
  return apiRequest("/api/media", {
    method: "POST",
    body: formData,
  });
}

function moveMedia(mediaId, targetAlbumId) {
  return apiRequest(`/api/media/${mediaId}/move`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ targetAlbumId }),
  });
}

function moveMultipleMedia(mediaIds, targetAlbumId) {
  return apiRequest("/api/media/move", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ mediaIds, targetAlbumId }),
  });
}

function deleteMedia(mediaId) {
  return apiRequest(`/api/media/${mediaId}`, {
    method: "DELETE",
  });
}

function deleteMultipleMedia(mediaIds) {
  return apiRequest("/api/media/", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ mediaIds }),
  });
}

export {
  getAlbumMedia,
  uploadMedia,
  moveMedia,
  moveMultipleMedia,
  deleteMedia,
  deleteMultipleMedia,
};
