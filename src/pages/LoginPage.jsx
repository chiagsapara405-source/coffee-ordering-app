import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";
import { registerUser, loginUser, saveCurrentUser } from "../data/auth";

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

export default function LoginPage() {
  const navigate = useNavigate();
  const [isSignup, setIsSignup] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const cardRef = useRef(null);
  const formContentRef = useRef(null);
  const emojiRef = useRef(null);
  const headingRef = useRef(null);
  const subtitleRef = useRef(null);
  const submitBtnRef = useRef(null);
  const isMounted = useRef(false);

  // Entrance animation: card slides up on mount
  useEffect(() => {
    if (cardRef.current) {
      gsap.set(cardRef.current, { opacity: 0, y: 30 });
      gsap.to(cardRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: "power3.out",
        delay: 0.1,
      });
    }
    isMounted.current = true;
  }, []);

  // Animate heading/emoji when mode changes (soft crossfade)
  useEffect(() => {
    if (!isMounted.current) return;
    const targets = [];
    if (emojiRef.current) targets.push(emojiRef.current);
    if (headingRef.current) targets.push(headingRef.current);
    if (subtitleRef.current) targets.push(subtitleRef.current);

    if (targets.length > 0) {
      gsap.from(targets, {
        opacity: 0,
        y: -6,
        duration: 0.3,
        stagger: 0.04,
        ease: "power2.out",
      });
    }
  }, [isSignup]);

  // Smooth mode switch with GSAP
  const switchMode = useCallback(() => {
    if (!formContentRef.current) return;

    gsap.to(formContentRef.current, {
      opacity: 0,
      y: -8,
      duration: 0.15,
      ease: "power2.in",
      onComplete: () => {
        const nextMode = !isSignup;
        setIsSignup(nextMode);
        setError("");
        setShowPassword(false);

        // Let React commit state changes first, then animate back in
        requestAnimationFrame(() => {
          gsap.to(formContentRef.current, {
            opacity: 1,
            y: 0,
            duration: 0.35,
            ease: "power3.out",
            clearProps: "y",
          });

          // Animate the submit button text refresh
          if (submitBtnRef.current) {
            gsap.from(submitBtnRef.current, {
              opacity: 0,
              scale: 0.95,
              duration: 0.25,
              ease: "power2.out",
            });
          }
        });
      },
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
          saveCurrentUser(result.user);
          navigate("/menu", { replace: true });
        } else {
          setError(result.error || "Registration failed");
        }
      } else {
        const result = await loginUser(email.trim(), password);
        if (result.success) {
          saveCurrentUser(result.user);
          if (result.user?.role === "admin") {
            navigate("/admin", { replace: true });
          } else {
            navigate("/menu", { replace: true });
          }
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
        <div ref={cardRef} className="neumorphic rounded-[2.5rem] p-8">
          {/* Emoji + Heading + Subtitle */}
          <div className="text-center mb-6">
            <div ref={emojiRef} className="text-5xl mb-3" aria-hidden="true">
              {isSignup ? "☕" : "👋"}
            </div>
            <h2
              ref={headingRef}
              className="font-display text-2xl font-bold"
              style={{ color: "var(--ink)" }}
            >
              {isSignup ? "Create your account" : "Welcome back"}
            </h2>
            <p
              ref={subtitleRef}
              className="font-mono-text text-xs mt-1.5"
              style={{ color: "var(--ink-soft)" }}
            >
              {isSignup
                ? "Sign up to start ordering"
                : "Log in to your account"}
            </p>
          </div>

          {/* Form content wrapper (animated via GSAP on mode switch) */}
          <div ref={formContentRef}>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name field — always rendered, hidden via CSS when not signup */}
              <div
                className="overflow-hidden transition-all duration-300 ease-out"
                style={{
                  maxHeight: isSignup ? "120px" : "0",
                  opacity: isSignup ? 1 : 0,
                  marginBottom: isSignup ? "1rem" : "0",
                  pointerEvents: isSignup ? "auto" : "none",
                }}
                aria-hidden={!isSignup}
              >
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
                  className="w-full px-5 py-3.5 rounded-full neumorphic-inset font-display text-sm"
                  style={{ color: "var(--ink)", backgroundColor: "var(--bg-color)" }}
                  placeholder="Your name"
                  autoComplete="name"
                  tabIndex={isSignup ? 0 : -1}
                />
              </div>

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
                  className="w-full px-5 py-3.5 rounded-full neumorphic-inset font-display text-sm"
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
                <div className="relative">
                  <input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-5 py-3.5 rounded-full neumorphic-inset font-display text-sm pr-12"
                    style={{ color: "var(--ink)", backgroundColor: "var(--bg-color)" }}
                    placeholder={
                      isSignup ? "At least 4 characters" : "Your password"
                    }
                    autoComplete={isSignup ? "new-password" : "current-password"}
                    required
                    minLength={4}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((p) => !p)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full flex items-center justify-center transition-opacity hover:opacity-70 active:scale-90"
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
                ref={submitBtnRef}
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-full font-display font-semibold text-sm transition-transform active:scale-[0.98] mt-2 neumorphic hover:brightness-105 disabled:opacity-50"
                style={{
                  backgroundColor: "var(--accent)",
                  color: "var(--accent-text)",
                }}
              >
                {loading ? "Please wait..." : isSignup ? "Create Account" : "Sign In"}
              </button>
            </form>
          </div>

          {/* Mode toggle */}
          <div className="mt-6 text-center">
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
