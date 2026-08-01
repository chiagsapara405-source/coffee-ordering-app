import { useState, useEffect, useRef, useCallback } from "react";
import gsap from "gsap";
import { registerUser, loginUser } from "../data/auth";
import { useFocusTrap } from "../hooks/useFocusTrap";

function EyeIcon({ open }) {
  return (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      {open ? (
        <>
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <circle cx="12" cy="12" r="3" />
        </>
      ) : (
        <>
          <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
          <line x1="1" y1="1" x2="23" y2="23" />
        </>
      )}
    </svg>
  );
}

export default function AuthModal({ isOpen, mode, onLogin, onClose }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSignup, setIsSignup] = useState(mode === "signup");
  const modalRef = useRef(null);
  const formContentRef = useRef(null);
  const nameFieldRef = useRef(null);
  const focusTrapRef = useFocusTrap(isOpen);

  // Entrance animation
  useEffect(() => {
    if (isOpen && modalRef.current) {
      gsap.fromTo(
        modalRef.current,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4, ease: "power3.out" },
      );
    }
  }, [isOpen]);

  // Smooth mode switch
  const switchMode = useCallback(() => {
    if (!formContentRef.current) return;

    const tl = gsap.timeline({
      onComplete: () => {
        const nextMode = !isSignup;
        setIsSignup(nextMode);
        setError("");
        setShowPassword(false);

        requestAnimationFrame(() => {
          gsap.to(formContentRef.current, {
            opacity: 1,
            y: 0,
            duration: 0.3,
            ease: "power3.out",
            clearProps: "y",
          });

          if (nextMode && nameFieldRef.current) {
            gsap.from(nameFieldRef.current, {
              opacity: 0,
              y: -10,
              maxHeight: 0,
              duration: 0.3,
              ease: "power3.out",
              clearProps: "maxHeight",
            });
          }
        });
      },
    });

    tl.to(formContentRef.current, {
      opacity: 0,
      y: -8,
      duration: 0.15,
      ease: "power2.in",
    });
  }, [isSignup]);

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isSignup) {
        if (!name.trim()) {
          setError("Name is required");
          setLoading(false);
          return;
        }
        const result = await registerUser(name.trim(), email.trim(), password);
        if (result.success) {
          onLogin(result.user);
          onClose();
        } else {
          setError(result.error || "Registration failed");
        }
      } else {
        const result = await loginUser(email.trim(), password);
        if (result.success) {
          onLogin(result.user);
          onClose();
        } else {
          setError(result.error || "Login failed");
        }
      }
    } catch (err) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
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
          className="absolute top-5 right-5 w-8 h-8 rounded-full neumorphic-sm flex items-center justify-center text-sm active:scale-90"
          aria-label="Close"
          style={{ color: "var(--ink)" }}
        >
          ✕
        </button>

        <div ref={formContentRef}>
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
            {/* Name field — smooth CSS transition */}
            <div
              ref={nameFieldRef}
              className="overflow-hidden transition-all duration-400 ease-out"
              style={{
                maxHeight: isSignup ? "100px" : "0",
                opacity: isSignup ? 1 : 0,
                marginBottom: isSignup ? "1rem" : "0",
              }}
              aria-hidden={!isSignup}
            >
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
                className="w-full px-4 py-3 rounded-full neumorphic-inset font-display text-sm"
                style={{
                  color: "var(--ink)",
                  backgroundColor: "var(--bg-color)",
                }}
                placeholder="Your name"
                autoComplete="name"
                tabIndex={isSignup ? 0 : -1}
              />
            </div>

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
                className="w-full px-4 py-3 rounded-full neumorphic-inset font-display text-sm"
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
              <div className="relative">
                <input
                  id="auth-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-full neumorphic-inset font-display text-sm pr-11"
                  style={{
                    color: "var(--ink)",
                    backgroundColor: "var(--bg-color)",
                  }}
                  placeholder={isSignup ? "At least 4 characters" : "Your password"}
                  autoComplete={isSignup ? "new-password" : "current-password"}
                  required
                  minLength={4}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full flex items-center justify-center transition-opacity hover:opacity-70 active:scale-90"
                  style={{ color: "var(--ink-soft)" }}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  tabIndex={-1}
                >
                  <EyeIcon open={showPassword} />
                </button>
              </div>
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
              disabled={loading}
              className="w-full py-3.5 rounded-full font-display font-bold text-sm transition-all hover:bg-[#603318] active:scale-[0.97] disabled:opacity-50"
              style={{ backgroundColor: "var(--ink)", color: "var(--bg-color)" }}
            >
              {loading ? "Please wait…" : isSignup ? "Create account" : "Log in"}
            </button>
          </form>
        </div>

        <div className="mt-5 text-center">
          <button
            onClick={switchMode}
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
