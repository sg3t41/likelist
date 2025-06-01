import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || !(session.user as any).userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).userId;

    // サブカテゴリの存在確認と権限チェック
    const existingSubCategory = await prisma.subCategory.findUnique({
      where: { id: params.id },
      include: {
        rankingItems: true,
      },
    });

    if (!existingSubCategory) {
      return NextResponse.json({ error: "SubCategory not found" }, { status: 404 });
    }

    if (existingSubCategory.userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // サブカテゴリを削除（関連するランキングアイテムも自動的に削除される）
    await prisma.subCategory.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "SubCategory deleted successfully" });
  } catch (error) {
    console.error("Error deleting subcategory:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || !(session.user as any).userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).userId;
    const body = await request.json();

    // サブカテゴリの存在確認と権限チェック
    const existingSubCategory = await prisma.subCategory.findUnique({
      where: { id: params.id },
    });

    if (!existingSubCategory) {
      return NextResponse.json({ error: "SubCategory not found" }, { status: 404 });
    }

    if (existingSubCategory.userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // サブカテゴリ名を更新
    const updatedSubCategory = await prisma.subCategory.update({
      where: { id: params.id },
      data: { name: body.name },
    });

    return NextResponse.json(updatedSubCategory);
  } catch (error) {
    console.error("Error updating subcategory:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}