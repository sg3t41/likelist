"use client";

interface CategoryListProps {
  allCategories: any[];
  expandedCategories: Set<string>;
  setExpandedCategories: (categories: Set<string>) => void;
  onCategorySelect?: (mainCat: any, subCat: any, subCatId: string) => void;
  onMainCategorySelect?: (mainCat: any) => void;
  onAddCategory?: () => void;
  onAddSubCategory?: (mainCat: any) => void;
  isOwner?: boolean;
  showAddButton?: boolean;
  onMenuClose?: () => void;
  wrapperClass?: string;
  selectedMainCategoryId?: string;
  selectedSubCategoryId?: string;
  isMainCategoryView?: boolean;
}

export default function CategoryList({
  allCategories = [],
  expandedCategories = new Set(),
  setExpandedCategories,
  onCategorySelect,
  onMainCategorySelect,
  onAddCategory,
  onAddSubCategory,
  isOwner = false,
  showAddButton = false,
  onMenuClose,
  wrapperClass = "",
  selectedMainCategoryId,
  selectedSubCategoryId,
  isMainCategoryView = false
}: CategoryListProps) {
  return (
    <div className={wrapperClass || "flex-1 overflow-y-auto pb-20"}>
      {allCategories.map((category) => (
        <div key={category.id} className="border-b border-purple-100/50">
          <div className="flex items-center">
            {/* メインカテゴリクリック領域 - カテゴリページに飛ぶ */}
            <button
              onClick={() => {
                onMainCategorySelect?.(category);
                onMenuClose?.();
              }}
              className={`flex items-center space-x-3 flex-1 min-w-0 p-4 transition-all group text-left rounded-l-lg border-r border-gray-200 ${
                isMainCategoryView && selectedMainCategoryId === category.id
                  ? "bg-blue-100/80 border-blue-200"
                  : "hover:bg-purple-50/50"
              }`}
              title={`${category.name}のページを表示`}
            >
              <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
                <span className="text-white text-sm">⭐</span>
              </div>
              <div className="flex-1 min-w-0">
                <span className={`font-medium truncate transition-colors block ${
                  isMainCategoryView && selectedMainCategoryId === category.id
                    ? "text-blue-700"
                    : "text-gray-900 group-hover:text-purple-700"
                }`}>
                  {category.name}
                </span>
              </div>
            </button>
            
            {/* 右側のボタンエリア */}
            <div className="flex items-center px-2">
              {/* 展開/折りたたみボタン - 常に表示 */}
              <button
                  onClick={() => {
                    const newExpanded = new Set(expandedCategories);
                    if (newExpanded.has(category.id)) {
                      newExpanded.delete(category.id);
                    } else {
                      newExpanded.add(category.id);
                    }
                    setExpandedCategories?.(newExpanded);
                  }}
                  className="p-2 hover:bg-blue-50 rounded-md transition-all"
                  title={expandedCategories.has(category.id) ? "サブカテゴリを隠す" : "サブカテゴリを表示"}
                >
                  <svg
                    className={`w-4 h-4 text-blue-500 transition-transform duration-200 ${
                      expandedCategories.has(category.id) ? "rotate-90" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
            </div>
          </div>
          
          {expandedCategories.has(category.id) && (
            <div className="bg-gray-50/30">
              {category.subCategories && category.subCategories.length > 0 ? (
                <>
                  {category.subCategories.map((subCat: any) => (
                    <div key={subCat.id} className="ml-4">
                      <button
                        onClick={() => {
                          onCategorySelect?.(category.name, subCat.name, subCat.id);
                          onMenuClose?.();
                        }}
                        className={`w-full flex items-center space-x-3 p-3 text-left transition-all group/sub ${
                          selectedSubCategoryId === subCat.id
                            ? "bg-purple-100/80 border-l-4 border-purple-400"
                            : "hover:bg-purple-50/50"
                        }`}
                      >
                        <span className="text-sm">🏷️</span>
                        <span className={`text-sm font-medium truncate transition-colors ${
                          selectedSubCategoryId === subCat.id
                            ? "text-purple-700"
                            : "group-hover/sub:text-purple-700"
                        }`}>
                          {subCat.name}
                        </span>
                      </button>
                    </div>
                  ))}
                </>
              ) : (
                <div className="ml-4 p-3">
                  <div className="flex items-center space-x-3 text-gray-500">
                    <span className="text-sm">📂</span>
                    <span className="text-sm font-medium">サブカテゴリはありません</span>
                  </div>
                </div>
              )}
              
              {/* サブカテゴリ追加ボタン - オーナーの場合は常に表示 */}
              {isOwner && (
                <div className="ml-4 p-2">
                  <button
                    onClick={() => {
                      onAddSubCategory?.(category);
                      onMenuClose?.();
                    }}
                    className="w-full flex items-center space-x-3 p-3 text-left hover:bg-blue-50/50 transition-all group/add border-2 border-dashed border-blue-200 rounded-lg"
                    title={`${category.name}にサブカテゴリを追加`}
                  >
                    <div className="w-6 h-6 bg-blue-100 rounded-md flex items-center justify-center">
                      <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-blue-600 group-hover/add:text-blue-700 transition-colors">
                      {category.name}にサブカテゴリを追加
                    </span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}