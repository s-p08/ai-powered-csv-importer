"use client";

import React, { useEffect, useState } from "react";
import Papa from "papaparse";

interface CsvPreviewTableProps {
  file: File;
  onParsed: (headers: string[], rows: any[]) => void;
  onCancel: () => void;
}

export default function CsvPreviewTable({ file, onParsed, onCancel }: CsvPreviewTableProps) {
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!file) return;

    setLoading(true);
    setError(null);

    Papa.parse(file, {
      header: false,
      skipEmptyLines: "greedy",
      complete: (results) => {
        if (results.errors.length > 0 && results.data.length === 0) {
          setError("Failed to parse the CSV file. Please check its formatting.");
          setLoading(false);
          return;
        }

        const data = results.data as string[][];
        if (data.length === 0) {
          setError("The uploaded CSV file is empty.");
          setLoading(false);
          return;
        }

        const csvHeaders = data[0].map(h => h?.trim() || "Unnamed Column");
        const csvRows = data.slice(1);

        setHeaders(csvHeaders);
        setRows(csvRows);
        onParsed(csvHeaders, csvRows);
        setLoading(false);
      },
      error: (err) => {
        setError(err.message || "An error occurred during file parsing.");
        setLoading(false);
      }
    });
  }, [file]);

  if (loading) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-12">
        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">Parsing CSV file...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-xl mx-auto p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-lg flex items-start gap-3">
        <svg className="w-5 h-5 text-red-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-red-800 dark:text-red-300">Parsing Error</h4>
          <p className="text-xs text-red-700 dark:text-red-400 mt-1">{error}</p>
          <button
            onClick={onCancel}
            className="mt-3 px-3 py-1.5 bg-white dark:bg-zinc-800 text-xs font-medium text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 rounded hover:bg-zinc-50 dark:hover:bg-zinc-700 transition"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-4 bg-white dark:bg-zinc-900 p-4 sm:p-6 rounded-2xl shadow-xl border border-zinc-100 dark:border-zinc-800">
      <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
        <div>
          <h3 className="text-lg font-bold text-zinc-800 dark:text-zinc-100 truncate max-w-xs sm:max-w-md">
            {file.name}
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {rows.length} records parsed • Previewing first 100 rows
          </p>
        </div>
        <button
          onClick={onCancel}
          className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 hover:text-red-500 dark:hover:text-red-400 transition"
        >
          Cancel
        </button>
      </div>

      <div className="w-full overflow-x-auto overflow-y-auto max-h-[380px] border border-zinc-200 dark:border-zinc-800 rounded-xl">
        <table className="w-full border-collapse text-left text-xs text-zinc-600 dark:text-zinc-300">
          <thead className="sticky top-0 bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 font-semibold border-b border-zinc-200 dark:border-zinc-700 z-10">
            <tr>
              <th className="px-4 py-3 bg-zinc-50 dark:bg-zinc-800 text-center w-12 sticky left-0 z-20 shadow-[1px_0_0_0_rgba(228,228,231,1)] dark:shadow-[1px_0_0_0_rgba(63,63,70,1)]">
                #
              </th>
              {headers.map((header, idx) => (
                <th key={idx} className="px-4 py-3 min-w-[150px] font-semibold">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {rows.slice(0, 100).map((row, rowIdx) => (
              <tr key={rowIdx} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition">
                <td className="px-4 py-2.5 font-medium text-zinc-400 dark:text-zinc-500 bg-zinc-50/50 dark:bg-zinc-800/20 text-center sticky left-0 z-10 shadow-[1px_0_0_0_rgba(228,228,231,1)] dark:shadow-[1px_0_0_0_rgba(63,63,70,1)]">
                  {rowIdx + 1}
                </td>
                {headers.map((_, colIdx) => (
                  <td key={colIdx} className="px-4 py-2.5 max-w-[250px] truncate whitespace-nowrap">
                    {row[colIdx] !== undefined ? String(row[colIdx]) : ""}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
