"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  BarChart3,
  ArrowLeft,
  Eye,
  MousePointer,
  Percent,
  Megaphone,
  Monitor,
  Tablet,
  Smartphone,
  Calendar,
  Layers,
  TrendingUp,
} from "lucide-react";

export default function AdAnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState("30");

  useEffect(() => {
    async function loadAnalytics() {
      try {
        setLoading(true);
        const res = await fetch(`/api/ads/analytics?days=${days}`);
        if (res.ok) {
          const result = await res.json();
          setData(result);
        }
      } catch (err) {
        console.error("Failed to load ad analytics:", err);
      } finally {
        setLoading(false);
      }
    }
    loadAnalytics();
  }, [days]);

  return (
    <div className="space-y-8 max-w-6xl pb-24">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/advertisements"
            className="p-2 bg-neutral-100 dark:bg-neutral-800 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black rounded-xl transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <span className="px-2 py-0.5 bg-black text-white text-[9px] font-mono font-bold uppercase rounded">
              PERFORMANCE INTELLIGENCE
            </span>
            <h1 className="font-serif font-black text-2xl sm:text-3xl text-black dark:text-white mt-0.5">
              Advertisement Analytics
            </h1>
          </div>
        </div>

        {/* Timeframe Selector */}
        <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-800 p-1 rounded-xl font-mono text-xs">
          {["7", "14", "30", "90"].map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setDays(d)}
              className={`px-3 py-1.5 rounded-lg font-bold transition ${
                days === d ? "bg-black text-white dark:bg-white dark:text-black shadow-xs" : "text-neutral-500 hover:text-black dark:hover:text-white"
              }`}
            >
              Last {d} Days
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-neutral-400 font-mono text-xs">
          Calculating ad performance metrics...
        </div>
      ) : !data ? (
        <div className="p-12 text-center text-red-500 font-mono text-xs">
          Failed to load analytics.
        </div>
      ) : (
        <>
          {/* Top Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-neutral-900 p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xs">
              <div className="flex items-center justify-between text-neutral-400 mb-2">
                <span className="text-[10px] font-mono uppercase tracking-wider font-bold">
                  Total Impressions
                </span>
                <Eye className="w-4 h-4 text-black dark:text-white" />
              </div>
              <div className="text-2xl sm:text-3xl font-serif font-black text-black dark:text-white">
                {data.totalImpressions.toLocaleString()}
              </div>
              <span className="text-[10px] text-neutral-500 font-mono mt-1 block">Verified banner loads</span>
            </div>

            <div className="bg-white dark:bg-neutral-900 p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xs">
              <div className="flex items-center justify-between text-neutral-400 mb-2">
                <span className="text-[10px] font-mono uppercase tracking-wider font-bold">
                  Total Clicks
                </span>
                <MousePointer className="w-4 h-4 text-black dark:text-white" />
              </div>
              <div className="text-2xl sm:text-3xl font-serif font-black text-black dark:text-white">
                {data.totalClicks.toLocaleString()}
              </div>
              <span className="text-[10px] text-neutral-500 font-mono mt-1 block">Reader engagements</span>
            </div>

            <div className="bg-white dark:bg-neutral-900 p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xs">
              <div className="flex items-center justify-between text-neutral-400 mb-2">
                <span className="text-[10px] font-mono uppercase tracking-wider font-bold">
                  Overall CTR
                </span>
                <Percent className="w-4 h-4 text-red-600" />
              </div>
              <div className="text-2xl sm:text-3xl font-serif font-black text-red-600">
                {data.overallCtr}%
              </div>
              <span className="text-[10px] text-neutral-500 font-mono mt-1 block">Conversion rate</span>
            </div>

            <div className="bg-white dark:bg-neutral-900 p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xs">
              <div className="flex items-center justify-between text-neutral-400 mb-2">
                <span className="text-[10px] font-mono uppercase tracking-wider font-bold">
                  Active Campaigns
                </span>
                <Megaphone className="w-4 h-4 text-black dark:text-white" />
              </div>
              <div className="text-2xl sm:text-3xl font-serif font-black text-black dark:text-white">
                {data.activeAdsCount}
              </div>
              <span className="text-[10px] text-neutral-500 font-mono mt-1 block">Live in rotation</span>
            </div>
          </div>

          {/* Performance Breakdown Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* By Position */}
            <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 shadow-sm">
              <h3 className="font-serif font-bold text-base text-black dark:text-white border-b border-neutral-100 dark:border-neutral-800 pb-3 flex items-center justify-between">
                <span>Performance by Placement Position</span>
                <Layers className="w-4 h-4 text-neutral-400" />
              </h3>

              <div className="divide-y divide-neutral-100 dark:divide-neutral-800/80 mt-4">
                {data.byPosition.map((item: any) => (
                  <div key={item.position} className="py-3 flex items-center justify-between text-xs font-mono">
                    <div>
                      <span className="font-bold text-black dark:text-white block">
                        {item.position.replace("_", " ")}
                      </span>
                      <span className="text-[10px] text-neutral-400">
                        {item.impressions.toLocaleString()} views • {item.clicks} clicks
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-red-600 block">{item.ctr}%</span>
                      <span className="text-[9px] text-neutral-400">CTR</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* By Device */}
            <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 shadow-sm">
              <h3 className="font-serif font-bold text-base text-black dark:text-white border-b border-neutral-100 dark:border-neutral-800 pb-3 flex items-center justify-between">
                <span>Performance by Device</span>
                <Monitor className="w-4 h-4 text-neutral-400" />
              </h3>

              <div className="divide-y divide-neutral-100 dark:divide-neutral-800/80 mt-4">
                {data.byDevice.map((dev: any) => (
                  <div key={dev.device} className="py-3 flex items-center justify-between text-xs font-mono">
                    <div className="flex items-center gap-2.5">
                      {dev.device === "DESKTOP" ? (
                        <Monitor className="w-4 h-4 text-black dark:text-white" />
                      ) : dev.device === "TABLET" ? (
                        <Tablet className="w-4 h-4 text-black dark:text-white" />
                      ) : (
                        <Smartphone className="w-4 h-4 text-black dark:text-white" />
                      )}
                      <div>
                        <span className="font-bold text-black dark:text-white block">
                          {dev.device}
                        </span>
                        <span className="text-[10px] text-neutral-400">
                          {dev.impressions.toLocaleString()} views • {dev.clicks} clicks
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-red-600 block">{dev.ctr}%</span>
                      <span className="text-[9px] text-neutral-400">CTR</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Campaign Performance Table */}
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-sm">
            <div className="p-5 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
              <div>
                <h3 className="font-serif font-bold text-base text-black dark:text-white">
                  Campaign Breakdown
                </h3>
                <p className="text-xs font-mono text-neutral-400">
                  Individual ad performance and click-through rates
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-sans">
                <thead>
                  <tr className="bg-neutral-100 dark:bg-neutral-950 border-b border-neutral-200 dark:border-neutral-800 text-[10px] font-mono uppercase text-neutral-500 tracking-wider">
                    <th className="py-3 px-4 font-semibold">Campaign Name</th>
                    <th className="py-3 px-4 font-semibold">Advertiser</th>
                    <th className="py-3 px-4 font-semibold">Position</th>
                    <th className="py-3 px-4 font-semibold">Impressions</th>
                    <th className="py-3 px-4 font-semibold">Clicks</th>
                    <th className="py-3 px-4 font-semibold text-right">CTR</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                  {data.byCampaign.map((camp: any) => (
                    <tr key={camp.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-950">
                      <td className="py-3.5 px-4 font-bold text-black dark:text-white font-serif">
                        {camp.name}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-neutral-600 dark:text-neutral-400">
                        {camp.advertiser}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="px-2 py-0.5 bg-neutral-100 dark:bg-neutral-800 rounded text-[10px] font-mono uppercase">
                          {camp.location}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-neutral-700 dark:text-neutral-300">
                        {camp.impressions.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-neutral-700 dark:text-neutral-300">
                        {camp.clicks.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-right font-bold text-red-600">
                        {camp.ctr}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
