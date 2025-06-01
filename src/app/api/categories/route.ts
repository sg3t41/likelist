import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const targetUserId = searchParams.get('userId');
    
    if (targetUserId) {
      // 特定ユーザーのカテゴリを取得（公開のみ）
      const userCategories = await prisma.mainCategory.findMany({
        where: { 
          userId: targetUserId,
          isPublic: true 
        },
        include: {
          subCategories: {
            where: { isPublic: true }
          },
        },
      });

      return NextResponse.json({
        userCategories,
      });
    } else {
      // 現在のユーザーのカテゴリを取得（全て）
      const session = await getServerSession(authOptions);
      
      if (!session?.user || !(session.user as any).userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const userId = (session.user as any).userId;

      const userCategories = await prisma.mainCategory.findMany({
        where: { userId },
        include: {
          subCategories: true,
        },
      });

      return NextResponse.json({
        userCategories,
      });
    }
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || !(session.user as any).userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).userId;
    const body = await request.json();
    const { mainCategoryName, subCategories } = body;

    if (!mainCategoryName || !subCategories || !Array.isArray(subCategories)) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    // メインカテゴリを作成
    const mainCategory = await prisma.mainCategory.create({
      data: {
        name: mainCategoryName,
        userId,
        subCategories: {
          create: subCategories.map((subCat: string) => ({
            name: subCat,
            userId,
          })),
        },
      },
      include: {
        subCategories: true,
      },
    });

    return NextResponse.json(mainCategory);
  } catch (error) {
    console.error("Error creating category:", error);
    if (error instanceof Error && error.message.includes('Foreign key')) {
      return NextResponse.json({ 
        error: "認証エラー：一度ログアウトして再度ログインしてください" 
      }, { status: 401 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}