import { userForgotPassword } from "../services/userService.js";
import { useState } from "react";
import { Link } from "react-router-dom";

function ForgotPasswordPage() {
  // ####################################################
  // STATE
  // ####################################################
  const [email, setEmail] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // ####################################################
  // FUNCTIONS: API EVENT HANDLERS
  // ####################################################
  async function handleSubmit(event) {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!email.trim()) {
      setErrorMessage("Email is required.");
      return;
    }

    try {
      setIsLoading(true);
      const data = await userForgotPassword(email);
      setSuccessMessage(data.message);
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
        <h2 className="auth-title">Forgot Password</h2>

        {errorMessage && (
          <p className="mv-alert mv-alert-error">{errorMessage}</p>
        )}

        {successMessage && (
          <p className="mv-alert mv-alert-success">{successMessage}</p>
        )}

        <form className="mv-form" onSubmit={handleSubmit}>
          <div className="mv-field">
            <label className="mv-label" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              className="mv-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <button
            className="mv-btn mv-btn-primary mv-btn-full"
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? "Sending..." : "Send reset link"}{" "}
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

export { ForgotPasswordPage };
