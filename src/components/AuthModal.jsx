import { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { registerUser, loginUser } from "../data/auth";
import { useFocusTrap } from "../hooks/useFocusTrap";

export default function AuthModal({ isOpen, mode, onLogin, onClose }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [isSignup, setIsSignup] = useState(mode === "signup");
  const modalRef = useRef(null);
  const focusTrapRef = useFocusTrap(isOpen);

  useEffect(() => {
    if (isOpen && modalRef.current) {
      gsap.fromTo(
        modalRef.current,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4, ease: "power3.out" },
      );
    }
  }, [isOpen]);

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
        onLogin(result.user);
        onClose();
      } else {
        setError(result.error);
      }
    } else {
      const result = loginUser(email.trim(), password);
      if (result.success) {
        onLogin(result.user);
        onClose();
      } else {
        setError(result.error);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center px-4"
      role="dialog"
      aria-modal="true"
      aria-label={isSignup ? "Sign up" : "Log in"}
    >
      <div
        className="modal-overlay absolute inset-0"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={(el) => {
          modalRef.current = el;
          focusTrapRef.current = el;
        }}
        className="relative neumorphic rounded-[2rem] w-full max-w-sm p-7"
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full neumorphic-sm flex items-center justify-center text-sm"
          aria-label="Close"
          style={{ color: "var(--ink)" }}
        >
          ✕
        </button>

        <div className="text-center mb-6">
          <div className="text-4xl mb-2" aria-hidden="true">
            {isSignup ? "☕" : "👋"}
          </div>
          <h2
            className="font-display text-2xl font-bold"
            style={{ color: "var(--ink)" }}
          >
            {isSignup ? "Join Caffeine" : "Welcome back"}
          </h2>
          <p
            className="font-mono-text text-xs mt-1"
            style={{ color: "var(--ink-soft)" }}
          >
            {isSignup
              ? "Create an account for faster ordering"
              : "Log in to your account"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignup && (
            <div>
              <label
                htmlFor="auth-name"
                className="font-display font-semibold text-xs uppercase tracking-wider block mb-1.5"
                style={{ color: "var(--ink)" }}
              >
                Name
              </label>
              <input
                id="auth-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-full neumorphic-inset font-display text-sm outline-none"
                style={{
                  color: "var(--ink)",
                  backgroundColor: "var(--bg-color)",
                }}
                placeholder="Your name"
                autoComplete="name"
              />
            </div>
          )}

          <div>
            <label
              htmlFor="auth-email"
              className="font-display font-semibold text-xs uppercase tracking-wider block mb-1.5"
              style={{ color: "var(--ink)" }}
            >
              Email
            </label>
            <input
              id="auth-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-full neumorphic-inset font-display text-sm outline-none"
              style={{
                color: "var(--ink)",
                backgroundColor: "var(--bg-color)",
              }}
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
          </div>

          <div>
            <label
              htmlFor="auth-password"
              className="font-display font-semibold text-xs uppercase tracking-wider block mb-1.5"
              style={{ color: "var(--ink)" }}
            >
              Password
            </label>
            <input
              id="auth-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-full neumorphic-inset font-display text-sm outline-none"
              style={{
                color: "var(--ink)",
                backgroundColor: "var(--bg-color)",
              }}
              placeholder={isSignup ? "At least 4 characters" : "Your password"}
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
            className="w-full py-3.5 rounded-full font-display font-bold text-sm transition-colors"
            style={{ backgroundColor: "var(--ink)", color: "var(--bg-color)" }}
          >
            {isSignup ? "Create account" : "Log in"}
          </button>
        </form>

        <div className="mt-5 text-center">
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
    </div>
  );
}
