import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default function CaffeineLanding() {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const containerRef = useRef(null);

  // Manage body scroll lock when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  // GSAP Animations with context for React StrictMode safety
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      // Initial Navbar Drop
      gsap.from(".reveal-nav", {
        y: -100,
        opacity: 0,
        duration: 1.2,
        ease: "power4.out",
        delay: 0.2,
      });

      // Hero Cards Entrance
      gsap.from(".hero-card", {
        y: 150,
        opacity: 0,
        duration: 1.5,
        stagger: 0.2,
        ease: "power4.out",
        delay: 0.5,
      });

      // Continuous Floating Animation for Hero Cups
      gsap.to(".hero-cup", {
        y: -20,
        duration: 2.5,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut",
        stagger: 0.3,
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

  return (
    <div
      ref={containerRef}
      className="antialiased selection:bg-[#603318] selection:text-[#f1c7a9] overflow-x-hidden min-h-screen text-[#1a1a1a]"
      style={{ backgroundColor: "#f1c7a9" }}
    >
      {/* Embedded Styles for custom fonts and classes */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400;1,700&family=Space+Grotesk:wght@400;600;700&family=Space+Mono&display=swap');

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
      `}</style>

      {/* Navigation */}
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 w-[95%] max-w-7xl z-50 px-6 py-4 bg-[#f1c7a9]/40 backdrop-blur-xl rounded-full shadow-sm flex justify-between items-center border border-white/20 reveal-nav">
        <div className="flex items-center gap-3">
          <svg className="w-8 h-8 text-[#603318]" fill="currentColor" viewBox="0 0 24 24">
            <path d="M4 19h16v2H4zM20 3H4v10c0 2.21 1.79 4 4 4h6c2.21 0 4-1.79 4-4v-3h2c1.11 0 2-.89 2-2V5c0-1.11-.89-2-2-2zm-2 5h-2V5h2v3z" />
          </svg>
          <span className="font-display font-bold text-xl md:text-2xl tracking-wide text-[#3a1d0d]">
            Caffeine
          </span>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex gap-10 font-display font-semibold text-lg text-[#3a1d0d]">
          <a href="#" className="hover:text-white transition-colors duration-300">Menu</a>
          <a href="#" className="hover:text-white transition-colors duration-300">About</a>
          <a href="#" className="hover:text-white transition-colors duration-300">Contact</a>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className={`md:hidden hamburger flex flex-col justify-center items-center w-8 h-8 gap-1.5 ${isMobileMenuOpen ? "active" : ""}`}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <span className="hamburger-line w-6 h-0.5 bg-[#3a1d0d] block"></span>
          <span className="hamburger-line w-6 h-0.5 bg-[#3a1d0d] block"></span>
          <span className="hamburger-line w-6 h-0.5 bg-[#3a1d0d] block"></span>
        </button>
      </nav>

      {/* Mobile Menu Overlay */}
      <div className={`mobile-menu fixed top-0 right-0 w-72 h-full bg-[#f1c7a9] z-40 pt-28 px-8 shadow-2xl md:hidden ${isMobileMenuOpen ? "open" : ""}`}>
        <div className="flex flex-col gap-8 font-display font-semibold text-xl text-[#3a1d0d]">
          <a href="#" className="hover:text-white transition-colors duration-300 border-b border-[#3a1d0d]/20 pb-4" onClick={() => setIsMobileMenuOpen(false)}>Menu</a>
          <a href="#" className="hover:text-white transition-colors duration-300 border-b border-[#3a1d0d]/20 pb-4" onClick={() => setIsMobileMenuOpen(false)}>About</a>
          <a href="#" className="hover:text-white transition-colors duration-300 border-b border-[#3a1d0d]/20 pb-4" onClick={() => setIsMobileMenuOpen(false)}>Contact</a>
        </div>
      </div>

      {/* Mobile Menu Overlay Background */}
      <div
        className={`fixed inset-0 bg-black/50 z-30 md:hidden ${isMobileMenuOpen ? "block" : "hidden"}`}
        onClick={() => setIsMobileMenuOpen(false)}
      ></div>

      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center pt-32 pb-12 px-4">
        <div className="flex flex-col xl:flex-row gap-12 lg:gap-16 items-center">
          {/* Strawberry Drink */}
          <div className="hero-card w-[20rem] sm:w-[22rem] h-[30rem] sm:h-[32rem] rounded-[3rem] relative">
            <img
              src="/3acb30e950b0ffb33b7b01b5e6457e95-Photoroom.png"
              alt="Strawberry Drink"
              className="hero-cup absolute bottom-12 left-1/2 -translate-x-1/2 h-[115%] max-w-none w-auto object-contain drop-shadow-2xl z-10"
            />
          </div>

          {/* Iced Coffee */}
          <div className="hero-card w-[20rem] sm:w-[22rem] h-10 sm:h-[32rem] rounded-[3rem] relative">
            <img
              src="/dae3a884189cee56fde94fcefff0a036-Photoroom.png"
              alt="Iced Coffee"
              className="hero-cup absolute bottom-12 left-1/2 -translate-x-1/2 h-[115%] max-w-none w-auto object-contain drop-shadow-2xl z-10"
            />
          </div>

          {/* Matcha Drink */}
          <div className="hero-card w-[20rem] sm:w-[22rem] h-[26rem] sm:h-[28rem] rounded-[3rem] relative">
            <img
              src="/25f1c4880e288b19afcc6c747567405a-Photoroom.png"
              alt="Matcha Drink"
              className="hero-cup absolute mt-[10%] bottom-12 left-1/2 -translate-x-1/2 h-[115%] max-w-none w-auto object-contain drop-shadow-2xl z-10"
            />
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
          className="neumorphic px-12 py-5 rounded-full font-display font-bold text-lg transition-transform hover:scale-105 active:scale-95 text-[#3a1d0d]"
        >
          Start ordering →
        </button>
      </section>

      {/* About The House */}
      <section className="py-24 px-8 flex justify-center">
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
              alt="Latte Art"
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
              alt="Coffee Cup"
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
      <section className="py-32 px-8 flex flex-col items-center">
        <h2 className="reveal font-display text-5xl md:text-7xl font-bold mb-20 uppercase text-center text-[#1a1a1a]">
          Best-selling cups
        </h2>

        <div className="flex flex-wrap justify-center gap-12">
          {/* Cappuccino */}
          <div className="reveal neumorphic rounded-[2.5rem] p-6 w-80 flex flex-col text-left group">
            <div className="w-full h-64 rounded-[2rem] overflow-hidden mb-6">
              <img
                src="https://images.unsplash.com/photo-1534778101976-62847782c213?auto=format&fit=crop&w=800&q=80"
                alt="Cappuccino"
                className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
              />
            </div>
            <h3 className="font-display text-3xl font-bold mb-2 text-[#3a1d0d]">
              Cappuccino
            </h3>
            <p className="font-mono-text text-xl text-gray-700">₹220</p>
          </div>

          {/* Americano */}
          <div
            className="reveal neumorphic rounded-[2.5rem] p-6 w-80 flex flex-col text-left group"
            style={{ transitionDelay: "100ms" }}
          >
            <div className="w-full h-64 rounded-[2rem] overflow-hidden mb-6">
              <img
                src="https://images.unsplash.com/photo-1559525839-b184a4d698c7?auto=format&fit=crop&w=800&q=80"
                alt="Americano"
                className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
              />
            </div>
            <h3 className="font-display text-3xl font-bold mb-2 text-[#3a1d0d]">
              Americano
            </h3>
            <p className="font-mono-text text-xl text-gray-700">₹180</p>
          </div>

          {/* Espresso */}
          <div
            className="reveal neumorphic rounded-[2.5rem] p-6 w-80 flex flex-col text-left group"
            style={{ transitionDelay: "200ms" }}
          >
            <div className="w-full h-64 rounded-[2rem] overflow-hidden mb-6">
              <img
                src="https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?auto=format&fit=crop&w=800&q=80"
                alt="Espresso"
                className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
              />
            </div>
            <h3 className="font-display text-3xl font-bold mb-2 text-[#3a1d0d]">
              Espresso
            </h3>
            <p className="font-mono-text text-xl text-gray-700">₹160</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#522912] text-[#f1c7a9] rounded-t-[4rem] px-5 py-20 mt-12 flex flex-col items-center text-center shadow-2xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col items-center">
          <h1 className="reveal font-serif italic text-5xl sm:text-7xl md:text-[9rem] lg:text-[12rem] mb-8 leading-none">
            Caffeine
          </h1>
          <p className="reveal font-mono-text text-xl md:text-3xl max-w-3xl mt-20 mb-16 text-[#e8b590]">
            Better coffee, better mornings — crafted daily at Caffeine.
          </p>

          <div className="reveal flex flex-col md:flex-row gap-6 font-mono-text text-sm md:text-base">
            <span className="bg-[#3a1d0d] px-8 py-4 rounded-full shadow-inner border border-[#f1c7a9]/10">
              Open daily: 8 AM-10 PM
            </span>
            <span className="bg-[#3a1d0d] px-8 py-4 rounded-full shadow-inner border border-[#f1c7a9]/10">
              hello@caffeine.cafe
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
