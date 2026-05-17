import { useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Minus, Plus, Trash2, ShoppingBag, User, Phone, MapPin, FileText } from "lucide-react";
import { useCreateOrder } from "@workspace/api-client-react";
import { useCart } from "@/context/cart";
import { useToast } from "@/hooks/use-toast";

export default function CartPage() {
  const [, setLocation] = useLocation();
  const { items, removeItem, updateQuantity, clearCart, total } = useCart();
  const { toast } = useToast();
  const [form, setForm] = useState({ name: "", phone: "", orderType: "takeaway" as "dine-in" | "takeaway", tableNumber: "", notes: "" });
  const [submitting, setSubmitting] = useState(false);
  const createOrder = useCreateOrder();

  const subtotal = total;
  const gst = Math.round(subtotal * 0.05);
  const grandTotal = subtotal + gst;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;
    if (!form.name.trim() || !form.phone.trim()) {
      toast({ title: "Required fields missing", description: "Please enter your name and phone number.", variant: "destructive" });
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
            data-testid="button-browse-menu"
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
          <button onClick={() => setLocation("/menu")} data-testid="button-back" className="p-2 hover:bg-card rounded-xl transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-black text-foreground">Your Cart</h1>
          <span className="ml-auto text-muted-foreground text-sm">{items.length} item{items.length !== 1 ? "s" : ""}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto px-4 py-6 space-y-6">
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
                data-testid={`cart-item-${item.menuItemId}`}
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
                      data-testid={`button-cart-decrease-${item.menuItemId}`}
                      className="w-7 h-7 bg-muted rounded-lg flex items-center justify-center hover:bg-muted/80 transition-colors"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-6 text-center font-bold text-sm" data-testid={`text-quantity-${item.menuItemId}`}>{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.menuItemId, item.quantity + 1)}
                      data-testid={`button-cart-increase-${item.menuItemId}`}
                      className="w-7 h-7 bg-muted rounded-lg flex items-center justify-center hover:bg-muted/80 transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeItem(item.menuItemId)}
                      data-testid={`button-remove-${item.menuItemId}`}
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
              <span>Subtotal</span>
              <span>₹{subtotal}</span>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>GST (5%)</span>
              <span>₹{gst}</span>
            </div>
            <div className="flex justify-between font-black text-foreground text-base pt-2 border-t border-border">
              <span>Total</span>
              <span data-testid="text-total" className="text-primary">₹{grandTotal}</span>
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
                data-testid="input-name"
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
                data-testid="input-phone"
                className="w-full bg-background border border-input rounded-xl pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
              />
            </div>

            {/* Order Type */}
            <div>
              <p className="text-sm font-medium text-foreground mb-2">Order Type</p>
              <div className="grid grid-cols-2 gap-2">
                {(["takeaway", "dine-in"] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setForm({ ...form, orderType: type })}
                    data-testid={`button-order-type-${type}`}
                    className={`py-2.5 rounded-xl border text-sm font-semibold capitalize transition-all ${form.orderType === type ? "bg-primary border-primary text-primary-foreground" : "bg-background border-input text-muted-foreground hover:border-primary/40"}`}
                  >
                    {type === "dine-in" ? "Dine In" : "Takeaway"}
                  </button>
                ))}
              </div>
            </div>

            {form.orderType === "dine-in" && (
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Table Number (optional)"
                  value={form.tableNumber}
                  onChange={(e) => setForm({ ...form, tableNumber: e.target.value })}
                  data-testid="input-table"
                  className="w-full bg-background border border-input rounded-xl pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
                />
              </div>
            )}

            <div className="relative">
              <FileText className="absolute left-3 top-3.5 w-4 h-4 text-muted-foreground" />
              <textarea
                placeholder="Special instructions (optional)"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                data-testid="input-notes"
                rows={2}
                className="w-full bg-background border border-input rounded-xl pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors resize-none"
              />
            </div>
          </div>
        </div>

        {/* Payment Note */}
        <div className="bg-card border border-border rounded-2xl px-5 py-4">
          <h2 className="font-bold text-foreground mb-2">Payment</h2>
          <p className="text-muted-foreground text-sm">Pay at counter — Cash or UPI accepted.</p>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={submitting || createOrder.isPending}
          data-testid="button-place-order"
          className="w-full bg-primary hover:bg-primary/90 disabled:opacity-60 text-primary-foreground font-black py-4 rounded-2xl text-lg transition-all glow-box"
        >
          {submitting || createOrder.isPending ? "Placing Order..." : `Place Order — ₹${grandTotal}`}
        </motion.button>
      </form>
    </div>
  );
}
