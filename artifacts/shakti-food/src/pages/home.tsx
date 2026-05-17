import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { ShoppingBag, MapPin, Phone, Star, Train, Zap, Clock, ChevronRight } from "lucide-react";
import { useGetPopularItems } from "@workspace/api-client-react";
import shopPhoto from "@assets/2026-05-17-04-51-51-693_1778975204279.jpg";
import menuBoard from "@assets/file_000000002cf0720b95a55042a8678f86_1778975194898.png";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export default function Home() {
  const [, setLocation] = useLocation();
  const { data: popularItems = [] } = useGetPopularItems();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src={shopPhoto} alt="Shakti Fast Food" className="w-full h-full object-cover opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/40 to-background" />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-background" />
        </div>

        {/* Glow orbs */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-accent/8 rounded-full blur-3xl pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative z-10 text-center px-6 max-w-4xl mx-auto"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 bg-primary/10 border border-primary/30 text-primary px-4 py-1.5 rounded-full text-sm font-medium mb-6"
          >
            <Train className="w-3.5 h-3.5" />
            Railway Station Favorite — Sagar, MP
          </motion.div>

          <h1 className="text-6xl md:text-8xl font-black tracking-tight text-foreground mb-4 glow-text">
            Shakti<br />
            <span className="text-primary">Fast Food</span>
          </h1>

          <p className="text-muted-foreground text-lg md:text-xl mb-3 font-medium tracking-wide">
            Fresh Taste &middot; Quick Service &middot; Railway Station Favorite
          </p>
          <p className="text-muted-foreground/80 max-w-2xl mx-auto mb-10 leading-relaxed">
            Located near the railway station platform in Sagar. From steaming momos and creamy coffee to crispy sandwiches — fresh taste, speedy service, every time.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setLocation("/menu")}
              data-testid="button-order-food"
              className="flex items-center gap-2.5 bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-8 py-4 rounded-xl text-lg transition-all duration-200 glow-box"
            >
              <ShoppingBag className="w-5 h-5" />
              Order Food Now
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => document.getElementById("location")?.scrollIntoView({ behavior: "smooth" })}
              data-testid="button-view-location"
              className="flex items-center gap-2.5 bg-card border border-border hover:border-primary/50 text-foreground font-semibold px-8 py-4 rounded-xl text-lg transition-all duration-200"
            >
              <MapPin className="w-5 h-5 text-primary" />
              View Location
            </motion.button>
          </div>
        </motion.div>

        {/* Scroll cue */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-muted-foreground/50 text-xs flex flex-col items-center gap-1"
        >
          <div className="w-px h-8 bg-gradient-to-b from-transparent to-primary/40" />
          scroll
        </motion.div>
      </section>

      {/* Popular Items */}
      {popularItems.length > 0 && (
        <section className="py-20 px-6">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <p className="text-primary text-sm font-semibold tracking-widest uppercase mb-2">Most Loved</p>
              <h2 className="text-4xl md:text-5xl font-black text-foreground">Popular Right Now</h2>
            </motion.div>

            <motion.div
              variants={container}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
            >
              {popularItems.slice(0, 8).map((dish) => (
                <motion.div
                  key={dish.id}
                  variants={item}
                  whileHover={{ y: -4, scale: 1.02 }}
                  onClick={() => setLocation("/menu")}
                  data-testid={`card-popular-${dish.id}`}
                  className="bg-card border border-card-border rounded-2xl p-5 cursor-pointer hover:border-primary/40 hover:glow-box transition-all duration-300"
                >
                  <div className="flex items-start justify-between mb-3">
                    <span className={`w-4 h-4 rounded-full border-2 flex-shrink-0 mt-0.5 ${dish.isVeg ? "border-green-500 bg-green-500/20" : "border-red-500 bg-red-500/20"}`} />
                    {dish.isFeatured && (
                      <span className="bg-primary/15 text-primary text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Star className="w-2.5 h-2.5 fill-primary" /> Hot
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-foreground text-sm leading-tight mb-1">{dish.name}</h3>
                  {dish.description && (
                    <p className="text-muted-foreground text-xs line-clamp-1 mb-2">{dish.description}</p>
                  )}
                  <p className="text-primary font-black text-base">
                    ₹{dish.price}
                    {dish.halfPrice && <span className="text-muted-foreground text-xs font-normal ml-1">/ ₹{dish.halfPrice} half</span>}
                  </p>
                </motion.div>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-center mt-8"
            >
              <button
                onClick={() => setLocation("/menu")}
                data-testid="button-view-full-menu"
                className="inline-flex items-center gap-2 text-primary font-semibold hover:gap-3 transition-all duration-200"
              >
                View Full Menu <ChevronRight className="w-4 h-4" />
              </button>
            </motion.div>
          </div>
        </section>
      )}

      {/* Cafe Experience */}
      <section className="py-20 px-6 bg-card/30">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-primary text-sm font-semibold tracking-widest uppercase mb-3">Our Story</p>
            <h2 className="text-4xl md:text-5xl font-black text-foreground mb-6 leading-tight">
              Sagar's Favorite<br />Quick Bite Stop
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-6 text-lg">
              Whether you're catching a train or hanging out with friends, Shakti Fast Food brings cozy cafe vibes with lightning-fast service. Every bite is freshly made, every order is served with warmth.
            </p>
            <div className="grid grid-cols-3 gap-4">
              {[
                { icon: Clock, label: "Fast Service", value: "2-5 min" },
                { icon: Star, label: "Happy Customers", value: "1000+" },
                { icon: Zap, label: "Fresh Items", value: "Daily" },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="text-center p-3 bg-card border border-border rounded-xl">
                  <Icon className="w-5 h-5 text-primary mx-auto mb-1" />
                  <p className="text-foreground font-bold text-sm">{value}</p>
                  <p className="text-muted-foreground text-xs">{label}</p>
                </div>
              ))}
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="absolute -inset-4 bg-primary/5 rounded-3xl blur-2xl" />
            <img
              src={menuBoard}
              alt="Shakti Fast Food Menu"
              className="relative rounded-2xl w-full object-cover shadow-2xl neon-border"
            />
          </motion.div>
        </div>
      </section>

      {/* Quick Order CTA */}
      <section className="py-24 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5" />
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-primary/8 rounded-full blur-3xl" />
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative text-center max-w-2xl mx-auto"
        >
          <h2 className="text-5xl md:text-6xl font-black text-foreground mb-4">
            Hungry? <span className="text-primary glow-text">Order Now.</span>
          </h2>
          <p className="text-muted-foreground mb-8 text-lg">Skip the wait. Browse the menu, add to cart, and we'll have it ready in minutes.</p>
          <motion.button
            whileHover={{ scale: 1.06, boxShadow: "0 0 40px rgba(249,115,22,0.4)" }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setLocation("/menu")}
            data-testid="button-quick-order"
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-black px-12 py-5 rounded-2xl text-xl transition-all duration-200 glow-box inline-flex items-center gap-3"
          >
            <Zap className="w-6 h-6" />
            Order Food Now
          </motion.button>
        </motion.div>
      </section>

      {/* Location */}
      <section id="location" className="py-20 px-6 bg-card/30">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-primary text-sm font-semibold tracking-widest uppercase mb-2">Find Us</p>
            <h2 className="text-4xl font-black text-foreground mb-4">Right Near the Station</h2>
            <p className="text-muted-foreground mb-8">Located conveniently near the railway station platform in Sagar, Madhya Pradesh.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="tel:+918959551315"
                data-testid="link-call-us"
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-bold px-6 py-3 rounded-xl hover:bg-primary/90 transition-colors"
              >
                <Phone className="w-4 h-4" />
                Call: 8959551315
              </a>
              <a
                href="https://maps.google.com/?q=Shakti+Fast+Food+Sagar+Railway+Station"
                target="_blank"
                rel="noopener noreferrer"
                data-testid="link-get-directions"
                className="inline-flex items-center gap-2 bg-card border border-border text-foreground font-semibold px-6 py-3 rounded-xl hover:border-primary/50 transition-colors"
              >
                <MapPin className="w-4 h-4 text-primary" />
                Get Directions
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-6 text-center">
        <p className="text-foreground font-black text-xl mb-1">Shakti Fast Food</p>
        <p className="text-muted-foreground text-sm">Chai & Maggi Point — Near Railway Station, Sagar, MP</p>
        <p className="text-muted-foreground/60 text-xs mt-3">&copy; {new Date().getFullYear()} Shakti Fast Food. All rights reserved.</p>
      </footer>
    </div>
  );
}
