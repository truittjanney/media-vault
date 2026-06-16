import { apiRequest } from "./api.js";

function getAlbums() {
  return apiRequest("/api/albums");
}

function verifyAlbumPin(albumId, pin) {
  return apiRequest(`/api/albums/${albumId}/verify-pin`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ pin }),
  });
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

function addAlbumLock(albumId, pin) {
  return apiRequest(`/api/albums/${albumId}/lock`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ pin }),
  });
}

function removeAlbumLock(albumId, pin) {
  return apiRequest(`/api/albums/${albumId}/remove-lock`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ pin }),
  });
}

function deleteAlbum(albumId) {
  return apiRequest(`/api/albums/${albumId}`, {
    method: "DELETE",
  });
}

export {
  getAlbums,
  verifyAlbumPin,
  createAlbum,
  updateAlbum,
  addAlbumLock,
  removeAlbumLock,
  deleteAlbum,
};
