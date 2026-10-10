"use client";

import React from "react";

interface WishlistLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: () => void;
}

const WishlistLoginModal: React.FC<WishlistLoginModalProps> = ({
  isOpen,
  onClose,
  onLogin,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10050] flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
        <h3 className="text-xl font-semibold text-[#683e14]">
          Login Required
        </h3>
        <p className="mt-3 text-sm text-gray-600">
          Please login to add items to your wishlist.
        </p>
        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onLogin}
            className="cursor-pointer rounded-md bg-[#683e14] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#7f4f1a]"
          >
            Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default WishlistLoginModal;
