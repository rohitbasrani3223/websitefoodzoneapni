import { useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle2, Clock, ChefHat, Bell, XCircle, Bike, MapPin } from "lucide-react";
import { useGetOrder, getGetOrderQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

const PICKUP_STEPS = [
  { key: "received",  label: "Order Received", icon: Bell,         desc: "We got your order!" },
  { key: "preparing", label: "Preparing",       icon: ChefHat,      desc: "Your food is being freshly prepared" },
  { key: "ready",     label: "Ready",           icon: CheckCircle2, desc: "Your order is ready for pickup!" },
  { key: "completed", label: "Completed",       icon: CheckCircle2, desc: "Enjoy your meal!" },
] as const;

const DELIVERY_STEPS = [
  { key: "received",         label: "Order Received",   icon: Bell,         desc: "We got your order!" },
  { key: "preparing",        label: "Preparing",         icon: ChefHat,      desc: "Your food is being freshly prepared" },
  { key: "out-for-delivery", label: "Out for Delivery",  icon: Bike,         desc: "Your order is on the way!" },
  { key: "completed",        label: "Delivered",         icon: CheckCircle2, desc: "Enjoy your meal!" },
] as const;

type Step = (typeof PICKUP_STEPS[number]) | (typeof DELIVERY_STEPS[number]);

function getStepIndex(steps: readonly Step[], status: string) {
  return steps.findIndex((s) => s.key === status);
}

export default function TrackPage() {
  const [, setLocation] = useLocation();
  const [match, params] = useRoute("/track/:id");
  const orderId = match && params ? Number(params.id) : 0;
  const queryClient = useQueryClient();

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

  if (!orderId || (!isLoading && !order)) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
        <XCircle className="w-16 h-16 text-destructive/40 mb-4" />
        <h2 className="text-2xl font-black text-foreground mb-2">Order not found</h2>
        <button onClick={() => setLocation("/menu")} className="text-primary font-semibold mt-2">Go to Menu</button>
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
          className={`rounded-2xl px-6 py-5 text-center ${
            isCancelled
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
                        className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all ${
                          isDone  ? "bg-green-600 border-green-600" :
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
  );
}
