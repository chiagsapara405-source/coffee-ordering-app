import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// ---------- Static content (kept out of the component body so it isn't
// recreated on every render, and so adding a drink/menu item is one line) ----------
const HERO_DRINKS = [
  {
    src: "/25f1c4880e288b19afcc6c747567405a-Photoroom.png",
    alt: "Iced Matcha Drink",
    height: "h-[30rem] sm:h-[32rem]",
    extraImgClass: "mt-[10%]",
    fetchPriority: "high", // first hero image = likely LCP element
  },
  {
    src: "/3acb30e950b0ffb33b7b01b5e6457e95-Photoroom.png",
    alt: "Iced Strawberry Drink",
    height: "h-[30rem] sm:h-[32rem]",
  },
  {
    src: "/dae3a884189cee56fde94fcefff0a036-Photoroom.png",
    alt: "Iced Coffee",
    height: "h-[30rem] sm:h-[32rem]",
  },
];

const BEST_SELLERS = [
  {
    name: "Cappuccino",
    price: "₹220",
    img: "https://images.unsplash.com/photo-1534778101976-62847782c213?auto=format&fit=crop&w=800&q=80",
    alt: "Hot Cappuccino with latte art",
  },
  {
    name: "Americano",
    price: "₹180",
    img: "https://images.unsplash.com/photo-1559525839-b184a4d698c7?auto=format&fit=crop&w=800&q=80",
    alt: "Hot Americano black coffee",
  },
  {
    name: "Espresso",
    price: "₹160",
    img: "https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?auto=format&fit=crop&w=800&q=80",
    alt: "Shot of Espresso",
  },
];

const NAV_LINKS = [
  { href: "#menu", label: "Menu" },
  { href: "#about", label: "About" },
  { href: "#contact", label: "Contact" },
];

export default function CaffeineLanding() {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef(null);
  const cardRefs = useRef([]);
  const isAnimating = useRef(false);

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

  return (
    <div
      ref={containerRef}
      className="antialiased selection:bg-[#603318] selection:text-[#f1c7a9] overflow-x-hidden min-h-screen text-[#1a1a1a]"
      style={{ backgroundColor: "#f1c7a9" }}
    >
      {/* Embedded Styles for custom fonts and classes */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400;1,700&family=Space+Grotesk:wght@400;600;700&family=Space+Mono&display=swap');

        html {
          scroll-behavior: smooth;
        }

        @media (prefers-reduced-motion: reduce) {
          html {
            scroll-behavior: auto;
          }
        }

        :root {
          --bg-color: #f1c7a9;
          --shadow-light: #ffe6c3;
          --shadow-dark: #d0a587;
        }

        /* Typography Classes */
        .font-serif { font-family: "Playfair Display", serif; }
        .font-display { font-family: "Space Grotesk", sans-serif; }
        .font-mono-text { font-family: "Space Mono", monospace; }

        /* Neumorphic Card Styling */
        .neumorphic {
          background-color: var(--bg-color);
          box-shadow: 20px 20px 60px var(--shadow-dark),
                     -20px -20px 60px var(--shadow-light);
        }

        /* Smooth Custom Scrollbar */
        ::-webkit-scrollbar { width: 10px; }
        ::-webkit-scrollbar-track { background: var(--bg-color); }
        ::-webkit-scrollbar-thumb {
          background: var(--shadow-dark);
          border-radius: 5px;
        }
        ::-webkit-scrollbar-thumb:hover { background: #b88f72; }

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
          outline: 2px solid #3a1d0d;
          outline-offset: 3px;
          border-radius: 4px;
        }
      `}</style>

      <a href="#main-content" className="skip-link neumorphic px-5 py-3 rounded-full font-display font-semibold text-[#3a1d0d] bg-[#f1c7a9]">
        Skip to content
      </a>

      {/* Navigation */}
      <header>
        <nav className="fixed top-6 left-1/2 -translate-x-1/2 w-[95%] max-w-7xl z-50 px-6 py-4 bg-[#f1c7a9]/40 backdrop-blur-xl rounded-full shadow-sm flex justify-between items-center border border-white/20 reveal-nav">
          <a href="#" className="flex items-center gap-3" aria-label="Back to top">
            <svg className="w-8 h-8 text-[#603318]" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4 19h16v2H4zM20 3H4v10c0 2.21 1.79 4 4 4h6c2.21 0 4-1.79 4-4v-3h2c1.11 0 2-.89 2-2V5c0-1.11-.89-2-2-2zm-2 5h-2V5h2v3z" />
            </svg>
            <span className="font-display font-bold text-xl md:text-2xl tracking-wide text-[#3a1d0d]">
              Caffeine
            </span>
          </a>

          {/* Desktop Menu */}
          <div className="hidden md:flex gap-10 font-display font-semibold text-lg text-[#3a1d0d]">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="hover:text-white transition-colors duration-300"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className={`md:hidden hamburger flex flex-col justify-center items-center w-8 h-8 gap-1.5 ${isMobileMenuOpen ? "active" : ""}`}
            onClick={toggleMobileMenu}
            aria-label="Toggle mobile menu"
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-menu"
          >
            <span className="hamburger-line w-6 h-0.5 bg-[#3a1d0d] block"></span>
            <span className="hamburger-line w-6 h-0.5 bg-[#3a1d0d] block"></span>
            <span className="hamburger-line w-6 h-0.5 bg-[#3a1d0d] block"></span>
          </button>
        </nav>
      </header>

      {/* Mobile Menu Overlay */}
      <div
        id="mobile-menu"
        className={`mobile-menu fixed top-0 right-0 w-72 h-full bg-[#f1c7a9] z-40 pt-28 px-8 shadow-2xl md:hidden ${isMobileMenuOpen ? "open" : ""}`}
        // inert (not just aria-hidden) keeps focus from landing on hidden
        // links when the panel is closed
        inert={isMobileMenuOpen ? undefined : ""}
        aria-hidden={!isMobileMenuOpen}
      >
        <div className="flex flex-col gap-8 font-display font-semibold text-xl text-[#3a1d0d]">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="hover:text-white transition-colors duration-300 border-b border-[#3a1d0d]/20 pb-4"
              onClick={closeMobileMenu}
            >
              {link.label}
            </a>
          ))}
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
        <section className="relative min-h-screen flex items-center justify-center pt-32 pb-12 px-4 overflow-hidden">
          <div className="relative w-full max-w-6xl h-[34rem] sm:h-[36rem]">
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
              className="neumorphic absolute left-0 sm:-left-6 top-1/2 -translate-y-1/2 z-40 w-14 h-14 rounded-full flex items-center justify-center text-[#3a1d0d] hover:scale-105 active:scale-95 transition-transform"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => goToDrink(1)}
              aria-label="Next drink"
              className="neumorphic absolute right-0 sm:-right-6 top-1/2 -translate-y-1/2 z-40 w-14 h-14 rounded-full flex items-center justify-center text-[#3a1d0d] hover:scale-105 active:scale-95 transition-transform"
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
                    i === activeIndex ? "w-6 bg-[#3a1d0d]" : "w-2 bg-[#3a1d0d]/30"
                  }`}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Title Section */}
        <section className="py-24 px-6 flex justify-center">
          <h1 className="reveal font-serif italic text-4xl sm:text-5xl md:text-7xl lg:text-[5.5rem] text-center text-[#3a1d0d] max-w-5xl leading-tight">
            Discover the art of perfect coffee
          </h1>
        </section>

        {/* Start Ordering CTA */}
        <section className="pb-24 flex justify-center">
          <button
            onClick={() => navigate("/login")}
            className="neumorphic px-12 py-5 rounded-full font-display font-bold text-lg transition-all duration-300 hover:scale-105 hover:text-[#603318] active:scale-95 text-[#3a1d0d]"
          >
            Start ordering &rarr;
          </button>
        </section>

        {/* About The House */}
        <section id="about" className="py-24 px-8 flex justify-center scroll-mt-24">
          <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="reveal">
              <p className="text-sm tracking-[0.2em] uppercase mb-4 font-bold text-[#603318]">
                About the house
              </p>
              <h2 className="font-display text-5xl md:text-7xl font-bold mb-8 uppercase text-[#1a1a1a]">
                Coffee Haven
              </h2>
              <p className="font-mono-text text-lg md:text-xl leading-relaxed text-gray-800">
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
              <p className="text-sm tracking-[0.2em] uppercase mb-4 font-bold text-[#603318]">
                Roasted, Pulled, Poured
              </p>
              <h2 className="font-display text-5xl md:text-7xl font-bold mb-8 uppercase text-[#1a1a1a]">
                Taste of Coffee
              </h2>
              <p className="font-mono-text text-lg md:text-xl leading-relaxed text-gray-800 text-right">
                From bright Americanos to creamy cappuccinos, every drink starts
                with balanced beans and a precise pour. Our baristas tune each cup
                for sweetness, body, and a finish that lingers.
              </p>
            </div>
          </div>
        </section>

        {/* Best-Selling Cups */}
        <section id="menu" className="py-32 px-8 flex flex-col items-center scroll-mt-24">
          <h2 className="reveal font-display text-5xl md:text-7xl font-bold mb-20 uppercase text-center text-[#1a1a1a]">
            Best-selling cups
          </h2>

          <div className="flex flex-wrap justify-center gap-12">
            {BEST_SELLERS.map((item, i) => (
              <article
                key={item.name}
                className="reveal neumorphic rounded-[2.5rem] p-6 w-80 flex flex-col text-left group cursor-pointer"
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <div className="w-full h-64 rounded-[2rem] overflow-hidden mb-6">
                  <img
                    src={item.img}
                    alt={item.alt}
                    loading="lazy"
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                  />
                </div>
                <h3 className="font-display text-3xl font-bold mb-2 text-[#3a1d0d]">
                  {item.name}
                </h3>
                <p className="font-mono-text text-xl text-gray-700">{item.price}</p>
              </article>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer id="contact" className="bg-[#522912] text-[#f1c7a9] rounded-t-[4rem] px-5 py-20 mt-12 flex flex-col items-center text-center shadow-2xl relative overflow-hidden scroll-mt-24">
        <div className="relative z-10 flex flex-col items-center">
          <h2 className="reveal font-serif italic text-5xl sm:text-7xl md:text-[9rem] lg:text-[12rem] mb-8 leading-none">
            Caffeine
          </h2>
          <p className="reveal font-mono-text text-xl md:text-3xl max-w-3xl mt-20 mb-16 text-[#e8b590]">
            Better coffee, better mornings — crafted daily at Caffeine.
          </p>

          <div className="reveal flex flex-col md:flex-row gap-6 font-mono-text text-sm md:text-base">
            <span className="bg-[#3a1d0d] px-8 py-4 rounded-full shadow-inner border border-[#f1c7a9]/10">
              Open daily: 8 AM-10 PM
            </span>
            <a href="mailto:hello@caffeine.cafe" className="bg-[#3a1d0d] px-8 py-4 rounded-full shadow-inner border border-[#f1c7a9]/10 hover:bg-[#4a2511] transition-colors duration-300">
              hello@caffeine.cafe
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
