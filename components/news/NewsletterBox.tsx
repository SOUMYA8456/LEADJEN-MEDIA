"use client";

import React, { useState } from "react";
import { Mail, CheckCircle, ArrowRight } from "lucide-react";

interface NewsletterBoxProps {
  badge?: string;
  title?: string;
  description?: string;
  placeholder?: string;
  buttonText?: string;
  supportingText?: string;
}

export function NewsletterBox({
  badge = "LEADJEN EDITORIAL DISPATCH",
  title = "GET THE NEWS THAT MATTERS",
  description = "Daily headlines, critical investigative stories, global markets, and policy insights delivered directly to your inbox every morning.",
  placeholder = "Enter your email address...",
  buttonText = "SUBSCRIBE",
  supportingText = "Zero spam. Unsubscribe anytime. Verified editorial dispatch.",
}: NewsletterBoxProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus("success");
        setMessage("Thank you for subscribing to Leadjen Daily Briefing.");
        setEmail("");
      } else {
        setStatus("error");
        setMessage(data.error || "Subscription failed. Please try again.");
      }
    } catch {
      setStatus("error");
      setMessage("Network error. Please try again.");
    }
  };

  return (
    <section className="w-full bg-black text-white rounded-2xl p-8 sm:p-12 my-8 relative overflow-hidden shadow-none border border-gray-800">
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-neutral-800/20 rounded-full blur-3xl pointer-events-none" />
      <div className="max-w-3xl mx-auto text-center relative z-10">
        <span className="text-[11px] font-mono font-bold tracking-[0.2em] text-neutral-400 uppercase block mb-2">
          {badge}
        </span>
        <h2 className="font-serif font-black text-2xl sm:text-3xl md:text-4xl text-white tracking-tight leading-tight uppercase">
          {title}
        </h2>
        <p className="mt-3 text-sm sm:text-base text-gray-300 max-w-xl mx-auto font-sans leading-relaxed">
          {description}
        </p>

        {status === "success" ? (
          <div className="mt-6 inline-flex items-center gap-2 px-5 py-3 bg-neutral-900 border border-neutral-700 rounded-lg text-white text-sm font-semibold animate-in fade-in">
            <CheckCircle className="w-5 h-5 text-white" />
            <span>{message}</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <div className="relative flex-1">
              <Mail className="w-5 h-5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={placeholder}
                className="w-full pl-11 pr-4 py-3 bg-gray-900/90 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-white text-sm"
              />
            </div>
            <button
              type="submit"
              disabled={status === "loading"}
              className="px-6 py-3 bg-[#1E1B1A] hover:bg-neutral-800 text-white border border-neutral-700 font-bold text-xs uppercase tracking-wider rounded-lg transition flex items-center justify-center gap-1.5 shadow-none flex-shrink-0 disabled:opacity-50"
            >
              <span>{status === "loading" ? "Subscribing..." : buttonText}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {status === "error" && (
          <p className="mt-3 text-xs text-neutral-400">{message}</p>
        )}

        <p className="mt-4 text-[11px] text-gray-400">
          {supportingText}
        </p>
      </div>
    </section>
  );
}
