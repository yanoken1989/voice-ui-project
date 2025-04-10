import React, { useState } from "react";

export function RecordRow({ record, onSave }) {
  const [isEditing, setIsEditing] = useState(false);
  const [quantity, setQuantity] = useState(record.quantity);

  const handleSave = () => {
    onSave(record.id, quantity, record, record.item);
    setIsEditing(false);
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 px-4 py-3 bg-white">
      {/* パンの名前 */}
      <div className="text-sm font-medium text-gray-800 sm:w-40">
        {record.item}
      </div>

      {/* 製造数 */}
      <div className="flex-1">
        {isEditing ? (
          <input
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            type="number"
            className="w-full border rounded-lg px-3 py-2 text-right text-base"
          />
        ) : (
          <div className="text-right text-base text-gray-700">
            {record.quantity}個
          </div>
        )}
      </div>

      {/* 編集・保存ボタン */}
      <div className="flex gap-2 w-full sm:w-auto">
        {isEditing ? (
          <button
            onClick={handleSave}
            className="w-full sm:w-auto h-9 px-4 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            保存
          </button>
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className="w-full sm:w-auto h-9 px-4 text-sm bg-orange-100 text-orange-700 rounded-md hover:bg-orange-200 transition"
          >
            編集
          </button>
        )}
      </div>
    </div>
  );
}
