import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";
import { MENU as ALL_ITEMS } from "../data/menu";
import { getCurrentUser, logoutUser } from "../data/auth";
import AdminSidebar from "../components/admin/AdminSidebar";
import AdminTopbar from "../components/admin/AdminTopbar";
import AdminMetricCard from "../components/admin/AdminMetricCard";
const MOCK_ORDERS = [
  { id: "ORD-1042", customer: "Aarav S.", items: ["Cappuccino", "Cold Brew"], total: 410, status: "pending", time: "2 min ago" },
  { id: "ORD-1041", customer: "Priya K.", items: ["Matcha Latte"], total: 230, status: "preparing", time: "8 min ago" },
  { id: "ORD-1040", customer: "Rohan M.", items: ["Iced Mocha", "Flat White"], total: 470, status: "preparing", time: "12 min ago" },
  { id: "ORD-1039", customer: "Ananya R.", items: ["Americano", "Vanilla Latte"], total: 390, status: "completed", time: "25 min ago" },
  { id: "ORD-1038", customer: "Vikram J.", items: ["Espresso", "Strawberry Refresher"], total: 410, status: "completed", time: "40 min ago" },
  { id: "ORD-1037", customer: "Neha W.", items: ["Caramel Macchiato"], total: 250, status: "completed", time: "1h ago" },
  { id: "ORD-1036", customer: "David L.", items: ["Cold Brew", "Iced Latte"], total: 400, status: "completed", time: "1.5h ago" },
];

const LOW_STOCK_THRESHOLD = 15;
const ADMIN_SECTION_IDS = ["dashboard", "inventory", "orders", "analytics", "settings"];

function getStockLevel(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = ((hash << 5) - hash) + name.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) % 80 + 5;
}
function ChartPlaceholder({ title, bars = 7, delay = 0 }) {
  const chartRef = useRef(null);

  useEffect(() => {
    if (!chartRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(chartRef.current, { y: 20, opacity: 0 }, {
        y: 0,
        opacity: 1,
        duration: 0.5,
        delay,
        ease: "power3.out",
        clearProps: "transform,opacity",
      });
    }, chartRef);

    return () => ctx.revert();
  }, [delay]);

  const hours = ["8AM", "10AM", "12PM", "2PM", "4PM", "6PM", "8PM"];

  return (
    <div ref={chartRef} className="neumorphic rounded-[1.5rem] p-5 flex flex-col min-h-[188px]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-bold text-sm" style={{ color: "var(--ink)" }}>
          {title}
        </h3>
        <span className="font-mono-text text-[10px]" style={{ color: "var(--ink-soft)" }}>
          Last 7 days
        </span>
      </div>
      <div className="flex items-end justify-between gap-2 h-28 mb-2">
        {Array.from({ length: bars }, (_, i) => {
          const h = 20 + Math.sin(i * 1.2 + 1) * 30 + Math.cos(i * 0.7) * 15;
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div
                className="w-full rounded-t-md transition-all duration-500"
                style={{
                  height: `${Math.max(12, h)}%`,
                  backgroundColor: "var(--ink)",
                  opacity: 0.6 + (i / bars) * 0.3,
                  borderRadius: "4px 4px 0 0",
                }}
              />
            </div>
          );
        })}
      </div>
      <div className="flex justify-between">
        {hours.slice(0, bars).map((h, i) => (
          <span key={i} className="font-mono-text text-[8px] flex-1 text-center" style={{ color: "var(--ink-soft)" }}>
            {h}
          </span>
        ))}
      </div>
    </div>
  );
}
function DonutChart({ title, items, delay = 0 }) {
  const chartRef = useRef(null);
  const colors = ["#3a1d0d", "#603318", "#8b5e3c", "#b88f72", "#d4a88a"];

  useEffect(() => {
    if (!chartRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(chartRef.current, { y: 20, opacity: 0 }, {
        y: 0,
        opacity: 1,
        duration: 0.5,
        delay,
        ease: "power3.out",
        clearProps: "transform,opacity",
      });
    }, chartRef);

    return () => ctx.revert();
  }, [delay]);

  const total = items.reduce((s, x) => s + x.value, 0);

  return (
    <div ref={chartRef} className="neumorphic rounded-[1.5rem] p-5 flex flex-col min-h-[188px]">
      <h3 className="font-display font-bold text-sm mb-4" style={{ color: "var(--ink)" }}>
        {title}
      </h3>
      <div className="flex items-center gap-6">
        <div className="relative w-28 h-28 flex-shrink-0">
          <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
            {items.map((item, i) => {
              const pct = item.value / total;
              const circumference = 2 * Math.PI * 13;
              const dashArray = circumference * pct;
              const dashOffset = items
                .slice(0, i)
                .reduce((s, x) => s - circumference * (x.value / total), 0);
              return (
                <circle
                  key={item.label}
                  cx="18" cy="18" r="13"
                  fill="none"
                  stroke={colors[i % colors.length]}
                  strokeWidth="3"
                  strokeDasharray={`${dashArray} ${circumference - dashArray}`}
                  strokeDashoffset={dashOffset}
                  style={{ transition: "stroke-dasharray 0.6s ease, stroke-dashoffset 0.6s ease" }}
                />
              );
            })}
            <circle cx="18" cy="18" r="8" fill="var(--bg-color)" />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center font-display font-bold text-sm" style={{ color: "var(--ink)" }}>
            {total}
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          {items.map((item, i) => (
            <div key={item.label} className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: colors[i % colors.length] }} />
              <span className="font-mono-text text-[10px]" style={{ color: "var(--ink-soft)" }}>
                {item.label}
              </span>
              <span className="font-mono-text text-[10px] font-semibold ml-auto" style={{ color: "var(--ink)" }}>
                {Math.round((item.value / total) * 100)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
function StatusPill({ status }) {
  const config = {
    pending: { bg: "rgba(243,156,18,0.12)", color: "#f39c12", label: "Pending" },
    preparing: { bg: "rgba(52,152,219,0.12)", color: "#3498db", label: "Preparing" },
    completed: { bg: "rgba(46,204,113,0.12)", color: "#2ecc71", label: "Completed" },
  };
  const c = config[status] || config.pending;
  return (
    <span className="font-mono-text text-[9px] px-2.5 py-1 rounded-full font-semibold whitespace-nowrap"
      style={{ backgroundColor: c.bg, color: c.color }}
    >
      {c.label}
    </span>
  );
}
function DashboardSection({ todayRevenue, activeOrders, lowStockCount, totalCustomers, onNavigate, orders }) {
  return (
    <div className="block space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <AdminMetricCard title="Today's Revenue" value={todayRevenue} trend="+12%" subtitle="vs yesterday" icon="₹" color="#3a1d0d" delay={0} />
        <AdminMetricCard title="Active Orders" value={activeOrders} trend={activeOrders > 0 ? `+${activeOrders}` : "0"} subtitle="Currently in progress" icon="#" color="#603318" delay={0.05} />
        <AdminMetricCard title="Stock Alerts" value={`${lowStockCount} items`} trend={lowStockCount > 0 ? "↓ Low" : "✓ Good"} subtitle={lowStockCount > 0 ? "Needs attention" : "All stocked up"} icon="!" color={lowStockCount > 0 ? "#e74c3c" : "#2ecc71"} delay={0.1} />
        <AdminMetricCard title="Total Customers" value={totalCustomers} trend="+8%" subtitle="This month" icon="◎" color="#522912" delay={0.15} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartPlaceholder title="Sales Trend (Daily)" bars={7} delay={0.2} />
        <DonutChart title="Popular Items" items={[
          { label: "Cappuccino", value: 145 },
          { label: "Cold Brew", value: 98 },
          { label: "Matcha Latte", value: 72 },
          { label: "Americano", value: 55 },
        ]} delay={0.25} />
      </div>
      <div className="neumorphic rounded-[1.5rem] p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-bold text-sm" style={{ color: "var(--ink)" }}>Recent Orders</h3>
          <button onClick={() => onNavigate("orders")}
            className="font-mono-text text-[10px] underline underline-offset-2 hover:opacity-70 transition-opacity"
            style={{ color: "var(--ink-soft)" }}>
            View all →
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="font-mono-text text-[10px] uppercase tracking-wider" style={{ color: "var(--ink-soft)" }}>
                <th className="pb-3 pr-4 font-semibold">Order</th>
                <th className="pb-3 pr-4 font-semibold">Customer</th>
                <th className="pb-3 pr-4 font-semibold hidden sm:table-cell">Items</th>
                <th className="pb-3 pr-4 font-semibold">Total</th>
                <th className="pb-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.slice(0, 5).map((order) => (
                <tr key={order.id} className="border-t" style={{ borderColor: "var(--dash-color)" }}>
                  <td className="py-3 pr-4 font-mono-text text-xs font-semibold" style={{ color: "var(--ink)" }}>{order.id}</td>
                  <td className="py-3 pr-4 font-display text-xs font-medium" style={{ color: "var(--ink)" }}>{order.customer}</td>
                  <td className="py-3 pr-4 hidden sm:table-cell font-mono-text text-[10px]" style={{ color: "var(--ink-soft)" }}>{order.items.join(", ")}</td>
                  <td className="py-3 pr-4 font-mono-text text-xs font-semibold" style={{ color: "var(--ink)" }}>₹{order.total}</td>
                  <td className="py-3"><StatusPill status={order.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function InventorySection({ items, lowStockCount }) {
  return (
    <div className="block space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-bold" style={{ color: "var(--ink)" }}>Inventory & Stock</h2>
        <span className="font-mono-text text-[10px] px-3 py-1.5 rounded-full"
          style={{
            backgroundColor: lowStockCount > 0 ? "rgba(231,76,60,0.12)" : "rgba(46,204,113,0.12)",
            color: lowStockCount > 0 ? "#e74c3c" : "#2ecc71",
          }}>
          {lowStockCount > 0 ? `${lowStockCount} low-stock items` : "All stocked"}
        </span>
      </div>
      <div className="neumorphic rounded-[1.5rem] p-5 overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="font-mono-text text-[10px] uppercase tracking-wider" style={{ color: "var(--ink-soft)" }}>
              <th className="pb-3 pr-4 font-semibold">Item</th>
              <th className="pb-3 pr-4 font-semibold">Category</th>
              <th className="pb-3 pr-4 font-semibold">Stock Level</th>
              <th className="pb-3 pr-4 font-semibold">Status</th>
              <th className="pb-3 font-semibold">Action</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-t" style={{ borderColor: "var(--dash-color)" }}>
                <td className="py-3 pr-4">
                  <div className="flex items-center gap-3">
                    <img src={item.img} alt={item.name} className="w-9 h-9 rounded-lg object-cover flex-shrink-0 shadow-sm" />
                    <span className="font-display text-xs font-semibold" style={{ color: "var(--ink)" }}>{item.name}</span>
                  </div>
                </td>
                <td className="py-3 pr-4">
                  <span className="font-mono-text text-[10px] px-2 py-0.5 rounded-full capitalize"
                    style={{ backgroundColor: "var(--shadow-dark)", color: "var(--ink-soft)" }}>
                    {item.cat}
                  </span>
                </td>
                <td className="py-3 pr-4">
                  <div className="flex items-center gap-3 max-w-[140px]">
                    <div className="flex-1 h-2 rounded-full" style={{ backgroundColor: "var(--shadow-dark)" }}>
                      <div className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(100, item.stock)}%`,
                          backgroundColor: item.low ? "#e74c3c" : "var(--ink)",
                        }} />
                    </div>
                    <span className="font-mono-text text-[10px] font-semibold flex-shrink-0" style={{ color: "var(--ink)" }}>{item.stock}</span>
                  </div>
                </td>
                <td className="py-3 pr-4">
                  {item.low ? (
                    <span className="font-mono-text text-[9px] px-2 py-0.5 rounded-full font-semibold"
                      style={{ backgroundColor: "rgba(231,76,60,0.12)", color: "#e74c3c" }}>⚠ Low Stock</span>
                  ) : (
                    <span className="font-mono-text text-[9px] px-2 py-0.5 rounded-full font-semibold"
                      style={{ backgroundColor: "rgba(46,204,113,0.12)", color: "#2ecc71" }}>✓ In Stock</span>
                  )}
                </td>
                <td className="py-3">
                  <button className="neumorphic-sm px-3 py-1.5 rounded-full font-mono-text text-[9px] font-semibold active:scale-90 transition-all"
                    style={{ color: "var(--ink)" }}>Restock</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function OrdersSection({ orders }) {
  return (
    <div className="block space-y-4">
      <h2 className="font-display text-xl font-bold" style={{ color: "var(--ink)" }}>Order Management</h2>
      <div className="neumorphic rounded-[1.5rem] p-5 overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="font-mono-text text-[10px] uppercase tracking-wider" style={{ color: "var(--ink-soft)" }}>
              <th className="pb-3 pr-4 font-semibold">Order ID</th>
              <th className="pb-3 pr-4 font-semibold">Customer</th>
              <th className="pb-3 pr-4 font-semibold hidden md:table-cell">Items</th>
              <th className="pb-3 pr-4 font-semibold">Total</th>
              <th className="pb-3 pr-4 font-semibold">Status</th>
              <th className="pb-3 font-semibold">Time</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-t" style={{ borderColor: "var(--dash-color)" }}>
                <td className="py-3 pr-4"><span className="font-mono-text text-xs font-semibold" style={{ color: "var(--ink)" }}>{order.id}</span></td>
                <td className="py-3 pr-4"><span className="font-display text-xs font-medium" style={{ color: "var(--ink)" }}>{order.customer}</span></td>
                <td className="py-3 pr-4 hidden md:table-cell"><span className="font-mono-text text-[10px]" style={{ color: "var(--ink-soft)" }}>{order.items.join(" / ")}</span></td>
                <td className="py-3 pr-4"><span className="font-mono-text text-xs font-semibold" style={{ color: "var(--ink)" }}>₹{order.total}</span></td>
                <td className="py-3 pr-4"><StatusPill status={order.status} /></td>
                <td className="py-3"><span className="font-mono-text text-[10px]" style={{ color: "var(--ink-soft)" }}>{order.time}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AnalyticsSection() {
  return (
    <div className="block space-y-4">
      <h2 className="font-display text-xl font-bold" style={{ color: "var(--ink)" }}>Analytics & Insights</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartPlaceholder title="Weekly Revenue" bars={7} delay={0} />
        <ChartPlaceholder title="Orders by Hour" bars={7} delay={0.05} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <DonutChart title="Category Distribution" items={[
          { label: "Hot Coffee", value: 180 },
          { label: "Iced & Cold", value: 120 },
          { label: "Specialty", value: 65 },
        ]} delay={0.1} />
        <DonutChart title="Milk Preferences" items={[
          { label: "Whole", value: 140 },
          { label: "Oat", value: 95 },
          { label: "Almond", value: 70 },
          { label: "Skim", value: 45 },
        ]} delay={0.15} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="neumorphic rounded-[1.5rem] p-5 text-center">
          <p className="font-mono-text text-[10px] uppercase tracking-wider mb-1" style={{ color: "var(--ink-soft)" }}>Avg. Order Value</p>
          <p className="font-display text-2xl font-bold" style={{ color: "var(--ink)" }}>₹312</p>
          <p className="font-mono-text text-[10px] mt-1" style={{ color: "var(--ink-soft)" }}>+5% vs last month</p>
        </div>
        <div className="neumorphic rounded-[1.5rem] p-5 text-center">
          <p className="font-mono-text text-[10px] uppercase tracking-wider mb-1" style={{ color: "var(--ink-soft)" }}>Peak Hour</p>
          <p className="font-display text-2xl font-bold" style={{ color: "var(--ink)" }}>10–11AM</p>
          <p className="font-mono-text text-[10px] mt-1" style={{ color: "var(--ink-soft)" }}>~28 orders / hour</p>
        </div>
        <div className="neumorphic rounded-[1.5rem] p-5 text-center">
          <p className="font-mono-text text-[10px] uppercase tracking-wider mb-1" style={{ color: "var(--ink-soft)" }}>Top Day</p>
          <p className="font-display text-2xl font-bold" style={{ color: "var(--ink)" }}>Saturday</p>
          <p className="font-mono-text text-[10px] mt-1" style={{ color: "var(--ink-soft)" }}>22% of weekly sales</p>
        </div>
      </div>
    </div>
  );
}

function SettingsSection() {
  return (
    <div className="block space-y-4">
      <h2 className="font-display text-xl font-bold" style={{ color: "var(--ink)" }}>Settings</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="neumorphic rounded-[1.5rem] p-5">
          <h3 className="font-display font-bold text-sm mb-3" style={{ color: "var(--ink)" }}>Store Details</h3>
          <div className="space-y-3">
            <div>
              <label className="font-mono-text text-[10px] uppercase tracking-wider font-semibold block mb-1" style={{ color: "var(--ink-soft)" }}>Store Name</label>
              <input type="text" defaultValue="Caffeine"
                className="w-full px-4 py-2.5 rounded-full neumorphic-inset font-display text-sm"
                style={{ color: "var(--ink)", backgroundColor: "var(--bg-color)" }} />
            </div>
            <div>
              <label className="font-mono-text text-[10px] uppercase tracking-wider font-semibold block mb-1" style={{ color: "var(--ink-soft)" }}>Opening Hours</label>
              <input type="text" defaultValue="8:00 AM – 10:00 PM"
                className="w-full px-4 py-2.5 rounded-full neumorphic-inset font-display text-sm"
                style={{ color: "var(--ink)", backgroundColor: "var(--bg-color)" }} />
            </div>
            <button className="mt-2 px-5 py-2.5 rounded-full font-display font-bold text-xs transition-all active:scale-95"
              style={{ backgroundColor: "var(--ink)", color: "var(--bg-color)" }}>Save Changes</button>
          </div>
        </div>
        <div className="neumorphic rounded-[1.5rem] p-5">
          <h3 className="font-display font-bold text-sm mb-3" style={{ color: "var(--ink)" }}>Tax & Pricing</h3>
          <div className="space-y-3">
            <div>
              <label className="font-mono-text text-[10px] uppercase tracking-wider font-semibold block mb-1" style={{ color: "var(--ink-soft)" }}>Tax Rate (%)</label>
              <input type="number" defaultValue={5}
                className="w-full px-4 py-2.5 rounded-full neumorphic-inset font-display text-sm"
                style={{ color: "var(--ink)", backgroundColor: "var(--bg-color)" }} />
            </div>
            <div>
              <label className="font-mono-text text-[10px] uppercase tracking-wider font-semibold block mb-1" style={{ color: "var(--ink-soft)" }}>Currency</label>
              <input type="text" defaultValue="INR (₹)"
                className="w-full px-4 py-2.5 rounded-full neumorphic-inset font-display text-sm"
                style={{ color: "var(--ink)", backgroundColor: "var(--bg-color)" }} />
            </div>
            <button className="mt-2 px-5 py-2.5 rounded-full font-display font-bold text-xs transition-all active:scale-95"
              style={{ backgroundColor: "var(--ink)", color: "var(--bg-color)" }}>Save Changes</button>
          </div>
        </div>
      </div>
    </div>
  );
}
export default function AdminPage() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [user, setUser] = useState(() => getCurrentUser());
  const sectionRef = useRef(null);

  const adminName = user?.name || "Admin";
  const todayRevenue = "₹2,840";
  const activeOrders = MOCK_ORDERS.filter((o) => o.status !== "completed").length;
  const totalCustomers = 186;
  const lowStockCount = ALL_ITEMS.filter((item) => getStockLevel(item.name) < LOW_STOCK_THRESHOLD).length;

  const inventoryItems = useMemo(
    () => ALL_ITEMS.map((item) => ({
      ...item,
      stock: getStockLevel(item.name),
      low: getStockLevel(item.name) < LOW_STOCK_THRESHOLD,
    })),
    [],
  );

  const handleLogout = useCallback(() => {
    setUser(null);
    logoutUser();
    navigate("/login", { replace: true });
  }, [navigate]);

  const handleSectionChange = useCallback((sectionId) => {
    setActiveSection(
      ADMIN_SECTION_IDS.includes(sectionId) ? sectionId : "dashboard",
    );
  }, []);
  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(sectionRef.current, { opacity: 0, y: 8 }, {
        opacity: 1,
        y: 0,
        duration: 0.3,
        ease: "power2.out",
        clearProps: "transform,opacity",
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [activeSection]);
  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":
        return <DashboardSection
          todayRevenue={todayRevenue}
          activeOrders={activeOrders}
          lowStockCount={lowStockCount}
          totalCustomers={totalCustomers}
          onNavigate={handleSectionChange}
          orders={MOCK_ORDERS}
        />;
      case "inventory":
        return <InventorySection items={inventoryItems} lowStockCount={lowStockCount} />;
      case "orders":
        return <OrdersSection orders={MOCK_ORDERS} />;
      case "analytics":
        return <AnalyticsSection />;
      case "settings":
        return <SettingsSection />;
      default:
        return <DashboardSection
          todayRevenue={todayRevenue}
          activeOrders={activeOrders}
          lowStockCount={lowStockCount}
          totalCustomers={totalCustomers}
          onNavigate={handleSectionChange}
          orders={MOCK_ORDERS}
        />;
    }
  };

  return (
    <div
      className="min-h-screen flex p-4 gap-4 overflow-hidden"
      style={{
        backgroundColor: "var(--bg-color)",
        backgroundImage:
          "radial-gradient(circle at top right, var(--bg-gradient-start), var(--bg-gradient-end))",
        backgroundAttachment: "fixed",
      }}
    >
      {/* Sidebar */}
      <AdminSidebar
        active={activeSection}
        onNavigate={handleSectionChange}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((p) => !p)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col gap-4 min-w-0 min-h-[calc(100vh-2rem)]" style={{ display: "flex" }}>
        <AdminTopbar adminName={adminName} onLogout={handleLogout} />
        <main className="block flex-1 overflow-y-auto p-1" style={{ minHeight: "0", display: "block" }}>
          <div ref={sectionRef} className="block min-h-full">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}





