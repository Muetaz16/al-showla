"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { getContractorSession, contractorLogout, ContractorUser } from "@/lib/contractor-auth";
import { getOrders, getProducts, placeOrder, getAdminNotifications, updateOrderStatus } from "@/app/actions";
import { SatisfactionSurvey } from "@/components/SatisfactionSurvey";
import { Product, CATEGORIES } from "@/lib/products";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from 'recharts';
import { motion, AnimatePresence } from "framer-motion";
import { 
  LayoutDashboard, ShoppingCart, Search, LogOut, PackageSearch, 
  BarChart3, User, Bell, PackageOpen, CheckCircle, Clock, 
  Truck, XCircle, FileText, ShoppingBag, Plus, Minus, Trash2, 
  Flame, ChevronLeft
} from "lucide-react";

const STATUS_CONFIG = {
  pending:    { label: "معلّق",       color: "#f59e0b", bg: "rgba(245,158,11,.15)",  icon: Clock },
  confirmed:  { label: "مؤكد",        color: "#3b82f6", bg: "rgba(59,130,246,.15)",  icon: CheckCircle },
  processing: { label: "قيد التنفيذ", color: "#8b5cf6", bg: "rgba(139,92,246,.15)", icon: PackageOpen },
  delivered:  { label: "تم التوصيل", color: "#10b981", bg: "rgba(16,185,129,.15)",  icon: Truck },
  cancelled:  { label: "ملغي",        color: "#ef4444", bg: "rgba(239,68,68,.15)",   icon: XCircle },
};

type TabType = "dashboard" | "orders" | "catalog" | "neworder" | "analytics" | "profile";

export default function ContractorPortal() {
  const router = useRouter();
  const [user, setUser] = useState<ContractorUser | null>(null);
  const [mounted, setMounted] = useState(false);
  const [tab, setTab] = useState<TabType>("dashboard");
  const [orders, setOrders] = useState<any[]>([]);
  const [orderStatusFilter, setOrderStatusFilter] = useState("all");
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [showNotifPanel, setShowNotifPanel] = useState(false);
  const seenNotifIds = useRef<Set<string>>(new Set());
  const notifInitialized = useRef(false);
  const userRef = useRef<ContractorUser | null>(null);

  // New order form
  const [cart, setCart] = useState<{ product: Product; qty: number }[]>([]);
  const [orderNotes, setOrderNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Search
  const [searchProd, setSearchProd] = useState("");
  const [catFilter, setCatFilter] = useState("all");

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 5000);
  };

  const load = useCallback(async (u: ContractorUser) => {
    const [allOrders, prods] = await Promise.all([getOrders(), getProducts()]);
    const myOrders = allOrders.filter((o: any) =>
      o.contractorId === u.id ||
      (o.phone && o.phone.replace(/\D/g, "") === u.phone.replace(/\D/g, "")) ||
      o.client?.toLowerCase().includes(u.nameAr.split(" ")[0].toLowerCase())
    );
    setOrders(myOrders);
    setProducts(prods);
  }, []);

  // Notifications
  const [notifications, setNotifications] = useState<any[]>([]);

  const markAllNotificationsRead = async () => {
    // Notifications are mocked to read in state since we don't have update endpoint right now
    // In a real app we would call a server action `markNotificationsAsRead(ids)`
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  useEffect(() => {
    setMounted(true);
    const session = getContractorSession();
    if (!session) { router.replace("/contractor/login"); return; }
    setUser(session);
    userRef.current = session;
    load(session);

    const fetchNotifs = async () => {
      try {
        const notifs = await getAdminNotifications();
        // Just mocking notifications for the contractor here using getAdminNotifications for now
        // Ideally we should have `getContractorNotifications(session.id)`
        // But for this UI it's fine since we are migrating out of Firebase
        if (notifInitialized.current) {
          for (const n of notifs) {
            if (n.id && !seenNotifIds.current.has(n.id)) {
              seenNotifIds.current.add(n.id);
              showToast(`🔔 ${n.title}\n${n.body || ""}`);
              if (n.title?.includes("طلب") || n.body?.includes("طلب") || n.title?.includes("موافقة")) {
                if (userRef.current) load(userRef.current);
              }
              break;
            }
          }
        } else {
          notifs.forEach(n => { if (n.id) seenNotifIds.current.add(n.id); });
          notifInitialized.current = true;
        }
        setNotifications(notifs);
      } catch (err) {
        console.error("Notifications error:", err);
      }
    };
    
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 10000);
    return () => clearInterval(interval);
  }, [router, load]);

  const handleLogout = () => { contractorLogout(); router.replace("/contractor/login"); };

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(c => c.product.id === product.id);
      if (existing) return prev.map(c => c.product.id === product.id ? { ...c, qty: c.qty + 1 } : c);
      return [...prev, { product, qty: 1 }];
    });
    showToast(`✅ تم إضافة ${product.nameAr}`);
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(c => c.product.id !== productId));
  };

  const updateQty = (productId: string, qty: number) => {
    if (qty <= 0) { removeFromCart(productId); return; }
    setCart(prev => prev.map(c => c.product.id === productId ? { ...c, qty } : c));
  };

  const getPrice = (p: Product) => {
    const rate = user?.discountRate || 0;
    return p.priceBase * (1 - rate / 100);
  };

  const cartTotal = cart.reduce((sum, c) => sum + getPrice(c.product) * c.qty, 0);

  const handlePlaceOrder = async () => {
    if (cart.length === 0) { showToast("❌ السلة فارغة"); return; }
    setSubmitting(true);
    const orderId = await placeOrder({
      client: user!.nameAr,
      phone: user!.phone,
      items: cart.length,
      total: cartTotal,
      details: cart.map(c => ({ productId: c.product.id, productName: c.product.nameAr, quantity: c.qty, unitPrice: getPrice(c.product) })),
      notes: orderNotes,
      contractorId: user!.id,
    });
    if (orderId === "LIMIT_EXCEEDED") {
      showToast("❌ تجاوزت الحد الائتماني (الديون) المسموح لك به!");
    } else if (orderId) {
      showToast(`🎉 تم إرسال طلبك بنجاح! رقم الطلب: ${orderId}`);
      setCart([]);
      setOrderNotes("");
      const updatedUser = { ...user!, balance: (user!.balance || 0) + cartTotal };
      setUser(updatedUser);
      localStorage.setItem("alshowla_contractor_auth", JSON.stringify(updatedUser));
      await load(updatedUser);
      setTab("orders");
    } else {
      showToast("❌ فشل إرسال الطلب، حاول مرة أخرى");
    }
    setSubmitting(false);
  };

  if (!mounted || !user) return (
    <div style={{ minHeight: "100vh", background: "#060b13", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 40, height: 40, border: "3px solid rgba(59,130,246,0.3)", borderTopColor: "#3b82f6", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
    </div>
  );

  const myPending   = orders.filter(o => o.status === "pending").length;
  const myConfirmed = orders.filter(o => o.status === "confirmed" || o.status === "processing").length;
  const myDelivered = orders.filter(o => o.status === "delivered").length;
  const myTotal     = orders.reduce((sum, o) => sum + (o.total || 0), 0);

  const filteredProducts = products.filter(p =>
    (catFilter === "all" || p.categoryId === catFilter) &&
    (searchProd === "" || p.nameAr.toLowerCase().includes(searchProd.toLowerCase()))
  );

  const navItems = [
    { id: "dashboard", icon: LayoutDashboard, label: "لوحتي" },
    { id: "orders",    icon: ShoppingBag, label: "طلباتي" },
    { id: "catalog",   icon: PackageSearch, label: "الكتالوج" },
    { id: "neworder",  icon: ShoppingCart, label: "طلب جديد", badge: cart.length > 0 ? cart.length : null },
    { id: "analytics", icon: BarChart3, label: "إحصائيات" },
    { id: "profile",   icon: User, label: "حسابي" },
  ] as const;

  return (
    <div dir="rtl" lang="ar" style={{ display: "flex", minHeight: "100vh", background: "#060b13", backgroundImage: "radial-gradient(circle at 100% 0%, rgba(59, 130, 246, 0.08) 0%, transparent 40%), radial-gradient(circle at 0% 100%, rgba(16, 185, 129, 0.05) 0%, transparent 40%)", fontFamily: "'Cairo', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 6px; } 
        ::-webkit-scrollbar-track { background: transparent; } 
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
        @keyframes spin { to { transform: rotate(360deg); } }
        input:focus, select:focus, textarea:focus { outline:none; border-color:rgba(59,130,246,0.5) !important; box-shadow:0 0 0 3px rgba(59,130,246,0.15) !important; }
        
        .glass-panel {
          background: rgba(16, 24, 43, 0.6);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.05);
        }
        
        .glass-card {
          background: rgba(255, 255, 255, 0.02);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 255, 255, 0.04);
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        
        .glass-card:hover {
          background: rgba(255, 255, 255, 0.04);
          border-color: rgba(255, 255, 255, 0.1);
          transform: translateY(-4px);
          box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.5);
        }

        .prod-card-container {
          position: relative;
          overflow: hidden;
          border-radius: 16px;
        }

        .prod-card-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.2) 60%, transparent 100%);
          opacity: 0;
          transition: opacity 0.3s;
          display: flex;
          align-items: flex-end;
          padding: 16px;
        }

        .prod-card-container:hover .prod-card-overlay {
          opacity: 1;
        }
      `}</style>

      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            style={{ position:"fixed", bottom:32, left:"50%", transform:"translateX(-50%)", background:"rgba(10,18,40,0.95)", backdropFilter:"blur(16px)", border:"1px solid rgba(59,130,246,0.3)", color:"#fff", padding:"16px 28px", borderRadius:14, fontSize:14, fontWeight:800, zIndex:99999, boxShadow:"0 10px 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(59,130,246,0.2)", whiteSpace:"pre-line", textAlign:"center", maxWidth:"min(90vw, 420px)" }}
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className="glass-panel" style={{ width: 100, flexShrink: 0, display: "flex", flexDirection: "column", padding: "24px 12px", borderInlineEnd: "1px solid rgba(255,255,255,.05)", zIndex: 10 }}>
        <div style={{ textAlign:"center", marginBottom:32 }}>
          <div style={{ width:52, height:52, background:"linear-gradient(135deg, #3b82f6, #60a5fa)", borderRadius:16, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", margin:"0 auto", boxShadow:"0 0 24px rgba(59,130,246,0.4)" }}>
            <Flame size={28} strokeWidth={2.5} />
          </div>
        </div>

        <nav style={{ flex:1, display:"flex", flexDirection:"column", gap:8 }}>
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = tab === item.id;
            return (
              <motion.button 
                key={item.id} 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setTab(item.id as TabType)}
                style={{ 
                  display:"flex", flexDirection:"column", alignItems:"center", gap:6, padding:"16px 8px", cursor:"pointer", 
                  color: isActive ? "#3b82f6" : "rgba(255,255,255,.4)", 
                  background: isActive ? "rgba(59,130,246,0.1)" : "transparent",
                  border:"none", borderRadius:14, fontFamily:"'Cairo',sans-serif", position:"relative", transition:"all 0.3s"
                }}
              >
                <div style={{ position:"relative" }}>
                  <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                  {"badge" in item && item.badge && (
                    <motion.span 
                      initial={{ scale: 0 }} animate={{ scale: 1 }}
                      style={{ position:"absolute", top:-6, right:-8, background:"#ef4444", color:"#fff", fontSize:10, fontWeight:900, width:18, height:18, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 0 10px rgba(239,68,68,0.5)" }}
                    >
                      {item.badge}
                    </motion.span>
                  )}
                </div>
                <span style={{ fontSize:11, fontWeight:800 }}>{item.label}</span>
              </motion.button>
            )
          })}
        </nav>

        <button onClick={handleLogout} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:6, padding:"16px 8px", cursor:"pointer", color:"rgba(239,68,68,.7)", background:"transparent", border:"none", borderRadius:14, fontFamily:"'Cairo',sans-serif", marginTop:"auto" }}>
          <LogOut size={24} strokeWidth={2} />
          <span style={{ fontSize:11, fontWeight:800 }}>خروج</span>
        </button>
      </aside>

      {/* Main Content */}
      <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
        
        {/* Header */}
        <header className="glass-panel" style={{ height:76, display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 32px", borderBottom:"1px solid rgba(255,255,255,.05)", zIndex: 9 }}>
          <div style={{ display:"flex", alignItems:"center", gap:14 }}>
            {(() => {
              const activeItem = navItems.find(n => n.id === tab);
              const Icon = activeItem?.icon || LayoutDashboard;
              return (
                <>
                  <div style={{ width:40, height:40, borderRadius:12, background:"rgba(59,130,246,0.1)", color:"#3b82f6", display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <Icon size={20} strokeWidth={2.5} />
                  </div>
                  <span style={{ fontSize:18, fontWeight:900, color:"#fff" }}>{activeItem?.label}</span>
                </>
              )
            })()}
          </div>
          
          <div style={{ display:"flex", alignItems:"center", gap:20, position:"relative" }}>
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => { setShowNotifPanel(p => !p); if (!showNotifPanel) markAllNotificationsRead(); }}
              style={{ position:"relative", cursor:"pointer", color: notifications.some(n => !n.read) ? "#3b82f6" : "rgba(255,255,255,0.7)" }}
            >
              <Bell size={24} strokeWidth={2} />
              {notifications.filter(n => !n.read).length > 0 && (
                <span style={{ position:"absolute", top:-2, right:-2, background:"#ef4444", color:"#fff", fontSize:10, fontWeight:900, width:16, height:16, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 0 10px rgba(239,68,68,0.5)" }}>
                  {notifications.filter(n => !n.read).length}
                </span>
              )}
            </motion.div>

            <AnimatePresence>
              {showNotifPanel && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.95 }}
                  style={{ position:"absolute", top:"calc(100% + 12px)", left:0, width:320, maxHeight:360, overflowY:"auto", background:"rgba(10,18,40,0.98)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:16, boxShadow:"0 20px 50px rgba(0,0,0,0.5)", zIndex:1000 }}
                >
                  <div style={{ padding:"14px 16px", borderBottom:"1px solid rgba(255,255,255,0.06)", fontWeight:900, color:"#fff", fontSize:14 }}>الإشعارات</div>
                  {notifications.length === 0 ? (
                    <div style={{ padding:24, textAlign:"center", color:"rgba(255,255,255,0.35)", fontSize:13 }}>لا توجد إشعارات</div>
                  ) : notifications.map(n => (
                    <div key={n.id} style={{ padding:"12px 16px", borderBottom:"1px solid rgba(255,255,255,0.04)", background: n.read ? "transparent" : "rgba(59,130,246,0.08)" }}>
                      <div style={{ fontWeight:800, color:"#fff", fontSize:13, marginBottom:4 }}>{n.title}</div>
                      <div style={{ fontSize:12, color:"rgba(255,255,255,0.5)", lineHeight:1.5 }}>{n.body}</div>
                      {n.timestamp && <div style={{ fontSize:10, color:"rgba(255,255,255,0.25)", marginTop:6 }}>{new Date(n.timestamp).toLocaleString("ar-LY")}</div>}
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
            
            {cart.length > 0 && (
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setTab("neworder")} style={{ background:"linear-gradient(135deg, rgba(59,130,246,0.2), rgba(59,130,246,0.05))", border:"1px solid rgba(59,130,246,0.3)", color:"#3b82f6", padding:"8px 16px", borderRadius:12, fontSize:13, fontWeight:800, cursor:"pointer", fontFamily:"'Cairo',sans-serif", display:"flex", alignItems:"center", gap:8 }}>
                <ShoppingCart size={16} /> السلة ({cart.length})
              </motion.button>
            )}
            
            <div style={{ display:"flex", alignItems:"center", gap:12, background:"rgba(255,255,255,0.03)", padding:"6px 16px 6px 6px", borderRadius:20, border:"1px solid rgba(255,255,255,0.05)" }}>
              <div style={{ textAlign:"left" }}>
                <div style={{ fontSize:13, fontWeight:800, color:"#fff" }}>{user.nameAr}</div>
                <div style={{ fontSize:10, color:"rgba(255,255,255,.4)", letterSpacing:".06em" }}>{user.company}</div>
              </div>
              <div style={{ width:36, height:36, borderRadius:"50%", background:"linear-gradient(135deg, #10b981, #059669)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16 }}>
                {user.avatar}
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <main style={{ flex:1, overflowY:"auto", padding:40, position:"relative" }}>
          
          <AnimatePresence mode="wait">
            
            {/* ── DASHBOARD ── */}
            {tab === "dashboard" && (
              <motion.div key="dashboard" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
                <div style={{ marginBottom:32 }}>
                  <h2 style={{ fontSize:26, fontWeight:900, color:"#fff", marginBottom:8 }}>مرحباً بعودتك، {user.nameAr} {user.avatar}</h2>
                  <p style={{ fontSize:15, color:"rgba(255,255,255,.4)", fontWeight:600 }}>نظرة عامة على حسابك ونشاطاتك الأخيرة.</p>
                </div>

                {/* Stats Grid */}
                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))", gap:20, marginBottom:32 }}>
                  {[
                    { icon: FileText, label:"الرصيد المستخدم", value:`${(user.balance || 0).toLocaleString()} د.ل`, sub:`الحد: ${(user.creditLimit || 0).toLocaleString()}`, color:"#f43f5e", bg:"linear-gradient(135deg, rgba(244,63,94,0.1), rgba(244,63,94,0.02))" },
                    { icon: ShoppingBag, label:"إجمالي طلباتي", value:orders.length, color:"#3b82f6", bg:"linear-gradient(135deg, rgba(59,130,246,0.1), rgba(59,130,246,0.02))" },
                    { icon: Clock, label:"طلبات معلقة", value:myPending, color:"#f59e0b", bg:"linear-gradient(135deg, rgba(245,158,11,0.1), rgba(245,158,11,0.02))" },
                    { icon: CheckCircle, label:"تم التوصيل", value:myDelivered, color:"#10b981", bg:"linear-gradient(135deg, rgba(16,185,129,0.1), rgba(16,185,129,0.02))" },
                  ].map((s, i) => (
                    <motion.div key={i} whileHover={{ y: -5 }} className="glass-card" style={{ padding:24, borderRadius:20, background:s.bg, border:`1px solid ${s.color}20` }}>
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                        <div>
                          <div style={{ fontSize:13, fontWeight:700, color:"rgba(255,255,255,.5)", marginBottom:12 }}>{s.label}</div>
                          <div style={{ fontSize:28, fontWeight:900, color:"#fff" }}>{s.value}</div>
                          {s.sub && <div style={{ fontSize:12, color:s.color, marginTop:8, fontWeight:700 }}>{s.sub}</div>}
                        </div>
                        <div style={{ color:s.color, background:`${s.color}15`, padding:14, borderRadius:16 }}>
                          <s.icon size={28} strokeWidth={2} />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Recent Orders */}
                <div className="glass-panel" style={{ borderRadius:24, padding:32 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
                    <h3 style={{ fontSize:18, fontWeight:900, color:"#fff", display:"flex", alignItems:"center", gap:10 }}>
                      <Clock size={20} color="#3b82f6" /> آخر طلباتي
                    </h3>
                    <button onClick={() => setTab("orders")} style={{ background:"rgba(255,255,255,0.05)", border:"none", color:"#fff", padding:"8px 16px", borderRadius:10, fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"'Cairo',sans-serif", display:"flex", alignItems:"center", gap:6 }}>
                      عرض الكل <ChevronLeft size={16} />
                    </button>
                  </div>
                  
                  {orders.length === 0 ? (
                    <div style={{ textAlign:"center", padding:"60px 0", color:"rgba(255,255,255,.3)" }}>
                      <PackageOpen size={64} strokeWidth={1} style={{ margin:"0 auto 16px" }} />
                      <div style={{ fontSize:16, fontWeight:800, marginBottom:12 }}>لا توجد طلبات بعد</div>
                      <button onClick={() => setTab("neworder")} style={{ background:"linear-gradient(135deg,#3b82f6,#2563eb)", border:"none", color:"#fff", padding:"12px 28px", borderRadius:12, fontSize:14, fontWeight:800, cursor:"pointer", fontFamily:"'Cairo',sans-serif", marginTop:8 }}>أنشئ طلبك الأول</button>
                    </div>
                  ) : (
                    <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                      {orders.slice(0, 5).map((o: any, i) => {
                        const st = STATUS_CONFIG[o.status as keyof typeof STATUS_CONFIG];
                        const StatusIcon = st?.icon || Clock;
                        return (
                          <motion.div key={o.id} initial={{ opacity:0, x: -20 }} animate={{ opacity:1, x:0 }} transition={{ delay: i * 0.1 }} onClick={() => setSelectedOrder(o)} className="glass-card" style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"20px 24px", borderRadius:16, cursor:"pointer" }}>
                            <div style={{ display:"flex", alignItems:"center", gap:16 }}>
                              <div style={{ width:48, height:48, background:st?.bg ?? "rgba(255,255,255,0.05)", borderRadius:14, display:"flex", alignItems:"center", justifyContent:"center", color:st?.color }}>
                                <StatusIcon size={24} strokeWidth={2} />
                              </div>
                              <div>
                                <div style={{ fontSize:15, fontWeight:900, color:"#fff", marginBottom:4 }}>{o.id}</div>
                                <div style={{ fontSize:12, color:"rgba(255,255,255,.4)", fontWeight:600 }}>{o.date ? new Date(o.date).toLocaleDateString("ar-LY") : "—"} • {o.items} منتجات</div>
                              </div>
                            </div>
                            <div style={{ display:"flex", alignItems:"center", gap:24 }}>
                              <div style={{ fontSize:16, fontWeight:900, color:"#10b981" }}>{(o.total||0).toLocaleString()} د.ل</div>
                              {st && <span style={{ background:st.bg, color:st.color, border:`1px solid ${st.color}40`, padding:"6px 14px", borderRadius:20, fontSize:12, fontWeight:800 }}>{st.label}</span>}
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* ── ORDERS TABLE ── */}
            {tab === "orders" && (
              <motion.div key="orders" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
                <div style={{ marginBottom:32, display:"flex", justifyContent:"space-between", alignItems:"flex-end", flexWrap: "wrap", gap: 16 }}>
                  <div>
                    <h2 style={{ fontSize:26, fontWeight:900, color:"#fff", marginBottom:8 }}>جميع طلباتي</h2>
                    <p style={{ fontSize:15, color:"rgba(255,255,255,.4)", fontWeight:600 }}>تتبع حالة جميع طلباتك السابقة والحالية.</p>
                  </div>
                  <select value={orderStatusFilter} onChange={e => setOrderStatusFilter(e.target.value)} style={{ padding:"12px 20px", background:"rgba(255,255,255,.03)", border:"1px solid rgba(255,255,255,.08)", borderRadius:14, color:"#fff", fontSize:14, fontFamily:"'Cairo',sans-serif", cursor:"pointer", outline: "none" }}>
                    <option value="all" style={{ background: "#0f172a", color: "#fff" }}>كل الحالات</option>
                    {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                      <option key={k} value={k} style={{ background: "#0f172a", color: "#fff" }}>{v.label}</option>
                    ))}
                  </select>
                </div>
                
                <div className="glass-panel" style={{ borderRadius:24, overflow:"hidden" }}>
                  <div style={{ overflowX:"auto" }}>
                    <table style={{ width:"100%", borderCollapse:"collapse", textAlign:"right" }}>
                      <thead>
                        <tr style={{ background:"rgba(255,255,255,.02)", borderBottom:"1px solid rgba(255,255,255,.05)" }}>
                          <th style={{ padding:"20px 24px", color:"rgba(255,255,255,.4)", fontWeight:800, fontSize:13 }}>رقم الطلب</th>
                          <th style={{ padding:"20px 24px", color:"rgba(255,255,255,.4)", fontWeight:800, fontSize:13 }}>التاريخ</th>
                          <th style={{ padding:"20px 24px", color:"rgba(255,255,255,.4)", fontWeight:800, fontSize:13 }}>المنتجات</th>
                          <th style={{ padding:"20px 24px", color:"rgba(255,255,255,.4)", fontWeight:800, fontSize:13 }}>الإجمالي</th>
                          <th style={{ padding:"20px 24px", color:"rgba(255,255,255,.4)", fontWeight:800, fontSize:13 }}>الحالة</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.filter(o => orderStatusFilter === "all" || o.status === orderStatusFilter).map((o: any) => {
                          const st = STATUS_CONFIG[o.status as keyof typeof STATUS_CONFIG];
                          return (
                            <tr key={o.id} onClick={() => setSelectedOrder(o)} style={{ borderBottom:"1px solid rgba(255,255,255,.03)", cursor:"pointer", transition:"background 0.2s" }} onMouseOver={e => e.currentTarget.style.background="rgba(255,255,255,.02)"} onMouseOut={e => e.currentTarget.style.background="transparent"}>
                              <td style={{ padding:"20px 24px", fontWeight:900, color:"#fff" }}>{o.id}</td>
                              <td style={{ padding:"20px 24px", color:"rgba(255,255,255,.6)", fontWeight:600, fontSize:14 }}>{o.date ? new Date(o.date).toLocaleDateString("ar-LY") : "—"}</td>
                              <td style={{ padding:"20px 24px", color:"rgba(255,255,255,.6)", fontWeight:800 }}>{o.items}</td>
                              <td style={{ padding:"20px 24px", fontWeight:900, color:"#10b981" }}>{(o.total||0).toLocaleString()} د.ل</td>
                              <td style={{ padding:"20px 24px" }}>
                                {st ? <span style={{ background:st.bg, color:st.color, border:`1px solid ${st.color}40`, padding:"6px 14px", borderRadius:20, fontSize:12, fontWeight:800 }}>{st.label}</span> : "—"}
                              </td>
                            </tr>
                          )
                        })}
                        {orders.length === 0 && (
                          <tr><td colSpan={5} style={{ padding:"40px", textAlign:"center", color:"rgba(255,255,255,.4)", fontWeight:700 }}>لا توجد طلبات.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── NEW ORDER & CATALOG ── */}
            {(tab === "catalog" || tab === "neworder") && (
              <motion.div key="catalog" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
                
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginBottom:32 }}>
                  <div>
                    <h2 style={{ fontSize:26, fontWeight:900, color:"#fff", marginBottom:8 }}>{tab === "catalog" ? "الكتالوج" : "طلب جديد"}</h2>
                    <p style={{ fontSize:15, color:"rgba(255,255,255,.4)", fontWeight:600 }}>تصفح منتجاتنا، أضف إلى السلة، وتابع طلباتك بكل سهولة.</p>
                  </div>
                  
                  <div style={{ display:"flex", gap:16 }}>
                    <div style={{ position:"relative" }}>
                      <Search size={18} color="rgba(255,255,255,0.4)" style={{ position:"absolute", right:16, top:"50%", transform:"translateY(-50%)" }} />
                      <input value={searchProd} onChange={e => setSearchProd(e.target.value)} placeholder="بحث عن منتج..." style={{ padding:"14px 44px 14px 16px", background:"rgba(255,255,255,.03)", border:"1px solid rgba(255,255,255,.08)", borderRadius:14, color:"#fff", fontSize:14, fontFamily:"'Cairo',sans-serif", minWidth:260 }} />
                    </div>
                    <select value={catFilter} onChange={e => setCatFilter(e.target.value)} style={{ padding:"14px 20px", background:"rgba(255,255,255,.03)", border:"1px solid rgba(255,255,255,.08)", borderRadius:14, color:"#fff", fontSize:14, fontFamily:"'Cairo',sans-serif", cursor:"pointer" }}>
                      <option value="all" style={{ background: "#0f172a", color: "#fff" }}>كل الفئات</option>
                      {CATEGORIES.filter(c => c.id !== "all").map(c => <option key={c.id} value={c.id} style={{ background: "#0f172a", color: "#fff" }}>{c.nameAr}</option>)}
                    </select>
                  </div>
                </div>

                <div style={{ display:"grid", gridTemplateColumns: tab === "neworder" ? "1fr 400px" : "1fr", gap:32, alignItems: "start" }}>
                  
                  {/* Products Grid */}
                  <div style={{ display:"grid", gridTemplateColumns:`repeat(auto-fill,minmax(${tab === "neworder" ? "200px" : "240px"},1fr))`, gap:20 }}>
                    <AnimatePresence>
                      {filteredProducts.slice(0, 50).map(p => {
                        const inCart = cart.find(c => c.product.id === p.id);
                        return (
                          <motion.div key={p.id} layout initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }} exit={{ opacity:0, scale:0.9 }} className="glass-card prod-card-container">
                            <img src={p.imageUrl} alt={p.nameAr} style={{ width:"100%", height:tab === "neworder" ? 140 : 180, objectFit:"cover", borderTopLeftRadius:16, borderTopRightRadius:16 }} onError={e => (e.currentTarget.src = "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400")} />
                            
                            <div className="prod-card-overlay">
                              <button onClick={() => addToCart(p)} style={{ width:"100%", padding:"12px", background:"#3b82f6", border:"none", borderRadius:10, color:"#fff", fontSize:14, fontWeight:800, cursor:"pointer", fontFamily:"'Cairo',sans-serif", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
                                <Plus size={18} /> إضافة
                              </button>
                            </div>

                            <div style={{ padding:20 }}>
                              <div style={{ fontSize:14, fontWeight:900, color:"#fff", marginBottom:6, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{p.nameAr}</div>
                              {p.brand && <div style={{ fontSize:12, color:"rgba(255,255,255,.4)", marginBottom:16 }}>{p.brand}</div>}
                              
                              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                                <div>
                                  <div style={{ fontSize:18, fontWeight:900, color:"#10b981" }}>
                                    {getPrice(p).toLocaleString()} <span style={{ fontSize:12 }}>د.ل</span>
                                  </div>
                                  {user?.discountRate ? <div style={{ fontSize:11, color:"rgba(255,255,255,.4)", textDecoration:"line-through" }}>{p.priceBase.toLocaleString()} د.ل</div> : null}
                                </div>
                                {inCart && <div style={{ background:"rgba(59,130,246,0.15)", color:"#3b82f6", width:32, height:32, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:900 }}>{inCart.qty}</div>}
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </div>

                  {/* Cart Sidebar */}
                  {tab === "neworder" && (
                    <motion.div initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} className="glass-panel" style={{ borderRadius:24, padding:32, position:"sticky", top:32, maxHeight:"calc(100vh - 140px)", display:"flex", flexDirection:"column" }}>
                      <h3 style={{ fontSize:18, fontWeight:900, color:"#fff", marginBottom:24, display:"flex", alignItems:"center", gap:10 }}>
                        <ShoppingCart size={20} color="#3b82f6" /> السلة
                      </h3>
                      
                      <div style={{ flex:1, overflowY:"auto", paddingRight:8, marginBottom:24, display:"flex", flexDirection:"column", gap:16 }}>
                        {cart.length === 0 ? (
                          <div style={{ textAlign:"center", padding:"40px 0", color:"rgba(255,255,255,.3)" }}>
                            <ShoppingCart size={48} strokeWidth={1} style={{ margin:"0 auto 16px" }} />
                            <div style={{ fontSize:14, fontWeight:700 }}>السلة فارغة</div>
                          </div>
                        ) : (
                          <AnimatePresence>
                            {cart.map(c => (
                              <motion.div key={c.product.id} layout initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }} exit={{ opacity:0, scale:0.95 }} style={{ display:"flex", alignItems:"center", gap:12, paddingBottom:16, borderBottom:"1px solid rgba(255,255,255,.05)" }}>
                                <img src={c.product.imageUrl} alt="" style={{ width:54, height:54, objectFit:"cover", borderRadius:12 }} onError={e => (e.currentTarget.src = "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=100")} />
                                <div style={{ flex:1, minWidth:0 }}>
                                  <div style={{ fontSize:13, fontWeight:800, color:"#fff", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis", marginBottom:4 }}>{c.product.nameAr}</div>
                                  <div style={{ fontSize:12, color:"#10b981", fontWeight:700 }}>{getPrice(c.product).toLocaleString()} د.ل</div>
                                </div>
                                <div style={{ display:"flex", alignItems:"center", gap:8, background:"rgba(255,255,255,.03)", padding:4, borderRadius:10 }}>
                                  <button onClick={() => updateQty(c.product.id, c.qty - 1)} style={{ width:28, height:28, background:"rgba(255,255,255,.05)", border:"none", color:"#fff", borderRadius:8, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}><Minus size={14}/></button>
                                  <span style={{ fontSize:13, fontWeight:900, color:"#fff", minWidth:20, textAlign:"center" }}>{c.qty}</span>
                                  <button onClick={() => updateQty(c.product.id, c.qty + 1)} style={{ width:28, height:28, background:"rgba(59,130,246,.2)", border:"none", color:"#3b82f6", borderRadius:8, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}><Plus size={14}/></button>
                                </div>
                              </motion.div>
                            ))}
                          </AnimatePresence>
                        )}
                      </div>

                      {cart.length > 0 && (
                        <div style={{ borderTop:"1px solid rgba(255,255,255,.05)", paddingTop:24 }}>
                          <textarea value={orderNotes} onChange={e => setOrderNotes(e.target.value)} placeholder="أضف ملاحظات لطلبك هنا..." rows={2} style={{ width:"100%", padding:"14px", background:"rgba(255,255,255,.03)", border:"1px solid rgba(255,255,255,.08)", borderRadius:12, color:"#fff", fontSize:13, fontFamily:"'Cairo',sans-serif", resize:"none", marginBottom:20 }} />
                          
                          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:20 }}>
                            <span style={{ fontSize:15, fontWeight:700, color:"rgba(255,255,255,.6)" }}>الإجمالي المطلوب:</span>
                            <span style={{ fontSize:24, fontWeight:900, color:"#10b981" }}>{cartTotal.toLocaleString()} د.ل</span>
                          </div>
                          
                          <button onClick={handlePlaceOrder} disabled={submitting} style={{ width:"100%", padding:"16px", background:"linear-gradient(135deg,#3b82f6,#2563eb)", border:"none", borderRadius:14, color:"#fff", fontSize:16, fontWeight:900, cursor:"pointer", fontFamily:"'Cairo',sans-serif", opacity:submitting?0.7:1, display:"flex", alignItems:"center", justifyContent:"center", gap:10, boxShadow:"0 10px 20px rgba(59,130,246,0.3)" }}>
                            {submitting ? "⏳ جارٍ الإرسال..." : <><CheckCircle size={20}/> تأكيد الطلب</>}
                          </button>
                        </div>
                      )}
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}

            {/* ── ANALYTICS ── */}
            {tab === "analytics" && (
              <motion.div key="analytics" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
                <div style={{ marginBottom:32 }}>
                  <h2 style={{ fontSize:26, fontWeight:900, color:"#fff", marginBottom:8 }}>تحليلات المقاول</h2>
                  <p style={{ fontSize:15, color:"rgba(255,255,255,.4)", fontWeight:600 }}>احصائيات شاملة لمشترياتك والحد الائتماني.</p>
                </div>
                
                {/* Credit Health */}
                <div className="glass-panel" style={{ padding:32, borderRadius:24, marginBottom:32 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
                    <h3 style={{ fontSize:18, fontWeight:900, color:"#fff", display:"flex", alignItems:"center", gap:10 }}>
                      <FileText size={20} color="#f43f5e" /> صحة المحفظة والديون
                    </h3>
                    <div style={{ background:"rgba(244,63,94,0.1)", color:"#f43f5e", padding:"6px 14px", borderRadius:20, fontSize:13, fontWeight:800 }}>
                      معدل الاستخدام: {Math.round(((user.balance||0)/(user.creditLimit||1))*100)}%
                    </div>
                  </div>
                  
                  <div style={{ position:"relative", height:24, background:"rgba(255,255,255,0.05)", borderRadius:12, overflow:"hidden", border:"1px solid rgba(255,255,255,0.1)", direction:"ltr", marginBottom:16 }}>
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, ((user.balance||0)/(user.creditLimit||1))*100)}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      style={{ position:"absolute", left:0, top:0, bottom:0, background: (user.balance||0) >= (user.creditLimit||1) ? "#ef4444" : "linear-gradient(90deg, #3b82f6, #10b981)" }} 
                    />
                  </div>
                  
                  <div style={{ display:"flex", justifyContent:"space-between" }}>
                    <div>
                      <div style={{ fontSize:13, color:"rgba(255,255,255,.4)", fontWeight:700, marginBottom:4 }}>الديون المستحقة</div>
                      <div style={{ fontSize:20, fontWeight:900, color:"#fff" }}>{(user.balance||0).toLocaleString()} د.ل</div>
                    </div>
                    <div style={{ textAlign:"left" }}>
                      <div style={{ fontSize:13, color:"rgba(255,255,255,.4)", fontWeight:700, marginBottom:4 }}>الحد المسموح</div>
                      <div style={{ fontSize:20, fontWeight:900, color:"#fff" }}>{(user.creditLimit||0).toLocaleString()} د.ل</div>
                    </div>
                  </div>
                </div>

                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(400px,1fr))", gap:32 }}>
                  {/* Spending Chart */}
                  <div className="glass-panel" style={{ padding:32, borderRadius:24 }}>
                    <h3 style={{ fontSize:18, fontWeight:900, color:"#fff", marginBottom:24, display:"flex", alignItems:"center", gap:10 }}>
                      <BarChart3 size={20} color="#3b82f6" /> حجم الإنفاق عبر الزمن
                    </h3>
                    <div style={{ height:300 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={(() => {
                          const dataMap: Record<string, number> = {};
                          orders.forEach(o => {
                            const d = o.date ? new Date(o.date).toLocaleDateString('ar-LY') : new Date().toLocaleDateString('ar-LY');
                            dataMap[d] = (dataMap[d] || 0) + (o.total || 0);
                          });
                          return Object.entries(dataMap).map(([date, total]) => ({ date, total })).slice(-30);
                        })()}>
                          <defs>
                            <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                          <XAxis dataKey="date" stroke="rgba(255,255,255,0.2)" tick={{fill:'rgba(255,255,255,0.4)', fontSize:12, fontWeight:600}} axisLine={false} tickLine={false} />
                          <YAxis stroke="rgba(255,255,255,0.2)" tick={{fill:'rgba(255,255,255,0.4)', fontSize:12, fontWeight:600}} axisLine={false} tickLine={false} />
                          <RechartsTooltip contentStyle={{background:"rgba(16,24,43,0.9)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:12, color:"#fff", fontWeight:700, boxShadow:"0 10px 30px rgba(0,0,0,0.5)"}} itemStyle={{color:"#3b82f6"}} />
                          <Area type="monotone" dataKey="total" name="المبلغ" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorTotal)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Most Bought */}
                  <div className="glass-panel" style={{ padding:32, borderRadius:24 }}>
                    <h3 style={{ fontSize:18, fontWeight:900, color:"#fff", marginBottom:24, display:"flex", alignItems:"center", gap:10 }}>
                      <PackageOpen size={20} color="#10b981" /> أكثر المنتجات طلباً
                    </h3>
                    <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                      {(() => {
                        const pMap: Record<string, number> = {};
                        orders.forEach(o => {
                          o.details?.forEach((d:any) => {
                            pMap[d.productName] = (pMap[d.productName] || 0) + (d.quantity || 0);
                          });
                        });
                        const topList = Object.entries(pMap).sort((a,b) => b[1] - a[1]).slice(0, 6);
                        if (topList.length === 0) return <div style={{color:"rgba(255,255,255,.4)", textAlign:"center", padding:"40px 0", fontWeight:700}}>لا توجد بيانات كافية</div>;
                        return topList.map(([name, qty], i) => (
                          <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", background:"rgba(255,255,255,0.02)", padding:"16px 20px", borderRadius:14, border:"1px solid rgba(255,255,255,0.03)" }}>
                            <span style={{ fontSize:14, fontWeight:800, color:"rgba(255,255,255,.9)" }}>{name}</span>
                            <span style={{ fontSize:15, fontWeight:900, color:"#10b981", background:"rgba(16,185,129,0.1)", padding:"4px 12px", borderRadius:10 }}>{qty} وحدة</span>
                          </div>
                        ));
                      })()}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── PROFILE & ORDERS MODAL ── */}
            {tab === "profile" && (
              <motion.div key="profile" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <div style={{ marginBottom:32 }}>
                  <h2 style={{ fontSize:26, fontWeight:900, color:"#fff", marginBottom:8 }}>معلومات حسابي</h2>
                </div>
                <div className="glass-panel" style={{ padding:40, borderRadius:24, maxWidth:800 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:24, marginBottom:40 }}>
                    <div style={{ width:100, height:100, borderRadius:24, background:"linear-gradient(135deg, #10b981, #059669)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:40, boxShadow:"0 10px 30px rgba(16,185,129,0.3)" }}>
                      {user.avatar}
                    </div>
                    <div>
                      <div style={{ fontSize:28, fontWeight:900, color:"#fff", marginBottom:6 }}>{user.nameAr}</div>
                      <div style={{ fontSize:15, color:"#10b981", fontWeight:800, background:"rgba(16,185,129,0.1)", padding:"4px 12px", borderRadius:10, display:"inline-block" }}>{user.company}</div>
                    </div>
                  </div>
                  
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:24 }}>
                    {[
                      { l:"رقم الهاتف", v:user.phone },
                      { l:"البريد الإلكتروني", v:user.email },
                      { l:"نسبة الخصم الخاصة بك", v:`${user.discountRate}%`, highlight:true },
                      { l:"العنوان", v:"بنغازي، ليبيا" },
                    ].map(d => (
                      <div key={d.l} style={{ background:"rgba(255,255,255,0.02)", padding:20, borderRadius:16, border:"1px solid rgba(255,255,255,0.03)" }}>
                        <div style={{ fontSize:12, color:"rgba(255,255,255,.4)", fontWeight:700, marginBottom:8 }}>{d.l}</div>
                        <div style={{ fontSize:16, fontWeight:900, color:d.highlight ? "#3b82f6" : "#fff" }}>{d.v}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </main>
      </div>

      {/* ORDER DETAILS MODAL */}
      <AnimatePresence>
        {selectedOrder && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setSelectedOrder(null)} 
            style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.7)", backdropFilter:"blur(12px)", zIndex:9999, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              onClick={e => e.stopPropagation()} 
              style={{ background:"#0b1120", border:"1px solid rgba(255,255,255,.1)", borderRadius:24, width:"100%", maxWidth:600, maxHeight:"90vh", overflowY:"auto", padding:40, boxShadow:"0 25px 80px rgba(0,0,0,0.8)" }}
            >
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:32 }}>
                <div>
                  <div style={{ fontSize:13, color:"rgba(255,255,255,.4)", fontWeight:800, marginBottom:6 }}>تفاصيل الطلب</div>
                  <div style={{ fontSize:28, fontWeight:900, color:"#fff" }}>{selectedOrder.id}</div>
                </div>
                <button onClick={() => setSelectedOrder(null)} style={{ background:"rgba(255,255,255,.05)", border:"none", color:"rgba(255,255,255,.6)", width:44, height:44, borderRadius:14, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <XCircle size={24} />
                </button>
              </div>

              {(() => { 
                const st = STATUS_CONFIG[selectedOrder.status as keyof typeof STATUS_CONFIG]; 
                const Icon = st?.icon || Clock;
                return st ? (
                  <div style={{ background:st.bg, color:st.color, border:`1px solid ${st.color}40`, marginBottom:32, display:"inline-flex", alignItems:"center", gap:10, fontSize:15, fontWeight:800, padding:"10px 24px", borderRadius:12 }}>
                    <Icon size={20} /> {st.label}
                  </div>
                ) : null; 
              })()}

              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:32 }}>
                {[
                  { lbl:"التاريخ", val: selectedOrder.date ? new Date(selectedOrder.date).toLocaleDateString("ar-LY") : "—" },
                  { lbl:"الإجمالي", val: `${(selectedOrder.total||0).toLocaleString()} د.ل` },
                  { lbl:"المنتجات", val: selectedOrder.items ?? "—" },
                  { lbl:"ملاحظات", val: selectedOrder.notes || "لا توجد ملاحظات" },
                ].map(({ lbl, val }) => (
                  <div key={lbl} style={{ background:"rgba(255,255,255,.02)", borderRadius:16, padding:"16px 20px", border:"1px solid rgba(255,255,255,0.03)" }}>
                    <div style={{ fontSize:12, fontWeight:800, color:"rgba(255,255,255,.4)", marginBottom:6 }}>{lbl}</div>
                    <div style={{ fontSize:15, fontWeight:900, color:"#fff" }}>{String(val)}</div>
                  </div>
                ))}
              </div>

              {Array.isArray(selectedOrder.details) && selectedOrder.details.length > 0 && (
                <div style={{ marginBottom:32 }}>
                  <div style={{ fontSize:14, fontWeight:900, color:"#fff", marginBottom:16 }}>محتويات الطلب</div>
                  <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                    {selectedOrder.details.map((d: any, i: number) => (
                      <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"16px 20px", background:"rgba(255,255,255,.02)", borderRadius:14, border:"1px solid rgba(255,255,255,0.03)" }}>
                        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                          <PackageOpen size={20} color="rgba(255,255,255,0.4)" />
                          <span style={{ fontSize:14, fontWeight:800, color:"rgba(255,255,255,.9)" }}>{d.productName || d.productId}</span>
                        </div>
                        <div style={{ textAlign:"left" }}>
                          <span style={{ fontSize:15, fontWeight:900, color:"#3b82f6", background:"rgba(59,130,246,0.1)", padding:"4px 12px", borderRadius:10 }}>× {d.quantity}</span>
                          {d.unitPrice && <div style={{ fontSize:12, color:"rgba(255,255,255,.4)", marginTop:6, fontWeight:700 }}>{(d.unitPrice * d.quantity).toLocaleString()} د.ل</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Status Update Buttons */}
              <div style={{ borderTop:"1px solid rgba(255,255,255,0.06)", paddingTop:24 }}>
                <div style={{ fontSize:13, color:"rgba(255,255,255,.4)", fontWeight:800, marginBottom:16 }}>تغيير حالة الطلب</div>
                <div style={{ display:"flex", gap:12, flexWrap:"wrap" }}>
                  {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                    <button key={k}
                      onClick={async () => {
                        const ok = await updateOrderStatus(selectedOrder.id, k);
                        if (ok) {
                          setSelectedOrder((prev: any) => ({ ...prev, status: k }));
                          setOrders((prev: any) => prev.map((o: any) => o.id === selectedOrder.id ? { ...o, status: k } : o));
                        }
                      }}
                      style={{ 
                        padding:"10px 20px", 
                        borderRadius:12, 
                        border:`1.5px solid ${v.color}40`, 
                        background: selectedOrder.status === k ? v.bg : "rgba(255,255,255,0.02)", 
                        color: selectedOrder.status === k ? v.color : "rgba(255,255,255,0.6)", 
                        fontSize:14, 
                        fontWeight:800, 
                        cursor:"pointer", 
                        fontFamily:"'Cairo',sans-serif", 
                        transition:"all .2s", 
                        boxShadow: selectedOrder.status === k ? `0 0 20px ${v.bg}` : "none",
                        flex: 1,
                        textAlign: "center"
                      }}>
                      {v.label}
                    </button>
                  ))}
                </div>
              </div>

              {selectedOrder.status === "delivered" && (
                <div style={{ marginTop: 24 }}>
                  <SatisfactionSurvey orderId={selectedOrder.id} clientName={user?.nameAr} />
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
