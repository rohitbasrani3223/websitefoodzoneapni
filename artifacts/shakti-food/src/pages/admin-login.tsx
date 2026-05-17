import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Lock, User, Eye, EyeOff } from "lucide-react";
import { useAdminLogin } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminLoginPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [form, setForm] = useState({ username: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const adminLogin = useAdminLogin();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    adminLogin.mutate(
      { data: { username: form.username, password: form.password } },
      {
        onSuccess: (data) => {
          localStorage.setItem("shakti-admin-token", data.token);
          setLocation("/admin/dashboard");
        },
        onError: () => {
          toast({ title: "Login failed", description: "Invalid username or password.", variant: "destructive" });
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="absolute inset-0">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary/8 rounded-full blur-3xl pointer-events-none" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-sm"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary/15 border border-primary/30 rounded-2xl flex items-center justify-center mx-auto mb-4 glow-box">
            <Lock className="w-7 h-7 text-primary" />
          </div>
          <h1 className="text-3xl font-black text-foreground">Admin Panel</h1>
          <p className="text-muted-foreground text-sm mt-1">Shakti Fast Food — Staff Access</p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 neon-border">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Username"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                required
                data-testid="input-username"
                className="w-full bg-background border border-input rounded-xl pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                data-testid="input-password"
                className="w-full bg-background border border-input rounded-xl pl-10 pr-10 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={adminLogin.isPending}
              data-testid="button-login"
              className="w-full bg-primary hover:bg-primary/90 disabled:opacity-60 text-primary-foreground font-bold py-3 rounded-xl transition-all glow-box"
            >
              {adminLogin.isPending ? "Signing in..." : "Sign In"}
            </motion.button>
          </form>

          <p className="text-center text-muted-foreground text-xs mt-4">
            Default: admin / shakti123
          </p>
        </div>

        <button
          onClick={() => setLocation("/")}
          data-testid="button-back-home"
          className="w-full text-center text-muted-foreground text-sm mt-4 hover:text-foreground transition-colors"
        >
          Back to Home
        </button>
      </motion.div>
    </div>
  );
}
