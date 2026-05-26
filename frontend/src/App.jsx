import { Routes, Route, Navigate } from "react-router-dom";

import { LoginPage } from "./pages/LoginPage";
import { SignupPage } from "./pages/SignupPage";
import { AlbumsPage } from "./pages/AlbumsPage";
import { AlbumDetailPage } from "./pages/AlbumDetailPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/albums" element={<AlbumsPage />} />
      <Route path="/albums/:id" element={<AlbumDetailPage />} />
    </Routes>
  );
}

export { App };
