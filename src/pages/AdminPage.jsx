import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";
import { api } from "../api/client";
import { fmt, fetchAllMenuItems, createMenuItem, updateMenuItem, deleteMenuItem } from "../data/menu";
import { getCurrentUser, logoutUser, refreshCurrentUser, fetchAdminStats } from "../data/auth";
import { fetchSettings, saveSettings } from "../data/settings";
import AdminSidebar from "../components/admin/AdminSidebar";
import AdminBottomNav from "../components/admin/AdminBottomNav";
import AdminTopbar from "../components/admin/AdminTopbar";
import AdminSearchInput from "../components/admin/AdminSearchInput";
import AdminMetricCard from "../components/admin/AdminMetricCard";

const ADMIN_SECTION_IDS = ["dashboard", "menu", "orders", "analytics", "settings"];

const ACTIVE_STATUSES = ["pending", "preparing", "ready"];
const NEEDS_ATTENTION_STATUSES = ["pending", "preparing"];

const STATUS_CONFIG = {
  pending: { bg: "rgba(243,156,18,0.12)", color: "#f39c12", label: "Pending" },
  preparing: { bg: "rgba(52,152,219,0.12)", color: "#3498db", label: "Preparing" },
  ready: { bg: "rgba(155,89,182,0.12)", color: "#9b59b6", label: "Ready" },
  completed: { bg: "rgba(46,204,113,0.12)", color: "#2ecc71", label: "Completed" },
  cancelled: { bg: "rgba(231,76,60,0.12)", color: "#e74c3c", label: "Cancelled" },
};

const CATEGORY_LABELS = { hot: "Hot Coffee", iced: "Iced & Cold", specialty: "Specialty" };

function StatusPill({ status }) {
  const c = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  return (
    <span
      className="font-mono-text text-[9px] px-2.5 py-1 rounded-full font-semibold whitespace-nowrap"
      style={{ backgroundColor: c.bg, color: c.color }}
    >
      {c.label}
    </span>
  );
}

function ChartPlaceholder({ title, delay = 0, data }) {
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

  const hours = data?.labels || ["8AM", "10AM", "12PM", "2PM", "4PM", "6PM", "8PM"];
  const values = data?.values || hours.map((_, i) => 20 + Math.sin(i * 1.2 + 1) * 30 + Math.cos(i * 0.7) * 15);
  const max = Math.max(...values, 1);

  return (
    <div ref={chartRef} className="neumorphic rounded-[1.5rem] p-5 flex flex-col min-h-[188px]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-bold text-sm" style={{ color: "var(--ink)" }}>
          {title}
        </h3>
        <span className="font-mono-text text-[10px]" style={{ color: "var(--ink-soft)" }}>
          {data?.subtitle || "Last 7 days"}
        </span>
      </div>
      <div className="flex items-end justify-between gap-2 h-28 mb-2">
        {values.map((v, i) => (
          <div key={i} className="flex-1 h-full flex flex-col justify-end">
            <div
              className="w-full rounded-t-md transition-all duration-500"
              style={{
                height: `${Math.max(3, (v / max) * 100)}%`,
                backgroundColor: "var(--ink)",
                opacity: 0.5 + (i / values.length) * 0.4,
                borderRadius: "4px 4px 0 0",
              }}
            />
          </div>
        ))}
      </div>
      <div className="flex justify-between">
        {hours.slice(0, values.length).map((h, i) => (
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
              const pct = total > 0 ? item.value / total : 0;
              const circumference = 2 * Math.PI * 13;
              const dashArray = circumference * pct;
              const dashOffset = items
                .slice(0, i)
                .reduce((s, x) => s - circumference * (total > 0 ? x.value / total : 0), 0);
              return (
                <circle
                  key={item.label}
                  cx="18"
                  cy="18"
                  r="13"
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
                {total > 0 ? Math.round((item.value / total) * 100) : 0}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function DashboardSection({ metrics, orders, menuItems, visibleOrders, onNavigate }) {
  // Metric cards always reflect the FULL dataset; the recent-orders table
  // below shows `visibleOrders` (optionally narrowed by admin search).
  const shownOrders = visibleOrders || orders;
  const activeOrders = orders.filter((o) => ACTIVE_STATUSES.includes(o.status)).length;
  const hiddenItems = menuItems.filter((m) => m.available === false).length;

  return (
    <div className="block space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <AdminMetricCard title="Today's Revenue" value={fmt(metrics.todayRevenue)} trend="Live" subtitle="From placed orders" icon="₹" color="#3a1d0d" delay={0} />
        <AdminMetricCard title="Active Orders" value={activeOrders} trend={activeOrders > 0 ? `+${activeOrders}` : "0"} subtitle="Pending / preparing / ready" icon="#" color="#603318" delay={0.05} />
        <AdminMetricCard title="Hidden Items" value={`${hiddenItems} items`} trend={hiddenItems > 0 ? "↓ Hidden" : "✓ Live"} subtitle={hiddenItems > 0 ? "Not shown on menu" : "All items available"} icon="!" color={hiddenItems > 0 ? "#e74c3c" : "#2ecc71"} delay={0.1} />
        <AdminMetricCard title="Total Customers" value={metrics.totalCustomers} trend="All-time" subtitle="Registered accounts" icon="◎" color="#522912" delay={0.15} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartPlaceholder title="Revenue — Last 7 Days" delay={0.2} data={metrics.revenueWeek} />
        <DonutChart title="Popular Items" items={metrics.popularItems} delay={0.25} />
      </div>
      <div className="neumorphic rounded-[1.5rem] p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-bold text-sm" style={{ color: "var(--ink)" }}>Recent Orders</h3>
          <button
            onClick={() => onNavigate("orders")}
            className="font-mono-text text-[10px] underline underline-offset-2 hover:opacity-70 transition-opacity"
            style={{ color: "var(--ink-soft)" }}
          >
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
              {shownOrders.slice(0, 5).map((order) => (
                <tr key={order._id} className="border-t" style={{ borderColor: "var(--dash-color)" }}>
                  <td className="py-3 pr-4 font-mono-text text-xs font-semibold" style={{ color: "var(--ink)" }}>
                    #{order.ticketNo}
                  </td>
                  <td className="py-3 pr-4 font-display text-xs font-medium" style={{ color: "var(--ink)" }}>
                    {order.userName || "Guest"}
                  </td>
                  <td className="py-3 pr-4 hidden sm:table-cell font-mono-text text-[10px]" style={{ color: "var(--ink-soft)" }}>
                    {order.items.map((it) => it.name).join(", ")}
                  </td>
                  <td className="py-3 pr-4 font-mono-text text-xs font-semibold" style={{ color: "var(--ink)" }}>
                    {fmt(order.totalPrice)}
                  </td>
                  <td className="py-3"><StatusPill status={order.status} /></td>
                </tr>
              ))}
              {shownOrders.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center font-mono-text text-xs" style={{ color: "var(--ink-soft)" }}>
                    {orders.length > 0 ? "No matching orders" : "No orders yet"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function MenuEditorModal({ item, onClose, onSave }) {
  const [form, setForm] = useState({
    name: item?.name || "",
    price: item?.price ?? "",
    cat: item?.cat || "hot",
    img: item?.img || "",
    note: item?.note || "",
    dietary: item?.dietary || [],
    available: item?.available ?? true,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const modalRef = useRef(null);

  useEffect(() => {
    if (modalRef.current) {
      gsap.fromTo(modalRef.current, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.35, ease: "power3.out" });
    }
  }, []);

  const set = (key) => (e) => {
    const val = key === "available" ? e.target.checked : e.target.value;
    setForm((prev) => ({ ...prev, [key]: val }));
  };

  const toggleDietary = (d) => {
    setForm((prev) => ({
      ...prev,
      dietary: prev.dietary.includes(d) ? prev.dietary.filter((x) => x !== d) : [...prev.dietary, d],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.price || !form.img.trim()) {
      setError("Name, price and image URL are required");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await onSave({ ...form, price: Number(form.price) });
      onClose();
    } catch (err) {
      setError(err.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = {
    color: "var(--ink)",
    backgroundColor: "var(--bg-color)",
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center px-4" role="dialog" aria-modal="true" aria-label={item ? "Edit menu item" : "Add menu item"}>
      <div className="modal-overlay absolute inset-0" onClick={onClose} aria-hidden="true" />
      <div ref={modalRef} className="relative neumorphic rounded-[2rem] w-full max-w-md p-7 max-h-[85vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full neumorphic-sm flex items-center justify-center text-sm active:scale-90"
          aria-label="Close"
          style={{ color: "var(--ink)" }}
        >
          ✕
        </button>
        <h2 className="font-display text-2xl font-bold mb-5" style={{ color: "var(--ink)" }}>
          {item ? "Edit item" : "Add menu item"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="font-display font-semibold text-xs uppercase tracking-wider block mb-1.5" style={{ color: "var(--ink)" }}>
              Name
            </label>
            <input value={form.name} onChange={set("name")} className="w-full px-4 py-3 rounded-full neumorphic-inset font-display text-sm" style={inputStyle} placeholder="e.g. Flat White" required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-display font-semibold text-xs uppercase tracking-wider block mb-1.5" style={{ color: "var(--ink)" }}>
                Price (₹)
              </label>
              <input type="number" min="0" value={form.price} onChange={set("price")} className="w-full px-4 py-3 rounded-full neumorphic-inset font-display text-sm" style={inputStyle} required />
            </div>
            <div>
              <label className="font-display font-semibold text-xs uppercase tracking-wider block mb-1.5" style={{ color: "var(--ink)" }}>
                Category
              </label>
              <select value={form.cat} onChange={set("cat")} className="w-full px-4 py-3 rounded-full neumorphic-inset font-display text-sm" style={inputStyle}>
                <option value="hot">Hot Coffee</option>
                <option value="iced">Iced &amp; Cold</option>
                <option value="specialty">Specialty</option>
              </select>
            </div>
          </div>
          <div>
            <label className="font-display font-semibold text-xs uppercase tracking-wider block mb-1.5" style={{ color: "var(--ink)" }}>
              Image URL
            </label>
            <input value={form.img} onChange={set("img")} className="w-full px-4 py-3 rounded-full neumorphic-inset font-display text-sm" style={inputStyle} placeholder="https://…" required />
          </div>
          <div>
            <label className="font-display font-semibold text-xs uppercase tracking-wider block mb-1.5" style={{ color: "var(--ink)" }}>
              Note
            </label>
            <input value={form.note} onChange={set("note")} className="w-full px-4 py-3 rounded-full neumorphic-inset font-display text-sm" style={inputStyle} placeholder="Short description" />
          </div>
          <div>
            <span className="font-display font-semibold text-xs uppercase tracking-wider block mb-2" style={{ color: "var(--ink)" }}>
              Dietary tags
            </span>
            <div className="flex flex-wrap gap-2">
              {["vegan", "dairy-free", "gluten-free"].map((d) => (
                <button
                  type="button"
                  key={d}
                  onClick={() => toggleDietary(d)}
                  className={`px-3 py-1.5 rounded-full font-mono-text text-[10px] font-semibold transition-all active:scale-95 ${
                    form.dietary.includes(d) ? "shadow-[inset_3px_3px_6px_var(--shadow-dark),inset_-3px_-3px_6px_var(--shadow-light)]" : "neumorphic-sm"
                  }`}
                  style={{ color: form.dietary.includes(d) ? "var(--bg-color)" : "var(--ink-soft)", backgroundColor: form.dietary.includes(d) ? "var(--ink)" : "transparent" }}
                  aria-pressed={form.dietary.includes(d)}
                >
                  {d.replace("-", " ")}
                </button>
              ))}
            </div>
          </div>
          <label className="flex items-center gap-2 font-display text-sm" style={{ color: "var(--ink)" }}>
            <input type="checkbox" checked={form.available} onChange={set("available")} />
            Available on menu
          </label>
          {error && (
            <p className="font-mono-text text-xs" style={{ color: "#e74c3c" }} role="alert">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={saving}
            className="w-full py-3.5 rounded-full font-display font-bold text-sm transition-all active:scale-[0.97] disabled:opacity-50"
            style={{ backgroundColor: "var(--ink)", color: "var(--bg-color)" }}
          >
            {saving ? "Saving…" : item ? "Save changes" : "Add item"}
          </button>
        </form>
      </div>
    </div>
  );
}

function SkeletonRows({ rows = 4, cols = 5 }) {
  return (
    <div className="neumorphic rounded-[1.5rem] p-5 overflow-x-auto" aria-hidden="true">
      <table className="w-full text-left">
        <tbody>
          {Array.from({ length: rows }).map((_, r) => (
            <tr key={r} className="border-t" style={{ borderColor: "var(--dash-color)" }}>
              {Array.from({ length: cols }).map((_, c) => (
                <td key={c} className="py-4 pr-4">
                  <div className="h-3 rounded-full animate-pulse" style={{ backgroundColor: "var(--shadow-dark)", opacity: 0.4 }} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function MenuSection({ items, loading, query, onAdd, onEdit, onToggleAvailable, onDelete }) {
  return (
    <div className="block space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-bold" style={{ color: "var(--ink)" }}>
          Menu Management
        </h2>
        <button
          onClick={onAdd}
          className="btn-primary px-5 py-2.5 rounded-full font-display font-bold text-xs"
        >
          + Add item
        </button>
      </div>
      {loading ? (
        <SkeletonRows rows={4} cols={5} />
      ) : (
        <div className="neumorphic rounded-[1.5rem] p-5 overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="font-mono-text text-[10px] uppercase tracking-wider" style={{ color: "var(--ink-soft)" }}>
                <th className="pb-3 pr-4 font-semibold">Item</th>
                <th className="pb-3 pr-4 font-semibold">Category</th>
                <th className="pb-3 pr-4 font-semibold">Price</th>
                <th className="pb-3 pr-4 font-semibold">Status</th>
                <th className="pb-3 font-semibold">Actions</th>
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
                    <span className="font-mono-text text-[10px] px-2 py-0.5 rounded-full capitalize" style={{ backgroundColor: "var(--shadow-dark)", color: "var(--ink-soft)" }}>
                      {CATEGORY_LABELS[item.cat] || item.cat}
                    </span>
                  </td>
                  <td className="py-3 pr-4 font-mono-text text-xs font-semibold" style={{ color: "var(--ink)" }}>
                    {fmt(item.price)}
                  </td>
                  <td className="py-3 pr-4">
                    {item.available === false ? (
                      <span className="font-mono-text text-[9px] px-2 py-0.5 rounded-full font-semibold" style={{ backgroundColor: "rgba(231,76,60,0.12)", color: "#e74c3c" }}>
                        ⚠ Hidden
                      </span>
                    ) : (
                      <span className="font-mono-text text-[9px] px-2 py-0.5 rounded-full font-semibold" style={{ backgroundColor: "rgba(46,204,113,0.12)", color: "#2ecc71" }}>
                        ✓ Available
                      </span>
                    )}
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => onToggleAvailable(item)} className="neumorphic-sm px-3 py-1.5 rounded-full font-mono-text text-[9px] font-semibold active:scale-90 transition-all" style={{ color: "var(--ink)" }}>
                        {item.available === false ? "Show" : "Hide"}
                      </button>
                      <button onClick={() => onEdit(item)} className="neumorphic-sm px-3 py-1.5 rounded-full font-mono-text text-[9px] font-semibold active:scale-90 transition-all" style={{ color: "var(--ink)" }}>
                        Edit
                      </button>
                      <button onClick={() => onDelete(item)} className="neumorphic-sm px-3 py-1.5 rounded-full font-mono-text text-[9px] font-semibold active:scale-90 transition-all" style={{ color: "#e74c3c" }}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center font-mono-text text-xs" style={{ color: "var(--ink-soft)" }}>
                    {query ? `No matching menu items for "${query}"` : "Menu is empty — add your first item"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function OrdersSection({ orders, loading, query, onStatusChange }) {
  const [busyId, setBusyId] = useState(null);

  const handleChange = async (orderId, status) => {
    setBusyId(orderId);
    try {
      await onStatusChange(orderId, status);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="block space-y-4">
      <h2 className="font-display text-xl font-bold" style={{ color: "var(--ink)" }}>
        Order Management
      </h2>
      {loading ? (
        <SkeletonRows rows={5} cols={6} />
      ) : (
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
                <tr key={order._id} className="border-t" style={{ borderColor: "var(--dash-color)" }}>
                  <td className="py-3 pr-4">
                    <span className="font-mono-text text-xs font-semibold" style={{ color: "var(--ink)" }}>#{order.ticketNo}</span>
                  </td>
                  <td className="py-3 pr-4">
                    <span className="font-display text-xs font-medium" style={{ color: "var(--ink)" }}>{order.userName || "Guest"}</span>
                  </td>
                  <td className="py-3 pr-4 hidden md:table-cell">
                    <span className="font-mono-text text-[10px]" style={{ color: "var(--ink-soft)" }}>
                      {order.items.map((it) => `${it.qty}× ${it.name}`).join(" / ")}
                    </span>
                  </td>
                  <td className="py-3 pr-4">
                    <span className="font-mono-text text-xs font-semibold" style={{ color: "var(--ink)" }}>{fmt(order.totalPrice)}</span>
                  </td>
                  <td className="py-3 pr-4">
                    <select
                      value={order.status}
                      disabled={busyId === order._id}
                      onChange={(e) => handleChange(order._id, e.target.value)}
                      className="px-2 py-1.5 rounded-full font-mono-text text-[10px] font-semibold outline-none disabled:opacity-50"
                      style={{ color: (STATUS_CONFIG[order.status] || {}).color || "var(--ink)", backgroundColor: "var(--bg-color)", border: "1px solid var(--shadow-dark)" }}
                      aria-label={`Update status for order ${order.ticketNo}`}
                    >
                      {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                        <option key={key} value={key}>{cfg.label}</option>
                      ))}
                    </select>
                  </td>
                  <td className="py-3">
                    <span className="font-mono-text text-[10px]" style={{ color: "var(--ink-soft)" }}>
                      {new Date(order.createdAt).toLocaleString([], { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center font-mono-text text-xs" style={{ color: "var(--ink-soft)" }}>
                    {query ? `No matching orders for "${query}"` : "No orders yet"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function AnalyticsSection({ metrics }) {
  return (
    <div className="block space-y-4">
      <h2 className="font-display text-xl font-bold" style={{ color: "var(--ink)" }}>
        Analytics &amp; Insights
      </h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartPlaceholder title="Weekly Revenue" delay={0} data={metrics.revenueWeek} />
        <ChartPlaceholder title="Orders by Hour" delay={0.05} data={metrics.ordersByHour} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <DonutChart title="Category Distribution" items={metrics.categoryDist} delay={0.1} />
        <DonutChart title="Milk Preferences" items={metrics.milkDist} delay={0.15} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="neumorphic rounded-[1.5rem] p-5 text-center">
          <p className="font-mono-text text-[10px] uppercase tracking-wider mb-1" style={{ color: "var(--ink-soft)" }}>Avg. Order Value</p>
          <p className="font-display text-2xl font-bold" style={{ color: "var(--ink)" }}>{metrics.avgOrderValue}</p>
          <p className="font-mono-text text-[10px] mt-1" style={{ color: "var(--ink-soft)" }}>{metrics.totalOrders} orders total</p>
        </div>
        <div className="neumorphic rounded-[1.5rem] p-5 text-center">
          <p className="font-mono-text text-[10px] uppercase tracking-wider mb-1" style={{ color: "var(--ink-soft)" }}>Peak Hour</p>
          <p className="font-display text-2xl font-bold" style={{ color: "var(--ink)" }}>{metrics.peakHour}</p>
          <p className="font-mono-text text-[10px] mt-1" style={{ color: "var(--ink-soft)" }}>Most orders placed</p>
        </div>
        <div className="neumorphic rounded-[1.5rem] p-5 text-center">
          <p className="font-mono-text text-[10px] uppercase tracking-wider mb-1" style={{ color: "var(--ink-soft)" }}>Completion Rate</p>
          <p className="font-display text-2xl font-bold" style={{ color: "var(--ink)" }}>{metrics.completionRate}</p>
          <p className="font-mono-text text-[10px] mt-1" style={{ color: "var(--ink-soft)" }}>Non-cancelled orders</p>
        </div>
      </div>
    </div>
  );
}

function SettingsSection({ settings, onSave, onRefresh }) {
  // Lazy-init from settings so the form never gets stuck on "Loading…"
  const [form, setForm] = useState(() => (settings ? { ...settings } : null));
  const [prevSettings, setPrevSettings] = useState(settings);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  // Sync editable draft when fresh settings arrive (adjust-state-during-render pattern)
  if (settings !== prevSettings) {
    setPrevSettings(settings);
    setForm(settings ? { ...settings } : null);
  }

  const set = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const save = async (updates) => {
    if (!form) return;
    setSaving(true);
    setMessage("");
    try {
      await onSave(updates);
      setMessage("Settings saved");
      onRefresh().catch(() => {});
    } catch (err) {
      setMessage(err.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  // Each card's Save button only persists its own fields
  const saveStore = () => save({ storeName: form.storeName, openingHours: form.openingHours });
  const savePricing = () => save({ taxRate: Number(form.taxRate), currency: form.currency });

  const inputStyle = { color: "var(--ink)", backgroundColor: "var(--bg-color)" };

  if (!form) {
    return <p className="py-10 text-center font-mono-text text-xs" style={{ color: "var(--ink-soft)" }}>Loading settings…</p>;
  }

  return (
    <div className="block space-y-4">
      <h2 className="font-display text-xl font-bold" style={{ color: "var(--ink)" }}>Settings</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="neumorphic rounded-[1.5rem] p-5">
          <h3 className="font-display font-bold text-sm mb-3" style={{ color: "var(--ink)" }}>Store Details</h3>
          <div className="space-y-3">
            <div>
              <label className="font-mono-text text-[10px] uppercase tracking-wider font-semibold block mb-1" style={{ color: "var(--ink-soft)" }}>Store Name</label>
              <input value={form.storeName} onChange={set("storeName")} className="w-full px-4 py-2.5 rounded-full neumorphic-inset font-display text-sm" style={inputStyle} />
            </div>
            <div>
              <label className="font-mono-text text-[10px] uppercase tracking-wider font-semibold block mb-1" style={{ color: "var(--ink-soft)" }}>Opening Hours</label>
              <input value={form.openingHours} onChange={set("openingHours")} className="w-full px-4 py-2.5 rounded-full neumorphic-inset font-display text-sm" style={inputStyle} />
            </div>
            <button onClick={saveStore} disabled={saving} className="mt-2 px-5 py-2.5 rounded-full font-display font-bold text-xs transition-all active:scale-95 disabled:opacity-50" style={{ backgroundColor: "var(--ink)", color: "var(--bg-color)" }}>
              {saving ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </div>
        <div className="neumorphic rounded-[1.5rem] p-5">
          <h3 className="font-display font-bold text-sm mb-3" style={{ color: "var(--ink)" }}>Tax &amp; Pricing</h3>
          <div className="space-y-3">
            <div>
              <label className="font-mono-text text-[10px] uppercase tracking-wider font-semibold block mb-1" style={{ color: "var(--ink-soft)" }}>Tax Rate (%)</label>
              <input type="number" min="0" max="100" value={form.taxRate} onChange={set("taxRate")} className="w-full px-4 py-2.5 rounded-full neumorphic-inset font-display text-sm" style={inputStyle} />
            </div>
            <div>
              <label className="font-mono-text text-[10px] uppercase tracking-wider font-semibold block mb-1" style={{ color: "var(--ink-soft)" }}>Currency</label>
              <input value={form.currency} onChange={set("currency")} className="w-full px-4 py-2.5 rounded-full neumorphic-inset font-display text-sm" style={inputStyle} />
            </div>
            <button onClick={savePricing} disabled={saving} className="mt-2 px-5 py-2.5 rounded-full font-display font-bold text-xs transition-all active:scale-95 disabled:opacity-50" style={{ backgroundColor: "var(--ink)", color: "var(--bg-color)" }}>
              {saving ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
      {message && (
        <p className="font-mono-text text-xs" style={{ color: message === "Settings saved" ? "#2ecc71" : "#e74c3c" }} role="status">
          {message}
        </p>
      )}
    </div>
  );
}

export default function AdminPage() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [adminQuery, setAdminQuery] = useState("");
  const [user, setUser] = useState(() => getCurrentUser());
  const sectionRef = useRef(null);

  // Live data
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [menuItems, setMenuItems] = useState([]);
  const [menuLoading, setMenuLoading] = useState(true);
  const [settings, setSettings] = useState(null);
  const [adminStats, setAdminStats] = useState({ totalUsers: 0, admins: 0 });
  const [toast, setToast] = useState("");
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const showToast = useCallback((msg) => {
    setToast(msg);
    window.setTimeout(() => setToast(""), 3000);
  }, []);

  useEffect(() => {
    let cancelled = false;

    refreshCurrentUser().then((fresh) => {
      if (cancelled) return;
      if (fresh) {
        setUser(fresh);
      } else if (!getCurrentUser()) {
        navigate("/login", { replace: true });
      }
    });

    (async () => {
      const [ord, menu, st, stats] = await Promise.allSettled([
        api.get("/api/orders?limit=100"),
        fetchAllMenuItems(),
        fetchSettings(),
        fetchAdminStats(),
      ]);
      if (cancelled) return;
      if (ord.status === "fulfilled") setOrders(ord.value.orders || []);
      if (menu.status === "fulfilled") setMenuItems(menu.value);
      if (st.status === "fulfilled") setSettings(st.value);
      if (stats.status === "fulfilled") setAdminStats(stats.value);
      setOrdersLoading(false);
      setMenuLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  // Compute live metrics from fetched orders
  const metrics = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayOrders = orders.filter((o) => o.status !== "cancelled" && new Date(o.createdAt) >= today);
    const todayRevenue = todayOrders.reduce((s, o) => s + (o.totalPrice || 0), 0);

    // Revenue per day for last 7 days
    const days = [];
    const revenueWeek = { labels: [], values: [] };
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - i);
      const next = new Date(d);
      next.setDate(next.getDate() + 1);
      const sum = orders
        .filter((o) => o.status !== "cancelled" && new Date(o.createdAt) >= d && new Date(o.createdAt) < next)
        .reduce((s, o) => s + (o.totalPrice || 0), 0);
      days.push(d);
      revenueWeek.labels.push(d.toLocaleDateString([], { weekday: "short" }).slice(0, 2));
      revenueWeek.values.push(sum);
    }
    revenueWeek.subtitle = `${days[0].toLocaleDateString([], { month: "short", day: "numeric" })} – ${days[6].toLocaleDateString([], { month: "short", day: "numeric" })}`;

    // Orders by hour (7 two-hour buckets from 8AM to 10PM)
    const hourCounts = Array(7).fill(0);
    const ordersByHour = { labels: ["8AM", "10AM", "12PM", "2PM", "4PM", "6PM", "8PM"], values: hourCounts, subtitle: "Order volume" };
    orders.forEach((o) => {
      const h = new Date(o.createdAt).getHours();
      if (h < 8 || h >= 22) return; // outside operating hours
      hourCounts[Math.floor((h - 8) / 2)] += 1;
    });

    // Popular items
    const itemCount = {};
    orders.forEach((o) => o.items.forEach((it) => { itemCount[it.name] = (itemCount[it.name] || 0) + it.qty; }));
    const popularItems = Object.entries(itemCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([label, value]) => ({ label, value }));

    // Category distribution (by item name → menu cat)
    const catCount = { hot: 0, iced: 0, specialty: 0 };
    const catByName = {};
    menuItems.forEach((m) => { catByName[m.name] = m.cat; });
    orders.forEach((o) => o.items.forEach((it) => {
      const c = catByName[it.name] || it.cat;
      if (c && catCount[c] !== undefined) catCount[c] += it.qty;
    }));
    const categoryDist = Object.entries(catCount)
      .filter(([, v]) => v > 0)
      .map(([label, value]) => ({ label: CATEGORY_LABELS[label] || label, value }));

    // Milk preferences
    const milkCount = {};
    orders.forEach((o) => o.items.forEach((it) => { milkCount[it.milk || "Whole"] = (milkCount[it.milk || "Whole"] || 0) + 1; }));
    const milkDist = Object.entries(milkCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([label, value]) => ({ label, value }));

    const totalOrders = orders.length;
    const totalRevenue = orders.filter((o) => o.status !== "cancelled").reduce((s, o) => s + (o.totalPrice || 0), 0);
    const avgOrderValue = totalOrders > 0 ? fmt(Math.round(totalRevenue / totalOrders)) : fmt(0);

    let peakHour = "—";
    if (orders.length > 0) {
      const hourMap = {};
      orders.forEach((o) => {
        const h = new Date(o.createdAt).getHours();
        hourMap[h] = (hourMap[h] || 0) + 1;
      });
      const peak = Object.entries(hourMap).sort((a, b) => b[1] - a[1])[0];
      if (peak) peakHour = `${peak[0] % 12 === 0 ? 12 : peak[0] % 12}${peak[0] < 12 ? "AM" : "PM"}`;
    }

    const nonCancelled = orders.filter((o) => o.status !== "cancelled").length;
    const completionRate = totalOrders > 0 ? `${Math.round((nonCancelled / totalOrders) * 100)}%` : "—";

    return { todayRevenue, revenueWeek, ordersByHour, popularItems, categoryDist, milkDist, avgOrderValue, peakHour, completionRate, totalOrders, totalCustomers: adminStats.totalUsers };
  }, [orders, menuItems, adminStats]);

  const adminName = user?.name || "Admin";

  // Live search across orders + menu (item 7)
  const filteredOrders = useMemo(() => {
    const q = adminQuery.trim().toLowerCase();
    if (!q) return orders;
    return orders.filter((o) => {
      const haystack = [
        String(o.ticketNo || ""),
        o.userName || "",
        ...(o.items || []).map((it) => it.name || ""),
      ].join(" ").toLowerCase();
      return haystack.includes(q);
    });
  }, [orders, adminQuery]);

  const filteredMenuItems = useMemo(() => {
    const q = adminQuery.trim().toLowerCase();
    if (!q) return menuItems;
    return menuItems.filter((m) => (m.name || "").toLowerCase().includes(q));
  }, [menuItems, adminQuery]);

  const pendingCount = useMemo(
    () => orders.filter((o) => NEEDS_ATTENTION_STATUSES.includes(o.status)).length,
    [orders],
  );

  const handleLogout = useCallback(() => {
    setUser(null);
    logoutUser();
    navigate("/login", { replace: true });
  }, [navigate]);

  const handleSectionChange = useCallback((sectionId) => {
    setActiveSection(ADMIN_SECTION_IDS.includes(sectionId) ? sectionId : "dashboard");
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

  // Order status update
  const updateOrderStatus = useCallback(async (orderId, status) => {
    const updated = await api.put(`/api/orders/${orderId}/status`, { status });
    setOrders((prev) => prev.map((o) => (o._id === updated._id ? updated : o)));
    showToast(`Order #${updated.ticketNo} → ${(STATUS_CONFIG[updated.status] || {}).label || updated.status}`);
  }, [showToast]);

  // Menu CRUD handlers
  const openAdd = useCallback(() => {
    setEditingItem(null);
    setEditorOpen(true);
  }, []);

  const openEdit = useCallback((item) => {
    setEditingItem(item);
    setEditorOpen(true);
  }, []);

  const handleSaveItem = useCallback(async (data) => {
    if (editingItem) {
      const updated = await updateMenuItem(editingItem.id, data);
      setMenuItems((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
      showToast("Menu item updated");
    } else {
      const created = await createMenuItem(data);
      setMenuItems((prev) => [created, ...prev]);
      showToast("Menu item added");
    }
  }, [editingItem, showToast]);

  const toggleAvailable = useCallback(async (item) => {
    const updated = await updateMenuItem(item.id, { available: !(item.available === false) });
    setMenuItems((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
    showToast(updated.available === false ? `${item.name} hidden from menu` : `${item.name} shown on menu`);
  }, [showToast]);

  const handleDeleteItem = useCallback(async (item) => {
    if (!window.confirm(`Delete "${item.name}" from the menu?`)) return;
    try {
      await deleteMenuItem(item.id);
      setMenuItems((prev) => prev.filter((m) => m.id !== item.id));
      showToast("Menu item deleted");
    } catch (err) {
      showToast(err.message || "Delete failed");
    }
  }, [showToast]);

  const handleSaveSettings = useCallback(async (updates) => {
    const saved = await saveSettings(updates);
    setSettings(saved);
  }, []);

  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":
        return <DashboardSection metrics={metrics} orders={orders} menuItems={menuItems} visibleOrders={filteredOrders} onNavigate={handleSectionChange} />;
      case "menu":
        return (
          <MenuSection
            items={filteredMenuItems}
            loading={menuLoading}
            query={adminQuery.trim()}
            onAdd={openAdd}
            onEdit={openEdit}
            onToggleAvailable={toggleAvailable}
            onDelete={handleDeleteItem}
          />
        );
      case "orders":
        return <OrdersSection orders={filteredOrders} loading={ordersLoading} query={adminQuery.trim()} onStatusChange={updateOrderStatus} />;
      case "analytics":
        return <AnalyticsSection metrics={metrics} />;
      case "settings":
        return <SettingsSection settings={settings} onSave={handleSaveSettings} onRefresh={() => fetchSettings().then(setSettings)} />;
      default:
        return <DashboardSection metrics={metrics} orders={orders} menuItems={menuItems} onNavigate={handleSectionChange} />;
    }
  };

  return (
    <div
      className="min-h-screen flex p-4 pb-24 lg:pb-4 gap-4 overflow-hidden"
      style={{
        backgroundColor: "var(--bg-color)",
        backgroundImage:
          "radial-gradient(circle at top right, var(--bg-gradient-start), var(--bg-gradient-end))",
        backgroundAttachment: "fixed",
      }}
    >
      <AdminSidebar
        active={activeSection}
        onNavigate={handleSectionChange}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((p) => !p)}
      />

      <div className="flex-1 flex flex-col gap-4 min-w-0 min-h-[calc(100vh-2rem)]" style={{ display: "flex" }}>
        <AdminTopbar
          adminName={adminName}
          onLogout={handleLogout}
          searchQuery={adminQuery}
          onSearchChange={setAdminQuery}
          pendingCount={pendingCount}
          onGoToOrders={() => handleSectionChange("orders")}
        />

        {/* Mobile-only search (topbar search is hidden below sm) */}
        <div className="sm:hidden px-1">
          <AdminSearchInput value={adminQuery} onChange={setAdminQuery} />
        </div>
        <main className="block flex-1 overflow-y-auto p-1" style={{ minHeight: "0", display: "block" }}>
          <div ref={sectionRef} className="block min-h-full">
            {renderContent()}
          </div>
        </main>
      </div>

      {editorOpen && (
        <MenuEditorModal
          item={editingItem}
          onClose={() => setEditorOpen(false)}
          onSave={handleSaveItem}
        />
      )}

      <AdminBottomNav active={activeSection} onNavigate={handleSectionChange} />

      {toast && (
        <div
          className="fixed bottom-24 lg:bottom-6 left-1/2 -translate-x-1/2 z-[100] bg-[#3a1d0d] text-[#f1c7a9] px-5 py-3 rounded-full font-display font-semibold shadow-lg whitespace-nowrap"
          role="status"
          aria-live="polite"
        >
          {toast}
        </div>
      )}
    </div>
  );
}
