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

async function userForgotPassword(email) {
  return apiRequest("/api/users/forgot-password", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email }),
  });
}

async function userResetPassword(token, newPassword) {
  return apiRequest("/api/users/reset-password", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ token, newPassword }),
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

export {
  userSignup,
  userLogin,
  userForgotPassword,
  userResetPassword,
  getUserProfile,
  updateUserProfile,
};
