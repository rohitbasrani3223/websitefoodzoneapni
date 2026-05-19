import { useEffect, useState } from "react";
import { useRoute, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, CheckCircle2, Clock, ChefHat, Bell, XCircle, Bike, MapPin, Search, Navigation, Copy, Check, Star, ExternalLink } from "lucide-react";
import { useGetOrder, getGetOrderQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

const PICKUP_STEPS = [
  { key: "received", label: "Order Received", icon: Bell, desc: "We got your order!" },
  { key: "preparing", label: "Preparing", icon: ChefHat, desc: "Your food is being freshly prepared" },
  { key: "ready", label: "Ready", icon: CheckCircle2, desc: "Your order is ready for pickup!" },
  { key: "completed", label: "Completed", icon: CheckCircle2, desc: "Enjoy your meal!" },
] as const;

const DELIVERY_STEPS = [
  { key: "received", label: "Order Received", icon: Bell, desc: "We got your order!" },
  { key: "preparing", label: "Preparing", icon: ChefHat, desc: "Your food is being freshly prepared" },
  { key: "out-for-delivery", label: "Out for Delivery", icon: Bike, desc: "Your order is on the way!" },
  { key: "completed", label: "Delivered", icon: CheckCircle2, desc: "Enjoy your meal!" },
] as const;

type Step = (typeof PICKUP_STEPS[number]) | (typeof DELIVERY_STEPS[number]);

function getStepIndex(steps: readonly Step[], status: string) {
  return steps.findIndex((s) => s.key === status);
}

/* ── Order Success Popup (shown after new order) ── */
function OrderSuccessPopup({ orderId, onClose }: { orderId: string; onClose: () => void }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(orderId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-4"
    >
      <motion.div
        initial={{ scale: 0.82, y: 40, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.82, y: 40, opacity: 0 }}
        transition={{ type: "spring", stiffness: 280, damping: 24 }}
        className="bg-card border border-border rounded-3xl w-full max-w-sm p-7 text-center shadow-2xl"
      >
        {/* Success Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 300 }}
          className="w-20 h-20 bg-primary/15 rounded-full flex items-center justify-center mx-auto mb-5"
        >
          <Check className="w-10 h-10 text-primary" />
        </motion.div>

        <h2 className="text-2xl font-black text-foreground mb-1">Order Placed! 🎉</h2>
        <p className="text-muted-foreground text-sm mb-6">Aapka order receive ho gaya hai. Jaldi taiyar hoga!</p>

        {/* Order ID Box */}
        <div className="bg-background border border-border rounded-2xl px-4 py-3 mb-2 flex items-center justify-between">
          <div className="text-left">
            <p className="text-xs text-muted-foreground">Your Order ID</p>
            <p className="text-xl font-black text-primary tracking-widest">{orderId}</p>
          </div>
          <motion.button
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.05 }}
            onClick={handleCopy}
            className="flex items-center gap-1.5 bg-primary/10 hover:bg-primary/20 text-primary px-3 py-2 rounded-xl text-xs font-bold transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? "Copied!" : "Copy"}
          </motion.button>
        </div>
        <p className="text-xs text-muted-foreground mb-5">Ye ID save karo — dobara track karne ke liye zaroori hai!</p>

        {/* Google Review */}
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl px-4 py-3 mb-5">
          <div className="flex items-center justify-center gap-1 mb-1">
            {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
          </div>
          <p className="text-xs text-foreground font-semibold">Khana pasand aaya? 😊</p>
          <p className="text-xs text-muted-foreground mt-0.5">Please rate us on Google!</p>
          <a
            href="https://g.page/r/shakti-fast-food/review"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 mt-2 text-xs font-bold text-amber-500 hover:underline"
          >
            Rate on Google <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        <motion.button
          whileTap={{ scale: 0.97 }}
          whileHover={{ scale: 1.02 }}
          onClick={onClose}
          className="w-full bg-primary text-primary-foreground font-bold py-3 rounded-xl text-sm hover:bg-primary/90 transition-colors"
        >
          Track My Order 🔍
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

/* ── My Orders Page (when user visits /track without ID) ── */
function MyOrdersPage() {
  const [, setLocation] = useLocation();
  const [orderIds, setOrderIds] = useState<number[]>([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("my-orders") || "[]");
    setOrderIds(saved);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    const numericId = trimmed.replace(/^SKT-0*/i, "").replace(/^#/, "");
    if (numericId && !isNaN(Number(numericId))) {
      setLocation(`/track/${numericId}`);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border px-4 py-3">
        <div className="max-w-xl mx-auto flex items-center gap-3">
          <button onClick={() => setLocation("/")} className="p-2 hover:bg-card rounded-xl transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-black text-foreground">My Orders</h1>
        </div>
      </div>

      <div className="max-w-xl mx-auto w-full px-4 py-6 space-y-5">
        {/* Quick search bar */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by ID (SKT-0001)..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="w-full bg-card border border-border rounded-xl pl-9 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
            />
          </div>
          <button type="submit" disabled={!input.trim()} className="bg-primary text-primary-foreground font-bold px-4 py-2.5 rounded-xl text-sm disabled:opacity-40 hover:bg-primary/90 transition-colors">
            Track
          </button>
        </form>

        {/* My Orders List */}
        {orderIds.length > 0 ? (
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Your Recent Orders</p>
            {orderIds.map((id) => (
              <OrderCard key={id} orderId={id} onClick={() => setLocation(`/track/${id}`)} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mb-6">
              <Navigation className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-2xl font-black text-foreground mb-2">No Orders Yet</h2>
            <p className="text-muted-foreground text-sm mb-6">Jab aap order karenge, toh yahan aapke saare orders dikhenge!</p>
            <button
              onClick={() => setLocation("/menu")}
              className="bg-primary text-primary-foreground font-bold px-8 py-3 rounded-xl hover:bg-primary/90 transition-colors"
            >
              Browse Menu
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Single Order Card (shows live status) ── */
function OrderCard({ orderId, onClick }: { orderId: number; onClick: () => void }) {
  const { data: order, isLoading } = useGetOrder(orderId, {
    query: { enabled: !!orderId, queryKey: getGetOrderQueryKey(orderId) },
  });

  if (isLoading) {
    return (
      <div className="bg-card border border-border rounded-2xl p-4 animate-pulse">
        <div className="h-4 bg-muted rounded w-1/3 mb-2" />
        <div className="h-3 bg-muted rounded w-2/3" />
      </div>
    );
  }

  if (!order) return null;

  const statusColors: Record<string, string> = {
    received: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    preparing: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    ready: "bg-green-500/15 text-green-400 border-green-500/30",
    "out-for-delivery": "bg-primary/15 text-primary border-primary/30",
    completed: "bg-green-600/15 text-green-500 border-green-600/30",
    cancelled: "bg-red-500/15 text-red-400 border-red-500/30",
  };

  const statusLabels: Record<string, string> = {
    received: "Order Received",
    preparing: "Preparing 🍳",
    ready: "Ready for Pickup ✅",
    "out-for-delivery": "Out for Delivery 🛵",
    completed: "Completed ✔️",
    cancelled: "Cancelled ❌",
  };

  const isActive = !["completed", "cancelled"].includes(order.status);

  return (
    <motion.button
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
      className={`w-full text-left bg-card border rounded-2xl p-4 transition-all ${isActive ? "border-primary/30 shadow-[0_0_15px_rgba(255,87,34,0.08)]" : "border-border"}`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-black text-foreground">SKT-{String(order.id).padStart(4, "0")}</span>
        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${statusColors[order.status] || "bg-muted text-muted-foreground"}`}>
          {statusLabels[order.status] || order.status}
        </span>
      </div>
      <div className="flex items-center justify-between">
        <div className="text-xs text-muted-foreground">
          {(order.items as Array<{ name: string }>).map((i) => i.name).join(", ")}
        </div>
        <span className="text-primary font-bold text-sm">₹{order.total}</span>
      </div>
      {isActive && (
        <div className="mt-2 flex items-center gap-1.5 text-[10px] text-primary font-semibold">
          <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          Live tracking — tap to view
        </div>
      )}
    </motion.button>
  );
}

export default function TrackPage() {
  const [, setLocation] = useLocation();
  const [match, params] = useRoute("/track/:id");
  const orderId = match && params ? Number(params.id) : 0;
  const queryClient = useQueryClient();

  // Read ?new=SKT-XXXX from URL to show success popup
  const urlParams = new URLSearchParams(window.location.search);
  const newOrderId = urlParams.get("new");
  const [showSuccessPopup, setShowSuccessPopup] = useState(!!newOrderId);

  const handleClosePopup = () => {
    setShowSuccessPopup(false);
    // Clean up URL param without triggering navigation
    const url = new URL(window.location.href);
    url.searchParams.delete("new");
    window.history.replaceState({}, "", url.toString());
  };

  const { data: order, isLoading } = useGetOrder(orderId, {
    query: { enabled: !!orderId, queryKey: getGetOrderQueryKey(orderId) },
  });

  const isDelivery = order?.orderType === "delivery";
  const steps: readonly Step[] = isDelivery ? DELIVERY_STEPS : PICKUP_STEPS;

  useEffect(() => {
    if (!orderId || order?.status === "completed" || order?.status === "cancelled") return;
    const interval = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: getGetOrderQueryKey(orderId) });
    }, 5000);
    return () => clearInterval(interval);
  }, [orderId, order?.status, queryClient]);

  /* No ID → show my orders page */
  if (!orderId) return <MyOrdersPage />;

  if (!isLoading && !order) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
        <XCircle className="w-16 h-16 text-destructive/40 mb-4" />
        <h2 className="text-2xl font-black text-foreground mb-2">Order not found</h2>
        <p className="text-muted-foreground text-sm mb-4">Order ID galat ho sakti hai. Dobara check karo.</p>
        <button onClick={() => setLocation("/track")} className="text-primary font-semibold mt-2">Try Again</button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!order) return null;

  const currentStepIndex = getStepIndex(steps, order.status);
  const isCancelled = order.status === "cancelled";
  const currentStep = steps[Math.max(0, currentStepIndex)];

  return (
    <>
      {/* ── Success Popup (appears right after order is placed) ── */}
      <AnimatePresence>
        {showSuccessPopup && newOrderId && (
          <OrderSuccessPopup orderId={newOrderId} onClose={handleClosePopup} />
        )}
      </AnimatePresence>

      <div className="min-h-screen bg-background">
        <div className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border px-4 py-3">
          <div className="max-w-xl mx-auto flex items-center gap-3">
            <button onClick={() => setLocation("/")} className="p-2 hover:bg-card rounded-xl transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-black text-foreground">Track Order</h1>
            <div className="ml-auto flex items-center gap-2">
              {isDelivery && (
                <span className="text-xs font-bold bg-primary/15 text-primary px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Bike className="w-3 h-3" /> Delivery
                </span>
              )}
              <span className="text-muted-foreground text-sm font-mono">#{order.id}</span>
            </div>
          </div>
        </div>

        <div className="max-w-xl mx-auto px-4 py-8 space-y-5">
          {/* Status Banner */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-2xl px-6 py-5 text-center ${isCancelled
              ? "bg-destructive/10 border border-destructive/30"
              : "bg-primary/10 border border-primary/30 glow-box"
              }`}
          >
            {isCancelled ? (
              <>
                <XCircle className="w-10 h-10 text-destructive mx-auto mb-2" />
                <h2 className="text-xl font-black text-destructive">Order Cancelled</h2>
                <p className="text-muted-foreground text-sm mt-1">Please contact us for assistance</p>
              </>
            ) : (
              <>
                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  {currentStep
                    ? (() => { const Icon = currentStep.icon; return <Icon className="w-6 h-6 text-primary" />; })()
                    : <Clock className="w-6 h-6 text-primary" />}
                </div>
                <h2 className="text-xl font-black text-foreground">{currentStep?.label ?? "Processing"}</h2>
                <p className="text-muted-foreground text-sm mt-1">{currentStep?.desc ?? ""}</p>
              </>
            )}
          </motion.div>

          {/* Progress Steps */}
          {!isCancelled && (
            <div className="bg-card border border-border rounded-2xl p-6">
              <div className="space-y-0">
                {steps.map((step, idx) => {
                  const isDone = idx < currentStepIndex;
                  const isActive = idx === currentStepIndex;
                  const Icon = step.icon;
                  return (
                    <div key={step.key} className="flex items-start gap-4">
                      <div className="flex flex-col items-center">
                        <motion.div
                          animate={isActive ? { scale: [1, 1.12, 1] } : {}}
                          transition={{ repeat: Infinity, duration: 2 }}
                          className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all ${isDone ? "bg-green-600 border-green-600" :
                            isActive ? "bg-primary border-primary" :
                              "bg-card border-border"
                            }`}
                        >
                          <Icon className={`w-4 h-4 ${isDone || isActive ? "text-white" : "text-muted-foreground"}`} />
                        </motion.div>
                        {idx < steps.length - 1 && (
                          <div className={`w-0.5 h-8 my-1 transition-colors ${isDone ? "bg-green-600" : "bg-border"}`} />
                        )}
                      </div>
                      <div className="pt-1.5 pb-6">
                        <p className={`font-semibold text-sm ${isDone || isActive ? "text-foreground" : "text-muted-foreground"}`}>
                          {step.label}
                        </p>
                        {isActive && <p className="text-muted-foreground text-xs mt-0.5">{step.desc}</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Delivery Address Card */}
          {isDelivery && order.deliveryAddress && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-card border border-primary/20 rounded-2xl overflow-hidden"
            >
              <div className="px-5 py-3 border-b border-border flex items-center gap-2 bg-primary/5">
                <Bike className="w-4 h-4 text-primary" />
                <h3 className="font-bold text-foreground text-sm">Delivery Address</h3>
              </div>
              <div className="px-5 py-4 space-y-2">
                {order.deliveryArea && (
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground font-medium">{order.deliveryArea}</span>
                  </div>
                )}
                <p className="text-foreground text-sm font-medium pl-6">{order.deliveryAddress}</p>
                {order.deliveryLandmark && (
                  <p className="text-muted-foreground text-xs pl-6">Near: {order.deliveryLandmark}</p>
                )}
                <div className="mt-2 pt-2 border-t border-border flex justify-between text-xs text-muted-foreground pl-6">
                  <span>Delivery charge</span>
                  <span className="text-primary font-bold">₹{order.deliveryCharge}</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Order Details */}
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-border">
              <h3 className="font-bold text-foreground">Order Details</h3>
            </div>
            <div className="px-5 py-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Customer</span>
                <span className="text-foreground font-medium">{order.customerName}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Phone</span>
                <span className="text-foreground font-medium">{order.phone}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Type</span>
                <span className={`font-semibold capitalize text-sm flex items-center gap-1 ${isDelivery ? "text-primary" : "text-foreground"}`}>
                  {isDelivery && <Bike className="w-3.5 h-3.5" />}
                  {order.orderType}
                </span>
              </div>
              {order.tableNumber && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Table</span>
                  <span className="text-foreground font-medium">{order.tableNumber}</span>
                </div>
              )}
            </div>
            <div className="px-5 py-4 border-t border-border space-y-2">
              {(order.items as Array<{ name: string; price: number; quantity: number }>).map((item, idx) => (
                <div key={idx} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{item.name} × {item.quantity}</span>
                  <span className="text-foreground">₹{item.price * item.quantity}</span>
                </div>
              ))}
              {isDelivery && (order.deliveryCharge ?? 0) > 0 && (
                <div className="flex justify-between text-sm text-primary">
                  <span className="flex items-center gap-1"><Bike className="w-3 h-3" /> Delivery charge</span>
                  <span>₹{order.deliveryCharge}</span>
                </div>
              )}
              <div className="flex justify-between font-bold pt-2 border-t border-border">
                <span className="text-foreground">Total</span>
                <span className="text-primary">₹{order.total}</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setLocation("/menu")}
            className="w-full bg-card border border-border hover:border-primary/40 text-foreground font-semibold py-3 rounded-xl transition-colors"
          >
            Order More
          </button>
        </div>
      </div>
    </>
  );
}

