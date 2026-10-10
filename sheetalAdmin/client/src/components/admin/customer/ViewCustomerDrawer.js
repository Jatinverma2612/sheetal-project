"use client";
import { X, User, Mail, Phone, Shield, Calendar, Activity } from "lucide-react";

export default function ViewUserDrawer({ isOpen, onClose, user }) {
  if (!user) return null;

  return (
    <>
      <div
        className={`fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[150] transition-opacity ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={onClose}
      />

      <div
        className={`fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-[160] transform transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50">
          <h2 className="text-xl font-bold text-slate-900">User Profile</h2>
          <button
            onClick={onClose}
            className="p-2 cursor-pointer hover:bg-slate-200 rounded-full text-slate-500 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-8">
          <div className="flex items-center gap-4">
            <div className="h-20 w-20 bg-slate-900 text-white flex items-center justify-center rounded-2xl text-2xl font-bold">
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-900">{user.name}</h3>
              <p className="text-slate-500 font-medium">
                {user.role || "Customer"}
              </p>
            </div>
          </div>

          <div className="grid gap-6">
            <div className="flex items-center gap-4 p-4 rounded-xl border border-slate-100 bg-slate-50/50">
              <div className="p-2 bg-white rounded-lg shadow-sm text-slate-600">
                <Mail size={20} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase">
                  Email Address
                </p>
                <p className="text-sm font-bold text-slate-900">{user.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-xl border border-slate-100 bg-slate-50/50">
              <div className="p-2 bg-white rounded-lg shadow-sm text-slate-600">
                <Phone size={20} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase">
                  Phone Number
                </p>
                <p className="text-sm font-bold text-slate-900">
                  {user.phoneNumber || "Not provided"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-xl border border-slate-100 bg-slate-50/50">
              <div className="p-2 bg-white rounded-lg shadow-sm text-slate-600">
                <Activity size={20} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase">
                  Account Status
                </p>
                <span
                  className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-bold ${user.status === "Active" ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"}`}
                >
                  {user.status}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-xl border border-slate-100 bg-slate-50/50">
              <div className="p-2 bg-white rounded-lg shadow-sm text-slate-600">
                <Calendar size={20} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase">
                  Member Since
                </p>
                <p className="text-sm font-bold text-slate-900">
                  {user.createdAt
                    ? new Date(user.createdAt).toLocaleDateString("en-GB")
                    : "N/A"}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 w-full p-6 border-t border-slate-100 bg-white">
          <button
            onClick={onClose}
            className="w-full cursor-pointer bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-black transition-all active:scale-95"
          >
            Close Details
          </button>
        </div>
      </div>
    </>
  );
}
