import { useRef, useState, useEffect } from "react";
import { useLocation } from "wouter";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useInView,
  useMotionValue,
  MotionValue,
  AnimatePresence,
} from "framer-motion";
import { ShoppingBag, MapPin, Phone, Train, ArrowDown, Zap, Navigation, X, UserPlus, LogIn, User, LogOut, ChevronDown } from "lucide-react";
import { useGetPopularItems } from "@workspace/api-client-react";
const shopPhoto = "/photos/shop-night.png";
const menuBoard = "/photos/chai-snacks.png";

/* ── Word-by-word blur-in reveal ───────────────────────── */
function SplitReveal({ text, className }: { text: string; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });
  return (
    <div ref={ref} className={className} aria-label={text}>
      {text.split(" ").map((word, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 28, filter: "blur(10px)" }}
          animate={inView ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
          transition={{ duration: 0.6, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] }}
          className="inline-block mr-[0.25em]"
        >
          {word}
        </motion.span>
      ))}
    </div>
  );
}

/* ── 3-D tilt card (hover micro-interaction) ───────────── */
function TiltCard({
  children,
  className,
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rotX = useSpring(useTransform(my, [-60, 60], [10, -10]), { stiffness: 400, damping: 30 });
  const rotY = useSpring(useTransform(mx, [-60, 60], [-10, 10]), { stiffness: 400, damping: 30 });

  function onMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!ref.current) return;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    mx.set(e.clientX - left - width / 2);
    my.set(e.clientY - top - height / 2);
  }
  function onMouseLeave() { mx.set(0); my.set(0); }

  return (
    <motion.div
      ref={ref}
      style={{ rotateX: rotX, rotateY: rotY, transformPerspective: 900 }}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
      whileTap={{ scale: 0.97 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
const CHAPTERS = [
  { tag: "Morning Ritual",  headline: "Start your day\nwith Masala Chai.",       sub: "₹15 · Spiced to perfection",  watermark: "CHAI",     accent: "#f59e0b", orb: "#78350f", image: "/photos/1.png",             dir: "left"  },
  { tag: "Comfort Food",    headline: "Cheese Maggi\nthat hits different.",       sub: "₹70 · Creamy, loaded, fresh", watermark: "MAGGI",    accent: "#ff7a00", orb: "#7c2d12", image: "/photos/maggi.png",         dir: "right" },
  { tag: "Street Classic",  headline: "Momos so good\nyou will miss your train.",  sub: "₹60/₹110 · Steam or fried",  watermark: "MOMOS",    accent: "#ef4444", orb: "#450a0a", image: "/photos/momos.png",         dir: "left"  },
  { tag: "Quick Bite",      headline: "Sandwiches built\nfor hungry people.",    sub: "₹40–₹120 · 8 varieties",     watermark: "SANDWICH", accent: "#eab308", orb: "#422006", image: "/photos/sandwich-fries.png", dir: "right" },
] as const;
type Chapter = typeof CHAPTERS[number];

function OneChapter({ ch, idx }: { ch: Chapter; idx: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setEntered(true); },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const imgY = useTransform(scrollYProgress, [0, 1], ["-6%", "6%"]);

  return (
    <div ref={ref} className="relative" style={{ height: "100vh" }}>
      <div className="sticky top-0 h-screen overflow-hidden bg-background flex items-center">
        {/* Watermark */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
          <span className="text-[22vw] font-black leading-none tracking-tighter" style={{ color: ch.accent, opacity: 0.06 }}>{ch.watermark}</span>
        </div>
        {/* Orb */}
        <div className={`absolute top-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-[130px] pointer-events-none ${ch.dir === "left" ? "-right-40" : "-left-40"}`} style={{ background: ch.orb, opacity: 0.35 }} />

        {/* Food photo — parallax */}
        <motion.div
          className={`absolute top-1/2 -translate-y-1/2 w-[50vw] max-w-[420px] pointer-events-none ${ch.dir === "left" ? "right-4 md:right-16" : "left-4 md:left-16"}`}
          style={{ y: imgY }}
          initial={{ x: ch.dir === "left" ? 120 : -120, opacity: 0 }}
          animate={entered ? { x: 0, opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        >
          <img src={ch.image} alt={ch.watermark} className="w-full h-auto object-contain drop-shadow-2xl" />
        </motion.div>

        {/* Text */}
        <motion.div
          className={`relative z-10 px-8 md:px-20 max-w-xl ${ch.dir === "right" ? "ml-auto" : ""}`}
          initial={{ x: ch.dir === "left" ? -80 : 80, opacity: 0 }}
          animate={entered ? { x: 0, opacity: 1 } : {}}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.span
            className="inline-flex items-center text-[11px] font-black tracking-[0.25em] uppercase mb-5 px-3 py-1.5 rounded-full border"
            style={{ color: ch.accent, borderColor: ch.accent + "44", background: ch.accent + "18" }}
          >
            {ch.tag}
          </motion.span>
          <h2 className="text-[12vw] sm:text-[9vw] md:text-[7vw] font-black text-foreground leading-[1.05] tracking-tight mb-6 whitespace-pre-line">
            {ch.headline}
          </h2>
          <div className="flex items-center gap-4 flex-wrap">
            <span className="text-lg md:text-2xl font-bold" style={{ color: ch.accent }}>{ch.sub}</span>
            <motion.span
              animate={{ rotate: [-3, 3, -3] }}
              transition={{ repeat: Infinity, duration: 3 }}
              className="px-3 py-1 rounded-full text-xs font-black cursor-pointer"
              style={{ background: ch.accent + "22", color: ch.accent, border: `1px solid ${ch.accent}44` }}
            >
              Order now
            </motion.span>
          </div>
        </motion.div>

        {/* Chapter number watermark */}
        <div className="absolute bottom-6 right-6 pointer-events-none">
          <span className="text-[7rem] font-black leading-none" style={{ color: ch.accent, opacity: 0.04 }}>0{idx + 1}</span>
        </div>

        {/* Floating dots */}
        {[...Array(3)].map((_, d) => (
          <motion.div
            key={d}
            className="absolute rounded-full pointer-events-none"
            style={{ width: 8 + d * 5, height: 8 + d * 5, background: ch.accent, opacity: 0.1 + d * 0.05, left: `${20 + d * 22}%`, top: `${25 + d * 20}%` }}
            animate={{ y: [0, -14, 0] }}
            transition={{ repeat: Infinity, duration: 4 + d, delay: d * 0.6, ease: "easeInOut" }}
          />
        ))}
      </div>
    </div>
  );
}

function ScrollChapters() {
  return (
    <div>
      {CHAPTERS.map((ch, i) => (
        <OneChapter key={ch.watermark} ch={ch} idx={i} />
      ))}
    </div>
  );
}


/* ── Horizontal food ticker ────────────────────────────── */
const TICKER_ITEMS = [
  "Masala Chai ₹5", "Cheese Maggi ₹70", "Steam Momos ₹60", "Club Sandwich ₹100",
  "Peri Peri Fries ₹70", "Sweet Corn ₹50", "Punjabi Tadka Maggi ₹100", "Veg Momos ₹60",
  "Finger Chips ₹50", "Special Kadak Chai ₹10", "Cheese Corn Maggi ₹80", "Patties ₹20",
];

function FoodTicker() {
  return (
    <div className="overflow-hidden border-y border-border py-3 bg-card/30">
      <motion.div
        className="flex gap-8 whitespace-nowrap"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
      >
        {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
          <span key={i} className="flex items-center gap-2 text-sm font-semibold text-muted-foreground shrink-0">
            <span className="w-1 h-1 rounded-full bg-primary inline-block" />
            {item}
          </span>
        ))}
      </motion.div>
    </div>
  );
}

/* ── Parallax helper ────────────────────────────────────── */
function useParallax(ref: React.RefObject<HTMLElement | null>, range: [string, string]) {
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  return useTransform(scrollYProgress, [0, 1], range);
}

/* ═══════════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════════ */
export default function Home() {
  const [, setLocation] = useLocation();
  const { data: popularItems = [] } = useGetPopularItems();
  const [loggedInUser, setLoggedInUser] = useState<{ name: string; email: string } | null>(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  useEffect(() => {
    const userStr = localStorage.getItem("customer-user");
    if (userStr) {
      try { setLoggedInUser(JSON.parse(userStr)); } catch { /* ignore */ }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("customer-token");
    localStorage.removeItem("customer-user");
    setLoggedInUser(null);
    setShowProfileMenu(false);
  };

  /* hero parallax */
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: heroScroll } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroImgY = useTransform(heroScroll, [0, 1], ["0%", "28%"]);
  const heroOpacity = useTransform(heroScroll, [0, 0.65], [1, 0]);
  const heroScale = useTransform(heroScroll, [0, 1], [1, 1.1]);

  /* shop photo parallax */
  const shopRef = useRef<HTMLDivElement>(null);
  const shopY = useParallax(shopRef, ["-8%", "8%"]);

  /* floating hero food pills */
  const PILLS = [
    { label: "Masala Chai ₹5", x: "12%", delay: 0 },
    { label: "Cheese Maggi ₹70", x: "72%", delay: 0.4 },
    { label: "Momos ₹60", x: "35%", delay: 0.8 },
    { label: "Sandwich ₹80", x: "58%", delay: 1.1 },
    { label: "Fries ₹50", x: "20%", delay: 1.5 },
  ];

  return (
    <div className="bg-background text-foreground overflow-x-hidden">

      {/* ══ 1. HERO ══════════════════════════════════════════ */}
      <section
        ref={heroRef}
        className="relative h-screen flex flex-col items-center justify-center overflow-hidden"
      >
        {/* TOP NAVBAR (Login / Sign Up / Profile) */}
        <div className="absolute top-0 left-0 right-0 z-50 flex items-center justify-end p-6 sm:px-10 pointer-events-auto">
          {loggedInUser ? (
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 bg-background/30 backdrop-blur-md border border-border/50 rounded-full px-3 py-2 hover:border-primary/50 transition-all"
              >
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-black text-sm">
                  {loggedInUser.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-semibold text-foreground hidden sm:inline">{loggedInUser.name}</span>
                <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
              </button>

              {showProfileMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className="absolute right-0 top-full mt-2 w-56 bg-card/95 backdrop-blur-xl border border-border rounded-2xl shadow-2xl overflow-hidden"
                >
                  <div className="px-4 py-3 border-b border-border">
                    <p className="text-sm font-bold text-foreground">{loggedInUser.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{loggedInUser.email}</p>
                  </div>
                  <div className="p-1">
                    <button
                      onClick={() => { setShowProfileMenu(false); setLocation("/track"); }}
                      className="flex items-center gap-2 w-full px-3 py-2.5 text-sm text-foreground hover:bg-primary/10 rounded-xl transition-colors"
                    >
                      <Navigation className="w-4 h-4 text-primary" />
                      My Orders
                    </button>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 w-full px-3 py-2.5 text-sm text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Log Out
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 sm:gap-4 bg-background/30 backdrop-blur-md border border-border/50 rounded-full px-2 py-2">
              <button
                onClick={() => setLocation("/login")}
                className="text-sm font-bold text-foreground hover:text-primary px-4 py-2 transition-colors"
              >
                Log In
              </button>
              <button
                onClick={() => setLocation("/signup")}
                className="text-sm font-bold bg-primary text-primary-foreground px-5 py-2.5 rounded-full hover:bg-primary/90 transition-all shadow-[0_0_15px_rgba(255,87,34,0.4)]"
              >
                Sign Up
              </button>
            </div>
          )}
        </div>
        {/* Parallax bg */}
        <motion.div className="absolute inset-0" style={{ y: heroImgY, scale: heroScale }}>
          <img src={shopPhoto} alt="Shakti Fast Food" className="w-full h-full object-cover" />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-b from-background/75 via-background/50 to-background z-[1]" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/60 via-transparent to-background/60 z-[1]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-primary/10 rounded-full blur-[120px] z-[2] pointer-events-none" />

        {/* Floating food pills */}
        {PILLS.map((pill, i) => (
          <motion.div
            key={i}
            className="absolute z-[3] pointer-events-none"
            style={{ left: pill.x, bottom: "15%" }}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: [0, 0.7, 0.7, 0], y: [40, -60, -120, -200] }}
            transition={{ duration: 5, delay: pill.delay + 1, repeat: Infinity, repeatDelay: 3, ease: "easeOut" }}
          >
            <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-primary/15 border border-primary/30 text-primary backdrop-blur-sm whitespace-nowrap">
              {pill.label}
            </span>
          </motion.div>
        ))}

        {/* Main content */}
        <motion.div
          className="relative z-[4] text-center px-6 max-w-5xl mx-auto"
          style={{ opacity: heroOpacity }}
        >
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="inline-flex items-center gap-2 bg-primary/10 border border-primary/30 text-primary px-4 py-1.5 rounded-full text-sm font-semibold mb-8 tracking-wide"
          >
            <Train className="w-3.5 h-3.5" />
            Railway Station Favorite — Sagar, MP
          </motion.div>

          <div className="overflow-hidden flex justify-center mb-6">
            <motion.img
              initial={{ y: 60, opacity: 0, scale: 0.8, rotate: -10 }}
              animate={{ y: 0, opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              src="/logo.png"
              alt="Shakti Fast Food Logo"
              className="w-32 h-32 sm:w-48 sm:h-48 md:w-56 md:h-56 object-contain drop-shadow-[0_0_20px_rgba(255,122,0,0.3)]"
            />
          </div>

          <div className="overflow-hidden">
            <motion.h1
              initial={{ y: "110%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.95, ease: [0.16, 1, 0.3, 1] }}
              className="text-7xl sm:text-8xl md:text-[10rem] font-black tracking-tighter leading-none text-foreground mb-1"
            >
              Shakti
            </motion.h1>
          </div>
          <div className="overflow-hidden">
            <motion.h1
              initial={{ y: "110%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.95, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="text-7xl sm:text-8xl md:text-[10rem] font-black tracking-tighter leading-none text-primary glow-text mb-8"
            >
              Fast Food
            </motion.h1>
          </div>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="text-muted-foreground text-lg md:text-xl tracking-[0.2em] uppercase font-medium mb-10"
          >
            Chai &nbsp;&middot;&nbsp; Maggi &nbsp;&middot;&nbsp; Momos &nbsp;&middot;&nbsp; Sandwiches
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mb-8 inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-1.5"
          >
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm font-semibold text-white/90">
              <span className="text-green-400 font-bold">42+</span> orders placed today
            </span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.65 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <motion.button
              whileHover={{ scale: 1.06, boxShadow: "0 0 45px rgba(255,122,0,0.5)" }}
              whileTap={{ scale: 0.96 }}
              onClick={() => setLocation("/menu")}
              className="flex items-center gap-2.5 bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-9 py-4 rounded-xl text-lg transition-all glow-box"
            >
              <ShoppingBag className="w-5 h-5" />
              Order Food Now
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setLocation("/track")}
              className="flex items-center gap-2.5 bg-white/5 backdrop-blur-sm border border-white/15 hover:border-primary/50 text-foreground font-semibold px-9 py-4 rounded-xl text-lg transition-all"
            >
              <Navigation className="w-5 h-5 text-primary" />
              Track Order
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => document.getElementById("location")?.scrollIntoView({ behavior: "smooth" })}
              className="flex items-center gap-2.5 bg-white/5 backdrop-blur-sm border border-white/15 hover:border-primary/50 text-foreground font-semibold px-7 py-4 rounded-xl text-lg transition-all"
            >
              <MapPin className="w-5 h-5 text-primary" />
              Location
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Scroll cue */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 z-[4] flex flex-col items-center gap-2 text-muted-foreground/50"
        >
          <motion.div animate={{ y: [0, 9, 0] }} transition={{ repeat: Infinity, duration: 1.8 }}>
            <ArrowDown className="w-5 h-5" />
          </motion.div>
          <span className="text-[10px] tracking-[0.25em] uppercase">Scroll</span>
        </motion.div>
      </section>

      {/* ══ 2. TICKER ══════════════════════════════════════════ */}
      <FoodTicker />

      {/* ══ 3. MANIFESTO ═══════════════════════════════════════ */}
      <section className="py-28 px-6 md:px-12 max-w-6xl mx-auto">
        <SplitReveal
          text="Hot food. Fresh daily. Railway station ka sabse fast service."
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-foreground leading-tight"
        />
        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
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

      {/* ══ 4. SCROLL CHAPTERS (scrollytelling) ════════════════ */}
      <ScrollChapters />

      {/* ══ 5. SHOP PHOTO FULLBLEED ════════════════════════════ */}
      <section
        ref={shopRef}
        className="relative h-[80vh] overflow-hidden flex items-center justify-center"
      >
        <motion.img
          src={shopPhoto}
          alt="Shakti Fast Food"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ y: shopY }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-background/60" />
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

      {/* ══ 6. POPULAR ITEMS — 3-D tilt cards ══════════════════ */}
      {popularItems.length > 0 && (
        <section className="py-28 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-end justify-between mb-16">
              <div>
                <motion.p
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="text-primary text-[11px] font-black tracking-[0.3em] uppercase mb-3"
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
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setLocation("/menu")}
                className="hidden sm:inline-flex items-center gap-2 text-primary font-bold border border-primary/40 px-5 py-2.5 rounded-xl hover:bg-primary/10 transition-all text-sm shrink-0"
              >
                Full Menu
              </motion.button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {Array.isArray(popularItems) && popularItems.slice(0, 8).map((dish, i) => (
                <motion.div
                  key={dish.id}
                  initial={{ opacity: 0, y: 50, filter: "blur(8px)" }}
                  whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  viewport={{ once: true, amount: 0.15 }}
                  transition={{ duration: 0.55, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] }}
                >
                  <TiltCard
                    onClick={() => setLocation("/menu")}
                    className="group relative bg-card border border-border rounded-2xl p-6 cursor-pointer overflow-hidden h-full hover:border-primary/50 transition-colors duration-300"
                  >
                    {/* Hover glow */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-primary/0 group-hover:from-primary/8 transition-all duration-500 rounded-2xl pointer-events-none" />

                    <div className="relative z-10 h-full flex flex-col">
                      <div className="flex items-center justify-between mb-4">
                        <span
                          className={`w-3.5 h-3.5 rounded-full border-2 ${dish.isVeg ? "border-green-500 bg-green-500/20" : "border-red-500 bg-red-500/20"
                            }`}
                        />
                        {dish.isFeatured && (
                          <motion.span
                            animate={{ scale: [1, 1.08, 1] }}
                            transition={{ repeat: Infinity, duration: 2.5 }}
                            className="text-[10px] font-black tracking-widest uppercase text-primary bg-primary/10 px-2 py-0.5 rounded-full"
                          >
                            Hot
                          </motion.span>
                        )}
                      </div>

                      <h3 className="font-black text-foreground text-base leading-snug mb-2 group-hover:text-primary transition-colors duration-200">
                        {dish.name}
                      </h3>
                      {dish.description && (
                        <p className="text-muted-foreground text-xs line-clamp-2 mb-4 leading-relaxed flex-1">
                          {dish.description}
                        </p>
                      )}

                      <div className="flex items-baseline gap-2 mt-auto">
                        <motion.span
                          className="text-primary font-black text-xl"
                          whileHover={{ scale: 1.1 }}
                        >
                          ₹{dish.price}
                        </motion.span>
                        {dish.halfPrice && (
                          <span className="text-muted-foreground text-xs">/ ₹{dish.halfPrice} half</span>
                        )}
                      </div>

                      {/* Bottom shimmer line on hover */}
                      <motion.div
                        className="absolute bottom-0 left-0 h-0.5 bg-primary rounded-b-2xl"
                        initial={{ width: "0%" }}
                        whileHover={{ width: "100%" }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  </TiltCard>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="mt-10 sm:hidden text-center"
            >
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => setLocation("/menu")}
                className="inline-flex items-center gap-2 text-primary font-bold border border-primary/40 px-6 py-3 rounded-xl hover:bg-primary/10 transition-all"
              >
                Full Menu
              </motion.button>
            </motion.div>
          </div>
        </section>
      )}

      {/* ══ 7. MENU BOARD ══════════════════════════════════════ */}
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
              className="text-primary text-[11px] font-black tracking-[0.3em] uppercase mb-4"
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
                  whileHover={{ y: -3, borderColor: "rgba(255,122,0,0.4)" }}
                  className="text-center p-4 bg-card border border-border rounded-xl cursor-default transition-colors"
                >
                  <p className="text-primary font-black text-xl">{value}</p>
                  <p className="text-muted-foreground text-xs mt-1">{label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══ 8. CTA ═════════════════════════════════════════════ */}
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
            Browse karo, cart mein daalo, 2–5 minutes mein fresh food ready.
          </motion.p>
          <motion.button
            initial={{ opacity: 0, scale: 0.88 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6, type: "spring", stiffness: 220, damping: 18 }}
            whileHover={{ scale: 1.08, boxShadow: "0 0 70px rgba(255,122,0,0.5)" }}
            whileTap={{ scale: 0.96 }}
            onClick={() => setLocation("/menu")}
            className="bg-primary text-primary-foreground font-black px-14 py-5 rounded-2xl text-xl glow-box inline-flex items-center gap-3"
          >
            <Zap className="w-6 h-6" />
            Order Now
          </motion.button>
        </div>
      </section>

      {/* ══ 9. LOCATION ════════════════════════════════════════ */}
      <section id="location" className="py-20 px-6 border-t border-border">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-primary text-[11px] font-black tracking-[0.3em] uppercase mb-3">Find Us</p>
            <h2 className="text-4xl font-black text-foreground mb-3">Station ke bilkul paas</h2>
            <p className="text-muted-foreground mb-8 text-lg">
              Near the railway station platform, Sagar, Madhya Pradesh.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.a
                href="tel:+918959551315"
                whileHover={{ scale: 1.04, boxShadow: "0 0 30px rgba(255,122,0,0.3)" }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-bold px-7 py-3.5 rounded-xl hover:bg-primary/90 transition-colors glow-box"
              >
                <Phone className="w-4 h-4" />
                Call: 8959551315
              </motion.a>
              <motion.a
                href="https://maps.google.com/?q=Shakti+Fast+Food+Sagar+Railway+Station"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-2 bg-card border border-border text-foreground font-semibold px-7 py-3.5 rounded-xl hover:border-primary/50 transition-colors"
              >
                <Navigation className="w-4 h-4 text-primary" />
                Get Directions
              </motion.a>
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
