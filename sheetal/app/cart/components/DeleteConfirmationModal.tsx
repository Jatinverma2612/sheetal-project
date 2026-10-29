import React, { useState } from "react";
import { X } from "lucide-react";

interface DeleteConfirmationModalProps {
  onConfirm: () => Promise<void>;
  onCancel: () => void;
  onMoveToWishlist: () => Promise<void>;
  isBulkAction?: boolean;
  itemCount?: number;
  mode?: "remove" | "wishlist";
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  onConfirm,
  onCancel,
  onMoveToWishlist,
  isBulkAction = false,
  itemCount = 0,
  mode = "remove",
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isWishlistMode = mode === "wishlist";

  const handleAction = async (action: () => Promise<void>) => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      await action();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onClick={() => {
        if (!isSubmitting) {
          onCancel();
        }
      }}
    >
      {/* Modal box */}
      <div
        className="relative bg-white px-6 py-4 rounded-xl shadow-2xl w-full max-w-md mx-4 font-montserrat font-optima"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition-colors cursor-pointer p-1 rounded-full hover:bg-gray-100 disabled:opacity-50"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        <h2 className="text-lg font-bold text-gray-800 mb-3 pr-6">
          {isWishlistMode
            ? `Move ${itemCount} Item${itemCount !== 1 ? "s" : ""} to Wishlist`
            : isBulkAction
              ? `Remove ${itemCount} Items`
              : "Remove Item"}
        </h2>

        <p className="text-gray-600 mb-5 text-sm">
          {isWishlistMode
            ? `Are you sure you want to move ${itemCount !== 1 ? "these items" : "this item"} to your wishlist?`
            : isBulkAction
              ? "Are you sure you want to remove these items from your cart?"
              : "Are you sure you want to remove this item from your cart?"}
        </p>

        <div className="flex justify-between space-x-3">
          {isWishlistMode ? (
            <>
              <button
                onClick={onCancel}
                disabled={isSubmitting}
                className="cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 flex-1 px-4 py-2 text-black bg-gray-200 hover:bg-gray-300 transition-colors font-semibold text-sm"
              >
                Cancel
              </button>

              <button
                onClick={() => handleAction(onMoveToWishlist)}
                disabled={isSubmitting}
                className="cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 flex-1 px-4 py-2 text-white bg-[#693e07] transition-colors font-semibold text-sm"
              >
                Move to Wishlist
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => handleAction(onConfirm)}
                disabled={isSubmitting}
                className="cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 flex-1 px-4 py-2 text-black bg-gray-200 hover:bg-gray-300 transition-colors font-semibold text-sm"
              >
                Remove
              </button>

              <button
                onClick={() => handleAction(onMoveToWishlist)}
                disabled={isSubmitting}
                className="cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 flex-1 px-4 py-2 text-white bg-[#693e07] transition-colors font-semibold text-sm"
              >
                Move to Wishlist
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;
