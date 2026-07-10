"use client";

import React, { useState, useRef, DragEvent, ChangeEvent } from "react";

// Define the properties required by this component
interface UploadZoneProps {
  // Callback triggered when a valid CSV file is successfully validated
  onFileSelected: (file: File) => void;
}

export default function UploadZone({ onFileSelected }: UploadZoneProps) {
  // State to track if a file is currently being dragged over the zone
  const [isDragActive, setIsDragActive] = useState<boolean>(false);
  
  // State to capture validation errors (e.g. invalid type or file too large)
  const [error, setError] = useState<string | null>(null);
  
  // Reference to the hidden HTML file input element
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Validate the file size and type
  const validateAndProcessFile = (file: File) => {
    setError(null);

    // Rule 1: Check if the file is a CSV by checking its extension or MIME type
    const isCsv = file.name.endsWith(".csv") || file.type === "text/csv" || file.type === "application/vnd.ms-excel";
    if (!isCsv) {
      setError("Only CSV files (.csv) are supported.");
      return;
    }

    // Rule 2: Check if the file size exceeds the 5MB limit
    const fiveMegabytes = 5 * 1024 * 1024;
    if (file.size > fiveMegabytes) {
      setError("File size exceeds the 5MB limit. Please upload a smaller file.");
      return;
    }

    // If both rules pass, propagate the file to the parent component
    onFileSelected(file);
  };

  // Handler for when files are dragged over the drop zone
  const handleDrag = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  // Handler for when files are dropped in the drop zone
  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndProcessFile(e.dataTransfer.files[0]);
    }
  };

  // Handler for when the user selects a file using the standard file browser dialog
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      validateAndProcessFile(e.target.files[0]);
    }
  };

  // Triggers the standard file browser dialog by clicking the hidden file input
  const onButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full max-w-xl mx-auto p-4 sm:p-6 bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-zinc-100 dark:border-zinc-800 transition-all duration-300">
      
      {/* Hidden native file input element */}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept=".csv"
        onChange={handleChange}
      />

      {/* Drag & Drop Box Container */}
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={onButtonClick}
        className={`relative group flex flex-col items-center justify-center min-h-[280px] p-6 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-300 ${
          isDragActive
            ? "border-amber-500 bg-amber-50/20 dark:bg-amber-950/10 scale-[0.99]"
            : "border-zinc-200 dark:border-zinc-700 hover:border-amber-500/50 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/20"
        }`}
      >
        {/* Upload Icon Container */}
        <div className={`p-4 rounded-full transition-transform duration-300 ${
          isDragActive ? "bg-amber-100 dark:bg-amber-900/30 text-amber-600 scale-110" : "bg-zinc-50 dark:bg-zinc-800 text-zinc-400 group-hover:scale-105"
        }`}>
          {/* Cloud Upload SVG Icon */}
          <svg
            className="w-8 h-8"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
            />
          </svg>
        </div>

        {/* Text descriptions */}
        <div className="mt-4 text-center">
          <p className="text-base font-semibold text-zinc-800 dark:text-zinc-200">
            {isDragActive ? "Drop your file here" : "Drop your CSV file here"}
          </p>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            or click to browse files
          </p>
        </div>

        {/* File constraints helper */}
        <div className="mt-6 flex flex-col items-center gap-1.5 text-xs text-zinc-400 dark:text-zinc-500">
          <div className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Supported format: .csv (max 5MB)</span>
          </div>
          <span className="text-[10px]">Ensure your sheet contains emails or phone numbers</span>
        </div>
      </div>

      {/* Validation Error Banner */}
      {error && (
        <div className="mt-4 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-lg flex items-start gap-2.5">
          <svg className="w-5 h-5 text-red-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div className="flex-1">
            <h4 className="text-xs font-semibold text-red-800 dark:text-red-300">File Validation Failed</h4>
            <p className="text-xs text-red-700 dark:text-red-400 mt-0.5">{error}</p>
          </div>
        </div>
      )}
    </div>
  );
}
