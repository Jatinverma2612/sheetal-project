// components/admin/size-chart/SizeChartModal.js
"use client";
import { useState } from "react";
import { X } from "lucide-react";
import { addSize } from "@/services/sizeChartService"; // Import the service

export default function SizeChartModal({ isOpen, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    label: "",
    bust: "",
    waist: "",
    hip: "",
    shoulder: "",
    length: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await addSize(formData);
      onSuccess(response.data); // Pass the updated size chart to parent
      setFormData({
        // Reset form after successful submission
        label: "",
        bust: "",
        waist: "",
        hip: "",
        shoulder: "",
        length: "",
      });
      onClose();
    } catch (err) {
      setError(err.message);
      console.error("Error adding size:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6 animate-in fade-in-0 zoom-in-95">
        <div className="flex items-center justify-between pb-4 text-black">
          <h2 className="text-xl font-bold">Add New Size</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4 text-black">
          <div>
            <label
              htmlFor="label"
              className="block text-sm font-medium text-gray-700"
            >
              Size Label
            </label>
            <input
              type="text"
              id="label"
              name="label"
              value={formData.label}
              onChange={handleChange}
              required
              className="mt-1 text-black block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label
              htmlFor="bust"
              className="block text-sm font-medium text-gray-700"
            >
              Bust (in)
            </label>
            <input
              type="text"
              id="bust"
              name="bust"
              value={formData.bust}
              onChange={handleChange}
              className="mt-1 text-black block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label
              htmlFor="waist"
              className="block text-sm font-medium text-gray-700"
            >
              Waist (in)
            </label>
            <input
              type="text"
              id="waist"
              name="waist"
              value={formData.waist}
              onChange={handleChange}
              className="mt-1 text-black block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label
              htmlFor="hip"
              className="block text-sm font-medium text-gray-700"
            >
              Hip (in)
            </label>
            <input
              type="text"
              id="hip"
              name="hip"
              value={formData.hip}
              onChange={handleChange}
              className="mt-1 text-black block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label
              htmlFor="shoulder"
              className="block text-sm font-medium text-gray-700"
            >
              Shoulder (in)
            </label>
            <input
              type="text"
              id="shoulder"
              name="shoulder"
              value={formData.shoulder}
              onChange={handleChange}
              className="mt-1 text-black block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label
              htmlFor="length"
              className="block text-sm font-medium text-gray-700"
            >
              Length (in)
            </label>
            <input
              type="text"
              id="length"
              name="length"
              value={formData.length}
              onChange={handleChange}
              className="mt-1 text-black block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              disabled={loading}
            >
              {loading ? "Adding..." : "Add Size"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
