import { apiRequest } from "./api.js";

async function userSignup(name, email, password) {
  return apiRequest("/api/users/signup", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name, email, password }),
  });
}

async function userLogin(email, password) {
  return apiRequest("/api/users/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });
}

async function getUserProfile() {
  return apiRequest("/api/users/profile");
}

async function updateUserProfile(profileData) {
  return apiRequest("/api/users/profile", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(profileData),
  });
}

export { userSignup, userLogin, getUserProfile, updateUserProfile };
