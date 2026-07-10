"use client";

import React, { useState } from "react";
import UploadZone from "@/components/UploadZone";
import CsvPreviewTable from "@/components/CsvPreviewTable";
import ImportResultView from "@/components/ImportResultView";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<any[]>([]);
  const [isImporting, setIsImporting] = useState<boolean>(false);
  const [importResult, setImportResult] = useState<any | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFileSelected = (selectedFile: File) => {
    setFile(selectedFile);
    setErrorMessage(null);
  };

  const handleParsed = (csvHeaders: string[], csvRows: any[]) => {
    setHeaders(csvHeaders);
    setRows(csvRows);
  };

  const handleCancel = () => {
    setFile(null);
    setHeaders([]);
    setRows([]);
    setImportResult(null);
    setErrorMessage(null);
  };

  const handleConfirmImport = async () => {
    setIsImporting(true);
    setErrorMessage(null);

    const formattedRecords = rows.map((row) => {
      const record: any = {};
      headers.forEach((header, idx) => {
        record[header] = row[idx];
      });
      return record;
    });

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

    try {
      const response = await fetch(`${backendUrl}/api/import`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ records: formattedRecords })
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setImportResult({
          summary: data.summary,
          records: data.records,
          skipped: data.skipped
        });
      } else {
        setErrorMessage(data.message || "Failed to complete CRM data import.");
      }
    } catch (err: any) {
      setErrorMessage("Network error: Could not reach the import server.");
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col font-sans transition-colors duration-300">
      <header className="w-full border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl font-black text-amber-500 tracking-tight">GrowEasy</span>
            <span className="text-xs bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 px-2 py-0.5 rounded font-mono">CRM Importer</span>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-12 flex flex-col justify-center">
        {isImporting && (
          <div className="w-full flex flex-col items-center justify-center py-20 bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-zinc-100 dark:border-zinc-800 p-6">
            <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
            <h3 className="mt-6 text-lg font-bold text-zinc-800 dark:text-zinc-150">AI Extraction in Progress</h3>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400 text-center max-w-xs">
              Gemini is intelligently mapping headers, formatting phone numbers, standardizing dates, and filtering leads.
            </p>
          </div>
        )}

        {!isImporting && importResult && (
          <ImportResultView
            summary={importResult.summary}
            records={importResult.records}
            skipped={importResult.skipped}
            onReset={handleCancel}
          />
        )}

        {!isImporting && !importResult && (
          <>
            {errorMessage && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-xl flex items-start gap-3 max-w-xl mx-auto w-full">
                <svg className="w-5 h-5 text-red-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-red-800 dark:text-red-300">Import Failure</h4>
                  <p className="text-xs text-red-700 dark:text-red-400 mt-1">{errorMessage}</p>
                </div>
              </div>
            )}

            {!file ? (
              <div className="flex flex-col gap-6 text-center">
                <div>
                  <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight sm:text-4xl">
                    Import Leads via CSV
                  </h1>
                  <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400 max-w-md mx-auto">
                    Upload any CSV format and let our AI automatically clean, split, and map columns to your GrowEasy CRM schema.
                  </p>
                </div>
                <UploadZone onFileSelected={handleFileSelected} />
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                <CsvPreviewTable
                  file={file}
                  onParsed={handleParsed}
                  onCancel={handleCancel}
                />

                {rows.length > 0 && (
                  <div className="flex justify-end gap-3">
                    <button
                      onClick={handleCancel}
                      className="px-5 py-2.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-sm font-semibold text-zinc-700 dark:text-zinc-300 rounded-xl transition"
                    >
                      Clear File
                    </button>
                    <button
                      onClick={handleConfirmImport}
                      className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 active:scale-[0.98] text-sm font-semibold text-white rounded-xl shadow-lg shadow-amber-500/25 transition"
                    >
                      Confirm Import
                    </button>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
