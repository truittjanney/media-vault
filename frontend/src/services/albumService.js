import { apiRequest } from "./api.js";

function getAlbums() {
  return apiRequest("/api/albums");
}

function createAlbum(albumData) {
  return apiRequest("/api/albums", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(albumData),
  });
}

function updateAlbum(albumId, albumData) {
  return apiRequest(`/api/albums/${albumId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(albumData),
  });
}

function deleteAlbum(albumId) {
  return apiRequest(`/api/albums/${albumId}`, {
    method: "DELETE",
  });
}

export { getAlbums, createAlbum, updateAlbum, deleteAlbum };
