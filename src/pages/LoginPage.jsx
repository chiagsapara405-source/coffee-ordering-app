import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser, loginUser, saveCurrentUser } from "../data/auth";

export default function LoginPage() {
  const navigate = useNavigate();
  const [isSignup, setIsSignup] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (isSignup) {
      if (!name.trim()) {
        setError("Name is required");
        return;
      }
      const result = registerUser(name.trim(), email.trim(), password);
      if (result.success) {
        saveCurrentUser(result.user);
        navigate("/menu", { replace: true });
      } else {
        setError(result.error);
      }
    } else {
      const result = loginUser(email.trim(), password);
      if (result.success) {
        saveCurrentUser(result.user);
        navigate("/menu", { replace: true });
      } else {
        setError(result.error);
      }
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{
        backgroundColor: "var(--bg-color)",
        backgroundImage:
          "radial-gradient(circle at top right, var(--bg-gradient-start), var(--bg-gradient-end))",
      }}
    >
      <div className="w-full max-w-md">
        {/* Brand header */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-3">
            <svg
              className="w-10 h-10"
              fill="currentColor"
              viewBox="0 0 24 24"
              style={{ color: "var(--ink-soft)" }}
            >
              <path d="M4 19h16v2H4zM20 3H4v10c0 2.21 1.79 4 4 4h6c2.21 0 4-1.79 4-4v-3h2c1.11 0 2-.89 2-2V5c0-1.11-.89-2-2-2zm-2 5h-2V5h2v3z" />
            </svg>
            <h1
              className="font-display font-bold text-3xl"
              style={{ color: "var(--ink)" }}
            >
              Caffeine
            </h1>
          </div>
          <p
            className="font-mono-text text-xs uppercase tracking-[0.25em]"
            style={{ color: "var(--ink-soft)" }}
          >
            Your daily brew, perfected
          </p>
        </div>

        {/* Auth card */}
        <div className="neumorphic rounded-[2.5rem] p-8">
          <div className="text-center mb-6">
            <div className="text-5xl mb-3" aria-hidden="true">
              {isSignup ? "☕" : "👋"}
            </div>
            <h2
              className="font-display text-2xl font-bold"
              style={{ color: "var(--ink)" }}
            >
              {isSignup ? "Create your account" : "Welcome back"}
            </h2>
            <p
              className="font-mono-text text-xs mt-1.5"
              style={{ color: "var(--ink-soft)" }}
            >
              {isSignup
                ? "Sign up to start ordering"
                : "Log in to your account"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignup && (
              <div>
                <label
                  htmlFor="login-name"
                  className="font-display font-semibold text-xs uppercase tracking-wider block mb-1.5"
                  style={{ color: "var(--ink)" }}
                >
                  Name
                </label>
                <input
                  id="login-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-5 py-3.5 rounded-full neumorphic-inset font-display text-sm outline-none"
                  style={{ color: "var(--ink)", backgroundColor: "var(--bg-color)" }}
                  placeholder="Your name"
                  autoComplete="name"
                />
              </div>
            )}

            <div>
              <label
                htmlFor="login-email"
                className="font-display font-semibold text-xs uppercase tracking-wider block mb-1.5"
                style={{ color: "var(--ink)" }}
              >
                Email
              </label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-5 py-3.5 rounded-full neumorphic-inset font-display text-sm outline-none"
                style={{ color: "var(--ink)", backgroundColor: "var(--bg-color)" }}
                placeholder="you@example.com"
                autoComplete="email"
                required
              />
            </div>

            <div>
              <label
                htmlFor="login-password"
                className="font-display font-semibold text-xs uppercase tracking-wider block mb-1.5"
                style={{ color: "var(--ink)" }}
              >
                Password
              </label>
              <input
                id="login-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-5 py-3.5 rounded-full neumorphic-inset font-display text-sm outline-none"
                style={{ color: "var(--ink)", backgroundColor: "var(--bg-color)" }}
                placeholder={
                  isSignup ? "At least 4 characters" : "Your password"
                }
                autoComplete={isSignup ? "new-password" : "current-password"}
                required
                minLength={4}
              />
            </div>

            {error && (
              <p
                className="font-mono-text text-xs text-center"
                style={{ color: "#e74c3c" }}
                role="alert"
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              className="w-full py-4 rounded-full font-display font-bold text-sm transition-transform hover:scale-[1.02] active:scale-[0.98]"
              style={{ backgroundColor: "var(--ink)", color: "var(--bg-color)" }}
            >
              {isSignup ? "Create account" : "Log in"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsSignup(!isSignup);
                setError("");
              }}
              className="font-mono-text text-xs underline underline-offset-2 transition-opacity hover:opacity-70"
              style={{ color: "var(--ink-soft)" }}
            >
              {isSignup
                ? "Already have an account? Log in"
                : "Don't have an account? Sign up"}
            </button>
          </div>
        </div>

        {/* Footer */}
        <p
          className="text-center mt-8 font-mono-text text-[10px]"
          style={{ color: "var(--ink-soft)", opacity: 0.5 }}
        >
          Freshly pulled, made to order ☕
        </p>
      </div>
    </div>
  );
}
