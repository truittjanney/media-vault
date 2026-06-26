import { useNavigate } from "react-router-dom";

function ProfilePage() {
  // ####################################################
  // FUNCTIONS: SYNC EVENT HANDLERS
  // ####################################################
  const navigate = useNavigate();

  function logoutUser() {
    localStorage.removeItem("token");
    navigate("/login");
  }

  function handleBackToAlbums() {
    navigate("/albums");
  }

  // ####################################################
  // USER INTERFACE
  // ####################################################
  return (
    <main className="page-container">
      <header className="profile-page-header">
        <div>
          <h1 className="page-title">Profile Settings</h1>
          <p className="page-subtitle">
            Manage your account and security settings.
          </p>
        </div>
      </header>

      <section className="mv-card mv-card-padded profile-settings-card">
        <div className="profile-settings-list">
          <div className="profile-settings-row">
            <div>
              <p className="profile-settings-title">Change Account Password</p>
              <p className="profile-settings-description">
                Update the password used to log in to your account.
              </p>
            </div>

            <span className="profile-coming-soon-badge">Coming Soon</span>
          </div>

          <div className="profile-settings-row">
            <div>
              <p className="profile-settings-title">Change Album PIN</p>
              <p className="profile-settings-description">
                Update the PIN used to unlock protected albums.
              </p>
            </div>

            <span className="profile-coming-soon-badge">Coming Soon</span>
          </div>

          <div className="profile-settings-row">
            <div>
              <p className="profile-settings-title">Change Username</p>
              <p className="profile-settings-description">
                Update the display name associated with your account.
              </p>
            </div>

            <span className="profile-coming-soon-badge">Coming Soon</span>
          </div>
        </div>

        <div className="profile-actions">
          <button
            className="mv-btn mv-btn-secondary"
            type="button"
            onClick={handleBackToAlbums}
          >
            Back to Albums
          </button>

          <button
            className="mv-btn mv-btn-danger"
            type="button"
            onClick={logoutUser}
          >
            Logout
          </button>
        </div>
      </section>
    </main>
  );
}

export { ProfilePage };
