"use client";
import { useState, useEffect } from "react";
import { X, UserPlus, Edit3, ShieldCheck } from "lucide-react";

export default function AddUserModal({ isOpen, onClose, onAddUser, editUser }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    status: "Active",
  });

  useEffect(() => {
    if (isOpen) {
      if (editUser) {
        setForm({
          name: editUser.name || "",
          email: editUser.email || "",
          phoneNumber: editUser.phoneNumber || "",
          status: editUser.status || "Active",
        });
      } else {
        setForm({ name: "", email: "", phoneNumber: "", status: "Active" });
      }
    }
  }, [isOpen, editUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]:
        name === "phoneNumber"
          ? value.replace(/\D/g, "").slice(0, 10)
          : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email) return;
    await onAddUser(form);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-[2px] flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div
              className={`p-2 ${editUser ? "bg-blue-600" : "bg-slate-900"} text-white rounded-lg`}
            >
              {editUser ? <Edit3 size={18} /> : <UserPlus size={18} />}
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 leading-tight">
                {editUser ? "Edit Customer Details" : "Add New Customer"}
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                {editUser
                  ? "Modify the existing user information"
                  : "Create a new profile in your database"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 cursor-pointer hover:text-slate-900 hover:bg-slate-100 p-1.5 rounded-lg transition"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Full Name
            </label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="e.g. Rahul Sharma"
              className="w-full bg-white border border-slate-400 px-4 py-2.5 rounded-lg text-sm text-slate-900 placeholder:text-slate-500 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none transition"
              required
            />
          </div>

          <div className={editUser ? "space-y-5" : "grid grid-cols-2 gap-5"}>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Email Address
              </label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="rahul@company.com"
                className="w-full bg-white border border-slate-400 px-4 py-2.5 rounded-lg text-sm text-slate-900 placeholder:text-slate-500 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none transition"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Phone Number
              </label>
              <input
                name="phoneNumber"
                value={form.phoneNumber}
                onChange={handleChange}
                type="tel"
                placeholder="+91 9876543210"
                inputMode="numeric"
                pattern="[0-9]{10}"
                maxLength={10}
                className="w-full bg-white border border-slate-400 px-4 py-2.5 rounded-lg text-sm text-slate-900 placeholder:text-slate-500 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none transition"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Status
              </label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full bg-white border border-slate-400 px-4 py-2.5 rounded-lg text-sm text-slate-900 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none cursor-pointer transition appearance-none"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="pt-4 flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border cursor-pointer border-slate-400 rounded-lg text-sm font-bold text-slate-700 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`flex-[2] cursor-pointer ${editUser ? "bg-blue-600 hover:bg-blue-700" : "bg-slate-900 hover:bg-black"} text-white py-2.5 rounded-lg font-bold text-sm transition shadow-lg active:scale-[0.98]`}
            >
              {editUser ? "Update Details" : "Confirm & Add User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
