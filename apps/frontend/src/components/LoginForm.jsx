import { useState } from "react";

const TEST_EMAIL = "test@gmail.com";
const TEST_PASSWORD = "test@123";

export default function LoginForm({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    const ok = email.trim() === TEST_EMAIL && password === TEST_PASSWORD;
    if (!ok) {
      setError("Invalid credentials. Use the test login details provided.");
      return;
    }
    setError("");
    onLogin({ email });
  };

  return (
    <div className="login-shell">
      <div className="login-card">
        <p className="eyebrow">Welcome back</p>
        <h1>Sign in to your job tracker</h1>
        <p className="muted">
          Use the test credentials to continue. You will be prompted to upload a resume next.
        </p>
        <form onSubmit={handleSubmit} className="login-form">
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="test@gmail.com"
              required
            />
          </label>
          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="test@123"
              required
            />
          </label>
          {error ? <p className="error-text">{error}</p> : null}
          <button type="submit">Sign in</button>
        </form>
        <div className="login-hint">
          <span>Test Email: {TEST_EMAIL}</span>
          <span>Test Password: {TEST_PASSWORD}</span>
        </div>
      </div>
    </div>
  );
}
