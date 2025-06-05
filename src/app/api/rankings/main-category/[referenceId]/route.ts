import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: { referenceId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || !(session.user as any).userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).userId;
    const { position, title, description, url } = await request.json();

    // 参照の存在確認
    const reference = await prisma.mainCategoryItemReference.findUnique({
      where: { id: params.referenceId },
      include: {
        mainCategory: true,
        rankingItem: true,
      },
    });

    if (!reference) {
      return NextResponse.json({ error: "Reference not found" }, { status: 404 });
    }

    // 権限チェック（メインカテゴリの所有者のみ更新可能）
    if (reference.mainCategory.userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // 順位変更の場合、位置を入れ替える
    if (position && position !== reference.position) {
      const oldPosition = reference.position;
      
      // 同じ大カテゴリの全アイテム（直接作成＋参照）を取得
      const [directItems, references] = await Promise.all([
        prisma.rankingItem.findMany({
          where: { mainCategoryId: reference.mainCategoryId },
        }),
        prisma.mainCategoryItemReference.findMany({
          where: { mainCategoryId: reference.mainCategoryId },
        })
      ]);

      // 新しい位置にアイテムがあるかチェック
      const directItemAtNewPos = directItems.find(item => item.position === position);
      const refAtNewPos = references.find(ref => ref.position === position && ref.id !== params.referenceId);

      if (directItemAtNewPos) {
        // 直接作成されたアイテムと位置を入れ替える
        await prisma.rankingItem.update({
          where: { id: directItemAtNewPos.id },
          data: { position: oldPosition }
        });
      } else if (refAtNewPos) {
        // 参照アイテムと位置を入れ替える
        await prisma.mainCategoryItemReference.update({
          where: { id: refAtNewPos.id },
          data: { position: oldPosition }
        });
      }
    }

    // 参照の順位を更新
    const updatedReference = await prisma.mainCategoryItemReference.update({
      where: { id: params.referenceId },
      data: {
        position: position || null,
      },
      include: {
        rankingItem: {
          include: {
            subCategory: true,
          },
        },
      },
    });

    // タイトル、説明、URLを更新する場合は、元のアイテムも更新
    if (title !== undefined || description !== undefined || url !== undefined) {
      await prisma.rankingItem.update({
        where: { id: reference.rankingItemId },
        data: {
          ...(title !== undefined && { title }),
          ...(description !== undefined && { description }),
          ...(url !== undefined && { url }),
        },
      });
    }

    return NextResponse.json({
      id: updatedReference.rankingItem.id,
      title: title || updatedReference.rankingItem.title,
      description: description || updatedReference.rankingItem.description,
      url: url || updatedReference.rankingItem.url,
      position: updatedReference.position,
      isReference: true,
      referenceId: updatedReference.id,
      sourceSubCategoryName: updatedReference.rankingItem.subCategory?.name,
      sourceSubCategoryId: updatedReference.rankingItem.subCategoryId,
    });
  } catch (error) {
    console.error("Error updating reference:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

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