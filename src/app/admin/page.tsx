"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getSession, logout, canAccess, type AdminUser } from "@/lib/auth";
import { getProducts, getOrders, addProduct, updateOrderStatus as updateOrderAPI, deleteProduct, getRealUsers, getLogs, addLog, AuditLog, getAdminNotifications } from "@/app/actions";
import {
  updateProductStockCount, getSubmissions, getFaqItems, saveFaqItem, deleteFaqItem,
  getBlogPosts, saveBlogPost, deleteBlogPost, getAllBanners, saveBanner, createCoupon, getCoupons,
  assignDriverToOrder,
  getWorkshops, saveWorkshop, deleteWorkshop,
  getDeliveryZones, saveDeliveryZone, deleteDeliveryZone,
  getTechnicalDocuments, saveTechnicalDocument, deleteTechnicalDocument,
  getCaseStudies, saveCaseStudy, deleteCaseStudy,
  getApplicators, saveApplicator, deleteApplicator,
  createInvoice, createPayment,
} from "@/app/cms-actions";
import { getAllDrivers } from "@/lib/driver-auth";
import { getAllContractors } from "@/lib/contractor-auth";
import { Product, CATEGORIES } from "@/lib/products";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

type Tab = "dashboard" | "orders" | "products" | "inventory" | "clients" | "contractors" | "reports" | "logs" | "settings" | "content";

const STATUS_CONFIG = {
  pending:    { label: "معلّق",        color: "#f59e0b", bg: "rgba(245,158,11,.12)" },
  confirmed:  { label: "مؤكد",         color: "#3b82f6", bg: "rgba(59,130,246,.12)" },
  processing: { label: "قيد التنفيذ",  color: "#8b5cf6", bg: "rgba(139,92,246,.12)" },
  delivered:  { label: "تم التوصيل",   color: "#10b981", bg: "rgba(16,185,129,.12)" },
  cancelled:  { label: "ملغي",         color: "#ef4444", bg: "rgba(239,68,68,.12)"  },
};

// Mock data removed in favor of real Firebase data

export default function AdminDashboard() {
  const router = useRouter();
  const [user,         setUser]        = useState<AdminUser | null>(null);
  const [tab,          setTab]         = useState<Tab>("dashboard");
  const [sidebarOpen,  setSidebarOpen] = useState(true);
  const [mounted,      setMounted]     = useState(false);

  // Data
  const [orders,       setOrders]      = useState<any[]>([]);
  const [inventory,    setInventory]   = useState<Product[]>([]);
  const [clients,      setClients]     = useState<any[]>([]);
  const [logs,         setLogs]        = useState<AuditLog[]>([]);

  // Filters
  const [searchOrders, setSearchOrders] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [ordersView, setOrdersView] = useState<"all" | "cancelled">("all");
  const [searchInv,    setSearchInv]    = useState("");
  const [searchProd,   setSearchProd]   = useState("");

  // Modals / forms
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [showAddForm,   setShowAddForm]   = useState(false);
  const [newProduct,    setNewProduct]    = useState({ nameAr: "", brand: "", priceBase: "", imageUrl: "", categoryId: "waterproof" });
  const [saving,        setSaving]        = useState(false);
  const [toast,         setToast]         = useState<string | null>(null);
  const [contentSection, setContentSection] = useState<"submissions" | "faq" | "blog" | "banners" | "coupons" | "workshops" | "delivery" | "documents" | "cases" | "applicators" | "billing">("submissions");
  const [submissions, setSubmissions] = useState<Record<string, any[]>>({});
  const [faqItems, setFaqItems] = useState<any[]>([]);
  const [blogPosts, setBlogPosts] = useState<any[]>([]);
  const [banners, setBanners] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [newCoupon, setNewCoupon] = useState({ code: "", discountPercent: "10", expiresAt: "" });
  const [workshops, setWorkshops] = useState<any[]>([]);
  const [newWorkshop, setNewWorkshop] = useState({ title: "", instructor: "", date: "", location: "", availableSeats: "20" });
  const [deliveryZones, setDeliveryZones] = useState<any[]>([]);
  const [newZone, setNewZone] = useState({ city: "", estimatedDays: "", fees: "0", conditions: "" });
  const [documents, setDocuments] = useState<any[]>([]);
  const [newDoc, setNewDoc] = useState({ title: "", docType: "TDS", fileUrl: "", brandId: "" });
  const [caseStudies, setCaseStudies] = useState<any[]>([]);
  const [newCase, setNewCase] = useState({ title: "", owner: "", status: "منجز", description: "", imageUrls: "", productIds: "" });
  const [applicators, setApplicators] = useState<any[]>([]);
  const [newApp, setNewApp] = useState({ name: "", systemSpecialty: "", phone: "", city: "", certifications: "" });
  const contractorsList = getAllContractors();
  const [newInvoice, setNewInvoice] = useState({ contractorId: "", number: "", amount: "", description: "" });
  const [newPayment, setNewPayment] = useState({ contractorId: "", amount: "", method: "cash", note: "" });

  // Load data
  const reload = useCallback(() => {
    getProducts().then(setInventory);
    getOrders().then(setOrders);
    getRealUsers().then(setClients);
    getLogs().then(setLogs);
    Promise.all([
      getSubmissions("sample_requests"),
      getSubmissions("contact_messages"),
      getSubmissions("career_applications"),
      getSubmissions("appointments"),
      getSubmissions("return_requests"),
      getSubmissions("satisfaction_surveys"),
      getSubmissions("tender_requests"),
      getSubmissions("restock_alerts"),
      getSubmissions("tool_warranties"),
      getSubmissions("site_visits"),
      getSubmissions("workshop_registrations"),
    ]).then(([a, b, c, d, e, f, g, h, i, j, k]) => setSubmissions({
      sample_requests: a, contact_messages: b, career_applications: c,
      appointments: d, return_requests: e, satisfaction_surveys: f,
      tender_requests: g, restock_alerts: h, tool_warranties: i,
      site_visits: j, workshop_registrations: k,
    }));
    getFaqItems().then(setFaqItems);
    getBlogPosts().then(setBlogPosts);
    getAllBanners().then(setBanners);
    getCoupons().then(setCoupons);
    getWorkshops().then(setWorkshops);
    getDeliveryZones().then(setDeliveryZones);
    getTechnicalDocuments().then(setDocuments);
    getCaseStudies().then(setCaseStudies);
    getApplicators().then(setApplicators);
  }, []);

  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    // Polling for Admin notifications
    const fetchNotifs = async () => {
      try {
        const notifs = await getAdminNotifications();
        if (notifications.length > 0 && notifs.length > 0) {
          const latest = notifs[0];
          const hadIt = notifications.find(n => n.id === latest.id);
          if (latest.id && !hadIt) {
            showToast(`🔔 ${latest.title}: ${latest.body}`);
          }
        }
        setNotifications(notifs);
      } catch (err) {
        console.error("Notifications error:", err);
      }
    };
    
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 10000);
    return () => clearInterval(interval);
  }, [notifications.length]); // depend on length to only trigger toast on new items safely

  useEffect(() => {
    setMounted(true);
    const session = getSession();
    if (!session) { router.replace("/admin/login"); return; }
    setUser(session);
    reload();
  }, [router, reload]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleLogout = () => { logout(); router.replace("/admin/login"); };

  const handleUpdateStatus = async (id: string, status: string) => {
    await updateOrderAPI(id, status);
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
    if (selectedOrder?.id === id) setSelectedOrder((p: any) => ({ ...p, status }));
    addLog({ user: user?.username || "unknown", action: `تغيير حالة الطلب ${id} إلى ${status}`, type: "order" });

    // ── إرسال رسالة واتساب تلقائية عند تغيير الحالة ──
    const order = orders.find(o => o.id === id);
    if (order?.phone) {
      const endpoint =
        status === "confirmed"  ? "order-confirmed"  :
        status === "delivered"  ? "order-delivered"  :
        status === "cancelled"  ? "order-cancelled"  : null;

      if (endpoint) {
        try {
          await fetch(`http://localhost:3500/${endpoint}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              phone: order.phone,
              clientName: order.client || "عميلنا العزيز",
              orderId: id,
              total: order.total || 0,
            }),
          });
          showToast("✅ تم تحديث الطلب وإرسال رسالة واتساب!");
        } catch {
          showToast("✅ تم تحديث الطلب (البوت غير متصل)");
        }
        return;
      }
    }
    showToast("✅ تم تحديث حالة الطلب");
  };


  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const p: Product = {
      id: "PROD-" + Math.floor(Math.random() * 90000 + 10000),
      categoryId: newProduct.categoryId,
      brand: newProduct.brand,
      imageUrl: newProduct.imageUrl || "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600",
      priceBase: Number(newProduct.priceBase),
      inStock: true, rating: 5, reviewCount: 0, certificates: [],
      nameAr: newProduct.nameAr, nameEn: newProduct.nameAr,
      descriptionAr: "", descriptionEn: "", unit: "قطعة", specAr: [], specEn: [],
    };
    await addProduct(p);
    setInventory(prev => [...prev, p]);
    addLog({ user: user?.username || "unknown", action: `إضافة منتج جديد ${p.id}`, type: "product" });
    setNewProduct({ nameAr: "", brand: "", priceBase: "", imageUrl: "", categoryId: "waterproof" });
    setShowAddForm(false);
    setSaving(false);
    showToast("✅ تم إضافة المنتج بنجاح");
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا المنتج؟")) return;
    await deleteProduct(id);
    setInventory(prev => prev.filter(p => p.id !== id));
    addLog({ user: user?.username || "unknown", action: `حذف منتج ${id}`, type: "product" });
    showToast("🗑️ تم حذف المنتج");
  };

  const exportOrdersPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Orders Report - Al-Showla Al-Raeda', 14, 22);
    
    const tableColumn = ["Order ID", "Client", "Phone", "Status", "Items", "Total (LYD)", "Date"];
    const tableRows: any[] = [];

    orders.forEach(o => {
      const date = o.date ? new Date(o.date).toLocaleDateString() : "-";
      tableRows.push([
        o.id, o.client || "Unknown", o.phone || "-", o.status, 
        o.items || 0, o.total || 0, date
      ]);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 30,
    });
    
    doc.save(`orders_report_${new Date().getTime()}.pdf`);
    showToast("📄 تم تصدير التقرير بنجاح");
  };

  const exportOrdersCSV = () => {
    const headers = ["Order ID", "Client", "Phone", "Status", "Items", "Total", "Date"];
    const rows = orders.map(o => [
      o.id, o.client || "", o.phone || "", o.status, o.items || 0, o.total || 0,
      o.date ? new Date(o.date).toLocaleDateString() : "",
    ]);
    const csv = [headers, ...rows].map(r => r.map((c: unknown) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `orders_${Date.now()}.csv`;
    a.click();
    showToast("📊 تم تصدير CSV");
  };

  const adjustStock = async (productId: string, delta: number) => {
    const p = inventory.find(i => i.id === productId);
    if (!p) return;
    const newCount = Math.max(0, (p.stockCount ?? 50) + delta);
    const ok = await updateProductStockCount(productId, newCount);
    if (ok) {
      setInventory(inv => inv.map(i => i.id === productId ? { ...i, stockCount: newCount, inStock: newCount > 0 } : i));
      showToast("✅ تم تحديث المخزون");
    }
  };

  const sendWhatsAppInvoice = async (order: any) => {
    if (!order.phone) {
      alert("العميل ليس لديه رقم هاتف مسجل");
      return;
    }
    showToast("⏳ جاري إرسال الفاتورة عبر الواتساب...");
    try {
      const orderData = {
        orderId: order.id,
        date: order.date,
        clientName: order.client,
        phone: order.phone,
        total: order.total,
        details: order.details || []
      };
      
      const res = await fetch("http://localhost:3500/send-invoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderData })
      });
      
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          showToast("✅ تم إرسال الفاتورة للعميل بنجاح");
        } else {
          showToast("❌ " + (data.error || "فشل الإرسال"));
        }
      } else {
        showToast("❌ خطأ في الاتصال بسيرفر الواتساب");
      }
    } catch (e) {
      console.error(e);
      showToast("❌ تعذر إرسال الفاتورة");
    }
  };

  if (!mounted || !user) return (
    <div style={{ minHeight: "100vh", background: "#0a0f1e", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 40, height: 40, border: "3px solid rgba(255,255,255,.1)", borderTopColor: "#3b82f6", borderRadius: "50%", animation: "spin .8s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  /* ── Computed ── */
  const totalRevenue   = orders.filter(o => o.status === "delivered").reduce((s, o) => s + (o.total || 0), 0);
  const pendingOrders  = orders.filter(o => o.status === "pending").length;
  const lowStock       = inventory.filter(i => !i.inStock).length;
  const outOfStock     = inventory.filter(i => !i.inStock).length;

  const filteredOrders = orders.filter(o => {
    const q = searchOrders.toLowerCase();
    const matchSearch = (o.id?.toLowerCase().includes(q) || (o.client || "").includes(q));
    const matchStatus = filterStatus === "all" || o.status === filterStatus;
    const matchArchive = ordersView === "cancelled" ? o.status === "cancelled" : true;
    return matchSearch && matchStatus && matchArchive;
  });
  const filteredInv  = inventory.filter(p => (p.nameAr + p.nameEn + p.brand).toLowerCase().includes(searchInv.toLowerCase()));
  const filteredProd = inventory.filter(p => (p.nameAr + p.nameEn + p.brand).toLowerCase().includes(searchProd.toLowerCase()));

  // Group orders for Chart
  const salesData = (() => {
    const dataMap: Record<string, number> = {};
    orders.forEach(o => {
      const d = o.date ? new Date(o.date).toLocaleDateString('en-CA') : new Date().toLocaleDateString('en-CA');
      dataMap[d] = (dataMap[d] || 0) + (o.total || 0);
    });
    return Object.entries(dataMap).sort((a,b) => a[0].localeCompare(b[0])).map(([date, revenue]) => ({ date, revenue }));
  })();

  const navItems: { id: Tab; icon: string; label: string; access?: "products"|"orders"|"users"|"reports"|"settings"|"inventory" }[] = [
    { id: "dashboard",   icon: "📊", label: "لوحة التحكم" },
    { id: "orders",      icon: "📦", label: "الطلبات",       access: "orders" },
    { id: "products",    icon: "🏗️", label: "المنتجات",     access: "products" },
    { id: "inventory",   icon: "📋", label: "المخزون",       access: "inventory" },
    { id: "clients",     icon: "👥", label: "العملاء",       access: "users" },
    { id: "contractors", icon: "👷", label: "المقاولون",    access: "users" },
    { id: "reports",     icon: "📈", label: "التقارير",      access: "reports" },
    { id: "content",     icon: "📝", label: "المحتوى",       access: "settings" },
    { id: "logs",        icon: "🔍", label: "سجل العمليات" },
    { id: "settings",    icon: "⚙️", label: "الإعدادات",    access: "settings" },
  ];

  const S = {
    layout:  { display: "flex", minHeight: "100vh", background: "radial-gradient(ellipse at top right, #0d1b2a, #000000)", fontFamily: "'Cairo', sans-serif" } as React.CSSProperties,
    sidebar: { width: sidebarOpen ? 240 : 70, background: "rgba(10, 15, 30, 0.6)", backdropFilter: "blur(12px)", borderInlineEnd: "1px solid rgba(255,255,255,.05)", transition: "width .4s cubic-bezier(0.4, 0, 0.2, 1)", flexShrink: 0, display: "flex", flexDirection: "column" as const, overflow: "hidden" },
    main:    { flex: 1, display: "flex", flexDirection: "column" as const, overflow: "hidden" },
    header:  { background: "rgba(10, 15, 30, 0.4)", backdropFilter: "blur(10px)", borderBottom: "1px solid rgba(255,255,255,.05)", padding: "0 28px", height: 70, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 },
    content: { flex: 1, padding: 32, overflowY: "auto" as const },
    card:    { background: "rgba(20, 25, 40, 0.5)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,.05)", borderRadius: 16, padding: 24, boxShadow: "0 4px 24px -4px rgba(0,0,0,0.3)" },
    h2:      { fontSize: 18, fontWeight: 900, color: "#fff", margin: "0 0 24px", letterSpacing: "0.5px" },
    inp:     { width: "100%", padding: "12px 16px", background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.08)", color: "#fff", fontFamily: "'Cairo',sans-serif", fontSize: 14, outline: "none", borderRadius: 8, transition: "all 0.3s" } as React.CSSProperties,
  };

  return (
    <div style={S.layout} dir="rtl" lang="ar">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800;900&display=swap');
        * { box-sizing:border-box; margin:0; padding:0; }
        body { font-family:'Cairo',sans-serif; background-color:#050a15; color:#e2e8f0; }
        ::-webkit-scrollbar{width:6px;height:6px} ::-webkit-scrollbar-track{background:rgba(0,0,0,0.2)} ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1); border-radius:10px;} ::-webkit-scrollbar-thumb:hover{background:rgba(255,255,255,0.2)}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:none}}
        @keyframes slideIn{from{opacity:0;transform:translateX(40px)}to{opacity:1;transform:none}}
        @keyframes pulseGlow{0%{box-shadow:0 0 0 0 rgba(59,130,246,0.4)}70%{box-shadow:0 0 0 10px rgba(59,130,246,0)}100%{box-shadow:0 0 0 0 rgba(59,130,246,0)}}
        .fade-up { animation: fadeUp .4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .nav-item { display:flex; align-items:center; gap:14px; padding:12px 20px; cursor:pointer; transition:all .3s cubic-bezier(0.4, 0, 0.2, 1); color:rgba(255,255,255,.5); font-size:14px; font-weight:700; border-inline-start:4px solid transparent; white-space:nowrap; border:none; background:none; width:100%; font-family:'Cairo',sans-serif; position:relative; overflow:hidden;}
        .nav-item::before { content:''; position:absolute; top:0; left:0; right:0; bottom:0; background:linear-gradient(90deg, rgba(59,130,246,0.15) 0%, transparent 100%); opacity:0; transition:opacity .3s; pointer-events:none; }
        .nav-item:hover { color:rgba(255,255,255,.9); }
        .nav-item:hover::before { opacity:1; }
        .nav-item.active { color:#fff; border-inline-start:4px solid #3b82f6; text-shadow: 0 0 12px rgba(59,130,246,0.5); }
        .nav-item.active::before { opacity:1; background:linear-gradient(90deg, rgba(59,130,246,0.2) 0%, transparent 100%); }
        .nav-item.disabled { opacity:.3; cursor:not-allowed; }
        .stat-card { background:rgba(255,255,255,0.02); backdrop-filter:blur(10px); border:1px solid rgba(255,255,255,.04); border-radius:16px; padding:24px; transition:all .3s cubic-bezier(0.4, 0, 0.2, 1); position:relative; overflow:hidden; }
        .stat-card::after { content:''; position:absolute; inset:0; border-radius:16px; padding:1px; background:linear-gradient(135deg, rgba(255,255,255,0.1), transparent); -webkit-mask:linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0); -webkit-mask-composite:xor; mask-composite:exclude; pointer-events:none; }
        .stat-card:hover { transform:translateY(-4px); box-shadow:0 12px 30px -10px rgba(0,0,0,0.5); background:rgba(255,255,255,0.03); }
        .tbl-row { border-bottom:1px solid rgba(255,255,255,.03); transition:all .2s; }
        .tbl-row:hover { background:rgba(255,255,255,.02); }
        .tbl-row.clickable { cursor:pointer; }
        .action-btn { padding:8px 16px; border:1px solid rgba(255,255,255,.08); background:rgba(255,255,255,0.02); color:rgba(255,255,255,.7); cursor:pointer; font-family:'Cairo',sans-serif; font-size:12px; font-weight:700; border-radius:8px; transition:all .2s; display:inline-flex; align-items:center; justify-content:center; gap:8px;}
        .action-btn:hover { background:rgba(255,255,255,.06); color:#fff; border-color:rgba(255,255,255,.2); box-shadow:0 4px 12px rgba(0,0,0,0.1); }
        .action-btn.primary { background:linear-gradient(135deg, #0051a2, #003578); border:none; color:#fff; box-shadow:0 4px 15px rgba(0, 81, 162, 0.4); }
        .action-btn.primary:hover { background:linear-gradient(135deg, #0066cc, #004499); box-shadow:0 6px 20px rgba(0, 81, 162, 0.6); transform:translateY(-1px); }
        .action-btn.danger { border-color:rgba(239,68,68,.3); color:#ef4444; background:rgba(239,68,68,0.05); }
        .action-btn.danger:hover { background:rgba(239,68,68,.15); border-color:rgba(239,68,68,.5); box-shadow:0 4px 15px rgba(239,68,68,0.2); }
        .badge { padding:4px 12px; border-radius:20px; font-size:11px; font-weight:800; letter-spacing:.02em; display:inline-flex; align-items:center; gap:6px; }
        input:focus, select:focus, textarea:focus { border-color:rgba(59,130,246,0.5) !important; box-shadow:0 0 0 3px rgba(59,130,246,0.15) !important; }
        input::placeholder { color:rgba(255,255,255,.2); }
        select option { background:#0d1b2a; color:#fff; }
        .sidebar-logo { padding:24px 20px; border-bottom:1px solid rgba(255,255,255,.05); display:flex; align-items:center; gap:14px; overflow:hidden; }
        .prod-card { background:rgba(255,255,255,0.015); border:1px solid rgba(255,255,255,.04); border-radius:14px; padding:16px; display:flex; gap:16px; transition:all .3s; }
        .prod-card:hover { background:rgba(255,255,255,0.03); border-color:rgba(255,255,255,.1); transform:translateY(-2px); box-shadow:0 8px 24px rgba(0,0,0,0.2); }
      `}</style>

      {/* ════ TOAST ════ */}
      {toast && (
        <div style={{ position:"fixed", bottom:32, left:"50%", transform:"translateX(-50%)", background:"rgba(15,25,50,0.9)", backdropFilter:"blur(16px)", border:"1px solid rgba(255,255,255,.1)", color:"#fff", padding:"14px 28px", borderRadius:14, fontSize:14, fontWeight:800, zIndex:99999, animation:"slideIn .4s cubic-bezier(0.16, 1, 0.3, 1)", boxShadow:"0 8px 40px rgba(0,0,0,.6), 0 0 0 1px rgba(59,130,246,0.2)", whiteSpace:"nowrap" }}>
          {toast}
        </div>
      )}

      {/* ════ ORDER DETAIL MODAL ════ */}
      {selectedOrder && (
        <div onClick={() => setSelectedOrder(null)} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.7)", backdropFilter:"blur(8px)", zIndex:9999, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
          <div onClick={e => e.stopPropagation()} style={{ background:"rgba(10,18,35,0.95)", backdropFilter:"blur(20px)", border:"1px solid rgba(255,255,255,.1)", borderRadius:20, width:"100%", maxWidth:600, maxHeight:"90vh", overflowY:"auto", padding:32, animation:"fadeUp .35s cubic-bezier(0.16, 1, 0.3, 1)", boxShadow:"0 25px 60px rgba(0,0,0,0.8), 0 0 0 1px rgba(59,130,246,0.15)" }}>
            {/* Modal Header */}
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:24 }}>
              <div>
                <div style={{ fontSize:11, color:"rgba(255,255,255,.4)", letterSpacing:".12em", marginBottom:6, textTransform:"uppercase" }}>تفاصيل الطلب</div>
                <div style={{ fontSize:26, fontWeight:900, color:"#3b82f6", textShadow:"0 0 20px rgba(59,130,246,0.5)" }}>{selectedOrder.id}</div>
              </div>
              <button onClick={() => setSelectedOrder(null)} style={{ background:"rgba(255,255,255,.06)", border:"1px solid rgba(255,255,255,.08)", color:"rgba(255,255,255,0.7)", width:40, height:40, borderRadius:12, fontSize:18, cursor:"pointer", transition:"all 0.2s", display:"flex", alignItems:"center", justifyContent:"center" }}>✕</button>
            </div>

            {/* Status Badge */}
            {(() => { const st = STATUS_CONFIG[selectedOrder.status as keyof typeof STATUS_CONFIG]; return st ? <span className="badge" style={{ background:st.bg, color:st.color, fontSize:13, padding:"8px 20px", marginBottom:24, display:"inline-flex", border:`1px solid ${st.color}40`, boxShadow:`0 0 20px ${st.bg}` }}>● {st.label}</span> : null; })()}

            {/* Info Grid */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginTop:16, marginBottom:24 }}>
              {[
                { lbl:"العميل",        val: selectedOrder.client || "—" },
                { lbl:"رقم الهاتف",   val: (
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <span>{selectedOrder.phone || "—"}</span>
                    {selectedOrder.phone && (
                      <a href={`https://wa.me/${selectedOrder.phone.replace(/\D/g, "")}?text=${encodeURIComponent(`مرحباً ${selectedOrder.client}، بخصوص طلبك رقم ${selectedOrder.id}`)}`} target="_blank" rel="noreferrer" style={{ background:"linear-gradient(135deg,#25D366,#128C7E)", color:"#fff", padding:"3px 8px", borderRadius:6, textDecoration:"none", fontSize:11, fontWeight:800, boxShadow:"0 2px 8px rgba(37,211,102,0.4)" }}>
                        💬 واتساب
                      </a>
                    )}
                  </div>
                ) },
                { lbl:"عدد المنتجات", val: selectedOrder.items  ?? "—" },
                { lbl:"الإجمالي",     val: `${(selectedOrder.total || 0).toLocaleString()} د.ل` },
                { lbl:"التاريخ",      val: selectedOrder.date ? new Date(selectedOrder.date).toLocaleString("ar-LY") : "—" },
                { lbl:"ملاحظات",      val: selectedOrder.notes || "لا توجد ملاحظات" },
              ].map(({ lbl, val }) => (
                <div key={lbl} style={{ background:"rgba(255,255,255,.03)", borderRadius:12, padding:"14px 16px", border:"1px solid rgba(255,255,255,0.05)" }}>
                  <div style={{ fontSize:10, fontWeight:800, color:"rgba(255,255,255,.35)", letterSpacing:".1em", marginBottom:6, textTransform:"uppercase" }}>{lbl}</div>
                  <div style={{ fontSize:14, fontWeight:800, color:"#fff" }}>{typeof val === "object" ? val : String(val)}</div>
                </div>
              ))}
            </div>

            {/* Products ordered */}
            {Array.isArray(selectedOrder.details) && selectedOrder.details.length > 0 && (
              <div style={{ marginBottom:24 }}>
                <div style={{ fontSize:11, fontWeight:800, color:"rgba(255,255,255,.4)", letterSpacing:".1em", marginBottom:12, textTransform:"uppercase" }}>المنتجات المطلوبة</div>
                {selectedOrder.details.map((d: any, i: number) => (
                  <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"12px 16px", background:"rgba(255,255,255,.025)", borderRadius:10, marginBottom:8, border:"1px solid rgba(255,255,255,0.04)" }}>
                    <span style={{ fontSize:13, fontWeight:700, color:"rgba(255,255,255,.8)" }}>🏗️ {d.productId}</span>
                    <span style={{ fontSize:14, fontWeight:900, color:"#3b82f6", background:"rgba(59,130,246,0.1)", padding:"2px 10px", borderRadius:8 }}>× {d.quantity}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Change status buttons */}
            <div style={{ borderTop:"1px solid rgba(255,255,255,0.06)", paddingTop:20 }}>
              <div style={{ fontSize:11, fontWeight:800, color:"rgba(255,255,255,.4)", letterSpacing:".1em", marginBottom:14, textTransform:"uppercase" }}>تغيير حالة الطلب</div>
              <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
                {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                  <button key={k}
                    onClick={() => handleUpdateStatus(selectedOrder.id, k)}
                    style={{ padding:"9px 18px", borderRadius:10, border:`1.5px solid ${v.color}40`, background: selectedOrder.status === k ? v.bg : "rgba(255,255,255,0.02)", color: selectedOrder.status === k ? v.color : "rgba(255,255,255,0.5)", fontSize:13, fontWeight:800, cursor:"pointer", fontFamily:"'Cairo',sans-serif", transition:"all .2s", boxShadow: selectedOrder.status === k ? `0 0 20px ${v.bg}` : "none" }}>
                    {v.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Driver assignment */}
            <div style={{ marginTop:20, borderTop:"1px solid rgba(255,255,255,0.06)", paddingTop:20 }}>
              <div style={{ fontSize:11, fontWeight:800, color:"rgba(255,255,255,.4)", letterSpacing:".1em", marginBottom:14, textTransform:"uppercase" }}>تعيين سائق 🚚</div>
              <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
                {getAllDrivers().map(d => (
                  <button key={d.id} className="action-btn"
                    onClick={async () => {
                      const ok = await assignDriverToOrder(selectedOrder.id, d.id, d.name);
                      if (ok) {
                        setSelectedOrder((p: any) => ({ ...p, driverId: d.id, driverName: d.name }));
                        setOrders(prev => prev.map(o => o.id === selectedOrder.id ? { ...o, driverId: d.id, driverName: d.name } : o));
                        showToast(`✅ تم تعيين ${d.name}`);
                      }
                    }}>
                    {d.name}
                  </button>
                ))}
                {selectedOrder.driverName && <span className="badge" style={{ background:"rgba(59,130,246,.15)", color:"#3b82f6" }}>السائق: {selectedOrder.driverName}</span>}
              </div>
            </div>

            {/* Send Invoice Button */}
            <div style={{ marginTop:24 }}>
              <button onClick={() => sendWhatsAppInvoice(selectedOrder)} style={{ width:"100%", padding:"14px", background:"linear-gradient(135deg, #25D366, #128C7E)", border:"none", borderRadius:12, color:"#fff", fontSize:15, fontWeight:800, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:10, boxShadow:"0 4px 15px rgba(37,211,102,0.3)", transition:"all 0.2s" }}>
                <span style={{ fontSize:20 }}>📄</span> إرسال الفاتورة عبر الواتساب
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════ SIDEBAR ════ */}
      <aside style={S.sidebar}>
        <div className="sidebar-logo">
          <div style={{ width:38, height:38, background:"linear-gradient(135deg, #3b82f6, #001f4d)", borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, fontSize:20, boxShadow:"0 0 20px rgba(59,130,246,0.5)" }}>🔥</div>
          {sidebarOpen && <div style={{ overflow:"hidden" }}><div style={{ fontSize:15, fontWeight:900, color:"#fff", whiteSpace:"nowrap", textShadow:"0 2px 4px rgba(0,0,0,0.5)" }}>الشعلة الرائدة</div><div style={{ fontSize:10, color:"rgba(255,255,255,.4)", letterSpacing:".1em" }}>ADMIN PANEL</div></div>}
        </div>

        <nav style={{ flex:1, padding:"12px 0", overflowY:"auto" }}>
          {navItems.map(item => {
            const disabled = item.access ? !canAccess(user, item.access) : false;
            return (
              <button key={item.id}
                className={`nav-item${tab === item.id ? " active" : ""}${disabled ? " disabled" : ""}`}
                onClick={() => !disabled && setTab(item.id)}>
                <span style={{ fontSize:16, flexShrink:0 }}>{item.icon}</span>
                {sidebarOpen && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        <div style={{ padding:"12px 0", borderTop:"1px solid rgba(255,255,255,.06)" }}>
          <button className="nav-item" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <span style={{ fontSize:16 }}>{sidebarOpen ? "◀" : "▶"}</span>
            {sidebarOpen && <span>طي القائمة</span>}
          </button>
          <button className="nav-item" onClick={handleLogout} style={{ color:"rgba(239,68,68,.7)" }}>
            <span style={{ fontSize:16 }}>🚪</span>
            {sidebarOpen && <span>تسجيل الخروج</span>}
          </button>
        </div>
      </aside>

      {/* ════ MAIN ════ */}
      <div style={S.main}>
        {/* HEADER */}
        <header style={S.header}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <span style={{ fontSize:20, filter:"drop-shadow(0 2px 4px rgba(0,0,0,0.3))" }}>{navItems.find(n => n.id === tab)?.icon}</span>
            <span style={{ fontSize:18, fontWeight:900, color:"#fff", letterSpacing: "0.5px" }}>{navItems.find(n => n.id === tab)?.label}</span>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:16 }}>
            <div style={{ position:"relative", cursor:"pointer" }} title="الإشعارات" onClick={() => setNotifications(prev => prev.map(n => ({...n, read: true})))}>
              <span style={{ fontSize:22 }}>🔔</span>
              {notifications.filter(n => !n.read).length > 0 && (
                <span style={{ position:"absolute", top:-4, right:-4, background:"#ef4444", color:"#fff", fontSize:10, fontWeight:900, width:18, height:18, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 2px 8px rgba(239,68,68,0.5)" }}>
                  {notifications.filter(n => !n.read).length}
                </span>
              )}
            </div>
            <button className="action-btn" onClick={reload} title="تحديث البيانات">🔄 تحديث</button>
            <div style={{ textAlign:"left", background:"rgba(255,255,255,0.03)", padding:"6px 12px", borderRadius:8, border:"1px solid rgba(255,255,255,0.05)" }}>
              <div style={{ fontSize:14, fontWeight:800, color:"#fff" }}>{user.nameAr} {user.avatar}</div>
              <div style={{ fontSize:10, color:"rgba(255,255,255,.4)", letterSpacing:".1em" }}>{user.role.toUpperCase()}</div>
            </div>
            <a href="/" target="_blank" className="action-btn primary" style={{ textDecoration:"none" }}>
              🌐 الموقع
            </a>
          </div>
        </header>

        <main style={S.content}>

          {/* ══ DASHBOARD ══ */}
          {tab === "dashboard" && (
            <div className="fade-up">
              {/* Stats */}
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))", gap:20, marginBottom:32 }}>
                {[
                  { ico:"💰", label:"الإيرادات (مسلّمة)",   value:`${totalRevenue.toLocaleString()} د.ل`, color:"#10b981", glow: "rgba(16,185,129,0.3)" },
                  { ico:"📦", label:"إجمالي الطلبات",        value:orders.length,    sub:`${pendingOrders} معلّق`,   color:"#3b82f6", glow: "rgba(59,130,246,0.3)" },
                  { ico:"🏗️", label:"المنتجات في الكتالوج", value:inventory.length, sub:"في قاعدة البيانات",        color:"#8b5cf6", glow: "rgba(139,92,246,0.3)" },
                  { ico:"⚠️", label:"تنبيهات المخزون",       value:lowStock + outOfStock, sub:`${outOfStock} نفد`, color:"#f59e0b", glow: "rgba(245,158,11,0.3)" },
                ].map((s, i) => (
                  <div key={i} className="stat-card">
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                      <div>
                        <div style={{ fontSize:12, fontWeight:700, color:"rgba(255,255,255,.5)", marginBottom:10 }}>{s.label}</div>
                        <div style={{ fontSize:32, fontWeight:900, color:s.color, textShadow: `0 0 20px ${s.glow}` }}>{s.value}</div>
                        {s.sub && <div style={{ fontSize:11, color:"rgba(255,255,255,.4)", marginTop:6, fontWeight:600 }}>{s.sub}</div>}
                      </div>
                      <div style={{ fontSize:32, background: "rgba(255,255,255,0.03)", padding: 12, borderRadius: 12, border: "1px solid rgba(255,255,255,0.05)", filter: `drop-shadow(0 0 10px ${s.glow})` }}>{s.ico}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Charts Section */}
              <div style={{ ...S.card, marginBottom: 28, paddingBottom: 40 }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
                  <h2 style={{ ...S.h2, margin:0 }}>إيرادات المبيعات</h2>
                  <div style={{ fontSize:12, color:"rgba(255,255,255,0.4)", fontWeight:700 }}>آخر 30 يوم</div>
                </div>
                <div style={{ width: '100%', height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={salesData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.5}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                      <XAxis dataKey="date" stroke="rgba(255,255,255,0.3)" fontSize={11} tickLine={false} axisLine={false} />
                      <YAxis stroke="rgba(255,255,255,0.3)" fontSize={11} tickLine={false} axisLine={false} />
                      <RechartsTooltip
                        contentStyle={{ backgroundColor: 'rgba(10,18,35,0.95)', backdropFilter:'blur(10px)', border: '1px solid rgba(59,130,246,0.3)', borderRadius: 10, color: '#fff', boxShadow:'0 8px 30px rgba(0,0,0,0.5)' }}
                        itemStyle={{ color: '#3b82f6', fontWeight:800 }}
                        labelStyle={{ color: 'rgba(255,255,255,0.6)', fontWeight:700 }}
                      />
                      <Area type="monotone" dataKey="revenue" name="الإيرادات" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>
                {/* Recent Orders */}
                <div style={S.card}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
                    <h2 style={{ ...S.h2, margin:0 }}>آخر الطلبات</h2>
                    <button className="action-btn" onClick={() => setTab("orders")}>عرض الكل ←</button>
                  </div>
                  {orders.length === 0 ? (
                    <div style={{ textAlign:"center", padding:"30px 0", color:"rgba(255,255,255,.3)", fontSize:13 }}>لا توجد طلبات بعد</div>
                  ) : orders.slice(-5).reverse().map((o: any) => {
                    const st = STATUS_CONFIG[o.status as keyof typeof STATUS_CONFIG];
                    return (
                      <div key={o.id} onClick={() => setSelectedOrder(o)} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"12px 0", borderBottom:"1px solid rgba(255,255,255,.04)", cursor:"pointer", transition:"all 0.2s" }}>
                        <div>
                          <div style={{ fontSize:13, fontWeight:900, color:"#3b82f6" }}>{o.id}</div>
                          <div style={{ fontSize:11, fontWeight:600, color:"rgba(255,255,255,.5)", marginTop:3 }}>{o.client}</div>
                        </div>
                        <div style={{ textAlign:"left" }}>
                          <div style={{ fontSize:13, fontWeight:900, color:"#10b981" }}>{(o.total||0).toLocaleString()} د.ل</div>
                          {st && <span className="badge" style={{ background:st.bg, color:st.color, marginTop:2 }}>{st.label}</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Low Stock Alert */}
                <div style={S.card}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
                    <h2 style={{ ...S.h2, margin:0 }}>تنبيهات المخزون ⚠️</h2>
                    <button className="action-btn" onClick={() => setTab("inventory")}>إدارة المخزون</button>
                  </div>
                  {inventory.filter(i => (i.stockCount ?? 50) <= (i.minStockCount ?? 20)).length === 0 ? (
                    <div style={{ textAlign:"center", padding:"30px 0", color:"#10b981", fontSize:13 }}>✅ المخزون في حالة جيدة</div>
                  ) : inventory.filter(i => (i.stockCount ?? 50) <= (i.minStockCount ?? 20)).slice(0, 5).map(p => (
                    <div key={p.id} style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 0", borderBottom:"1px solid rgba(255,255,255,.04)" }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={p.imageUrl} alt="" style={{ width:36, height:28, objectFit:"cover", borderRadius:3, flexShrink:0 }} />
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontSize:12, fontWeight:700, color:"#fff", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{p.nameAr}</div>
                        <div style={{ fontSize:10, color:"rgba(255,255,255,.35)" }}>{p.brand}</div>
                      </div>
                      <span className="badge" style={{ background:(p.stockCount??50)===0 ? "rgba(239,68,68,.12)" : "rgba(245,158,11,.12)", color:(p.stockCount??50)===0 ? "#ef4444" : "#f59e0b", flexShrink:0 }}>
                        {(p.stockCount??50)===0 ? "نفد" : `${p.stockCount??50} قطعة`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ══ ORDERS ══ */}
          {tab === "orders" && (
            <div className="fade-up">
              <div style={{ display:"flex", gap:10, marginBottom:20, flexWrap:"wrap", alignItems:"center" }}>
                <input value={searchOrders} onChange={e => setSearchOrders(e.target.value)} placeholder="🔍 بحث برقم الطلب أو اسم العميل..." style={{ ...S.inp, maxWidth:300 }} />
                <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ ...S.inp, width:"auto", cursor:"pointer" }}>
                  <option value="all">كل الحالات</option>
                  {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
                <select value={ordersView} onChange={e => setOrdersView(e.target.value as "all" | "cancelled")} style={{ ...S.inp, width:"auto", cursor:"pointer" }}>
                  <option value="all">كل الطلبات</option>
                  <option value="cancelled">أرشيف الملغاة</option>
                </select>
                <button onClick={exportOrdersPDF} className="action-btn primary" style={{ padding: "0 16px", height: 38 }}>📤 PDF</button>
                <button onClick={exportOrdersCSV} className="action-btn" style={{ padding: "0 16px", height: 38 }}>📊 CSV</button>
                <div style={{ marginInlineStart:"auto", fontSize:13, color:"rgba(255,255,255,.4)", fontWeight:700 }}>{filteredOrders.length} طلب</div>
              </div>

              {filteredOrders.length === 0 ? (
                <div style={{ ...S.card, textAlign:"center", padding:60, color:"rgba(255,255,255,.3)", display:"flex", flexDirection:"column", alignItems:"center" }}>
                  <div style={{ fontSize:48, marginBottom:16, filter:"drop-shadow(0 4px 10px rgba(0,0,0,0.5))" }}>📭</div>
                  <div style={{ fontSize:18, fontWeight:800, color:"#fff" }}>لا توجد طلبات</div>
                  <div style={{ fontSize:13, marginTop:8, color:"rgba(255,255,255,0.4)" }}>سيظهر الطلب هنا فور إرساله من صفحة السلة</div>
                </div>
              ) : (
                <div style={{ ...S.card, padding: 0, overflow:"hidden" }}>
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width:"100%", borderCollapse:"collapse", minWidth: 800 }}>
                      <thead>
                        <tr style={{ background:"rgba(0,0,0,.2)" }}>
                          {["رقم الطلب","العميل","المنتجات","الإجمالي","الحالة","التاريخ","إجراء"].map(h => (
                            <th key={h} style={{ padding:"16px 20px", fontSize:11, fontWeight:800, color:"rgba(255,255,255,.5)", letterSpacing:".05em", textAlign:"right", textTransform:"uppercase" }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {filteredOrders.map((o: any) => {
                          const st = STATUS_CONFIG[o.status as keyof typeof STATUS_CONFIG];
                          return (
                            <tr key={o.id} className="tbl-row clickable" onClick={() => setSelectedOrder(o)}>
                              <td style={{ padding:"16px 20px", fontSize:13, fontWeight:900, color:"#3b82f6" }}>{o.id}</td>
                              <td style={{ padding:"16px 20px" }}>
                                <div style={{ fontSize:14, fontWeight:800, color:"#fff" }}>{o.client}</div>
                                <div style={{ fontSize:11, color:"rgba(255,255,255,.4)", marginTop:4 }}>{o.phone}</div>
                              </td>
                              <td style={{ padding:"16px 20px", fontSize:13, fontWeight:700, color:"rgba(255,255,255,.7)", textAlign:"center" }}>
                                <span style={{ background:"rgba(255,255,255,0.05)", padding:"4px 12px", borderRadius:12 }}>{o.items}</span>
                              </td>
                              <td style={{ padding:"16px 20px", fontSize:14, fontWeight:900, color:"#10b981" }}>{(o.total||0).toLocaleString()} د.ل</td>
                              <td style={{ padding:"16px 20px" }}>
                                <span className="badge" style={{ background:st?.bg, color:st?.color, border:`1px solid ${st?.color}40`, boxShadow:`0 0 10px ${st?.bg}` }}>{st?.label ?? o.status}</span>
                              </td>
                              <td style={{ padding:"16px 20px", fontSize:12, fontWeight:600, color:"rgba(255,255,255,.5)" }}>
                                {o.date ? new Date(o.date).toLocaleDateString("ar-LY") : "—"}
                              </td>
                              <td style={{ padding:"16px 20px" }} onClick={e => e.stopPropagation()}>
                                <select value={o.status} onChange={e => handleUpdateStatus(o.id, e.target.value)}
                                  style={{ ...S.inp, width:"auto", fontSize:12, padding:"6px 12px", cursor:"pointer", background:"rgba(0,0,0,0.3)" }}>
                                  {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                                </select>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ══ PRODUCTS ══ */}
          {tab === "products" && (
            <div className="fade-up">
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20, gap:10, flexWrap:"wrap" }}>
                <div style={{ display:"flex", gap:10, flex:1 }}>
                  <input value={searchProd} onChange={e => setSearchProd(e.target.value)} placeholder="🔍 بحث في المنتجات..." style={{ ...S.inp, maxWidth:280 }} />
                </div>
                <div style={{ display:"flex", gap:8 }}>
                  <button onClick={() => setShowAddForm(!showAddForm)} className="action-btn primary">
                    {showAddForm ? "✕ إغلاق" : "➕ إضافة منتج جديد"}
                  </button>
                  <a href="/products" target="_blank" className="action-btn" style={{ textDecoration:"none", display:"inline-flex", alignItems:"center", gap:4 }}>
                    🌐 عرض الكتالوج
                  </a>
                </div>
              </div>

              {/* Add Product Form */}
              {showAddForm && (
                <form onSubmit={handleAddProduct} style={{ ...S.card, marginBottom:20 }}>
                  <h3 style={{ fontSize:14, fontWeight:800, color:"#fff", marginBottom:16 }}>➕ منتج جديد</h3>
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))", gap:12 }}>
                    <div>
                      <div style={{ fontSize:10, fontWeight:700, color:"rgba(255,255,255,.4)", letterSpacing:".08em", marginBottom:6 }}>اسم المنتج *</div>
                      <input required value={newProduct.nameAr} onChange={e => setNewProduct({...newProduct, nameAr:e.target.value})} style={S.inp} placeholder="مثال: دهان واجهات" />
                    </div>
                    <div>
                      <div style={{ fontSize:10, fontWeight:700, color:"rgba(255,255,255,.4)", letterSpacing:".08em", marginBottom:6 }}>العلامة التجارية *</div>
                      <input required value={newProduct.brand} onChange={e => setNewProduct({...newProduct, brand:e.target.value})} style={S.inp} placeholder="مثال: Sika" />
                    </div>
                    <div>
                      <div style={{ fontSize:10, fontWeight:700, color:"rgba(255,255,255,.4)", letterSpacing:".08em", marginBottom:6 }}>السعر (د.ل) *</div>
                      <input required type="number" min="1" value={newProduct.priceBase} onChange={e => setNewProduct({...newProduct, priceBase:e.target.value})} style={S.inp} placeholder="مثال: 150" />
                    </div>
                    <div>
                      <div style={{ fontSize:10, fontWeight:700, color:"rgba(255,255,255,.4)", letterSpacing:".08em", marginBottom:6 }}>الفئة</div>
                      <select value={newProduct.categoryId} onChange={e => setNewProduct({...newProduct, categoryId:e.target.value})} style={{ ...S.inp, cursor:"pointer" }}>
                        {CATEGORIES.filter(c => c.id !== "all").map(c => <option key={c.id} value={c.id}>{c.icon} {c.nameAr}</option>)}
                      </select>
                    </div>
                    <div style={{ gridColumn:"1/-1" }}>
                      <div style={{ fontSize:10, fontWeight:700, color:"rgba(255,255,255,.4)", letterSpacing:".08em", marginBottom:6 }}>رابط الصورة (اختياري)</div>
                      <input value={newProduct.imageUrl} onChange={e => setNewProduct({...newProduct, imageUrl:e.target.value})} style={S.inp} placeholder="https://..." />
                    </div>
                  </div>
                  <div style={{ marginTop:16, display:"flex", gap:8 }}>
                    <button type="submit" disabled={saving} className="action-btn primary" style={{ padding:"10px 24px", fontSize:13 }}>
                      {saving ? "⏳ جاري الحفظ..." : "💾 حفظ المنتج"}
                    </button>
                    <button type="button" onClick={() => setShowAddForm(false)} className="action-btn">إلغاء</button>
                  </div>
                </form>
              )}

              <div style={{ fontSize:12, color:"rgba(255,255,255,.35)", marginBottom:12 }}>{filteredProd.length} منتج</div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))", gap:12 }}>
                {filteredProd.map(p => (
                  <div key={p.id} className="prod-card">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.imageUrl} alt={p.nameAr} style={{ width:64, height:52, objectFit:"cover", borderRadius:6, flexShrink:0 }} />
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:13, fontWeight:800, color:"#fff", lineHeight:1.3, marginBottom:2, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{p.nameAr}</div>
                      <div style={{ fontSize:11, color:"rgba(255,255,255,.35)" }}>{p.brand}</div>
                      <div style={{ display:"flex", justifyContent:"space-between", marginTop:8, alignItems:"center" }}>
                        <span style={{ fontSize:14, fontWeight:900, color:"#3b82f6" }}>{p.priceBase} د.ل</span>
                        <div style={{ display:"flex", gap:5, alignItems:"center" }}>
                          <span className="badge" style={{ background: p.inStock ? "rgba(16,185,129,.12)" : "rgba(239,68,68,.12)", color: p.inStock ? "#10b981" : "#ef4444" }}>
                            {p.inStock ? "متوفر" : "نفد"}
                          </span>
                          <button className="action-btn danger" onClick={() => handleDeleteProduct(p.id)} style={{ padding:"3px 8px", fontSize:10 }}>🗑️</button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ══ INVENTORY ══ */}
          {tab === "inventory" && (
            <div className="fade-up">
              <div style={{ display:"flex", gap:10, marginBottom:20, flexWrap:"wrap", alignItems:"center" }}>
                <input value={searchInv} onChange={e => setSearchInv(e.target.value)} placeholder="🔍 بحث في المخزون..." style={{ ...S.inp, maxWidth:300 }} />
                <div style={{ marginInlineStart:"auto", display:"flex", gap:20 }}>
                  <div style={{ textAlign:"center" }}><div style={{ fontSize:22, fontWeight:900, color:"#ef4444" }}>{outOfStock}</div><div style={{ fontSize:10, color:"rgba(255,255,255,.4)" }}>نفد</div></div>
                  <div style={{ textAlign:"center" }}><div style={{ fontSize:22, fontWeight:900, color:"#f59e0b" }}>{lowStock}</div><div style={{ fontSize:10, color:"rgba(255,255,255,.4)" }}>منخفض</div></div>
                  <div style={{ textAlign:"center" }}><div style={{ fontSize:22, fontWeight:900, color:"#10b981" }}>{inventory.length - lowStock - outOfStock}</div><div style={{ fontSize:10, color:"rgba(255,255,255,.4)" }}>جيد</div></div>
                </div>
              </div>

              <div style={{ background:"#111827", border:"1px solid rgba(255,255,255,.06)", borderRadius:10, overflow:"hidden" }}>
                <table style={{ width:"100%", borderCollapse:"collapse" }}>
                  <thead>
                    <tr style={{ background:"rgba(255,255,255,.04)" }}>
                      {["المنتج","العلامة","الكمية","الحد الأدنى","الحالة","تحديث"].map(h => (
                        <th key={h} style={{ padding:"12px 14px", fontSize:10, fontWeight:800, color:"rgba(255,255,255,.4)", letterSpacing:".08em", textAlign:"right" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredInv.map(p => {
                      const stock    = p.stockCount ?? 50;
                      const minStock = p.minStockCount ?? 20;
                      const pct      = Math.min(100, (stock / Math.max(minStock * 3, 1)) * 100);
                      const isLow    = stock <= minStock && stock > 0;
                      const isOut    = stock === 0;
                      return (
                        <tr key={p.id} className="tbl-row">
                          <td style={{ padding:"10px 14px" }}>
                            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={p.imageUrl} alt="" style={{ width:36, height:28, objectFit:"cover", borderRadius:4, flexShrink:0 }} />
                              <span style={{ fontSize:12, fontWeight:700, color:"#fff" }}>{p.nameAr}</span>
                            </div>
                          </td>
                          <td style={{ padding:"10px 14px", fontSize:11, color:"rgba(255,255,255,.5)" }}>{p.brand}</td>
                          <td style={{ padding:"10px 14px" }}>
                            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                              <div style={{ flex:1, height:4, background:"rgba(255,255,255,.08)", borderRadius:2, overflow:"hidden", minWidth:60 }}>
                                <div style={{ width:`${pct}%`, height:"100%", background: isOut ? "#ef4444" : isLow ? "#f59e0b" : "#10b981", borderRadius:2, transition:"width .5s" }} />
                              </div>
                              <span style={{ fontSize:12, fontWeight:800, color:"#fff", minWidth:32, textAlign:"center" }}>{stock}</span>
                            </div>
                          </td>
                          <td style={{ padding:"10px 14px", fontSize:11, color:"rgba(255,255,255,.4)", textAlign:"center" }}>{minStock}</td>
                          <td style={{ padding:"10px 14px" }}>
                            <span className="badge" style={{ background: isOut ? "rgba(239,68,68,.12)" : isLow ? "rgba(245,158,11,.12)" : "rgba(16,185,129,.12)", color: isOut ? "#ef4444" : isLow ? "#f59e0b" : "#10b981" }}>
                              {isOut ? "نفد" : isLow ? "منخفض" : "جيد"}
                            </span>
                          </td>
                          <td style={{ padding:"10px 14px" }}>
                            <div style={{ display:"flex", gap:4 }}>
                              <button className="action-btn" onClick={() => adjustStock(p.id, 50)}>+50</button>
                              <button className="action-btn danger" onClick={() => adjustStock(p.id, -10)}>−10</button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ══ CLIENTS ══ */}
          {tab === "clients" && (
            <div className="fade-up">
              <h2 style={S.h2}>قائمة العملاء ({clients.length})</h2>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:12 }}>
                {clients.map((c, i) => {
                  const clientOrders = orders.filter(o => o.phone === c.phoneNumber || o.userId === c.uid);
                  const clientTotal = clientOrders.reduce((sum, o) => sum + (o.total || 0), 0);
                  
                  return (
                  <div key={i} style={S.card}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:12 }}>
                      <div>
                        <div style={{ fontSize:14, fontWeight:800, color:"#fff" }}>{c.displayName !== "-" ? c.displayName : "عميل مسجل"}</div>
                        <div style={{ fontSize:11, color:"rgba(255,255,255,.4)", marginTop:2, display:"flex", alignItems:"center", gap:6 }}>
                          {c.email !== "-" ? c.email : c.phoneNumber}
                          {c.phoneNumber && c.phoneNumber !== "-" && (
                            <a href={`https://wa.me/${c.phoneNumber.replace(/\\D/g, "")}`} target="_blank" rel="noreferrer" style={{ color:"#25D366", textDecoration:"none", fontSize:14 }} title="مراسلة عبر واتساب">
                              💬
                            </a>
                          )}
                        </div>
                      </div>
                      <span className="badge" style={{ background:"rgba(16,185,129,.12)", color:"#10b981" }}>نشط</span>
                    </div>
                    <div style={{ display:"flex", gap:20 }}>
                      <div><div style={{ fontSize:20, fontWeight:900, color:"#3b82f6" }}>{clientOrders.length}</div><div style={{ fontSize:10, color:"rgba(255,255,255,.35)" }}>طلب</div></div>
                      <div><div style={{ fontSize:20, fontWeight:900, color:"#10b981" }}>{clientTotal.toLocaleString()}</div><div style={{ fontSize:10, color:"rgba(255,255,255,.35)" }}>د.ل إجمالي</div></div>
                    </div>
                  </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ══ REPORTS ══ */}
          {tab === "reports" && (
            <div className="fade-up">
              <h2 style={S.h2}>التقارير والإحصائيات</h2>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:16, marginBottom:24 }}>
                {[
                  { label:"إجمالي الإيرادات", val:`${totalRevenue.toLocaleString()} د.ل`, color:"#10b981" },
                  { label:"عدد الطلبات",       val: orders.length,                          color:"#3b82f6" },
                  { label:"المنتجات",           val: inventory.length,                       color:"#8b5cf6" },
                  { label:"معدل التوصيل",       val: orders.length ? Math.round((orders.filter(o=>o.status==="delivered").length/orders.length)*100)+"%" : "0%", color:"#f59e0b" },
                ].map((r, i) => (
                  <div key={i} className="stat-card">
                    <div style={{ fontSize:11, color:"rgba(255,255,255,.4)", marginBottom:8 }}>{r.label}</div>
                    <div style={{ fontSize:26, fontWeight:900, color:r.color }}>{r.val}</div>
                  </div>
                ))}
              </div>

              <div style={S.card}>
                <h3 style={{ fontSize:14, fontWeight:800, color:"#fff", marginBottom:16 }}>المبيعات حسب فئة المنتجات</h3>
                {(() => {
                  const categorySales = orders.reduce((acc, order) => {
                    if (!order.details) return acc;
                    order.details.forEach((item: any) => {
                      const prod = inventory.find(p => p.id === item.productId);
                      if (prod) {
                        acc[prod.categoryId] = (acc[prod.categoryId] || 0) + (item.quantity * prod.priceBase);
                      }
                    });
                    return acc;
                  }, {} as Record<string, number>);
                  const totalCatSales = (Object.values(categorySales) as number[]).reduce((a, b) => a + b, 0) || 1;
                  
                  return CATEGORIES.filter(c => c.id !== "all").map((cat, i) => {
                    const val = categorySales[cat.id] || 0;
                    const pct = Math.round((val / totalCatSales) * 100);
                    
                    return (
                      <div key={cat.id} style={{ display:"flex", alignItems:"center", gap:12, marginBottom:10 }}>
                        <span style={{ fontSize:16, width:24 }}>{cat.icon}</span>
                        <span style={{ fontSize:12, color:"rgba(255,255,255,.6)", width:160, flexShrink:0 }}>{cat.nameAr}</span>
                        <div style={{ flex:1, height:6, background:"rgba(255,255,255,.06)", borderRadius:3, overflow:"hidden" }}>
                          <div style={{ width:`${pct}%`, height:"100%", background:"linear-gradient(90deg,#0051a2,#3b82f6)", borderRadius:3, transition: "width 0.5s" }} />
                        </div>
                        <span style={{ fontSize:12, fontWeight:800, color:"#fff", minWidth:36, textAlign:"left" }}>{pct}%</span>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
          )}

          {/* ══ LOGS ══ */}
          {tab === "logs" && (
            <div className="fade-up">
              <h2 style={S.h2}>سجل العمليات (Audit Log)</h2>
              <div style={S.card}>
                {logs.length === 0 ? (
                  <div style={{ textAlign: "center", padding: 20, color: "rgba(255,255,255,.4)" }}>لا توجد سجلات بعد</div>
                ) : logs.map((log, i) => (
                  <div key={i} style={{ display:"flex", alignItems:"center", gap:14, padding:"12px 0", borderBottom:"1px solid rgba(255,255,255,.04)" }}>
                    <span style={{ fontSize:20, width:28, textAlign:"center" }}>
                      {log.type==="auth"?"🔐":log.type==="product"?"🏗️":log.type==="order"?"📦":log.type==="inventory"?"📋":log.type==="report"?"📊":"👤"}
                    </span>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:13, fontWeight:700, color:"#fff" }}>{log.action}</div>
                      <div style={{ fontSize:11, color:"rgba(255,255,255,.35)", marginTop:2 }}>
                        بواسطة: <span style={{ color:"#3b82f6" }}>{log.user}</span> · 2026-06-28 {log.time}
                      </div>
                    </div>
                    <span className="badge" style={{ background:"rgba(255,255,255,.05)", color:"rgba(255,255,255,.4)" }}>{log.type}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ══ CONTRACTORS ══ */}
          {tab === "contractors" && (
            <div className="fade-up">
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:28 }}>
                <h2 style={S.h2}>👷 إدارة حسابات المقاولين</h2>
                <a href="/contractor/login" target="_blank" className="action-btn primary" style={{ textDecoration:"none" }}>
                  🔗 بوابة المقاولين
                </a>
              </div>

              {/* Stats */}
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:16, marginBottom:28 }}>
                {[
                  { ico:"👷", label:"إجمالي المقاولين", value:"3", color:"#3b82f6", glow:"rgba(59,130,246,0.3)" },
                  { ico:"✅", label:"حسابات فعّالة", value:"3", color:"#10b981", glow:"rgba(16,185,129,0.3)" },
                  { ico:"📊", label:"طلبات المقاولين", value:orders.filter((o:any) => o.contractorId).length, color:"#8b5cf6", glow:"rgba(139,92,246,0.3)" },
                ].map((s, i) => (
                  <div key={i} className="stat-card">
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                      <div>
                        <div style={{ fontSize:12, fontWeight:700, color:"rgba(255,255,255,.45)", marginBottom:10 }}>{s.label}</div>
                        <div style={{ fontSize:32, fontWeight:900, color:s.color, textShadow:`0 0 20px ${s.glow}` }}>{s.value}</div>
                      </div>
                      <div style={{ fontSize:30, background:"rgba(255,255,255,0.03)", padding:12, borderRadius:12, filter:`drop-shadow(0 0 8px ${s.glow})` }}>{s.ico}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Contractor Cards */}
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(320px,1fr))", gap:16 }}>
                {[
                  { id:"CON-001", name:"محمد العمراني", company:"شركة العمراني للمقاولات", phone:"+218912345678", user:"contractor1", pass:"contra123", avatar:"🏗️", active:true },
                  { id:"CON-002", name:"سالم البرقاوي",  company:"البرقاوي للإنشاءات",      phone:"+218923456789", user:"contractor2", pass:"contra456", avatar:"👷", active:true },
                  { id:"CON-003", name:"خالد البنغازي", company:"مجموعة بنغازي للمقاولات", phone:"+218934567890", user:"contractor3", pass:"contra789", avatar:"🔧", active:true },
                ].map(c => {
                  const cOrders = orders.filter((o:any) => o.contractorId === c.id);
                  const cTotal  = cOrders.reduce((sum:number,o:any) => sum + (o.total||0), 0);
                  return (
                    <div key={c.id} style={{ ...S.card, position:"relative" }}>
                      {/* Status badge */}
                      <div style={{ position:"absolute", top:16, left:16 }}>
                        <span className="badge" style={{ background:c.active ? "rgba(16,185,129,.12)" : "rgba(239,68,68,.12)", color:c.active ? "#10b981" : "#ef4444", border:`1px solid ${c.active ? "#10b98140":"#ef444440"}` }}>
                          {c.active ? "✅ فعّال" : "❌ معطّل"}
                        </span>
                      </div>

                      {/* Header */}
                      <div style={{ display:"flex", alignItems:"center", gap:16, marginBottom:20, paddingTop:8 }}>
                        <div style={{ width:56, height:56, background:"linear-gradient(135deg,#3b82f6,#001f4d)", borderRadius:14, display:"flex", alignItems:"center", justifyContent:"center", fontSize:28, boxShadow:"0 0 20px rgba(59,130,246,0.3)" }}>{c.avatar}</div>
                        <div>
                          <div style={{ fontSize:16, fontWeight:900, color:"#fff" }}>{c.name}</div>
                          <div style={{ fontSize:12, color:"rgba(255,255,255,.5)", marginTop:3 }}>{c.company}</div>
                          <div style={{ fontSize:11, color:"rgba(255,255,255,.35)", marginTop:2 }}>{c.id}</div>
                        </div>
                      </div>

                      {/* Stats */}
                      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:16 }}>
                        <div style={{ background:"rgba(255,255,255,0.03)", borderRadius:10, padding:"12px", textAlign:"center" }}>
                          <div style={{ fontSize:11, color:"rgba(255,255,255,.4)", fontWeight:700 }}>الطلبات</div>
                          <div style={{ fontSize:22, fontWeight:900, color:"#3b82f6", marginTop:4 }}>{cOrders.length}</div>
                        </div>
                        <div style={{ background:"rgba(255,255,255,0.03)", borderRadius:10, padding:"12px", textAlign:"center" }}>
                          <div style={{ fontSize:11, color:"rgba(255,255,255,.4)", fontWeight:700 }}>إجمالي المبالغ</div>
                          <div style={{ fontSize:16, fontWeight:900, color:"#10b981", marginTop:4 }}>{cTotal.toLocaleString()}</div>
                        </div>
                      </div>

                      {/* Wallet (Demo) */}
                      <div style={{ background:"rgba(244,63,94,0.05)", border:"1px solid rgba(244,63,94,0.1)", borderRadius:10, padding:"12px 14px", marginBottom:16, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                        <div>
                          <div style={{ fontSize:11, color:"rgba(244,63,94,0.7)", fontWeight:700, marginBottom:4 }}>الديون (المحفظة)</div>
                          <div style={{ fontSize:18, fontWeight:900, color:"#f43f5e" }}>
                            {c.id === "CON-001" ? "1,200" : c.id === "CON-003" ? "4,800" : "0"} د.ل
                          </div>
                        </div>
                        <button onClick={() => showToast("✅ تم تصفير الديون بنجاح")} style={{ background:"rgba(244,63,94,0.1)", color:"#f43f5e", border:"none", padding:"6px 12px", borderRadius:6, fontSize:11, fontWeight:800, cursor:"pointer" }}>
                          تصفير
                        </button>
                      </div>

                      {/* Contact */}
                      <div style={{ background:"rgba(255,255,255,0.03)", borderRadius:10, padding:"12px 14px", marginBottom:16 }}>
                        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                          <span style={{ fontSize:12, color:"rgba(255,255,255,.5)" }}>📱 {c.phone}</span>
                          <a href={`https://wa.me/${c.phone.replace(/\D/g,"")}`} target="_blank" rel="noreferrer" style={{ background:"linear-gradient(135deg,#25D366,#128C7E)", color:"#fff", padding:"3px 8px", borderRadius:6, textDecoration:"none", fontSize:11, fontWeight:800 }}>💬 واتس</a>
                        </div>
                        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                          <div style={{ background:"rgba(0,0,0,0.2)", borderRadius:6, padding:"6px 10px" }}>
                            <div style={{ fontSize:9, color:"rgba(255,255,255,.3)", marginBottom:2 }}>اسم المستخدم</div>
                            <div style={{ fontSize:12, fontWeight:800, color:"#3b82f6", fontFamily:"monospace" }}>{c.user}</div>
                          </div>
                          <div style={{ background:"rgba(0,0,0,0.2)", borderRadius:6, padding:"6px 10px" }}>
                            <div style={{ fontSize:9, color:"rgba(255,255,255,.3)", marginBottom:2 }}>كلمة المرور</div>
                            <div style={{ fontSize:12, fontWeight:800, color:"#f59e0b", fontFamily:"monospace" }}>{c.pass}</div>
                          </div>
                        </div>
                      </div>

                      {/* Orders list */}
                      {cOrders.length > 0 && (
                        <div style={{ marginBottom:16 }}>
                          <div style={{ fontSize:10, fontWeight:800, color:"rgba(255,255,255,.35)", letterSpacing:".1em", textTransform:"uppercase", marginBottom:8 }}>آخر طلباته</div>
                          {cOrders.slice(0,2).map((o:any) => {
                            const st = STATUS_CONFIG[o.status as keyof typeof STATUS_CONFIG];
                            return (
                              <div key={o.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"6px 0", borderBottom:"1px solid rgba(255,255,255,.04)" }}>
                                <span style={{ fontSize:12, fontWeight:800, color:"#3b82f6" }}>{o.id}</span>
                                {st && <span className="badge" style={{ background:st.bg, color:st.color, fontSize:10, padding:"2px 8px" }}>{st.label}</span>}
                              </div>
                            );
                          })}
                        </div>
                      )}

                      <div style={{ display:"flex", gap:8 }}>
                        <button className="action-btn" style={{ flex:1 }} onClick={() => showToast(`👷 مفتوح: طلبات ${c.name} (${cOrders.length})`)}>
                          📦 طلباته
                        </button>
                        <button className="action-btn danger" onClick={() => showToast("⚠️ تعطيل الحساب قريباً...")}>
                          ⛔ تعطيل
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Quick Login Info */}
              <div style={{ ...S.card, marginTop:24 }}>
                <h3 style={{ fontSize:14, fontWeight:800, color:"#fff", marginBottom:16 }}>🔗 رابط بوابة المقاولين</h3>
                <div style={{ display:"flex", alignItems:"center", gap:16, flexWrap:"wrap" }}>
                  <div style={{ background:"rgba(59,130,246,0.08)", border:"1px solid rgba(59,130,246,0.2)", borderRadius:10, padding:"10px 16px", flex:1, minWidth:200 }}>
                    <div style={{ fontSize:11, color:"rgba(255,255,255,.4)", marginBottom:4 }}>رابط بوابة المقاولين</div>
                    <div style={{ fontSize:14, fontWeight:800, color:"#3b82f6", fontFamily:"monospace" }}>localhost:3000/contractor/login</div>
                  </div>
                  <a href="/contractor/login" target="_blank" className="action-btn primary" style={{ textDecoration:"none", padding:"12px 24px" }}>
                    👷 افتح بوابة المقاولين ↗
                  </a>
                </div>
              </div>
            </div>
          )}

          {tab === "content" && (
            <div className="fade-up">
              <div style={{ display:"flex", gap:10, marginBottom:24, flexWrap:"wrap" }}>
                {([
                  ["submissions", "📥 الطلبات الواردة"],
                  ["faq", "❓ الأسئلة الشائعة"],
                  ["blog", "📰 المدونة"],
                  ["banners", "🖼️ البانرات"],
                  ["coupons", "🎟️ الكوبونات"],
                  ["workshops", "🎓 ورش التدريب"],
                  ["delivery", "🚚 مناطق التوصيل"],
                  ["documents", "📄 مكتبة الوثائق"],
                  ["cases", "🏗️ معرض المشاريع"],
                  ["applicators", "👷 المطبّقون المعتمدون"],
                  ["billing", "🧾 فواتير ومدفوعات المقاولين"],
                ] as const).map(([k, lbl]) => (
                  <button key={k} className={`action-btn${contentSection === k ? " primary" : ""}`}
                    onClick={() => setContentSection(k)}>{lbl}</button>
                ))}
              </div>

              {contentSection === "submissions" && (
                <div style={{ display:"grid", gap:20 }}>
                  {Object.entries({
                    sample_requests: "طلبات العينات",
                    contact_messages: "رسائل التواصل",
                    career_applications: "طلبات التوظيف",
                    appointments: "المواعيد",
                    return_requests: "طلبات الإرجاع",
                    satisfaction_surveys: "استبيانات الرضا",
                    tender_requests: "طلبات توريد المناقصات",
                    restock_alerts: "تنبيهات توفر المنتجات",
                    tool_warranties: "تسجيلات ضمان العدد",
                    site_visits: "طلبات الزيارة الفنية",
                    workshop_registrations: "تسجيلات ورش التدريب",
                  }).map(([key, title]) => (
                    <div key={key} style={S.card}>
                      <h3 style={{ fontSize:14, fontWeight:800, color:"#fff", marginBottom:12 }}>{title} ({(submissions[key] || []).length})</h3>
                      {(submissions[key] || []).length === 0 ? (
                        <p style={{ color:"rgba(255,255,255,.3)", fontSize:13 }}>لا توجد بيانات</p>
                      ) : (
                        <div style={{ maxHeight:200, overflowY:"auto" }}>
                          {(submissions[key] || []).slice(0, 10).map((item: any) => (
                            <div key={item.id} style={{ padding:"10px 0", borderBottom:"1px solid rgba(255,255,255,.04)", fontSize:12 }}>
                              <strong style={{ color:"#3b82f6" }}>{item.id}</strong>
                              <span style={{ color:"rgba(255,255,255,.5)", marginRight:8 }}> — {item.name || item.projectName || item.productName || item.participantName || item.client || item.city || item.orderId || ""}</span>
                              {(item.whatsappNumber || item.serialNumber || item.preferredTime) && <span style={{ color:"rgba(255,255,255,.4)", marginRight:8 }}>{item.whatsappNumber || item.serialNumber || item.preferredTime}</span>}
                              {item.date && <span style={{ color:"rgba(255,255,255,.3)" }}>{new Date(item.date).toLocaleDateString("ar-LY")}</span>}
                              {item.data?.position && <span style={{ color:"rgba(255,255,255,.4)", marginRight:8 }}>· {item.data.position}{item.data.city ? " — " + item.data.city : ""}</span>}
                              {item.data?.cvFile && <a href={item.data.cvFile} download={item.data.cvName || "cv"} style={{ color:"#22d3ee", marginRight:8, textDecoration:"none", fontWeight:700 }}>⬇ السيرة الذاتية</a>}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {contentSection === "faq" && (
                <div>
                  <button className="action-btn primary" style={{ marginBottom:16 }} onClick={async () => {
                    const id = "faq-" + Date.now();
                    await saveFaqItem({ id, questionAr: "سؤال جديد", questionEn: "New question", answerAr: "الإجابة", answerEn: "Answer", order: faqItems.length + 1 });
                    reload(); showToast("✅ تمت الإضافة");
                  }}>+ إضافة سؤال</button>
                  {faqItems.map(f => (
                    <FaqEditor key={f.id} item={f}
                      onSave={async (v) => { await saveFaqItem(v); reload(); showToast("✅ تم الحفظ"); }}
                      onDelete={async () => { await deleteFaqItem(f.id); reload(); showToast("🗑️ تم الحذف"); }} />
                  ))}
                </div>
              )}

              {contentSection === "blog" && (
                <div>
                  <button className="action-btn primary" style={{ marginBottom:16 }} onClick={async () => {
                    const id = "blog-" + Date.now();
                    await saveBlogPost({ id, slug: "post-" + Date.now(), titleAr: "مقال جديد", titleEn: "New Post", excerptAr: "", excerptEn: "", bodyAr: "المحتوى", bodyEn: "Content", published: true, date: new Date().toISOString().slice(0, 10) });
                    reload(); showToast("✅ تمت الإضافة");
                  }}>+ مقال جديد</button>
                  {blogPosts.map(p => (
                    <BlogEditor key={p.id} post={p}
                      onSave={async (v) => { await saveBlogPost(v); reload(); showToast("✅ تم الحفظ"); }}
                      onDelete={async () => { await deleteBlogPost(p.id); reload(); showToast("🗑️ تم الحذف"); }} />
                  ))}
                </div>
              )}

              {contentSection === "banners" && (
                <div>
                  {banners.map(b => (
                    <div key={b.id} style={{ ...S.card, marginBottom:12 }}>
                      <div style={{ fontWeight:800, color:"#fff" }}>{b.titleAr}</div>
                      <div style={{ fontSize:12, color:"rgba(255,255,255,.4)" }}>{b.subtitleAr}</div>
                      <button className="action-btn" style={{ marginTop:10 }} onClick={async () => {
                        await saveBanner({ ...b, active: !b.active });
                        reload(); showToast("✅ تم التحديث");
                      }}>{b.active !== false ? "تعطيل" : "تفعيل"}</button>
                    </div>
                  ))}
                </div>
              )}

              {contentSection === "coupons" && (
                <div>
                  <div style={{ ...S.card, marginBottom:20 }}>
                    <h3 style={{ fontSize:14, fontWeight:800, color:"#fff", marginBottom:12 }}>إنشاء كوبون</h3>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr auto", gap:10, alignItems:"end" }}>
                      <input style={S.inp} placeholder="الكود" value={newCoupon.code} onChange={e => setNewCoupon(p => ({ ...p, code: e.target.value }))} />
                      <input style={S.inp} type="number" placeholder="نسبة الخصم %" value={newCoupon.discountPercent} onChange={e => setNewCoupon(p => ({ ...p, discountPercent: e.target.value }))} />
                      <input style={S.inp} type="date" value={newCoupon.expiresAt} onChange={e => setNewCoupon(p => ({ ...p, expiresAt: e.target.value }))} />
                      <button className="action-btn primary" onClick={async () => {
                        if (!newCoupon.code) return;
                        await createCoupon({ code: newCoupon.code, discountPercent: Number(newCoupon.discountPercent), expiresAt: newCoupon.expiresAt || undefined });
                        setNewCoupon({ code: "", discountPercent: "10", expiresAt: "" });
                        reload(); showToast("✅ تم إنشاء الكوبون");
                      }}>إنشاء</button>
                    </div>
                  </div>
                  {coupons.map(c => (
                    <div key={c.id} style={{ ...S.card, marginBottom:12, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                      <div>
                        <span style={{ fontWeight:900, color:"#f59e0b", fontFamily:"monospace" }}>{c.code}</span>
                        <span style={{ color:"rgba(255,255,255,.5)", marginRight:12 }}> — {c.discountPercent}%</span>
                      </div>
                      <span style={{ fontSize:11, color:"rgba(255,255,255,.3)" }}>استُخدم {c.usedCount || 0} مرة</span>
                    </div>
                  ))}
                </div>
              )}

              {contentSection === "workshops" && (
                <div>
                  <div style={{ ...S.card, marginBottom:20 }}>
                    <h3 style={{ fontSize:14, fontWeight:800, color:"#fff", marginBottom:12 }}>إضافة ورشة تدريبية</h3>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                      <input style={S.inp} placeholder="عنوان الورشة" value={newWorkshop.title} onChange={e => setNewWorkshop(p => ({ ...p, title: e.target.value }))} />
                      <input style={S.inp} placeholder="المقدّم / المدرب" value={newWorkshop.instructor} onChange={e => setNewWorkshop(p => ({ ...p, instructor: e.target.value }))} />
                      <input style={S.inp} type="date" value={newWorkshop.date} onChange={e => setNewWorkshop(p => ({ ...p, date: e.target.value }))} />
                      <input style={S.inp} placeholder="المكان" value={newWorkshop.location} onChange={e => setNewWorkshop(p => ({ ...p, location: e.target.value }))} />
                      <input style={S.inp} type="number" placeholder="عدد المقاعد" value={newWorkshop.availableSeats} onChange={e => setNewWorkshop(p => ({ ...p, availableSeats: e.target.value }))} />
                      <button className="action-btn primary" onClick={async () => {
                        if (!newWorkshop.title || !newWorkshop.date) return;
                        await saveWorkshop({ ...newWorkshop, availableSeats: Number(newWorkshop.availableSeats) });
                        setNewWorkshop({ title:"", instructor:"", date:"", location:"", availableSeats:"20" });
                        reload(); showToast("✅ تمت إضافة الورشة");
                      }}>إضافة</button>
                    </div>
                  </div>
                  {workshops.map(w => (
                    <div key={w.id} style={{ ...S.card, marginBottom:12, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                      <div>
                        <div style={{ fontWeight:800, color:"#fff" }}>{w.title}</div>
                        <div style={{ fontSize:12, color:"rgba(255,255,255,.5)", marginTop:4 }}>{new Date(w.date).toLocaleDateString("ar-LY")} · {w.location} · مقاعد متبقية: {w.availableSeats}</div>
                      </div>
                      <button className="action-btn danger" onClick={async () => { await deleteWorkshop(w.id); reload(); showToast("🗑️ تم الحذف"); }}>حذف</button>
                    </div>
                  ))}
                </div>
              )}

              {contentSection === "delivery" && (
                <div>
                  <div style={{ ...S.card, marginBottom:20 }}>
                    <h3 style={{ fontSize:14, fontWeight:800, color:"#fff", marginBottom:12 }}>إضافة / تحديث منطقة توصيل</h3>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                      <input style={S.inp} placeholder="المدينة" value={newZone.city} onChange={e => setNewZone(p => ({ ...p, city: e.target.value }))} />
                      <input style={S.inp} placeholder="المدة التقريبية (مثال: 1 - 2 يوم)" value={newZone.estimatedDays} onChange={e => setNewZone(p => ({ ...p, estimatedDays: e.target.value }))} />
                      <input style={S.inp} type="number" placeholder="الرسوم (د.ل)" value={newZone.fees} onChange={e => setNewZone(p => ({ ...p, fees: e.target.value }))} />
                      <input style={S.inp} placeholder="الشروط (اختياري)" value={newZone.conditions} onChange={e => setNewZone(p => ({ ...p, conditions: e.target.value }))} />
                      <button className="action-btn primary" onClick={async () => {
                        if (!newZone.city) return;
                        await saveDeliveryZone({ ...newZone, fees: Number(newZone.fees) });
                        setNewZone({ city:"", estimatedDays:"", fees:"0", conditions:"" });
                        reload(); showToast("✅ تم حفظ المنطقة");
                      }}>حفظ</button>
                    </div>
                  </div>
                  {deliveryZones.map(z => (
                    <div key={z.id} style={{ ...S.card, marginBottom:12, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                      <div>
                        <div style={{ fontWeight:800, color:"#fff" }}>{z.city}</div>
                        <div style={{ fontSize:12, color:"rgba(255,255,255,.5)", marginTop:4 }}>{z.estimatedDays} · {z.fees > 0 ? `${z.fees} د.ل` : "حسب الطلب"} {z.conditions ? `· ${z.conditions}` : ""}</div>
                      </div>
                      <button className="action-btn danger" onClick={async () => { await deleteDeliveryZone(z.id); reload(); showToast("🗑️ تم الحذف"); }}>حذف</button>
                    </div>
                  ))}
                </div>
              )}

              {contentSection === "documents" && (
                <div>
                  <div style={{ ...S.card, marginBottom:20 }}>
                    <h3 style={{ fontSize:14, fontWeight:800, color:"#fff", marginBottom:12 }}>إضافة وثيقة فنية (TDS/SDS)</h3>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                      <input style={S.inp} placeholder="عنوان الوثيقة" value={newDoc.title} onChange={e => setNewDoc(p => ({ ...p, title: e.target.value }))} />
                      <select style={S.inp} value={newDoc.docType} onChange={e => setNewDoc(p => ({ ...p, docType: e.target.value }))}>
                        <option value="TDS">TDS — ورقة بيانات فنية</option>
                        <option value="SDS">SDS — ورقة سلامة</option>
                        <option value="Catalog">كتالوج</option>
                      </select>
                      <input style={S.inp} placeholder="العلامة التجارية (اختياري)" value={newDoc.brandId} onChange={e => setNewDoc(p => ({ ...p, brandId: e.target.value }))} />
                      <input style={S.inp} placeholder="رابط الملف (URL)" value={newDoc.fileUrl} onChange={e => setNewDoc(p => ({ ...p, fileUrl: e.target.value }))} />
                      <button className="action-btn primary" onClick={async () => {
                        if (!newDoc.title || !newDoc.fileUrl) return;
                        await saveTechnicalDocument({ ...newDoc });
                        setNewDoc({ title:"", docType:"TDS", fileUrl:"", brandId:"" });
                        reload(); showToast("✅ تمت إضافة الوثيقة");
                      }}>إضافة</button>
                    </div>
                  </div>
                  {documents.map(d => (
                    <div key={d.id} style={{ ...S.card, marginBottom:12, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                      <div>
                        <div style={{ fontWeight:800, color:"#fff" }}>{d.title} <span style={{ fontSize:10, color:"#f59e0b" }}>{d.docType}</span></div>
                        <div style={{ fontSize:11, color:"rgba(255,255,255,.4)", marginTop:4 }}>{d.brandId || "—"}</div>
                      </div>
                      <button className="action-btn danger" onClick={async () => { await deleteTechnicalDocument(d.id); reload(); showToast("🗑️ تم الحذف"); }}>حذف</button>
                    </div>
                  ))}
                </div>
              )}

              {contentSection === "cases" && (
                <div>
                  <div style={{ ...S.card, marginBottom:20 }}>
                    <h3 style={{ fontSize:14, fontWeight:800, color:"#fff", marginBottom:12 }}>إضافة مشروع (Case Study)</h3>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                      <input style={S.inp} placeholder="عنوان المشروع" value={newCase.title} onChange={e => setNewCase(p => ({ ...p, title: e.target.value }))} />
                      <input style={S.inp} placeholder="الجهة المالكة" value={newCase.owner} onChange={e => setNewCase(p => ({ ...p, owner: e.target.value }))} />
                      <input style={S.inp} placeholder="الحالة (مثال: منجز)" value={newCase.status} onChange={e => setNewCase(p => ({ ...p, status: e.target.value }))} />
                      <input style={S.inp} placeholder="روابط الصور (مفصولة بفاصلة)" value={newCase.imageUrls} onChange={e => setNewCase(p => ({ ...p, imageUrls: e.target.value }))} />
                      <input style={{ ...S.inp, gridColumn:"1/-1" }} placeholder="أكواد المنتجات المستخدمة (مفصولة بفاصلة)" value={newCase.productIds} onChange={e => setNewCase(p => ({ ...p, productIds: e.target.value }))} />
                      <textarea style={{ ...S.inp, gridColumn:"1/-1", minHeight:80, fontFamily:"inherit" }} placeholder="وصف الحالة والنظام المستخدم" value={newCase.description} onChange={e => setNewCase(p => ({ ...p, description: e.target.value }))} />
                    </div>
                    <button className="action-btn primary" style={{ marginTop:12 }} onClick={async () => {
                      if (!newCase.title) return;
                      await saveCaseStudy({
                        title: newCase.title, owner: newCase.owner, status: newCase.status, description: newCase.description,
                        imageUrls: newCase.imageUrls.split(",").map(s => s.trim()).filter(Boolean),
                        productIds: newCase.productIds.split(",").map(s => s.trim()).filter(Boolean),
                      });
                      setNewCase({ title:"", owner:"", status:"منجز", description:"", imageUrls:"", productIds:"" });
                      reload(); showToast("✅ تمت إضافة المشروع");
                    }}>إضافة المشروع</button>
                  </div>
                  {caseStudies.map(c => (
                    <div key={c.id} style={{ ...S.card, marginBottom:12, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                      <div>
                        <div style={{ fontWeight:800, color:"#fff" }}>{c.title}</div>
                        <div style={{ fontSize:12, color:"rgba(255,255,255,.5)", marginTop:4 }}>{c.status} · {c.owner || "—"}</div>
                      </div>
                      <button className="action-btn danger" onClick={async () => { await deleteCaseStudy(c.id); reload(); showToast("🗑️ تم الحذف"); }}>حذف</button>
                    </div>
                  ))}
                </div>
              )}

              {contentSection === "applicators" && (
                <div>
                  <div style={{ ...S.card, marginBottom:20 }}>
                    <h3 style={{ fontSize:14, fontWeight:800, color:"#fff", marginBottom:12 }}>إضافة مطبّق معتمد</h3>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                      <input style={S.inp} placeholder="اسم شركة التطبيق" value={newApp.name} onChange={e => setNewApp(p => ({ ...p, name: e.target.value }))} />
                      <input style={S.inp} placeholder="النظام / التخصص" value={newApp.systemSpecialty} onChange={e => setNewApp(p => ({ ...p, systemSpecialty: e.target.value }))} />
                      <input style={S.inp} placeholder="رقم الهاتف" value={newApp.phone} onChange={e => setNewApp(p => ({ ...p, phone: e.target.value }))} />
                      <input style={S.inp} placeholder="المدينة" value={newApp.city} onChange={e => setNewApp(p => ({ ...p, city: e.target.value }))} />
                      <input style={{ ...S.inp, gridColumn:"1/-1" }} placeholder="الاعتمادات (مفصولة بفاصلة)" value={newApp.certifications} onChange={e => setNewApp(p => ({ ...p, certifications: e.target.value }))} />
                    </div>
                    <button className="action-btn primary" style={{ marginTop:12 }} onClick={async () => {
                      if (!newApp.name) return;
                      await saveApplicator({
                        name: newApp.name, systemSpecialty: newApp.systemSpecialty,
                        contactInfo: { phone: newApp.phone, city: newApp.city },
                        certifications: newApp.certifications.split(",").map(s => s.trim()).filter(Boolean),
                      });
                      setNewApp({ name:"", systemSpecialty:"", phone:"", city:"", certifications:"" });
                      reload(); showToast("✅ تمت الإضافة");
                    }}>إضافة</button>
                  </div>
                  {applicators.map(a => (
                    <div key={a.id} style={{ ...S.card, marginBottom:12, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                      <div>
                        <div style={{ fontWeight:800, color:"#fff" }}>{a.name}</div>
                        <div style={{ fontSize:12, color:"rgba(255,255,255,.5)", marginTop:4 }}>{a.systemSpecialty} · {a.contactInfo?.city || "—"}</div>
                      </div>
                      <button className="action-btn danger" onClick={async () => { await deleteApplicator(a.id); reload(); showToast("🗑️ تم الحذف"); }}>حذف</button>
                    </div>
                  ))}
                </div>
              )}

              {contentSection === "billing" && (
                <div style={{ display:"grid", gap:20 }}>
                  <div style={S.card}>
                    <h3 style={{ fontSize:14, fontWeight:800, color:"#fff", marginBottom:12 }}>🧾 إضافة فاتورة لمقاول</h3>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                      <select style={S.inp} value={newInvoice.contractorId} onChange={e => setNewInvoice(p => ({ ...p, contractorId: e.target.value }))}>
                        <option value="">اختر المقاول</option>
                        {contractorsList.map(c => <option key={c.id} value={c.id}>{c.company} ({c.id})</option>)}
                      </select>
                      <input style={S.inp} placeholder="رقم الفاتورة" value={newInvoice.number} onChange={e => setNewInvoice(p => ({ ...p, number: e.target.value }))} />
                      <input style={S.inp} type="number" placeholder="المبلغ (د.ل)" value={newInvoice.amount} onChange={e => setNewInvoice(p => ({ ...p, amount: e.target.value }))} />
                      <input style={S.inp} placeholder="البيان (اختياري)" value={newInvoice.description} onChange={e => setNewInvoice(p => ({ ...p, description: e.target.value }))} />
                    </div>
                    <button className="action-btn primary" style={{ marginTop:12 }} onClick={async () => {
                      if (!newInvoice.contractorId || !newInvoice.amount) return;
                      await createInvoice({ contractorId: newInvoice.contractorId, number: newInvoice.number || ("INV-" + Date.now()), amount: Number(newInvoice.amount), description: newInvoice.description });
                      setNewInvoice({ contractorId:"", number:"", amount:"", description:"" });
                      showToast("✅ تم تسجيل الفاتورة");
                    }}>تسجيل الفاتورة</button>
                  </div>

                  <div style={S.card}>
                    <h3 style={{ fontSize:14, fontWeight:800, color:"#fff", marginBottom:12 }}>💵 تسجيل دفعة من مقاول</h3>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                      <select style={S.inp} value={newPayment.contractorId} onChange={e => setNewPayment(p => ({ ...p, contractorId: e.target.value }))}>
                        <option value="">اختر المقاول</option>
                        {contractorsList.map(c => <option key={c.id} value={c.id}>{c.company} ({c.id})</option>)}
                      </select>
                      <input style={S.inp} type="number" placeholder="المبلغ (د.ل)" value={newPayment.amount} onChange={e => setNewPayment(p => ({ ...p, amount: e.target.value }))} />
                      <select style={S.inp} value={newPayment.method} onChange={e => setNewPayment(p => ({ ...p, method: e.target.value }))}>
                        <option value="cash">نقداً</option>
                        <option value="transfer">حوالة بنكية</option>
                        <option value="cheque">شيك</option>
                      </select>
                      <input style={S.inp} placeholder="ملاحظة / رقم إيصال" value={newPayment.note} onChange={e => setNewPayment(p => ({ ...p, note: e.target.value }))} />
                    </div>
                    <button className="action-btn primary" style={{ marginTop:12 }} onClick={async () => {
                      if (!newPayment.contractorId || !newPayment.amount) return;
                      await createPayment({ contractorId: newPayment.contractorId, amount: Number(newPayment.amount), method: newPayment.method, note: newPayment.note });
                      setNewPayment({ contractorId:"", amount:"", method:"cash", note:"" });
                      showToast("✅ تم تسجيل الدفعة");
                    }}>تسجيل الدفعة</button>
                  </div>
                  <p style={{ fontSize:12, color:"rgba(255,255,255,.4)" }}>تظهر هذه الحركات في كشف حساب المقاول داخل بوابة المقاولين (/contractor/account).</p>
                </div>
              )}
            </div>
          )}

          {tab === "settings" && (
            <div className="fade-up">
              <h2 style={S.h2}>إعدادات النظام</h2>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:16 }}>
                {[
                  { title:"معلومات الشركة",  fields:["اسم الشركة","العنوان","الهاتف","البريد الإلكتروني"] },
                  { title:"إعدادات الموقع",  fields:["عنوان الصفحة","وصف الموقع","الكلمات المفتاحية","حالة الموقع"] },
                ].map((section, i) => (
                  <div key={i} style={S.card}>
                    <h3 style={{ fontSize:14, fontWeight:800, color:"#fff", marginBottom:16 }}>{section.title}</h3>
                    {section.fields.map(f => (
                      <div key={f} style={{ marginBottom:12 }}>
                        <label style={{ fontSize:10, fontWeight:700, color:"rgba(255,255,255,.4)", display:"block", marginBottom:6, letterSpacing:".08em" }}>{f}</label>
                        <input type="text" style={S.inp} placeholder={f} />
                      </div>
                    ))}
                    <button className="action-btn primary" style={{ marginTop:8 }} onClick={() => showToast("✅ تم الحفظ")}>💾 حفظ</button>
                  </div>
                ))}
              </div>

              <div style={S.card}>
                <h3 style={{ fontSize:14, fontWeight:800, color:"#fff", marginBottom:16 }}>🔐 إدارة المستخدمين</h3>
                {[
                  { user:"admin",     role:"Super Admin 👑", status:"فعّال" },
                  { user:"manager",   role:"Admin 🧑‍💼",      status:"فعّال" },
                  { user:"warehouse", role:"Sub Admin 📦",   status:"فعّال" },
                ].map((u, i) => (
                  <div key={i} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 0", borderBottom:"1px solid rgba(255,255,255,.04)" }}>
                    <div>
                      <div style={{ fontSize:13, fontWeight:700, color:"#fff" }}>{u.user}</div>
                      <div style={{ fontSize:11, color:"rgba(255,255,255,.35)" }}>{u.role}</div>
                    </div>
                    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                      <span className="badge" style={{ background:"rgba(16,185,129,.12)", color:"#10b981" }}>{u.status}</span>
                      <button className="action-btn" onClick={() => showToast("⚙️ قريباً: تعديل المستخدمين")}>تعديل</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}

// ── Inline editors (§12/§13: full admin CRUD for blog & FAQ) ──────────────
const edInput: React.CSSProperties = {
  width: "100%", padding: "8px 10px", borderRadius: 8, marginBottom: 8,
  border: "1px solid rgba(255,255,255,.15)", background: "rgba(255,255,255,.06)",
  color: "#fff", fontSize: 13, fontFamily: "inherit",
};
const edLabel: React.CSSProperties = { fontSize: 11, color: "rgba(255,255,255,.5)", fontWeight: 700, display: "block", marginBottom: 3 };
const edCard: React.CSSProperties = { background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.08)", borderRadius: 12, padding: 16, marginBottom: 12 };

function FaqEditor({ item, onSave, onDelete }: { item: any; onSave: (v: any) => void; onDelete: () => void }) {
  const [v, setV] = useState({
    id: item.id, order: item.order ?? 0,
    questionAr: item.questionAr || "", questionEn: item.questionEn || "",
    answerAr: item.answerAr || "", answerEn: item.answerEn || "",
  });
  const set = (k: string, val: string) => setV(p => ({ ...p, [k]: val }));
  return (
    <div style={edCard}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <div><label style={edLabel}>السؤال (عربي)</label><input style={edInput} value={v.questionAr} onChange={e => set("questionAr", e.target.value)} /></div>
        <div><label style={edLabel}>Question (EN)</label><input style={edInput} value={v.questionEn} onChange={e => set("questionEn", e.target.value)} dir="ltr" /></div>
        <div><label style={edLabel}>الإجابة (عربي)</label><textarea style={{ ...edInput, minHeight: 60 }} value={v.answerAr} onChange={e => set("answerAr", e.target.value)} /></div>
        <div><label style={edLabel}>Answer (EN)</label><textarea style={{ ...edInput, minHeight: 60 }} value={v.answerEn} onChange={e => set("answerEn", e.target.value)} dir="ltr" /></div>
      </div>
      <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 4 }}>
        <label style={{ ...edLabel, marginBottom: 0 }}>الترتيب</label>
        <input style={{ ...edInput, width: 70, marginBottom: 0 }} type="number" value={v.order} onChange={e => set("order", e.target.value)} />
        <button className="action-btn primary" onClick={() => onSave({ ...v, order: Number(v.order) || 0 })}>حفظ</button>
        <button className="action-btn danger" onClick={onDelete}>حذف</button>
      </div>
    </div>
  );
}

function BlogEditor({ post, onSave, onDelete }: { post: any; onSave: (v: any) => void; onDelete: () => void }) {
  const [v, setV] = useState({
    id: post.id, slug: post.slug || "",
    titleAr: post.titleAr || "", titleEn: post.titleEn || "",
    excerptAr: post.excerptAr || "", excerptEn: post.excerptEn || "",
    bodyAr: post.bodyAr || "", bodyEn: post.bodyEn || "",
    published: post.published !== false,
  });
  const set = (k: string, val: any) => setV(p => ({ ...p, [k]: val }));
  return (
    <div style={edCard}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <div><label style={edLabel}>العنوان (عربي)</label><input style={edInput} value={v.titleAr} onChange={e => set("titleAr", e.target.value)} /></div>
        <div><label style={edLabel}>Title (EN)</label><input style={edInput} value={v.titleEn} onChange={e => set("titleEn", e.target.value)} dir="ltr" /></div>
        <div><label style={edLabel}>الرابط (slug)</label><input style={edInput} value={v.slug} onChange={e => set("slug", e.target.value)} dir="ltr" /></div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 8, paddingBottom: 8 }}>
          <label style={{ display: "flex", alignItems: "center", gap: 6, color: "#fff", fontSize: 13 }}>
            <input type="checkbox" checked={v.published} onChange={e => set("published", e.target.checked)} /> منشور
          </label>
        </div>
        <div><label style={edLabel}>مقتطف (عربي)</label><input style={edInput} value={v.excerptAr} onChange={e => set("excerptAr", e.target.value)} /></div>
        <div><label style={edLabel}>Excerpt (EN)</label><input style={edInput} value={v.excerptEn} onChange={e => set("excerptEn", e.target.value)} dir="ltr" /></div>
        <div><label style={edLabel}>المحتوى (عربي)</label><textarea style={{ ...edInput, minHeight: 90 }} value={v.bodyAr} onChange={e => set("bodyAr", e.target.value)} /></div>
        <div><label style={edLabel}>Body (EN)</label><textarea style={{ ...edInput, minHeight: 90 }} value={v.bodyEn} onChange={e => set("bodyEn", e.target.value)} dir="ltr" /></div>
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
        <button className="action-btn primary" onClick={() => onSave(v)}>حفظ</button>
        <button className="action-btn danger" onClick={onDelete}>حذف</button>
      </div>
    </div>
  );
}
