"use client";
import { useState, useEffect } from "react";
import { Plus } from "lucide-react";

interface CreateListModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (listName: string) => void;
}

export default function CreateListModal({
  isOpen,
  onClose,
  onSubmit,
}: CreateListModalProps) {
  const [listName, setListName] = useState("");

  useEffect(() => {
    if (!isOpen) setListName("");
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="relative w-[560px] bg-white rounded-xl shadow-md p-6">
        {/* Close button */}
        <button
          className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-200"
          onClick={onClose}
        >
          ✕
        </button>

        <h2 className="text-xl font-bold text-gray-900 mb-6">
          Create a New List
        </h2>

        <div className="mb-6">
          <label className="block text-gray-700 font-semibold mb-2">
            New List Name
          </label>
          <input
            type="text"
            value={listName}
            onChange={(e) => setListName(e.target.value)}
            className="w-full h-12 px-4 rounded-md bg-gray-100 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="New List"
          />
        </div>

        <div className="flex justify-end gap-3">
          <button
            className="w-24 h-10 bg-white border border-gray-400 rounded-md text-gray-600 font-medium hover:bg-gray-100"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="w-24 h-10 bg-indigo-600 text-white rounded-md font-medium hover:bg-indigo-700 flex items-center justify-center gap-1"
            onClick={() => {
              if (!listName.trim()) return;
              onSubmit(listName.trim());
            }}
          >
            <Plus className="h-4 w-4" />
            Create
          </button>
        </div>
      </div>
    </div>
  );
}
