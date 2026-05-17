import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ShoppingBag, Plus, Minus, X, Star, Filter } from "lucide-react";
import { useListMenuItems, useListCategories, getListMenuItemsQueryKey } from "@workspace/api-client-react";
import { useCart } from "@/context/cart";

export default function MenuPage() {
  const [, setLocation] = useLocation();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showVegOnly, setShowVegOnly] = useState(false);
  const { items: cartItems, addItem, updateQuantity, itemCount, total } = useCart();

  const { data: categories = [] } = useListCategories();
  const { data: menuItems = [], isLoading } = useListMenuItems(
    selectedCategory !== "all" ? { category: selectedCategory } : undefined,
    { query: { queryKey: getListMenuItemsQueryKey(selectedCategory !== "all" ? { category: selectedCategory } : undefined) } }
  );

  const filtered = useMemo(() => {
    return menuItems.filter((item) => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
      const matchesVeg = !showVegOnly || item.isVeg;
      return matchesSearch && matchesVeg;
    });
  }, [menuItems, searchQuery, showVegOnly]);

  const getCartItem = (id: number) => cartItems.find((i) => i.menuItemId === id);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center gap-3 mb-3">
            <button onClick={() => setLocation("/")} className="text-muted-foreground hover:text-foreground transition-colors text-sm">
              Shakti Fast Food
            </button>
            <span className="text-muted-foreground">/</span>
            <span className="text-foreground font-semibold text-sm">Menu</span>
            <div className="ml-auto flex items-center gap-2">
              <button
                onClick={() => setShowVegOnly(!showVegOnly)}
                data-testid="button-veg-filter"
                className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border transition-all ${showVegOnly ? "bg-green-600 border-green-600 text-white" : "bg-card border-border text-muted-foreground hover:border-green-500/50"}`}
              >
                <div className="w-2.5 h-2.5 rounded-full border-2 border-current" />
                Veg Only
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search momos, maggi, sandwich..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              data-testid="input-search"
              className="w-full bg-card border border-border rounded-xl pl-9 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
            />
          </div>

          {/* Categories */}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
            <button
              onClick={() => setSelectedCategory("all")}
              data-testid="category-all"
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${selectedCategory === "all" ? "bg-primary text-primary-foreground" : "bg-card border border-border text-muted-foreground hover:border-primary/40"}`}
            >
              All Items
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.slug)}
                data-testid={`category-${cat.slug}`}
                className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${selectedCategory === cat.slug ? "bg-primary text-primary-foreground" : "bg-card border border-border text-muted-foreground hover:border-primary/40"}`}
              >
                {cat.name}
                <span className="text-xs opacity-70">({cat.itemCount})</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Menu Grid */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-card border border-border rounded-2xl p-5 animate-pulse">
                <div className="h-4 bg-muted rounded mb-3 w-3/4" />
                <div className="h-3 bg-muted rounded mb-4 w-1/2" />
                <div className="h-6 bg-muted rounded w-1/3" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <Filter className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-lg font-semibold">No items found</p>
            <p className="text-sm mt-1">Try a different search or category</p>
          </div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            <AnimatePresence>
              {filtered.map((dish) => {
                const cartItem = getCartItem(dish.id);
                return (
                  <motion.div
                    key={dish.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    data-testid={`card-menu-${dish.id}`}
                    className={`bg-card border rounded-2xl p-5 transition-all duration-200 ${dish.available ? "border-card-border hover:border-primary/30" : "border-card-border opacity-60"}`}
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 mt-0.5 ${dish.isVeg ? "border-green-500 bg-green-500/20" : "border-red-500 bg-red-500/20"}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-bold text-foreground text-sm leading-tight">{dish.name}</h3>
                          {dish.isFeatured && (
                            <span className="flex-shrink-0 bg-primary/15 text-primary text-xs font-semibold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                              <Star className="w-2.5 h-2.5 fill-primary" /> Hot
                            </span>
                          )}
                        </div>
                        {dish.description && (
                          <p className="text-muted-foreground text-xs mt-0.5 line-clamp-2">{dish.description}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-auto">
                      <div>
                        <span className="text-primary font-black text-lg">₹{dish.price}</span>
                        {dish.halfPrice && (
                          <span className="text-muted-foreground text-xs ml-1">/ ₹{dish.halfPrice} half</span>
                        )}
                        {!dish.available && (
                          <span className="ml-2 text-destructive text-xs font-medium">Unavailable</span>
                        )}
                      </div>

                      {dish.available && (
                        cartItem ? (
                          <div className="flex items-center gap-2 bg-primary/10 border border-primary/30 rounded-xl px-2 py-1">
                            <button
                              onClick={() => updateQuantity(dish.id, cartItem.quantity - 1)}
                              data-testid={`button-decrease-${dish.id}`}
                              className="w-6 h-6 rounded-lg bg-primary/20 hover:bg-primary/40 flex items-center justify-center transition-colors"
                            >
                              <Minus className="w-3 h-3 text-primary" />
                            </button>
                            <span className="text-foreground font-bold text-sm w-4 text-center">{cartItem.quantity}</span>
                            <button
                              onClick={() => updateQuantity(dish.id, cartItem.quantity + 1)}
                              data-testid={`button-increase-${dish.id}`}
                              className="w-6 h-6 rounded-lg bg-primary/20 hover:bg-primary/40 flex items-center justify-center transition-colors"
                            >
                              <Plus className="w-3 h-3 text-primary" />
                            </button>
                          </div>
                        ) : (
                          <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() => addItem({ menuItemId: dish.id, name: dish.name, price: dish.price })}
                            data-testid={`button-add-${dish.id}`}
                            className="bg-primary hover:bg-primary/90 text-primary-foreground w-8 h-8 rounded-xl flex items-center justify-center transition-colors shadow-sm"
                          >
                            <Plus className="w-4 h-4" />
                          </motion.button>
                        )
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* Floating Cart */}
      <AnimatePresence>
        {itemCount > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-sm"
          >
            <button
              onClick={() => setLocation("/cart")}
              data-testid="button-view-cart"
              className="w-full bg-primary text-primary-foreground font-bold py-4 px-6 rounded-2xl flex items-center justify-between glow-box shadow-xl transition-all hover:bg-primary/90"
            >
              <span className="bg-primary-foreground/20 rounded-lg px-2 py-0.5 text-sm">{itemCount} items</span>
              <span className="flex items-center gap-2">
                View Cart <ShoppingBag className="w-4 h-4" />
              </span>
              <span className="font-black">₹{total}</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
