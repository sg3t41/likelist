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
    const { name } = await request.json();

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    // メインカテゴリの存在確認
    const mainCategory = await prisma.mainCategory.findFirst({
      where: {
        id: id,
        userId: userId,
      },
    });

    if (!mainCategory) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    // サブカテゴリを作成
    const subCategory = await prisma.subCategory.create({
      data: {
        name,
        mainCategoryId: id,
        userId,
      },
    });

    return NextResponse.json(subCategory);
  } catch (error) {
    console.error("Error creating subcategory:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}