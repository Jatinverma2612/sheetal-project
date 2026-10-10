"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Mail, ArrowRight, Loader2, ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleReset = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      setTimeout(() => {
        setLoading(false);
        toast.success("Recovery instructions sent to your email.");
      }, 1500);
    } catch (error) {
      toast.error("Failed to send reset link.");
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#fafafa] items-center justify-center px-6 py-12 antialiased">
      <div className="w-full max-w-md bg-white border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-2xl p-8 lg:p-12">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-600 hover:text-black transition-all mb-10"
        >
          <ChevronLeft size={14} /> Back to Login
        </Link>

        <div className="space-y-3">
          <h2 className="text-3xl font-serif font-medium tracking-tight text-gray-900">
            Password Recovery
          </h2>
          <p className="text-sm text-gray-500 leading-relaxed font-light">
            Please enter your registered email address. We will send you a
            secure link to reset your password.
          </p>
        </div>

        <div className="mt-10">
          <form onSubmit={handleReset} className="space-y-10">
            <div className="group">
              <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 group-focus-within:text-black transition-colors">
                Email Address
              </label>
              <div className="mt-2 flex items-center border-b border-gray-200 py-3 group-focus-within:border-black transition-all duration-300">
                <Mail className="h-4 w-4 text-gray-800 group-focus-within:text-black transition-colors" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full appearance-none bg-transparent px-4 text-gray-900 focus:outline-none sm:text-sm placeholder:text-gray-300"
                  placeholder="your@email.com"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-3 bg-black px-8 py-5 text-[11px] font-bold uppercase tracking-[0.2em] text-white transition-all hover:bg-neutral-800 active:scale-[0.98] disabled:bg-gray-100 disabled:text-gray-400 rounded-lg"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={16} />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  Send Reset Link <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
