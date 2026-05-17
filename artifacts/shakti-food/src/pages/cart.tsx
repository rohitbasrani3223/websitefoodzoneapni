import { useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Minus, Plus, Trash2, ShoppingBag, User, Phone, MapPin, FileText, Home, Navigation, Bike } from "lucide-react";
import { useCreateOrder } from "@workspace/api-client-react";
import { useCart } from "@/context/cart";
import { useToast } from "@/hooks/use-toast";

const DELIVERY_CHARGE = 30;

type OrderType = "takeaway" | "dine-in" | "delivery";

const ORDER_TYPES: { key: OrderType; label: string; desc: string; icon: typeof Bike }[] = [
  { key: "takeaway", label: "Takeaway", desc: "Pick up from stall", icon: ShoppingBag },
  { key: "dine-in", label: "Dine In", desc: "Eat at the stall", icon: Home },
  { key: "delivery", label: "Delivery", desc: "+₹30 delivery charge", icon: Bike },
];

export default function CartPage() {
  const [, setLocation] = useLocation();
  const { items, removeItem, updateQuantity, clearCart, total } = useCart();
  const { toast } = useToast();
  const [form, setForm] = useState({
    name: "",
    phone: "",
    orderType: "takeaway" as OrderType,
    tableNumber: "",
    notes: "",
    deliveryAddress: "",
    deliveryLandmark: "",
    deliveryArea: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const createOrder = useCreateOrder();

  const isDelivery = form.orderType === "delivery";
  const subtotal = total;
  const gst = Math.round(subtotal * 0.05);
  const deliveryCharge = isDelivery ? DELIVERY_CHARGE : 0;
  const grandTotal = subtotal + gst + deliveryCharge;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;
    if (!form.name.trim() || !form.phone.trim()) {
      toast({ title: "Required fields missing", description: "Please enter your name and phone number.", variant: "destructive" });
      return;
    }
    if (isDelivery && !form.deliveryAddress.trim()) {
      toast({ title: "Address required", description: "Please enter your delivery address.", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    createOrder.mutate(
      {
        data: {
          customerName: form.name,
          phone: form.phone,
          items,
          orderType: form.orderType,
          notes: form.notes || null,
          tableNumber: form.orderType === "dine-in" ? (form.tableNumber || null) : null,
          deliveryAddress: isDelivery ? form.deliveryAddress : null,
          deliveryLandmark: isDelivery ? (form.deliveryLandmark || null) : null,
          deliveryArea: isDelivery ? (form.deliveryArea || null) : null,
          deliveryCharge: deliveryCharge,
        },
      },
      {
        onSuccess: (order) => {
          clearCart();
          setLocation(`/track/${order.id}`);
        },
        onError: () => {
          toast({ title: "Order failed", description: "Something went wrong. Please try again.", variant: "destructive" });
          setSubmitting(false);
        },
      }
    );
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
        <div className="text-center">
          <ShoppingBag className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
          <h2 className="text-2xl font-black text-foreground mb-2">Your cart is empty</h2>
          <p className="text-muted-foreground mb-6">Add some delicious items from our menu</p>
          <button
            onClick={() => setLocation("/menu")}
            className="bg-primary text-primary-foreground font-bold px-8 py-3 rounded-xl hover:bg-primary/90 transition-colors"
          >
            Browse Menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <button onClick={() => setLocation("/menu")} className="p-2 hover:bg-card rounded-xl transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-black text-foreground">Your Cart</h1>
          <span className="ml-auto text-muted-foreground text-sm">{items.length} item{items.length !== 1 ? "s" : ""}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto px-4 py-6 space-y-5">
        {/* Cart Items */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="font-bold text-foreground">Order Summary</h2>
          </div>
          <AnimatePresence>
            {items.map((item) => (
              <motion.div
                key={item.menuItemId}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="px-5 py-4 border-b border-border/50 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground text-sm">{item.name}</p>
                    <p className="text-primary text-sm font-bold">₹{item.price}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.menuItemId, item.quantity - 1)}
                      className="w-7 h-7 bg-muted rounded-lg flex items-center justify-center hover:bg-muted/80 transition-colors"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-6 text-center font-bold text-sm">{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.menuItemId, item.quantity + 1)}
                      className="w-7 h-7 bg-muted rounded-lg flex items-center justify-center hover:bg-muted/80 transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeItem(item.menuItemId)}
                      className="w-7 h-7 bg-destructive/10 text-destructive rounded-lg flex items-center justify-center hover:bg-destructive/20 transition-colors ml-1"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                <div className="mt-1 text-right text-xs text-muted-foreground">
                  Subtotal: ₹{item.price * item.quantity}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Totals */}
          <div className="px-5 py-4 bg-muted/20 space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Subtotal</span><span>₹{subtotal}</span>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>GST (5%)</span><span>₹{gst}</span>
            </div>
            <AnimatePresence>
              {isDelivery && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex justify-between text-sm text-primary"
                >
                  <span className="flex items-center gap-1.5">
                    <Bike className="w-3.5 h-3.5" /> Delivery Charge
                  </span>
                  <span>₹{DELIVERY_CHARGE}</span>
                </motion.div>
              )}
            </AnimatePresence>
            <div className="flex justify-between font-black text-foreground text-base pt-2 border-t border-border">
              <span>Total</span>
              <span className="text-primary">₹{grandTotal}</span>
            </div>
          </div>
        </div>

        {/* Customer Details */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="font-bold text-foreground">Your Details</h2>
          </div>
          <div className="px-5 py-4 space-y-4">
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Your Name *"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                className="w-full bg-background border border-input rounded-xl pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
              />
            </div>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="tel"
                placeholder="Phone Number *"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                required
                className="w-full bg-background border border-input rounded-xl pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Order Type */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="font-bold text-foreground">How do you want your order?</h2>
          </div>
          <div className="px-5 py-4">
            <div className="grid grid-cols-3 gap-3">
              {ORDER_TYPES.map(({ key, label, desc, icon: Icon }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setForm({ ...form, orderType: key })}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border text-center transition-all ${
                    form.orderType === key
                      ? "bg-primary/10 border-primary text-primary"
                      : "bg-background border-input text-muted-foreground hover:border-primary/40"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-xs font-bold leading-tight">{label}</span>
                  <span className="text-[10px] leading-tight opacity-70">{desc}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Dine-in: Table Number */}
        <AnimatePresence>
          {form.orderType === "dine-in" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-card border border-border rounded-2xl overflow-hidden"
            >
              <div className="px-5 py-4">
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Table Number (optional)"
                    value={form.tableNumber}
                    onChange={(e) => setForm({ ...form, tableNumber: e.target.value })}
                    className="w-full bg-background border border-input rounded-xl pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Delivery: Address Fields */}
        <AnimatePresence>
          {isDelivery && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-card border border-primary/30 rounded-2xl overflow-hidden"
            >
              <div className="px-5 py-4 border-b border-border flex items-center gap-2">
                <Bike className="w-4 h-4 text-primary" />
                <h2 className="font-bold text-foreground">Delivery Address</h2>
                <span className="ml-auto text-xs text-primary font-semibold bg-primary/10 px-2 py-0.5 rounded-full">+₹{DELIVERY_CHARGE}</span>
              </div>
              <div className="px-5 py-4 space-y-3">
                {/* Area / Locality */}
                <div className="relative">
                  <Navigation className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Area / Locality *  (e.g. Civil Lines, Station Road)"
                    value={form.deliveryArea}
                    onChange={(e) => setForm({ ...form, deliveryArea: e.target.value })}
                    className="w-full bg-background border border-input rounded-xl pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
                  />
                </div>
                {/* Full Address */}
                <div className="relative">
                  <Home className="absolute left-3 top-3.5 w-4 h-4 text-muted-foreground" />
                  <textarea
                    placeholder="Full Address *  (house no., street, building name)"
                    value={form.deliveryAddress}
                    onChange={(e) => setForm({ ...form, deliveryAddress: e.target.value })}
                    rows={2}
                    required={isDelivery}
                    className="w-full bg-background border border-input rounded-xl pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors resize-none"
                  />
                </div>
                {/* Landmark */}
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Nearby Landmark (optional)  e.g. near XYZ school"
                    value={form.deliveryLandmark}
                    onChange={(e) => setForm({ ...form, deliveryLandmark: e.target.value })}
                    className="w-full bg-background border border-input rounded-xl pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Delivery available in Sagar city area only. Cash on delivery.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Notes */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="px-5 py-4">
            <div className="relative">
              <FileText className="absolute left-3 top-3.5 w-4 h-4 text-muted-foreground" />
              <textarea
                placeholder="Special instructions (optional)"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                rows={2}
                className="w-full bg-background border border-input rounded-xl pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors resize-none"
              />
            </div>
          </div>
        </div>

        {/* Payment */}
        <div className="bg-card border border-border rounded-2xl px-5 py-4">
          <h2 className="font-bold text-foreground mb-1">Payment</h2>
          <p className="text-muted-foreground text-sm">
            {isDelivery ? "Cash on delivery. Pay when your order arrives." : "Pay at counter — Cash or UPI accepted."}
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={submitting || createOrder.isPending}
          className="w-full bg-primary hover:bg-primary/90 disabled:opacity-60 text-primary-foreground font-black py-4 rounded-2xl text-lg transition-all glow-box"
        >
          {submitting || createOrder.isPending
            ? "Placing Order..."
            : `Place Order — ₹${grandTotal}`}
        </motion.button>
      </form>
    </div>
  );
}
