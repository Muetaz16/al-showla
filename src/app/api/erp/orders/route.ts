import { NextResponse } from "next/server";
import { getOrders } from "@/app/actions";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get("key");
  const expected = process.env.ERP_API_KEY;

  if (expected && key !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const orders = await getOrders();
  return NextResponse.json({
    exportedAt: new Date().toISOString(),
    count: orders.length,
    orders,
  });
}
