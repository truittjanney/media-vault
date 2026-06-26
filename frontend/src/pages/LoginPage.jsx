import { userLogin } from "../services/userService.js";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function LoginPage() {
  // ####################################################
  // STATE
  // ####################################################
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  // ####################################################
  // FUNCTIONS: API EVENT HANDLERS
  // ####################################################
  async function handleSubmit(event) {
    event.preventDefault();
    setErrorMessage("");

    try {
      const data = await userLogin(email, password);
      localStorage.setItem("token", data.token);
      navigate("/albums");
    } catch (error) {
      setErrorMessage(error.message);
    }
  }

  // ####################################################
  // USER INTERFACE
  // ####################################################
  return (
    <main className="auth-page">
      <section className="mv-card mv-card-padded auth-card">
        <div className="auth-header">
          <h1 className="auth-logo">MediaVault</h1>
          <p className="auth-tagline">Your private photo and video vault</p>
        </div>

        <h2 className="auth-title">Login</h2>

        {errorMessage && (
          <p className="mv-alert mv-alert-error">{errorMessage}</p>
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

          <div className="mv-field">
            <label className="mv-label" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              className="mv-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="auth-actions">
            <button className="mv-btn mv-btn-primary mv-btn-full" type="submit">
              Login
            </button>
          </div>
        </form>

        <p className="auth-footer">
          Don't have an account?{" "}
          <Link className="auth-link" to="/signup">
            Create Account
          </Link>
        </p>
      </section>
    </main>
  );
}

export { LoginPage };
