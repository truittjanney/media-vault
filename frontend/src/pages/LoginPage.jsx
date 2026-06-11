import { userLogin } from "../services/userService.js";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function LoginPage() {
  // ####################################################
  // STATE
  // ####################################################
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  // ####################################################
  // FUNCTIONS / EVENT HANDLERS
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
    <div>
      <h1>MediaVault</h1>
      <h2>Login</h2>

      {errorMessage && <p>{errorMessage}</p>}

      <form onSubmit={handleSubmit}>
        <label>Email: </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <label>Password: </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button type="button">Forgot Password?</button>
        <button type="submit">Login</button>
      </form>
    </div>
  );
}

export { LoginPage };
