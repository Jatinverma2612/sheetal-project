"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Mail,
  Lock,
  User,
  ArrowRight,
  Eye,
  EyeOff,
  Loader2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { userRegister } from "@/services/authService";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await userRegister(formData);
      toast.success("Welcome! Your account has been created.");
      router.push("/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-white antialiased">
      <div className="relative hidden w-0 flex-1 lg:block">
        <img
          className="absolute inset-0 h-full w-full object-cover"
          src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070"
          alt="Luxury Brand Experience"
        />
        <div className="absolute inset-0 bg-black/40 mix-blend-multiply" />
        <div className="absolute bottom-12 left-12 text-white max-w-md">
          <h1 className="text-5xl font-serif font-light tracking-tight italic">
            Join the Atelier
          </h1>
          <p className="mt-4 text-sm font-light tracking-[0.3em] uppercase opacity-80 leading-loose">
            Become a part of our exclusive curator network.
          </p>
        </div>
      </div>

      <div className="flex flex-1 flex-col justify-center px-8 py-12 lg:flex-none lg:px-20 xl:px-32">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className="text-center lg:text-left">
            <h2 className="text-4xl font-serif font-medium tracking-tight text-gray-900">
              Create Profile
            </h2>
            <p className="mt-4 text-sm text-gray-500 leading-relaxed">
              Already a member?{" "}
              <Link
                href="/login"
                className="font-medium text-black hover:underline underline-offset-4 transition-all"
              >
                Sign in to your account
              </Link>
            </p>
          </div>

          <div className="mt-12">
            <form onSubmit={handleRegister} className="space-y-7">
              <div className="group">
                <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 group-focus-within:text-black transition-colors">
                  Full Name
                </label>
                <div className="mt-1 flex items-center border-b border-gray-200 py-3 group-focus-within:border-black transition-all duration-300">
                  <User className="h-4 w-4 text-gray-800 group-focus-within:text-black" />
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="block w-full appearance-none bg-transparent px-4 text-gray-900 focus:outline-none sm:text-sm placeholder:text-gray-300"
                    placeholder="Full Name"
                  />
                </div>
              </div>

              <div className="group">
                <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 group-focus-within:text-black transition-colors">
                  Email Address
                </label>
                <div className="mt-1 flex items-center border-b border-gray-200 py-3 group-focus-within:border-black transition-all duration-300">
                  <Mail className="h-4 w-4 text-gray-800 group-focus-within:text-black" />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="block w-full appearance-none bg-transparent px-4 text-gray-900 focus:outline-none sm:text-sm placeholder:text-gray-300"
                    placeholder="name@domain.com"
                  />
                </div>
              </div>

              <div className="group">
                <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 group-focus-within:text-black transition-colors">
                  Create Password
                </label>
                <div className="mt-1 flex items-center border-b border-gray-200 py-3 group-focus-within:border-black transition-all duration-300">
                  <Lock className="h-4 w-4 text-gray-800 group-focus-within:text-black" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className="block w-full appearance-none bg-transparent px-4 text-gray-900 focus:outline-none sm:text-sm placeholder:text-gray-300"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-400 hover:text-black transition-colors px-2"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-3 bg-black px-8 py-5 text-[11px] font-bold uppercase tracking-[0.2em] text-white transition-all hover:bg-neutral-800 active:scale-[0.98] disabled:bg-gray-100 disabled:text-gray-400"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin" size={16} />
                      <span>Creating Account...</span>
                    </>
                  ) : (
                    <>
                      Join Now <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
