"use client";

import React, { useState } from "react";
import { Send, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

interface InquiryFormProps {
  defaultType?: "ADVERTISING" | "SERVICE" | "GENERAL";
  defaultService?: string;
  defaultAdvertisingSection?: string;
  advertisingOptions?: string[];
  serviceOptions?: string[];
  heading?: string;
  subheading?: string;
}

export function InquiryForm({
  defaultType = "ADVERTISING",
  defaultService = "",
  defaultAdvertisingSection = "",
  advertisingOptions = [
    "Homepage Advertising",
    "Banner Ads",
    "Article Page Advertising",
    "Category Page Advertising",
    "Sponsored Content",
    "Video Advertising",
    "Newsletter Advertising",
    "Brand Partnerships",
    "Custom Campaigns",
  ],
  serviceOptions = [
    "Digital Marketing Agency",
    "Media House & Studio",
    "Podcasting Venture",
    "News Blog Publishing",
    "News Article & Press",
    "Celebrity Interview",
    "Editorial Photoshoot",
    "Cinematic Videography",
    "Personal Branding",
    "Personal Relationship Management",
  ],
  heading = "Request Partnership & Rate Card",
  subheading = "Connect directly with Leadjen Media's commercial and editorial enterprise desk.",
}: InquiryFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    inquiryType: defaultType,
    serviceName: defaultService,
    advertisingType: defaultAdvertisingSection || advertisingOptions[0],
    budget: "$2,500 - $10,000",
    timeline: "Within 30 Days",
    message: "",
  });

  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("submitting");
    setErrorMessage("");

    try {
      const res = await fetch("/api/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setStatus("success");
        setSuccessMessage(data.message || "Thank you! Our partnership desk will reach out shortly.");
        setFormData({
          name: "",
          email: "",
          phone: "",
          company: "",
          inquiryType: defaultType,
          serviceName: defaultService,
          advertisingType: defaultAdvertisingSection || advertisingOptions[0],
          budget: "$2,500 - $10,000",
          timeline: "Within 30 Days",
          message: "",
        });
      } else {
        setStatus("error");
        setErrorMessage(data.error || "Failed to submit. Please verify details and try again.");
      }
    } catch {
      setStatus("error");
      setErrorMessage("Network error occurred. Please try again or contact editorial@leadjenmediadaily.com");
    }
  };

  return (
    <div id="inquiry-form" className="bg-[#1E1B1A] text-white rounded-3xl p-6 sm:p-10 border border-neutral-800 shadow-2xl">
      <div className="max-w-3xl mx-auto">
        <div className="text-center space-y-2 mb-8">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-bold tracking-widest uppercase bg-red-600/20 text-red-400 border border-red-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            COMMERCIAL &amp; PARTNERSHIP BUREAU
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-black tracking-tight text-white">
            {heading}
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400 font-sans max-w-xl mx-auto">
            {subheading}
          </p>
        </div>

        {status === "success" ? (
          <div className="p-8 rounded-2xl bg-neutral-900 border border-green-500/40 text-center space-y-4 animate-in fade-in zoom-in-95">
            <div className="w-14 h-14 bg-green-500/10 text-green-400 rounded-full flex items-center justify-center mx-auto border border-green-500/30">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-serif font-bold text-white">Inquiry Received</h3>
            <p className="text-sm text-neutral-300 font-sans max-w-md mx-auto">
              {successMessage}
            </p>
            <button
              type="button"
              onClick={() => setStatus("idle")}
              className="mt-4 px-6 py-2.5 rounded-xl bg-white text-black text-xs font-mono font-bold uppercase tracking-wider hover:bg-neutral-200 transition"
            >
              Submit Another Inquiry
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {status === "error" && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-neutral-300">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Morgan"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-neutral-900 border border-neutral-700 rounded-xl text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-white transition"
                />
              </div>

              {/* Work Email */}
              <div className="space-y-1.5">
                <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-neutral-300">
                  Official Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. partner@brand.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 bg-neutral-900 border border-neutral-700 rounded-xl text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-white transition"
                />
              </div>

              {/* Phone */}
              <div className="space-y-1.5">
                <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-neutral-300">
                  Phone / WhatsApp
                </label>
                <input
                  type="tel"
                  placeholder="+91 / +1 ..."
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 bg-neutral-900 border border-neutral-700 rounded-xl text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-white transition"
                />
              </div>

              {/* Company / Brand */}
              <div className="space-y-1.5">
                <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-neutral-300">
                  Company / Organization
                </label>
                <input
                  type="text"
                  placeholder="e.g. Acme Global Media"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className="w-full px-4 py-3 bg-neutral-900 border border-neutral-700 rounded-xl text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-white transition"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Inquiry Type / Category */}
              <div className="space-y-1.5">
                <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-neutral-300">
                  Inquiry Focus
                </label>
                <select
                  value={formData.inquiryType}
                  onChange={(e) => setFormData({ ...formData, inquiryType: e.target.value as any })}
                  className="w-full px-4 py-3 bg-neutral-900 border border-neutral-700 rounded-xl text-sm text-white focus:outline-none focus:border-white transition"
                >
                  <option value="ADVERTISING">Advertising &amp; Sponsorship</option>
                  <option value="SERVICE">Leadjen Media Agency Service</option>
                  <option value="GENERAL">General Newsroom Inquiry</option>
                </select>
              </div>

              {/* Specific Placement / Service */}
              <div className="space-y-1.5 sm:col-span-2">
                <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-neutral-300">
                  {formData.inquiryType === "ADVERTISING" ? "Target Advertising Section" : "Target Service"}
                </label>
                {formData.inquiryType === "ADVERTISING" ? (
                  <select
                    value={formData.advertisingType}
                    onChange={(e) => setFormData({ ...formData, advertisingType: e.target.value })}
                    className="w-full px-4 py-3 bg-neutral-900 border border-neutral-700 rounded-xl text-sm text-white focus:outline-none focus:border-white transition"
                  >
                    {advertisingOptions.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                ) : (
                  <select
                    value={formData.serviceName}
                    onChange={(e) => setFormData({ ...formData, serviceName: e.target.value })}
                    className="w-full px-4 py-3 bg-neutral-900 border border-neutral-700 rounded-xl text-sm text-white focus:outline-none focus:border-white transition"
                  >
                    <option value="">Select a Leadjen Service...</option>
                    {serviceOptions.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Estimated Budget */}
              <div className="space-y-1.5">
                <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-neutral-300">
                  Estimated Campaign Budget
                </label>
                <select
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                  className="w-full px-4 py-3 bg-neutral-900 border border-neutral-700 rounded-xl text-sm text-white focus:outline-none focus:border-white transition"
                >
                  <option value="Under $2,500">Under $2,500 / ₹2,00,000</option>
                  <option value="$2,500 - $10,000">$2,500 – $10,000 / ₹2L – ₹8L</option>
                  <option value="$10,000 - $25,000">$10,000 – $25,000 / ₹8L – ₹20L</option>
                  <option value="$25,000+">$25,000+ / Enterprise Tier</option>
                </select>
              </div>

              {/* Timeline */}
              <div className="space-y-1.5">
                <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-neutral-300">
                  Target Launch Timeline
                </label>
                <select
                  value={formData.timeline}
                  onChange={(e) => setFormData({ ...formData, timeline: e.target.value })}
                  className="w-full px-4 py-3 bg-neutral-900 border border-neutral-700 rounded-xl text-sm text-white focus:outline-none focus:border-white transition"
                >
                  <option value="Immediate (1-7 Days)">Immediate (1–7 Days)</option>
                  <option value="Within 30 Days">Within 30 Days</option>
                  <option value="Next Quarter">Next Quarter</option>
                  <option value="Exploring Options">Exploring Options</option>
                </select>
              </div>
            </div>

            {/* Campaign Brief / Message */}
            <div className="space-y-1.5">
              <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-neutral-300">
                Campaign Brief &amp; Objectives <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                rows={4}
                placeholder="Describe your brand goals, target audience, preferred editorial integrations, or custom requirements..."
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full px-4 py-3 bg-neutral-900 border border-neutral-700 rounded-xl text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-white transition resize-y"
              />
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-[11px] font-mono text-neutral-400 text-center sm:text-left">
                🔒 Strictly confidential. Verified enterprise editorial review within 24h.
              </p>
              <button
                type="submit"
                disabled={status === "submitting"}
                className="w-full sm:w-auto px-8 py-3.5 bg-white hover:bg-neutral-200 text-black rounded-xl text-xs font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition shadow-lg disabled:opacity-50"
              >
                {status === "submitting" ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Transmitting...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Submit Official Request</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
