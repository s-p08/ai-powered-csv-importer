"use client";

import React, { useState } from "react";

interface CrmLead {
  created_at: string;
  name: string;
  email: string;
  country_code: string;
  mobile_without_country_code: string;
  company: string;
  city: string;
  state: string;
  country: string;
  lead_owner: string;
  crm_status: "GOOD_LEAD_FOLLOW_UP" | "DID_NOT_CONNECT" | "BAD_LEAD" | "SALE_DONE";
  crm_note: string;
  data_source: string;
  possession_time: string;
  description: string;
}

interface SkippedRecord {
  row: any;
  reason: string;
}

interface ImportResultViewProps {
  summary: {
    imported: number;
    skipped: number;
    total: number;
  };
  records: CrmLead[];
  skipped: SkippedRecord[];
  onReset: () => void;
}

export default function ImportResultView({ summary, records, skipped, onReset }: ImportResultViewProps) {
  const [activeTab, setActiveTab] = useState<"success" | "skipped">("success");

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "GOOD_LEAD_FOLLOW_UP":
        return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/50";
      case "DID_NOT_CONNECT":
        return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/50";
      case "BAD_LEAD":
        return "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/50";
      case "SALE_DONE":
        return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/50";
      default:
        return "bg-zinc-50 text-zinc-700 border-zinc-200 dark:bg-zinc-800/50 dark:text-zinc-400 dark:border-zinc-700";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "GOOD_LEAD_FOLLOW_UP":
        return "Follow Up";
      case "DID_NOT_CONNECT":
        return "No Connect";
      case "BAD_LEAD":
        return "Bad Lead";
      case "SALE_DONE":
        return "Sale Done";
      default:
        return status;
    }
  };

  return (
    <div className="w-full flex flex-col gap-6">
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-100 dark:border-zinc-850 shadow-md">
          <p className="text-xs font-semibold text-zinc-450 dark:text-zinc-550 uppercase tracking-wider">Total Rows</p>
          <p className="text-2xl font-black text-zinc-800 dark:text-zinc-100 mt-1">{summary.total}</p>
        </div>
        <div className="bg-emerald-50/30 dark:bg-emerald-950/10 p-4 rounded-xl border border-emerald-100/50 dark:border-emerald-900/20 shadow-md">
          <p className="text-xs font-semibold text-emerald-600/80 dark:text-emerald-400/80 uppercase tracking-wider">Imported</p>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{summary.imported}</p>
        </div>
        <div className="bg-red-50/30 dark:bg-red-950/10 p-4 rounded-xl border border-red-100/50 dark:border-red-900/20 shadow-md">
          <p className="text-xs font-semibold text-red-600/80 dark:text-red-400/80 uppercase tracking-wider">Skipped</p>
          <p className="text-2xl font-black text-red-600 dark:text-red-400 mt-1">{summary.skipped}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-zinc-100 dark:border-zinc-800 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-4 gap-4">
          <div className="flex border border-zinc-200 dark:border-zinc-700 rounded-xl p-1 bg-zinc-50 dark:bg-zinc-800/50 self-start">
            <button
              onClick={() => setActiveTab("success")}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition ${
                activeTab === "success"
                  ? "bg-white dark:bg-zinc-900 text-amber-500 shadow-sm"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200"
              }`}
            >
              CRM Data ({records.length})
            </button>
            <button
              onClick={() => setActiveTab("skipped")}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition ${
                activeTab === "skipped"
                  ? "bg-white dark:bg-zinc-900 text-amber-500 shadow-sm"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200"
              }`}
            >
              Skipped Records ({skipped.length})
            </button>
          </div>

          <button
            onClick={onReset}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 active:scale-[0.98] text-xs font-bold text-white rounded-xl shadow-md transition"
          >
            Import Another File
          </button>
        </div>

        <div className="mt-4">
          {activeTab === "success" ? (
            records.length === 0 ? (
              <div className="text-center py-12 text-zinc-550">
                No records successfully imported.
              </div>
            ) : (
              <div className="w-full overflow-x-auto border border-zinc-200 dark:border-zinc-800 rounded-xl max-h-[400px] overflow-y-auto">
                <table className="w-full border-collapse text-left text-xs">
                  <thead className="sticky top-0 bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 font-semibold border-b border-zinc-200 dark:border-zinc-700 z-10">
                    <tr>
                      <th className="px-4 py-3">Created At</th>
                      <th className="px-4 py-3">Name</th>
                      <th className="px-4 py-3">Email</th>
                      <th className="px-4 py-3">Phone</th>
                      <th className="px-4 py-3">Company</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Source</th>
                      <th className="px-4 py-3">Note</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 text-zinc-600 dark:text-zinc-300">
                    {records.map((lead, idx) => (
                      <tr key={idx} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition">
                        <td className="px-4 py-3 whitespace-nowrap">{lead.created_at || "-"}</td>
                        <td className="px-4 py-3 font-semibold text-zinc-850 dark:text-zinc-100">{lead.name || "-"}</td>
                        <td className="px-4 py-3">{lead.email || "-"}</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {lead.country_code ? `${lead.country_code} ` : ""}
                          {lead.mobile_without_country_code || "-"}
                        </td>
                        <td className="px-4 py-3">{lead.company || "-"}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-[10px] font-bold border ${getStatusBadgeClass(lead.crm_status)}`}>
                            {getStatusLabel(lead.crm_status)}
                          </span>
                        </td>
                        <td className="px-4 py-3">{lead.data_source || "-"}</td>
                        <td className="px-4 py-3 max-w-[200px] truncate" title={lead.crm_note}>
                          {lead.crm_note || "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          ) : (
            skipped.length === 0 ? (
              <div className="text-center py-12 text-zinc-550">
                No records were skipped.
              </div>
            ) : (
              <div className="w-full overflow-x-auto border border-zinc-200 dark:border-zinc-800 rounded-xl max-h-[400px] overflow-y-auto">
                <table className="w-full border-collapse text-left text-xs">
                  <thead className="sticky top-0 bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 font-semibold border-b border-zinc-200 dark:border-zinc-700 z-10">
                    <tr>
                      <th className="px-4 py-3 w-1/3">Skip Reason</th>
                      <th className="px-4 py-3">Raw Data Content</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 text-zinc-650 dark:text-zinc-350">
                    {skipped.map((item, idx) => (
                      <tr key={idx} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition">
                        <td className="px-4 py-3 font-semibold text-red-600 dark:text-red-400">
                          {item.reason}
                        </td>
                        <td className="px-4 py-3 font-mono text-[10px] max-w-[400px] truncate" title={JSON.stringify(item.row)}>
                          {JSON.stringify(item.row)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
