"use client";

import { RankingItem } from "@/types";

interface PositionMoveModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: RankingItem | null;
  currentPosition: number;
  onMove: (newPosition: number) => void;
}

export default function PositionMoveModal({
  isOpen,
  onClose,
  item,
  currentPosition,
  onMove,
}: PositionMoveModalProps) {
  if (!isOpen || !item) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">
          順位を選択
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          「{item.title}」の新しい順位を選択してください
        </p>
        
        <div className="grid grid-cols-4 gap-2 mb-6">
          {Array.from({ length: 11 }, (_, i) => i + 1).map((pos) => (
            <button
              key={pos}
              onClick={() => {
                onMove(pos);
                onClose();
              }}
              className={`p-3 rounded-md text-center font-medium transition-colors ${
                pos === currentPosition
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
              }`}
            >
              {pos}
            </button>
          ))}
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
          >
            キャンセル
          </button>
        </div>
      </div>
    </div>
  );
}