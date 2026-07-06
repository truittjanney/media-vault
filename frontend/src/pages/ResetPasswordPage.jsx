import { userResetPassword } from "../services/userService.js";
import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

function ResetPasswordPage() {
  // ####################################################
  // STATE
  // ####################################################
  const [newPassword, setNewPassword] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  // ####################################################
  // FUNCTIONS: API EVENT HANDLERS
  // ####################################################
  async function handleSubmit(event) {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!token) {
      setErrorMessage("Reset token is missing.");
      return;
    }

    if (!newPassword.trim()) {
      setErrorMessage("New password is required.");
      return;
    }

    if (newPassword.trim().length < 8) {
      setErrorMessage("Password must be at least 8 characters.");
      return;
    }

    try {
      setIsLoading(true);
      const data = await userResetPassword(token, newPassword);
      setSuccessMessage(data.message);

      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  }

  // ####################################################
  // USER INTERFACE
  // ####################################################
  return (
    <main className="auth-page">
      <section className="mv-card mv-card-padded auth-card">
        <h2 className="auth-title">Reset Password</h2>

        {errorMessage && (
          <p className="mv-alert mv-alert-error">{errorMessage}</p>
        )}

        {successMessage && (
          <p className="mv-alert mv-alert-success">{successMessage}</p>
        )}

        <form className="mv-form" onSubmit={handleSubmit}>
          <div className="mv-field">
            <label className="mv-label" htmlFor="password">
              New Password
            </label>
            <input
              id="password"
              className="mv-input"
              type="password"
              value={newPassword}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            className="mv-btn mv-btn-primary mv-btn-full"
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? "Changing password..." : "Change password"}
          </button>
        </form>

        <p className="auth-footer">
          Back to login?{" "}
          <Link className="auth-link" to="/login">
            Login
          </Link>
        </p>
      </section>
    </main>
  );
}

export { ResetPasswordPage };
