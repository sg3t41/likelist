import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { referenceId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || !(session.user as any).userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).userId;

    // 参照の存在確認
    const reference = await prisma.mainCategoryItemReference.findUnique({
      where: { id: params.referenceId },
      include: {
        mainCategory: true,
      },
    });

    if (!reference) {
      return NextResponse.json({ error: "Reference not found" }, { status: 404 });
    }

    // 権限チェック（メインカテゴリの所有者のみ削除可能）
    if (reference.mainCategory.userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // 参照を削除（元の項目は残る）
    await prisma.mainCategoryItemReference.delete({
      where: { id: params.referenceId },
    });

    return NextResponse.json({ message: "Reference deleted successfully" });
  } catch (error) {
    console.error("Error deleting reference:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}