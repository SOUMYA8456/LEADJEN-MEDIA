"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, Mail, Shield, ArrowRight, CheckCircle } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@leadjenmedia.com");
  const [password, setPassword] = useState("adminpassword123");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (res.ok) {
        router.push("/admin");
        router.refresh();
      } else {
        setError(data.error || "Invalid credentials");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fillCredentials = (roleEmail: string, rolePass: string) => {
    setEmail(roleEmail);
    setPassword(rolePass);
  };

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans text-gray-200">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-block">
          <img
            src="/images/logo-white.png"
            alt="LEADJEN MEDIA"
            className="h-12 w-auto object-contain mx-auto"
          />
        </Link>
        <h2 className="mt-4 text-xl font-bold font-serif text-white tracking-tight">
          Editorial Newsroom CMS Access
        </h2>
        <p className="mt-1 text-xs text-gray-400 font-mono">
          Authorized Editorial Staff & Administrators Only
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-gray-900 py-8 px-6 shadow-2xl rounded-xl border border-gray-800 sm:px-10">
          <form className="space-y-5" onSubmit={handleLogin}>
            {error && (
              <div className="p-3 bg-red-950/60 border border-red-800 text-red-300 text-xs rounded-lg font-medium">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1">
                Editorial Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="editor@leadjenmedia.com"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-gray-950 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-leadjen-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1">
                Security Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-gray-950 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-leadjen-500"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-lg shadow-sm text-xs font-black uppercase tracking-wider text-white bg-leadjen-600 hover:bg-leadjen-700 focus:outline-none transition disabled:opacity-50"
              >
                <span>{loading ? "Authenticating..." : "Sign In to Newsroom"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Quick Demo Credentials Assistant */}
          <div className="mt-6 pt-6 border-t border-gray-800 space-y-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-gray-400 block">
              Quick Role Test Credentials:
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => fillCredentials("admin@leadjenmedia.com", "adminpassword123")}
                className="p-2 bg-gray-950 hover:bg-gray-800 rounded border border-gray-800 text-[10px] font-mono text-leadjen-300"
              >
                Super Admin
              </button>
              <button
                type="button"
                onClick={() => fillCredentials("editor@leadjenmedia.com", "editorpassword123")}
                className="p-2 bg-gray-950 hover:bg-gray-800 rounded border border-gray-800 text-[10px] font-mono text-gray-300"
              >
                Editor
              </button>
              <button
                type="button"
                onClick={() => fillCredentials("reporter@leadjenmedia.com", "reporterpassword123")}
                className="p-2 bg-gray-950 hover:bg-gray-800 rounded border border-gray-800 text-[10px] font-mono text-gray-300"
              >
                Reporter
              </button>
            </div>
          </div>
        </div>

        <div className="mt-4 text-center">
          <Link
            href="/"
            className="text-xs text-gray-400 hover:text-white transition font-mono"
          >
            ← Back to Public Website
          </Link>
        </div>
      </div>
    </div>
  );
}
