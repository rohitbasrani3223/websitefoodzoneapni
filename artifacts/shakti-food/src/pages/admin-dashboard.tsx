import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import {
  ShoppingBag, TrendingUp, Clock, CheckCircle2, Utensils,
  LogOut, Plus, Edit2, Trash2, ToggleLeft, ToggleRight,
  BarChart3, ChevronDown, X, Save, Bike, MapPin
} from "lucide-react";
import {
  useGetDashboardStats,
  useListOrders,
  useUpdateOrderStatus,
  useListMenuItems,
  useToggleMenuItemAvailability,
  useDeleteMenuItem,
  useCreateMenuItem,
  useUpdateMenuItem,
  getListOrdersQueryKey,
  getGetDashboardStatsQueryKey,
  getListMenuItemsQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

const ORDER_STATUSES = ["received", "preparing", "ready", "out-for-delivery", "completed", "cancelled"] as const;
type OrderStatus = typeof ORDER_STATUSES[number];

const STATUS_COLORS: Record<OrderStatus, string> = {
  received: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  preparing: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  ready: "bg-green-500/15 text-green-400 border-green-500/30",
  "out-for-delivery": "bg-primary/15 text-primary border-primary/30",
  completed: "bg-muted text-muted-foreground border-border",
  cancelled: "bg-destructive/15 text-destructive border-destructive/30",
};

type Tab = "dashboard" | "orders" | "menu";

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const [tab, setTab] = useState<Tab>("dashboard");
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>("");
  const [showAddItem, setShowAddItem] = useState(false);
  const [editItem, setEditItem] = useState<number | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    const token = localStorage.getItem("shakti-admin-token");
    if (!token) setLocation("/admin");
  }, [setLocation]);

  const { data: stats } = useGetDashboardStats();
  const { data: orders = [] } = useListOrders(
    orderStatusFilter ? { status: orderStatusFilter } : undefined,
    { query: { queryKey: getListOrdersQueryKey(orderStatusFilter ? { status: orderStatusFilter } : undefined) } }
  );
  const { data: menuItems = [] } = useListMenuItems();
  const updateStatus = useUpdateOrderStatus();
  const toggleAvail = useToggleMenuItemAvailability();
  const deleteItem = useDeleteMenuItem();
  const createItem = useCreateMenuItem();
  const updateItem = useUpdateMenuItem();

  const handleLogout = () => {
    localStorage.removeItem("shakti-admin-token");
    setLocation("/admin");
  };

  const handleStatusChange = (orderId: number, status: OrderStatus) => {
    updateStatus.mutate(
      { id: orderId, data: { status } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListOrdersQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetDashboardStatsQueryKey() });
        },
      }
    );
  };

  const handleToggleAvailability = (id: number, current: boolean) => {
    toggleAvail.mutate(
      { id, data: { available: !current } },
      {
        onSuccess: () => queryClient.invalidateQueries({ queryKey: getListMenuItemsQueryKey() }),
      }
    );
  };

  const handleDeleteItem = (id: number, name: string) => {
    if (!confirm(`Delete "${name}"?`)) return;
    deleteItem.mutate(
      { id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListMenuItemsQueryKey() });
          toast({ title: "Item deleted" });
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border px-4 py-3 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="font-black text-foreground text-lg">Shakti Admin</h1>
            <p className="text-muted-foreground text-xs">Fast Food Management</p>
          </div>
          <button
            onClick={handleLogout}
            data-testid="button-logout"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-card border-b border-border px-4">
        <div className="max-w-6xl mx-auto flex gap-1">
          {([["dashboard", "Dashboard"], ["orders", "Orders"], ["menu", "Menu"]] as [Tab, string][]).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              data-testid={`tab-${key}`}
              className={`px-4 py-3 text-sm font-semibold border-b-2 transition-all ${tab === key ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* DASHBOARD TAB */}
        {tab === "dashboard" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { label: "Orders Today", value: stats?.totalOrdersToday ?? 0, icon: ShoppingBag, color: "text-blue-400" },
                { label: "Revenue Today", value: `₹${stats?.revenueToday ?? 0}`, icon: TrendingUp, color: "text-primary" },
                { label: "Pending", value: stats?.pendingOrders ?? 0, icon: Clock, color: "text-amber-400" },
                { label: "Completed", value: stats?.completedOrders ?? 0, icon: CheckCircle2, color: "text-green-400" },
                { label: "Menu Items", value: stats?.totalMenuItems ?? 0, icon: Utensils, color: "text-purple-400" },
                { label: "Popular Item", value: stats?.popularItem ?? "—", icon: BarChart3, color: "text-accent" },
              ].map(({ label, value, icon: Icon, color }) => (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  data-testid={`stat-${label.toLowerCase().replace(/\s+/g, "-")}`}
                  className="bg-card border border-border rounded-2xl p-5"
                >
                  <Icon className={`w-5 h-5 ${color} mb-3`} />
                  <p className="text-foreground font-black text-2xl truncate">{value}</p>
                  <p className="text-muted-foreground text-xs mt-0.5">{label}</p>
                </motion.div>
              ))}
            </div>

            {stats?.weeklyRevenue && stats.weeklyRevenue.length > 0 && (
              <div className="bg-card border border-border rounded-2xl p-6">
                <h3 className="font-bold text-foreground mb-4">Weekly Revenue</h3>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={stats.weeklyRevenue} barSize={28}>
                    <XAxis dataKey="day" tick={{ fill: "hsl(30 15% 65%)", fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis hide />
                    <Tooltip
                      contentStyle={{ background: "hsl(24 8% 10%)", border: "1px solid hsl(24 15% 15%)", borderRadius: 12, color: "hsl(30 20% 95%)" }}
                      formatter={(v: number) => [`₹${v}`, "Revenue"]}
                    />
                    <Bar dataKey="revenue" radius={[6, 6, 0, 0]}>
                      {(stats.weeklyRevenue ?? []).map((_, idx) => (
                        <Cell key={idx} fill={idx === (stats.weeklyRevenue?.length ?? 0) - 1 ? "hsl(24 95% 55%)" : "hsl(24 15% 22%)"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}

        {/* ORDERS TAB */}
        {tab === "orders" && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-muted-foreground text-sm">Filter:</span>
              {["", ...ORDER_STATUSES].map((s) => (
                <button
                  key={s || "all"}
                  onClick={() => setOrderStatusFilter(s)}
                  data-testid={`filter-${s || "all"}`}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-full border transition-all capitalize ${
                    orderStatusFilter === s ? "bg-primary border-primary text-primary-foreground" : "bg-card border-border text-muted-foreground hover:border-primary/40"
                  }`}
                >
                  {s || "All"}
                </button>
              ))}
            </div>

            {orders.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <ShoppingBag className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No orders found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {orders.map((order) => {
                  const isDelivery = order.orderType === "delivery";
                  const validNextStatuses = ORDER_STATUSES.filter((s) => {
                    if (s === order.status || s === "received") return false;
                    if (s === "out-for-delivery" && !isDelivery) return false;
                    if (s === "ready" && isDelivery) return false;
                    return true;
                  });
                  return (
                    <div key={order.id} data-testid={`order-card-${order.id}`} className={`bg-card border rounded-2xl p-5 ${isDelivery ? "border-primary/30" : "border-border"}`}>
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-0.5">
                            <p className="font-bold text-foreground">#{order.id} — {order.customerName}</p>
                            {isDelivery && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-primary/15 text-primary px-2 py-0.5 rounded-full">
                                <Bike className="w-3 h-3" /> Delivery
                              </span>
                            )}
                          </div>
                          <p className="text-muted-foreground text-xs">{order.phone} &middot; {isDelivery ? "Delivery" : order.orderType}</p>
                          <p className="text-muted-foreground text-xs">{new Date(order.createdAt).toLocaleString()}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-primary font-black">₹{order.total}</p>
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${STATUS_COLORS[order.status as OrderStatus] ?? ""}`}>
                            {order.status === "out-for-delivery" ? "Out for Delivery" : order.status}
                          </span>
                        </div>
                      </div>

                      {/* Delivery address */}
                      {isDelivery && order.deliveryAddress && (
                        <div className="mb-3 px-3 py-2 bg-primary/5 border border-primary/15 rounded-xl text-xs space-y-0.5">
                          <div className="flex items-center gap-1.5 text-primary font-semibold">
                            <MapPin className="w-3 h-3" /> Delivery Address
                          </div>
                          {order.deliveryArea && <p className="text-muted-foreground pl-4">{order.deliveryArea}</p>}
                          <p className="text-foreground pl-4">{order.deliveryAddress}</p>
                          {order.deliveryLandmark && <p className="text-muted-foreground pl-4">Near: {order.deliveryLandmark}</p>}
                        </div>
                      )}

                      <div className="text-xs text-muted-foreground mb-3">
                        {(order.items as Array<{ name: string; quantity: number }>).map((i, idx) => (
                          <span key={idx}>{i.name} ×{i.quantity}{idx < order.items.length - 1 ? ", " : ""}</span>
                        ))}
                      </div>

                      {order.status !== "completed" && order.status !== "cancelled" && (
                        <div className="flex gap-2 flex-wrap">
                          {validNextStatuses.map((s) => (
                            <button
                              key={s}
                              onClick={() => handleStatusChange(order.id, s)}
                              data-testid={`button-status-${order.id}-${s}`}
                              className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-colors border ${
                                s === "out-for-delivery"
                                  ? "bg-primary/10 border-primary/30 text-primary hover:bg-primary/20"
                                  : "bg-muted hover:bg-muted/80 text-foreground border-border"
                              }`}
                            >
                              {s === "out-for-delivery" ? "Mark Out for Delivery" : `Mark ${s}`}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* MENU TAB */}
        {tab === "menu" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="font-bold text-foreground text-lg">{menuItems.length} Items</h2>
              <button
                onClick={() => setShowAddItem(true)}
                data-testid="button-add-menu-item"
                className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-bold hover:bg-primary/90 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Item
              </button>
            </div>

            <div className="space-y-2">
              {menuItems.map((item) => (
                <div key={item.id} data-testid={`menu-item-${item.id}`} className="bg-card border border-border rounded-xl px-4 py-3 flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full flex-shrink-0 ${item.isVeg ? "bg-green-500" : "bg-red-500"}`} />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground text-sm truncate">{item.name}</p>
                    <p className="text-muted-foreground text-xs">{item.category} &middot; ₹{item.price}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleAvailability(item.id, item.available)}
                      data-testid={`button-toggle-${item.id}`}
                      className={`transition-colors ${item.available ? "text-green-400" : "text-muted-foreground"}`}
                    >
                      {item.available ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                    </button>
                    <button
                      onClick={() => setEditItem(item.id)}
                      data-testid={`button-edit-${item.id}`}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteItem(item.id, item.name)}
                      data-testid={`button-delete-${item.id}`}
                      className="text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Add Item Modal */}
      {showAddItem && (
        <AddEditItemModal
          onClose={() => setShowAddItem(false)}
          onSave={(data) => {
            createItem.mutate(
              { data },
              {
                onSuccess: () => {
                  queryClient.invalidateQueries({ queryKey: getListMenuItemsQueryKey() });
                  setShowAddItem(false);
                  toast({ title: "Item added" });
                },
              }
            );
          }}
        />
      )}

      {/* Edit Item Modal */}
      {editItem !== null && (
        <AddEditItemModal
          item={menuItems.find((i) => i.id === editItem) as { id: number; name: string; description?: string | null; price: number; halfPrice?: number | null; category: string; isVeg: boolean; isFeatured: boolean; available: boolean } | undefined}
          onClose={() => setEditItem(null)}
          onSave={(data) => {
            updateItem.mutate(
              { id: editItem, data },
              {
                onSuccess: () => {
                  queryClient.invalidateQueries({ queryKey: getListMenuItemsQueryKey() });
                  setEditItem(null);
                  toast({ title: "Item updated" });
                },
              }
            );
          }}
        />
      )}
    </div>
  );
}

interface ItemForm {
  name: string;
  description: string;
  price: string;
  halfPrice: string;
  category: string;
  isVeg: boolean;
  isFeatured: boolean;
  available: boolean;
}

function AddEditItemModal({
  item,
  onClose,
  onSave,
}: {
  item?: { id: number; name: string; description?: string | null; price: number; halfPrice?: number | null; category: string; isVeg: boolean; isFeatured: boolean; available: boolean };
  onClose: () => void;
  onSave: (data: { name: string; description?: string; price: number; halfPrice?: number | null; category: string; isVeg: boolean; isFeatured: boolean; available: boolean }) => void;
}) {
  const [form, setForm] = useState<ItemForm>({
    name: item?.name ?? "",
    description: item?.description ?? "",
    price: String(item?.price ?? ""),
    halfPrice: item?.halfPrice != null ? String(item.halfPrice) : "",
    category: item?.category ?? "maggi",
    isVeg: item?.isVeg ?? true,
    isFeatured: item?.isFeatured ?? false,
    available: item?.available ?? true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name: form.name,
      description: form.description || undefined,
      price: Number(form.price),
      halfPrice: form.halfPrice ? Number(form.halfPrice) : null,
      category: form.category,
      isVeg: form.isVeg,
      isFeatured: form.isFeatured,
      available: form.available,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 px-4 pb-4 sm:pb-0">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-border sticky top-0 bg-card">
          <h3 className="font-bold text-foreground">{item ? "Edit Item" : "Add Menu Item"}</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4">
          <input
            type="text"
            placeholder="Item Name *"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
            data-testid="input-item-name"
            className="w-full bg-background border border-input rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
          />
          <input
            type="text"
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            data-testid="input-item-description"
            className="w-full bg-background border border-input rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              type="number"
              placeholder="Price ₹ *"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              required
              min="1"
              data-testid="input-item-price"
              className="w-full bg-background border border-input rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
            />
            <input
              type="number"
              placeholder="Half Price ₹"
              value={form.halfPrice}
              onChange={(e) => setForm({ ...form, halfPrice: e.target.value })}
              min="1"
              data-testid="input-item-half-price"
              className="w-full bg-background border border-input rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
            />
          </div>
          <input
            type="text"
            placeholder="Category (e.g. momos, maggi, chai)"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            required
            data-testid="input-item-category"
            className="w-full bg-background border border-input rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
          />
          <div className="flex gap-4">
            {[
              { key: "isVeg", label: "Veg" },
              { key: "isFeatured", label: "Featured" },
              { key: "available", label: "Available" },
            ].map(({ key, label }) => (
              <label key={key} className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                <input
                  type="checkbox"
                  checked={form[key as keyof ItemForm] as boolean}
                  onChange={(e) => setForm({ ...form, [key]: e.target.checked })}
                  data-testid={`checkbox-${key}`}
                  className="rounded"
                />
                {label}
              </label>
            ))}
          </div>
          <button
            type="submit"
            data-testid="button-save-item"
            className="w-full bg-primary text-primary-foreground font-bold py-3 rounded-xl hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            {item ? "Save Changes" : "Add Item"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
