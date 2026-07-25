import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";

import {
  MENU,
  SIZES,
  MILKS,
  SHOTS,
  SYRUPS,
  CART_STORAGE_KEY,
  PREFERENCES_KEY,
  ORDER_HISTORY_KEY,
  THEME_KEY,
  LOYALTY_KEY,
  FAVORITES_KEY,
} from "./data/menu";
import { useLocalStorage } from "./hooks/useLocalStorage";
import Navbar from "./components/Navbar";
import Header from "./components/Header";
import CategoryFilter from "./components/CategoryFilter";
import MenuItem from "./components/MenuItem";
import CartPanel from "./components/CartPanel";
import CartDrawer from "./components/CartDrawer";
import FloatingCartBar from "./components/FloatingCartBar";
import CustomizeModal from "./components/CustomizeModal";
import ConfirmModal from "./components/ConfirmModal";
import Toast from "./components/Toast";
import SearchBar from "./components/SearchBar";
import { getCurrentUser, logoutUser } from "./data/auth";

export default function App() {
  const navigate = useNavigate();

  // --- Persistent state (cart survives refresh) ---
  const [cart, setCart] = useLocalStorage(CART_STORAGE_KEY, []);
  const [prefs, setPrefs] = useLocalStorage(PREFERENCES_KEY, {});
  const [lastOrder, setLastOrder] = useLocalStorage(ORDER_HISTORY_KEY, null);
  const [theme, setTheme] = useLocalStorage(THEME_KEY, "light");
  const [orderCount, setOrderCount] = useLocalStorage(LOYALTY_KEY, 0);
  const [pickupTime, setPickupTime] = useState("asap");
  const [favorites, setFavorites] = useLocalStorage(FAVORITES_KEY, []);
  const [user, setUser] = useState(() => getCurrentUser());

  const toggleFavorite = useCallback(
    (itemId) => {
      setFavorites((prev) =>
        prev.includes(itemId)
          ? prev.filter((id) => id !== itemId)
          : [...prev, itemId],
      );
    },
    [setFavorites],
  );

  // Apply theme to <html> element
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  // --- Non-persistent state ---
  const [ticketNo, setTicketNo] = useState(() =>
    Math.floor(1000 + Math.random() * 9000),
  );
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [dietFilter, setDietFilter] = useState(null);

  // UI States
  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [toastAction, setToastAction] = useState(null);

  // Pending cart removal for undo
  const pendingRemovalRef = useRef(null);

  // Customize Modal States
  const [currentItem, setCurrentItem] = useState(null);
  const [modalSize, setModalSize] = useState("m");
  const [modalMilk, setModalMilk] = useState("whole");
  const [modalSugar, setModalSugar] = useState("normal");
  const [modalShots, setModalShots] = useState("single");
  const [modalSyrup, setModalSyrup] = useState("none");
  const [modalTemp, setModalTemp] = useState("regular");
  const [modalIce, setModalIce] = useState("regular");
  const [modalQty, setModalQty] = useState(1);

  const menuGridRef = useRef(null);
  const cartToggleRef = useRef(null);
  const cartPanelRef = useRef(null);

  // Calculations
  const { subtotal, tax, total, count } = useMemo(() => {
    const sub = cart.reduce((sum, c) => sum + c.unitPrice * c.qty, 0);
    const t = sub * 0.05;
    return {
      subtotal: sub,
      tax: t,
      total: sub + t,
      count: cart.reduce((s, c) => s + c.qty, 0),
    };
  }, [cart]);

  const filteredMenu = useMemo(() => {
    return MENU.filter((m) => {
      // Category filter
      if (activeCategory !== "all" && m.cat !== activeCategory) return false;
      // Search filter
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (
          !m.name.toLowerCase().includes(q) &&
          !m.note.toLowerCase().includes(q)
        )
          return false;
      }
      // Dietary filter
      if (dietFilter && !m.dietary?.includes(dietFilter)) return false;
      return true;
    });
  }, [activeCategory, searchQuery, dietFilter]);

  // GSAP Animations
  useEffect(() => {
    if (!menuGridRef.current) return;

    // Kill any existing tweens on menu items
    gsap.killTweensOf(".menu-item");

    // Stagger in with alternating direction for visual interest
    const items = menuGridRef.current.querySelectorAll(".menu-item");
    if (items.length === 0) return;

    gsap.set(items, { opacity: 0, y: 20, scale: 0.97 });

    items.forEach((item, i) => {
      gsap.to(item, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.4,
        delay: i * 0.04,
        ease: "power3.out",
        // Alternate x movement for a "card flip" feel
        x: i % 2 === 0 ? -8 : 8,
        onComplete: () => gsap.set(item, { x: 0 }),
      });
    });
  }, [filteredMenu]);

  // Fly-to-cart animation helper
  const flyToCart = useCallback(
    (sourceRect, imgSrc) => {
      const cartBtn = cartToggleRef.current;
      if (!cartBtn) return;
      const destRect = cartBtn.getBoundingClientRect();

      // Create floating element
      const el = document.createElement("div");
      el.style.cssText = `
        position: fixed; z-index: 9999; pointer-events: none;
        width: 48px; height: 48px; border-radius: 12px; overflow: hidden;
        box-shadow: 0 8px 24px rgba(0,0,0,0.25);
      `;
      el.innerHTML = `<img src="${imgSrc}" style="width:100%;height:100%;object-fit:cover;" alt="" />`;
      el.style.left = `${sourceRect.left + sourceRect.width / 2 - 24}px`;
      el.style.top = `${sourceRect.top + sourceRect.height / 2 - 24}px`;
      document.body.appendChild(el);

      const tl = gsap.timeline({
        onComplete: () => el.remove(),
      });

      tl.to(el, {
        x: destRect.left + destRect.width / 2 - 24 - (parseFloat(el.style.left)),
        y: destRect.top + destRect.height / 2 - 24 - (parseFloat(el.style.top)),
        scale: 0.3,
        opacity: 0.6,
        duration: 0.6,
        ease: "power3.inOut",
      });
    },
    [],
  );

  // Cart icon click handler — mobile opens drawer, desktop scrolls to panel
  const handleCartClick = useCallback(() => {
    if (window.innerWidth >= 1024) {
      // Desktop: scroll to cart panel with highlight
      if (cartPanelRef.current) {
        cartPanelRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
        // Flash highlight
        gsap.fromTo(
          cartPanelRef.current,
          { boxShadow: "0 0 0 4px var(--ink)" },
          { boxShadow: "0 0 0 0px var(--ink)", duration: 0.8, ease: "power2.out" },
        );
      }
    } else {
      // Mobile: open drawer
      setIsDrawerOpen(true);
    }
  }, []);

  // Auth handlers
  const handleLogout = useCallback(() => {
    setUser(null);
    logoutUser();
    navigate("/login", { replace: true });
  }, [navigate]);

  // Keyboard Accessibility
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setIsCustomizeOpen(false);
        setIsConfirmOpen(false);
        setIsDrawerOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Cart Handlers
  const openCustomize = useCallback(
    (item) => {
      setCurrentItem(item);
      // Load smart defaults from preferences, fall back to defaults
      const saved = prefs[item.cat] || {};
      setModalSize(saved.size || "m");
      setModalMilk(saved.milk || "whole");
      setModalSugar("normal");
      setModalShots("single");
      setModalSyrup("none");
      setModalTemp(item.cat === "hot" ? "regular" : undefined);
      setModalIce(item.cat !== "hot" ? "regular" : undefined);
      setModalQty(1);
      setIsCustomizeOpen(true);
    },
    [prefs],
  );

  // Save preference when size or milk changes in modal
  const handleModalSizeChange = useCallback(
    (val) => {
      setModalSize(val);
      if (currentItem) {
        setPrefs((prev) => ({
          ...prev,
          [currentItem.cat]: {
            ...prev[currentItem.cat],
            size: val,
          },
        }));
      }
    },
    [currentItem, setPrefs],
  );
  const handleModalMilkChange = useCallback(
    (val) => {
      setModalMilk(val);
      if (currentItem) {
        setPrefs((prev) => ({
          ...prev,
          [currentItem.cat]: {
            ...prev[currentItem.cat],
            milk: val,
          },
        }));
      }
    },
    [currentItem, setPrefs],
  );

  const currentUnitPrice = useMemo(() => {
    if (!currentItem) return 0;
    const size = SIZES.find((s) => s.id === modalSize);
    const milk = MILKS.find((m) => m.id === modalMilk);
    const shots = SHOTS.find((s) => s.id === modalShots);
    const syrup = SYRUPS.find((s) => s.id === modalSyrup);
    return (
      currentItem.price * size.mult +
      milk.extra +
      (shots?.extra || 0) +
      (syrup?.extra || 0)
    );
  }, [currentItem, modalSize, modalMilk, modalShots, modalSyrup]);

  const handleAddToCart = useCallback(() => {
    const key = `${currentItem.id}-${modalSize}-${modalMilk}-${modalSugar}-${modalShots}-${modalSyrup}-${modalTemp || ""}-${modalIce || ""}`;
    setCart((prev) => {
      const existing = prev.find((c) => c.key === key);
      if (existing) {
        return prev.map((c) =>
          c.key === key ? { ...c, qty: c.qty + modalQty } : c,
        );
      }
      return [
        ...prev,
        {
          key,
          id: currentItem.id,
          name: currentItem.name,
          img: currentItem.img,
          size: SIZES.find((s) => s.id === modalSize).label,
          milk: MILKS.find((m) => m.id === modalMilk).label,
          sugar: modalSugar,
          shots: modalShots,
          syrup: modalSyrup,
          temp: modalTemp,
          ice: modalIce,
          unitPrice: currentUnitPrice,
          qty: modalQty,
        },
      ];
    });
    setIsCustomizeOpen(false);
    setToastMsg(`${currentItem.name} added to your cup`);

    // Use modal center as source for fly animation
    const modalEl = document.querySelector('[role="dialog"][aria-modal="true"]');
    if (modalEl) {
      const rect = modalEl.getBoundingClientRect();
      flyToCart(
        { left: rect.left + rect.width / 2, top: rect.top + rect.height / 2, width: 0, height: 0 },
        currentItem.img,
      );
    } else if (cartToggleRef.current) {
      gsap.fromTo(
        cartToggleRef.current,
        { scale: 1 },
        { scale: 1.2, duration: 0.1, yoyo: true, repeat: 1, ease: "power2.inOut" },
      );
    }
  }, [
    currentItem,
    modalSize,
    modalMilk,
    modalSugar,
    modalShots,
    modalSyrup,
    modalTemp,
    modalIce,
    modalQty,
    currentUnitPrice,
    setCart,
    flyToCart,
  ]);

  const changeQty = useCallback(
    (key, delta) => {
      setCart((prev) => {
        const item = prev.find((c) => c.key === key);
        if (!item) return prev;
        const newQty = item.qty + delta;

        // Instead of removing immediately, defer removal with undo
        if (newQty <= 0) {
          pendingRemovalRef.current = item;
          setToastMsg(`${item.name} removed`);
          setToastAction({
            label: "Undo",
            onClick: () => {
              // Restore the item
              setCart((prev2) => {
                const stillThere = prev2.find((c) => c.key === key);
                if (stillThere) return prev2; // Already restored
                return [...prev2, pendingRemovalRef.current];
              });
              setToastMsg("");
              setToastAction(null);
              pendingRemovalRef.current = null;
            },
          });
          return prev.filter((c) => c.key !== key);
        }

        return prev.map((c) => (c.key === key ? { ...c, qty: newQty } : c));
      });
    },
    [setCart],
  );

  const placeOrder = useCallback(() => {
    if (cart.length === 0) return;
    setIsConfirmOpen(true);
    setIsDrawerOpen(false);
  }, [cart]);

  const startNewOrder = useCallback(() => {
    // Save current cart as last order before clearing
    setLastOrder(cart);
    // Increment loyalty
    setOrderCount((prev) => prev + 1);
    setCart([]);
    setTicketNo(Math.floor(1000 + Math.random() * 9000));
    setIsConfirmOpen(false);
  }, [setCart, setLastOrder, setOrderCount, cart]);

  const reorderLastOrder = useCallback(() => {
    if (lastOrder && lastOrder.length > 0) {
      setCart(lastOrder);
      setToastMsg("Last order restored to your cup");
    }
  }, [lastOrder, setCart]);

  // Quick-add with default options (no modal)
  const handleQuickAdd = useCallback(
    (item, sourceRect) => {
      const size = SIZES.find((s) => s.id === "m");
      const milk = MILKS.find((m) => m.id === "whole");
      const shots = SHOTS.find((s) => s.id === "single");
      const syrup = SYRUPS.find((s) => s.id === "none");
      const unitPrice =
        item.price * size.mult + milk.extra + (shots?.extra || 0) + (syrup?.extra || 0);
      const key = `${item.id}-m-whole-normal-single-none-regular-regular`;

      setCart((prev) => {
        const existing = prev.find((c) => c.key === key);
        if (existing) {
          return prev.map((c) =>
            c.key === key ? { ...c, qty: c.qty + 1 } : c,
          );
        }
        return [
          ...prev,
          {
            key,
            id: item.id,
            name: item.name,
            img: item.img,
            size: "M",
            milk: "Whole",
            sugar: "normal",
            shots: "single",
            syrup: "none",
            temp: item.cat === "hot" ? "regular" : undefined,
            ice: item.cat !== "hot" ? "regular" : undefined,
            unitPrice,
            qty: 1,
          },
        ];
      });
      // Fly animation
      if (sourceRect) {
        flyToCart(sourceRect, item.img);
      } else {
        // Fallback bounce
        if (cartToggleRef.current) {
          gsap.fromTo(
            cartToggleRef.current,
            { scale: 1 },
            { scale: 1.2, duration: 0.1, yoyo: true, repeat: 1, ease: "power2.inOut" },
          );
        }
      }
      setToastMsg(`${item.name} added to your cup`);
    },
    [setCart, flyToCart],
  );

  const currentModalTotal = currentUnitPrice * modalQty;

  return (
    <div className="antialiased selection:bg-[#603318] selection:text-[#f1c7a9] pb-20 md:pb-0">
      {/* Toast notification */}
      <Toast
        message={toastMsg}
        action={toastAction}
        onDone={() => {
          setToastMsg("");
          setToastAction(null);
          pendingRemovalRef.current = null;
        }}
      />

      {/* Navbar */}
      <Navbar
        ref={cartToggleRef}
        count={count}
        theme={theme}
        user={user}
        onLogout={handleLogout}
        onThemeToggle={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
        onCartClick={handleCartClick}
      />

      {/* Header */}
      <Header />

      {/* Category Filter */}
      <CategoryFilter
        activeCategory={activeCategory}
        onChange={setActiveCategory}
      />

      {/* Search + Dietary Filters */}
      <SearchBar
        query={searchQuery}
        onQueryChange={setSearchQuery}
        dietFilter={dietFilter}
        onDietFilterChange={setDietFilter}
      />

      {/* Main Layout */}
      <main className="px-4 sm:px-6 pb-32 lg:pb-16 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-10 items-start">
        {/* Menu Grid */}
        <div
          ref={menuGridRef}
          className="grid grid-cols-1 sm:grid-cols-2 gap-6"
          role="list"
          aria-label="Coffee menu"
        >
          {filteredMenu.length > 0 ? (
            filteredMenu.map((item) => (
              <div role="listitem" key={item.id}>
                <MenuItem
                  item={item}
                  isFavorite={favorites.includes(item.id)}
                  onToggleFavorite={toggleFavorite}
                  onCustomize={openCustomize}
                  onQuickAdd={handleQuickAdd}
                />
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-16 space-y-3">
              <div className="text-5xl opacity-30" aria-hidden="true">
                {searchQuery ? "🔍" : dietFilter ? "🥗" : "☕"}
              </div>
              <p className="font-display font-semibold text-sm text-[#603318]">
                {searchQuery
                  ? `No results for "${searchQuery}"`
                  : dietFilter
                    ? `No ${dietFilter.replace("-", " ")} options here`
                    : "Nothing here yet"}
              </p>
              <p className="font-mono-text text-xs text-[#603318]/60">
                {searchQuery
                  ? "Try a different search term"
                  : dietFilter
                    ? "Try a different filter"
                    : "Check back soon for new additions"}
              </p>
            </div>
          )}
        </div>

        {/* Desktop Cart Panel */}
        <div ref={cartPanelRef}>
          <CartPanel
            cart={cart}
            subtotal={subtotal}
            tax={tax}
            total={total}
            ticketNo={ticketNo}
            onChangeQty={changeQty}
            onPlaceOrder={placeOrder}
            onReorder={reorderLastOrder}
            hasLastOrder={lastOrder && lastOrder.length > 0}
            orderCount={orderCount}
            pickupTime={pickupTime}
            onPickupTimeChange={setPickupTime}
          />
        </div>
      </main>

      {/* Mobile Floating Bar */}
      <FloatingCartBar
        count={count}
        total={total}
        onClick={() => setIsDrawerOpen(true)}
      />

      {/* Mobile Cart Drawer */}
      <CartDrawer
        isOpen={isDrawerOpen}
        cart={cart}
        subtotal={subtotal}
        tax={tax}
        total={total}
        ticketNo={ticketNo}
        onChangeQty={changeQty}
        onPlaceOrder={placeOrder}
        onReorder={reorderLastOrder}
        hasLastOrder={lastOrder && lastOrder.length > 0}
        orderCount={orderCount}
        pickupTime={pickupTime}
        onPickupTimeChange={setPickupTime}
        onClose={() => setIsDrawerOpen(false)}
      />

      {/* Customize Modal */}
      <CustomizeModal
        isOpen={isCustomizeOpen}
        item={currentItem}
        size={modalSize}
        milk={modalMilk}
        sugar={modalSugar}
        shots={modalShots}
        syrup={modalSyrup}
        temp={modalTemp}
        ice={modalIce}
        qty={modalQty}
        totalPrice={currentModalTotal}
        onSizeChange={handleModalSizeChange}
        onMilkChange={handleModalMilkChange}
        onSugarChange={setModalSugar}
        onShotsChange={setModalShots}
        onSyrupChange={setModalSyrup}
        onTempChange={setModalTemp}
        onIceChange={setModalIce}
        onQtyChange={setModalQty}
        onAddToCart={handleAddToCart}
        onClose={() => setIsCustomizeOpen(false)}
      />

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={isConfirmOpen}
        cart={cart}
        total={total}
        ticketNo={ticketNo}
        onNewOrder={startNewOrder}
      />
    </div>
  );
}
