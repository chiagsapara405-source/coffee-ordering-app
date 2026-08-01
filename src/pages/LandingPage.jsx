import { useEffect, useLayoutEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { fetchMenuItems, fmt } from "../data/menu";

// ---------- Static content (kept out of the component body so it isn't
// recreated on every render, and so adding a drink/menu item is one line) ----------
const HERO_DRINKS = [
  {
    src: "/3acb30e950b0ffb33b7b01b5e6457e95-Photoroom.png",
    alt: "Iced Matcha Drink",
    name: "Matcha Latte",
    price: "₹230",
    height: "h-[30rem] sm:h-[32rem]",
    extraImgClass: "mt-[10%]",
    fetchPriority: "high", // first hero image = likely LCP element
  },
  {
    src: "/dae3a884189cee56fde94fcefff0a036-Photoroom.png",
    alt: "Iced Strawberry Drink",
    name: "Strawberry Refresher",
    price: "₹250",
    height: "h-[30rem] sm:h-[32rem]",
  },
  {
    src: "/25f1c4880e288b19afcc6c747567405a-Photoroom.png",
    alt: "Iced Coffee",
    name: "Iced Latte",
    price: "₹210",
    height: "h-[30rem] sm:h-[32rem]",
  },
];

// Fallback if the API returns nothing usable — keeps the section from ever
// rendering empty. The live menu from /api/menu is preferred.
const FALLBACK_BEST_SELLERS = [
  {
    id: "cappuccino",
    name: "Cappuccino",
    price: 220,
    img: "https://images.unsplash.com/photo-1534778101976-62847782c213?auto=format&fit=crop&w=800&q=80",
    alt: "Hot Cappuccino with latte art",
  },
  {
    id: "americano",
    name: "Americano",
    price: 180,
    img: "https://images.unsplash.com/photo-1559525839-b184a4d698c7?auto=format&fit=crop&w=800&q=80",
    alt: "Hot Americano black coffee",
  },
  {
    id: "espresso",
    name: "Espresso",
    price: 160,
    img: "https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?auto=format&fit=crop&w=800&q=80",
    alt: "Shot of Espresso",
  },
];

// Preferred "best seller" picks — matched by menu item id, then filled from
// whatever else is live and available on the menu.
const BEST_SELLER_IDS = ["cappuccino", "americano", "espresso"];

const NAV_LINKS = [
  { href: "#menu", label: "Menu" },
  { href: "#about", label: "About" },
  { href: "#contact", label: "Contact" },
];

function BestSellerCard({ item, onOrder }) {
  const [imgError, setImgError] = useState(false);

  return (
    <article
      className="best-seller-card neumorphic rounded-[2.5rem] p-6 w-80 flex flex-col text-left group cursor-pointer"
      onClick={onOrder}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOrder();
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={`Order ${item.name} for ${fmt(item.price)}`}
    >
      <div className="w-full h-64 rounded-[2rem] overflow-hidden mb-6">
        {imgError ? (
          <div className="w-full h-full flex items-center justify-center text-4xl" style={{ backgroundColor: "var(--shadow-dark)", color: "var(--ink-soft)" }}>
            ☕
          </div>
        ) : (
          <img
            src={item.img}
            alt={item.alt || item.name}
            loading="lazy"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
          />
        )}
      </div>
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="font-display text-3xl font-bold mb-1 text-[var(--ink)]">
            {item.name}
          </h3>
          <p className="font-mono-text text-xl text-[var(--ink-soft)]">{fmt(item.price)}</p>
        </div>
        <span
          className="flex-shrink-0 btn-outline px-4 py-2 rounded-full font-display font-bold text-xs"
          aria-hidden="true"
        >
          Order →
        </span>
      </div>
    </article>
  );
}

export default function CaffeineLanding() {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [bestSellers, setBestSellers] = useState(null); // null = loading
  const containerRef = useRef(null);
  const cardRefs = useRef([]);
  const isAnimating = useRef(false);
  const captionRef = useRef(null);
  const bestSellerRef = useRef(null);

  const closeMobileMenu = useCallback(() => setIsMobileMenuOpen(false), []);
  const toggleMobileMenu = useCallback(
    () => setIsMobileMenuOpen((open) => !open),
    []
  );

  const goToDrink = useCallback((direction) => {
    if (isAnimating.current) return;
    isAnimating.current = true;
    setActiveIndex(
      (prev) => (prev + direction + HERO_DRINKS.length) % HERO_DRINKS.length
    );
  }, []);

  const goToIndex = useCallback((i) => {
    if (isAnimating.current) return;
    isAnimating.current = true;
    setActiveIndex(i);
  }, []);

  // Manage body scroll lock + Escape-to-close when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
      const onKeyDown = (e) => {
        if (e.key === "Escape") closeMobileMenu();
      };
      window.addEventListener("keydown", onKeyDown);
      return () => {
        document.body.style.overflow = "";
        window.removeEventListener("keydown", onKeyDown);
      };
    }
    document.body.style.overflow = "";
  }, [isMobileMenuOpen, closeMobileMenu]);

  // GSAP Animations with context for React StrictMode safety
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const ctx = gsap.context(() => {
      if (prefersReducedMotion) {
        // Respect the user's OS-level motion preference: skip animation
        // and just make everything visible immediately.
        gsap.set(".reveal-nav, .reveal", { opacity: 1, y: 0 });
        return;
      }

      // Initial Navbar Drop
      gsap.from(".reveal-nav", {
        y: -100,
        opacity: 0,
        duration: 1.2,
        ease: "power4.out",
        delay: 0.2,
      });

      // Scroll Reveal Utility for text and sections
      const revealElements = gsap.utils.toArray(".reveal");
      revealElements.forEach((element) => {
        gsap.from(element, {
          scrollTrigger: {
            trigger: element,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
          y: 60,
          opacity: 0,
          duration: 1,
          ease: "power3.out",
        });
      });

      // Parallax Effect for standard images
      const parallaxImages = gsap.utils.toArray(".img-parallax");
      parallaxImages.forEach((img) => {
        gsap.to(img, {
          scrollTrigger: {
            trigger: img.parentElement,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
          y: 40,
          ease: "none",
        });
      });
    }, containerRef); // Scope all animations to this container

    return () => ctx.revert(); // Cleanup animations on unmount
  }, []);

  // Hero carousel: position each card based on its offset from activeIndex
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const total = HERO_DRINKS.length;
    const isSmallScreen =
      typeof window !== "undefined" && window.innerWidth < 640;
    const sideX = isSmallScreen ? 170 : 340;
    const farX = isSmallScreen ? 340 : 700;

    HERO_DRINKS.forEach((_, i) => {
      const el = cardRefs.current[i];
      if (!el) return;

      // offset: 0 = center, 1 = right neighbor, -1 = left neighbor
      let offset = (i - activeIndex + total) % total;
      if (offset > total / 2) offset -= total;

      const target =
        offset === 0
          ? { x: 0, scale: 1, opacity: 1, zIndex: 30 }
          : offset === 1
          ? { x: sideX, scale: 0.72, opacity: 0.55, zIndex: 20 }
          : offset === -1
          ? { x: -sideX, scale: 0.72, opacity: 0.55, zIndex: 20 }
          : { x: offset > 0 ? farX : -farX, scale: 0.5, opacity: 0, zIndex: 10 };

      gsap.set(el, { xPercent: -50, yPercent: -50 });

      if (prefersReducedMotion) {
        gsap.set(el, target);
      } else {
        gsap.to(el, {
          ...target,
          duration: 0.9,
          ease: "power3.inOut",
          onComplete: () => {
            isAnimating.current = false;
          },
        });
      }
    });

    if (prefersReducedMotion) isAnimating.current = false;
  }, [activeIndex]);

  // Caption (active drink label + price + CTA) crossfades with the carousel
  useEffect(() => {
    if (!captionRef.current) return;
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) {
      gsap.set(captionRef.current, { opacity: 1, y: 0 });
      return;
    }
    gsap.fromTo(
      captionRef.current,
      { opacity: 0, y: 14 },
      { opacity: 1, y: 0, duration: 0.45, ease: "power3.out" }
    );
  }, [activeIndex]);

  // Live best sellers: fetch /api/menu (available items only), prefer the
  // classic trio by id, fill from the rest, and fall back if nothing comes back.
  useEffect(() => {
    let cancelled = false;
    fetchMenuItems().then((items) => {
      if (cancelled) return;
      const pool = Array.isArray(items) ? items.filter((i) => i && i.id) : [];
      if (pool.length === 0) {
        setBestSellers(FALLBACK_BEST_SELLERS);
        return;
      }
      const preferred = pool.filter((i) => BEST_SELLER_IDS.includes(i.id));
      const rest = pool.filter((i) => !BEST_SELLER_IDS.includes(i.id));
      const chosen = [...preferred, ...rest].slice(0, 3);
      setBestSellers(chosen.length > 0 ? chosen : FALLBACK_BEST_SELLERS);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Best-seller cards render after the fetch resolves, so the mount-time
  // .reveal/ScrollTrigger setup can't see them — stagger them in here.
  // useLayoutEffect runs before paint, so cards never flash at full opacity
  // before GSAP hides and animates them.
  useLayoutEffect(() => {
    if (!bestSellers || !bestSellerRef.current) return;
    const cards = bestSellerRef.current.querySelectorAll(".best-seller-card");
    if (cards.length === 0) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReducedMotion) {
      gsap.set(cards, { opacity: 1, y: 0 });
      return;
    }
    gsap.set(cards, { opacity: 0, y: 40 });
    gsap.to(cards, {
      opacity: 1,
      y: 0,
      duration: 0.6,
      stagger: 0.12,
      ease: "power3.out",
      clearProps: "transform,opacity",
    });
  }, [bestSellers]);

  // Continuous floating animation for the hero cups
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReducedMotion) return;

    const tween = gsap.to(".hero-cup", {
      y: "+=16",
      duration: 2.2,
      yoyo: true,
      repeat: -1,
      ease: "sine.inOut",
      stagger: 0.25,
    });

    return () => tween.kill();
  }, []);

  const activeDrink = HERO_DRINKS[activeIndex];

  return (
    <div
      ref={containerRef}
      className="antialiased selection:bg-[var(--ink-soft)] selection:text-[var(--bg-color)] overflow-x-hidden min-h-screen"
      style={{ backgroundColor: "var(--bg-color)", color: "var(--text-color)" }}
    >
      {/* Embedded Styles for landing-specific behavior (shared tokens live in src/index.css) */}
      <style>{`
        html {
          scroll-behavior: smooth;
        }

        @media (prefers-reduced-motion: reduce) {
          html {
            scroll-behavior: auto;
          }
        }

        /* Skip link: visually hidden until focused */
        .skip-link {
          position: absolute;
          top: -3rem;
          left: 1rem;
          z-index: 60;
          transition: top 0.2s ease;
        }
        .skip-link:focus {
          top: 1rem;
        }

        /* Mobile menu animations */
        .mobile-menu {
          transform: translateX(100%);
          transition: transform 0.3s ease-in-out;
        }
        .mobile-menu.open {
          transform: translateX(0);
        }
        .hamburger-line {
          transition: all 0.3s ease;
        }
        .hamburger.active .hamburger-line:nth-child(1) {
          transform: rotate(45deg) translate(5px, 5px);
        }
        .hamburger.active .hamburger-line:nth-child(2) {
          opacity: 0;
        }
        .hamburger.active .hamburger-line:nth-child(3) {
          transform: rotate(-45deg) translate(7px, -6px);
        }

        /* Visible keyboard focus ring, since default outline is easy to lose
           against this palette */
        a:focus-visible, button:focus-visible {
          outline: 2px solid var(--ink);
          outline-offset: 3px;
          border-radius: 4px;
        }
      `}</style>

      <a href="#main-content" className="skip-link neumorphic px-5 py-3 rounded-full font-display font-semibold text-[var(--ink)]">
        Skip to content
      </a>

      {/* Navigation */}
      <header>
        <nav
          className="fixed top-6 left-1/2 -translate-x-1/2 w-[95%] max-w-7xl z-50 px-6 py-4 rounded-full shadow-sm flex justify-between items-center border border-white/20 reveal-nav backdrop-blur-xl"
          style={{ backgroundColor: "color-mix(in srgb, var(--bg-color) 60%, transparent)" }}
        >
          <a href="#" className="flex items-center gap-3" aria-label="Back to top">
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true" style={{ color: "var(--ink-soft)" }}>
              <path d="M4 19h16v2H4zM20 3H4v10c0 2.21 1.79 4 4 4h6c2.21 0 4-1.79 4-4v-3h2c1.11 0 2-.89 2-2V5c0-1.11-.89-2-2-2zm-2 5h-2V5h2v3z" />
            </svg>
            <span className="font-display font-bold text-xl md:text-2xl tracking-wide text-[var(--ink)]">
              Caffeine
            </span>
          </a>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8 font-display font-semibold text-lg text-[var(--ink)]">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="hover:opacity-60 transition-opacity duration-300"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Desktop CTA */}
          <button
            onClick={() => navigate("/login")}
            className="hidden md:inline-flex btn-primary px-6 py-2.5 rounded-full font-display font-bold text-sm"
          >
            Order now
          </button>

          {/* Mobile Menu Toggle */}
          <button
            className={`md:hidden hamburger flex flex-col justify-center items-center w-8 h-8 gap-1.5 ${isMobileMenuOpen ? "active" : ""}`}
            onClick={toggleMobileMenu}
            aria-label="Toggle mobile menu"
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-menu"
          >
            <span className="hamburger-line w-6 h-0.5 bg-[var(--ink)] block"></span>
            <span className="hamburger-line w-6 h-0.5 bg-[var(--ink)] block"></span>
            <span className="hamburger-line w-6 h-0.5 bg-[var(--ink)] block"></span>
          </button>
        </nav>
      </header>

      {/* Mobile Menu Overlay */}
      <div
        id="mobile-menu"
        className={`mobile-menu fixed top-0 right-0 w-72 h-full z-40 pt-28 px-8 shadow-2xl md:hidden ${isMobileMenuOpen ? "open" : ""}`}
        style={{ backgroundColor: "var(--bg-color)" }}
        // inert (not just aria-hidden) keeps focus from landing on hidden
        // links when the panel is closed
        inert={isMobileMenuOpen ? undefined : ""}
        aria-hidden={!isMobileMenuOpen}
      >
        <div className="flex flex-col gap-6 font-display font-semibold text-xl text-[var(--ink)]">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="hover:opacity-60 transition-opacity duration-300 border-b pb-4"
              style={{ borderColor: "var(--dash-color)" }}
              onClick={closeMobileMenu}
            >
              {link.label}
            </a>
          ))}
          <button
            onClick={() => navigate("/login")}
            className="btn-primary px-6 py-3.5 rounded-full font-display font-bold text-base mt-2"
          >
            Order now
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay Background */}
      <div
        className={`fixed inset-0 bg-black/50 z-30 md:hidden transition-opacity duration-300 ${isMobileMenuOpen ? "opacity-100 visible" : "opacity-0 invisible"}`}
        onClick={closeMobileMenu}
        aria-hidden="true"
      ></div>

      <main id="main-content">
        {/* Hero Section */}
        <section className="relative min-h-screen flex flex-col items-center justify-center pt-40 pb-24 px-4 overflow-hidden">
          <div className="relative w-full max-w-6xl h-[30rem] sm:h-[34rem]">
            {HERO_DRINKS.map((drink, i) => (
              <div
                key={drink.src}
                ref={(el) => (cardRefs.current[i] = el)}
                className={`hero-card absolute top-1/2 left-1/2 w-[20rem] sm:w-[22rem] ${drink.height} rounded-[3rem]`}
                style={{ willChange: "transform, opacity" }}
                aria-hidden={i !== activeIndex}
              >
                <img
                  src={drink.src}
                  alt={drink.alt}
                  fetchPriority={drink.fetchPriority}
                  className={`hero-cup absolute bottom-12 left-1/2 -translate-x-1/2 h-[115%] max-w-none w-auto object-contain drop-shadow-2xl ${drink.extraImgClass ?? ""}`}
                />
              </div>
            ))}

            {/* Arrows */}
            <button
              onClick={() => goToDrink(-1)}
              aria-label="Previous drink"
              className="btn-outline absolute left-0 sm:-left-6 top-1/2 -translate-y-1/2 z-40 w-14 h-14 rounded-full flex items-center justify-center"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => goToDrink(1)}
              aria-label="Next drink"
              className="btn-outline absolute right-0 sm:-right-6 top-1/2 -translate-y-1/2 z-40 w-14 h-14 rounded-full flex items-center justify-center"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Dots */}
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 z-40 flex gap-2">
              {HERO_DRINKS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goToIndex(i)}
                  aria-label={`Go to drink ${i + 1}`}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    i === activeIndex ? "w-6" : "w-2"
                  }`}
                  style={{
                    backgroundColor: i === activeIndex ? "var(--ink)" : "var(--ink-soft)",
                    opacity: i === activeIndex ? 1 : 0.3,
                  }}
                />
              ))}
            </div>
          </div>

          {/* Active drink label + price + order CTA */}
          <div
            ref={captionRef}
            className="relative z-30 mt-16 flex flex-col sm:flex-row items-center gap-4 sm:gap-8 text-center sm:text-left"
          >
            <div>
              <p className="font-display text-3xl md:text-4xl font-bold text-[var(--ink)]">
                {activeDrink.name}
              </p>
              <p className="font-mono-text text-xl md:text-2xl text-[var(--ink-soft)] mt-1">
                {activeDrink.price}
              </p>
            </div>
            <button
              onClick={() => navigate("/login")}
              className="btn-primary px-8 py-4 rounded-full font-display font-bold text-base"
            >
              Order this drink →
            </button>
          </div>
        </section>

        {/* Title Section */}
        <section className="py-24 px-6 flex justify-center">
          <h1 className="reveal font-serif italic text-4xl sm:text-5xl md:text-7xl lg:text-[5.5rem] text-center text-[var(--ink)] max-w-5xl leading-tight">
            Discover the art of perfect coffee
          </h1>
        </section>

        {/* Start Ordering CTA */}
        <section className="pb-24 flex justify-center">
          <button
            onClick={() => navigate("/login")}
            className="btn-primary px-12 py-5 rounded-full font-display font-bold text-lg"
          >
            Start ordering &rarr;
          </button>
        </section>

        {/* About The House */}
        <section id="about" className="py-24 px-8 flex justify-center scroll-mt-24">
          <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="reveal">
              <p className="text-sm tracking-[0.2em] uppercase mb-4 font-bold text-[var(--ink-soft)]">
                About the house
              </p>
              <h2 className="font-display text-5xl md:text-7xl font-bold mb-8 uppercase text-[var(--text-color)]">
                Caffeine
              </h2>
              <p className="font-mono-text text-lg md:text-xl leading-relaxed" style={{ color: "var(--ink)" }}>
                A warm neighborhood coffee bar serving slow-roasted espresso, silky
                milk drinks, and fresh bakery pairings. Settle in for carefully
                brewed cups, soft morning light, and a menu made for small rituals.
              </p>
            </div>
            <div className="reveal rounded-[3rem] overflow-hidden shadow-2xl h-[400px] md:h-[600px]">
              <img
                src="https://images.unsplash.com/photo-1497935586351-b67a49e012bf?auto=format&fit=crop&w=1200&q=80"
                alt="Barista pouring beautiful latte art"
                loading="lazy"
                className="img-parallax w-full h-[120%] object-cover -mt-10"
              />
            </div>
          </div>
        </section>

        {/* Taste of Coffee */}
        <section className="py-24 px-8 flex justify-center">
          <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="reveal order-2 lg:order-1 rounded-[3rem] overflow-hidden shadow-2xl h-[400px] md:h-[600px]">
              <img
                src="https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1200&q=80"
                alt="A perfect cup of black coffee on a cafe table"
                loading="lazy"
                className="img-parallax w-full h-[120%] object-cover -mt-10"
              />
            </div>
            <div className="reveal order-1 lg:order-2 text-right">
              <p className="text-sm tracking-[0.2em] uppercase mb-4 font-bold text-[var(--ink-soft)]">
                Roasted, Pulled, Poured
              </p>
              <h2 className="font-display text-5xl md:text-7xl font-bold mb-8 uppercase text-[var(--text-color)]">
                Taste of Coffee
              </h2>
              <p className="font-mono-text text-lg md:text-xl leading-relaxed text-right" style={{ color: "var(--ink)" }}>
                From bright Americanos to creamy cappuccinos, every drink starts
                with balanced beans and a precise pour. Our baristas tune each cup
                for sweetness, body, and a finish that lingers.
              </p>
            </div>
          </div>
        </section>

        {/* Best-Selling Cups — live menu data with skeleton loading */}
        <section id="menu" className="py-32 px-8 flex flex-col items-center scroll-mt-24">
          <h2 className="reveal font-display text-5xl md:text-7xl font-bold mb-20 uppercase text-center text-[var(--text-color)]">
            Best-selling cups
          </h2>

          <div ref={bestSellerRef} className="flex flex-wrap justify-center gap-12">
            {bestSellers === null
              ? Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="neumorphic rounded-[2.5rem] p-6 w-80 flex flex-col"
                    aria-hidden="true"
                  >
                    <div
                      className="w-full h-64 rounded-[2rem] mb-6 animate-pulse"
                      style={{ backgroundColor: "var(--shadow-dark)", opacity: 0.35 }}
                    />
                    <div
                      className="h-6 rounded-full animate-pulse mb-2"
                      style={{ backgroundColor: "var(--shadow-dark)", opacity: 0.35, width: "55%" }}
                    />
                    <div
                      className="h-4 rounded-full animate-pulse"
                      style={{ backgroundColor: "var(--shadow-dark)", opacity: 0.25, width: "35%" }}
                    />
                  </div>
                ))
              : bestSellers.map((item) => (
                  <BestSellerCard
                    key={item.id}
                    item={item}
                    onOrder={() => navigate("/login")}
                  />
                ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer
        id="contact"
        className="rounded-t-[4rem] px-5 py-20 mt-12 flex flex-col items-center text-center shadow-2xl relative overflow-hidden scroll-mt-24"
        style={{ backgroundColor: "var(--brew)", color: "var(--bg-color)" }}
      >
        <div className="relative z-10 flex flex-col items-center">
          <h2 className="reveal font-serif italic text-5xl sm:text-7xl md:text-[9rem] lg:text-[12rem] mb-8 leading-none">
            Caffeine
          </h2>
          <p className="reveal font-mono-text text-xl md:text-3xl max-w-3xl mt-20 mb-16" style={{ color: "var(--bg-color)", opacity: 0.85 }}>
            Better coffee, better mornings — crafted daily at Caffeine.
          </p>

          <div className="reveal flex flex-col md:flex-row gap-6 font-mono-text text-sm md:text-base">
            <span
              className="px-8 py-4 rounded-full shadow-inner border"
              style={{ backgroundColor: "var(--ink)", color: "var(--bg-color)", borderColor: "var(--bg-color)" }}
            >
              Open daily: 8 AM-10 PM
            </span>
            <a
              href="mailto:hello@caffeine.cafe"
              className="px-8 py-4 rounded-full shadow-inner border transition-opacity hover:opacity-80"
              style={{ backgroundColor: "var(--ink)", color: "var(--bg-color)", borderColor: "var(--bg-color)" }}
            >
              hello@caffeine.cafe
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
