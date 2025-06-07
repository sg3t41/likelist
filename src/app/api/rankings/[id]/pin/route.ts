import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !(session.user as any).userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const { isPinned } = await request.json();

    // アイテムの所有者確認
    const item = await prisma.rankingItem.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    if (item.userId !== (session.user as any).userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // ピン留め状態を更新
    const updatedItem = await prisma.rankingItem.update({
      where: { id },
      data: { isPinned },
    });

    return NextResponse.json(updatedItem);
  } catch (error) {
    console.error("Error updating pin status:", error);
    return NextResponse.json(
      { error: "Failed to update pin status" },
      { status: 500 }
    );
  }
}