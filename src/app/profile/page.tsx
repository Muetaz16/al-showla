import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import { redirect } from "next/navigation";
import { getOrders, getFavorites, getProducts } from "@/app/actions";
import ProfileView from "./ProfileView";

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
    <ProfileView
      user={{ name: user.name || null, email: user.email || null }}
      orders={myOrders.map(o => ({ id: o.id, status: o.status, date: String(o.date), total: o.total }))}
      favorites={favorites}
    />
  );
}
