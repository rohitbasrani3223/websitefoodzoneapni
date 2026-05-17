import { useRef } from "react";
import { useLocation } from "wouter";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useInView,
} from "framer-motion";
import { ShoppingBag, MapPin, Phone, Train, ArrowDown, Zap } from "lucide-react";
import { useGetPopularItems } from "@workspace/api-client-react";
import shopPhoto from "@assets/2026-05-17-04-51-51-693_1778975204279.jpg";
import menuBoard from "@assets/file_000000002cf0720b95a55042a8678f86_1778975194898.png";

/* ─── helpers ─────────────────────────────────────────────── */

function useParallax(ref: React.RefObject<HTMLElement | null>, range: [string, string]) {
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  return useTransform(scrollYProgress, [0, 1], range);
}

function SplitReveal({ text, className }: { text: string; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const words = text.split(" ");
  return (
    <div ref={ref} className={className} aria-label={text}>
      {words.map((word, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 32, filter: "blur(8px)" }}
          animate={inView ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
          transition={{ duration: 0.55, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
          className="inline-block mr-[0.25em]"
        >
          {word}
        </motion.span>
      ))}
    </div>
  );
}

/* ─── sticky scroll chapter ──────────────────────────────── */

function ScrollChapters() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });
  const smooth = useSpring(scrollYProgress, { stiffness: 60, damping: 20 });

  const chapters = [
    {
      tag: "Morning ritual",
      headline: "Start your day\nwith Masala\nChai.",
      sub: "₹5 · Spiced to perfection",
      color: "from-amber-900/30",
      accent: "#f59e0b",
    },
    {
      tag: "Comfort food",
      headline: "Cheese Maggi\nthat hits\ndifferent.",
      sub: "₹70 · Creamy, loaded, fresh",
      color: "from-orange-900/30",
      accent: "#ff7a00",
    },
    {
      tag: "Street classic",
      headline: "Momos so\ngood you'll\nmiss your train.",
      sub: "₹60 / ₹110 · Steam or fry",
      color: "from-red-900/30",
      accent: "#ef4444",
    },
    {
      tag: "Quick bite",
      headline: "Sandwiches\nbuilt for\nhungry people.",
      sub: "₹40–₹120 · 8 varieties",
      color: "from-yellow-900/30",
      accent: "#eab308",
    },
  ];

  const total = chapters.length;

  return (
    /* outer container is 400vh tall — one chapter per viewport */
    <div ref={containerRef} style={{ height: `${total * 100}vh` }} className="relative">
      <div className="sticky top-0 h-screen overflow-hidden">
        {chapters.map((ch, i) => {
          const start = i / total;
          const end = (i + 1) / total;
          const opacity = useTransform(smooth, [start, start + 0.05, end - 0.08, end], [0, 1, 1, 0]);
          const y = useTransform(smooth, [start, end], ["30px", "-30px"]);

          return (
            <motion.div
              key={i}
              style={{ opacity }}
              className={`absolute inset-0 flex flex-col items-start justify-center px-8 md:px-20 bg-gradient-to-br ${ch.color} to-transparent`}
            >
              <motion.span
                style={{ y, color: ch.accent, borderColor: ch.accent + "44", background: ch.accent + "12" }}
                className="text-xs font-bold tracking-[0.25em] uppercase mb-4 px-3 py-1 rounded-full border"
              >
                {ch.tag}
              </motion.span>
              <motion.h2
                style={{ y }}
                className="text-5xl sm:text-7xl md:text-8xl font-black text-foreground leading-[1.05] tracking-tight mb-6 whitespace-pre-line"
              >
                {ch.headline}
              </motion.h2>
              <motion.p
                style={{ y, color: ch.accent }}
                className="text-lg md:text-2xl font-semibold"
              >
                {ch.sub}
              </motion.p>

              {/* chapter number */}
              <div className="absolute bottom-10 right-10 text-right">
                <span className="text-7xl font-black text-foreground/5">0{i + 1}</span>
              </div>
            </motion.div>
          );
        })}

        {/* background shimmer overlay */}
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />
      </div>
    </div>
  );
}

/* ─── main page ─────────────────────────────────────────── */

export default function Home() {
  const [, setLocation] = useLocation();
  const { data: popularItems = [] } = useGetPopularItems();

  /* hero parallax */
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: heroScroll } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroImgY = useTransform(heroScroll, [0, 1], ["0%", "30%"]);
  const heroOpacity = useTransform(heroScroll, [0, 0.6], [1, 0]);
  const heroScale = useTransform(heroScroll, [0, 1], [1, 1.08]);

  /* shop photo section */
  const shopRef = useRef<HTMLDivElement>(null);
  const shopImgY = useParallax(shopRef, ["-10%", "10%"]);

  return (
    <div className="bg-background text-foreground overflow-x-hidden">

      {/* ══ 1. HERO ══════════════════════════════════════════ */}
      <section
        ref={heroRef}
        className="relative h-screen flex flex-col items-center justify-center overflow-hidden"
      >
        {/* parallax bg */}
        <motion.div
          className="absolute inset-0"
          style={{ y: heroImgY, scale: heroScale }}
        >
          <img
            src={shopPhoto}
            alt="Shakti Fast Food stall"
            className="w-full h-full object-cover"
          />
        </motion.div>

        {/* layered darkening */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/50 to-background z-[1]" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/60 via-transparent to-background/60 z-[1]" />

        {/* glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-primary/10 rounded-full blur-[120px] z-[2] pointer-events-none" />

        <motion.div
          className="relative z-[3] text-center px-6 max-w-5xl mx-auto"
          style={{ opacity: heroOpacity }}
        >
          {/* badge */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="inline-flex items-center gap-2 bg-primary/10 border border-primary/30 text-primary px-4 py-1.5 rounded-full text-sm font-semibold mb-8 tracking-wide"
          >
            <Train className="w-3.5 h-3.5" />
            Railway Station Favorite — Sagar, MP
          </motion.div>

          {/* big title */}
          <div className="overflow-hidden">
            <motion.h1
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              className="text-7xl sm:text-8xl md:text-[10rem] font-black tracking-tighter leading-none text-foreground mb-2"
            >
              Shakti
            </motion.h1>
          </div>
          <div className="overflow-hidden">
            <motion.h1
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.9, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
              className="text-7xl sm:text-8xl md:text-[10rem] font-black tracking-tighter leading-none text-primary glow-text mb-8"
            >
              Fast Food
            </motion.h1>
          </div>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="text-muted-foreground text-lg md:text-xl tracking-widest uppercase font-medium mb-10"
          >
            Chai &nbsp;&middot;&nbsp; Maggi &nbsp;&middot;&nbsp; Momos &nbsp;&middot;&nbsp; Sandwiches
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.65 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 0 40px rgba(255,122,0,0.5)" }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setLocation("/menu")}
              className="flex items-center gap-2.5 bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-9 py-4 rounded-xl text-lg transition-all glow-box"
            >
              <ShoppingBag className="w-5 h-5" />
              Order Food Now
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => document.getElementById("location")?.scrollIntoView({ behavior: "smooth" })}
              className="flex items-center gap-2.5 bg-white/5 backdrop-blur-sm border border-white/15 hover:border-primary/50 text-foreground font-semibold px-9 py-4 rounded-xl text-lg transition-all"
            >
              <MapPin className="w-5 h-5 text-primary" />
              View Location
            </motion.button>
          </motion.div>
        </motion.div>

        {/* scroll cue */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 z-[3] flex flex-col items-center gap-2 text-muted-foreground/50"
        >
          <motion.div animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 1.8 }}>
            <ArrowDown className="w-5 h-5" />
          </motion.div>
          <span className="text-xs tracking-[0.2em] uppercase">Scroll</span>
        </motion.div>
      </section>

      {/* ══ 2. MANIFESTO ══════════════════════════════════════ */}
      <section className="py-28 px-6 md:px-12 max-w-6xl mx-auto">
        <SplitReveal
          text="Hot food. Fresh daily. Railway station ka sabse fast service."
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-foreground leading-tight"
        />
        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="mt-8 h-px bg-gradient-to-r from-primary via-primary/50 to-transparent origin-left"
        />
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-6 text-muted-foreground text-xl max-w-2xl leading-relaxed"
        >
          Sagar, Madhya Pradesh ka ek chhota sa stall — lekin yahan ka swad kabhi nahi bhoologe.
          Chai se shuru, momos pe khatam.
        </motion.p>
      </section>

      {/* ══ 3. SCROLL CHAPTERS (scrollytelling) ══════════════ */}
      <ScrollChapters />

      {/* ══ 4. SHOP PHOTO FULLBLEED ════════════════════════════ */}
      <section
        ref={shopRef}
        className="relative h-[80vh] overflow-hidden flex items-center justify-center"
      >
        <motion.img
          src={shopPhoto}
          alt="Shakti Fast Food"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ y: shopImgY }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-background/60" />

        <div className="relative z-10 text-center px-6">
          <SplitReveal
            text="Sagar ka apna stall."
            className="text-5xl md:text-7xl font-black text-foreground mb-4"
          />
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6 }}
            className="text-muted-foreground text-lg max-w-xl mx-auto"
          >
            Jab bhi bhookh lage — train pakadni ho ya bas time pass karna ho — Shakti hai yahan.
          </motion.p>
        </div>
      </section>

      {/* ══ 5. POPULAR ITEMS SHOWCASE ════════════════════════ */}
      {popularItems.length > 0 && (
        <section className="py-28 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-end justify-between mb-16">
              <div>
                <motion.p
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="text-primary text-xs font-bold tracking-[0.3em] uppercase mb-3"
                >
                  Most Ordered
                </motion.p>
                <SplitReveal
                  text="Log kya khate hain?"
                  className="text-4xl md:text-6xl font-black text-foreground"
                />
              </div>
              <motion.button
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                onClick={() => setLocation("/menu")}
                className="hidden sm:inline-flex items-center gap-2 text-primary font-bold border border-primary/40 px-5 py-2.5 rounded-xl hover:bg-primary/10 transition-all text-sm shrink-0"
              >
                Full Menu
              </motion.button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {popularItems.slice(0, 8).map((dish, i) => (
                <motion.div
                  key={dish.id}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.55, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] }}
                  whileHover={{ y: -6, scale: 1.02 }}
                  onClick={() => setLocation("/menu")}
                  className="group relative bg-card border border-border rounded-2xl p-6 cursor-pointer overflow-hidden transition-all duration-300 hover:border-primary/50"
                >
                  {/* hover glow bg */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-primary/0 group-hover:from-primary/5 group-hover:to-primary/0 transition-all duration-500 rounded-2xl" />

                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <span className={`w-3.5 h-3.5 rounded-full border-2 ${dish.isVeg ? "border-green-500 bg-green-500/20" : "border-red-500 bg-red-500/20"}`} />
                      {dish.isFeatured && (
                        <span className="text-[10px] font-bold tracking-widest uppercase text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                          Hot
                        </span>
                      )}
                    </div>
                    <h3 className="font-black text-foreground text-base leading-snug mb-1.5 group-hover:text-primary transition-colors">
                      {dish.name}
                    </h3>
                    {dish.description && (
                      <p className="text-muted-foreground text-xs line-clamp-2 mb-4 leading-relaxed">
                        {dish.description}
                      </p>
                    )}
                    <div className="flex items-baseline gap-2">
                      <span className="text-primary font-black text-xl">₹{dish.price}</span>
                      {dish.halfPrice && (
                        <span className="text-muted-foreground text-xs">/ ₹{dish.halfPrice} half</span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mt-10 sm:hidden text-center"
            >
              <button
                onClick={() => setLocation("/menu")}
                className="inline-flex items-center gap-2 text-primary font-bold border border-primary/40 px-6 py-3 rounded-xl hover:bg-primary/10 transition-all"
              >
                Full Menu
              </button>
            </motion.div>
          </div>
        </section>
      )}

      {/* ══ 6. MENU BOARD ════════════════════════════════════ */}
      <section className="py-10 px-6 md:px-12">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="relative order-2 md:order-1"
          >
            <div className="absolute -inset-6 bg-primary/5 rounded-3xl blur-3xl" />
            <motion.img
              src={menuBoard}
              alt="Shakti Fast Food menu board"
              className="relative rounded-2xl w-full object-cover shadow-2xl neon-border"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.4 }}
            />
            {/* overlay caption */}
            <div className="absolute bottom-4 left-4 right-4 bg-background/80 backdrop-blur-sm rounded-xl px-4 py-3 border border-border">
              <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">Asli menu board</p>
              <p className="text-sm text-foreground font-bold">Shakti Fast Food, Sagar</p>
            </div>
          </motion.div>

          <div className="order-1 md:order-2">
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-primary text-xs font-bold tracking-[0.3em] uppercase mb-4"
            >
              Our Story
            </motion.p>
            <SplitReveal
              text="Taste jo rail ki speed se bhi fast hai."
              className="text-4xl md:text-5xl font-black text-foreground leading-tight mb-6"
            />
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="text-muted-foreground leading-relaxed text-lg mb-8"
            >
              Railway station ke paas, Sagar mein — yeh chhota sa stall rozana hazaron logon ka
              pet bharta hai. Chai ho ya Maggi, sandwich ho ya momos — sab taza, sab jaldi.
            </motion.p>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: "2–5 min", label: "Service Time" },
                { value: "1000+", label: "Customers" },
                { value: "31", label: "Menu Items" },
              ].map(({ value, label }, i) => (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 + i * 0.1 }}
                  className="text-center p-4 bg-card border border-border rounded-xl"
                >
                  <p className="text-primary font-black text-xl">{value}</p>
                  <p className="text-muted-foreground text-xs mt-1">{label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══ 7. BIG CTA ════════════════════════════════════════ */}
      <section className="py-32 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-transparent to-primary/5 pointer-events-none" />
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-primary/8 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative max-w-4xl mx-auto text-center">
          <SplitReveal
            text="Bhookh lagi? Order karo."
            className="text-6xl sm:text-7xl md:text-8xl font-black text-foreground leading-tight mb-4"
          />
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="text-muted-foreground text-lg mb-10"
          >
            Browse karo, cart mein daalo, aur 2–5 minutes mein fresh food ready.
          </motion.p>
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6, type: "spring", stiffness: 200 }}
            whileHover={{ scale: 1.07, boxShadow: "0 0 60px rgba(255,122,0,0.45)" }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setLocation("/menu")}
            className="bg-primary text-primary-foreground font-black px-14 py-5 rounded-2xl text-xl glow-box inline-flex items-center gap-3"
          >
            <Zap className="w-6 h-6" />
            Order Now
          </motion.button>
        </div>
      </section>

      {/* ══ 8. LOCATION ═══════════════════════════════════════ */}
      <section id="location" className="py-20 px-6 border-t border-border">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-primary text-xs font-bold tracking-[0.3em] uppercase mb-3">Find Us</p>
            <h2 className="text-4xl font-black text-foreground mb-3">Station ke bilkul paas</h2>
            <p className="text-muted-foreground mb-8 text-lg">
              Near the railway station platform, Sagar, Madhya Pradesh.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="tel:+918959551315"
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-bold px-7 py-3.5 rounded-xl hover:bg-primary/90 transition-colors glow-box"
              >
                <Phone className="w-4 h-4" />
                Call: 8959551315
              </a>
              <a
                href="https://maps.google.com/?q=Shakti+Fast+Food+Sagar+Railway+Station"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-card border border-border text-foreground font-semibold px-7 py-3.5 rounded-xl hover:border-primary/50 transition-colors"
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
        <p className="text-muted-foreground text-sm">Chai &amp; Maggi Point — Near Railway Station, Sagar, MP</p>
        <p className="text-muted-foreground/50 text-xs mt-3">
          &copy; {new Date().getFullYear()} Shakti Fast Food. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
