import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import { redirect } from "next/navigation";
import { getOrders, getFavorites, getProducts } from "@/app/actions";
import { SatisfactionSurvey } from "@/components/SatisfactionSurvey";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const user = session.user;
  const identifier = user.email || "";
  
  const allOrders = await getOrders();
  const myOrders = allOrders.filter(o => o.client === identifier || o.driverId === identifier);
  
  // We need to fetch favorites, let's assume we can use the user's ID
  const favIds = await getFavorites((user as any).id || identifier);
  const allProds = await getProducts();
  const favorites = allProds.filter(p => favIds.includes(p.id));

  return (
    <div style={S.container}>
      <div style={S.sidebar}>
        <div style={S.avatar}>👤</div>
        <h2 style={S.userName} title={user.email || ""}>
          {user.name || user.email || "مستخدم مسجل"}
        </h2>
        <p style={S.userRole}>حساب مقاول B2B</p>
        <form action="/api/auth/signout" method="POST">
          <button type="submit" style={S.logoutBtn}>تسجيل الخروج</button>
        </form>
      </div>

      <div style={S.content}>
        <h1 style={{ marginBottom: 20, color: "var(--primary)" }}>لوحة تحكم العميل</h1>
        
        <div style={S.stats}>
          <div style={S.statCard}>
            <h3>{myOrders.length}</h3>
            <p>إجمالي الطلبات</p>
          </div>
          <div style={S.statCard}>
            <h3>{myOrders.filter(o => o.status === "pending").length}</h3>
            <p>طلبات قيد المراجعة</p>
          </div>
          <div style={S.statCard}>
            <h3 style={{ color: "var(--primary)" }}>{favorites.length}</h3>
            <p>المنتجات المفضلة</p>
          </div>
        </div>

        <h2 style={{ marginTop: 40, marginBottom: 20 }}>سجل الطلبات</h2>
        {myOrders.length === 0 ? (
          <div style={S.emptyState}>لا توجد طلبات سابقة حتى الآن.</div>
        ) : (
          <div style={S.orderList}>
            {myOrders.map(o => (
              <div key={o.id} style={S.orderCard}>
                <div style={S.orderHeader}>
                  <strong>رقم الطلب: {o.id}</strong>
                  <span style={{
                    padding: "4px 10px", 
                    borderRadius: 20, 
                    fontSize: 12,
                    background: o.status === "pending" ? "#fef3c7" : "#d1fae5",
                    color: o.status === "pending" ? "#d97706" : "#059669"
                  }}>
                    {o.status === "pending" ? "قيد المراجعة ⏳" : o.status === "delivered" ? "تم التوصيل ✅" : "مؤكد 📦"}
                  </span>
                </div>
                <div style={S.orderDetails}>
                  <p>التاريخ: {new Date(o.date).toLocaleDateString("ar-EG")}</p>
                  <p>الإجمالي: {o.total.toLocaleString()} د.ل</p>
                </div>
                {o.status === "delivered" && <SatisfactionSurvey orderId={o.id} clientName={user.email || undefined} />}
              </div>
            ))}
          </div>
        )}

        <h2 style={{ marginTop: 40, marginBottom: 20 }}>المنتجات المفضلة ❤️</h2>
        {favorites.length === 0 ? (
          <div style={S.emptyState}>لم تقم بإضافة أي منتجات للمفضلة بعد.</div>
        ) : (
          <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 10 }}>
            {favorites.map(p => (
              <a key={p.id} href="/products" style={{
                minWidth: 150, background: "var(--surface)", padding: 10,
                borderRadius: 10, border: "1px solid var(--border)", textDecoration: "none", color: "var(--text)"
              }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.imageUrl} alt="" style={{ width: "100%", height: 100, objectFit: "cover", borderRadius: 8, marginBottom: 8 }} />
                <div style={{ fontSize: 13, fontWeight: "bold" }}>{p.nameAr}</div>
                <div style={{ fontSize: 11, color: "var(--text-secondary)" }}>{p.brand}</div>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const S: Record<string, React.CSSProperties> = {
  container: {
    display: "flex",
    minHeight: "80vh",
    gap: 30,
    padding: "40px 5%",
    background: "var(--bg)",
    flexWrap: "wrap",
  },
  sidebar: {
    flex: "1 1 250px",
    background: "var(--surface)",
    padding: 30,
    borderRadius: 20,
    border: "1px solid var(--border)",
    textAlign: "center",
    height: "fit-content",
  },
  avatar: {
    fontSize: "4rem",
    background: "var(--bg)",
    width: 100,
    height: 100,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 15px",
    border: "2px solid var(--primary)",
  },
  userName: {
    fontSize: "1.2rem",
    marginBottom: 5,
  },
  userRole: {
    color: "var(--primary)",
    fontWeight: "bold",
    marginBottom: 20,
  },
  logoutBtn: {
    width: "100%",
    padding: 12,
    background: "#fee2e2",
    color: "#dc2626",
    border: "none",
    borderRadius: 10,
    fontWeight: "bold",
    cursor: "pointer",
  },
  content: {
    flex: "3 1 600px",
  },
  stats: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
    gap: 20,
  },
  statCard: {
    background: "var(--surface)",
    padding: 20,
    borderRadius: 15,
    border: "1px solid var(--border)",
    textAlign: "center",
  },
  emptyState: {
    padding: 40,
    textAlign: "center",
    background: "var(--surface)",
    borderRadius: 15,
    color: "var(--text-secondary)",
    border: "1px dashed var(--border)",
  },
  orderList: {
    display: "flex",
    flexDirection: "column",
    gap: 15,
  },
  orderCard: {
    background: "var(--surface)",
    padding: 20,
    borderRadius: 15,
    border: "1px solid var(--border)",
  },
  orderHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    paddingBottom: 10,
    borderBottom: "1px solid var(--border)",
  },
  orderDetails: {
    display: "flex",
    justifyContent: "space-between",
    color: "var(--text-secondary)",
    fontSize: "0.9rem",
  }
};
