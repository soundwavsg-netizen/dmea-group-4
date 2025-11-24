import React from 'react';

const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, itemName }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-[#A62639]" style={{ fontFamily: 'Playfair Display, serif' }}>
            Confirm Deletion
          </h2>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          <p className="text-[#333333] mb-2">
            Are you sure you want to delete <span className="font-semibold">{itemName}</span>?
          </p>
          <p className="text-[#6C5F5F] text-sm">
            This action cannot be undone.
          </p>
        </div>

        {/* Buttons */}
        <div className="px-6 py-4 bg-[#FAF7F5] border-t border-gray-200 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 text-[#6C5F5F] rounded-lg font-medium hover:bg-gray-50 transition-colors"
            data-testid="delete-cancel-btn"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-6 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
            data-testid="delete-confirm-btn"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;