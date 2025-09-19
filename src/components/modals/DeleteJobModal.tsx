"use client";
import { X } from "lucide-react";


interface DeleteJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function DeleteJobModal({
  isOpen,
  onClose,
  onConfirm,
}: DeleteJobModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="relative w-[560px] h-[155px] bg-white rounded-2xl shadow-md p-6">
        {/* Close button */}
        <button
          className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-200"
          onClick={onClose}
        >
          <X className="w-4 h-4 text-gray-700" />
        </button>

        {/* Title */}
        <h2 className="text-xl font-bold text-gray-900 mb-2">Delete message</h2>

        {/* Description */}
        <p className="text-gray-600 text-sm mb-6">
          Are you sure you want to delete this Application? This cannot be
          undone.
        </p>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button
            className="w-[70px] h-9 bg-white border border-gray-400 rounded-md text-gray-500 font-medium hover:bg-gray-100"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="w-[66px] h-9 bg-red-600 text-white rounded-md font-medium hover:bg-red-700"
            onClick={onConfirm}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
