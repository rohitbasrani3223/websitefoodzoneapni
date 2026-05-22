import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Minus, Plus, Trash2, ShoppingBag, User, Phone, MapPin, FileText, Home, Navigation, Bike, Copy, Check, Star, ExternalLink, Smartphone, Clock, Upload, X, Trash } from "lucide-react";
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
  const [form, setForm] = useState(() => {
    let defaultName = "";
    let defaultPhone = "";
    let defaultAddress = "";
    let defaultLandmark = "";
    let defaultArea = "";
    
    try {
      const userStr = localStorage.getItem("customer-user");
      if (userStr) {
        const user = JSON.parse(userStr);
        defaultName = user.name || "";
        defaultPhone = user.phone || "";
      }
      const addrStr = localStorage.getItem("shakti-delivery-address");
      if (addrStr) {
        const addr = JSON.parse(addrStr);
        defaultAddress = addr.address || "";
        defaultLandmark = addr.landmark || "";
        defaultArea = addr.area || "";
      }
    } catch (e) {}

    return {
      name: defaultName,
      phone: defaultPhone,
      orderType: "takeaway" as OrderType,
      tableNumber: "",
      notes: "",
      deliveryAddress: defaultAddress,
      deliveryLandmark: defaultLandmark,
      deliveryArea: defaultArea,
    };
  });
  const [submitting, setSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "upi">("cash");
  const [selectedUpiApp, setSelectedUpiApp] = useState<"phonepe" | "gpay" | "paytm" | "bhim" | null>(null);


  const isDelivery = form.orderType === "delivery";
  const subtotal = total;
  const gst = Math.round(subtotal * 0.05);
  const deliveryCharge = isDelivery ? DELIVERY_CHARGE : 0;
  const grandTotal = subtotal + gst + deliveryCharge;

  const [showUpiModal, setShowUpiModal] = useState(false);
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(300);

  // Timer countdown
  useEffect(() => {
    if (!showUpiModal) return;
    if (timeLeft <= 0) {
      setShowUpiModal(false);
      setScreenshot(null);
      setScreenshotPreview(null);
      toast({
        title: "Payment Timed Out",
        description: "Payment session expired. Please try placing your order again.",
        variant: "destructive"
      });
      return;
    }
    const timer = setTimeout(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, showUpiModal]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const handleScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setScreenshot(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshotPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const executeOrderPlacement = async () => {
    setSubmitting(true);
    const finalNotes = paymentMethod === "upi"
      ? `${form.notes || ""}\n[UPI Payment Verified - App: ${selectedUpiApp?.toUpperCase()} - Screenshot uploaded]`.trim()
      : form.notes;

    try {
      const apiBase = import.meta.env.VITE_API_URL ?? "";
      const res = await fetch(`${apiBase}/api/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: form.name,
          phone: form.phone,
          items,
          orderType: form.orderType,
          notes: finalNotes || null,
          tableNumber: form.orderType === "dine-in" ? (form.tableNumber || null) : null,
          deliveryAddress: isDelivery ? form.deliveryAddress : null,
          deliveryLandmark: isDelivery ? (form.deliveryLandmark || null) : null,
          deliveryArea: isDelivery ? (form.deliveryArea || null) : null,
          deliveryCharge: deliveryCharge,
          paymentMethod,
          receiptImage: paymentMethod === "upi" ? (screenshotPreview ?? null) : null,
        }),
      });
      if (!res.ok) throw new Error("Server error");
      const order = await res.json() as { id: number };
      const shortId = `SKT-${String(order.id).padStart(4, "0")}`;
      
      try {
        const savedOrders = JSON.parse(localStorage.getItem("my-orders") || "[]");
        if (!savedOrders.includes(order.id)) {
          localStorage.setItem("my-orders", JSON.stringify([order.id, ...savedOrders]));
        }
        
        if (isDelivery) {
          localStorage.setItem("shakti-delivery-address", JSON.stringify({
            address: form.deliveryAddress,
            landmark: form.deliveryLandmark,
            area: form.deliveryArea
          }));
        }
        
        const userStr = localStorage.getItem("customer-user");
        const user = userStr ? JSON.parse(userStr) : {};
        localStorage.setItem("customer-user", JSON.stringify({ ...user, name: form.name, phone: form.phone }));
      } catch (e) {
        console.error("Local storage error:", e);
      }

      clearCart();
      setShowUpiModal(false);
      setScreenshot(null);
      setScreenshotPreview(null);
      setLocation(`/track/${order.id}?new=${encodeURIComponent(shortId)}`);
    } catch {
      toast({ title: "Order failed", description: "Something went wrong. Please try again.", variant: "destructive" });
      setSubmitting(false);
    }
  };

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
    if (paymentMethod === "upi" && !selectedUpiApp) {
      toast({ title: "UPI app required", description: "Please select a UPI app to proceed with payment.", variant: "destructive" });
      return;
    }

    if (paymentMethod === "upi") {
      setShowUpiModal(true);
      setTimeLeft(300);
      return;
    }

    executeOrderPlacement();
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
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border text-center transition-all ${form.orderType === key
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
        <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
          <div>
            <h2 className="font-bold text-foreground mb-1 text-base">Payment Method</h2>
            <p className="text-muted-foreground text-xs">Aap kaise pay karna chahenge?</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Cash on Delivery / Counter */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={() => {
                setPaymentMethod("cash");
                setSelectedUpiApp(null);
              }}
              className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 text-center transition-all ${paymentMethod === "cash"
                ? "bg-primary/10 border-primary text-foreground shadow-sm"
                : "bg-background border-border text-muted-foreground hover:border-muted-foreground/30 hover:text-foreground"
                }`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${paymentMethod === "cash" ? "bg-primary/20" : "bg-muted"}`}>
                <ShoppingBag className={`w-5 h-5 ${paymentMethod === "cash" ? "text-primary" : "text-muted-foreground"}`} />
              </div>
              <div>
                <p className="text-sm font-bold">{isDelivery ? "Cash on Delivery" : "Pay at Counter"}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{isDelivery ? "Pay when order arrives" : "Cash / UPI at stall"}</p>
              </div>
            </motion.button>

            {/* UPI Option */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={() => setPaymentMethod("upi")}
              className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 text-center transition-all ${paymentMethod === "upi"
                ? "bg-primary/10 border-primary text-foreground shadow-sm"
                : "bg-background border-border text-muted-foreground hover:border-muted-foreground/30 hover:text-foreground"
                }`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${paymentMethod === "upi" ? "bg-primary/20" : "bg-muted"}`}>
                <Smartphone className={`w-5 h-5 ${paymentMethod === "upi" ? "text-primary" : "text-muted-foreground"}`} />
              </div>
              <div>
                <p className="text-sm font-bold">UPI / Instant Pay</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">Pay via GPay, PhonePe, etc.</p>
              </div>
            </motion.button>
          </div>

          <AnimatePresence>
            {paymentMethod === "upi" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-3 pt-2 overflow-hidden"
              >
                <p className="text-xs text-foreground font-semibold">Select your UPI App:</p>
                <div className="grid grid-cols-2 gap-2.5">
                  {/* PhonePe */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={() => setSelectedUpiApp("phonepe")}
                    className={`p-3 rounded-xl border flex items-center gap-3 transition-all ${selectedUpiApp === "phonepe"
                      ? "bg-[#5f259f]/10 border-[#5f259f] text-[#5f259f] font-bold"
                      : "bg-background border-border hover:border-muted-foreground/20 text-muted-foreground hover:text-foreground"
                      }`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#5f259f] flex items-center justify-center text-white font-extrabold text-sm shadow-sm flex-shrink-0">
                      Pe
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-bold text-foreground">PhonePe</p>
                      <p className="text-[9px] text-muted-foreground">Fastest checkout</p>
                    </div>
                  </motion.button>

                  {/* Google Pay */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={() => setSelectedUpiApp("gpay")}
                    className={`p-3 rounded-xl border flex items-center gap-3 transition-all ${selectedUpiApp === "gpay"
                      ? "bg-[#1a73e8]/10 border-[#1a73e8] text-[#1a73e8] font-bold"
                      : "bg-background border-border hover:border-muted-foreground/20 text-muted-foreground hover:text-foreground"
                      }`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-white border border-border flex items-center justify-center font-extrabold text-[10px] text-primary flex-shrink-0">
                      <span className="text-[#4285F4]">G</span>
                      <span className="text-[#EA4335]">P</span>
                      <span className="text-[#FBBC05]">a</span>
                      <span className="text-[#34A853]">y</span>
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-bold text-foreground">Google Pay</p>
                      <p className="text-[9px] text-muted-foreground">Secure with Google</p>
                    </div>
                  </motion.button>

                  {/* Paytm */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={() => setSelectedUpiApp("paytm")}
                    className={`p-3 rounded-xl border flex items-center gap-3 transition-all ${selectedUpiApp === "paytm"
                      ? "bg-[#00baf2]/10 border-[#00baf2] text-[#00baf2] font-bold"
                      : "bg-background border-border hover:border-muted-foreground/20 text-muted-foreground hover:text-foreground"
                      }`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#00baf2] flex items-center justify-center text-white font-black text-[10px] flex-shrink-0">
                      Pay
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-bold text-foreground">Paytm</p>
                      <p className="text-[9px] text-muted-foreground">Instant wallet/UPI</p>
                    </div>
                  </motion.button>

                  {/* BHIM UPI */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={() => setSelectedUpiApp("bhim")}
                    className={`p-3 rounded-xl border flex items-center gap-3 transition-all ${selectedUpiApp === "bhim"
                      ? "bg-[#f26522]/10 border-[#f26522] text-[#f26522] font-bold"
                      : "bg-background border-border hover:border-muted-foreground/20 text-muted-foreground hover:text-foreground"
                      }`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#f26522] flex items-center justify-center text-white font-extrabold text-[10px] flex-shrink-0">
                      UPI
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-bold text-foreground">BHIM UPI</p>
                      <p className="text-[9px] text-muted-foreground">Govt. secure UPI</p>
                    </div>
                  </motion.button>
                </div>

                <div className="mt-2 p-3 bg-muted/40 rounded-xl border border-border/60">
                  <p className="text-[10px] text-muted-foreground leading-relaxed">
                    💡 <span className="font-semibold text-foreground">Note:</span> Order place karne ke baad aapko select kiye gaye UPI app par request aayegi, ya fir counter par scan karke pay kar sakte hain.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>


        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={submitting}
          className="w-full bg-primary hover:bg-primary/90 disabled:opacity-60 text-primary-foreground font-black py-4 rounded-2xl text-lg transition-all glow-box"
        >
          {submitting
            ? "Placing Order..."
            : `Place Order — ₹${grandTotal}`}
        </motion.button>
      </form>

      {/* ── UPI Payment Modal / Overlay ── */}
      <AnimatePresence>
        {showUpiModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, y: 30, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 30, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="bg-card border border-border rounded-3xl w-full max-w-md p-6 shadow-2xl relative"
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={() => {
                  setShowUpiModal(false);
                  setScreenshot(null);
                  setScreenshotPreview(null);
                }}
                className="absolute right-4 top-4 p-1.5 bg-muted hover:bg-muted/80 rounded-full text-muted-foreground hover:text-foreground transition-all"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Title & Timer */}
              <div className="text-center mb-5">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-black mb-2 tracking-wide uppercase">
                  <Clock className="w-3.5 h-3.5 animate-pulse" />
                  Time Left: {formatTime(timeLeft)}
                </span>
                <h3 className="text-xl font-black text-foreground">UPI Payment Verification</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Please scan and pay using your selected UPI app</p>
              </div>

              {/* QR Code Container */}
              <div className="bg-background border border-border rounded-2xl p-5 mb-5 text-center flex flex-col items-center">
                <div className="bg-white p-3 rounded-2xl shadow-inner mb-3">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                      `upi://pay?pa=skullgamer23500@ybl&pn=Shakti%20Fast%20Food&am=${grandTotal}&cu=INR`
                    )}`}
                    alt="Shakti Fast Food UPI QR"
                    className="w-44 h-44 object-contain"
                  />
                </div>
                <p className="text-base font-black text-primary mb-0.5">
                  Amount to Pay: ₹{grandTotal}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  UPI ID: <span className="font-semibold text-foreground">skullgamer23500@ybl</span>
                </p>
              </div>

              {/* Upload Screenshot Zone */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-foreground">
                  Upload Payment Screenshot *
                </label>

                {!screenshotPreview ? (
                  <div className="border-2 border-dashed border-border hover:border-primary/50 rounded-2xl p-6 text-center cursor-pointer transition-all relative group bg-background/50">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleScreenshotChange}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <Upload className="w-8 h-8 text-muted-foreground group-hover:text-primary mx-auto mb-2 transition-colors" />
                    <p className="text-xs font-bold text-foreground">Choose screenshot file</p>
                    <p className="text-[10px] text-muted-foreground mt-1">Supports PNG, JPG, JPEG</p>
                  </div>
                ) : (
                  <div className="relative border border-border rounded-2xl p-3 bg-background flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 h-12 rounded-lg border border-border overflow-hidden bg-muted flex-shrink-0">
                        <img src={screenshotPreview} alt="Screenshot preview" className="w-full h-full object-cover" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-foreground truncate">
                          {screenshot?.name || "screenshot.png"}
                        </p>
                        <p className="text-[10px] text-green-600 font-semibold flex items-center gap-1">
                          <Check className="w-3 h-3" /> Ready to upload
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setScreenshot(null);
                        setScreenshotPreview(null);
                      }}
                      className="p-2 hover:bg-destructive/10 rounded-xl text-muted-foreground hover:text-destructive transition-all"
                    >
                      <Trash className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowUpiModal(false);
                    setScreenshot(null);
                    setScreenshotPreview(null);
                  }}
                  className="bg-muted hover:bg-muted/80 text-foreground font-bold py-3.5 rounded-xl text-sm transition-all"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!screenshot || submitting}
                  onClick={executeOrderPlacement}
                  className="bg-primary hover:bg-primary/90 disabled:opacity-60 text-primary-foreground font-black py-3.5 rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/25"
                >
                  {submitting ? (
                    "Processing..."
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      Confirm & Pay
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
