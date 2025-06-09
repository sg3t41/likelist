import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    
    if (!session?.user || !(session.user as any).userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).userId;
    const { images } = await request.json();

    if (!Array.isArray(images)) {
      return NextResponse.json({ error: "Images must be an array" }, { status: 400 });
    }

    // アイテムの存在確認と権限チェック
    const existingItem = await prisma.rankingItem.findUnique({
      where: { id },
    });

    if (!existingItem) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    if (existingItem.userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // 既存の画像をすべて削除
    await prisma.rankingItemImage.deleteMany({
      where: { rankingItemId: id },
    });

    // 新しい画像を追加
    if (images.length > 0) {
      const imageData = images.map((url, index) => ({
        url,
        rankingItemId: id,
        order: index,
      }));

      await prisma.rankingItemImage.createMany({
        data: imageData,
      });
    }

    // 更新された画像リストを取得
    const updatedImages = await prisma.rankingItemImage.findMany({
      where: { rankingItemId: id },
      orderBy: { order: 'asc' },
    });

    return NextResponse.json({ images: updatedImages });
  } catch (error) {
    console.error("Error updating images:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}