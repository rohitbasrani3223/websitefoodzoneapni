import { useState } from "react";
import { useLocation, Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Mail, Eye, EyeOff, User, Phone, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function CustomerLoginPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [form, setForm] = useState({ phone: "", password: "", newPassword: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isForgotMode, setIsForgotMode] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      if (isForgotMode) {
        // Reset password flow
        const res = await fetch("/api/customers/reset-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone: form.phone, newPassword: form.newPassword })
        });
        
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Failed to reset password");
        }
        
        toast({ title: "Success!", description: "Password reset successful. You can now login with your new password." });
        setIsForgotMode(false);
        setForm({ ...form, password: "", newPassword: "" });
      } else {
        // Login flow
        const res = await fetch("/api/customers/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone: form.phone, password: form.password })
        });
        
        const data = await res.json();
        
        if (!res.ok) {
          throw new Error(data.error || "Login failed");
        }
        
        // Save token
        localStorage.setItem("customer-token", data.token);
        localStorage.setItem("customer-user", JSON.stringify(data.user));
        
        toast({ title: "Welcome back!", description: "You have successfully logged in." });
        setLocation("/"); // Redirect to home
      }
    } catch (err: any) {
      toast({ title: isForgotMode ? "Reset failed" : "Login failed", description: err.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col pt-24 px-6 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md mx-auto relative z-10"
      >
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-primary/10 border border-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-black text-foreground">
            {isForgotMode ? "Reset Password" : "Welcome Back"}
          </h1>
          <p className="text-muted-foreground mt-2">
            {isForgotMode 
              ? "Enter your phone number and choose a new password" 
              : "Login to your account to order faster"}
          </p>
        </div>

        <div className="bg-card/50 backdrop-blur-xl border border-border rounded-3xl p-6 sm:p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground ml-1">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="tel"
                  placeholder="9876543210"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  required
                  className="w-full bg-background border border-input rounded-xl pl-12 pr-4 py-3.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
            </div>

            {!isForgotMode ? (
              <div className="space-y-1">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-sm font-medium text-foreground">Password</label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsForgotMode(true);
                      setForm({ ...form, password: "", newPassword: "" });
                    }}
                    className="text-xs text-primary hover:underline bg-transparent border-none cursor-pointer focus:outline-none"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    required={!isForgotMode}
                    className="w-full bg-background border border-input rounded-xl pl-12 pr-12 py-3.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-1">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-sm font-medium text-foreground">New Password</label>
                  <button
                    type="button"
                    onClick={() => setIsForgotMode(false)}
                    className="text-xs text-primary hover:underline flex items-center gap-1 bg-transparent border-none cursor-pointer focus:outline-none"
                  >
                    <ArrowLeft className="w-3 h-3" /> Back to Login
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your new password"
                    value={form.newPassword}
                    onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
                    required={isForgotMode}
                    minLength={6}
                    className="w-full bg-background border border-input rounded-xl pl-12 pr-12 py-3.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            )}

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(255,87,34,0.3)] mt-2"
            >
              {isLoading 
                ? (isForgotMode ? "Resetting..." : "Signing in...") 
                : (isForgotMode ? "Reset Password" : "Sign In")}
            </motion.button>
          </form>

          <p className="text-center text-muted-foreground text-sm mt-8">
            Don't have an account?{" "}
            <Link href="/signup" className="text-primary font-bold hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
